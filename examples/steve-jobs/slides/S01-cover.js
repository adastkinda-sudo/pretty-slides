// S01 — 论断（封面）：一间几乎空着的房间，清晨的太阳从左边的窗照进来，落在墙上他的名字上；
// 地板上一条缝，从 1955 到 2011，两端各一个点，中间什么都没有。视觉中心：阳光里的名字。
const { sun, lifelineCover } = require('../parts');

// The name at 88 pt (display is 72; the cover may go to 88): compared 72 / 88 / 104 side by side — 88 holds the room
// without crowding the window's light; the morning patch was widened so the name sits wholly in its left pane.
const SIZE = 88;

module.exports = {
  id: 'S01',
  title: '封面',
  rhythm: 'anchor',
  transition: 'none',
  notes: `（打开即全部在场，停两秒再开口。）
Steven Paul Jobs，1955 年 2 月 24 日生于旧金山，2011 年 10 月 5 日在加州帕罗奥图去世，56 岁。
今天不列他的成就清单。我们只看他一生里的几个点，和他亲手做出来的几样东西。
你们看到的这间房间，来自 1982 年的一张照片：他坐在 Los Gatos 家里客厅的地板上，屋里几乎是空的——他找不到足够好的家具，宁可什么都不放。今天的每一页都是这间房间，每次只放一样东西。
窗外的太阳也会跟着走：从这一页的清晨，走到最后一页的黄昏。他的一生，我们就当成一天来看。
地板上这条缝，左端是 1955，右端是 2011。中间现在什么都没有——点，要一个一个放上去。
来源：[2] Isaacson《史蒂夫·乔布斯传》；[17] Diana Walker 摄，1982。`,
  build(k) {
    k.light({ cx: 4.1, cy: 3.2, r: 3.6, strength: 0.5 });
    sun(k);
    lifelineCover(k);
    k.text('Steve Jobs', { style: 'display', size: SIZE, x: k.col(2), y: 3.62 - SIZE / 72 * 0.9, w: 8, nowrap: true, name: 'name' });
  },
};
