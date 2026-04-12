/**
 * main.js — 入口模块
 * 初始化各子系统，协调工具栏、珊瑚交互、进度、UI 反馈
 */

import { initOcean } from './ocean.js';
import { initCorals, getCorals, repairCoral, resetCorals, getRepairedCount, TOOL_PROBLEM_MAP } from './corals.js';
import { initEffects, playRepairEffect, playCelebration } from './effects.js';
import { speak, MESSAGES } from './audio.js';

// ─────────────────────────────────────────────
// 全局状态
// ─────────────────────────────────────────────
let _activeTool = 'detect';
let _speechTimer = null;

// ─────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────

initEffects();
initCorals(onCoralClick);
initToolbar();

// 等视频就绪后隐藏 loading
const loadingEl = document.getElementById('loading');
initOcean().then(() => {
  loadingEl.classList.add('fade-out');
  setTimeout(() => {
    loadingEl.style.display = 'none';
    speak('welcome');
  }, 800);
});

// 关闭完成面板
document.getElementById('completion-close').addEventListener('click', () => {
  document.getElementById('completion-overlay').classList.add('hidden');
});

// 再玩一次
document.getElementById('replay-btn').addEventListener('click', () => {
  resetCorals();
  updateProgress();
  document.getElementById('completion-overlay').classList.add('hidden');
  document.getElementById('info-panel').classList.add('hidden');
  setTimeout(() => speak('welcome'), 400);
});

// 信息面板关闭
document.getElementById('panel-close').addEventListener('click', () => {
  document.getElementById('info-panel').classList.add('hidden');
});

// 点击背景关闭信息面板
document.addEventListener('click', (e) => {
  const panel = document.getElementById('info-panel');
  if (!panel.classList.contains('hidden') && !panel.contains(e.target)) {
    panel.classList.add('hidden');
  }
});

// ─────────────────────────────────────────────
// 工具栏初始化
// ─────────────────────────────────────────────

function initToolbar() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeTool = btn.dataset.tool;
      document.getElementById('info-panel').classList.add('hidden');
    });
  });
}

// ─────────────────────────────────────────────
// 珊瑚点击处理（主交互逻辑）
// ─────────────────────────────────────────────

function onCoralClick(coral) {
  if (_activeTool === 'detect') {
    const msg = MESSAGES.detect[coral.data.id];
    showSpeechBubble('探测结果', msg);
    speak(`detect_${coral.data.id}`);
    return;
  }

  // 没有工具模式（info 面板模式）或 直接点击 → 打开信息面板
  // 实际上工具选中后也可以打开面板判断是否正确
  if (_activeTool === null) {
    openInfoPanel(coral);
    return;
  }

  // 工具模式：直接尝试修复
  tryRepair(coral, _activeTool);
}

// ─────────────────────────────────────────────
// 尝试修复
// ─────────────────────────────────────────────

function tryRepair(coral, tool) {
  if (coral.isRepaired) {
    showSpeechBubble('提示', MESSAGES.alreadyRepaired);
    speak('alreadyRepaired');
    return;
  }

  const expectedProblem = TOOL_PROBLEM_MAP[tool];
  if (!expectedProblem) return;

  if (expectedProblem !== coral.data.problem) {
    showSpeechBubble('提示', MESSAGES.wrongTool);
    speak('wrongTool');
    shakeToolbar();
    return;
  }

  // 修复成功
  repairCoral(coral);
  playRepairEffect(coral.el, coral.data.problem);

  showSpeechBubble('修复成功 ✨', MESSAGES.repair[coral.data.id]);
  speak(`repair_${coral.data.id}`);

  updateProgress();

  const total = getCorals().length;
  const done  = getRepairedCount();
  if (done === total) {
    setTimeout(() => {
      playCelebration();
      speak('allDone');
    }, 600);
    setTimeout(() => {
      document.getElementById('completion-overlay').classList.remove('hidden');
    }, 2200);
  }
}

// ─────────────────────────────────────────────
// 信息面板（直接点击模式 B）
// ─────────────────────────────────────────────

function openInfoPanel(coral) {
  document.getElementById('panel-emoji').textContent   = coral.data.emoji;
  document.getElementById('panel-name').textContent    = coral.data.name;
  document.getElementById('panel-problem').textContent = coral.data.problemLabel;
  document.getElementById('panel-desc').textContent    = coral.data.desc;

  // 工具按钮行
  const toolsEl = document.getElementById('panel-tools');
  toolsEl.innerHTML = '';

  const toolDefs = [
    { tool: 'nutrition',   icon: '💧', label: '营养液' },
    { tool: 'clean',       icon: '🧹', label: '清理'   },
    { tool: 'temperature', icon: '🌡️', label: '调温'   },
  ];

  for (const def of toolDefs) {
    const btn = document.createElement('button');
    btn.className = 'panel-tool-btn ' + (def.tool === coral.data.tool && !coral.isRepaired ? 'correct' : 'wrong');
    btn.innerHTML = `<span class="btn-icon">${def.icon}</span><span>${def.label}</span>`;

    if (def.tool === coral.data.tool && !coral.isRepaired) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('info-panel').classList.add('hidden');
        tryRepair(coral, def.tool);
      });
    }

    toolsEl.appendChild(btn);
  }

  document.getElementById('info-panel').classList.remove('hidden');
}

// ─────────────────────────────────────────────
// UI 辅助函数
// ─────────────────────────────────────────────

function showSpeechBubble(title, text) {
  document.getElementById('speech-title').textContent = title;
  document.getElementById('speech-text').textContent  = text;
  const bubble = document.getElementById('speech-bubble');
  bubble.classList.remove('hidden');

  if (_speechTimer) clearTimeout(_speechTimer);
  _speechTimer = setTimeout(() => {
    bubble.classList.add('hidden');
  }, 4000);
}

function updateProgress() {
  const total   = getCorals().length;
  const repaired = getRepairedCount();
  const pct = total > 0 ? (repaired / total) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent  = `${repaired}/${total}`;
}

function shakeToolbar() {
  const tb = document.getElementById('toolbar');
  tb.classList.add('shake');
  setTimeout(() => tb.classList.remove('shake'), 420);
}
