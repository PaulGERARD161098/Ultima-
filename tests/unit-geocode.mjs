// Unitaires /api/geocode (Node pur, zéro réseau, zéro navigateur) :
// validation, construction d'URL, projection, garde de débit, handler complet
// avec fetch injecté (stub Nominatim), auth, 429/5xx amont, PII jamais loggée.
import {
  validateGeocodeQuery,
  buildNominatimUrl,
  mapNominatimResults,
  creerGardeDebit,
} from '../api/_lib/geocode.js';
import handler from '../api/geocode.js';

const verdicts = {};
const dodo = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Espion console.error : la query (PII) ne fuit jamais ----------
const journalErreurs = [];
const consoleErrorOriginal = console.error;
console.error = (...args) => { journalErreurs.push(args.map(String).join(' ')); };

// ---------- validateGeocodeQuery ----------

const vAbsent = validateGeocodeQuery({});
const vCourt = validateGeocodeQuery({ q: 'ab' });
const vLong = validateGeocodeQuery({ q: 'x'.repeat(201) });
const vControle = validateGeocodeQuery({ q: '12 rue\x00 de la Paix' });
const vOk = validateGeocodeQuery({ q: '  12 rue de la Paix, Paris  ' });
verdicts.validationQ = Boolean(vAbsent.error && vCourt.error && vLong.error &&
  vControle.error && !vOk.error && vOk.value.q === '12 rue de la Paix, Paris');

const vLimites = ['0', '6', '2.5', 'x'].map((l) => validateGeocodeQuery({ q: 'Lille', limit: l }));
const vLimiteDefaut = validateGeocodeQuery({ q: 'Lille' });
const vLimiteTrois = validateGeocodeQuery({ q: 'Lille', limit: '3' });
verdicts.validationLimit = vLimites.every((v) => Boolean(v.error)) &&
  vLimiteDefaut.value?.limit === 5 && vLimiteTrois.value?.limit === 3;

// ---------- buildNominatimUrl ----------

const url = buildNominatimUrl('12 rue de la Paix, Élancourt', 3);
verdicts.urlNominatim = url.startsWith('https://nominatim.openstreetmap.org/search?q=') &&
  url.includes('format=jsonv2') && url.includes('countrycodes=fr') &&
  url.includes('addressdetails=0') && url.includes('limit=3') &&
  url.includes('accept-language=fr') &&
  url.includes(encodeURIComponent('12 rue de la Paix, Élancourt'));

// ---------- mapNominatimResults ----------

const projete = mapNominatimResults([
  { display_name: '12 Rue de la Paix, 75002 Paris, France', lat: '48.86', lon: '2.33', type: 'house', place_id: 42, licence: 'ODbL', boundingbox: [1, 2, 3, 4] },
  { display_name: 'Hors bornes', lat: '999', lon: '2.33', type: 'house' },
]);
verdicts.mapping = Array.isArray(projete) && projete.length === 1 &&
  projete[0].label === '12 Rue de la Paix, 75002 Paris, France' &&
  projete[0].lat === 48.86 && projete[0].lon === 2.33 && projete[0].type === 'house' &&
  !('place_id' in projete[0]) && !('licence' in projete[0]) && !('boundingbox' in projete[0]);
verdicts.mappingVide = Array.isArray(mapNominatimResults([])) &&
  mapNominatimResults([]).length === 0 && mapNominatimResults({ pas: 'un tableau' }) === null;

// ---------- creerGardeDebit ----------

const garde = creerGardeDebit(1000);
verdicts.gardeDebit = garde(10000) === true && garde(10500) === false && garde(11100) === true;

// ---------- Handler complet (fetch injecté) ----------

const REPONSE_NOMINATIM = [
  { display_name: '12 Rue de la Paix, 75002 Paris, France', lat: '48.86', lon: '2.33', type: 'house', place_id: 42 },
];

function fauxRes() {
  return {
    statusCode: 0,
    entetes: {},
    corps: null,
    setHeader(nom, valeur) { this.entetes[String(nom).toLowerCase()] = String(valeur); },
    end(texte) { this.corps = JSON.parse(texte); },
  };
}

function fauxReq(surcharges) {
  return {
    method: 'GET',
    headers: { authorization: 'Bearer jeton-de-test' },
    query: { q: '12 rue de la Paix, Paris', limit: '3' },
    ...surcharges,
  };
}

// Fabrique un faux fetch : compte ses appels, rejoue la réponse fournie.
function fauxFetch(config) {
  const fn = async (urlAppelee, options) => {
    fn.appels.push({ url: urlAppelee, options });
    if (config.rejette) { const e = new Error('abort'); e.name = 'AbortError'; throw e; }
    return {
      ok: config.status === 200,
      status: config.status,
      headers: { get: (n) => (config.entetes || {})[String(n).toLowerCase()] || null },
      json: async () => config.corps,
    };
  };
  fn.appels = [];
  return fn;
}

// authImpl injecté : jeton réputé valide (évite tout appel réseau à Supabase
// Auth dans l'unitaire). Le rejet d'un jeton invalide est couvert par unit-auth.
const authOk = async () => ({ status: 'ok', client: {}, user: { id: 'u-test' } });

// 405 — méthode non GET (n'atteint ni l'auth ni la garde).
{
  const res = fauxRes();
  await handler(fauxReq({ method: 'POST' }), res, fauxFetch({ status: 200, corps: [] }));
  verdicts.methode405 = res.statusCode === 405 && res.entetes.allow === 'GET';
}

// 401 — sans Authorization : le stub Nominatim n'est JAMAIS appelé.
{
  const res = fauxRes();
  const stub = fauxFetch({ status: 200, corps: REPONSE_NOMINATIM });
  await handler(fauxReq({ headers: {} }), res, stub);
  verdicts.auth401 = res.statusCode === 401 && stub.appels.length === 0;
}

// 400 — q/limit invalides (avec auth) : pas d'appel amont, garde intacte.
{
  const cas = [
    fauxReq({ query: { q: 'ab' } }),
    fauxReq({ query: { q: 'Lille', limit: '9' } }),
    fauxReq({ query: {} }),
  ];
  let tous400 = true;
  for (const req of cas) {
    const res = fauxRes();
    const stub = fauxFetch({ status: 200, corps: [] });
    await handler(req, res, stub, authOk);
    if (res.statusCode !== 400 || res.corps.error !== 'Requête invalide' || stub.appels.length) {
      tous400 = false;
    }
  }
  verdicts.validation400 = tous400;
}

// 200 — succès : projection stricte + User-Agent + URL Nominatim attendue.
{
  const res = fauxRes();
  const stub = fauxFetch({ status: 200, corps: REPONSE_NOMINATIM });
  await handler(fauxReq(), res, stub, authOk);
  const r = res.corps?.data?.results?.[0];
  verdicts.succes200 = res.statusCode === 200 && res.corps.ok === true &&
    Array.isArray(res.corps.data.results) && res.corps.data.results.length === 1 &&
    r.label === '12 Rue de la Paix, 75002 Paris, France' &&
    r.lat === 48.86 && r.lon === 2.33 && r.type === 'house' && !('place_id' in r);
  const appel = stub.appels[0];
  verdicts.enTetesSortants = appel.url.includes('nominatim.openstreetmap.org') &&
    appel.url.includes('limit=3') &&
    typeof appel.options.headers['User-Agent'] === 'string' &&
    appel.options.headers['User-Agent'].includes('Ultima');
}

// 429 local — deuxième appel < 1 s : rejet AVANT tout appel Nominatim.
{
  const res = fauxRes();
  const stub = fauxFetch({ status: 200, corps: REPONSE_NOMINATIM });
  await handler(fauxReq(), res, stub, authOk);
  verdicts.gardeGlobale429 = res.statusCode === 429 && res.corps.error === 'Trop de requêtes' &&
    res.entetes['retry-after'] === '1' && stub.appels.length === 0;
}

// 503 — Nominatim répond 429 : propagation du Retry-After amont.
{
  await dodo(1050);
  const res = fauxRes();
  const stub = fauxFetch({ status: 429, corps: [], entetes: { 'retry-after': '7' } });
  await handler(fauxReq(), res, stub, authOk);
  verdicts.amont429 = res.statusCode === 503 &&
    res.corps.error === 'Service de géocodage indisponible' &&
    res.entetes['retry-after'] === '7' && stub.appels.length === 1;
}

// 503 — Nominatim 500.
{
  await dodo(1050);
  const res = fauxRes();
  await handler(fauxReq(), res, fauxFetch({ status: 500, corps: [] }), authOk);
  verdicts.amont500 = res.statusCode === 503;
}

// 503 — timeout/abort (le fetch rejette).
{
  await dodo(1050);
  const res = fauxRes();
  await handler(fauxReq(), res, fauxFetch({ rejette: true }), authOk);
  verdicts.amontTimeout = res.statusCode === 503;
}

// 503 — corps non-tableau (réponse illisible).
{
  await dodo(1050);
  const res = fauxRes();
  await handler(fauxReq(), res, fauxFetch({ status: 200, corps: { pas: 'un tableau' } }), authOk);
  verdicts.amontIllisible = res.statusCode === 503;
}

// 200 — [] amont : réponse valide, pas une erreur.
{
  await dodo(1050);
  const res = fauxRes();
  await handler(fauxReq(), res, fauxFetch({ status: 200, corps: [] }), authOk);
  verdicts.zeroResultat200 = res.statusCode === 200 && res.corps.ok === true &&
    res.corps.data.results.length === 0;
}

// ---------- PII : sur TOUT le flux ci-dessus, jamais la query ni un label ----------

console.error = consoleErrorOriginal;
verdicts.geocodeNoPiiInLogs = journalErreurs.every((ligne) =>
  !ligne.includes('Paix') && !ligne.includes('Paris') &&
  !ligne.includes('48.86') && !ligne.includes('2.33'));

// ---------- Bilan ----------

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-GEOCODE OK' : 'UNIT-GEOCODE ECHEC');
process.exit(ok ? 0 : 1);
