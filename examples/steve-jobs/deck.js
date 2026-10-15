// The full deck (stage 4): all 23 pages in design.md order.
// Pages whose file does not exist yet are left out (with a warning), so the deck builds while pages are still being made.
const fs = require('fs');
const path = require('path');

const ORDER = Array.from({ length: 23 }, (_, i) => `S${String(i + 1).padStart(2, '0')}`);
const files = fs.readdirSync(path.join(__dirname, 'slides'));
const slides = ORDER.filter((id) => files.some((f) => f.startsWith(`${id}-`) && f.endsWith('.js')));
const missing = ORDER.filter((id) => !slides.includes(id));
if (missing.length) console.warn(`· deck: not yet written, left out: ${missing.join(', ')}`);

module.exports = {
  name: 'steve-jobs-life',
  title: 'Steve Jobs 的一生',
  theme: './theme.js',
  slides,
};
