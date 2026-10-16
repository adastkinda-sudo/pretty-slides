// 空房间 — the shared parts of the room. Objects live in objects/<use>.js, one file each; a page says
// which objects stand in its room, and where, in rooms/<ID>.json. room.py reads the same two files to cast the sun and
// the shadows, so a drawn object always stands exactly where its shadow says.
//
//   sun(k)                      the page's sunlight (assets/sun/<ID>.png, Morph name 'sun'); sunInfo(id) its data
//   place(k, id, extra)         draw an object registered in rooms/<ID>.json (objects/<use>.js), returns its anchors
//   project(x,h,z) worldBox(at, real)   the room's camera, for objects that need true perspective (open, deep)
//   lifeline(k, {...})          the floor seam 1955–2011 as navigation; lifelineCover(k) for S01
//   linksBefore(id)             the connections already made before page <id>
//   marks(k, {...})             part marker (top left) + the page's date (top right)
//   leader(k, {...}) dim(k, {...})            annotation leader; dimension line
//   stroke(k, pts, {...}) strokes(k, paths, {...})   smooth hand-drawn lines on the wall (diagrams, signatures)
//   poly(k, pts, {...})         a filled polygon (object faces)
//   tone(k, at, colors)         an object's materials, darkened when its front is out of the sun
//   cells(word, face, pt)       letter cells for the Mac's screen

const fs = require('fs');
const path = require('path');
const ROOM = require('./room.json');

const HERE = __dirname;
const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(HERE, rel), 'utf8'));
const pageRoom = (id) => readJSON(`rooms/${id}.json`);
function sunInfo(id) {
  const rel = `assets/sun/${id}.json`;
  if (!fs.existsSync(path.join(HERE, rel))) throw new Error(`no sun for ${id}: run  python3 room.py ${id}`);
  return readJSON(rel);
}

const CAM = ROOM.camera;
// Screen y of a line on the floor at depth z (pinhole camera of room.json; z = 0 is the wall), and back.
const floorY = (z) => CAM.horizonY + (CAM.floorY - CAM.horizonY) * CAM.camZ / (CAM.camZ - z);
// Screen scale of an object standing with its front on the floor at screen y = baseY (1 at the wall).
const scaleAt = (baseY) => (baseY - CAM.horizonY) / (CAM.floorY - CAM.horizonY);
// World ↔ screen, the same pinhole camera as room.py. World: x along the wall, h above the floor, z out from the wall.
const HC = CAM.floorY - CAM.horizonY;
function project(x, h, z) {
  const s = CAM.camZ / (CAM.camZ - z);
  return [CAM.vx + (x - CAM.vx) * s, CAM.horizonY + (HC - h) * s];
}
// The world box of an object drawn with its front face at (cx, baseY, h) on the slide — exactly room.py's object_box.
function worldBox(at, real) {
  const s = scaleAt(at.baseY);
  const zf = CAM.camZ * (1 - 1 / s);
  const H = at.h / s;
  const W = H * (at.w_mm ?? real.w) / (at.h_mm ?? real.h);
  const D = H * (at.d_mm ?? real.d) / (at.h_mm ?? real.h);
  const xc = CAM.vx + (at.cx - CAM.vx) / s;
  return { x0: xc - W / 2, x1: xc + W / 2, H, zf, zb: zf - D, D, mm: H / (at.h_mm ?? real.h) };
}

// ── The sun through the window, for this page (rendered by room.py). One per page; Morph moves it on. ──
function sun(k) {
  const p = sunInfo(k.page.id);
  k.image(`assets/sun/${k.page.id}.png`, { x: p.x, y: p.y, w: p.w, h: p.h, name: 'sun' });
  return p;
}

// ── Objects: one file per object (objects/<use>.js exports { real: {w,h,d} mm, morph?, draw(k, at) }). ──
// rooms/<ID>.json registers it: { "use": "mac", "cx": 6.8, "baseY": 6.2, "h": 4.4 } (+ "id" when a page has two of the
// same, "morph" to override the Morph name, "d_mm" to override the depth, anything else the object understands).
const object = (use) => require(path.join(HERE, 'objects', `${use}.js`));
function place(k, id, extra = {}) {
  const objs = pageRoom(k.page.id).objects || [];
  const entry = objs.find((o) => (o.id || o.use) === id);
  if (!entry) throw new Error(`object "${id}" is not registered in rooms/${k.page.id}.json`);
  const mod = object(entry.use);
  const info = sunInfo(k.page.id);
  const lit = info.lit?.[entry.id || entry.use] ?? 1;
  const name = entry.morph || mod.morph || `obj-${entry.use}`;
  return mod.draw(k, { ...entry, ...extra, name, sun: info.sun, shade: Math.max(0, Math.min(1, 1 - lit)) });
}

// An object's materials, toned down when its front is out of the sun (shade 0 = full sun, 1 = in the room's shade).
const SHADE_TO = '6B6156';
function tone(k, at, colors) {
  const out = {};
  for (const [key, c] of Object.entries(colors)) out[key] = at.shade > 0.02 ? k.mix(c, SHADE_TO, 0.2 * at.shade) : c;
  return out;
}

// A filled polygon from absolute slide points [[x, y], …].
function poly(k, pts, { fill, line, lineW, name, build, transparency } = {}) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bx = Math.min(...xs), by = Math.min(...ys);
  k.shape('custGeom', {
    x: bx, y: by, w: Math.max(Math.max(...xs) - bx, 0.01), h: Math.max(Math.max(...ys) - by, 0.01), fill, line, lineW, name, build, transparency,
    points: [...pts.map(([x, y]) => ({ x: x - bx, y: y - by })), { close: true }],
  });
}

// ── Smooth strokes (Catmull-Rom through the points → cubic Béziers): wall diagrams, handwriting. ──
function bezierPath(pts, tension = 1) {
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const t = tension / 6;
    segs.push({
      c1: [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t],
      c2: [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t],
      to: p2,
    });
  }
  return segs;
}
// paths: [[[x, y], …], …] absolute slide points; one native shape with one sub-path per stroke.
function strokes(k, paths, { color = 'graphite', weight = 0.75, name, build, tension = 1 } = {}) {
  const all = [];
  const curves = paths.filter((p) => p.length > 1).map((p) => {
    const segs = bezierPath(p, tension);
    all.push(p[0], ...segs.flatMap((s) => [s.c1, s.c2, s.to]));
    return { start: p[0], segs };
  });
  const bx = Math.min(...all.map((p) => p[0])), by = Math.min(...all.map((p) => p[1]));
  const bw = Math.max(Math.max(...all.map((p) => p[0])) - bx, 0.01), bh = Math.max(Math.max(...all.map((p) => p[1])) - by, 0.01);
  const L = (p) => ({ x: p[0] - bx, y: p[1] - by });
  const points = [];
  curves.forEach(({ start, segs }) => {
    points.push({ ...L(start), moveTo: true });
    segs.forEach((s) => points.push({ ...L(s.to), curve: { type: 'cubic', x1: s.c1[0] - bx, y1: s.c1[1] - by, x2: s.c2[0] - bx, y2: s.c2[1] - by } }));
  });
  k.shape('custGeom', { x: bx, y: by, w: bw, h: bh, line: color, lineW: weight, name, build, points });
  return { x: bx, y: by, w: bw, h: bh };
}
const stroke = (k, pts, opts) => strokes(k, [pts], opts);

// ── The lifeline: a seam in the oak floor, the third from the wall. 1955 → 2011 runs along it. ──
const LIFE = { x0: 0.9, x1: 12.43, y: +floorY(ROOM.floor.plank * ROOM.floor.lifeline).toFixed(3) };
const yearX = (year) => LIFE.x0 + (year - 1955) / 56.8 * (LIFE.x1 - LIFE.x0);
const POINTS = [
  ['1955', 1955.15], ['1961', 1961.0], ['1972', 1972.7], ['1974', 1974.5], ['1976', 1976.25], ['1977', 1977.3],
  ['1979', 1979.95], ['1984', 1984.07], ['1985', 1985.7], ['1986', 1986.1], ['1997', 1997.0], ['2001', 2001.8],
  ['2007', 2007.03], ['2011', 2011.76],
];
// Connections: id → [from, to]. Each appears first on one page and stays on every later page.
const LINKS = {
  '1961-1977': ['1961', '1977'], '1972-1984': ['1972', '1984'], '1955-1984': ['1955', '1984'],
  '1985-1997': ['1985', '1997'], '1974-1997': ['1974', '1997'], '1997-2007': ['1997', '2007'],
  '1972-2007': ['1972', '2007'], '1986-2007': ['1986', '2007'], '1974-2007': ['1974', '2007'],
};
// The page on which each connection is made; linksBefore('S20') = everything made before S20.
const LINK_PAGE = {
  '1961-1977': 'S08', '1972-1984': 'S10', '1955-1984': 'S11', '1985-1997': 'S16', '1974-1997': 'S17',
  '1997-2007': 'S20', '1972-2007': 'S20', '1986-2007': 'S20', '1974-2007': 'S20',
};
// Floor-scale arc heights (in). A formula of the span alone puts 1972→2007 and 1974→2007 (spans 6.97 / 6.60 in) on
// top of each other, and the four arcs landing on 2007 merged into one band on S20; so each connection has its own
// height, ordered by span and at least 0.1 in apart from any arc that shares an end with it. Others: the formula.
const LINK_H = {
  '1972-1984': 0.2, '1985-1997': 0.2, '1997-2007': 0.15, '1986-2007': 0.31, '1961-1977': 0.3, '1974-1997': 0.36,
  '1974-2007': 0.5, '1955-1984': 0.47, '1972-2007': 0.72,
};
const floorArcH = (id, span) => LINK_H[id] ?? Math.min(0.6, 0.12 * span ** 0.8);
const linksBefore = (pid) => Object.keys(LINK_PAGE).filter((id) => LINK_PAGE[id] < pid);
const px = (id) => yearX(POINTS.find((p) => p[0] === id)[1]);

// Navigation scale (S02–S22): the whole line; past points filled, the current one larger in ink, future ones hollow.
//   current: null → every point the same (stone), no year labels: S02, where the dots are all there but unconnected.
//   links: connections already made (1 pt). fresh: the ones this page makes (2.25 pt) — an id or a list of ids,
//   drawn on click `freshBuild`, staggered by `stagger` ms after `delay`. freshLabel: a link-blue note beside the
//   current year. linkLabels: { '1972': '字体' } — what a fresh connection carries, in link blue under where it
//   starts (built with the fresh arcs). until: the line stops at this point and the later points are gone (S12).
// Returns { arcs: { id: { apex } } } so a page can label a connection where it peaks.
function lifeline(k, { current, links = [], fresh = [], freshBuild, delay = 0, stagger = 150, freshLabel, labels = {}, linkLabels = {}, until } = {}) {
  const y = LIFE.y;
  const stop = until ? POINTS.findIndex((p) => p[0] === until) : POINTS.length - 1;
  const xEnd = until ? px(until) : LIFE.x1;
  k.line({ x1: LIFE.x0, y1: y, x2: xEnd, y2: y, color: 'hairline', weight: 0.75, name: 'life' });
  const ci = POINTS.findIndex((p) => p[0] === current);
  const arcs = {};
  const arc = (id, weight, build) => {
    const [a, b] = LINKS[id].map(px);
    // drawn on the floor, so foreshortened: flatter than a wall arc (heights: LINK_H)
    arcs[id] = k.arc({ x1: a, x2: b, y, h: floorArcH(id, b - a), color: 'link', weight, name: `link-${id}`, build });
  };
  links.forEach((id) => arc(id, 1));
  const freshList = [].concat(fresh || []);
  freshList.forEach((id, i) => arc(id, 2.25, freshBuild ? [freshBuild, delay + i * stagger] : undefined));
  POINTS.forEach(([id, yr], i) => {
    if (i > stop) return;
    const cx = yearX(yr), name = `ld-${id}`;
    if (current == null) k.dot({ cx, cy: y, r: 0.045, fill: 'stone', name });
    else if (i === ci) k.dot({ cx, cy: y, r: 0.06, fill: 'ink', name });
    else if (i < ci) k.dot({ cx, cy: y, r: 0.035, fill: 'stone', name });
    else k.dot({ cx, cy: y, r: 0.035, fill: 'paperDeep', line: 'seam', lineW: 0.75, name });
  });
  // year labels under the line: the year in Arial, what happened in the sans face (Microsoft YaHei)
  const tag = (id, what, color, whatColor = color, build) => {
    const runs = [{ text: id, style: 'year', color }];
    if (what) runs.push({ text: `　${what}`, style: 'label', tracking: 0, color: whatColor });
    const w = 0.5 + (what ? 0.16 * (what.length + 1) : 0);
    k.text(runs, { style: 'year', x: px(id) - 0.06, y: y + 0.11, w, nowrap: true, chrome: true, build });
  };
  if (current != null) tag(current, labels[current], 'ink');
  Object.entries(labels).filter(([id]) => id !== current).forEach(([id, what]) => tag(id, what, 'stone'));
  const lb = freshBuild ? [freshBuild, delay] : undefined;
  Object.entries(linkLabels).forEach(([id, what]) => tag(id, what, 'stone', 'link', lb));
  if (freshLabel && freshList.length) {
    const lbl = 0.5 + (labels[current] ? 0.16 * (labels[current].length + 1) : 0);
    k.text(freshLabel, { style: 'label', tracking: 0, color: 'link', x: px(current) - 0.06 + lbl + 0.08, y: y + 0.11, w: 0.16 * freshLabel.length + 0.2, nowrap: true, chrome: true, build: freshBuild ? [freshBuild, delay] : undefined });
  }
  return { arcs, y };
}

// Cover scale (S01, S02): the stone seam with 1955 / 2011 under its ends. S01: only the two ends, nothing yet
// between them. dots: true (S02): all 14 points, unconnected; the twelve between the ends come in on click `build`,
// left to right, `stagger` ms apart.
function lifelineCover(k, { dots = false, build, stagger = 40 } = {}) {
  const y = LIFE.y, a = px('1955'), b = px('2011');
  k.line({ x1: LIFE.x0, y1: y, x2: LIFE.x1, y2: y, color: 'stone', weight: 0.75, name: 'life' });
  if (dots) {
    const last = POINTS.length - 1;
    POINTS.forEach(([id, yr], i) => {
      const bl = i === 0 || i === last || !build ? undefined : [build, (i - 1) * stagger];
      k.dot({ cx: yearX(yr), cy: y, r: 0.045, fill: 'stone', name: `ld-${id}`, build: bl });
    });
  } else {
    k.dot({ cx: a, cy: y, r: 0.06, fill: 'ink', name: 'ld-1955' });
    k.dot({ cx: b, cy: y, r: 0.06, fill: 'ink', name: 'ld-2011' });
  }
  k.text('1955', { style: 'year', size: 13, color: 'ink', x: a - 0.06, y: y + 0.13, w: 1.2, nowrap: true, chrome: true });
  k.text('2011', { style: 'year', size: 13, color: 'ink', x: b + 0.06 - 1.2, y: y + 0.13, w: 1.2, align: 'right', nowrap: true, chrome: true });
}

// Main-figure scale (S23): the whole life on the first seam from the wall (the line has risen from the third), with
// every connection drawn as a high arc above the row of objects. Draw it before the objects: the arcs rise from
// behind them. Heights: span × 0.35, capped at 2.4 in — then set apart where two arcs share an end
// and would otherwise run on top of each other (1972→2007 / 1974→2007).
const LINK_H_WALL = {
  '1972-1984': 0.8, '1985-1997': 0.85, '1997-2007': 0.72, '1961-1977': 1.12, '1986-2007': 1.4, '1974-1997': 1.6,
  '1955-1984': 1.9, '1974-2007': 2.02, '1972-2007': 2.4,
};
const WALL_LIFE_Y = +floorY(ROOM.floor.plank).toFixed(3);
function lifelineWall(k, { y = WALL_LIFE_Y, weight = 1.25, build, stagger = 120 } = {}) {
  const arcs = {};
  // in time order of where they start, so a build reads left to right
  Object.keys(LINKS).sort((a, b) => px(LINKS[a][0]) - px(LINKS[b][0]) || px(LINKS[a][1]) - px(LINKS[b][1])).forEach((id, i) => {
    const [a, b] = LINKS[id].map(px);
    const h = LINK_H_WALL[id] ?? Math.min(2.4, 0.35 * (b - a));
    arcs[id] = k.arc({ x1: a, x2: b, y, h, color: 'link', weight, name: `link-${id}`, build: build ? [build, i * stagger] : undefined });
  });
  return { arcs, y };
}
// …and the seam with its 14 points, drawn after the objects (the points sit on the seam in front of them).
function lifelineWallDots(k, { y = WALL_LIFE_Y } = {}) {
  k.line({ x1: LIFE.x0, y1: y, x2: LIFE.x1, y2: y, color: 'stone', weight: 0.75, name: 'life' });
  POINTS.forEach(([id, yr], i) => {
    const end = i === 0 || i === POINTS.length - 1;
    k.dot({ cx: yearX(yr), cy: y, r: end ? 0.06 : 0.045, fill: end ? 'ink' : 'stone', name: `ld-${id}` });
  });
  return { y };
}

// Part marker (top left) and the page's date (top right): small labels on the wall. big: first page of a part.
function marks(k, { part, date, big = false }) {
  if (part) k.text(part, { style: big ? 'lead' : 'label', color: big ? 'ink' : 'stone', x: k.M.x, y: 0.4, w: 3, nowrap: true, chrome: true });
  if (date) k.text(date, { style: 'label', x: k.W - k.M.x - 4, y: 0.4, w: 4, align: 'right', nowrap: true, chrome: true });
}

// Leader: thin line from an annotation to its target, ending in a small dot.
function leader(k, { from, to, color = 'seam', dot = 'stone', build }) {
  k.line({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color, weight: 0.5, build });
  k.dot({ cx: to.x, cy: to.y, r: 0.03, fill: dot, build });
}

// Dimension line (engineering drawing): a hairline with end ticks. Horizontal (x1 → x2 at y) or vertical (y1 → y2 at x).
// style: 'year' (Arial, for figures and units: "1 ft") or 'label' (Microsoft YaHei, for a Chinese label: "九年").
function dim(k, { x1, x2, y, y1, y2, x, label, color = 'stone', side = 'below', build, style = 'year' }) {
  const ls = style === 'year' ? { style } : { style, tracking: 0 };
  const t = 0.06;
  if (y1 != null) { // vertical
    k.line({ x1: x, y1, x2: x, y2, color, weight: 0.5, build });
    k.line({ x1: x - t, y1, x2: x + t, y2: y1, color, weight: 0.5, build });
    k.line({ x1: x - t, y1: y2, x2: x + t, y2, color, weight: 0.5, build });
    if (label) k.text(label, { ...ls, color, x: side === 'left' ? x - 1.62 : x + 0.12, y: (y1 + y2) / 2 - 0.09, w: 1.5, align: side === 'left' ? 'right' : 'left', nowrap: true, build });
    return;
  }
  k.line({ x1, y1: y, x2, y2: y, color, weight: 0.5, build });
  k.line({ x1, y1: y - t, x2: x1, y2: y + t, color, weight: 0.5, build });
  k.line({ x1: x2, y1: y - t, x2, y2: y + t, color, weight: 0.5, build });
  if (label) k.text(label, { ...ls, color, x: (x1 + x2) / 2 - 1, y: side === 'above' ? y - 0.26 : y + 0.09, w: 2, align: 'center', nowrap: true, build });
}

// Lay a word out in a given face so its cells can be measured: advance widths (em) for the letters we use.
// Consolas is monospaced (every letter 0.550 em). Palatino Linotype, from the font's hmtx; no kerning between these letters.
const ADVANCE = {
  mono: () => 0.5498,
  roman: (ch) => ({ m: 0.883, i: 0.291, n: 0.582, u: 0.603 })[ch],
};
function cells(word, face, sizePt) {
  let x = 0;
  const edges = [0];
  for (const ch of word) { x += ADVANCE[face](ch) * sizePt / 72; edges.push(x); }
  return edges;
}

// ── The calligraphy pair (S05, S23) ──
// Hoefler Text (Apple's serif, 1991) — glyph outlines of A and v in font units (2000 / em), TrueType quadratic
// curves, read from /System/Library/Fonts/Supplemental/Hoefler Text.ttc with fontTools. Kern A·v = −126 (the font's
// own kern table); x-height 850, cap height 1379.
const AV = { UPM: 2000, KERN: -126, XH: 850, CAP: 1379, G: {
  A: { adv: 1468, d: [["M",1465,16],["Q",1465,-12,1449,-12],["Q",1380,-12,1293,-6],["Q",1218,0,1165,0],["Q",1104,0,1014,-6],["Q",919,-12,852,-12],["Q",836,-12,836,16],["Q",836,44,848,44],["Q",937,48,976,67.5],["Q",1015,87,1015,128],["Q",1015,154,995,211],["L",882,546],["L",470,546],["L",356,236],["Q",334,174,334,140],["Q",334,52,496,44],["Q",508,44,508,16],["Q",508,-12,492,-12],["Q",432,-12,359,-6],["Q",290,0,236,0],["Q",193,0,128,-6],["Q",60,-12,12,-12],["Q",-3,-12,-3,13],["Q",-3,41,20,43],["Q",103,51,151.5,89],["Q",200,127,252,244],["L",720,1393],["Q",726,1409,748,1409],["Q",772,1409,778,1394],["L",1191,244],["Q",1226,147,1285.5,101],["Q",1345,55,1445,43],["Q",1465,41,1465,16],["Z"],["M",860,610],["L",684,1121],["L",494,610],["Z"]] },
  v: { adv: 910, d: [["M",949,822],["Q",949,796,933,794],["Q",849,785,820.5,754],["Q",792,723,749,626],["L",462,-28],["Q",455,-44,438,-44],["Q",420,-44,413,-28],["L",144,626],["Q",107,718,69,752],["Q",31,786,-34,795],["Q",-50,797,-50,822],["Q",-50,850,-34,850],["Q",7,850,68,844],["Q",134,838,182,838],["Q",231,838,301,844],["Q",363,850,404,850],["Q",420,850,420,822],["Q",420,797,404,795],["Q",344,787,321,773.5],["Q",298,760,298,734],["Q",298,703,328,627],["L",492,202],["L",658,626],["Q",688,701,688,734],["Q",688,760,665.5,773.5],["Q",643,787,586,795],["Q",570,797,570,822],["Q",570,850,586,850],["Q",628,850,680,844],["Q",729,838,768,838],["Q",788,838,833,843],["Q",895,850,933,850],["Q",949,850,949,822],["Z"]] },
} };

// A glyph as one native shape (S05 at 300 pt on the wall; S23 small, standing on the line) (outer contour and counter in one path, so the counter stays open).
function glyph(k, g, ox, base, u, opts) {
  const pts = [];
  g.d.forEach((c) => { if (c[0] !== 'Z') for (let i = 1; i < c.length; i += 2) pts.push([ox + c[i] * u, base - c[i + 1] * u]); });
  const bx = Math.min(...pts.map((p) => p[0])), by = Math.min(...pts.map((p) => p[1]));
  const bw = Math.max(...pts.map((p) => p[0])) - bx, bh = Math.max(...pts.map((p) => p[1])) - by;
  const L = (x, y) => ({ x: ox + x * u - bx, y: base - y * u - by });
  const points = [];
  g.d.forEach((c) => {
    if (c[0] === 'M') points.push({ ...L(c[1], c[2]), moveTo: true });
    else if (c[0] === 'L') points.push(L(c[1], c[2]));
    else if (c[0] === 'Q') { const p = L(c[1], c[2]); points.push({ ...L(c[3], c[4]), curve: { type: 'quadratic', x1: p.x, y1: p.y } }); }
    else points.push({ close: true });
  });
  k.shape('custGeom', { x: bx, y: by, w: bw, h: bh, fill: 'ink', points, ...opts });
}


// Deterministic pseudo-random numbers in [0, 1) — stable renders for drawn texture (signatures, grain).
function rand(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

module.exports = {
  ROOM, LIFE, POINTS, LINKS, LINK_PAGE, LINK_H, floorArcH, linksBefore, floorY, scaleAt, project, worldBox, yearX, px,
  LINK_H_WALL, WALL_LIFE_Y, lifelineWall, lifelineWallDots, AV, glyph, sun, sunInfo, place, object, tone, poly, stroke, strokes, lifeline, lifelineCover, marks, leader, dim, cells, rand,
};
