// Design tokens — the machine-readable half of 02-design/design.md. Change tokens here, not in slides.
// Starting values copied from examples/attention (the 'Paper & Ink' palette). Replace them with the confirmed design.
module.exports = {
  name: 'Paper & Ink',
  size: { w: 13.333, h: 7.5 },
  lang: 'zh-CN',
  background: 'paper',
  colors: {
    paper: 'F4F2ED',     // warm off-white page
    paperDeep: 'E9E6DE', // quiet secondary field
    ink: '1B1B1A',       // primary text
    graphite: '4B4A46',  // secondary text
    stone: '6F6C65',     // labels, captions (≥4.5:1 on paper)
    hairline: 'D3CFC5',  // rules, axes
    accent: 'B4442B',    // vermilion — the only chromatic color; ≤ 10% of any page
    night: '151514',     // dark pages
    nightText: 'EDEAE3',
    nightMuted: 'A19D94', // secondary text on night
  },
  fonts: {
    serif: 'Songti SC',
    serifLight: 'Songti SC Light',
    sans: 'PingFang SC',
    sansLight: 'PingFang SC Light',
    sansMedium: 'PingFang SC Medium',
    latin: 'Helvetica Neue',
    latinLight: 'Helvetica Neue Light',
    mono: 'Menlo',
  },
  // Latin glyphs inside runs set in the key font are rendered with the value font.
  fontPairs: { 'PingFang SC': 'Helvetica Neue', 'PingFang SC Light': 'Helvetica Neue Light' },
  grid: { margin: { x: 0.85, top: 0.75, bottom: 0.6 }, cols: 12, gutter: 0.22 },
  type: {
    display: { font: 'serif', size: 66, leading: 1.12, tracking: 0, color: 'ink' },
    statement: { font: 'serif', size: 44, leading: 1.3, color: 'ink' },
    title: { font: 'sansMedium', size: 26, leading: 1.3, color: 'ink' },
    lead: { font: 'sansLight', size: 20, leading: 1.55, color: 'graphite' },
    body: { font: 'sans', size: 15, leading: 1.6, color: 'graphite' },
    label: { font: 'sansMedium', size: 11, leading: 1.3, tracking: 12, color: 'stone' },
    caption: { font: 'sans', size: 11, leading: 1.5, color: 'stone' },
    number: { font: 'latinLight', size: 120, leading: 1, tracking: -3, color: 'ink' },
    math: { font: 'STIX Two Math', size: 30, leading: 1.2, color: 'ink' },
  },
  chart: { series: ['accent', 'stone'] },
  transition: 'fade',
};
