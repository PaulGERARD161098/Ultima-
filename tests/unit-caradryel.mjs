// CARADRYEL C1 — fonctions pures et route /api/caradryel (client simulé).
// Le garde-fou s'éprouve du côté contournable : liens hostiles, autre compte,
// table absente. Aucune donnée réelle : identifiants inventés.
import assert from 'node:assert/strict';
import {
  extraireIdentifiantDrive, lienDoc, validerLiaison, versPublic, OEUVRES_INITIALES,
} from '../api/_lib/caradryel.js';
import { creerHandler } from '../api/caradryel.js';

const ID = 'AbCdEfGhIjKlMnOpQrStUvWxYz_0123456789-xy';

// ---- 1. Extraction : ce qui doit passer ----
const valides = [
  `https://docs.google.com/document/d/${ID}/edit`,
  `https://docs.google.com/document/d/${ID}/edit?usp=drivesdk&ouid=1`,
  `https://docs.google.com/document/d/${ID}`,
  `https://docs.google.com/document/u/0/d/${ID}/edit`,
  `https://drive.google.com/file/d/${ID}/view?usp=drivesdk`,
  `  https://docs.google.com/document/d/${ID}/edit#heading=h.1  `,
];
for (const v of valides) assert.equal(extraireIdentifiantDrive(v), ID, `devrait passer : ${v}`);

// ---- 2. Extraction : ce qui doit être refusé (entrée hostile par défaut) ----
const hostiles = [
  '', '   ', null, undefined, 42, {}, [],
  `javascript:alert(1)//docs.google.com/document/d/${ID}`,
  `http://docs.google.com/document/d/${ID}/edit`,
  `https://docs.google.com.evil.tld/document/d/${ID}/edit`,
  `https://evil.tld/docs.google.com/document/d/${ID}/edit`,
  `https://user@docs.google.com/document/d/${ID}/edit`,
  `https://docs.google.com:8443/document/d/${ID}/edit`,
  `https://sheets.google.com/document/d/${ID}/edit`,
  `https://docs.google.com/spreadsheets/d/${ID}/edit`,
  `https://docs.google.com/document/d/court/edit`,
  `https://docs.google.com/document/d/${ID}%2F..%2Fx/edit`,
  `https://docs.google.com/document/d/${'a'.repeat(129)}/edit`,
  `https://docs.google.com/document/d/<script>${ID}/edit`,
  `https://${'a'.repeat(2050)}`,
  `https://docs.google.com/document/d//edit`,
];
for (const h of hostiles) assert.equal(extraireIdentifiantDrive(h), null, `devrait être refusé : ${String(h).slice(0, 80)}`);

// ---- 3. Lien reconstruit ----
assert.equal(lienDoc(ID), `https://docs.google.com/document/d/${ID}/edit`);
assert.equal(lienDoc('javascript:x'), null);
assert.equal(lienDoc(null), null);

// ---- 4. Validation du corps de liaison ----
const UUID = '11111111-2222-4333-8444-555555555555';
assert.deepEqual(validerLiaison({ id: UUID, drive_url: valides[0] }), { id: UUID, driveFileId: ID });
assert.ok(validerLiaison({ id: 'pas-un-uuid', drive_url: valides[0] }).erreur);
assert.ok(validerLiaison({ id: UUID, drive_url: hostiles[8] }).erreur);
assert.ok(validerLiaison([]).erreur);
assert.ok(validerLiaison(null).erreur);

// ---- 5. Forme publique : rien d'autre que les champs choisis ----
const pub = versPublic({ id: UUID, titre: 'T', ordre: 1, drive_file_id: ID, owner_id: 'X', updated_at: 'D' });
assert.deepEqual(Object.keys(pub).sort(), ['drive_file_id', 'id', 'lie', 'ordre', 'titre', 'updated_at']);
assert.equal(pub.lie, true);
assert.equal(versPublic({ id: UUID, titre: 'T', ordre: 1, drive_file_id: null }).lie, false);

// ---- 6. Les quatre œuvres initiales, figées ----
assert.deepEqual(OEUVRES_INITIALES.map((o) => o.titre),
  ['Lettres à Léo', 'Vies volées', 'Catabasis', 'Anabasis']);
assert.ok(Object.isFrozen(OEUVRES_INITIALES) && Object.isFrozen(OEUVRES_INITIALES[0]));

// ---- 7. La route, avec un client Supabase simulé ----
function reponse() {
  return {
    statusCode: 0, headers: {}, corps: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(t) { this.corps = JSON.parse(t); },
  };
}
// Client simulé : enregistre les appels, renvoie ce qu'on lui demande.
function clientSimule({ lignes = [], erreurListe = null, erreurEcriture = null, lignesMaj = [{ id: UUID }] } = {}) {
  const appels = [];
  const chaine = (table) => {
    const q = {
      _op: null,
      select() { if (!q._op) q._op = 'select'; return q; },
      order() { return q; },
      eq(col, val) { appels.push({ table, op: 'eq', col, val }); return q; },
      upsert(rows, opts) { q._op = 'upsert'; appels.push({ table, op: 'upsert', rows, opts }); return q; },
      update(vals) { q._op = 'update'; appels.push({ table, op: 'update', vals }); return q; },
      then(resolve) {
        if (q._op === 'upsert') return resolve({ error: erreurEcriture });
        if (q._op === 'update') return resolve({ data: erreurEcriture ? null : lignesMaj, error: erreurEcriture });
        return resolve({ data: erreurListe ? null : lignes, error: erreurListe });
      },
    };
    return q;
  };
  return { appels, from: chaine };
}
async function appeler({ method = 'GET', body, auth = 'ok', client = clientSimule() } = {}) {
  const handler = creerHandler({ authentifier: async () => (auth === 'ok' ? { status: 'ok', client } : { status: auth }) });
  const res = reponse();
  await handler({ method, body, headers: {} }, res);
  return { res, client };
}

let r = await appeler({ auth: 'unauthenticated' });
assert.equal(r.res.statusCode, 401);
assert.equal(r.res.corps.ok, false);
r = await appeler({ auth: 'unconfigured' });
assert.equal(r.res.statusCode, 503);
r = await appeler({ method: 'DELETE' });
assert.equal(r.res.statusCode, 405, 'pas de DELETE en C1');
assert.equal(r.res.headers.allow, 'GET, POST, PATCH');

const LIGNE = { id: UUID, titre: 'Œuvre test', ordre: 1, drive_file_id: ID, owner_id: 'secret', updated_at: '2026-11-22' };
r = await appeler({ client: clientSimule({ lignes: [LIGNE] }) });
assert.equal(r.res.statusCode, 200);
assert.equal(r.res.corps.data.oeuvres.length, 1);
assert.equal(r.res.corps.data.oeuvres[0].owner_id, undefined, 'owner_id ne sort pas');
assert.equal(r.res.headers['cache-control'], 'private, no-store');

// Table absente (migration non appliquée) → 503 distinct, jamais 500.
r = await appeler({ client: clientSimule({ erreurListe: { code: 'PGRST205', message: 'x' } }) });
assert.equal(r.res.statusCode, 503);
assert.equal(r.res.corps.cause, 'caradryel non installé');
r = await appeler({ client: clientSimule({ erreurListe: { code: 'XX000', message: 'boom' } }) });
assert.equal(r.res.statusCode, 500);
assert.equal(r.res.corps.error, 'Erreur interne', 'aucun détail interne au client');

// Initialiser : les quatre titres, en « ne rien faire si déjà là ».
r = await appeler({ method: 'POST', body: { action: 'initialiser' } });
const up = r.client.appels.find((a) => a.op === 'upsert');
assert.deepEqual(up.rows.map((x) => x.titre), ['Lettres à Léo', 'Vies volées', 'Catabasis', 'Anabasis']);
assert.ok(up.rows.every((x) => !('owner_id' in x)), 'owner_id posé par la base, jamais par le client');
assert.deepEqual(up.opts, { onConflict: 'owner_id,titre', ignoreDuplicates: true });
r = await appeler({ method: 'POST', body: { action: 'tout-effacer' } });
assert.equal(r.res.statusCode, 400);
r = await appeler({ method: 'POST', body: '{pas du json' });
assert.equal(r.res.statusCode, 400);

// Lier : identifiant seul, jamais l'URL ; lien hostile refusé avant la base.
r = await appeler({ method: 'PATCH', body: { id: UUID, drive_url: valides[1] } });
const maj = r.client.appels.find((a) => a.op === 'update');
assert.deepEqual(maj.vals, { drive_file_id: ID });
assert.ok(r.client.appels.some((a) => a.op === 'eq' && a.col === 'id' && a.val === UUID));
assert.equal(r.res.statusCode, 200);
r = await appeler({ method: 'PATCH', body: { id: UUID, drive_url: hostiles[10] } });
assert.equal(r.res.statusCode, 400);
assert.equal(r.client.appels.length, 0, 'un lien hostile ne touche pas la base');
// Autre compte ou œuvre inexistante : RLS → 0 ligne → 404 générique.
r = await appeler({ method: 'PATCH', body: { id: UUID, drive_url: valides[0] }, client: clientSimule({ lignesMaj: [] }) });
assert.equal(r.res.statusCode, 404);

console.log('CARADRYEL C1 : extraction, liaison et route vérifiées.');
