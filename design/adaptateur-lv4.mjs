/* L'ADAPTATEUR LV4 — registre de navigation → données du ciel.

   Module ES PUR : aucune I/O, aucun DOM, aucune donnée personnelle. C'est la
   seule pièce que la phase 2 doit écrire pour de vrai ; le reste est du moteur
   existant (js/ciel.js) et du registre existant (js/registre-lv3.mjs).

   Il vit ici, seul, parce que DEUX maquettes s'en servent. La première version
   le gardait dans la maquette du matin, et l'importer depuis la seconde
   entraînait tout le harnachement de la première — qui cherche des éléments
   absents et tue la page. Un composant réclamé par un second appelant se
   DÉPLACE vers son propre module, il ne se recopie pas (règle du 2026-07-30).

   Destination : quand la phase 2 sera livrée, ce fichier rejoint js/ et vit à
   côté du registre, testable sans navigateur. */

/**
 * Un écran de console devient UNE constellation : ses caps sont ses étoiles,
 * le nom de l'écran devient celui de la constellation (grouper() de ciel.js
 * s'en sert via `secteur_activite`).
 *
 * Ce que l'adaptateur NE fait pas, délibérément :
 *   — il n'invente aucune couleur : les caps sont des pairs, ils ont le même
 *     éclat, et leur état se lit dans leur étiquette. Colorer par état
 *     obligerait à réemployer la palette de RIVEN pour un autre sens : une
 *     deuxième vérité chromatique, exactement ce qu'on a passé la journée à
 *     supprimer. À arbitrer par Paul, pas par moi ;
 *   — il ne touche pas au registre : il le LIT.
 */
export function versCiel(idEcran, registre) {
  var ecran = registre[idEcran];
  if (!ecran || !ecran.enfants) { return null; }

  var noeuds = ecran.enfants.map(function (idCap) {
    var cap = registre[idCap] || {};
    return {
      id: idCap,
      nom: cap.nom || idCap,
      type: 'cap',
      statut: cap.etat || '',
      secteur_activite: ecran.nom || idEcran,
      cible: cap.cible || null
    };
  });

  var relations = [];
  ecran.enfants.forEach(function (idCap) {
    var cap = registre[idCap] || {};
    if (cap.lien) {
      relations.push({
        source_id: idCap, target_id: cap.lien,
        type: 'chantier_commun', statut: 'actif'
      });
    }
  });

  return { noeuds: noeuds, personnes: [], rattachements: [], relations: relations };
}
