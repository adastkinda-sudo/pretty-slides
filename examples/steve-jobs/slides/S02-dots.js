// S02 — 引文 + 点阵：清晨稍后的光落在墙上他的那句话上；地板上的那条缝（S01 的主图尺度，原位不动），
// 14 个点第一次全部出现：按真实年份落位（1972–1986 挤在一起，1986–1997 一大段空白），彼此之间还没有任何线。
// 视觉中心：光里的那句话。Morph 自 S01（名字淡出，光斑升高变白）；→ S03 生命线缩成导航，1955 成为当前。
const { sun, lifelineCover } = require('../parts');

module.exports = {
  id: 'S02',
  title: '一句话',
  rhythm: 'breathing',
  transition: 'morph',
  notes: `（翻过来：名字不见了，光在墙上升高了一点。地板上还是那条线，只有两端。）
（单击 1）现在，把点放上去。这条线上一共 14 个点：出生，Eichler 的房子，一门书法课，印度，车库，Apple II，施乐，Macintosh，被开除，NeXT，Pixar，回归，iPod，iPhone，最后是 2011。
请注意它们的间距是真实的：1972 到 1986 年挤成一团，1986 到 1997 年之间是一大段空白。现在它们只是一串点，彼此之间没有任何线。
（单击 2）2005 年 6 月 12 日，他在斯坦福大学毕业典礼上说：
“You can't connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future.”
你无法预先把点连起来，只能回头看时连起来。所以你必须相信，这些点总会以某种方式，在你的未来连起来。
今天就用这句话来看他的一生：先看那些点——当时看起来毫无用处、甚至是失败的经历；再看它们后来怎样被连起来。
还有一个问题贯穿全片：把这些点连起来的，是什么？我先给出答案，后面一页一页去看：是他的审美。他从年轻时起就相信，好的东西必须简单，必须从里到外都好。
（之后每一页，地板上这条线都会告诉我们讲到了哪一年；连起来的线是蓝色的，只有回头看时才出现。）
来源：[1] 斯坦福大学毕业典礼演讲，2005-06-12（Stanford News）。`,
  build(k) {
    k.light({ cx: 4.3, cy: 2.75, r: 3.4, strength: 0.45 });
    sun(k);
    lifelineCover(k, { dots: true, build: 1 });  // S01's seam, now carrying all 14 points, unconnected

    // his words, written on the wall in the left pane of the morning light
    const x = k.col(2);
    const q = k.text('你无法预先把点连起来，\n只能回头看时连起来。', { style: 'voice', size: 32, leading: 1.4, x, y: 1.6, w: 6.2, build: 2 });
    const en = k.text('You can’t connect the dots looking forward;\nyou can only connect them looking backwards.', { style: 'voiceEn', x, y: q.y + q.estH + 0.22, w: 6.2, build: [2, 250] });
    k.text('2005 年 6 月 12 日，斯坦福大学毕业典礼', { style: 'caption', x, y: en.y + en.estH + 0.14, w: 4, nowrap: true, build: [2, 250] });
  },
};
