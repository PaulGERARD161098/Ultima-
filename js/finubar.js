// FINUBAR côté navigateur — rendu de la table de marche des huit dépôts.
//
// Rendu 100 % data-driven depuis GET /api/finubar (jeton de session Supabase,
// même mécanique que js/idees.js : vendor local + js/config.js).
// Injection DOM par createElement/textContent EXCLUSIVEMENT — jamais
// d'innerHTML : la CSP d'Ultima n'autorise aucun script ni style inline, et le
// contenu vient de fichiers markdown éditables à la main (donc hostiles par défaut).
//
// Fail-closed, dans l'ordre où les cas se présentent :
//   pas de configuration Supabase → message, page inerte ;
//   pas de session               → message qui renvoie à la boussole ;
//   401 / réseau / JSON cassé    → message générique, aucun détail interne.
// Une page de pilotage qui affiche un état FAUX est pire qu'une page qui dit
// « je ne sais pas » : dans le doute, elle se tait.
//
// ⛔ Aucun calcul de priorité ici. L'ordre, les signaux et l'action viennent du
// moteur `finubar/agreger.mjs`, exécuté à la collecte et éprouvé par
// `tests/unit-finubar.mjs`. Recalculer quoi que ce soit dans la page créerait
// une seconde vérité — et c'est toujours la seconde qui finit par mentir.

const ETIQUETTES = {
  en_cours: 'en cours',
  en_attente_de_paul: 'attend un geste',
  au_repos: 'au repos',
};

function el(nom, classe, texte) {
  const n = document.createElement(nom);
  if (classe) n.className = classe;
  if (texte !== undefined && texte !== null) n.textContent = String(texte);
  return n;
}

function ligne(hote, cle, valeur) {
  if (!valeur) return;
  const p = el('p', 'ligne');
  p.appendChild(el('span', 'ligne-cle', cle));
  p.appendChild(document.createTextNode(String(valeur)));
  hote.appendChild(p);
}

function rendreMatin(donnees) {
  const hote = document.getElementById('matin-corps');
  hote.replaceChildren();
  // La réponse de l'API est une entrée EXTERNE du point de vue de la page, même
  // si elle vient de nous : un `cartouche` présent mais sans `signaux` ferait
  // lever `.length` et emporterait toute la page — état blanc, sans message.
  // On vérifie donc la FORME, pas seulement la présence.
  const brut = donnees.cartouche;
  const c = (brut && Array.isArray(brut.signaux))
    ? { signaux: brut.signaux, action: brut.action || null }
    : { signaux: [], action: null };

  if (!c.signaux.length && !c.action) {
    hote.appendChild(el('p', 'matin-vide', 'Rien n’appelle : les huit dépôts sont à jour.'));
    return;
  }

  const liste = el('ul', 'matin-signaux');
  c.signaux.forEach((s) => {
    const li = el('li');
    li.appendChild(el('span', 'signal-projet', s.projet));
    li.appendChild(el('span', 'signal-dit', s.dit));
    liste.appendChild(li);
  });
  hote.appendChild(liste);

  if (c.action) {
    const bloc = el('div', 'matin-action');
    bloc.appendChild(el('p', 'matin-action-titre',
      c.action.nature === 'geste' ? 'La prochaine action — un geste de Paul' : 'La prochaine action'));
    bloc.appendChild(el('p', 'matin-action-faire', `${c.action.projet} — ${c.action.faire}`));
    if (c.action.cap) bloc.appendChild(el('p', 'matin-action-cap', `Pourquoi : ${c.action.cap}`));
    hote.appendChild(bloc);
  }
}

function rendreProjet(p) {
  const li = el('li', 'projet');
  const appelle = p.rang <= 1;
  if (appelle) li.classList.add('appelle');

  if (!p.ok) {
    // Un grain illisible s'affiche AVEC son motif. Le faire disparaître le
    // ferait lire comme « rien à signaler » — l'inverse de la vérité.
    //
    // ⚠️ Mais on ne dit pas la même chose dans les deux cas, et l'écart n'est
    // pas cosmétique. « Finubar n'a pas pu LIRE ce dépôt » accuse le dépôt ;
    // pour un dépôt simplement absent de la séance, c'est faux — son grain se
    // porte peut-être très bien, personne n'est allé voir. Le premier libellé
    // envoie corriger quelque chose, le second dit où porter le regard.
    li.classList.add('projet-illisible');
    const tete = el('div', 'projet-tete');
    tete.appendChild(el('h3', 'projet-nom', p.depot || 'dépôt inconnu'));
    tete.appendChild(el('span', 'projet-etat attente', p.hors_seance ? 'non collecté' : 'état illisible'));
    li.appendChild(tete);
    li.appendChild(el('p', 'projet-cap', p.hors_seance
      ? 'Ce dépôt n’était pas attaché à la séance qui a produit cette collecte : son grain n’a pas été lu. Ce n’est pas un constat sur lui.'
      : `Finubar n’a pas pu lire ce dépôt : ${p.motif}.`));
    return li;
  }

  const g = p.grain;
  const tete = el('div', 'projet-tete');
  tete.appendChild(el('h3', 'projet-nom', g.projet));
  const etat = el('span', 'projet-etat', ETIQUETTES[g.etat] || g.etat);
  if (g.etat === 'en_attente_de_paul') etat.classList.add('attente');
  tete.appendChild(etat);
  tete.appendChild(el('span', 'projet-depot', g.depot));
  li.appendChild(tete);

  if (p.derive && p.derive.commits_depuis > 0) {
    li.appendChild(el('p', 'derive',
      `Ce dépôt a avancé de ${p.derive.commits_depuis} commit(s) depuis cette note`
      + `${p.derive.tete ? ` (tête ${p.derive.tete})` : ''} : vérifier avant de la croire.`));
  }

  if (g.cap) li.appendChild(el('p', 'projet-cap', g.cap));

  ligne(li, 'Jalon', g.jalon.nom);
  ligne(li, 'Sortie quand', g.jalon.critere_de_sortie);
  ligne(li, 'Arrêté le', g.dernier_arret.le
    ? `${g.dernier_arret.le} — ${g.dernier_arret.quoi}${g.dernier_arret.commit ? ` (${g.dernier_arret.commit})` : ''}`
    : '');
  ligne(li, 'Reprendre par', g.prochaine_action);
  ligne(li, 'Roadmap', g.rattache_a);

  if (g.bloque_par.length) {
    const titre = el('p', 'ligne');
    titre.appendChild(el('span', 'ligne-cle', p.jours_en_attente !== null
      ? `En attente d’un geste — depuis ${p.jours_en_attente} j`
      : 'En attente d’un geste'));
    li.appendChild(titre);
    const ul = el('ul', 'projet-gestes');
    g.bloque_par.forEach((geste) => ul.appendChild(el('li', null, geste)));
    li.appendChild(ul);
  }

  // ⛔ REPLIÉES, et c'est le point de la boucle du 2026-09-03. Dépliées, elles
  // pesaient à elles seules les trois quarts de la fiche (RénoBoost : 8 entrées,
  // ~3 000 caractères) et noyaient les cinq lignes qu'on vient chercher — état,
  // jalon, arrêt, reprise, geste en attente. Elles ne sont pas RETIRÉES pour
  // autant : une boucle ouverte qui disparaît se lit comme une boucle fermée
  // (règle ⑤ du dispositif). Le compte reste visible, le détail est à un clic.
  if (g.boucles_ouvertes.length) {
    const n = g.boucles_ouvertes.length;
    const repli = el('details', 'projet-boucles');
    repli.appendChild(el('summary', null, `${n} boucle${n > 1 ? 's' : ''} ouverte${n > 1 ? 's' : ''}`));
    const ul = el('ul', 'projet-gestes');
    g.boucles_ouvertes.forEach((b) => ul.appendChild(
      el('li', null, b.depuis ? `${b.quoi} — ouverte depuis le ${b.depuis}` : b.quoi)));
    repli.appendChild(ul);
    li.appendChild(repli);
  }

  return li;
}

function rendre(donnees) {
  rendreMatin(donnees);
  const marche = document.getElementById('marche');
  marche.replaceChildren();
  (Array.isArray(donnees.projets) ? donnees.projets : [])
    .forEach((p) => marche.appendChild(rendreProjet(p)));

  const m = (donnees.macro && typeof donnees.macro === 'object') ? donnees.macro : {};
  const n = (v) => (typeof v === 'number' ? v : 0);
  const prov = document.getElementById('provenance');
  prov.replaceChildren();
  prov.appendChild(document.createTextNode(
    `État collecté le ${donnees.le || '—'} — ${n(m.total)} dépôts : ${n(m.en_cours)} en cours, `
    + `${n(m.en_attente_de_paul)} en attente d’un geste, ${n(m.au_repos)} au repos, `
    + `${n(m.boucles_ouvertes)} boucle(s) ouverte(s). `));
  prov.appendChild(document.createTextNode(
    'Cet état est figé au dernier commit : la page ne va rien chercher en direct. Pour le rafraîchir : '));
  prov.appendChild(el('code', null, 'node finubar/collecter.mjs'));
  prov.appendChild(document.createTextNode(', puis commiter.'));
}

function message(texte) {
  const hote = document.getElementById('matin-corps');
  hote.replaceChildren(el('p', 'etat-message', texte));
}

async function demarrer() {
  const cfg = window.ULTIMA_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY
      || !window.supabase || typeof window.supabase.createClient !== 'function') {
    message('Configuration absente : la table de marche ne peut pas être servie ici.');
    return;
  }

  let session = null;
  try {
    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    session = data && data.session;
  } catch {
    session = null;
  }
  if (!session) {
    message('Session fermée. Ouvre une session depuis la boussole, puis reviens ici.');
    return;
  }

  try {
    const reponse = await fetch('/api/finubar', {
      headers: { Authorization: 'Bearer ' + session.access_token },
    });
    if (!reponse.ok) {
      message(reponse.status === 401
        ? 'Session expirée. Reconnecte-toi depuis la boussole.'
        : 'La table de marche est indisponible pour le moment.');
      return;
    }
    const charge = await reponse.json();
    if (!charge || charge.ok !== true || !charge.data) {
      message('La table de marche est indisponible pour le moment.');
      return;
    }
    rendre(charge.data);
  } catch {
    // Aucun détail en console : ni URL interne, ni forme de la réponse.
    message('La table de marche est indisponible pour le moment.');
  }
}

// Garde d'environnement : importé sous Node (unitaires), le module ne fait rien.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer, { once: true });
  } else {
    demarrer();
  }
}
