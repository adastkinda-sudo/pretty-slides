// Fonts a cross-platform deck can name: they render the same in PowerPoint on any Windows 10/11 PC and in
// PowerPoint for Mac, offline and without a Microsoft 365 subscription.
//
// Windows: Microsoft's Windows 11 font list (learn.microsoft.com/typography/fonts/windows_11_font_list).
// Mac: macOS itself (Arial, Georgia, ...) or the fonts bundled inside PowerPoint for Mac (DFONTS below). Each font
// here was checked in PowerPoint for Mac 16.114: PowerPoint used that font, regular and bold.
// Office cloud fonts (Century Gothic, Gill Sans MT, STZhongsong, ...) need a subscription and a connection, so they
// are not listed; neither are macOS-only fonts (PingFang, Songti SC, Helvetica Neue, Didot) or Segoe UI (no Mac).

const fs = require('fs');
const path = require('path');

// In every Windows 10/11 install.
const CORE = [
  'Microsoft YaHei', 'Microsoft YaHei Light', 'SimSun',
  'Arial', 'Arial Black', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Trebuchet MS', 'Tahoma',
  'Calibri', 'Calibri Light', 'Cambria', 'Cambria Math', 'Candara', 'Corbel', 'Constantia', 'Consolas',
  'Palatino Linotype', 'Franklin Gothic Medium', 'Segoe UI Symbol',
];
// Windows' Chinese (Simplified) Supplemental Fonts: installed on a Chinese Windows, an optional feature elsewhere.
const CHINESE_WINDOWS = ['DengXian', 'DengXian Light', 'SimHei', 'KaiTi', 'FangSong'];
// Faces that cover Chinese.
const CHINESE = ['Microsoft YaHei', 'Microsoft YaHei Light', 'SimSun', ...CHINESE_WINDOWS];

// Fonts inside PowerPoint for Mac. fontconfig and LibreOffice do not see them; PowerPoint does.
const DFONTS = '/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts';
const BUNDLED = {
  'Microsoft YaHei': ['msyh.ttc', 'msyhbd.ttc'],
  'Microsoft YaHei Light': ['msyhl.ttc'],
  SimSun: ['Simsun.ttc'],
  DengXian: ['Deng.ttf', 'Dengb.ttf'],
  'DengXian Light': ['Dengl.ttf'],
  SimHei: ['SimHei.ttf'],
  KaiTi: ['Kaiti.ttf'],
  FangSong: ['Fangsong.ttf'],
  Calibri: ['Calibri.ttf', 'Calibrib.ttf', 'Calibrii.ttf', 'Calibriz.ttf'],
  'Calibri Light': ['calibril.ttf', 'calibrili.ttf'],
  Cambria: ['Cambria.ttc', 'Cambriab.ttf', 'Cambriai.ttf', 'Cambriaz.ttf'],
  'Cambria Math': ['Cambria.ttc'],
  Candara: ['Candara.ttf', 'Candarab.ttf', 'Candarai.ttf', 'Candaraz.ttf'],
  Corbel: ['Corbel.ttf', 'Corbelb.ttf', 'Corbeli.ttf', 'Corbelz.ttf'],
  Constantia: ['Constan.ttf', 'Constanb.ttf', 'Constani.ttf', 'Constanz.ttf'],
  Consolas: ['Consola.ttf', 'Consolab.ttf', 'Consolai.ttf', 'Consolaz.ttf'],
  'Palatino Linotype': ['pala.ttf', 'palab.ttf', 'palai.ttf', 'palabi.ttf'],
  'Franklin Gothic Medium': ['Franklin Gothic Medium.ttf', 'Franklin Gothic Medium Italic.ttf'],
  'Segoe UI Symbol': ['seguisym.ttf'],
};

// family -> existing font files bundled with PowerPoint ([] when not bundled or PowerPoint is not installed).
function bundledFiles(family, dir = DFONTS) {
  return (BUNDLED[family] || []).map((f) => path.join(dir, f)).filter((f) => fs.existsSync(f));
}

// 'cross-platform' (default) or 'mac'.
const target = (theme) => (theme.target === 'mac' ? 'mac' : 'cross-platform');

module.exports = { CORE, CHINESE_WINDOWS, CHINESE, BUNDLED, DFONTS, bundledFiles, target };
