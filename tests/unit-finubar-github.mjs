// Fixtures HTTP injectées : aucun accès réseau, aucun jeton nécessaire.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lireGithub, reprendreApresGithub } from '../finubar/github.mjs';
import { BALISE_DEBUT, BALISE_FIN } from '../finubar/agreger.mjs';
const sha = 'a'.repeat(40);
const depot = { depot: 'fixture/projet' };
const note = `${BALISE_DEBUT}\n\`\`\`json\n${JSON.stringify({ projet: 'Fixture', maj: '2026-09-01' })}\n\`\`\`\n${BALISE_FIN}`;
function fichierDe(texte) {
  const contenu = Buffer.from(texte);
  return { type: 'file', path: 'FINUBAR.md', encoding: 'base64',
    sha: createHash('sha1').update(`blob ${contenu.length}\0`).update(contenu).digest('hex'),
    size: contenu.length, content: contenu.toString('base64') };
}
const fichier = fichierDe(note);
const date = () => new Date('2026-09-29T12:00:00Z');
function fixture(responses) {
  const appels = [];
  return { appels, fetchImpl: async (url, options) => {
    appels.push({ url, options });
    assert.equal(new URL(url).origin, 'https://api.github.com');
    assert.equal(options.redirect, 'error'); assert.equal(options.method, 'GET');
    const r = responses.shift();
    assert.ok(r, 'aucun appel supplémentaire autorisé');
    if (r instanceof Error) throw r;
    return new Response(JSON.stringify(r.data ?? {}), { status: r.status ?? 200 });
  } };
}
async function lire(responses, d = depot, opts = {}) {
  const f = fixture(responses);
  const result = await lireGithub(d, { actif: true, maintenant: date, ...f, ...opts });
  return { result, appels: f.appels };
}
const bon = await lire([{ data: { sha } }, { data: fichier }]);
assert.equal(bon.result.ok, true);
assert.equal(bon.result.source.commit, sha);
assert.equal(bon.result.source.mesure_le, '2026-09-29T12:00:00.000Z');
assert.equal(bon.result.grain.maj, '2026-09-01');
assert.equal(bon.result.derive, null);
assert.ok(bon.result.controle.non_examines.includes('derive_git'));
assert.equal(bon.appels[1].url, `https://api.github.com/repos/fixture/projet/contents/FINUBAR.md?ref=${sha}`);
assert.equal((await lire([], depot, { actif: false })).appels.length, 0);
for (const d of [{ depot: 'https://evil.invalid/x' }, { depot: 'a/..' }, { depot: 'a/.' },
  { depot: 'a/b?secret=x' }, { ...depot, github_ref: '../evil' }, { ...depot, github_ref: 'main?x=y' }]) {
  const r = await lire([], d); assert.equal(r.result.controle.statut, 'refuse'); assert.equal(r.appels.length, 0);
}
assert.equal((await lire([{ data: { sha } }], { ...depot, github_ref: 'c'.repeat(40) })).result.controle.statut, 'erreur');
for (const [status, attendu] of [[401, 'refuse'], [403, 'refuse'], [404, 'inaccessible'], [500, 'erreur']]) {
  const r = await lire([{ status }, { status }]); assert.equal(r.result.controle.statut, attendu);
  assert.equal(r.appels.length, status === 500 ? 2 : 1);
}
assert.equal((await lire([{ data: { sha } }, { status: 404 }])).result.controle.statut, 'source_absente');
assert.equal((await lire([{ data: { sha } }, { data: { ...fichier, type: 'symlink', target: 'https://evil.invalid' } }])).result.controle.statut, 'erreur');
assert.equal((await lire([{ data: { sha } }, { data: { ...fichier, size: 1 } }])).result.controle.statut, 'erreur');
assert.equal((await lire([{ data: { sha } }, { data: { ...fichier, sha: 'b'.repeat(40) } }])).result.controle.statut, 'erreur');
for (const brut of [null, [], 42]) {
  const texte = `${BALISE_DEBUT}\n\`\`\`json\n${JSON.stringify(brut)}\n\`\`\`\n${BALISE_FIN}`;
  const r = await lire([{ data: { sha } }, { data: fichierDe(texte) }]);
  assert.equal(r.result.controle.statut, 'illisible');
  assert.equal(r.result.ok, false);
  assert.equal(r.result.source.commit, sha);
}
// Preuve de la borne composée : nombre total GET 4 max, pas 4 par endpoint.
const quatre = await lire([{ status: 500 }, { data: { sha } }, { status: 429 }, { data: fichier }]);
assert.equal(quatre.result.ok, true);
assert.equal(quatre.appels.length, 4);
const quatreEchec = await lire([{ status: 500 }, { data: { sha } }, { status: 500 }, { status: 500 }]);
assert.equal(quatreEchec.result.controle.statut, 'erreur');
assert.equal(quatreEchec.appels.length, 4);
const horsBornes = await lire([], depot, { tentatives: 3 });
assert.equal(horsBornes.result.controle.statut, 'refuse');
assert.equal(horsBornes.appels.length, 0);
const reseau = await lire([new Error('secret interdit'), new Error('secret interdit')]);
assert.equal(reseau.appels.length, 2); assert.equal(reseau.result.controle.statut, 'erreur');
assert.ok(!JSON.stringify(reseau.result).includes('secret interdit'));
const timeout = await lireGithub(depot, { actif: true, maintenant: date, timeoutMs: 5, tentatives: 1,
  fetchImpl: async (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('timeout')))) });
assert.equal(timeout.controle.statut, 'erreur');
const ancien = { ...bon.result, mesure_le: '2026-09-02', source: { ...bon.result.source, mesure_le: '2026-09-02' } };
const repris = reprendreApresGithub(reseau.result, ancien, { depot: depot.depot, ciel: 'alpha', precedentLe: '2026-09-28' });
assert.equal(repris.reprise, true); assert.equal(repris.mesure_le, '2026-09-02');
assert.equal(repris.source.mesure_le, '2026-09-02'); assert.equal(repris.controle.statut, 'erreur');
const absent = (await lire([{ data: { sha } }, { status: 404 }])).result;
assert.equal(reprendreApresGithub(absent, ancien, { ciel: 'alpha' }).reprise, false);
console.log('Finubar GitHub : sources, versions, erreurs, bornes et reprise datée vérifiées.');
