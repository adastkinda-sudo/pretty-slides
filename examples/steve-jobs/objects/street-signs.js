// Two street-name signs crossed at a right angle on one post: Technology / Liberal Arts (S22, then S23).
// Real parts: blades 6 × 36 in (152 × 914 mm), white enamel with a dark border; a 2⅜-in (60 mm) round steel post;
// cast clamps that grip the blades' edges and stack them at 90°. The post is cut short to stand in the room
// (a street post is ~3 m; here the blades are what matters, so the post below them is 0.75 m).
// Drawn in the room's true perspective (parts.project), turned so that both blades are seen: "turn" is the angle of the
// Technology blade from the wall. The lettering is the fonts' own outlines (street-signs.glyphs.json, extracted with
// fontTools from Helvetica Neue Medium and Hoefler Text, with their kerning) projected onto each blade, so it
// foreshortens as a real sign does. That makes the two words shapes, not editable text — like the sign itself.
// room.py only knows boxes standing on the floor: it casts the post's shadow (real = the post). The blades and clamps
// throw their own shadows here, from the page's sun (at.sun: direction and window), clipped to the patch of light.
const path = require('path');
const { tone, poly, project, worldBox, ROOM } = require('../parts');
const GLYPHS = require(path.join(__dirname, 'street-signs.glyphs.json'));

const MM = {
  post: { d: 60.3, h: 750 },
  blade: { L: 914, H: 152, r: 14, border: 9, borderR: 9 },
  clamp: { d: 92, grip: 24 },                       // clamp diameter; how far it reaches over a blade's edge
  gap: 34,                                           // between the two blades
  text: { cap: 80, base: 40 },                       // cap height and baseline above the blade's bottom edge (mm)
};

const C = {
  enamelLit: 'FBF4E8', enamelShade: 'CFC8BC',        // the white face in the sun / turned away from it
  border: '3E3A35', letter: '26231F', edge: '9A9286',
  steel: '8B8780', steelLit: 'D8D3CA', steelDark: '57534D',
  shadow: 'D3CBBF',                                  // the dusk wall where the blades keep the sun off it
};

// Sutherland–Hodgman against a convex polygon (counter-clockwise or clockwise, auto)
function clipConvex(subject, clip) {
  const area = clip.reduce((a, p, i) => { const q = clip[(i + 1) % clip.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
  const sgn = Math.sign(area) || 1;
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const A = clip[i], B = clip[(i + 1) % clip.length];
    const inside = (p) => sgn * ((B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0])) >= 0;
    const cut = (p, q) => {
      const d1 = (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]);
      const d2 = (B[0] - A[0]) * (q[1] - A[1]) - (B[1] - A[1]) * (q[0] - A[0]);
      const t = d1 / (d1 - d2);
      return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
    };
    const inp = out;
    out = [];
    inp.forEach((cur, j) => {
      const prev = inp[(j + inp.length - 1) % inp.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); } else if (inside(prev)) out.push(cut(prev, cur));
    });
  }
  return out;
}

// a rounded rectangle in a blade's own plane (a along it, v up), as points
function rounded(a0, a1, v0, v1, r, n = 5) {
  const pts = [];
  const arc = (ca, cv, t0) => { for (let i = 0; i <= n; i++) { const t = (t0 + 90 * i / n) * Math.PI / 180; pts.push([ca + r * Math.cos(t), cv + r * Math.sin(t)]); } };
  arc(a1 - r, v0 + r, 270); arc(a1 - r, v1 - r, 0); arc(a0 + r, v1 - r, 90); arc(a0 + r, v0 + r, 180);
  return pts;
}

// one native shape, several closed sub-paths (letters with counters)
function shapes(k, contours, { fill, name, build, transparency }) {
  const all = contours.flat();
  const bx = Math.min(...all.map((p) => p[0])), by = Math.min(...all.map((p) => p[1]));
  const bw = Math.max(Math.max(...all.map((p) => p[0])) - bx, 0.01), bh = Math.max(Math.max(...all.map((p) => p[1])) - by, 0.01);
  const points = [];
  contours.forEach((c) => {
    c.forEach(([x, y], i) => points.push(i === 0 ? { x: x - bx, y: y - by, moveTo: true } : { x: x - bx, y: y - by }));
    points.push({ close: true });
  });
  k.shape('custGeom', { x: bx, y: by, w: bw, h: bh, fill, name, build, transparency, points });
}

module.exports = {
  real: { w: MM.post.d, h: MM.post.h, d: MM.post.d },
  morph: 'obj-street-signs',
  // at: { cx, baseY, h, name, sun, shade, turn (deg), upper: 'Technology' | 'Liberal Arts', build, signBuild: [[step, delay], [step, delay]] }
  draw(k, at) {
    const c = C;                                       // the blades and clamps judge their own light (below)
    const cp = tone(k, at, C);                         // the post: room.py knows how much of it is in the sun
    const B = worldBox(at, module.exports.real);
    const mm = B.mm;
    const xa = (B.x0 + B.x1) / 2, za = (B.zf + B.zb) / 2;
    const name = at.name;
    const P = (x, h, z) => project(x, h, z);
    const sun = at.sun && at.sun.dir ? at.sun : null;
    const sunC = sun ? sun.color : null;
    const cam = [ROOM.camera.vx, ROOM.camera.floorY - ROOM.camera.horizonY, ROOM.camera.camZ];

    // heights (world) of the parts, from the top of the post up
    const hp = B.H;
    const bl = MM.blade, cl = MM.clamp;
    const lowV0 = hp + 26 * mm, lowV1 = lowV0 + bl.H * mm;
    const upV0 = lowV1 + MM.gap * mm, upV1 = upV0 + bl.H * mm;
    const turn = (at.turn ?? 28) * Math.PI / 180;
    const upper = at.upper || 'Technology';
    const words = ['Technology', 'Liberal Arts'];
    // Technology's blade runs at `turn` from the wall (its right end towards us when turn > 0); Liberal Arts' at 90° to it
    const dirOf = (w) => (w === 'Technology' ? [Math.cos(turn), Math.sin(turn)] : [-Math.sin(turn), Math.cos(turn)]);
    const L = sun ? (() => { const d = sun.dir; const n = Math.hypot(...d); return [-d[0] / n, -d[1] / n, -d[2] / n]; })() : [0, 0, 1];

    const blades = words.map((w, i) => {
      let [ux, uz] = dirOf(w);
      const v0 = w === upper ? upV0 : lowV0, v1 = v0 + bl.H * mm;
      const vm = (v0 + v1) / 2;
      // the face we see; the end that is on the right of the screen is where the word ends
      let n = [-uz, 0, ux];
      if (n[0] * (cam[0] - xa) + n[1] * (cam[1] - vm) + n[2] * (cam[2] - za) < 0) n = n.map((q) => -q);
      const half = bl.L / 2 * mm;
      if (P(xa + ux * half, vm, za + uz * half)[0] < P(xa - ux * half, vm, za - uz * half)[0]) { ux = -ux; uz = -uz; }
      const W = (a, v) => [xa + ux * a * mm, v0 + v * mm, za + uz * a * mm];   // blade plane (mm) → world
      const S = (a, v) => P(...W(a, v));
      // how the face takes the sun: relative to the wall in the same light
      const lam = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / Math.max(1e-6, L[2]);
      return { w, i, ux, uz, n, v0, v1, W, S, lam, near: Math.max(za + uz * half, za - uz * half) };
    });

    // lit by the sun at all? (ray back to the window in the left wall)
    const win = sun && sun.window, XL = ROOM.window.XL;
    const litAt = ([x, h, z]) => {
      if (!sun) return true;
      const [dx, dh, dz] = sun.dir, t = (x - XL) / dx;
      const zw = z - dz * t, hw = h - dh * t;
      return t > 0 && zw >= win.z[0] && zw <= win.z[1] && hw >= win.h[0] && hw <= win.h[1];
    };

    const signB = at.signBuild || [at.build, at.build];
    const out = { blades: {} };

    // ── shadows on the wall (drawn first: they lie on the wall, under everything) ──
    if (sun) {
      const [dx, dh, dz] = sun.dir;
      const toWall = ([x, h, z]) => { const t = -z / dz; return [x + dx * t, h + dh * t]; };   // world → wall (x, h)
      const r = -dz / dx, s = -dh / dx;
      const xa0 = XL + win.z[0] / r, xa1 = XL + win.z[1] / r;
      const patch = [[xa0, win.h[0] - s * (xa0 - XL)], [xa1, win.h[0] - s * (xa1 - XL)], [xa1, win.h[1] - s * (xa1 - XL)], [xa0, win.h[1] - s * (xa0 - XL)]];
      const floorCut = [[-50, 0], [50, 0], [50, 50], [-50, 50]];
      const scr = (pts) => pts.map(([x, h]) => [x, ROOM.camera.floorY - h]);
      const cast = (worldPts, build, nm) => {
        let sh = clipConvex(worldPts.map(toWall), patch);
        sh = clipConvex(sh, floorCut);
        if (sh.length < 3) return;
        const pts = clipConvex(scr(sh), [[0.08, 0.08], [k.W - 0.08, 0.08], [k.W - 0.08, k.H - 0.08], [0.08, k.H - 0.08]]);
        if (pts.length < 3) return;
        const soft = (sun.soft || 0.06) * 0.6;
        // penumbra: the same shape nudged four ways, faint; then the core
        [[soft, 0], [-soft, 0], [0, soft], [0, -soft]].forEach(([ox, oy]) => poly(k, pts.map(([x, y]) => [x + ox, y + oy]), { fill: c.shadow, transparency: 78, build }));
        poly(k, pts, { fill: c.shadow, transparency: 35, name: nm, build });
      };
      blades.forEach((b) => cast(rounded(-bl.L / 2, bl.L / 2, 0, bl.H, bl.r).map(([a, v]) => b.W(a, v)), signB[b.w === upper ? 0 : 1], `${name}-shadow-${b.i}`));
      // the clamps and the cap, as a slab across the light
      const perp = [-L[2], L[0]]; const pn = Math.hypot(...perp); const px_ = perp[0] / pn * cl.d / 2 * mm, pz = perp[1] / pn * cl.d / 2 * mm;
      cast([[xa - px_, hp, za - pz], [xa + px_, hp, za + pz], [xa + px_, upV1 + 40 * mm, za + pz], [xa - px_, upV1 + 40 * mm, za - pz]], signB[0], `${name}-shadow-clamps`);
    }

    // ── the post: a steel tube, bright on the window side ──
    const [p0x, p0y] = P(B.x0, hp, B.zf), [p1x, p1y] = P(B.x1, 0, B.zf);
    const pw = p1x - p0x;
    k.rect({ x: p0x, y: p0y, w: pw, h: p1y - p0y, fill: cp.steel, name, build: at.build });
    k.rect({ x: p0x + pw * 0.08, y: p0y, w: pw * 0.3, h: p1y - p0y, fill: cp.steelLit, name: `${name}-post-lit`, build: at.build });
    k.rect({ x: p0x + pw * 0.72, y: p0y, w: pw * 0.28, h: p1y - p0y, fill: cp.steelDark, name: `${name}-post-dark`, build: at.build });

    // ── the blades: the far one first. Each: face (lit or turned away), its border, its word ──
    const order = [...blades].sort((a, b) => a.near - b.near);
    order.forEach((b) => {
      // share of the face in the sun (a 9 × 3 grid of points), for the face's tone; reported for the page to check
      let n = 0, m = 0;
      for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { m++; if (litAt(b.W(-bl.L / 2 + bl.L * (i + 0.5) / 9, bl.H * (j + 0.5) / 3))) n++; }
      const lit = n / m;
      if (lit < 0.98 && process.env.SIGNS_DEBUG) console.warn(`  · ${b.w} blade: ${(lit * 100).toFixed(0)}% in the sun`);
      const t = lit * Math.min(1, b.lam);
      // in the sun the white enamel takes the dusk's colour; turned away, the room's dim light
      const litC = sunC ? k.mix(c.enamelLit, sunC, 0.5) : c.enamelLit;
      const face = k.mix(c.enamelShade, litC, t);
      const bb = signB[b.w === upper ? 0 : 1];
      const outline = rounded(-bl.L / 2, bl.L / 2, 0, bl.H, bl.r).map(([a, v]) => b.S(a, v));
      poly(k, outline, { fill: face, line: c.edge, lineW: 0.5, name: `${name}-blade-${b.i}`, build: bb });
      const inset = bl.border;
      poly(k, rounded(-bl.L / 2 + inset, bl.L / 2 - inset, inset, bl.H - inset, bl.borderR).map(([a, v]) => b.S(a, v)), { line: c.border, lineW: 1, build: bb });
      // the word, from the font's outlines, laid on the blade and projected
      const g = GLYPHS[b.w];
      const em = MM.text.cap / g.cap;
      const a0 = -g.width * em / 2;
      const contours = g.contours.map((cn) => cn.map(([gx, gy]) => b.S(a0 + gx * em, MM.text.base + gy * em)));
      shapes(k, contours, { fill: c.letter, name: `${name}-word-${b.i}`, build: bb });
      const mid = b.S(0, bl.H / 2);
      out.blades[b.w] = { mid, left: b.S(-bl.L / 2, bl.H / 2), right: b.S(bl.L / 2, bl.H / 2), lit, lam: b.lam };
    });

    // ── the clamps: grip the lower blade on the post, hold the upper one on the lower one, and a cap ──
    const clampAt = (h0, h1, slots, nm, build, dome) => {
      const rr = cl.d / 2 * mm;
      const [ax0, ay0] = P(xa - rr, h1, za + rr), [ax1, ay1] = P(xa + rr, h0, za + rr);   // the clamp's front
      const w = ax1 - ax0, top = dome ? w * 0.16 : 0;
      k.rect({ x: ax0, y: ay0, w, h: ay1 - ay0, fill: c.steel, radius: dome ? w * 0.3 : w * 0.06, name: nm, build });
      k.rect({ x: ax0 + w * 0.1, y: ay0 + top, w: w * 0.26, h: ay1 - ay0 - top - w * 0.03, fill: c.steelLit, build });
      k.rect({ x: ax0 + w * 0.76, y: ay0 + top, w: w * 0.2, h: ay1 - ay0 - top - w * 0.03, fill: c.steelDark, build });
      // the slots the blades' edges go into: a dark line with a bright lip under it
      slots.forEach((hs) => {
        const ys = P(xa, hs, za + rr)[1];
        k.rect({ x: ax0, y: ys - 0.012, w, h: 0.024, fill: c.steelDark, build });
        k.rect({ x: ax0, y: ys + 0.012, w, h: 0.01, fill: c.steelLit, build });
      });
    };
    clampAt(hp - 46 * mm, lowV0 + cl.grip * mm, [lowV0], `${name}-clamp-0`, signB[1]);
    clampAt(lowV1 - cl.grip * mm, upV0 + cl.grip * mm, [lowV1, upV0], `${name}-clamp-1`, signB[0]);
    clampAt(upV1 - cl.grip * mm, upV1 + 40 * mm, [upV1], `${name}-cap`, signB[0], true);

    const [tx, ty] = P(xa, upV1 + 40 * mm, za);
    const [bx, by] = P(xa, 0, B.zf);
    const crossing = P(xa, (lowV1 + upV0) / 2, za);
    return { ...out, x: p0x, y: ty, w: pw, h: by - ty, right: p1x, bottom: by, cx: bx, top: [tx, ty], crossing: { x: crossing[0], y: crossing[1] } };
  },
};
