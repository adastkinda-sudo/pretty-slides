// S11 ★ — 剖面 / 展开：Mac 让到左边（前半，离墙近，在阴影里），右边是打开的后壳，开口朝向我们；
// 正午的阳光照进壳里，落在内壁的一片签名上（示意）。与 S03「篱笆的正面 / 背面」同构：用户看到的，和没有人看到的。
// 视觉中心：阳光里的签名。Morph 自 S10：Mac（obj-mac）缩小左移，太阳移到后壳上。
const { sun, place, lifeline, linksBefore, marks } = require('../parts');

// Signatures in graphite, as if written ('ink'). The moulded-relief version ('relief') is more literal but fades out at
// audience distance — compared side by side, ink chosen. objects/mac-case.js still draws both.
const SIG = 'ink';

module.exports = {
  id: 'S11',
  title: '机箱里的签名',
  rhythm: 'dense',
  transition: 'morph',
  notes: `Macintosh 的外壳是封死的，用户打不开，也永远不会打开。但乔布斯要求，机箱里面的电路板也必须排得整齐、漂亮。工程师说：没有人会看到。他说：我会看到。
（单击 1）这是 Mac 的后壳，从里面看。左边是用户看到的那一面，右边是没有人看到的这一面。
（单击 2）1982 年 2 月，Mac 团队开了一个“签名会”：每个人在一张纸上签下自己的名字，这些签名被刻进了初代 Macintosh 机箱的内壁。乔布斯说：真正的艺术家，会在作品上签名。
（说明：画面上的签名是示意，不是真实签名的复制；真实的内壁上大约有 47 个签名，人数各处说法不一，所以只说“团队的签名”。）
（单击 3）他还说过一句话：要让自己晚上睡得着，审美和品质必须贯彻到底。
地板上，一条蓝线从 1955 年连到 1984 年。还记得第一部里父亲的篱笆吗？背面也要和正面一样好，哪怕没有人会看到。那个点，在这里被连上了。
来源：[12] Isaacson；1985 年《花花公子》采访；[27] Andy Hertzfeld，“Signing Party”，folklore.org。`,
  build(k) {
    const room = sun(k);
    marks(k, { part: '二　车库', date: '1982–1984' });
    lifeline(k, { current: '1984', links: linksBefore('S11'), fresh: '1955-1984', freshBuild: 3, freshLabel: '背面，也要做好', labels: { 1955: '父亲的篱笆' } });

    // what the user sees: the front half of the Mac, moved aside, near the wall and out of the sun
    const m = place(k, 'mac');
    // what nobody sees: the rear case, opened towards us, in the sun
    const c = place(k, 'mac-case', { sig: SIG, build: 1, sigBuild: [2, 0] });
    k.light({ cx: c.field.x + c.field.w / 2, cy: c.field.y + c.field.h / 2, r: 2.4, strength: 0.75 });

    // labels on the floor, in front of each half
    k.text('用户看到的', { style: 'caption', x: m.x, y: m.bottom + 0.1, w: 2, nowrap: true });
    k.text('没有人看到的', { style: 'caption', x: c.x, y: c.bottom + 0.1, w: 2, nowrap: true, build: 1 });
    // under the signatures, on the inner back itself: they are illustrative
    const [sx, sy] = c.at(c.QW / 2, 268);
    k.text('签名为示意', { style: 'caption', x: sx - 0.6, y: sy, w: 1.2, align: 'center', nowrap: true, build: 2 });

    // the page's sentence (his words, said at the signing party) and the line he lived by
    k.text('真正的艺术家，会在作品上签名。', { style: 'headline', x: k.M.x, y: 0.95, w: 9.2, nowrap: true });
    const q = k.text('要让自己晚上睡得着，\n审美和品质\n必须贯彻到底。', { style: 'voice', size: 20, x: k.col(4) + 0.3, y: 2.95, w: 3.2, build: 3 });
    k.text('乔布斯，1985 年', { style: 'caption', x: q.x, y: q.y + q.estH + 0.12, w: 2.4, nowrap: true, build: 3 });
    return room;
  },
};
