import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const url = pathToFileURL('/home/user/Ultima-/design/preview-riven-stellaire.html').href;
const ecrans = [['téléphone 390×844',390,844],['large et court 1670×900',1670,900]];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let echec = 0;
for (const [nom,w,h] of ecrans) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  const err = [];
  p.on('pageerror', e => err.push(String(e)));
  p.on('console', m => { if (m.type()==='error') err.push(m.text()); });
  await p.goto(url);
  await p.waitForFunction(() => window.MAQUETTE_STELLAIRE, null, {timeout:5000}).catch(()=>{});
  const r = await p.evaluate(() => window.MAQUETTE_STELLAIRE);
  console.log(`\n=== ${nom} ===`);
  if (!r) { console.log('  page morte'); echec=1; await p.close(); continue; }
  console.log(`couples ${r.mesures.length} · défauts ${r.defauts} · luminance max ${r.luminanceMax.toFixed(4)} · étoiles rendues ${r.etoiles}`);
  for (const m of r.mesures.slice(0,5)) console.log(`  ${m.conforme?'ok  ':'DÉF '} ${m.ratio.toFixed(2)}:1 (exigé ${m.exige}) — ${m.libelle}`);
  // Le critère du PRODUIT (tests/smoke-ciel.mjs) : centres des étoiles et des
  // libellés d'amas dans le viewBox. Pas la getBBox — halos et zones de
  // captation débordent volontairement et sont rognés par overflow:hidden.
  // Et on attend la CONVERGENCE de la caméra, jamais une durée fixe.
  const mesure = () => p.evaluate(() => {
    const s = document.getElementById('ciel-scene');
    const svg = s.querySelector('.ciel-svg');
    if (!svg) return null;
    const vb = svg.getAttribute('viewBox').split(' ').map(Number);
    const dedans = (x, y) => x >= 0 && x <= vb[2] && y >= 0 && y <= vb[3];
    let dehors = 0, vues = 0;
    svg.querySelectorAll('g.ciel-etoile[data-noeud-id]').forEach((g) => {
      const z = g.querySelector('.ciel-zone');
      if (!z) return;
      vues++;
      if (!dedans(+z.getAttribute('cx'), +z.getAttribute('cy'))) dehors++;
    });
    let libDehors = 0, libVus = 0;
    svg.querySelectorAll('.ciel-nom-amas').forEach((t) => {
      libVus++;
      if (!dedans(+t.getAttribute('x'), +t.getAttribute('y'))) libDehors++;
    });
    return { vues, dehors, libVus, libDehors, scene: s.getBoundingClientRect().height,
      svg: svg.getBoundingClientRect().height,
      pageDeborde: document.documentElement.scrollWidth > window.innerWidth };
  });
  let g = await mesure(), precedent = null, tours = 0;
  while (tours < 40 && (!precedent || JSON.stringify(precedent) !== JSON.stringify(g))) {
    precedent = g; await p.waitForTimeout(120); g = await mesure(); tours++;
  }
  console.log(`  convergence en ${tours} tours`);
  console.log(`  cadre : scène ${Math.round(g.scene)} px, svg ${Math.round(g.svg)} px → coupé ${Math.round(g.svg-g.scene)} px`);
  console.log(`  étoiles ${g.vues} dont ${g.dehors} hors cadre · libellés d'amas ${g.libVus} dont ${g.libDehors} hors cadre · débordement horizontal : ${g.pageDeborde}`);
  if (r.defauts>0 || r.luminanceMax>=0.2 || r.etoiles===0 || g.svg-g.scene>1 || g.pageDeborde || g.dehors>0 || g.libDehors>0) echec=1;
  if (err.length) { console.log('  ERREURS JS :', err.slice(0,3)); echec=1; }
  await p.close();
}
await b.close();
console.log(echec ? '\nRÉSULTAT : DÉFAUTS' : '\nRÉSULTAT : tout conforme');
process.exit(echec);
