// A 12-inch monochrome composite monitor of the late 1970s, the kind an Apple II was plugged into (S09): a dark painted
// metal case about 300 × 285 × 330 mm, a rounded CRT face in a recessed bezel, two knobs and a switch on the chin.
// Generic (no make, no badge). The screen is a 4:3 raster that the page fills (anchor `raster`, 280 × 192 Apple II
// pixels = 40 × 24 characters); the tube's glass is dark, the text is the phosphor's off-white.
// Drawn as a front elevation like objects/mac.js, plus the sliver of the side that faces the vanishing point (true
// perspective through parts.worldBox / project), because it stands well left of the room's centre.
// Light from the upper left: the recess is dark along its top and left inner faces, lit along the right and bottom.
const { tone, poly, project, worldBox } = require('../parts');

const REAL = { w: 300, h: 285, d: 330 };
const C = {
  face: '57534D', edgeLit: '7A756D', edgeDark: '3E3B37', side: '34312D', foot: '2B2926',
  bevelT: '2E2C29', bevelL: '3A3733', bevelR: '6E6962', bevelB: '67625B',
  tube: '1D201E', tubeRim: '2B2E2B', glare: 'F3F1EA', knob: '25231F', knobLit: '8C877E', switch: '1F1D1A',
};
const MM = {
  W: 300, H: 285, r: 7,
  foot: { x0: 12, x1: 288, y0: 276 },
  recess: { x0: 20, x1: 280, y0: 18, y1: 226 },
  glass: { x0: 31, x1: 269, y0: 29, y1: 215, r: 24 },
  raster: { w: 196 },                            // the 4:3 picture inside the tube's curved edges
  knobs: [[236, 251, 7], [262, 251, 7]],
  switch: { x0: 30, x1: 50, y0: 246, y1: 256 },
};

module.exports = {
  real: REAL,
  // at: { cx, baseY, h, name, shade, build }
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    const c = tone(k, at, C);
    const s = h / MM.H, W = MM.W * s, x0 = cx - W / 2, y0 = baseY - h;
    const X = (mm) => x0 + mm * s, Y = (mm) => y0 + mm * s;
    const P = (pts) => pts.map(([x, y]) => [X(x), Y(y)]);
    const b = at.build;

    // the side towards the vanishing point (true perspective), behind the face
    const B = worldBox(at, REAL);
    const vx = 6.6665;
    // (its top and bottom held in by the case's rounding, so it never shows past the face's rounded corners)
    const ht = B.H * (1 - MM.r / MM.H), hb = B.H * (MM.H - MM.foot.y0) / MM.H;
    const side = (x) => poly(k, [project(x, ht, B.zf), project(x, ht, B.zb), project(x, hb, B.zb), project(x, hb, B.zf)], { fill: c.side, name: `${name}-side`, build: b });
    if (B.x1 < vx) side(B.x1);
    if (B.x0 > vx) side(B.x0);

    k.rect({ x: X(MM.foot.x0), y: Y(MM.foot.y0), w: (MM.foot.x1 - MM.foot.x0) * s, h: (MM.H - MM.foot.y0) * s, fill: c.foot, name: `${name}-foot`, build: b });
    k.rect({ x: x0, y: y0, w: W, h: MM.foot.y0 * s, fill: c.face, line: c.edgeDark, lineW: 0.5, radius: MM.r * s, name, build: b });
    k.rect({ x: X(0.8), y: Y(MM.r), w: 2.6 * s, h: (MM.foot.y0 - 2 * MM.r) * s, fill: c.edgeLit, name: `${name}-edge-l`, build: b });
    k.rect({ x: X(MM.W - 3.6), y: Y(MM.r), w: 3 * s, h: (MM.foot.y0 - 2 * MM.r) * s, fill: c.edgeDark, name: `${name}-edge-r`, build: b });

    const r = MM.recess, g = MM.glass;
    poly(k, P([[r.x0, r.y0], [r.x1, r.y0], [g.x1, g.y0], [g.x0, g.y0]]), { fill: c.bevelT, name: `${name}-bevel-t`, build: b });
    poly(k, P([[r.x0, r.y0], [g.x0, g.y0], [g.x0, g.y1], [r.x0, r.y1]]), { fill: c.bevelL, name: `${name}-bevel-l`, build: b });
    poly(k, P([[r.x1, r.y0], [r.x1, r.y1], [g.x1, g.y1], [g.x1, g.y0]]), { fill: c.bevelR, name: `${name}-bevel-r`, build: b });
    poly(k, P([[r.x0, r.y1], [g.x0, g.y1], [g.x1, g.y1], [r.x1, r.y1]]), { fill: c.bevelB, name: `${name}-bevel-b`, build: b });
    k.rect({ x: X(g.x0), y: Y(g.y0), w: (g.x1 - g.x0) * s, h: (g.y1 - g.y0) * s, fill: c.tube, line: c.tubeRim, lineW: 0.75, radius: g.r * s, name: `${name}-crt`, build: b });
    // the picture: 4:3, a little inside the tube's curved edges
    const rw = MM.raster.w, rh = rw * 3 / 4;
    const raster = { x: X((MM.W - rw) / 2), y: Y((g.y0 + g.y1) / 2 - rh / 2), w: rw * s, h: rh * s };

    // the window's reflection on the curved glass: a faint soft band near the top (kept clear of the text at the left)
    if (at.glare !== false) k.rect({ x: X(g.x1 - 74), y: Y(g.y0 + 7), w: 60 * s, h: 22 * s, fill: c.glare, transparency: 96, radius: 13 * s, name: `${name}-glare`, build: b });

    // the chin: power switch at the left, two knobs at the right
    const sw = MM.switch;
    k.rect({ x: X(sw.x0), y: Y(sw.y0), w: (sw.x1 - sw.x0) * s, h: (sw.y1 - sw.y0) * s, fill: c.switch, name: `${name}-switch`, build: b });
    MM.knobs.forEach(([kx, ky, kr], i) => {
      k.dot({ cx: X(kx), cy: Y(ky), r: kr * s, fill: c.knob, line: c.knobLit, lineW: 0.5, name: `${name}-knob${i}`, build: b });
    });
    return { x: x0, y: y0, w: W, h, right: x0 + W, bottom: baseY, cx, raster, side: B.x1 < vx ? project(B.x1, 0, B.zb)[0] : x0 + W };
  },
};
