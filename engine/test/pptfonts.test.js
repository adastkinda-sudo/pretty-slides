// npm --prefix engine test
const test = require('node:test');
const assert = require('node:assert');
const { parsePdffonts, resolver, foreignFonts } = require('../lib/pptfonts');

const pdffonts = `name                                 type              encoding         emb sub uni object ID
------------------------------------ ----------------- ---------------- --- --- --- ---------
BAAAAA+HelveticaNeue                 TrueType          WinAnsi          yes yes yes   4393  0
CAAAAA+HiraginoSansGB-W3             CID TrueType      Identity-H       yes yes yes   4408  0
DAAAAA+HiraginoSansGB-W3             CID TrueType      Identity-H       yes yes yes   4412  0
[none]                               Type 3            Custom           yes no  no      12  0
EAAAAA+SegoeUISymbol                 TrueType          WinAnsi          yes yes yes   4428  0
`;

// fc-list ':postscriptname=<ps>' family fullname, as fontconfig prints it.
const fcOut = {
  HelveticaNeue: 'Helvetica Neue:fullname=Helvetica Neue',
  'HelveticaNeue-Medium': 'Helvetica Neue:fullname=Helvetica Neue Medium',
  'HiraginoSansGB-W3': 'Hiragino Sans GB,冬青黑体简体中文,Hiragino Sans GB W3:fullname=Hiragino Sans GB W3',
  TimesNewRomanPSMT: 'Times New Roman:fullname=Times New Roman',
  'MicrosoftYaHei': 'Microsoft YaHei,微软雅黑:fullname=Microsoft YaHei',
};
const resolve = resolver((ps) => fcOut[ps] || '');
const theme = { fonts: { sans: 'Hiragino Sans GB', latin: 'Helvetica Neue', latinMedium: 'Helvetica Neue Medium' } };

test('pdffonts output -> PostScript names without subset prefixes', () => {
  assert.deepStrictEqual(parsePdffonts(pdffonts), ['HelveticaNeue', 'HiraginoSansGB-W3', 'SegoeUISymbol']);
  assert.deepStrictEqual(parsePdffonts(''), []);
});

test('fonts outside the theme are listed with their pages; full names and weights of theme fonts are not', () => {
  const pages = [
    { id: 'S01', fonts: ['HelveticaNeue', 'HelveticaNeue-Medium', 'HiraginoSansGB-W3'] },
    { id: 'S02', fonts: ['HiraginoSansGB-W3', 'MicrosoftYaHei', 'SegoeUISymbol'] },
    { id: 'S03', fonts: ['MicrosoftYaHei', 'TimesNewRomanPSMT'] },
  ];
  assert.deepStrictEqual(foreignFonts(pages, theme, resolve), [
    { ps: 'MicrosoftYaHei', family: 'Microsoft YaHei', pages: ['S02', 'S03'] },
    { ps: 'SegoeUISymbol', family: null, pages: ['S02'] },
    { ps: 'TimesNewRomanPSMT', family: 'Times New Roman', pages: ['S03'] },
  ]);
  assert.deepStrictEqual(foreignFonts(pages.slice(0, 1), theme, resolve), []);
});
