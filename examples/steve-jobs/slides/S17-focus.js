// S17 — 序列（多 → 四）：房间里没有物件，墙上是他在白板上画的那张图。左边一簇小方框——十几种 Macintosh——
// 被一个个划掉，只剩四个；右边一个手画的“十”字分出 2×2（消费级 / 专业级 × 台式 / 便携），每格一个产品的剪影
// （iMac、Power Mac G3、iBook、PowerBook G3，同一比例的简化轮廓）。下午的光落在 2×2 上。视觉中心：2×2。
// 页内动效只有淡入，没有“淡出”：设计里“12 个小矩形淡出”改为“被划掉”（白板上的说不），见报告。
const { sun, lifeline, linksBefore, marks, stroke, rand } = require('../parts');

// the cross on the wall: centre, half-width, half-height
const CX = 9.75, CY = 3.4, HW = 2.15, HH = 1.68;
const MM = 0.0029;                         // one scale for all four products (in per mm): the tower is 447 mm tall

// Front silhouettes, real proportions (mm), drawn flat in ink; screens and openings in the screen colour.
// (x, base) = centre of the footprint on the quadrant's baseline.
const PRODUCTS = {
  // iMac G3 (1998): 381 × 397 mm, one rounded body, a 15-inch CRT
  imac(k, x, base, b) {
    const W = 381 * MM, H = 397 * MM;
    k.rect({ x: x - W / 2, y: base - H, w: W, h: H, fill: 'ink', radius: 0.2, build: b });
    k.rect({ x: x - 132 * MM, y: base - H + 48 * MM, w: 264 * MM, h: 198 * MM, fill: 'screen', radius: 0.04, build: b });
    k.rect({ x: x - 45 * MM, y: base - H + 290 * MM, w: 90 * MM, h: 5 * MM, fill: 'screen', build: b }); // the CD slot
  },
  // Power Mac G3, blue and white (1999): 231 × 447 mm tower, a handle at the top and at the bottom
  tower(k, x, base, b) {
    const W = 231 * MM, H = 447 * MM;
    k.rect({ x: x - W / 2, y: base - H, w: W, h: H, fill: 'ink', radius: 0.03, build: b });
    [16, H / MM - 40].forEach((v) => k.rect({ x: x - 80 * MM, y: base - H + v * MM, w: 160 * MM, h: 24 * MM, fill: 'screen', radius: 0.03, build: b }));
    [104, 150].forEach((v) => k.rect({ x: x - 74 * MM, y: base - H + v * MM, w: 148 * MM, h: 6 * MM, fill: 'screen', build: b }));
  },
  // iBook (1999), the clamshell: 344 mm wide, a round lid on a round base
  ibook(k, x, base, b) {
    const W = 344 * MM, BH = 46 * MM, LW = 300 * MM, LH = 238 * MM;
    k.rect({ x: x - LW / 2, y: base - BH - LH + 0.04, w: LW, h: LH, fill: 'ink', radius: 0.14, build: b });
    k.rect({ x: x - 123 * MM, y: base - BH - LH + 36 * MM, w: 246 * MM, h: 185 * MM, fill: 'screen', radius: 0.02, build: b });
    k.rect({ x: x - W / 2, y: base - BH, w: W, h: BH, fill: 'ink', radius: 0.06, build: b });
  },
  // PowerBook G3 (1998): 323 mm wide, a square lid on a thin base
  powerbook(k, x, base, b) {
    const W = 330 * MM, BH = 36 * MM, LW = 318 * MM, LH = 244 * MM;
    k.rect({ x: x - LW / 2, y: base - BH - LH + 0.02, w: LW, h: LH, fill: 'ink', radius: 0.03, build: b });
    k.rect({ x: x - 143 * MM, y: base - BH - LH + 16 * MM, w: 286 * MM, h: 214 * MM, fill: 'screen', build: b });
    k.rect({ x: x - W / 2, y: base - BH, w: W, h: BH, fill: 'ink', radius: 0.02, build: b });
  },
};

module.exports = {
  id: 'S17',
  title: '说不',
  rhythm: 'dense',
  transition: 'morph',
  notes: `回到 Apple，他做的第一件事是砍。
当时的 Apple 有十几种 Macintosh，型号多到连 Apple 自己的员工都说不清，该给朋友推荐哪一款。
（单击 1）他在白板上画了一个十字，分出四个格子：上面写“消费级”“专业级”，旁边写“台式”“便携”。每个格子只做一款产品：给普通人的台式机 iMac，给专业用户的 Power Mac G3，给普通人的笔记本 iBook，给专业用户的 PowerBook。其余的，全部砍掉。
（单击 2）大约 70% 的产品线就这样没了。画面上十几个方框划掉了九个，剩下四个——差不多就是这个比例。（左边方框的个数是示意：当年的型号数各处说法不一，所以只说“十几种”。）
（单击 3）他在 1997 年的 WWDC 上说：专注不是对你要做的事说“是”，而是对另外一百个好主意说“不”。他说，他对没有做的事，和做了的事一样骄傲。
地板上，一条蓝线从 1974 年连到 1997 年：在印度和禅里学到的减法，这一次落在了一家公司上。
（说明：四个产品轮廓是按真实比例简化的剪影，不是实物图；iBook 1999 年才推出，格子是 1997 年画的。）
来源：[6] Isaacson；[11] WWDC 1997 闭幕问答。`,
  build(k) {
    sun(k);
    marks(k, { part: '四　回归', date: '1997' });
    lifeline(k, { current: '1997', links: linksBefore('S17'), fresh: '1974-1997', freshBuild: 3, linkLabels: { 1974: '禅' } });

    k.text('专注，就是说不。', { style: 'headline', x: k.M.x, y: 0.95, w: 6, nowrap: true });
    k.light({ cx: CX, cy: CY, r: 2.6, strength: 0.4 });

    // ── left: more than a dozen Macintoshes, as small boxes standing on three shelves; nine are struck out ──
    const R = rand(1997);
    const shelves = [2.75, 3.45, 4.15];
    const boxes = [];
    shelves.forEach((base, row) => {
      let x = k.M.x + (row === 1 ? 0.18 : 0);
      const n = row === 1 ? 4 : 5;
      for (let i = 0; i < n; i++) {
        const w = 0.26 + R() * 0.3, h = 0.28 + R() * 0.3;
        boxes.push({ x, y: base - h, w, h });
        x += w + 0.16 + R() * 0.1;
      }
    });
    const keep = new Set([1, 5, 8, 12]);   // four survive (one per cell): 9 of 13 cut ≈ 70%
    boxes.forEach((r, i) => k.rect({ ...r, line: 'graphite', lineW: 0.75 }));
    const cl = Math.max(...boxes.map((r) => r.x + r.w));
    k.text('十几种 Macintosh', { style: 'caption', x: k.M.x, y: shelves[2] + 0.12, w: 2, nowrap: true });

    // click 1 — no, no, no: nine strokes through nine boxes (fast), the four that stay are filled in; then the cross
    let j = 0;
    boxes.forEach((r, i) => {
      if (keep.has(i)) { k.rect({ ...r, fill: 'ink', build: [1, 520] }); return; }
      stroke(k, [[r.x - 0.06, r.y + r.h + 0.04], [r.x + r.w / 2, r.y + r.h / 2 + 0.02], [r.x + r.w + 0.06, r.y - 0.05]], { color: 'graphite', weight: 1, build: [1, j++ * 55] });
    });
    k.line({ x1: cl + 0.35, y1: CY, x2: CX - HW - 0.75, y2: CY, color: 'graphite', weight: 0.75, arrow: 'end', build: [1, 600] });
    // the cross, drawn by hand: a little off straight, as on a whiteboard
    stroke(k, [[CX - 0.02, CY - HH], [CX + 0.015, CY - HH * 0.3], [CX - 0.01, CY + HH * 0.4], [CX + 0.02, CY + HH]], { color: 'graphite', weight: 1.25, build: [1, 650] });
    stroke(k, [[CX - HW, CY + 0.02], [CX - HW * 0.3, CY - 0.012], [CX + HW * 0.45, CY + 0.01], [CX + HW, CY - 0.02]], { color: 'graphite', weight: 1.25, build: [1, 700] });
    const qx = [CX - HW / 2, CX + HW / 2], top = CY - 0.2, bot = CY + HH - 0.12;
    PRODUCTS.imac(k, qx[0], top, [1, 800]);
    PRODUCTS.tower(k, qx[1], top, [1, 800]);
    PRODUCTS.ibook(k, qx[0], bot, [1, 800]);
    PRODUCTS.powerbook(k, qx[1], bot, [1, 800]);

    // click 2 — what the axes mean, and what was cut
    const lb = { style: 'label', tracking: 0, nowrap: true, build: 2 };
    k.text('消费级', { ...lb, x: qx[0] - 0.6, y: CY - HH - 0.3, w: 1.2, align: 'center' });
    k.text('专业级', { ...lb, x: qx[1] - 0.6, y: CY - HH - 0.3, w: 1.2, align: 'center' });
    k.text('台式', { ...lb, x: CX - HW - 0.75, y: CY - HH / 2 - 0.1, w: 0.6, align: 'right' });
    k.text('便携', { ...lb, x: CX - HW - 0.75, y: CY + HH / 2 - 0.1, w: 0.6, align: 'right' });
    k.text('每格只做一款，砍掉约 70%。', { style: 'body', color: 'ink', x: CX - HW, y: CY + HH + 0.14, w: 4.3, nowrap: true, build: 2 });

    // click 3 — his words, and the connection
    const q = k.text('专注，是对另外一百个好主意说不。', { style: 'voice', x: k.M.x, y: 4.72, w: 5.6, nowrap: true, build: 3 });
    k.text('WWDC，1997', { style: 'caption', x: k.M.x, y: q.y + q.estH + 0.08, w: 2, nowrap: true, build: 3 });
  },
};
