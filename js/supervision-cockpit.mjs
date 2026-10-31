// LE COCKPIT DE SUPERVISION — l'arbitrage des propositions de Léo (31/10/2026).
//
// Monté par js/finubar.js sous la table de marche, avec le jeton de session de
// Paul. Lit GET /api/supervision ; chaque proposition EN_ATTENTE porte trois
// gestes : accepter, refuser (une note facultative), retirer. Chaque geste
// demande une SECONDE pression (« Confirmer : … ») : une décision tranchée ne se
// défait pas, un clic égaré ne doit pas la produire.
//
// ⛔ C'est la SEULE interface qui appelle `arbitrer` et `retirer`. Léo n'y a
// aucun accès : son outil ne fabrique que `soumettre` (js/leo-accueil.js).
// ⛔ createElement/textContent EXCLUSIVEMENT : le dossier est écrit par Léo,
// donc hostile par défaut. Liste FERMÉE des messages serveur.
// Le contrôle précède l'outil : ce cockpit fonctionne AVANT que la soumission
// soit ouverte (l'interrupteur s'affiche), et dit franchement quand le registre
// n'existe pas encore (migration non appliquée).

export const LIBELLES_STATUT = Object.freeze({
  EN_ATTENTE: 'En attente de ton arbitrage',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
  OBSOLETE: 'Retirée',
});
export const LIBELLES_RECOMMANDATION = Object.freeze({
  conserver: 'Conserver', mesurer: 'Mesurer', ameliorer: 'Améliorer', mutualiser: 'Mutualiser',
  simplifier: 'Simplifier', suspendre: 'Suspendre', proposer_retrait: 'Proposer le retrait',
});
const MESSAGES_ECHEC = Object.freeze({
  401: 'Session expirée. Reconnecte-toi depuis la boussole.',
  403: 'Accès réservé au propriétaire.',
  404: 'Proposition introuvable : la liste a été rechargée.',
  409: 'Cette proposition est déjà tranchée : la liste a été rechargée.',
});
const propre = (t, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k);
const texte = (v, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : '');

/** Une ligne du registre → ce que l'écran en montre. PUR. Forme hostile → null. */
export function vueProposition(ligne) {
  if (!ligne || typeof ligne !== 'object' || typeof ligne.id !== 'string' || !propre(LIBELLES_STATUT, ligne.statut)) return null;
  const p = ligne.proposition && typeof ligne.proposition === 'object' && !Array.isArray(ligne.proposition) ? ligne.proposition : {};
  const r = p.reexamen && typeof p.reexamen === 'object' ? p.reexamen : {};
  const preuves = Array.isArray(ligne.preuves_ids) ? ligne.preuves_ids.filter((x) => typeof x === 'string').slice(0, 22) : [];
  return {
    id: ligne.id,
    statut: ligne.statut,
    statutLibelle: LIBELLES_STATUT[ligne.statut],
    enAttente: ligne.statut === 'EN_ATTENTE',
    titre: (propre(LIBELLES_RECOMMANDATION, ligne.recommandation) ? LIBELLES_RECOMMANDATION[ligne.recommandation] : 'Recommandation inconnue') +
      ' — ' + texte(ligne.objet_id, 140),
    lignes: [
      ['Constat', texte(p.constat)], ['Bénéfice', texte(p.typeBenefice, 20)], ['Besoin', texte(p.besoin)], ['Bénéficiaire', texte(p.beneficiaire)],
      ['Conséquence', texte(p.consequence)], ['Alternative minimale', texte(p.alternativeMinimale)],
      ['Gain attendu', texte(p.gainAttendu)], ['Preuve attendue', texte(p.preuveAttendue)],
      ['Contrefactuel', texte(p.contrefactuel)], ['Preuve des dépendances', texte(p.preuveDependancesId, 140)],
      ['Preuve des protections', texte(p.preuveProtectionsId, 140)], ['Retour arrière', texte(p.retourArriere)],
      ['Capacité commune', texte(p.capaciteCommune)], ['Compatibilité', texte(p.compatibiliteVerifiee)],
      ['Réexamen', [texte(r.responsable, 120), texte(r.declencheur, 300)].filter(Boolean).join(' · ')],
      ['Poursuivre si', texte(r.criterePoursuite, 300)], ['Arrêter si', texte(r.critereArret, 300)],
      ['Notes de décision', texte(ligne.decision_notes)],
      ['Refus valable jusqu’au', ligne.statut === 'REFUSEE'
        ? (typeof ligne.prochain_reexamen_le === 'string' ? ligne.prochain_reexamen_le.slice(0, 10) : 'sans limite (aucune date de réexamen)')
        : ''],
    ].filter(([, v]) => v),
    preuves,
    // true : retrouvées au catalogue par le serveur ; false : introuvables ; null : non vérifié.
    preuvesConnues: ligne.preuves_connues === true ? true : ligne.preuves_connues === false ? false : null,
    creeLe: typeof ligne.cree_le === 'string' ? ligne.cree_le.slice(0, 10) : '',
    reexamenLe: typeof ligne.prochain_reexamen_le === 'string' ? ligne.prochain_reexamen_le.slice(0, 10) : '',
    trancheLe: typeof ligne.tranche_le === 'string' ? ligne.tranche_le.slice(0, 10) : '',
  };
}

/** La réponse d'échec → le message dit à Paul (liste fermée). PUR. */
export function messageEchec(statut, erreur) {
  if (statut === 503 && erreur === 'Registre absent') {
    return 'Le registre de supervision n’est pas encore en place : la migration est à appliquer.';
  }
  return MESSAGES_ECHEC[statut] || 'Le registre de supervision est indisponible pour le moment.';
}

function el(nom, classe, contenu) {
  const n = document.createElement(nom);
  if (classe) n.className = classe;
  if (contenu !== undefined && contenu !== null) n.textContent = String(contenu);
  return n;
}

export function monterCockpit({ hote, jeton, fetchImpl = (...a) => window.fetch(...a) }) {
  if (!hote || typeof jeton !== 'string' || !jeton) return;
  const appeler = async (methode, corps) => {
    try {
      const r = await fetchImpl('/api/supervision', {
        method: methode,
        headers: { Authorization: 'Bearer ' + jeton, Accept: 'application/json', ...(corps ? { 'Content-Type': 'application/json' } : {}) },
        ...(corps ? { body: JSON.stringify(corps) } : {}),
      });
      let c = null;
      try { c = await r.json(); } catch { c = null; }
      return { statut: r.status, ok: r.ok && c && c.ok === true, corps: c };
    } catch { return { statut: 0, ok: false, corps: null }; }
  };

  const annonce = el('p', 'supervision-annonce');
  annonce.setAttribute('role', 'status');
  annonce.setAttribute('aria-live', 'polite');

  async function charger() {
    const r = await appeler('GET');
    hote.replaceChildren();
    if (!r.ok || !r.corps.data || !Array.isArray(r.corps.data.propositions)) {
      hote.appendChild(el('p', 'etat-message', messageEchec(r.statut, r.corps && r.corps.error)));
      hote.appendChild(annonce);
      return;
    }
    const { propositions, soumission_active: active } = r.corps.data;
    hote.appendChild(el('p', 'supervision-interrupteur',
      active === true ? 'Léo peut soumettre des propositions.' : 'Soumission par Léo coupée (LEO_SUPERVISION).'));
    const vues = propositions.map(vueProposition).filter(Boolean);
    if (!vues.length) {
      hote.appendChild(el('p', 'etat-message', 'Aucune proposition pour le moment.'));
      hote.appendChild(annonce);
      return;
    }
    const liste = el('ul', 'supervision-liste');
    for (const v of vues) liste.appendChild(rendre(v));
    hote.appendChild(liste);
    hote.appendChild(annonce);
  }

  function rendre(v) {
    const li = el('li', v.enAttente ? 'projet supervision appelle' : 'projet supervision');
    li.dataset.id = v.id;
    const tete = el('div', 'projet-tete');
    tete.appendChild(el('h3', 'projet-nom', v.titre));
    tete.appendChild(el('span', v.enAttente ? 'projet-etat attente' : 'projet-etat', v.statutLibelle));
    if (v.creeLe) tete.appendChild(el('span', 'projet-depot', 'Proposée le ' + v.creeLe + (v.trancheLe ? ' · tranchée le ' + v.trancheLe : '')));
    li.appendChild(tete);
    for (const [cle, valeur] of v.lignes) {
      const p = el('p', 'ligne');
      p.appendChild(el('span', 'ligne-cle', cle));
      p.appendChild(document.createTextNode(valeur));
      li.appendChild(p);
    }
    if (v.preuves.length) {
      const p = el('p', 'ligne');
      p.appendChild(el('span', 'ligne-cle', 'Preuves'));
      p.appendChild(document.createTextNode(v.preuves.join(' · ')));
      li.appendChild(p);
      li.appendChild(el('p', 'supervision-avertissement',
        v.preuvesConnues === true
          ? 'Ces preuves existent au catalogue ; leur pertinence pour l’objet reste à juger par toi.'
          : v.preuvesConnues === false
            ? 'Preuve ou objet introuvable au catalogue : dossier non contrôlé par Ultima.'
            : 'Existence des preuves non vérifiée : catalogue indisponible.'));
    }
    if (v.enAttente) li.appendChild(gestes(v));
    return li;
  }

  function gestes(v) {
    const bloc = el('div', 'supervision-gestes');
    const etiquette = el('label', 'ligne-cle', 'Note de décision (facultative)');
    const note = el('textarea', 'supervision-note');
    note.id = 'note-' + v.id;
    etiquette.htmlFor = note.id;
    note.maxLength = 2000;
    note.rows = 2;
    bloc.appendChild(etiquette);
    bloc.appendChild(note);
    // La date de réexamen : jusqu'à elle, un refus bloque le même objet et la même
    // recommandation, quelles que soient les preuves (Paul, 31/10). Vide : sans limite.
    const etiquetteDate = el('label', 'ligne-cle', 'Réexaminer à partir du (facultatif — sans date, un refus vaut sans limite)');
    const date = el('input', 'supervision-date');
    date.type = 'date';
    date.id = 'reexamen-' + v.id;
    etiquetteDate.htmlFor = date.id;
    bloc.appendChild(etiquetteDate);
    bloc.appendChild(date);
    const boutons = el('div', 'supervision-boutons');
    const definir = [
      ['Accepter', 'Confirmer : accepter', { action: 'arbitrer', decision: 'ACCEPTEE' }, 'Proposition acceptée.'],
      ['Refuser', 'Confirmer : refuser', { action: 'arbitrer', decision: 'REFUSEE' }, 'Proposition refusée.'],
      ['Retirer', 'Confirmer : retirer', { action: 'retirer' }, 'Proposition retirée.'],
    ];
    const tous = [];
    for (const [libelle, confirmer, corps, reussite] of definir) {
      const b = el('button', 'supervision-bouton', libelle);
      b.type = 'button';
      let arme = false;
      b.addEventListener('click', async () => {
        if (!arme) {
          tous.forEach((autre) => { autre.desarmer(); });
          arme = true;
          b.textContent = confirmer;
          b.classList.add('arme');
          return;
        }
        tous.forEach((autre) => { autre.bouton.disabled = true; });
        const envoi = { ...corps, id: v.id };
        if (corps.action === 'arbitrer' && note.value.trim()) envoi.notes = note.value.slice(0, 2000);
        if (corps.action === 'arbitrer' && /^\d{4}-\d{2}-\d{2}$/.test(date.value)) envoi.reexamen_le = date.value;
        const r = await appeler('POST', envoi);
        await charger();
        annonce.textContent = r.ok ? reussite : messageEchec(r.statut, r.corps && r.corps.error);
      });
      const entree = { bouton: b, desarmer: () => { arme = false; b.textContent = libelle; b.classList.remove('arme'); } };
      tous.push(entree);
      boutons.appendChild(b);
    }
    bloc.appendChild(boutons);
    return bloc;
  }

  hote.replaceChildren(el('p', 'etat-message', 'Lecture des propositions…'));
  return charger();
}
