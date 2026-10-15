# Pretty Slides — Agent 入口

本仓库是一条“主题 → 内容文稿 → 设计文稿 → 视觉方向与参考样张 → 完整 PPT → 逐页修改”的演示制作流水线。产出是**原生可编辑的 .pptx**，追求的是审美好、有主题个性、没有 AI 味的演示。审美标准见 `guides/aesthetic/principles.md`。

本文件只放每次都需要的规则。其余规范**按需加载**：进入某一步时再读对应文件，不预读。

## 流水线

| 阶段 | 触发 | 在哪工作 | 产出 | 用户关口 |
|---|---|---|---|---|
| 0 立项 | `/new-deck <主题>` | 新建 `projects/<slug>/` | `project.md` | — |
| 1 内容 | 立项后直接对话 | 当前会话（与用户聊） | `01-content/content.md` | 用户认可内容 |
| 2 设计 | `/design` | **新会话**（fork） | `02-design/design.md` | 用户认可设计文稿 |
| 3a 方向 | `/reference` | **新会话**（fork） | `03-reference/directions/`：2–3 个方向的探针页并排对比 | 用户选定方向 |
| 3b 样张 | `/reference`（再次运行） | **新会话**（fork） | `03-reference/`：3–5 页正式样张 | 用户认可样张 |
| 4 成稿 | `/build-deck` | **新会话**（fork） | `04-deck/`：完整 PPT | — |
| 5 修改 | `/revise S03 …` | 当前会话 | 逐页修改，可无限轮 | 每轮用户确认 |

技能文件在 `.claude/skills/<name>/SKILL.md`。不支持技能的 Agent 可以直接读这些文件，照着执行。

“新会话”的意思是：这一步只依赖**文件**，不依赖聊天记录。因此用户在聊天里表达过的偏好，必须先写进 `project.md` 的“决策记录”或对应文稿，才算存在。

## 始终有效的规则

1. **先读状态**：进入任何项目，先读 `projects/<slug>/project.md`，确认当前阶段和已认可的关口，从实际进度继续，不重复问已经回答过的问题。
2. **关口只由用户打开**：只有用户明确认可（“可以/通过/accept”）才能在 `project.md` 里勾选关口。沉默不算认可，提出局部修改意见也不算。上游关口未通过，不进入下游阶段。
3. **文件即记忆**：用户的偏好、禁令、决定，当场写进 `project.md` →「决策记录」。用户原话的禁令（“不要用阴影”）要逐字记录。
4. **上游优先**：内容问题改 `content.md`，设计问题改 `design.md` / `theme.js`，单页问题改该页源文件。不要在下游掩盖上游的问题。改了上游，要检查受影响的下游。
5. **渲染才算数**：任何视觉判断都基于 `renders/` 里的真实渲染图，不能只看代码。改完必须重新渲染，并亲眼看图。
6. **审美标准**：设计、制作、修改的每一步都以 `guides/aesthetic/principles.md` 为准，并对照 `anti-ai.md` 自检。规范里的数字是经验参考，不是合格线；最终靠看渲染图判断，拿不准时做两个版本并排比较。
7. **如实报告**：区分“已渲染检查”“启发式检查”“未验证（如 Morph 实际播放）”。没做的检查不写成通过。
8. **不碰用户的手工修改**：如果用户在 PowerPoint 里改过 pptx，先用 `node engine/dump.js` 读出改动，回写到源文件，再重建。不要直接覆盖。
9. **框架协作按需交接**：各用独立 worktree，以带 scope 的 Conventional Commits 记录完成阶段。仅在用户提醒或准备调整项目结构、整体逻辑时查看对方改动；具体规则见 [交接规范](guides/handoff.md)。

## 按需加载表

| 正在做 | 读这些（只读这些） |
|---|---|
| 写内容文稿 | `guides/content.md` |
| 写设计文稿 | `guides/design-doc.md`、`guides/aesthetic/principles.md`、`guides/aesthetic/anti-ai.md`、`guides/aesthetic/data-and-diagrams.md`，再按需读 `typography` / `color` / `composition` |
| 做视觉方向或样张 | `guides/aesthetic/principles.md`、`guides/aesthetic/anti-ai.md`、`guides/production/engine.md`、`guides/production/review.md` |
| 写或改任何幻灯片代码 | `guides/production/engine.md`，以及 `design.md` 中相关的部分 |
| 涉及图片 | `guides/aesthetic/imagery.md` |
| 写讲解页（dense），或涉及图表、图解、公式、代码 | `guides/aesthetic/data-and-diagrams.md` |
| 涉及动画或 Morph | `guides/aesthetic/motion.md` |
| 渲染后自查 | `guides/production/review.md` |

## 工具

```bash
node engine/make.js <deckDir>                 # 构建 + 几何 QA + 渲染全部 + 缩略总览
node engine/make.js <deckDir> --only S03,S07  # 只渲染这几页（构建仍是整套）
node engine/dump.js <file.pptx> [页码]        # 读出 pptx 里各对象的名称、位置、文字
node engine/texture.js <hex> <out.jpg>         # 生成与背景色匹配的纸张颗粒
node engine/compare.js <out.png> <dirA> <dirB> [--only S03] [--labels A,B]  # 并排对比图（方向对比、修改前后）
node engine/pptdiff.js <原文件.pptx> <修复后.pptx>  # PowerPoint 提示“修复”时，找出它改了什么
```

首次使用前运行 `npm --prefix engine install`。渲染依赖 LibreOffice（`soffice`）、`pdftoppm`（poppler）和 ImageMagick（`magick`）。

## 目录

```text
AGENTS.md / CLAUDE.md     入口（CLAUDE.md 导入本文件）
guides/                   按需加载的规范
templates/                立项、设计文稿、deck 骨架模板
engine/                   制作引擎（pptxgenjs + 后处理 + QA + 渲染）
examples/attention/       引擎自测与质量基准示例（不是风格模板）
projects/<slug>/          每个演示一个目录（不进本仓库的 git）
```
