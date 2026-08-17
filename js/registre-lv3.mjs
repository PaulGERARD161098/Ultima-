// Ultima Lv3 — LE REGISTRE DE L'ARBRE.
// ---------------------------------------------------------------------------
// Module ES PUR : que des données statiques + des fonctions pures. Aucune I/O,
// aucun DOM, aucune donnée personnelle (jamais de PII ici — le registre décrit
// la NAVIGATION, pas le contenu).
//
// C'est la source unique de l'arborescence d'Ultima : ajouter un projet, un
// quadrant ou un cap = UNE entrée ici, rien d'autre à toucher. Le moteur
// (js/boussole-noyau.mjs) sait rendre n'importe quel nœud à partir de son id.
// Cadrage : CADRAGE-LV3.md (§1 l'arbre, §5 noyau + registre).
//
// ANATOMIE D'UNE ENTRÉE
//   nom      : le nom gravé du cap (obligatoire).
//   etat     : le badge (« Ouvert », « À venir », « En chantier »…).
//   resume   : la parole de Léo dans le cartouche, au survol du cap.
//   blason   : clé dans BLASONS (js/blasons.mjs).
//   cible    : URL ouverte au clic ; null = cap « à venir ».
//   externe  : true → nouvel onglet (rel noopener).
//   lien     : id d'un cap jumeau → passerelle pointillée entre les deux.
//   lienLibelle : le nom gravé sur cette passerelle (ex. « ⇄ rétroplanning »).
//   enfants  : présent = le nœud EST une boussole (ordre = ordre des caps,
//              premier plein Nord puis sens horaire). Absent = c'est une
//              FEUILLE, la page où l'on travaille (règle §2.1 du cadrage).
// Les nœuds-boussoles portent en plus leur bandeau et leur cœur :
//   titre, surligne, invite, coeur (clé dans COEURS), legende (le nom gravé
//   sous le médaillon), legendeClasse (classe CSS additionnelle), cockpit
//   (true = ce nœud lit les agrégats /api/cockpit après connexion),
//   expose (nom d'un global d'introspection pour les harnais).
//
// ÉTAT DU CÂBLAGE (L4, 2026-07-30 ; macro-quadrants 2026-08-01) : TOUS les
// nœuds de l'arbre sont rendus par le noyau — `racine`, les deux
// supra-divisions, les macro-quadrants `grima` / `naga` (dictés par Paul :
// deux cadrans cliquables entre ULTIMA et ses quadrants), et les quadrants
// `nicol-bolas`, `adramelech`, `imladrik`, `tao`. Lv3 est complet : ajouter
// un projet, un quadrant ou un cap n'est plus qu'une entrée ici (+ une coque
// de 40 lignes si c'est un nouveau nœud).

export const NOEUDS = {
  // ======================= NIVEAU 0 — la racine =======================
  racine: {
    nom: 'ULTIMA',
    titre: 'Bienvenue',
    surligne: 'Ultima Lv3',
    invite: 'Sur quoi est-ce qu’on travaille aujourd’hui ?',
    coeur: 'anneau',
    legende: 'Ultima',
    cockpit: true,
    // ALTHEA siège ICI, à la racine, et non sous la supra-division ULTIMA
    // (correction Paul, 2026-08-07 : « je veux althea ici »). « 3ᵉ cadran
    // d'Ultima Lv3 » désignait bien cet écran — la racine — et non la
    // supra-division qui porte le même nom. Le doublon de nom entre les deux
    // étages est ce qui a induit le mauvais rangement.
    enfants: ['ultima-perso', 'alpha', 'althea'],
  },

  // ================= NIVEAU 1 — les supra-divisions ==================
  'ultima-perso': {
    nom: 'ULTIMA',
    etat: 'Ouvert',
    blason: 'rose',
    cible: 'ultima.html',
    resume: 'La supra-division personnelle. Ton réseau, ton argent, tes idées, '
      + 'ton développement et ta voie — cinq caps sous une seule rose.',
    titre: 'ULTIMA',
    surligne: 'Supra-division Ultima',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'rose',
    legende: 'le personnel',
    cockpit: true,
    enfants: ['grima', 'naga'],
  },

  // ======== NIVEAU 1,5 — les macro-quadrants d'ULTIMA (Paul, 2026-08-01) ====
  // Deux cadrans cliquables entre la supra-division et ses quadrants : GRIMA
  // rassemble l'utile, NAGA ce qui grandit. Leur devise tient lieu de badge.
  grima: {
    nom: 'GRIMA',
    etat: 'Ce qui est utile',
    blason: 'ancre',
    cible: 'grima.html',
    resume: 'Ce qui est utile : le réseau commercial (RIVEN) et le pilotage '
      + 'financier (NICOL BOLAS). L’outillage qui te fait vivre.',
    titre: 'GRIMA',
    surligne: 'Ce qui est utile',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'ancre',
    legende: 'ce qui est utile',
    cockpit: true,
    enfants: ['riven', 'nicol-bolas'],
  },
  naga: {
    nom: 'NAGA',
    etat: 'Ce qui fait grandir',
    blason: 'pousse',
    cible: 'naga.html',
    resume: 'Ce qui fait grandir : le développement personnel (IMLADRIK), la '
      + 'bibliothèque d’idées (ADRAMELECH) et la voie (TAO).',
    titre: 'NAGA',
    surligne: 'Ce qui fait grandir',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'pousse',
    legende: 'ce qui fait grandir',
    cockpit: true,
    enfants: ['imladrik', 'adramelech', 'tao'],
  },

  alpha: {
    nom: 'ALPHA',
    etat: 'Ouvert',
    blason: 'alpha',
    cible: 'alpha.html',
    resume: 'La supra-division professionnelle. Les projets qui te font vivre : '
      + 'Renoboost IA aujourd’hui, YCOME dès que tu me donnes son adresse.',
    titre: 'ALPHA',
    surligne: 'Supra-division Alpha',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'alpha',
    legende: 'le professionnel',
    enfants: ['renoboost-ia', 'ycome'],
  },

  // ---- Les caps d'ALPHA (feuilles : plateformes de travail) ----
  'renoboost-ia': {
    nom: 'RENOBOOST IA',
    etat: 'Ouvert',
    blason: 'essor',
    cible: 'https://www.renoboostia.fr',
    externe: true,
    resume: 'Console Renoboost IA — le socle rémunérateur (chantiers + '
      + 'installations à domicile). S’ouvre dans un nouvel onglet.',
  },
  ycome: {
    nom: 'YCOME',
    etat: 'À venir',
    blason: 'portail',
    cible: null,
    externe: true,
    resume: 'Projet YCOME, plateforme externe. Le cap est prêt : transmets-moi '
      + 'son URL et je le branche.',
  },

  // ALTHEA — le 3ᵉ cadran d'ULTIMA Lv3 (Paul, 2026-08-06 ; place corrigée le
  // 2026-08-07). Il siège À LA RACINE, aux côtés des deux supra-divisions, et
  // non sous l'une d'elles : Paul l'a voulu « tout seul, c'est un autre
  // système, c'est plutôt un jeu qu'autre chose ». Le ranger sous ULTIMA le
  // subordonnait au personnel ; il n'est subordonné à rien.
  // C'est le seul cap de la racine qui soit une FEUILLE (une porte, règle
  // §2.1) là où ses deux voisins sont des boussoles — et c'est justement ce
  // qui se voit : on entre dans le jeu d'un seul geste, sans traverser
  // d'étage.
  althea: {
    nom: 'ALTHEA',
    etat: 'Le Système',
    blason: 'althea',
    cible: 'althea.html',
    resume: 'Le Système : ton personnage, tes skills, tes stats. Le suivi '
      + 'ludique de ta vie quotidienne — tu coches, ça monte. Privé.',
  },

  // ================= NIVEAU 2 — les quadrants d'ULTIMA ================
  // RIVEN n'a qu'une porte aujourd'hui → il reste une FEUILLE (règle §2.1).
  riven: {
    nom: 'RIVEN',
    etat: 'Accéder',
    blason: 'riven',
    cible: 'riven.html',
    resume: 'Le réseau commercial : artisans, partenaires, leads, chantiers et '
      + 'leurs relations. L’acquis historique d’Ultima.',
  },

  'nicol-bolas': {
    nom: 'NICOL BOLAS',
    etat: 'En chantier',
    blason: 'balance',
    cible: 'bcp.html',
    resume: 'Le pilotage financier : revenus, charges, prévision d’impôts, '
      + 'échéancier. L’ABAQUE y est déjà ouvert.',
    titre: 'Le pilotage financier',
    surligne: 'Ultima — quadrant Nicol Bolas',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'balance',
    legende: 'la balance',
    enfants: ['abaque', 'revenus-charges', 'impots', 'echeancier'],
  },
  abaque: {
    nom: 'ABAQUE',
    etat: 'Ouvert',
    blason: 'abaque',
    cible: 'abaque.html',
    resume: 'Le simulateur de lancement : hypothèses, seuil de rentabilité, '
      + 'trésorerie plancher. Déjà en service.',
  },
  'revenus-charges': {
    nom: 'REVENUS & CHARGES',
    etat: 'À venir',
    blason: 'revenus',
    cible: null,
    resume: 'Ce qui entre, ce qui sort — le flux réel mois par mois.',
  },
  impots: {
    nom: 'IMPÔTS',
    etat: 'À venir',
    blason: 'impots',
    cible: null,
    resume: 'La prévision fiscale, pour qu’aucune échéance ne te surprenne.',
  },
  echeancier: {
    nom: 'ÉCHÉANCIER',
    etat: 'À venir',
    blason: 'echeancier',
    cible: null,
    resume: 'Ce qui tombe, et quand. Le calendrier des engagements.',
  },

  adramelech: {
    nom: 'ADRAMELECH',
    etat: 'Privé',
    blason: 'ouroboros',
    cible: 'adramelech.html',
    resume: 'La bibliothèque d’idées : capturer, classer, rapprocher, enrichir. '
      + 'Privée — derrière authentification.',
    titre: 'La bibliothèque d’idées',
    surligne: 'Ultima — quadrant Adramelech',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'ouroboros',
    legende: 'le cycle',
    enfants: ['registre', 'archipels', 'rapprochements'],
  },
  registre: {
    nom: 'LE REGISTRE',
    etat: 'Privé',
    blason: 'registre',
    cible: 'registre.html',
    resume: 'Les idées en liste : leurs compteurs, leurs thèmes et les ponts '
      + 'déjà tissés. Privé — le registre ne s’ouvre qu’une fois ta session ouverte.',
  },
  archipels: {
    nom: 'LES ARCHIPELS',
    etat: 'Ouvert',
    blason: 'archipels',
    cible: 'idees.html',
    resume: 'La carte des idées par archipels. Déjà en service.',
  },
  rapprochements: {
    nom: 'LES RAPPROCHEMENTS',
    etat: 'À venir',
    blason: 'rapprochements',
    cible: null,
    resume: 'Les ponts entre idées, y compris d’un quadrant à l’autre.',
  },

  // IMLADRIK — le MODÈLE de la forme (déjà en prod depuis B1) : c'est ce nœud
  // que le noyau rend depuis L1, à rendu strictement identique.
  imladrik: {
    nom: 'IMLADRIK',
    etat: 'Accéder',
    blason: 'imladrik',
    cible: 'imladrik.html',
    resume: 'Le développement personnel : le journal, les futurs potentiels et '
      + 'la volonté. Trois caps autour de Kalamn-talaen.',
    titre: 'La cartographie',
    surligne: 'IMLADRIK',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'kalamn',
    legende: 'Kalamn-talaen',
    legendeClasse: 'kalamn-legende',
    expose: 'UltimaImladrikCarto',
    enfants: ['maedrethnir', 'vranesh', 'draukhain'],
  },
  maedrethnir: {
    nom: 'MAEDRETHNIR',
    etat: 'Ouvert',
    blason: 'plume',
    cible: 'maedrethnir.html',
    resume: 'Le journal intime. Tes pages, l’atelier d’écriture, la sauvegarde '
      + 'Drive — tout l’acquis, sous son vrai nom. Écris librement : rien ne se perd.',
  },
  vranesh: {
    nom: 'VRANESH',
    etat: 'Ouvert',
    blason: 'bifurcation',
    cible: 'vranesh.html',
    resume: 'Les différents futurs potentiels. Dans un cas donné, dérouler ce '
      + 'qui peut arriver : scénarios, signaux à surveiller, parades préparées. '
      + 'Anticiper sereinement, puis revenir au présent.',
  },
  draukhain: {
    nom: 'DRAUKHAIN',
    etat: 'Ouvert',
    blason: 'flamme',
    cible: 'draukhain.html',
    resume: 'La volonté au-delà du possible. Tes serments et tes flammes : ne '
      + 'jamais oublier tes objectifs, entretenir la volonté inébranlable, ne '
      + 'pas perdre la foi. Des rappels, pas du jugement.',
  },

  tao: {
    nom: 'TAO',
    etat: 'Ouvert',
    blason: 'tao',
    cible: 'tao.html',
    resume: '« La voie » — le réel et l’idéal réunis. RESHIRAM (tes talents réels) '
      + 'et ZEKROM (tes idéaux) : deux pôles complémentaires, reliés par le '
      + 'rétroplanning.',
    titre: 'La voie',
    surligne: 'Ultima — quadrant Tao',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'tao',
    legende: 'la voie',
    cockpit: true,
    enfants: ['reshiram', 'zekrom'],
  },
  reshiram: {
    nom: 'RESHIRAM',
    etat: 'Ouvert',
    blason: 'aileBlanche',
    cible: 'reshiram.html',
    lien: 'zekrom',
    lienLibelle: '⇄ rétroplanning',
    resume: 'Le travail de la réalité : tes talents réels et leurs preuves. '
      + 'Relié à ZEKROM par le rétroplanning — c’est là que l’idéal redescend '
      + 'en marches concrètes.',
  },
  zekrom: {
    nom: 'ZEKROM',
    etat: 'Ouvert',
    blason: 'aileNoire',
    cible: 'zekrom.html',
    resume: 'La quête de l’idéal : tes idéaux et les directions qui y mènent. '
      + 'Relié à RESHIRAM par le rétroplanning — l’idéal ne reste jamais en l’air.',
  },
};

export const RACINE = 'racine';

// ------------------------- Fonctions pures -------------------------

// Le parent d'un nœud, déduit des `enfants` (jamais stocké deux fois → aucune
// désynchronisation possible). null pour la racine ou un nœud non rattaché.
export function parentDe(id, noeuds = NOEUDS) {
  const ids = Object.keys(noeuds);
  for (const pid of ids) {
    const enfants = noeuds[pid].enfants;
    if (Array.isArray(enfants) && enfants.indexOf(id) !== -1) return pid;
  }
  return null;
}

// Le chemin de la racine au nœud (fil d'Ariane / lien de retour).
// Borné par le nombre de nœuds : un cycle ne peut pas faire boucler l'appel.
export function chemin(id, noeuds = NOEUDS) {
  const suite = [];
  let courant = id;
  let garde = Object.keys(noeuds).length + 1;
  while (courant && noeuds[courant] && garde > 0) {
    suite.unshift(courant);
    courant = parentDe(courant, noeuds);
    garde -= 1;
  }
  return suite;
}

// Un nœud est une BOUSSOLE dès qu'il a au moins deux caps (règle §2.1) ;
// sinon c'est une feuille — la page où l'on travaille.
export function estBoussole(id, noeuds = NOEUDS) {
  const n = noeuds[id];
  return Boolean(n && Array.isArray(n.enfants) && n.enfants.length >= 2);
}

// Les caps d'un nœud, dans l'ordre du registre (premier plein Nord).
export function capsDe(id, noeuds = NOEUDS) {
  const n = noeuds[id];
  if (!n || !Array.isArray(n.enfants)) return [];
  return n.enfants.map((eid) => Object.assign({ id: eid }, noeuds[eid]));
}

// Vérification de cohérence de l'arbre — utilisée par tests/unit-registre-lv3.mjs
// et exécutable à la main. Retourne la liste des anomalies (vide = registre sain).
export function verifierRegistre(noeuds = NOEUDS, blasons = null, coeurs = null) {
  const anomalies = [];
  const ids = Object.keys(noeuds);

  for (const id of ids) {
    const n = noeuds[id];
    if (!n.nom) anomalies.push(`${id} : nom manquant`);

    const boussole = Array.isArray(n.enfants);
    if (boussole) {
      if (n.enfants.length < 2) {
        anomalies.push(`${id} : boussole à moins de 2 caps (règle nœud/feuille)`);
      }
      for (const eid of n.enfants) {
        if (!noeuds[eid]) anomalies.push(`${id} : enfant inconnu « ${eid} »`);
      }
      if (new Set(n.enfants).size !== n.enfants.length) {
        anomalies.push(`${id} : enfant répété`);
      }
      if (!n.titre) anomalies.push(`${id} : titre de bandeau manquant`);
      if (!n.invite) anomalies.push(`${id} : invite manquante`);
      if (!n.coeur) anomalies.push(`${id} : cœur manquant`);
      if (!n.legende) anomalies.push(`${id} : légende gravée manquante`);
      if (coeurs && !coeurs[n.coeur]) anomalies.push(`${id} : cœur « ${n.coeur} » absent du catalogue`);
    }

    // Tout nœud sauf la racine est un cap de quelqu'un → il lui faut sa parure.
    if (id !== RACINE) {
      if (parentDe(id, noeuds) === null) anomalies.push(`${id} : orphelin (aucun parent)`);
      if (!n.etat) anomalies.push(`${id} : état manquant`);
      if (!n.resume) anomalies.push(`${id} : résumé de Léo manquant`);
      if (!n.blason) anomalies.push(`${id} : blason manquant`);
      if (blasons && n.blason && !blasons[n.blason]) {
        anomalies.push(`${id} : blason « ${n.blason} » absent du catalogue`);
      }
      if (!Object.prototype.hasOwnProperty.call(n, 'cible')) {
        anomalies.push(`${id} : cible non déclarée (mettre null pour « à venir »)`);
      }
    }

    if (n.lien && !noeuds[n.lien]) anomalies.push(`${id} : passerelle vers un cap inconnu « ${n.lien} »`);

    // Un cap « à venir » (cible null) ne doit pas afficher un état d'ouverture.
    if (id !== RACINE && n.cible === null && /ouvert|accéder/i.test(n.etat || '')) {
      anomalies.push(`${id} : cap sans cible mais annoncé ouvert`);
    }
  }

  // Tout nœud doit être atteignable depuis la racine.
  for (const id of ids) {
    if (id === RACINE) continue;
    if (chemin(id, noeuds)[0] !== RACINE) anomalies.push(`${id} : inatteignable depuis la racine`);
  }

  return anomalies;
}
