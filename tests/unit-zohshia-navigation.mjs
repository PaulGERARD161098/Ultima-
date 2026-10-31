// Navigation vers une fiche réelle, jamais vers une technologie fantôme.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { NOEUDS, parentDe, chemin, verifierRegistre } from '../js/registre-lv3.mjs';
import { BLASONS, COEURS } from '../js/blasons.mjs';
import { versCiel } from '../js/adaptateur-lv4.mjs';
import data from '../api/_lib/zohshia-technos.mjs';
const read = (p) => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
assert.deepEqual(verifierRegistre(NOEUDS, BLASONS, COEURS), []);
assert.equal(parentDe('presentations-claires'), 'zohshia');
assert.deepEqual(chemin('presentations-claires'), ['racine','omega','imladrik','constellation-dragons','zohshia','presentations-claires']);
const sky = versCiel('imladrik', NOEUDS, { isole:'zohshia' });
// Vérification dans les deux sens : un catalogue agrandi ne peut plus rester
// invisible derrière une ancienne liste de quatre étoiles.
function verifierCouverture(etoiles, technos) {
  assert.ok(etoiles.length > 0 && technos.length > 0, 'couverture vide');
  const cibles = etoiles.map((n) => n.cible);
  const attendues = technos.map((t) => 'zohshia.html#' + t.id);
  assert.equal(new Set(cibles).size, cibles.length, 'étoile dupliquée');
  assert.equal(new Set(attendues).size, attendues.length, 'technologie dupliquée');
  assert.deepEqual([...cibles].sort(), [...attendues].sort(), 'catalogue et constellation divergent');
}
verifierCouverture(sky.noeuds, data.technos);
// Contrôler le contrôleur avec les défauts connus, pas une copie du résultat vert.
assert.throws(() => verifierCouverture(sky.noeuds.slice(0, -1), data.technos));
assert.throws(() => verifierCouverture(sky.noeuds, data.technos.slice(0, -1)));
assert.throws(() => verifierCouverture([...sky.noeuds, sky.noeuds[0]], data.technos));
assert.throws(() => verifierCouverture([], []));
assert.equal(sky.noeuds.filter((n) => n.id==='presentations-claires').length, 1);
for (const star of sky.noeuds) {
  assert.equal(star.cible.split('#')[0], 'zohshia.html');
  assert.ok(data.technos.some((t) => t.id===star.cible.split('#')[1]));
}
const t = data.technos.find((t) => t.id==='presentations-claires');
assert.ok(t.onglets.find((o) => o.id==='composition').blocs.length>3);
assert.ok(t.onglets.find((o) => o.id==='pitch').blocs.length>3);
for (const skill of ['composition-editoriale','pitch-source']) {
  const key='presentations-claires/../../.claude/skills/'+skill+'/SKILL.md';
  assert.ok(data.sources[key], 'source de compétence non suivie : '+skill);
}
// Contre-épreuve : un raccordement orphelin ne passe pas le contrôleur.
const broken=structuredClone(NOEUDS);
broken.zohshia.enfants=broken.zohshia.enfants.filter((n) => n!=='presentations-claires');
assert.ok(verifierRegistre(broken,BLASONS,COEURS).some((a) => a.includes('presentations-claires')));
const js=read('js/zohshia.js');
assert.match(js,/function ouvrirDepuisAncre/);
assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML/.test(js.replace(/\/\/.*$/gm,'')));
// Exécuter la fonction réelle, avec un DOM minimal simulé. Ce contrôle
// vérifie les effets de navigation ; il ne certifie pas le rendu navigateur.
const listeners={};
let expanded=false,clicks=0,focused=false,scrolled=false;
const badge={getAttribute:()=>expanded?'true':'false',click:()=>{expanded=true;clicks++;},focus:()=>{focused=true;}};
const context={
  window:{location:{hash:'#presentations-claires'},addEventListener:(key,fn)=>{listeners[key]=fn;}},
  document:{readyState:'loading',addEventListener(){},getElementById:(id)=>id==='technologie-presentations-claires'
    ? {querySelector:()=>badge,scrollIntoView:()=>{scrolled=true;}} : null},
};
vm.createContext(context);
vm.runInContext(js,context);
context.ouvrirDepuisAncre();
assert.ok(expanded && focused && scrolled);
assert.equal(clicks,1);
listeners.hashchange();
assert.equal(clicks,1,'une même ancre ne referme pas la fiche');
for (const hash of ['#inconnue','#%E0%A4%A','#%3Cscript%3E']) {
  context.window.location.hash=hash;
  context.ouvrirDepuisAncre();
}
assert.equal(clicks,1);
context.window.location.hash='#presentations-claires';
context.document.getElementById=()=>null;
context.ouvrirDepuisAncre();
assert.equal(clicks,1,'une ancre ne révèle pas une fiche non reçue');
console.log(`UNIT-ZOHSHIA-NAVIGATION OK : arbre sain, ${sky.noeuds.length} étoiles reliées à ${data.technos.length} fiches ; quatre défauts de couverture refusés`);

