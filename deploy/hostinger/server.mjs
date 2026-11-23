// Adaptateur HTTP Node 22 pour le VPS Hostinger (Option 1 — Hybride).
// Réutilise directement les handlers API d'Ultima (Directive EB) sans dupliquer
// la logique métier, avec CORS en liste blanche fail-closed et en-têtes de sécurité.

import { createServer } from 'node:http';
import leoHandler from '../../api/leo.js';
import proPilotageHandler from '../../api/pro-pilotage.js';
import leoEcrituresHandler from '../../api/leo/ecritures.js';
import leoRegistreHandler from '../../api/leo-registre.js';

export const ROUTES_VPS = Object.freeze({
  '/api/leo': leoHandler,
  '/api/pro-pilotage': proPilotageHandler,
  '/api/leo/ecritures': leoEcrituresHandler,
  '/api/leo-registre': leoRegistreHandler
});

export function parserOrigines(brut = '') {
  if (typeof brut !== 'string') return new Set();
  return new Set(
    brut
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(s))
  );
}

function poserEntetesSecurite(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'private, no-store');
}

function appliquerCors(req, res, originesAutorisees) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (!originesAutorisees.has(origin)) return false;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  return true;
}

export function creerServeurVps({
  routes = ROUTES_VPS,
  originesAutorisees = parserOrigines(process.env.ALLOWED_ORIGINS || '')
} = {}) {
  return createServer(async (req, res) => {
    poserEntetesSecurite(res);

    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = url.pathname;

    if (pathname === '/health' && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, service: 'leo-vps' }));
      return;
    }

    const corsOk = appliquerCors(req, res, originesAutorisees);
    if (!corsOk) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Origine non autorisée' }));
      return;
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const handler = Object.prototype.hasOwnProperty.call(routes, pathname)
      ? routes[pathname]
      : null;

    if (!handler) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Route inconnue' }));
      return;
    }

    // Compatibilité req.query attendue par les handlers Vercel existants.
    req.query = Object.fromEntries(url.searchParams.entries());
    try {
      await handler(req, res);
    } catch {
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'Erreur interne' }));
      }
    }
  });
}

// Lancement direct uniquement si exécuté comme point d'entrée.
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';
  const serveur = creerServeurVps();
  serveur.listen(port, host, () => {
    console.log(`[leo-vps] écoute sur http://${host}:${port}`);
  });
}
