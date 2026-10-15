// S09 — 并置对照：两块屏幕站在同一条线上。左边，光外：1970 年代末的单色显示器，Apple II 的命令行——一行字、一个光标；
// 右边，光里：施乐 PARC 的 Alto，竖着的、像一张纸的屏幕：重叠的窗口、图标、弹出菜单、一个指针（Smalltalk 的样子，示意）。
// 视觉中心：阳光里的 Alto 屏幕。→ S10：Alto 的显示器（Morph 名 obj-mac）变成 Macintosh。
const { sun, place, lifeline, linksBefore, marks } = require('../parts');

module.exports = {
  id: 'S09',
  title: '施乐 PARC',
  rhythm: 'dense',
  transition: 'morph',
  notes: `1979 年 12 月，乔布斯带着几个人参观了施乐公司的帕洛阿尔托研究中心，PARC。
先看左边。这是当时的个人电脑——包括他们自己的 Apple II——在屏幕上的样子：一片黑，一行字，一个光标。你要记住命令，一个字母一个字母地打进去，比如 CATALOG，看看磁盘里有什么。
（单击 1）然后，他在 PARC 看到了右边这个。施乐的 Alto：屏幕竖着放，像一张纸，白底黑字。上面有可以叠在一起的窗口，有小图标，有弹出来的菜单，还有一个跟着鼠标移动的指针。你不用记命令，看见什么，指着它就行。
他后来形容那一刻，像是蒙在眼睛上的布被揭开了：他确信，所有的电脑将来都会这样工作。（这是转述，不是原话。）
（单击 2）但施乐自己没有把它做成产品。乔布斯回去以后，带着团队把它变成了 Lisa，然后是 Macintosh——就是下一页。
口头补充：施乐的研究员 Larry Tesler 给他们做了演示；剪切、复制、粘贴这些词，也是在 PARC 定下来的。
说明：两块屏幕里的内容是示意。左边按 Apple II 的 40 列文本、] 提示符绘制；右边按 Alto 上 Smalltalk 的样子（窗口的标签、浏览器、弹出菜单、绘图工具、箭头指针）重画，不是截图；Alto 的屏幕是 606 × 808 像素、约 8⅝ × 11 英寸的竖屏，机箱尺寸为估计。
来源：[2] Isaacson《史蒂夫·乔布斯传》；[21] Computer History Museum；Alto Hardware Manual，1979。`,
  build(k) {
    sun(k);
    marks(k, { part: '二　车库', date: '1979.12　Xerox PARC' });
    lifeline(k, { current: '1979', links: linksBefore('S09') });

    // ── left, out of the sun: the command line ──
    const m = place(k, 'cli');
    const r = m.raster, cw = r.w / 40, lh = r.h / 24;
    const pt = cw / 0.6 * 72;
    k.text(']CATALOG', { style: 'screenMono', size: +pt.toFixed(2), color: 'screen', x: r.x, y: r.y + lh * 1 - 0.01, w: cw * 12, nowrap: true, overlap: true });
    k.rect({ x: r.x + cw * 8, y: r.y + lh * 1 + lh * 0.12, w: cw * 0.95, h: lh * 0.8, fill: 'screen' });

    // ── right, in the sun: the graphical interface (Smalltalk on the Alto, redrawn — 示意) ──
    const a = place(k, 'gui');   // the display stands there from the start (its shadow is in the sun image); its picture comes on click 1
    k.light({ cx: a.cx, cy: a.y + a.h * 0.42, r: 3.0, strength: 0.45 });
    gui(k, a.raster, 1);

    // what each screen is, on the floor in front of it
    k.text('命令行', { style: 'label', tracking: 0, x: m.x, y: m.bottom + 0.1, w: 1.2, nowrap: true });
    k.text('图形界面', { style: 'label', tracking: 0, x: a.x, y: a.bottom + 0.1, w: 1.2, nowrap: true });

    k.text('1979 年，他看见了电脑将来的样子。', { style: 'headline', x: k.M.x, y: 0.95, w: 10, nowrap: true });
    k.text('施乐自己没有把它做成产品。', { style: 'lead', x: k.M.x, y: 1.78, w: 5, nowrap: true, build: 2 });
    return a;
  },
};

// The Alto's screen as Smalltalk drew it, on a 300 × 400 grid (the Alto's 606 × 808 pixels, halved so the parts read
// at slide size): overlapping windows with their title tabs, a class browser, a painting with its tool icons, a
// pop-up menu, the arrow pointer. Black on white, like paper.
function gui(k, R, build) {
  const u = R.w / 300;
  const X = (x) => R.x + x * u, Y = (y) => R.y + y * u;
  const ink = 'screenInk', paper = 'screen';
  const font = 'Helvetica Neue';
  const fs = 7.2 * u * 72 * 0.98;             // a 7-unit line of text, in points
  const T = (s, x, y, { w = 80, ...o } = {}) => k.text(s, { style: 'caption', font, size: +fs.toFixed(2), leading: 1.0, color: ink, x: X(x), y: Y(y) - fs / 72 * 0.12, w: w * u, nowrap: true, overlap: true, build, ...o });
  // white on black (title tabs, the selected line): the text box is the black box itself, so its centre sits on it
  const Inv = (s, x0, y0, x1, y1, pad = 3) => k.text(s, { style: 'caption', font, size: +fs.toFixed(2), leading: 0.8, color: paper, x: X(x0 + pad), y: Y(y0), w: (x1 - x0 - pad) * u, h: (y1 - y0) * u, valign: 'middle', nowrap: true, overlap: true, build });
  const box = (x0, y0, x1, y1, o = {}) => k.rect({ x: X(x0), y: Y(y0), w: (x1 - x0) * u, h: (y1 - y0) * u, build, ...o });
  const hl = (x0, y, x1, w = 0.5) => k.line({ x1: X(x0), y1: Y(y), x2: X(x1), y2: Y(y), color: ink, weight: w, build });
  const vl = (x, y0, y1, w = 0.5) => k.line({ x1: X(x), y1: Y(y0), x2: X(x), y2: Y(y1), color: ink, weight: w, build });

  // the screen's background: a light grey (the Alto's dither, seen from a distance)
  box(0, 0, 300, 400, { fill: k.mix(paper, 'screenRule', 0.22) });

  // window 1, behind: a class browser
  const tab = (x0, y0, label, w) => { box(x0, y0, x0 + w, y0 + 10, { fill: ink }); Inv(label, x0, y0, x0 + w, y0 + 10); };
  tab(12, 26, 'Class Browser', 64);
  box(12, 36, 228, 214, { fill: paper, line: ink, lineW: 0.75 });
  vl(84, 36, 118); vl(156, 36, 118); hl(12, 118, 228);
  ['Graphics', 'Kernel', 'Text', 'Windows'].forEach((s, i) => T(s, 16, 40 + i * 10));
  ['Form', 'Point', 'Rectangle', 'Pen'].forEach((s, i) => {
    if (i === 2) { box(85, 39 + i * 10, 155.5, 48.5 + i * 10, { fill: ink }); Inv(s, 85, 39 + i * 10, 155.5, 48.5 + i * 10); } else T(s, 88, 40 + i * 10);
  });
  ['area', 'center', 'corner', 'intersect:'].forEach((s, i) => T(s, 160, 40 + i * 10));
  ['intersect: aRectangle', '   ↑ Rectangle', '      origin: (origin max: aRectangle origin)', '      corner: (corner min: aRectangle corner)'].forEach((s, i) => T(s, 16, 124 + i * 10, { w: 200 }));

  // window 2, in front: a painting, with its tools as small pictures down the left side
  tab(118, 168, 'Painting', 44);
  box(118, 178, 288, 352, { fill: paper, line: ink, lineW: 0.75 });
  vl(136, 178, 352);
  const tools = [
    () => k.dot({ cx: X(127), cy: Y(189), r: 2.6 * u, fill: paper, build }),                       // brush (selected)
    () => k.line({ x1: X(122), y1: Y(207), x2: X(132), y2: Y(197), color: ink, weight: 0.75, build }),   // line
    () => box(122, 211, 132, 219, { line: ink, lineW: 0.6 }),                                       // rectangle
    () => k.dot({ cx: X(127), cy: Y(229), r: 4.4 * u, line: ink, lineW: 0.6, build }),              // oval
    () => T('A', 124, 237.5, { w: 8 }),                                                             // text
  ];
  box(120, 182, 134, 196, { fill: ink });
  tools.forEach((f) => f());
  // the picture: a sun over a line of hills, a few brush strokes
  k.dot({ cx: X(240), cy: Y(222), r: 17 * u, line: ink, lineW: 1, build });
  k.shape('custGeom', {
    x: X(140), y: Y(258), w: 144 * u, h: 40 * u, line: k.color(ink), lineW: 1.25, build,
    points: [{ x: 0, y: 30 * u, moveTo: true }, { x: 40 * u, y: 6 * u, curve: { type: 'cubic', x1: 14 * u, y1: 30 * u, x2: 24 * u, y2: 6 * u } },
      { x: 92 * u, y: 24 * u, curve: { type: 'cubic', x1: 58 * u, y1: 6 * u, x2: 72 * u, y2: 26 * u } },
      { x: 144 * u, y: 4 * u, curve: { type: 'cubic', x1: 112 * u, y1: 22 * u, x2: 126 * u, y2: 4 * u } }],
  });
  [[150, 314, 196, 322], [158, 328, 236, 334], [204, 318, 270, 326]].forEach(([x0, y0, x1, y1]) => k.line({ x1: X(x0), y1: Y(y0), x2: X(x1), y2: Y(y1), color: ink, weight: 1, build }));

  // the pop-up menu over the browser, "cut" under the pointer
  const my = 110;
  box(170, my, 214, my + 54, { fill: paper, line: ink, lineW: 0.75 });
  ['again', 'copy', 'cut', 'paste', 'doit'].forEach((s, i) => {
    const y0 = my + 2 + i * 10;
    if (i === 2) { box(171, y0, 213, y0 + 10, { fill: ink }); Inv(s, 171, y0, 213, y0 + 10, 5); } else T(s, 176, y0 + 1.5, { w: 36 });
  });
  // the arrow pointer (black, with a white edge so it reads on black and white alike)
  const tip = [204, my + 27];
  const arrow = [[0, 0], [0, 17], [4.2, 13], [7.4, 19.6], [10, 18.4], [6.9, 12], [12.2, 12]];
  k.shape('custGeom', {
    x: X(tip[0]), y: Y(tip[1]), w: 12.2 * u, h: 19.6 * u, fill: k.color(ink), line: k.color(paper), lineW: 0.6, build,
    points: [...arrow.map(([x, y]) => ({ x: x * u, y: y * u })), { close: true }],
  });
}
