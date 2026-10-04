// Unitaires du garde PII middleware (Node pur, zéro réseau, zéro navigateur) :
// AD-0. Prouve que /adramelech, /memoire et tout *.md ne sont JAMAIS servis en
// public — 404 sans contenu — et que le reste du site n'est pas régressé.
// Cas de fermeture décisif : registres bruts + variantes d'URL encodées → 404.
import middleware, { estCheminPrive } from '../middleware.js';

const verdicts = {};

// ---------- 1. estCheminPrive : chemins privés refusés ----------
const privesAttendus = [
  '/adramelech/carto-idees',        // cleanUrls retire .html
  '/adramelech/carto-idees.html',
  '/adramelech/IDEES.md',
  '/adramelech/CADRAGE-ADRAMELECH.md',
  '/memoire',
  '/memoire/PROFIL-PAUL.md',
  '/memoire/RADAR.md',
  '/CLAUDE.md',
  '/CADRAGE-ULTIMA.md',
  '/CADRAGE-CONSOLE.md',
  '/ROADMAP-SECURITE.md',
  '/adramelech%2fIDEES.md',         // %2F encodé
  '/adramelech%252fcarto-idees',    // double-encodage
  '/adramelech%25252fIDEES.md',     // triple-encodage (borne des 3 décodages)
  '/Adramelech/IDEES.MD',           // casse mixte
  '/CLAUDE.md%20',                  // S1 : espace parasite en fin
  '/CLAUDE.md.',                    // S1 : point parasite en fin
  '/adramelech%5ccarto-idees',      // S2 : backslash encodé comme séparateur
  '/js/..%2fadramelech%2fIDEES.md', // traversal encodé → doc privée
  // FINUBAR (2026-08-21) — `finubar/` porte l'état agrégé des huit dépôts.
  // Vercel sert tout fichier commité en statique : sans le préfixe privé, ces
  // deux-là sont la feuille de route du business, en lecture libre.
  '/finubar/macro.json',
  '/finubar/macro.mjs',
  '/finubar/depots.json',
  '/finubar/agreger.mjs',
  '/finubar/collecter.mjs',
  '/finubar/rappel.mjs',
  '/finubar/README.md',
  '/FINUBAR.md',
  '/CADRAGE-FINUBAR.md',
  '/finubar%2fmacro.json',          // %2F encodé
  '/Finubar/MACRO.JSON',            // casse mixte
  '/finubar%5cmacro.json',          // backslash encodé comme séparateur
  // ZOH SHIA (2026-10-04) — les SOURCES de la techno restent privées ; seule la
  // coque `/zohshia` (chemin exact, sans donnée) est servie.
  '/zohshia/renodevis/inventaire.json',
  '/zohshia/publier.mjs',
  '/zohshia/renodevis/base/01-socle.sql',
  '/zohshia/renodevis/collecter.mjs',
  '/zohshia/renodevis/AJOUTER-UN-ARTISAN.md',
  '/ZohShia/RenoDevis/INVENTAIRE.JSON', // casse mixte
  '/zohshia%2frenodevis%2finventaire.json', // %2F encodé
  '/js/..%2fzohshia%2frenodevis%2finventaire.json', // traversal encodé
];
verdicts.privesRefuses = privesAttendus.every((p) => estCheminPrive(p) === true);

// ---------- 2. estCheminPrive : chemins publics autorisés (non régression) ----------
const publicsAttendus = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/js/ciel.js',
  '/icons/marker.png',
  '/manifest.webmanifest',
  '/api/nodes',
  '/api/geocode',
];
verdicts.publicsAutorises = publicsAttendus.every((p) => estCheminPrive(p) === false);

// Garde-fou : un nom qui CONTIENT « memoire » mais n'est pas sous /memoire/ reste public.
verdicts.pasDeFauxPositif = estCheminPrive('/js/memoire-ui.js') === false &&
  estCheminPrive('/adramelech-public.html') === false;

// ---------- 2bis. Antichambre publique (diffusion Léo) : le chemin EXACT
// '/adramelech' (clean URL de la page racine adramelech.html, fail-closed
// côté client) passe — mais UNIQUEMENT lui : tout ce qui vit SOUS
// /adramelech/ reste bloqué, et /memoire reste entièrement fermé. ----------
// La coque publique de FINUBAR passe, son contenu non — même mécanique
// qu'`/adramelech`, et le même piège : ouvrir le chemin exact ne doit jamais
// ouvrir ce qui vit dessous.
// ⛔ ÉNUMÉRATION RÉELLE, ET NON UNE LISTE ÉCRITE À LA MAIN.
// La liste ci-dessus vieillit : le jour où quelqu'un dépose `finubar/notes.json`,
// aucun verdict ne le couvre et le fichier part en public sans que rien ne le
// dise. On demande donc au SYSTÈME DE FICHIERS ce qui existe vraiment, et on
// exige que le garde refuse chacun de ces chemins. Le test ne peut plus dater.
{
  const { readdirSync } = await import('node:fs');
  const racine = new URL('../', import.meta.url).pathname;
  const reels = readdirSync(racine + 'finubar').map((f) => '/finubar/' + f);
  const passants = reels.filter((c) => estCheminPrive(c) === false);
  verdicts.finubarEnumereReellement = reels.length > 0 && passants.length === 0;
  if (passants.length) console.error('⚠️ servis en public :', passants.join(', '));
  // Idem pour ce que la fonction serverless importe : ce n'est pas du code, c'est
  // la donnée, et elle ne doit être atteignable par aucun chemin HTTP.
  const libs = readdirSync(racine + 'api/_lib').map((f) => '/api/_lib/' + f);
  const libsPassants = libs.filter((c) => estCheminPrive(c) === false);
  verdicts.apiLibFerme = libs.length > 0 && libsPassants.length === 0;
  if (libsPassants.length) console.error('⚠️ _lib servis en public :', libsPassants.join(', '));
  // Et le garde-fou de non-régression : les VRAIES routes restent atteignables.
  verdicts.routesApiIntactes = ['/api/finubar', '/api/cockpit', '/api/idees', '/api/leo']
    .every((c) => estCheminPrive(c) === false);
}

verdicts.antichambreFinubar = estCheminPrive('/finubar') === false &&
  estCheminPrive('/finubar.html') === false &&
  estCheminPrive('/finubar/') === false &&
  estCheminPrive('/Finubar') === false &&
  estCheminPrive('/finubar/macro.json') === true &&
  estCheminPrive('/finubar/macro.mjs') === true &&
  estCheminPrive('/js/finubar.js') === false &&      // le module de page reste public
  estCheminPrive('/css/finubar.css') === false &&    // sa feuille aussi
  estCheminPrive('/api/finubar') === false;          // la route passe (elle a son auth)

verdicts.antichambreServie = estCheminPrive('/adramelech') === false &&
  estCheminPrive('/adramelech.html') === false &&
  estCheminPrive('/adramelech/') === false &&        // normalisé → chemin exact
  estCheminPrive('/Adramelech') === false;           // casse : même page publique
verdicts.antichambreSansDebordement =
  estCheminPrive('/adramelech/IDEES.md') === true &&
  estCheminPrive('/adramelech/carto-idees') === true &&
  estCheminPrive('/adramelech/importer-idees.mjs') === true &&
  estCheminPrive('/adramelech%2fIDEES.md') === true &&
  estCheminPrive('/memoire') === true;
// Réserves de la contre-passe (2026-07-18), figées : (a) /adramelech.md est un
// .md → bloqué AVANT l'allowlist (l'ordre des tests ne crée pas de trou) ;
// (b) les variantes à séparateur final effondré par la normalisation ('/x/',
// '/x%2f', '/x%5c', '/x.', '/x%20') matchent le chemin EXACT → servent la page
// racine publique et RIEN d'autre (aucun nouveau segment possible).
verdicts.antichambreMdBloque = estCheminPrive('/adramelech.md') === true &&
  estCheminPrive('/adramelech.MD') === true &&
  estCheminPrive('/adramelech.md%20') === true;
verdicts.antichambreTrailingCollapse =
  estCheminPrive('/adramelech%2f') === false &&   // 1 séparateur final effondré → page racine
  estCheminPrive('/adramelech%5c') === false &&
  estCheminPrive('/adramelech%20') === false &&
  estCheminPrive('/adramelech.') === false &&
  // Double séparateur final : un seul est effondré → '/adramelech/' restant
  // matche le préfixe privé → BLOQUÉ. Fail-closed assumé (la page canonique
  // /adramelech reste servie ; cette variante fait 404, jamais une fuite).
  estCheminPrive('/adramelech%2f%2f') === true;

// ---------- 3. middleware() : 404 générique sur chemin privé, sans contenu ----------
function req(path) {
  return { url: `https://ultima.example${path}`, headers: { get: () => null } };
}
{
  const r = middleware(req('/adramelech/IDEES.md'));
  const corps = await r.text();
  verdicts.middleware404Prive = r.status === 404 &&
    r.headers.get('x-middleware-next') === null &&      // le static n'est PAS servi
    r.headers.get('Content-Security-Policy') !== null && // headers sécu posés
    corps === 'Not Found';                                // corps générique, aucune idée
}
{
  const r = middleware(req('/memoire/PROFIL-PAUL.md'));
  verdicts.middleware404Memoire = r.status === 404 && r.headers.get('x-middleware-next') === null;
}

// ---------- 4. middleware() : pass-through sur chemin public (non régression) ----------
{
  const r = middleware(req('/index.html'));
  verdicts.middlewarePassthroughPublic = r.status === 200 &&
    r.headers.get('x-middleware-next') === '1' &&
    r.headers.get('Content-Security-Policy') !== null;
}
{
  const r = middleware(req('/css/app.css'));
  verdicts.middlewarePassthroughAsset = r.headers.get('x-middleware-next') === '1';
}
{
  // L'antichambre (clean URL de adramelech.html) est servie, headers sécu posés.
  const r = middleware(req('/adramelech'));
  verdicts.middlewarePassthroughAntichambre = r.status === 200 &&
    r.headers.get('x-middleware-next') === '1' &&
    r.headers.get('Content-Security-Policy') !== null;
}

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-ADRAMELECH-GUARD OK' : 'UNIT-ADRAMELECH-GUARD ECHEC');
process.exit(ok ? 0 : 1);
