// S06 — 留白 + 一点：房间本身就是图解。几乎空的房间里只有一样很小的东西——地板上一只坐禅用的坐蒲——
// 落在一小块早晨的光里；其余全是空的。他的话写在左上的墙上，“减到只剩本质。”写在左下。全片最安静的页之一。
// 视觉中心：光里的坐蒲。Morph 自 S05（字母淡出、辅助线淡出，光缩小）；生命线：1974 成为当前。
const { sun, place, lifeline, marks } = require('../parts');

module.exports = {
  id: 'S06',
  title: '印度与禅',
  rhythm: 'breathing',
  transition: 'morph',
  notes: `（翻过来：墙上的大字不见了，房间几乎空了。停一下。）
1974 年，他在 Atari 做了几个月的技术员，攒了钱，去了印度，在那里待了七个月。
（单击 1）回到美国以后他说：印度乡村的人不像我们这样用理性生活，他们靠直觉。直觉是非常强大的东西，在我看来，比智力更强大。
回来以后，他跟随一位日本曹洞宗的禅师——乙川弘文——坐禅，一坐就是很多年；后来他结婚，主持婚礼的也是乙川。房间里这只圆圆的坐垫，叫坐蒲，就是坐禅时坐的东西。
禅教给他的是专注和极简：去掉一切多余的东西，剩下的，才是本质。
（单击 2）减到只剩本质。
请记住这个画面：一间几乎空的房间，里面只有一样东西。1982 年，有人拍下他坐在自己客厅的地板上，屋里几乎什么都没有——他找不到足够好的家具，宁可空着。我们今天的这间房间，就是那间客厅。后来他做的产品，正面只有一个按钮。
这是第四个点。到这里，第一部的四个点都在了：父亲的篱笆、Eichler 的房子、一门书法课、印度和禅。它们现在看起来，没有任何用处。
来源：[2] Isaacson《史蒂夫·乔布斯传》第 3–4 章；[22]（“直觉比智力更强大”为中译）；[17] Diana Walker 摄，1982。`,
  build(k) {
    sun(k);
    marks(k, { part: '一　来源', date: '1974　印度　/　乙川弘文' });
    lifeline(k, { current: '1974' });

    // the one small thing in the room, in a small patch of morning light
    const z = place(k, 'zafu');
    k.light({ cx: z.cx + 0.3, cy: z.y - 0.2, r: 1.5, strength: 0.35 });

    // his words at the upper left; the one line at the lower left. Everything else is empty.
    k.text('直觉是非常强大的东西，\n比智力更强大。', { style: 'voice', size: 30, leading: 1.4, x: k.M.x, y: 1.0, w: 7, build: 1 });
    k.text('减到只剩本质。', { style: 'lead', x: k.M.x, y: 5.08, w: 3, nowrap: true, build: 2 });
    return z;
  },
};
