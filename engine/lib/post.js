// Post-process the pptx package: slide transitions (fade / morph) and Latin font pairing.
const JSZip = require('jszip');

const NS_MC = 'http://schemas.openxmlformats.org/markup-compatibility/2006';
const NS_P14 = 'http://schemas.microsoft.com/office/powerpoint/2010/main';
const NS_P159 = 'http://schemas.microsoft.com/office/powerpoint/2015/09/main';

function transitionXml(t) {
  if (!t || t === 'none') return '';
  const spec = typeof t === 'string' ? { type: t } : t;
  const dur = spec.duration ?? (spec.type === 'morph' ? 1200 : 600);
  if (spec.type === 'fade') {
    return `<mc:AlternateContent xmlns:mc="${NS_MC}"><mc:Choice xmlns:p14="${NS_P14}" Requires="p14"><p:transition spd="med" p14:dur="${dur}"><p:fade/></p:transition></mc:Choice><mc:Fallback><p:transition spd="med"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>`;
  }
  if (spec.type === 'morph') {
    const by = spec.by || 'byObject'; // byObject | byWord | byChar
    return `<mc:AlternateContent xmlns:mc="${NS_MC}"><mc:Choice xmlns:p159="${NS_P159}" xmlns:p14="${NS_P14}" Requires="p159"><p:transition spd="slow" p14:dur="${dur}"><p159:morph option="${by}"/></p:transition></mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>`;
  }
  throw new Error(`Unknown transition "${spec.type}" (use fade | morph | none)`);
}

async function postProcess(buffer, { transitions, fontPairs }) {
  const zip = await JSZip.loadAsync(buffer);
  for (let i = 0; i < transitions.length; i++) {
    const file = `ppt/slides/slide${i + 1}.xml`;
    let xml = await zip.file(file).async('string');
    if (fontPairs) {
      for (const [cjk, latin] of Object.entries(fontPairs)) {
        xml = xml.split(`<a:latin typeface="${cjk}"`).join(`<a:latin typeface="${latin}"`);
      }
    }
    const tx = transitionXml(transitions[i]);
    if (tx) xml = xml.replace('</p:clrMapOvr>', `</p:clrMapOvr>${tx}`);
    zip.file(file, xml);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

module.exports = { postProcess };
