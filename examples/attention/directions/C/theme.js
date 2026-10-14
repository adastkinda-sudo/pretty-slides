// Direction C — 符号海报. Source: the notation itself (Q, K, V, softmax) is the subject's own visual system.
// Swiss poster logic: giant grotesque letters, cobalt color fields, strict grid, signal red for the one thing that matters.
module.exports = {
  name: 'Notation Poster',
  size: { w: 13.333, h: 7.5 },
  lang: 'zh-CN',
  background: 'paper',
  colors: {
    paper: 'F3F1EA',
    paperDeep: 'E6E3D8',
    ink: '111111',
    graphite: '3D3D3D',
    stone: '666666',
    hairline: 'CFCCC2',
    accent: 'E2412B',     // signal red: large type and shapes only (3.7:1 on paper)
    field: '1B3FA0',      // cobalt field pages
    fieldText: 'F3F1EA',
    fieldMuted: 'B7C3E6',
  },
  fonts: {
    sans: 'PingFang SC',
    latin: 'Helvetica Neue',
    latinMedium: 'Helvetica Neue Medium',
    latinBold: 'Helvetica Neue Bold',
    mono: 'Menlo',
  },
  fontPairs: { 'PingFang SC': 'Helvetica Neue' }, // regular weight only — see typography.md
  grid: { margin: { x: 0.7, top: 0.6, bottom: 0.55 }, cols: 12, gutter: 0.2 },
  type: {
    glyph: { font: 'latinBold', size: 300, leading: 1, tracking: -4, color: 'ink' },
    display: { font: 'sans', bold: true, size: 54, leading: 1.15, tracking: -1, color: 'ink' },
    title: { font: 'sans', bold: true, size: 28, leading: 1.3, color: 'ink' },
    lead: { font: 'sans', size: 19, leading: 1.5, color: 'graphite' },
    body: { font: 'sans', size: 15, leading: 1.55, color: 'graphite' },
    label: { font: 'latinMedium', size: 11, leading: 1.3, tracking: 10, color: 'stone' },
    caption: { font: 'sans', size: 11, leading: 1.5, color: 'stone' },
    letter: { font: 'latinBold', size: 100, leading: 1, tracking: -2, color: 'ink' },
    math: { font: 'STIX Two Math', size: 20, leading: 1.2, color: 'ink' },
  },
  chart: { series: ['accent', 'ink'] },
  transition: 'fade',
};
