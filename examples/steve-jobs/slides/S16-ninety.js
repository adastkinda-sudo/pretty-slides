// S16 — 大数字：下午，光变暖、变长。墙上一个“90”，一道斜斜的长光从它一直落到回到画面的 NeXT 立方体上——
// 立方体从角落回来（obj-cube），靠墙站在地板上 1997 的正上方，一条竖直引线把它连到生命线。
// 最后一次单击：地板上一条蓝线从 1985（NeXT）连到 1997：荒野里的点被连上了。视觉中心：90。
const { sun, place, lifeline, linksBefore, marks, px } = require('../parts');

module.exports = {
  id: 'S16',
  title: '90 天',
  rhythm: 'breathing',
  transition: 'morph',
  notes: `（立方体从角落里回来了。）
1996 年 12 月，Apple 宣布以 4.29 亿美元收购 NeXT，他随之回到了自己创办的公司。
这时的 Apple 已经连年亏损：1997 财年，亏损超过 10 亿美元。他后来说，公司当时离破产只差大约 90 天。（“90 天”是他本人的说法，不是财报里的数字。）
（单击 1）1996 年 12 月，4.29 亿美元收购 NeXT；1997 财年，亏损超过 10 亿美元。1997 年 9 月，他出任“临时 CEO”。
（单击 2）看地板：一条蓝线从 1985 年连到 1997 年。荒野里的那个点——那个商业上失败了的黑色立方体——就这样把他带回了 Apple。
NeXT 的操作系统 NeXTSTEP，后来成了 Mac OS X 的基础；再后来，也成了 iPhone 上的系统。我们到 iPhone 那一页还会再看到它。
来源：[6] Apple 1997 年报（10-K）；Isaacson（收购 NeXT、1997 财年亏损、“离破产约 90 天”）。`,
  build(k) {
    sun(k);
    marks(k, { part: '四　回归', date: '1997', big: true });

    // the cube is back, standing right above 1997 on the floor line
    const c = place(k, 'next-cube');
    const x97 = px('1997');
    const life = lifeline(k, { current: '1997', links: linksBefore('S16'), fresh: '1985-1997', freshBuild: 2, linkLabels: { 1985: 'NeXT' } });
    k.line({ x1: x97, y1: c.bottom + 0.08, x2: x97, y2: life.y - 0.1, color: 'seam', weight: 0.5 });

    // the number and the sentence on the wall, in the long light. Hoefler's figures are old-style: the 9 drops below
    // the line, the 0 stands at x-height; the headline shares the number's baseline (≈ 3.6 in).
    k.light({ cx: 2.9, cy: 2.9, r: 3.0, strength: 0.4 });
    const n = k.text('90', { style: 'number', x: k.M.x - 0.06, y: 0.8, w: 2.95, nowrap: true, overlap: true, name: 'number' }); // the box's empty top runs under the part marker
    k.text('天，离破产。', { style: 'headline', x: k.M.x + 3.0, y: 2.74, w: 4.2, nowrap: true });

    // click 1 — the facts, in the voice of a spec sheet
    const sy = 4.45;
    k.text([
      { text: '1996.12', style: 'year' }, { text: '　Apple 以 4.29 亿美元收购 NeXT', style: 'label', tracking: 0 },
    ], { style: 'year', x: k.M.x, y: sy, w: 4.2, nowrap: true, build: 1 });
    k.text([
      { text: '1997', style: 'year' }, { text: '　财年亏损超过 10 亿美元', style: 'label', tracking: 0 },
    ], { style: 'year', x: k.M.x, y: sy + 0.28, w: 4.2, nowrap: true, build: 1 });
    k.text('“90 天”是他本人的说法', { style: 'caption', x: k.M.x, y: sy + 0.7, w: 3, nowrap: true, build: 1 });
    return n;
  },
};
