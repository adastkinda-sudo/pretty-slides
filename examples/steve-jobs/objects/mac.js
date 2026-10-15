// Macintosh 128K (1984), front elevation, drawn to its real proportions (S10; the front half again in S11, S23).
// Case 244 × 345 × 277 mm. Model in mm from the top-left of the front face. Lit by the sun from the upper left, so the
// screen recess is dark along its top and left inner faces and bright along its right and bottom; the case's rounded
// left edge turns towards the window, the right one away from it. No logo, no badge.
const { tone, poly } = require('../parts');

const C = {
  face: 'E3DAC6', edge: '958A73', shade: 'D2C9B4', deep: 'C2B8A1', lit: 'EEE8DA', foot: '9C927E',
  crt: '3A3732', screen: 'F6F5EF',
};

const MM = {
  W: 244, H: 345,
  face: { y1: 336, r: 9 },                        // the front bezel; below it the recessed foot
  foot: { x0: 7, x1: 237, y0: 330 },
  recess: { x0: 19, x1: 225, y0: 23, y1: 178 },  // opening of the screen recess
  glass: { x0: 30, x1: 214, y0: 35, y1: 169, r: 7 },
  active: { x0: 37, x1: 207, aspect: 512 / 342 }, // 512 × 342 pixels, black border around it
  slot: { x0: 123, x1: 210, y0: 235.5, y1: 241 }, // 3½-inch floppy drive, right of centre on the chin
  eject: { cx: 219.5, cy: 238.25, r: 1.5 },
};

module.exports = {
  real: { w: 244, h: 345, d: 277 },
  // at: { cx, baseY, h, name, shade } — from rooms/<ID>.json via parts.place(); returns anchors for annotations.
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    const c = tone(k, at, C);
    const s = h / MM.H, M = MM;
    const W = M.W * s, x0 = cx - W / 2, y0 = baseY - h;
    const X = (mm) => x0 + mm * s, Y = (mm) => y0 + mm * s;
    const P = (pts) => pts.map(([x, y]) => [X(x), Y(y)]);
    // foot (in its own shadow), then the face over it
    k.rect({ x: X(M.foot.x0), y: Y(M.foot.y0), w: (M.foot.x1 - M.foot.x0) * s, h: (M.H - M.foot.y0) * s, fill: c.foot, name: `${name}-foot` });
    k.rect({ x: x0, y: y0, w: W, h: M.face.y1 * s, fill: c.face, line: c.edge, lineW: 0.75, radius: M.face.r * s, name });
    // the case's rounded vertical edges
    const ey0 = Y(M.face.r), eh = (M.face.y1 - 2 * M.face.r) * s;
    k.rect({ x: X(0.6), y: ey0, w: 3.2 * s, h: eh, fill: c.lit, name: `${name}-edge-l` });
    k.rect({ x: X(M.W - 5.6), y: ey0, w: 5 * s, h: eh, fill: c.shade, name: `${name}-edge-r` });
    // the screen recess: four inner faces
    const r = M.recess, g = M.glass;
    poly(k, P([[r.x0, r.y0], [r.x1, r.y0], [g.x1, g.y0], [g.x0, g.y0]]), { fill: c.deep, name: `${name}-bevel-t` });
    poly(k, P([[r.x0, r.y0], [g.x0, g.y0], [g.x0, g.y1], [r.x0, r.y1]]), { fill: c.shade, name: `${name}-bevel-l` });
    poly(k, P([[r.x1, r.y0], [r.x1, r.y1], [g.x1, g.y1], [g.x1, g.y0]]), { fill: c.lit, name: `${name}-bevel-r` });
    poly(k, P([[r.x0, r.y1], [g.x0, g.y1], [g.x1, g.y1], [r.x1, r.y1]]), { fill: c.lit, name: `${name}-bevel-b` });
    k.rect({ x: X(g.x0), y: Y(g.y0), w: (g.x1 - g.x0) * s, h: (g.y1 - g.y0) * s, fill: c.crt, radius: g.r * s, name: `${name}-crt` });
    const aw = M.active.x1 - M.active.x0, ah = aw / M.active.aspect, ay0 = (g.y0 + g.y1) / 2 - ah / 2;
    const active = { x: X(M.active.x0), y: Y(ay0), w: aw * s, h: ah * s };
    k.rect({ ...active, fill: c.screen, name: `${name}-screen` });
    // the chin: floppy slot and the manual-eject pinhole
    const sl = M.slot;
    k.rect({ x: X(sl.x0), y: Y(sl.y0), w: (sl.x1 - sl.x0) * s, h: (sl.y1 - sl.y0) * s, fill: c.crt, radius: (sl.y1 - sl.y0) * s / 2, name: `${name}-slot` });
    k.dot({ cx: X(M.eject.cx), cy: Y(M.eject.cy), r: M.eject.r * s, fill: c.edge, name: `${name}-eject` });
    return { x: x0, y: y0, w: W, h, right: x0 + W, bottom: baseY, cx, active };
  },
};
