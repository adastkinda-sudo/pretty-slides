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
const theme = (fonts, extra = {}) => ({ target: 'mac', fonts, type: { body: { font: 'sans' } }, ...extra });
const none = { target: 'mac', notPortable: [], chineseWindows: [], missing: [], pptUnavailable: [], suffixed: [] };
const noBundle = () => false;

test('PingFang is installed but flagged: PowerPoint substitutes it', () => {
  const r = fontIssues(theme({ head: 'Songti SC', sans: 'PingFang SC' }), installed, noBundle);
  assert.deepStrictEqual(r, { ...none, pptUnavailable: ['PingFang SC'] });
});

test('missing fonts, fontPairs and weight-suffixed CJK names', () => {
  const r = fontIssues(theme({ sans: 'Hiragino Sans GB W6', label: 'Inter' }, { fontPairs: { 'Hiragino Sans GB': 'Helvetica Neue' } }), installed, noBundle);
  assert.deepStrictEqual(r.missing, ['Hiragino Sans GB W6', 'Inter']);
  assert.deepStrictEqual(r.suffixed, ['Hiragino Sans GB W6']);
  assert.deepStrictEqual(fontIssues(theme({ sans: 'Hiragino Sans GB', label: 'Gill Sans' }), installed, noBundle), none);
  // Without fontconfig the installed check is skipped, the others still run.
  assert.deepStrictEqual(fontIssues(theme({ sans: 'PingFang SC' }), null).pptUnavailable, ['PingFang SC']);
});

test('a cross-platform deck (the default) names only fonts every Windows and PowerPoint for Mac have', () => {
  const xp = (fonts, extra) => ({ ...theme(fonts, extra), target: undefined });
  const r = fontIssues(xp({ sans: 'Microsoft YaHei', head: 'SimSun', quote: 'KaiTi', latin: 'Helvetica Neue', mono: 'PingFang SC' },
    { fontPairs: { 'Microsoft YaHei': 'Calibri' } }), installed, (f) => ['Microsoft YaHei', 'SimSun', 'KaiTi', 'Calibri'].includes(f));
  assert.strictEqual(r.target, 'cross-platform');
  assert.deepStrictEqual(r.notPortable, ['Helvetica Neue', 'PingFang SC']);
  assert.deepStrictEqual(r.chineseWindows, ['KaiTi']);
  // Fonts bundled inside PowerPoint count as installed; fonts already reported as not portable are not repeated.
  assert.deepStrictEqual([r.missing, r.pptUnavailable], [[], []]);
  assert.deepStrictEqual(fontIssues(xp({ sans: 'Microsoft YaHei' }), installed, noBundle).missing, ['Microsoft YaHei']);
});

test('the Chinese fonts of the cross-platform list cover Chinese without fontconfig', () => {
  assert.strictEqual(cjkFallback({ fonts: { sans: 'Microsoft YaHei', latin: 'Calibri' } }, chineseFamilies(null)), 'Microsoft YaHei');
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
