// Unitaires — B1 ④, l'exécution des écritures de Léo (cadrage §13).
// `api/_lib/leo-execution.js` avec un client Supabase FACTICE : zéro réseau.
// Le client tient une table en mémoire et enregistre chaque insertion — c'est
// ce qui permet de prouver « RIEN n'est posé » sur chaque refus, et de rejouer
// la vraie séquence ouvrir → clore sur les lignes réellement posées.
import { readFileSync } from 'node:fs';
import {
  ouvrirEcriture,
  cloreEcriture,
  MOTIF_TECHNIQUE
} from '../api/_lib/leo-execution.js';
import { PLAFOND_PAR_DEFAUT } from '../api/_lib/leo-journal.js';
import { validerProposition, decisionAnneau, anneauInterface } from '../api/_lib/leo.js';

const PAUL = '11111111-2222-4333-8444-555555555555';
const AUTRUI = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAINTENANT = Date.parse('2026-09-30T18:00:00Z');
const IL_Y_A = (ms) => new Date(MAINTENANT - ms).toISOString();

function clientFactice({ lignes = [], echecLecture = false, echecInsert = false,
  // Au-delà de N insertions réussies, la base refuse avec `codeRefus`.
  refusApres = Infinity, codeRefus = '23505' } = {}) {
  const table = lignes.map((l) => ({ ...l }));
  const inserts = [];
  const tablesTouchees = new Set();
  function requete() {
    const filtres = [];
    let limite = Infinity;
    const q = {
      eq(col, val) { filtres.push((l) => l[col] === val); return q; },
      gte(col, val) { filtres.push((l) => l[col] >= val); return q; },
      limit(n) { limite = n; return q; },
      then(resoudre, rejeter) {
        const r = echecLecture
          ? { data: null, error: { code: 'XX000' } }
          : { data: table.filter((l) => filtres.every((f) => f(l))).slice(0, limite), error: null };
        return Promise.resolve(r).then(resoudre, rejeter);
      }
    };
    return q;
  }
  return {
    table,
    inserts,
    tablesTouchees,
    from(nom) {
      tablesTouchees.add(nom);
      return {
        select() { return requete(); },
        insert(ligne) {
          if (echecInsert) return Promise.resolve({ error: { code: '42501' } });
          if (inserts.length >= refusApres) return Promise.resolve({ error: { code: codeRefus } });
          inserts.push(ligne);
          // owner_id et le : défauts de la base (auth.uid(), now()), jamais
          // fournis par le code — le factice les pose comme elle.
          table.push({ ...ligne, owner_id: PAUL, le: new Date(MAINTENANT).toISOString() });
          return Promise.resolve({ error: null });
        }
      };
    }
  };
}

const TITRE = 'Racheter le local de Villeurbanne';
const RESUME = 'Page intime : ce que je veux vraiment faire de ce lieu';
const IDEE = {
  etape: 'ouvrir',
  outil: 'proposer_idee',
  args: { titre: TITRE, resume: RESUME },
  quadrant: 'adramelech'
};
// L'interrupteur W1 est fermé par défaut : ce banc éprouve le chemin OUVERT.
const opts = { maintenant: MAINTENANT, env: { LEO_ECRITURES_AUTO: 'actives' } };
const tentees = (n, ms, owner = PAUL) => Array.from({ length: n }, (_, i) => ({
  trace_id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  owner_id: owner, outil: 'proposer_idee', quadrant: 'adramelech',
  anneau: 'vert', phase: 'tentee', le: IL_Y_A(ms)
}));

const verdicts = {};

// ---------- 0. Verrou de non-vacuité : le chemin nominal POSE une ligne ----------
{
  const c = clientFactice();
  const r = await ouvrirEcriture(c, PAUL, IDEE, opts);
  const l = c.inserts[0] || {};
  verdicts.nonVacuite = r.status === 200 && UUID.test(r.data.traceId) &&
    c.inserts.length === 1 && l.phase === 'tentee' && l.outil === 'proposer_idee' &&
    l.anneau === 'vert' && l.quadrant === 'adramelech' && l.trace_id === r.data.traceId;
  // L'owner n'est JAMAIS fourni par le code : il vient de la base (auth.uid()).
  verdicts.ownerJamaisFourni = !('owner_id' in l);
  verdicts.restantCompte = r.data?.restant === PLAFOND_PAR_DEFAUT - 1;
  // ⛔ leo_operations n'est pas touché : le produit n'en a pas le droit (§13.0).
  verdicts.seulLeJournalEstTouche = [...c.tablesTouchees].join(',') === 'leo_ecritures';

  // ---------- B1-e : zéro contenu dicté dans ce qui est posé ----------
  // Verrou : les arguments portent bien du contenu — sinon « introuvable » serait vrai à vide.
  const pose = JSON.stringify(c.inserts);
  verdicts.contenuDicteNonVide = TITRE.length > 10 && RESUME.length > 10;
  verdicts.zeroContenuDicte = !pose.includes('Villeurbanne') && !pose.includes('intime') &&
    !pose.includes(TITRE) && !pose.includes(RESUME);
}

// ---------- B1-b : ce que la garde refuse n'écrit RIEN ----------
{
  const refuse = async (corps) => {
    const c = clientFactice();
    const r = await ouvrirEcriture(c, PAUL, corps, opts);
    return { status: r.status, rien: c.inserts.length === 0 && !r.data };
  };
  const horsQuadrant = await refuse({ ...IDEE, quadrant: 'riven' });
  const inconnu = await refuse({ ...IDEE, outil: 'supprimer_idee' });
  const surnumeraireArgs = await refuse({ ...IDEE, args: { ...IDEE.args, owner_id: AUTRUI } });
  const requisVide = await refuse({ ...IDEE, args: { titre: '   ' } });
  // ⛔ L'anneau ne se DÉCLARE pas : un corps qui le porte est refusé en entier.
  const anneauDeclare = await refuse({ ...IDEE, anneau: 'vert' });
  const prototype = await refuse({ ...IDEE, outil: 'constructor' });
  const pasUnObjet = await refuse(null);
  // ⛔ B1-b : un ORANGE appelé comme un vert. Le catalogue n'en compte plus
  // aucun (§12.4 ①) : on en fabrique un par la SEULE décision d'anneau qui
  // existe (`decisionAnneau`), sur une proposition valide par ailleurs.
  {
    const c = clientFactice();
    const gardeOrange = (outil, args, quadrant) => {
      const v = validerProposition(outil, args, quadrant);
      if (!v.ok) return { ok: false, motif: 'proposition invalide' };
      const d = decisionAnneau('orange');
      return d.ok ? { ok: true, anneau: d.anneau, proposition: v.proposition } : d;
    };
    const r = await ouvrirEcriture(c, PAUL, IDEE, { ...opts, garde: gardeOrange });
    verdicts.orangeRefuseSansEcrire = r.status === 403 && c.inserts.length === 0 && !r.data;
  }
  verdicts.gardeRefuseSansEcrire = [horsQuadrant, inconnu, surnumeraireArgs, requisVide,
    anneauDeclare, prototype, pasUnObjet].every((v) => v.status === 400 && v.rien);
}

// ---------- B1-f : le plafond MORD, et ne compte que ce qu'il doit ----------
{
  const essai = async (lignes) => {
    const c = clientFactice({ lignes });
    const r = await ouvrirEcriture(c, PAUL, IDEE, opts);
    return { status: r.status, poses: c.inserts.length };
  };
  const plein = await essai(tentees(PLAFOND_PAR_DEFAUT, 10 * 60 * 1000));
  const presque = await essai(tentees(PLAFOND_PAR_DEFAUT - 1, 10 * 60 * 1000));
  verdicts.plafondMord = plein.status === 429 && plein.poses === 0;
  // Le miroir : sans lui, « le plafond mord » pourrait vouloir dire « refuse tout ».
  verdicts.plafondLaissePasserLaDerniere = presque.status === 200 && presque.poses === 1;
  // Hors fenêtre : ne compte pas.
  const anciennes = await essai(tentees(PLAFOND_PAR_DEFAUT, 2 * 60 * 60 * 1000));
  verdicts.horsFenetreNeComptePas = anciennes.status === 200;
  // ⛔ Les écritures d'AUTRUI ne comptent pas : le filtre propriétaire est
  // explicite, en plus de la RLS (sans lui, un tiers épuiserait le plafond de Paul).
  const autrui = await essai(tentees(PLAFOND_PAR_DEFAUT, 10 * 60 * 1000, AUTRUI));
  verdicts.autruiNeComptePas = autrui.status === 200;
  // Les issues ne comptent pas : ce sont les TENTATIVES qui sont plafonnées.
  const issues = tentees(PLAFOND_PAR_DEFAUT, 10 * 60 * 1000).map((l) => ({ ...l, phase: 'reussie' }));
  verdicts.seulesLesTentativesComptent = (await essai(issues)).status === 200;
}

// ---------- Fail-closed : sans journal, pas de trace, donc pas d'acte ----------
{
  const c1 = clientFactice({ echecLecture: true });
  const r1 = await ouvrirEcriture(c1, PAUL, IDEE, opts);
  verdicts.lectureEnEchecRefuse = r1.status === 503 && c1.inserts.length === 0 && !r1.data;
  const c2 = clientFactice({ echecInsert: true });
  const r2 = await ouvrirEcriture(c2, PAUL, IDEE, opts);
  verdicts.insertionEnEchecPasDeTrace = r2.status === 503 && !r2.data;
  const c3 = clientFactice({ refusApres: 0, codeRefus: 'PT429' });
  const r3 = await ouvrirEcriture(c3, PAUL, IDEE, opts);
  verdicts.plafondConcurrentEst429 = r3.status === 429 && c3.inserts.length === 0 && !r3.data;
}

// ---------- La clôture : recopiée, unique, bornée ----------
{
  const c = clientFactice();
  const o = await ouvrirEcriture(c, PAUL, IDEE, opts);
  const traceId = o.data.traceId;
  const cible = '3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607';
  const r = await cloreEcriture(c, PAUL, { etape: 'clore', traceId, issue: 'reussie', cibleId: cible }, opts);
  const l = c.inserts[1] || {};
  verdicts.clotureNominale = r.status === 200 && c.inserts.length === 2 &&
    l.phase === 'reussie' && l.trace_id === traceId && l.cible_id === cible &&
    l.outil === 'proposer_idee' && l.quadrant === 'adramelech';

  const double = await cloreEcriture(c, PAUL, { etape: 'clore', traceId, issue: 'echouee', motif: 'statut 500' }, opts);
  verdicts.uneSeuleIssue = double.status === 409 && c.inserts.length === 2;

  // ⛔ L'outil ne se reçoit pas à la clôture : un `outil` glissé fait tout refuser.
  const c2 = clientFactice();
  const o2 = await ouvrirEcriture(c2, PAUL, IDEE, opts);
  const glisse = await cloreEcriture(c2, PAUL,
    { etape: 'clore', traceId: o2.data.traceId, issue: 'reussie', outil: 'proposer_serment' }, opts);
  verdicts.outilNeSeRecoitPas = glisse.status === 400 && c2.inserts.length === 1;

  // Motifs : liste fermée. Le motif technique passe ; le contenu, non.
  const c3 = clientFactice();
  const o3 = await ouvrirEcriture(c3, PAUL, IDEE, opts);
  const contenu = await cloreEcriture(c3, PAUL,
    { etape: 'clore', traceId: o3.data.traceId, issue: 'echouee', motif: 'Racheter le local' }, opts);
  const technique = await cloreEcriture(c3, PAUL,
    { etape: 'clore', traceId: o3.data.traceId, issue: 'echouee', motif: 'statut 500' }, opts);
  verdicts.motifDeContenuRefuse = contenu.status === 400;
  verdicts.motifTechniquePasse = technique.status === 200 && c3.inserts[1]?.motif === 'statut 500';
  verdicts.motifsFermes = MOTIF_TECHNIQUE.test('reseau') && MOTIF_TECHNIQUE.test('reponse illisible') &&
    !MOTIF_TECHNIQUE.test('statut 5000') && !MOTIF_TECHNIQUE.test('statut 500 Racheter');

  // Issues : ni casse approximative, ni 'defaite' (c'est l'étape 5, pas ④).
  const c4 = clientFactice();
  const o4 = await ouvrirEcriture(c4, PAUL, IDEE, opts);
  const casse = await cloreEcriture(c4, PAUL, { etape: 'clore', traceId: o4.data.traceId, issue: 'Reussie' }, opts);
  const defaite = await cloreEcriture(c4, PAUL, { etape: 'clore', traceId: o4.data.traceId, issue: 'defaite' }, opts);
  verdicts.issuesFermees = casse.status === 400 && defaite.status === 400 && c4.inserts.length === 1;

  // Traces : inconnue, forgée, ou celle d'AUTRUI → refusées sans rien poser.
  const c5 = clientFactice({ lignes: tentees(1, 60 * 1000, AUTRUI) });
  const autrui = await cloreEcriture(c5, PAUL,
    { etape: 'clore', traceId: c5.table[0].trace_id, issue: 'reussie' }, opts);
  const inconnue = await cloreEcriture(c5, PAUL,
    { etape: 'clore', traceId: '99999999-9999-4999-8999-999999999999', issue: 'reussie' }, opts);
  const forgee = await cloreEcriture(c5, PAUL, { etape: 'clore', traceId: 'x; drop', issue: 'reussie' }, opts);
  const absente = await cloreEcriture(c5, PAUL, { etape: 'clore', issue: 'reussie' }, opts);
  verdicts.tracesRefusees = autrui.status === 404 && inconnue.status === 404 &&
    forgee.status === 400 && absente.status === 400 && c5.inserts.length === 0;

  // Une tentative trop ancienne reste seule : « interrompue en vol » est l'information.
  const c6 = clientFactice({ lignes: tentees(1, 2 * 60 * 60 * 1000) });
  const expiree = await cloreEcriture(c6, PAUL,
    { etape: 'clore', traceId: c6.table[0].trace_id, issue: 'reussie' }, opts);
  verdicts.traceExpireeRefusee = expiree.status === 409 && c6.inserts.length === 0;

  // Cible : un identifiant, jamais un libellé.
  const c7 = clientFactice();
  const o7 = await ouvrirEcriture(c7, PAUL, IDEE, opts);
  const libelle = await cloreEcriture(c7, PAUL,
    { etape: 'clore', traceId: o7.data.traceId, issue: 'reussie', cibleId: TITRE }, opts);
  verdicts.cibleLibelleRefusee = libelle.status === 400 && c7.inserts.length === 1;
}

// ---------- S2 : l'anneau d'INTERFACE exige que Paul ait nommé la cible ----------
{
  const note = { outil: 'proposer_journal', args: { cible_ref: 'Sophie Durand', texte: 'Devis validé.' } };
  verdicts.cibleNonNommeeOrange =
    anneauInterface('vert', note, 'note que le chantier avance') === 'orange';
  // Le miroir : sans lui, « orange » pourrait vouloir dire « toujours orange ».
  verdicts.cibleNommeeVert =
    anneauInterface('vert', note, 'Note au journal de Sophie Durand : devis validé.') === 'vert' &&
    anneauInterface('vert', note, 'note au journal de sophie   durand : devis validé.') === 'vert';
  verdicts.contenuNonDicteOrange = anneauInterface('vert', note, 'note au journal de sophie durand') === 'orange';
  verdicts.creationSansCibleVert =
    anneauInterface('vert', { outil: 'proposer_idee', args: { titre: 'Atelier bois' } }, 'capture une idée Atelier bois') === 'vert';
  verdicts.lectureSansCreation = anneauInterface('vert', { outil: 'proposer_idee', args: { titre: 'Atelier bois' } }, 'où en est Atelier bois ?') === 'orange';
  verdicts.negationRefusee = anneauInterface('vert', note, 'Ne note pas au journal de Sophie Durand : devis validé.') === 'orange';
  verdicts.creationInventeeOrange = anneauInterface('vert', { outil: 'proposer_idee', args: { titre: 'Atelier bois' } }, 'capture une idée') === 'orange';
  verdicts.typeObjetRespecte = anneauInterface('vert', { outil: 'proposer_serment', args: { intitule: 'Atelier bois' } }, 'Crée une situation Atelier bois') === 'orange' &&
    anneauInterface('vert', { outil: 'proposer_situation', args: { intitule: 'Atelier bois' } }, 'Crée une situation Atelier bois') === 'vert';
  verdicts.objetDansContenuNeVautPasIntention = anneauInterface('vert', { outil: 'proposer_serment', args: { intitule: 'serment Atelier bois' } }, 'Crée une situation serment Atelier bois') === 'orange';
  verdicts.orangeResteOrange = anneauInterface('orange', note, 'Sophie Durand') === 'orange' &&
    anneauInterface('VERT', note, 'Sophie Durand') === 'orange' &&
    anneauInterface(undefined, note, 'Sophie Durand') === 'orange';
  verdicts.refVideOrange =
    anneauInterface('vert', { outil: 'proposer_journal', args: { cible_ref: '  ' } }, 'note') === 'orange';
}

// ---------- S5 : la base tranche la course entre deux clôtures ----------
{
  // La tentative passe (1 insertion), la clôture heurte l'index unique :
  // c'est ce que voit la SECONDE de deux clôtures concurrentes.
  const c = clientFactice({ refusApres: 1, codeRefus: '23505' });
  const o = await ouvrirEcriture(c, PAUL, IDEE, opts);
  const r = await cloreEcriture(c, PAUL, { etape: 'clore', traceId: o.data.traceId, issue: 'reussie' }, opts);
  verdicts.doublonEnBaseEst409 = o.status === 200 && r.status === 409;
  // Le miroir : une autre erreur de base reste une panne (503), pas un doublon.
  const c2 = clientFactice({ refusApres: 1, codeRefus: '08006' });
  const o2 = await ouvrirEcriture(c2, PAUL, IDEE, opts);
  const r2 = await cloreEcriture(c2, PAUL, { etape: 'clore', traceId: o2.data.traceId, issue: 'reussie' }, opts);
  verdicts.autrePanneEst503 = r2.status === 503;
}

// ---------- S6 : la migration de durcissement dit ce que le code dit ----------
{
  const migration = readFileSync(new URL(
    '../supabase/migrations/20260930190000_leo_ecritures_durcissement.sql', import.meta.url), 'utf8');
  const motifSql = (migration.match(/motif ~ '([^']+)'/) || [, ''])[1];
  // ⛔ Verrou de non-vacuité : sur une regex qui ne matche pas, « coïncident » serait vrai à vide.
  verdicts.motifSqlLu = motifSql.length > 10;
  verdicts.motifSqlCoincide = motifSql === MOTIF_TECHNIQUE.source;
  verdicts.uneSeuleIssueEnBase = /create unique index leo_ecritures_une_issue[\s\S]*where phase in \('reussie', 'echouee'\)/.test(migration);
  // Les colonnes accordées sont EXACTEMENT celles que la route pose.
  const accordees = ((migration.match(/grant insert \(([^)]+)\)/) || [, ''])[1])
    .split(',').map((x) => x.trim()).filter(Boolean).sort().join(',');
  const c = clientFactice();
  await ouvrirEcriture(c, PAUL, IDEE, opts);
  const posees = Object.keys(c.inserts[0] || {}).sort().join(',');
  verdicts.colonnesAccordees = accordees.length > 0 && accordees === posees &&
    !/\b(le|owner_id|id)\b/.test(accordees);
}

// ---------- La route est mince, et elle n'écrit pas elle-même ----------
{
  const route = readFileSync(new URL('../api/leo/ecritures.js', import.meta.url), 'utf8');
  verdicts.routeDelegue = /ouvrirEcriture\(auth\.client, auth\.user\.id, corps\)/.test(route) &&
    /cloreEcriture\(auth\.client, auth\.user\.id, corps\)/.test(route);
  verdicts.routeNInserePas = !/\.insert\(|\.from\(/.test(route);
  verdicts.routeExigeUnUtilisateur = /requireUser\(req\)/.test(route) &&
    /auth\.status !== 'ok'\) return fail\(res, 401/.test(route);
}

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const tout = Object.values(verdicts).every((v) => v === true);
console.log(tout ? 'UNIT-LEO-EXECUTION OK' : 'UNIT-LEO-EXECUTION ECHEC');
process.exit(tout ? 0 : 1);
