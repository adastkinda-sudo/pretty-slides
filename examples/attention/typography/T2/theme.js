// Design tokens — "暗室之光": attention is light finding pattern in a dark, lawless room.
// One world for the whole deck: warm charcoal with grain, lit by whatever the page is about. Amber heat is the only color.
module.exports = {
  name: 'Light in the Dark',
  size: { w: 13.333, h: 7.5 },
  lang: 'zh-CN',
  background: 'paper',
  colors: {
    paper: '17151A',     // the room: warm charcoal, never flat black
    paperDeep: '221F24', // unlit cells
    ink: 'F2F0EB',
    graphite: 'C9C5BD',
    stone: '9C978E',     // unlit words, labels (6.2:1 on paper)
    hairline: '3A3936',  // faint links
    accent: 'F0A93B',    // amber: attention, light
    hot: 'FFE2A6',       // the brightest point on a page
    ember: '6B2A16',     // dim heat
    glow: '4A3820',      // the light pool on each page's focus (k.light)
  },
  fonts: {
    head: 'PingFang SC',
    sans: 'PingFang SC',
    latin: 'DIN Alternate',
    latinLight: 'DIN Condensed',
    label: 'DIN Alternate',
    mono: 'Menlo',
  },
  fontPairs: { 'PingFang SC': 'DIN Alternate' }, // family names only
  // The room: base + very fine grain + darkened corners. The light itself is a shape (k.light) on each page's focus,
  // so it can glide between pages with Morph.
  backgroundImages: { paper: 'assets/room.jpg' },
  grid: { margin: { x: 0.85, top: 0.75, bottom: 0.6 }, cols: 12, gutter: 0.22 },
  type: {
    display: { font: 'head', size: 58, leading: 1.15, color: 'ink' },
    statement: { font: 'sans', size: 36, leading: 1.3, color: 'ink' },
    title: { font: 'head', size: 26, leading: 1.3, color: 'ink' },
    lead: { font: 'sans', size: 20, leading: 1.5, color: 'graphite' },
    body: { font: 'sans', size: 15, leading: 1.55, color: 'graphite' },
    label: { font: 'label', size: 11, leading: 1.3, tracking: 16, color: 'stone' },
    caption: { font: 'sans', size: 11, leading: 1.5, color: 'stone' },
    word: { font: 'latin', size: 24, leading: 1.2, color: 'stone' },
    letter: { font: 'latinLight', size: 62, leading: 1, color: 'ink' },
    number: { font: 'latinLight', size: 140, leading: 1, color: 'accent' },
    math: { font: 'STIX Two Math', size: 22, leading: 1.2, color: 'graphite' },
  },
  chart: { series: ['accent', 'stone'] },
  transition: { type: 'morph', duration: 1400 }, // every page: the light glides to the next focus
};
