// npm --prefix engine test
const test = require('node:test');
const assert = require('node:assert');
const { parseDesign, missingItems } = require('../lib/textcheck');

const norm = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[\s“”‘’"'「」『』]/g, '');
const design = (lines) => parseDesign(`## 7. 逐页方案\n\n### S01 · dense · 测试\n\n- **画面文字**：\n${lines.map((l) => `  - ${l}`).join('\n')}\n- **构图**：略\n`).S01;
const lost = (lines, slide) => missingItems(design(lines).items, norm(slide.join('')));

test('line breaks with or without spaces around the slash', () => {
  assert.deepStrictEqual(lost(['标题：注意力，/ 是一种检索'], ['注意力，', '是一种检索']), []);
  assert.deepStrictEqual(lost(['标题：注意力 / 是一种检索'], ['注意力', '是一种检索']), []);
});

test('a slash inside Latin text still matches as a whole', () => {
  assert.deepStrictEqual(lost(['标注：W_Q/W_K'], ['W_Q/W_K']), []);
});

test('lists split by 、 and · match labels set as separate boxes', () => {
  assert.deepStrictEqual(lost(['it 的 Query、各词的 Key、softmax 权重、加权求和'], ['加权求和', 'it 的 Query', 'softmax 权重', '各词的 Key']), []);
  assert.deepStrictEqual(lost(['Q · Query · 我在找：我指代的是谁？'], ['Q', 'Query', '我在找：我指代的是谁？']), []);
});

test('label and value in separate boxes', () => {
  assert.deepStrictEqual(lost(['5 个词与权重：The 0.02、street 0.17'], ['The', 'street', '0.02', '0.17']), []);
});

test('a typo is reported as the missing fragment', () => {
  const r = lost(['副标题：从一个代词出发，/ 理解 Transformer 的核心机制'], ['从一个代词出发，', '理解 Transfomer 的核心机制']);
  assert.deepStrictEqual(r.map((m) => m.lost), [['理解 Transformer 的核心机制']]);
});

test('Chinese fragments are not matched word by word', () => {
  const r = lost(['输出说明：it 的新表示 / 以 animal 为主'], ['it 的新表示', '以 street 为主', 'animal']);
  assert.deepStrictEqual(r.map((m) => m.lost), [['以 animal 为主']]);
});

test('quotes give the exact text; full-width parentheses are annotation', () => {
  assert.deepStrictEqual(design(['标题：“注意力，是一种检索”（大字，左对齐）']).items.map((i) => i.text), ['注意力，是一种检索']);
  assert.deepStrictEqual(design(['公式：softmax(QKᵀ) V（左下）']).items.map((i) => i.text), ['softmax(QKᵀ) V']);
  assert.deepStrictEqual(design(['矩阵行标签：（例句的 11 个词）']).items, []);
});
