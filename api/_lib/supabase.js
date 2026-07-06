// Fabrique du client Supabase par requête, agissant sous l'identité de
// l'utilisateur (jeton Bearer) pour que la RLS s'applique. Jamais de service role.

import { createClient } from '@supabase/supabase-js';

const TIMEOUT_MS = 5000;

// Fetch avec timeout sortant réel (5 s) via AbortController.
function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

// Extrait le jeton d'un header Authorization: Bearer <jeton>.
export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

// États possibles renvoyés à l'appelant :
//  { status: 'unconfigured' } → env manquantes (503)
//  { status: 'unauthenticated' } → jeton absent (401)
//  { status: 'ok', client } → client prêt, RLS active
// Repli public : URL du projet + clé PUBLIABLE (sb_publishable_…, conçue pour
// être exposée — déjà committée côté front dans js/config.js). Aucun secret :
// la sécurité repose sur la RLS. Les env Vercel restent prioritaires si posées.
const PUBLIC_SUPABASE_URL = 'https://leosfqyidgsaescjbfom.supabase.co';
const PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_BdzDDS6h3OBFEqr6Hlyn5A_axOPNO42';

export function createUserClient(req) {
  const url = process.env.SUPABASE_URL || PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { status: 'unconfigured' };

  const token = getBearerToken(req);
  if (!token) return { status: 'unauthenticated' };

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: fetchWithTimeout,
    },
  });

  return { status: 'ok', client };
}

// Détecte une erreur d'authentification Supabase pour renvoyer un 401 générique.
export function isAuthError(error) {
  const code = error?.code || '';
  const status = error?.status || 0;
  return status === 401 || code === 'PGRST301' || /jwt|token/i.test(error?.message || '');
}
