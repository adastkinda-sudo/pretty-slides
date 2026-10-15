// S05 — 主体 + 旁注（解剖）：墙上写着一对 300pt 的 Hoefler Text 字母 A v——一个真实需要调字距的字偶——
// 像练习纸上的字：基线、x 高度线、大写线从画面一边画到另一边（只此一页）。一条引线指向 A 脚上的衬线，
// 一条尺寸线量出 A 与 v 之间的字距；早晨 9 点的光落在这段字距上。视觉中心：光里的两个字母之间的那块空白。
// 字母是原生形状（按字体轮廓逐点画出），不是文本框：这样字距、基线和尺寸线在 PowerPoint 与预览里都分毫不差。
// Morph 自 S04（立面淡出）；生命线：1972 成为当前。
const { sun, lifeline, marks, leader, glyph, AV } = require('../parts');

const { UPM, KERN, XH, CAP, G } = AV;

module.exports = {
  id: 'S05',
  title: '一门没用的课',
  rhythm: 'dense',
  transition: 'morph',
  notes: `1972 年，他进了俄勒冈州的 Reed College。学费几乎花光了养父母一辈子的积蓄。读了六个月，他看不出这有什么意义，就退学了。
退学以后，他没有离开学校，又待了大约 18 个月：睡在朋友宿舍的地板上，捡可乐瓶换 5 美分的押金买吃的，每个星期天走 7 英里，到城另一头的 Hare Krishna 寺庙吃一顿好饭。
因为不用再上必修课，他去旁听了一门书法课。
（指着墙上的字）他学的就是这些：衬线和无衬线；不同字母组合之间的距离怎样调整；好的字体为什么好。
（单击 1）这是衬线：字母笔画末端那一小段收笔。这是字距：A 和 v 之间的空白。A 的右边是一条斜线，v 的左边也是一条斜线，如果按每个字母自己的宽度排，它们之间会空出一大块；好的字体会把 v 往里收一点，让两个字母之间的空白看起来和别的字母之间一样匀。墙上这一对，就是按字体自己的字距表排的。
（单击 2）他说，那是一种美丽的、有历史感的、艺术上微妙的、科学无法捕捉的东西。他被迷住了。
但是：当时，这门课对他的人生没有任何实际用处。这是第三个点。记住这两样东西——衬线和字距。十年以后，它们会出现在一台电脑的屏幕上。
（墙上的字是 Hoefler Text——1991 年随 Apple 的系统发布的衬线字体——的真实轮廓和真实字距，按 300pt 画出。）
来源：[1] 斯坦福大学毕业典礼演讲，2005。`,
  build(k) {
    sun(k);
    marks(k, { part: '一　来源', date: '1972　Reed College' });
    lifeline(k, { current: '1972' });

    // the pair, written on the wall: 300 pt, set with the font's own kerning
    const size = 300, u = size / 72 / UPM;                     // inches per font unit
    const pairW = (G.A.adv + KERN + G.v.adv) * u;
    const ox = k.col(6) + (k.span(6, 12).w - pairW) / 2 + 0.15, base = 5.12;
    const vx = ox + (G.A.adv + KERN) * u;
    // practice-sheet guide lines, wall to wall: cap height, x-height, baseline
    [CAP, XH, 0].forEach((h) => k.line({ x1: 0, y1: base - h * u, x2: k.W, y2: base - h * u, color: 'hairline', weight: 0.75, bleed: true }));
    k.light({ cx: vx, cy: base - 0.45 * CAP * u, r: 2.8, strength: 0.45 });
    glyph(k, G.A, ox, base, u, { name: 'av-A' });
    glyph(k, G.v, vx, base, u, { name: 'av-v' });

    // the page's sentence
    k.text('退学之后，他去旁听了一门书法课。', { style: 'headline', x: k.M.x, y: 0.95, w: 9.6, nowrap: true });

    // click 1: the serif (leader to the tip of A's left foot) and the letter space (dimension between the diagonals)
    const sy = base - 22 * u, sxTip = ox + 4 * u;
    // (the label sits on the baseline like the words at the left, so the guide line does not strike through it)
    k.text('衬线', { style: 'label', tracking: 0, x: sxTip - 1.08, y: base - 0.19, w: 0.5, nowrap: true, build: [1, 0] });
    leader(k, { from: { x: sxTip - 0.56, y: sy }, to: { x: sxTip + 0.02, y: sy }, build: [1, 0] });
    const dy = 600, dyy = base - dy * u;                      // measured across the white at half the v's height
    const xa = ox + 1063 * u, xv = vx + (1497 - (G.A.adv + KERN)) * u;  // A's right stroke, v's left arm at that height
    const t = 0.06, db = [1, 150];
    k.line({ x1: xa, y1: dyy, x2: xv, y2: dyy, color: 'graphite', weight: 0.75, build: db });
    k.line({ x1: xa, y1: dyy - t, x2: xa, y2: dyy + t, color: 'graphite', weight: 0.75, build: db });
    k.line({ x1: xv, y1: dyy - t, x2: xv, y2: dyy + t, color: 'graphite', weight: 0.75, build: db });
    k.text('字距', { style: 'label', tracking: 0, x: (xa + xv) / 2 - 0.5, y: dyy - 0.29, w: 1, color: 'graphite', align: 'center', nowrap: true, build: db });

    // click 2: his words, and the plain fact, at the left; the fact sits on the sheet's baseline
    k.text('美丽的，有历史感的，\n科学无法捕捉的。', { style: 'voice', x: k.M.x, y: base - XH * u + 0.05, w: 4.6, build: 2 });
    k.text('当时，这门课没有任何用处。', { style: 'body', color: 'ink', x: k.M.x, y: base - 0.29, w: 4.6, nowrap: true, build: [2, 300] });
    return { ox, base, u };
  },
};
