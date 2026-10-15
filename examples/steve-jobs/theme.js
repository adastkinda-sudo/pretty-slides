// 空房间 — 1982 年那间几乎空着的客厅：一面暖白灰泥墙、一条踢脚线、一块浅橡木地板、窗外照进来的一束太阳光。
// 每一页都是同一间房间：墙、地板、光不变，只有太阳在移动（一生从早晨走到黄昏），房间里只放一件东西。
// The room itself is assets/room.jpg and the sun is assets/sun/<ID>.png, both rendered by room.py from room.json and
// rooms/<ID>.json (one camera, one window); the objects, the lifeline and all text are native shapes.
// Object materials (Mac beige, iPhone glass…) live in each objects/<name>.js, not here: this file is the room and the type.
module.exports = {
  name: 'The Empty Room',
  size: { w: 13.333, h: 7.5 },
  lang: 'zh-CN',
  background: 'paper',
  colors: {
    paper: 'F1ECE3',     // the wall: warm white plaster (in shade)
    paperDeep: 'E3D5BC', // the floor: light oak
    ink: '26231F',       // text written on the wall; the current point (13:1 on the wall)
    graphite: '4E4842',  // his words, secondary text (7.7:1)
    stone: '5E574D',     // labels, years, captions — also on the floor (6.1:1 wall, 4.9:1 floor)
    hairline: 'C9BBA0',  // lines drawn on the floor: the lifeline, ticks, hollow points (a darker oak)
    seam: 'B9AA8E',      // the current lifeline and leader lines
    link: '0057B0',      // the one colour that means something: a connection seen only looking back (5.9:1 wall, 4.8:1 floor)
    glow: 'FBF4E6',      // k.light: the warm, bounced light around whatever the sun falls on
    // what is shown on a screen (Mac, iPhone): its paper, its ink, the hairlines that measure it
    screen: 'F6F5EF', screenInk: '1E1D1B', screenRule: 'A7A298',
  },
  fonts: {
    serif: 'Songti SC',        // titles: the room's voice
    sans: 'PingFang SC',       // facts, labels
    latin: 'Helvetica Neue',
    latinMedium: 'Helvetica Neue Medium',
    roman: 'Hoefler Text',     // his name; his words in the original (Apple's own serif, 1991)
    italic: 'Hoefler Text',
    mono: 'Monaco',            // the 1984 Macintosh's monospaced face
  },
  fontPairs: { 'PingFang SC': 'Helvetica Neue', 'Songti SC': 'Hoefler Text' },
  backgroundImages: { paper: 'assets/room.jpg' },
  grid: { margin: { x: 0.9, top: 0.7, bottom: 0.55 }, cols: 12, gutter: 0.22 },
  type: {
    display: { font: 'roman', size: 72, leading: 1.0, tracking: -1, color: 'ink' },
    headline: { font: 'serif', size: 40, leading: 1.25, tracking: 0, color: 'ink' },
    voice: { font: 'serif', size: 22, leading: 1.3, color: 'graphite' },
    voiceEn: { font: 'italic', size: 17, leading: 1.4, italic: true, color: 'graphite' },
    lead: { font: 'sans', size: 20, leading: 1.5, color: 'graphite' },
    body: { font: 'sans', size: 16, leading: 1.55, color: 'graphite' },
    label: { font: 'sans', size: 11, leading: 1.3, tracking: 4, color: 'stone' },
    year: { font: 'latinMedium', size: 11, leading: 1.2, tracking: 8, color: 'stone' },
    caption: { font: 'sans', size: 11, leading: 1.45, color: 'stone' },
    number: { font: 'roman', size: 200, leading: 1.0, tracking: -2, color: 'ink' },
    screenMono: { font: 'mono', size: 26, leading: 1.0, color: 'screenInk' },
    screenProp: { font: 'roman', size: 26, leading: 1.0, color: 'screenInk' },
  },
  chart: { series: ['ink', 'stone'] },
  transition: { type: 'morph', duration: 1200 },
};
