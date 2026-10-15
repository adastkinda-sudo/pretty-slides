# Pretty Slides

一条和 AI 一起做演示的流水线：从一个主题出发，产出**原生可编辑、审美好、有主题个性**的 PowerPoint。

![示例：Steve Jobs 的一生（空房间，23 页）](examples/steve-jobs/renders/_contact.png)

**Steve Jobs 的一生**（23 页）：设计不问“他的故事像什么”，而问“如果乔布斯来做这套关于他自己的演示，他会怎样做”。于是整套是 1982 年他那间几乎空着的客厅：每页只放一件按真实尺寸画的东西，窗外的阳光从清晨走到黄昏，他的一生是一天。意象、三个方向的对比、第一版为什么被否决，见 [examples/steve-jobs/README.md](examples/steve-jobs/README.md)。

![示例：注意力机制（引擎自测 deck）](examples/attention/renders/_contact.png)

**注意力机制**（7 页，引擎自测）：一间暗室，注意力是照亮它的光。设计系统和每个决定的来龙去脉，见 [examples/attention/design-notes.md](examples/attention/design-notes.md)。

两套演示来自同一条流水线、同一套规范，却是完全不同的两个世界：风格从内容里长出来，而不是从模板里来。

## 为什么做这个

市面上的 AI 做 PPT，问题大多不在功能，而在审美：卡片网格、图标当项目符号、渐变色带、编号圆圈、千篇一律的“标题 + 三栏”。它们让每一页都“像幻灯片”，却没有一页是为自己的内容设计的。

Pretty Slides 换了一种做法。它的审美标准写在 [guides/aesthetic/principles.md](guides/aesthetic/principles.md)，核心是：

- **设计服务于内容，先找到主题的意象**：注意力机制像在黑夜里找到规律，于是整套是一间暗室，注意力是照亮它的光。能套在任何主题上的风格，本身就是模板。
- **一个世界，一脉相承**：同一种底色、质感和图形语言，不在黑白蓝之间跳；节奏靠光的强弱和尺度变化。
- **每页一个视觉中心，用图说话**：光落在重点上，引导线把视线带过去；每页都有图，文字只留重点。
- **动起来**：按讲解顺序逐步出现，翻页时光随 Morph 移到下一个重点。
- **工艺精确，有让人记住的画面**：对齐、混排、换行这些细节都要讲究；整套有起伏，有签名画面。
- **在比较中选择**：样张阶段先把 2–3 个截然不同的视觉方向做成探针页并排对比，你选定之后再深化。
- **先设计，再制作**：设计文稿把每一页要做成什么样写到可以直接制作的程度；样张会原样进入成稿。
- **每个阶段在新会话里只读文件**：上下文干净，你的偏好和禁令都记录在文件里，不会在长对话里丢失。
- **渲染才算数**：每次修改都会渲染出图，AI 自己先看过，再给你看。

## 工作流

| 步骤 | 你做什么 | 命令 | 产出 |
|---|---|---|---|
| 0 立项 | 给一个主题 | `/new-deck 注意力机制入门` | `projects/<slug>/` |
| 1 内容 | 和 AI 聊：受众、时长、目标、材料；审阅文稿 | （直接对话） | `01-content/content.md` |
| 2 设计 | 审阅设计文稿，提意见，认可 | `/design` | `02-design/design.md` |
| 3a 方向 | 看 2–3 个视觉方向的并排对比，选一个（也可以混合） | `/reference` | `03-reference/directions/_compare.png` |
| 3b 样张 | 看 3–5 页正式样张，确认视觉语言 | `/reference`（再次运行） | `03-reference/out/*.pptx` |
| 4 成稿 | 等待 | `/build-deck` | `04-deck/out/<slug>.pptx` |
| 5 修改 | 逐页提意见，想改几轮就改几轮 | `/revise S03 标题太大` | 前后对比 + 修改记录 |

第 2、3、4 步会自动开启**独立的新会话**（fork），只依据项目文件工作，完成后把结果交回给你审阅。每一步都需要你明确说“可以”，才会进入下一步。

在 Claude Code 中打开本仓库即可使用。其他 Agent（如 Codex）可以先读 `AGENTS.md`，再按 `.claude/skills/*/SKILL.md` 执行。

## 规范按需加载

`AGENTS.md` 只放每次都需要的规则。其余规范放在 `guides/` 里，只在用到时读取：

| 文件 | 何时读 |
|---|---|
| `guides/content.md` | 写内容文稿 |
| `guides/design-doc.md` | 写设计文稿 |
| `guides/aesthetic/principles.md` | 审美标准（九条）、怎么判断、冲突时的取舍 |
| `guides/aesthetic/anti-ai.md` | 四种失败方式（通用部件、伪极简、安全的千篇一律、风格跳变）与自检问题 |
| `guides/aesthetic/typography.md` | 字体（只列本机已验证的）、字号层级、中文排版 |
| `guides/aesthetic/color.md` | 从主题取色；五个截然不同的方向示例（已校验对比度） |
| `guides/aesthetic/composition.md` | 网格、构图动作、尺度、强度曲线、签名画面、结构层、章节页 |
| `guides/aesthetic/imagery.md` | 图片来源与处理 |
| `guides/aesthetic/data-and-diagrams.md` | 图表、图解、公式、代码 |
| `guides/aesthetic/motion.md` | 页内动效、Morph、移动的光、转场 |
| `guides/production/engine.md` | 引擎 API |
| `guides/production/review.md` | 渲染自查：硬问题、判断问题、工艺检查、不准动的范围 |
| `guides/handoff.md` | 框架开发：Codex 与 Claude 的 worktree、提交、经 main 汇合 |

## 制作引擎

`engine/` 是 [pptxgenjs](https://github.com/gitbrent/PptxGenJS) 外的一层薄封装：

- **原生可编辑**：文字、形状、线条、原生图表、表格都可以在 PowerPoint 中直接修改。
- **设计令牌**：每个 deck 的 `theme.js` 锁定颜色、字体、字号和网格。页面代码只引用令牌。
- **Morph**：同名对象跨页自动配对（PowerPoint 的 `!!name` 约定），用连续的页面代替逐项动画。
- **几何 QA**：检查是否越界、文字溢出、文字重叠、对比度不足、字号过多，以及字体是否已安装。
- **渲染**：通过 LibreOffice 输出逐页 PNG 和缩略总览；保留上一版渲染，方便做前后对比。
- **手工修改回写**：`engine/dump.js` 读出你在 PowerPoint 中手动修改过的对象，AI 再把修改同步回代码。

```bash
npm --prefix engine install
node engine/make.js examples/attention          # 构建示例
node engine/make.js examples/steve-jobs         # 另一个示例（23 页）
```

依赖：Node.js 18+、LibreOffice、poppler（`pdftoppm`）、ImageMagick 7。macOS：`brew install --cask libreoffice && brew install poppler imagemagick`。

## 已知限制

- 预览由 LibreOffice 渲染，与 PowerPoint 有细微差异（中西文之间的间距、个别行高）。最终请在 PowerPoint 中检查。
- Morph 只能在 PowerPoint 中放映验证。不生成页内逐项动画，也不生成可编辑的 OMML 公式。
- pptx 不嵌入字体：播放的电脑上必须装有设计中使用的字体。

## 已知问题（待修）

- **宋体的西文字形在 PowerPoint 中被替换。** 字体写成 `Songti SC` 时，西文字母在 PowerPoint 里显示为无衬线体。待查 PowerPoint 中字体框显示的名称。临时做法：西文使用独立的西文字体。
- 预览中把苹方渲染成宋体的问题已经修复：原因是带字重后缀的中文字体名，现在由 QA 拦截（见 `typography.md`）。
