// An Eichler house (Mountain View / Palo Alto, 1950s–60s), its garden elevation drawn on the wall as an architect's
// line elevation (S04; not an object standing in the room, so rooms/S04.json registers it with "shadow": false).
// Post-and-beam, to real measure in inches: six 8 ft bays (48 ft) on a concrete slab 6" above grade; walls 8 ft to the
// header; a flat roof that runs out 30" past both ends (the decking cantilevers past the last beam); the roof beams left
// exposed, 4 ft on centre over the posts and half-way between them, their ends showing under the roof edge. Four bays
// are glass from slab to header (each split by one
// mullion: 4 ft panes); the bays at either end are vertical-grooved siding, the right one with a clerestory band.
// Line weights follow drafting habit: ground line heaviest, roof and beam ends solid, outline medium, glass and siding
// fine; the glass carries the draughtsman's two diagonal reflection strokes. No people, trees or cars.
const { poly } = require('../parts');

const IN = {
  W: 636, H: 120,                      // roof length (incl. both 30" overhangs) × ground to roof top
  over: 30, bay: 96, bays: 6,
  slab: 6, header: [96, 102], roof: [112, 120], beams: [102, 112], beamW: 4, beamEvery: 48,   // 4×10 beams on the header
  post: 4, mullion: 1.5,
  glass: [1, 2, 3, 4],                 // which bays (0-based) are glass
  clerestory: { bay: 5, y: [72, 96] },
  groove: 6,                           // siding groove spacing
};

module.exports = {
  real: { w: IN.W * 25.4, h: IN.H * 25.4, d: 1 },
  // at: { cx, baseY (ground line), h (ground to roof top), name, build } — returns anchors for the callouts
  draw(k, at) {
    const { cx, baseY, h, name } = at;
    const s = h / IN.H, W = IN.W * s, x0 = cx - W / 2;
    const X = (u) => x0 + u * s, Y = (v) => baseY - v * s;        // inches from the roof's left end / from grade
    const b = at.build;
    const ln = (u1, v1, u2, v2, color, weight) => k.line({ x1: X(u1), y1: Y(v1), x2: X(u2), y2: Y(v2), color, weight, build: b });
    const box = (u1, v1, u2, v2, o) => k.rect({ x: X(u1), y: Y(v2), w: (u2 - u1) * s, h: (v2 - v1) * s, build: b, ...o });
    const L = IN.over, R = IN.over + IN.bay * IN.bays;              // the building's two end walls

    // ground and slab
    ln(-60, 0, IN.W + 60, 0, 'graphite', 1.25);
    box(L - 2, 0, R + 2, IN.slab, { line: 'graphite', lineW: 0.75 });

    // bays: glass (floor to header, one mullion, two reflection strokes per pane) or grooved siding
    const panes = [];
    for (let i = 0; i < IN.bays; i++) {
      const a = L + i * IN.bay, z = a + IN.bay;
      if (IN.glass.includes(i)) {
        const m = (a + z) / 2;
        ln(m, IN.slab, m, IN.header[0], 'graphite', 0.5);
        [[a + IN.post / 2, m], [m, z - IN.post / 2]].forEach(([p, q]) => {
          panes.push({ u0: p, u1: q });
          const w = q - p;
          [[0.52, 0.80, 0.30], [0.60, 0.88, 0.22]].forEach(([f0, f1, len]) => {
            const u = p + w * f0, v = IN.slab + (IN.header[0] - IN.slab) * f1, d = w * len;
            ln(u, v, u + d * 0.7, v + d * 0.7, 'stone', 0.5);
          });
        });
      } else {
        const top = IN.clerestory.bay === i ? IN.clerestory.y[0] : IN.header[0];
        for (let u = a + IN.groove; u < z - 1; u += IN.groove) ln(u, IN.slab, u, top, 'hairline', 0.5);
        if (IN.clerestory.bay === i) {
          box(a + IN.post / 2, IN.clerestory.y[0], z - IN.post / 2, IN.clerestory.y[1], { line: 'graphite', lineW: 0.5 });
          [1, 2, 3].forEach((j) => { const u = a + IN.post / 2 + j * (IN.bay - IN.post) / 4; ln(u, IN.clerestory.y[0], u, IN.clerestory.y[1], 'graphite', 0.5); });
        }
      }
    }
    // the wall's outline: end walls, the header over the glass
    box(L, IN.slab, R, IN.header[1], { line: 'graphite', lineW: 0.75 });
    ln(L, IN.header[0], R, IN.header[0], 'graphite', 0.75);
    // posts at every bay line (4×4, drawn in outline: the glass, not the frame, is what the wall is)
    for (let i = 0; i <= IN.bays; i++) {
      const u = L + i * IN.bay;
      box(u - IN.post / 2, IN.slab, u + IN.post / 2, IN.header[0], { fill: 'paper', line: 'graphite', lineW: 0.75 });
    }
    // the exposed beams: their ends under the roof edge, 4 ft on centre, every other one over a post
    const beams = [];
    for (let u = L; u <= R + 0.1; u += IN.beamEvery) {
      box(u - IN.beamW / 2, IN.beams[0], u + IN.beamW / 2, IN.beams[1], { fill: 'ink' });
      beams.push(u);
    }
    // the flat roof: one long solid band, out past both ends
    box(0, IN.roof[0], IN.W, IN.roof[1], { fill: 'ink', name });

    const P = (u, v) => ({ x: X(u), y: Y(v) });
    const glassL = L + IN.glass[0] * IN.bay, glassR = L + (IN.glass[IN.glass.length - 1] + 1) * IN.bay;
    return {
      x: x0, y: baseY - h, w: W, h, right: x0 + W, bottom: baseY, cx,
      roof: { l: P(0, IN.roof[1]), r: P(IN.W, IN.roof[1]), y: Y((IN.roof[0] + IN.roof[1]) / 2), top: Y(IN.roof[1]) },
      beam: beams.map((u) => P(u, (IN.beams[0] + IN.beams[1]) / 2)),
      glass: { x0: X(glassL), x1: X(glassR), top: Y(IN.header[0]), bottom: Y(IN.slab), panes: panes.map((p) => ({ x0: X(p.u0), x1: X(p.u1) })) },
      ground: Y(0), slab: Y(IN.slab), wallL: X(L), wallR: X(R),
      inch: s,
    };
  },
};
