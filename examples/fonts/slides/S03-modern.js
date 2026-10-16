// S03 — 搭配：现代清晰（微软雅黑细体 + Calibri Light）
const { pairing } = require('../parts');

module.exports = {
  id: 'S03',
  title: '现代清晰',
  rhythm: 'anchor',
  notes: `现代清晰：大字用微软雅黑细体，靠尺度而不是字重取得分量；数字用 Calibri Light，和细体标题是同一种轻。适合产品、设计、科技类的主题。`,
  build(k) {
    pairing(k, {
      name: '现代清晰',
      use: '尺度代替字重：大而细的标题，细的数字 · 适合产品、设计、科技',
      fonts: { label: 'calibri', title: 'yaheiLight', body: 'sans', number: 'calibriLight', latin: 'calibriLight' },
      title: { size: 50 },
      roles: '标题 Microsoft YaHei Light · 正文 Microsoft YaHei · 数字与西文 Calibri Light · 标签 Calibri',
    });
  },
};
