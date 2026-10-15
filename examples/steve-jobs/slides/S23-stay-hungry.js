// S23 ★ — 全景阵列 + 引文：最后的光。太阳落到窗口的最低处，一道横贯房间的低光贴着墙脚扫过；他一生做出来的东西缩小了，
// 按年份靠墙站成一排（篱笆、墙上的 Eichler 立面与 Av、靠墙的 Apple I、Apple II、Mac、NeXT、iMac、iPod、iPhone），
// 长长的影子甩向右边的墙。生命线从地板的第三条板缝升到第一条（主图尺度），9 条联系线在物件上方展开成高弧——
// 全片唯一一次看到线的全貌。1974 没有物件：禅的那个点是一块空地。墙上左上：Stay Hungry. Stay Foolish.
// 视觉中心：光里的一排物件和它们上方的蓝弧。Morph 自 S22（1600 ms）：生命线升起、扁弧长高、路牌淡出、物件淡入。
const { sun, place, marks, lifelineWall, lifelineWallDots, glyph, AV, yearX } = require('../parts');

module.exports = {
  id: 'S23',
  title: '回头看',
  rhythm: 'anchor',
  transition: { type: 'morph', duration: 1600 },
  notes: `（翻过来：镜头拉远。地板上的那条线升了起来，九条蓝线一起长高。停三秒，让大家看。）
这是他一生的全貌。从左到右：父亲的篱笆，Eichler 的房子，书法课上的两个字母，靠在墙上的 Apple I 和它前面的 Apple II，Macintosh，NeXT 的立方体，iMac，iPod，iPhone。每一件都站在它真实的年份上。1974 年那里是空的——那是印度和禅，一块空地。
现在再看这些蓝线。书法课连出了两条：一条到 Mac 的字体，一条到 iPhone 屏幕上的字。禅也连出了两条：一条到 1997 年的“说不”，一条到 iPhone 唯一的那个按钮。1985 年被开除、去做 NeXT，当时看是一个断点；后来它连向了回归，又连向了 iPhone 的系统。Pixar 连向了“技术与艺术”。父亲的篱笆，连到了 Mac 机箱里面。
回到开头那句话：你无法预先把点连起来，只能回头看时连起来。站在 2011 年回头看，每一个点都连成了线，线的终点，是他做出来的东西。把它们连起来的，是同一种审美：简单，从里到外都要好，技术要和人文站在一起。
（单击 1）2005 年斯坦福演讲的最后，他引用了一句话：Stay Hungry. Stay Foolish. 求知若饥，虚心若愚。
（单击 2）这句话印在《全球概览》（The Whole Earth Catalog）停刊号的封底上——一张清晨乡间公路的照片下面。那是他年轻时最喜欢的一本书。他说：我一直这样期望自己；现在，在你们毕业、重新开始的时候，我也这样期望你们。
Steve Jobs，1955 年 2 月 24 日—2011 年 10 月 5 日。谢谢大家。
（画面上的物件按各自真实的比例缩小，彼此之间不是同一比例：iPod、iPhone 放大了一些，才看得见。年份是物件本身的年份：NeXT Computer 1988、iMac 1998；地板上的 14 个点仍是第一页起的那 14 个。）
来源：[1] 斯坦福大学毕业典礼演讲，2005-06-12；每条联系线的依据见它首次出现那一页的备注。`,
  build(k) {
    sun(k);
    marks(k, { part: '五　回头看' });

    // 1 — the connections, high above the row, drawn first so they rise from behind the objects
    lifelineWall(k);

    // 2 — on the wall, just above the baseboard: the Eichler elevation (1961) and the calligraphy pair (1972)
    place(k, 'eichler');
    const cap = 0.42, u = cap / AV.CAP, pairW = (AV.G.A.adv + AV.KERN + AV.G.v.adv) * u;
    const ox = yearX(1972.7) - 0.2 - pairW / 2, base = 5.6;
    glyph(k, AV.G.A, ox, base, u, { name: 'av-A' });
    glyph(k, AV.G.v, ox + (AV.G.A.adv + AV.KERN) * u, base, u, { name: 'av-v' });

    // 3 — the things he made, standing against the wall in the year they were made
    const at = {};
    ['fence', 'apple1', 'apple2', 'mac', 'next-cube', 'imac', 'ipod', 'iphone'].forEach((id) => { at[id] = place(k, id, id === 'fence' ? { side: 'back' } : {}); });

    // 4 — the seam with its 14 points, in front of them; under it, the year of each thing
    const life = lifelineWallDots(k);
    const ly = life.y + 0.11;
    const yr = (t, x, color = 'stone') => k.text(t, { style: 'year', color, x: x - (t.length > 4 ? 0.42 : 0.3), y: ly, w: t.length > 4 ? 0.84 : 0.6, align: 'center', nowrap: true, chrome: true });
    yr('1955', yearX(1955.15) + 0.12, 'ink');
    yr('1961', yearX(1961));
    yr('1972', yearX(1972.7) - 0.2);
    yr('1976–77', (yearX(1976.25) + yearX(1977.3)) / 2 + 0.05);
    yr('1984', yearX(1984.07));
    yr('1988', yearX(1988.8));
    yr('1998', yearX(1998.4));
    yr('2001', yearX(2001.8));
    yr('2007', yearX(2007.03));
    yr('2011', yearX(2011.76) - 0.12, 'ink');

    // 5 — the last words, written on the wall in the dusk
    const q = k.text('Stay Hungry. Stay Foolish.', { style: 'voiceEn', size: 44, leading: 1.1, color: 'ink', x: k.M.x, y: 1.0, w: 9, nowrap: true, build: 1 });
    const zh = k.text('求知若饥，虚心若愚。', { style: 'voice', size: 20, x: k.M.x + 0.04, y: q.y + 0.92, w: 4, nowrap: true, build: [1, 300] });
    k.text('2005 年斯坦福演讲的最后一句，引自《全球概览》停刊号封底', { style: 'caption', x: k.M.x + 0.04, y: zh.y + 0.5, w: 5.4, nowrap: true, build: 2 });
    k.text([{ text: 'Steve Jobs', style: 'year', color: 'ink', tracking: 4 }, { text: '　1955–2011', style: 'year' }],
      { style: 'year', x: k.W - k.M.x - 3, y: 6.95, w: 3, align: 'right', nowrap: true, build: [2, 300] });
    return { at, life };
  },
};
