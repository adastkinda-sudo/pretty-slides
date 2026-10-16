---
name: new-deck
description: Pretty Slides 阶段 0–1：为一个演示主题新建项目（projects/<slug>/），然后和用户对话，把主题扩展成完整的内容文稿。Use when the user wants to start a new presentation / PPT / slide deck from a topic, or says 新建 / 开始一个 PPT 项目.
argument-hint: "<主题>"
---

# 新建演示项目

主题：$ARGUMENTS

## 1. 建立项目

1. 如果 `engine/node_modules` 不存在，运行 `npm --prefix engine install`。
2. 取一个简短的英文 slug（小写、连字符，≤ 4 个词，例如 `attention-mechanism`）。如果 `projects/<slug>/` 已经存在，说明情况，问用户是继续那个项目还是另起一个。
3. 复制模板并填写占位符（`{{TITLE}}`、`{{SLUG}}`、`{{DATE}}`、`{{TOPIC}}`）：

```bash
mkdir -p projects/<slug>
cp -R templates/project/. projects/<slug>/
mkdir -p projects/<slug>/01-content/sources
```

4. 在项目内建立独立的 git 仓库，作为修改历史和回滚点：

```bash
git -C projects/<slug> init -q
printf 'out/\nrenders/\n.DS_Store\n' > projects/<slug>/.gitignore
git -C projects/<slug> add -A && git -C projects/<slug> commit -qm "init: <slug>"
```

## 2. 写内容文稿

读 `guides/content.md`，按其中的流程和用户对话：

1. 用**一条消息**集中问清简报里缺的信息（受众、时长、场合、在哪台电脑上放映、目标、已有材料、偏好或禁忌）。用户已经说过的不再问。
2. 把答案写进 `project.md` 的简报和决策记录。
3. 先给出叙事主线（5–10 行），请用户确认方向。
4. 展开成完整的 `01-content/content.md`，并在需要时调研、核实。
5. 用户认可后：勾选 `project.md` 的关口 1（写上日期），更新“当前阶段”和“下一步”，然后提交：`git -C projects/<slug> commit -am "content: approved"`。
6. 告诉用户下一步是 `/design`：它会在独立的新会话里，只根据文件生成设计文稿。

在内容阶段，不讨论版式、颜色和字体。用户主动提出的视觉偏好，记进决策记录，留给设计阶段。
