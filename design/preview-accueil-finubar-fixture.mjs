/* FIXTURE de la maquette « accueil × Finubar ».

   ⛔ CONTENU NEUTRE, ET C'EST UNE MESURE DE SÉCURITÉ, PAS UNE COMMODITÉ.
   `design/` N'EST PAS dans `.vercelignore` (vérifié le 2026-09-02) : tout
   fichier posé ici est servi en clair sur le domaine public. Or l'agrégat
   Finubar — jalons, blocages, « ce qui n'a jamais tourné » — est précisément
   la donnée que le 31/08 a sortie du déploiement (`finubar/` ignoré) et mise
   derrière `requireUser` (`/api/finubar`). La recopier dans une maquette
   publique annulerait ce travail en une ligne.

   ⚠️ Relu le 26/09 : c'est devenu faux dans le bon sens — `design/` est
   désormais dans `.vercelignore` ET `/design` dans `PREFIXES_PRIVES`
   (`middleware.js`). La règle ci-dessous tient quand même : deux gardes
   peuvent tomber, une donnée absente ne fuit pas.

   Donc : la FORME est celle de `/api/finubar` (mêmes clés, mêmes longueurs de
   texte, mêmes ordres de grandeur), le CONTENU est inventé. Ce qu'on juge ici
   est un rendu, pas un état — l'état se regarde sur la page authentifiée.

   La forme est tenue par `finubar/agreger.mjs` (`agreger` + `cartoucheDuMatin`).
   Si elle change là-bas, cette fixture doit suivre : c'est le prix d'une
   maquette qui ne peut pas lire la vraie source. */

// `ciel` — L'ACCROCHE DE L'ASTRE dans l'arbre de navigation. Le grain la
// DÉCLARE (champ à ajouter aux huit FINUBAR.md, §3 du cadrage) plutôt que la
// maquette ne la devine : une table de correspondance tenue à côté serait une
// deuxième vérité, et c'est exactement ce que Finubar s'interdit (« il indexe,
// il ne recopie pas »). Absente → l'astre se range sous ALPHA.
const P = (projet, depot, etat, rang, jours, jalon, action, bloque, ciel) => ({
  ok: true,
  depot,
  ciel,
  grain: {
    projet, depot, etat,
    cap: 'Le cap de ce projet, en une phrase — ce vers quoi il va.',
    jalon: { nom: jalon, critere_de_sortie: 'le critère de sortie, mesurable' },
    dernier_arret: { le: '2026-09-01', quoi: 'Le dernier arrêt, daté et vérifié.', commit: '0000000' },
    prochaine_action: action,
    bloque_par: bloque,
    boucles_ouvertes: [],
  },
  jours_en_attente: jours,
  jours_depuis_maj: 1,
  rang,
  derive: { commits_depuis: rang === 0 ? 3 : 0, commit_inconnu: false },
});

export const AGREGAT = {
  le: '2026-09-02',
  projets: [
    P('Projet Delta', 'exemple/delta', 'en_attente_de_paul', 1, 49,
      'Le premier jalon — recruter les premiers utilisateurs',
      'Brancher la mesure d’audience', ['Un geste qui n’appartient qu’à toi, ouvert depuis sept semaines'], 'renoboost-ia'),
    P('Projet Gamma', 'exemple/gamma', 'en_attente_de_paul', 1, 29,
      'Le premier jalon — mettre l’objet physique en circulation',
      'Rejouer le digest', ['Imprimer le lot et l’emporter sur le chantier'], 'renoboost-ia'),
    P('Projet Bêta', 'exemple/beta', 'en_attente_de_paul', 1, 29,
      'Le premier jalon — la fiche publique validée',
      'Reprendre la page publique', ['Valider la fiche auprès du tiers'], 'renoboost-ia'),
    P('Projet Alpha', 'exemple/alpha', 'en_cours', 2, null,
      'Le jalon en cours — la recette de bout en bout',
      'Reprendre le lot suivant, là où il s’est arrêté', [], 'renoboost-ia'),
    P('Ultima', 'exemple/ultima', 'en_cours', 2, null,
      'Le jalon en cours — le pilotage en un seul écran',
      'Brancher la couleur d’appel sur le ciel', [], 'racine'),
    { ok: false, depot: 'exemple/epsilon', motif: 'dépôt non attaché à cette séance', hors_seance: true, rang: 9, grain: null },
    { ok: false, depot: 'exemple/zeta', motif: 'dépôt non attaché à cette séance', hors_seance: true, rang: 9, grain: null },
    { ok: false, depot: 'exemple/eta', motif: 'dépôt non attaché à cette séance', hors_seance: true, rang: 9, grain: null },
  ],
  macro: {
    total: 8, lisibles: 5, illisibles: 0, hors_seance: 3,
    en_cours: 2, en_attente_de_paul: 3, au_repos: 0,
    derives: 0, commits_inconnus: 0, boucles_ouvertes: 24, gestes_de_paul: [],
  },
  cartouche: {
    signaux: [
      { projet: 'Projet Delta', dit: 'attend un geste : un geste qui n’appartient qu’à toi — ouvert depuis 49 j', pourquoi: 'attente' },
      { projet: 'Projet Gamma', dit: 'attend un geste : imprimer le lot et l’emporter — ouvert depuis 29 j', pourquoi: 'attente' },
      { projet: 'Projet Bêta', dit: 'attend un geste : valider la fiche auprès du tiers — ouvert depuis 29 j', pourquoi: 'attente' },
    ],
    action: {
      projet: 'Projet Delta', nature: 'geste',
      faire: 'Un geste qui n’appartient qu’à toi, ouvert depuis sept semaines',
      cap: 'Le cap de ce projet, en une phrase — ce vers quoi il va.',
    },
    illisibles: 0, hors_seance: 3,
  },
};
