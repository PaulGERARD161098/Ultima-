/* Maquette « carte céleste » — lot 2 de CADRAGE-2026-09-25-carte-celeste.md.
   Rien n'est réécrit ici : l'adaptateur, la greffe et le moteur sont ceux de la
   production. La maquette choisit un écran, une variante, et MESURE. */
import { NOEUDS } from '../js/registre-lv3.mjs';
import { versCiel } from '../js/adaptateur-lv4.mjs';
import { greffer } from '../js/adaptateur-finubar.mjs';
import { AGREGAT } from './preview-accueil-finubar-fixture.mjs';

const GREFFE = greffer(NOEUDS, AGREGAT);

// Le PIRE CAS construit du patrimoine (le même que `smoke-lv4-coque`) : un foyer
// à 24 enfants directs, aux noms de 20 caractères.
const PIRE = { essai: { nom: 'ESSAI', enfants: ['gros'] }, gros: { nom: 'GROS', enfants: [] } };
for (let t = 0; t < 24; t++) {
  const id = 'sous' + t;
  PIRE.gros.enfants.push(id);
  PIRE[id] = { nom: ('CACHE ' + t + ' ' + 'ABCDEFGHIJKLMNOP').slice(0, 20), etat: 'Ouvert', cible: 'grima.html' };
}

const ECRANS = {
  ultima:    { reg: NOEUDS, ecran: 'ultima-perso', isole: null, dit: 'ULTIMA — deux têtes : GRIMA, NAGA' },
  naga:      { reg: NOEUDS, ecran: 'ultima-perso', isole: 'naga', dit: 'NAGA isolé — trois têtes : le rang n’y change rien' },
  grima:     { reg: NOEUDS, ecran: 'ultima-perso', isole: 'grima', dit: 'GRIMA isolé — RIVEN est une feuille, NICOL BOLAS une tête' },
  racine:    { reg: NOEUDS, ecran: 'racine', isole: null, dit: 'La racine — ALTHEA est une feuille' },
  alpha:     { reg: GREFFE, ecran: 'alpha', isole: null, dit: 'ALPHA avec les dépôts (fixture inventée)' },
  renoboost: { reg: GREFFE, ecran: 'alpha', isole: 'renoboost-ia', dit: 'RENOBOOST IA isolé, avec ses dépôts (fixture inventée)' },
  pire:      { reg: PIRE, ecran: 'essai', isole: 'gros', dit: 'Pire cas construit : 24 étoiles aux noms de 20 caractères' },
};
const VARIANTES = {
  v0: { nom: 'aujourd’hui', options: {} },
  v1: { nom: 'V1 couronne', options: { asterisme: true, eclatParPoids: true } },
  v2: { nom: 'V2 figure', options: { asterisme: true, eclatParPoids: true, disposition: 'figure' } },
};

const params = new URLSearchParams(location.search);
let ecran = ECRANS[params.get('ecran')] ? params.get('ecran') : 'naga';
let variante = VARIANTES[params.get('variante')] ? params.get('variante') : 'v1';
const scene = document.getElementById('ciel-scene');

function peindre() {
  const e = ECRANS[ecran];
  const donnees = versCiel(e.ecran, e.reg, { isole: e.isole });
  window.UltimaCiel.rendre(scene, donnees, Object.assign({
    // Les options de la production (`js/ciel-noeud.mjs`), telles quelles.
    libellesType: { cap: '' }, libellesStatut: {},
    cadrerSurLesEtoiles: true, tousLesNoms: true, fond: true, couronne: true,
  }, VARIANTES[variante].options));
  document.querySelectorAll('[data-ecran]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ecran === ecran)));
  document.querySelectorAll('[data-variante]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variante === variante)));
  document.getElementById('mq-legende').textContent = e.dit + ' · ' + VARIANTES[variante].nom;
}

// ---- LA MESURE — les critères qui ont fondé la couronne le 17/08 -----------
export function mesurer() {
  const svg = scene.querySelector('.ciel-svg');
  const boite = svg.getBoundingClientRect();
  const etoiles = [...scene.querySelectorAll('g.ciel-etoile[data-noeud-id]')];
  const zones = etoiles.map((g) => g.querySelector('.ciel-zone').getBoundingClientRect());
  const noms = etoiles.map((g) => g.querySelector('.ciel-nom'))
    // ⚠️ TOUT NOM PEINT COMPTE, même pâle. Le premier jet écartait l'opacité
    // ≤ 0,3 — or les noms du fond sont peints à 0,25, et visibles : la mesure
    // disait « 0 chevauchement » sur une capture où deux noms se couvraient.
    // Trouvé en REGARDANT la capture, pas en relisant le code.
    .filter((n) => n && +(n.getAttribute('opacity') || getComputedStyle(n).opacity) > 0.05)
    .map((n) => n.getBoundingClientRect());
  let chevauchements = 0;
  for (let i = 0; i < noms.length; i++) for (let j = i + 1; j < noms.length; j++) {
    const a = noms[i], b = noms[j];
    if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) chevauchements++;
  }
  const hors = noms.filter((r) => r.left < boite.left - 1 || r.right > boite.right + 1
    || r.top < boite.top - 1 || r.bottom > boite.bottom + 1).length;
  const cx = zones.map((z) => z.left + z.width / 2), cy = zones.map((z) => z.top + z.height / 2);
  const occupation = zones.length < 2 ? 1
    : Math.max((Math.max(...cx) - Math.min(...cx)) / boite.width, (Math.max(...cy) - Math.min(...cy)) / boite.height);
  const traits = scene.querySelectorAll('.ciel-asterisme line').length;
  return {
    ecran, variante, etoiles: etoiles.length, traits,
    traitsAttendus: VARIANTES[variante].options.asterisme ? Math.max(0, etoiles.length - 1) : 0,
    occupation: +occupation.toFixed(3), chevauchements, hors,
    cibleMinPx: Math.round(Math.min(...zones.map((z) => z.width))),
  };
}
function dire(m) {
  const ko = (c) => (c ? ' class="mq-ko"' : '');
  document.getElementById('mq-mesure').innerHTML =
    `${m.etoiles} étoiles · <span${ko(m.traits !== m.traitsAttendus)}>${m.traits} traits (attendu ${m.traitsAttendus})</span>`
    + ` · occupation ${m.occupation} · <span${ko(m.chevauchements)}>${m.chevauchements} noms qui se chevauchent</span>`
    + ` · <span${ko(m.hors)}>${m.hors} hors cadre</span> · <span${ko(m.cibleMinPx < 24)}>cible ≥ ${m.cibleMinPx} px</span>`;
}
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
async function montrer() { peindre(); await attendre(900); dire(mesurer()); }

async function toutMesurer() {
  const garde = [ecran, variante];
  const lignes = [];
  // « Aujourd'hui » est le TÉMOIN : ce qui rougit déjà sans la figure n'est pas
  // imputable à la figure.
  for (const e of Object.keys(ECRANS)) for (const v of ['v0', 'v1', 'v2']) {
    ecran = e; variante = v; peindre(); await attendre(900); lignes.push(mesurer());
  }
  [ecran, variante] = garde; await montrer();
  const t = document.getElementById('mq-table');
  t.innerHTML = '<tr><th>Écran</th><th>Var.</th><th>Étoiles</th><th>Traits</th><th>Occupation</th><th>Noms ×</th><th>Hors cadre</th><th>Cible px</th></tr>'
    + lignes.map((m) => `<tr><td>${m.ecran}</td><td>${m.variante}</td><td>${m.etoiles}</td><td>${m.traits}/${m.traitsAttendus}</td>`
      + `<td>${m.occupation}</td><td>${m.chevauchements}</td><td>${m.hors}</td><td>${m.cibleMinPx}</td></tr>`).join('');
  t.hidden = false;
  window.mqResultats = lignes;
  return lignes;
}
window.mqMesurerTout = toutMesurer;

document.querySelectorAll('[data-ecran]').forEach((b) => b.addEventListener('click', () => { ecran = b.dataset.ecran; montrer(); }));
document.querySelectorAll('[data-variante]').forEach((b) => b.addEventListener('click', () => { variante = b.dataset.variante; montrer(); }));
document.getElementById('mq-tout').addEventListener('click', toutMesurer);
montrer();
