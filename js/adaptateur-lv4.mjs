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

// LE RANG (lot 2 de la carte céleste, arbitrage A5 de Paul, 26/09).
// Un cap qui CONTIENT quelque chose est une tête — on y plonge ; les autres sont
// des feuilles — elles ouvrent une page ou disent un état. C'est une lecture du
// registre, jamais une déduction : 1 ou 0, rien d'intermédiaire. Graduer par le
// nombre d'enfants ferait dire à l'éclat « plus gros », ce qu'il ne doit pas
// dire. Le moteur ne s'en sert que sous l'option `eclatParPoids`.
export function rang(noeud) {
  return ((noeud && noeud.enfants) || []).length ? 1 : 0;
}

/**
 * L'ISOLEMENT — dicté par Paul le 2026-08-28, resserré par lui le 2026-08-31.
 *
 * « Quand je clique sur une constellation, ça m'affiche uniquement cette
 * constellation et plus les autres. » Puis, l'écran ayant vécu : « quand il
 * montre NAGA, affiche-moi juste ADRAMELECH, IMLADRIK — les grands thèmes ; et
 * ensuite, quand on clique dessus, la suivante s'applique. » Trois décisions,
 * et elles ne se déduisent pas l'une de l'autre :
 *
 *   ① ON NE MONTRE QUE LA DESCENDANCE DU FOYER. Les frères disparaissent — ce
 *      n'est pas un filtre d'affichage, c'est le jeu de données qui change.
 *   ② LE FOYER LUI-MÊME N'EST PAS PEINT. « Ça n'affiche pas forcément encore
 *      NAGA même » : son nom est porté par le fil d'Ariane, pas par une étoile
 *      qui occuperait la place de ce qu'on vient chercher.
 *   ③ UN SEUL ÉTAGE — les enfants DIRECTS, et eux seuls. La première version en
 *      montrait deux (les têtes ET leurs projets) pour « voir tout d'un coup » ;
 *      éprouvée par Paul, elle rendait l'écran de NAGA aussi chargé que le ciel
 *      qu'on venait de quitter. La profondeur n'est plus un réglage : elle est
 *      CONTINGENTE À CE QU'IL Y A DEDANS — on descend d'un cran par clic, et
 *      chaque cran se lit d'un coup d'œil. C'est aussi ce qui rend le geste
 *      identique à tous les étages : isoler montre toujours la même chose.
 *
 * Il n'y a donc plus qu'une constellation à l'écran, et elle porte le nom du
 * FOYER. La règle de groupement de la première version — une tête pleine fait
 * sa propre constellation, une tête vide se range sous le foyer — n'avait de
 * sens que tant qu'un second étage était peint : sans petits-enfants, elle
 * fabriquerait autant d'amas d'UNE étoile que de têtes, chacun étiqueté du nom
 * de l'étoile qu'il contient. Elle est retirée, pas oubliée.
 */
function isolement(idFoyer, registre) {
  var foyer = registre[idFoyer] || {};
  var nomFoyer = foyer.nom || idFoyer;
  var tetes = (foyer.enfants || []).slice();
  var relations = [];
  var affiches = Object.create(null);

  var noeuds = tetes.map(function (idTete) {
    var n = registre[idTete] || {};
    affiches[idTete] = true;
    return {
      id: idTete,
      nom: n.nom || idTete,
      type: 'cap',
      statut: n.etat || '',
      secteur_activite: nomFoyer,
      cible: n.cible || null,
      poids: rang(n)
    };
  });

  // ④ LES PASSERELLES SURVIVENT À L'ISOLEMENT — mais seulement quand les DEUX
  // bouts sont peints. Un arc vers une étoile qu'on a fait disparaître serait
  // un trait vers nulle part : c'est le même raisonnement que la garde de
  // l'étage, appliqué aux liens. Cette garde compte DAVANTAGE depuis qu'on ne
  // peint plus qu'un étage : reshiram ⇄ zekrom vivent sous TAO, donc leur
  // passerelle n'apparaît qu'en isolant TAO — plus en isolant NAGA, où les
  // deux jumeaux ne sont pas peints.
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
    // CE QUI PEUT ENCORE SE DÉPLIER, ce sont les têtes. On s'en abstient quand
    // même (js/ciel-noeud.mjs) : déplier au survol ferait revenir, une tête à
    // la fois, exactement l'étage que Paul a demandé de ne plus voir — et
    // re-dessiner détruirait le focus clavier. Descendre est un CLIC, pas un
    // survol.
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
      cible: cap.cible || null,
      poids: rang(cap)
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
        cible: e.cible || null,
        poids: rang(e)
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
