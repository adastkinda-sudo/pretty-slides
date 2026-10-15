// S12 — 大数字（极空）：阴天，没有太阳，房间在平的阴影里，什么都没有。墙上只有一个“30”和一句话；
// 地板上的生命线停在 1985：之后的点全部不见了，向前看什么都没有；过去的联系线还在。视觉中心：30。全片最空的一页。
const { sun, lifeline, linksBefore, marks } = require('../parts');

module.exports = {
  id: 'S12',
  title: '30',
  rhythm: 'breathing',
  transition: 'morph',
  notes: `（翻过来的时候，太阳没了，Mac 和机箱也没了。停一下，让房间空着。）
1983 年，乔布斯从百事可乐挖来 John Sculley 当 CEO，用的是那句著名的话：“你是想卖一辈子糖水，还是想跟我一起改变世界？”
但 Mac 发布后卖得不如预期，两个人对公司方向的冲突越来越激烈。1985 年 5 月，董事会站在 Sculley 一边，拿走了他对 Mac 部门的管理权；同年 9 月，他辞职离开。那一年他 30 岁。
（单击 1）他后来说：“30 岁那年，我被炒了。而且是公开地被炒。我成年后整个生活的重心，不见了。这是毁灭性的。”有几个月，他不知道该做什么，甚至想过离开硅谷。
看地板上的线：它停在 1985 年。从这里往前看，什么都没有——后面的点都还不存在。之前连上的线还在，但向前，看不到任何一条。
这是全片的低谷。
来源：[1] 斯坦福演讲，2005；[2] Isaacson。`,
  build(k) {
    sun(k); // overcast: a flat shade over the whole room, no patch of light
    marks(k, { part: '二　车库', date: '1985' });
    lifeline(k, { current: '1985', until: '1985', links: linksBefore('S12') });

    // Hoefler Text's figures are old-style: the 3 drops below the line, the 0 stands at x-height. The headline's
    // second line shares the number's baseline (≈ 3.5 in).
    const n = k.text('30', { style: 'number', x: k.M.x - 0.06, y: 0.7, w: 2.95, nowrap: true, name: 'number' });
    k.text('岁，被自己创办的\n公司赶了出去。', { style: 'headline', size: 36, x: k.M.x + 3.05, y: 2.09, w: 4.6 });
    const q = k.text('我成年后整个生活的重心，不见了。', { style: 'voice', size: 20, x: k.M.x + 3.05, y: 3.9, w: 5.2, nowrap: true, build: 1 });
    k.text('斯坦福大学毕业典礼，2005', { style: 'caption', x: q.x, y: q.y + q.estH + 0.1, w: 3, nowrap: true, build: 1 });
    return n;
  },
};
