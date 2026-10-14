---
name: design
description: Pretty Slides 阶段 2：在独立的新会话中，只读取项目文件（内容文稿、决策记录），生成设计文稿 02-design/design.md。Use when the user asks to generate the design doc / 设计文稿 for a Pretty Slides project after the content is approved.
argument-hint: "[project-slug]"
context: fork
---

# 生成设计文稿

你在一个**全新的会话**里工作，看不到之前的聊天。一切以文件为准。

## 0. 定位项目

- 项目 slug：`$ARGUMENTS`。如果为空：在 `projects/` 中找到关口 1 已勾选、关口 2 未勾选的项目；如果有多个，选最近修改的那个，并在最后的报告里说明选择了哪个。
- 读 `projects/<slug>/project.md`。**如果关口 1 没有勾选**，不要继续，直接报告“内容文稿尚未被认可”。
- 如果 `02-design/design.md` 已经存在：除非 `project.md` 的“下一步”写明要重新生成，否则不要覆盖，改为报告现状。

## 1. 读取（只读这些）

1. `projects/<slug>/project.md`：简报、决策记录（偏好和禁令必须遵守）。
2. `projects/<slug>/01-content/content.md`：全文。
3. `guides/design-doc.md`：怎么写。
4. `guides/aesthetic/principles.md`、`guides/aesthetic/anti-ai.md`。
5. 确定设计系统时：`guides/aesthetic/typography.md`、`color.md`、`composition.md`。
6. 写逐页方案时：`guides/aesthetic/data-and-diagrams.md`（讲解页的图解配方，必读）。
7. 内容涉及图片、动态时，再读 `imagery.md`、`motion.md`。

## 2. 写作

1. 复制 `templates/design.md` 到 `projects/<slug>/02-design/design.md`，然后按 `guides/design-doc.md` 填写。
2. 顺序：先从内容里找视觉语言的来源；再提出 2–3 个**真正不同**的候选方向并推荐一个；为推荐方向写完整的设计系统；指定签名画面；写节奏表；最后写逐页方案。
3. 逐页方案要具体到可以直接制作：画面文字逐字写出，主角、构图、图解和动态都写清楚。逐页方案尽量与方向无关。
4. 选好样张页面：2 页方向探针（每个候选方向都做这 2 页），以及选定方向后的 3–5 页深化页。
5. 无法确定的事项写进“待确认问题”，附上建议的默认值。不要因此停下。

## 3. 自检

- 每个候选方向都写明了从内容的哪个特征推导而来；几个方向在气质上真正拉开了距离。
- 对照 `anti-ai.md` 的三种失败方式检查方案，尤其是“安全的千篇一律”。
- 节奏表：强度起伏跟着叙事走，高潮落在转折处；签名画面已指定。
- 每个 dense 页都写了“图解”一项，图里画的是具体的例子；没有把讲解内容做成只有几个名词的 breathing 页（见 `anti-ai.md`「伪极简」）。
- 所有字体都在 `typography.md` 的已验证列表中（或已注明需要用户安装）。
- `content.md` 中“必须上屏”的内容都有着落。

## 4. 收尾

- 更新 `project.md`：当前阶段改为“2 设计（待用户审阅）”；在“下一步”写“用户审阅 design.md”。
- 提交：`git -C projects/<slug> add -A && git -C projects/<slug> commit -qm "design: draft"`。

## 5. 最后的回复（主会话会转述给用户）

用中文写，简洁：

1. 文件路径。
2. 视觉语言的来源（一两句话）。
3. 候选方向：每个一两句话，以及你的推荐和理由。
4. 签名画面和节奏概览：页数，强度曲线的高潮在哪里。
5. 样张页面（方向探针页、深化页）及理由。
6. 待确认问题（如果有）。
7. 给主会话的提示：请用户审阅 `design.md`；用户提出修改时，按 `guides/design-doc.md` 的“修改设计文稿”处理；用户认可后勾选关口 2，然后建议 `/reference`（它会先把候选方向做成探针页并排对比）。
