// A section of a redwood board fence, the kind Paul Jobs built round the house (S03; small again in S23), drawn as a
// front elevation to real measure: seven 1×6 boards (140 × 19 mm, 6 mm apart, dog-eared tops), 4 ft (1220 mm) tall,
// 1016 mm wide; on the back, two 2×4 rails laid flat (89 × 38 mm) and one diagonal 2×4 brace (a Z-frame), every board
// fastened to them by two nails per rail and one on the brace, all in line. The front shows only the boards: nothing is
// fastened through it.
//   side: 'front' — the side everyone sees: seven clean boards (through the gaps, a glimpse of the rails behind).
//   side: 'back'  — the side nobody sees: the same boards, the rails, the brace, the nails.
// Light from the window at the upper left (at.sun.dir): each rail and the brace stand 38 mm off the boards and throw a
// short shadow down and to the right on them. Materials are redwood; a front out of the sun is toned down by parts.tone.
const { tone, poly } = require('../parts');

const MM = {
  W: 1016, H: 1220,
  board: { w: 140, gap: 6, n: 7, ear: 22 },          // 1×6 boards; dog-eared tops (corners clipped 22 mm)
  rails: [{ y0: 200, y1: 289 }, { y0: 930, y1: 1019 }], // 2×4 laid flat, 89 mm tall; the bottom one 201 mm off the ground
  railX: [25, 991],
  brace: { w: 89, x0: 60, x1: 956 },                  // from the bottom rail at the left to the top rail at the right (Z)
  D: 38,                                              // how far the frame stands off the boards
  nail: 5,                                            // nail head radius (10 mm galvanised heads)
};

const C = {
  board: 'AD6F51',    // redwood, the sunlit face
  grain: '9B5F43',    // its grain, a little darker
  gap: '3A2820',      // between the boards: the dim space behind
  rail: 'B37A5B',     // the 2×4 frame (rougher, a shade lighter)
  railHi: 'D3A386',   // its top arris, catching the light
  railLo: '7A4A34',   // its lower arris
  railBehind: '6A4331', // a rail seen through a gap from the front: in the fence's own shade
  nail: '4B4642',     // galvanised nail heads, weathered
  shadow: '3E2A1E',   // the frame's own shadow on the boards (drawn with transparency)
};

module.exports = {
  real: { w: MM.W, h: MM.H, d: 19 + MM.D },
  // at: { cx, baseY, h, name, sun, shade, side: 'front' | 'back', build }
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    // out of the sun: parts.tone's 20% (made for pale materials) barely shows on a mid-dark wood, so a redwood in the
    // room's shade also drops towards a dark umber — the front on S03 must read as plainly in shade.
    const c = tone(k, at, C);
    if (at.shade > 0.02) for (const key of Object.keys(c)) c[key] = k.mix(c[key], '3F3028', 0.22 * at.shade);
    const b = at.build;
    const s = h / MM.H, W = MM.W * s, x0 = cx - W / 2, y0 = baseY - h;
    const X = (mm) => x0 + mm * s, Y = (mm) => y0 + mm * s;
    const P = (pts) => pts.map(([x, y]) => [X(x), Y(y)]);
    const back = at.side === 'back';
    const B = MM.board;
    const bx = (i) => i * (B.w + B.gap);

    // 1 · behind the boards: the dim space seen through the gaps (below the dog-ears), and from the front the rails
    k.rect({ x: X(0), y: Y(B.ear), w: W, h: (MM.H - B.ear) * s, fill: c.gap, name: `${name}-gaps`, build: b });
    if (!back) MM.rails.forEach((r, j) => k.rect({ x: X(MM.railX[0]), y: Y(r.y0), w: (MM.railX[1] - MM.railX[0]) * s, h: (r.y1 - r.y0) * s, fill: c.railBehind, name: `${name}-rail-${j}`, build: b }));

    // 2 · the seven boards, dog-eared, with a little straight grain
    for (let i = 0; i < B.n; i++) {
      const a = bx(i), z = a + B.w, e = B.ear;
      poly(k, P([[a, e], [a + e, 0], [z - e, 0], [z, e], [z, MM.H], [a, MM.H]]), { fill: c.board, name: `${name}-board-${i}`, build: b });
      // grain: two or three faint lines along the board, not quite straight (deterministic per board)
      const g = [0.27, 0.58, 0.81].filter((_, j) => (i + j) % 3 !== 2);
      g.forEach((f, j) => {
        const u = a + f * B.w, wob = ((i * 7 + j * 3) % 5 - 2) * 1.6;
        k.line({ x1: X(u), y1: Y(e + 30 + j * 40), x2: X(u + wob), y2: Y(MM.H - 20 - ((i + j) % 3) * 60), color: c.grain, weight: 0.5, build: b });
      });
    }
    const out = { x: x0, y: y0, w: W, h, right: x0 + W, bottom: baseY, cx };
    if (!back) return out;

    // 3 · the back: rails, brace, nails. Shadows first (offset along the sun), the frame over them.
    const sun = at.sun && at.sun.dir ? at.sun : null;
    const r = sun ? -sun.dir[2] / sun.dir[0] : 1.2, sl = sun ? -sun.dir[1] / sun.dir[0] : 0.23;
    const dx = MM.D / r, dy = MM.D * sl / r;          // where the frame's edge lands on the boards, mm
    const clipW = (x) => Math.min(x, MM.W);
    const rails = MM.rails.map((rr) => ({ ...rr, x0: MM.railX[0], x1: MM.railX[1] }));
    // the brace: a 89 mm band from the bottom rail's top edge (left) to the top rail's lower edge (right), its ends cut
    // level against the rails. Solve for the slope so the band's perpendicular width is 89 mm.
    const yB = rails[1].y0, yT = rails[0].y1, rise = yB - yT;
    let wh = MM.brace.w;
    for (let it = 0; it < 8; it++) { const th = Math.atan2(rise, (MM.brace.x1 - MM.brace.x0) - wh); wh = MM.brace.w / Math.sin(th); }
    const br = [[MM.brace.x0, yB], [MM.brace.x0 + wh, yB], [MM.brace.x1, yT], [MM.brace.x1 - wh, yT]];
    const sh = (pts) => pts.map(([x, y]) => [clipW(x + dx), y + dy]);
    rails.forEach((rr) => poly(k, P(sh([[rr.x0, rr.y0], [rr.x1, rr.y0], [rr.x1, rr.y1], [rr.x0, rr.y1]])), { fill: c.shadow, transparency: 55, build: b }));
    poly(k, P(sh(br)), { fill: c.shadow, transparency: 55, build: b });
    // the frame itself: faces, then the lit top arris and the darker lower one
    poly(k, P(br), { fill: c.rail, name: `${name}-brace`, build: b });
    k.line({ x1: X(br[0][0]), y1: Y(br[0][1]), x2: X(br[3][0]), y2: Y(br[3][1]), color: c.railHi, weight: 0.75, build: b });
    k.line({ x1: X(br[1][0]), y1: Y(br[1][1]), x2: X(br[2][0]), y2: Y(br[2][1]), color: c.railLo, weight: 0.75, build: b });
    rails.forEach((rr, j) => {
      k.rect({ x: X(rr.x0), y: Y(rr.y0), w: (rr.x1 - rr.x0) * s, h: (rr.y1 - rr.y0) * s, fill: c.rail, name: `${name}-rail-${j}`, build: b });
      k.line({ x1: X(rr.x0), y1: Y(rr.y0) + 0.004, x2: X(rr.x1), y2: Y(rr.y0) + 0.004, color: c.railHi, weight: 0.75, build: b });
      k.line({ x1: X(rr.x0), y1: Y(rr.y1) - 0.004, x2: X(rr.x1), y2: Y(rr.y1) - 0.004, color: c.railLo, weight: 0.75, build: b });
    });
    // nails: two per board on each rail, one per board on the brace — every one in line
    const nails = [];
    for (let i = 0; i < B.n; i++) {
      const m = bx(i) + B.w / 2;
      rails.forEach((rr, j) => [-36, 36].forEach((o) => nails.push({ u: m + o, v: (rr.y0 + rr.y1) / 2, rail: j })));
      // on the brace's centre line, where it crosses this board (only where the board lies wholly across the brace)
      const t = (m - (MM.brace.x0 + wh / 2)) / ((MM.brace.x1 - wh / 2) - (MM.brace.x0 + wh / 2));
      if (t > 0.04 && t < 0.96) nails.push({ u: m, v: yB + (yT - yB) * t, rail: 'brace' });
    }
    nails.forEach((n) => k.dot({ cx: X(n.u), cy: Y(n.v), r: MM.nail * s, fill: c.nail, build: b }));
    const pt = (n) => ({ x: X(n.u), y: Y(n.v) });
    return {
      ...out,
      rails: rails.map((rr) => ({ y: Y((rr.y0 + rr.y1) / 2), top: Y(rr.y0), bottom: Y(rr.y1), x0: X(rr.x0), x1: X(rr.x1) })),
      nails: nails.map((n) => ({ ...pt(n), on: n.rail })),
    };
  },
};
