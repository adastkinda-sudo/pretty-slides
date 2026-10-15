// S04 — 主体 + 旁注：墙上画着一栋 Eichler 住宅的花园立面（建筑立面线描，按真实尺寸）：平屋顶伸出两端，
// 外露的梁头排在屋檐下，中间四跨是从地面到梁的整面玻璃。早晨的光落在立面中部——那面玻璃墙上。
// 视觉中心：光里的玻璃墙。Morph 自 S03（篱笆淡出）；生命线：1961 成为当前。
const { sun, place, lifeline, marks, leader } = require('../parts');

module.exports = {
  id: 'S04',
  title: 'Eichler 的房子',
  rhythm: 'dense',
  transition: 'morph',
  notes: `他在加州 Mountain View 一带长大。那里有很多 Joseph Eichler 开发的现代住宅。
（指着墙上的立面）这就是 Eichler 住宅的样子：一层，很低，很长；一个平平的屋顶，伸出墙外；屋檐下露着一根根木梁的梁头——结构不藏起来，结构本身就是装饰；朝向花园的一面，从地面到梁，整面都是玻璃。
（单击 1，三处标注依次出现）平屋顶。外露的梁。整面玻璃墙。简单、开放、明亮。
重要的是：这样的房子，价格却是普通家庭买得起的。
（单击 2）乔布斯后来说，他喜欢 Eichler 的地方在于：他把真正好的设计和简单的功能，带给了不贵的东西。他还说了一句：这就是 Apple 最初的愿景。
这是第二个点：好的设计，不该只属于少数人。
（画面上的立面是按 Eichler 住宅的典型做法画的示意：六个 8 英尺的开间，混凝土地坪，8 英尺高的墙，屋顶两端各伸出 30 英寸；不是某一栋具体的房子。）
来源：[2] Isaacson《史蒂夫·乔布斯传》第 1 章；[20] 同书，乔布斯谈 Eichler：“bring really great design and simple capability to something that doesn't cost much… It was the original vision for Apple.”`,
  build(k) {
    sun(k);
    marks(k, { part: '一　来源', date: '1960s　Mountain View' });
    lifeline(k, { current: '1961' });

    // the one thing in the room: the house, drawn on the wall
    const e = place(k, 'eichler');
    k.light({ cx: (e.glass.x0 + e.glass.x1) / 2, cy: (e.glass.top + e.glass.bottom) / 2, r: 3.0, strength: 0.4 });

    // the page's sentence
    k.text('好的设计，属于每一个人。', { style: 'headline', x: k.M.x, y: 0.95, w: 8, nowrap: true });

    // three callouts, one after another, each stuck to its part
    const lab = (t, o) => k.text(t, { style: 'label', tracking: 0, nowrap: true, w: 1.4, ...o });
    // the flat roof: from the left, a horizontal leader to its end (the two side callouts mirror each other)
    lab('平屋顶', { x: k.M.x, y: e.roof.y - 0.1, build: [1, 0] });
    leader(k, { from: { x: k.M.x + 0.62, y: e.roof.y }, to: { x: e.roof.l.x + 0.12, y: e.roof.y }, build: [1, 0] });
    // the exposed beams: from the right, a horizontal leader to the last beam end, out under the overhang
    const bm = e.beam[e.beam.length - 1];
    lab('外露的梁', { x: e.right + 0.3, y: bm.y - 0.1, build: [1, 120] });
    leader(k, { from: { x: e.right + 0.22, y: bm.y }, to: { x: bm.x, y: bm.y }, build: [1, 120] });
    // the glass wall: a bracket under the ground line across the four glass bays
    const gy = e.ground + 0.2, t = 0.05;
    [[e.glass.x0, gy, e.glass.x1, gy], [e.glass.x0, gy - t, e.glass.x0, gy + t], [e.glass.x1, gy - t, e.glass.x1, gy + t]]
      .forEach(([x1, y1, x2, y2]) => k.line({ x1, y1, x2, y2, color: 'stone', weight: 0.5, build: [1, 240] }));
    lab('整面玻璃墙', { x: (e.glass.x0 + e.glass.x1) / 2 - 0.7, y: gy + 0.1, align: 'center', build: [1, 240] });

    // his words, under the house
    const q = k.text('把真正好的设计，带给不贵的东西。', { style: 'voice', x: k.M.x, y: 4.78, w: 6, nowrap: true, build: 2 });
    k.text('乔布斯谈 Eichler 住宅，见 Isaacson《史蒂夫·乔布斯传》', { style: 'caption', x: k.M.x, y: q.y + q.estH + 0.08, w: 5, nowrap: true, build: 2 });
    return e;
  },
};
