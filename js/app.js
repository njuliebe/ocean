/**
 * app.js — 合并后的单文件（无 ES module，支持 file:// 直接打开）
 */

// ═════════════════════════════════════════════
// audio.js
// ═════════════════════════════════════════════

const MESSAGES = {
  detect: {
    'coral-4':  '这颗珊瑚完全白化了！快用营养液救救它吧！',
    'coral-6':  '这颗珊瑚被垃圾覆盖啦！用清理工具把垃圾清除掉吧！',
    'coral-8':  '这颗珊瑚周围水温太高了！快用调温工具降温吧！',
    'coral-11': '这颗珊瑚被垃圾覆盖了！用清理工具帮它清洁吧！',
  },
  repair: {
    'coral-4':  '这颗珊瑚恢复了健康的颜色，太漂亮啦！',
    'coral-6':  '这颗珊瑚的垃圾清除干净了，太好了！',
    'coral-8':  '这颗珊瑚降温成功，恢复了美丽的颜色！',
    'coral-11': '这颗珊瑚的垃圾清除干净了，太棒了！',
  },
  wrongTool:      '这个工具不对哦，换一个试试吧！',
  alreadyRepaired:'这颗珊瑚已经恢复健康了，去看看其他珊瑚吧！',
  allDone:        '恭喜你！所有珊瑚都恢复健康啦！你是最棒的珊瑚守护者！',
  welcome:        '欢迎来到珊瑚守护者！选一个工具，然后点击珊瑚探索吧！',
};

const AUDIO_FILES = {
  // 通用语音（已有）
  welcome:           'audio/welcome.mp3',
  wrongTool:         'audio/wrongTool.mp3',
  alreadyRepaired:   'audio/alreadyRepaired.mp3',
  allDone:           'audio/allDone.mp3',
  // 探测语音（需要提供）
  'detect_coral-4':  'audio/detect_coral-4.mp3',
  'detect_coral-6':  'audio/detect_coral-6.mp3',
  'detect_coral-8':  'audio/detect_coral-8.mp3',
  'detect_coral-11': 'audio/detect_coral-11.mp3',
  // 修复语音（需要提供）
  'repair_coral-4':  'audio/repair_coral-4.mp3',
  'repair_coral-6':  'audio/repair_coral-6.mp3',
  'repair_coral-8':  'audio/repair_coral-8.mp3',
  'repair_coral-11': 'audio/repair_coral-11.mp3',
};

let _currentAudio = null;

function speak(key) {
  var src = AUDIO_FILES[key];
  if (!src) return;
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio.currentTime = 0;
  }
  _currentAudio = new Audio(src);
  _currentAudio.play().catch(function(){});
}

// 用 Web Audio API 生成音效
var _audioCtx = null;
function _getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

// 清理音效：气泡上升 + 水花
function playSfxClean() {
  var ctx = _getAudioCtx();
  var now = ctx.currentTime;

  // 一连串气泡音（频率上升的短促音）
  for (var i = 0; i < 6; i++) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300 + i * 80, now + i * 0.08);
    osc.frequency.exponentialRampToValueAtTime(600 + i * 120, now + i * 0.08 + 0.06);
    gain.gain.setValueAtTime(0.15, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.12);
  }

  // 水花白噪声
  var bufferSize = ctx.sampleRate * 0.3;
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var j = 0; j < bufferSize; j++) {
    data[j] = (Math.random() * 2 - 1) * 0.3;
  }
  var noise = ctx.createBufferSource();
  noise.buffer = buffer;
  var noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.08, now + 0.3);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  var filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now + 0.3);
  noise.stop(now + 0.65);

  // 结束的清脆叮声
  var ding = ctx.createOscillator();
  var dingGain = ctx.createGain();
  ding.type = 'sine';
  ding.frequency.setValueAtTime(1200, now + 0.55);
  dingGain.gain.setValueAtTime(0.12, now + 0.55);
  dingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  ding.connect(dingGain);
  dingGain.connect(ctx.destination);
  ding.start(now + 0.55);
  ding.stop(now + 0.95);
}

// 营养修复音效：柔和上升音
function playSfxNutrition() {
  var ctx = _getAudioCtx();
  var now = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.setValueAtTime(0.15, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.85);
}

// 降温音效：冰晶碎裂感
function playSfxTemperature() {
  var ctx = _getAudioCtx();
  var now = ctx.currentTime;
  for (var i = 0; i < 4; i++) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800 - i * 200, now + i * 0.1);
    osc.frequency.exponentialRampToValueAtTime(400, now + i * 0.1 + 0.15);
    gain.gain.setValueAtTime(0.12, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.25);
  }
}

// ═════════════════════════════════════════════
// effects.js
// ═════════════════════════════════════════════

var _fxCanvas, _fxCtx;
var _effects = [];

function initEffects() {
  _fxCanvas = document.getElementById('fx-canvas');
  _fxCtx = _fxCanvas.getContext('2d');
  _fxResize();
  window.addEventListener('resize', _fxResize);
  _fxLoop();
}

function _fxResize() {
  _fxCanvas.width  = window.innerWidth;
  _fxCanvas.height = window.innerHeight;
}

function playRepairEffect(el, type) {
  var rect = el.getBoundingClientRect();
  var cx = rect.left + rect.width  / 2;
  // 确保特效中心在可视区域内（珊瑚底部可能超出屏幕）
  var cy = Math.min(rect.top + rect.height / 2, window.innerHeight - 80);
  switch (type) {
    case 'nutrition':   _spawnNutrition(cx, cy, rect);   break;
    case 'trash':        _spawnClean(cx, cy, rect);        break;
    case 'temperature': _spawnTemperature(cx, cy, rect);  break;
  }
}

function playCelebration() {
  var cx = window.innerWidth  / 2;
  var cy = window.innerHeight / 2;
  var colors = ['#ff4444','#ff8c00','#ffd700','#44ff88','#00bfff','#cc44ff','#ff69b4'];
  var count = 220;
  var particles = [];
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 2 + Math.random() * 6;
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
  _effects.push({ type: 'celebration', particles: particles, done: false });
}

function _spawnNutrition(cx, cy, rect) {
  var count = 28;
  var particles = [];
  for (var i = 0; i < count; i++) {
    particles.push({
      x: cx + (Math.random() - 0.5) * rect.width * 1.2,
      y: cy - rect.height * 0.4 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 1.2 + Math.random() * 2,
      r: 3 + Math.random() * 5,
      life: 1.0,
      decay: 0.012 + Math.random() * 0.012,
      color: 'hsl(' + (170 + Math.random() * 40) + ', 90%, 60%)',
    });
  }
  _effects.push({ type: 'nutrition', particles: particles, done: false });
}

function _spawnClean(cx, cy, rect) {
  var particles = [];

  // 扩散冲击波环（从中心向外扩散的圆环）
  particles.push({
    x: cx, y: cy,
    ringR: 0,
    ringMaxR: Math.max(rect.width, rect.height) * 1.2,
    ringSpeed: 4,
    life: 1.0,
    decay: 0.018,
    isRing: true,
  });

  // 大量气泡（50个），大小不一，从珊瑚周围升起
  for (var i = 0; i < 50; i++) {
    var angle = Math.random() * Math.PI * 2;
    var dist = Math.random() * rect.width * 0.6;
    particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + (Math.random() - 0.3) * rect.height * 0.5,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(1.5 + Math.random() * 3.5),
      r: 5 + Math.random() * 12,
      life: 1.0,
      decay: 0.006 + Math.random() * 0.008,
      isClean: true,
    });
  }

  // 闪光小星星（20个）
  for (var i = 0; i < 20; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 1.5 + Math.random() * 3;
    particles.push({
      x: cx + (Math.random() - 0.5) * rect.width * 0.4,
      y: cy + (Math.random() - 0.5) * rect.height * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 2 + Math.random() * 3,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.01,
      isSpark: true,
    });
  }

  // 垃圾图片四散飞走（5个）
  var trashSrcs = ['assets/trash/bag-1.png', 'assets/trash/bottle-1.png', 'assets/trash/net-1.png', 'assets/trash/bag-2.png', 'assets/trash/bottle-2.png'];
  for (var i = 0; i < 5; i++) {
    var angle = -Math.PI * 0.2 + (i / 4) * Math.PI * 0.4 - Math.PI / 2;
    var speed = 3 + Math.random() * 3;
    // 创建离屏 img 用于 canvas drawImage
    var trashImg = new Image();
    trashImg.src = trashSrcs[i];
    particles.push({
      trashImg: trashImg,
      x: cx + (Math.random() - 0.5) * rect.width * 0.4,
      y: cy + (Math.random() - 0.3) * rect.height * 0.3,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed - 1,
      life: 1.0,
      decay: 0.01,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      isTrashImg: true,
    });
  }

  _effects.push({ type: 'clean', particles: particles, done: false });
}

function _spawnTemperature(cx, cy, rect) {
  var count = 24;
  var particles = [];
  var baseR = Math.max(rect.width, rect.height) * 0.45;
  for (var i = 0; i < count; i++) {
    var angle = (i / count) * Math.PI * 2;
    var r = baseR + (Math.random() - 0.5) * 20;
    particles.push({
      angle: angle,
      r: r,
      cx: cx, cy: cy,
      angularSpeed: 1.4 + Math.random() * 0.8,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      size: 6 + Math.random() * 8,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.006,
      color: 'hsl(' + (200 + Math.random() * 40) + ', 90%, 80%)',
      isCrystal: true,
    });
  }
  _effects.push({ type: 'temperature', particles: particles, done: false });
}

function _fxLoop() {
  requestAnimationFrame(_fxLoop);
  _fxCtx.clearRect(0, 0, _fxCanvas.width, _fxCanvas.height);
  for (var i = _effects.length - 1; i >= 0; i--) {
    var eff = _effects[i];
    _updateEffect(eff);
    if (eff.done) _effects.splice(i, 1);
  }
}

function _updateEffect(eff) {
  var dt = 0.016;
  var allDead = true;
  for (var j = 0; j < eff.particles.length; j++) {
    var p = eff.particles[j];
    if (p.life <= 0) continue;
    allDead = false;
    p.life -= p.decay;
    if (p.isCrystal) {
      p.angle += p.angularSpeed * dt;
      p.x = p.cx + Math.cos(p.angle) * p.r;
      p.y = p.cy + Math.sin(p.angle) * p.r;
      p.r *= 0.994;
      _drawCrystal(p);
    } else if (p.isRing) {
      // 扩散冲击波环
      p.ringR += p.ringSpeed;
      _fxCtx.globalAlpha = Math.max(0, p.life) * 0.6;
      _fxCtx.beginPath();
      _fxCtx.arc(p.x, p.y, p.ringR, 0, Math.PI * 2);
      _fxCtx.strokeStyle = 'rgba(180,240,255,' + (p.life * 0.8) + ')';
      _fxCtx.lineWidth = 3;
      _fxCtx.stroke();
      _fxCtx.globalAlpha = 1;
    } else if (p.isTrashImg) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      if (p.rotation !== undefined) p.rotation += p.rotSpeed;
      _fxCtx.save();
      _fxCtx.globalAlpha = Math.max(0, p.life);
      _fxCtx.translate(p.x, p.y);
      if (p.rotation) _fxCtx.rotate(p.rotation);
      if (p.trashImg && p.trashImg.complete) {
        _fxCtx.drawImage(p.trashImg, -20, -20, 40, 40);
      }
      _fxCtx.restore();
    } else if (p.isSpark) {
      // 闪光星星
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      var sparkAlpha = Math.max(0, p.life);
      _fxCtx.globalAlpha = sparkAlpha;
      _fxCtx.fillStyle = 'rgba(255,255,255,' + sparkAlpha + ')';
      _fxCtx.beginPath();
      // 四角星形
      var sr = p.r;
      _fxCtx.save();
      _fxCtx.translate(p.x, p.y);
      _fxCtx.moveTo(0, -sr);
      _fxCtx.lineTo(sr * 0.3, -sr * 0.3);
      _fxCtx.lineTo(sr, 0);
      _fxCtx.lineTo(sr * 0.3, sr * 0.3);
      _fxCtx.lineTo(0, sr);
      _fxCtx.lineTo(-sr * 0.3, sr * 0.3);
      _fxCtx.lineTo(-sr, 0);
      _fxCtx.lineTo(-sr * 0.3, -sr * 0.3);
      _fxCtx.closePath();
      _fxCtx.fill();
      _fxCtx.restore();
      _fxCtx.globalAlpha = 1;
    } else if (p.isClean) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy *= 0.98;
      p.vx *= 0.99;
      var bubbleAlpha = Math.max(0, p.life);
      _fxCtx.globalAlpha = bubbleAlpha * 0.7;
      // 气泡填充
      var grad = _fxCtx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1, p.x, p.y, p.r);
      grad.addColorStop(0, 'rgba(255,255,255,' + (bubbleAlpha * 0.5) + ')');
      grad.addColorStop(0.5, 'rgba(200,240,255,' + (bubbleAlpha * 0.15) + ')');
      grad.addColorStop(1, 'rgba(180,230,255,' + (bubbleAlpha * 0.05) + ')');
      _fxCtx.beginPath();
      _fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      _fxCtx.fillStyle = grad;
      _fxCtx.fill();
      // 气泡边缘
      _fxCtx.strokeStyle = 'rgba(220,245,255,' + (bubbleAlpha * 0.6) + ')';
      _fxCtx.lineWidth = 1.5;
      _fxCtx.stroke();
      // 高光点
      _fxCtx.beginPath();
      _fxCtx.arc(p.x - p.r * 0.25, p.y - p.r * 0.25, p.r * 0.2, 0, Math.PI * 2);
      _fxCtx.fillStyle = 'rgba(255,255,255,' + (bubbleAlpha * 0.8) + ')';
      _fxCtx.fill();
      _fxCtx.globalAlpha = 1;
    } else {
      p.x  += p.vx;
      p.y  += p.vy;
      if (eff.type === 'celebration') p.vy += p.gravity;
      _fxCtx.globalAlpha = Math.max(0, p.life);
      _fxCtx.beginPath();
      _fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      _fxCtx.fillStyle = p.color;
      _fxCtx.fill();
      _fxCtx.globalAlpha = 1;
    }
  }
  if (allDead) eff.done = true;
}

function _drawCrystal(p) {
  var x = p.x, y = p.y, size = p.size, life = p.life;
  _fxCtx.save();
  _fxCtx.globalAlpha = Math.max(0, life) * 0.85;
  _fxCtx.translate(x, y);
  _fxCtx.rotate(p.angle * 2);
  _fxCtx.strokeStyle = p.color;
  _fxCtx.lineWidth = 1.5;
  for (var i = 0; i < 6; i++) {
    var a = (i / 6) * Math.PI * 2;
    _fxCtx.beginPath();
    _fxCtx.moveTo(0, 0);
    _fxCtx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
    _fxCtx.stroke();
    var mx = Math.cos(a) * size * 0.6;
    var my = Math.sin(a) * size * 0.6;
    var perp = a + Math.PI / 2;
    _fxCtx.beginPath();
    _fxCtx.moveTo(mx + Math.cos(perp) * size * 0.25, my + Math.sin(perp) * size * 0.25);
    _fxCtx.lineTo(mx - Math.cos(perp) * size * 0.25, my - Math.sin(perp) * size * 0.25);
    _fxCtx.stroke();
  }
  _fxCtx.restore();
}

// ═════════════════════════════════════════════
// corals.js
// ═════════════════════════════════════════════

var CORAL_DATA = [
  // ── 装饰珊瑚 ──
  { id: 'coral-1',  problem: null, file: 'coral-1.png',  posX: 3,  posY: 98, swayDur: '5.0s', width: 150 },
  { id: 'coral-2',  problem: null, file: 'coral-2.png',  posX: 10, posY: 97, swayDur: '4.6s', width: 165 },
  { id: 'coral-3',  problem: null, file: 'coral-3.png',  posX: 20, posY: 96, swayDur: '4.2s', width: 190 },
  // ── 有问题 ──
  { id: 'coral-4',  problem: 'nutrition', problemLabel: '严重白化',
    desc: '高温和污染导致珊瑚失去共生藻，颜色变得灰白。', tool: 'nutrition',
    file: 'coral-4.png',  posX: 28, posY: 96, swayDur: '4.8s', width: 175 },
  // ── 装饰 ──
  { id: 'coral-5',  problem: null, file: 'coral-5.png',  posX: 34, posY: 97, swayDur: '5.5s', width: 130 },
  // ── 有问题 ──
  { id: 'coral-6',  problem: 'trash', problemLabel: '垃圾覆盖',
    desc: '人类丢弃的塑料袋和饮料瓶缠绕在珊瑚上，阻碍了它的呼吸。', tool: 'clean',
    file: 'coral-6.png',  posX: 42, posY: 95, swayDur: '4.0s', width: 185 },
  // ── 装饰 ──
  { id: 'coral-7',  problem: null, file: 'coral-7.png',  posX: 53, posY: 97, swayDur: '5.8s', width: 260 },
  // ── 有问题 ──
  { id: 'coral-8',  problem: 'temperature', problemLabel: '温度过高',
    desc: '海水变暖让珊瑚承受热应激，急需降温。', tool: 'temperature',
    file: 'coral-8.png',  posX: 63, posY: 95, swayDur: '4.3s', width: 175 },
  // ── 装饰 ──
  { id: 'coral-9',  problem: null, file: 'coral-9.png',  posX: 70, posY: 96, swayDur: '4.7s', width: 160 },
  { id: 'coral-10', problem: null, file: 'coral-10.png', posX: 78, posY: 96, swayDur: '4.1s', width: 170 },
  // ── 有问题 ──
  { id: 'coral-11', problem: 'trash', problemLabel: '垃圾覆盖',
    desc: '人类丢弃的垃圾覆盖了珊瑚，让它无法进行光合作用。', tool: 'clean',
    file: 'coral-11.png', posX: 86, posY: 96, swayDur: '4.5s', width: 170 },
  // ── 装饰 ──
  { id: 'coral-12', problem: null, file: 'coral-12.png', posX: 94, posY: 97, swayDur: '5.1s', width: 175 },
];

var TOOL_PROBLEM_MAP = {
  nutrition:   'nutrition',
  clean:       'trash',
  temperature: 'temperature',
};

var _corals = [];
var _onCoralClick = null;

function initCorals(onCoralClick) {
  _onCoralClick = onCoralClick;
  _corals = [];
  var layer = document.getElementById('coral-layer');
  layer.innerHTML = '';
  for (var i = 0; i < CORAL_DATA.length; i++) {
    var data = CORAL_DATA[i];
    var el = _createCoralElement(data);
    layer.appendChild(el);
    _corals.push({ data: data, el: el, isRepaired: false });
  }

  // 窗口大小变化时重新计算珊瑚 Y 位置
  window.addEventListener('resize', function() {
    for (var i = 0; i < _corals.length; i++) {
      _corals[i].el.style.top = _calcCoralY(_corals[i].data.posY) + 'vh';
    }
  });

  return _corals;
}

function getCorals() { return _corals; }

function repairCoral(coral) {
  if (coral.isRepaired) return;
  coral.isRepaired = true;
  var el = coral.el;
  // 垃圾珊瑚：移除垃圾图片
  if (coral.data.problem === 'trash') {
    _removeTrashOverlay(el);
  }
  el.removeAttribute('data-problem');
  el.classList.add('repaired');
  setTimeout(function() { el.classList.remove('repaired'); }, 1100);
}

function resetCorals() {
  for (var i = 0; i < _corals.length; i++) {
    var coral = _corals[i];
    if (!coral.data.problem) continue;
    coral.isRepaired = false;
    coral.el.setAttribute('data-problem', coral.data.problem);
    coral.el.classList.remove('repaired');
    // 垃圾珊瑚：恢复垃圾图片
    if (coral.data.problem === 'trash') {
      _restoreTrashOverlay(coral.el, coral.data.id);
    }
  }
}

function getProblemCount() {
  var count = 0;
  for (var i = 0; i < _corals.length; i++) {
    if (_corals[i].data.problem) count++;
  }
  return count;
}

function getRepairedCount() {
  var count = 0;
  for (var i = 0; i < _corals.length; i++) {
    if (_corals[i].data.problem && _corals[i].isRepaired) count++;
  }
  return count;
}

/**
 * 根据屏幕宽高比计算珊瑚的实际 Y 位置（vh）
 * 背景图原始比例约 16:9，用 object-fit:cover 显示
 * 当屏幕更"方"（如 iPad 4:3），图片上下被裁切，沙地相对位置上移
 */
function _calcCoralY(dataY) {
  var screenRatio = window.innerWidth / window.innerHeight;
  var imgRatio = 16 / 9;
  if (screenRatio >= imgRatio) {
    // 屏幕比图片更宽或一样 — 图片按宽度填满，上下可能有裁切少
    return dataY;
  }
  // 屏幕比图片更方/更高 — 图片按宽度放不满，按高度填，左右裁切
  // 沙地在图片底部约 60% 位置开始，cover 后位置会上移
  // 计算图片实际显示时的缩放
  var scale = window.innerHeight / (window.innerWidth / imgRatio);
  // 图片被放大了 scale 倍，中心对齐，底部沙地位置上移
  var offset = (scale - 1) * 0.5 * 100; // vh 偏移量
  return dataY - offset * 0.35; // 珊瑚跟随上移（系数调节）
}

// 垃圾素材列表
var TRASH_IMAGES = [
  'assets/trash/bag-1.png',
  'assets/trash/bag-2.png',
  'assets/trash/bag-3.png',
  'assets/trash/bottle-1.png',
  'assets/trash/bottle-2.png',
  'assets/trash/net-1.png',
  'assets/trash/net-2.png',
];

// 每颗垃圾珊瑚上叠加的垃圾配置（位置、大小、旋转各不同）
var TRASH_CONFIGS = {
  'coral-6': [
    { src: 0, top: '5%',  left: '0%',   size: 82, rotate: -15 },
    { src: 3, top: '10%', left: '55%',  size: 68, rotate: 25 },
    { src: 5, top: '30%', left: '20%',  size: 105, rotate: 5 },
    { src: 1, top: '45%', left: '60%',  size: 75, rotate: -20 },
    { src: 4, top: '60%', left: '-5%',  size: 63, rotate: 30 },
    { src: 6, top: '55%', left: '45%',  size: 90, rotate: -10 },
  ],
  'coral-11': [
    { src: 1, top: '0%',  left: '45%',  size: 75, rotate: 12 },
    { src: 5, top: '15%', left: '-5%',  size: 98, rotate: -8 },
    { src: 4, top: '25%', left: '55%',  size: 63, rotate: -25 },
    { src: 0, top: '40%', left: '10%',  size: 82, rotate: 18 },
    { src: 6, top: '50%', left: '50%',  size: 87, rotate: -12 },
    { src: 2, top: '60%', left: '25%',  size: 72, rotate: 22 },
  ],
};

function _addTrashOverlay(div, coralId) {
  var configs = TRASH_CONFIGS[coralId];
  if (!configs) return;
  for (var i = 0; i < configs.length; i++) {
    var c = configs[i];
    var wrapper = document.createElement('div');
    wrapper.className = 'trash-overlay';
    wrapper.style.top = c.top;
    wrapper.style.left = c.left;
    wrapper.style.width = c.size + 'px';
    wrapper.style.height = c.size + 'px';
    wrapper.style.transform = 'rotate(' + c.rotate + 'deg)';
    var img = new Image();
    img.src = TRASH_IMAGES[c.src];
    wrapper.appendChild(img);
    div.appendChild(wrapper);
  }
}

function _removeTrashOverlay(el) {
  var items = el.querySelectorAll('.trash-overlay');
  for (var i = 0; i < items.length; i++) {
    items[i].style.opacity = '0';
  }
  // 动画结束后移除 DOM
  setTimeout(function() {
    var remaining = el.querySelectorAll('.trash-overlay');
    for (var j = 0; j < remaining.length; j++) {
      remaining[j].remove();
    }
  }, 800);
}

function _restoreTrashOverlay(el, coralId) {
  // 先清除旧的
  var old = el.querySelectorAll('.trash-overlay');
  for (var i = 0; i < old.length; i++) old[i].remove();
  _addTrashOverlay(el, coralId);
}

function _createCoralElement(data) {
  var div = document.createElement('div');
  div.className = 'coral-item';
  if (!data.problem) div.classList.add('decorative');
  div.dataset.id = data.id;
  if (data.problem) div.dataset.problem = data.problem;
  div.style.left = data.posX + 'vw';
  div.style.top  = _calcCoralY(data.posY) + 'vh';
  div.style.setProperty('--sway-dur', data.swayDur);
  div.style.setProperty('--coral-w', data.width + 'px');
  div.title = data.name || '';

  var img = new Image();
  img.src = 'assets/coral-group/' + data.file;
  img.alt = data.name || '';
  img.style.width = data.width + 'px';

  img.onerror = function() {
    div.removeChild(img);
    var span = document.createElement('span');
    span.style.cssText = 'display:block;font-size:' + (data.width * 0.8) + 'px;line-height:1;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.5));';
    span.textContent = data.emoji || '🪸';
    div.appendChild(span);
  };

  div.appendChild(img);

  // 垃圾覆盖图片
  if (data.problem === 'trash') {
    _addTrashOverlay(div, data.id);
  }

  // 只有有问题的珊瑚才需要点击交互
  if (data.problem) {
    div.addEventListener('click', function(e) {
      e.stopPropagation();
      var coral = _corals.find(function(c) { return c.data.id === data.id; });
      if (coral && _onCoralClick) _onCoralClick(coral);
    });
  }

  return div;
}

// ═════════════════════════════════════════════
// 装饰珊瑚排（中排 + 后排）
// ═════════════════════════════════════════════

// 中间层：密集珊瑚群，与前排大小一致，紧挨着
var DECO_MID_ROW = [
  { file: 'coral-3.png',  posX: -2, posY: 86, width: 170 },
  { file: 'coral-9.png',  posX: 3,  posY: 84, width: 155 },
  { file: 'coral-5.png',  posX: 7,  posY: 87, width: 140 },
  { file: 'coral-11.png', posX: 11, posY: 85, width: 165 },
  { file: 'coral-1.png',  posX: 16, posY: 86, width: 150 },
  { file: 'coral-8.png',  posX: 20, posY: 84, width: 160 },
  { file: 'coral-4.png',  posX: 25, posY: 87, width: 155 },
  { file: 'coral-7.png',  posX: 30, posY: 85, width: 180 },
  { file: 'coral-12.png', posX: 35, posY: 86, width: 160 },
  { file: 'coral-2.png',  posX: 39, posY: 84, width: 150 },
  { file: 'coral-6.png',  posX: 44, posY: 87, width: 165 },
  { file: 'coral-10.png', posX: 48, posY: 85, width: 150 },
  { file: 'coral-3.png',  posX: 53, posY: 86, width: 170 },
  { file: 'coral-9.png',  posX: 57, posY: 84, width: 155 },
  { file: 'coral-5.png',  posX: 62, posY: 87, width: 140 },
  { file: 'coral-8.png',  posX: 66, posY: 85, width: 160 },
  { file: 'coral-1.png',  posX: 71, posY: 86, width: 150 },
  { file: 'coral-12.png', posX: 75, posY: 84, width: 165 },
  { file: 'coral-4.png',  posX: 80, posY: 87, width: 155 },
  { file: 'coral-11.png', posX: 84, posY: 85, width: 160 },
  { file: 'coral-6.png',  posX: 89, posY: 86, width: 155 },
  { file: 'coral-2.png',  posX: 93, posY: 84, width: 150 },
  { file: 'coral-10.png', posX: 98, posY: 86, width: 155 },
];

// 后层：同样大小，紧密填充，与中间层交错形成一整片珊瑚群
var DECO_BACK_ROW = [
  { file: 'coral-10.png', posX: -1, posY: 79, width: 155 },
  { file: 'coral-6.png',  posX: 4,  posY: 77, width: 150 },
  { file: 'coral-8.png',  posX: 8,  posY: 80, width: 160 },
  { file: 'coral-2.png',  posX: 13, posY: 78, width: 145 },
  { file: 'coral-12.png', posX: 17, posY: 79, width: 155 },
  { file: 'coral-5.png',  posX: 22, posY: 77, width: 140 },
  { file: 'coral-4.png',  posX: 26, posY: 80, width: 155 },
  { file: 'coral-9.png',  posX: 31, posY: 78, width: 150 },
  { file: 'coral-3.png',  posX: 35, posY: 79, width: 160 },
  { file: 'coral-11.png', posX: 40, posY: 77, width: 150 },
  { file: 'coral-1.png',  posX: 44, posY: 80, width: 155 },
  { file: 'coral-7.png',  posX: 49, posY: 78, width: 170 },
  { file: 'coral-6.png',  posX: 54, posY: 79, width: 150 },
  { file: 'coral-10.png', posX: 58, posY: 77, width: 155 },
  { file: 'coral-2.png',  posX: 63, posY: 80, width: 145 },
  { file: 'coral-8.png',  posX: 67, posY: 78, width: 160 },
  { file: 'coral-5.png',  posX: 72, posY: 79, width: 150 },
  { file: 'coral-12.png', posX: 76, posY: 77, width: 155 },
  { file: 'coral-3.png',  posX: 81, posY: 80, width: 150 },
  { file: 'coral-9.png',  posX: 85, posY: 78, width: 155 },
  { file: 'coral-4.png',  posX: 90, posY: 79, width: 148 },
  { file: 'coral-11.png', posX: 94, posY: 77, width: 160 },
  { file: 'coral-1.png',  posX: 99, posY: 80, width: 150 },
];

// 最远层：第四排，在后排之上，与后排紧密衔接
var DECO_FAR_ROW = [
  { file: 'coral-7.png',  posX: -1, posY: 73, width: 160 },
  { file: 'coral-4.png',  posX: 5,  posY: 71, width: 150 },
  { file: 'coral-9.png',  posX: 10, posY: 73, width: 145 },
  { file: 'coral-1.png',  posX: 15, posY: 70, width: 155 },
  { file: 'coral-12.png', posX: 20, posY: 72, width: 148 },
  { file: 'coral-6.png',  posX: 25, posY: 71, width: 155 },
  { file: 'coral-3.png',  posX: 30, posY: 73, width: 150 },
  { file: 'coral-8.png',  posX: 35, posY: 70, width: 160 },
  { file: 'coral-2.png',  posX: 40, posY: 72, width: 145 },
  { file: 'coral-11.png', posX: 45, posY: 71, width: 155 },
  { file: 'coral-5.png',  posX: 50, posY: 73, width: 148 },
  { file: 'coral-10.png', posX: 55, posY: 70, width: 152 },
  { file: 'coral-3.png',  posX: 60, posY: 72, width: 155 },
  { file: 'coral-9.png',  posX: 65, posY: 71, width: 148 },
  { file: 'coral-4.png',  posX: 70, posY: 73, width: 150 },
  { file: 'coral-12.png', posX: 75, posY: 70, width: 155 },
  { file: 'coral-1.png',  posX: 80, posY: 72, width: 148 },
  { file: 'coral-6.png',  posX: 85, posY: 71, width: 152 },
  { file: 'coral-8.png',  posX: 90, posY: 73, width: 155 },
  { file: 'coral-2.png',  posX: 96, posY: 70, width: 150 },
];

function initDecoRows() {
  _populateDecoRow('coral-row-far',  DECO_FAR_ROW);
  _populateDecoRow('coral-row-mid',  DECO_MID_ROW);
  _populateDecoRow('coral-row-back', DECO_BACK_ROW);
}

function _populateDecoRow(containerId, items) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < items.length; i++) {
    var d = items[i];
    var div = document.createElement('div');
    div.className = 'deco-coral';
    div.style.left = d.posX + 'vw';
    div.style.top  = d.posY + 'vh';
    var img = new Image();
    img.src = 'assets/coral-group/' + d.file;
    img.style.width = d.width + 'px';
    div.appendChild(img);
    container.appendChild(div);
  }
}

// ═════════════════════════════════════════════
// main.js
// ═════════════════════════════════════════════

var _activeTool = 'detect';
var _speechTimer = null;

// Bootstrap
initEffects();
initCorals(onCoralClick);
initDecoRows();
initToolbar();

// Loading 消退
var loadingEl = document.getElementById('loading');
setTimeout(function() {
  loadingEl.classList.add('fade-out');
  setTimeout(function() {
    loadingEl.style.display = 'none';
    speak('welcome');
  }, 800);
}, 800);

// 关闭完成面板
document.getElementById('completion-close').addEventListener('click', function() {
  document.getElementById('completion-overlay').classList.add('hidden');
});

// 再玩一次
document.getElementById('replay-btn').addEventListener('click', function() {
  resetCorals();
  updateProgress();
  document.getElementById('completion-overlay').classList.add('hidden');
  document.getElementById('info-panel').classList.add('hidden');
  setTimeout(function() { speak('welcome'); }, 400);
});

// 信息面板关闭
document.getElementById('panel-close').addEventListener('click', function() {
  document.getElementById('info-panel').classList.add('hidden');
});

// 点击背景关闭信息面板
document.addEventListener('click', function(e) {
  var panel = document.getElementById('info-panel');
  if (!panel.classList.contains('hidden') && !panel.contains(e.target)) {
    panel.classList.add('hidden');
  }
});

function _setToolCursor(tool) {
  document.body.className = document.body.className.replace(/tool-\S+/g, '').trim();
  if (tool === 'detect') {
    document.body.classList.add('tool-detect');
  }
}

function initToolbar() {
  var toolbar = document.getElementById('toolbar');
  var subBtn = document.getElementById('sub-btn');
  var magnifier = document.getElementById('magnifier');

  // 放大镜跟随鼠标
  document.addEventListener('mousemove', function(e) {
    magnifier.style.left = e.clientX + 'px';
    magnifier.style.top  = e.clientY + 'px';
  });

  // 点击潜水艇红色按钮：切换工具栏展开/收起
  subBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toolbar.classList.toggle('open');
  });

  // 工具按钮点击
  document.querySelectorAll('.tool-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      document.querySelectorAll('.tool-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _activeTool = btn.dataset.tool;
      _setToolCursor(_activeTool);
      document.getElementById('info-panel').classList.add('hidden');
    });
  });
}

function onCoralClick(coral) {
  if (_activeTool === 'detect') {
    if (coral.isRepaired) {
      showSpeechBubble('提示', MESSAGES.alreadyRepaired);
      speak('alreadyRepaired');
    } else {
      var msg = MESSAGES.detect[coral.data.id];
      showSpeechBubble('探测结果', msg);
      speak('detect_' + coral.data.id);
    }
    return;
  }
  if (_activeTool === null) {
    openInfoPanel(coral);
    return;
  }
  tryRepair(coral, _activeTool);
}

function tryRepair(coral, tool) {
  if (coral.isRepaired) {
    showSpeechBubble('提示', MESSAGES.alreadyRepaired);
    speak('alreadyRepaired');
    return;
  }
  var expectedProblem = TOOL_PROBLEM_MAP[tool];
  if (!expectedProblem) return;
  if (expectedProblem !== coral.data.problem) {
    showSpeechBubble('提示', MESSAGES.wrongTool);
    speak('wrongTool');
    shakeToolbar();
    return;
  }
  repairCoral(coral);
  playRepairEffect(coral.el, coral.data.problem);
  // 播放修复音效
  switch (coral.data.problem) {
    case 'trash':       playSfxClean(); break;
    case 'nutrition':   playSfxNutrition(); break;
    case 'temperature': playSfxTemperature(); break;
  }
  showSpeechBubble('修复成功 ✨', MESSAGES.repair[coral.data.id]);
  speak('repair_' + coral.data.id);
  updateProgress();

  var total = getProblemCount();
  var done  = getRepairedCount();
  if (done === total) {
    setTimeout(function() {
      playCelebration();
      speak('allDone');
    }, 600);
    setTimeout(function() {
      document.getElementById('completion-overlay').classList.remove('hidden');
    }, 2200);
  }
}

function openInfoPanel(coral) {
  document.getElementById('panel-emoji').textContent   = coral.data.emoji;
  document.getElementById('panel-name').textContent    = coral.data.name;
  document.getElementById('panel-problem').textContent = coral.data.problemLabel;
  document.getElementById('panel-desc').textContent    = coral.data.desc;

  var toolsEl = document.getElementById('panel-tools');
  toolsEl.innerHTML = '';

  var toolDefs = [
    { tool: 'nutrition',   icon: '💧', label: '营养液' },
    { tool: 'clean',       icon: '🧹', label: '清理'   },
    { tool: 'temperature', icon: '🌡️', label: '调温'   },
  ];

  for (var i = 0; i < toolDefs.length; i++) {
    (function(def) {
      var btn = document.createElement('button');
      btn.className = 'panel-tool-btn ' + (def.tool === coral.data.tool && !coral.isRepaired ? 'correct' : 'wrong');
      btn.innerHTML = '<span class="btn-icon">' + def.icon + '</span><span>' + def.label + '</span>';
      if (def.tool === coral.data.tool && !coral.isRepaired) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          document.getElementById('info-panel').classList.add('hidden');
          tryRepair(coral, def.tool);
        });
      }
      toolsEl.appendChild(btn);
    })(toolDefs[i]);
  }

  document.getElementById('info-panel').classList.remove('hidden');
}

function showSpeechBubble(title, text) {
  document.getElementById('speech-title').textContent = title;
  document.getElementById('speech-text').textContent  = text;
  var bubble = document.getElementById('speech-bubble');
  bubble.classList.remove('hidden');
  if (_speechTimer) clearTimeout(_speechTimer);
  _speechTimer = setTimeout(function() {
    bubble.classList.add('hidden');
  }, 4000);
}

function updateProgress() {
  var total    = getProblemCount();
  var repaired = getRepairedCount();
  var pct = total > 0 ? (repaired / total) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent  = repaired + '/' + total;
}

function shakeToolbar() {
  var tb = document.getElementById('toolbar');
  tb.classList.add('shake');
  setTimeout(function() { tb.classList.remove('shake'); }, 420);
}
