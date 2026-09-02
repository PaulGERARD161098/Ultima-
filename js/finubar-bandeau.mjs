/* LE BANDEAU FINUBAR — l'état des projets, en bas de l'accueil (P3).

   Rendu 100 % `createElement` / `textContent` : rien de ce qui vient de la
   route n'entre en `innerHTML`. Ce n'est pas de la PII, mais c'est du texte
   libre écrit dans huit fichiers, donc une entrée hostile par défaut (§8.2).

   ⛔ IL NE CALCULE RIEN. Les ≤ 3 signaux et l'action unique sont produits par
   `cartoucheDuMatin` dans `finubar/agreger.mjs` et servis tels quels par
   `/api/finubar`. Une deuxième règle de priorité ici finirait par diverger de
   la première : l'étoile dirait 3 quand le bandeau dirait 2.

   Le degré d'appel, lui, est LE MÊME vocabulaire que celui des étoiles
   (`js/adaptateur-finubar.mjs`) — c'est ce qui fait qu'une barre or dans le
   bandeau et un halo or dans le ciel parlent de la même chose. */

// Du « pourquoi » de `cartoucheDuMatin` au degré d'appel du ciel. La table est
// écrite ici parce que c'est le seul endroit qui lit les deux vocabulaires.
const DEGRE_DU_POURQUOI = {
  attente: 'appel',
  derive: 'recaler',
  commit_inconnu: 'recaler',
  en_cours: 'braise',
};

function bloc(parent, classe, texte, balise = 'p') {
  const el = parent.ownerDocument.createElement(balise);
  el.className = classe;
  if (texte !== undefined && texte !== null) { el.textContent = texte; }
  parent.appendChild(el);
  return el;
}

/**
 * Peint le bandeau. `surSignal(projet)` est appelé au clic d'un signal — un
 * signal qu'on ne peut pas suivre est une notification, et une notification ne
 * fait rien avancer.
 */
export function poser(conteneur, agregat, surSignal) {
  if (!conteneur || !agregat) { return false; }
  const doc = conteneur.ownerDocument;
  const macro = agregat.macro || {};
  const cartouche = agregat.cartouche || {};
  conteneur.textContent = '';

  // ---- ce qu'on regarde, et DE QUAND il date -------------------------------
  const entete = doc.createElement('div');
  entete.className = 'fb-entete';
  conteneur.appendChild(entete);
  bloc(entete, 'fb-nom', 'FINUBAR · ce matin');
  // ⛔ LA DATE EST AU PREMIER PLAN, PAS EN NOTE DE BAS DE PAGE (jalon 0).
  // L'agrégat est figé au dernier commit ; vu chaque matin en pleine page, il
  // se lirait comme l'état de l'instant, et un jour il aurait trois jours de
  // retard sans que rien ne le dise. Un pilotage qui ne dit pas de quand il
  // date est un piège.
  bloc(entete, 'fb-date', 'collecté le ' + (agregat.le || '—'));
  const compte = [
    (macro.lisibles || 0) + ' projets lus',
    (macro.en_attente_de_paul || 0) + ' attendent un geste',
    (macro.en_cours || 0) + ' en cours',
  ];
  // Un dépôt qu'on n'a pas pu ouvrir est DIT — il ne se lit jamais comme un
  // dépôt sans problème (règle du 2026-08-17, reprise de la collecte).
  if (macro.hors_seance) { compte.push(macro.hors_seance + ' hors de portée'); }
  if (macro.illisibles) { compte.push(macro.illisibles + ' sans grain lisible'); }
  bloc(entete, 'fb-compte', compte.join(' · '));

  // ---- les signaux ---------------------------------------------------------
  const liste = doc.createElement('ul');
  liste.className = 'fb-signaux';
  conteneur.appendChild(liste);
  const signaux = Array.isArray(cartouche.signaux) ? cartouche.signaux : [];
  if (!signaux.length) {
    const li = doc.createElement('li');
    li.className = 'fb-signal fb-signal--calme';
    liste.appendChild(li);
    bloc(li, 'fb-dit', 'Rien n’appelle ce matin.');
  }
  signaux.forEach((s) => {
    const li = doc.createElement('li');
    li.className = 'fb-signal';
    li.setAttribute('data-appel', DEGRE_DU_POURQUOI[s.pourquoi] || 'braise');
    liste.appendChild(li);
    const b = doc.createElement('button');
    b.type = 'button';
    b.className = 'fb-bouton';
    li.appendChild(b);
    bloc(b, 'fb-projet', s.projet, 'span');
    bloc(b, 'fb-dit', s.dit, 'span');
    b.addEventListener('click', () => {
      if (typeof surSignal === 'function') { surSignal(s.projet); }
    });
  });

  // ---- et par quoi commencer ----------------------------------------------
  const action = doc.createElement('div');
  action.className = 'fb-action';
  conteneur.appendChild(action);
  bloc(action, 'fb-leo', 'Léo — commençons par ça');
  if (cartouche.action) {
    bloc(action, 'fb-quoi', cartouche.action.projet + ' · ' + cartouche.action.faire);
    // « L'action suit la main qui l'a » (`cartoucheDuMatin`) : quand le goulot
    // est un geste de Paul, on ne propose pas d'aller coder à côté — ce serait
    // travailler pour travailler, ce que la directive EB interdit.
    bloc(action, 'fb-nature', cartouche.action.nature === 'geste'
      ? 'C’est un geste qui n’appartient qu’à toi — rien ne se code à sa place.'
      : 'C’est du code — je peux m’y mettre.');
  } else {
    bloc(action, 'fb-quoi', 'Rien à proposer : aucun projet lisible dans cet agrégat.');
  }
  return true;
}
