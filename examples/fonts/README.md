# 跨平台字体样本

`guides/aesthetic/typography.md`「跨平台字体」清单的样本：

- S01、S02：清单里的每一种中文字体和西文字体，各用同一行字排出来。
- S03–S07：五组搭配，用同一组文字排成同样的版式，只有字体不同。S07 用了楷体和等线，需要中文版 Windows。

`renders/` 是 Mac 版 PowerPoint 渲染的结果。

## 在 Windows 上实测

1. 在 Mac 上构建：`node engine/make.js examples/fonts`，得到 `examples/fonts/out/font-specimens.pptx`。
2. 把这个文件拷到要放映的 Windows 电脑上，用 PowerPoint 打开，进入放映。
3. 逐页和 `renders/` 里同名的图对照：
   - **S01、S02**：哪一行的字形和图里不一样，就说明这台电脑没有那个字体。英文版 Windows 上，S01 后五行（等线、黑体、楷体、仿宋）可能不一样，这是预期之内的。
   - **S03–S07**：字形对得上，再看换行和位置。同一种字体在 Windows 和 Mac 上的字宽可能略有差别，标题多折一行、数字挤到边缘都算问题。
4. 记下有差别的页面和行，最好每页拍一张照片，拿回来修正清单或版式。
