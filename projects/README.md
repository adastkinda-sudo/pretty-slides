# projects/

每个演示一个目录，由 `/new-deck <主题>` 创建。目录结构：

```text
projects/<slug>/
├── project.md            # 状态卡：阶段、关口、简报、决策记录
├── 01-content/
│   ├── content.md        # 内容文稿
│   └── sources/          # 用户提供的原始资料（只读）
├── 02-design/design.md   # 设计文稿
├── 03-reference/         # 参考样张（deck 目录）
└── 04-deck/              # 完整 PPT（deck 目录）+ feedback.md
```

本目录下的项目不进入 Pretty Slides 仓库的 git。每个项目内有自己的 git 仓库，用来记录修改历史和回滚。
