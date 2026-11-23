// Tests unitaires — adaptateur HTTP VPS Hostinger (Option 1 Hybride).
// Node pur, loopback local uniquement (port éphémère 0), aucune donnée réelle.

import assert from 'node:assert/strict';
import { creerServeurVps, parserOrigines } from '../deploy/hostinger/server.mjs';

// 1. Validation stricte des origines CORS (HTTPS uniquement)
{
  const origines = parserOrigines('https://ultima.vercel.app, http://non-securise.tld, *, https://app.exemple.fr:8443');
  assert.equal(origines.has('https://ultima.vercel.app'), true);
  assert.equal(origines.has('https://app.exemple.fr:8443'), true);
  assert.equal(origines.has('http://non-securise.tld'), false);
  assert.equal(origines.has('*'), false);
}

// 2. Comportement HTTP sur loopback éphémère
const serveur = creerServeurVps({
  originesAutorisees: parserOrigines('https://ultima.vercel.app'),
  routes: {
    '/api/pro-pilotage': (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, scope: req.query.scope }));
    }
  }
});

await new Promise((resolve) => serveur.listen(0, '127.0.0.1', resolve));
const { port } = serveur.address();
const base = `http://127.0.0.1:${port}`;

try {
  // /health répond 200 + en-têtes sécurité
  const rHealth = await fetch(`${base}/health`);
  assert.equal(rHealth.status, 200);
  assert.equal(rHealth.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(rHealth.headers.get('x-frame-options'), 'DENY');
  const healthJson = await rHealth.json();
  assert.deepEqual(healthJson, { ok: true, service: 'leo-vps' });

  // Origine non autorisée → 403 fail-closed
  const rInterdit = await fetch(`${base}/api/pro-pilotage?scope=amo`, {
    headers: { Origin: 'https://evil.example' }
  });
  assert.equal(rInterdit.status, 403);

  // Origine autorisée → 200 + CORS + query transmise
  const rOk = await fetch(`${base}/api/pro-pilotage?scope=sola-air-paris`, {
    headers: { Origin: 'https://ultima.vercel.app' }
  });
  assert.equal(rOk.status, 200);
  assert.equal(rOk.headers.get('access-control-allow-origin'), 'https://ultima.vercel.app');
  const okJson = await rOk.json();
  assert.deepEqual(okJson, { ok: true, scope: 'sola-air-paris' });

  // Route inconnue → 404
  const r404 = await fetch(`${base}/api/inconnue`);
  assert.equal(r404.status, 404);
} finally {
  await new Promise((resolve) => serveur.close(resolve));
}

console.log('OK unit-hostinger-server');
