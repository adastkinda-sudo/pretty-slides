// S04 — 数据：一个大数字 + 原生可编辑折线图
const N = [512, 1024, 2048, 4096, 8192];
module.exports = {
  id: 'S04',
  rhythm: 'dense',
  title: '平方代价',
  notes: '注意力矩阵是 n×n：序列长度翻倍，计算与显存约变为 4 倍。图中为相对量（以 n=512 为 1）。',
  build(k) {
    require('../parts').frame(k, { section: '01', name: '按内容检索' });
    k.text('序列长度翻倍，代价变为四倍', { style: 'title', ...k.span(1, 8), y: k.M.top });

    k.text('4×', { style: 'number', color: 'accent', ...k.span(1, 4), y: 2.2, overlap: true }); // numeral glyphs fill ~70% of the line box
    k.text('注意力矩阵大小为 n × n，\n长度每翻一倍，计算量约乘以 4。', { style: 'body', ...k.span(1, 4), y: 4.15 });

    const area = k.span(6, 12);
    k.text('相对计算量（n = 512 时为 1）', { style: 'label', x: area.x, y: 1.95, w: area.w });
    k.chart('line', [
      { name: 'O(n²)', labels: N.map(String), values: N.map((n) => (n / 512) ** 2) },
      { name: 'O(n)', labels: N.map(String), values: N.map((n) => n / 512) },
    ], { x: area.x - 0.1, y: 2.3, w: area.w + 0.1, h: 4.1, markers: true, lineSize: 2.25, format: '0' });
    k.text('O(n²)', { style: 'caption', color: 'accent', x: k.W - k.M.x - 0.6, y: 2.25, w: 0.6, align: 'right' });
    k.text('O(n)', { style: 'caption', x: k.W - k.M.x - 0.6, y: 5.75, w: 0.6, align: 'right' });
    k.text('序列长度 n', { style: 'caption', x: area.x, y: 6.5, w: area.w, align: 'right' });
  },
};
