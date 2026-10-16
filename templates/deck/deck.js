module.exports = {
  name: '{{NAME}}',          // output file: out/{{NAME}}.pptx
  title: '{{TITLE}}',
  theme: './theme.js',
  slides: [],                // page IDs in play order, e.g. ['S01', 'S02']
  // minutes: 20,             // target talk length from project.md; make.js compares it with the notes-based estimate
  // speechRate: 170,         // characters per minute used for that estimate (default 170)
};
