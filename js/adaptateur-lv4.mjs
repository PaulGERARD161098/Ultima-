/* L'ADAPTATEUR LV4 — registre de navigation → données du ciel.

   Module ES PUR : aucune I/O, aucun DOM, aucune donnée personnelle. C'est la
   seule pièce que la phase 2 doit écrire pour de vrai ; le reste est du moteur
   existant (js/ciel.js) et du registre existant (js/registre-lv3.mjs).

   Il vit ici, seul, parce que DEUX maquettes s'en servent. La première version
   le gardait dans la maquette du matin, et l'importer depuis la seconde
   entraînait tout le harnachement de la première — qui cherche des éléments
   absents et tue la page. Un composant réclamé par un second appelant se
   DÉPLACE vers son propre module, il ne se recopie pas (règle du 2026-07-30).

   ARRIVÉ À DESTINATION le 2026-08-13 (étape ④a). Il vivait dans `design/` en
   attendant que la production s'en serve ; elle s'en sert. Il vit désormais
   dans `js/`, à côté du registre qu'il lit — et il cesse d'être une pièce de
   maquette pour devenir du code de production, avec ce que cela impose :
   `tests/unit-adaptateur-lv4.mjs` le tient, sans navigateur. */

/**
 * DESCEND-IL DE LUI ? — la garde de l'isolement, et elle est BORNÉE.
 *
 * On isole un nœud dans l'écran où il vit, jamais ailleurs : sans cette
 * vérification, un identifiant venu de l'URL (`ultima.html#adramelech`)
 * ferait afficher, dans la coque d'ULTIMA, le contenu d'un nœud qui n'en
 * relève pas — un écran qui ment sur ce qu'il montre. La borne (`garde`) est
 * là pour la même raison que celle de `cheminVers` : un registre qui boucle
 * ne doit pas emporter la page avec lui.
 */
export function descendDe(idAncetre, id, registre) {
  if (!registre[idAncetre] || !registre[id] || idAncetre === id) { return false; }
  var file = (registre[idAncetre].enfants || []).slice();
  var vus = Object.create(null);
  var garde = Object.keys(registre).length + 1;
  while (file.length && garde > 0) {
    garde -= 1;
    var courant = file.shift();
    if (courant === id) { return true; }
    if (vus[courant]) { continue; }
    vus[courant] = true;
    file = file.concat((registre[courant] || {}).enfants || []);
  }
  return false;
}

/**
 * L'ISOLEMENT — dicté par Paul le 2026-08-28.
 *
 * « Quand je clique sur une constellation, ça m'affiche uniquement cette
 * constellation et plus les autres […] si je clique sur NAGA, je vois tous les
 * projets de NAGA directement. » Trois décisions y sont contenues, et elles ne
 * se déduisent pas l'une de l'autre :
 *
 *   ① ON NE MONTRE QUE LA DESCENDANCE DU FOYER. Les frères disparaissent — ce
 *      n'est pas un filtre d'affichage, c'est le jeu de données qui change.
 *   ② LE FOYER LUI-MÊME N'EST PAS PEINT. « Ça n'affiche pas forcément encore
 *      NAGA même » : son nom est porté par le fil d'Ariane, pas par une étoile
 *      qui occuperait la place de ce qu'on vient chercher.
 *   ③ DEUX ÉTAGES D'UN COUP, pas un. « Voir tout d'un coup » : les têtes ET
 *      leurs enfants. C'est ce qui fait qu'on VOIT les projets au lieu d'avoir
 *      à les déplier un par un.
 *
 * La règle de groupement qui en découle : une tête qui CONTIENT quelque chose
 * est une constellation et lui donne son nom ; une tête vide se range sous le
 * nom du foyer. Sans cette règle, RIVEN — seul sous GRIMA — formerait une
 * « constellation RIVEN » d'une étoile, dont l'étiquette répéterait le nom de
 * l'étoile juste au-dessus d'elle.
 */
function isolement(idFoyer, registre) {
  var foyer = registre[idFoyer] || {};
  var nomFoyer = foyer.nom || idFoyer;
  var tetes = (foyer.enfants || []).slice();
  var noeuds = [];
  var relations = [];
  var affiches = Object.create(null);

  function poser(id, secteur) {
    var n = registre[id] || {};
    affiches[id] = true;
    noeuds.push({
      id: id,
      nom: n.nom || id,
      type: 'cap',
      statut: n.etat || '',
      secteur_activite: secteur,
      cible: n.cible || null
    });
  }

  tetes.forEach(function (idTete) {
    var tete = registre[idTete] || {};
    var enfants = tete.enfants || [];
    var secteur = enfants.length ? (tete.nom || idTete) : nomFoyer;
    poser(idTete, secteur);
    enfants.forEach(function (idPetit) {
      poser(idPetit, secteur);
      // Le trait qui RATTACHE un projet à sa tête : sans lui, onze étoiles
      // flottent sans qu'on sache laquelle relève de laquelle.
      relations.push({
        source_id: idTete, target_id: idPetit,
        type: 'apport_affaires', statut: 'actif'
      });
    });
  });

  // ④ LES PASSERELLES SURVIVENT À L'ISOLEMENT — mais seulement quand les DEUX
  // bouts sont peints. Un arc vers une étoile qu'on a fait disparaître serait
  // un trait vers nulle part : c'est le même raisonnement que la garde de
  // l'étage, appliqué aux liens. (Éprouvé sur TAO : reshiram ⇄ zekrom
  // réapparaît quand on isole NAGA, et pas quand on isole IMLADRIK.)
  noeuds.forEach(function (n) {
    var cap = registre[n.id] || {};
    if (cap.lien && affiches[cap.lien]) {
      relations.push({
        source_id: n.id, target_id: cap.lien,
        type: 'chantier_commun', statut: 'actif',
        libelle: cap.lienLibelle || ''
      });
    }
  });

  return {
    noeuds: noeuds, personnes: [], rattachements: [], relations: relations,
    // CE QUI PEUT ENCORE SE DÉPLIER, ce sont les têtes — et leurs enfants sont
    // déjà là. Le dépliage est donc inerte sous isolement, et c'est l'appelant
    // qui s'en abstient (js/ciel-noeud.mjs) : re-dessiner pour n'ajouter rien
    // détruirait le focus clavier à chaque survol.
    idsDuNiveau: tetes, deplie: null, isole: idFoyer
  };
}

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

  // ---- L'ISOLEMENT, avant tout le reste ----------------------------------
  // La garde est TRIPLE, et chacune des trois a sa raison : on n'isole pas
  // l'écran lui-même (ce serait sauter un étage sans le dire), ni un nœud
  // étranger à cet écran (§ `descendDe`), ni un nœud VIDE — isoler une feuille
  // donnerait un ciel sans étoiles, et un écran vide n'est pas une réponse.
  var isole = options.isole
    && options.isole !== idEcran
    && registre[options.isole]
    && (registre[options.isole].enfants || []).length
    && descendDe(idEcran, options.isole, registre)
    ? options.isole : null;
  if (isole) { return isolement(isole, registre); }

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
        type: 'chantier_commun', statut: 'actif',
        // LE NOM GRAVÉ SUR L'ARC (LV5 / P3). Il était PERDU depuis le passage au
        // ciel : la boussole gravait `lienLibelle` sur la passerelle entre deux
        // caps jumeaux, l'adaptateur créait bien le lien mais jetait son nom.
        // La fonction ④ de l'inventaire LV4 §13.1 n'était donc portée qu'à
        // moitié — un trait sans son nom ne dit pas ce qu'il relie.
        // Un seul écran en a aujourd'hui (TAO : reshiram ⇄ zekrom), et c'est
        // précisément pourquoi la perte avait pu passer inaperçue sur la coque
        // pilote, qui n'a aucun cap jumeau.
        libelle: cap.lienLibelle || ''
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
    idsDuNiveau: idsDuNiveau, deplie: deplie, isole: null
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
