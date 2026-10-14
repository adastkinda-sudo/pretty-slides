// Direction B — 暗场热图. Source: researchers see attention as heatmaps on a dark screen.
// The whole deck is a dark viewing room; the matrix is the light source. Amber heat ramp is the only color.
module.exports = {
  name: 'Dark Heatmap',
  size: { w: 13.333, h: 7.5 },
  lang: 'zh-CN',
  background: 'paper',
  colors: {
    paper: '17151A',     // the room: warm charcoal, never flat black
    paperDeep: '221F24', // cold cells, quiet fields
    ink: 'F2F0EB',
    graphite: 'C9C5BD',
    stone: '9C978E',
    hairline: '3A3936',
    accent: 'F0A93B',    // amber: the heat
    hot: 'FFE2A6',       // the hottest cell
    ember: '6B2A16',     // ramp midpoint
  },
  fonts: {
    sans: 'PingFang SC',
    sansLight: 'PingFang SC Light',
    sansMedium: 'PingFang SC Medium',
    serif: 'Helvetica Neue Light', // the probe slide code asks for 'serif' letters; this direction answers with light sans
    latin: 'Helvetica Neue',
    latinLight: 'Helvetica Neue Light',
    mono: 'Menlo',
  },
  fontPairs: { 'PingFang SC': 'Helvetica Neue', 'PingFang SC Light': 'Helvetica Neue Light' },
  grid: { margin: { x: 0.85, top: 0.75, bottom: 0.6 }, cols: 12, gutter: 0.22 },
  type: {
    display: { font: 'sansLight', size: 64, leading: 1.1, tracking: -1, color: 'ink' },
    statement: { font: 'sansLight', size: 44, leading: 1.3, color: 'ink' },
    title: { font: 'sansMedium', size: 26, leading: 1.3, color: 'ink' },
    lead: { font: 'sansLight', size: 20, leading: 1.55, color: 'graphite' },
    body: { font: 'sans', size: 15, leading: 1.6, color: 'graphite' },
    label: { font: 'sansMedium', size: 11, leading: 1.3, tracking: 14, color: 'stone' },
    caption: { font: 'sans', size: 11, leading: 1.5, color: 'stone' },
    number: { font: 'latinLight', size: 120, leading: 1, tracking: -3, color: 'ink' },
    math: { font: 'STIX Two Math', size: 30, leading: 1.2, color: 'ink' },
  },
  // Grain + a soft light falloff: the matrix is the light source of the room (engine/texture.js --light).
  backgroundImages: { paper: 'assets/room.jpg' },
  chart: { series: ['accent', 'stone'] },
  transition: 'fade',
};
