// NeXT Computer (1988): a one-foot cube of matte black magnesium, 305 × 305 × 305 mm (S13 large, S14–S15 small in the
// corner, S16 back in the frame). Drawn in the room's true perspective (parts.project), the same camera as room.py:
// the front face, the side that faces the vanishing point (left side when the cube stands right of it, right side when
// left), and the top only when the cube is lower than the camera's eye (a small cube; the 1 ft cube of S13 is taller
// than the eye, so its top cannot be seen). With this camera the side shows only as a sliver — that is the truth of
// the room, not a drawing choice.
// Light: each face is shaded by the page's sun (parts.sunInfo → at.sun.dir, Lambert): the front catches most of it,
// the window side less, the top a little, the far side none. No logo, no badge; the front is drawn plain (the drive
// slot is left out), the way the cube is remembered: a perfect black cube.
const { project, worldBox, ROOM } = require('../parts');

const REAL = { w: 305, h: 305, d: 305 };
const HC = ROOM.camera.floorY - ROOM.camera.horizonY;       // the camera's eye height above the floor (world units)

const C = {
  dark: '141315',   // matte black magnesium with no direct sun on it
  lit: '46423C',    // the same in full sun (warm: the sun's colour on a dark matte surface) — it stays black, but reads as lit
  edge: '8A8378',   // the machined edges that catch the light (top and window side of the front)
};

module.exports = {
  real: REAL,
  morph: 'obj-cube',
  // at: { cx, baseY, h, name, sun, shade, build, edges: true }
  draw(k, at) {
    const B = worldBox(at, REAL);
    const P = (x, h, z) => project(x, h, z);
    const { x0, x1, H, zf, zb } = B;
    const name = at.name, b = at.build;

    // Lambert per face from the sun's direction d = (1, −s, −r): light comes from −d.
    const sun = at.sun && at.sun.dir ? at.sun : null;
    const lit = 1 - (at.shade || 0);
    const str = sun ? (sun.strength ?? 1) : 0;
    let Lf = 0, Ll = 0, Lt = 0;
    if (sun) {
      const [dx, dy, dz] = sun.dir, n = Math.hypot(dx, dy, dz);
      Lf = Math.max(0, -dz / n); Ll = Math.max(0, dx / n); Lt = Math.max(0, -dy / n);
    }
    // plus a little light from the room itself (the bright window side, the ceiling): even in the shade the top is
    // a touch lighter than the window side, the window side lighter than the front, the far side darkest
    const AMB = { front: 0.04, left: 0.10, top: 0.28, right: 0.0 };
    const shadeOf = (L, face) => k.mix(C.dark, C.lit, Math.min(1, AMB[face] + L * str * lit));

    // front face corners (screen)
    const F = { tl: P(x0, H, zf), tr: P(x1, H, zf), br: P(x1, 0, zf), bl: P(x0, 0, zf) };
    const K = { tl: P(x0, H, zb), tr: P(x1, H, zb), br: P(x1, 0, zb), bl: P(x0, 0, zb) };
    const vx = ROOM.camera.vx;
    const poly = (pts, fill, nm) => {
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const bx = Math.min(...xs), by = Math.min(...ys);
      k.shape('custGeom', {
        x: bx, y: by, w: Math.max(Math.max(...xs) - bx, 0.005), h: Math.max(Math.max(...ys) - by, 0.005), fill, name: nm, build: b,
        points: [...pts.map(([x, y]) => ({ x: x - bx, y: y - by })), { close: true }],
      });
    };

    // the side towards the vanishing point, then the top (if the eye is above it), then the front over both.
    // Side and top reach a hair under the front face so no seam of wall shows between the faces.
    const e = 0.012;
    const sh = ([x, y], dx, dy) => [x + dx, y + dy];
    if (x0 > vx) poly([sh(F.tl, e, 0), K.tl, K.bl, sh(F.bl, e, 0)], shadeOf(Ll, 'left'), `${name}-left`);
    if (x1 < vx) poly([sh(F.tr, -e, 0), K.tr, K.br, sh(F.br, -e, 0)], shadeOf(0, 'right'), `${name}-right`);
    if (H < HC) poly([sh(F.tl, 0, e), sh(F.tr, 0, e), K.tr, K.tl], shadeOf(Lt, 'top'), `${name}-top`);
    const fx = F.tl[0], fy = F.tl[1], fw = F.tr[0] - F.tl[0], fh = F.bl[1] - F.tl[1];
    k.rect({ x: fx, y: fy, w: fw, h: fh, fill: shadeOf(Lf, 'front'), name, build: b });
    // the machined edges catch the light: along the top and the window side of the front face
    if (at.edges !== false && sun && lit > 0.3) {
      const hi = k.mix(shadeOf(Lf, 'front'), C.edge, 0.55 + 0.4 * lit * str);
      const wgt = Math.max(0.5, Math.min(1.25, fw / 2.6));
      k.line({ x1: fx, y1: fy, x2: fx + fw, y2: fy, color: hi, weight: wgt, name: `${name}-edge-t`, build: b });
      k.line({ x1: fx, y1: fy, x2: fx, y2: fy + fh, color: hi, weight: wgt, name: `${name}-edge-l`, build: b });
    }

    return {
      x: fx, y: fy, w: fw, h: fh, right: fx + fw, bottom: fy + fh, cx: fx + fw / 2,
      back: { tl: K.tl, tr: K.tr, bl: K.bl, br: K.br }, front: F,
      // the visible outline's extreme x (front plus the sliver of side)
      left: Math.min(fx, K.tl[0]), outerRight: Math.max(fx + fw, K.tr[0]),
    };
  },
};
