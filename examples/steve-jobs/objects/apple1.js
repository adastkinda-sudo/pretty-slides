// Apple I (1976): Wozniak's bare circuit board, 381 × 241 mm (15 × 9½ in), no case, no keyboard. It leans against the
// wall with its back edge on the wall and its bottom edge on the floor (S07); in S08 the same board, smaller, goes into
// the Apple II (drawn under it, hidden). Drawn in the room's true perspective (parts.project): the leaning plane is a
// slight trapezoid, every part sits on it, and every part throws its own short shadow onto the board along the page's
// sun (at.sun.dir), the way objects/mac-case.js shades its inside.
// Layout after the real board: the chips stand in four neat rows, D (top) to A (bottom), columns 1–18; the character
// generator (2513) lies across D2–3; the two large white ceramic chips, the 6820 PIA and the 6502 processor, lie at the
// bottom left (row A); the power supply is at the right: a finned heat sink, two small regulators and three large
// capacitors lying on their sides in the corner. Small ceramic capacitors sit between the rows; the crystal between C
// and B. No silkscreen text, no logo.
//
// rooms/<ID>.json entry: { "use": "apple1", "cx", "baseY", "h", "shadow": false }
//   cx     x of the board's centre where its top edge touches the wall (= world x)
//   baseY  screen y of its bottom edge on the floor (this sets how far the bottom stands out from the wall)
//   h      screen height from baseY up to the top edge
// The lean cannot be one box for room.py, so the page registers a staircase of shadow-only boxes under the board (see
// rooms/S07.json); the board itself is "shadow": false.
const { project, ROOM, poly, strokes } = require('../parts');

const CAM = ROOM.camera;
const HC = CAM.floorY - CAM.horizonY;
const MM = { W: 381, H: 241 };

const C = {
  pcb: '3F5E4A', pcbLit: '62806B', pcbDark: '2E4637', trace: '4A6B55', rail: '486953',
  chip: '2A2926', chipTop: '45423D', pin: 'ABA697',
  cer: 'E8E3D6', cerEdge: 'C9C1AF', lid: 'B39A62',
  disc: 'C29E63', crystal: 'BDBAB1', crystalLit: 'DEDBD2',
  sink: '262524', fin: '4B4844', reg: '2D2C2A', tab: 'A7A49C',
  cap: '4B5866', capLit: '6D7B89', capDark: '343E49', capEnd: 'B6B3AB',
  hole: '1C2620', ring: 'B7B3A6', shadow: '0E1811',
  res: 'CDB58C', socket: '3A3936', jack: 'E6E0D2', jackLit: 'F4F0E6',
};

// rows D (top) → A (bottom); [column, pins] (vertical chips) or [column, kind] for the chips that lie across
const COLU = (c) => 22 + (c - 1) * 15.6;
const ROWS = {
  D: { v: 34, chips: [[1, 16], [2, '2513'], [4, 14], [5, 14], [6, 16], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 14], [14, 14], [15, 16], [16, 14], [17, 14], [18, 16]] },
  C: { v: 80, chips: [14, 14, 16, 14, 14, 14, 16, 16, 14, 14, 14, 14, 16, 14, 14, 14, 16, 14].map((p, i) => [i + 1, p]) },
  B: { v: 126, chips: [14, 14, 14, 16, 14, 14, 16, 14, 14, 14, 16, 16, 16, 16, 16, 16, 16, 16].map((p, i) => [i + 1, p]) },
  A: { v: 172, chips: [[1, '6820'], [5, '6502'], [11, 16], [12, 16], [13, 14], [14, 14], [15, 16], [16, 14], [17, 14], [18, 16]] },
};

module.exports = {
  real: { w: 381, h: 241, d: 40 },   // d: what room.py would use for a single box; the page uses a staircase instead
  morph: 'obj-board',
  // at: { cx, baseY, h, name, sun, shade, build }
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    const b = at.build;
    const zf = CAM.camZ - HC * CAM.camZ / (baseY - CAM.horizonY);   // depth of the bottom edge (world)
    const Ht = HC - (baseY - h - CAM.horizonY);                       // height of the top edge, at the wall
    const L = Math.hypot(Ht, zf), mmU = MM.H / L;                      // mm per world unit
    const W = MM.W / mmU, x0 = cx - W / 2;
    const sinT = zf / L, cosT = Ht / L;
    // a point on the board, u across (mm from the left), v down (mm from the top), t out of the board (mm)
    const S = (u, v, t = 0) => project(x0 + u / mmU, Ht * (1 - v / MM.H) + (t / mmU) * sinT, zf * (v / MM.H) + (t / mmU) * cosT);
    // where the shadow of a point t mm above the board lands, in board mm (the sun d = (1, −s, −r))
    const sun = at.sun && at.sun.dir ? at.sun : null;
    let du = () => 0, dv = () => 0;
    if (sun) {
      const s = -sun.dir[1], r = -sun.dir[2];
      const den = s * sinT + r * cosT;
      du = (t) => t / den;
      dv = (t) => t * (s * cosT - r * sinT) / den;
    }
    const box = (u0, v0, u1, v1, t) => {
      const p = [S(u0, v0, t), S(u1, v0, t), S(u1, v1, t), S(u0, v1, t)];
      const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
      const x = Math.min(...xs), y = Math.min(...ys);
      return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
    };
    const R = (u0, v0, u1, v1, t, fill, nm, extra = {}) => k.rect({ ...box(u0, v0, u1, v1, t), fill, name: nm && `${name}-${nm}`, build: b, ...extra });
    const shadowOf = (u0, v0, u1, v1, t, nm, tr = 58) => {
      const a = Math.min(MM.W, u0 + du(t)), c = Math.min(MM.W, u1 + du(t));
      if (c - a < 0.3) return;
      R(a, Math.max(0, v0 + dv(t)), c, Math.min(MM.H, v1 + dv(t)), 0, C.shadow, nm && `${nm}-sh`, { transparency: tr });
    };

    // 1 · the board
    const corners = [S(0, 0), S(MM.W, 0), S(MM.W, MM.H), S(0, MM.H)];
    poly(k, corners, { fill: C.pcb, name, build: b });
    // its edges: the top and the window side catch the light, the far side and the bottom fall away
    k.line({ x1: corners[0][0], y1: corners[0][1], x2: corners[1][0], y2: corners[1][1], color: C.pcbLit, weight: 0.75, name: `${name}-edge-t`, build: b });
    k.line({ x1: corners[0][0], y1: corners[0][1], x2: corners[3][0], y2: corners[3][1], color: C.pcbLit, weight: 0.75, name: `${name}-edge-l`, build: b });
    k.line({ x1: corners[1][0], y1: corners[1][1], x2: corners[2][0], y2: corners[2][1], color: C.pcbDark, weight: 0.75, name: `${name}-edge-r`, build: b });

    // 2 · copper under the solder mask: buses between the rows, a stub from every chip, power rails along the edges
    const chips = [];
    for (const [row, R0] of Object.entries(ROWS)) {
      for (const [c, kind] of R0.chips) {
        if (kind === '6820' || kind === '6502') {
          const len = 20 * 2.54 + 1.5;
          const uc = kind === '6820' ? (COLU(1) + COLU(4)) / 2 : (COLU(5) + COLU(8)) / 2 + 1;
          chips.push({ id: `${row}${c}`, kind: 'cer', u0: uc - len / 2, u1: uc + len / 2, v0: R0.v - 7.6, v1: R0.v + 7.6, across: true });
        } else if (kind === '2513') {
          const len = 12 * 2.54 + 1.5, uc = (COLU(2) + COLU(3)) / 2;
          chips.push({ id: `${row}${c}`, kind: 'dip', u0: uc - len / 2, u1: uc + len / 2, v0: R0.v - 7, v1: R0.v + 7, across: true });
        } else {
          const len = (kind / 2) * 2.54 + 1.5, uc = COLU(c);
          chips.push({ id: `${row}${c}`, kind: 'dip', u0: uc - 3.2, u1: uc + 3.2, v0: R0.v - len / 2, v1: R0.v + len / 2, pins: kind });
        }
      }
    }
    const buses = [50, 57, 96, 104.5, 142, 150];
    const fine = buses.map((v) => [S(10, v), S(292, v)]);
    chips.forEach((ch) => {
      const uc = ch.across ? ch.u1 - 6 : ch.u1 + 0.6;
      const below = buses.find((v) => v > ch.v1 + 1);
      const above = [...buses].reverse().find((v) => v < ch.v0 - 1);
      if (below != null) fine.push([S(uc, ch.v1), S(uc, below)]);
      else if (above != null) fine.push([S(uc, ch.v0), S(uc, above)]);
      if (!ch.across && above != null && ch.id.charCodeAt(1) % 2) fine.push([S(ch.u0 - 0.6, ch.v0), S(ch.u0 - 0.6, above)]);
    });
    strokes(k, fine, { color: C.trace, weight: 0.5, name: `${name}-traces`, build: b, tension: 0 });
    // the two supply runs that come out of the power section and feed the rows (under the mask, wider)
    strokes(k, [[S(300, 112), S(292, 112), S(292, 160)], [S(300, 226), S(12, 226)]], { color: C.rail, weight: 1.25, name: `${name}-rails`, build: b, tension: 0 });

    // 3 · mounting holes in the corners
    [[6, 6], [MM.W - 6, 6], [6, MM.H - 6], [MM.W - 6, MM.H - 6]].forEach(([u, v], i) => {
      const [x, y] = S(u, v);
      k.dot({ cx: x, cy: y, r: 3.2 / mmU * 1.0, fill: C.ring, name: `${name}-hole${i}-r`, build: b });
      k.dot({ cx: x, cy: y, r: 1.8 / mmU, fill: C.hole, name: `${name}-hole${i}`, build: b });
    });

    // 4 · the chips: shadow, the rows of tinned legs, the body; the ceramic ones white with a gold lid
    chips.forEach((ch) => {
      const t = ch.kind === 'cer' ? 4.5 : 4;
      shadowOf(ch.u0, ch.v0, ch.u1, ch.v1, t, `c-${ch.id}`);
      if (ch.across) R(ch.u0 + 1.2, ch.v0 - 1.1, ch.u1 - 1.2, ch.v1 + 1.1, 1, C.pin, `c-${ch.id}-pins`);
      else R(ch.u0 - 1.1, ch.v0 + 1.2, ch.u1 + 1.1, ch.v1 - 1.2, 1, C.pin, `c-${ch.id}-pins`);
      if (ch.kind === 'cer') {
        R(ch.u0, ch.v0, ch.u1, ch.v1, t, C.cer, `c-${ch.id}`, { line: C.cerEdge, lineW: 0.25 });
        const uc = (ch.u0 + ch.u1) / 2, vc = (ch.v0 + ch.v1) / 2;
        R(uc - 5.5, vc - 5.5, uc + 5.5, vc + 5.5, t + 0.3, C.lid, `c-${ch.id}-lid`);
      } else {
        R(ch.u0, ch.v0, ch.u1, ch.v1, t, C.chip, `c-${ch.id}`);
        // the moulded edge that faces the window catches a little light
        if (ch.across) R(ch.u0, ch.v0, ch.u1, ch.v0 + 0.9, t, C.chipTop, `c-${ch.id}-hi`);
        else R(ch.u0, ch.v0, ch.u0 + 0.9, ch.v1, t, C.chipTop, `c-${ch.id}-hi`);
      }
    });

    // 5 · small ceramic capacitors between the rows (every other column), and the crystal
    const discs = [];
    [['D', 52.5], ['C', 99], ['B', 146]].forEach(([row, v]) => {
      for (let c = row === 'C' ? 2 : 1; c <= 18; c += 2) discs.push([`${row}${c}`, COLU(c) + 7.8, v + (c % 4 ? 1.5 : -1.5)]);
    });
    [[2, 194], [6, 194], [11, 194], [14, 194], [17, 194]].forEach(([c, v]) => discs.push([`A${c}`, COLU(c) + 2, v]));
    discs.forEach(([id, u, v]) => {
      const [sx, sy] = S(u + du(3), v + dv(3));
      k.dot({ cx: sx, cy: sy, r: 2.5 / mmU, fill: C.shadow, transparency: 62, name: `${name}-d-${id}-sh`, build: b });
      const [x, y] = S(u, v, 3);
      k.dot({ cx: x, cy: y, r: 2.5 / mmU, fill: C.disc, name: `${name}-d-${id}`, build: b });
    });
    // along the bottom edge: resistors (tan, with their leads), the keyboard socket; at the top edge the video jack
    for (let i = 0; i < 9; i++) {
      const u = 172 + i * 13, v = 211;
      R(u - 5.5, v - 0.35, u + 5.5, v + 0.35, 0.8, C.pin, `r${i}-lead`);
      shadowOf(u - 3.2, v - 1.2, u + 3.2, v + 1.2, 2.4, `r${i}`);
      R(u - 3.2, v - 1.2, u + 3.2, v + 1.2, 2.4, C.res, `r${i}`);
    }
    shadowOf(26, 205, 48, 217, 6, 'kbd');
    R(26, 205, 48, 217, 6, C.socket, 'kbd');
    for (let i = 0; i < 8; i++) R(27.6 + i * 2.54, 207.2, 28.6 + i * 2.54, 208.2, 6.1, C.hole, `kbd-p${i}`), R(27.6 + i * 2.54, 213.8, 28.6 + i * 2.54, 214.8, 6.1, C.hole, `kbd-q${i}`);
    shadowOf(262, 2, 282, 13, 9, 'jack');
    R(262, 2, 282, 13, 9, C.jack, 'jack');
    R(262, 2, 282, 3.4, 9, C.jackLit, 'jack-hi');
    shadowOf(226, 100.5, 239, 105.5, 4.5, 'xtal');
    R(226, 100.5, 239, 105.5, 4.5, C.crystal, 'xtal');
    R(226, 100.5, 239, 101.8, 4.5, C.crystalLit, 'xtal-hi');

    // 6 · the power supply at the right: the heat sink, two regulators, three big capacitors on their sides
    shadowOf(306, 14, 352, 100, 26, 'sink', 60);
    R(306, 14, 352, 100, 26, C.sink, 'sink');
    for (let i = 0; i < 8; i++) R(307.5 + i * 5.9, 16, 309.3 + i * 5.9, 98, 26.5, C.fin, `sink-f${i}`);
    [20, 46].forEach((v, i) => {
      shadowOf(358, v, 369, v + 15, 5, `reg${i}`);
      R(359, v - 5, 368, v + 1, 2, C.tab, `reg${i}-tab`);
      R(358, v, 369, v + 15, 5, C.reg, `reg${i}`);
    });
    [137, 172, 207].forEach((vc, i) => {
      const d = 30, u0 = 304, u1 = 368;
      shadowOf(u0, vc - d / 2 + 4, u1, vc + d / 2 - 2, d * 0.8, `cap${i}`, 64);
      R(u0 - 6, vc - 0.5, u0, vc + 0.5, 0.5, C.capEnd, `cap${i}-lead-l`);
      R(u1, vc - 0.5, u1 + 6, vc + 0.5, 0.5, C.capEnd, `cap${i}-lead-r`);
      R(u0, vc - d / 2, u1, vc + d / 2, d / 2, C.cap, `cap${i}`);
      R(u0, vc - d / 2 + 2.5, u1, vc - d / 2 + 9, d / 2 + 6, C.capLit, `cap${i}-hi`);
      R(u0, vc + d / 2 - 7, u1, vc + d / 2, d / 2 - 6, C.capDark, `cap${i}-lo`);
      R(u0, vc - d / 2, u0 + 3, vc + d / 2, d / 2, C.capEnd, `cap${i}-end-l`);
      R(u1 - 3, vc - d / 2, u1, vc + d / 2, d / 2, C.capEnd, `cap${i}-end-r`);
    });

    const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys);
    return {
      x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y, right: Math.max(...xs), bottom: Math.max(...ys), cx,
      at: (u, v, t = 0) => S(u, v, t),   // board mm → slide point
      world: { x0, W, Ht, zf, mmU },
      cpu: box(chips.find((c) => c.id === 'A5').u0, 164, chips.find((c) => c.id === 'A5').u1, 180, 4.5),
    };
  },
};
