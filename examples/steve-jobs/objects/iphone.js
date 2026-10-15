// iPhone (2007), front elevation, real proportions: 115 × 61 × 11.6 mm. Black glass edge to edge inside a polished
// bezel; a 3.5-inch screen (320 × 480, 48.96 × 73.44 mm); the earpiece slot; one round Home button with its rounded
// square. The aluminium back wraps round the sides: the left edge catches the low sun, the right edge is in shade.
// The screen shows the home-screen grid only as outlines (示意: 3 rows of 4 + the dock of 4) — no real icons, no logo.
// Morph: the body is 'obj-pocket' (S19's iPod uses the same names, so the iPod becomes the iPhone).
const { tone, poly } = require('../parts');

const MM = {
  W: 61, H: 115, r: 9.5,
  bezel: 1.3,                                       // polished ring around the glass
  screen: { x0: 6.02, y0: 20.6, w: 48.96, h: 73.44 },
  ear: { cx: 30.5, cy: 11.2, w: 10.5, h: 1.5 },
  home: { cx: 30.5, cy: 104.6, r: 5.6, icon: 4.2 },
};

const C = {
  alu: 'D9CDB7', aluShade: '857E73',               // the aluminium sides: lit left, shaded right
  bezel: 'B3AC9F', bezelLit: 'EAE1D0', bezelDark: '8E887E', // polished steel ring: lit left, darker right
  glass: '141414', screen: '1B1B1D', grid: '55524D',
  ear: '2B2B2B', earRim: '4A4A48',
  home: '1C1C1C', homeRim: '3C3B39', homeIcon: '8C8A85',
  glare: 'FFE2B4',                                  // the window reflected in the glass (the page's sunlight)
};

// clip a polygon to an axis-aligned rectangle (Sutherland–Hodgman)
function clipRect(pts, x0, y0, x1, y1) {
  const edges = [
    (p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1,
  ];
  const cut = [
    (a, b) => { const t = (x0 - a[0]) / (b[0] - a[0]); return [x0, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (x1 - a[0]) / (b[0] - a[0]); return [x1, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (y0 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), y0]; },
    (a, b) => { const t = (y1 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), y1]; },
  ];
  let out = pts;
  edges.forEach((inside, e) => {
    const inp = out;
    out = [];
    inp.forEach((cur, i) => {
      const prev = inp[(i + inp.length - 1) % inp.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut[e](prev, cur)); out.push(cur); } else if (inside(prev)) out.push(cut[e](prev, cur));
    });
  });
  return out;
}

module.exports = {
  real: { w: 61, h: 115, d: 11.6 },
  morph: 'obj-pocket',
  // at: { cx, baseY, h, name, shade, build, glare: true }
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    const c = tone(k, at, C);
    const s = h / MM.H, W = MM.W * s, x0 = cx - W / 2, y0 = baseY - h;
    const X = (mm) => x0 + mm * s, Y = (mm) => y0 + mm * s;
    const b = at.build;
    // body: the aluminium sides showing just past the bezel, then the bezel, then the glass
    k.rect({ x: x0, y: y0, w: W, h, fill: c.aluShade, radius: MM.r * s, name, build: b });
    k.rect({ x: x0, y: y0, w: W - 0.9 * s, h, fill: c.alu, radius: MM.r * s, name: `${name}-side`, build: b });
    k.rect({ x: X(0.7), y: Y(0.5), w: W - 1.4 * s, h: h - 1.0 * s, fill: c.bezel, radius: (MM.r - 0.6) * s, name: `${name}-bezel`, build: b });
    // the ring's straight sides catch the light on the left and fall away on the right (not into the round corners)
    k.rect({ x: X(0.75), y: Y(MM.r), w: 0.9 * s, h: (MM.H - 2 * MM.r) * s, fill: c.bezelLit, build: b });
    k.rect({ x: X(MM.W - 1.65 - 0.3), y: Y(MM.r), w: 0.9 * s, h: (MM.H - 2 * MM.r) * s, fill: c.bezelDark, build: b });
    const g = MM.bezel + 0.7;
    k.rect({ x: X(g), y: Y(g - 0.2), w: W - 2 * g * s, h: h - (2 * g - 0.4) * s, fill: c.glass, radius: (MM.r - g) * s, name: `${name}-glass`, build: b });
    // the screen and the home-screen grid (outlines only)
    const sc = MM.screen;
    const scr = { x: X(sc.x0), y: Y(sc.y0), w: sc.w * s, h: sc.h * s };
    k.rect({ ...scr, fill: c.screen, name: `${name}-screen`, build: b });
    const px = sc.w / 320; // mm per screen pixel
    const icon = (ix, iy) => k.rect({ x: X(sc.x0 + ix * px), y: Y(sc.y0 + iy * px), w: 57 * px * s, h: 57 * px * s, line: c.grid, lineW: 0.5, radius: 10 * px * s, build: at.gridBuild ?? b });
    [16, 92, 168, 244].forEach((ix) => [30, 118, 206].forEach((iy) => icon(ix, iy)));
    [16, 92, 168, 244].forEach((ix) => icon(ix, 408));
    // earpiece and the one button
    const e = MM.ear;
    k.rect({ x: X(e.cx - e.w / 2), y: Y(e.cy - e.h / 2), w: e.w * s, h: e.h * s, fill: c.ear, line: c.earRim, lineW: 0.5, radius: e.h * s / 2, name: `${name}-ear`, build: b });
    const hm = MM.home;
    k.dot({ cx: X(hm.cx), cy: Y(hm.cy), r: hm.r * s, fill: c.home, line: c.homeRim, lineW: 0.75, name: `${name}-button`, build: b });
    k.rect({ x: X(hm.cx - hm.icon / 2), y: Y(hm.cy - hm.icon / 2), w: hm.icon * s, h: hm.icon * s, line: c.homeIcon, lineW: 0.5, radius: 1.1 * s, name: `${name}-button-icon`, build: b });
    // the window, reflected in the glass: a soft band of the page's sunlight across the upper left (clipped to the glass)
    if (at.glare !== false && at.sun && at.sun.dir) {
      const gx0 = X(g + 0.6), gy0 = Y(g + 0.6), gx1 = X(MM.W - g - 0.6), gy1 = Y(MM.H - g - 0.6);
      const band = (a, w) => clipRect([[gx0 - 2, gy0 + a], [gx0 - 2 + 0, gy0 + a + w], [gx1 + 2, gy0 + a + w - 2.2], [gx1 + 2, gy0 + a - 2.2]], gx0, gy0 + 0.25, gx1, gy1 - 0.25);
      const wide = band(1.95, 1.05);   // kept clear of the glass's top and bottom: a pure diagonal
      if (wide.length > 2) poly(k, wide, { fill: c.glare, transparency: 92, name: `${name}-glare`, build: b });
    }
    return {
      x: x0, y: y0, w: W, h, right: x0 + W, bottom: baseY, cx,
      screen: scr, home: { cx: X(hm.cx), cy: Y(hm.cy), r: hm.r * s },
      edgeR: { x: x0 + W - 0.45 * s, y: Y(MM.H / 2) },
      edgeL: { x: x0 + 0.35 * s, y: Y(MM.H / 2) },
    };
  },
};
