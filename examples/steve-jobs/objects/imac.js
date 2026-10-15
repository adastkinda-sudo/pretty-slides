// iMac (1998, the first, "Bondi Blue"), front elevation, real proportions: 386 × 401 × 447 mm (15.2 × 15.8 × 17.6 in).
// The translucent blue shell shows round the top and the sides and as the band at the bottom; the front is the frosted
// "ice" bezel round the 15-inch CRT; under the screen the slot of the CD tray and the two speaker grilles. No logo.
// Seen small on S19 (the iMac came first, 1998); it stands in the room's shade, so tone() dims it.
const { tone, poly } = require('../parts');

const MM = {
  W: 386, H: 401,
  rTop: 104, rBot: 46, dome: 9,                      // the top corners are much rounder than the bottom ones; the top bulges
  ice: { side: 13, top: 20, bottom: 362 },          // the frosted bezel inside the blue shell
  crt: { x0: 44, x1: 342, y0: 44, y1: 270, r: 18 },
  tray: { x0: 136, x1: 250, y0: 300, y1: 306 },
  spk: [[80, 318], [306, 318]], spkR: 21,
  ir: { cx: 193, cy: 382, w: 34, h: 9 },
};

const C = {
  shell: '1690AA', shellLit: '5DB7CB', shellDark: '0D687D',  // Bondi Blue, translucent: brighter where light passes
  ice: 'E5ECEC', iceShade: 'CFD9DA', iceLit: 'F1F5F4',
  crt: '2D3436', crtRim: '1E2426', glass: '4B5558',
  slot: '0F6F86', spk: 'B9C6C8', spkHole: '9AA9AC', ir: '274A54',
};

// a rounded outline: different radii at the top and the bottom, the top edge bulging by `dome` (mm → slide via P)
function outline(P, x0, y0, x1, y1, rT, rB, dome, n = 10) {
  const pts = [];
  const arc = (cx, cy, r, a0, a1) => { for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; pts.push(P(cx + r * Math.cos(a), cy - r * Math.sin(a))); } };
  arc(x0 + rT, y0 + rT, rT, 180, 90);
  for (let i = 1; i < n; i++) { const t = i / n; pts.push(P(x0 + rT + (x1 - x0 - 2 * rT) * t, y0 - dome * Math.sin(Math.PI * t))); }
  arc(x1 - rT, y0 + rT, rT, 90, 0);
  arc(x1 - rB, y1 - rB, rB, 0, -90);
  arc(x0 + rB, y1 - rB, rB, -90, -180);
  return pts;
}

module.exports = {
  real: { w: 386, h: 401, d: 447 },
  morph: 'obj-imac',
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    const c = tone(k, at, C);
    const s = h / MM.H, W = MM.W * s, x0 = cx - W / 2, y0 = baseY - h;   // the dome's crown is the top (401 mm)
    const P = (x, y) => [x0 + x * s, y0 + y * s];
    const b = at.build;
    // the shell: lit on the window side, darker away from it
    poly(k, outline(P, 0, MM.dome, MM.W, MM.H, MM.rTop, MM.rBot, MM.dome), { fill: c.shellDark, name, build: b });
    poly(k, outline(P, 0, MM.dome, MM.W - 10, MM.H, MM.rTop, MM.rBot, MM.dome), { fill: c.shell, name: `${name}-shell`, build: b });
    poly(k, outline(P, 0, MM.dome + 40, 26, MM.H - 40, 13, 13, 0), { fill: c.shellLit, transparency: 30, name: `${name}-shell-lit`, build: b });
    // the frosted bezel
    const ic = MM.ice;
    poly(k, outline(P, ic.side, ic.top, MM.W - ic.side, ic.bottom, MM.rTop - ic.side, 14, MM.dome * 0.8), { fill: c.iceShade, name: `${name}-ice`, build: b });
    poly(k, outline(P, ic.side, ic.top, MM.W - ic.side - 8, ic.bottom - 3, MM.rTop - ic.side, 12, MM.dome * 0.8), { fill: c.ice, name: `${name}-ice-face`, build: b });
    // the CRT in its opening: the rim, the dark glass, a soft reflection of the window in its upper left
    const t = MM.crt;
    const [cx0, cy0] = P(t.x0, t.y0), [cx1, cy1] = P(t.x1, t.y1);
    k.rect({ x: cx0, y: cy0, w: cx1 - cx0, h: cy1 - cy0, fill: c.crtRim, radius: t.r * s, name: `${name}-crt-rim`, build: b });
    const [gx0, gy0] = P(t.x0 + 7, t.y0 + 7), [gx1, gy1] = P(t.x1 - 7, t.y1 - 7);
    k.rect({ x: gx0, y: gy0, w: gx1 - gx0, h: gy1 - gy0, fill: c.crt, radius: (t.r - 6) * s, name: `${name}-crt`, build: b });
    poly(k, [P(t.x0 + 12, t.y0 + 60), P(t.x0 + 12, t.y0 + 100), P(t.x0 + 150, t.y0 + 12), P(t.x0 + 90, t.y0 + 12)], { fill: c.glass, transparency: 45, build: b });
    // under the screen: the CD tray, the speaker grilles; the infrared window in the blue band at the bottom
    const tr = MM.tray, [sx0, sy0] = P(tr.x0, tr.y0), [sx1, sy1] = P(tr.x1, tr.y1);
    k.rect({ x: sx0, y: sy0, w: sx1 - sx0, h: sy1 - sy0, fill: c.slot, name: `${name}-tray`, build: b });
    MM.spk.forEach(([u, v], i) => {
      const [px, py] = P(u, v);
      k.dot({ cx: px, cy: py, r: MM.spkR * s, fill: c.spk, name: `${name}-spk-${i}`, build: b });
      k.dot({ cx: px, cy: py, r: MM.spkR * 0.62 * s, line: c.spkHole, lineW: 0.5, build: b });
      k.dot({ cx: px, cy: py, r: MM.spkR * 0.22 * s, fill: c.spkHole, build: b });
    });
    const [ix, iy] = P(MM.ir.cx, MM.ir.cy);
    k.rect({ x: ix - MM.ir.w / 2 * s, y: iy - MM.ir.h / 2 * s, w: MM.ir.w * s, h: MM.ir.h * s, fill: c.ir, radius: MM.ir.h / 2 * s, build: b });
    const right = x0 + W;
    return { x: x0, y: baseY - h, w: W, h, right, bottom: baseY, cx };
  },
};
