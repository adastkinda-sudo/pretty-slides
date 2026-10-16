// npm --prefix engine test
const test = require('node:test');
const assert = require('node:assert');
const { parseCharset, coverage, runs, checkGlyphs } = require('../lib/glyphs');

// fc-list ':family=<f>' charset, as fontconfig prints it (one line per face).
const fcOut = {
  'STIX Two Math': ':charset=20-7e a0-180 221a',
  'Helvetica Neue': ':charset=20-7e a0-ff\n:charset=20-7e a0-17f',
  'Hiragino Sans GB': ':charset=20-7e 2191 3000-303f 4e00-9fa5 ff01-ff5e',
  Didot: ':charset=20-7e a0-ff',
};
const has = coverage((f) => fcOut[f] || '');

const run = (latin, text, { ea = 'Hiragino Sans GB', bold = false } = {}) =>
  `<a:r><a:rPr lang="zh-CN" sz="2000"${bold ? ' b="1"' : ''}><a:latin typeface="${latin}" pitchFamily="34" charset="0"/><a:ea typeface="${ea}"/></a:rPr><a:t>${text}</a:t></a:r>`;

test('fontconfig charsets become code point ranges; an unknown font has none', () => {
  assert.deepStrictEqual(parseCharset(':charset=20-7e 221a\n:charset=a0-ff'), [[0x20, 0x7e], [0x221a, 0x221a], [0xa0, 0xff]]);
  assert.strictEqual(parseCharset(''), null);
  assert.strictEqual(has('Not Installed'), null);
  assert.ok(has('STIX Two Math')(0x221a));
  assert.ok(!has('STIX Two Math')(0x1d40));
});

test('runs are read with their faces, weight and unescaped text', () => {
  assert.deepStrictEqual(runs(run('Didot', 'Q &amp; K', { bold: true })), [{ latin: 'Didot', ea: 'Hiragino Sans GB', bold: true, text: 'Q & K' }]);
});

test('characters missing from the face that sets them are hard issues; Chinese goes to the East Asian face', () => {
  const xml = run('STIX Two Math', 'softmax( QKᵀ / √dₖ ) V') + run('Helvetica Neue', '↑ Rectangle') + run('Helvetica Neue', '按内容检索');
  const r = checkGlyphs(xml, has);
  assert.strictEqual(r.hard.length, 2);
  assert.match(r.hard[0], /^'ᵀ'、'ₖ' 不在 STIX Two Math 里/);
  assert.match(r.hard[1], /^'↑' 不在 Helvetica Neue 里/);
  // A font fontconfig does not know is reported by the font check, not here.
  assert.deepStrictEqual(checkGlyphs(run('Not Installed', 'ᵀ'), has).hard, []);
});

test('digits in Didot regular get a soft hint; bold Didot and other faces do not', () => {
  assert.strictEqual(checkGlyphs(run('Didot', '02'), has).soft.length, 1);
  assert.deepStrictEqual(checkGlyphs(run('Didot', '02', { bold: true }), has).soft, []);
  assert.deepStrictEqual(checkGlyphs(run('Didot', 'QKV'), has).soft, []);
  assert.deepStrictEqual(checkGlyphs(run('Helvetica Neue', '1979'), has).soft, []);
});
