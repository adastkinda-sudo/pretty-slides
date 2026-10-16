// Fonts PowerPoint actually used, read from its PDF export, against the fonts the theme names.
//
// The PDF names fonts by PostScript name (HiraginoSansGB-W3, STSongti-SC-Regular); fontconfig maps them back to
// family and full names. A font that maps to no theme font is one PowerPoint substituted or fell back to
// (Microsoft YaHei for Chinese in a Latin-only face, Segoe UI Symbol for a missing symbol). Fonts bundled inside
// PowerPoint are unknown to fontconfig; the theme's are read from their files, any other counts as outside the theme.

const { themeFonts, names, fc, scanBundled } = require('./fonts');

// `pdffonts` output -> PostScript names, subset prefix (ABCDEF+) removed. Type 3 fonts without a name are skipped.
function parsePdffonts(out) {
  const lines = out.split('\n');
  const start = lines.findIndex((l) => /^-{5,}/.test(l)) + 1;
  const set = new Set();
  for (const l of lines.slice(start)) {
    const name = l.trim().split(/\s+/)[0];
    if (name && name !== '[none]') set.add(name.replace(/^[A-Z]{6}\+/, ''));
  }
  return [...set];
}

// PostScript name -> Set of family and full names; lookup(ps) returns `fc-list :postscriptname=<ps> family fullname`.
function resolver(lookup = (ps) => fc([`:postscriptname=${ps}`, 'family', 'fullname'])) {
  const cache = new Map();
  return (ps) => {
    if (!cache.has(ps)) cache.set(ps, names(lookup(ps) || ''));
    return cache.get(ps);
  };
}

// PostScript name -> family line, for the fonts PowerPoint bundles that the theme names.
function bundledNames(theme) {
  const map = new Map();
  for (const f of themeFonts(theme)) {
    for (const line of scanBundled(f, '%{postscriptname}\t%{family}\n').split('\n')) {
      const [ps, family] = line.split('\t');
      if (ps && family) map.set(ps, family);
    }
  }
  return map;
}

// fontconfig first, then the theme's bundled fonts (read once, when first needed).
function themeLookup(theme) {
  let bundled;
  return (ps) => fc([`:postscriptname=${ps}`, 'family', 'fullname']) || (bundled ??= bundledNames(theme)).get(ps) || '';
}

// pages: [{ id, fonts: [ps] }] -> [{ ps, family, pages: [id] }] for fonts outside the theme, in order of first use.
function foreignFonts(pages, theme, resolve = resolver(themeLookup(theme))) {
  const wanted = new Set(themeFonts(theme));
  const hits = new Map();
  for (const p of pages) {
    for (const ps of p.fonts) {
      const known = resolve(ps);
      if ([...known].some((n) => wanted.has(n))) continue;
      if (!hits.has(ps)) hits.set(ps, { ps, family: [...known][0] || null, pages: [] });
      hits.get(ps).pages.push(p.id);
    }
  }
  return [...hits.values()];
}

module.exports = { parsePdffonts, resolver, foreignFonts, themeLookup };
