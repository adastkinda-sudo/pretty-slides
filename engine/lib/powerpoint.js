// PowerPoint for Mac, scripted: export a .pptx to PDF.
//
// PowerPoint opens a copy (a deck the user has open is never closed or touched), exports it and closes it. It can
// only read folders the user has allowed; a first run in a new folder, a repair prompt or a first-launch dialog
// blocks the script until someone answers it, which ends in the timeout below.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const APP = '/Applications/Microsoft PowerPoint.app';
const TIMEOUT = 300; // seconds for open + export

const available = () => process.platform === 'darwin' && fs.existsSync(APP);

// Opens the file, finds it by full path among open presentations (the user may have others open), exports, closes.
const SCRIPT = `on run argv
  set src to item 1 of argv
  set dest to item 2 of argv
  with timeout of (item 3 of argv as integer) seconds
    tell application "Microsoft PowerPoint"
      open POSIX file src
      set p to missing value
      repeat 100 times
        repeat with i from 1 to count of presentations
          if full name of presentation i is src then set p to presentation i
        end repeat
        if p is not missing value then exit repeat
        delay 0.3
      end repeat
      if p is missing value then error "presentation did not open"
      save p in (POSIX file dest) as save as PDF
      close p saving no
    end tell
  end timeout
end run`;

// pptx -> pdf (absolute paths). The copy is written next to the PDF and removed afterwards.
function exportPdf(pptx, pdf) {
  const copy = path.join(path.dirname(pdf), `_${path.basename(pdf, '.pdf')}.pptx`);
  fs.copyFileSync(pptx, copy);
  fs.rmSync(pdf, { force: true });
  let r;
  try {
    r = spawnSync('osascript', ['-e', SCRIPT, copy, pdf, String(TIMEOUT)], { encoding: 'utf8', timeout: (TIMEOUT + 30) * 1000 });
  } finally {
    fs.rmSync(copy, { force: true });
  }
  if (r.status === 0 && fs.existsSync(pdf)) return;
  const why = r.error?.code === 'ETIMEDOUT' || /timed out|-1712/.test(r.stderr || '')
    ? 'PowerPoint 没有在限定时间内完成。它可能弹出了对话框：修复提示（见 engine.md“PowerPoint 提示‘修复’时”）、文件访问授权（deck 不在已授权的目录里），或首次启动的提示。处理完再运行。'
    : (r.stderr || '').trim() || 'PowerPoint 没有生成 PDF';
  throw new Error(why);
}

module.exports = { available, exportPdf, APP };
