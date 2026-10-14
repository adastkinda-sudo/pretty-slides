# 图像

> 何时读：任何一页要用图片时。

## 原则

- 图片承担表达或叙事，而不是填补空白。和内容无关的图，不加。
- 图片属于画面，而不是贴在画面上：满版、出血、有意的裁切、与背景同色调。
- 真实优先：真实照片、官方资料、用户提供的素材 > 检索到的图 > 生成图。**生成图不能冒充证据**（实验结果、真实场景、真实人物）。
- 技术图、结构图、流程图用原生形状绘制（见 `data-and-diagrams.md`），不要用一张图片代替。

## 来源

1. 用户提供的素材：放在 `projects/<slug>/01-content/sources/`，只读。加工后的版本存到 deck 的 `assets/`。
2. 检索：只使用许可明确、可在演讲中使用的图片（Unsplash、Wikimedia Commons、机构官方图库等）。下载前告诉用户来源和文件，并在 `design.md` 的素材表里记录来源、作者和许可。
3. 没有合适的图：宁可不用图，改用排版或原生图解。不要用一张平庸的图去凑数。

## 处理（ImageMagick）

```bash
# 统一色调：降低饱和度并略微偏暖，让图片融入纸色背景
magick in.jpg -modulate 100,70 -fill '#F4F2ED' -colorize 6% out.jpg
# 灰度 + 双色调（ink → paper）
magick in.jpg -colorspace gray +level-colors '#1B1B1A','#F4F2ED' out.jpg
# 主体裁切到指定比例（例：竖幅 4:5）
magick in.jpg -gravity center -crop 4:5 +repage out.jpg
# 一侧渐隐到背景色（左侧不透明 → 右侧透明），PNG 输出
magick in.jpg \( +clone -sparse-color Barycentric '0,0 white %[fx:w-1],0 black' \) -alpha off -compose copy_opacity -composite out.png
```

处理过的文件存为新文件（`assets/A03-harbor-duotone.jpg`），原图保留。

## 版式模式

| 模式 | 做法 |
|---|---|
| 单一主图 | 一张图占据画面的主要区域，或者满版出血；文字放在安静区域 |
| 图像作画布 | 满版图片上叠原生文字和标注；文字下方需要时加一块纯色（不透明度 80–90%），不加渐变 |
| 多图 | 尽量避免。确实需要时，统一裁切比例和色调，排在网格上，主次分明（一大几小） |
| 跨页连续 | 同一张图在相邻页面上改变裁切或缩放（Morph），制造镜头推近的效果；给它起同一个 `name` |

## 引擎用法

```js
k.image('assets/A03-harbor.jpg', { x: k.col(7), y: 0, w: k.W - k.col(7), h: k.H, fit: 'cover', focus: { x: 0.4, y: 0.5 }, bleed: true, name: 'harbor' });
```

- `fit: 'cover'` 填满框，多余部分裁掉（裁切是原生的，在 PowerPoint 里可以重新调整）；`fit: 'contain'` 完整放入。
- `focus` 决定裁切时保留哪一部分（0–1）。
- 只支持 PNG 和 JPEG。使用前确认图片分辨率：满版至少 2400px 宽。
