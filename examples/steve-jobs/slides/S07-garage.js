// S07 — 主体 + 旁注：上午十点，房间里唯一的东西是一块没有外壳的电路板（Apple I），靠墙立着，太阳照在它身上；
// 芯片排成四行，左下是两块白色陶瓷封装的 6820 与 6502，右边是电源：散热片和三只躺着的大电容。
// 视觉中心：阳光里的电路板。→ S08：电路板（obj-board）缩小、移进 Apple II 的机身。
const { sun, place, lifeline, linksBefore, marks, leader } = require('../parts');

module.exports = {
  id: 'S07',
  title: '车库',
  rhythm: 'dense',
  transition: 'morph',
  notes: `第二部，车库。
1976 年 4 月 1 日，21 岁的乔布斯和 Wozniak——还有一位很快就退出的合伙人 Ronald Wayne——创办了 Apple Computer。起点是乔布斯养父母家的车库，就是第一部里父亲那张工作台所在的车库。
你们看到的，就是 Apple 的第一件产品：Apple I。准确地说，它只是一块电路板。芯片一行一行排得很整齐，左下角那两块白色的大芯片，一块是处理器 6502，一块是接键盘和显示器的 6820；右边是电源：散热片和三只躺着的大电容。
（单击 1）它是 Wozniak 设计的，售价 666.66 美元。没有外壳，没有键盘，没有电源变压器，也没有显示器——买回去的人要自己配齐，很多人自己做一个木头盒子把它装起来。
口头补充：两个 Steve 的分工。Wozniak 是工程天才，他做的是一块漂亮的电路板；乔布斯看到的是别的东西：电脑不该是给爱好者焊的电路板，而应该是一件完整的、普通人买回家就能用的产品。下一页，就是他想要的那个样子。
（板子上的元件布局依据真实的 Apple I 绘制：A–D 四行芯片、左下的 6820 与 6502、右边的电源部分；细节是示意，不是逐个元件的复制。）
来源：[2] Isaacson《史蒂夫·乔布斯传》；[3] Computer History Museum。`,
  build(k) {
    sun(k);
    marks(k, { part: '二　车库', date: '1976.4.1', big: true });
    lifeline(k, { current: '1976', links: linksBefore('S07') });

    // the one thing in the room: the bare board, leaning on the wall
    const b = place(k, 'apple1');
    k.light({ cx: b.cx, cy: b.y + b.h * 0.5, r: 3.6, strength: 0.4 });

    k.text('从一块电路板开始。', { style: 'headline', x: k.M.x, y: 0.95, w: 7, nowrap: true });

    // annotations, on click 1: who made it (to the rows of chips), what it lacked (to its bare edge), what it cost (floor)
    const [cx1, cy1] = b.at(14, 80, 4);
    const wy = cy1;
    k.text('Wozniak 设计', { style: 'caption', x: k.M.x, y: wy - 0.11, w: 1.5, nowrap: true, build: 1 });
    leader(k, { from: { x: k.M.x + 1.12, y: wy }, to: { x: cx1 - 0.05, y: wy }, build: 1 });

    const [ex, ey] = b.at(381, 22);
    const rx = 10.45;
    k.text('没有外壳，没有键盘', { style: 'caption', x: rx + 0.1, y: ey - 0.11, w: 2, nowrap: true, build: 1 });
    leader(k, { from: { x: rx, y: ey }, to: { x: ex + 0.03, y: ey }, build: 1 });

    k.text([{ text: 'Apple I', style: 'year', color: 'ink' }, { text: '　　售价 666.66 美元', style: 'caption' }],
      { style: 'caption', x: b.x, y: b.bottom + 0.12, w: 3.2, nowrap: true, build: 1 });
    return b;
  },
};
