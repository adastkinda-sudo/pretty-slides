// S22 — 交叉：黄昏，很低、很长的橙色光。房间里站着一根立杆，杆顶两块成直角交叉的街牌：Technology（Arial）
// 与 Liberal Arts（Palatino Linotype）——这套演示的两种声音，在同一个地方交叉。光落在两块牌上，它们的影子投在右边的墙上。
// 左边墙上：一句话、他的话，最后一行是他复杂的一面。视觉中心：光里的两块牌交叉的地方。Morph → S23（拉远成全景）。
const { sun, place, lifeline, linksBefore, marks } = require('../parts');

module.exports = {
  id: 'S22',
  title: '十字路口',
  rhythm: 'dense',
  transition: 'morph',
  notes: `2011 年 3 月 2 日，iPad 2 发布会。那时他已经病得很重，请着病假，但还是上了台。这是他最后几次站在发布会的台上。
（单击 1，两块路牌依次出现）发布会的最后，屏幕上是一块路牌：一条街叫 Technology，技术；一条街叫 Liberal Arts，人文。两条街在这里交叉。2010 年发布第一代 iPad 时，他也放过这张图。
（单击 2）他说：只有技术是不够的。技术要和人文、和艺术结合，才能做出让我们心里歌唱的东西。
这就是他。不是工程师，也不是设计师，而是站在两条街交叉的地方。回头看今天的每一页：事实和年份用的是一种字体，他自己的话用的是另一种——这两种声音，在这块路牌上交叉。
（单击 3）他也是一个复杂的人：完美主义让他对同事非常苛刻，常把别人的作品分成“极好”和“垃圾”；早年他曾长期否认女儿 Lisa 是自己的孩子。这一页不评价，只陈述。
2011 年 8 月 24 日，他辞去 Apple CEO 的职务；10 月 5 日去世，56 岁。
说明：路牌是按真实街牌（6 × 36 英寸的牌面、2⅜ 英寸的立杆）画的示意，不是发布会图片的复制；为了站进房间，立杆截短了。
来源：[15] iPad 发布会 2010-01-27、iPad 2 发布会 2011-03-02；[2] Isaacson《史蒂夫·乔布斯传》；[8] Apple 2011-08-24 新闻稿。`,
  build(k) {
    sun(k);
    marks(k, { part: '五　回头看', date: '2011' });
    lifeline(k, { current: '2011', links: linksBefore('S22') });

    // the one thing in the room: the post and its two signs, the signs coming in on click 1, one after the other
    const p = place(k, 'street-signs', { signBuild: [[1, 0], [1, 450]] });
    k.light({ cx: p.crossing.x, cy: p.crossing.y, r: 2.6, strength: 0.3, color: 'F8E2C6' });

    // the page's sentence, his words, and the other side of him — on the wall at the left
    k.text('只有技术是不够的。', { style: 'headline', x: k.M.x, y: 0.95, w: 6, nowrap: true });
    const q = k.text('技术要和人文、和艺术结合，\n才能做出让我们心里歌唱的东西。', { style: 'voice', x: k.M.x, y: 2.55, w: 5.6, build: 2 });
    k.text('iPad 2 发布会，2011.3.2', { style: 'caption', x: k.M.x, y: q.y + q.estH + 0.12, w: 3, nowrap: true, build: 2 });
    k.text('他也是一个复杂的人：苛刻，早年否认女儿 Lisa。', { style: 'caption', x: k.M.x, y: 5.28, w: 4.6, nowrap: true, build: 3 });
    return p;
  },
};
