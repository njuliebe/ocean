/**
 * corals.js — 珊瑚数据、HTML 元素管理、状态机
 *
 * 每个珊瑚是一个 <div class="coral-item"> 叠在 Three.js canvas 之上。
 * 生病态由 CSS filter（data-problem 属性）实现。
 * 修复后移除 data-problem，应用 CSS transition 恢复正常颜色。
 */

// ─────────────────────────────────────────────
// 珊瑚静态数据
// ─────────────────────────────────────────────
// 珊瑚礁：12 个珊瑚组成，其中部分有问题需要修复
export const CORAL_DATA = [
  { id: 'coral-1',  problem: null, file: 'coral-1.png',  posX: 3,  posY: 98, swayDur: '5.0s', width: 150 },
  { id: 'coral-2',  problem: null, file: 'coral-2.png',  posX: 12, posY: 97, swayDur: '4.6s', width: 165 },
  { id: 'coral-3',  problem: null, file: 'coral-3.png',  posX: 20, posY: 96, swayDur: '4.2s', width: 190 },
  { id: 'coral-4',  problem: 'nutrition', problemLabel: '严重白化',
    desc: '高温和污染导致珊瑚失去共生藻，颜色变得灰白。', tool: 'nutrition',
    file: 'coral-4.png',  posX: 30, posY: 96, swayDur: '4.8s', width: 175 },
  { id: 'coral-5',  problem: null, file: 'coral-5.png',  posX: 37, posY: 99, swayDur: '5.5s', width: 130 },
  { id: 'coral-6',  problem: 'trash', problemLabel: '垃圾覆盖',
    desc: '人类丢弃的塑料袋和饮料瓶缠绕在珊瑚上，阻碍了它的呼吸。', tool: 'clean',
    file: 'coral-6.png',  posX: 44, posY: 95, swayDur: '4.0s', width: 185 },
  { id: 'coral-7',  problem: null, file: 'coral-7.png',  posX: 52, posY: 97, swayDur: '5.8s', width: 260 },
  { id: 'coral-8',  problem: 'temperature', problemLabel: '温度过高',
    desc: '海水变暖让珊瑚承受热应激，急需降温。', tool: 'temperature',
    file: 'coral-8.png',  posX: 62, posY: 95, swayDur: '4.3s', width: 175 },
  { id: 'coral-9',  problem: null, file: 'coral-9.png',  posX: 70, posY: 96, swayDur: '4.7s', width: 160 },
  { id: 'coral-10', problem: null, file: 'coral-10.png', posX: 78, posY: 96, swayDur: '4.1s', width: 170 },
  { id: 'coral-11', problem: 'trash', problemLabel: '污泥覆盖',
    desc: '底部沉积物和垃圾覆盖了珊瑚，让它无法进行光合作用。', tool: 'clean',
    file: 'coral-11.png', posX: 86, posY: 96, swayDur: '4.5s', width: 170 },
  { id: 'coral-12', problem: null, file: 'coral-12.png', posX: 94, posY: 97, swayDur: '5.1s', width: 175 },
];

// 工具 → 珊瑚 problem 的映射
export const TOOL_PROBLEM_MAP = {
  nutrition:   'nutrition',
  clean:       'trash',
  temperature: 'temperature',
};

// ─────────────────────────────────────────────
// 运行时状态（每局游戏）
// ─────────────────────────────────────────────
// corals[i] = { data, el, isRepaired }
let _corals = [];
let _onCoralClick = null; // 外部注册的回调

// ─────────────────────────────────────────────
// 公共 API
// ─────────────────────────────────────────────

/**
 * 初始化珊瑚层，创建 HTML 元素
 * @param {(coral) => void} onCoralClick 点击珊瑚的回调
 */
export function initCorals(onCoralClick) {
  _onCoralClick = onCoralClick;
  _corals = [];

  const layer = document.getElementById('coral-layer');
  layer.innerHTML = '';

  for (const data of CORAL_DATA) {
    const el = _createCoralElement(data);
    layer.appendChild(el);

    _corals.push({ data, el, isRepaired: false });
  }

  return _corals;
}

/** 返回运行时珊瑚列表（只读引用） */
export function getCorals() {
  return _corals;
}

/** 修复某颗珊瑚：移除 data-problem，添加 repaired class */
export function repairCoral(coral) {
  if (coral.isRepaired) return;
  coral.isRepaired = true;

  const el = coral.el;
  // 移除生病状态（触发 CSS transition 恢复滤镜）
  el.removeAttribute('data-problem');
  // 短暂高亮脉冲
  el.classList.add('repaired');
  setTimeout(() => el.classList.remove('repaired'), 1100);
}

/** 重置所有珊瑚到初始状态（再玩一次） */
export function resetCorals() {
  for (const coral of _corals) {
    if (!coral.data.problem) continue; // 装饰珊瑚跳过
    coral.isRepaired = false;
    coral.el.setAttribute('data-problem', coral.data.problem);
    coral.el.classList.remove('repaired');
  }
}

/** 需要修复的珊瑚总数 */
export function getProblemCount() {
  return _corals.filter(c => c.data.problem).length;
}

/** 已修复数量 */
export function getRepairedCount() {
  return _corals.filter(c => c.data.problem && c.isRepaired).length;
}

// ─────────────────────────────────────────────
// 内部：创建珊瑚 DOM 元素
// ─────────────────────────────────────────────

function _createCoralElement(data) {
  const div = document.createElement('div');
  div.className = 'coral-item';
  if (!data.problem) div.classList.add('decorative');
  div.dataset.id = data.id;
  if (data.problem) div.dataset.problem = data.problem;
  div.style.left = data.posX + 'vw';
  div.style.top  = data.posY + 'vh';
  div.style.setProperty('--sway-dur', data.swayDur);
  div.style.setProperty('--coral-w', data.width + 'px');
  div.title = data.name;

  const img = new Image();
  img.src = `assets/coral-group/${data.file}`;
  img.alt = data.name;
  img.style.width = data.width + 'px';

  img.onerror = () => {
    div.removeChild(img);
    const span = document.createElement('span');
    span.style.cssText = `
      display: block;
      font-size: ${data.width * 0.8}px;
      line-height: 1;
      filter: drop-shadow(0 8px 20px rgba(0,0,0,0.5));
    `;
    span.textContent = data.emoji;
    div.appendChild(span);
  };

  div.appendChild(img);

  // 有问题的珊瑚才需要点击交互
  if (data.problem) {
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      const coral = _corals.find(c => c.data.id === data.id);
      if (coral && _onCoralClick) _onCoralClick(coral);
    });
  }

  return div;
}
