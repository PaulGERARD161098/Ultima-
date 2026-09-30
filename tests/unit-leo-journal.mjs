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
  ouvrirTrace,
  MOTIF_OPERATION_ID,
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

// ---------- 9. LA CLÉ PARTAGÉE (arbitrage de Paul, 30/09) ----------
// ⛔ Ce qui empêche les deux registres de diverger n'est pas une bonne
// intention, c'est l'égalité `leo_ecritures.trace_id === leo_operations
// .operation_id`. Ces contrôles gardent l'égalité et sa source UNIQUE.
const UUID_EPROUVE = '7c9e1f2a-3b4c-4d5e-8f60-a1b2c3d4e5f6';
const t = ouvrirTrace(UUID_EPROUVE);
verdicts.laCleEstLaMeme = t.ok === true &&
  t.traceId === UUID_EPROUVE && t.operationId === t.traceId;

// ⛔ DOUBLE VÉRITÉ GARDÉE : le motif d'`operation_id` vit AUSSI en contrainte
// SQL — une contrainte ne s'importe pas. Sans ce contrôle, le code
// fabriquerait un jour une clé que la base refuse, et l'opération serait
// écrite sans journal : la divergence même qu'on évite.
const releve = readFileSync(new URL(
  '../supabase/migrations/20260929125105_leo_lv1_registre_transactionnel.RELEVE.sql',
  import.meta.url), 'utf8');
const motifSql = (releve.match(/operation_id ~ '([^']+)'/) || [, ''])[1];
// Verrou de non-vacuité : sur une regex qui ne matche pas, « les deux
// coïncident » serait vrai à vide.
verdicts.motifSqlLu = motifSql.length > 20;
verdicts.motifsCoincident = motifSql === MOTIF_OPERATION_ID.source;

// ⛔ FAIL-CLOSED : on ne rend jamais une paire qu'un des deux registres
// refuserait. Une clé acceptée ici mais rejetée par la base produirait une
// opération orpheline.
// ⚠️ Un argument FOURNI mais absurde doit être REFUSÉ, jamais rattrapé par une
// génération. C'est ce contrôle qui a trouvé la correction silencieuse du
// 30/09 : `''`, `null` et `42` rendaient une trace valide.
verdicts.cleFailClosed = [
  '', '   ', 'pas-un-uuid', 'ADR-12', undefined, null, 42, {},
  '-7c9e1f2a-3b4c-4d5e-8f60-a1b2c3d4e5f6',   // tiret initial : refusé en base
  'x'.repeat(129)
].every((v) => ouvrirTrace(v).ok === false);

// ⛔ ET LE MIROIR, sans lequel « fail-closed » voudrait dire « refuse tout » :
// l'appel SANS argument est l'usage normal — on n'a pas d'identifiant, on en
// fabrique un — et il doit rendre une paire utilisable.
const sansArgument = ouvrirTrace();
verdicts.sansArgumentGenere = sansArgument.ok === true &&
  sansArgument.traceId === sansArgument.operationId &&
  MOTIF_OPERATION_ID.test(sansArgument.traceId) &&
  construireEntreeJournal({ ...base, traceId: sansArgument.traceId }).ok === true;
// Deux ouvertures ne partagent pas leur clé : sinon deux écritures
// différentes se confondraient dans les deux registres.
verdicts.deuxTracesDifferent = ouvrirTrace().traceId !== ouvrirTrace().traceId;

// ⚠️ ET LE MIROIR : un UUID valide DOIT passer les deux motifs. Sans lui,
// « fail-closed » pourrait vouloir dire « refuse tout », et la clé ne
// servirait jamais.
verdicts.unUuidPasseLesDeuxMotifs =
  MOTIF_OPERATION_ID.test(UUID_EPROUVE) &&
  ouvrirTrace('00000000-0000-4000-8000-000000000000').ok === true &&
  ouvrirTrace('3F2A1B4C-5D6E-4F70-8A91-B2C3D4E5F607').ok === true;

// L'entrée de journal accepte bien la clé que `ouvrirTrace` fabrique : les
// deux bouts du dispositif se parlent.
verdicts.laCleEntreDansLeJournal =
  construireEntreeJournal({ ...base, traceId: t.traceId }).entree.trace_id === t.operationId;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const tout = Object.values(verdicts).every((v) => v === true);
console.log(tout ? 'UNIT-LEO-JOURNAL OK' : 'UNIT-LEO-JOURNAL ECHEC');
process.exit(tout ? 0 : 1);
