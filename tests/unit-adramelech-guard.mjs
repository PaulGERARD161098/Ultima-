// Unitaires du garde PII middleware (Node pur, zéro réseau, zéro navigateur) :
// AD-0. Prouve que /adramelech, /memoire et tout *.md ne sont JAMAIS servis en
// public — 404 sans contenu — et que le reste du site n'est pas régressé.
// Cas de fermeture décisif : registres bruts + variantes d'URL encodées → 404.
import middleware, { estCheminPrive } from '../middleware.js';

const verdicts = {};

// ---------- 1. estCheminPrive : chemins privés refusés ----------
const privesAttendus = [
  '/adramelech',
  '/adramelech/',
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
];
verdicts.privesRefuses = privesAttendus.every((p) => estCheminPrive(p) === true);

// ---------- 2. estCheminPrive : chemins publics autorisés (non régression) ----------
const publicsAttendus = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/js/arbre.js',
  '/icons/marker.png',
  '/design/preview-accueil-mythologie.html',
  '/manifest.webmanifest',
  '/api/nodes',
  '/api/geocode',
];
verdicts.publicsAutorises = publicsAttendus.every((p) => estCheminPrive(p) === false);

// Garde-fou : un nom qui CONTIENT « memoire » mais n'est pas sous /memoire/ reste public.
verdicts.pasDeFauxPositif = estCheminPrive('/js/memoire-ui.js') === false &&
  estCheminPrive('/adramelech-public.html') === false;

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

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-ADRAMELECH-GUARD OK' : 'UNIT-ADRAMELECH-GUARD ECHEC');
process.exit(ok ? 0 : 1);
