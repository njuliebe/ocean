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
export const CORAL_DATA = [
  // {
  //   id: 'brain',
  //   name: '脑珊瑚',
  //   emoji: '🪸',
  //   problem: 'nutrition',
  //   problemLabel: '营养不良 / 白化',
  //   desc: '长期缺乏营养，珊瑚虫失去了共生藻，颜色变得灰白。',
  //   tool: 'nutrition',
  //   healthyColor: '粉红色',
  //   posX: 18, posY: 92,
  //   swayDur: '3.8s',
  //   width: 195,
  // },
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
    coral.isRepaired = false;
    coral.el.setAttribute('data-problem', coral.data.problem);
    coral.el.classList.remove('repaired');
  }
}

/** 已修复数量 */
export function getRepairedCount() {
  return _corals.filter(c => c.isRepaired).length;
}

// ─────────────────────────────────────────────
// 内部：创建珊瑚 DOM 元素
// ─────────────────────────────────────────────

function _createCoralElement(data) {
  const div = document.createElement('div');
  div.className = 'coral-item';
  div.dataset.id = data.id;
  div.dataset.problem = data.problem;
  div.style.left = data.posX + 'vw';
  div.style.top  = data.posY + 'vh';
  div.style.setProperty('--sway-dur', data.swayDur);
  div.style.setProperty('--coral-w', data.width + 'px');
  div.title = data.name;

  // 尝试用 PNG 图片，失败则降级为大 emoji
  const img = new Image();
  img.src = `assets/corals/${data.id}.png`;
  img.alt = data.name;
  img.style.width = data.width + 'px';

  img.onerror = () => {
    // 降级：用 emoji 渲染
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

  // 点击事件
  div.addEventListener('click', (e) => {
    e.stopPropagation();
    const coral = _corals.find(c => c.data.id === data.id);
    if (coral && _onCoralClick) _onCoralClick(coral);
  });

  return div;
}
