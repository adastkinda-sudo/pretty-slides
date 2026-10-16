// iPod (first generation, 2001), front elevation, real proportions: 102 × 61.8 × 19.9 mm (Apple's spec: 4.02 × 2.43 ×
// 0.78 in). A glossy white polycarbonate front inside the polished steel back, which shows as a thin rim at the sides;
// a 2-inch monochrome LCD (160 × 128 pixels, about 39.7 × 31.7 mm) in a dark window; below it the mechanical scroll
// wheel, ringed by its four buttons (MENU on top, previous and next at the sides, play/pause below) and with the select
// button in its centre. No logo (the first iPod's front carries none).
// The screen shows the main menu of iPod software 1.x as an illustration (示意): the real one was set in Chicago, the
// 1984 Mac's system face, which no current Mac has; Arial stands in.
// Morph: the body parts carry the same names as objects/iphone.js — 'obj-pocket' (body), -side, -bezel, -glass (the
// white front → the black glass), -screen, -button (select button → Home button), -glare — so the iPod becomes the
// iPhone (S19 → S20). The wheel, its buttons and the screen's menu have their own names and fade out.
const { tone, poly } = require('../parts');

const MM = {
  W: 61.8, H: 102, r: 5.6,
  rim: 0.55,                                         // the steel back, seen past the front's edge
  edge: 1.25,                                        // the front's rounded edge (darker white)
  window: { x0: 9.0, y0: 9.2, x1: 52.8, y1: 44.2, r: 0.9 },
  lcd: { w: 39.7, h: 31.7 },                         // 160 × 128 pixels
  wheel: { cx: 30.9, cy: 73.2, ring: 21.2, wheel: 15.3, button: 7.3 },
};

const C = {
  steel: '8F8A82', steelLit: 'E9E5DD',               // polished steel: the window side bright, the far side dark
  edge: 'DCD6CB', edgeLit: 'F4F0E8', edgeDark: 'C9C2B6',
  face: 'F8F6F1',                                    // white polycarbonate (warmed by the sun below)
  ring: 'F6F3EE', wheel: 'EFEBE4', button: 'F8F6F1',
  seam: 'A49E94', lip: 'FFFFFF', label: '6F6B64',
  window: '33352F', lcd: 'BCC2B2', pixel: '20251F',
  glare: 'FFFFFF',
};

// clip a polygon to an axis-aligned rectangle (Sutherland–Hodgman)
function clipRect(pts, x0, y0, x1, y1) {
  const inside = [(p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1];
  const cut = [
    (a, b) => [x0, a[1] + (x0 - a[0]) / (b[0] - a[0]) * (b[1] - a[1])],
    (a, b) => [x1, a[1] + (x1 - a[0]) / (b[0] - a[0]) * (b[1] - a[1])],
    (a, b) => [a[0] + (y0 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]), y0],
    (a, b) => [a[0] + (y1 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]), y1],
  ];
  let out = pts;
  inside.forEach((ins, e) => {
    const inp = out;
    out = [];
    inp.forEach((cur, i) => {
      const prev = inp[(i + inp.length - 1) % inp.length];
      if (ins(cur)) { if (!ins(prev)) out.push(cut[e](prev, cur)); out.push(cur); } else if (ins(prev)) out.push(cut[e](prev, cur));
    });
  });
  return out;
}

// points along a circular arc (degrees, 0 = right, counter-clockwise as on paper: y grows downwards on the slide)
const arcPts = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
});

module.exports = {
  real: { w: 61.8, h: 102, d: 19.9 },
  morph: 'obj-pocket',
  // at: { cx, baseY, h, name, sun, shade, build, menu: { items, pick } }
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    // white in the afternoon sun is warm; out of it, the room's shade (tone) takes over
    const sunC = at.sun && at.sun.color ? at.sun.color : 'FFFFFF';
    const warm = {};
    for (const [key, v] of Object.entries(C)) warm[key] = ['face', 'ring', 'wheel', 'button', 'edge', 'edgeLit', 'edgeDark', 'steelLit'].includes(key) ? k.mix(v, sunC, 0.2) : v;
    const c = tone(k, at, warm);
    const s = h / MM.H, W = MM.W * s, x0 = cx - W / 2, y0 = baseY - h;
    const X = (mm) => x0 + mm * s, Y = (mm) => y0 + mm * s;
    const b = at.build;

    // body: the steel rim (dark side, then the lit side), the front's rounded edge, the white face
    k.rect({ x: x0, y: y0, w: W, h, fill: c.steel, radius: MM.r * s, name, build: b });
    k.rect({ x: x0, y: y0, w: W - 0.9 * s, h, fill: c.steelLit, radius: MM.r * s, name: `${name}-side`, build: b });
    const e0 = MM.rim;
    k.rect({ x: X(e0), y: Y(e0 * 0.6), w: W - 2 * e0 * s, h: h - 1.2 * e0 * s, fill: c.edge, radius: (MM.r - e0) * s, name: `${name}-bezel`, build: b });
    // the edge turns towards the window on the left (bright) and away from it on the right
    k.rect({ x: X(e0 + 0.05), y: Y(MM.r), w: 0.75 * s, h: (MM.H - 2 * MM.r) * s, fill: c.edgeLit, name: `${name}-edge-l`, build: b });
    k.rect({ x: X(MM.W - e0 - 0.8), y: Y(MM.r), w: 0.75 * s, h: (MM.H - 2 * MM.r) * s, fill: c.edgeDark, name: `${name}-edge-r`, build: b });
    const g = MM.rim + MM.edge;
    k.rect({ x: X(g), y: Y(g - 0.35), w: W - 2 * g * s, h: h - (2 * g - 0.7) * s, fill: c.face, radius: (MM.r - g * 0.7) * s, name: `${name}-glass`, build: b });

    // the screen: a dark window, the grey-green LCD in it, the menu on the LCD (示意)
    const wn = MM.window;
    k.rect({ x: X(wn.x0), y: Y(wn.y0), w: (wn.x1 - wn.x0) * s, h: (wn.y1 - wn.y0) * s, fill: c.window, radius: wn.r * s, name: `${name}-window`, build: b });
    const lx0 = (wn.x0 + wn.x1) / 2 - MM.lcd.w / 2, ly0 = (wn.y0 + wn.y1) / 2 - MM.lcd.h / 2;
    const lcd = { x: X(lx0), y: Y(ly0), w: MM.lcd.w * s, h: MM.lcd.h * s };
    k.rect({ ...lcd, fill: c.lcd, name: `${name}-screen`, build: b });
    // the LCD's inner shadow along its top and left (it sits a little behind the window)
    k.rect({ x: lcd.x, y: lcd.y, w: lcd.w, h: 0.6 * s, fill: c.pixel, transparency: 82, name: `${name}-lcd-shade-t`, build: b });
    k.rect({ x: lcd.x, y: lcd.y, w: 0.6 * s, h: lcd.h, fill: c.pixel, transparency: 86, name: `${name}-lcd-shade-l`, build: b });
    const P = MM.lcd.w / 160 * s;                       // one LCD pixel, in inches
    const PX = (px) => lcd.x + px * P, PY = (py) => lcd.y + py * P;
    const menu = at.menu || { title: 'iPod', items: ['Playlists', 'Browse', 'Settings', 'About'], pick: 1 };
    const fs = 12 * P * 72;                             // a 12-pixel face (as Chicago 12) on 18-pixel rows
    k.text(menu.title, { style: 'year', font: 'latinMedium', size: fs, tracking: 0, color: c.pixel, x: PX(8), y: PY(1), w: 144 * P, h: 17 * P, align: 'center', valign: 'middle', nowrap: true, name: `${name}-lcd-title`, build: b });
    // battery, top right
    k.rect({ x: PX(136), y: PY(6), w: 15 * P, h: 7 * P, line: c.pixel, lineW: 0.5, name: `${name}-lcd-battery`, build: b });
    k.rect({ x: PX(151), y: PY(8), w: 1.6 * P, h: 3 * P, fill: c.pixel, build: b });
    k.rect({ x: PX(137.5), y: PY(7.5), w: 9 * P, h: 4 * P, fill: c.pixel, build: b });
    k.rect({ x: PX(0), y: PY(19), w: 160 * P, h: 1 * P, fill: c.pixel, name: `${name}-lcd-rule`, build: b });
    menu.items.forEach((t, i) => {
      const ry = 21 + i * 18, on = i === menu.pick;
      if (on) k.rect({ x: PX(0), y: PY(ry), w: 160 * P, h: 18 * P, fill: c.pixel, name: `${name}-lcd-pick`, build: b });
      const ink = on ? c.lcd : c.pixel;
      k.text(t, { style: 'year', font: 'latinMedium', size: fs, tracking: 0, color: ink, x: PX(6), y: PY(ry - 1), w: 110 * P, h: 18 * P, valign: 'middle', nowrap: true, build: b });
      // the '>' at the right of each row
      const ax = PX(149), ay = PY(ry + 9);
      poly(k, [[ax - 2.4 * P, ay - 4 * P], [ax + 2.2 * P, ay], [ax - 2.4 * P, ay + 4 * P], [ax - 2.4 * P, ay + 2.6 * P], [ax + 0.6 * P, ay], [ax - 2.4 * P, ay - 2.6 * P]], { fill: ink, build: b });
    });

    // the wheel: the ring of four buttons, the scroll wheel inside it, the select button in the centre
    const wl = MM.wheel;
    const wc = { x: X(wl.cx), y: Y(wl.cy) };
    const R = { ring: wl.ring * s, wheel: wl.wheel * s, button: wl.button * s };
    k.dot({ cx: wc.x, cy: wc.y, r: R.ring, fill: c.ring, line: c.seam, lineW: 0.5, name: `${name}-ring`, build: b });
    k.dot({ cx: wc.x, cy: wc.y, r: R.wheel, fill: c.wheel, line: c.seam, lineW: 0.75, name: `${name}-wheel`, build: b });
    // each seam is a groove: its far (lower right) lip catches the light
    const lip = (r) => poly(k, [...arcPts(wc.x, wc.y, r + 0.012, 200, 340), ...arcPts(wc.x, wc.y, r + 0.004, 340, 200)], { fill: c.lip, transparency: 25, build: b });
    lip(R.wheel); lip(R.button);
    // the four buttons are separated on the diagonals
    [45, 135, 225, 315].forEach((a) => {
      const t = a * Math.PI / 180, u = [Math.cos(t), -Math.sin(t)];
      k.line({ x1: wc.x + u[0] * (R.wheel + 0.01), y1: wc.y + u[1] * (R.wheel + 0.01), x2: wc.x + u[0] * (R.ring - 0.01), y2: wc.y + u[1] * (R.ring - 0.01), color: c.seam, weight: 0.5, build: b });
    });
    k.dot({ cx: wc.x, cy: wc.y, r: R.button, fill: c.button, line: c.seam, lineW: 0.75, name: `${name}-button`, build: b });
    // the select button is very slightly domed: a soft highlight towards the window
    k.dot({ cx: wc.x - R.button * 0.2, cy: wc.y - R.button * 0.22, r: R.button * 0.62, fill: c.lip, transparency: 72, build: b });

    // the buttons' marks, printed in grey: MENU, previous, next, play/pause
    const mid = (R.wheel + R.ring) / 2, m = s;              // marks are sized in mm
    k.text('MENU', { style: 'year', font: 'latinMedium', size: 2.4 * s * 72, tracking: 6, color: c.label, x: wc.x - 0.5, y: wc.y - mid - 1.6 * m, w: 1.0, h: 3.2 * m, align: 'center', valign: 'middle', nowrap: true, name: `${name}-menu`, build: b });
    const tri = (x, y, dir, w = 1.9, hh = 2.2) => poly(k, dir > 0
      ? [[x, y - hh / 2 * m], [x + w * m, y], [x, y + hh / 2 * m]]
      : [[x, y - hh / 2 * m], [x - w * m, y], [x, y + hh / 2 * m]], { fill: c.label, build: b });
    const bar = (x, y, w = 0.45, hh = 2.2) => k.rect({ x, y: y - hh / 2 * m, w: w * m, h: hh * m, fill: c.label, build: b });
    // next ▶▶| at the right
    let x = wc.x + mid - 2.6 * m, y = wc.y;
    tri(x, y, 1); tri(x + 1.7 * m, y, 1); bar(x + 3.6 * m, y);
    // previous |◀◀ at the left
    x = wc.x - mid + 2.6 * m;
    tri(x, y, -1); tri(x - 1.7 * m, y, -1); bar(x - 4.05 * m, y);
    // play/pause ▶❙❙ below
    x = wc.x - 2.4 * m; y = wc.y + mid;
    tri(x, y, 1); bar(x + 2.6 * m, y); bar(x + 3.6 * m, y);

    // the window, reflected in the glossy front: a soft band across the upper left (clipped to the face)
    if (at.glare !== false && at.sun && at.sun.dir) {
      const gx0 = X(g + 0.5), gy0 = Y(g + 0.5), gx1 = X(MM.W - g - 0.5), gy1 = Y(MM.H - g - 0.5);
      const band = clipRect([[gx0 - 2, gy0 + 2.05], [gx0 - 2, gy0 + 2.95], [gx1 + 2, gy0 + 0.75], [gx1 + 2, gy0 - 0.15]], gx0, gy0 + 0.2, gx1, gy1 - 0.2);
      if (band.length > 2) poly(k, band, { fill: c.glare, transparency: 80, name: `${name}-glare`, build: b });
    }

    return {
      x: x0, y: y0, w: W, h, right: x0 + W, bottom: baseY, cx,
      screen: lcd,
      wheel: { cx: wc.x, cy: wc.y, ring: R.ring, wheel: R.wheel, button: R.button },
      edgeR: { x: x0 + W - 0.3 * s, y: Y(MM.H / 2) },
    };
  },
};
