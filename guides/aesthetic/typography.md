# 字体与排版

> 何时读：设计文稿里确定字体和字号层级时；样张或成稿中排版出问题时。

排版是本项目最主要的设计手段。一套演示的气质，八成由字体选择、字号对比和留白决定。

## 1. 字体：放映的电脑上要有

pptx 不嵌入字体。**设计文稿里写的字体，必须在放映的电脑上存在。** 否则 PowerPoint 会悄悄替换成别的字体，审美立刻崩掉。

先按 `project.md` 里的放映环境确定交付目标，写进 `design.md` 第 3 节和 `theme.js` 的 `target`：

- **跨平台**（`target: 'cross-platform'`，默认）：会在别人的电脑或 Windows 上放映，或者还不确定。只用下面「跨平台字体」里的字体。
- **只在自己的 Mac 上放映**（`target: 'mac'`）：可以用「macOS 字体」里的字体。

`make.js` 按交付目标检查主题里的字体：跨平台的 deck 用了清单之外的字体是硬问题。装有 PowerPoint for Mac 时，预览由 PowerPoint 渲染，`make.js` 还会核对每页实际用到的字体，文字落到 theme 之外的字体上是硬问题。

**中文字体只写家族名**（`Microsoft YaHei`、`Songti SC`），字重用 `bold: true`。`Microsoft YaHei Light`、`DengXian Light` 本身就是家族名，可以直接写。`Hiragino Sans GB W6` 这类带字重后缀的名字解析不稳定，会被渲染成别的字体，`make.js` 会把它判为硬问题。西文字体的字重名（`Calibri Light`、`Helvetica Neue Light`）可以正常使用。

### 跨平台字体

所有 Windows 10/11 都自带，Mac 版 PowerPoint 也有（macOS 自带，或装在 PowerPoint 里），不需要联网或订阅 Microsoft 365。每一种都在 Mac 版 PowerPoint 16.114 上验证过常规体和粗体；Windows 一侧依据微软公布的 Windows 11 字体列表。

| 角色 | 字体（fontFace 写法） | 气质与用法 |
|---|---|---|
| 中文无衬线 | `Microsoft YaHei`（微软雅黑；粗体 `bold: true`）、`Microsoft YaHei Light`（细体） | 中性、清楚，正文的默认选择。细体用于大字号陈述，粗体用于强调 |
| 中文宋体 | `SimSun`（宋体） | 书卷气；笔画细、只有一个字重，只用于大字号标题，小字投影会发虚。它的西文字母简陋，用 `fontPairs` 配一个西文衬线（如 `Palatino Linotype`） |
| 英文无衬线 | `Calibri` / `Calibri Light`、`Corbel`、`Candara`、`Verdana`、`Trebuchet MS`、`Arial`、`Franklin Gothic Medium` | Calibri 圆润中性；Corbel 清爽、Candara 柔和（两者都是旧式数字）；Franklin Gothic Medium 适合紧凑的标签和数字 |
| 英文衬线 | `Palatino Linotype`、`Cambria`、`Georgia`、`Constantia`、`Times New Roman` | Palatino 古典优雅；Cambria 稳重，适合学术；Georgia、Constantia 是旧式数字 |
| 数字 | 等高数字：`Palatino Linotype`、`Cambria`、`Franklin Gothic Medium`、`Calibri Light`；旧式数字：`Georgia`、`Constantia` | 大号数字。旧式数字（`0` 像小写的 `o`，`3`、`4`、`5`、`7`、`9` 下沉）有编辑感，只在有意时用 |
| 等宽 | `Consolas` | 代码、prompt |
| 数学 | `Cambria Math` | 公式 |
| 符号 | `Segoe UI Symbol` | 箭头和其他特殊符号（`↑`、`→`、`✓`） |

**只有中文版 Windows 默认装有**：`DengXian` / `DengXian Light`（等线，比微软雅黑更清秀）、`SimHei`（黑体，粗硬，少用）、`KaiTi`（楷体，引文、手记）、`FangSong`（仿宋，注释、批语）。它们在英文版 Windows 上是可选功能，可能没有装。用之前在 `project.md` 确认放映电脑是中文版 Windows；`make.js` 会提示。

**跨平台时不能用**：

- macOS 字体：苹方、冬青黑体、宋体-简、Helvetica Neue、Didot、Bodoni 72、Gill Sans 等。
- Mac 上没有的 Windows 字体：`Segoe UI`、`Bahnschrift`、`Sitka`。
- Office 云字体：Century Gothic、Gill Sans MT、Garamond、华文中宋、Aptos 等。对方要订阅 Microsoft 365 并联网才能显示。

LibreOffice 看不到 PowerPoint 自带的字体（微软雅黑、Calibri 等），会用别的字体代替，所以跨平台的 deck 要用 PowerPoint 渲染预览（`make.js` 在装有 PowerPoint 时默认如此）。

### macOS 字体（只在自己的 Mac 上放映）

**不要用苹方（`PingFang SC`）。** 它装在 Mac 上，LibreOffice 也能渲染，但 PowerPoint for Mac 不用它，会换成微软正黑体（中文标点也随之变成居中的繁体样式）。`make.js` 会把它判为硬问题。中文无衬线用冬青黑体（`Hiragino Sans GB`）。

| 角色 | 字体（fontFace 写法） | 气质 |
|---|---|---|
| 中文无衬线 | `Hiragino Sans GB`（冬青黑体；粗体：`bold: true`） | 现代、干净；中文正文的默认选择 |
| 中文衬线 | `Songti SC`（粗体：`bold: true`） | 编辑感、人文、学术；大标题极佳 |
| 中文楷体 | `STKaiti` / `Kaiti SC` | 引文、手记；只在少数页面用 |
| 英文无衬线 | `Helvetica Neue Light` / `Helvetica Neue` / `Helvetica Neue Medium` | 瑞士风格，中性 |
| 英文无衬线 | `Gill Sans`、`Optima`、`Futura` | 人文、优雅、几何；Gill Sans 线条均匀，适合小字和标签 |
| 英文无衬线 | `Avenir Next` / `Avenir Next Medium` | 更柔和的几何风格（**避免** `Avenir Next Demi Bold`，渲染会出现假粗体） |
| 英文衬线 | `Baskerville`、`Charter`、`Hoefler Text`、`Didot`（展示用）、`Bodoni 72` | 古典、编辑感 |
| 数字 | `Helvetica Neue Light`、`DIN Alternate`、`Bodoni 72` | 大号数字 |
| 等宽 | `Menlo`、`SF Mono`（不一定有）、`PT Mono` | 代码 |
| 数学 | `STIX Two Math`、`STIX Two Text` | 公式 |

本机没有安装 Inter 和思源黑体（Source Han Sans）。除非用户先安装，否则不要用。

### 搭配示例（起点，不是菜单。字体同样应该服务于主题：讲古籍可以用宋体和楷体，讲工程可以用等宽字体）

跨平台：

| 方向 | 标题 | 正文 | 西文与数字 |
|---|---|---|---|
| 现代清晰 | Microsoft YaHei Light（大字号）/ Microsoft YaHei 粗体 | Microsoft YaHei | Calibri / Calibri Light |
| 人文编辑 | SimSun（大字号） | Microsoft YaHei | Palatino Linotype |
| 学术严谨 | Microsoft YaHei 粗体 | Microsoft YaHei | Cambria + Cambria Math |
| 精确技术 | Microsoft YaHei | Microsoft YaHei | Consolas + Franklin Gothic Medium（数字） |

只在自己的 Mac 上放映：

| 方向 | 标题 | 正文 | 西文与数字 |
|---|---|---|---|
| 现代编辑 | Songti SC | Hiragino Sans GB | Helvetica Neue |
| 瑞士极简 | Hiragino Sans GB（粗体） | Hiragino Sans GB | Helvetica Neue |
| 人文学术 | Songti SC | Hiragino Sans GB | Baskerville / Charter |
| 电影片头（暗场） | Songti SC，字距 +5–8% | Hiragino Sans GB | Didot（大字号西文、符号）+ Bodoni 72（数字）+ Gill Sans（小字、标签） |

一套演示通常只用 **1–2 个字体家族**，再加一两个有明确职责的点缀字体（例如引用原文用的斜体）。

**例子要像它在真实世界里的样子。** 讲 AI 时，输入给模型的句子用等宽字体加提示符和光标，像一条真正的 prompt；模型输出的内容同理。讲古籍时，原文用宋体或楷体竖排。这样的字体选择让观众有代入感，比单纯“好看”的字体更有说服力。

**高反差衬线体（Didot、Bodoni）只用于大字号**（约 20pt 以上）：它们的细线在小字号投影时会消失。同一套里的小字、标签、页码改用 Gill Sans 这类线条均匀的字体。

**Didot 不用来写数字。** Didot（常规体）的数字在 PowerPoint 里是旧式数字，而 LibreOffice 里是等高数字。高反差衬线的大号数字用 `Bodoni 72`，它在两边都是等高数字；Didot Bold 的数字也是等高的。`make.js` 遇到 Didot 常规体里的数字会给出提示。

**字体里要有这个字。** 字体缺的字符，PowerPoint 和 LibreOffice 会各自换成别的字体显示，常见的是箭头（`↑`、`→`）、上下标字符（`ᵀ`、`ₖ`）和不常用的符号。`make.js` 会逐段检查文字是否都在它的字体里，缺字报硬问题。修法：换一种写法（上下标用 `superscript` / `subscript`），或者把这个字拆成单独一段，指定一个有它的字体（例如箭头用 `Segoe UI Symbol`；只在 Mac 上放映时也可以用 `Lucida Grande`）。这个字体不能是 `fontPairs` 里的中文字体：配对会把它的西文字符（包括箭头）又换回配对的西文字体。

### 中西文混排

theme 中的 `fontPairs` 可以让中文字体里的西文字符改用另一个西文字体渲染，例如 `{ SimSun: 'Palatino Linotype' }`。微软雅黑、冬青黑体自带的西文可以直接用，配对是可选项；宋体的西文简陋，建议配对。

反过来，中文写在西文字体的文字框里（例如 Calibri 标签里的“按内容检索”），`make.js` 会把这段中文的字体设成主题的中文无衬线（`fonts.sans`），也可以用 theme 的 `cjkFallback` 另外指定。

配对的键同样只写中文字体的家族名。

## 2. 字号层级

在 16:9（13.333 × 7.5 英寸）画布上，投影观看的经验值（参考，不是规定）：

| 角色 | 字号（pt） | 行距倍数 | 说明 |
|---|---|---|---|
| display | 54–80 | 1.05–1.15 | 封面、章节页、论断页的主句 |
| statement | 36–48 | 1.25–1.35 | 一整句的论断 |
| title | 24–32 | 1.25–1.35 | 普通页的标题或论断标题 |
| lead | 18–22 | 1.45–1.6 | 引导段、副标题 |
| body | 14–18 | 1.5–1.65 | 正文、标注 |
| label | 10–12 | 1.3 | 小型大写标签，可加 8–15% 字距 |
| caption | 10–12 | 1.4–1.5 | 来源、说明 |
| number | 96–200 | 1.0 | 大号数字，通常用细字重加负字距 |

- **对比要大**：主角与正文之比常在 3–6 倍，签名画面可以更大。28pt 的标题配 18pt 的正文，是最平庸的组合。
- **层级要少而分明**：一页上通常三四个字号就够了，多了层级会乱（QA 在超过 5 个时提示）。整套的字号来自 theme 的 `type`；临时字号如果反复出现，就把它加进 theme。
- 投影时**最小 11pt**。看得到却读不清的字，不如删掉。
- `leading` 是“字体自身行高”的倍数（PowerPoint 的“多倍行距”）。字体自身行高约为 1.2em，所以 leading 1.0 已经不算紧。

## 3. 中文排版规则

- 中文**不加正字距**；大标题可以用 0 到 -1% 的字距。西文小标签可以加 8–15% 字距，中文标签最多加 5%。
- 中文**不用斜体**。强调靠颜色、字重或位置。
- 中文与西文、数字之间**加一个空格**（“理解 Transformer 的”）。注意：LibreOffice 渲染时会自动再加一点间距，PowerPoint 不会，以 PowerPoint 为准。
- 标题里**慎用弯引号** “ ”：在中文字体里它们按全角渲染，左右会出现空隙。强调一个词，可以改用强调色或西文字体，而不是加引号。
- **避免孤字**：段落最后一行只剩一两个字时，调整文本框宽度或措辞。
- 标点不要出现在行首。全角标点后面不要再加空格。
- 标题写成**完整的判断句**（“序列长度翻倍，代价变为四倍”），而不是名词短语（“计算复杂度分析”）。

## 4. 对齐

- 文本框的 `margin` 默认是 0，所以文字的左边缘就是框的 x。这样文字才能和细线、图片精确对齐。
- 同一页里的文字左对齐到少数几条网格线上（`k.col(n)`），不要出现 5 条不同的左边缘。
- 多行文字靠上对齐（`valign: 'top'`），这样字号变化时位置是可预期的。
