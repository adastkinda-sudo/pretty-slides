// S14 — 交叉（两条线）：墙上一张草图。横轴是时间，从 1986（买下 Pixar）到 1995.11（《玩具总动员》）：
// 一条“Art”从上方弯下来（Palatino Linotype Italic），一条“Technology”从下方升上去（Arial），九年里慢慢靠近，
// 在 1995 相遇，此后并排走下去——相遇点就是第一部全电脑动画长片。下面的刻度与尺寸线标出九年亏损。午后偏淡的一小块光落在交点上。
// NeXT 的立方体缩小到右边的角落（obj-cube，在阴影里），等 S16。视觉中心：阳光里的交点。
const { sun, place, lifeline, linksBefore, marks, stroke } = require('../parts');

// the wall's time axis: 1986.1 (bought, Feb 1986) at the margin → 1995.85 (Toy Story, Nov 1995) at the crossing
const T0 = 1986.1, T1 = 1995.85, X0 = 0.9, X1 = 8.4;
const tx = (t) => X0 + (t - T0) / (T1 - T0) * (X1 - X0);
const YA = 2.45, YT = 4.62, YC = 3.55;   // Art starts high, Technology low; they meet at YC
const SCALE = 5.3;                      // the time scale under the drawing

module.exports = {
  id: 'S14',
  title: 'Pixar',
  rhythm: 'dense',
  transition: 'morph',
  notes: `（NeXT 的立方体缩到了角落里。它还在，我们待会儿再回来找它。）
同一年，1986 年，他用大约 1,000 万美元，从卢卡斯影业手里买下了它的电脑图形部门，改名叫 Pixar。
（单击 1）Pixar 里，艺术家和工程师坐在一起工作。一条线是艺术，从上面弯下来；一条线是技术，从下面升上去。
它们靠得很慢。前面好几年，Pixar 一直在亏钱，他一次又一次自掏腰包，好几次想把它卖掉。
（单击 2）九年。1995 年 11 月，两条线终于走到了一起——从这里开始，它们并排往前走：Pixar 推出了《玩具总动员》，世界上第一部完全由电脑制作的动画长片。一周之后，Pixar 上市。
2006 年，Disney 以大约 74 亿美元收购了 Pixar，他成了 Disney 最大的个人股东。
后来他说，Apple 站在“技术与人文的十字路口”。这个十字路口，第一次成了一个具体的地方，就在这里。
来源：[2] Isaacson；[5] Isaacson、Disney 2006-01-24 收购公告。画面只用片名，不用剧照和角色形象。`,
  build(k) {
    sun(k);
    marks(k, { part: '三　荒野', date: '1986–1995　Pixar' });
    lifeline(k, { current: '1986', links: linksBefore('S14') });

    // the cube waits in the corner, out of the sun
    place(k, 'next-cube');

    k.text('艺术和技术，坐在同一张桌子边。', { style: 'headline', x: k.M.x, y: 0.95, w: 9, nowrap: true });

    // the light on the crossing
    k.light({ cx: X1, cy: YC - 0.3, r: 2.4, strength: 0.45 });

    // click 1 — two lines on the wall that come together: Art bends down from above (drawn by hand, more curved),
    // Technology rises from below (straighter, as with a ruler). Both ease into 1995 and from there run on side by
    // side — they meet, they do not cross (a line that kept falling would read as "art in decline").
    const XE = 10.0, G = 0.04;                          // half the gap between the two lines once they run together
    const ease = (x, y0, y1, p) => (x >= X1 ? y1 : y1 + (y0 - y1) * (1 - (x - X0) / (X1 - X0)) ** p);
    const xs = (n) => Array.from({ length: n + 1 }, (_, i) => X0 + (X1 - X0) * i / n);
    stroke(k, [...xs(10), 9.2, XE].map((x) => [x, ease(x, YA, YC - G, 2.2)]), { color: 'graphite', weight: 1.25, build: [1, 0] });
    stroke(k, [...xs(10), 9.2, XE].map((x) => [x, ease(x, YT, YC + G, 1.35)]), { color: 'graphite', weight: 1.25, build: [1, 250] });
    k.text('Art', { style: 'voiceEn', size: 22, x: X0, y: YA - 0.5, w: 1, nowrap: true, build: [1, 0] });
    k.text('Technology', { font: 'latinMedium', size: 20, color: 'graphite', x: X0 - 0.02, y: YT + 0.08, w: 2.2, nowrap: true, build: [1, 250] });
    k.dot({ cx: X1, cy: YC, r: 0.045, fill: 'ink', build: [1, 600] });

    // click 2 — what is at the crossing, and how long it took: nine years on a scale under the drawing
    const b = (d) => [2, d];
    k.text('《玩具总动员》', { style: 'lead', color: 'ink', x: X1 - 1.5, y: YC - 1.2, w: 3, align: 'center', nowrap: true, build: b(0) });
    k.text('第一部全电脑动画长片', { style: 'label', tracking: 0, x: X1 - 1.5, y: YC - 0.62, w: 3, align: 'center', nowrap: true, build: b(0) });
    k.line({ x1: X1, y1: YC + 0.12, x2: X1, y2: SCALE - 0.08, color: 'seam', weight: 0.5, build: b(200) });
    // the scale: a dimension line with end ticks, a small tick for every year between
    k.line({ x1: X0, y1: SCALE, x2: X1, y2: SCALE, color: 'stone', weight: 0.5, build: b(200) });
    [X0, X1].forEach((x) => k.line({ x1: x, y1: SCALE - 0.07, x2: x, y2: SCALE + 0.07, color: 'stone', weight: 0.5, build: b(200) }));
    for (let y = 1987; y <= 1995; y++) k.line({ x1: tx(y), y1: SCALE - 0.04, x2: tx(y), y2: SCALE, color: 'stone', weight: 0.5, build: b(200) });
    k.text([{ text: '1986', style: 'year' }, { text: '　买下，约 1,000 万美元', style: 'label', tracking: 0 }], { style: 'year', x: X0 - 0.03, y: SCALE + 0.1, w: 2.3, nowrap: true, chrome: true, build: b(200) });
    k.text('1995.11', { style: 'year', x: X1 - 0.6, y: SCALE + 0.1, w: 1.2, align: 'center', nowrap: true, build: b(200) });
    k.text('九年亏损，他一次次自掏腰包', { style: 'caption', color: 'graphite', x: (X0 + X1) / 2 - 1.2, y: SCALE + 0.1, w: 2.4, align: 'center', nowrap: true, build: b(400) });
  },
};
