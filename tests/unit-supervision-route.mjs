// Supervision et réemploi — étape 5b : l'outil de Léo, le plan du front et la
// route /api/supervision, EXÉCUTÉS jusqu'à la fonction SQL réelle (PGlite).
// Le client Supabase est un double qui traduit .rpc / .from vers PGlite, sous
// le rôle `authenticated` et le jeton de Paul : la RLS et les droits jouent.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import handler from '../api/supervision.js';
import { OUTILS_PAR_QUADRANT, outilsPour, validerProposition, reformulerProposition, construireSysteme, anneauDe } from '../api/_lib/leo.js';
import { indexerCatalogues } from '../api/_lib/supervision-preuves.mjs';
import { ARGS_SUPERVISION } from '../api/_lib/supervision.mjs';

const lire = (c) => readFileSync(new URL(c, import.meta.url), 'utf8');
const PAUL = '11111111-1111-4111-8111-111111111111';
const AUTRE = '22222222-2222-4222-8222-222222222222';
const ACTIF = { LEO_SUPERVISION: 'active', ULTIMA_PROPRIETAIRES: PAUL };
const COUPE = { ULTIMA_PROPRIETAIRES: PAUL };

// ── 0. Le catalogue de Léo : un outil, orange, coupé par défaut ─────────────
const tous = [...new Set(Object.values(OUTILS_PAR_QUADRANT).flat().map((o) => o.name))];
assert.ok(tous.includes('proposer_supervision'));
assert.equal(anneauDe('proposer_supervision'), 'orange');
assert.deepEqual(OUTILS_PAR_QUADRANT.finubar.map((o) => o.name), ['proposer_supervision']);
assert.ok(Object.entries(OUTILS_PAR_QUADRANT).every(([q, l]) => q === 'finubar' || !l.some((o) => o.name === 'proposer_supervision')), 'FINUBAR seul');
assert.equal(outilsPour('finubar', {}), null, 'coupé : aucun outil servi');
assert.equal(outilsPour('finubar', { LEO_SUPERVISION: 'Active' }), null, 'casse différente : coupé');
assert.equal(outilsPour('finubar', { LEO_SUPERVISION: 'true' }), null);
assert.deepEqual(outilsPour('finubar', ACTIF).map((o) => o.name), ['proposer_supervision']);
// Le schéma servi au modèle reprend exactement les bornes de la chaîne serveur.
{
  const schema = OUTILS_PAR_QUADRANT.finubar[0].input_schema;
  assert.deepEqual(Object.keys(schema.properties).sort(), Object.keys(ARGS_SUPERVISION).sort());
  for (const [cle, spec] of Object.entries(ARGS_SUPERVISION)) {
    assert.equal(schema.properties[cle].maxLength, spec.max, cle);
    assert.ok(schema.properties[cle].description.length > 10, `description manquante : ${cle}`);
    if (spec.enum) assert.deepEqual(schema.properties[cle].enum, spec.enum, cle);
  }
  assert.deepEqual(schema.required.sort(), Object.keys(ARGS_SUPERVISION).filter((k) => ARGS_SUPERVISION[k].requis).sort());
}
// ⛔ Léo n'a AUCUN outil d'arbitrage ni de retrait — et aucune autre route n'y mène.
assert.ok(tous.every((n) => !/arbitr|retir|accept|refus|tranch|decid/i.test(n)), 'outil d’arbitrage dans le catalogue');
assert.ok(!/['"]arbitrer['"]|['"]retirer['"]/.test(lire('../js/leo-accueil.js')), 'le front de Léo fabrique arbitrer/retirer');
assert.ok(!/supervision_arbitrer|supervision_retirer/.test(lire('../api/_lib/leo.js') + lire('../api/leo.js') + lire('../api/_lib/leo-execution.js')));
// Validation de la proposition du modèle : coupée → refusée comme un outil inconnu.
const ARGS = {
  objet: 'zoh:renodevis', recommandation: 'conserver', type_benefice: 'direct',
  besoin: 'Chiffrer un devis', beneficiaire: 'Paul', constat: 'Fiche publiée et éprouvée.',
  consequence: 'Rien ne change', alternative_minimale: 'Aucune', gain_attendu: 'Devis plus rapides',
  preuve_attendue: 'Devis émis', preuves: 'zoh:renodevis',
  reexamen_responsable: 'Paul', reexamen_declencheur: 'Mensuel', critere_poursuite: 'Usage', critere_arret: 'Aucun devis',
};
assert.equal(validerProposition('proposer_supervision', ARGS, 'finubar', {}).ok, false);
assert.equal(validerProposition('proposer_supervision', ARGS, 'finubar', ACTIF).ok, true);
assert.equal(validerProposition('proposer_supervision', ARGS, 'riven', ACTIF).ok, false, 'hors FINUBAR');
assert.equal(validerProposition('proposer_supervision', { ...ARGS, statut: 'mesure' }, 'finubar', ACTIF).ok, false, 'champ surnuméraire');
assert.match(reformulerProposition({ outil: 'proposer_supervision', args: ARGS }), /^Soumettre à ton arbitrage : conserver « zoh:renodevis »/);
// La règle du prompt n'apparaît que si l'outil est servi.
{
  const avant = process.env.LEO_SUPERVISION;
  delete process.env.LEO_SUPERVISION;
  assert.ok(!construireSysteme('finubar', true).includes('proposer_supervision'));
  process.env.LEO_SUPERVISION = 'active';
  assert.ok(construireSysteme('finubar', true).includes('tu n’as aucun moyen d’arbitrer'));
  if (avant === undefined) delete process.env.LEO_SUPERVISION; else process.env.LEO_SUPERVISION = avant;
}

// ── 1. Le plan du front : corps figé sur `soumettre` ────────────────────────
const fenetre = {};
new Function('window', 'document', lire('../js/leo-accueil.js'))(fenetre, undefined);
const { construirePlanExecution, messageSupervision } = fenetre.UltimaLeo;
{
  const plan = construirePlanExecution({ outil: 'proposer_supervision', args: { ...ARGS, action: 'arbitrer', id: 'x', decision: 'ACCEPTEE' } }, {});
  assert.equal(plan.ok, true);
  assert.equal(plan.url, '/api/supervision');
  assert.equal(plan.methode, 'POST');
  assert.deepEqual(Object.keys(plan.corps).sort(), ['action', 'args']);
  assert.equal(plan.corps.action, 'soumettre', 'une proposition fabrique un arbitrage');
  assert.equal(plan.corps.args.decision, 'ACCEPTEE', 'le surnuméraire reste DANS args, où la route le refusera');
  assert.equal(construirePlanExecution({ outil: 'proposer_supervision', args: null }, {}).ok, false);
  assert.equal(construirePlanExecution({ outil: 'proposer_supervision', args: [] }, {}).ok, false);
}

// ── 2. La route, jusqu'à la base ────────────────────────────────────────────
const db = new PGlite();
await db.exec(lire('./fixtures/leo-appels-bootstrap.sql'));
await db.exec(lire('../supabase/migrations/20261031150000_supervision_decisions.sql'));

function clientPour(uid) {
  const en = async () => { await db.exec('reset role; set role authenticated;'); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid]); };
  const erreur = (e) => ({ data: null, error: { code: e.code || 'XX000' } });
  return {
    auth: { getUser: async () => ({ data: { user: { id: uid } }, error: null }) },
    rpc: async (nom, p) => {
      await en();
      const ordre = { supervision_soumettre: ['p_proposition_id', 'p_objet_id', 'p_recommandation', 'p_preuves', 'p_proposition'],
        supervision_arbitrer: ['p_id', 'p_decision', 'p_notes'], supervision_retirer: ['p_id'] }[nom];
      assert.ok(ordre, `rpc inattendu : ${nom}`);
      assert.deepEqual(Object.keys(p).filter((k) => !ordre.includes(k)), [], `paramètre inattendu pour ${nom}`);
      const valeurs = ordre.map((k) => (k === 'p_proposition' ? JSON.stringify(p[k]) : p[k] ?? null));
      try {
        const r = await db.query(`select public.${nom}(${ordre.map((_, i) => `$${i + 1}`).join(',')}) as r`, valeurs);
        return { data: r.rows[0].r, error: null };
      } catch (e) { return erreur(e); }
    },
    from: (table) => ({ select: (cols) => ({ order: () => ({ limit: async (n) => {
      await en();
      try { return { data: (await db.query(`select ${cols} from public.${table} order by cree_le desc limit ${Number(n)}`)).rows, error: null }; }
      catch (e) { return erreur(e); }
    } }) }) }),
  };
}
const index = () => indexerCatalogues({ publie_le: '2026-10-29', technos: [{ id: 'renodevis' }, { id: 'anti-pattern' }] },
  { projets: [{ depot: 'P/Ultima-', ok: true, mesure_le: '2026-10-31' }] }, ['proposer_supervision']);
const MAINTENANT = Date.parse('2026-10-31T12:00:00Z');
async function appeler({ methode = 'POST', corps, env = ACTIF, uid = PAUL, jeton = true, opts = {} } = {}) {
  const res = { statusCode: 0, headers: {}, corps: null, setHeader(k, v) { this.headers[k] = v; }, end(t) { this.corps = JSON.parse(t); } };
  const req = { method: methode, headers: jeton ? { authorization: 'Bearer jeton-fictif' } : {}, body: corps };
  await handler(req, res, { env, makeClient: () => (jeton ? { status: 'ok', client: clientPour(uid) } : { status: 'unauthenticated' }),
    index, maintenant: MAINTENANT, ...opts });
  return { statut: res.statusCode, ...res.corps };
}
const soumettre = (args = ARGS, o = {}) => appeler({ corps: { action: 'soumettre', args }, ...o });

// Accès : propriétaire seul ; méthode ; corps fermé.
assert.equal((await appeler({ methode: 'PUT' })).statut, 405);
assert.equal((await appeler({ methode: 'DELETE' })).statut, 405);
assert.equal((await soumettre(ARGS, { jeton: false })).statut, 401);
assert.equal((await soumettre(ARGS, { uid: AUTRE })).statut, 403, 'un compte quelconque n’est pas le propriétaire');
assert.equal((await soumettre(ARGS, { env: { LEO_SUPERVISION: 'active' } })).statut, 503, 'propriétaires non réglés');
assert.equal((await appeler({ corps: { action: 'soumettre', args: ARGS, decision: 'ACCEPTEE' } })).statut, 400, 'clé hors liste');
assert.equal((await appeler({ corps: { action: 'supprimer', id: PAUL } })).statut, 400);
assert.equal((await appeler({ corps: { action: 'constructor' } })).statut, 400);
assert.equal((await appeler({ corps: { args: ARGS } })).statut, 400);

// Interrupteur : coupé → soumettre refusé, rien en base ; lecture ouverte.
{
  const r = await soumettre(ARGS, { env: COUPE });
  assert.equal(r.statut, 403);
  assert.equal(r.error, 'Supervision non activée');
  const l = await appeler({ methode: 'GET', env: COUPE });
  assert.equal(l.statut, 200);
  assert.deepEqual(l.data, { propositions: [], soumission_active: false });
}

// Soumission nominale, puis la même : déjà en attente.
const s1 = await soumettre();
assert.equal(s1.statut, 200, JSON.stringify(s1));
assert.equal(s1.data.resultat, 'inseree');
assert.equal((await soumettre()).data.resultat, 'deja_en_attente');

// Refus de contrôle : 422, chemin et raison, aucune valeur, rien en base.
{
  const r = await soumettre({ ...ARGS, preuves: 'zoh:invente-de-toutes-pieces' });
  assert.equal(r.statut, 422);
  assert.equal(r.etape, 'matiere');
  assert.deepEqual(r.erreurs, ['/sources/0/id : preuve introuvable']);
  assert.ok(!JSON.stringify(r).includes('invente-de-toutes-pieces'), 'valeur reçue recopiée');
  const p = await soumettre({ ...ARGS, statut: 'mesure' });
  assert.equal(p.statut, 422);
  assert.equal(p.etape, 'arguments');
  const v = await soumettre({ ...ARGS, recommandation: 'suspendre' });
  assert.equal(v.etape, 'logique');
  assert.equal(v.statut, 422);
  assert.equal(v.examen, 'a_completer');
  assert.ok(v.erreurs.includes('Contrefactuel requis.'));
}

// Lecture : le dossier stocké, et rien d'autre.
{
  const l = await appeler({ methode: 'GET' });
  assert.equal(l.statut, 200);
  assert.equal(l.data.propositions.length, 1);
  assert.equal(l.data.soumission_active, true);
  const ligne = l.data.propositions[0];
  assert.equal(ligne.id, s1.data.id);
  assert.equal(ligne.statut, 'EN_ATTENTE');
  assert.equal(ligne.proposition.objetId, 'zoh:renodevis');
  assert.ok(!('owner_id' in ligne) && !('empreinte_materielle' in ligne), 'colonnes internes servies');
  // Un autre compte authentifié — même s'il passait la garde — ne voit rien (RLS).
  await db.exec('reset role; set role authenticated;');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [AUTRE]);
  assert.equal((await db.query('select count(*)::int as n from public.supervision_decisions')).rows[0].n, 0);
}

// Arbitrage par le cockpit ; puis le refus tient.
assert.equal((await appeler({ corps: { action: 'arbitrer', id: 'pas-un-uuid', decision: 'REFUSEE' } })).statut, 400);
assert.equal((await appeler({ corps: { action: 'arbitrer', id: s1.data.id, decision: 'OBSOLETE' } })).statut, 400);
assert.equal((await appeler({ corps: { action: 'arbitrer', id: s1.data.id, decision: 'REFUSEE', notes: 'x'.repeat(2001) } })).statut, 400);
assert.equal((await appeler({ corps: { action: 'arbitrer', id: '99999999-9999-4999-8999-999999999999', decision: 'REFUSEE' } })).statut, 404);
{
  const a = await appeler({ corps: { action: 'arbitrer', id: s1.data.id, decision: 'REFUSEE', notes: 'Pas maintenant' } });
  assert.equal(a.statut, 200);
  assert.deepEqual(a.data, { id: s1.data.id, statut: 'REFUSEE' });
  assert.equal((await appeler({ corps: { action: 'arbitrer', id: s1.data.id, decision: 'ACCEPTEE' } })).statut, 409);
  assert.equal((await soumettre()).data.resultat, 'deja_tranchee');
  assert.equal((await appeler({ corps: { action: 'retirer', id: s1.data.id } })).statut, 409, 'une décision tranchée ne se retire pas');
}
// Retirer une proposition en attente, puis la resoumettre : rouverte.
{
  const s2 = await soumettre({ ...ARGS, preuves: 'zoh:renodevis zoh:anti-pattern' });
  assert.equal(s2.data.resultat, 'inseree');
  assert.equal((await appeler({ corps: { action: 'retirer', id: s2.data.id } })).data.statut, 'OBSOLETE');
  assert.equal((await soumettre({ ...ARGS, preuves: 'zoh:renodevis zoh:anti-pattern' })).data.resultat, 'reouverte');
}
// Base injoignable (migration non appliquée) : 503 générique, jamais le détail.
{
  const panne = await appeler({ methode: 'GET', opts: { makeClient: () => ({ status: 'ok', client: {
    auth: { getUser: async () => ({ data: { user: { id: PAUL } }, error: null }) },
    from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: null, error: { code: '42P01', message: 'relation "supervision_decisions" does not exist' } }) }) }) }),
  } }) } });
  assert.equal(panne.statut, 503);
  assert.equal(panne.error, 'Registre absent', 'migration absente : dite comme telle');
  assert.ok(!JSON.stringify(panne).includes('relation'));
  const autre = await appeler({ methode: 'GET', opts: { makeClient: () => ({ status: 'ok', client: {
    auth: { getUser: async () => ({ data: { user: { id: PAUL } }, error: null }) },
    from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: null, error: { code: '57014' } }) }) }) }),
  } }) } });
  assert.equal(autre.error, 'Registre indisponible', 'une panne quelconque n’est pas « migration absente »');
}

// ── Revue de sécurité du 31/10 : constats fermés ────────────────────────────
// S3 — un caractère de contrôle (U+0000 → 22P05) est refusé AVANT la base, en 422.
{
  const avant = (await appeler({ methode: 'GET' })).data.propositions.length;
  const r = await soumettre({ ...ARGS, constat: 'a\u0000b' });
  assert.equal(r.statut, 422);
  assert.equal(r.etape, 'arguments');
  assert.deepEqual(r.erreurs, ['/constat : caractère interdit']);
  assert.equal((await appeler({ methode: 'GET' })).data.propositions.length, avant, 'rien en base');
  assert.equal((await soumettre({ ...ARGS, constat: 'ligne 1\nligne 2\tsuite' })).statut, 200, 'saut de ligne et tabulation admis');
}
// La clé inconnue n'est pas recopiée.
assert.deepEqual((await soumettre({ ...ARGS, '<img src=x>': 'v' })).erreurs, ['/ : champ non prévu']);
// S2 — une ligne entrée par la RPC directe (sas sautés) est signalée « introuvable ».
{
  await db.exec('reset role; set role authenticated;');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [PAUL]);
  await db.query("select public.supervision_soumettre('direct','leo:nimporte','conserver','{zoh:inventee}','{}'::jsonb)");
  const l = (await appeler({ methode: 'GET' })).data.propositions;
  const directe = l.find((x) => x.objet_id === 'leo:nimporte');
  assert.equal(directe.preuves_connues, false, 'preuve inventée affirmée connue');
  assert.ok(l.filter((x) => x.objet_id === 'zoh:renodevis').every((x) => x.preuves_connues === true));
  const sansIndex = (await appeler({ methode: 'GET', opts: { index: () => { throw new Error('catalogue'); } } })).data.propositions;
  assert.ok(sansIndex.every((x) => x.preuves_connues === null), 'index indisponible : rien n’est affirmé');
}
// S4 — la carte nomme les deux preuves qui entrent dans l'empreinte et annonce le reste.
{
  const t = reformulerProposition({ outil: 'proposer_supervision', args: { ...ARGS, recommandation: 'suspendre', preuve_dependances: 'zoh:dep', preuve_protections: 'zoh:prot', contrefactuel: 'c', retour_arriere: 'r' } });
  assert.ok(t.includes('Dépendances : zoh:dep') && t.includes('Protections : zoh:prot'), t);
  assert.ok(t.includes('(bénéfice direct)'));
  assert.match(t, /\(\+ 11 champs, lisibles au cockpit\.\)/);
}

// ── 3. Ce que Léo apprend de l'issue (bulle + historique) ───────────────────
assert.equal(messageSupervision({ httpOk: true, statut: 200, corps: { ok: true, data: { resultat: 'deja_tranchee' } } }),
  '[Supervision : Paul a déjà tranché cette proposition. Ne la repropose pas, et n’ajoute pas de preuve pour la faire revenir.]');
assert.ok(!/preuve nouvelle/.test(messageSupervision({ httpOk: true, statut: 200, corps: { ok: true, data: { resultat: 'deja_tranchee' } } })), 'S1 : le message ne suggère plus le contournement');
assert.equal(messageSupervision({ httpOk: false, statut: 429, corps: { ok: false } }), '[Supervision : plafond de propositions atteint (50 par 24 h). Rien n’a été enregistré.]');
assert.match(messageSupervision({ httpOk: false, statut: 422, corps: { ok: false, etape: 'matiere', erreurs: ['/sources/0/id : preuve introuvable'], reserves: [] } }),
  /^\[Supervision refusée \(matiere\) : \/sources\/0\/id : preuve introuvable\. Rien n’a été enregistré\.\]$/);
assert.equal(messageSupervision({ httpOk: true, statut: 200, corps: { ok: true, data: { resultat: 'constructor' } } }).startsWith('[Supervision :'), false, 'résultat hors liste');
assert.equal(messageSupervision({ httpOk: false, statut: 403, corps: { ok: false } }), '[Supervision non activée : rien n’a été enregistré.]');
{
  const long = messageSupervision({ httpOk: false, statut: 422, corps: { ok: false, erreurs: Array.from({ length: 30 }, () => 'x'.repeat(500)) } });
  assert.ok(long.length < 8 * 121 + 80, 'motifs non bornés');
}

console.log('✓ supervision-route : outil coupé par défaut, plan figé, route et base éprouvés bout à bout');
