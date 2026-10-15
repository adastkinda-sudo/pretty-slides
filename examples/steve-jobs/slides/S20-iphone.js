// S20 ★ — 汇合：金色时刻，全片最强、最暖的光。iPhone 站在地板上，被金光照着，长影子投在右边的墙上；
// 左边墙上，三台设备的名字沿三条细线汇向它（三 → 一）；地板上四条新的蓝线从书法、禅、Pixar、NeXT 落在 2007。
// 视觉中心：金光里的 iPhone。Morph 自 S19：iPod 的机身（obj-pocket）拉高、变成 iPhone。
const { sun, place, lifeline, linksBefore, marks, leader, stroke } = require('../parts');

module.exports = {
  id: 'S20',
  title: 'iPhone',
  rhythm: 'dense',
  transition: 'morph',
  notes: `2007 年 1 月 9 日，旧金山 Macworld。他在台上说：今天，我们要推出三款革命性的产品。
（单击 1，三个名字依次出现，像他在台上一个一个念出来）第一，一台宽屏触控的 iPod。第二，一部革命性的手机。第三，一个突破性的互联网通讯设备。iPod，手机，互联网通讯设备……
（单击 2）他停了一下，说：你们明白了吗？这不是三台设备，这是一台设备。我们叫它 iPhone。
（单击 3）看它的正面：一整块玻璃，一个按钮。11.6 毫米厚。
再看地板。前面所有的点，在这里汇合：
- NeXT 的操作系统，变成了 Mac OS X，又变成了 iPhone 上的系统；
- 书法课留下的对字体和细节的执着，变成了 iPhone 屏幕上的每一个字；
- Pixar 让他学会了技术和艺术怎样坐在一起；
- 禅的减法，让这台设备的正面只剩下一块屏幕和一个按钮。
他说过：如果我没有被 Apple 开除，这些事都不会发生。
来源：[7] Macworld 2007 主题演讲；[1] 斯坦福演讲，2005。屏幕上的图标格子是示意，不是真实的图标。`,
  build(k) {
    sun(k);
    marks(k, { part: '四　回归', date: '2007' });

    // the one thing in the room, in the golden light
    const p = place(k, 'iphone');
    k.light({ cx: p.cx, cy: p.y + p.h * 0.45, r: 3.0, strength: 0.45, color: 'FBEBD2' });

    // three names on the wall at the left, one by one, converging on the iPhone (three → one)
    const names = ['宽屏触控的 iPod', '革命性的手机', '突破性的互联网通讯设备'];
    const right = k.col(5) + k.colW;                       // the names' right edge
    const ys = [1.7, 2.62, 3.54];
    const meet = { x: p.x - 0.12, y: p.screen.y + p.screen.h * 0.5 };
    names.forEach((t, i) => {
      const b = [1, i * 400];
      k.text(t, { style: 'lead', size: 22, color: 'ink', x: right - 4.6, y: ys[i], w: 4.6, align: 'right', nowrap: true, build: b });
      const y0 = ys[i] + 0.22, x0 = right + 0.14;
      stroke(k, [[x0, y0], [x0 + 0.55, y0 + (meet.y - y0) * 0.08], [meet.x - 0.75, meet.y - (meet.y - y0) * 0.12], [meet.x, meet.y]], { color: 'graphite', weight: 1, build: [2, i * 120] });
    });
    k.dot({ cx: meet.x, cy: meet.y, r: 0.05, fill: 'ink', build: [2, 360] });
    const q = k.text('这不是三台设备，\n这是一台设备。', { style: 'voice', size: 26, color: 'ink', x: right - 4.6, y: 4.32, w: 4.6, align: 'right', build: [2, 400] });

    // the name, the date and two facts, on the wall at the right of it (in its long shadow)
    const rx = p.right + 0.45;
    k.text('iPhone', { style: 'headline', size: 36, x: rx, y: p.y + 0.55, w: 1.6, nowrap: true, build: 3 });
    // (the headline box keeps room for CJK line height that the Latin word doesn't use: the date tucks under it)
    k.text('2007.1.9', { style: 'year', x: rx + 0.03, y: p.y + 1.27, w: 1.6, nowrap: true, overlap: true, build: 3 });
    k.text('一个按钮', { style: 'label', tracking: 0, x: rx + 0.1, y: p.home.cy - 0.1, w: 1.4, nowrap: true, build: 3 });
    leader(k, { from: { x: rx, y: p.home.cy }, to: { x: p.home.cx + p.home.r + 0.04, y: p.home.cy }, build: 3 });
    k.text('11.6 mm 厚', { style: 'label', tracking: 0, x: rx + 0.1, y: p.edgeR.y + 0.55 - 0.1, w: 1.4, nowrap: true, build: 3 });
    leader(k, { from: { x: rx, y: p.edgeR.y + 0.55 }, to: { x: p.edgeR.x, y: p.edgeR.y + 0.55 }, build: 3 });

    // the floor: four new connections land on 2007, one after another
    lifeline(k, {
      current: '2007', links: linksBefore('S20'),
      fresh: ['1997-2007', '1972-2007', '1986-2007', '1974-2007'], freshBuild: 3, delay: 300, stagger: 150,
      linkLabels: { 1972: '字体', 1997: '系统' },
    });
    return q;
  },
};
