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
    // bldP (paragraph build) is only valid for shapes that carry a text body; PowerPoint asks to "repair" files
    // that list it for plain shapes, lines or pictures. Those animate fine without it.
    const start = before.lastIndexOf('<p:sp>');
    const isSp = start > Math.max(before.lastIndexOf('<p:pic>'), before.lastIndexOf('<p:graphicFrame>'), before.lastIndexOf('<p:cxnSp>'));
    const spXml = isSp ? xml.slice(start, xml.indexOf('</p:sp>', m.index)) : '';
    const hasText = isSp && spXml.includes('<p:txBody>');
    items.push({ ...b, spid: m[1], hasText });
  }
  if (!items.length) return { xml: '', missing };
  let id = 2;
  const steps = [...new Set(items.map((i) => i.step))].sort((a, b) => a - b);
  const clicks = steps.map((step) => {
    const group = items.filter((i) => i.step === step).sort((a, b) => a.delay - b.delay);
    const outer = ++id, inner = ++id;
    const effects = group.map((it, n) => {
      const a = ++id, b = ++id, c = ++id;
      return `<p:par><p:cTn id="${a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold"${it.hasText ? ' grpId="0"' : ''} nodeType="${n === 0 ? 'clickEffect' : 'withEffect'}"><p:stCondLst><p:cond delay="${it.delay}"/></p:stCondLst><p:childTnLst>`
        + `<p:set><p:cBhvr><p:cTn id="${b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${it.spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`
        + `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${c}" dur="500"/><p:tgtEl><p:spTgt spid="${it.spid}"/></p:tgtEl></p:cBhvr></p:animEffect>`
        + '</p:childTnLst></p:cTn></p:par>';
    }).join('');
    return `<p:par><p:cTn id="${outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${effects}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  }).join('');
  const bld = items.filter((i) => i.hasText).map((i) => `<p:bldP spid="${i.spid}" grpId="0"/>`).join('');
  return {
    missing,
    xml: '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
      + `<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clicks}</p:childTnLst></p:cTn>`
      + '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
      + '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
      + `</p:childTnLst></p:cTn></p:par></p:tnLst>${bld ? `<p:bldLst>${bld}</p:bldLst>` : ''}</p:timing>`,
  };
}

// Diffuse light: replace the placeholder fill of the '!!light' shape with a soft radial gradient
// (Gaussian-like falloff, zero from 60% outward so the carrier shape never shows) and move it to the back.
// Each stop uses colour mix √f with alpha √f: renderers that honour alpha show the exact falloff f;
// renderers that ignore alpha still fade smoothly into the page colour.
function applyLight(xml, spec) {
  if (!spec) return xml;
  const m = xml.match(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?name="!!light"[\s\S]*?<\/p:sp>/);
  if (!m) throw new Error('light shape not found');
  const stops = [0, 10, 20, 30, 40, 50, 60, 100].map((p) => {
    const f = p >= 60 ? 0 : Math.exp(-3 * (p / 60) ** 2) * Math.min(1, spec.strength);
    const r = Math.sqrt(f);
    return `<a:gs pos="${p * 1000}"><a:srgbClr val="${mixHex(spec.edge, spec.color, r)}"><a:alpha val="${Math.round(r * 100000)}"/></a:srgbClr></a:gs>`;
  }).join('');
  const grad = `<a:gradFill rotWithShape="1"><a:gsLst>${stops}</a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill>`;
  const sp = m[0].replace(/<a:solidFill>[\s\S]*?<\/a:solidFill>/, grad);
  const without = xml.replace(m[0], '');
  return without.replace(/(<p:spTree>[\s\S]*?<\/p:grpSpPr>)/, `$1${sp}`);
}
function mixHex(a, b, t) {
  const p = [0, 2, 4].map((i) => parseInt(a.slice(i, i + 2), 16)), q = [0, 2, 4].map((i) => parseInt(b.slice(i, i + 2), 16));
  return p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function postProcess(buffer, { transitions, fontPairs, builds = [], lights = [] }) {
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
    if (lights[i] && lights[i].length > 1) throw new Error(`slide ${i + 1}: only one light per slide`);
    xml = applyLight(xml, lights[i] && lights[i][0]);
    const tm = timingXml(xml, builds[i]);
    if (tm.missing.length) throw new Error(`slide ${i + 1}: build targets not found in XML: ${tm.missing.join(', ')}`);
    if (tm.xml) xml = xml.replace('</p:sld>', `${tm.xml}</p:sld>`);
    zip.file(file, xml);
  }
  await sanitizePackage(zip);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// Package integrity. pptxgenjs declares content-type overrides for parts it never writes (e.g. slideMaster2..N),
// which makes PowerPoint offer to "repair" the file on every open (LibreOffice doesn't care). Drop overrides for
// missing parts, and fail loudly on any relationship that points at a part that does not exist.
async function sanitizePackage(zip) {
  const ctPath = '[Content_Types].xml';
  let ct = await zip.file(ctPath).async('string');

  // Charts: pptxgenjs references a third (series) axis id in every bar/line/area chart group but only defines
  // a <c:serAx> for 3D bars. PowerPoint deletes such charts on repair. Drop axis references nothing defines.
  for (const chartPath of Object.keys(zip.files).filter((n) => /^ppt\/charts\/chart\d+\.xml$/.test(n))) {
    let x = await zip.file(chartPath).async('string');
    const defined = new Set([...x.matchAll(/<c:(?:catAx|valAx|dateAx|serAx)>\s*<c:axId val="(\d+)"/g)].map((m) => m[1]));
    x = x.replace(/<c:axId val="(\d+)"\/>/g, (m, id) => (defined.has(id) ? m : ''));
    zip.file(chartPath, x);
  }

  // Notes master: pptxgenjs points it at the slide master's theme; PowerPoint wants one theme part per master.
  const nmRels = 'ppt/notesMasters/_rels/notesMaster1.xml.rels';
  if (zip.file(nmRels)) {
    const rels = await zip.file(nmRels).async('string');
    const m = rels.match(/Target="\.\.\/theme\/(theme\d+)\.xml"/);
    const slideMasterUses = (await Promise.all(Object.keys(zip.files).filter((n) => /^ppt\/slideMasters\/_rels\/.*\.rels$/.test(n))
      .map((n) => zip.file(n).async('string')))).some((r) => m && r.includes(`../theme/${m[1]}.xml`));
    if (m && slideMasterUses) {
      let n = 1; while (zip.file(`ppt/theme/theme${n}.xml`)) n++;
      zip.file(`ppt/theme/theme${n}.xml`, await zip.file(`ppt/theme/${m[1]}.xml`).async('string'));
      zip.file(nmRels, rels.replace(`../theme/${m[1]}.xml`, `../theme/theme${n}.xml`));
      ct = ct.replace('</Types>', `<Override PartName="/ppt/theme/theme${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/></Types>`);
    }
  }
  ct = ct.replace(/\s*<Override PartName="([^"]+)"[^>]*\/>/g, (m, part) => (zip.file(part.replace(/^\//, '')) ? m : ''));
  zip.file(ctPath, ct);
  const dangling = [];
  for (const relPath of Object.keys(zip.files).filter((n) => n.endsWith('.rels'))) {
    const rels = await zip.file(relPath).async('string');
    const baseDir = relPath.replace(/_rels\/[^/]*\.rels$/, ''); // root part is "_rels/.rels"
    for (const [, target, mode] of rels.matchAll(/Target="([^"]+)"(?:\s+TargetMode="([^"]+)")?/g)) {
      if (mode === 'External') continue;
      const resolved = target.startsWith('/') ? target.slice(1) : normalize(baseDir + target);
      if (!zip.file(resolved)) dangling.push(`${relPath} → ${target}`);
    }
  }
  if (dangling.length) throw new Error(`pptx package has relationships to missing parts:\n  ${dangling.join('\n  ')}`);
}
function normalize(p) {
  const out = [];
  for (const seg of p.split('/')) { if (seg === '..') out.pop(); else if (seg && seg !== '.') out.push(seg); }
  return out.join('/');
}

module.exports = { postProcess };
