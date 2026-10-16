# 制作引擎

> 何时读：写或改任何幻灯片代码之前。

引擎是 pptxgenjs 外面的一层薄封装，外加后处理（转场、Morph、字体配对）、几何 QA 和渲染。产出的是原生 pptx：文字、形状、线条、图表、表格都可以在 PowerPoint 里直接编辑。

## deck 目录

```text
<deckDir>/                   # 03-reference/ 或 04-deck/
├── deck.js                  # { name, title, theme: './theme.js', slides: ['S01', ...], minutes?: 20 }
├── theme.js                 # 设计令牌（design.md 中“设计系统”的代码版）
├── parts.js                 # 可选：本 deck 内复用的图形部件（整套的视觉母题，例如向量条）
├── slides/S01-cover.js      # 一页一个文件；文件名 = 页面 ID + 短名
├── assets/                  # 本 deck 用到的图片（加工后的版本）
├── out/<name>.pptx          # 构建产物（可再生）
└── renders/S01.png …        # 渲染图；_contact.png 是缩略总览
```

- **页面 ID**（`S01`、`S02`…）在 `design.md`、样张、成稿、修改记录中保持不变。插入新页用新 ID（如 `S04b`），在 `deck.js` 的 `slides` 数组里调整顺序。不要为了编号连续去重命名已有页面。
- 骨架模板在 `templates/deck/`，其中 `parts.js` 已经包含结构层部件（`frame` 导航框架、`dim` 尺寸线、`leader` 引导线）。完整示例在 `examples/attention/`。

## 命令

```bash
node engine/make.js <deckDir>                 # 构建 + QA + 渲染全部 + 缩略总览
node engine/make.js <deckDir> --only S03,S07  # 只渲染这几页（修改时用）
node engine/make.js <deckDir> --no-render     # 只构建 + QA
node engine/dump.js <file.pptx> [页码]        # 读出 pptx 中各对象的名称、位置、文字
node engine/texture.js <hex> <out.jpg>         # 生成与背景色匹配的纸张颗粒
node engine/pptdiff.js <原文件.pptx> <修复后.pptx>  # PowerPoint 提示“修复”时，找出它改了什么
node engine/compare.js <out.png> <dirA> <dirB> [dirC] [--only S01,S05] [--labels A,B,C]  # 并排对比图：一列一个 deck（或 renders 目录），一行一页
npm --prefix engine test                      # 引擎回归测试（修改 engine/lib 后运行）
```

QA 输出分两级：`✗` 是硬问题，给用户看之前必须修掉；`·` 是软提示，看渲染图后判断。QA 只是几何上的估算，**仍然必须看渲染图**。

QA 同时检查遗留的占位符：页面上的模板文字（`{{…}}`、带中文的尖括号如 `<论断标题>`、`SXX`、`lorem ipsum`）是 `✗`；`TODO`、`TBD`、`FIXME`、`XXX`、`待定`、`待补`、`占位` 可能是正文本身，只给 `·` 提示；讲稿里出现以上任何一种，也给 `·` 提示。

QA 之后还有两段输出：

- **画面文字核对**：deck 目录向上能找到 `02-design/design.md` 时，逐页对照逐页方案里的“画面文字”（每个子条目取冒号后的文字；有引号时只取引号里的；全角括号里的说明不算），列出设计文稿要求而页面上没有的文字，以及页面上有而设计文稿里没写的较长文字。一项文字整段出现在页面上，或者按 `/`、`、`、`·` 拆开的每一段都出现，就算对上；西文和数字的片段（如 `street 0.17`）各个词分开出现也算。比较时忽略空白、引号和大小写。读的是构建出的 pptx。结构层文字（`chrome: true`，如导航框架的章节标记）由 design.md 的“结构层”描述，不参与“页面上有、design.md 没写”的核对。
  - 同时能找到 `01-content/content.md`，并且 deck 包含 design.md 逐页方案里的全部页面（即完整成稿，不是样张）时，还会把 content.md 每个“必须上屏”条目里引号中的文字放到整套页面里查找，列出整套都没有的条目。不加引号的描述不核对。
- **讲解时长估算**：由各页 `notes` 估算，汉字和数字每个算 1，英文单词每个算 1.3，括号里的动作提示不算；默认每分钟 170 字。`deck.js` 写了 `minutes`（目标时长）时，估算超出 15% 或不到 75% 会提示；`speechRate` 可以改语速。

## 幻灯片模块

```js
// S04 — 数据：一个大数字 + 原生折线图
module.exports = {
  id: 'S04',
  title: '平方代价',               // 给人看的短名
  rhythm: 'dense',                 // anchor | breathing | dense（来自 design.md 的节奏表）；QA 检查每页有没有图：dense 页没有图是硬问题，其他页是提示
  // textOnly: true,               // 纯公式或代码页，跳过“必须有图”的检查
  bg: 'paper',                     // 可选，默认 theme.background
  transition: 'fade',              // 可选：'none' | 'fade' | 'morph' | { type, duration }
  notes: `讲稿……`,                  // 可以照着讲的口语讲稿；括号里写动作提示（单击 1），不计入时长估算
  build(k) {
    k.text('序列长度翻倍，代价变为四倍', { style: 'title', ...k.span(1, 8), y: k.M.top });
    // ...
  },
};
```

## `k` 的 API

单位都是英寸。颜色可以写 theme 里的名字（`'accent'`），也可以写十六进制（`'1B1B1A'`）。

**画布与网格**

| 成员 | 含义 |
|---|---|
| `k.W`、`k.H` | 画布宽高（13.333 × 7.5） |
| `k.M` | 边距 `{ x, top, bottom }` |
| `k.col(n)` | 第 n 栏（从 1 开始）的 x |
| `k.span(a, b)` | 第 a 到 b 栏的 `{ x, w }`，可以展开：`{ ...k.span(1, 6), y }` |
| `k.color(name)`、`k.mix(a, b, t)` | 取颜色；在两色之间插值（用于热图、色阶） |
| `k.page` | `{ id, index, total }`：本页的页码与总页数，用于导航框架 |

**文字** `k.text(content, opts)`

- `content`：字符串（`\n` 表示换段），或者 run 数组：`['普通', { text: '强调', color: 'accent' }, { text: 'Latin', font: 'latin' }]`。run 也可以带 `style`。
- `opts`：`style`（theme.type 里的名字），`x y w h`，`align`（left/center/right），`valign`（默认 top），`paraSpace`（段后距，pt），`name`（Morph 配对名），`overlap: true`（有意叠压，跳过重叠检查），`nowrap: true`（不自动换行），`chrome: true`（结构层元素，允许放在边距内），`bleed: true`（有意出血的大字），`build: 1` 或 `build: [1, 300]`（页内动效：第几次单击淡入、延迟毫秒；所有元素都支持），`rotate`。
- **单行标签一律 `nowrap: true`**：PowerPoint 的字体度量和预览不同，卡着宽度的文本框在 PowerPoint 里会意外折行（例如 “animal” 被折成 “anima / l”）。QA 会把余量小于 12% 的文本框判为硬问题。
- 也可以覆盖样式：`font size color bold italic tracking leading`。
- 不写 `h` 时，按估算的高度自动给出。
- 返回 `{ x, y, w, h, bottom, right, estH }`，可以用来排下一个元素：`const t = k.text(...); k.text(..., { y: t.y + t.estH + 0.3 })`。

**形状**

| 方法 | 参数 |
|---|---|
| `k.rule({ x, y, w, color?, weight? })` | 水平细线（默认 hairline 色、0.75pt） |
| `k.vrule({ x, y, h, ... })` | 垂直细线 |
| `k.line({ x1, y1, x2, y2, color, weight, dash, arrow })` | 任意线段；`arrow: 'end' \| 'start' \| 'both'` |
| `k.rect({ x, y, w, h, fill, line, lineW, transparency, radius, bleed, name })` | 矩形。`radius` 默认不用 |
| `k.arc({ x1, x2, y, h, color, weight })` | 基线 y 上方、从 x1 到 x2 的半椭圆弧，顶点高 h（弧线图）；返回 `{ apex }` |
| `k.dot({ cx, cy, r, fill, line })` | 圆点 |
| `k.shape(type, opts)` | 任意 pptxgenjs 形状（逃生口，慎用） |

**光** `k.light({ cx, cy, r, color, strength })`：让 (cx, cy) 周围的区域稍微亮一点，漫反射式的自然衰减，没有可见的形状边缘（r 是光的范围，光是圆形的；默认颜色取 theme 的 `glow`），自动置于最底层；每页最多一束；Morph 名固定为 `light`，整套使用 Morph 转场时会在页面之间移动。

**图片** `k.image(src, { x, y, w, h, fit: 'cover' | 'contain', focus: { x, y }, bleed, name, transparency })`，src 相对于 deck 目录。只支持 PNG 和 JPEG。

**图表** `k.chart(type, data, opts)`：`type` 为 `bar | line | area | pie | doughnut | scatter`；`data` 为 `[{ name, labels, values }]`。opts：`x y w h`、`colors`、`legend`、`labels`（显示数值）、`format`（数字格式，如 `'0%'`）、`grid: false`、`valAxis: false`、`horizontal`、`min/max`、`markers`、`lineSize`、`raw`（直接传 pptxgenjs 的选项）。

**表格** `k.table(rows, { x, y, w, colW, rowH, header, headStyle, bodyStyle })`：只有水平细线的编辑式表格。单元格可以写成 `{ text, align, color, bold }`。

**页面** `k.bg(color)`、`k.bgImage(src)`、`k.notes(text)`（通常直接写模块的 `notes`）。

## theme.js

```js
module.exports = {
  size: { w: 13.333, h: 7.5 }, lang: 'zh-CN', background: 'paper',
  colors: { paper, paperDeep, ink, graphite, stone, hairline, accent, glow, ... }, // glow：k.light 的光色
  fonts: { serif: 'Songti SC', sans: 'Hiragino Sans GB', ... },     // 角色名 → 真实字体名（不用苹方，见 typography.md）
  fontPairs: { 'Hiragino Sans GB': 'Helvetica Neue' },               // 可选：中文字体里的西文改用某字体
  cjkFallback: 'Hiragino Sans GB',                                   // 可选：西文字体里的中文用哪个字体（默认 fonts.sans）
  backgroundImages: { paper: 'assets/grain-paper.jpg' },             // 可选：某个背景色用纹理图（node engine/texture.js 生成）
  grid: { margin: { x: 0.85, top: 0.75, bottom: 0.6 }, cols: 12, gutter: 0.22 },
  type: { display: { font: 'serif', size: 66, leading: 1.12, tracking: 0, color: 'ink' }, ... },
  chart: { series: ['accent', 'stone'] },
  transition: 'fade',                                                // 或 { type: 'morph', duration: 1400 }：整套 Morph，配合移动的光
};
```

- `tracking` 是字号的百分比（-1 = -1%），`leading` 是行距倍数。
- **theme 是规格锁**：颜色、字体、字号只能来自 theme。幻灯片里偶尔需要一个特殊字号可以直接写（`size: 140`），但同一个值出现第三次时，就把它加进 theme。
- 修改 theme 会影响所有页面。修改后要重新渲染整套，并检查缩略总览。

## 写代码的习惯

- 先布局后细节：先放主体，再放标题，最后放标注。
- 位置用网格和已有元素推算，而不是到处写魔法数字。重复出现的结构（如统一的页脚）放进 `parts.js`。
- 文件开头写一行注释：页面 ID、构图动作、主角是什么。
- 需要跨页 Morph 的对象，在相关页面上起相同的 `name`。
- 不要在幻灯片代码里写演示内容以外的东西（例如“TODO”“草稿”）：它们会出现在画面上。

## PowerPoint 提示“修复”时

LibreOffice 对不合规范的 XML 很宽容，所以预览正常不代表 PowerPoint 能接受。`make.js` 的后处理已经修正了 pptxgenjs 已知的几类问题（多余的内容类型声明、备注母版共用主题、图表的悬空坐标轴、同一段落里重复的 `pPr`、动画的 `bldP`），并会在包内引用指向不存在的部件时直接报错。如果仍然出现修复提示：

1. 让用户点“修复”，另存一份。
2. `node engine/pptdiff.js out/<name>.pptx <修复后>.pptx`，看 PowerPoint 改了哪里。重新保存本身也会带来一些无关的变化（属性顺序、命名空间位置、图片去重、扩展信息），要找的是在多页上重复出现、或者删除和合并了内容的变化。
3. 在 `engine/lib/post.js` 里修正，再请用户确认。PowerPoint 打开后才弹出的修复对话框，自动检测发现不了，必须由用户确认。

## 已知限制

- 页内动效目前只有淡入（`build`）；移动和变形用跨页 Morph（见 `aesthetic/motion.md`）。
- 不生成可编辑的 OMML 公式（见 `aesthetic/data-and-diagrams.md`）。
- 预览由 LibreOffice 渲染，与 PowerPoint 有差异：中西文之间的自动间距、个别字体的行高；径向渐变在 LibreOffice 里会随形状拉伸成椭圆，在 PowerPoint 里则是正圆（所以 `k.light` 的承载形状必须是正方形）。涉及渐变、透明度、动效的效果，最终以 PowerPoint 为准。
- pptx 不嵌入字体，播放环境必须装有所用字体。
