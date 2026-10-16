// Design tokens — the machine-readable half of 02-design/design.md. Change tokens here, not in slides.
// Starting values: the 'Paper & Ink' palette and the editorial pairing from the cross-platform list in typography.md
// (SimSun for large Chinese, Palatino Linotype for numbers, Latin and labels; examples/fonts S04). Replace them with
// the confirmed design.
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
    accent: 'B4442B',    // vermilion — the one accent; give every colour a job
    glow: 'E4DCCB',      // k.light colour (on a light ground: a slightly warmer, brighter paper)
    // One world per deck: for a dark deck, make paper itself dark — don't mix light and dark pages.
  },
  // 'cross-platform': the deck is shown on other computers, Windows included; only fonts from the list in
  // typography.md. 'mac': shown from your own Mac with PowerPoint; any font PowerPoint for Mac can use.
  target: 'cross-platform',
  fonts: {
    serif: 'SimSun',              // large Chinese only: thin strokes go faint at small sizes
    sans: 'Microsoft YaHei',      // body text; Chinese inside Latin runs falls back to it
    latin: 'Palatino Linotype',   // numbers (lining), Latin words, labels, quotes in italic
    mono: 'Consolas',
  },
  // Latin glyphs inside runs set in the key font are rendered with the value font.
  fontPairs: { SimSun: 'Palatino Linotype' }, // SimSun's own Latin letters are thin and plain — see typography.md
  grid: { margin: { x: 0.85, top: 0.75, bottom: 0.6 }, cols: 12, gutter: 0.22 },
  type: {
    display: { font: 'serif', size: 66, leading: 1.12, tracking: 3, color: 'ink' },
    statement: { font: 'serif', size: 44, leading: 1.3, tracking: 4, color: 'ink' },
    title: { font: 'sans', size: 26, leading: 1.3, color: 'ink' },
    lead: { font: 'sans', size: 20, leading: 1.55, color: 'graphite' },
    body: { font: 'sans', size: 15, leading: 1.6, color: 'graphite' },
    quote: { font: 'latin', size: 18, leading: 1.4, italic: true, color: 'graphite' },
    label: { font: 'latin', size: 11, leading: 1.3, tracking: 12, color: 'stone' },
    caption: { font: 'sans', size: 11, leading: 1.5, color: 'stone' },
    number: { font: 'latin', size: 120, leading: 1, tracking: -2, color: 'ink' },
    math: { font: 'Cambria Math', size: 30, leading: 1.2, color: 'ink' },
  },
  chart: { series: ['accent', 'stone'] },
  transition: 'fade',
};
