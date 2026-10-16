// S10 — 主体 + 旁注 + 联系：房间里唯一的东西是一台 Macintosh，正午的太阳照着它和它身后的墙；
// 屏幕上同一个词的两种排法（Consolas 等宽 / Palatino Linotype 按比例），每个字母落在它占的格子里。
// 地板上的生命线：一条蓝线从 1972（书法课）连到 1984。视觉中心：屏幕上的两个 minimum。
const { sun, place, lifeline, linksBefore, marks, leader, cells } = require('../parts');

module.exports = {
  id: 'S10',
  title: 'Macintosh',
  rhythm: 'dense',
  transition: 'morph',
  notes: `1984 年 1 月 24 日，Macintosh 发布，售价 2,495 美元。发布前两天，Ridley Scott 拍的广告《1984》在超级碗上播出。
（单击 1）请看屏幕上的同一个词，minimum。上面一行是等宽字体：每个字母占一样宽的格子，i 和 m 一样宽，所以 i 的两边空出一大块。下面一行是按比例的字距：i 窄，m 宽，每个字母只占它需要的宽度。Mac 是第一台有多种好看的字体、能按比例调整字距的个人电脑。
（单击 2）他在斯坦福说：如果我当年没有旁听那门书法课，Mac 就不会有多种字体，也不会有按比例的字距；而 Windows 只是抄了 Mac，所以很可能所有的个人电脑都不会有。
（单击 3）地板上，一条蓝线从 1972 年连到 1984 年。十年前那门“没用的”课，在这里第一次被连上了。
口头补充：屏幕上的窗口和按钮是圆角的，也是他坚持的。他拉着工程师 Bill Atkinson 在街上走，指给他看：“圆角矩形到处都是！”
来源：[1] 斯坦福演讲，2005；[3]；[14] folklore.org。屏幕里的两行字是示意：上一行用等宽字体 Consolas，下一行用按比例的 Palatino Linotype。`,
  build(k) {
    k.light({ cx: 6.8, cy: 3.1, r: 3.4, strength: 0.55 });
    sun(k);
    marks(k, { part: '二　车库', date: '1984.1.24　Macintosh' });

    // the floor: the lifeline, the connection made on this page
    lifeline(k, { current: '1984', links: linksBefore('S10'), fresh: '1972-1984', freshBuild: 3, freshLabel: '十年后，连上了', labels: { 1972: '书法课' } });

    // the one thing in the room
    const m = place(k, 'mac');

    // the screen: the same word, monospaced and proportional. Each letter sits in the cell it is given:
    // in Consolas every cell is as wide as an m, in Palatino Linotype each letter takes only what it needs.
    const a = m.active, word = 'minimum';
    const mono = cells(word, 'mono', 26), prop = cells(word, 'roman', 26);
    const wx = a.x + (a.w - mono[mono.length - 1]) / 2;
    const rows = [
      { style: 'screenMono', edges: mono, y: a.y + 0.2, label: '等宽' },
      { style: 'screenProp', edges: prop, y: a.y + 0.8, label: '按比例的字距' },
    ];
    rows.forEach((r, i) => {
      const b = [1, i * 500];
      const bl = r.y + 0.36;                        // baseline (both faces render at ≈0.36 in below the box top)
      const top = bl - 0.38, bot = bl + 0.11, end = wx + r.edges[r.edges.length - 1];
      r.edges.slice(0, -1).forEach((e, j) => k.rect({ x: wx + e, y: top, w: r.edges[j + 1] - e, h: bot - top, line: 'screenRule', lineW: 0.5, build: b }));
      k.text(word, { style: r.style, x: wx, y: r.y, w: 2, nowrap: true, build: b });
      // the label on the wall to the right, with a leader to the row of cells
      const lx = m.right + 0.42, ly = (top + bot) / 2;
      k.text(r.label, { style: 'label', tracking: 0, x: lx + 0.1, y: ly - 0.1, w: 1.4, nowrap: true, build: b });
      leader(k, { from: { x: lx, y: ly }, to: { x: end + 0.08, y: ly }, build: b });
    });

    // the page's sentence and his words, written on the wall at the left
    k.text('书法课，\n变成了字体。', { style: 'headline', x: k.M.x, y: 0.95, w: 4.2 });
    const q = k.text('如果我没有旁听那门课，\nMac 就不会有\n这些漂亮的字体。', { style: 'voice', x: k.M.x, y: 3.55, w: 3.9, build: 2 });
    k.text('斯坦福大学毕业典礼，2005', { style: 'caption', x: k.M.x, y: q.y + q.estH + 0.14, w: 3.9, nowrap: true, build: 2 });
  },
};
