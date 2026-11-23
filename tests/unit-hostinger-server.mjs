// Tests unitaires — adaptateur HTTP VPS Hostinger (Option 1 Hybride).
// Node pur, loopback local uniquement (port éphémère 0), aucune donnée réelle.

import assert from 'node:assert/strict';
import { creerServeurVps, parserOrigines, creerLimiteDebit } from '../deploy/hostinger/server.mjs';

// 1. Validation stricte des origines CORS (HTTPS uniquement)
{
  const origines = parserOrigines('https://ultima.vercel.app, http://non-securise.tld, *, https://app.exemple.fr:8443');
  assert.equal(origines.has('https://ultima.vercel.app'), true);
  assert.equal(origines.has('https://app.exemple.fr:8443'), true);
  assert.equal(origines.has('http://non-securise.tld'), false);
  assert.equal(origines.has('*'), false);
}

// 1bis. Limite de débit (60/min par défaut ; éprouvée à 2 ici)
{
  const limite = creerLimiteDebit(2, 60_000);
  assert.equal(limite('1.2.3.4', 1000), true);
  assert.equal(limite('1.2.3.4', 2000), true);
  assert.equal(limite('1.2.3.4', 3000), false);
  assert.equal(limite('5.6.7.8', 3000), true);
  assert.equal(limite('1.2.3.4', 62_000), true);
}

// 2. Comportement HTTP sur loopback éphémère
const serveur = creerServeurVps({
  originesAutorisees: parserOrigines('https://ultima.vercel.app'),
  limiteDebit: creerLimiteDebit(3, 60_000),
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

  // Route inconnue → 404 (3e requête comptée)
  const r404 = await fetch(`${base}/api/inconnue`);
  assert.equal(r404.status, 404);

  // 4e requête dans la même fenêtre → 429 Trop de requêtes
  const r429 = await fetch(`${base}/api/pro-pilotage?scope=amo`, {
    headers: { Origin: 'https://ultima.vercel.app' }
  });
  assert.equal(r429.status, 429);
} finally {
  await new Promise((resolve) => serveur.close(resolve));
}

console.log('OK unit-hostinger-server');
