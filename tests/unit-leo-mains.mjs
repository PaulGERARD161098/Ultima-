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
  normaliserQuadrant,
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
verdicts.catalogueRiven = Array.isArray(outilsPour('riven')) &&
  outilsPour('riven').map((o) => o.name).sort().join(',') ===
  'proposer_besoin,proposer_contact,proposer_journal,proposer_lecture_amatsu,proposer_relance';
verdicts.catalogueAdramelech = Array.isArray(outilsPour('adramelech')) &&
  outilsPour('adramelech').map((o) => o.name).sort().join(',') ===
  'proposer_enrichissement_idee,proposer_idee,proposer_lecture_amatsu';
// IMLADRIK (boucle ④, 2026-07-30) : les 3 caps ont leurs mains.
verdicts.catalogueImladrik = Array.isArray(outilsPour('imladrik')) &&
  outilsPour('imladrik').map((o) => o.name).sort().join(',') ===
  'proposer_flamme,proposer_lecture_amatsu,proposer_page_journal,proposer_scenario,proposer_serment,proposer_situation';
// AMATSU (18/10/2026) : le seul outil TRANSVERSAL — servi aux trois quadrants
// ci-dessus, et à eux seuls ; NICOL BOLAS reste vide (verdict catalogueVide).
// bcp : catalogue VIDE → null (l'appel IA part sans le champ tools).
verdicts.catalogueVide = outilsPour('bcp') === null &&
  outilsPour('inconnu') === null && outilsPour(undefined) === null;
// Aucun outil de suppression, jamais (principe fondateur §0).
verdicts.zeroSuppression = Object.values(OUTILS_PAR_QUADRANT).every((liste) =>
  liste.every((o) => !/suppr|delete|retir|efface/i.test(o.name)));
// Schémas stricts : object, requis, bornes, additionalProperties: false.
verdicts.schemasStricts = ['riven', 'adramelech', 'imladrik'].every((q) =>
  outilsPour(q).every((o) =>
    o.input_schema.type === 'object' &&
    o.input_schema.additionalProperties === false &&
    Array.isArray(o.input_schema.required) && o.input_schema.required.length > 0 &&
    Object.values(o.input_schema.properties).every((p) =>
      p.type === 'string' && Number.isInteger(p.maxLength))));

// ---------- 2. validerProposition : portes fermées ----------
verdicts.outilInconnu = validerProposition('supprimer_idee', { id: 'x' }, 'adramelech').ok === false &&
  validerProposition('', {}, 'riven').ok === false &&
  validerProposition(undefined, {}, 'riven').ok === false;
// Pollution de prototype : un nom hérité d'Object n'est pas un outil.
verdicts.outilPrototype = validerProposition('toString', {}, 'riven').ok === false;
verdicts.outilHorsQuadrant =
  validerProposition('proposer_idee', { titre: 'X' }, 'riven').ok === false &&
  validerProposition('proposer_journal', { cible_ref: 'X', texte: 'Y' }, 'adramelech').ok === false &&
  validerProposition('proposer_journal', { cible_ref: 'X', texte: 'Y' }, 'bcp').ok === false;
verdicts.argsInvalides =
  validerProposition('proposer_idee', null, 'adramelech').ok === false &&
  validerProposition('proposer_idee', 'titre', 'adramelech').ok === false &&
  validerProposition('proposer_idee', ['titre'], 'adramelech').ok === false;
verdicts.champManquant =
  validerProposition('proposer_journal', { texte: 'sans cible' }, 'riven').ok === false &&
  validerProposition('proposer_relance', { cible_ref: 'M. Lambert' }, 'riven').ok === false;
verdicts.champVide =
  validerProposition('proposer_idee', { titre: '   ' }, 'adramelech').ok === false;
verdicts.champTropLong =
  validerProposition('proposer_idee', { titre: 'x'.repeat(161) }, 'adramelech').ok === false &&
  validerProposition('proposer_journal',
    { cible_ref: 'X', texte: 'x'.repeat(2001) }, 'riven').ok === false;
verdicts.champNonString =
  validerProposition('proposer_idee', { titre: 42 }, 'adramelech').ok === false &&
  validerProposition('proposer_idee', { titre: ['X'] }, 'adramelech').ok === false;
// Champ surnuméraire : REJET total (pas de strip — un outil qui invente un
// champ est suspect).
verdicts.champSurnumeraire =
  validerProposition('proposer_idee', { titre: 'X', owner_id: 'u1' }, 'adramelech').ok === false &&
  validerProposition('proposer_journal',
    { cible_ref: 'X', texte: 'Y', node_id: 'u-u-u-u-u' }, 'riven').ok === false;
verdicts.echeanceInvalide =
  validerProposition('proposer_relance',
    { cible_ref: 'X', echeance: '2026-13-40' }, 'riven').ok === false &&
  validerProposition('proposer_relance',
    { cible_ref: 'X', echeance: '2026-02-30' }, 'riven').ok === false &&
  validerProposition('proposer_relance',
    { cible_ref: 'X', echeance: 'demain' }, 'riven').ok === false;

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
    { chantier_ref: 'Voltaire', libelle: 'Sacs de chaux', quantite: '  ' }, 'riven');
  verdicts.nominalBesoin = r.ok === true && !('quantite' in r.proposition.args);
}
{
  const r = validerProposition('proposer_relance',
    { cible_ref: 'M. Lambert', echeance: '2026-08-01', note: 'Devis à relancer' }, 'riven');
  verdicts.nominalRelance = r.ok === true && r.proposition.args.echeance === '2026-08-01';
}
{
  const r = validerProposition('proposer_enrichissement_idee',
    { idee_ref: 'ADR-3', ajout: 'Croiser avec PROTÉE.' }, 'adramelech');
  verdicts.nominalEnrichissement = r.ok === true && r.proposition.args.idee_ref === 'ADR-3';
}
verdicts.nominalJournal = validerProposition('proposer_journal',
  { cible_ref: 'Mme Nguyen', texte: 'Plans validés ce matin.' }, 'riven').ok === true;

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
    p.corps.id === 'i-3' && p.corps.essence_attendue === 'Essence initiale.' && p.corps.essence === 'Essence initiale.\n\nCroiser avec PROTÉE.';
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

// ---------- IMLADRIK (boucle ④) : validation, enums, reformulation, gabarits ----------

const CAND_IMLADRIK = {
  serments: [{ id: 's-1', libelle: 'Tenir ma parole donnée' }],
  situations: [{ id: 'z-1', libelle: 'Si tout s’accélère' }]
};

// Cloisonnement : un outil IMLADRIK est refusé depuis un autre quadrant.
verdicts.imladrikCloisonne =
  validerProposition('proposer_serment', { intitule: 'X' }, 'adramelech').ok === false &&
  validerProposition('proposer_idee', { titre: 'X' }, 'imladrik').ok === false;

// Enum : une nature/vraisemblance hors liste est REJETÉE, jamais corrigée.
verdicts.imladrikEnum =
  validerProposition('proposer_flamme',
    { serment_ref: 'A', texte: 'B', nature: 'citation' }, 'imladrik').ok === true &&
  validerProposition('proposer_flamme',
    { serment_ref: 'A', texte: 'B', nature: 'prophetie' }, 'imladrik').ok === false &&
  validerProposition('proposer_scenario',
    { situation_ref: 'A', deroule: 'B', vraisemblance: 'certaine' }, 'imladrik').ok === false;

// Requis et surnuméraires, mêmes règles que partout ailleurs.
verdicts.imladrikRequis =
  validerProposition('proposer_page_journal', { titre: 'seul' }, 'imladrik').ok === false &&
  validerProposition('proposer_serment', { intitule: '   ' }, 'imladrik').ok === false &&
  validerProposition('proposer_serment',
    { intitule: 'X', owner_id: 'moi' }, 'imladrik').ok === false;

// Reformulation déterministe : le texte que Paul confirmera.
verdicts.imladrikReformule =
  reformulerProposition({ outil: 'proposer_serment', args: { intitule: 'Tenir', horizon: 'toujours' } })
    === 'Sceller le serment « Tenir » dans DRAUKHAIN. Horizon : « toujours »' &&
  /Raviver le serment « Tenir » d’une flamme \(victoire\)/.test(
    reformulerProposition({ outil: 'proposer_flamme',
      args: { serment_ref: 'Tenir', texte: 'tenu tout l’hiver', nature: 'victoire' } }));

// Gabarits : corps EXACTS des API existantes, cible résolue localement.
verdicts.imladrikPlans = (() => {
  const page = construirePlanExecution(
    { outil: 'proposer_page_journal', args: { contenu: 'Ma page.', titre: 'Matin' } }, {});
  const serment = construirePlanExecution(
    { outil: 'proposer_serment', args: { intitule: 'Tenir', pourquoi: 'le sens' } }, {});
  const flamme = construirePlanExecution(
    { outil: 'proposer_flamme', args: { serment_ref: 'parole', texte: 'tenu', nature: 'victoire' } },
    CAND_IMLADRIK);
  const situation = construirePlanExecution(
    { outil: 'proposer_situation', args: { intitule: 'Si tout casse' } }, {});
  const scenario = construirePlanExecution(
    { outil: 'proposer_scenario',
      args: { situation_ref: 'accélère', deroule: 'ça part vite', vraisemblance: 'forte' } },
    CAND_IMLADRIK);
  return page.ok === true && page.url === '/api/imladrik/entrees' &&
    page.methode === 'POST' && page.corps.contenu === 'Ma page.' && page.corps.titre === 'Matin' &&
    serment.ok === true && serment.url === '/api/serments' &&
    serment.corps.intitule === 'Tenir' && serment.corps.pourquoi === 'le sens' &&
    flamme.ok === true && flamme.url === '/api/flammes' &&
    flamme.corps.serment_id === 's-1' && flamme.corps.nature === 'victoire' &&
    flamme.cible === 'Tenir ma parole donnée' &&
    situation.ok === true && situation.url === '/api/situations' &&
    scenario.ok === true && scenario.url === '/api/scenarios' &&
    scenario.corps.situation_id === 'z-1' && scenario.corps.vraisemblance === 'forte';
})();

// Fail-closed du front : cible introuvable, bornes serveur, enum — jamais
// d'écriture bancale (et jamais de troncature silencieuse).
verdicts.imladrikPlansRefus = (() => {
  const introuvable = construirePlanExecution(
    { outil: 'proposer_flamme', args: { serment_ref: 'inconnu', texte: 'x' } }, CAND_IMLADRIK);
  const sansCandidats = construirePlanExecution(
    { outil: 'proposer_scenario', args: { situation_ref: 'x', deroule: 'y' } }, {});
  // horizon : borne serveur = 200 (et non 2000) — on refuse plutôt que tronquer.
  const horizonTropLong = construirePlanExecution(
    { outil: 'proposer_serment', args: { intitule: 'X', horizon: 'h'.repeat(201) } }, {});
  const natureInconnue = construirePlanExecution(
    { outil: 'proposer_flamme', args: { serment_ref: 'parole', texte: 'x', nature: 'espoir' } },
    CAND_IMLADRIK);
  return introuvable.ok === false && sansCandidats.ok === false &&
    horizonTropLong.ok === false && natureInconnue.ok === false;
})();

// ---------- AMATSU, le dragon de l'air (boucle 2a, 2026-10-18) ----------
// La main transversale : valide sur RIVEN, ADRAMELECH et IMLADRIK, refusée
// sur NICOL BOLAS (quadrant absent de sa liste), refusée sans l'un des trois
// vents (les quatre champs sont requis : Léo pose les vents AVANT d'appeler).
const LECTURE = { objet: 'Reprendre la boutique', bise: 'oui, moins de patron', souffle: 'oui, c’est moi', ouragan: 'un peu, j’étais en colère' };
verdicts.amatsuTransversal = ['riven', 'adramelech', 'imladrik'].every((q) =>
  validerProposition('proposer_lecture_amatsu', LECTURE, q).ok === true) &&
  validerProposition('proposer_lecture_amatsu', LECTURE, 'bcp').ok === false &&
  validerProposition('proposer_lecture_amatsu', LECTURE, 'inconnu').ok === false;
verdicts.amatsuTroisVentsRequis = ['bise', 'souffle', 'ouragan', 'objet'].every((manque) => {
  const args = { ...LECTURE }; delete args[manque];
  const vide = { ...LECTURE, [manque]: '   ' };
  return validerProposition('proposer_lecture_amatsu', args, 'imladrik').ok === false &&
    validerProposition('proposer_lecture_amatsu', vide, 'imladrik').ok === false;
});
verdicts.amatsuBornes =
  validerProposition('proposer_lecture_amatsu', { ...LECTURE, objet: 'x'.repeat(201) }, 'imladrik').ok === false &&
  validerProposition('proposer_lecture_amatsu', { ...LECTURE, bise: 'x'.repeat(501) }, 'imladrik').ok === false &&
  validerProposition('proposer_lecture_amatsu', { ...LECTURE, note: '5/10' }, 'imladrik').ok === false;
// Reformulation déterministe : les trois vents, nommés, dans l'ordre de Paul.
verdicts.amatsuReformule = reformulerProposition({ outil: 'proposer_lecture_amatsu', args: LECTURE }) ===
  'Amatsu lit « Reprendre la boutique » — plus libre ? « oui, moins de patron » · cohérent ? « oui, c’est moi » · emporté ? « un peu, j’étais en colère »';
// Gabarit : corps EXACT de /api/amatsu-lectures, aucune cible à résoudre ;
// bornes serveur tenues (refus, jamais de troncature).
verdicts.amatsuPlan = (() => {
  const plan = construirePlanExecution({ outil: 'proposer_lecture_amatsu', args: LECTURE }, {});
  const tropLong = construirePlanExecution(
    { outil: 'proposer_lecture_amatsu', args: { ...LECTURE, souffle: 's'.repeat(501) } }, {});
  const manque = construirePlanExecution(
    { outil: 'proposer_lecture_amatsu', args: { objet: 'x', bise: 'y', souffle: 'z' } }, {});
  return plan.ok === true && plan.url === '/api/amatsu-lectures' && plan.methode === 'POST' &&
    JSON.stringify(plan.corps) === JSON.stringify(LECTURE) && plan.cible === undefined &&
    tropLong.ok === false && manque.ok === false;
})();

// ---------- PROPOSER_CONTACT — la fiche réseau par la voix (2026-10-23) ----------
// CADRAGE-RIVEN-SAISIE.md §8, décision de Paul : vert, `type` requis. Prouve :
// la main n'est servie qu'à RIVEN ; le type est requis ET borné (artisan |
// partenaire | lead — `chantier` et toute autre valeur refusés, jamais corrigés) ;
// les bornes sont celles de validateNode ; la reformulation est déterministe ;
// le gabarit POSTe le corps EXACT de /api/reseau/nodes (statut prospect posé,
// provenance composée dans `notes`) ; un nom déjà en cible est un DOUBLON.
const CONTACT = { nom: 'Brice Papon', type: 'partenaire', telephone: '06 72 15 77 51',
  email: 'brice@soli-energie.com', apporteur: 'Hugo' };
verdicts.contactRivenSeul = validerProposition('proposer_contact', CONTACT, 'riven').ok === true &&
  ['adramelech', 'imladrik', 'bcp', 'inconnu'].every((q) =>
    validerProposition('proposer_contact', CONTACT, q).ok === false);
verdicts.contactTypeRequis =
  validerProposition('proposer_contact', { nom: 'Brice Papon' }, 'riven').ok === false &&
  validerProposition('proposer_contact', { nom: 'Brice Papon', type: '  ' }, 'riven').ok === false &&
  validerProposition('proposer_contact', { type: 'lead' }, 'riven').ok === false;
verdicts.contactTypeBorne = ['chantier', 'client', 'Partenaire', 'PARTENAIRE', 'fournisseur'].every((t) =>
  validerProposition('proposer_contact', { nom: 'X', type: t }, 'riven').ok === false) &&
  ['artisan', 'partenaire', 'lead'].every((t) =>
    validerProposition('proposer_contact', { nom: 'X', type: t }, 'riven').ok === true);
verdicts.contactBornes =
  validerProposition('proposer_contact', { ...CONTACT, nom: 'x'.repeat(201) }, 'riven').ok === false &&
  validerProposition('proposer_contact', { ...CONTACT, telephone: '0'.repeat(31) }, 'riven').ok === false &&
  validerProposition('proposer_contact', { ...CONTACT, email: 'x'.repeat(201) }, 'riven').ok === false &&
  validerProposition('proposer_contact', { ...CONTACT, note: 'x'.repeat(1801) }, 'riven').ok === false &&
  validerProposition('proposer_contact', { ...CONTACT, statut: 'actif' }, 'riven').ok === false &&
  validerProposition('proposer_contact', { ...CONTACT, node_id: 'u' }, 'riven').ok === false;
verdicts.contactReformule = reformulerProposition({ outil: 'proposer_contact', args: CONTACT }) ===
  'Ajouter « Brice Papon » (partenaire) au réseau RIVEN — 06 72 15 77 51 · brice@soli-energie.com — contact obtenu par Hugo.' &&
  reformulerProposition({ outil: 'proposer_contact', args: { nom: 'Soli', type: 'lead' } }) ===
  'Ajouter « Soli » (lead) au réseau RIVEN.';
verdicts.contactPlan = (() => {
  const C = { cibles: [{ id: 'aaaaaaaa-0000-0000-0000-000000000001', libelle: 'M. Lambert' }] };
  const plan = construirePlanExecution({ outil: 'proposer_contact', args: CONTACT }, C);
  const minimal = construirePlanExecution({ outil: 'proposer_contact', args: { nom: 'Soli', type: 'lead' } }, C);
  const avecNote = construirePlanExecution({ outil: 'proposer_contact',
    args: { nom: 'Soli', type: 'lead', apporteur: 'Hugo', note: 'À rappeler lundi.' } }, C);
  const sansCibles = construirePlanExecution({ outil: 'proposer_contact', args: CONTACT }, {});
  return plan.ok === true && plan.url === '/api/reseau/nodes' && plan.methode === 'POST' &&
    plan.cible === undefined &&
    JSON.stringify(plan.corps) === JSON.stringify({ type: 'partenaire', nom: 'Brice Papon', statut: 'prospect',
      telephone: '06 72 15 77 51', email: 'brice@soli-energie.com', notes: 'Contact obtenu par Hugo.' }) &&
    JSON.stringify(minimal.corps) === JSON.stringify({ type: 'lead', nom: 'Soli', statut: 'prospect' }) &&
    avecNote.corps.notes === 'Contact obtenu par Hugo. À rappeler lundi.' &&
    sansCibles.ok === true;
})();
verdicts.contactPlanRefus = (() => {
  const C = { cibles: [{ id: 'aaaaaaaa-0000-0000-0000-000000000001', libelle: 'M. Lambert' },
    { id: 'aaaaaaaa-0000-0000-0000-000000000002', libelle: 'Brice Papon' }] };
  const doublonExact = construirePlanExecution({ outil: 'proposer_contact', args: CONTACT }, C);
  const doublonInclus = construirePlanExecution({ outil: 'proposer_contact', args: { nom: 'Lambert', type: 'lead' } }, C);
  // Deux fiches portent déjà ce nom : le nom nu n'en fait pas naître une troisième.
  const doublonAmbigu = construirePlanExecution({ outil: 'proposer_contact', args: { nom: 'M', type: 'lead' } }, C);
  const typeAbsent = construirePlanExecution({ outil: 'proposer_contact', args: { nom: 'Soli' } }, C);
  const typeHorsListe = construirePlanExecution({ outil: 'proposer_contact', args: { nom: 'Soli', type: 'chantier' } }, C);
  const telTropLong = construirePlanExecution({ outil: 'proposer_contact',
    args: { nom: 'Soli', type: 'lead', telephone: '0'.repeat(31) } }, C);
  return doublonExact.ok === false && doublonExact.raison === 'doublon' &&
    doublonInclus.ok === false && doublonInclus.raison === 'doublon' &&
    doublonAmbigu.ok === false && doublonAmbigu.raison === 'doublon' &&
    typeAbsent.ok === false && typeAbsent.raison === 'invalide' &&
    typeHorsListe.ok === false && typeHorsListe.raison === 'invalide' &&
    telTropLong.ok === false && telTropLong.raison === 'invalide';
})();

// ---------- N. Alias de quadrant : 'traveler' → 'riven' (renommage 2026-08-11) ----------
// Un onglet resté ouvert chez Paul envoie encore l'ancien identifiant. Sans
// l'alias, l'appel meurt en 400 « Quadrant inconnu » au milieu d'une dictée.
verdicts.aliasTravelerVersRiven = normaliserQuadrant('traveler') === 'riven';
verdicts.aliasIdentitePourLesAutres = normaliserQuadrant('riven') === 'riven' &&
  normaliserQuadrant('bcp') === 'bcp' &&
  normaliserQuadrant('imladrik') === 'imladrik';
// Une clé héritée d'Object.prototype ne doit JAMAIS résoudre vers une fonction :
// c'est le motif de lecture par hasOwnProperty, éprouvé par validerProposition.
verdicts.aliasSansPollutionPrototype =
  normaliserQuadrant('constructor') === 'constructor' &&
  normaliserQuadrant('toString') === 'toString' &&
  normaliserQuadrant('__proto__') === '__proto__';
// Une entrée non-texte traverse sans être transformée : c'est construireSysteme
// qui refusera, avec son message, plutôt qu'une exception ici.
verdicts.aliasNonTexteInchange = normaliserQuadrant(undefined) === undefined &&
  normaliserQuadrant(null) === null && normaliserQuadrant(42) === 42;
// L'alias reste une PORTE D'ENTRÉE, jamais un quadrant à part entière : le
// catalogue et les registres ne connaissent que l'identifiant courant.
verdicts.aliasPasUnQuadrantDeplus =
  !Object.prototype.hasOwnProperty.call(OUTILS_PAR_QUADRANT, 'traveler') &&
  Object.prototype.hasOwnProperty.call(OUTILS_PAR_QUADRANT, 'riven') &&
  outilsPour('traveler') === null;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LEO-MAINS OK' : 'UNIT-LEO-MAINS ECHEC');
process.exit(ok ? 0 : 1);
