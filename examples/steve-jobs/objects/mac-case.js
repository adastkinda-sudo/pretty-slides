// The rear case of the Macintosh 128K, opened: the shell stands on the floor with its inside towards us (S11).
// 244 × 345 mm, about 210 mm deep, 3 mm walls. Drawn in the room's true perspective (parts.project), because an open
// shell only reads as a shell when you can see into it: the inner back surface is smaller than the rim and pulled
// towards the vanishing point; the inner right wall and the inner floor are visible.
// The sun comes in through the opening: the inner back is lit except where the left and top walls shade it, and
// every rib and boss throws a short shadow to the right. The signatures are ILLUSTRATIVE (示意): generated
// handwriting-like strokes, not copies of the real ones (the real case carries ~47 moulded signatures, 1982).
const { tone, poly, project, worldBox, strokes, rand } = require('../parts');

const REAL = { w: 244, h: 345, d: 210 };
const T = 3;                                       // wall thickness, mm

const C = {
  rim: 'F2ECDF',      // the cut edge of the shell's walls, facing us, in the sun
  outer: 'D6CCB6',    // the rounded outer edge just behind the rim
  inner: 'EAE2D0',    // inner back surface, in the sun
  lit: 'EEE6D5',      // inner right wall and inner floor, in the sun
  dark: 'A99D86',     // inner left and top walls: facing away from the sun
  rib: 'F1EADB',      // ribs and bosses: raised, catching the light
  hole: '6E6456',     // vent slots, screw holes, port openings: through the shell, the dim room behind
  panel: 'CDC2AB',    // the recessed I/O panel
  shadow: '3E3428',   // the shell's own shadows (drawn with transparency)
  ink: '4E4842',      // signatures, version A: graphite, as if written
  relief: '8E826C',   // signatures, version B: the shaded side of a moulded line
  reliefHi: 'F3EEE2', //   …and its lit side
};

module.exports = {
  real: REAL,
  // at: { cx, baseY, h, name, sun, shade, sig: 'ink' | 'relief', build, sigBuild: [step, delay], seed }
  draw(k, at) {
    const c = tone(k, at, C);
    const B = worldBox(at, REAL);
    const mm = B.mm;                                         // world units per mm
    const sun = at.sun && at.sun.dir ? at.sun : null;
    const r = sun ? -sun.dir[2] / sun.dir[0] : 1e9, s = sun ? -sun.dir[1] / sun.dir[0] : 0;
    const bld = at.build;
    const name = at.name;
    const P = (x, h, z) => project(x, h, z);
    const zb = B.zb + T * mm, zf = B.zf;
    // inner box (world)
    const ix0 = B.x0 + T * mm, ix1 = B.x1 - T * mm, ih0 = T * mm, ih1 = B.H - T * mm;
    // a point on the inner back surface, from (u, v) mm measured from its top-left corner
    const Q = (u, v) => P(ix0 + u * mm, ih1 - v * mm, zb);
    const QW = (ix1 - ix0) / mm, QH = (ih1 - ih0) / mm;     // inner back size, mm (238 × 339)

    // 1 · the shell's front: rim (the cut edge of the walls)
    const [fx0, fy0] = P(B.x0, B.H, zf), [fx1, fy1] = P(B.x1, 0, zf);
    k.rect({ x: fx0, y: fy0, w: fx1 - fx0, h: fy1 - fy0, fill: c.rim, line: c.outer, lineW: 0.75, radius: 9 * mm * (fx1 - fx0) / (B.x1 - B.x0), name, build: bld });

    // 2 · inside: back, then the four inner walls (painter's order: they all sit inside the rim)
    const F = { tl: P(ix0, ih1, zf), tr: P(ix1, ih1, zf), br: P(ix1, ih0, zf), bl: P(ix0, ih0, zf) };
    const K = { tl: P(ix0, ih1, zb), tr: P(ix1, ih1, zb), br: P(ix1, ih0, zb), bl: P(ix0, ih0, zb) };
    poly(k, [K.tl, K.tr, K.br, K.bl], { fill: c.inner, name: `${name}-back`, build: bld });
    poly(k, [F.tl, K.tl, K.bl, F.bl], { fill: c.dark, name: `${name}-wall-l`, build: bld });
    poly(k, [F.tl, F.tr, K.tr, K.tl], { fill: c.dark, name: `${name}-wall-t`, build: bld });
    poly(k, [F.tr, K.tr, K.br, F.br], { fill: c.lit, name: `${name}-wall-r`, build: bld });
    poly(k, [F.bl, F.br, K.br, K.bl], { fill: c.lit, name: `${name}-wall-b`, build: bld });

    // 3 · what is moulded on the inner back: ribs, bosses, vents, the I/O panel
    const D = (zf - zb);                                    // inner depth (world)
    const castU = (dmm) => (sun ? dmm / r : 0), castV = (dmm) => (sun ? dmm * s / r : 0);
    const quad = (u0, v0, u1, v1) => [Q(u0, v0), Q(u1, v0), Q(u1, v1), Q(u0, v1)];
    const raised = (u0, v0, u1, v1, dmm, fill = c.rib) => {
      if (sun) poly(k, quad(u0 + castU(dmm), v0 + castV(dmm), u1 + castU(dmm), v1 + castV(dmm)), { fill: c.shadow, transparency: 72, build: bld });
      poly(k, quad(u0, v0, u1, v1), { fill, build: bld });
    };
    const hole = (u0, v0, u1, v1) => poly(k, quad(u0, v0, u1, v1), { fill: c.hole, build: bld });
    // the handle recess (a block hanging from the top wall), and the rib under it
    raised(62, 0, 176, 26, 24);
    raised(8, 32, QW - 8, 34.5, 7);
    // vent slots either side of the handle, above the CRT
    for (let i = 0; i < 9; i++) { hole(18 + i * 4.6, 6, 20.4 + i * 4.6, 26); hole(QW - 20.4 - i * 4.6, 6, QW - 18 - i * 4.6, 26); }
    // two long ribs down the sides, short ribs to the corners
    raised(24, 34.5, 26.5, QH - 48, 7);
    raised(QW - 26.5, 34.5, QW - 24, QH - 48, 7);
    // screw bosses (round, but four sides of a square read the same at this size)
    [[12, 46], [QW - 12, 46], [12, QH - 34], [QW - 12, QH - 34]].forEach(([u, v]) => {
      raised(u - 6, v - 6, u + 6, v + 6, 12);
      hole(u - 2, v - 2, u + 2, v + 2);
    });
    // the I/O panel at the bottom: ports, the power switch
    raised(30, QH - 46, QW - 30, QH - 14, 4, c.panel);
    [[42, 20], [70, 20], [98, 10], [116, 10], [134, 20], [160, 14], [184, 8]].forEach(([u, w]) => hole(u, QH - 36, u + w, QH - 26));

    // 4 · the signatures: rows of short handwritten strokes, a little uneven, in the middle of the inner back
    const field = { u0: 34, u1: QW - 34, v0: 50, v1: 262 };
    const R = rand(at.seed || 1982);
    const rows = 9;
    const sigs = [];
    for (let j = 0; j < rows; j++) {
      const vRow = field.v0 + (j + 0.5) * (field.v1 - field.v0) / rows;
      let u = field.u0 + R() * 12 - (j % 2) * 7;
      while (u < field.u1 - 16) {
        const big = R() < 0.15;
        const w = big ? 40 + R() * 14 : 18 + R() * 24, h = (big ? 12 : 8) + R() * 6;
        const uu = Math.min(u, field.u1 - w);
        sigs.push({ u: uu, v: vRow - h / 2 + (R() - 0.5) * 9, w, h, rot: (R() - 0.5) * 0.36, seed: Math.floor(R() * 1e9) });
        u += w + 1 + R() * 8;
      }
    }
    const toScreen = (sg, pts) => pts.map(([x, y]) => {
      const cs = Math.cos(sg.rot), sn = Math.sin(sg.rot);
      const xm = x * sg.w, ym = y * sg.h;
      return Q(sg.u + xm * cs - ym * sn, sg.v + xm * sn + ym * cs);
    });
    const style = at.sig || 'ink';
    const [sb, sd] = Array.isArray(at.sigBuild) ? at.sigBuild : [at.sigBuild, 0];
    const per = sigs.length > 1 ? Math.min(25, 760 / (sigs.length - 1)) : 0;
    sigs.forEach((sg, i) => {
      const paths = signature(rand(sg.seed)).map((p) => toScreen(sg, p));
      const b = sb ? [sb, Math.round(sd + i * per)] : bld;
      if (style === 'relief') {
        const off = (p) => p.map(([x, y]) => [x - 0.006, y - 0.006]);
        strokes(k, paths.map(off), { color: c.reliefHi, weight: 0.75, build: b });
        strokes(k, paths, { color: c.relief, weight: 0.9, build: b });
      } else {
        strokes(k, paths, { color: c.ink, weight: 0.7, build: b });
      }
    });

    // 5 · the shell's own shadows, over everything inside: the left and top walls shade the inner back (an L),
    //     the left wall shades a wedge of the inner floor, the top wall a wedge of the inner right wall.
    if (sun) {
      const bu = Math.min(QW, (D / r) / mm), bv = Math.min(QH, (D * s / r) / mm);
      const L = (e) => [Q(0, 0), Q(QW, 0), Q(QW, bv + e), Q(bu + e, bv + e), Q(bu + e, QH), Q(0, QH)];
      poly(k, L(5), { fill: c.shadow, transparency: 90, build: bld });                       // penumbra
      poly(k, L(-3), { fill: c.shadow, transparency: 80, name: `${name}-shade`, build: bld }); // core
      poly(k, [F.bl, K.bl, P(Math.min(ix1, ix0 + D / r), ih0, zb)], { fill: c.shadow, transparency: 72, build: bld });
      poly(k, [F.tr, K.tr, P(ix1, Math.max(ih0, ih1 - D * s / r), zb)], { fill: c.shadow, transparency: 72, build: bld });
    }

    const [ax0, ay0] = Q(field.u0, field.v0), [ax1, ay1] = Q(field.u1, field.v1);
    return {
      x: fx0, y: fy0, w: fx1 - fx0, h: fy1 - fy0, right: fx1, bottom: fy1, cx: (fx0 + fx1) / 2,
      field: { x: ax0, y: ay0, w: ax1 - ax0, h: ay1 - ay0 },
      back: { x: K.tl[0], y: K.tl[1], w: K.tr[0] - K.tl[0], h: K.bl[1] - K.tl[1] },
      at: Q, QW, QH,                                        // (u, v) mm on the inner back → slide point; its size in mm
    };
  },
};

// One illustrative signature in a unit box (x 0..1 along, y 0..1 down; baseline ≈ 0.68): a capital, a run of
// connected humps with the odd loop above or below the line, sometimes a second word, sometimes a flourish under it.
function signature(R) {
  const base = 0.68, xh = 0.3;
  const paths = [];
  const capital = (x) => {
    const kind = R();
    if (kind < 0.4) return [[x, base], [x + 0.05, base - 0.62 - R() * 0.15], [x + 0.015, base + 0.05], [x + 0.07, base - xh * 0.7]];      // l / h / k
    if (kind < 0.7) return [[x + 0.1, base - 0.5], [x + 0.03, base - 0.62], [x - 0.01, base - 0.2], [x + 0.05, base + 0.02], [x + 0.12, base - xh * 0.5]]; // C / G / O
    return [[x + 0.02, base - 0.55], [x + 0.11, base - 0.6], [x + 0.06, base], [x + 0.01, base + 0.28], [x - 0.02, base + 0.1], [x + 0.12, base - xh * 0.6]]; // J / S
  };
  const word = (x0, x1, cap) => {
    const pts = cap ? capital(x0) : [[x0, base - xh * 0.4]];
    let x = pts[pts.length - 1][0];
    while (x < x1 - 0.04) {
      const q = R();
      const step = 0.05 + R() * 0.06;
      const xm = x + step * 0.5;
      if (q < 0.14) pts.push([xm + 0.012, base - xh - 0.3 - R() * 0.08], [xm - 0.01, base + 0.02]);                        // ascender loop
      else if (q < 0.22) pts.push([xm, base - xh * 0.9], [xm - 0.012, base + 0.3 + R() * 0.08], [xm + 0.02, base - 0.05]); // descender loop
      else if (q < 0.36) pts.push([xm + 0.02, base - xh], [xm - 0.02, base - xh * 0.9], [xm - 0.015, base], [xm + 0.02, base - xh * 0.5]); // o / a
      else pts.push([xm, base - xh * (0.55 + R() * 0.6)]);
      x += step;
      pts.push([x, base + (R() - 0.5) * 0.1]);
    }
    if (R() < 0.35) pts.push([x + 0.05, base - xh * 0.5 - R() * 0.2]);                                                     // a tail
    return pts;
  };
  const two = R() < 0.65;
  const split = two ? 0.28 + R() * 0.2 : 1;
  paths.push(word(0, split - (two ? 0.04 : 0), true));
  if (two) paths.push(word(split + 0.02, 0.94 + R() * 0.06, R() < 0.85));
  if (R() < 0.25) {                                          // a flourish underneath
    const y = base + 0.2 + R() * 0.12;
    paths.push([[0.04, y + 0.05], [0.35 + R() * 0.2, y - 0.03], [0.7 + R() * 0.25, y + 0.02]]);
  }
  if (R() < 0.2) paths.push([[0.5 + R() * 0.3, base - xh - 0.05], [0.56 + R() * 0.3, base - xh - 0.07]]);              // a t-bar or an i-dot
  const sl = 0.12 + R() * 0.22;                              // a slant, as a hand writes
  return paths.map((p) => p.map(([x, y]) => [x + (base - y) * sl * 0.35, y]));
}
