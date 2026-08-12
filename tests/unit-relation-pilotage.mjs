// Unitaires RIVEN — piloter une relation, et la corriger sans la détruire.
// Node pur, zéro réseau, zéro navigateur.
//
// Ces trois champs — interet_qualitatif, effort_temps, effort_energie — vivent
// en base depuis la migration 0003 et étaient validés par l'API depuis le
// 2026-07-03, atteignables depuis AUCUN écran. Ce harnais fixe leur contrat
// avant que le front ne s'appuie dessus.
//
// Il verrouille aussi le dégel du `type` (2026-08-12) : modifiable, mais par
// le MÊME contrôle qu'à la création — et surtout, source_id et target_id
// restent FIGÉS. C'est le pre-mortem P2 de CADRAGE-RIVEN-PILOTAGE.md.
import { validateEdge, validateRattachement } from '../api/_lib/validate.js';

const verdicts = {};
const UUID_A = '11111111-2222-4333-8444-555555555555';
const UUID_B = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

// ---------------------------------------------------------------------------
// A. Le pilotage est atteignable — à la création comme en correction
// ---------------------------------------------------------------------------

const creation = validateEdge({
  source_id: UUID_A,
  target_id: UUID_B,
  type: 'apport_affaires',
  interet_qualitatif: 'Deux copropriétés à lui confier avant septembre.',
  effort_temps: 2,
  effort_energie: 4,
}, 'create');
verdicts.pilotageALaCreation = !creation.error &&
  creation.value.interet_qualitatif === 'Deux copropriétés à lui confier avant septembre.' &&
  creation.value.effort_temps === 2 &&
  creation.value.effort_energie === 4;

const majPilotage = validateEdge({
  interet_qualitatif: 'Revu à la baisse : il ne prend plus de neuf.',
  effort_temps: 5,
  effort_energie: 1,
}, 'update');
verdicts.pilotageEnCorrection = !majPilotage.error &&
  majPilotage.value.effort_temps === 5 &&
  majPilotage.value.effort_energie === 1;

// Les bornes 1–5, aux quatre coins. Une saisie hors bornes est une ERREUR
// STRUCTURÉE (→ 400), jamais une exception (→ 500).
verdicts.effortBorneBasse = !validateEdge({ effort_temps: 1 }, 'update').error;
verdicts.effortBorneHaute = !validateEdge({ effort_energie: 5 }, 'update').error;
verdicts.effortZeroRefuse = !!validateEdge({ effort_temps: 0 }, 'update').error;
verdicts.effortSixRefuse = !!validateEdge({ effort_energie: 6 }, 'update').error;
verdicts.effortTexteRefuse = !!validateEdge({ effort_temps: 'beaucoup' }, 'update').error;
verdicts.effortDecimalRefuse = !!validateEdge({ effort_temps: 2.5 }, 'update').error;

// L'intérêt qualitatif est un texte libre borné (2000, miroir du CHECK SQL).
verdicts.interetLongRefuse = !!validateEdge(
  { interet_qualitatif: 'x'.repeat(2001) }, 'update').error;
verdicts.interetALaBorne = !validateEdge(
  { interet_qualitatif: 'x'.repeat(2000) }, 'update').error;

// ---------------------------------------------------------------------------
// B. Corriger sans détruire — le type dégèle, l'identité non
// ---------------------------------------------------------------------------

const majType = validateEdge({ type: 'sous_traitance' }, 'update');
verdicts.typeModifiable = !majType.error && majType.value.type === 'sous_traitance';

// Dégeler le type n'élargit PAS ce qu'on peut écrire : même liste blanche.
verdicts.typeInvalideRefuseEnUpdate = !!validateEdge({ type: 'amitié' }, 'update').error;
verdicts.typeInvalideRefuseEnCreate = !!validateEdge({
  source_id: UUID_A, target_id: UUID_B, type: 'amitié',
}, 'create').error;

// LE point du pre-mortem P2 : la source et la cible DÉFINISSENT la relation.
// En changer une ne corrigerait pas cet objet, elle en désignerait un autre —
// et le journal qui lui est adossé deviendrait un faux témoignage.
verdicts.sourceTOUJOURSFigee = !!validateEdge({ source_id: UUID_B }, 'update').error;
verdicts.cibleTOUJOURSFigee = !!validateEdge({ target_id: UUID_A }, 'update').error;

// Corriger la note d'une relation, sans rien envoyer d'autre : le PATCH ne
// porte QUE ce champ — donc statut et raison d'arrêt ne peuvent pas être
// écrasés par une correction de note (pre-mortem P1, versant API).
const majNote = validateEdge({ notes: 'Lot plomberie, pas menuiserie.' }, 'update');
verdicts.noteSeuleNEcrasePas = !majNote.error &&
  Object.keys(majNote.value).length === 1 &&
  majNote.value.notes === 'Lot plomberie, pas menuiserie.';

// La contrainte d'arrêt tient toujours : un arrêt exige sa raison.
verdicts.arretSansRaisonRefuse = !!validateEdge({ statut: 'arrete' }, 'update').error;
verdicts.arretAvecRaisonAccepte = !validateEdge(
  { statut: 'arrete', raison_arret: 'Plus de disponibilité.' }, 'update').error;

// Un PATCH vide reste refusé — on ne fabrique pas d'écriture sans contenu.
verdicts.patchVideRefuse = !!validateEdge({}, 'update').error;

// ---------------------------------------------------------------------------
// C. Le rôle d'un rattachement se corrige, l'attache ne bouge pas
// ---------------------------------------------------------------------------

const majRole = validateRattachement({ role: 'conducteur de travaux' }, 'update');
verdicts.roleModifiable = !majRole.error && majRole.value.role === 'conducteur de travaux';

// Vider le rôle est un geste légitime (« je ne sais plus ce qu'il y fait »).
verdicts.roleVidable = !validateRattachement({ role: null }, 'update').error;

// La personne et la fiche sont l'IDENTITÉ du lien : figées, comme source/cible.
verdicts.personneFigee = !!validateRattachement({ personne_id: UUID_A }, 'update').error;
verdicts.noeudFige = !!validateRattachement({ node_id: UUID_B }, 'update').error;

// ---------------------------------------------------------------------------

let rouge = false;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '✅' : '❌'} ${nom}`);
  if (!ok) { rouge = true; }
}
if (rouge) { process.exit(1); }
