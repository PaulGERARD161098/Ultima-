// Unitaires des mains de Léo (boucle L2b) — Node pur, zéro réseau.
// Prouve : le catalogue d'outils par quadrant (bcp/imladrik vides → null),
// la validation fail-closed des propositions du modèle (outil inconnu ou hors
// quadrant, bornes, requis, surnuméraires REJETÉS, dates réelles), la
// reformulation déterministe (le texte que la carte affiche), l'extraction du
// bloc tool_use, la résolution locale des références dictées (resoudreRef)
// et les gabarits d'exécution du front (corps EXACTS des API existantes).
import { readFileSync } from 'node:fs';
import {
  OUTILS_PAR_QUADRANT,
  outilsPour,
  validerProposition,
  reformulerProposition,
  extraireProposition
} from '../api/_lib/leo.js';

const verdicts = {};

// ---------- 0. Chargement du module front (IIFE) dans un window factice ----------
const fenetre = {};
const source = readFileSync(new URL('../js/leo-accueil.js', import.meta.url), 'utf8');
new Function('window', 'document', source)(fenetre, undefined);
const { resoudreRef, construirePlanExecution } = fenetre.UltimaLeo;
verdicts.frontExpose = typeof resoudreRef === 'function' &&
  typeof construirePlanExecution === 'function';

// ---------- 1. Catalogue par quadrant ----------
verdicts.catalogueTraveler = Array.isArray(outilsPour('traveler')) &&
  outilsPour('traveler').map((o) => o.name).sort().join(',') ===
  'proposer_besoin,proposer_journal,proposer_relance';
verdicts.catalogueAdramelech = Array.isArray(outilsPour('adramelech')) &&
  outilsPour('adramelech').map((o) => o.name).sort().join(',') ===
  'proposer_enrichissement_idee,proposer_idee';
// bcp/imladrik : catalogue VIDE → null (l'appel IA part sans le champ tools).
verdicts.catalogueVide = outilsPour('bcp') === null && outilsPour('imladrik') === null &&
  outilsPour('inconnu') === null && outilsPour(undefined) === null;
// Aucun outil de suppression, jamais (principe fondateur §0).
verdicts.zeroSuppression = Object.values(OUTILS_PAR_QUADRANT).every((liste) =>
  liste.every((o) => !/suppr|delete|retir|efface/i.test(o.name)));
// Schémas stricts : object, requis, bornes, additionalProperties: false.
verdicts.schemasStricts = ['traveler', 'adramelech'].every((q) =>
  outilsPour(q).every((o) =>
    o.input_schema.type === 'object' &&
    o.input_schema.additionalProperties === false &&
    Array.isArray(o.input_schema.required) && o.input_schema.required.length > 0 &&
    Object.values(o.input_schema.properties).every((p) =>
      p.type === 'string' && Number.isInteger(p.maxLength))));

// ---------- 2. validerProposition : portes fermées ----------
verdicts.outilInconnu = validerProposition('supprimer_idee', { id: 'x' }, 'adramelech').ok === false &&
  validerProposition('', {}, 'traveler').ok === false &&
  validerProposition(undefined, {}, 'traveler').ok === false;
// Pollution de prototype : un nom hérité d'Object n'est pas un outil.
verdicts.outilPrototype = validerProposition('toString', {}, 'traveler').ok === false;
verdicts.outilHorsQuadrant =
  validerProposition('proposer_idee', { titre: 'X' }, 'traveler').ok === false &&
  validerProposition('proposer_journal', { cible_ref: 'X', texte: 'Y' }, 'adramelech').ok === false &&
  validerProposition('proposer_journal', { cible_ref: 'X', texte: 'Y' }, 'bcp').ok === false;
verdicts.argsInvalides =
  validerProposition('proposer_idee', null, 'adramelech').ok === false &&
  validerProposition('proposer_idee', 'titre', 'adramelech').ok === false &&
  validerProposition('proposer_idee', ['titre'], 'adramelech').ok === false;
verdicts.champManquant =
  validerProposition('proposer_journal', { texte: 'sans cible' }, 'traveler').ok === false &&
  validerProposition('proposer_relance', { cible_ref: 'M. Lambert' }, 'traveler').ok === false;
verdicts.champVide =
  validerProposition('proposer_idee', { titre: '   ' }, 'adramelech').ok === false;
verdicts.champTropLong =
  validerProposition('proposer_idee', { titre: 'x'.repeat(161) }, 'adramelech').ok === false &&
  validerProposition('proposer_journal',
    { cible_ref: 'X', texte: 'x'.repeat(2001) }, 'traveler').ok === false;
verdicts.champNonString =
  validerProposition('proposer_idee', { titre: 42 }, 'adramelech').ok === false &&
  validerProposition('proposer_idee', { titre: ['X'] }, 'adramelech').ok === false;
// Champ surnuméraire : REJET total (pas de strip — un outil qui invente un
// champ est suspect).
verdicts.champSurnumeraire =
  validerProposition('proposer_idee', { titre: 'X', owner_id: 'u1' }, 'adramelech').ok === false &&
  validerProposition('proposer_journal',
    { cible_ref: 'X', texte: 'Y', node_id: 'u-u-u-u-u' }, 'traveler').ok === false;
verdicts.echeanceInvalide =
  validerProposition('proposer_relance',
    { cible_ref: 'X', echeance: '2026-13-40' }, 'traveler').ok === false &&
  validerProposition('proposer_relance',
    { cible_ref: 'X', echeance: '2026-02-30' }, 'traveler').ok === false &&
  validerProposition('proposer_relance',
    { cible_ref: 'X', echeance: 'demain' }, 'traveler').ok === false;

// ---------- 3. validerProposition : cas nominaux (args nettoyés) ----------
{
  const r = validerProposition('proposer_idee',
    { titre: '  MYCÉLIUM 2  ', theme: 'bâtiment', resume: 'Un réseau de chantiers.' },
    'adramelech');
  verdicts.nominalIdee = r.ok === true && r.proposition.outil === 'proposer_idee' &&
    r.proposition.args.titre === 'MYCÉLIUM 2' && r.proposition.args.theme === 'bâtiment';
}
{
  // Optionnel vide après trim : ignoré (jamais transmis), le requis tient.
  const r = validerProposition('proposer_besoin',
    { chantier_ref: 'Voltaire', libelle: 'Sacs de chaux', quantite: '  ' }, 'traveler');
  verdicts.nominalBesoin = r.ok === true && !('quantite' in r.proposition.args);
}
{
  const r = validerProposition('proposer_relance',
    { cible_ref: 'M. Lambert', echeance: '2026-08-01', note: 'Devis à relancer' }, 'traveler');
  verdicts.nominalRelance = r.ok === true && r.proposition.args.echeance === '2026-08-01';
}
{
  const r = validerProposition('proposer_enrichissement_idee',
    { idee_ref: 'ADR-3', ajout: 'Croiser avec PROTÉE.' }, 'adramelech');
  verdicts.nominalEnrichissement = r.ok === true && r.proposition.args.idee_ref === 'ADR-3';
}
verdicts.nominalJournal = validerProposition('proposer_journal',
  { cible_ref: 'Mme Nguyen', texte: 'Plans validés ce matin.' }, 'traveler').ok === true;

// ---------- 4. reformulerProposition : gabarits déterministes ----------
verdicts.reformulationIdee = reformulerProposition({
  outil: 'proposer_idee', args: { titre: 'MYCÉLIUM 2', theme: 'bâtiment' }
}) === "Créer l'idée « MYCÉLIUM 2 » (thème : bâtiment) dans l'archipel.";
verdicts.reformulationJournal = reformulerProposition({
  outil: 'proposer_journal', args: { cible_ref: 'Mme Nguyen', texte: 'Plans validés.' }
}) === 'Noter au journal de « Mme Nguyen » : « Plans validés. »';
verdicts.reformulationRelance = reformulerProposition({
  outil: 'proposer_relance', args: { cible_ref: 'M. Lambert', echeance: '2026-08-01' }
}) === 'Programmer une relance de « M. Lambert » pour le 01/08/2026.';
verdicts.reformulationBesoin = reformulerProposition({
  outil: 'proposer_besoin',
  args: { chantier_ref: 'Voltaire', libelle: 'Sacs de chaux', quantite: '12 sacs', echeance: '2026-07-25' }
}) === 'Ajouter le besoin « Sacs de chaux » (quantité : 12 sacs), pour le 25/07/2026 au chantier « Voltaire ».';
verdicts.reformulationEnrichissement = reformulerProposition({
  outil: 'proposer_enrichissement_idee', args: { idee_ref: 'ADR-3', ajout: 'Croiser avec PROTÉE.' }
}) === "Enrichir l'idée « ADR-3 » avec : « Croiser avec PROTÉE. »";
// Pas d'échappement HTML : la reformulation est du texte brut, restitué tel
// quel — la carte l'injecte via textContent (jamais innerHTML), donc un
// balisage hostile reste inerte à l'écran.
verdicts.reformulationSansInjection = reformulerProposition({
  outil: 'proposer_journal', args: { cible_ref: '<img src=x onerror=1>', texte: 'a' }
}).indexOf('<img src=x onerror=1>') !== -1;
verdicts.reformulationInconnue = reformulerProposition({ outil: 'autre', args: {} }) === '' &&
  reformulerProposition(null) === '';

// ---------- 5. extraireProposition ----------
{
  const bloc = { type: 'tool_use', id: 't1', name: 'proposer_journal', input: { cible_ref: 'X', texte: 'Y' } };
  verdicts.extraitProposition = extraireProposition([
    { type: 'text', text: 'Je te propose ceci.' },
    bloc,
    { type: 'tool_use', id: 't2', name: 'autre', input: {} }
  ]) === bloc;
  verdicts.extraitPropositionVide = extraireProposition([{ type: 'text', text: 'x' }]) === null &&
    extraireProposition([]) === null && extraireProposition(null) === null;
}

// ---------- 6. resoudreRef : résolution locale déterministe ----------
const CANDIDATS = [
  { id: 'a', libelle: 'M. Lambert' },
  { id: 'b', libelle: 'Mme Nguyen' },
  { id: 'c', libelle: 'Réhabilitation immeuble Voltaire' },
  { id: 'c', libelle: 'Voltaire' } // second libellé du MÊME id → un seul candidat
];
verdicts.refExacte = (() => {
  const r = resoudreRef('m. lambert', CANDIDATS);
  return r.ok === true && r.candidat.id === 'a';
})();
verdicts.refAccents = (() => {
  const r = resoudreRef('rehabilitation immeuble voltaire', CANDIDATS);
  return r.ok === true && r.candidat.id === 'c';
})();
verdicts.refInclusionUnique = (() => {
  const r = resoudreRef('nguyen', CANDIDATS);
  return r.ok === true && r.candidat.id === 'b';
})();
// « volta » inclut deux libellés du MÊME id : un seul candidat, résolu.
verdicts.refDoublonMemeId = (() => {
  const r = resoudreRef('volta', CANDIDATS);
  return r.ok === true && r.candidat.id === 'c';
})();
verdicts.refAmbigue = (() => {
  const r = resoudreRef('m', CANDIDATS); // « M. Lambert » et « Mme Nguyen »
  return r.ok === false && r.raison === 'ambigu';
})();
verdicts.refAbsente = (() => {
  const r = resoudreRef('Godefroy', CANDIDATS);
  return r.ok === false && r.raison === 'introuvable';
})();
verdicts.refVide = resoudreRef('', CANDIDATS).ok === false &&
  resoudreRef('x', null).ok === false && resoudreRef('x', []).ok === false;

// ---------- 7. Gabarits d'exécution : corps EXACTS des API existantes ----------
const CAND_RIVEN = {
  cibles: [{ id: 'n-1', libelle: 'M. Lambert' }],
  chantiers: [{ id: 'ch-1', libelle: 'Réhabilitation immeuble Voltaire' }]
};
verdicts.planJournal = (() => {
  const p = construirePlanExecution(
    { outil: 'proposer_journal', args: { cible_ref: 'lambert', texte: 'Appelé ce matin.' } },
    CAND_RIVEN);
  return p.ok === true && p.url === '/api/reseau/journal' && p.methode === 'POST' &&
    JSON.stringify(p.corps) === JSON.stringify({ node_id: 'n-1', note: 'Appelé ce matin.' });
})();
verdicts.planRelance = (() => {
  const p = construirePlanExecution(
    { outil: 'proposer_relance', args: { cible_ref: 'Lambert', echeance: '2026-08-01', note: 'Relancer le devis' } },
    CAND_RIVEN);
  // Contrat journal : une relance exige note + prochaine_etape + relance_at.
  return p.ok === true && p.corps.node_id === 'n-1' && p.corps.relance_at === '2026-08-01' &&
    p.corps.note === 'Relancer le devis' && p.corps.prochaine_etape === 'Relancer le devis';
})();
verdicts.planRelanceSansNote = (() => {
  const p = construirePlanExecution(
    { outil: 'proposer_relance', args: { cible_ref: 'Lambert', echeance: '2026-08-01' } },
    CAND_RIVEN);
  return p.ok === true && typeof p.corps.note === 'string' && p.corps.note.length > 0 &&
    typeof p.corps.prochaine_etape === 'string' && p.corps.prochaine_etape.length > 0;
})();
verdicts.planBesoinQuantite = (() => {
  const p = construirePlanExecution(
    { outil: 'proposer_besoin', args: { chantier_ref: 'Voltaire', libelle: 'Sacs de chaux', quantite: '12 sacs' } },
    CAND_RIVEN);
  return p.ok === true && p.url === '/api/intendant/besoins' &&
    p.corps.chantier_id === 'ch-1' && p.corps.designation === 'Sacs de chaux' &&
    p.corps.quantite === 12 && p.corps.unite === 'sacs';
})();
verdicts.planBesoinQuantiteIllisible = (() => {
  // Quantité non numérique : elle rejoint la désignation (jamais devinée).
  const p = construirePlanExecution(
    { outil: 'proposer_besoin', args: { chantier_ref: 'Voltaire', libelle: 'Chaux', quantite: 'quelques sacs' } },
    CAND_RIVEN);
  return p.ok === true && p.corps.designation === 'Chaux — quelques sacs' &&
    !('quantite' in p.corps);
})();
verdicts.planBesoinEcheance = (() => {
  // Pas de champ d'échéance côté API besoins : la date rejoint la désignation.
  const p = construirePlanExecution(
    { outil: 'proposer_besoin', args: { chantier_ref: 'Voltaire', libelle: 'Chaux', echeance: '2026-07-25' } },
    CAND_RIVEN);
  return p.ok === true && p.corps.designation === 'Chaux (pour le 25/07/2026)';
})();
verdicts.planIdee = (() => {
  const p = construirePlanExecution(
    { outil: 'proposer_idee', args: { titre: 'MYCÉLIUM 2', theme: 'bâtiment', resume: 'Un réseau.' } },
    { prochainAdrNum: 7 });
  return p.ok === true && p.url === '/api/idees/items' && p.methode === 'POST' &&
    p.corps.adr_num === 7 && p.corps.nom === 'MYCÉLIUM 2' && p.corps.type === 'capture' &&
    p.corps.theme === 'bâtiment' && p.corps.essence === 'Un réseau.';
})();
verdicts.planIdeeSansNumero = construirePlanExecution(
  { outil: 'proposer_idee', args: { titre: 'X' } }, {}).ok === false;
verdicts.planEnrichissementAjoute = (() => {
  // ENRICHIR = concaténer à l'essence existante, jamais l'écraser.
  const p = construirePlanExecution(
    { outil: 'proposer_enrichissement_idee', args: { idee_ref: 'ADR-3', ajout: 'Croiser avec PROTÉE.' } },
    { idees: [{ id: 'i-3', libelle: 'ADR-3', essence: 'Essence initiale.' }] });
  return p.ok === true && p.methode === 'PATCH' &&
    p.corps.id === 'i-3' && p.corps.essence === 'Essence initiale.\n\nCroiser avec PROTÉE.';
})();
verdicts.planRefIntrouvable = (() => {
  const p = construirePlanExecution(
    { outil: 'proposer_journal', args: { cible_ref: 'Godefroy', texte: 'x' } }, CAND_RIVEN);
  return p.ok === false && p.raison === 'introuvable';
})();
verdicts.planOutilInconnu = construirePlanExecution(
  { outil: 'supprimer_noeud', args: {} }, CAND_RIVEN).ok === false;

// ---------- 8. Fermetures de la contre-passe sécurité (S-L2b-1/2/3) ----------
// S-L2b-2 : une clé héritée d'Object.prototype est un surnuméraire comme un
// autre — rejet total, jamais de lecture qui remonte le prototype.
verdicts.surnumerairePrototype =
  validerProposition('proposer_idee', { titre: 'X', constructor: 'y' }, 'adramelech').ok === false &&
  validerProposition('proposer_idee', { titre: 'X', toString: 'y' }, 'adramelech').ok === false &&
  validerProposition('proposer_idee', { titre: 'X', hasOwnProperty: 'y' }, 'adramelech').ok === false &&
  validerProposition('proposer_idee',
    JSON.parse('{"titre":"X","__proto__":{"pollue":"y"}}'), 'adramelech').ok === false;
// S-L2b-3 : le titre confirmé est EXACTEMENT le titre stocké (borne API 120,
// validation 119) — plus aucune troncature silencieuse dans le gabarit.
verdicts.titreBorneApi =
  validerProposition('proposer_idee', { titre: 'x'.repeat(119) }, 'adramelech').ok === true &&
  validerProposition('proposer_idee', { titre: 'x'.repeat(120) }, 'adramelech').ok === false;
verdicts.planIdeeSansTroncature = (() => {
  const long = 'x'.repeat(119);
  const p = construirePlanExecution(
    { outil: 'proposer_idee', args: { titre: long } }, { prochainAdrNum: 1 });
  const trop = construirePlanExecution(
    { outil: 'proposer_idee', args: { titre: 'x'.repeat(130) } }, { prochainAdrNum: 1 });
  return p.ok === true && p.corps.nom === long && trop.ok === false;
})();
// S-L2b-1 : le plan NOMME le candidat résolu — la référence dictée peut
// différer du libellé réel (résolution par inclusion unique).
verdicts.planPorteCible = (() => {
  const p = construirePlanExecution(
    { outil: 'proposer_journal', args: { cible_ref: 'Marc', texte: 'Note.' } },
    { cibles: [{ id: 'n-9', libelle: 'Jean-Marc Petit' }] });
  return p.ok === true && p.corps.node_id === 'n-9' && p.cible === 'Jean-Marc Petit';
})();
verdicts.planCiblePartout = (() => {
  const r = construirePlanExecution(
    { outil: 'proposer_relance', args: { cible_ref: 'Lambert', echeance: '2026-08-01' } },
    CAND_RIVEN);
  const b = construirePlanExecution(
    { outil: 'proposer_besoin', args: { chantier_ref: 'Voltaire', libelle: 'Sacs de chaux' } },
    CAND_RIVEN);
  const e = construirePlanExecution(
    { outil: 'proposer_enrichissement_idee', args: { idee_ref: 'ADR-3', ajout: 'X' } },
    { idees: [{ id: 'i-3', libelle: 'ADR-3', essence: '' }] });
  return r.ok === true && r.cible === 'M. Lambert' &&
    b.ok === true && b.cible === 'Réhabilitation immeuble Voltaire' &&
    e.ok === true && e.cible === 'ADR-3';
})();

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LEO-MAINS OK' : 'UNIT-LEO-MAINS ECHEC');
process.exit(ok ? 0 : 1);
