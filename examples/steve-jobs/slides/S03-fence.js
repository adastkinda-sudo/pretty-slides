// S03 — 并置对照（正面 / 背面）：同一段红木篱笆的两面，同尺寸、同基线。左边是正面：七块干净的板子，在阴影里；
// 右边是背面：同样七块板 + 两根横档 + 一根斜撑 + 一排排对齐的钉子，早晨的阳光正照在它上面。
// 与 S11「用户看到的 / 没有人看到的」同构（那里的 Mac 前半也在阴影里，机箱内壁在光里）。视觉中心：光里的背面。
// Morph 自 S02：生命线缩成导航，1955 成为当前。
const { sun, place, lifeline, marks, leader } = require('../parts');

module.exports = {
  id: 'S03',
  title: '父亲的篱笆',
  rhythm: 'dense',
  transition: 'morph',
  notes: `第一部，来源。先回到 1955 年。
他的生母 Joanne Schieble 当时是一个未婚的研究生，决定把孩子送人收养，只有一个条件：收养他的人必须大学毕业。最后收养他的 Paul 和 Clara Jobs 都没有读过大学，他们只能承诺：一定送这个孩子上大学。
养父 Paul Jobs 是机械师，也是很好的木工。他在自家车库的工作台上划出一小块，给小 Steve 用，教他用工具。
（打开时）这是一段篱笆的正面——邻居、路人、所有人看到的那一面。七块板子，干干净净。
（单击 1）这是同一段篱笆的背面：两根横档、一根斜撑，每一块板子都用钉子钉在上面，每一排钉子都对齐。
有一次他们一起做篱笆，父亲告诉他：篱笆的背面，也要做得和正面一样好。
（单击 2）“没有人会看到背面。”——“但你自己知道。”
乔布斯后来说，这是父亲教给他最重要的一件事：一个真正的木匠，不会在柜子的背面用一块烂木板。
地板上的线，现在停在第一个点：1955。三十年后，这个点会变成 Macintosh 机箱里面的样子——到那一页，我们会再看到这样“一件东西的两面”。
（画面上的篱笆按常见的红木板篱笆画成：1×6 板、两根 2×4 横档和一根斜撑，四英尺高；那段篱笆本身没有留下照片，形制是示意。）
来源：[2] Isaacson《史蒂夫·乔布斯传》第 1 章；[12] 1985 年《花花公子》采访。`,
  build(k) {
    sun(k);
    marks(k, { part: '一　来源', date: '1955–1960s', big: true });
    lifeline(k, { current: '1955' });

    // the same section of fence, twice: the side everyone sees (in shade), and the side nobody sees (in the sun)
    const f = place(k, 'fence-front', { side: 'front' });
    const b = place(k, 'fence-back', { side: 'back', build: 1 });
    k.light({ cx: b.cx, cy: b.y + b.h * 0.45, r: 2.5, strength: 0.4 });

    // labels on the floor, in front of each
    k.text('正面', { style: 'label', x: f.x, y: f.bottom + 0.1, w: 1, nowrap: true });
    k.text('背面', { style: 'label', x: b.x, y: b.bottom + 0.1, w: 1, nowrap: true, build: 1 });

    // the page's sentence, written on the wall
    k.text('背面，也要做好。', { style: 'headline', x: k.M.x, y: 0.95, w: 6, nowrap: true });

    // his father's words, between the two sides (as his own words stand between the Mac and its case on S11); a leader
    // runs on from the end of the second line to the first nail on the back's top rail (not from the first line, whose
    // dash would read as one line with it)
    const nail = b.nails.filter((n) => n.on === 0).reduce((a, n) => (n.x < a.x ? n : a));
    const tw = 2.3, tx = (f.right + b.x) / 2 - tw / 2 - 0.12, pitch = 20 * 1.3 * 1.2 / 72;  // line pitch (natural 1.2 em × leading)
    const q = k.text('没有人会看到——\n但你自己知道。', { style: 'voice', size: 20, x: tx, y: nail.y - 1.69 * pitch, w: tw, build: 2 });  // second line's middle on the rail
    leader(k, { from: { x: tx + 7 * 20 / 72 + 0.12, y: nail.y }, to: { x: nail.x, y: nail.y }, build: 2 });
    return q;
  },
};
