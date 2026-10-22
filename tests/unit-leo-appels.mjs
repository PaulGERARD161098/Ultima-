// Unitaires — le compteur et le plafond d'appels de Léo (19/10/2026).
// Node pur, zéro réseau, zéro base : un client Supabase FACTICE qui enregistre ce
// qui aurait été écrit. La base elle-même est éprouvée par
// `tests/leo-appels-postgres.sh` (PostgreSQL jetable : 101ᵉ appel refusé, appels
// simultanés, droits, antidatage) — ce harnais-ci garde ce qu'un client factice
// peut garder : la décision, le repli, le câblage, et la double vérité avec la
// migration (une fonction SQL ne s'importe pas : on LIT le fichier).
//
// ⛔ Le danger est d'UN côté : un plafond qui ne mord pas, ou qui s'ouvre sur une
// panne sans le dire. Les cas « refuse » et « ne fuit rien » pèsent plus lourd
// que les cas « laisse passer ».
import { readFileSync, readdirSync } from 'node:fs';
import {
  PHASES_APPEL, PLAFOND_APPELS, PLAFOND_LIGNES, PLAFOND_LOCAL, FENETRE_APPELS_MS, nombreEtatsLocaux,
  MAX_QUADRANT, MAX_MODELE, MAX_TOKENS_COMPTES, CAUSE_PLAFOND,
  jetonsDe, ouvrirAppel, cloreAppel
} from '../api/_lib/leo-appels.js';
import { MOTIF_CAUSE_IA } from '../api/_lib/leo.js';

const verdicts = {};
const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), 'utf8');
const sql = lire('../supabase/migrations/20261019160000_leo_appels.sql');
const route = lire('../api/leo.js');
const front = lire('../js/leo-accueil.js');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sansCommentaires = sql.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');

// ── 0. Verrous de non-vacuité ────────────────────────────────────────────────
verdicts.migrationLue = sansCommentaires.length > 1500 && /create table public\.leo_appels/.test(sansCommentaires);
verdicts.routeLue = route.includes('ouvrirAppel') && route.includes('new Anthropic(');
verdicts.valeursLues = PLAFOND_APPELS > 0 && PLAFOND_LIGNES > PLAFOND_APPELS && FENETRE_APPELS_MS === 86400000;
// Le repli penche vers le refus : il ne peut jamais valoir autant que la base (S1).
verdicts.plafondLocalSousLaBase = Number.isInteger(PLAFOND_LOCAL) && PLAFOND_LOCAL > 0 && PLAFOND_LOCAL < PLAFOND_APPELS;

// ── 1. Les doubles vérités avec la migration ─────────────────────────────────
{
  const quota = /\(select count\(\*\) from public\.leo_appels\s+where owner_id = new\.owner_id and phase = 'tentee'\s+and le >= pg_catalog\.clock_timestamp\(\) - interval '24 hours'\) >= (\d+) then\s+raise exception using errcode = 'PT429', message = 'leo_calls_quota_exhausted'/
    .exec(sansCommentaires);
  const volume = /where owner_id = new\.owner_id\s+and le >= pg_catalog\.clock_timestamp\(\) - interval '24 hours'\) >= (\d+) then\s+raise exception using errcode = 'PT429', message = 'leo_calls_volume_exhausted'/
    .exec(sansCommentaires);
  verdicts.plafondAppelsCoincide = Boolean(quota) && Number(quota[1]) === PLAFOND_APPELS;
  verdicts.plafondLignesCoincide = Boolean(volume) && Number(volume[1]) === PLAFOND_LIGNES;
  verdicts.fenetreVingtQuatreHeures = (sansCommentaires.match(/interval '24 hours'/g) || []).length === 2 && // volume + plafond d'appels

    FENETRE_APPELS_MS === 24 * 3600 * 1000;
  const phases = /check \(phase in \(([^)]*)\)\)/.exec(sansCommentaires);
  verdicts.phasesCoincident = Boolean(phases) &&
    JSON.stringify(phases[1].split(',').map((p) => p.trim().replace(/'/g, '')).sort()) ===
    JSON.stringify([...PHASES_APPEL].sort());
  verdicts.bornesTexteCoincident =
    new RegExp(`char_length\\(quadrant\\) between 1 and ${MAX_QUADRANT}\\)`).test(sansCommentaires) &&
    new RegExp(`char_length\\(modele\\) between 1 and ${MAX_MODELE}\\)`).test(sansCommentaires);
  verdicts.bornesTokensCoincident =
    (sansCommentaires.match(new RegExp(`between 0 and ${MAX_TOKENS_COMPTES}\\b`, 'g')) || []).length === 2;
}

// ── 2. La forme de la migration : ce qui garde la table ──────────────────────
verdicts.rlsEtPolitiques = /alter table public\.leo_appels enable row level security/.test(sansCommentaires) &&
  /for select using \(owner_id = \(select auth\.uid\(\)\)\)/.test(sansCommentaires) &&
  /for insert with check \(owner_id = \(select auth\.uid\(\)\)\)/.test(sansCommentaires);
verdicts.journalNeSeCorrigePas = /revoke update, delete, truncate on public\.leo_appels from authenticated/.test(sansCommentaires) &&
  /revoke all on public\.leo_appels from anon/.test(sansCommentaires);
verdicts.plafondAtomique = /pg_advisory_xact_lock/.test(sansCommentaires) &&
  /before insert on public\.leo_appels for each row/.test(sansCommentaires) &&
  /security invoker set search_path = ''/.test(sansCommentaires) &&
  /revoke all on function leo_private\.appels_plafond\(\) from public, anon, authenticated/.test(sansCommentaires);
verdicts.horlogeDeLaBase = /new\.le := pg_catalog\.clock_timestamp\(\)/.test(sansCommentaires);
// S4 : une trace = une tentative + une issue ; l'écriture se limite aux colonnes posées par le code.
verdicts.uneTenteeUneIssue =
  /create unique index leo_appels_une_tentee on public\.leo_appels \(owner_id, trace_id\)\s+where phase = 'tentee'/.test(sansCommentaires) &&
  /create unique index leo_appels_une_issue on public\.leo_appels \(owner_id, trace_id\)\s+where phase in \('reussie', 'echouee'\)/.test(sansCommentaires);
verdicts.ecritureParColonnes = /revoke insert on public\.leo_appels from authenticated/.test(sansCommentaires) &&
  /grant insert \(trace_id, quadrant, modele, phase, tokens_entree, tokens_sortie\)\s+on public\.leo_appels to authenticated/.test(sansCommentaires) &&
  !/grant insert \([^)]*\b(id|owner_id|le)\b[^)]*\)/.test(sansCommentaires);
// S3 : le plafond COMPTE à travers la policy SELECT — aucune migration ultérieure ne la touche
// sans repasser ici (le trigger est `security invoker`, un SELECT restreint rendrait le compte faux).
{
  const dossier = new URL('../supabase/migrations/', import.meta.url);
  const posterieures = readdirSync(dossier).filter((f) => f.endsWith('.sql') && f > '20261019160000_leo_appels.sql');
  const touche = posterieures.filter((f) => {
    const t = readFileSync(new URL(f, dossier), 'utf8').split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');
    return /(policy\s+\S+\s+on\s+public\.leo_appels|alter\s+policy\s+\S+\s+on\s+public\.leo_appels|revoke\s+(all|select)[^;]*public\.leo_appels|drop\s+policy[^;]*leo_appels|alter\s+table\s+public\.leo_appels[^;]*(no\s+force|disable))/i.test(t);
  });
  verdicts.aucuneMigrationNeTouchePolicySelect = touche.length === 0;
  verdicts.commentaireSelectPresent = /LE PLAFOND COMPTE À TRAVERS CETTE POLICY/.test(sql);
}
// Zéro contenu par la FORME des colonnes : aucune colonne ne peut porter un texte libre.
{
  const bloc = /create table public\.leo_appels \(([\s\S]*?)\n\);/.exec(sansCommentaires)?.[1] || '';
  const colonnes = [...bloc.matchAll(/^\s{2}([a-z_]+)\s+(uuid|text|integer|timestamptz)\b/gm)].map((m) => m[1]);
  verdicts.colonnesExactes = JSON.stringify(colonnes) ===
    JSON.stringify(['id', 'owner_id', 'trace_id', 'quadrant', 'modele', 'phase', 'tokens_entree', 'tokens_sortie', 'le']);
  const textes = [...bloc.matchAll(/^\s{2}([a-z_]+)\s+text\b/gm)].map((m) => m[1]);
  // Un texte est soit BORNÉ en longueur, soit une LISTE FERMÉE (`phase`) : jamais libre.
  verdicts.textesTousBornes = textes.length === 3 && textes.every((t) =>
    new RegExp(`char_length\\(${t}\\) between 1 and \\d+`).test(bloc) || new RegExp(`${t}\\s+text not null check \\(${t} in \\(`).test(bloc));
}

// ── 3. Les tokens : des entiers bornés, ou null — jamais de NaN en base ──────
verdicts.jetonsSommes = JSON.stringify(jetonsDe({ input_tokens: 1000, cache_creation_input_tokens: 200, cache_read_input_tokens: 50, output_tokens: 300 }))
  === JSON.stringify({ entree: 1250, sortie: 300 });
verdicts.jetonsPartiels = JSON.stringify(jetonsDe({ input_tokens: 10, output_tokens: 5 })) === JSON.stringify({ entree: 10, sortie: 5 });
verdicts.jetonsIllisibles = [undefined, null, 'x', 42, [], {}, { input_tokens: NaN, output_tokens: -1 },
  { input_tokens: 1.5, output_tokens: '7' }, { input_tokens: 10, cache_read_input_tokens: -2, output_tokens: 3 }]
  .every((u) => {
    const r = jetonsDe(u);
    return (r.entree === null || Number.isInteger(r.entree)) && (r.sortie === null || Number.isInteger(r.sortie));
  }) && jetonsDe({ input_tokens: 10, cache_read_input_tokens: -2, output_tokens: 3 }).entree === null;
verdicts.jetonsBornes = jetonsDe({ input_tokens: 9e15, output_tokens: 9e15 }).entree === MAX_TOKENS_COMPTES &&
  jetonsDe({ output_tokens: 9e15 }).sortie === MAX_TOKENS_COMPTES;

// ── 4. ouvrirAppel — un client factice qui enregistre ────────────────────────
function clientFactice({ code = null, status, lance = false, pendu = false } = {}) {
  const inserts = [];
  return {
    inserts,
    from(table) {
      if (lance) throw new Error('paul@exemple.fr : panne');
      return {
        insert(row) {
          inserts.push({ table, row });
          if (pendu) return new Promise(() => {});
          return Promise.resolve({
            error: code ? { code, message: 'paul@exemple.fr : détail brut' } : null,
            ...(status ? { status } : {})
          });
        }
      };
    }
  };
}
const T0 = Date.parse('2026-10-19T12:00:00Z');
const localVide = () => ({ horodatages: [] });
const journaux = [];
async function espionne(fn) {
  const avant = console.error;
  console.error = (...a) => journaux.push(a.join(' '));
  try { return await fn(); } finally { console.error = avant; }
}

{
  // 4a. Chemin nominal : UNE ligne, quatre clés, phase 'tentee', aucune clé de contenu.
  const c = clientFactice();
  const r = await ouvrirAppel(c, { quadrant: 'riven', modele: 'claude-opus-4-8', maintenant: T0, local: localVide() });
  verdicts.nominal = r.ok === true && r.mode === 'base' && UUID.test(r.traceId);
  verdicts.uneLigneQuatreCles = c.inserts.length === 1 && c.inserts[0].table === 'leo_appels' &&
    JSON.stringify(Object.keys(c.inserts[0].row).sort()) === JSON.stringify(['modele', 'phase', 'quadrant', 'trace_id']) &&
    c.inserts[0].row.phase === 'tentee' && c.inserts[0].row.trace_id === r.traceId;
  verdicts.aucuneCleDePropriete = !('owner_id' in c.inserts[0].row); // la base pose auth.uid()
}
{
  // 4b. Le plafond (PT429) REFUSE — 429, cause en mot fermé, et ne dégrade PAS vers le local.
  const local = localVide();
  const r = await espionne(() => ouvrirAppel(clientFactice({ code: 'PT429' }), { quadrant: 'riven', modele: 'm', maintenant: T0, local }));
  verdicts.plafondRefuse = r.ok === false && r.status === 429 && r.cause === CAUSE_PLAFOND && MOTIF_CAUSE_IA.test(r.cause);
  verdicts.plafondNeDegradePas = local.horodatages.length === 0;
  verdicts.refusSansContenu = !/@|paul/i.test(JSON.stringify(r));
}
{
  // 4b-bis. Un 429 HTTP, même sans le code PT429, se lit comme un refus — le doute penche vers le refus.
  const local = localVide();
  const r = await espionne(() => ouvrirAppel(clientFactice({ code: 'XX', status: 429 }), { quadrant: 'riven', modele: 'm', maintenant: T0, local }));
  verdicts.status429SeLitCommeUnRefus = r.ok === false && r.status === 429 && r.cause === CAUSE_PLAFOND && local.horodatages.length === 0;
  // Un autre statut d'erreur (503, 500…) ne refuse pas : il dégrade.
  const autre = await espionne(() => ouvrirAppel(clientFactice({ code: 'XX', status: 503 }), { quadrant: 'riven', modele: 'm', maintenant: T0, local: localVide() }));
  verdicts.status503Degrade = autre.ok === true && autre.mode === 'local';
}
{
  // 4b-ter. Le repli est tenu PAR PROPRIÉTAIRE : épuiser le repli de A ne touche pas B ; A reste refusé.
  let refusA = null; let acceptesB = 0;
  await espionne(async () => {
    for (let i = 0; i < PLAFOND_LOCAL + 2; i += 1) {
      const a = await ouvrirAppel(clientFactice({ code: '42P01' }), { quadrant: 'riven', modele: 'm', proprietaire: 'proprio-a', maintenant: T0 + i });
      if (!a.ok) refusA = a;
    }
    for (let i = 0; i < 3; i += 1) {
      const b = await ouvrirAppel(clientFactice({ code: '42P01' }), { quadrant: 'riven', modele: 'm', proprietaire: 'proprio-b', maintenant: T0 + i });
      if (b.ok) acceptesB += 1;
    }
  });
  verdicts.replisIndependantsParProprietaire = Boolean(refusA) && refusA.status === 429 && acceptesB === 3;
  // La table des états est bornée : 200 propriétaires distincts ne la font pas grossir sans fin
  // (l'ancien état est oublié, jamais un état partagé qui desserre ou qui plante).
  let toutOk = true;
  await espionne(async () => {
    for (let i = 0; i < 200; i += 1) {
      const r = await ouvrirAppel(clientFactice({ code: '42P01' }), { quadrant: 'riven', modele: 'm', proprietaire: `p-${i}`, maintenant: T0 });
      if (!r.ok || r.mode !== 'local') toutOk = false;
    }
  });
  verdicts.tableDesEtatsBornee = toutOk && nombreEtatsLocaux() > 0 && nombreEtatsLocaux() <= 50;
}
{
  // 4c. Une AUTRE panne du journal dégrade vers le plafond local — et le dit, par code seul.
  journaux.length = 0;
  const local = localVide();
  let acceptes = 0; let refus = null;
  await espionne(async () => {
    for (let i = 0; i < PLAFOND_LOCAL + 5; i += 1) {
      const r = await ouvrirAppel(clientFactice({ code: '42P01' }), { quadrant: 'riven', modele: 'm', maintenant: T0 + i, local });
      if (r.ok) { acceptes += 1; if (r.mode !== 'local' || r.traceId !== null) acceptes = -1e9; } else if (!refus) refus = r;
    }
  });
  verdicts.degradeAccepteExactementLePlafondLocal = acceptes === PLAFOND_LOCAL;
  verdicts.degradeRefuseAuDela = Boolean(refus) && refus.status === 429 && refus.cause === CAUSE_PLAFOND;
  verdicts.degradeEstDit = journaux.some((l) => /leo\.appels\.degrade 42P01$/.test(l));
  verdicts.journauxSansContenu = journaux.length > 0 && journaux.every((l) => !/@|paul|détail|brut/i.test(l));
  // La fenêtre glisse : 24 h + 1 ms plus tard, le local repasse.
  const r = await espionne(() => ouvrirAppel(clientFactice({ code: '42P01' }), {
    quadrant: 'riven', modele: 'm', maintenant: T0 + FENETRE_APPELS_MS + PLAFOND_APPELS + 10, local
  }));
  verdicts.localGlisse = r.ok === true && r.mode === 'local';
}
{
  // 4d. Le client qui LÈVE, et celui qui reste PENDU : jamais une exception, jamais une attente infinie.
  const lance = await espionne(() => ouvrirAppel(clientFactice({ lance: true }), { quadrant: 'riven', modele: 'm', maintenant: T0, local: localVide() }));
  verdicts.clientQuiLeveDegrade = lance.ok === true && lance.mode === 'local';
  const t = Date.now();
  const pendu = await espionne(() => ouvrirAppel(clientFactice({ pendu: true }), { quadrant: 'riven', modele: 'm', maintenant: T0, local: localVide(), delaiMs: 30 }));
  verdicts.clientPenduDegrade = pendu.ok === true && pendu.mode === 'local' && Date.now() - t < 2000;
  verdicts.clientAbsentDegrade = (await espionne(() => ouvrirAppel(undefined, { quadrant: 'riven', modele: 'm', maintenant: T0, local: localVide() }))).mode === 'local';
}
{
  // 4e. Entrées absurdes : jamais de ligne posée avec un quadrant vide ; modèle illisible → « inconnu ».
  const c = clientFactice();
  const vide = await espionne(() => ouvrirAppel(c, { quadrant: '', modele: 'm', maintenant: T0, local: localVide() }));
  verdicts.quadrantVideNePoseRien = c.inserts.length === 0 && vide.mode === 'local';
  const c2 = clientFactice();
  await ouvrirAppel(c2, { quadrant: 'x'.repeat(500), modele: 42, maintenant: T0, local: localVide() });
  verdicts.bornesTexteTenues = c2.inserts[0].row.quadrant.length === MAX_QUADRANT && c2.inserts[0].row.modele === 'inconnu';
  const c3 = clientFactice();
  await ouvrirAppel(c3, { quadrant: 'riven', modele: 'y'.repeat(500), maintenant: T0, local: localVide() });
  verdicts.modeleBorne = c3.inserts[0].row.modele.length === MAX_MODELE;
}

// ── 5. cloreAppel — best-effort, jamais bloquant, jamais de contenu ──────────
{
  const trace = '11111111-1111-4111-8111-111111111111';
  const c = clientFactice();
  const r = await cloreAppel(c, trace, {
    phase: 'reussie', quadrant: 'riven', modele: 'claude-opus-4-8',
    usage: { input_tokens: 4000, output_tokens: 250, contenu: 'secret', texte: 'ne doit jamais passer' }
  });
  verdicts.clotureNominale = r.ok === true && c.inserts.length === 1 && c.inserts[0].row.phase === 'reussie' &&
    c.inserts[0].row.tokens_entree === 4000 && c.inserts[0].row.tokens_sortie === 250 && c.inserts[0].row.trace_id === trace;
  verdicts.clotureSansContenu = !JSON.stringify(c.inserts).includes('secret') && !JSON.stringify(c.inserts).includes('jamais passer') &&
    JSON.stringify(Object.keys(c.inserts[0].row).sort()) ===
    JSON.stringify(['modele', 'phase', 'quadrant', 'tokens_entree', 'tokens_sortie', 'trace_id']);
  const echec = clientFactice();
  await cloreAppel(echec, trace, { phase: 'echouee', quadrant: 'riven', modele: 'm' });
  verdicts.clotureEchouee = echec.inserts[0].row.phase === 'echouee' && echec.inserts[0].row.tokens_entree === null;
  // Refus de ce qui n'est pas une issue, d'une trace absente (mode local), d'un quadrant vide : rien n'est posé.
  const rien = clientFactice();
  const refus = [
    await cloreAppel(rien, trace, { phase: 'tentee', quadrant: 'riven', modele: 'm' }),
    await cloreAppel(rien, trace, { phase: 'inventee', quadrant: 'riven', modele: 'm' }),
    await cloreAppel(rien, null, { phase: 'reussie', quadrant: 'riven', modele: 'm' }),
    await cloreAppel(rien, trace, { phase: 'reussie', quadrant: '', modele: 'm' })
  ];
  verdicts.clotureRefusees = refus.every((x) => x.ok === false) && rien.inserts.length === 0;
  // Un échec de la clôture ne remonte JAMAIS : ni erreur de base, ni exception, ni attente infinie.
  const pannes = await espionne(async () => [
    await cloreAppel(clientFactice({ code: 'XX000' }), trace, { phase: 'reussie', quadrant: 'riven', modele: 'm' }),
    await cloreAppel(clientFactice({ lance: true }), trace, { phase: 'reussie', quadrant: 'riven', modele: 'm' }),
    await cloreAppel(clientFactice({ pendu: true }), trace, { phase: 'reussie', quadrant: 'riven', modele: 'm', delaiMs: 30 })
  ]);
  verdicts.clotureNeCasseJamais = pannes.every((x) => x.ok === false);
}

// ── 6. Le câblage dans la route : l'ordre EST la garantie ────────────────────
{
  const i = (s) => route.indexOf(s);
  const idx = {
    etat: i('validerEtatQuadrant(corps.etat)'), appel: i('await ouvrirAppel('),
    sdk: i('new Anthropic('), create: i('client.messages.create('),
    clo1: i("phase: 'reussie'"), clo2: i("phase: 'echouee'"), texte: i('const texte = extraireTexte('),
    catchBloc: i('} catch (erreur) {')
  };
  verdicts.cablageTrouve = Object.values(idx).every((n) => n > 0);
  // Après TOUTES les validations (une requête invalide ne consomme pas le plafond), AVANT le coût.
  verdicts.ouvertureApresValidations = idx.etat > 0 && idx.appel > idx.etat;
  verdicts.ouvertureAvantLeCout = idx.appel < idx.sdk && idx.appel < idx.create;
  // La clôture : après l'appel payé et avant de lire la réponse ; l'échec dans le catch.
  verdicts.clotureReussieApresLAppel = idx.clo1 > idx.create && idx.clo1 < idx.texte;
  verdicts.clotureEchoueeDansLeCatch = idx.clo2 > idx.catchBloc;
  verdicts.refusRendu429AvecCause = /if \(!appel\.ok\) return fail\(res, appel\.status, appel\.message, \{ cause: appel\.cause \}\);/.test(route);
  // S2 : aucune relance automatique du SDK — chacune serait une requête facturée hors plafond.
  verdicts.aucuneRelanceFacturee = /new Anthropic\(\{[^}]*maxRetries: 0\s*\}\)/.test(route) && !/maxRetries:\s*[1-9]/.test(route);
  // S1 : le repli local est DIT dans la réponse (les deux sorties de succès) et par propriétaire.
  verdicts.repliLocalDitDansLaReponse = /appel\.mode === 'local' \? \{ journal: 'local' \} : \{\}/.test(route) &&
    (route.match(/\.\.\.journal/g) || []).length === 2;
  verdicts.repliParProprietaire = /ouvrirAppel\(auth\.client, \{ quadrant, modele, proprietaire: auth\.user\.id \}\)/.test(route);
  verdicts.memeModeleQueLAppel = /const modele = process\.env\.LEO_MODELE \|\| LEO_MODELE;/.test(route) && /model: modele,/.test(route);
  // Les tokens, jamais le contenu : la clôture ne reçoit ni les messages, ni la réponse.
  const bloc = /await cloreAppel\(auth\.client, appel\.traceId, \{[\s\S]*?\}\);/.exec(route)?.[0] || '';
  verdicts.clotureSansContenuDansLaRoute = bloc.length > 0 && !/messages|texte|reponse\.content|corps/.test(bloc);
}

// ── 7. La cause « plafond » : dite en mot fermé, front et serveur ────────────
verdicts.causeDansLaListeFermee = MOTIF_CAUSE_IA.test(CAUSE_PLAFOND) && CAUSE_PLAFOND === 'ia plafond';
verdicts.frontDitLePlafond = front.includes("cause === 'ia plafond'") && /plafond d'appels sur 24 h/.test(front) &&
  front.includes('|plafond)$/');
// S8 : Léo est une femme (accords au féminin) ; S1 : le repli local se dit à l'écran.
verdicts.frontAuFeminin = /elle reprendra seule/.test(front) && !/il reprendra seul/.test(front);
verdicts.frontDitLeRepliLocal = /data\.journal === 'local'/.test(front) && /journal des appels de Léo est injoignable/.test(front);
verdicts.autresCausesInchangees = ['ia 401', 'ia 429', 'ia 400 crédit', 'ia délai', 'ia réseau', 'ia vide'].every((c) => MOTIF_CAUSE_IA.test(c)) &&
  !MOTIF_CAUSE_IA.test('ia plafond de verre') && !MOTIF_CAUSE_IA.test('plafond');

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LEO-APPELS OK' : 'UNIT-LEO-APPELS ECHEC');
process.exit(ok ? 0 : 1);
