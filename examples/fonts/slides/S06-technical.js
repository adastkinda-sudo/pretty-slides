// S06 — 搭配：精确技术（微软雅黑 + Franklin Gothic Medium + Consolas）
const { pairing } = require('../parts');

module.exports = {
  id: 'S06',
  title: '精确技术',
  rhythm: 'anchor',
  notes: `精确技术：数字用 Franklin Gothic Medium，紧凑、有力；标签和英文用等宽的 Consolas，像代码和终端里的文字。适合工程、数据、开发类的主题。`,
  build(k) {
    pairing(k, {
      name: '精确技术',
      use: '紧凑有力的数字，等宽的标签与英文 · 适合工程、数据、开发',
      fonts: { label: 'consolas', title: 'sans', body: 'sans', number: 'franklin', latin: 'consolas' },
      title: { size: 44, bold: true },
      label: { tracking: 4 },
      roles: '标题 Microsoft YaHei 粗体 · 正文 Microsoft YaHei · 数字 Franklin Gothic Medium · 标签与英文 Consolas',
    });
  },
};
