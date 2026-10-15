// Apple II (1977): the beige case with the keyboard built in, 394 × 114 × 457 mm (15½ × 4½ × 18 in, Computer History
// Museum record). Drawn in the room's true perspective (parts.worldBox / project), because the camera's eye is above the
// case: we look down onto it and see what makes it the Apple II — the low front, the keyboard on its sloping deck, the
// step up to the lid, the flat lid running back.
// Profile (mm, zz from the front, h above the floor): bottom pan 0–6 (inset), front face 6–46, the deck slopes from
// (zz 0, h 46) to (zz 150, h 82), the lid's front lip rises to h 110 at zz 156, the lid runs back to zz 457 at h 114.
// Keyboard: 52 keys (13 · 13 · 13 · 12 + the space bar), 19.05 mm pitch, dark brown keycaps in a dark well.
// Light: the sun comes from the left, from above and from our side, so faces that look at us (the front, the lid's lip,
// the fronts of the keys) are lit; the deck less, the lid top least (it only grazes it). No badge, no logo.
// rooms/<ID>.json: { "use": "apple2", "cx", "baseY", "h", "shadow": false } + shadow-only boxes for its stepped profile
// (one box would cast the low front as if it were as tall as the lid).
const { project, worldBox, poly } = require('../parts');

const REAL = { w: 394, h: 114, d: 457 };
const C = {
  front: 'E5DBC5', deck: 'D8CDB5', lip: 'E2D8C2', lid: 'CFC4AC', edgeLit: 'F1EBDD', edgeDark: 'B9AE96',
  pan: '8A8174', well: '2A2420', keyFront: '6E5E4F', keyTop: '3B332D', keyEdge: '8A7863', led: 'F3EFE6',
};

// keyboard rows, back to front: [zz of the key row centre along the deck, x of the first key, [key widths in pitches]]
const P = 19.05;
const KEYS = [
  [124, 74, Array(13).fill(1)],                       // 1 2 3 4 5 6 7 8 9 0 : - RESET
  [105, 64, Array(13).fill(1)],                       // ESC Q W E R T Y U I O P REPT RETURN
  [86, 69, Array(13).fill(1)],                        // CTRL A S D F G H J K L ; ← →
  [67, 59, [1.5, ...Array(10).fill(1), 1.5]],         // SHIFT Z X C V B N M , . / SHIFT
  [48, 126, [8]],                                     // space bar
];

module.exports = {
  real: REAL,
  morph: 'obj-apple2',
  // at: { cx, baseY, h, name, sun, shade, build }
  draw(k, at) {
    const B = worldBox(at, REAL);
    const mm = B.mm, name = at.name, b = at.build;
    const Pt = (x, h, zz) => project(B.x0 + x * mm, h * mm, B.zf - zz * mm);
    const Q = (pts, fill, nm) => poly(k, pts.map((p) => Pt(...p)), { fill, name: nm && `${name}-${nm}`, build: b });
    const deckH = (zz) => 46 + zz * 36 / 150;
    const W = REAL.w;

    // far to near: lid top, lid lip, deck, keyboard, front face, bottom pan
    Q([[0, 110, 156], [W, 110, 156], [W, 114, 452], [0, 114, 452]], C.lid, 'lid');
    Q([[0, 82, 150], [W, 82, 150], [W, 110, 156], [0, 110, 156]], C.lip, 'lip');
    Q([[0, 108.5, 155.7], [W, 108.5, 155.7], [W, 110, 156], [0, 110, 156]], C.edgeLit, 'lip-hi');
    Q([[0, 46, 0], [W, 46, 0], [W, 82, 150], [0, 82, 150]], C.deck, 'deck');
    // the keyboard well
    const kx0 = 50, kx1 = 330, kz0 = 36, kz1 = 136;
    Q([[kx0, deckH(kz0), kz0], [kx1, deckH(kz0), kz0], [kx1, deckH(kz1), kz1], [kx0, deckH(kz1), kz1]], C.well, 'well');
    // keys, back row first: each its top, then its front face (the front faces catch the sun)
    const kh = 9, kd = 15, gap = 1.6;
    KEYS.forEach(([zc, x, widths], r) => {
      let xx = x;
      widths.forEach((wp, i) => {
        const xa = xx + gap / 2, xb = xx + wp * P - gap / 2;
        const zf = zc - kd / 2, zb = zc + kd / 2;
        const hf = deckH(zf), hb = deckH(zb);
        Q([[xa + 1, hf + kh, zf + 1.5], [xb - 1, hf + kh, zf + 1.5], [xb - 1, hb + kh, zb], [xa + 1, hb + kh, zb]], C.keyTop, `k${r}-${i}-t`);
        Q([[xa, hf, zf], [xb, hf, zf], [xb - 1, hf + kh, zf + 1.5], [xa + 1, hf + kh, zf + 1.5]], C.keyFront, `k${r}-${i}`);
        Q([[xa + 1, hf + kh - 1.2, zf + 1.3], [xb - 1, hf + kh - 1.2, zf + 1.3], [xb - 1, hf + kh, zf + 1.5], [xa + 1, hf + kh, zf + 1.5]], C.keyEdge, `k${r}-${i}-e`);
        xx += wp * P;
      });
    });
    // the power light, at the left of the keyboard
    const [lx, ly] = Pt(30, deckH(52) + 0.5, 52);
    k.dot({ cx: lx, cy: ly, r: 2.6 * mm * 1.25, fill: C.led, name: `${name}-led`, build: b });
    // the front face, with its rounded top edge catching the light and its two vertical edges
    const F = [Pt(0, 46, 0), Pt(W, 46, 0), Pt(W, 6, 0), Pt(0, 6, 0)];
    k.rect({ x: F[0][0], y: F[0][1], w: F[1][0] - F[0][0], h: F[3][1] - F[0][1], fill: C.front, name, build: b });
    Q([[0, 43.5, 0], [W, 43.5, 0], [W, 46, 0], [0, 46, 0]], C.edgeLit, 'front-hi');
    Q([[0, 6, 0], [3, 6, 0], [3, 46, 0], [0, 46, 0]], C.edgeLit, 'edge-l');
    Q([[W - 4, 6, 0], [W, 6, 0], [W, 46, 0], [W - 4, 46, 0]], C.edgeDark, 'edge-r');
    Q([[10, 0, 10], [W - 10, 0, 10], [W - 10, 6, 10], [10, 6, 10]], C.pan, 'pan');

    const top = Pt(0, 114, 452)[1];
    return {
      x: F[0][0], y: top, w: F[1][0] - F[0][0], h: at.baseY - top, right: F[1][0], bottom: at.baseY, cx: (F[0][0] + F[1][0]) / 2,
      at: (x, h, zz) => Pt(x, h, zz), deckH,
      keyboard: { left: Pt(kx0, deckH(80), 80), right: Pt(kx1, deckH(80), 80) },
    };
  },
};
