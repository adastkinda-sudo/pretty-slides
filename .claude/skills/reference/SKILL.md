---
name: reference
description: Pretty Slides 阶段 3：在独立的新会话中做视觉样张。还没选定方向时，把设计文稿里的 2–3 个候选方向各做成 2 页探针页并排对比，供用户选择；方向选定后，把它深化成 3–5 页正式样张（03-reference/）。Use when the user asks for reference / sample slides (参考样张、示例 PPT、视觉方向) after the design doc is approved.
argument-hint: "[project-slug]"
context: fork
---

# 视觉方向与参考样张

你在一个**全新的会话**里工作，看不到之前的聊天。一切以文件为准。

这一阶段分两步。先判断现在处于哪一步：

- `project.md` 的关口 **3a 未勾选**（还没选定方向）→ 做 **A. 方向探针**。
- 关口 3a 已勾选、**3b 未勾选** → 做 **B. 样张深化**。

## 0. 定位项目

- 项目 slug：`$ARGUMENTS`。如果为空：选关口 2 已勾选、关口 3b 未勾选、且最近修改的项目。
- 读 `project.md`。**如果关口 2 没有勾选**，停止并报告。

## 1. 读取

1. `project.md`（决策记录）和 `02-design/design.md`（全文）。
2. `guides/aesthetic/principles.md`、`guides/aesthetic/anti-ai.md`、`guides/production/engine.md`、`guides/production/review.md`。
3. 按页面内容读 `composition.md` / `data-and-diagrams.md` / `imagery.md` / `motion.md`。
4. 参考实现：`examples/attention/`（只参考代码写法，**不要模仿它的视觉风格**）。

## A. 方向探针

目的：让用户**在比较中选择**方向，而不是只能对一个方向提意见。

1. 为 design.md 里的每个候选方向建一个 deck：

```bash
mkdir -p projects/<slug>/03-reference/directions/A/slides   # B、C 同理
cp templates/deck/deck.js templates/deck/theme.js templates/deck/parts.js projects/<slug>/03-reference/directions/A/
```

2. 每个方向写自己的 `theme.js`（色彩、字体、字号层级），`deck.js` 的 `name` 为 `<slug>-direction-A`，`slides` 只包含 design.md 第 9 节指定的 2 页探针页。
3. 所有方向使用**同样的 2 页、同样的内容**，只有视觉语言不同。每个方向都要按它自己的逻辑做到最好，不要把非推荐方向做成陪衬。
4. 分别构建并自查：`node engine/make.js projects/<slug>/03-reference/directions/A`。每个方向自修 1–2 轮。
5. 生成并排对比图，一列一个方向：

```bash
node engine/compare.js projects/<slug>/03-reference/directions/_compare.png \
  projects/<slug>/03-reference/directions/A projects/<slug>/03-reference/directions/B projects/<slug>/03-reference/directions/C \
  --labels "A 名字,B 名字,C 名字"
```

6. 更新 `project.md`：当前阶段改为“3 视觉方向（待用户选择）”。提交：`git -C projects/<slug> add -A && git -C projects/<slug> commit -qm "reference: directions"`。

**最后的回复（主会话会转述给用户）**：对比图路径；每个方向一两句话（气质、从内容的哪里来、适合的场合、风险）；你的推荐和理由。给主会话的提示：把对比图展示给用户，请用户选择一个方向，也可以混合（例如“A 的配色加 B 的字体”）。用户选定后：把选择和用户原话写进 design.md 的“已选方向”和 `project.md` 的决策记录，按选定方向更新 design.md 的设计系统，勾选关口 3a，然后再次运行 `/reference` 做样张深化。

## B. 样张深化

样张不是草图，而是完整 PPT 的**第一批正式页面**：它们会被原样复制进成稿。按最终质量来做。

1. 搭建 `03-reference/`：以选定方向的 `directions/<X>/` 为起点，复制它的 `theme.js`、`parts.js` 和 `assets/`；`deck.js` 的 `name` 为 `<slug>-reference`，`slides` 为 design.md 第 9 节的深化页，按 design.md 的顺序排列。探针页可以直接沿用并继续打磨。
2. 每张样张一个文件：`slides/<ID>-<短名>.js`，**使用 design.md 中的页面 ID**，写上节奏表里的 `rhythm`。
3. 整套反复出现的图形（母题）写进 `parts.js`，供成稿复用。按 design.md 的“结构层”启用导航框架等部件；需要底色质感时，用 `node engine/texture.js <paper 色值> projects/<slug>/03-reference/assets/<名字>.jpg` 生成（深底加 `--strength 0.15 --mottle 0 --vignette 0.5`，见 `color.md`）；暗场方向用 `k.light` 把光放在每页的视觉中心上。
4. 素材放到 `03-reference/assets/`。需要下载图片时记录来源；来源或许可不清楚时，先用排版或原生图形实现，并在报告中说明。
5. 构建并自查：`node engine/make.js projects/<slug>/03-reference`。按 `review.md` 先看缩略总览，再逐页看大图。普通页自修最多 2 轮；**签名画面**做不止一个版本，用 `engine/compare.js` 并排比较，留下更好的那个。
6. 最后对照 `anti-ai.md` 的自检问题和 `review.md` 的工艺检查，再看一遍每一页。`make.js` 输出的“画面文字核对”逐条处理（补上，或同步回 design.md）。
7. **独立审稿**：按 `review.md` 的“独立审稿”，调用 `deck-reviewer` 子代理审 `03-reference/` 的全部样张。处理意见，重新渲染受影响的页面。
8. 制作中做出的、design.md 里没有写明的设计决定，写进 design.md 的“样张回写”，必要时同步更新设计系统。
9. 更新 `project.md`：当前阶段改为“3 样张（待用户审阅）”。提交：`git -C projects/<slug> add -A && git -C projects/<slug> commit -qm "reference: deepened"`。

**最后的回复（主会话会转述给用户）**：pptx 路径和缩略总览路径；每页一句话说明它验证了什么；制作中做出的设计决定和仍需用户判断的问题；独立审稿的结论（没有采纳的意见及理由）；未验证的项目（例如 Morph 只能在 PowerPoint 中放映检查）。给主会话的提示：把缩略总览和样张大图展示给用户；用户的意见用 `/revise` 的方式在 `03-reference/` 上修改，影响整套的意见要同时更新 design.md 和 theme.js；用户认可后勾选关口 3b，然后建议 `/build-deck`。
