// S05 — 搭配：学术严谨（微软雅黑粗体 + Cambria）
const { pairing } = require('../parts');

module.exports = {
  id: 'S05',
  title: '学术严谨',
  rhythm: 'anchor',
  notes: `学术严谨：标题用微软雅黑粗体，数字和西文用 Cambria，公式用同一家族的 Cambria Math，正文里的公式和数字气质一致。适合论文报告、课程、研究类的主题。`,
  build(k) {
    pairing(k, {
      name: '学术严谨',
      use: '粗体标题，Cambria 统一数字、西文和公式 · 适合论文报告、课程、研究',
      fonts: { label: 'cambria', title: 'sans', body: 'sans', number: 'cambria', latin: 'cambria' },
      title: { size: 42, bold: true },
      quote: { italic: true },
      roles: '标题 Microsoft YaHei 粗体 · 正文 Microsoft YaHei · 数字与西文 Cambria（公式 Cambria Math）',
    });
  },
};
