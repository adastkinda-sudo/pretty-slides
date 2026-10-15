// S13 — 主体 + 尺寸线：阴天过去，午后的光回来了（偏淡）。房间里唯一的东西是一个黑色的立方体（NeXT Computer，
// 边长 1 ft 的镁合金），光落在它和它身后的墙上，影子投向右边。尺寸线标出它的边长；左边墙上写着它的下场，和一个当时
// 没人在意的点。视觉中心：阳光里的黑色立方体。Morph：S14 它缩到右边的角落（obj-cube），S16 回来。
const { sun, place, lifeline, linksBefore, marks, dim, leader } = require('../parts');

module.exports = {
  id: 'S13',
  title: 'NeXT',
  rhythm: 'dense',
  transition: 'morph',
  notes: `（翻过来，太阳回来了。光还很淡。）
离开 Apple 的那一年，1985 年，他创办了 NeXT，做给大学和科研机构用的工作站。1988 年发布的 NeXT Computer，是一个边长一英尺的立方体：镁合金外壳，通体黑色。
他对这个立方体的要求近乎偏执：每一条边、每一个角都要完美，连工厂里的机器都要刷成好看的颜色。公司的标志，他花了 10 万美元请 Paul Rand 设计。
（单击 1）一英尺，每一条边都一样长。这就是他说的“完美”的具体含义。
（单击 2）但它太贵了，卖得很少。1993 年，NeXT 放弃了硬件，只卖它的操作系统 NeXTSTEP。商业上，NeXT 算不上成功。
只有一件事，当时没人在意：1990 年，CERN 的 Tim Berners-Lee 就是在一台 NeXT 电脑上，写出了第一个网页浏览器和第一个网页服务器。
网页上那种蓝色的链接——点一下，就连到别处——就是从这里开始的。这套演示里，凡是“回头才看得见的联系”，用的都是这种蓝。
来源：[2] Isaacson；[4] CERN, The birth of the Web；[23] Isaacson（NeXT Computer 1988、边长 1 英尺的镁合金立方体、Paul Rand 的标志、1993 年放弃硬件）。`,
  build(k) {
    sun(k);
    marks(k, { part: '三　荒野', date: '1985–1993　NeXT', big: true });
    lifeline(k, { current: '1985', links: linksBefore('S13') });

    // the one thing in the room
    const c = place(k, 'next-cube');
    k.light({ cx: c.cx + 0.6, cy: c.y + 0.4, r: 2.8, strength: 0.4 });

    // its size: every edge one foot (on the wall above it, and down its window side)
    dim(k, { x1: c.x, x2: c.right, y: c.y - 0.32, label: '1 ft', side: 'above', build: 1 });
    dim(k, { x: c.left - 0.3, y1: c.y, y2: c.bottom, label: '1 ft', side: 'left', build: 1 });
    const my = c.y + 0.9, mx = c.outerRight + 0.55;
    k.text('镁合金', { style: 'label', tracking: 0, x: mx + 0.1, y: my - 0.1, w: 1.0, nowrap: true, build: 1 });
    leader(k, { from: { x: mx, y: my }, to: { x: c.right - 0.25, y: my }, build: 1 });

    // the sentence on the wall; under it, what became of it — and the one thing nobody noticed
    k.text('一个完美的立方体。', { style: 'headline', x: k.M.x, y: 0.95, w: 6, nowrap: true });
    const a = k.text('商业上，失败了。', { style: 'body', color: 'ink', x: k.M.x, y: 3.7, w: 3.6, nowrap: true, build: [2, 0] });
    k.text('1990 年，第一个网页浏览器\n在它上面写成。', { style: 'body', x: k.M.x, y: a.y + 0.5, w: 3.6, build: [2, 400] });
  },
};
