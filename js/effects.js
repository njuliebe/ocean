/**
 * effects.js — Canvas 2D 修复粒子特效
 * 三种特效：营养液（蓝绿水滴）、清理（白泡泡）、调温（冰晶）
 * 庆祝彩色烟花（所有珊瑚修复后）
 */

let _canvas, _ctx;
const _effects = [];

export function initEffects() {
  _canvas = document.getElementById('fx-canvas');
  _ctx = _canvas.getContext('2d');
  _resize();
  window.addEventListener('resize', _resize);
  _loop();
}

function _resize() {
  _canvas.width  = window.innerWidth;
  _canvas.height = window.innerHeight;
}

// ─────────────────────────────────────────────
// 公共：在珊瑚 HTML 元素上触发修复特效
// el: coral DOM element
// type: 'nutrition' | 'clean' | 'temperature'
// ─────────────────────────────────────────────
export function playRepairEffect(el, type) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;

  switch (type) {
    case 'nutrition':   _spawnNutrition(cx, cy, rect);   break;
    case 'clean':       _spawnClean(cx, cy, rect);        break;
    case 'temperature': _spawnTemperature(cx, cy, rect);  break;
  }
}

// ─────────────────────────────────────────────
// 公共：庆祝烟花
// ─────────────────────────────────────────────
export function playCelebration() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;

  const colors = ['#ff4444','#ff8c00','#ffd700','#44ff88','#00bfff','#cc44ff','#ff69b4'];
  const count = 220;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      r: 3 + Math.random() * 4,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.014,
      gravity: 0.12,
    });
  }

  _effects.push({ type: 'celebration', particles, done: false });
}

// ─────────────────────────────────────────────
// 内部：营养液（蓝绿水滴从上方飘洒）
// ─────────────────────────────────────────────
function _spawnNutrition(cx, cy, rect) {
  const count = 28;
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: cx + (Math.random() - 0.5) * rect.width * 1.2,
      y: cy - rect.height * 0.4 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 1.2 + Math.random() * 2,
      r: 3 + Math.random() * 5,
      life: 1.0,
      decay: 0.012 + Math.random() * 0.012,
      color: `hsl(${170 + Math.random() * 40}, 90%, 60%)`,
    });
  }
  _effects.push({ type: 'nutrition', particles, done: false });
}

// ─────────────────────────────────────────────
// 内部：清理（白色泡泡升起 + 垃圾 emoji 飘走）
// ─────────────────────────────────────────────
function _spawnClean(cx, cy, rect) {
  const count = 22;
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: cx + (Math.random() - 0.5) * rect.width,
      y: cy + rect.height * 0.2 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(1.0 + Math.random() * 2.5),
      r: 4 + Math.random() * 6,
      life: 1.0,
      decay: 0.01 + Math.random() * 0.01,
      color: `rgba(200,240,255,`,
      isClean: true,
    });
  }
  // 2 个垃圾 emoji 飘走
  const trashEmoji = ['🗑️', '🛍️'];
  for (let i = 0; i < 2; i++) {
    particles.push({
      emoji: trashEmoji[i],
      x: cx + (Math.random() - 0.5) * rect.width * 0.6,
      y: cy,
      vx: (Math.random() - 0.5) * 3,
      vy: -(2 + Math.random() * 2),
      life: 1.0,
      decay: 0.014,
      isEmoji: true,
    });
  }
  _effects.push({ type: 'clean', particles, done: false });
}

// ─────────────────────────────────────────────
// 内部：调温（冰晶环绕旋转）
// ─────────────────────────────────────────────
function _spawnTemperature(cx, cy, rect) {
  const count = 24;
  const particles = [];
  const baseR = Math.max(rect.width, rect.height) * 0.45;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = baseR + (Math.random() - 0.5) * 20;
    particles.push({
      angle,
      r,
      cx, cy,
      angularSpeed: 1.4 + Math.random() * 0.8,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      size: 6 + Math.random() * 8,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.006,
      color: `hsl(${200 + Math.random() * 40}, 90%, 80%)`,
      isCrystal: true,
    });
  }
  _effects.push({ type: 'temperature', particles, done: false });
}

// ─────────────────────────────────────────────
// 绘制循环
// ─────────────────────────────────────────────
function _loop() {
  requestAnimationFrame(_loop);

  _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

  for (let i = _effects.length - 1; i >= 0; i--) {
    const eff = _effects[i];
    _updateEffect(eff);
    if (eff.done) _effects.splice(i, 1);
  }
}

function _updateEffect(eff) {
  const dt = 0.016;
  let allDead = true;

  for (const p of eff.particles) {
    if (p.life <= 0) continue;
    allDead = false;
    p.life -= p.decay;

    if (p.isCrystal) {
      // 旋转
      p.angle += p.angularSpeed * dt;
      p.x = p.cx + Math.cos(p.angle) * p.r;
      p.y = p.cy + Math.sin(p.angle) * p.r;
      // 内缩
      p.r *= 0.994;
      _drawCrystal(p);
    } else if (p.isEmoji) {
      p.x += p.vx;
      p.y += p.vy;
      _ctx.globalAlpha = Math.max(0, p.life);
      _ctx.font = '22px serif';
      _ctx.fillText(p.emoji, p.x, p.y);
      _ctx.globalAlpha = 1;
    } else if (p.isClean) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy *= 0.98;
      _ctx.globalAlpha = Math.max(0, p.life) * 0.7;
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      _ctx.strokeStyle = `rgba(200,240,255,${p.life})`;
      _ctx.lineWidth = 1.5;
      _ctx.stroke();
      _ctx.globalAlpha = 1;
    } else {
      // 普通圆形粒子（nutrition / celebration）
      p.x  += p.vx;
      p.y  += p.vy;
      if (eff.type === 'celebration') p.vy += p.gravity;
      _ctx.globalAlpha = Math.max(0, p.life);
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      _ctx.fillStyle = p.color;
      _ctx.fill();
      _ctx.globalAlpha = 1;
    }
  }

  if (allDead) eff.done = true;
}

// 冰晶：六角雪花形
function _drawCrystal(p) {
  const { x, y, size, life } = p;
  _ctx.save();
  _ctx.globalAlpha = Math.max(0, life) * 0.85;
  _ctx.translate(x, y);
  _ctx.rotate(p.angle * 2);
  _ctx.strokeStyle = p.color;
  _ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    _ctx.beginPath();
    _ctx.moveTo(0, 0);
    _ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
    _ctx.stroke();
    // 小横杆
    const mx = Math.cos(a) * size * 0.6;
    const my = Math.sin(a) * size * 0.6;
    const perp = a + Math.PI / 2;
    _ctx.beginPath();
    _ctx.moveTo(mx + Math.cos(perp) * size * 0.25, my + Math.sin(perp) * size * 0.25);
    _ctx.lineTo(mx - Math.cos(perp) * size * 0.25, my - Math.sin(perp) * size * 0.25);
    _ctx.stroke();
  }
  _ctx.restore();
}
