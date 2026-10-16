// npm --prefix engine test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const JSZip = require('jszip');
const { parseDesign, parseMustShow, placeholders, missingItems, checkText } = require('../lib/textcheck');

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

// A project directory with the given files, and a .pptx whose slides carry the given paragraphs.
async function fixture(files, slides) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'textcheck-'));
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), body);
  }
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const para = (t) => `<a:p><a:r><a:t>${esc(t)}</a:t></a:r></a:p>`;
  const zip = new JSZip();
  slides.forEach((paras, i) => zip.file(`ppt/slides/slide${i + 1}.xml`, `<p:sld>${paras.map(para).join('')}</p:sld>`));
  return { root, buf: await zip.generateAsync({ type: 'nodebuffer' }) };
}
const plan = (ids) => `## 7. 逐页方案\n\n${ids.map((id) => `### ${id} · dense · 测试\n\n- **画面文字**：\n  - 标题：页面 ${id}\n`).join('\n')}`;
const manifest = (ids) => ids.map((id, i) => ({ id, index: i + 1 }));

test('structure-layer (chrome) text is not reported as missing from design.md', async () => {
  const { root, buf } = await fixture(
    { '02-design/design.md': '## 7. 逐页方案\n\n### S04 · dense · 测试\n\n- **画面文字**：\n  - 标题：每个词同时扮演三个角色\n' },
    [['01   按内容检索', '每个词同时扮演三个角色', '多出来的说明文字']],
  );
  const res = await checkText(path.join(root, '03-reference'), buf, manifest(['S04']), { chrome: [['01   按内容检索']] });
  const soft = res.reports[0].soft.join('\n');
  assert.ok(!soft.includes('按内容检索'), soft);
  assert.ok(soft.includes('多出来的说明文字'), soft);
  fs.rmSync(root, { recursive: true, force: true });
});

test('must-show items: only quoted text, inline or one per sub-bullet', () => {
  const md = '### 第 1 章\n正文\n- 必须上屏：“注意力是一种检索”、注意力公式\n- 口头讲：“不检查这句”\n\n### 第 2 章\n- **必须上屏**：\n  - 数据：“延迟从 800ms 降到 120ms”\n  - 定义：“Q / K / V”\n  - 示意图（不加引号，不检查）\n- 备注：……\n';
  assert.deepStrictEqual(parseMustShow(md).map((i) => i.text), ['注意力是一种检索', '延迟从 800ms 降到 120ms', 'Q / K / V']);
});

test('must-show text missing from the whole deck is reported once the deck is complete', async () => {
  const files = {
    '01-content/content.md': '- 必须上屏：“注意力是一种检索”、“延迟从 800ms 降到 120ms”\n',
    '02-design/design.md': plan(['S01', 'S02']),
  };
  const { root, buf } = await fixture(files, [['页面 S01', '注意力是一种检索'], ['页面 S02', '延迟 800ms']]);
  const res = await checkText(path.join(root, '04-deck'), buf, manifest(['S01', 'S02']));
  assert.strictEqual(res.deck.length, 1);
  assert.ok(res.deck[0].includes('延迟从 800ms 降到 120ms') && !res.deck[0].includes('检索'), res.deck[0]);
  // A sample deck with only some of the planned pages is not checked.
  const sample = await checkText(path.join(root, '03-reference'), buf, manifest(['S01']));
  assert.deepStrictEqual(sample.deck, []);
  assert.strictEqual(sample.content, null);
  fs.rmSync(root, { recursive: true, force: true });
});

test('placeholders: template text is hard, possible content is soft, notes are soft', () => {
  assert.deepStrictEqual(placeholders(['注意力，是一种检索'], '大家好，今天讲注意力。（单击 1）'), { hard: [], soft: [] });
  const r = placeholders(['<论断标题>', '{{TITLE}}', 'SXX'], '');
  assert.strictEqual(r.hard.length, 1);
  assert.ok(['<论断标题>', '{{TITLE}}', 'SXX'].every((t) => r.hard[0].includes(t)), r.hard[0]);
  const soft = placeholders(['TODO 清单应用', '数据待补'], '<讲稿：可以照着念的口语>');
  assert.deepStrictEqual(soft.hard, []);
  assert.strictEqual(soft.soft.length, 2);
  assert.ok(soft.soft[0].includes('TODO') && soft.soft[0].includes('待补') && soft.soft[1].includes('讲稿'), soft.soft.join('\n'));
  // Math and Latin text with angle brackets is not a placeholder.
  assert.deepStrictEqual(placeholders(['x < y > z', 'a<b>'], '').hard, []);
});

test('placeholders are checked without a design.md', async () => {
  const { root, buf } = await fixture({}, [['<论断标题>']]);
  const res = await checkText(path.join(root, '04-deck'), buf, manifest(['S01']), { notes: ['TODO'] });
  assert.strictEqual(res.design, null);
  assert.strictEqual(res.placeholders[0].hard.length, 1);
  assert.strictEqual(res.placeholders[0].soft.length, 1);
  fs.rmSync(root, { recursive: true, force: true });
});
