// ALTHEA — LE MOTEUR DE PROGRESSION.
// ---------------------------------------------------------------------------
// Module ES PUR : que des fonctions pures. Aucune I/O, aucun DOM, aucun accès
// base. C'est ce qui permet de l'éprouver au harnais sans navigateur et sans
// migration appliquée (tests/unit-althea-progression.mjs).
//
// Il porte les SIX RÈGLES CARDINALES du quadrant (CADRAGE-ALTHEA.md §3) —
// elles ne vivent pas dans un commentaire d'interface, elles vivent ici :
//
//   ① Un jour non renseigné n'est PAS un échec. Trois états et trois seulement :
//      nourri · manqué (déclaré) · non renseigné. Le troisième ne s'infère
//      jamais dans les deux autres — l'absence de relevé ne compte rien.
//   ② L'ACQUIS ne se perd jamais ; l'ÉTAT respire. Jours tenus, rang et
//      meilleur élan ne descendent JAMAIS. Seuls l'élan courant et l'état
//      « tenu / en sommeil » varient.
//   ③ Aucun jugement : ce module ne produit aucune notion d'échec, de retard
//      ni de faute. Il compte, il ne reproche pas.
//   ④ Le compteur ne ment pas : un jour = un relevé, en date LOCALE, jamais
//      dans le futur.
//   ⑤ (sécurité — hors de portée d'un module de calcul.)
//   ⑥ Le Système ne prend jamais la main seul (hors de portée ici).
//
// VOCABULAIRE (memoire/LEXIQUE-VOCAL.md)
//   skill      : ce qui porte un ÉNONCÉ, un rang et des paliers. Il monte.
//   condition  : ce qu'on coche dans une journée. Elle n'a pas de rang.
//   cadence    : le rythme d'une condition (§13.2 du cadrage).
//   jour tenu  : le jour qui compte pour le rang.
//   élan       : la série de jours tenus en cours. Elle respire.

// Les cinq cadences dictées par Paul (CADRAGE-ALTHEA.md §13.2-2).
export const CADENCES = [
  'quotidien',          // une case par jour              (légumes, sommeil)
  'tous_les_n_jours',   // tenu si le dernier date de ≤ N  (sport tous les 2 jours)
  'volume_semaine',     // somme sur 7 jours glissants ≥ N (10 km/semaine)
  'duree_jour',         // quantité du jour ≥ N            (30 min de langue)
  'n_par_jour',         // compte du jour ≥ N              (4 repas)
];

// Les cinq rangs. « La Constance » a été renommée L'ASSIDUITÉ le 2026-08-06 :
// CONSTANCE est un SKILL de Paul, et un skill nommé Constance atteignant
// « La Constance » est une phrase que personne ne peut lire.
export const RANGS = ["L'Éveil", "L'Assiduité", "L'Endurance", 'La Maîtrise', 'Le Renom'];

export const SEUILS_DEFAUT = [7, 30, 90, 180, 365];

// --- Dates : tout se compte en date LOCALE (règle ④) -----------------------
// Une date est manipulée en 'AAAA-MM-JJ'. Aucune conversion UTC : un relevé
// pris à 23 h 40 doit se ranger le jour où Paul l'a vécu, pas le lendemain.

/** Vrai si `s` est une date locale bien formée et réelle (2026-02-30 → faux). */
export function estJourValide(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [a, m, j] = s.split('-').map(Number);
  if (m < 1 || m > 12 || j < 1 || j > 31) return false;
  const d = new Date(Date.UTC(a, m - 1, j));
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j;
}

/** Nombre de jours de `depuis` à `jusqu` (négatif si `jusqu` précède). */
export function ecartJours(depuis, jusqu) {
  const ms = Date.UTC(...depuis.split('-').map((v, i) => (i === 1 ? +v - 1 : +v)))
    - Date.UTC(...jusqu.split('-').map((v, i) => (i === 1 ? +v - 1 : +v)));
  return Math.round(-ms / 86400000);
}

/** `jour` décalé de `n` jours (n négatif = vers le passé). */
export function decalerJour(jour, n) {
  const [a, m, j] = jour.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1, j + n));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

// --- Une condition, un jour ------------------------------------------------

/**
 * Une condition est-elle tenue le jour dit ?
 * Retourne `true` / `false` / `null`.
 *
 * ⚠️ **`null` n'est PAS `false`.** C'est la règle cardinale ① exprimée en code :
 * `null` = « non renseigné », et il ne doit jamais se transformer en échec en
 * remontant la chaîne. Tout appelant doit distinguer les trois cas.
 *
 * La FENÊTRE des cadences chiffrées est fermée à gauche et ouverte à droite —
 * `]jour-N ; jour]` — pour qu'un même relevé ne soit jamais compté deux fois
 * au passage d'une semaine.
 */
export function conditionTenue(condition, releves, jour) {
  const cadence = condition.cadence;
  const seuil = Number(condition.seuil);
  const duJour = releves.find((r) => r.condition_id === condition.id && r.jour === jour);

  if (cadence === 'quotidien') {
    if (!duJour) return null;                       // ① silence ≠ échec
    return Boolean(duJour.tenu);
  }

  if (cadence === 'duree_jour' || cadence === 'n_par_jour') {
    if (!duJour) return null;
    if (!duJour.tenu) return false;                 // manqué DÉCLARÉ
    return Number(duJour.quantite || 0) >= seuil;
  }

  if (cadence === 'tous_les_n_jours') {
    // Tenue si un relevé tenu existe dans les N derniers jours, celui du jour
    // compris. Aucune notion d'échec : si rien n'a jamais été relevé, c'est
    // « non renseigné », pas « raté ».
    const debut = decalerJour(jour, -(seuil - 1));
    const dedans = releves.filter((r) => r.condition_id === condition.id
      && r.jour >= debut && r.jour <= jour);
    if (dedans.length === 0) return null;
    return dedans.some((r) => r.tenu);
  }

  if (cadence === 'volume_semaine') {
    const debut = decalerJour(jour, -6);            // fenêtre ]j-7 ; j]
    const dedans = releves.filter((r) => r.condition_id === condition.id
      && r.jour >= debut && r.jour <= jour);
    if (dedans.length === 0) return null;
    const somme = dedans.reduce((t, r) => t + (r.tenu ? Number(r.quantite || 0) : 0), 0);
    return somme >= seuil;
  }

  return null;                                       // cadence inconnue : on n'invente rien
}

/** Le volume cumulé d'une condition `volume_semaine` sur sa fenêtre. */
export function volumeSemaine(condition, releves, jour) {
  const debut = decalerJour(jour, -6);
  return releves
    .filter((r) => r.condition_id === condition.id && r.jour >= debut && r.jour <= jour && r.tenu)
    .reduce((t, r) => t + Number(r.quantite || 0), 0);
}

// --- Un skill, un jour -----------------------------------------------------

/**
 * Un skill est-il tenu le jour dit ? `true` / `false` / `null`.
 *
 * Les conditions d'un même GROUPE sont en **OU** (italien ou espagnol ou
 * japonais : une seule suffit). Les groupes entre eux obéissent à la règle de
 * nourriture du skill : `tous` (défaut) ou `un`.
 *
 * Un groupe dont aucune condition n'est renseignée vaut `null` — et un skill
 * dont TOUS les groupes sont `null` vaut `null`. Le silence ne devient jamais
 * un échec, à aucun étage.
 */
export function skillTenu(skill, conditions, releves, jour) {
  const siennes = conditions.filter((c) => c.skill_id === skill.id && c.actif !== false);
  if (siennes.length === 0) return null;

  const groupes = new Map();
  for (const c of siennes) {
    const g = c.groupe == null ? 0 : c.groupe;
    if (!groupes.has(g)) groupes.set(g, []);
    groupes.get(g).push(c);
  }

  const verdicts = [...groupes.values()].map((membres) => {
    const etats = membres.map((c) => conditionTenue(c, releves, jour));
    if (etats.some((e) => e === true)) return true;   // OU : une suffit
    if (etats.every((e) => e === null)) return null;  // rien de renseigné
    return false;
  });

  if (verdicts.every((v) => v === null)) return null;
  if (skill.nourriture === 'un') {
    if (verdicts.some((v) => v === true)) return true;
    return verdicts.every((v) => v === null) ? null : false;
  }
  // 'tous' (défaut) : un seul groupe non tenu suffit à ne pas compter le jour.
  if (verdicts.some((v) => v === false)) return false;
  return verdicts.every((v) => v === true) ? true : null;
}

// --- Le cumul, l'élan, le rang --------------------------------------------

/**
 * Parcourt les jours de `depuis` à `jusqu` et compte.
 *
 * Retourne { tenus, elan, meilleurElan, dernierJourTenu, etatDuJour }.
 * `tenus` et `meilleurElan` ne peuvent que croître d'un appel à l'autre sur un
 * historique qui s'allonge : c'est la règle cardinale ② rendue mécanique.
 *
 * ⚠️ Un jour NON RENSEIGNÉ **ne rompt pas l'élan** — il ne le prolonge pas non
 * plus. C'est le point le plus délicat du moteur : casser une série sur un
 * silence serait exactement la punition que Paul a exclue. Seul un jour
 * **déclaré manqué** rompt l'élan.
 */
export function compterSkill(skill, conditions, releves, depuis, jusqu) {
  let tenus = 0;
  let elan = 0;
  let meilleurElan = 0;
  let dernierJourTenu = null;
  let etatDuJour = null;

  for (let j = depuis; ecartJours(j, jusqu) >= 0; j = decalerJour(j, 1)) {
    const etat = skillTenu(skill, conditions, releves, j);
    if (etat === true) {
      tenus += 1;
      elan += 1;
      if (elan > meilleurElan) meilleurElan = elan;
      dernierJourTenu = j;
    } else if (etat === false) {
      elan = 0;                       // manqué DÉCLARÉ : la série retombe
    }                                  // null : on ne touche à rien (règle ①)
    if (j === jusqu) etatDuJour = etat;
  }

  return { tenus, elan, meilleurElan, dernierJourTenu, etatDuJour };
}

/**
 * Le rang atteint pour un nombre de jours (ou de semaines) tenus.
 * 0 = pas encore L'Éveil. Le rang ne redescend jamais : il est fonction
 * croissante de `tenus`, qui ne décroît jamais lui-même.
 */
export function rangPour(tenus, seuils = SEUILS_DEFAUT) {
  let rang = 0;
  for (let i = 0; i < seuils.length; i += 1) if (tenus >= seuils[i]) rang = i + 1;
  return rang;
}

/** Le nom gravé d'un rang (1..5). Rang 0 → null : on ne nomme pas le néant. */
export function nomDuRang(rang) {
  return rang >= 1 && rang <= RANGS.length ? RANGS[rang - 1] : null;
}

/** Ce qu'il reste à tenir avant le rang suivant. null si Le Renom est atteint. */
export function versLeRangSuivant(tenus, seuils = SEUILS_DEFAUT) {
  const rang = rangPour(tenus, seuils);
  if (rang >= seuils.length) return null;
  const cible = seuils[rang];
  const precedent = rang === 0 ? 0 : seuils[rang - 1];
  return {
    rangVise: rang + 1,
    nomVise: nomDuRang(rang + 1),
    reste: cible - tenus,
    part: cible === precedent ? 1 : (tenus - precedent) / (cible - precedent),
  };
}

// --- Le niveau et les stats -----------------------------------------------

/**
 * Le NIVEAU. Décision de Paul (2026-08-06) : **un palier de skill franchi
 * vaut +1 niveau, une quête accomplie vaut +1 niveau**, le tout au-dessus d'un
 * SOCLE que Paul déclare — on n'entre pas dans sa propre vie au niveau 1.
 *
 * `quetesAccomplies` reste à 0 tant que B2 n'existe pas : le paramètre est là
 * pour que la formule soit juste dès aujourd'hui, pas pour être deviné plus tard.
 */
export function niveau(socle, rangsAtteints, quetesAccomplies = 0) {
  const paliers = rangsAtteints.reduce((t, r) => t + Math.max(0, r), 0);
  return Math.max(0, socle) + paliers + Math.max(0, quetesAccomplies);
}

/**
 * Une STAT. Décision de Paul : **elles sont arbitraires et montent avec les
 * niveaux — chaque niveau fait gagner un point partout.**
 *
 * Donc : `socle + niveau`. Aucune dérivation depuis les skills, aucun lissage.
 * Ce qui distingue Paul, c'est son socle ; le niveau le fait monter, il ne le
 * dessine pas.
 */
export function valeurStat(socle, niveauCourant) {
  return Math.max(0, socle) + Math.max(0, niveauCourant);
}

// --- L'état complet, tel que l'écran le consomme --------------------------

/**
 * Assemble l'état d'ALTHEA à partir des lignes brutes.
 * Aucune donnée n'est inventée : ce qui n'est pas renseigné reste `null`.
 */
export function etatAlthea({ avatar, skills, conditions, releves, stats, jour, depuis }) {
  const debut = depuis || (releves.length
    ? releves.reduce((min, r) => (r.jour < min ? r.jour : min), releves[0].jour)
    : jour);

  const skillsEtat = (skills || [])
    .filter((s) => s.actif !== false)
    .map((s) => {
      const seuils = Array.isArray(s.seuils) && s.seuils.length === 5 ? s.seuils : SEUILS_DEFAUT;
      const c = compterSkill(s, conditions || [], releves || [], debut, jour);
      const rang = rangPour(c.tenus, seuils);
      return {
        id: s.id,
        nom: s.nom,
        enonce: s.enonce || null,
        verrouille: Boolean(s.verrouille),
        evolueEn: s.evolue_en || null,
        tenus: c.tenus,
        elan: c.elan,
        meilleurElan: c.meilleurElan,
        etatDuJour: c.etatDuJour,          // true | false | null
        rang,
        nomDuRang: nomDuRang(rang),
        suivant: versLeRangSuivant(c.tenus, seuils),
      };
    });

  const niv = niveau(avatar?.socle_niveau || 0, skillsEtat.map((s) => s.rang));

  return {
    niveau: niv,
    titre: avatar?.titre_code || null,
    skills: skillsEtat,
    stats: (stats || []).map((st) => ({
      code: st.code,
      socle: st.socle,
      valeur: valeurStat(st.socle, niv),
    })),
    // Comptes seuls — jamais un libellé (CADRAGE-ALTHEA.md §9).
    tenusAujourdhui: skillsEtat.filter((s) => s.etatDuJour === true).length,
    enSommeil: skillsEtat.filter((s) => s.etatDuJour !== true).length,
  };
}
