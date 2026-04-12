/**
 * app.js — 合并后的单文件（无 ES module，支持 file:// 直接打开）
 */

// ═════════════════════════════════════════════
// audio.js
// ═════════════════════════════════════════════

const MESSAGES = {
  detect: {
    brain:   '这颗脑珊瑚营养不足，颜色都变白了！需要用营养液帮助它恢复活力哦！',
    staghorn:'这颗鹿角珊瑚完全白化了！快用营养液救救它吧！',
    seafan:  '这颗海扇珊瑚被垃圾覆盖啦！用清理工具把垃圾清除掉吧！',
    pillar:  '这颗柱状珊瑚周围水温太高了！快用调温工具降温吧！',
    mushroom:'这颗蘑菇珊瑚被污泥覆盖了！用清理工具帮它清洁吧！',
  },
  repair: {
    brain:   '脑珊瑚恢复粉红色了，太棒啦！',
    staghorn:'鹿角珊瑚变红了，好漂亮！',
    seafan:  '海扇珊瑚的垃圾清除干净了，太好了！',
    pillar:  '柱状珊瑚降温成功，恢复青绿色啦！',
    mushroom:'蘑菇珊瑚洗干净了，金黄色真好看！',
  },
  wrongTool:      '这个工具不对哦，换一个试试吧！',
  alreadyRepaired:'这颗珊瑚已经恢复健康了，去看看其他珊瑚吧！',
  allDone:        '恭喜你！所有珊瑚都恢复健康啦！你是最棒的珊瑚守护者！',
  welcome:        '欢迎来到珊瑚守护者！选一个工具，然后点击珊瑚探索吧！',
};

const AUDIO_FILES = {
  welcome:         'audio/welcome.mp3',
  wrongTool:       'audio/wrongTool.mp3',
  alreadyRepaired: 'audio/alreadyRepaired.mp3',
  allDone:         'audio/allDone.mp3',
  detect_brain:    'audio/detect_brain.mp3',
  detect_staghorn: 'audio/detect_staghorn.mp3',
  detect_seafan:   'audio/detect_seafan.mp3',
  detect_pillar:   'audio/detect_pillar.mp3',
  detect_mushroom: 'audio/detect_mushroom.mp3',
  repair_brain:    'audio/repair_brain.mp3',
  repair_staghorn: 'audio/repair_staghorn.mp3',
  repair_seafan:   'audio/repair_seafan.mp3',
  repair_pillar:   'audio/repair_pillar.mp3',
  repair_mushroom: 'audio/repair_mushroom.mp3',
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

  // 垃圾 emoji 四散飞走（5个）
  var trashEmoji = ['🗑️', '🛍️', '🥤', '🧴', '🪣'];
  for (var i = 0; i < 5; i++) {
    var angle = -Math.PI * 0.2 + (i / 4) * Math.PI * 0.4 - Math.PI / 2;
    var speed = 3 + Math.random() * 3;
    particles.push({
      emoji: trashEmoji[i],
      x: cx + (Math.random() - 0.5) * rect.width * 0.4,
      y: cy + (Math.random() - 0.3) * rect.height * 0.3,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed - 1,
      life: 1.0,
      decay: 0.01,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      isEmoji: true,
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
    } else if (p.isEmoji) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // 轻微重力
      if (p.rotation !== undefined) p.rotation += p.rotSpeed;
      _fxCtx.save();
      _fxCtx.globalAlpha = Math.max(0, p.life);
      _fxCtx.translate(p.x, p.y);
      if (p.rotation) _fxCtx.rotate(p.rotation);
      _fxCtx.font = '28px serif';
      _fxCtx.fillText(p.emoji, -14, 14);
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
  {
    id: 'staghorn',
    name: '鹿角珊瑚',
    emoji: '🪸',
    problem: 'nutrition',
    problemLabel: '严重白化',
    desc: '高温和污染导致鹿角珊瑚完全失去颜色，已完全白化。',
    tool: 'nutrition',
    healthyColor: '鲜红色',
    posX: 15, posY: 95,
    swayDur: '4.5s',
    width: 165,
  },
  {
    id: 'seafan',
    name: '海扇珊瑚',
    emoji: '🌿',
    problem: 'trash',
    problemLabel: '垃圾覆盖',
    desc: '人类丢弃的塑料袋和饮料瓶缠绕在珊瑚上，阻碍了它的呼吸。',
    tool: 'clean',
    healthyColor: '紫色',
    posX: 37, posY: 96,
    swayDur: '5.2s',
    width: 210,
  },
  {
    id: 'pillar',
    name: '柱状珊瑚',
    emoji: '🏛️',
    problem: 'temperature',
    problemLabel: '温度过高',
    desc: '海水变暖让珊瑚承受热应激，泛出红色，急需降温。',
    tool: 'temperature',
    healthyColor: '青绿色',
    posX: 57, posY: 94,
    swayDur: '4.0s',
    width: 173,
  },
  {
    id: 'mushroom',
    name: '蘑菇珊瑚',
    emoji: '🍄',
    problem: 'trash',
    problemLabel: '污泥覆盖',
    desc: '底部沉积物和垃圾覆盖了蘑菇珊瑚，让它无法进行光合作用。',
    tool: 'clean',
    healthyColor: '金黄色',
    posX: 77, posY: 95,
    swayDur: '3.5s',
    width: 180,
  },
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
  el.removeAttribute('data-problem');
  el.classList.add('repaired');
  setTimeout(function() { el.classList.remove('repaired'); }, 1100);
}

function resetCorals() {
  for (var i = 0; i < _corals.length; i++) {
    var coral = _corals[i];
    coral.isRepaired = false;
    coral.el.setAttribute('data-problem', coral.data.problem);
    coral.el.classList.remove('repaired');
  }
}

function getRepairedCount() {
  var count = 0;
  for (var i = 0; i < _corals.length; i++) {
    if (_corals[i].isRepaired) count++;
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

function _createCoralElement(data) {
  var div = document.createElement('div');
  div.className = 'coral-item';
  div.dataset.id = data.id;
  div.dataset.problem = data.problem;
  div.style.left = data.posX + 'vw';
  div.style.top  = _calcCoralY(data.posY) + 'vh';
  div.style.setProperty('--sway-dur', data.swayDur);
  div.style.setProperty('--coral-w', data.width + 'px');
  div.title = data.name;

  var img = new Image();
  img.src = 'assets/corals/' + data.id + '.png';
  img.alt = data.name;
  img.style.width = data.width + 'px';

  img.onerror = function() {
    div.removeChild(img);
    var span = document.createElement('span');
    span.style.cssText = 'display:block;font-size:' + (data.width * 0.8) + 'px;line-height:1;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.5));';
    span.textContent = data.emoji;
    div.appendChild(span);
  };

  div.appendChild(img);

  div.addEventListener('click', function(e) {
    e.stopPropagation();
    var coral = _corals.find(function(c) { return c.data.id === data.id; });
    if (coral && _onCoralClick) _onCoralClick(coral);
  });

  return div;
}

// ═════════════════════════════════════════════
// main.js
// ═════════════════════════════════════════════

var _activeTool = 'detect';
var _speechTimer = null;

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

function initToolbar() {
  document.querySelectorAll('.tool-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tool-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _activeTool = btn.dataset.tool;
      document.getElementById('info-panel').classList.add('hidden');
    });
  });
}

function onCoralClick(coral) {
  if (_activeTool === 'detect') {
    var msg = MESSAGES.detect[coral.data.id];
    showSpeechBubble('探测结果', msg);
    speak('detect_' + coral.data.id);
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
  showSpeechBubble('修复成功 ✨', MESSAGES.repair[coral.data.id]);
  speak('repair_' + coral.data.id);
  updateProgress();

  var total = getCorals().length;
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
  var total   = getCorals().length;
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
