// Speaking-time estimate from speaker notes, which are written as a script the presenter can read aloud.
//
// Units: one Han character = 1; one Latin word ≈ 1.3 (English is spoken at ~130 words/min against
// ~170 Chinese characters/min); each digit = 1. Text in full- or half-width parentheses is a stage cue
// ("（单击 1）", "（指着墙上的字）") and is neither spoken nor counted.
// Default rate 170 units/min: the optimum for Chinese speeches is put at 150–180 syllables per minute
// (Li Changshuan, JoSTrans 2010). Override per deck with `speechRate` in deck.js.

const RATE = 170;

function units(text) {
  const spoken = String(text || '').replace(/（[^（）]*）|\([^()]*\)/g, '');
  const han = (spoken.match(/\p{Script=Han}/gu) || []).length;
  const words = (spoken.match(/[A-Za-z][A-Za-z'’-]*/g) || []).length;
  const digits = (spoken.match(/\d/g) || []).length;
  return han + words * 1.3 + digits;
}

// notes: [{ id, notes }]; target: minutes from deck.js (optional).
function estimate(notes, { target, rate = RATE } = {}) {
  const per = notes.map(({ id, notes: n }) => ({ id, units: units(n) }));
  const total = per.reduce((s, p) => s + p.units, 0);
  const minutes = total / rate;
  const avg = per.length ? total / per.length : 0;
  const soft = [];
  const empty = per.filter((p) => p.units === 0).map((p) => p.id);
  if (empty.length) soft.push(`没有备注: ${empty.join(', ')}（每页都要有可以照着讲的讲稿）`);
  if (per.length && avg < 80) soft.push(`备注平均每页 ${avg.toFixed(0)} 字，像要点而不是讲稿，时长估算偏低`);
  const long = per.filter((p) => avg > 0 && p.units > avg * 2.5 && p.units / rate > 2);
  if (long.length) soft.push(`讲得特别久的页: ${long.map((p) => `${p.id} ≈${(p.units / rate).toFixed(1)}分钟`).join(', ')}（考虑拆页）`);
  if (target) {
    if (minutes > target * 1.15) soft.push(`估算 ${minutes.toFixed(0)} 分钟，超出目标 ${target} 分钟 ${((minutes / target - 1) * 100).toFixed(0)}%：删减讲稿或页面`);
    else if (minutes < target * 0.75) soft.push(`估算 ${minutes.toFixed(0)} 分钟，不到目标 ${target} 分钟的 75%：讲稿可能过简，或内容不够`);
  }
  return { minutes, total, rate, target, soft };
}

module.exports = { estimate, units };
