// L'ANNEAU de Léo (B1 ①②, cadrage §12 du 2026-09-29) — Node pur, zéro réseau.
//
// Ce que ce harnais PROUVE, et rien d'autre : le mécanisme SAIT REFUSER avant
// de savoir agir. Il ne prouve pas que Léo écrit — l'exécution est l'étape ④
// de B1, elle n'existe pas encore, et le dire ici évite qu'un vert soit lu
// comme « c'est branché ».
//
// Critères de sortie du §12.3 couverts : B1-b (un orange refuse même appelé
// comme un vert) et B1-c (un outil sans anneau reconnu est orange).
import { readFileSync, readdirSync } from 'node:fs';
import {
  ANNEAUX,
  ANNEAU_PAR_DEFAUT,
  normaliserAnneau,
  anneauDe,
  decisionAnneau,
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
// Dédoublonné : AMATSU (18/10/2026) est servi à TROIS quadrants, c'est UN outil.
const tousLesOutils = [...new Set(Object.values(OUTILS_PAR_QUADRANT).flat().map((o) => o.name))];
// ONZE depuis le 18/10 : dix + AMATSU, le dragon de l'air.
verdicts.nonVacuite = tousLesOutils.length === 11 &&
  Object.keys(OUTILS_PAR_QUADRANT).length === 4;

// ---------- 1. Chaque outil porte un anneau EXPLICITE et reconnu ----------
// Le défaut orange rattrape un champ manquant à l'exécution ; il ne dispense
// pas de l'écrire. Un outil sans anneau est un oubli, pas un choix.
verdicts.anneauExplicitePartout = tousLesOutils.length ===
  (source.match(/^\s+anneau: '(?:vert|orange)',$/gm) || []).length;
verdicts.anneauReconnuPartout = tousLesOutils.every((n) => ANNEAUX.includes(anneauDe(n)));

// ---------- 2. LA TAILLE DU VERT, mesurée et nommée ----------
// ⛔ La liste attendue est écrite ici EXPRÈS, nom par nom : c'est le seul
// endroit où une extension de l'anneau vert doit passer par une main humaine.
// Un test qui se contenterait de compter laisserait un onzième vert entrer en
// silence — et c'est précisément ce que le critère de Paul rend possible,
// puisque le périmètre par défaut est large.
const verts = tousLesOutils.filter((n) => anneauDe(n) === 'vert').sort();
// ⛔ NEUF depuis le 02/10 : l'enrichissement est repassé orange (choix ① de
// Paul, cadrage §15.2) — il n'a pas de défaire sans contenu conservé.
// ⛔ DIX depuis le 18/10 : AMATSU, le dragon de l'air — une lecture s'ajoute et
// se défait par sa suppression (CADRAGE-IMLADRIK.md §12 ; décision de Paul :
// forme C, la voix de Léo d'abord). C'est ici, nom par nom, qu'elle entre.
verdicts.lesDixVerts = verts.join(',') === [
  'proposer_besoin', 'proposer_flamme',
  'proposer_idee', 'proposer_journal', 'proposer_lecture_amatsu',
  'proposer_page_journal', 'proposer_relance', 'proposer_scenario',
  'proposer_serment', 'proposer_situation'
].join(',');

// NICOL BOLAS reste sans outil — non par interdit d'anneau, mais parce
// qu'aucune API de données ne lui est branchée. Un vert y serait une écriture
// financière, et une erreur de montant ne se VOIT pas : elle se découvre au
// tiers provisionnel. Le jour où le quadrant reçoit des outils, ils
// s'instruisent un par un.
verdicts.aucunOutilDansBcp = OUTILS_PAR_QUADRANT.bcp.length === 0;

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
const autreValide = validerProposition('proposer_journal',
  { cible_ref: 'SOLA', texte: 'Rappelé ce matin.' }, 'riven');
verdicts.verdictPorteLAnneau = vertValide.ok && vertValide.anneau === 'vert' &&
  autreValide.ok && autreValide.anneau === 'vert';
// ⚠️ Et il ne se glisse pas dans la proposition : c'est elle que la route
// recopie vers le client, et l'anneau est une affaire de serveur.
verdicts.anneauResteServeur =
  Object.keys(vertValide.proposition).sort().join(',') === 'args,outil';

// ---------- 5. B1-b · un ORANGE refuse ----------
// ⛔ DEPUIS LE 29/09, AUCUN OUTIL DU CATALOGUE N'EST ORANGE. Éprouver ce
// contrôle sur un outil du catalogue serait donc VERT PAR VACUITÉ — la façon
// exacte dont un garde-fou cesse de garder sans que personne ne le voie.
// C'est pour ça que la décision est une fonction PURE : elle reste éprouvable
// quand plus aucune donnée ne l'exerce.
const refusOrange = decisionAnneau('orange');
verdicts.orangeRefuse = refusOrange.ok === false &&
  refusOrange.anneau === 'orange' &&
  refusOrange.motif === 'validation de Paul requise';
// Et l'accord, du même côté pur — les deux branches, pas une seule.
verdicts.vertAutorisePur = decisionAnneau('vert').ok === true &&
  decisionAnneau('vert').anneau === 'vert';
// ⛔ Le fail-closed de la décision : tout ce qui n'est pas RECONNU refuse.
verdicts.decisionFailClosed = [undefined, null, 'VERT', ' vert', 'rouge', 0, {}]
  .every((v) => decisionAnneau(v).ok === false && decisionAnneau(v).anneau === 'orange');
// ⚠️ LE VERROU DE NON-VACUITÉ DU BLOC : si un outil orange réapparaît un jour
// au catalogue, il DOIT être refusé par la vraie porte, pas seulement par la
// fonction pure. Tant qu'il n'y en a pas, on le dit au lieu de se taire.
const oranges = tousLesOutils.filter((n) => anneauDe(n) === 'orange');
verdicts.orangeParLaVraiePorte = oranges.length === 0 ||
  oranges.every((n) => autoriserEcriture(n, {}, 'riven').ok === false);

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

// ---------- 8. LE CRITÈRE DE PAUL, tenu par le CODE et pas par une note ----
// ⛔ « Toute action destructrice ou de régression doit être approuvée par
// moi » (Paul, 29/09). Les dix outils sont verts parce qu'aucun ne détruit —
// c'est une MESURE, pas une opinion, et elle doit rester vraie demain.
// Ce contrôle est ce qui empêche un futur outil destructeur d'être vert.
const planSource = readFileSync(new URL('../js/leo-accueil.js', import.meta.url), 'utf8');
const methodes = (planSource.match(/methode: '[A-Z]+'/g) || [])
  .map((m) => m.slice(10, -1));

// ⛔ VERROU DE NON-VACUITÉ, et il se lit AVANT la ligne suivante : sur zéro
// occurrence, « aucune méthode destructrice » est vrai et ne prouve rien.
// Au 29/09 : 10 (9 POST + 1 PATCH), un par outil.
verdicts.planNonVide = methodes.length >= 10;
verdicts.aucuneMethodeDestructrice =
  methodes.every((m) => m === 'POST' || m === 'PATCH');

// ⚠️ Le MIROIR, qui compte autant : un outil vert dont aucun plan n'exécute
// rien serait vert sur du vide. Chaque vert doit être nommé dans le plan.
verdicts.chaqueVertAUnPlan = verts.every((n) => planSource.includes(n));

// ⛔ Et le principe fondateur qui rend tout cela possible : AUCUN outil de
// suppression, jamais. Il est déjà tenu par unit-leo-mains ; il est rappelé
// ici parce qu'il n'est plus une précaution parmi d'autres — il est la RAISON
// pour laquelle les dix peuvent être verts. Le jour où il tombe, l'anneau
// vert entier est à réinstruire.
verdicts.zeroOutilDeSuppression = tousLesOutils
  .every((n) => !/suppr|delete|retir|efface|remplac/i.test(n));

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
if (secondesListes.length) console.error('Secondes listes :', secondesListes.join(', '));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LEO-ANNEAU OK' : 'UNIT-LEO-ANNEAU ECHEC');
process.exit(ok ? 0 : 1);
