// Helpers purs de l'interface Double Vue Direction & 3 Structures (Boucle 3).
// Zéro DOM, zéro I/O : testable directement en Node pur et réutilisé par js/direction-pro.js.

export const SCOPES_DIRECTION = Object.freeze([
  'direction',
  'renoboost-ia',
  'sola-air-paris',
  'amo'
]);

export const LIBELLES_SCOPES = Object.freeze({
  direction: 'Direction (Global)',
  'renoboost-ia': 'Renoboost IA',
  'sola-air-paris': 'Sola Air Paris',
  amo: 'AMO'
});

export function normaliserScopeUrl(valeur) {
  if (typeof valeur !== 'string') return 'direction';
  const propre = valeur.trim().toLowerCase();
  return SCOPES_DIRECTION.includes(propre) ? propre : 'direction';
}

function borner(texte, max = 180) {
  return String(texte || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Construit l'objet `etat` borné (les yeux de Léo) pour la vue Direction consolidée.
// Strictement conforme aux bornes de `validerEtatQuadrant` (api/_lib/leo.js) :
// uniquement des compteurs et intitulés étiquetés, jamais de contenu complet ni d'ID.
export function yeuxDirection(donnees) {
  const structures = Array.isArray(donnees?.structures) ? donnees.structures : [];
  const priorites = Array.isArray(donnees?.priorites_transverses) ? donnees.priorites_transverses : [];
  const compteurs = {};
  for (const s of structures) {
    if (!s || !s.nom || !s.compteurs) continue;
    compteurs[borner(`${s.nom} ouvertes`, 58)] = Number(s.compteurs.taches_ouvertes) || 0;
    compteurs[borner(`${s.nom} relances`, 58)] = Number(s.compteurs.relances_dues) || 0;
  }
  return {
    compteurs,
    listes: {
      priorites_transverses: priorites.slice(0, 15).map((p) => ({
        libelle: borner(`[${p.structure_nom || p.structure_id}] ${p.titre}${p.echeance ? ' (' + p.echeance + ')' : ''}`)
      }))
    }
  };
}

// Construit l'objet `etat` borné pour UNE structure cloisonnée.
// Filtre défensivement sur `structureId` : aucun intitulé d'une autre structure ne passe.
export function yeuxStructure(structureId, donnees) {
  const taches = (Array.isArray(donnees?.taches) ? donnees.taches : [])
    .filter((t) => t && t.structure_id === structureId && t.statut !== 'fait');
  const dossiers = (Array.isArray(donnees?.dossiers) ? donnees.dossiers : [])
    .filter((d) => d && d.structure_id === structureId && d.statut !== 'clos');
  const documents = (Array.isArray(donnees?.documents) ? donnees.documents : [])
    .filter((d) => d && d.structure_id === structureId);

  return {
    compteurs: {
      taches_ouvertes: taches.length,
      relances: taches.filter((t) => t.type === 'relance').length,
      bloquees: taches.filter((t) => t.statut === 'bloque').length,
      dossiers_actifs: dossiers.length,
      documents: documents.length
    },
    listes: {
      taches: taches.slice(0, 20).map((t) => ({
        libelle: borner(`${t.titre}${t.echeance ? ' (' + t.echeance + ')' : ''}`)
      })),
      dossiers: dossiers.slice(0, 15).map((d) => ({
        libelle: borner(d.titre)
      })),
      documents: documents.slice(0, 15).map((d) => ({
        libelle: borner(`${d.titre} (${d.type})`)
      }))
    }
  };
}
