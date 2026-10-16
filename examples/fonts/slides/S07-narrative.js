// S07 — 搭配：叙事引文（楷体 + 等线 + Georgia；需要中文版 Windows）
const { pairing } = require('../parts');

module.exports = {
  id: 'S07',
  title: '叙事引文',
  rhythm: 'anchor',
  notes: `叙事引文：标题用楷体，像手写的话；正文用等线，比微软雅黑更清秀；数字用 Georgia 的旧式数字，有书页的感觉。楷体和等线只有中文版 Windows 默认装有，用之前要确认放映电脑。适合故事、回忆、人物访谈类的主题。`,
  build(k) {
    pairing(k, {
      name: '叙事引文（需要中文版 Windows）',
      use: '楷体像手写的话，等线清秀，Georgia 的旧式数字像书页 · 适合故事、回忆、访谈',
      fonts: { label: 'georgia', title: 'kaiti', body: 'dengxian', number: 'georgia', latin: 'georgia' },
      title: { size: 46 },
      quote: { italic: true, size: 18 },
      roles: '标题 KaiTi · 正文 DengXian · 数字、引文与标签 Georgia（旧式数字）',
    });
  },
};
