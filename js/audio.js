/**
 * audio.js — MP3 文件播放（童声 TTS 预生成）
 */

// 文案保留供 UI 气泡显示用
export const MESSAGES = {
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

// 文案 key → MP3 路径映射
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

let _current = null;

export function speak(key) {
  const src = AUDIO_FILES[key];
  if (!src) return;

  if (_current) {
    _current.pause();
    _current.currentTime = 0;
  }
  _current = new Audio(src);
  _current.play().catch(() => {});
}
