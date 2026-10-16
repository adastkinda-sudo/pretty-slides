// npm --prefix engine test
const test = require('node:test');
const assert = require('node:assert');
const { fontIssues, chineseFamilies, cjkFallback, fixEastAsian } = require('../lib/fonts');

// fc-list ': family fullname' and ':lang=zh family' as fontconfig prints them.
const installed = [
  'Hiragino Sans GB,冬青黑体简体中文:fullname=Hiragino Sans GB W3',
  'Songti SC,宋體\\-簡,宋体\\-简:fullname=Songti SC Regular',
  'PingFang SC,蘋方\\-簡,苹方\\-简:fullname=PingFang SC Regular',
  'Gill Sans:fullname=Gill Sans',
  'Helvetica Neue:fullname=Helvetica Neue',
].join('\n');
const zh = ['Hiragino Sans GB,冬青黑体简体中文', 'Songti SC,宋體\\-簡,宋体\\-简', 'PingFang SC,蘋方\\-簡,苹方\\-简'].join('\n');
const theme = (fonts, extra = {}) => ({ fonts, type: { body: { font: 'sans' } }, ...extra });

test('PingFang is installed but flagged: PowerPoint substitutes it', () => {
  const r = fontIssues(theme({ head: 'Songti SC', sans: 'PingFang SC' }), installed);
  assert.deepStrictEqual(r, { missing: [], pptUnavailable: ['PingFang SC'], suffixed: [] });
});

test('missing fonts, fontPairs and weight-suffixed CJK names', () => {
  const r = fontIssues(theme({ sans: 'Hiragino Sans GB W6', label: 'Inter' }, { fontPairs: { 'Hiragino Sans GB': 'Helvetica Neue' } }), installed);
  assert.deepStrictEqual(r.missing, ['Hiragino Sans GB W6', 'Inter']);
  assert.deepStrictEqual(r.suffixed, ['Hiragino Sans GB W6']);
  assert.deepStrictEqual(fontIssues(theme({ sans: 'Hiragino Sans GB', label: 'Gill Sans' }), installed), { missing: [], pptUnavailable: [], suffixed: [] });
  // Without fontconfig the installed check is skipped, the others still run.
  assert.deepStrictEqual(fontIssues(theme({ sans: 'PingFang SC' }), null).pptUnavailable, ['PingFang SC']);
});

test('the Chinese fallback is the sans role, an explicit cjkFallback, or any Chinese theme font', () => {
  const chinese = chineseFamilies(zh);
  assert.strictEqual(cjkFallback(theme({ head: 'Songti SC', sans: 'Hiragino Sans GB' }), chinese), 'Hiragino Sans GB');
  assert.strictEqual(cjkFallback(theme({ sans: 'Hiragino Sans GB' }, { cjkFallback: 'Songti SC' }), chinese), 'Songti SC');
  assert.strictEqual(cjkFallback(theme({ head: 'Songti SC', sans: 'Helvetica Neue' }), chinese), 'Songti SC');
  assert.strictEqual(cjkFallback(theme({ sans: 'Helvetica Neue' }), chinese), null);
});

test('runs in a Latin-only face get the Chinese face as ea; Chinese faces are left alone', () => {
  const chinese = chineseFamilies(zh);
  const run = (face) => `<a:latin typeface="${face}" pitchFamily="34" charset="0"/><a:ea typeface="${face}" pitchFamily="34" charset="0"/>`;
  assert.strictEqual(fixEastAsian(run('Gill Sans'), chinese, 'Hiragino Sans GB'),
    '<a:latin typeface="Gill Sans" pitchFamily="34" charset="0"/><a:ea typeface="Hiragino Sans GB"/>');
  assert.strictEqual(fixEastAsian(run('Songti SC'), chinese, 'Hiragino Sans GB'), run('Songti SC'));
  assert.strictEqual(fixEastAsian(run('Gill Sans'), chinese, null), run('Gill Sans'));
  assert.strictEqual(fixEastAsian(run('Gill Sans'), new Set(), 'Hiragino Sans GB'), run('Gill Sans'));
});
