---
name: build-deck
description: Pretty Slides 阶段 4：在独立的新会话中，依据已认可的设计文稿和参考样张，在 04-deck/ 中生成完整的 PPT。Use when the user asks to build / generate the full deck (完整 PPT、成稿) after the reference slides are approved.
argument-hint: "[project-slug]"
context: fork
---

# 生成完整 PPT

你在一个**全新的会话**里工作，看不到之前的聊天。一切以文件为准。

## 0. 定位项目

- 项目 slug：`$ARGUMENTS`。如果为空：选关口 3b 已勾选、关口 4 未勾选、且最近修改的项目。
- 读 `project.md`。**如果关口 3b 没有勾选**，停止并报告。
- 如果 `04-deck/` 已经存在：从已有的页面继续，不要覆盖已经存在的页面文件（它们可能已经被用户修改过）。

## 1. 读取

1. `project.md`（决策记录）、`02-design/design.md`（全文，包括“样张回写”）。
2. `03-reference/` 中的 `theme.js`、`parts.js`（如果有）和全部样张代码：它们是**已认可的视觉标准**。
3. `guides/aesthetic/principles.md`、`guides/aesthetic/anti-ai.md`、`guides/production/engine.md`、`guides/production/review.md`。
4. `guides/aesthetic/data-and-diagrams.md`（讲解页的图解配方）。
5. 按需：`imagery.md`、`motion.md`、`composition.md`。

## 2. 搭建

```bash
mkdir -p projects/<slug>/04-deck/slides
cp projects/<slug>/03-reference/theme.js projects/<slug>/04-deck/
cp projects/<slug>/03-reference/slides/*.js projects/<slug>/04-deck/slides/
[ -f projects/<slug>/03-reference/parts.js ] && cp projects/<slug>/03-reference/parts.js projects/<slug>/04-deck/
[ -d projects/<slug>/03-reference/assets ] && cp -R projects/<slug>/03-reference/assets projects/<slug>/04-deck/
```

- `theme.js` 是**锁定**的：成稿阶段不改设计令牌。如果确实缺少某个令牌，可以新增，并在报告中说明；已有的值不改。
- 样张页面原样保留。
- `deck.js`：`name: '<slug>'`，`slides` 按 design.md 的顺序列出**全部**页面 ID。
- 新建 `04-deck/feedback.md`，写入标题“# 修改记录”和一张空表：`| 日期 | 页面 | 用户意见 | 修改 |`。

## 3. 分批制作

按 design.md 的顺序，每批 4–6 页；同一个 Morph 序列的页面放在同一批。

每批：

1. 按逐页方案写页面文件。构图、文字和动态都以 design.md 为准，视觉处理以样张为标准。**不在制作时重新设计**；方案缺失或无法实现时，选择最接近设计意图的做法，并记录下来，在报告中说明。
2. 每页都要写 `notes`（演讲者备注），依据 design.md 的“备注要点”和 content.md；每页都写上节奏表里的 `rhythm`。
3. dense 页必须有图解（设计文稿里的“图解”一项）。复用 `parts.js` 里的视觉母题。
4. `node engine/make.js projects/<slug>/04-deck --only <本批ID>`
5. 按 `review.md` 自查本批页面（用 Read 打开每一页的渲染图），修复后再渲染。

## 4. 整套检查

1. `node engine/make.js projects/<slug>/04-deck`（全部渲染 + 缩略总览）。
2. 看 `renders/_contact.png`：统一性、强度曲线、有没有突然变粗糙的页面；新页面和样张页面放在一起，是否属于同一套作品。
3. **签名画面**（design.md 中标 ★ 的页）：样张里没有做过的，至少做两个版本，用 `node engine/compare.js` 并排比较，留下更好的那个；已经做过的，放回整套里再看一遍是否仍然是全场最强的画面。
4. **工艺检查**：按 `review.md` 的“工艺检查”逐页过一遍，修掉细节问题。
5. 修复，然后重新渲染受影响的页面。

## 5. 收尾

- 勾选 `project.md` 的关口 4（这个关口表示生成完成，可以由你勾选），当前阶段改为“5 修改”。
- 提交：`git -C projects/<slug> add -A && git -C projects/<slug> commit -qm "deck: full build"`。

## 6. 最后的回复（主会话会转述给用户）

1. pptx 路径、缩略总览路径、总页数。
2. 制作中偏离或补充 design.md 的地方（逐条列出）。
3. 自查中发现但没有修复的问题，附建议。
4. 需要在 PowerPoint 中检查的项目：哪些页使用了 Morph；字体是否在播放电脑上可用。
5. 给主会话的提示：把缩略总览展示给用户，请用户逐页提意见；意见用 `/revise` 处理。
