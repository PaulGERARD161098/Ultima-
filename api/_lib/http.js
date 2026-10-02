// Helpers de réponse HTTP partagés — réponses client génériques, sans PII.

// Réponse JSON normalisée.
export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.end(JSON.stringify(payload));
}

export function ok(res, data) {
  sendJson(res, 200, { ok: true, data });
}

// Erreur client : message générique en français, jamais de détail interne.
// `extra` (optionnel) : des champs de DIAGNOSTIC sûrs, jamais un message brut
// d'un tiers — ex. `{ cause: 'ia 401' }` sur un 502 de Léo.
export function fail(res, status, message, extra) {
  sendJson(res, status, { ...(extra && typeof extra === 'object' ? extra : {}), ok: false, error: message });
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
  try {
    let value;
    if (req.body !== undefined && !Buffer.isBuffer(req.body)) {
      if (typeof req.body === 'string') {
        if (Buffer.byteLength(req.body, 'utf8') > BODY_MAX_BYTES) return 'too_large';
        value = req.body.length ? JSON.parse(req.body) : {};
      } else {
        // Vercel livre généralement un objet DÉJÀ parsé : même plafond ici.
        const encoded = JSON.stringify(req.body);
        if (encoded && Buffer.byteLength(encoded, 'utf8') > BODY_MAX_BYTES) return 'too_large';
        value = req.body;
      }
    } else {
      const chunks = [];
      let total = 0;
      const source = Buffer.isBuffer(req.body) ? [req.body] : req;
      for await (const chunk of source) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += bytes.length;
        if (total > BODY_MAX_BYTES) return 'too_large';
        chunks.push(bytes);
      }
      value = total ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
    }
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    // Corps interrompu/malformé : jamais transformé en suppression autorisée.
    return null;
  }
}

// Réponse standard pour un corps hors gabarit (null ou plafond dépassé).
export function bodyFail(res, body) {
  if (body === 'too_large') return fail(res, 413, 'Corps de requête trop volumineux');
  return fail(res, 400, 'JSON invalide');
}
