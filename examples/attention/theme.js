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
  },
  fonts: {
    sans: 'PingFang SC',
    latin: 'Helvetica Neue',
    latinLight: 'Helvetica Neue Light',
    mono: 'Menlo',
  },
  fontPairs: { 'PingFang SC': 'Helvetica Neue' }, // regular weight only — see typography.md
  // Default ground; pages pick a texture lit from where their visual center is (parts.room).
  backgroundImages: { paper: 'assets/room-center.jpg' },
  grid: { margin: { x: 0.85, top: 0.75, bottom: 0.6 }, cols: 12, gutter: 0.22 },
  type: {
    display: { font: 'sans', size: 60, leading: 1.15, color: 'ink' },
    statement: { font: 'sans', size: 36, leading: 1.3, color: 'ink' },
    title: { font: 'sans', size: 26, leading: 1.3, color: 'ink' },
    lead: { font: 'sans', size: 20, leading: 1.5, color: 'graphite' },
    body: { font: 'sans', size: 15, leading: 1.55, color: 'graphite' },
    label: { font: 'sans', size: 11, leading: 1.3, tracking: 12, color: 'stone' },
    caption: { font: 'sans', size: 11, leading: 1.5, color: 'stone' },
    word: { font: 'latin', size: 24, leading: 1.2, color: 'stone' },
    letter: { font: 'latinLight', size: 60, leading: 1, color: 'ink' },
    number: { font: 'latinLight', size: 110, leading: 1, tracking: -2, color: 'accent' },
    math: { font: 'STIX Two Math', size: 22, leading: 1.2, color: 'graphite' },
  },
  chart: { series: ['accent', 'stone'] },
  transition: 'fade',
};
