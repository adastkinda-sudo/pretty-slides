// Font specimens: every font of the cross-platform list (typography.md) and five pairings of them.
module.exports = {
  name: 'Font Specimens',
  size: { w: 13.333, h: 7.5 },
  lang: 'zh-CN',
  target: 'cross-platform',
  background: 'paper',
  colors: {
    paper: 'F4F2ED',
    paperDeep: 'E9E6DE',
    ink: '1B1B1A',
    graphite: '4B4A46',
    stone: '6F6C65',
    hairline: 'D3CFC5',
    accent: 'B4442B',
    glow: 'E4DCCB',
  },
  // Every font of the list under a short role name; the slides name fonts by these roles.
  fonts: {
    sans: 'Microsoft YaHei', yaheiLight: 'Microsoft YaHei Light', simsun: 'SimSun',
    dengxian: 'DengXian', dengxianLight: 'DengXian Light', simhei: 'SimHei', kaiti: 'KaiTi', fangsong: 'FangSong',
    calibri: 'Calibri', calibriLight: 'Calibri Light', corbel: 'Corbel', candara: 'Candara', arial: 'Arial',
    arialBlack: 'Arial Black', verdana: 'Verdana', trebuchet: 'Trebuchet MS', tahoma: 'Tahoma',
    franklin: 'Franklin Gothic Medium', palatino: 'Palatino Linotype', cambria: 'Cambria', georgia: 'Georgia',
    constantia: 'Constantia', times: 'Times New Roman', consolas: 'Consolas', courier: 'Courier New',
    math: 'Cambria Math', symbol: 'Segoe UI Symbol',
  },
  grid: { margin: { x: 0.85, top: 0.75, bottom: 0.6 }, cols: 12, gutter: 0.22 },
  type: {
    heading: { font: 'sans', size: 20, leading: 1.3, color: 'ink' },
    meta: { font: 'sans', size: 10.5, leading: 1.3, color: 'stone' },
    name: { font: 'sans', size: 11, leading: 1.3, color: 'graphite' },
    plain: { font: 'sans', size: 16, leading: 1.5, color: 'ink' }, // base for text set in a named font
  },
  transition: 'fade',
};
