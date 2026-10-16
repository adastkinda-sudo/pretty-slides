// S19 — 主体 + 旁注：下午的光，变暖、变长。房间里的主角是初代 iPod（2001），站在 S20 的 iPhone 将要站的地方，
// 整个正面在阳光里，长影子投向右边的墙；引线标注它唯一的操作方式：一个滚轮。左下角的阴影里，一台小小的 iMac（1998）。
// 视觉中心：阳光里的滚轮。Morph → S20：iPod 的机身（obj-pocket）拉高，白色正面变成黑色玻璃，选择键变成 Home 键。
const { sun, place, lifeline, linksBefore, marks, leader } = require('../parts');

module.exports = {
  id: 'S19',
  title: '设计是它怎样工作',
  rhythm: 'dense',
  transition: 'morph',
  notes: `回到 Apple 之后，他做的第一件让人眼前一亮的东西，是左下角这台 1998 年的 iMac：半透明的邦迪蓝外壳，显示器和主机做成一体，插上电就能上网。
三年后，2001 年 10 月 23 日，iPod 发布。他的说法只有一句：把 1,000 首歌装进口袋。
（单击 1）请看它的正面：一块小屏幕，一个滚轮，没有别的。转动滚轮，列表就上下移动；按中间的键，就进入下一层。三下点击，就能找到任何一首歌。没有说明书，第一次拿到的人也会用。
（单击 2）2003 年，他对《纽约时报杂志》说：大多数人以为设计就是外表。但设计不只是它看起来、摸起来怎样——设计，是它怎样工作。iPod 好看，但更重要的是：它好用到不需要说明书。
口头补充：同一年（2003 年 4 月），iTunes 音乐商店上线，一首歌 99 美分。
说明：屏幕里的菜单是示意（iPod 1.x 软件的主菜单）；真实的 iPod 屏幕用的是 Chicago 字体——1984 年 Mac 的系统字体，这里用 Arial 代替。初代 iPod 的尺寸是 102 × 61.8 × 19.9 毫米，画面按这个比例画。
→ 下一页：这个口袋里的东西，会变成另一样东西。
来源：[13] Rob Walker，“The Guts of a New Machine”，《纽约时报杂志》，2003-11-30；[25] iMac 发布，1998-05-06；[26] iPod 发布，2001-10-23，“1,000 songs in your pocket”；iTunes Store，2003-04。`,
  build(k) {
    sun(k);
    marks(k, { part: '四　回归', date: '1998–2003' });
    lifeline(k, { current: '2001', links: linksBefore('S19') });

    // 1998 first: a small iMac in the room's shade, lower left
    const m = place(k, 'imac');
    k.text('iMac　1998', { style: 'caption', x: m.x, y: m.bottom + 0.1, w: 1.6, nowrap: true });

    // the one thing in the light: the iPod
    const p = place(k, 'ipod');
    const w = p.wheel;
    k.light({ cx: w.cx, cy: w.cy, r: 2.2, strength: 0.4, color: 'FBEEDB' });

    // the page's sentence, written on the wall; his words in the original under it
    k.text('设计，是它怎样工作。', { style: 'headline', x: k.M.x, y: 0.95, w: 6.4, nowrap: true });
    const q = k.text('Design is how it works.', { style: 'voiceEn', size: 18, x: k.M.x, y: 1.92, w: 4, nowrap: true, build: 2 });
    k.text('《纽约时报杂志》，2003', { style: 'caption', x: k.M.x, y: q.y + q.estH + 0.08, w: 3, nowrap: true, build: 2 });

    // how it works: one wheel; three clicks — on the wall at its right, in its long shadow
    const rx = p.right + 0.45;
    const yWheel = w.cy - w.wheel * 0.62;
    leader(k, { from: { x: rx, y: yWheel }, to: { x: w.cx + Math.sqrt(w.wheel ** 2 - (yWheel - w.cy) ** 2) - 0.12, y: yWheel }, build: 1 });
    k.text('一个滚轮', { style: 'label', tracking: 0, x: rx + 0.1, y: yWheel - 0.1, w: 1.4, nowrap: true, build: 1 });
    const yBtn = w.cy + w.button * 0.42;            // just under the ▶▶| mark
    leader(k, { from: { x: rx, y: yBtn }, to: { x: w.cx + w.button * 0.45, y: yBtn }, build: [1, 200] });
    k.text('三下点击，\n找到任何一首歌', { style: 'label', tracking: 0, x: rx + 0.1, y: yBtn - 0.1, w: 1.6, build: [1, 200] });

    // on the floor under it: the promise and the date
    k.text([{ text: '2001.10.23', style: 'year' }, { text: '　1,000 首歌，装进口袋', style: 'caption' }], { style: 'caption', x: p.x, y: p.bottom + 0.1, w: 3.2, nowrap: true, build: 2 });
    return p;
  },
};
