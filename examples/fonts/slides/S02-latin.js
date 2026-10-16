// S02 — 西文字体：十九种西文字体，两栏，同一行字
const { heading, row } = require('../parts');

const SAMPLE = 'Insanely great 1984';
const LEFT = [
  ['calibri', 'Calibri'], ['calibriLight', 'Calibri Light'], ['corbel', 'Corbel', '旧式数字'], ['candara', 'Candara', '旧式数字'],
  ['arial', 'Arial'], ['arialBlack', 'Arial Black'], ['verdana', 'Verdana'], ['trebuchet', 'Trebuchet MS'], ['tahoma', 'Tahoma'],
  ['franklin', 'Franklin Gothic Medium'],
];
const RIGHT = [
  ['palatino', 'Palatino Linotype'], ['cambria', 'Cambria'], ['georgia', 'Georgia', '旧式数字'], ['constantia', 'Constantia', '旧式数字'],
  ['times', 'Times New Roman'], ['consolas', 'Consolas', '等宽', 'const year = 1984;'], ['courier', 'Courier New', '等宽', 'const year = 1984;'],
  ['math', 'Cambria Math', '公式', '√x  ∑ aᵢ  α ≤ β  ∞'], ['symbol', 'Segoe UI Symbol', '符号', '↑  →  ✓  ★  ←  ↓'],
];

module.exports = {
  id: 'S02',
  title: '西文字体',
  rhythm: 'dense',
  textOnly: true,
  notes: `跨平台清单里的十九种西文字体，所有 Windows 都有，Mac 版 PowerPoint 也有。左栏是无衬线，右栏是衬线、等宽、公式和符号。标了旧式数字的四种，数字有高有低、像小写字母，适合正文里的年份，不适合做大号数字。在 Windows 上打开时，和 renders/S02.png 对照。`,
  build(k) {
    heading(k, '西文字体', '跨平台清单 · 左栏无衬线，右栏衬线、等宽、公式与符号；Corbel、Candara、Georgia、Constantia 是旧式数字，高低错落');
    const col = (list, x) => list.forEach(([font, name, tag, sample], i) => {
      row(k, { x, y: 1.6 + i * 0.52, nameW: 2.1, sampleW: 3.6, font, size: 20, label: name, note: tag, sample: sample || SAMPLE });
    });
    col(LEFT, k.M.x);
    col(RIGHT, 6.95);
  },
};
