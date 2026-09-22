// Import par lots de PERSONNES (CADRAGE-RIVEN-IMPORT.md) — logique serveur,
// séparée du handler pour être exercée avec un client factice (zéro réseau).
//
// Deux familles d'erreurs, délibérément distinctes :
//   • STRUCTURELLE (corps hors gabarit, lot > 100, champ inconnu, node_id
//     malformé ou qui n'appartient pas à l'utilisateur) → 400, RIEN n'est
//     écrit. Le client officiel ne produit jamais ces corps : c'est un signal
//     hostile, on ne le traite pas à moitié.
//   • DE CONTENU (nom vide, e-mail invalide…) → la ligne est refusée, les
//     autres entrent. La raison est le message générique de validatePersonne,
//     jamais le contenu de la ligne (RGPD : pas de PII en réponse ni en log).
//
// Le client Supabase est celui de l'UTILISATEUR (RLS) : owner_id est imposé
// par la base (default auth.uid()), jamais accepté du corps.

import { validatePersonne, isUuid } from './validate.js';

export const LOT_MAX = 100;
const CHAMPS_LIGNE = ['nom', 'fonction', 'telephone', 'email', 'notes', 'node_id'];

function structure(message) {
  return { status: 400, error: message };
}

export async function importerPersonnes(client, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return structure('Corps de requête invalide');
  const cles = Object.keys(body);
  if (cles.length !== 1 || cles[0] !== 'personnes') return structure('Corps de requête invalide');
  const lignes = body.personnes;
  if (!Array.isArray(lignes) || lignes.length < 1 || lignes.length > LOT_MAX) {
    return structure(`Lot invalide (1 à ${LOT_MAX} personnes)`);
  }

  const refusees = [];
  const simples = [];      // { index, value }
  const aRattacher = [];   // { index, value, node_id }

  for (let index = 0; index < lignes.length; index++) {
    const ligne = lignes[index];
    if (!ligne || typeof ligne !== 'object' || Array.isArray(ligne)) return structure('Ligne invalide');
    if (Object.keys(ligne).some((k) => !CHAMPS_LIGNE.includes(k))) return structure('Champ non autorisé');
    const { node_id: nodeId, ...champs } = ligne;
    if (nodeId !== undefined && !isUuid(nodeId)) return structure('Identifiant de fiche invalide');

    const { value, error } = validatePersonne(champs, 'create');
    if (error) { refusees.push({ index, raison: error }); continue; }
    if (nodeId === undefined) simples.push({ index, value });
    else aRattacher.push({ index, value, node_id: nodeId });
  }

  // Les fiches visées doivent TOUTES appartenir à l'utilisateur. Sous RLS, une
  // fiche d'autrui est simplement invisible : elle manque au résultat.
  const idsFiches = [...new Set(aRattacher.map((r) => r.node_id))];
  if (idsFiches.length) {
    const { data, error } = await client.from('network_nodes').select('id').in('id', idsFiches);
    if (error) return { status: 500, error: 'Erreur interne', dbError: error, context: 'import:fiches' };
    const connues = new Set((data || []).map((f) => f.id));
    if (idsFiches.some((id) => !connues.has(id))) return structure('Fiche inconnue');
  }

  let creees = 0;
  if (simples.length) {
    // Un seul INSERT multi-lignes : atomique (tout ou rien pour ce lot).
    const { data, error } = await client.from('personnes').insert(simples.map((s) => s.value)).select('id');
    if (error) return { status: 500, error: 'Erreur interne', dbError: error, context: 'import:personnes' };
    creees += (data || []).length;
  }

  // Les personnes à rattacher sont insérées UNE à une : l'ordre de RETURNING
  // d'un INSERT multi-lignes n'est pas garanti, et un rattachement posé sur la
  // mauvaise personne serait une corruption silencieuse. Elles sont rares (une
  // fiche porte exactement le nom de l'organisation).
  let rattachees = 0;
  const rattachementsEchoues = [];
  for (const r of aRattacher) {
    const { data, error } = await client.from('personnes').insert(r.value).select('id').single();
    if (error || !data?.id) { refusees.push({ index: r.index, raison: 'Enregistrement impossible' }); continue; }
    creees += 1;
    const lien = await client.from('personne_noeuds').insert({ personne_id: data.id, node_id: r.node_id }).select('id').single();
    if (lien.error) rattachementsEchoues.push(r.index);
    else rattachees += 1;
  }

  refusees.sort((a, b) => a.index - b.index);
  return { status: 200, data: { creees, rattachees, refusees, rattachementsEchoues } };
}
