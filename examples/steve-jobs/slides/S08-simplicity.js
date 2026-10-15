// S08 — 序列（电路板 → 产品）：S07 的裸电路板缩小、移进 Apple II 的机身（obj-board 被机身盖住）；房间中央是一台 Apple II，
// 米色机身、键盘一体，我们从上方一点看到它的斜键盘和机盖。墙上，全片唯一一次用英文衬线写标题：1977 年宣传册上的那句话。
// 地板上出现第一条蓝色联系线：1961（Eichler，给普通人的好设计）→ 1977。视觉中心：阳光里的那句话和它下面的 Apple II。
const { sun, place, lifeline, linksBefore, marks, leader } = require('../parts');

module.exports = {
  id: 'S08',
  title: '简单是最终的复杂',
  rhythm: 'dense',
  transition: 'morph',
  notes: `（翻页时，那块电路板缩小、装进了机身。）
1977 年 4 月，Apple II 发布。和 Apple I 比，它多了一件事：它是一件完整的产品。塑料外壳、键盘做在机身上，插上电视就能用。
乔布斯坚持外壳要漂亮，还要安静——他不要风扇。工程师说没有风扇电源会过热，他就找人重新设计了一种不需要风扇的开关电源。
（单击 1）同一年，Apple 的宣传册上，大标题写着：Simplicity is the ultimate sophistication. 简单，是最终的复杂。这句话后来成了他一生的信条：简单不是少做，而是把复杂的东西想透以后，剩下的那部分。
（单击 2）请看它身上的三件事：一体化，键盘、电源、电路都在一个机身里；没有风扇；插上电视就能用。复杂的东西，被收进了一个干净的外壳。
再看地板：第一条蓝线，从 1961 年连到 1977 年，起点下面写着“给普通人的好设计”。还记得第一部里 Eichler 的房子吗？给普通人的好设计。Apple II 就是一台给普通人的电脑。这是第一次，几个点——父亲的手艺、Eichler 的“给普通人的好设计”、禅的减法——同时出现在一件产品上。
口头补充：Apple II 让 Apple 成为一家真正的公司。1980 年 12 月 Apple 上市，25 岁的乔布斯身家超过 2 亿美元。
来源：[2] Isaacson《史蒂夫·乔布斯传》；[9] Apple II 宣传册，1977。Apple II 按 394 × 114 × 457 mm（Computer History Museum）绘制，没有画机盖上的标志。`,
  build(k) {
    sun(k);
    marks(k, { part: '二　车库', date: '1977' });

    // the board of S07 goes into the case: drawn first, under the Apple II, hidden by it (the Morph's end point)
    place(k, 'apple1');
    const a = place(k, 'apple2');
    k.light({ cx: a.cx, cy: 3.2, r: 4.2, strength: 0.4 });

    // the one English title of the deck, written across the wall in Hoefler Text; the Chinese and the source under it
    const t = k.text('Simplicity is the ultimate sophistication.', { style: 'display', size: 44, tracking: 0, x: k.M.x, y: 1.02, w: k.innerW, align: 'center', nowrap: true, build: 1 });
    const zh = k.text('简单，是最终的复杂。', { style: 'lead', color: 'ink', x: k.M.x, y: t.y + 0.98, w: k.innerW, align: 'center', nowrap: true, build: 1 });
    k.text('Apple II 宣传册，1977', { style: 'caption', x: k.M.x, y: zh.y + 0.5, w: k.innerW, align: 'center', nowrap: true, build: 1 });

    // three facts on the wall at the right, each with a leader to where it is true
    const lx = a.right + 0.55;
    const tag = (txt, to, y) => {
      k.text(txt, { style: 'caption', x: lx + 0.1, y: y - 0.11, w: 1.8, nowrap: true, build: 2 });
      leader(k, { from: { x: lx, y }, to: { x: to[0] + 0.03, y }, build: 2 });
    };
    const lid = a.at(394, 112, 300), keys = a.at(330, a.deckH(100) + 9, 100), front = a.at(394, 30, 0);
    tag('没有风扇', lid, lid[1]);
    tag('一体化', [keys[0] - 0.12, keys[1]], keys[1]);
    tag('插上电视就能用', front, front[1]);

    // the floor: the first connection of the deck, 1961 → 1977
    lifeline(k, { current: '1977', links: linksBefore('S08'), fresh: '1961-1977', freshBuild: 2, linkLabels: { 1961: '给普通人的好设计' } });
    return a;
  },
};
