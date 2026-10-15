// S21 — 引文（极静）：日落，房间空了。低而长的橙色余光横着落在墙上的那句话上，一道窗棂影（S01 清晨的那扇窗）。
// 地板上，生命线的末端：一段尺寸线量出 2005 到 2011——说这句话时，他还剩 6 年。视觉中心：光里的那句话。
// Morph 自 S20：iPhone 与三条汇合线淡出，太阳移到左边、变低变橙；地板上的联系线保留（新连上的四条变回细线）。
const { sun, lifeline, linksBefore, marks, yearX, px } = require('../parts');

module.exports = {
  id: 'S21',
  title: '死亡',
  rhythm: 'breathing',
  transition: 'morph',
  notes: `（翻过来，iPhone 不见了，太阳落到了窗口的最低处。停一下。）
2003 年 10 月，他被诊断出胰腺神经内分泌肿瘤。他拒绝立即手术，先试了九个月的饮食疗法等替代治疗，2004 年 7 月才做手术。后来他对传记作者 Walter Isaacson 承认，他后悔过这个决定。
2005 年 6 月，在斯坦福的毕业典礼上，他只讲了三个故事：第一个是连接点，第二个是爱与失去，第三个是死亡。关于死亡，他说了墙上这句话：记住自己终将死去，是我所知道的最好的方法，避免陷入“我有东西会失去”的陷阱。
（单击 1）你已经一无所有了，没有理由不跟随自己的心。
（单击 2）看地板上的线：从说这句话的 2005 年，到线的尽头 2011 年——他还剩 6 年。2009 年，他接受了肝移植。
（这一页不加任何评论，读完停两秒再翻页。）
来源：[1] 斯坦福大学毕业典礼演讲，2005-06-12；[8] Isaacson《史蒂夫·乔布斯传》（确诊、延误约九个月、2004-07 手术、2009 肝移植）。`,
  build(k) {
    sun(k);
    marks(k, { part: '五　回头看', date: '2003–2005', big: true });
    const life = lifeline(k, { current: '2011', links: linksBefore('S21') });

    // the sentence, in the low light; the line after it, and where it was said
    const x = k.col(2);
    k.light({ cx: 5.0, cy: 2.8, r: 3.4, strength: 0.25, color: 'F8E4CC' });
    const q = k.text('记住自己终将死去，\n是我所知道的最好的方法，\n避免陷入“我有东西会失去”的陷阱。', { style: 'voice', size: 30, leading: 1.45, x, y: 1.88, w: 7.8 });
    const l = k.text('你已经一无所有了，没有理由不跟随自己的心。', { style: 'lead', x, y: q.y + q.estH + 0.38, w: 6.4, nowrap: true, build: 1 });
    k.text('斯坦福大学毕业典礼，2005', { style: 'caption', x, y: l.y + l.estH + 0.1, w: 3, nowrap: true, build: 1 });

    // the end of the lifeline, measured: from the speech (June 2005) to the end (October 2011)
    const x1 = yearX(2005.45), x2 = px('2011'), y = life.y, yd = y - 0.36, t = 0.06;
    const ln = (a, b, c, d) => k.line({ x1: a, y1: b, x2: c, y2: d, color: 'stone', weight: 0.5, build: 2 });
    ln(x1, yd, x2, yd);
    ln(x1, yd - t, x1, y);            // extension down to the seam at 2005 (it doubles as the tick)
    ln(x2, yd - t, x2, y - 0.07);     // … and to the last point
    k.text('6 年', { style: 'year', color: 'ink', x: (x1 + x2) / 2 - 0.5, y: yd - 0.25, w: 1, align: 'center', nowrap: true, build: 2 });
    k.text('2005', { style: 'year', x: x1 - 0.06, y: y + 0.11, w: 0.6, nowrap: true, chrome: true, build: 2 });
    return q;
  },
};
