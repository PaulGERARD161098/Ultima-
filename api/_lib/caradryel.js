// CARADRYEL — fonctions PURES de la boucle C1 (CADRAGE-CARADRYEL.md §7).
// Aucune I/O ici : tout est éprouvé par tests/unit-caradryel.mjs.
//
// Sécurité : un lien collé est une entrée HOSTILE. On n'en garde que
// l'identifiant du fichier, extrait d'un hôte Google exact, en https, et validé
// par le même alphabet que la contrainte SQL. Le lien affiché est RECONSTRUIT
// à partir de cet identifiant (jamais l'URL collée).

export const ID_DRIVE = /^[A-Za-z0-9_-]{20,128}$/;

// Les quatre œuvres en visu permanent (dictées par Paul le 22/11). Elles vivent
// CÔTÉ SERVEUR seulement : jamais dans le JS ni le HTML servis à tous.
// `ordre` = place sur la boussole (1 = Nord, puis sens horaire), celle de la
// maquette validée : la remontée au Nord, la descente au Sud.
export const OEUVRES_INITIALES = Object.freeze([
  Object.freeze({ titre: 'Lettres à Léo', ordre: 4 }),
  Object.freeze({ titre: 'Vies volées', ordre: 2 }),
  Object.freeze({ titre: 'Catabasis', ordre: 3 }),
  Object.freeze({ titre: 'Anabasis', ordre: 1 }),
]);

// Hôte exact → motif du chemin qui porte l'identifiant.
const CHEMINS = Object.freeze({
  'docs.google.com': /^\/document\/(?:u\/\d+\/)?d\/([^/]+)(?:\/|$)/,
  'drive.google.com': /^\/file\/(?:u\/\d+\/)?d\/([^/]+)(?:\/|$)/,
});

// Lien collé → identifiant, ou null. Ne lève jamais.
export function extraireIdentifiantDrive(saisie) {
  if (typeof saisie !== 'string') return null;
  const brut = saisie.trim();
  if (!brut || brut.length > 2048) return null;
  let url;
  try { url = new URL(brut); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password || url.port) return null;
  const motif = CHEMINS[url.hostname];
  if (!motif) return null;
  const m = motif.exec(url.pathname);
  if (!m) return null;
  return ID_DRIVE.test(m[1]) ? m[1] : null;
}

// Identifiant validé → lien d'ouverture reconstruit (Docs), ou null.
export function lienDoc(id) {
  return typeof id === 'string' && ID_DRIVE.test(id)
    ? `https://docs.google.com/document/d/${id}/edit`
    : null;
}

// Corps de PATCH → { id, driveFileId } ou { erreur }. UUID strict pour l'id.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validerLiaison(corps) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) return { erreur: 'Requête invalide' };
  if (typeof corps.id !== 'string' || !UUID.test(corps.id)) return { erreur: 'Œuvre inconnue' };
  const driveFileId = extraireIdentifiantDrive(corps.drive_url);
  if (!driveFileId) return { erreur: 'Lien Google Docs non reconnu' };
  return { id: corps.id, driveFileId };
}

// Ligne SQL → forme publique (champs choisis, rien d'autre ne sort).
export function versPublic(ligne) {
  return {
    id: ligne.id,
    titre: ligne.titre,
    ordre: ligne.ordre,
    lie: Boolean(ligne.drive_file_id),
    drive_file_id: ligne.drive_file_id || null,
    updated_at: ligne.updated_at || null,
  };
}
