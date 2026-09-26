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
 * L'âge d'une date `AAAA-MM-JJ`, en jours de calendrier locaux : « aujourd’hui »,
 * « hier », « il y a N jours ». Rien (chaîne vide) pour une date illisible ou
 * dans le futur — on ne devine pas un âge qu'on ne sait pas lire.
 */
export function ageDe(le, maintenant = new Date()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(le || ''));
  if (!m) { return ''; }
  const jour = new Date(+m[1], +m[2] - 1, +m[3]);
  if (jour.getMonth() !== +m[2] - 1) { return ''; }
  const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const n = Math.round((aujourdhui - jour) / 86400000);
  if (n < 0) { return ''; }
  if (n === 0) { return 'aujourd’hui'; }
  if (n === 1) { return 'hier'; }
  return 'il y a ' + n + ' jours';
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
  // Un `aria-label` sur un `div` sans rôle n'est lu par personne : le nom du
  // bandeau n'apparaissait pas dans l'arbre d'accessibilité (mesuré, 26/09).
  conteneur.setAttribute('role', 'region');

  // ---- ce qu'on regarde, et DE QUAND il date -------------------------------
  const entete = doc.createElement('div');
  entete.className = 'fb-entete';
  conteneur.appendChild(entete);
  // « ce matin » était écrit en dur au-dessus d'une date qui pouvait avoir des
  // jours (critique impeccable du 26/09 : le 26, l'agrégat datait du 24). Le
  // nom ne prétend plus rien : c'est la date, et son âge, qui parlent.
  bloc(entete, 'fb-nom', 'FINUBAR');
  // ⛔ LA DATE EST AU PREMIER PLAN, PAS EN NOTE DE BAS DE PAGE (jalon 0).
  // L'agrégat est figé au dernier commit ; vu chaque matin en pleine page, il
  // se lirait comme l'état de l'instant, et un jour il aurait trois jours de
  // retard sans que rien ne le dise. Un pilotage qui ne dit pas de quand il
  // date est un piège.
  // La date reste écrite TELLE QU'ELLE EST LUE (le harnais le tient) ; son
  // âge s'y ajoute, compté par rapport à aujourd'hui, pour qu'un agrégat de
  // trois jours ne se lise jamais comme l'état de l'instant.
  const age = ageDe(agregat.le);
  bloc(entete, 'fb-date', 'collecté le ' + (agregat.le || '—') + (age ? ' · ' + age : ''));
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

  // ---- AU TÉLÉPHONE, LE BANDEAU SE REPLIE (26/09, capture de Paul) ---------
  // À la hauteur réelle de Safari (~664 px), le bandeau déplié en prenait 200
  // et le ciel n'en gardait que ~180 : l'écran était devenu un tableau de bord
  // avec une bande de ciel. Replié, il garde ce qui ne se cache jamais — le
  // nom, la DATE, le compte (dont « hors de portée ») — et les signaux
  // s'ouvrent d'un toucher. Le bouton n'existe à l'écran qu'au téléphone
  // (`css/finubar-bandeau.css`) : sur ordinateur, la liste reste ouverte.
  // Le ciel suit tout seul : `js/ciel-noeud.mjs` observe la taille du bandeau.
  conteneur.classList.add('fb-bandeau--replie');
  const deplier = doc.createElement('button');
  deplier.type = 'button';
  deplier.className = 'fb-deplier';
  deplier.setAttribute('aria-controls', 'fb-signaux');
  deplier.setAttribute('aria-expanded', 'false');
  deplier.textContent = 'Voir les signaux';
  deplier.addEventListener('click', () => {
    const ouvert = conteneur.classList.toggle('fb-bandeau--replie') === false;
    deplier.setAttribute('aria-expanded', String(ouvert));
    // Au téléphone, les signaux dépliés et le dock de Léo ne tiennent pas
    // ensemble au-dessus du ciel : mesuré le 26/09, une étoile passait sous le
    // dock. On fait une chose à la fois — `css/leo.css` met le dock de côté
    // tant que les signaux sont ouverts, « Replier » le ramène.
    doc.body.classList.toggle('fb-deplie', ouvert);
    deplier.textContent = ouvert ? 'Replier' : 'Voir les signaux';
  });
  entete.appendChild(deplier);

  // ---- les signaux ---------------------------------------------------------
  const liste = doc.createElement('ul');
  liste.className = 'fb-signaux';
  liste.id = 'fb-signaux';
  conteneur.appendChild(liste);
  const signaux = Array.isArray(cartouche.signaux) ? cartouche.signaux : [];
  if (!signaux.length) {
    const li = doc.createElement('li');
    li.className = 'fb-signal fb-signal--calme';
    liste.appendChild(li);
    bloc(li, 'fb-dit', 'Rien n’appelle en ce moment.');
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
