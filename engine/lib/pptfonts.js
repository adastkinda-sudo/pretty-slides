// Fonts PowerPoint actually used, read from its PDF export, against the fonts the theme names.
//
// The PDF names fonts by PostScript name (HiraginoSansGB-W3, STSongti-SC-Regular); fontconfig maps them back to
// family and full names. A font that maps to no theme font is one PowerPoint substituted or fell back to
// (Microsoft YaHei for Chinese in a Latin-only face, Segoe UI Symbol for a missing symbol). Fonts bundled inside
// PowerPoint (Segoe UI Symbol) are unknown to fontconfig and count as outside the theme too.

const { themeFonts, names, fc } = require('./fonts');

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

// pages: [{ id, fonts: [ps] }] -> [{ ps, family, pages: [id] }] for fonts outside the theme, in order of first use.
function foreignFonts(pages, theme, resolve = resolver()) {
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

module.exports = { parsePdffonts, resolver, foreignFonts };
