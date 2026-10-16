// S04 — 搭配：人文编辑（宋体 + Palatino Linotype）
const { pairing } = require('../parts');

module.exports = {
  id: 'S04',
  title: '人文编辑',
  rhythm: 'anchor',
  notes: `人文编辑：标题用宋体，只在大字号用；数字、引文和标签用 Palatino Linotype，斜体的引文是这一组的味道。正文仍用微软雅黑，因为宋体在小字号投影时发虚。适合历史、人物、文化类的主题。`,
  build(k) {
    pairing(k, {
      name: '人文编辑',
      use: '宋体只做大字，西文与数字交给 Palatino · 适合历史、人物、文化',
      fonts: { label: 'palatino', title: 'simsun', body: 'sans', number: 'palatino', latin: 'palatino' },
      title: { size: 48, tracking: 4 },
      quote: { italic: true, size: 18 },
      label: { size: 12, tracking: 16 },
      roles: '标题 SimSun · 正文 Microsoft YaHei · 数字、引文与标签 Palatino Linotype',
    });
  },
};
