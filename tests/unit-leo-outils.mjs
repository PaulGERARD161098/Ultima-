// Unitaires des mains de Léo (boucle L2b) — Node pur, zéro réseau.
// Prouve : la frontière lecture/écriture est étanche, validerAction strippe
// et applique les MÊMES règles que les endpoints CRUD (parité), owner_id et
// champs interdits ne passent jamais, les résumés sont fidèles, et les
// exécuteurs n'acceptent qu'un outil connu (client Supabase FACTICE — on
// vérifie les requêtes émises, jamais de vrai réseau).
import {
  DEFINITIONS_OUTILS,
  OUTILS_LECTURE,
  OUTILS_ECRITURE,
  LECTURE_MAX_LIGNES,
  LECTURE_ESSENCE_MAX,
  estOutilLecture,
  estOutilEcriture,
  validerAction,
  resumerAction,
  resoudreCible,
  executerLecture,
  executerEcriture
} from '../api/_lib/leo-outils.js';

const verdicts = {};
const UUID = '11111111-1111-4111-8111-111111111111';

// ---------- 1. Frontière lecture/écriture étanche ----------
verdicts.frontiereEtanche = OUTILS_LECTURE.every((o) => !OUTILS_ECRITURE.includes(o)) &&
  DEFINITIONS_OUTILS.every((d) => estOutilLecture(d.name) !== estOutilEcriture(d.name));
verdicts.definitionsCompletes = DEFINITIONS_OUTILS.length === 5 &&
  DEFINITIONS_OUTILS.every((d) => d.name && d.description && d.input_schema &&
    d.input_schema.additionalProperties === false);
verdicts.aucuneSuppression = DEFINITIONS_OUTILS.every((d) =>
  !/supprim|delete/i.test(d.name));

// ---------- 2. validerAction : parité CRUD + strip ----------
{
  const r = validerAction('creer_idee', {
    nom: 'GLANEUR 2', type: 'business', theme: 'logistique',
    owner_id: UUID, statut: 'exploitable', extra: 'ignoré' // strippés
  });
  verdicts.ideeValide = r.ok === true && r.valeurs.nom === 'GLANEUR 2' &&
    r.valeurs.owner_id === undefined && r.valeurs.statut === undefined &&
    r.valeurs.extra === undefined && r.valeurs.adr_num === undefined;
}
verdicts.ideeSansNom = validerAction('creer_idee', { type: 'business' }).ok === false;
verdicts.ideeNomTropLong = validerAction('creer_idee',
  { nom: 'x'.repeat(121), type: 'b' }).ok === false;

{
  const r = validerAction('ecrire_journal', {
    node_id: UUID, note: 'Appel fait.', prochaine_etape: 'Devis', relance_at: '2026-08-01'
  });
  verdicts.journalValide = r.ok === true && r.valeurs.node_id === UUID;
}
verdicts.journalSansCible = validerAction('ecrire_journal', { note: 'x' }).ok === false;
verdicts.journalCibleInventee = validerAction('ecrire_journal',
  { node_id: 'pas-un-uuid', note: 'x' }).ok === false;
verdicts.journalRelanceSansEtape = validerAction('ecrire_journal',
  { node_id: UUID, note: 'x', relance_at: '2026-08-01' }).ok === false;

{
  const r = validerAction('ajouter_besoin', {
    chantier_id: UUID, designation: 'Sacs de plâtre', quantite: 12, unite: 'sacs'
  });
  verdicts.besoinValide = r.ok === true && r.valeurs.quantite === 12;
}
verdicts.besoinQuantiteNulle = validerAction('ajouter_besoin',
  { chantier_id: UUID, designation: 'x', quantite: 0 }).ok === false;
verdicts.besoinEtatInterdit = validerAction('ajouter_besoin',
  { chantier_id: UUID, designation: 'x', etat: 'couvert' }).ok === true &&
  validerAction('ajouter_besoin', { chantier_id: UUID, designation: 'x', etat: 'couvert' })
    .valeurs.etat === undefined; // etat = colonne GÉNÉRÉE, strippée

verdicts.outilInconnu = validerAction('supprimer_idee', {}).ok === false &&
  validerAction('lire_idees', {}).ok === false && // une lecture n'est pas une action
  validerAction('creer_idee', null).ok === false;

// ---------- 3. Résumés fidèles (la plaque dit TOUT ce qui sera écrit) ----------
verdicts.resumeIdee = /GLANEUR 2/.test(resumerAction('creer_idee',
  { nom: 'GLANEUR 2', type: 'business' }));
verdicts.resumeJournal = /relance le 2026-08-01/.test(resumerAction('ecrire_journal',
  { node_id: UUID, note: 'Appel fait.', relance_at: '2026-08-01' }));
verdicts.resumeBesoin = /Sacs de plâtre × 12 sacs/.test(resumerAction('ajouter_besoin',
  { chantier_id: UUID, designation: 'Sacs de plâtre', quantite: 12, unite: 'sacs' }));
// Fermeture S-L2b-1 : la CIBLE apparaît (libellé résolu, sinon UUID brut —
// jamais rien), et l'essence cachée devient visible sur la plaque.
verdicts.resumeJournalCible = resumerAction('ecrire_journal',
  { node_id: UUID, note: 'x' }, { cible: 'M. Lambert' }).includes('M. Lambert') &&
  resumerAction('ecrire_journal', { node_id: UUID, note: 'x' }).includes(UUID);
verdicts.resumeBesoinChantier = resumerAction('ajouter_besoin',
  { chantier_id: UUID, designation: 'x' }, { cible: 'Immeuble Voltaire' })
    .includes('Immeuble Voltaire') &&
  resumerAction('ajouter_besoin', { chantier_id: UUID, designation: 'x' }).includes(UUID);
verdicts.resumeIdeeEssence = resumerAction('creer_idee',
  { nom: 'X', type: 'b', essence: 'contenu dicté complet' }).includes('contenu dicté complet');
verdicts.resumeEssenceTronquee = !resumerAction('creer_idee',
  { nom: 'X', type: 'b', essence: 'a'.repeat(500) }).includes('a'.repeat(200));

// ---------- 4. Exécuteurs : client factice, requêtes vérifiées ----------
function clientFactice(reponses) {
  const appels = [];
  function requete(table) {
    const q = {
      _table: table, _op: 'select',
      select() { return q; }, order() { return q; },
      limit(n) { q._limit = n; return q; }, eq() { return q; },
      insert(valeurs) { q._op = 'insert'; q._valeurs = valeurs; return q; },
      single() { return q; }, maybeSingle() { return q; },
      then(resolve) {
        appels.push({ table, op: q._op, valeurs: q._valeurs, limite: q._limit });
        resolve(reponses[table + ':' + q._op] || { data: [], error: null });
      }
    };
    return q;
  }
  return { from: requete, _appels: appels };
}

{
  // creer_idee : adr_num = max existant + 1, jamais fourni par l'appelant.
  const fake = clientFactice({
    'idees:select': { data: [{ adr_num: 4 }], error: null },
    'idees:insert': { data: { id: UUID, adr_num: 5, nom: 'X' }, error: null }
  });
  const r = await executerEcriture('creer_idee', { nom: 'X', type: 'b' }, fake);
  const insert = fake._appels.find((a) => a.op === 'insert');
  verdicts.adrNumServeur = r.adr_num === 5 && insert.valeurs.adr_num === 5 &&
    insert.valeurs.owner_id === undefined;
}
{
  const fake = clientFactice({
    'journal:insert': { data: { id: UUID }, error: null }
  });
  const r = await executerEcriture('ecrire_journal', { node_id: UUID, note: 'x' }, fake);
  verdicts.journalInsert = r.id === UUID &&
    fake._appels[0].table === 'journal' && fake._appels[0].op === 'insert';
}
{
  let rejete = false;
  try { await executerEcriture('outil_pirate', {}, clientFactice({})); }
  catch (e) { rejete = true; }
  verdicts.executeurFermeEcriture = rejete;
}
{
  let rejete = false;
  try { await executerLecture('creer_idee', clientFactice({})); }
  catch (e) { rejete = true; }
  verdicts.executeurFermeLecture = rejete; // une écriture ne passe JAMAIS en lecture
}
{
  // lire_intendant : champs minimisés + alertes calculées.
  const fake = clientFactice({
    'intendant_chantiers:select': { data: [{ id: UUID, node_id: UUID, date_pose: null }], error: null },
    'intendant_besoins:select': { data: [], error: null }
  });
  const r = await executerLecture('lire_intendant', fake);
  verdicts.lectureIntendant = Array.isArray(r.chantiers) && Array.isArray(r.alertes_j2);
}
{
  // Fermeture S-L2b-2 : lectures plafonnées (limit posé) + essence tronquée.
  const fake = clientFactice({
    'idees:select': { data: [{ id: UUID, adr_num: 1, nom: 'X', essence: 'e'.repeat(2000) }], error: null },
    'idees_liens:select': { data: [], error: null }
  });
  const r = await executerLecture('lire_idees', fake);
  verdicts.lecturePlafonnee = fake._appels.every((a) => a.limite === LECTURE_MAX_LIGNES) &&
    r.idees[0].essence.length <= LECTURE_ESSENCE_MAX + 1;
}
{
  // Fermeture S-L2b-1 : résolution de cible sous RLS — libellé rendu,
  // cible inexistante → fail-closed (jamais de plaque aveugle).
  const fake = clientFactice({
    'network_nodes:select': { data: { nom: 'M. Lambert' }, error: null }
  });
  const r = await resoudreCible('ecrire_journal', { node_id: UUID }, fake);
  verdicts.cibleResolue = r.ok === true && r.cibles.cible === 'M. Lambert';
  const fakeVide = clientFactice({
    'network_nodes:select': { data: null, error: null }
  });
  const rVide = await resoudreCible('ecrire_journal', { node_id: UUID }, fakeVide);
  verdicts.cibleIntrouvableFailClosed = rVide.ok === false;
  const rIdee = await resoudreCible('creer_idee', { nom: 'X' }, fakeVide);
  verdicts.cibleSansObjet = rIdee.ok === true;
}

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LEO-OUTILS OK' : 'UNIT-LEO-OUTILS ECHEC');
process.exit(ok ? 0 : 1);
