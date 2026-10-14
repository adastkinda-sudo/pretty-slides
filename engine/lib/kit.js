// Slide authoring kit: a thin, opinionated layer over pptxgenjs.
// Every slide module receives `k` (bound to one slide). Units are inches; the 16:9 canvas is 13.333 × 7.5.
// Deliberately small: text, rules, lines, rects, dots, images, charts, tables. No cards, icons or badges.

const path = require('path');
const { estimateHeight, lineWidthPt, imageSize } = require('./measure');

function makeKit({ pptx, slide, theme, deckDir, slideId, page }) {
  const W = theme.size?.w ?? 13.333;
  const H = theme.size?.h ?? 7.5;
  const g = theme.grid;
  const M = { x: g.margin.x, top: g.margin.top, bottom: g.margin.bottom };
  const innerW = W - 2 * M.x;
  const colW = (innerW - (g.cols - 1) * g.gutter) / g.cols;
  let bgColor = theme.colors[theme.background || 'paper'] || 'FFFFFF';
  const boxes = []; // recorded for QA

  const color = (c) => {
    if (c == null) return undefined;
    const v = theme.colors[c] ?? c;
    return String(v).replace(/^#/, '').toUpperCase();
  };
  const face = (f) => (f == null ? undefined : theme.fonts[f] ?? f);
  // Interpolate between two colors (t = 0 → a, 1 → b). For heatmaps and tonal ramps without transparency.
  const mix = (a, b, t) => {
    const [p, q] = [color(a), color(b)].map((h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)));
    return p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  // Object names: `name` → `!!name` (PowerPoint's forced Morph pairing). `build` registers an in-slide
  // entrance animation: build: 2 → fades in on the 2nd click; build: [2, 300] → with click 2, 300 ms later.
  const builds = [];
  const named = (o = {}) => {
    let objectName = o.name ? `!!${o.name}` : undefined;
    if (o.build != null) {
      const [step, delay = 0] = Array.isArray(o.build) ? o.build : [o.build, 0];
      objectName = objectName || `b-${slideId}-${builds.length}`;
      builds.push({ name: objectName, step, delay });
    }
    return objectName ? { objectName } : {};
  };
  const record = (kind, o, extra = {}) => boxes.push({ kind, x: o.x, y: o.y, w: o.w, h: o.h, ...extra });

  // ---- grid ----
  const col = (n) => M.x + (n - 1) * (colW + g.gutter);               // x of column n (1-based)
  const span = (a, b = a) => ({ x: col(a), w: (b - a + 1) * colW + (b - a) * g.gutter });

  // ---- text ----
  function styleOf(name, over = {}) {
    const base = theme.type[name || 'body'];
    if (!base) throw new Error(`[${slideId}] unknown text style "${name}"`);
    return { ...base, ...over };
  }

  function runOptions(st) {
    const size = st.size;
    return {
      fontFace: face(st.font),
      fontSize: size,
      color: color(st.color),
      bold: !!st.bold,
      italic: !!st.italic,
      underline: st.underline ? { style: 'sng', color: color(st.color) } : undefined,
      charSpacing: st.tracking ? +(size * st.tracking / 100).toFixed(2) : undefined,
      lang: theme.lang || 'zh-CN',
      highlight: st.highlight ? color(st.highlight) : undefined,
      superscript: st.superscript, subscript: st.subscript,
    };
  }

  // content: string (\n = new paragraph) or array of runs: 'plain' | { text, ...styleOverrides, style? }
  function text(content, opts = {}) {
    const st = styleOf(opts.style, pick(opts, STYLE_KEYS));
    const runs = Array.isArray(content) ? content : [content];
    const out = [];
    const paras = [{ text: '', sizePt: st.size, trackingPt: 0, leading: st.leading || 1.2 }];
    runs.forEach((r) => {
      const rs = typeof r === 'string' ? { text: r } : r;
      const rst = rs.style ? styleOf(rs.style, pick(rs, STYLE_KEYS)) : { ...st, ...pick(rs, STYLE_KEYS) };
      const parts = String(rs.text).split('\n');
      parts.forEach((part, i) => {
        if (i > 0) { out[out.length - 1].options.breakLine = true; paras.push({ text: '', sizePt: rst.size, trackingPt: 0, leading: rst.leading || st.leading || 1.2 }); }
        const p = paras[paras.length - 1];
        p.text += part; p.sizePt = Math.max(p.sizePt, rst.size);
        p.trackingPt = rst.tracking ? rst.size * rst.tracking / 100 : 0;
        out.push({ text: part, options: runOptions(rst) });
      });
    });
    const w = opts.w ?? innerW;
    const est = estimateHeight(paras, w) + (opts.paraSpace || 0) * (paras.length - 1) / 72;
    // widest single-line paragraph (in) — used to catch boxes so tight that PowerPoint's metrics wrap them
    const lineW = Math.max(...paras.map((p) => lineWidthPt(p.text, p.sizePt, p.trackingPt || 0) / 72));
    const h = opts.h ?? +(est + 0.05).toFixed(3);
    const box = {
      x: opts.x ?? M.x, y: opts.y ?? M.top, w, h,
      margin: 0, valign: opts.valign || 'top', align: opts.align || 'left',
      lineSpacingMultiple: st.leading || 1.2,
      paraSpaceAfter: opts.paraSpace || 0,
      fit: 'none', wrap: !opts.nowrap, rotate: opts.rotate,
      ...named(opts),
    };
    slide.addText(out, box);
    record('text', box, { est, lineW, nowrap: !!opts.nowrap, chrome: !!opts.chrome, bleed: opts.bleed, color: color(st.color), size: st.size, sample: paras[0].text.slice(0, 24), allowOverlap: opts.overlap });
    return { ...box, bottom: box.y + box.h, right: box.x + box.w, estH: est };
  }

  // ---- shapes ----
  function rect(o) {
    const box = { x: o.x, y: o.y, w: o.w, h: o.h };
    slide.addShape(o.radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
      ...box,
      fill: o.fill ? { color: color(o.fill), transparency: o.transparency || 0 } : { type: 'none' },
      line: o.line ? { color: color(o.line), width: o.lineW ?? 0.75, dashType: o.dash } : { type: 'none' },
      rectRadius: o.radius, rotate: o.rotate, ...named(o),
    });
    record('rect', box, { bleed: o.bleed, fill: o.fill && color(o.fill), allowOverlap: true });
    return box;
  }

  function line(o) { // { x1, y1, x2, y2, color, weight, dash, arrow: 'end'|'start'|'both' }
    const x = Math.min(o.x1, o.x2), y = Math.min(o.y1, o.y2);
    const w = Math.abs(o.x2 - o.x1), h = Math.abs(o.y2 - o.y1);
    const flipH = o.x2 < o.x1, flipV = o.y2 < o.y1;
    const arrow = { type: 'triangle' };
    slide.addShape(pptx.ShapeType.line, {
      x, y, w, h, flipH, flipV,
      line: {
        color: color(o.color || 'ink'), width: o.weight ?? 0.75, dashType: o.dash,
        beginArrowType: ['start', 'both'].includes(o.arrow) ? arrow.type : undefined,
        endArrowType: ['end', 'both'].includes(o.arrow) ? arrow.type : undefined,
      },
      ...named(o),
    });
    record('line', { x, y, w, h }, { bleed: o.bleed, allowOverlap: true });
  }

  // Arc above a baseline, from x1 to x2, rising h at its apex (arc diagrams: links between items in a row).
  function arc(o) { // { x1, x2, y, h, color, weight, name, build }
    const x = Math.min(o.x1, o.x2), w = Math.abs(o.x2 - o.x1);
    const box = { x, y: o.y - o.h, w, h: 2 * o.h };
    slide.addShape(pptx.ShapeType.arc, {
      ...box, angleRange: [180, 360],
      line: { color: color(o.color || 'ink'), width: o.weight ?? 0.75, dashType: o.dash },
      ...named(o),
    });
    record('line', { x, y: o.y - o.h, w, h: o.h }, { allowOverlap: true });
    return { apex: { x: x + w / 2, y: o.y - o.h } };
  }

  const rule = (o) => line({ x1: o.x, y1: o.y, x2: o.x + o.w, y2: o.y, color: o.color || 'hairline', weight: o.weight ?? 0.75, name: o.name, build: o.build });
  const vrule = (o) => line({ x1: o.x, y1: o.y, x2: o.x, y2: o.y + o.h, color: o.color || 'hairline', weight: o.weight ?? 0.75, name: o.name, build: o.build });

  function dot(o) { // { cx, cy, r, fill, line }
    const box = { x: o.cx - o.r, y: o.cy - o.r, w: 2 * o.r, h: 2 * o.r };
    slide.addShape(pptx.ShapeType.ellipse, {
      ...box,
      fill: o.fill ? { color: color(o.fill), transparency: o.transparency || 0 } : { type: 'none' },
      line: o.line ? { color: color(o.line), width: o.lineW ?? 0.75 } : { type: 'none' },
      ...named(o),
    });
    record('dot', box, { allowOverlap: true });
    return box;
  }

  function shape(type, o) { // escape hatch: any pptx.ShapeType with themed colors
    slide.addShape(pptx.ShapeType[type] ?? type, {
      ...o,
      fill: o.fill ? { color: color(o.fill), transparency: o.transparency || 0 } : { type: 'none' },
      line: o.line ? { color: color(o.line), width: o.lineW ?? 0.75 } : { type: 'none' },
      ...named(o),
    });
    record('shape', o, { allowOverlap: true });
  }

  // ---- light ----
  // Diffuse light on the page's focus: an area that is simply a little brighter, with no visible edge.
  // rx / ry is the reach of the light. The carrier shape is larger and its gradient reaches zero well inside it,
  // so nothing of the shape can be seen. Every page's light shares the Morph name 'light': with Morph transitions
  // it drifts from focus to focus. Post-processing writes the gradient and sends it to the back.
  const lights = [];
  function light(o) { // { cx, cy, rx, ry = rx * 0.75, color = theme.colors.glow, strength = 0.8 }
    const rx = o.rx ?? 3.5, ry = o.ry ?? rx * 0.75;
    // radial 'circle' paths reach 100% at the box corners; the light is zero from 60% on, i.e. 0.85 × half-size on the axes
    const box = { x: o.cx - rx / 0.85, y: o.cy - ry / 0.85, w: 2 * rx / 0.85, h: 2 * ry / 0.85 };
    slide.addShape(pptx.ShapeType.rect, { ...box, fill: { color: 'FF00FF' }, line: { type: 'none' }, objectName: '!!light' });
    lights.push({ color: color(o.color || theme.colors.glow || 'accent'), edge: bgColor, strength: o.strength ?? 0.8 });
    record('light', box, { bleed: true, allowOverlap: true });
    return box;
  }

  // ---- images ----
  // fit: 'cover' (fill box, crop overflow) | 'contain' (fit inside) ; focus: {x:0..1,y:0..1} crop anchor for cover
  function image(src, o) {
    const file = path.resolve(deckDir, src);
    const nat = imageSize(file);
    const ar = nat.w / nat.h;
    const box = { x: o.x, y: o.y, w: o.w, h: o.h };
    const base = { path: file, transparency: o.transparency, ...named(o) };
    if ((o.fit || 'cover') === 'contain') {
      let w = o.w, h = o.w / ar;
      if (h > o.h) { h = o.h; w = o.h * ar; }
      slide.addImage({ ...base, x: o.x + (o.w - w) / 2, y: o.y + (o.h - h) / 2, w, h });
    } else {
      // crop in source pixels, expressed via pptxgenjs 'crop' sizing (inches at native scale)
      const boxAr = o.w / o.h;
      const fx = o.focus?.x ?? 0.5, fy = o.focus?.y ?? 0.5;
      let cw = nat.w, ch = nat.h;
      if (ar > boxAr) cw = nat.h * boxAr; else ch = nat.w / boxAr;
      const cx = (nat.w - cw) * fx, cy = (nat.h - ch) * fy;
      const scale = o.w / cw; // inches per px
      slide.addImage({
        ...base, x: o.x, y: o.y, w: nat.w * scale, h: nat.h * scale,
        sizing: { type: 'crop', x: cx * scale, y: cy * scale, w: o.w, h: o.h },
      });
    }
    record('image', box, { bleed: o.bleed, allowOverlap: true });
    return box;
  }

  // ---- charts (native, editable) ----
  function chart(type, data, o) {
    const ct = theme.chart || {};
    const series = ct.series || [color('accent'), color('ink'), color('stone')];
    const lbl = styleOf('caption');
    const opts = {
      x: o.x, y: o.y, w: o.w, h: o.h,
      chartColors: (o.colors || series).map(color),
      showLegend: !!o.legend, legendPos: o.legendPos || 'b', legendFontFace: face(lbl.font), legendFontSize: lbl.size, legendColor: color(lbl.color),
      catAxisLabelFontFace: face(lbl.font), catAxisLabelFontSize: lbl.size, catAxisLabelColor: color(lbl.color),
      valAxisLabelFontFace: face(lbl.font), valAxisLabelFontSize: lbl.size, valAxisLabelColor: color(lbl.color),
      catAxisLineShow: true, catAxisLineColor: color('hairline'), catAxisMajorTickMark: 'none',
      valAxisHidden: o.valAxis === false, valAxisLineShow: false, valAxisMajorTickMark: 'none',
      valGridLine: o.grid === false ? { style: 'none' } : { color: color('hairline'), size: 0.5 },
      catGridLine: { style: 'none' },
      showValue: !!o.labels, dataLabelFontFace: face(lbl.font), dataLabelFontSize: lbl.size, dataLabelColor: color(o.labelColor || 'ink'),
      dataLabelFormatCode: o.format,
      valAxisLabelFormatCode: o.format,
      barGapWidthPct: o.gap ?? 60,
      lineSize: o.lineSize ?? 2, lineDataSymbol: o.markers ? 'circle' : 'none', lineDataSymbolSize: 6,
      valAxisMinVal: o.min, valAxisMaxVal: o.max,
      barDir: o.horizontal ? 'bar' : 'col',
      holeSize: o.holeSize, showPercent: o.showPercent, showTitle: false,
      ...named(o), ...(o.raw || {}),
    };
    slide.addChart(pptx.ChartType[type] ?? type, data, opts);
    record('chart', opts, { allowOverlap: true });
  }

  // ---- tables (editorial: horizontal hairlines only) ----
  function table(rows, o) {
    const head = styleOf(o.headStyle || 'label');
    const body = styleOf(o.bodyStyle || 'body');
    const none = { type: 'none' };
    const hair = { type: 'solid', color: color('hairline'), pt: 0.75 };
    const strong = { type: 'solid', color: color('ink'), pt: 1 };
    const data = rows.map((r, ri) => r.map((cell) => {
      const c = typeof cell === 'object' && cell !== null ? cell : { text: String(cell) };
      const st = ri === 0 && o.header !== false ? head : body;
      return {
        text: c.text,
        options: {
          ...runOptions({ ...st, ...pick(c, STYLE_KEYS) }), align: c.align, valign: 'middle',
          margin: [4, 6, 4, 0],
          border: [none, none, ri === 0 && o.header !== false ? strong : hair, none],
        },
      };
    }));
    const box = { x: o.x, y: o.y, w: o.w, colW: o.colW, rowH: o.rowH };
    slide.addTable(data, { ...box, autoPage: false });
    record('table', { x: o.x, y: o.y, w: o.w, h: o.h ?? (o.rowH ?? 0.4) * rows.length }, { allowOverlap: true });
  }

  // ---- page-level ----
  // A color token may map to a texture image (theme.backgroundImages), e.g. paper grain. QA still uses the color.
  function bg(c) {
    bgColor = color(c);
    const img = theme.backgroundImages?.[c];
    slide.background = img ? { path: path.resolve(deckDir, img) } : { color: bgColor };
  }
  function bgImage(src) { slide.background = { path: path.resolve(deckDir, src) }; }
  const notes = (t) => slide.addNotes(t);

  return {
    theme, W, H, M, innerW, colW, col, span, color, face, mix,
    page, // { id, index, total } — for running heads and progress marks
    text, rect, line, arc, rule, vrule, dot, shape, image, chart, table, light, bg, bgImage, notes,
    _qa: () => ({ boxes, bg: bgColor }), _builds: () => builds, _lights: () => lights, _slide: slide, _pptx: pptx,
  };
}

const STYLE_KEYS = ['font', 'size', 'color', 'bold', 'italic', 'underline', 'tracking', 'leading', 'highlight', 'superscript', 'subscript'];
function pick(o, keys) { const r = {}; for (const k of keys) if (o[k] !== undefined) r[k] = o[k]; return r; }

module.exports = { makeKit };
