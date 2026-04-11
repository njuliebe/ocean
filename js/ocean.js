/**
 * ocean.js — Three.js 海洋背景环境
 * 负责：水体着色器、体积光束、焦散光斑、气泡、浮游粒子、海底沙地
 * 渲染到 #ocean-canvas，固定相机视角
 */

import * as THREE from 'three';

let _renderer, _scene, _camera;
let _bubbles, _plankton;
let _volumeBeams = [];
let _causticMat;
let _animFrameId;

// ─────────────────────────────────────────────
// 公共 API
// ─────────────────────────────────────────────

export function initOcean() {
  const canvas = document.getElementById('ocean-canvas');

  // Renderer
  _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  _renderer.setSize(window.innerWidth, window.innerHeight);
  _renderer.toneMapping = THREE.ACESFilmicToneMapping;
  _renderer.toneMappingExposure = 1.6;  // 整体提亮，明快浅海感
  _renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Scene — 浅蓝明亮海洋
  _scene = new THREE.Scene();
  _scene.background = new THREE.Color(0x35a8d4);
  _scene.fog = new THREE.FogExp2(0x4bbde8, 0.014);

  // Camera — 固定，略微俯视
  _camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120);
  _camera.position.set(0, 5, 14);
  _camera.lookAt(0, 0, 0);

  _setupLights();
  _setupSeabed();
  _setupCaustics();
  _setupVolumeBeams();
  _setupBubbles();
  _setupPlankton();

  window.addEventListener('resize', _onResize);
  // 鼠标视差（轻微）
  window.addEventListener('mousemove', _onMouseMove);

  _animate();
}

// ─────────────────────────────────────────────
// 内部：灯光
// ─────────────────────────────────────────────

function _setupLights() {
  // 明亮浅蓝环境光，模拟浅海漫射光
  _scene.add(new THREE.AmbientLight(0x88d4f0, 3.0));

  // 阳光主光源 —— 暖白色，从斜上方打入
  const sun = new THREE.DirectionalLight(0xfff5d0, 2.8);
  sun.position.set(6, 18, 8);
  _scene.add(sun);

  // 半球光：天空浅青 / 沙地暖米
  const hemi = new THREE.HemisphereLight(0x7ecfee, 0xe8d9a0, 1.2);
  _scene.add(hemi);

  // 补光（从前方填充阴影）
  const fill = new THREE.DirectionalLight(0xb0e8ff, 0.8);
  fill.position.set(-4, 6, 12);
  _scene.add(fill);
}

// ─────────────────────────────────────────────
// 内部：海底沙地
// ─────────────────────────────────────────────

function _setupSeabed() {
  const geo = new THREE.PlaneGeometry(60, 60, 80, 80);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const d =
      Math.sin(x * 0.4) * Math.cos(y * 0.3) * 0.35 +
      Math.sin(x * 1.1 + y * 0.7) * 0.12;
    pos.setZ(i, d);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xd4b483,   // 自然沙黄，不偏白
    roughness: 0.9,
    metalness: 0.0,
  });
  const seabed = new THREE.Mesh(geo, mat);
  seabed.rotation.x = -Math.PI / 2;
  seabed.position.y = -14.5;  // 大幅下移，沙地只露一条底边
  _scene.add(seabed);
}

// ─────────────────────────────────────────────
// 内部：焦散光斑（shader）
// ─────────────────────────────────────────────

function _setupCaustics() {
  _causticMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec2 vUv;

      float causticPattern(vec2 p, float t) {
        float v = 0.0;
        v += sin(p.x * 3.2 + t * 0.9);
        v += sin(p.y * 2.7 - t * 0.7);
        v += sin((p.x + p.y) * 2.1 + t * 0.5);
        v += sin(length(p - vec2(0.5)) * 6.0 - t * 1.1);
        return 0.5 + 0.5 * sin(v * 1.3);
      }

      void main() {
        vec2 p = vUv * 6.0;
        float c1 = causticPattern(p, uTime * 0.4);
        float c2 = causticPattern(p * 1.3 + vec2(1.7, 2.3), uTime * 0.35);
        float caustic = pow(c1 * c2, 2.5);
        gl_FragColor = vec4(vec3(0.4, 0.85, 1.0) * caustic, caustic * 0.4);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), _causticMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -14.45;
  _scene.add(mesh);
}

// ─────────────────────────────────────────────
// 内部：体积光束（从水面射入）
// ─────────────────────────────────────────────

function _setupVolumeBeams() {
  // 光束用梯形平面（上窄下宽）+ 渐变 shader，模拟真实阳光从水面斜射
  // 每束光是一个 PlaneGeometry，rotateX 让它朝相机倾斜
  const configs = [
    { x: -5,   z: -4, rotY:  0.3, width: 0.9, phase: 0.0  },
    { x: -1.5, z: -6, rotY:  0.1, width: 0.7, phase: 1.5  },
    { x:  2,   z: -4, rotY: -0.2, width: 1.0, phase: 2.8  },
    { x:  5.5, z: -2, rotY: -0.4, width: 0.6, phase: 0.9  },
  ];

  for (const cfg of configs) {
    // 自定义梯形：上端窄，下端宽，高度 18
    const H = 18, wTop = cfg.width * 0.15, wBot = cfg.width;
    const verts = new Float32Array([
      -wTop / 2,  H / 2, 0,
       wTop / 2,  H / 2, 0,
      -wBot / 2, -H / 2, 0,
       wBot / 2, -H / 2, 0,
    ]);
    const uvs = new Float32Array([0,1, 1,1, 0,0, 1,0]);
    const idx  = new Uint16Array([0,2,1, 1,2,3]);
    const geo  = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.setAttribute('uv',       new THREE.BufferAttribute(uvs,   2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uPhase: { value: cfg.phase } },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform float uPhase;
        varying vec2 vUv;
        void main() {
          // 从上（亮）到下（透明）衰减
          float fade = vUv.y * vUv.y;
          // 左右边缘柔化
          float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
          // 轻微呼吸闪烁
          float breath = 0.82 + 0.18 * sin(uTime * 0.7 + uPhase);
          float alpha = fade * edge * breath * 0.22;
          gl_FragColor = vec4(1.0, 0.97, 0.88, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(geo, mat);
    // 从水面顶部往下，稍微前倾朝相机
    mesh.position.set(cfg.x, 7.5, cfg.z);
    mesh.rotation.y = cfg.rotY;
    mesh.rotation.x = 0.18; // 朝前倾斜，模拟斜射阳光
    mesh.userData.phase = cfg.phase;
    mesh.userData.baseRotY = cfg.rotY;
    _scene.add(mesh);
    _volumeBeams.push(mesh);
  }
}

// ─────────────────────────────────────────────
// 内部：气泡粒子（50-80 个）
// ─────────────────────────────────────────────

function _makeBubbleTexture() {
  // 用 Canvas 画一个圆形气泡：中心透明，边缘白色高光环
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;

  // 透明背景
  ctx.clearRect(0, 0, size, size);

  // 外圈白色气泡环
  const ring = ctx.createRadialGradient(r, r, r * 0.62, r, r, r * 0.96);
  ring.addColorStop(0,   'rgba(255,255,255,0)');
  ring.addColorStop(0.6, 'rgba(255,255,255,0.18)');
  ring.addColorStop(1,   'rgba(255,255,255,0.55)');
  ctx.beginPath();
  ctx.arc(r, r, r * 0.95, 0, Math.PI * 2);
  ctx.fillStyle = ring;
  ctx.fill();

  // 顶部高光小点
  ctx.beginPath();
  ctx.arc(r * 0.68, r * 0.38, r * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();

  return new THREE.CanvasTexture(c);
}

function _setupBubbles() {
  const count = 55;
  const geo = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  const phase = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = Math.random() * 12 - 2;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
    speed[i] = 0.25 + Math.random() * 0.55;
    phase[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    map: _makeBubbleTexture(),
    size: 0.28,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    alphaTest: 0.01,
    depthWrite: false,
  });

  _bubbles = { points: new THREE.Points(geo, mat), pos, speed, phase, count };
  _scene.add(_bubbles.points);
}

// ─────────────────────────────────────────────
// 内部：浮游微粒（30-50 个）
// ─────────────────────────────────────────────

function _setupPlankton() {
  const count = 40;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const phase = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = Math.random() * 10 - 1;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
    phase[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xddf5ff,   // 淡蓝白，像水中微小尘埃
    size: 0.07,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  _plankton = { points: new THREE.Points(geo, mat), pos, phase, count };
  _scene.add(_plankton.points);
}

// ─────────────────────────────────────────────
// 内部：动画循环
// ─────────────────────────────────────────────

let _mouseX = 0, _mouseY = 0;

function _onMouseMove(e) {
  _mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  _mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}

function _animate() {
  _animFrameId = requestAnimationFrame(_animate);
  const t = performance.now() / 1000;

  // 焦散
  if (_causticMat) _causticMat.uniforms.uTime.value = t;

  // 体积光束：轻微左右摆动 + 更新 shader 时间
  for (const beam of _volumeBeams) {
    const ph = beam.userData.phase;
    // 绕 Y 轴轻微摆动（模拟水流扭动光束）
    beam.rotation.y = beam.userData.baseRotY + Math.sin(t * 0.35 + ph) * 0.06;
    beam.material.uniforms.uTime.value = t;
  }

  // 气泡上浮
  {
    const p = _bubbles.pos;
    for (let i = 0; i < _bubbles.count; i++) {
      p[i * 3 + 1] += _bubbles.speed[i] * 0.012;
      p[i * 3]     += Math.sin(t * 1.8 + _bubbles.phase[i]) * 0.003;
      if (p[i * 3 + 1] > 10) {
        p[i * 3 + 1] = -2;
        p[i * 3]     = (Math.random() - 0.5) * 24;
        p[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
    _bubbles.points.geometry.attributes.position.needsUpdate = true;
  }

  // 浮游微粒漂移
  {
    const p = _plankton.pos;
    for (let i = 0; i < _plankton.count; i++) {
      p[i * 3]     += Math.sin(t * 0.3 + _plankton.phase[i]) * 0.002;
      p[i * 3 + 1] += Math.cos(t * 0.25 + _plankton.phase[i] * 1.3) * 0.001;
      p[i * 3 + 2] += Math.sin(t * 0.2 + _plankton.phase[i] * 0.7) * 0.002;
      // 软边界包裹
      if (p[i * 3] > 12)  p[i * 3] = -12;
      if (p[i * 3] < -12) p[i * 3] = 12;
      if (p[i * 3 + 1] > 9)  p[i * 3 + 1] = -1;
      if (p[i * 3 + 1] < -1) p[i * 3 + 1] = 9;
    }
    _plankton.points.geometry.attributes.position.needsUpdate = true;
  }

  // 鼠标视差（极轻微摄像机偏移）
  _camera.position.x += (_mouseX * 0.6 - _camera.position.x) * 0.03;
  _camera.position.y += (-_mouseY * 0.3 + 5 - _camera.position.y) * 0.03;
  _camera.lookAt(0, 0, 0);

  _renderer.render(_scene, _camera);
}

// ─────────────────────────────────────────────
// 内部：resize
// ─────────────────────────────────────────────

function _onResize() {
  _camera.aspect = window.innerWidth / window.innerHeight;
  _camera.updateProjectionMatrix();
  _renderer.setSize(window.innerWidth, window.innerHeight);
}
