// S18 — 引文（全片最大的一句话）：房间里什么都没有，也没有任何肖像——广告本身是黑白肖像加一句话，我们只留那句话。
// 下午很淡的一块光落在它上面；右下是那句广告词 Think different.（Palatino Linotype Italic）。视觉中心：那句话。
const { sun, lifeline, linksBefore, marks } = require('../parts');

module.exports = {
  id: 'S18',
  title: '致疯狂的人',
  rhythm: 'breathing',
  transition: 'morph',
  notes: `（停一下，让这句话在墙上待一会儿。）
1997 年，Apple 最弱的时候，推出了一支广告。没有产品，没有价格，只有一张张黑白肖像：爱因斯坦、甘地、毕加索、马丁·路德·金……旁白是：
“致疯狂的人。格格不入的人，叛逆的人，惹麻烦的人……因为那些疯狂到以为自己能改变世界的人，正是改变世界的人。”
（单击 1）最后一句：Think different.
在公司离破产只有几个月的时候，他没有先讲产品，而是先讲 Apple 是谁。
（画面上刻意没有放任何肖像：只留那句话。）
来源：[19] Think Different 广告，1997，TBWA\\Chiat\\Day 为 Apple 制作；Isaacson。`,
  build(k) {
    sun(k);
    marks(k, { part: '四　回归', date: '1997' });
    lifeline(k, { current: '1997', links: linksBefore('S18') });

    k.light({ cx: 5.6, cy: 3.0, r: 3.4, strength: 0.3 });
    const q = k.text('那些疯狂到以为自己能改变世界的人，\n正是改变世界的人。', { style: 'voice', size: 40, leading: 1.4, color: 'ink', ...k.span(1, 11), y: 2.0, nowrap: true });
    k.text('1997 年广告旁白', { style: 'caption', x: k.M.x, y: q.y + q.estH + 0.2, w: 3, nowrap: true });
    k.text('Think different.', { style: 'voiceEn', size: 24, x: k.col(9), y: 4.55, w: 3.2, nowrap: true, build: 1 });
  },
};
