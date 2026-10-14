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

// In-slide entrance animations: fade in on click, grouped by step; items in a step may be staggered by delay.
// builds: [{ name, step, delay }] with `name` = the shape's cNvPr name in the slide XML.
function timingXml(xml, builds) {
  if (!builds || !builds.length) return { xml: '', missing: [] };
  const missing = [];
  const items = [];
  for (const b of builds) {
    const m = xml.match(new RegExp(`<p:cNvPr id="(\\d+)" name="${b.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    if (!m) { missing.push(b.name); continue; }
    const before = xml.slice(0, m.index);
    const isSp = before.lastIndexOf('<p:sp>') > Math.max(before.lastIndexOf('<p:pic>'), before.lastIndexOf('<p:graphicFrame>'), before.lastIndexOf('<p:cxnSp>'));
    items.push({ ...b, spid: m[1], isSp });
  }
  if (!items.length) return { xml: '', missing };
  let id = 2;
  const steps = [...new Set(items.map((i) => i.step))].sort((a, b) => a - b);
  const clicks = steps.map((step) => {
    const group = items.filter((i) => i.step === step).sort((a, b) => a.delay - b.delay);
    const outer = ++id, inner = ++id;
    const effects = group.map((it, n) => {
      const a = ++id, b = ++id, c = ++id;
      return `<p:par><p:cTn id="${a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold"${it.isSp ? ' grpId="0"' : ''} nodeType="${n === 0 ? 'clickEffect' : 'withEffect'}"><p:stCondLst><p:cond delay="${it.delay}"/></p:stCondLst><p:childTnLst>`
        + `<p:set><p:cBhvr><p:cTn id="${b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${it.spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`
        + `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${c}" dur="500"/><p:tgtEl><p:spTgt spid="${it.spid}"/></p:tgtEl></p:cBhvr></p:animEffect>`
        + '</p:childTnLst></p:cTn></p:par>';
    }).join('');
    return `<p:par><p:cTn id="${outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${effects}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  }).join('');
  const bld = items.filter((i) => i.isSp).map((i) => `<p:bldP spid="${i.spid}" grpId="0"/>`).join('');
  return {
    missing,
    xml: '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
      + `<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clicks}</p:childTnLst></p:cTn>`
      + '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
      + '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
      + `</p:childTnLst></p:cTn></p:par></p:tnLst>${bld ? `<p:bldLst>${bld}</p:bldLst>` : ''}</p:timing>`,
  };
}

async function postProcess(buffer, { transitions, fontPairs, builds = [] }) {
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
    const tm = timingXml(xml, builds[i]);
    if (tm.missing.length) throw new Error(`slide ${i + 1}: build targets not found in XML: ${tm.missing.join(', ')}`);
    if (tm.xml) xml = xml.replace('</p:sld>', `${tm.xml}</p:sld>`);
    zip.file(file, xml);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

module.exports = { postProcess };
