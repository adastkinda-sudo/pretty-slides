// A zafu: the round, pleated meditation cushion of Sōtō Zen (S06) — the one small thing left in the nearly empty
// room. Real measure: 350 mm across, 180 mm tall, black cotton with a pleated side gusset, the top filled out into a
// shallow dome. Seen from the room's low camera, whose eye is still above the cushion, so a sliver of the top shows.
// Light from the window at the upper left: the top and the left flank catch it, the right flank turns away; each
// pleat is a fold of shadow. No pattern, no tassel, nothing on it.
const { tone, poly, strokes } = require('../parts');

const C = {
  top: '4E4945',     // the domed top, facing the sun
  body: '34302C',    // the gusset, front
  lit: '4A4541',     // its left flank, towards the window
  dark: '1F1D1B',    // its right flank, away from it
  pleat: '1A1816',   // the folds
  seam: '5B5550',    // the piping round the top edge, catching the light
};

module.exports = {
  real: { w: 350, h: 180, d: 350 },
  // at: { cx, baseY, h, name, shade, build }
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    const c = tone(k, at, C);
    const b = at.build;
    const R = h * 350 / 180 / 2;                       // half width on the slide
    const y0 = baseY - h;
    const Y = (f) => y0 + f * h;
    const SEAM = 0.24, DOME = 0.24;                     // seam height (from top), dome rise above it (fractions of h)
    // half width of the gusset at height f (0 = top, 1 = floor): a slight bulge, rounded into the floor
    const half = (f) => {
      const bulge = 0.95 + 0.05 * Math.sin(Math.PI * (f - SEAM) / (1 - SEAM));
      const foot = f > 0.84 ? Math.sqrt(Math.max(0, 1 - ((f - 0.84) / 0.16) ** 2)) * 0.12 + 0.88 : 1;
      return R * bulge * foot;
    };
    const N = 24, fs = Array.from({ length: N + 1 }, (_, i) => SEAM + (1 - SEAM) * i / N);
    const rightSide = fs.map((f) => [cx + half(f), Y(f)]);
    const leftSide = fs.slice().reverse().map((f) => [cx - half(f), Y(f)]);
    // the dome above the seam: half an ellipse
    const dome = Array.from({ length: 21 }, (_, i) => {
      const a = Math.PI * i / 20;                        // left → over the top → right
      return [cx - Math.cos(a) * R * 0.95, Y(SEAM) - Math.sin(a) * DOME * h];
    });
    // the gusset (body), and its lit / shaded flanks: bands of the same silhouette
    const band = (x0, x1) => {
      const pts = [];
      fs.forEach((f) => pts.push([Math.min(Math.max(cx - half(f), x0), cx + half(f)), Y(f)]));
      fs.slice().reverse().forEach((f) => pts.push([Math.max(Math.min(cx + half(f), x1), cx - half(f)), Y(f)]));
      return pts;
    };
    poly(k, [...leftSide, ...dome.slice(1, -1), ...rightSide], { fill: c.body, name, build: b });
    // the flanks turn by facets, one pleat at a time: two steps of light on the left, two of shade on the right
    const at_ = (i) => cx + Math.sin(-Math.PI / 2 + Math.PI * i / 12) * R * 0.97;
    poly(k, band(cx - R * 1.1, at_(4)), { fill: c.lit, transparency: 55, build: b });
    poly(k, band(cx - R * 1.1, at_(2)), { fill: c.lit, transparency: 40, build: b });
    poly(k, band(at_(8), cx + R * 1.1), { fill: c.dark, transparency: 50, build: b });
    poly(k, band(at_(10), cx + R * 1.1), { fill: c.dark, transparency: 25, build: b });
    // the top: the dome, lit, down to the front of the seam (seen from a little above, the seam is a shallow arc)
    const seamFront = Array.from({ length: 21 }, (_, i) => {
      const a = Math.PI * i / 20;
      return [cx + Math.cos(a) * R * 0.95, Y(SEAM) + Math.sin(a) * 0.05 * h];   // right → under → left
    });
    poly(k, [...dome, ...seamFront.slice(1, -1)], { fill: c.top, name: `${name}-top`, build: b });
    strokes(k, [seamFront], { color: c.seam, weight: 0.75, build: b });
    // pleats: folds evenly spaced round the gusset, crowding towards the flanks as they turn away
    const folds = [];
    for (let i = 1; i < 12; i++) {
      const s = Math.sin(-Math.PI / 2 + Math.PI * i / 12);
      folds.push([0.30, 0.55, 0.80, 0.95].map((f) => [cx + s * half(f) * 0.97, Y(f)]));
    }
    strokes(k, folds, { color: c.pleat, weight: 0.75, build: b });
    return { x: cx - R, y: Y(SEAM) - DOME * h, w: 2 * R, h: baseY - (Y(SEAM) - DOME * h), right: cx + R, bottom: baseY, cx };
  },
};
