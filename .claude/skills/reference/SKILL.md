---
name: reference
description: Pretty Slides 阶段 3：在独立的新会话中，按已认可的设计文稿制作 3–5 页真实的参考样张（03-reference/），让用户确认视觉语言。Use when the user asks for reference / sample slides (参考样张、示例 PPT) after the design doc is approved.
argument-hint: "[project-slug]"
context: fork
---

# 制作参考样张

你在一个**全新的会话**里工作，看不到之前的聊天。一切以文件为准。

样张不是草图，而是之后完整 PPT 的**第一批正式页面**：它们会被原样复制进成稿。所以要按最终质量来做。

## 0. 定位项目

- 项目 slug：`$ARGUMENTS`。如果为空：选关口 2 已勾选、关口 3 未勾选、且最近修改的项目。
- 读 `project.md`。**如果关口 2 没有勾选**，停止并报告。
- 如果 `03-reference/` 已经存在：在它的基础上修改，不要整体重做。

## 1. 读取

1. `project.md`（决策记录）和 `02-design/design.md`（全文）。
2. `guides/production/engine.md`、`guides/aesthetic/anti-ai.md`、`guides/production/review.md`。
3. 按样张的内容，读 `imagery.md` / `data-and-diagrams.md` / `motion.md`。
4. 参考实现：`examples/attention/`（只参考代码写法，**不要模仿它的视觉风格**）。

## 2. 搭建

```bash
mkdir -p projects/<slug>/03-reference/slides
cp templates/deck/deck.js templates/deck/theme.js templates/deck/parts.js projects/<slug>/03-reference/
```

1. `theme.js`：把 design.md 的设计系统完整翻译成令牌（颜色、字体、字号层级、网格、默认转场）。删掉模板里不需要的令牌。
2. `deck.js`：`name: '<slug>-reference'`，`slides` 只包含选定的样张 ID，按 design.md 中的顺序排列。
3. 每张样张一个文件：`slides/<ID>-<短名>.js`。**使用 design.md 中的页面 ID**，这样它们之后可以原样进入成稿。每页写上 design.md 节奏表里的 `rhythm`。
4. 整套反复出现的图形（视觉母题，例如向量条、节点）写进 `parts.js`，供成稿复用。按 design.md 的“结构层”启用导航框架等部件；需要纸张颗粒时，用 `node engine/texture.js <paper 色值> projects/<slug>/03-reference/assets/grain-paper.jpg` 生成。
5. 素材放到 `03-reference/assets/`。需要下载图片时，记录来源；如果来源或许可不清楚，先用排版或原生图形实现，并在报告中说明。

## 3. 制作与自查

1. `node engine/make.js projects/<slug>/03-reference`
2. 按 `guides/production/review.md` 检查：看 QA 输出，看 `renders/_contact.png`，再逐页用 Read 打开 `renders/Sxx.png` 看大图。
3. 修改，再渲染。最多自修 2 轮。
4. 最后对照 `anti-ai.md` 的自检问题，再看一遍每一页。

## 4. 回写与收尾

- 制作中做出的、design.md 里没有写明的设计决定（具体数值、微调），写进 design.md 的“样张回写”一节，必要时同步更新设计系统。
- 更新 `project.md`：当前阶段改为“3 样张（待用户审阅）”。
- 提交：`git -C projects/<slug> add -A && git -C projects/<slug> commit -qm "reference: draft"`。

## 5. 最后的回复（主会话会转述给用户）

1. pptx 路径和缩略总览路径（`renders/_contact.png`）。
2. 每页一句话：它验证了什么（气质、典型页、难页、节奏、Morph）。
3. 制作中做出的设计决定，以及仍然需要用户判断的问题。
4. 未验证的项目（例如 Morph 只能在 PowerPoint 中放映检查）。
5. 给主会话的提示：把缩略总览和样张大图展示给用户；用户的意见用 `/revise` 的方式在 `03-reference/` 上修改，影响整套的意见要同时更新 design.md 和 theme.js；用户认可视觉语言后勾选关口 3，然后建议 `/build-deck`。
