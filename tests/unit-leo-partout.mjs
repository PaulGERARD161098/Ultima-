// Vérification de « parler à Léo partout » — Node pur, zéro DOM, zéro réseau.
//
// Trois choses s'éprouvent ici, et la troisième est celle qui coûterait cher :
//   ① les deux quadrants neufs (FINUBAR, ULTIMA) existent et ne peuvent RIEN
//     écrire — la voix propose, elle n'agit pas depuis ces pages ;
//   ② le miroir client de la liste des quadrants (js/leo-partout.js) est
//     EXACTEMENT la liste serveur — une page qui déclarerait un quadrant que le
//     serveur refuse tomberait en 400 au premier mot de Paul, sans rien dire ;
//   ③ les yeux de FINUBAR tiennent les bornes du serveur SUR UN PIRE CAS
//     CONSTRUIT, et ne laissent sortir NI commit, NI identifiant, NI jeton.
//     Une règle de confidentialité se teste par l'ABSENCE (leçon 2026-07-30) :
//     on met le contenu interdit dans l'entrée, et on exige de ne pas le
//     retrouver dans ce qui part.
//
// ⛔ Le pire cas est CONSTRUIT, jamais échantillonné sur l'agrégat du jour :
//   celui-ci tient dans les bornes par chance (huit dépôts), et le mesurer
//   reviendrait à valider la borne avec un cas qui ne la touche pas.

import { readFileSync } from 'node:fs';
import {
  construireSysteme, outilsPour, validerEtatQuadrant, MAX_ETAT_ENTREES, MAX_ETAT_LIBELLE
} from '../api/_lib/leo.js';
import { yeuxDeLeo } from '../js/adaptateur-finubar.mjs';

let echecs = 0;
function verifier(intitule, condition, detail) {
  if (condition) { console.log(`  ✔ ${intitule}`); return; }
  echecs += 1;
  console.log(`  ✘ ${intitule}${detail ? ` — ${detail}` : ''}`);
}

console.log('\n§1 — les six quadrants, et ce que les deux nouveaux ne peuvent pas faire');

const CONNUS = ['riven', 'bcp', 'adramelech', 'imladrik', 'finubar', 'ultima'];
for (const q of CONNUS) {
  verifier(`« ${q} » a un prompt système`, typeof construireSysteme(q, false) === 'string');
}
verifier('un quadrant inconnu reste refusé', construireSysteme('mordor', false) === null);

// Le garde-fou du sujet : sans lui, Léo comblerait « où en est RenoDevis ? »
// avec du vraisemblable, ce qui se lit exactement comme du mesuré.
const sysFinubar = construireSysteme('finubar', false);
verifier('FINUBAR interdit explicitement le code et les commits',
  /jamais le code/.test(sysFinubar) && /jamais les commits/.test(sysFinubar));
verifier("FINUBAR dit qu'elle ne connaît que l'état joint",
  /QUE ce que l'état joint/.test(sysFinubar));

const sysUltima = construireSysteme('ultima', false);
verifier("ULTIMA avoue n'avoir aucune donnée sous les yeux",
  /AUCUNE donnée/.test(sysUltima));

verifier('FINUBAR ne porte aucun outil d’écriture', outilsPour('finubar') === null);
verifier('ULTIMA ne porte aucun outil d’écriture', outilsPour('ultima') === null);
verifier('RIVEN garde les siens (non-régression)', Array.isArray(outilsPour('riven')));

console.log('\n§2 — le miroir client ne peut pas diverger de la liste serveur');

const source = readFileSync(new URL('../js/leo-partout.js', import.meta.url), 'utf8');
const miroir = /var QUADRANTS = \[([^\]]+)\]/.exec(source);
verifier('la liste client est lisible dans le module', miroir !== null);
if (miroir) {
  const client = miroir[1].split(',').map((t) => t.trim().replace(/^'|'$/g, ''));
  verifier('client et serveur listent les mêmes quadrants',
    JSON.stringify(client) === JSON.stringify(CONNUS),
    `client=${JSON.stringify(client)}`);
}
verifier('le repli est un quadrant connu',
  CONNUS.includes(/var REPLI = '([a-z]+)'/.exec(source)[1]));

console.log('\n§3 — les yeux de FINUBAR : bornes tenues sur un PIRE CAS construit');

// 60 dépôts (le produit en annonce 8), des libellés de 500 caractères, 5 gestes
// chacun : très au-delà de tout ce que la collecte produit aujourd'hui.
const long = 'x'.repeat(500);
const pireCas = {
  macro: { total: 99999, en_cours: 60, en_attente_de_paul: 60, au_repos: 0, boucles_ouvertes: 4242 },
  cartouche: {
    signaux: Array.from({ length: 60 }, (_, i) => ({ projet: `dépôt-${i}`, dit: long })),
    action: { projet: long, faire: long, nature: 'geste' },
  },
  projets: Array.from({ length: 60 }, (_, i) => ({
    ok: true,
    depot: `PaulGERARD161098/dépôt-${i}`,
    grain: {
      etat: 'en_cours',
      prochaine_action: long,
      bloque_par: Array.from({ length: 5 }, (_, j) => `${long}-${j}`),
    },
  })),
};

const etatPire = yeuxDeLeo(pireCas);
const verdict = validerEtatQuadrant(etatPire);
verifier('le serveur ACCEPTE un état issu du pire cas', verdict.ok === true,
  'un rejet vaut voix muette : le serveur répond 400 sur tout l’appel');

for (const [cle, liste] of Object.entries(etatPire.listes)) {
  verifier(`« ${cle} » ≤ ${MAX_ETAT_ENTREES} entrées`, liste.length <= MAX_ETAT_ENTREES,
    `${liste.length}`);
  const trop = liste.find((e) => e.libelle.length > MAX_ETAT_LIBELLE);
  verifier(`« ${cle} » : aucun intitulé > ${MAX_ETAT_LIBELLE} caractères`, trop === undefined);
}
verifier('au plus 4 listes (borne serveur)', Object.keys(etatPire.listes).length <= 4,
  `${Object.keys(etatPire.listes).length}`);

console.log('\n§4 — ce qui ne doit PAS partir (test par l’absence)');

// L'agrégat porte des choses qu'un modèle n'a aucune raison de voir : le SHA
// du dernier commit, le chemin d'un fichier, un jeton. Aucune ne doit se
// retrouver dans l'état — et on le vérifie en les CHERCHANT dans ce qui part.
const INTERDITS = {
  'un SHA de commit': '7acf23b922a4958eac99a7def9376b77e11c080c',
  'un jeton de session': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret',
  'un chemin de fichier interne': '/api/_lib/finubar-macro.mjs',
};
const avecSecrets = {
  macro: { total: 8, en_cours: 1, en_attente_de_paul: 1, au_repos: 6, boucles_ouvertes: 2 },
  cartouche: { signaux: [{ projet: 'Ultima', dit: 'attend un geste' }], action: null },
  projets: [{
    ok: true,
    depot: 'PaulGERARD161098/Ultima-',
    jeton: INTERDITS['un jeton de session'],
    derive: { commits_depuis: 3, tete: INTERDITS['un SHA de commit'] },
    grain: {
      etat: 'en_cours',
      prochaine_action: 'brancher Léo',
      bloque_par: [],
      dernier_arret: { le: '2026-09-03', quoi: 'fusion', commit: INTERDITS['un SHA de commit'] },
      source: INTERDITS['un chemin de fichier interne'],
    },
  }],
};
const partant = JSON.stringify(yeuxDeLeo(avecSecrets));
for (const [quoi, valeur] of Object.entries(INTERDITS)) {
  verifier(`${quoi} ne part pas`, !partant.includes(valeur));
}
verifier('ce qui doit partir part bien (le test ne passe pas à vide)',
  partant.includes('brancher Léo') && partant.includes('Ultima'));

console.log(echecs === 0
  ? '\n=== unit-leo-partout : TOUT VERT ==='
  : `\n=== unit-leo-partout : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
