// Helpers de réponse HTTP partagés — réponses client génériques, sans PII.

// Réponse JSON normalisée.
export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function ok(res, data) {
  sendJson(res, 200, { ok: true, data });
}

// Erreur client : message générique en français, jamais de détail interne.
export function fail(res, status, message) {
  sendJson(res, status, { ok: false, error: message });
}

// Méthode non supportée → 405 + header Allow.
export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  fail(res, 405, 'Méthode non autorisée');
}

// Log serveur sans PII : uniquement un contexte court et des IDs.
export function logError(context, detail) {
  console.error(`[ultima] ${context}`, detail || '');
}

// Récupère le corps JSON de la requête (Vercel le parse en général déjà).
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}
