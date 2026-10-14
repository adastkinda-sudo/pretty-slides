---
name: revise
description: Pretty Slides 阶段 5：根据用户对具体页面的意见修改 PPT（也用于修改参考样张），重新渲染并展示前后对比，可以无限轮。Use when the user gives feedback on specific slides (e.g. "S03 标题太大", "第 5 页换成深色") or asks to adjust the deck or the reference slides.
argument-hint: "[S03] <修改意见>"
---

# 逐页修改

用户意见：$ARGUMENTS

## 0. 定位

- 项目：当前对话正在处理的项目；不明确时，选最近修改的项目，并告诉用户。
- 目标 deck：关口 3 未勾选时是 `03-reference/`，否则是 `04-deck/`。
- 读 `project.md`、`guides/production/engine.md`、`guides/aesthetic/anti-ai.md`，以及 design.md 中与这几页相关的部分。
- 读涉及页面的源文件，并用 Read 打开当前的渲染图。先看清楚现状，再动手。
- 用户提到“第 5 页”时，用 `out/manifest.json` 把页码换算成页面 ID。

## 1. 用户在 PowerPoint 里手动改过 pptx 吗？

如果 `out/` 中的 pptx 比 `renders/` 新，或者用户提到自己改过：先用 `node engine/dump.js <pptx> <页码>` 读出对象的位置和文字，和源代码对比，把用户的手工修改回写到源文件，再做本轮修改。**绝不能让重建覆盖用户的手工修改。**

## 2. 分类

把每条意见归到一类，按类处理：

| 类型 | 例子 | 改哪里 |
|---|---|---|
| 单页 | “S03 的图太小”“这页的标题换个说法” | 该页源文件；如果改了画面文字，同步 design.md 中这一页的方案 |
| 整套 | “强调色太艳”“标题都太大”“所有页去掉页码” | `theme.js` 和 design.md 的设计系统；记进 `project.md` 的决策记录；之后重新渲染整套 |
| 内容 | “这里的数据不对”“加一个例子” | 先改 `content.md`，再改受影响的页面和备注 |
| 结构 | “在 S05 后面加一页”“删掉 S09” | 在 design.md 中补写或删除这一页的方案；新页用新的 ID（如 `S05b`）；更新 `deck.js` |

**模糊的意见**（“不够高级”“有点乱”“没感觉”）：不要猜着改。先看渲染图，给出具体的诊断，以及 1–2 个可选的改法（引用 `anti-ai.md` 和 `review.md` 的标准），请用户选择。只有当现有方案和用户的话已经足够确定改法时，才直接改。

## 3. 修改与验证

1. 改代码。只改意见涉及的部分，不顺手改其他页面。
2. 渲染：
   - 单页修改：`node engine/make.js <deckDir> --only S03`（如果有 Morph 相邻页，一起渲染）。
   - 整套修改：`node engine/make.js <deckDir>`，并检查缩略总览。
3. 用 Read 打开新的渲染图，按 `review.md` 自查。上一版渲染在 `renders/_prev/` 中，可以用来对比。
4. 把修改后的页面（如果有必要，连同修改前的页面）展示给用户：能发送文件就发送 PNG，否则给出路径。

## 4. 记录

- 在 `<deckDir>/feedback.md` 追加一行：日期、页面、用户意见（原话摘要）、实际修改。
- 用户表达的长期偏好或禁令，追加到 `project.md` 的决策记录（禁令照录原话）。
- 提交，作为回滚点：`git -C projects/<slug> add -A && git -C projects/<slug> commit -qm "revise: S03 <摘要>"`。
- 用户想回到之前的版本：用 `git -C projects/<slug> log` 找到对应的提交，恢复相关文件后重新构建。

## 5. 修改参考样张时

在 `03-reference/` 上修改。整套的改动必须同时更新 `design.md` 和 `theme.js`。用户认可视觉语言后，勾选关口 3，并建议 `/build-deck`。
