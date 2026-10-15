// S15 — 引文：全片最安静的页面之一。墙上只有他的一句话，一块很淡的午后的光落在它上面；
// NeXT 的立方体仍在右边的角落里（与 S14 同一个位置），地板上 1985、1986 两个新的点。视觉中心：光里的那句话。
const { sun, place, lifeline, linksBefore, marks } = require('../parts');

module.exports = {
  id: 'S15',
  title: '重新开始的轻松',
  rhythm: 'breathing',
  transition: 'morph',
  notes: `（安静的一页。不用急着往下讲。）
很多年后，他在斯坦福这样回头看被开除这件事：
“当时我没有意识到，被 Apple 开除，是我一生中发生过的最好的事。成功的沉重，被重新开始的轻松取代了。我对一切都不再那么确定。它让我进入了一生中最有创造力的时期之一。”
（单击 1，英文原文与出处）
就是在这几年里，他做了 NeXT，买下了 Pixar。看地板上的线：1985 年断掉的地方，又长出了两个点。
也是在这几年里，他认识了后来的妻子 Laurene Powell。1991 年他们结婚，主持婚礼的，是带他坐禅多年的日本禅师乙川弘文。
来源：[1] 斯坦福演讲，2005；[2] Isaacson。`,
  build(k) {
    sun(k);
    marks(k, { part: '三　荒野', date: '1991　与 Laurene Powell 结婚' });
    lifeline(k, { current: '1986', links: linksBefore('S15') });

    // the cube still waits in the corner
    place(k, 'next-cube');

    // his words, in the faint light
    k.light({ cx: 4.6, cy: 3.0, r: 3.0, strength: 0.35 });
    const x = k.col(2), w = k.span(2, 10).w;
    const q = k.text('成功的沉重，\n被重新开始的轻松取代了。', { style: 'voice', size: 34, leading: 1.45, x, y: 2.2, w });
    const en = k.text('The heaviness of being successful was replaced\nby the lightness of being a beginner again.', { style: 'voiceEn', x, y: q.y + q.estH + 0.3, w: 6.4, build: 1 });
    k.text('斯坦福大学毕业典礼，2005', { style: 'caption', x, y: en.y + en.estH + 0.14, w: 3, nowrap: true, build: 1 });
  },
};
