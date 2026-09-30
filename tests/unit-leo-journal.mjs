// LE JOURNAL DES ÉCRITURES + LE PLAFOND DE VOLUME — B1 ③ (cadrage §12.6).
// Node pur, zéro réseau, zéro base : c'est tout l'intérêt de fonctions pures,
// elles s'éprouvent AVANT que la migration ne soit appliquée (gate de Paul).
//
// ⛔ Ce que ce harnais NE prouve pas : que Léo journalise. Rien n'insère —
// l'exécution est l'étape ④. Il prouve que l'entrée ne PEUT pas porter de
// contenu dicté, et que le plafond refuse du bon côté.
import { readFileSync } from 'node:fs';
import {
  PHASES, MAX_MOTIF,
  construireEntreeJournal,
  creerPlafondEcritures,
  PLAFOND_PAR_DEFAUT
} from '../api/_lib/leo-journal.js';

const verdicts = {};
const UUID = '3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607';
const AUTRE = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const base = { traceId: UUID, outil: 'proposer_idee', quadrant: 'adramelech', phase: 'tentee' };

// ---------- 0. LA DOUBLE VÉRITÉ SQL ⇄ JS, tenue par un contrôle ----------
// `PHASES` est doublée dans la contrainte `check (phase in (…))` de la
// migration : une contrainte SQL ne s'importe pas. Sans ce contrôle, le code
// écrirait un jour une phase que la base refuse, et l'insertion échouerait en
// SILENCE. C'est le défaut réellement payé sur RenoDevis le 15/09.
const migration = readFileSync(
  new URL('../supabase/migrations/20260929220000_leo_ecritures.sql', import.meta.url), 'utf8');
const phasesSql = (migration.match(/check \(phase in \(([^)]*)\)\)/) || [, ''])[1]
  .split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
// ⛔ Verrou de non-vacuité : sur une regex qui ne matche pas, les deux listes
// « coïncident » à vide et le contrôle est vert sans avoir rien lu.
verdicts.phasesSqlLues = phasesSql.length === 4;
verdicts.phasesCoincident = phasesSql.slice().sort().join(',') === PHASES.slice().sort().join(',');

// ---------- 1. La migration tient ses promesses de structure ----------
// Elle n'est pas appliquée : ce qu'on peut prouver, c'est ce qu'elle DIT.
verdicts.migrationAppendOnly =
  !/create policy \w*_update/.test(migration) &&
  !/create policy \w*_delete/.test(migration) &&
  /revoke update, delete, truncate/.test(migration);
verdicts.migrationRlsActive = /enable row level security/.test(migration);
// ⛔ AUCUNE colonne de texte libre susceptible de porter du contenu dicté.
// `motif` est le seul champ texte non borné par nature — et il est borné à 200.
verdicts.migrationSansColonneDeContenu =
  !/\b(texte|contenu|libelle|titre|note|resume|corps)\b\s+text/.test(migration) &&
  /char_length\(motif\) <= 200/.test(migration);

// ---------- 2. L'entrée nominale ----------
const ok = construireEntreeJournal(base);
verdicts.entreeNominale = ok.ok === true &&
  ok.entree.trace_id === UUID && ok.entree.outil === 'proposer_idee' &&
  ok.entree.phase === 'tentee' && ok.entree.cible_id === null && ok.entree.motif === null;
// ⛔ L'ANNEAU EST DÉRIVÉ DU CATALOGUE — et ce contrôle a été REFAIT le 29/09
// parce que le premier ne prouvait pas ce qu'il annonçait. Il disait « lu, pas
// reçu » en vérifiant qu'une clé `anneau` fait refuser l'entrée : or ça, c'est
// `clesFermees` qui le tient. Un sabotage rendant l'anneau RECEVABLE
// (`brut.anneau || anneauDe(outil)`) laissait donc le harnais VERT — il était
// neutre, la clé étant refusée en amont, mais le contrôle prétendait plus
// qu'il ne prouvait. Un test vert par le mauvais chemin est pire qu'un test
// absent : on le cite en revue en croyant qu'il garde.
//
// Ce qui le prouve vraiment : l'anneau SUIT l'outil, y compris pour un outil
// que le catalogue ne connaît pas (défaut orange).
verdicts.anneauSuitLOutil = ok.entree.anneau === 'vert' &&
  construireEntreeJournal({ ...base, outil: 'proposer_inconnu' }).entree.anneau === 'orange';
// ⛔ ET LE GARDE-FOU RÉEL : `anneau` ne doit JAMAIS entrer dans les clés
// acceptées. C'est la seule porte par laquelle un appelant pourrait dicter le
// régime, et c'est elle qu'il faut fermer — pas commenter.
verdicts.anneauHorsDesClesAcceptees =
  construireEntreeJournal({ ...base, anneau: 'orange' }).ok === false &&
  !readFileSync(new URL('../api/_lib/leo-journal.js', import.meta.url), 'utf8')
    .match(/const CLES = \[[^\]]*'anneau'/);

// ---------- 3. ⛔ AUCUN CONTENU DICTÉ NE PEUT ENTRER ----------
// La liste fermée des clés est ce qui empêche un `texte` de se glisser ici le
// jour où quelqu'un trouvera ça pratique.
verdicts.clesFermees = [
  'texte', 'titre', 'contenu', 'resume', 'note', 'libelle', 'args'
].every((cle) => construireEntreeJournal({ ...base, [cle]: 'du contenu' }).ok === false);

// ⛔ La cible est un UUID ou rien. C'est le contrôle de FORME qui tient la
// promesse, pas la politesse de l'appelant.
verdicts.cibleUuidSeulement =
  construireEntreeJournal({ ...base, cibleId: UUID }).entree.cible_id === UUID &&
  construireEntreeJournal({ ...base, cibleId: 'Racheter le local de Villeurbanne' }).ok === false &&
  construireEntreeJournal({ ...base, cibleId: 'ADR-12' }).ok === false &&
  construireEntreeJournal({ ...base, cibleId: '' }).ok === false;

// ⛔ LE MOTIF SE REFUSE, IL NE SE TRONQUE PAS — une troncature laisserait
// entrer les 200 premiers caractères d'une page de journal intime.
const echec = { ...base, phase: 'echouee' };
verdicts.motifRefuseAuDela =
  construireEntreeJournal({ ...echec, motif: 'statut 500' }).entree.motif === 'statut 500' &&
  construireEntreeJournal({ ...echec, motif: 'x'.repeat(MAX_MOTIF) }).ok === true &&
  construireEntreeJournal({ ...echec, motif: 'x'.repeat(MAX_MOTIF + 1) }).ok === false;
// Un motif n'a de sens que sur un échec : ailleurs il ne porterait que du récit.
verdicts.motifSeulementSurEchec =
  construireEntreeJournal({ ...base, motif: 'statut 500' }).ok === false;

// ---------- 4. Le fail-closed du reste ----------
verdicts.failClosed =
  construireEntreeJournal(null).ok === false &&
  construireEntreeJournal([]).ok === false &&
  construireEntreeJournal({ ...base, traceId: 'pas-un-uuid' }).ok === false &&
  construireEntreeJournal({ ...base, phase: 'Tentee' }).ok === false &&
  construireEntreeJournal({ ...base, phase: 'inventee' }).ok === false &&
  construireEntreeJournal({ ...base, outil: '' }).ok === false &&
  construireEntreeJournal({ ...base, outil: 'x'.repeat(81) }).ok === false &&
  construireEntreeJournal({ ...base, quadrant: 'x'.repeat(41) }).ok === false;
// Les quatre phases passent — sinon « fail-closed » voudrait dire « refuse tout ».
verdicts.lesQuatrePhasesPassent = PHASES.every((p) =>
  construireEntreeJournal({ ...base, phase: p }).ok === true);

// ---------- 5. LE PLAFOND, éprouvé des DEUX côtés ----------
const maintenant = Date.parse('2026-09-29T22:00:00Z');
const ilYa = (min) => maintenant - min * 60_000;
const plafond = creerPlafondEcritures(3, 60 * 60 * 1000);

verdicts.plafondLaissePasser =
  plafond([ilYa(10), ilYa(20)], maintenant).ok === true &&
  plafond([ilYa(10), ilYa(20)], maintenant).restant === 1;
verdicts.plafondRefuse =
  plafond([ilYa(5), ilYa(10), ilYa(20)], maintenant).ok === false &&
  plafond([ilYa(5), ilYa(10), ilYa(20)], maintenant).restant === 0;
// La FENÊTRE glisse : ce qui est vieux ne compte plus.
verdicts.fenetreGlisse =
  plafond([ilYa(61), ilYa(120), ilYa(999)], maintenant).ok === true &&
  plafond([ilYa(61), ilYa(120), ilYa(999)], maintenant).restant === 3;
// Vide et absent : autorisés, et le restant est plein.
verdicts.plafondSurVide =
  plafond([], maintenant).restant === 3 && plafond(undefined, maintenant).restant === 3;

// ⛔ UN HORODATAGE ILLISIBLE EST COMPTÉ COMME RÉCENT. L'écarter ferait baisser
// le compte, donc DESSERRERAIT le plafond : le repli va vers le plus contraint.
verdicts.illisibleCompteContre =
  plafond(['pas une date', null, {}], maintenant).ok === false;

// ⛔ UN PLAFOND MAL CONFIGURÉ NE DOIT PAS OUVRIR LA PORTE. `NaN`, 0, négatif,
// undefined → on retombe sur le défaut, jamais sur l'infini.
verdicts.configAbsurdeNeDesserrePas = [NaN, 0, -5, undefined, null, 'quarante']
  .every((v) => {
    const p = creerPlafondEcritures(v, 60 * 60 * 1000);
    const trop = Array.from({ length: PLAFOND_PAR_DEFAUT }, () => ilYa(1));
    return p([], maintenant).restant === PLAFOND_PAR_DEFAUT &&
      p(trop, maintenant).ok === false;
  });
verdicts.fenetreAbsurdeNeDesserrePas = [NaN, 0, -1, 'une heure']
  .every((v) => creerPlafondEcritures(3, v)([ilYa(5), ilYa(10), ilYa(20)], maintenant).ok === false);

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const tout = Object.values(verdicts).every((v) => v === true);
console.log(tout ? 'UNIT-LEO-JOURNAL OK' : 'UNIT-LEO-JOURNAL ECHEC');
process.exit(tout ? 0 : 1);
