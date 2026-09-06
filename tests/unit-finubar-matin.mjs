// Vérification du mail du matin — Node pur, zéro réseau, zéro envoi.
//
// Ce qui s'éprouve ici, dans l'ordre de ce qui coûterait le plus cher :
//   §1 la GARDE D'HEURE, sur des instants dont la réponse est connue d'avance
//      (été/hiver, les deux réveils). Une garde qui ne s'ouvre jamais et une
//      garde qui marche ont la même tête en production : silence.
//   §2 l'ÂGE de l'état, et le seuil au-delà duquel il devient un avertissement.
//   §3 le CONTENU : ce que Paul doit lire s'y trouve.
//   §4 par l'ABSENCE : le HTML est échappé, et rien d'interne ne fuite.
//   §5 les CRONS DÉCLARÉS encadrent bien les deux décalages — sinon la garde
//      est juste et le mail ne part jamais.

import { readFileSync } from 'node:fs';
import { composerMatin, ageEnJours, phraseDate, JOURS_AVANT_ALERTE, GESTES_ENUMERES }
  from '../api/_lib/finubar-matin-corps.mjs';
import { heureA, dateA } from '../api/finubar-matin.mjs';

let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✔ ${nom}`); return; }
  echecs += 1;
  console.log(`  ✘ ${nom}${detail ? ` — ${detail}` : ''}`);
}

console.log('\n§1 — la garde d’heure, sur des instants à réponse connue');

const AParis = (iso) => heureA('Europe/Paris', new Date(iso));
verifier('05:00 UTC en été  → 7 h à Paris (le mail part)', AParis('2026-09-03T05:00:00Z') === 7);
verifier('06:00 UTC en hiver → 7 h à Paris (le mail part)', AParis('2026-12-03T06:00:00Z') === 7);
verifier('05:00 UTC en hiver → 6 h (no-op)', AParis('2026-12-03T05:00:00Z') === 6);
verifier('06:00 UTC en été  → 8 h (no-op)', AParis('2026-09-03T06:00:00Z') === 8);
verifier('⛔ l’heure est un NOMBRE, jamais NaN',
  Number.isInteger(AParis('2026-09-03T05:00:00Z')),
  'fr-FR rend « 22 h » : Number() y répond NaN, et la garde bloquerait TOUT');
verifier('la date suit Paris, pas UTC (01:00 UTC l’été = déjà le jour d’avant)',
  dateA('Europe/Paris', new Date('2026-09-03T23:30:00Z')) === '2026-09-04');

console.log('\n§2 — l’âge de l’état, et le seuil d’alerte');

verifier('même jour → 0', ageEnJours('2026-09-03', '2026-09-03') === 0);
verifier('la veille → 1', ageEnJours('2026-09-03', '2026-09-04') === 1);
verifier('une semaine → 7', ageEnJours('2026-08-31', '2026-09-07') === 7);
verifier('changement de mois → 1', ageEnJours('2026-02-28', '2026-03-01') === 1);
verifier('date absente → null (on tait, on n’invente pas)', ageEnJours(null, '2026-09-04') === null);
verifier('date illisible → null', ageEnJours('hier', '2026-09-04') === null);
verifier('la phrase dit « hier » à 1 jour', /hier/.test(phraseDate('2026-09-03', 1)));
verifier('la phrase donne le nombre de jours au-delà', /il y a 7 jours/.test(phraseDate('2026-08-31', 7)));

const AGREGAT = {
  le: '2026-09-03',
  macro: {
    total: 8, en_cours: 2, en_attente_de_paul: 3, au_repos: 0, boucles_ouvertes: 21,
    gestes_de_paul: [
      { projet: 'RénoAgenda', geste: 'Recruter et valider des artisans' },
      { projet: 'RénoBoost', geste: 'Valider la fiche Google Business' },
    ],
  },
  cartouche: {
    signaux: [{ projet: 'RénoAgenda', dit: 'attend un geste — ouvert depuis 50 j' }],
    action: { projet: 'RénoAgenda', faire: 'Recruter et valider des artisans', nature: 'geste', cap: 'le dispatch tourne à vide' },
  },
};

const frais = composerMatin(AGREGAT, { aujourdhui: '2026-09-03', lien: 'https://exemple/finubar' });
const vieux = composerMatin(AGREGAT, { aujourdhui: '2026-09-20', lien: '' });

verifier(`un état frais ne porte PAS l’avertissement (seuil ${JOURS_AVANT_ALERTE} j)`,
  !/⚠️/.test(frais.texte) && !/⚠️/.test(frais.html));
verifier('un état de 17 jours PORTE l’avertissement', /⚠️/.test(vieux.texte) && /⚠️/.test(vieux.html));
verifier('l’avertissement dit QUOI FAIRE (relancer la collecte)',
  /collecter\.mjs/.test(vieux.texte));

console.log('\n§3 — le contenu : ce que Paul doit lire y est');

verifier('le sujet nomme le nombre de dépôts qui attendent',
  frais.sujet.includes('3 dépôts attendent'), frais.sujet);
verifier('le sujet reste juste au singulier',
  composerMatin({ macro: { en_attente_de_paul: 1 } }, {}).sujet.includes('1 dépôt attend'));
verifier('rien en attente → le sujet le dit',
  composerMatin({ macro: { en_attente_de_paul: 0 } }, {}).sujet.includes('rien ne bloque'));
verifier('les signaux sont là', frais.texte.includes('ouvert depuis 50 j'));
verifier('la prochaine action est là', frais.texte.includes('Recruter et valider des artisans'));
verifier('un geste de Paul est annoncé comme tel', /un geste de toi/.test(frais.texte));
verifier('les deux gestes en attente sont listés',
  frais.texte.includes('RénoBoost — Valider la fiche Google Business'));

// ⛔ LA BORNE DU MAIL. Au 6 septembre il y avait SEIZE gestes : seize lignes
// dans un mail du matin ne se lisent pas, elles se scrollent — et un mail qu'on
// ne lit pas fait tomber tout le dispositif. Même règle que l'écran, resserré
// le matin même sur le constat de Paul.
const nombreux = composerMatin({
  le: '2026-09-03',
  macro: {
    en_attente_de_paul: 3,
    gestes_de_paul: Array.from({ length: 16 }, (_, i) => ({ projet: `P${i}`, geste: `geste ${i}` })),
  },
  cartouche: { signaux: [], action: null },
}, { aujourdhui: '2026-09-03' });

verifier(`le mail énumère au plus ${GESTES_ENUMERES} gestes`,
  (nombreux.texte.match(/^  · /gm) || []).length === GESTES_ENUMERES,
  `${(nombreux.texte.match(/^  · /gm) || []).length}`);
verifier('… et COMPTE le reste au lieu de le taire',
  nombreux.texte.includes('… et 11 autres'), 'un reste tu se lirait comme « il n’y en a que 5 »');
verifier('le compte total reste annoncé en tête de section',
  nombreux.texte.includes('QUE TOI (16)'));
verifier('sous la borne, aucun « et N autres » parasite',
  !/… et \d+ autre/.test(frais.texte));
verifier('la version HTML porte la même borne',
  (nombreux.html.match(/<li /g) || []).length === GESTES_ENUMERES
  && nombreux.html.includes('11 autre'));
verifier('le lien est repris quand il est fourni', frais.texte.includes('https://exemple/finubar'));
verifier('aucun lien inventé quand il manque', !/https?:\/\//.test(vieux.texte));
verifier('un agrégat VIDE ne casse pas la composition',
  typeof composerMatin({}, {}).texte === 'string');

console.log('\n§4 — par l’absence : le HTML est échappé, rien d’interne ne fuite');

const hostile = composerMatin({
  le: '2026-09-03',
  macro: { en_attente_de_paul: 1, gestes_de_paul: [{ projet: '<img src=x onerror=alert(1)>', geste: 'a & b' }] },
  cartouche: { signaux: [{ projet: 'X', dit: '</p><script>alert(2)</script>' }], action: null },
}, { aujourdhui: '2026-09-03' });

verifier('⛔ aucune balise <script> vivante dans le HTML', !/<script>/.test(hostile.html));
// ⛔ CE TEST A ÉTÉ REPRIS LE JOUR MÊME. Il cherchait la chaîne « onerror= » et
// criait sur `&lt;img src=x onerror=alert(1)&gt;` — du texte parfaitement
// inerte. Ce qu'il faut mesurer n'est pas la présence de mots dangereux, c'est
// la présence de BALISES VIVANTES issues du grain : mon gabarit n'en pose
// aucune de ces familles, donc toute occurrence viendrait du contenu.
verifier('⛔ aucune balise vivante issue du grain',
  (hostile.html.match(/<(img|script|iframe|svg|object|embed|a\s)/gi) || []).length === 0,
  'le grain est du markdown écrit à la main : hostile par défaut');
verifier('le contenu hostile est bien présent, mais ÉCHAPPÉ',
  hostile.html.includes('&lt;script&gt;') && hostile.html.includes('&amp;'));
verifier('le test ne passe pas à vide (le grain hostile est bien arrivé)',
  hostile.texte.includes('alert(2)'));

console.log('\n§5 — les crons déclarés encadrent les deux décalages');

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const crons = Array.isArray(vercel.crons) ? vercel.crons : [];
const pour = crons.filter((c) => c.path === '/api/finubar-matin').map((c) => c.schedule).sort();
verifier('deux réveils sont déclarés', pour.length === 2, JSON.stringify(pour));
verifier('ils valent 5 h et 6 h UTC',
  JSON.stringify(pour) === JSON.stringify(['0 5 * * *', '0 6 * * *']), JSON.stringify(pour));

// LA mesure qui relie les deux moitiés : pour chaque saison, EXACTEMENT UN des
// deux réveils doit tomber sur l'heure visée. Zéro = aucun mail ; deux = deux
// mails le même matin.
for (const [saison, jour] of [['été', '2026-09-03'], ['hiver', '2026-12-03']]) {
  const ouvrants = pour.filter((s) => {
    const h = Number(s.split(' ')[1]);
    return heureA('Europe/Paris', new Date(`${jour}T${String(h).padStart(2, '0')}:00:00Z`)) === 7;
  });
  verifier(`en ${saison} : exactement UN réveil ouvre la garde`, ouvrants.length === 1,
    `${ouvrants.length} — ${JSON.stringify(ouvrants)}`);
}

console.log(echecs === 0
  ? '\n=== unit-finubar-matin : TOUT VERT ==='
  : `\n=== unit-finubar-matin : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
