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
// supra-divisions (`alpha`, `omega`), et les caps `riven`, `nicol-bolas`,
// `imladrik` (macro-projet qui porte `adramelech` et `tao`). GRIMA et NAGA
// ont été supprimés le 2026-09-29. Lv3 est complet : ajouter
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
    enfants: ['alpha', 'omega', 'althea'],
  },

  // ================= NIVEAU 1 — les supra-divisions ==================
  // OMEGA — ex-« ULTIMA » (Paul, 2026-09-29 : « Ultima, c'est le nom du
  // projet, pas de la subdivision »). Les deux macro-quadrants GRIMA / NAGA
  // sont SUPPRIMÉS : une seule carte, rangée par thème (l'utile d'abord,
  // puis IMLADRIK, macro-projet de développement et de gestion des projets
  // personnels, qui porte désormais ADRAMELECH et TAO).
  omega: {
    nom: 'OMEGA',
    etat: 'Ouvert',
    blason: 'rose',
    cible: 'omega.html',
    resume: 'La supra-division personnelle. Ton réseau, ton argent, et '
      + 'IMLADRIK — le macro-projet de développement et de gestion de tes '
      + 'projets personnels.',
    titre: 'OMEGA',
    surligne: 'Supra-division Omega',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'rose',
    legende: 'le personnel',
    cockpit: true,
    enfants: ['riven', 'nicol-bolas', 'imladrik'],
  },

  alpha: {
    nom: 'ALPHA',
    etat: 'Ouvert',
    blason: 'alpha',
    cible: 'alpha.html',
    resume: 'La supra-division professionnelle. Les projets qui te font vivre : '
      + 'Renoboost IA aujourd’hui, et deux caps à cadrer — DOKLĚS (la marque '
      + 'ECL by DOKLES) et SYMPHO.',
    titre: 'ALPHA',
    surligne: 'Supra-division Alpha',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'alpha',
    legende: 'le professionnel',
    enfants: ['renoboost-ia', 'dokles', 'sympho'],
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
  // YCOME — RETIRÉ le 28/09 (Paul : « je ne travaille plus pour lui »).
  // Cadrage : CADRAGE-2026-09-28-retrait-ycome.md. Ses garanties d'étoile
  // d'attente sont portées par DOKLĚS et SYMPHO (tests/smoke-alpha.mjs).

  // DOKLĚS et SYMPHO — deux ÉTOILES D'ATTENTE (Paul, 27/09 ; cadrage
  // carte-celeste §28). Un nom, un état, une phrase, et
  // AUCUNE cible — donc `aria-disabled`, donc aucune page promise. Elles
  // grandiront quand leur projet aura une page ou un dépôt.
  // ⛔ LE NOM S'ÉCRIT « DOKLĚS », AVEC LE Ě (e caron), tel que Paul l'a donné.
  // L'identifiant, lui, reste ASCII (`dokles`) : il sert d'adresse (#dokles)
  // et de clé ; le NOM est ce qu'on lit, et on ne le « simplifie » pas.
  // Les phrases sont celles validées par Paul le 27/09 — rien d'autre n'est dit,
  // parce que rien d'autre n'est su (Principe 3 de PRODUCT.md).
  dokles: {
    nom: 'DOKLĚS',
    etat: 'À venir',
    blason: 'portail',
    cible: null,
    resume: 'La marque ECL by DOKLES. Le cap est prêt : dis-moi ce qu’on y met.',
  },
  sympho: {
    nom: 'SYMPHO',
    etat: 'À venir',
    blason: 'portail',
    cible: null,
    resume: 'Projet professionnel, à cadrer. Le cap est prêt.',
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
    surligne: 'Omega — Nicol Bolas',
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
    epithete: 'Dragon de l’imagination',
    etat: 'Privé',
    blason: 'ouroboros',
    cible: 'adramelech.html',
    resume: 'La bibliothèque d’idées : capturer, classer, rapprocher, enrichir. '
      + 'Privée — derrière authentification.',
    titre: 'La bibliothèque d’idées',
    surligne: 'Imladrik — Dragons — Adramelech',
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
    resume: 'Macro-projet de développement et de gestion des projets '
      + 'personnels : deux constellations autour de Kalamn-talaen — les ARMES '
      + 'et les DRAGONS.',
    titre: 'La cartographie',
    surligne: 'IMLADRIK',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'kalamn',
    legende: 'Kalamn-talaen',
    legendeClasse: 'kalamn-legende',
    expose: 'UltimaImladrikCarto',
    // Deux CONSTELLATIONS, et rien d'autre (Paul, 2026-09-30 : ADRAMELECH et
    // les pôles de l'ex-TAO rejoignent les DRAGONS).
    // COCKPIT (30/09) : il était porté par TAO, qui affichait les comptes de
    // RESHIRAM et ZEKROM au survol. Il passe ici, où les deux vivent désormais.
    cockpit: true,
    enfants: ['constellation-armes', 'constellation-dragons'],
  },
  // ---- Les deux CONSTELLATIONS d'IMLADRIK (Paul, 2026-09-29) --------------
  // Des nœuds sans page : on y plonge (le moteur isole ce qui contient). Leur
  // gravure et leur cœur sont PROVISOIRES (blason d'IMLADRIK / flamme, cœur
  // Kalamn-talaen) : les nébuleuses et leurs armoiries sont la boucle B de
  // CADRAGE-IFULVIN.md — on ne dessine rien ici.
  'constellation-armes': {
    nom: 'ARMES',
    etat: 'Constellation',
    blason: 'imladrik',
    cible: null,
    constellation: true,
    nebuleuse: 'armes',
    resume: 'La constellation des ARMES : ce dont tu te sers pour te '
      + 'développer et développer tes projets. IFULVIN en est la première.',
    titre: 'La constellation des armes',
    surligne: 'Imladrik — les armes',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'kalamn',
    legende: 'les armes',
    enfants: ['ifulvin'],
  },
  'constellation-dragons': {
    nom: 'DRAGONS',
    etat: 'Constellation',
    blason: 'flamme',
    cible: null,
    constellation: true,
    nebuleuse: 'dragons',
    resume: 'La constellation des DRAGONS : la vérité, le futur, le serment, '
      + 'l’imagination, le couple RESHIRAM ⇄ ZEKROM, la technologie — et l’air.',
    titre: 'La constellation des dragons',
    surligne: 'Imladrik — les dragons',
    invite: 'Léo te guide — survole un cap.',
    coeur: 'kalamn',
    legende: 'les dragons',
    // DES ÉTOILES INDÉPENDANTES (Paul, 30/09 : « pas obligé de relier les
    // étoiles entre elles, sauf RESHIRAM et ZEKROM »). Aucun trait de figure
    // sur cet écran ; seule la passerelle du registre relie les deux jumeaux.
    asterisme: false,
    // L'ÉPITHÈTE (Paul, 04/10/2026) : chaque dragon s'affiche « NOM » puis, en
    // seconde ligne, « Dragon de… ». Ce sont ses mots, recopiés tels quels ;
    // l'état (« Ouvert », « Privé ») ne s'affiche plus pour ces étoiles.
    enfants: ['maedrethnir', 'vranesh', 'draukhain', 'adramelech', 'reshiram', 'zekrom',
      'zohshia', 'amatsu'],
  },
  // IFULVIN — ÉTOILE D'ATTENTE (Paul, 2026-09-29). Nom, état, une phrase, AUCUNE
  // cible : aucune page promise. ⛔ LE NOM S'ÉCRIT « IFULVIN » — jamais abrégé.
  // Les mots de la phrase sont ceux de Paul ; rien d'autre n'est dit parce que
  // rien d'autre n'est su (Principe 3 de PRODUCT.md, CADRAGE-IFULVIN.md §⑤).
  ifulvin: {
    nom: 'IFULVIN',
    etat: 'À venir',
    blason: 'portail',
    cible: null,
    resume: 'Ton arme principale, ton Magnum Opus : un réseau en cercles '
      + 'concentriques, partout. Le cap est prêt : dis-moi ce qu’on y met.',
  },
  maedrethnir: {
    nom: 'MAEDRETHNIR',
    epithete: 'Dragon de la vérité',
    etat: 'Ouvert',
    blason: 'plume',
    cible: 'maedrethnir.html',
    resume: 'Le journal intime. Tes pages, l’atelier d’écriture, la sauvegarde '
      + 'Drive — tout l’acquis, sous son vrai nom. Écris librement : rien ne se perd.',
  },
  vranesh: {
    nom: 'VRANESH',
    epithete: 'Dragon du futur',
    etat: 'Ouvert',
    blason: 'bifurcation',
    cible: 'vranesh.html',
    resume: 'Les différents futurs potentiels. Dans un cas donné, dérouler ce '
      + 'qui peut arriver : scénarios, signaux à surveiller, parades préparées. '
      + 'Anticiper sereinement, puis revenir au présent.',
  },
  draukhain: {
    nom: 'DRAUKHAIN',
    epithete: 'Dragon du serment',
    etat: 'Ouvert',
    blason: 'flamme',
    cible: 'draukhain.html',
    resume: 'La volonté au-delà du possible. Tes serments et tes flammes : ne '
      + 'jamais oublier tes objectifs, entretenir la volonté inébranlable, ne '
      + 'pas perdre la foi. Des rappels, pas du jugement.',
  },

  // TAO — SUPPRIMÉ le 2026-09-30 (Paul : « supprime TAO partout »). C'était
  // une coquille de navigation sans donnée ; ses deux pôles, RESHIRAM et
  // ZEKROM, siègent désormais dans la constellation des DRAGONS, reliés par
  // leur passerelle (« ⇄ rétroplanning »). `/tao` redirige vers les DRAGONS.
  reshiram: {
    nom: 'RESHIRAM',
    epithete: 'Dragon de la réalité',
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
    epithete: 'Dragon de l’idéal',
    etat: 'Ouvert',
    blason: 'aileNoire',
    cible: 'zekrom.html',
    resume: 'La quête de l’idéal : tes idéaux et les directions qui y mènent. '
      + 'Relié à RESHIRAM par le rétroplanning — l’idéal ne reste jamais en l’air.',
  },
  // ZOH SHIA — LE DRAGON DE LA TECHNOLOGIE (Paul, 04/10/2026). Les technos déjà
  // en service, à l'état pur, prêtes à déployer chez d'autres pros : un badge par
  // techno, son contenu dedans. La page est une coque ; le plan vient de
  // /api/zohshia, réservée au PROPRIÉTAIRE (l'inscription est ouverte : « être
  // connecté » ne suffit pas). Les sources et les outils restent dans le dépôt.
  zohshia: {
    nom: 'ZOH SHIA',
    epithete: 'Dragon de la technologie',
    etat: 'Ouvert',
    blason: 'portail',
    cible: 'zohshia.html',
    resume: 'Tes technos déjà en service, prêtes à déployer chez d’autres pros. '
      + 'Un badge par techno : ce qu’elle fait, la check-list du pro, sa mise en service.',
  },
  // AMATSU — LE DRAGON DE L'AIR (Paul, 18/10/2026). Étoile d'attente, le même geste
  // que ZOH SHIA le 04/10 et qu'IFULVIN : nom, épithète, les mots de Paul — AUCUNE
  // cible, aucune page promise. Son rôle, dicté : « une décision, un projet, une
  // idée me rendra-t-elle plus libre ? » ; la liberté, c'est aussi la cohérence
  // avec soi-même, ses choix et sa paix ; l'air est volatil — vigilance à ne pas se
  // laisser emporter par le vent. Le contenu se cadre à sa boucle 2
  // (CADRAGE-IMLADRIK.md §12) ; le blason « portail » est provisoire.
  amatsu: {
    nom: 'AMATSU',
    epithete: 'Dragon de l’air',
    etat: 'À venir',
    blason: 'portail',
    cible: null,
    resume: 'Le dragon de l’air : liberté, force indomptée, fraîcheur de la bise et '
      + 'terreur de l’ouragan. Sa question : cette décision, ce projet, cette idée '
      + 'te rend-elle plus libre ? L’étoile est posée ; sa forme reste à décider.',
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
// EXCEPTION NOMMÉE (Paul, 2026-09-30, « assouplis la règle pour les
// constellations ») : un nœud marqué `constellation: true` est une boussole dès
// UN cap. La constellation des ARMES ne porte qu'IFULVIN aujourd'hui ; sans
// cette exception elle serait une feuille sans page, donc une étoile morte.
// Le drapeau est explicite et vérifié (voir verifierRegistre) : la règle ne se
// relâche jamais « par accident » sur un nœud qui aurait perdu un enfant.
export function estConstellation(id, noeuds = NOEUDS) {
  const n = noeuds[id];
  return Boolean(n && n.constellation === true);
}
export function estBoussole(id, noeuds = NOEUDS) {
  const n = noeuds[id];
  if (!n || !Array.isArray(n.enfants)) return false;
  return n.enfants.length >= 2 || (n.constellation === true && n.enfants.length >= 1);
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
      if (n.enfants.length < 2 && !(n.constellation === true && n.enfants.length === 1)) {
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

    // Le drapeau d'exception ne s'accroche qu'à un nœud qui contient quelque chose.
    if (n.constellation !== undefined && n.constellation !== true) {
      anomalies.push(`${id} : « constellation » ne vaut que true (ou est absent)`);
    }
    // `asterisme` ne sert qu'à RETIRER les traits d'un écran : false ou absent.
    if (n.asterisme !== undefined && n.asterisme !== false) {
      anomalies.push(`${id} : « asterisme » ne vaut que false (ou est absent)`);
    }
    if (n.constellation === true && !(Array.isArray(n.enfants) && n.enfants.length >= 1)) {
      anomalies.push(`${id} : constellation sans aucun cap`);
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
