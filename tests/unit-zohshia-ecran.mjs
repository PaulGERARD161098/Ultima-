// ZOH SHIA à l'écran — ce qui empêche le badge de mentir ou de fuir (04/10/2026).
//
// Les réponses au pre-mortem de la boucle « un badge par techno » :
//   · LA CARTE FUIT → /api/zohshia : 401 sans jeton, 503 sans réglage du
//     propriétaire (FERMÉ par défaut), 403 pour un compte qui n'est pas le
//     propriétaire, 200 pour lui seul. L'inscription est ouverte : « connecté »
//     ne suffit pas, et c'est ce que le cas 403 éprouve.
//   · L'ÉCRAN MONTRE UN PLAN PÉRIMÉ → les condensats des sources, recalculés ici,
//     doivent égaler ceux de la donnée publiée.
//   · DU TEXTE DEVIENT DU CODE → la donnée n'est faite que de blocs de texte
//     (types fermés) ; le client n'utilise jamais innerHTML.
//   · LE BADGE EST FAUX → libellé exact dicté par Paul, trois onglets non vides.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from '../api/zohshia.js';
import { proprietaires } from '../api/_lib/proprietaire.js';
import donnee from '../api/_lib/zohshia-technos.mjs';
import { construire, enBlocs } from '../zohshia/publier.mjs';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const verdicts = {};
const dit = (nom, ok) => { verdicts[nom] = ok === true; };

// ---- La route, contre un client d'authentification simulé ------------------
const PAUL = '11111111-2222-4333-8444-555555555555';
const INTRUS = '99999999-8888-4777-8666-555555555555';
const client = (id) => () => ({
  status: 'ok',
  client: { auth: { getUser: async () => (id ? { data: { user: { id } }, error: null } : { data: null, error: { status: 401 } }) } },
});
async function appeler({ jeton = true, id = PAUL, env = { ULTIMA_PROPRIETAIRES: PAUL }, methode = 'GET' } = {}) {
  const res = { statusCode: 200, headers: {}, corps: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.corps = b; return this; },
    end(b) { if (b) this.corps = JSON.parse(b); return this; },
  };
  const req = { method: methode, headers: jeton ? { authorization: 'Bearer jeton-factice' } : {} };
  const makeClient = jeton ? client(id) : () => ({ status: 'unauthenticated' });
  await handler(req, res, { makeClient, env });
  return res;
}
const sansJeton = await appeler({ jeton: false });
dit('sansSession401', sansJeton.statusCode === 401 && !JSON.stringify(sansJeton.corps).includes('technos'));
const jetonInvalide = await appeler({ id: null });
dit('jetonInvalide401', jetonInvalide.statusCode === 401);
const sansReglage = await appeler({ env: {} });
dit('reglageAbsentFerme503', sansReglage.statusCode === 503 && !JSON.stringify(sansReglage.corps).includes('technos'));
const reglageMalForme = await appeler({ env: { ULTIMA_PROPRIETAIRES: `${PAUL},pas-un-uuid` } });
dit('reglageMalFormeFerme503', reglageMalForme.statusCode === 503);
const intrus = await appeler({ id: INTRUS });
dit('compteNonProprietaire403', intrus.statusCode === 403 && !JSON.stringify(intrus.corps).includes('technos'));
const paul = await appeler();
dit('proprietaire200', paul.statusCode === 200 && Array.isArray(paul.corps?.data?.technos) && paul.corps.data.technos.length >= 1);
dit('pasDeCache', String(paul.headers['cache-control'] || '').includes('no-store'));
const post = await appeler({ methode: 'POST' });
dit('lectureSeule405', post.statusCode === 405);
dit('reglageLuSansCasse', JSON.stringify(proprietaires({ ULTIMA_PROPRIETAIRES: ` ${PAUL.toUpperCase()} ` })) === JSON.stringify([PAUL]));

// ---- Le badge ---------------------------------------------------------------
const reno = donnee.technos.find((t) => t.id === 'renodevis');
dit('badgeExact', reno?.badge === 'Outil de création de devis / relance automatique');
dit('troisOngletsNonVides', reno?.onglets.map((o) => o.titre).join('|') === 'Ce que fait la techno|Check-list du pro|Mise en service'
  && reno.onglets.every((o) => o.blocs.length >= 3));
const texte = JSON.stringify(donnee);
dit('checklistALecran', /coefficient_produits/.test(texte) && /demi_journee_ht/.test(texte));

// ---- La fraîcheur : la donnée publiée = les sources du jour -----------------
const recalcul = construire();
dit('donneeAJour', JSON.stringify(recalcul.sources) === JSON.stringify(donnee.sources)
  && Object.keys(donnee.sources).length >= 3);

// ---- Le texte reste du texte ------------------------------------------------
const TYPES = new Set(['h2', 'h3', 'p', 'code', 'note', 'liste', 'table']);
dit('blocsDeTypesFermes', donnee.technos.every((t) => t.onglets.every((o) => o.blocs.every((b) => TYPES.has(b.t)))));
const js = readFileSync(join(RACINE, 'js', 'zohshia.js'), 'utf8');
dit('clientSansInnerHTML', !/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(js.replace(/\/\/.*$/gm, '')));
// Le découpeur, éprouvé sur un cas dont on connaît la réponse — et sur son
// miroir hostile : une balise reste un TEXTE.
const essai = enBlocs('## Titre\n\nUn **gras** et `code`.\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n- un\n- deux\n\n<script>x</script>');
dit('decoupeurEprouve', essai.map((b) => b.t).join() === 'h2,p,table,liste,p'
  && essai[1].r.some(([t, s]) => t === 'gras' && s === 'b') && essai[2].lignes[0][1][0][0] === '2'
  && essai[4].r[0][0] === '<script>x</script>');

const echecs = Object.entries(verdicts).filter(([, ok]) => !ok).map(([k]) => k);
console.log(JSON.stringify(verdicts, null, 2));
if (echecs.length) { console.log(`=== ${echecs.length} VERDICT(S) EN ÉCHEC ===\n  ${echecs.join('\n  ')}`); process.exit(1); }
console.log('=== UNIT-ZOHSHIA-ECRAN OK ===');
