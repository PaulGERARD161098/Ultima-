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

// Plafond applicatif du corps JSON : très au-delà du contrat (notes 2000 chars),
// très en deçà de la limite plateforme.
const BODY_MAX_BYTES = 100_000;

// Récupère le corps JSON de la requête (Vercel le parse en général déjà).
// Renvoie null si invalide, 'too_large' si le plafond est dépassé.
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    if (Buffer.byteLength(req.body, 'utf8') > BODY_MAX_BYTES) return 'too_large';
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > BODY_MAX_BYTES) return 'too_large';
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

// Réponse standard pour un corps hors gabarit (null ou plafond dépassé).
export function bodyFail(res, body) {
  if (body === 'too_large') return fail(res, 413, 'Corps de requête trop volumineux');
  return fail(res, 400, 'JSON invalide');
}
