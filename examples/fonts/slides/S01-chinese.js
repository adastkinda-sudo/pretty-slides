// S01 — 中文字体：八种中文字体各一行，同一句话
const { heading, row } = require('../parts');

const SAMPLE = '一个世界，一种光 Aa Rr 1984';
const FONTS = [
  ['sans', 'Microsoft YaHei', '微软雅黑 · 所有 Windows', true],
  ['yaheiLight', 'Microsoft YaHei Light', '微软雅黑细体 · 所有 Windows'],
  ['simsun', 'SimSun', '宋体 · 所有 Windows'],
  ['dengxian', 'DengXian', '等线 · 中文版 Windows', true],
  ['dengxianLight', 'DengXian Light', '等线细体 · 中文版 Windows'],
  ['simhei', 'SimHei', '黑体 · 中文版 Windows'],
  ['kaiti', 'KaiTi', '楷体 · 中文版 Windows'],
  ['fangsong', 'FangSong', '仿宋 · 中文版 Windows'],
];

module.exports = {
  id: 'S01',
  title: '中文字体',
  rhythm: 'dense',
  textOnly: true,
  notes: `跨平台清单里的八种中文字体。前三种所有 Windows 都有；后五种只有中文版 Windows 默认装有。微软雅黑和等线有真正的粗体（每行最后两个字），其他字体的粗体是软件加粗的。在 Windows 上打开时，和 renders/S01.png 对照：字形不一样的那一行，就是这台电脑上没有这个字体。`,
  build(k) {
    heading(k, '中文字体', '跨平台清单 · 每行用该字体排同一句话；所有 Windows 都有的可以放心用，只有中文版 Windows 有的要先确认放映电脑');
    FONTS.forEach(([font, name, tag, bold], i) => {
      row(k, {
        x: k.M.x, y: 1.6 + i * 0.66, nameW: 2.6, sampleW: 8.6, font, size: 28, label: name, tag,
        sample: bold ? [SAMPLE, { text: '　粗体', bold: true }] : SAMPLE,
      });
    });
  },
};
