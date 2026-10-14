// Geometry QA from recorded boxes. Hard = must fix. Soft = look at the render and decide.

function lum(hex) {
  const v = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const inter = (a, b) => a.x < b.x + b.w - 0.01 && b.x < a.x + a.w - 0.01 && a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01;

function check({ id, boxes, bg, W, H, M, rhythm, textOnly }) {
  const hard = [], soft = [];
  const texts = boxes.filter((b) => b.kind === 'text');

  for (const b of boxes) {
    const out = b.x < -0.01 || b.y < -0.01 || b.x + b.w > W + 0.01 || b.y + b.h > H + 0.01;
    if (out && !b.bleed) hard.push(`超出画布: ${b.kind} at (${b.x.toFixed(2)}, ${b.y.toFixed(2)}) ${b.w.toFixed(2)}×${b.h.toFixed(2)}${b.sample ? ` “${b.sample}”` : ''} — 若是有意出血，加 bleed:true`);
  }
  for (const t of texts) {
    if (!t.nowrap && t.lineW <= t.w && t.lineW > t.w * 0.88) {
      hard.push(`文本框宽度余量不足: “${t.sample}” 估算宽 ${t.lineW.toFixed(2)}in / 框宽 ${t.w.toFixed(2)}in — PowerPoint 的字体度量不同，可能意外折行；单行标签用 nowrap:true，或加宽到 ≥ 1.15 倍`);
    }
    if (t.est > t.h * 1.08) hard.push(`文字可能溢出: “${t.sample}” 估算高 ${t.est.toFixed(2)}in > 框高 ${t.h.toFixed(2)}in`);
    if (!t.chrome && (t.x < M.x - 0.02 || t.x + t.w > W - M.x + 0.02 || t.y < M.top - 0.02 || t.y + t.h > H - M.bottom + 0.02)) {
      soft.push(`文字越过安全边距: “${t.sample}”（有意为之可忽略）`);
    }
    // background under the text: topmost filled rect containing the text centre, else page bg
    const cx = t.x + t.w / 2, cy = t.y + Math.min(t.h, 0.4) / 2;
    const under = boxes.slice(0, boxes.indexOf(t)).reverse().find((b) => b.kind === 'rect' && b.fill && cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h);
    const ground = under ? under.fill : bg;
    if (t.color && ground) {
      const r = contrast(t.color, ground);
      const need = t.size >= 24 ? 3 : 4.5;
      if (r < need) (r < need * 0.8 ? hard : soft).push(`对比度不足 ${r.toFixed(2)}:1 (需 ≥${need}) “${t.sample}”`);
    }
  }
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.allowOverlap || b.allowOverlap) continue;
      const ah = { ...a, h: Math.min(a.h, a.est) }, bh = { ...b, h: Math.min(b.h, b.est) };
      if (inter(ah, bh)) hard.push(`文字重叠: “${a.sample}” × “${b.sample}”（有意叠压加 overlap:true）`);
    }
  }
  // Explanatory (dense) pages need a figure that carries the mechanism — names alone read as lazy.
  if (rhythm === 'dense' && !textOnly) {
    const figs = boxes.filter((b) => b.kind !== 'text' && !(b.kind === 'line' && (b.h < 0.02 || b.w < 0.02)));
    if (!figs.length) {
      hard.push('dense 页没有图形主体：讲解页需要一张表达机制的图（见 anti-ai.md「伪极简」）。纯公式或代码页可在模块里写 textOnly: true');
    } else {
      const x0 = Math.min(...figs.map((b) => b.x)), x1 = Math.max(...figs.map((b) => b.x + b.w));
      const y0 = Math.min(...figs.map((b) => b.y)), y1 = Math.max(...figs.map((b) => b.y + b.h));
      const share = ((x1 - x0) * (y1 - y0)) / ((W - 2 * M.x) * (H - M.top - M.bottom));
      if (share < 0.25) soft.push(`dense 页的图形主体只占安全区 ${(share * 100).toFixed(0)}%：主角可能太小（建议 ≥ 40%）`);
    }
  }
  const sizes = new Set(texts.map((t) => t.size));
  if (sizes.size > 5) soft.push(`本页字号种类 ${sizes.size} 个（${[...sizes].sort((a, b) => b - a).join('/')}pt），层级可能过散`);
  return { id, hard, soft };
}

module.exports = { check, contrast };
