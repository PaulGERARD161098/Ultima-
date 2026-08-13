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
export function versCiel(idEcran, registre, options) {
  var ecran = registre[idEcran];
  if (!ecran || !ecran.enfants) { return null; }
  options = options || {};

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

  // ---- LA PROFONDEUR (étape ③, 2026-08-13) ----------------------------------
  // Ce qui appartient à L'ÉTAGE, par opposition à ce qu'un dépliage fait
  // apparaître. La distinction n'est pas cosmétique : c'est elle qui empêche le
  // dépliage de s'emballer. Déplier re-rend la scène ; l'étoile qui vient de
  // naître tombe sous le curseur immobile, reçoit un survol et se déplie à son
  // tour — on descend ainsi tout l'arbre sans avoir bougé la main. Le défaut a
  // été trouvé en MANIPULANT la maquette, pas en la relisant.
  //
  // La garde vivait dans la maquette ; elle vit ici depuis l'étape ③, parce
  // qu'un garde-fou que chaque appelant doit se rappeler d'installer n'est pas
  // un garde-fou. Déplier ce qui n'est pas de l'étage ne fait RIEN.
  var idsDuNiveau = noeuds.map(function (n) { return n.id; });
  var deplie = options.deplie && idsDuNiveau.indexOf(options.deplie) !== -1
    ? options.deplie : null;

  if (deplie) {
    var parent = registre[deplie] || {};
    // Les enfants du déplié forment leur PROPRE constellation : ils portent le
    // nom du parent en `secteur_activite`, pas celui de l'écran. C'est ce qui
    // les fait voir comme un groupe distinct — « leur propre constellation
    // s'affiche », dicté par Paul le 2026-08-13.
    var nomParent = parent.nom || deplie;
    (parent.enfants || []).forEach(function (idEnfant) {
      var e = registre[idEnfant] || {};
      noeuds.push({
        id: idEnfant,
        nom: e.nom || idEnfant,
        type: 'cap',
        statut: e.etat || '',
        secteur_activite: nomParent,
        cible: e.cible || null
      });
      // Le trait qui RATTACHE l'aperçu à ce qu'on survole : sans lui, les
      // nouveaux venus flottent sans qu'on sache d'où ils sortent.
      relations.push({
        source_id: deplie, target_id: idEnfant,
        type: 'apport_affaires', statut: 'actif'
      });
    });
  }

  return {
    noeuds: noeuds, personnes: [], rattachements: [], relations: relations,
    // Rendus à l'appelant pour qu'il n'ait pas à les re-déduire — et surtout
    // pour qu'il n'ait pas à les re-déduire AUTREMENT.
    idsDuNiveau: idsDuNiveau, deplie: deplie
  };
}

/**
 * Le CHEMIN d'un écran jusqu'à la racine — le fil d'Ariane du ciel qui se
 * déplie. Rendu ici et pas dans la vue : c'est une lecture du registre, et une
 * vue qui déduit sa propre hiérarchie finit par en déduire une autre que celle
 * du registre.
 *
 * Renvoie la suite d'identifiants de la racine à l'écran demandé, incluse.
 * Un identifiant inconnu, ou une boucle dans le registre, renvoient un chemin
 * vide plutôt qu'une récursion sans fin : un registre malade ne doit pas
 * emporter la page avec lui.
 */
export function cheminVers(idEcran, registre, idRacine) {
  if (!registre[idEcran]) { return []; }
  var racine = idRacine || 'racine';
  var chemin = [idEcran];
  var vus = { };
  vus[idEcran] = true;
  var courant = idEcran;
  var garde = 0;
  while (courant !== racine && garde < 64) {
    garde += 1;
    var parent = null;
    var cles = Object.keys(registre);
    for (var i = 0; i < cles.length; i += 1) {
      if ((registre[cles[i]].enfants || []).indexOf(courant) !== -1) {
        parent = cles[i];
        break;
      }
    }
    if (!parent || vus[parent]) { return courant === racine ? chemin : []; }
    vus[parent] = true;
    chemin.unshift(parent);
    courant = parent;
  }
  return courant === racine ? chemin : [];
}
