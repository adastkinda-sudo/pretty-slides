// Font checks: the theme's fonts against the deck's target (fontlist.js) and the fonts this machine has, and the
// East Asian font fix for runs whose font has no Chinese glyphs.
//
// LibreOffice and PowerPoint do not see the same fonts. PingFang is installed on macOS, so LibreOffice renders it,
// but PowerPoint for Mac does not use it and substitutes Microsoft JhengHei / YaHei. The other way round, the fonts
// bundled inside PowerPoint (Microsoft YaHei, Calibri, ...) are invisible to fontconfig and LibreOffice.

const { execFileSync } = require('child_process');
const { CORE, CHINESE_WINDOWS, CHINESE, bundledFiles, target } = require('./fontlist');

// Verified on PowerPoint for Mac 16.114 (macOS 27): text set in these faces is rendered in another font.
const PPT_UNAVAILABLE = [/^PingFang /];
// CJK faces must be named by family only ('Hiragino Sans GB'); weight comes from bold: true.
// Weight-suffixed CJK names ('Hiragino Sans GB W6') resolve inconsistently and fall back to another face (often a serif).
const CJK_NAME = /(PingFang|Songti|Heiti|Hiragino|Kaiti|Yuanti|Lantinghei)/;
const WEIGHT_SUFFIX = / (Ultralight|Thin|Light|Regular|Medium|Semibold|Bold|Heavy|Black|W\d)$/;

// fc-list output (`family` and optionally `:fullname=`) -> Set of every name a font answers to.
function names(fcOut) {
  const set = new Set();
  for (const line of fcOut.split('\n')) {
    const [fam, full] = line.split(':fullname=');
    [...(fam || '').split(','), ...(full || '').split(',')].forEach((n) => n && set.add(n.replace(/\\/g, '').trim()));
  }
  return set;
}

function fc(args) {
  try { return execFileSync('fc-list', args, { encoding: 'utf8' }); } catch { return null; }
}

// fc-scan of the font files PowerPoint bundles for this family ('' when there are none); format as fc-scan --format.
function scanBundled(family, format) {
  const files = bundledFiles(family);
  if (!files.length) return '';
  try { return execFileSync('fc-scan', ['--format', format, ...files], { encoding: 'utf8' }); } catch { return ''; }
}

// Every font family the theme names (roles, pairs, type styles).
function themeFonts(theme) {
  const wanted = new Set([...Object.values(theme.fonts || {}), ...Object.keys(theme.fontPairs || {}), ...Object.values(theme.fontPairs || {})]);
  Object.values(theme.type || {}).forEach((t) => { if (t.font && !theme.fonts?.[t.font]) wanted.add(t.font); });
  if (theme.cjkFallback) wanted.add(theme.cjkFallback);
  return [...wanted].filter(Boolean);
}

// -> { target, notPortable, chineseWindows, missing, pptUnavailable, suffixed }
// notPortable / chineseWindows: fonts outside the cross-platform list, and fonts only a Chinese Windows has (both
// empty for a 'mac' deck). installed: output of `fc-list : family fullname` (null when fontconfig is unavailable,
// which skips the installed check); bundled(f): PowerPoint for Mac bundles f.
function fontIssues(theme, installed = fc([':', 'family', 'fullname']), bundled = (f) => bundledFiles(f).length > 0) {
  const fonts = themeFonts(theme);
  const t = target(theme);
  const notPortable = t === 'mac' ? [] : fonts.filter((f) => !CORE.includes(f) && !CHINESE_WINDOWS.includes(f));
  const rest = fonts.filter((f) => !notPortable.includes(f));
  const have = installed == null ? null : names(installed);
  return {
    target: t,
    notPortable,
    chineseWindows: t === 'mac' ? [] : fonts.filter((f) => CHINESE_WINDOWS.includes(f)),
    missing: have ? rest.filter((f) => !have.has(f) && !have.has(`${f} Regular`) && !bundled(f)) : [],
    pptUnavailable: rest.filter((f) => PPT_UNAVAILABLE.some((re) => re.test(f))),
    suffixed: rest.filter((f) => CJK_NAME.test(f) && WEIGHT_SUFFIX.test(f)),
  };
}

// Families that cover Chinese: the Chinese fonts of the cross-platform list, plus those fontconfig knows;
// zhOut: output of `fc-list :lang=zh family` (null -> none).
function chineseFamilies(zhOut = fc([':lang=zh', 'family'])) {
  const set = zhOut == null ? new Set() : names(zhOut);
  CHINESE.forEach((f) => set.add(f));
  return set;
}

// The font for Chinese text in a run whose font has no Chinese glyphs: theme.cjkFallback, else the theme's
// sans role, else any theme font that covers Chinese.
function cjkFallback(theme, chinese) {
  if (theme.cjkFallback) return theme.cjkFallback;
  const fonts = theme.fonts || {};
  if (fonts.sans && chinese.has(fonts.sans)) return fonts.sans;
  return Object.values(fonts).find((f) => chinese.has(f)) || null;
}

// pptxgenjs writes one face into latin, ea and cs. When that face has no Chinese glyphs (a label in Gill Sans
// that says “按内容检索”), each renderer falls back on its own: PowerPoint to Microsoft YaHei, LibreOffice to
// something else. Name the theme's Chinese face in ea instead, so both use it.
function fixEastAsian(xml, chinese, fallback) {
  if (!fallback || !chinese.size) return xml;
  return xml.replace(/<a:ea typeface="([^"]*)"[^>]*?\/>/g, (m, face) => (face && !chinese.has(face) ? `<a:ea typeface="${fallback}"/>` : m));
}

module.exports = { fontIssues, chineseFamilies, cjkFallback, fixEastAsian, themeFonts, names, fc, scanBundled, PPT_UNAVAILABLE };
