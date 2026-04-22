/**
 * app.js — 合并后的单文件（无 ES module，支持 file:// 直接打开）
 */

// ═════════════════════════════════════════════
// audio.js
// ═════════════════════════════════════════════

const MESSAGES = {
  detect: {
    nutrition:   '这颗珊瑚完全白化了！快用营养液救救它吧！',
    trash:       '这颗珊瑚被垃圾覆盖啦！用清理工具把垃圾清除掉吧！',
    temperature: '这颗珊瑚周围水温太高了！快用调温工具降温吧！',
  },
  repair: {
    nutrition:   '这颗珊瑚恢复了健康的颜色，太漂亮啦！',
    trash:       '这颗珊瑚的垃圾清除干净了，太好了！',
    temperature: '这颗珊瑚降温成功，恢复了美丽的颜色！',
  },
  wrongTool:      '这个工具不对哦，换一个试试吧！',
  alreadyRepaired:'这颗珊瑚已经恢复健康了，去看看其他珊瑚吧！',
  allDone:        '恭喜你！所有珊瑚都恢复健康啦！你是最棒的珊瑚守护者！',
  welcome:        '欢迎来到珊瑚守护者！选一个工具，然后点击珊瑚探索吧！',
};

const AUDIO_FILES = {
  welcome:              'audio/welcome.mp3',
  wrongTool:            'audio/wrongTool.mp3',
  alreadyRepaired:      'audio/alreadyRepaired.mp3',
  allDone:              'audio/allDone.mp3',
  'detect_nutrition':   'audio/detect_coral-4.mp3',
  'detect_trash':       'audio/detect_coral-6.mp3',
  'detect_temperature': 'audio/detect_coral-8.mp3',
  'repair_nutrition':   'audio/repair_coral-4.mp3',
  'repair_trash':       'audio/repair_coral-6.mp3',
  'repair_temperature': 'audio/repair_coral-8.mp3',
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

// 冰雪飘动音效：柔和风声+冰晶闪烁
function playSfxSnowWind() {
  var ctx = _getAudioCtx();
  var now = ctx.currentTime;
  var dur = 2.5;

  // 风声：滤波白噪声
  var bufLen = Math.floor(ctx.sampleRate * dur);
  var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
  var wind = ctx.createBufferSource();
  wind.buffer = buf;
  var windFilter = ctx.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.setValueAtTime(600, now);
  windFilter.frequency.linearRampToValueAtTime(1200, now + dur * 0.5);
  windFilter.frequency.linearRampToValueAtTime(400, now + dur);
  windFilter.Q.value = 1.5;
  var windGain = ctx.createGain();
  windGain.gain.setValueAtTime(0, now);
  windGain.gain.linearRampToValueAtTime(0.06, now + 0.3);
  windGain.gain.setValueAtTime(0.06, now + dur * 0.6);
  windGain.gain.linearRampToValueAtTime(0, now + dur);
  wind.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(ctx.destination);
  wind.start(now);
  wind.stop(now + dur);

  // 冰晶闪烁：随机高频短音
  for (var j = 0; j < 8; j++) {
    var t = now + 0.2 + Math.random() * (dur - 0.5);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000 + Math.random() * 3000, t);
    g.gain.setValueAtTime(0.04 + Math.random() * 0.03, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08 + Math.random() * 0.06);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

// 羽化音效：柔和扩散消融感
function playSfxFeather() {
  var ctx = _getAudioCtx();
  var now = ctx.currentTime;

  // 柔和上升shimmer音
  for (var i = 0; i < 5; i++) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'sine';
    var baseFreq = 600 + i * 180;
    var t = now + i * 0.12;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.6);
    g.gain.setValueAtTime(0.07, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);
  }

  // 气息扩散：滤波噪声
  var bufLen = Math.floor(ctx.sampleRate * 1.2);
  var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var j = 0; j < bufLen; j++) d[j] = (Math.random() * 2 - 1);
  var noise = ctx.createBufferSource();
  noise.buffer = buf;
  var filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.linearRampToValueAtTime(6000, now + 0.8);
  filter.Q.value = 0.5;
  var nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0, now);
  nGain.gain.linearRampToValueAtTime(0.04, now + 0.2);
  nGain.gain.linearRampToValueAtTime(0.03, now + 0.6);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 1.2);

  // 尾部和弦泛音
  var chord = [880, 1100, 1320];
  for (var k = 0; k < chord.length; k++) {
    var o = ctx.createOscillator();
    var cg = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(chord[k], now + 0.5);
    cg.gain.setValueAtTime(0.05, now + 0.5);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    o.connect(cg);
    cg.connect(ctx.destination);
    o.start(now + 0.5);
    o.stop(now + 1.5);
  }
}

// 按钮音效：机械键盘敲击
function playSfxButton() {
  var ctx = _getAudioCtx();
  var now = ctx.currentTime;
  // 触底冲击：短噪声 + 带通滤波模拟塑料/金属撞击
  var bufLen = Math.floor(ctx.sampleRate * 0.025);
  var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.3));
  var hit = ctx.createBufferSource();
  hit.buffer = buf;
  var bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3500;
  bp.Q.value = 1.2;
  var hg = ctx.createGain();
  hg.gain.setValueAtTime(0.4, now);
  hit.connect(bp); bp.connect(hg); hg.connect(ctx.destination);
  hit.start(now);
  // 轴体弹簧共振
  var spring = ctx.createOscillator();
  var sg = ctx.createGain();
  spring.type = 'sine';
  spring.frequency.setValueAtTime(4200, now);
  spring.frequency.exponentialRampToValueAtTime(3000, now + 0.03);
  sg.gain.setValueAtTime(0.06, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  spring.connect(sg); sg.connect(ctx.destination);
  spring.start(now);
  spring.stop(now + 0.05);
  // 回弹声
  var bufLen2 = Math.floor(ctx.sampleRate * 0.015);
  var buf2 = ctx.createBuffer(1, bufLen2, ctx.sampleRate);
  var d2 = buf2.getChannelData(0);
  for (var i = 0; i < bufLen2; i++) d2[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen2 * 0.25));
  var up = ctx.createBufferSource();
  up.buffer = buf2;
  var bp2 = ctx.createBiquadFilter();
  bp2.type = 'bandpass';
  bp2.frequency.value = 4500;
  bp2.Q.value = 1.5;
  var ug = ctx.createGain();
  ug.gain.setValueAtTime(0.2, now + 0.06);
  up.connect(bp2); bp2.connect(ug); ug.connect(ctx.destination);
  up.start(now + 0.06);
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
  var count = 35;
  var particles = [];
  for (var i = 0; i < count; i++) {
    particles.push({
      x: cx + (Math.random() - 0.5) * rect.width * 1.5,
      y: cy - rect.height * 0.6 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.8 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 0.02,
      size: 5 + Math.random() * 10,
      life: 1.0,
      decay: 0.005 + Math.random() * 0.005,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04,
      color: 'hsl(' + (195 + Math.random() * 25) + ', 90%, ' + (80 + Math.random() * 15) + '%)',
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
      p.x += p.vx;
      p.y += p.vy;
      p.vx += p.drift;
      p.angle += p.spin;
      _drawSnowflake(p);
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

function _drawSnowflake(p) {
  var x = p.x, y = p.y, size = p.size, life = p.life;
  _fxCtx.save();
  _fxCtx.globalAlpha = Math.max(0, life) * 0.9;
  _fxCtx.translate(x, y);
  _fxCtx.rotate(p.angle);
  _fxCtx.strokeStyle = p.color;
  _fxCtx.lineWidth = 1.5;
  _fxCtx.lineCap = 'round';
  for (var i = 0; i < 6; i++) {
    var a = (i / 6) * Math.PI * 2;
    var ex = Math.cos(a) * size;
    var ey = Math.sin(a) * size;
    _fxCtx.beginPath();
    _fxCtx.moveTo(0, 0);
    _fxCtx.lineTo(ex, ey);
    _fxCtx.stroke();
    // 分支
    var bLen = size * 0.35;
    for (var b = 0; b < 2; b++) {
      var t = 0.45 + b * 0.3;
      var bx = Math.cos(a) * size * t;
      var by = Math.sin(a) * size * t;
      var ba1 = a + Math.PI / 4;
      var ba2 = a - Math.PI / 4;
      _fxCtx.beginPath();
      _fxCtx.moveTo(bx, by);
      _fxCtx.lineTo(bx + Math.cos(ba1) * bLen, by + Math.sin(ba1) * bLen);
      _fxCtx.stroke();
      _fxCtx.beginPath();
      _fxCtx.moveTo(bx, by);
      _fxCtx.lineTo(bx + Math.cos(ba2) * bLen, by + Math.sin(ba2) * bLen);
      _fxCtx.stroke();
    }
  }
  // 中心圆点
  _fxCtx.fillStyle = p.color;
  _fxCtx.beginPath();
  _fxCtx.arc(0, 0, 2, 0, Math.PI * 2);
  _fxCtx.fill();
  _fxCtx.restore();
}

// ═════════════════════════════════════════════
// corals.js — 统一五排珊瑚系统
// ═════════════════════════════════════════════

var CORAL_FILES = [
  'coral-1.png','coral-2.png','coral-3.png','coral-4.png',
  'coral-5.png','coral-6.png','coral-7.png','coral-8.png',
  'coral-9.png','coral-10.png','coral-11.png','coral-12.png',
];

// 四排珊瑚容器（从远到近）
var ROW_CONTAINERS = [
  'coral-row-far',
  'coral-row-back',
  'coral-row-mid',
  'coral-layer',
];

// 四排珊瑚 Y 基线（vh），排间距从远到近递增以匹配透视
var ROW_BASE_Y = [63, 74, 85, 94];
var ROW_Y_RANGE = [1.5, 1.5, 1.5, 1.5];
var ROW_BASE_W = [160, 178, 196, 215];
var CORALS_PER_ROW = 17;
var SPACING_VW = 5.5;

// 12 个有问题的珊瑚：[排(0-3), 在该排中第几颗(0-15), 问题类型]
// 问题珊瑚分布在四排，每排选不被遮挡的位置
var PROBLEM_POSITIONS = [
  // 白化（中间区域，四排都有）
  [3, 6,  'nutrition'],
  [3, 7,  'nutrition'],
  [3, 8,  'nutrition'],
  [3, 9,  'nutrition'],
  [3, 10, 'nutrition'],
  [3, 11, 'nutrition'],
  [2, 5,  'nutrition'],
  [2, 7,  'nutrition'],
  [2, 9,  'nutrition'],
  [2, 11, 'nutrition'],
  [1, 6,  'nutrition'],
  [1, 8,  'nutrition'],
  [1, 10, 'nutrition'],
  [0, 7,  'nutrition'],
  [0, 9,  'nutrition'],
  // 左侧白化
  [3, 2,  'nutrition'],
  [3, 3,  'nutrition'],
  [3, 4,  'nutrition'],
  [3, 5,  'nutrition'],
  [2, 3,  'nutrition'],
  [2, 4,  'nutrition'],
  [2, 6,  'nutrition'],
  [1, 4,  'nutrition'],
  [1, 5,  'nutrition'],
  [1, 7,  'nutrition'],
  [0, 5,  'nutrition'],
  [0, 6,  'nutrition'],
  // 右侧白化
  [3, 12, 'nutrition'],
  [3, 13, 'nutrition'],
  [2, 12, 'nutrition'],
  [2, 13, 'nutrition'],
  [1, 11, 'nutrition'],
  [1, 12, 'nutrition'],
  [0, 11, 'nutrition'],
  // 垃圾（两侧）
  [3, 1,  'trash'],
  [3, 15, 'trash'],
  [1, 3,  'trash'],
  // 温度（两侧）
  [3, 14, 'temperature'],
  [2, 2,  'temperature'],
  [0, 13, 'temperature'],
];

var PROBLEM_LABELS = {
  nutrition:   '严重白化',
  trash:       '垃圾覆盖',
  temperature: '温度过高',
};

var PROBLEM_DESCS = {
  nutrition:   '高温和污染导致珊瑚失去共生藻，颜色变得灰白。',
  trash:       '人类丢弃的塑料袋和饮料瓶缠绕在珊瑚上，阻碍了它的呼吸。',
  temperature: '海水变暖让珊瑚承受热应激，急需降温。',
};

// 确定性伪随机（保证每次加载布局一致）
var _seed = 42;
function _srand() {
  _seed = (_seed * 16807) % 2147483647;
  return (_seed - 1) / 2147483646;
}

// 生成全部珊瑚数据
function _buildAllCorals() {
  _seed = 42;
  var all = [];
  var globalId = 0;

  // 构建问题查找表
  var problemLookup = {};
  for (var p = 0; p < PROBLEM_POSITIONS.length; p++) {
    var pp = PROBLEM_POSITIONS[p];
    problemLookup[pp[0] + '-' + pp[1]] = pp[2];
  }

  var trashIdx = 0;
  for (var r = 0; r < 4; r++) {
    for (var i = 0; i < CORALS_PER_ROW; i++) {
      globalId++;
      var posX = 5 + i * SPACING_VW + (_srand() - 0.5) * 2;
      var posY = ROW_BASE_Y[r] + (_srand() - 0.5) * ROW_Y_RANGE[r] * 2;
      var width = ROW_BASE_W[r] + (_srand() - 0.5) * 30;
      var fileIdx = Math.floor(_srand() * CORAL_FILES.length);
      var swayDur = (4.0 + _srand() * 2.0).toFixed(1) + 's';
      var pKey = r + '-' + i;
      var prob = problemLookup[pKey] || null;

      all.push({
        id: 'c-' + globalId,
        row: r,
        container: ROW_CONTAINERS[r],
        file: CORAL_FILES[fileIdx],
        posX: Math.round(posX * 10) / 10,
        posY: Math.round(posY * 10) / 10,
        swayDur: swayDur,
        width: Math.round(width),
        problem: prob,
        problemLabel: prob ? PROBLEM_LABELS[prob] : null,
        tool: prob ? (prob === 'trash' ? 'clean' : prob) : null,
        desc: prob ? PROBLEM_DESCS[prob] : null,
        trashTemplate: prob === 'trash' ? (trashIdx++) : -1,
      });
    }
  }
  return all;
}

var CORAL_DATA = _buildAllCorals();

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

  // 清空所有容器
  for (var c = 0; c < ROW_CONTAINERS.length; c++) {
    var container = document.getElementById(ROW_CONTAINERS[c]);
    if (container) container.innerHTML = '';
  }

  _applyVisualScale();

  for (var i = 0; i < CORAL_DATA.length; i++) {
    var data = CORAL_DATA[i];
    var el = _createCoralElement(data);
    var target = document.getElementById(data.container);
    if (target) target.appendChild(el);
    _corals.push({ data: data, el: el, isRepaired: false });
  }

  window.addEventListener('resize', function() {
    _applyVisualScale();
    var params = _getAdaptiveParams();
    for (var i = 0; i < _corals.length; i++) {
      var cc = _corals[i];
      cc.el.style.top = _calcCoralY(cc.data.posY) + 'vh';
      var sw = cc.data.width * params.scale;
      cc.el.style.setProperty('--coral-w', sw + 'px');
      var img = cc.el.querySelector('img');
      if (img) img.style.width = sw + 'px';
    }
  });

  return _corals;
}

function getCorals() { return _corals; }

function repairCoral(coral) {
  if (coral.isRepaired) return;
  coral.isRepaired = true;
  var el = coral.el;
  if (coral.data.problem === 'trash') {
    _removeTrashOverlay(el);
  }
  if (coral.data.problem === 'temperature') {
    _removeHeatSteam(el);
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
    if (coral.data.problem === 'trash') {
      _restoreTrashOverlay(coral.el, coral.data.trashTemplate);
    }
    if (coral.data.problem === 'temperature') {
      _removeHeatSteam(coral.el);
      _addHeatSteam(coral.el);
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

function _getVisualScale() {
  var vw = window.innerWidth;
  return Math.min(1.5, Math.max(0.9, vw / 1400));
}

function _applyVisualScale() {
  document.documentElement.style.setProperty('--coral-visual-scale', _getVisualScale());
}

function _getAdaptiveParams() {
  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var ratio = vw / vh;
  var visualScale = _getVisualScale();

  // 宽屏桌面 (16:10 及更宽 + 宽度足够)：前排从 94vh 推回到 98vh
  if (ratio >= 1.6 && vw >= 1400) return { yShift: -4, scale: 1, rowSqueeze: 1 };

  // ── 基于实际像素计算 ──

  // 1) 获取潜水艇实际占用高度
  var subImg = document.querySelector('#submarine img');
  var subW = 0;
  if (subImg) subW = subImg.offsetWidth || subImg.clientWidth;
  if (!subW) {
    if (ratio < 0.75)      subW = 120;
    else if (ratio < 1.33) subW = 160;
    else if (ratio < 1.5)  subW = 200;
    else if (ratio < 1.6)  subW = 260;
    else                   subW = 400;
  }
  var subH = subW * 1.776;
  var subBottomPx = vh * 0.02 + subH;

  // 2) 珊瑚可用区域
  var subInfluencePx = Math.min(subBottomPx, vh * 0.20);
  var coralTopPx     = subInfluencePx + 15;
  var coralBottomPx  = vh * 0.90;
  var zonePx = Math.max(coralBottomPx - coralTopPx, vh * 0.3);

  // 3) 前排目标位置（前排基线 94vh）
  var frontVh = (coralBottomPx / vh) * 100;
  var yShift  = 94 - frontVh;

  // 4) 排间压缩：31vh 基础跨度映射到可用区域
  var spanVh     = (zonePx / vh) * 100;
  var rowSqueeze = Math.min(1, spanVh / 31);

  // 5) 缩放：基于可视缩放比动态计算
  var slotPx      = zonePx / 4;
  var slotRatio   = vh < 600 ? 1.0 : 0.78;
  var maxCoralH   = slotPx * slotRatio;
  var maxCoralW   = maxCoralH / (0.75 * visualScale);
  var scale        = Math.min(1, maxCoralW / 215);
  var widthScale  = Math.max(0.28, vw / 1440);
  scale = Math.min(scale, widthScale);
  scale = Math.max(0.25, scale);

  return { yShift: yShift, scale: scale, rowSqueeze: rowSqueeze };
}

function _calcCoralY(dataY) {
  var params = _getAdaptiveParams();
  var frontBaseY = ROW_BASE_Y[3]; // 94
  var distFromFront = frontBaseY - dataY;
  var squeezedDist = distFromFront * params.rowSqueeze;
  return (frontBaseY - params.yShift) - squeezedDist;
}

function _getCoralScale() {
  return _getAdaptiveParams().scale;
}

// 垃圾素材
var TRASH_IMAGES = [
  'assets/trash/bag-1.png',       // 0
  'assets/trash/bag-2.png',       // 1
  'assets/trash/bag-3.png',       // 2
  'assets/trash/bottle-1.png',    // 3
  'assets/trash/bottle-2.png',    // 4
  'assets/trash/net-1.png',       // 5
  'assets/trash/net-2.png',       // 6
  'assets/trash/cola-1.png',      // 7
  'assets/trash/cola-2.png',      // 8
  'assets/trash/cloth-1.png',     // 9
  'assets/trash/cloth-2.png',     // 10
  'assets/trash/cloth-3.png',     // 11
  'assets/trash/string-1.png',    // 12
  'assets/trash/string-2.png',    // 13
  'assets/trash/xiguan-1.png',    // 14
  'assets/trash/xiguan-2.png',    // 15
];

var TRASH_TEMPLATES = [
  [
    { src: 0,  top: '-5%',  left: '-10%',  size: 120, rotate: -15 },
    { src: 7,  top: '5%',   left: '50%',   size: 95,  rotate: 25 },
    { src: 12, top: '15%',  left: '15%',   size: 130, rotate: 8 },
    { src: 9,  top: '30%',  left: '55%',   size: 115, rotate: -20 },
    { src: 14, top: '45%',  left: '-5%',   size: 90,  rotate: 30 },
    { src: 5,  top: '50%',  left: '40%',   size: 140, rotate: -10 },
  ],
  [
    { src: 8,  top: '-5%',  left: '40%',   size: 100, rotate: 12 },
    { src: 10, top: '10%',  left: '-10%',  size: 125, rotate: -8 },
    { src: 3,  top: '20%',  left: '50%',   size: 95,  rotate: -25 },
    { src: 13, top: '30%',  left: '5%',    size: 120, rotate: 18 },
    { src: 6,  top: '45%',  left: '45%',   size: 135, rotate: -12 },
    { src: 15, top: '55%',  left: '20%',   size: 85,  rotate: 22 },
  ],
  [
    { src: 11, top: '-5%',  left: '10%',   size: 115, rotate: -12 },
    { src: 4,  top: '5%',   left: '45%',   size: 100, rotate: 22 },
    { src: 14, top: '18%',  left: '-10%',  size: 90,  rotate: 5 },
    { src: 1,  top: '30%',  left: '50%',   size: 120, rotate: -15 },
    { src: 7,  top: '42%',  left: '10%',   size: 95,  rotate: 28 },
    { src: 12, top: '52%',  left: '45%',   size: 110, rotate: -8 },
  ],
];

function _addTrashOverlay(div, templateIdx) {
  var configs = TRASH_TEMPLATES[templateIdx % TRASH_TEMPLATES.length];
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
  setTimeout(function() {
    var remaining = el.querySelectorAll('.trash-overlay');
    for (var j = 0; j < remaining.length; j++) {
      remaining[j].remove();
    }
  }, 800);
}

function _restoreTrashOverlay(el, templateIdx) {
  var old = el.querySelectorAll('.trash-overlay');
  for (var i = 0; i < old.length; i++) old[i].remove();
  _addTrashOverlay(el, templateIdx);
}

function _addHeatSteam(div) {
  var steamCount = 5;
  for (var i = 0; i < steamCount; i++) {
    var steam = document.createElement('div');
    steam.className = 'heat-steam';
    steam.style.left = (15 + Math.random() * 70) + '%';
    steam.style.top = (Math.random() * 40) + '%';
    steam.style.setProperty('--steam-dur', (1.5 + Math.random() * 1.5) + 's');
    steam.style.setProperty('--steam-delay', (Math.random() * 2) + 's');
    div.appendChild(steam);
  }
}

function _removeHeatSteam(el) {
  var steams = el.querySelectorAll('.heat-steam');
  for (var i = 0; i < steams.length; i++) steams[i].remove();
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
  var scaledWidth = data.width * _getCoralScale();
  div.style.setProperty('--coral-w', scaledWidth + 'px');

  var img = new Image();
  img.src = 'assets/coral-group/' + data.file;
  img.style.width = scaledWidth + 'px';

  img.onerror = function() {
    div.removeChild(img);
    var span = document.createElement('span');
    span.style.cssText = 'display:block;font-size:' + (data.width * 0.8) + 'px;line-height:1;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.5));';
    span.textContent = '🪸';
    div.appendChild(span);
  };

  div.appendChild(img);

  if (data.problem === 'trash') {
    _addTrashOverlay(div, data.trashTemplate);
  }

  if (data.problem === 'temperature') {
    _addHeatSteam(div);
  }

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
// main.js
// ═════════════════════════════════════════════

var _activeTool = 'detect';
var _speechTimer = null;
var _highlightedCoral = null;

var _highlightedParent = null;
var _highlightedParentZ = null;
var _healingInProgress = false;

var _highlightedOrigLeft = null;
var _highlightedOrigTop = null;

function highlightCoral(coralEl) {
  unhighlightCoral();
  // 保存原始位置
  _highlightedOrigLeft = coralEl.style.left;
  _highlightedOrigTop = coralEl.style.top;
  // 移到珊瑚群中间（屏幕底部居中）
  coralEl.style.left = '50vw';
  coralEl.style.top = '98vh';
  coralEl.classList.add('detect-highlight');
  _highlightedCoral = coralEl;
  var parent = coralEl.parentElement;
  if (parent) {
    _highlightedParent = parent;
    _highlightedParentZ = parent.style.zIndex;
    parent.style.zIndex = '999';
  }
}

function unhighlightCoral() {
  if (_highlightedCoral) {
    // 恢复原始位置
    if (_highlightedOrigLeft !== null) {
      _highlightedCoral.style.left = _highlightedOrigLeft;
      _highlightedCoral.style.top = _highlightedOrigTop;
      _highlightedOrigLeft = null;
      _highlightedOrigTop = null;
    }
    _highlightedCoral.classList.remove('detect-highlight');
    _highlightedCoral = null;
  }
  if (_highlightedParent) {
    _highlightedParent.style.zIndex = _highlightedParentZ || '';
    _highlightedParent = null;
    _highlightedParentZ = null;
  }
}

// Bootstrap
initEffects();
initCorals(onCoralClick);
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
    playSfxButton();
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
  if (_healingInProgress) return;
  if (_activeTool === 'detect') {
    if (coral.isRepaired) {
      showSpeechBubble('提示', MESSAGES.alreadyRepaired, coral.el);
      speak('alreadyRepaired');
    } else {
      highlightCoral(coral.el);
      var msg = MESSAGES.detect[coral.data.problem];
      showSpeechBubble('探测结果', msg, coral.el);
      speak('detect_' + coral.data.problem);
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
    showSpeechBubble('提示', MESSAGES.alreadyRepaired, coral.el);
    speak('alreadyRepaired');
    return;
  }
  var expectedProblem = TOOL_PROBLEM_MAP[tool];
  if (!expectedProblem) return;
  if (expectedProblem !== coral.data.problem) {
    showSpeechBubble('提示', MESSAGES.wrongTool, coral.el);
    speak('wrongTool');
    shakeToolbar();
    return;
  }
  if (coral.data.problem === 'nutrition') {
    _playNutritionHeal(coral);
  } else if (coral.data.problem === 'trash') {
    _playTrashClean(coral);
  } else if (coral.data.problem === 'temperature') {
    _playTemperatureCool(coral);
  }
}

function _checkAllDone() {
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

function _playNutritionHeal(coral) {
  var el = coral.el;
  var HEAL_DUR = 3000;
  _healingInProgress = true;

  // 创建健康图层（原图无 grayscale）覆盖在白化图上方
  var origImg = el.querySelector('img');
  var healthLayer = document.createElement('div');
  healthLayer.className = 'nutrition-healthy-layer';
  var healthImg = origImg.cloneNode(true);
  healthImg.style.filter = 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))';
  healthLayer.appendChild(healthImg);
  el.appendChild(healthLayer);

  el.classList.add('nutrition-healing');

  // 生成滴落水滴
  var rect = el.getBoundingClientRect();
  var dripCount = 8;
  var drips = [];
  for (var i = 0; i < dripCount; i++) {
    var drip = document.createElement('div');
    drip.className = 'nutri-drip';
    var leftPct = 15 + Math.random() * 70;
    drip.style.left = leftPct + '%';
    drip.style.top = '-10px';
    var dripDist = rect.height * 0.8 + Math.random() * rect.height * 0.3;
    drip.style.setProperty('--drip-dist', dripDist + 'px');
    drip.style.setProperty('--drip-delay', (i * 0.3 + Math.random() * 0.2) + 's');
    drip.style.setProperty('--drip-dur', (1.2 + Math.random() * 0.6) + 's');
    el.appendChild(drip);
    drips.push(drip);
  }

  playSfxNutrition();

  // 颜色完全恢复后
  setTimeout(function() {
    el.classList.remove('nutrition-healing');
    for (var i = 0; i < drips.length; i++) drips[i].remove();
    healthLayer.remove();

    repairCoral(coral);
    playSfxFeather();
    showSpeechBubble('修复成功 ✨', MESSAGES.repair.nutrition, el);
    speak('repair_nutrition');

    // 延迟后再缩回原始大小
    setTimeout(function() {
      unhighlightCoral();
      _healingInProgress = false;
      _checkAllDone();
    }, 800);
  }, HEAL_DUR + 500);
}

function _playTrashClean(coral) {
  var el = coral.el;
  _healingInProgress = true;
  el.classList.add('trash-cleaning');

  // 添加刷子
  var brush = document.createElement('div');
  brush.className = 'sweep-brush';
  brush.textContent = '🧹';
  el.appendChild(brush);

  playSfxClean();

  // 逐个扫走垃圾
  var trashItems = el.querySelectorAll('.trash-overlay');
  var count = trashItems.length;
  var interval = 600;

  for (var i = 0; i < count; i++) {
    (function(idx) {
      setTimeout(function() {
        trashItems[idx].classList.add('swept-away');
      }, interval * (idx + 1));
    })(i);
  }

  // 全部扫完后
  var totalDur = interval * (count + 1) + 600;
  setTimeout(function() {
    brush.remove();
    el.classList.remove('trash-cleaning');

    // 移除垃圾 DOM
    for (var i = 0; i < trashItems.length; i++) trashItems[i].remove();

    repairCoral(coral);
    unhighlightCoral();
    _healingInProgress = false;

    playSfxFeather();
    showSpeechBubble('修复成功 ✨', MESSAGES.repair.trash, el);
    speak('repair_trash');
    _checkAllDone();
  }, totalDur);
}

function _playTemperatureCool(coral) {
  var el = coral.el;
  var COOL_DUR = 3000;
  _healingInProgress = true;

  playSfxSnowWind();
  playRepairEffect(el, 'temperature');

  // 热气逐渐消失
  var steams = el.querySelectorAll('.heat-steam');
  for (var i = 0; i < steams.length; i++) {
    (function(s, idx) {
      setTimeout(function() {
        s.style.animation = 'none';
        s.style.opacity = '0';
        s.style.transition = 'opacity 0.5s ease';
      }, idx * 400);
    })(steams[i], i);
  }

  el.classList.add('temp-cooling');

  setTimeout(function() {
    el.classList.remove('temp-cooling');
    repairCoral(coral);

    playSfxFeather();
    showSpeechBubble('修复成功 ✨', MESSAGES.repair.temperature, el);
    speak('repair_temperature');

    setTimeout(function() {
      unhighlightCoral();
      _healingInProgress = false;
      _checkAllDone();
    }, 800);
  }, COOL_DUR + 500);
}

function openInfoPanel(coral) {
  document.getElementById('panel-emoji').textContent   = '🪸';
  document.getElementById('panel-name').textContent    = coral.data.problemLabel || '';
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

function showSpeechBubble(title, text, coralEl) {
  document.getElementById('speech-title').textContent = title;
  document.getElementById('speech-text').textContent  = text;
  var bubble = document.getElementById('speech-bubble');

  // 定位到珊瑚上方
  if (coralEl) {
    var rect = coralEl.getBoundingClientRect();
    var bw = 240;
    var cx = rect.left + rect.width / 2;
    var left = cx - bw / 2;
    // 边界保护
    if (left < 10) left = 10;
    if (left + bw > window.innerWidth - 10) left = window.innerWidth - bw - 10;
    var top = rect.top - 20;
    // 如果太靠上则放到珊瑚下方
    if (top < 60) top = rect.bottom + 15;

    bubble.style.left = left + 'px';
    bubble.style.top  = top + 'px';
    bubble.style.right = 'auto';
    bubble.style.transform = 'translateY(-100%)';

    // 小三角指向珊瑚
    var arrowLeft = cx - left;
    arrowLeft = Math.max(20, Math.min(bw - 20, arrowLeft));
    bubble.style.setProperty('--arrow-left', arrowLeft + 'px');
  } else {
    // 无珊瑚时默认右上角
    bubble.style.left = 'auto';
    bubble.style.right = '20px';
    bubble.style.top = '72px';
    bubble.style.transform = 'none';
  }

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
