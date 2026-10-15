// The display of the Xerox Alto (PARC, 1973; what Jobs saw in December 1979): a portrait CRT, the long side of the tube
// upright, its picture the shape of a sheet of paper — 606 × 808 pixels, about 8⅝ × 11 in (219 × 279 mm, Alto Hardware
// Manual, 1979) — black on white, like paper. The cabinet (≈ 360 × 460 × 440 mm, off-white) is estimated from
// photographs; the picture size is from the manual. No badge, no logo.
// Front elevation like objects/mac.js (the same parts and the same light from the upper left), plus the sliver of the
// side that faces the vanishing point. The page draws what is on the screen (anchor `raster`).
// Its part names follow mac.js on purpose (`-screen`, `-crt`, `-bevel-*`, `-foot`, `-edge-*`): with "morph": "obj-mac"
// in rooms/S09.json, the Alto's display turns into the Macintosh of S10 — the screen Jobs saw becomes the one he made.
const { tone, poly, project, worldBox } = require('../parts');

const REAL = { w: 360, h: 460, d: 440 };
const C = {
  face: 'E6E0D1', edge: '9A917E', lit: 'F0ECE1', shade: 'CFC8B7', deep: 'BFB7A4', side: 'C2BAA7', foot: '9C9381',
  crt: '34322E', screen: 'F6F5EF',
};
const MM = {
  W: 360, H: 460, r: 10,
  foot: { x0: 10, x1: 350, y0: 450 },
  recess: { x0: 44, x1: 316, y0: 38, y1: 352 },
  glass: { x0: 56, x1: 304, y0: 50, y1: 340, r: 9 },
  raster: { w: 219, h: 279 },
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

    const B = worldBox(at, REAL);
    const vx = 6.6665;
    if (B.x0 > vx) poly(k, [project(B.x0, B.H, B.zf), project(B.x0, B.H, B.zb), project(B.x0, 0, B.zb), project(B.x0, 0, B.zf)], { fill: c.side, name: `${name}-side`, build: b });
    if (B.x1 < vx) poly(k, [project(B.x1, B.H, B.zf), project(B.x1, B.H, B.zb), project(B.x1, 0, B.zb), project(B.x1, 0, B.zf)], { fill: c.side, name: `${name}-side`, build: b });

    k.rect({ x: X(MM.foot.x0), y: Y(MM.foot.y0), w: (MM.foot.x1 - MM.foot.x0) * s, h: (MM.H - MM.foot.y0) * s, fill: c.foot, name: `${name}-foot`, build: b });
    k.rect({ x: x0, y: y0, w: W, h: MM.foot.y0 * s, fill: c.face, line: c.edge, lineW: 0.75, radius: MM.r * s, name, build: b });
    const ey0 = Y(MM.r), eh = (MM.foot.y0 - 2 * MM.r) * s;
    k.rect({ x: X(0.6), y: ey0, w: 3.4 * s, h: eh, fill: c.lit, name: `${name}-edge-l`, build: b });
    k.rect({ x: X(MM.W - 5.6), y: ey0, w: 5 * s, h: eh, fill: c.shade, name: `${name}-edge-r`, build: b });

    const r = MM.recess, g = MM.glass;
    poly(k, P([[r.x0, r.y0], [r.x1, r.y0], [g.x1, g.y0], [g.x0, g.y0]]), { fill: c.deep, name: `${name}-bevel-t`, build: b });
    poly(k, P([[r.x0, r.y0], [g.x0, g.y0], [g.x0, g.y1], [r.x0, r.y1]]), { fill: c.shade, name: `${name}-bevel-l`, build: b });
    poly(k, P([[r.x1, r.y0], [r.x1, r.y1], [g.x1, g.y1], [g.x1, g.y0]]), { fill: c.lit, name: `${name}-bevel-r`, build: b });
    poly(k, P([[r.x0, r.y1], [g.x0, g.y1], [g.x1, g.y1], [r.x1, r.y1]]), { fill: c.lit, name: `${name}-bevel-b`, build: b });
    k.rect({ x: X(g.x0), y: Y(g.y0), w: (g.x1 - g.x0) * s, h: (g.y1 - g.y0) * s, fill: c.crt, radius: g.r * s, name: `${name}-crt`, build: b });
    const rw = MM.raster.w, rh = MM.raster.h, ry0 = (g.y0 + g.y1) / 2 - rh / 2;
    const raster = { x: X((MM.W - rw) / 2), y: Y(ry0), w: rw * s, h: rh * s };
    k.rect({ ...raster, fill: c.screen, name: `${name}-screen`, build: b });
    return { x: x0, y: y0, w: W, h, right: x0 + W, bottom: baseY, cx, raster };
  },
};
