// L'ANNEAU de Léo (B1 ①②, cadrage §11 du 2026-09-29) — Node pur, zéro réseau.
//
// Ce que ce harnais PROUVE, et rien d'autre : le mécanisme SAIT REFUSER avant
// de savoir agir. Il ne prouve pas que Léo écrit — l'exécution est l'étape ④
// de B1, elle n'existe pas encore, et le dire ici évite qu'un vert soit lu
// comme « c'est branché ».
//
// Critères de sortie du §11.3 couverts : B1-b (un orange refuse même appelé
// comme un vert) et B1-c (un outil sans anneau reconnu est orange).
import { readFileSync, readdirSync } from 'node:fs';
import {
  ANNEAUX,
  ANNEAU_PAR_DEFAUT,
  normaliserAnneau,
  anneauDe,
  autoriserEcriture,
  validerProposition,
  OUTILS_PAR_QUADRANT
} from '../api/_lib/leo.js';

const verdicts = {};
const source = readFileSync(new URL('../api/_lib/leo.js', import.meta.url), 'utf8');

// ---------- 0. Verrou de NON-VACUITÉ ----------
// Tout ce qui suit parcourt le catalogue. Sur un catalogue vide, « aucun outil
// vert hors des trois » et « tous portent un anneau » sont vrais par vacuité :
// un dispositif parfait et un dispositif absent rendraient le même vert.
const tousLesOutils = Object.values(OUTILS_PAR_QUADRANT).flat().map((o) => o.name);
verdicts.nonVacuite = tousLesOutils.length === 10 &&
  Object.keys(OUTILS_PAR_QUADRANT).length === 4;

// ---------- 1. Chaque outil porte un anneau EXPLICITE et reconnu ----------
// Le défaut orange rattrape un champ manquant à l'exécution ; il ne dispense
// pas de l'écrire. Un outil sans anneau est un oubli, pas un choix.
verdicts.anneauExplicitePartout = tousLesOutils.length ===
  (source.match(/^\s+anneau: '(?:vert|orange)',$/gm) || []).length;
verdicts.anneauReconnuPartout = tousLesOutils.every((n) => ANNEAUX.includes(anneauDe(n)));

// ---------- 2. LA TAILLE DU VERT, mesurée et nommée ----------
// ⛔ La liste attendue est écrite ici EXPRÈS : c'est le seul endroit où une
// extension de l'anneau vert doit passer par une main humaine. Un test qui se
// contenterait de compter laisserait un quatrième vert entrer en silence.
const verts = tousLesOutils.filter((n) => anneauDe(n) === 'vert').sort();
verdicts.troisVerts = verts.join(',') ===
  'proposer_enrichissement_idee,proposer_idee,proposer_page_journal';

// Le critère « visible » et le critère « client », tenus par construction :
// aucun vert dans RIVEN (un client est au bout), aucun dans NICOL BOLAS (une
// erreur de montant ne se voit pas).
verdicts.aucunVertDansRiven =
  OUTILS_PAR_QUADRANT.riven.every((o) => anneauDe(o.name) === 'orange');
verdicts.aucunVertDansBcp = OUTILS_PAR_QUADRANT.bcp.length === 0;

// ---------- 3. B1-c · sans anneau reconnu → ORANGE ----------
verdicts.defautEstOrange = ANNEAU_PAR_DEFAUT === 'orange' &&
  !ANNEAUX.includes('rouge');
verdicts.normalisationFailClosed =
  normaliserAnneau('vert') === 'vert' &&
  normaliserAnneau('orange') === 'orange' &&
  // Aucune correction silencieuse : la casse compte, comme pour les enums.
  normaliserAnneau('VERT') === 'orange' &&
  normaliserAnneau('Vert') === 'orange' &&
  normaliserAnneau(' vert') === 'orange' &&
  normaliserAnneau('rouge') === 'orange' &&
  normaliserAnneau(undefined) === 'orange' &&
  normaliserAnneau(null) === 'orange' &&
  normaliserAnneau(0) === 'orange' &&
  normaliserAnneau(['vert']) === 'orange' &&
  normaliserAnneau({ anneau: 'vert' }) === 'orange';
// Un outil inconnu, et une clé héritée d'Object.prototype, sont orange.
verdicts.inconnuEstOrange = anneauDe('proposer_nimporte_quoi') === 'orange' &&
  anneauDe('constructor') === 'orange' && anneauDe('toString') === 'orange' &&
  anneauDe('__proto__') === 'orange' && anneauDe(undefined) === 'orange' &&
  anneauDe(42) === 'orange';

// ---------- 4. L'anneau voyage AVEC le verdict (chemin vivant) ----------
const vertValide = validerProposition('proposer_idee',
  { titre: 'Une idée dictée' }, 'adramelech');
const orangeValide = validerProposition('proposer_journal',
  { cible_ref: 'SOLA', texte: 'Rappelé ce matin.' }, 'riven');
verdicts.verdictPorteLAnneau = vertValide.ok && vertValide.anneau === 'vert' &&
  orangeValide.ok && orangeValide.anneau === 'orange';
// ⚠️ Et il ne se glisse pas dans la proposition : c'est elle que la route
// recopie vers le client, et l'anneau est une affaire de serveur.
verdicts.anneauResteServeur =
  Object.keys(vertValide.proposition).sort().join(',') === 'args,outil';

// ---------- 5. B1-b · un ORANGE refuse, même appelé comme un vert ----------
const refusOrange = autoriserEcriture('proposer_journal',
  { cible_ref: 'SOLA', texte: 'Rappelé ce matin.' }, 'riven');
verdicts.orangeRefuse = refusOrange.ok === false &&
  refusOrange.anneau === 'orange' &&
  refusOrange.motif === 'validation de Paul requise';
// La proposition était PARFAITE par ailleurs : c'est bien l'anneau qui a
// refusé, pas la validation. Sans cette ligne, le refus pourrait venir d'un
// argument mal formé et le test passerait pour la mauvaise raison.
verdicts.orangeEtaitValide = orangeValide.ok === true;

const accordVert = autoriserEcriture('proposer_idee',
  { titre: 'Une idée dictée', resume: 'Son résumé.' }, 'adramelech');
verdicts.vertAutorise = accordVert.ok === true && accordVert.anneau === 'vert' &&
  accordVert.proposition.outil === 'proposer_idee' &&
  accordVert.proposition.args.titre === 'Une idée dictée';

// ---------- 6. La garde ne croit pas son appelant ----------
// Elle refait le chemin complet. Un vert mal formé, hors quadrant, ou porteur
// d'un champ surnuméraire est refusé AVANT que l'anneau n'entre en jeu.
verdicts.gardeRefaitLeChemin =
  autoriserEcriture('proposer_idee', { titre: '' }, 'adramelech').ok === false &&
  autoriserEcriture('proposer_idee', { titre: 'x' }, 'imladrik').ok === false &&
  autoriserEcriture('proposer_idee',
    { titre: 'x', surnumeraire: 'y' }, 'adramelech').ok === false &&
  autoriserEcriture('proposer_idee',
    { titre: 'x'.repeat(120) }, 'adramelech').ok === false &&
  autoriserEcriture('proposer_nimporte_quoi', { titre: 'x' }, 'adramelech').ok === false;
// Un refus de forme ne se déguise pas en refus d'anneau, et l'inverse non plus.
verdicts.motifsDistincts =
  autoriserEcriture('proposer_idee', { titre: '' }, 'adramelech').motif ===
    'proposition invalide' &&
  refusOrange.motif === 'validation de Paul requise';

// ---------- 7. M1 · AUCUNE seconde liste d'anneaux ailleurs ----------
// ⛔ Le risque que ce contrôle garde : un futur fichier qui déclare
// `const VERTS = ['proposer_idee', …]` pour « aller plus vite ». Deux vérités
// sur le même outil, et le jour où elles divergent on croit la mauvaise.
// Il cherche une AFFECTATION de tableau à un nom parlant d'anneau ou de vert,
// hors du catalogue lui-même et hors des tests.
const dossiers = ['api', 'api/_lib', 'js'];
const motifListe = /(?:const|let|var)\s+[A-Za-z_$][\w$]*(?:VERT|Vert|vert|ANNEAU|Anneau|anneau)[\w$]*\s*=\s*\[/;
let secondesListes = [];
for (const d of dossiers) {
  for (const f of readdirSync(new URL('../' + d + '/', import.meta.url))) {
    if (!/\.(?:js|mjs)$/.test(f)) continue;
    if (d === 'api/_lib' && f === 'leo.js') continue; // le catalogue, source unique
    const texte = readFileSync(new URL('../' + d + '/' + f, import.meta.url), 'utf8');
    if (motifListe.test(texte)) secondesListes.push(d + '/' + f);
  }
}
verdicts.pasDeSecondeListe = secondesListes.length === 0;
// Verrou de non-vacuité du contrôle lui-même : il a bien LU des fichiers.
// Sans lui, un chemin faux rendrait « aucune seconde liste » sur zéro lecture.
let fichiersLus = 0;
for (const d of dossiers) {
  fichiersLus += readdirSync(new URL('../' + d + '/', import.meta.url))
    .filter((f) => /\.(?:js|mjs)$/.test(f)).length;
}
verdicts.controleListeNonVide = fichiersLus > 20;
// Et la SEULE déclaration de ce genre, dans le catalogue, est bien la nôtre.
verdicts.uneSeuleDeclaration =
  (source.match(/export const ANNEAUX\s*=\s*\[/g) || []).length === 1;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
if (secondesListes.length) console.error('Secondes listes :', secondesListes.join(', '));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LEO-ANNEAU OK' : 'UNIT-LEO-ANNEAU ECHEC');
process.exit(ok ? 0 : 1);
