// Finubar — le moteur d'agrégation. Module PUR : aucune I/O, aucun réseau,
// aucun `Date.now()` implicite (la date du jour est TOUJOURS un argument).
// Il tourne à l'identique dans Node (collecte, hook de session) et dans le
// navigateur (la page /finubar). C'est la même règle que `althea-progression.mjs`
// et pour la même raison : ce qui décide se teste sans navigateur et sans base.
//
// Vocabulaire (figé — la page, le hook et les tests le partagent) :
//   GRAIN     le bloc d'état d'UN projet, lu dans son FINUBAR.md
//   DÉRIVE    l'écart MESURÉ entre ce que le grain dit et ce que git montre
//   AGRÉGAT   les 8 grains rangés + ce que leur ensemble dit
//   CARTOUCHE les ≤3 signaux + LA prochaine action, pour l'ouverture de séance
//
// ⛔ Règle de ton, héritée d'ALTHEA (règle ③) et étendue au produit :
//    **Finubar compte, elle ne reproche pas.** Aucun libellé produit ici ne
//    porte de jugement — on dit « depuis 16 jours », jamais « en retard ».
//    `MOTS_INTERDITS` est asserté par `tests/unit-finubar.mjs`.

export const BALISE_DEBUT = '<!-- finubar:debut -->';
export const BALISE_FIN = '<!-- finubar:fin -->';

// Les trois seuls états. Ils décrivent QUI a la main, pas une performance.
export const ETATS = ['en_cours', 'en_attente_de_paul', 'au_repos'];

export const MOTS_INTERDITS = [
  'retard', 'échec', 'echec', 'faute', 'seulement', 'oubli',
  'toujours pas', 'aurait dû', 'aurait du', 'négligé', 'neglige',
];

// Bornes de défense : un FINUBAR.md est un fichier éditable à la main, donc
// une entrée hostile par défaut (§8.2 de la méthode). On tronque, on ne casse pas.
const MAX_TEXTE = 400;
const MAX_LISTE = 10;

// Borne de RÉCIT — plus serrée que MAX_TEXTE, et ce n'est pas la même défense.
// MAX_TEXTE protège le moteur d'une entrée hostile ; MAX_RECIT protège Finubar
// de lui-même. Mesuré le 2026-09-03 : `dernier_arret.quoi` valait 400 sur les
// CINQ grains — c'est-à-dire tronqué au milieu d'une phrase sur les cinq, et
// personne ne le voyait. C'est le mode de défaillance n°2 du pre-mortem
// (« Finubar devient une 22ᵉ roadmap ») : la borne haute ne l'a pas empêché,
// elle l'a rendu invisible. Un grain est un index, pas un journal.
export const MAX_RECIT = 180;
export const CHAMPS_RECIT = ['dernier_arret.quoi', 'prochaine_action', 'bloque_par[]', 'boucles_ouvertes[].quoi'];

// ---------------------------------------------------------------- lecture

// Extrait le bloc balisé d'un FINUBAR.md. Retourne null si absent ou vide —
// jamais une exception : un fichier absent est un fait, pas une panne.
export function extraireBloc(texte) {
  if (typeof texte !== 'string') return null;
  const i = texte.indexOf(BALISE_DEBUT);
  if (i === -1) return null;
  const j = texte.indexOf(BALISE_FIN, i);
  if (j === -1) return null;
  const brut = texte.slice(i + BALISE_DEBUT.length, j);
  // Le bloc contient une clôture ```json … ``` : on la retire pour ne garder
  // que le JSON. La clôture existe pour que Paul LISE le bloc coloré dans son
  // éditeur — le fichier reste un markdown, pas un format inventé.
  const sansFence = brut.replace(/^\s*```(?:json)?/, '').replace(/```\s*$/, '');
  const net = sansFence.trim();
  return net.length ? net : null;
}

function texteBorne(valeur) {
  if (typeof valeur !== 'string') return '';
  return valeur.trim().slice(0, MAX_TEXTE);
}

function listeBornee(valeur, transforme) {
  if (!Array.isArray(valeur)) return [];
  return valeur.slice(0, MAX_LISTE).map(transforme).filter(Boolean);
}

// Coupe un récit trop long AU MOT, avec une ellipse — une coupe au caractère
// tranche au milieu d'un mot et se lit comme un fichier corrompu.
// ⛔ Et elle ne se fait JAMAIS en silence : `recits` collecte le nom des champs
// coupés, la collecte les nomme, le harnais l'exige. C'est la règle du
// 2026-08-17 (« un filtre qui exclut des cas doit compter et nommer ce qu'il
// exclut ») — sans ça, les grains regonflent et le moteur les rogne sans que
// personne ne l'apprenne, ce qui est exactement l'état trouvé le 03/09.
export function couperAuMot(valeur, max) {
  const net = typeof valeur === 'string' ? valeur.trim() : '';
  if (net.length <= max) return { texte: net, coupe: false };
  const fenetre = net.slice(0, max);
  const espace = fenetre.lastIndexOf(' ');
  // Un texte sans aucune espace dans la fenêtre (identifiant, URL collée) n'a
  // pas de mot où couper : on prend la fenêtre entière plutôt que de rendre ''.
  const garde = espace > max * 0.6 ? fenetre.slice(0, espace) : fenetre;
  return { texte: garde.replace(/[\s,;:—-]+$/, '') + '…', coupe: true };
}

// Valide et normalise un grain. Retourne TOUJOURS un objet { ok, grain, motif } :
// un projet dont le fichier est illisible doit apparaître dans l'agrégat AVEC
// son motif — un projet qui disparaît en silence est le pire résultat possible,
// parce qu'il se lit comme « rien à signaler ».
export function lireGrain(json, source) {
  const depot = texteBorne(source);
  let brut;
  if (typeof json === 'string') {
    try { brut = JSON.parse(json); }
    catch { return { ok: false, motif: 'bloc illisible', depot, grain: null, recits: [] }; }
  } else if (json && typeof json === 'object') {
    brut = json;
  } else {
    return { ok: false, motif: 'bloc absent', depot, grain: null, recits: [] };
  }

  const projet = texteBorne(brut.projet);
  if (!projet) return { ok: false, motif: 'projet non nommé', depot, grain: null, recits: [] };

  const etat = ETATS.includes(brut.etat) ? brut.etat : 'au_repos';

  // Les champs de récit passent par la borne serrée, et signalent leur coupe.
  const recits = [];
  const recit = (valeur, nom) => {
    const { texte, coupe } = couperAuMot(valeur, MAX_RECIT);
    if (coupe) recits.push(nom);
    return texte;
  };

  const grain = {
    projet,
    depot: texteBorne(brut.depot) || depot,
    cap: texteBorne(brut.cap),
    rattache_a: texteBorne(brut.rattache_a),
    etat,
    jalon: {
      nom: texteBorne(brut.jalon && brut.jalon.nom),
      critere_de_sortie: texteBorne(brut.jalon && brut.jalon.critere_de_sortie),
    },
    dernier_arret: {
      le: texteBorne(brut.dernier_arret && brut.dernier_arret.le),
      quoi: recit(brut.dernier_arret && brut.dernier_arret.quoi, 'dernier_arret.quoi'),
      commit: texteBorne(brut.dernier_arret && brut.dernier_arret.commit),
    },
    prochaine_action: recit(brut.prochaine_action, 'prochaine_action'),
    // `bloque_par` est un RÉCIT lui aussi, et c'est le plus lu de tous : c'est
    // la ligne que Paul cherche en premier. Mesuré le 03/09 sur RénoBoost :
    // cinq gestes totalisant ~4 000 caractères, chacun devenu un dossier avec
    // ses chemins, ses identifiants et son historique. Le GESTE tient sur une
    // ligne ; son dossier vit dans le fichier que pointe `rattache_a`.
    bloque_par: listeBornee(brut.bloque_par, (g) => recit(g, 'bloque_par[]')),
    // Date du PLUS ANCIEN geste en attente. C'est le seul champ de priorité, et
    // c'est un fait, pas une note d'importance : « ça attend depuis le 04/08 »
    // se vérifie, « c'est prioritaire » ne se vérifie pas et vieillit mal.
    en_attente_depuis: texteBorne(brut.en_attente_depuis),
    boucles_ouvertes: listeBornee(brut.boucles_ouvertes, (b) => {
      const quoi = recit(b && b.quoi, 'boucles_ouvertes[].quoi');
      return quoi ? { quoi, depuis: texteBorne(b && b.depuis) } : null;
    }),
    maj: texteBorne(brut.maj),
  };

  // Dédoublonné : dix boucles trop longues sont UN défaut du grain, pas dix.
  return { ok: true, motif: '', depot: grain.depot, grain, recits: [...new Set(recits)] };
}

// ---------------------------------------------------------------- mesures

// Écart en jours entre deux dates ISO 'AAAA-MM-JJ'. Renvoie null si l'une des
// deux est absente ou malformée — un « je ne sais pas » explicite, jamais un 0
// silencieux (un 0 se lirait « à jour », ce qui est exactement le contraire).
export function joursEntre(depuisIso, aujourdhuiIso) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(depuisIso || '') ) return null;
  if (!/^\d{4}-\d{2}-\d{2}/.test(aujourdhuiIso || '')) return null;
  const a = Date.parse(depuisIso.slice(0, 10) + 'T00:00:00Z');
  const b = Date.parse(aujourdhuiIso.slice(0, 10) + 'T00:00:00Z');
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

// Libellé d'ancienneté. Il existe pour UNE raison : `joursEntre` peut rendre un
// NÉGATIF (une note datée de demain — faute de frappe, fuseau, copier-coller), et
// « ouvert depuis -3 j » n'est pas une information, c'est un bug qui s'affiche.
// Une date future est traitée pour ce qu'elle est : une incohérence à corriger,
// dite comme telle. Ni masquée (elle se corrigerait jamais), ni affichée brute.
export function libelleAnciennete(jours, forme) {
  if (jours === null || jours === undefined) return '';
  if (jours < 0) return ' — datée d\'une date à venir, à corriger';
  return forme === 'note' ? ` — notée il y a ${jours} j` : ` — ouvert depuis ${jours} j`;
}

// ---------------------------------------------------------------- agrégat

// Rang de priorité — le SEUL endroit où l'ordre d'affichage se décide.
// Plus le rang est petit, plus le projet remonte.
//   0  le fichier a dérivé : le dépôt a avancé depuis la dernière note.
//      C'est le premier signal parce qu'il dit « ce que tu lis n'est plus vrai »
//      — et une roadmap qu'on croit à tort coûte plus cher qu'une roadmap absente.
//   1  le projet attend un geste de Paul (il est le chemin critique).
//   2  le projet est en cours.
//   3  le projet est au repos.
//   9  le grain est illisible (remonte en bas, mais il remonte).
export function rangDe(entree) {
  if (!entree.ok) return 9;
  if (entree.derive && entree.derive.commits_depuis > 0) return 0;
  if (entree.grain.etat === 'en_attente_de_paul') return 1;
  if (entree.grain.etat === 'en_cours') return 2;
  return 3;
}

// `entrees` : [{ ok, motif, grain, derive:{commits_depuis, tete} }]
export function agreger(entrees, aujourdhuiIso) {
  const projets = (entrees || []).map((e) => ({
    ...e,
    jours_depuis_maj: e.ok ? joursEntre(e.grain.maj, aujourdhuiIso) : null,
    jours_en_attente: e.ok ? joursEntre(e.grain.en_attente_depuis, aujourdhuiIso) : null,
    rang: rangDe(e),
  }));

  // À RANG ÉGAL, ce qui départage est une ANCIENNETÉ, jamais un nom de dépôt.
  // D'abord l'ancienneté du geste en attente (un geste ouvert depuis 17 jours
  // passe devant un geste ouvert ce matin) ; à défaut, l'ancienneté de la note.
  // Le tri par nom ne reste que comme dernier recours, pour être déterministe.
  projets.sort((a, b) => {
    if (a.rang !== b.rang) return a.rang - b.rang;
    const aa = a.jours_en_attente === null ? -1 : a.jours_en_attente;
    const ab = b.jours_en_attente === null ? -1 : b.jours_en_attente;
    if (aa !== ab) return ab - aa;
    const ja = a.jours_depuis_maj === null ? -1 : a.jours_depuis_maj;
    const jb = b.jours_depuis_maj === null ? -1 : b.jours_depuis_maj;
    if (ja !== jb) return jb - ja;
    return (a.grain?.projet || a.depot || '').localeCompare(b.grain?.projet || b.depot || '');
  });

  const lisibles = projets.filter((p) => p.ok);
  // ⛔ « PAS LU » ET « ILLISIBLE » SONT DEUX CHOSES, ET LES ADDITIONNER MENT.
  // Un dépôt hors séance (non cloné, donc jamais ouvert) n'apprend rien sur son
  // grain ; un grain cassé, si. Les compter ensemble noierait une alerte réelle
  // dans le bruit d'un angle mort permanent — et c'est exactement ce qui s'est
  // produit le 02/09/2026, où « 3 sans grain lisible » désignait trois grains
  // parfaitement sains. Deux compteurs, donc, et `total` reste leur somme avec
  // les lisibles : rien ne disparaît du compte.
  const horsSeance = projets.filter((p) => !p.ok && p.hors_seance);
  const gestes = [];
  lisibles.forEach((p) => {
    p.grain.bloque_par.forEach((g) => gestes.push({ projet: p.grain.projet, geste: g }));
  });

  return {
    le: texteBorne(aujourdhuiIso),
    projets,
    macro: {
      total: projets.length,
      lisibles: lisibles.length,
      illisibles: projets.length - lisibles.length - horsSeance.length,
      hors_seance: horsSeance.length,
      en_cours: lisibles.filter((p) => p.grain.etat === 'en_cours').length,
      en_attente_de_paul: lisibles.filter((p) => p.grain.etat === 'en_attente_de_paul').length,
      au_repos: lisibles.filter((p) => p.grain.etat === 'au_repos').length,
      derives: projets.filter((p) => p.derive && p.derive.commits_depuis > 0).length,
      // Un grain dont le commit noté est introuvable n'est PAS un grain sain :
      // sa fraîcheur n'est simplement plus mesurable. On le compte à part —
      // ni avec les dérivés (on ne sait pas s'il a dérivé), ni avec les sains.
      commits_inconnus: projets.filter((p) => p.derive && p.derive.commit_inconnu).length,
      boucles_ouvertes: lisibles.reduce((n, p) => n + p.grain.boucles_ouvertes.length, 0),
      gestes_de_paul: gestes,
    },
  };
}

// ---------------------------------------------------------------- cartouche

// Le briefing d'ouverture de séance : au plus 3 signaux, exactement 1 action.
// Déterministe et borné — c'est ce que le hook SessionStart imprime, et ce que
// la page affiche. Aucun appel IA : un briefing qui varie d'un matin à l'autre
// sur la même donnée n'est pas un briefing, c'est du bruit.
export function cartoucheDuMatin(agregat) {
  const signaux = [];
  const retenus = agregat.projets.filter((p) => p.ok);

  retenus.forEach((p) => {
    if (signaux.length >= 3) return;
    const g = p.grain;
    if (p.derive && p.derive.commits_depuis > 0) {
      signaux.push({
        projet: g.projet,
        dit: `a avancé de ${p.derive.commits_depuis} commit(s) depuis sa dernière note`,
        pourquoi: 'derive',
      });
    } else if (p.derive && p.derive.commit_inconnu) {
      signaux.push({
        projet: g.projet,
        // Deux causes, une seule conséquence : un SHA détruit par un squash et
        // un champ jamais renseigné laissent tous deux la note sans ancrage.
        // Le libellé dit ce qui est vrai des DEUX plutôt que de nommer la cause
        // la plus fréquente et de mentir sur l'autre.
        dit: 'n\'est rattaché à aucun commit atteignable — sa fraîcheur n\'est plus mesurable, à recaler',
        pourquoi: 'commit_inconnu',
      });
    } else if (g.etat === 'en_attente_de_paul') {
      const geste = g.bloque_par[0] || g.prochaine_action;
      // On dit l'ancienneté du GESTE si on la connaît, celle de la note sinon —
      // les deux sont des faits, mais la première est celle qui aide à choisir.
      const depuis = p.jours_en_attente !== null
        ? libelleAnciennete(p.jours_en_attente, 'geste')
        : libelleAnciennete(p.jours_depuis_maj, 'note');
      signaux.push({ projet: g.projet, dit: `attend un geste : ${geste}${depuis}`, pourquoi: 'attente' });
    } else if (g.etat === 'en_cours') {
      signaux.push({
        projet: g.projet,
        dit: `arrêté sur : ${g.dernier_arret.quoi || g.jalon.nom || '—'}`,
        pourquoi: 'en_cours',
      });
    }
  });

  // L'ACTION SUIT LA MAIN QUI L'A. Si le projet de tête attend un geste de Paul,
  // l'action proposée est CE GESTE — pas sa prochaine tâche de code. Proposer de
  // coder pendant que le goulot dort, c'est exactement « travailler pour
  // travailler » : la directive EB l'interdit, et le pre-mortem de la roadmap
  // maîtresse en fait sa cause d'échec n° 4.
  const porteur = retenus[0] || null;
  let action = null;
  if (porteur) {
    const g = porteur.grain;
    const parPaul = g.etat === 'en_attente_de_paul' && g.bloque_par.length > 0;
    action = {
      projet: g.projet,
      nature: parPaul ? 'geste' : 'code',
      faire: parPaul ? g.bloque_par[0] : g.prochaine_action,
      cap: g.cap,
    };
  }

  return { signaux, action, illisibles: agregat.macro.illisibles, hors_seance: agregat.macro.hors_seance };
}

// ---------------------------------------------------------------- constellation

// Sortie « nœuds + relations », au format que le moteur du ciel sait déjà lire.
// Elle n'est branchée sur AUCUNE page aujourd'hui (arbitrage de Paul du 21/08 :
// « à terme, tout projet d'ampleur doit être dans la constellation générale, on
// en reparle »). Elle existe MAINTENANT pour que ce jour-là soit un branchement
// et pas une réécriture — et elle est testée, donc elle ne pourrit pas.
export function versConstellation(agregat) {
  const noeuds = agregat.projets.filter((p) => p.ok).map((p) => ({
    id: p.grain.depot || p.grain.projet,
    libelle: p.grain.projet,
    constellation: p.grain.etat,
    // L'accroche dans l'arbre de navigation d'Ultima (`finubar/depots.json`,
    // champ `ciel`). Elle n'est PAS déduite ici : la déduire d'un nom de dépôt
    // marcherait tant que les dépôts s'appellent « Reno… », et se tromperait en
    // silence au premier projet qui ne s'appelle pas comme sa place.
    ciel: p.ciel || 'alpha',
    signal: p.rang <= 1 ? 1 : 0,
  }));
  const parCap = new Map();
  agregat.projets.filter((p) => p.ok && p.grain.rattache_a).forEach((p) => {
    const cle = p.grain.rattache_a;
    if (!parCap.has(cle)) parCap.set(cle, []);
    parCap.get(cle).push(p.grain.depot || p.grain.projet);
  });
  const relations = [];
  parCap.forEach((membres) => {
    for (let i = 1; i < membres.length; i += 1) {
      relations.push({ de: membres[0], vers: membres[i], nature: 'même cap' });
    }
  });
  return { noeuds, relations };
}
