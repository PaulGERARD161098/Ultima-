// ALTHEA — le Système, côté écran (B1, 2026-08-06).
// ---------------------------------------------------------------------------
// FAIL-CLOSED de bout en bout : pas de configuration, pas de session, pas de
// réponse → la page reste MUETTE et le dit. Elle n'invente jamais de données
// d'exemple : ALTHEA porte la donnée la plus sensible d'Ultima (§9), on n'y
// affiche pas un faux corps de Paul « pour faire joli ».
//
// Le calcul ne vit PAS ici : il est dans js/althea-progression.mjs, module pur
// éprouvé au harnais sans navigateur. Ce fichier ne fait que demander, rendre,
// et renvoyer un geste.

import { conditionTenue, etatAlthea, decalerJour, jourAlthea } from './althea-progression.mjs';

const $ = (id) => document.getElementById(id);

const etat = { client: null, proprietaire: null, donnees: null, jour: jourAlthea(), enregistrement: false };

function texte(el, valeur) { if (el) el.textContent = valeur; }

// Dire « ouvre ta session » sans donner la porte, c'est constater sans proposer
// le geste — et une fonction qu'on ne rencontre pas là où on la cherche
// n'existe pas (leçon VRANESH, 2026-08-04). Le message porte donc SON LIEN vers
// la porte de connexion unique d'Ultima : la racine.
// Rappel utile quand ça arrive : le jeton de session est cloisonné PAR ORIGINE.
// Ouvrir ALTHEA depuis une preview alors qu'on s'est connecté en production
// donne exactement cet écran — la page n'est pas cassée, elle est ailleurs.
function messageAvecPorte(hote, message, avecLien) {
  if (!hote) return;
  hote.textContent = '';
  const p = document.createElement('p');
  p.className = 'althea-vide';
  p.textContent = message;
  hote.appendChild(p);
  if (!avecLien) return;
  const porte = document.createElement('p');
  porte.className = 'althea-porte';
  const a = document.createElement('a');
  a.href = '/';
  a.textContent = 'Ouvrir ma session ↝';
  porte.appendChild(a);
  hote.appendChild(porte);
}

function muet(message, avecLien) {
  messageAvecPorte($('althea-skills'), message, avecLien);
  messageAvecPorte($('althea-jour'), message, false);
  texte($('althea-leo'), avecLien
    ? 'Ta session n’est pas ouverte sur ce domaine — le jeton ne suit pas d’une adresse à l’autre. Ouvre-la et je te dis où tu en es.'
    : 'Je te dirai où tu en es dès que le Système répondra.');
}

function clientSupabase() {
  const cfg = window.ULTIMA_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
}

async function session() {
  try {
    const r = await etat.client?.auth.getSession();
    return r?.data?.session ?? null;
  } catch (_) {
    return null;
  }
}

async function appel(methode, corps, chemin = '/api/althea') {
  const active = await session();
  if (!active?.access_token || active.user?.id !== etat.proprietaire) {
    return { ok: false, status: 401 };
  }
  const options = {
    method: methode,
    headers: {
      Authorization: `Bearer ${active.access_token}`,
      // Le jour affiché évite qu'un mot saisi avant minuit se range le lendemain.
      'X-Jour-Local': etat.jour,
    },
  };
  if (corps !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(corps);
  }
  try {
    const reponse = await fetch(chemin, options);
    const json = await reponse.json().catch(() => null);
    return { ok: reponse.ok && json?.ok === true, status: reponse.status, data: json?.data };
  } catch (_) {
    return { ok: false, status: 0 };
  }
}

// ---------- Rendu ----------

const ROMAIN = ['', 'I', 'II', 'III', 'IV', 'V'];

function rendreStats(stats) {
  const hote = $('althea-stats');
  if (!hote) return;
  hote.textContent = '';
  const max = stats.reduce((m, s) => Math.max(m, s.valeur), 0) || 1;
  for (const s of stats) {
    const ligne = document.createElement('div');
    ligne.className = 'althea-st';
    const cle = document.createElement('span');
    cle.className = 'cle';
    cle.textContent = s.code;
    const val = document.createElement('span');
    val.className = 'val';
    val.textContent = String(s.valeur);
    const barre = document.createElement('span');
    barre.className = 'barre';
    const i = document.createElement('i');
    i.style.width = `${Math.round((s.valeur / max) * 100)}%`;
    barre.appendChild(i);
    ligne.append(cle, val, barre);
    hote.appendChild(ligne);
  }
}

function rendreSkills(skills) {
  const hote = $('althea-skills');
  if (!hote) return;
  hote.textContent = '';
  if (!skills.length) {
    const vide = document.createElement('p');
    vide.className = 'althea-vide';
    vide.textContent = 'Aucun skill posé pour l’instant.';
    hote.appendChild(vide);
    return;
  }
  for (const s of skills) {
    const ligne = document.createElement('div');
    ligne.className = 'althea-skill';
    // « dort » n'est pas « raté » : c'est une phrase qui n'est pas vraie
    // aujourd'hui. Le style le dit en gris sourd, jamais en rouge.
    if (s.etatDuJour !== true) ligne.classList.add('dort');
    if (s.verrouille) ligne.classList.add('verrouille');

    const rang = document.createElement('span');
    rang.className = 'rang';
    rang.textContent = ROMAIN[s.rang] || '–';

    const corps = document.createElement('span');
    corps.className = 'corps';
    const nom = document.createElement('span');
    nom.className = 'nom';
    nom.textContent = s.nom;
    if (s.evolueEn) {
      const evo = document.createElement('em');
      evo.className = 'evo';
      evo.textContent = ' ↗';
      nom.appendChild(evo);
    }
    if (s.enonce) {
      const dit = document.createElement('em');
      dit.className = 'dit';
      dit.textContent = ` « ${s.enonce} »`;
      nom.appendChild(dit);
    }
    const barre = document.createElement('span');
    barre.className = 'barre';
    const i = document.createElement('i');
    const part = s.suivant ? Math.max(0, Math.min(1, s.suivant.part)) : 1;
    i.style.width = `${Math.round(part * 100)}%`;
    barre.appendChild(i);
    corps.append(nom, barre);

    const badge = document.createElement('span');
    badge.className = s.etatDuJour === true ? 'etat' : 'etat dort';
    badge.textContent = s.verrouille ? 'Verrouillé' : (s.etatDuJour === true ? 'Tenu' : 'Sommeil');

    ligne.append(rang, corps, badge);
    hote.appendChild(ligne);
  }
}

function quantifie(condition) {
  return ['volume_semaine', 'duree_jour', 'n_par_jour'].includes(condition.cadence);
}

// Les gestes du jour. Toute la ligne est le bouton, y compris son libellé.
function rendreJour(conditions, skills, releves) {
  const hote = $('althea-jour');
  if (!hote) return;
  hote.textContent = '';
  const parSkill = new Map(skills.map((s) => [s.id, s]));
  const actives = conditions.filter((c) => c.actif !== false);
  const relevesDuJour = new Map(releves.filter((r) => r.jour === etat.jour)
    .map((r) => [r.condition_id, r]));
  let renseignes = 0;
  texte($('althea-jour-progres'), '');
  if (!actives.length) {
    const vide = document.createElement('p');
    vide.className = 'althea-vide';
    vide.textContent = 'Aucun geste à cocher pour l’instant.';
    hote.appendChild(vide);
    return;
  }
  for (const c of actives) {
    const releve = relevesDuJour.get(c.id);
    const aCompleter = releve?.tenu && quantifie(c) && releve.quantite == null;
    const partiel = releve?.tenu && quantifie(c) && !aCompleter
      && !conditionTenue(c, releves, etat.jour);
    if (releve && !aCompleter) renseignes++;

    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'althea-geste althea-case';
    bouton.dataset.condition = c.id;
    if (releve && !aCompleter) bouton.setAttribute('aria-pressed', partiel ? 'mixed' : String(releve.tenu));

    const symbole = document.createElement('span');
    symbole.className = 'althea-case-symbole';
    symbole.setAttribute('aria-hidden', 'true');
    symbole.textContent = aCompleter || partiel ? '·' : releve?.tenu ? '✦' : '';

    const lib = document.createElement('span');
    lib.className = 'lib';
    lib.textContent = c.libelle;
    const sous = document.createElement('small');
    const skill = parSkill.get(c.skill_id);
    sous.textContent = `${skill ? skill.nom : ''} · ${libelleCadence(c)}`;
    lib.appendChild(sous);

    const detail = document.createElement('small');
    detail.className = 'althea-geste-detail';
    if (aCompleter) detail.textContent = 'Quantité à préciser';
    else if (releve?.tenu && releve.quantite != null) {
      detail.textContent = `${releve.quantite} ${c.unite || ''}`.trim();
    }
    bouton.append(symbole, lib, detail);
    bouton.addEventListener('click', () => {
      if (etat.enregistrement) return;
      if (quantifie(c) && releve?.tenu !== false) ouvrirQuantite(bouton, c, releve);
      else basculer(c, releve);
    });
    hote.appendChild(bouton);
  }
  texte($('althea-jour-progres'), `${renseignes} / ${actives.length} renseignées`);
}

function libelleCadence(c) {
  if (c.cadence === 'quotidien') return 'chaque jour';
  if (c.cadence === 'tous_les_n_jours') return `tous les ${c.seuil} jours`;
  if (c.cadence === 'volume_semaine') return `${c.seuil} ${c.unite || ''} par semaine`.trim();
  if (c.cadence === 'duree_jour') return `${c.seuil} ${c.unite || 'min'} par jour`;
  if (c.cadence === 'n_par_jour') return `${c.seuil} par jour`;
  return '';
}

function ouvrirQuantite(bouton, condition, releve) {
  const precedent = $('althea-quantite');
  const memeLigne = precedent?.previousElementSibling === bouton;
  precedent?.remove();
  if (memeLigne) return;

  const formulaire = document.createElement('form');
  formulaire.id = 'althea-quantite';
  formulaire.className = 'althea-quantite althea-actions';
  const label = document.createElement('label');
  label.textContent = condition.unite ? `Quantité du jour (${condition.unite})` : 'Quantité du jour';
  const champ = document.createElement('input');
  champ.type = 'number';
  champ.inputMode = 'decimal';
  champ.min = '0';
  champ.max = '99999999';
  champ.step = condition.cadence === 'n_par_jour' ? '1' : '0.01';
  champ.required = true;
  champ.value = releve?.quantite ?? '';
  label.appendChild(champ);
  const valider = document.createElement('button');
  valider.className = 'althea-action althea-action-principale';
  valider.textContent = 'Valider';
  formulaire.append(label, valider);

  if (releve?.tenu) {
    const nonTenu = document.createElement('button');
    nonTenu.type = 'button';
    nonTenu.className = 'althea-action';
    nonTenu.textContent = 'Non tenu';
    nonTenu.addEventListener('click', () => basculer(condition, releve));
    formulaire.appendChild(nonTenu);
  }
  formulaire.addEventListener('submit', (event) => {
    event.preventDefault();
    basculer(condition, releve, champ.valueAsNumber);
  });
  bouton.after(formulaire);
  champ.focus();
}

function messageEchec(statut, message) {
  if (statut === 401) return 'Ta session a expiré. Recharge la page, puis réessaie.';
  if (statut === 409) return 'Un nouveau jour a commencé. Copie ton texte avant de recharger la page.';
  return message;
}

// Les trois états restent accessibles. Pour un geste chiffré, valider la
// quantité crée ou corrige le relevé sans faire d'hypothèse sur sa valeur.
async function basculer(condition, releve, quantite) {
  if (etat.enregistrement) return;
  const statut = $('althea-jour-statut');
  if (etat.jour !== jourAlthea()) {
    texte(statut, 'Un nouveau jour a commencé. Recharge la page pour cocher tes quêtes.');
    return;
  }
  etat.enregistrement = true;
  const hote = $('althea-jour');
  hote.setAttribute('aria-busy', 'true');
  texte(statut, 'Enregistrement…');
  const effacer = releve?.tenu === false && quantite === undefined;
  const tenu = quantite !== undefined || !releve;
  const corps = effacer ? { id: releve.id }
    : { condition_id: condition.id, jour: etat.jour, tenu, quantite };
  const r = await appel(effacer ? 'DELETE' : 'POST', corps);
  etat.enregistrement = false;
  hote.removeAttribute('aria-busy');
  if (!r.ok || !r.data?.id) {
    texte(statut, messageEchec(r.status, 'Quête non enregistrée. Réessaie dans un instant.'));
    return;
  }
  const autres = etat.donnees.releves.filter((ligne) =>
    ligne.condition_id !== condition.id || ligne.jour !== etat.jour);
  if (!effacer) autres.push(r.data);
  etat.donnees.releves = autres;
  rendre(etat.donnees);
  const bouton = Array.from(hote.querySelectorAll('.althea-case'))
    .find((el) => el.dataset.condition === condition.id);
  bouton?.focus({ preventScroll: true });
  if (tenu && bouton?.getAttribute('aria-pressed') === 'true') bouton.classList.add('althea-quete-validee');
  texte(statut, effacer ? 'Quête remise à zéro.' : 'Relevé enregistré.');
}

function installerMotDuJour() {
  const panneau = $('althea-mot');
  const formulaire = $('althea-mot-formulaire');
  const champ = $('althea-mot-texte');
  const statut = $('althea-mot-statut');
  const controles = formulaire.querySelector('fieldset');
  const chemin = '/api/althea?mot=jour';
  let charge = false;
  let chargement = false;
  panneau.hidden = false;
  panneau.addEventListener('toggle', async () => {
    if (!panneau.open || charge || chargement) return;
    chargement = true;
    texte(statut, 'Chargement…');
    const r = await appel('GET', undefined, chemin);
    chargement = false;
    if (!r.ok) {
      texte(statut, messageEchec(r.status, 'Le mot du jour est indisponible. Rouvre ce volet pour réessayer.'));
      return;
    }
    charge = true;
    champ.value = r.data?.mot ?? '';
    controles.disabled = false;
    texte(statut, '');
  });
  formulaire.addEventListener('click', (event) => {
    const amorce = event.target.dataset.amorce;
    if (!amorce) return;
    const contenu = champ.value.trim();
    const amorces = Array.from(formulaire.querySelectorAll('[data-amorce]'));
    if (!contenu || amorces.some((bouton) => contenu === `${bouton.dataset.amorce} —`)) {
      champ.value = `${amorce} — `;
    }
    champ.focus();
  });
  formulaire.addEventListener('submit', async (event) => {
    event.preventDefault();
    const mot = champ.value.trim();
    if (!mot || controles.disabled) return;
    if (etat.jour !== jourAlthea()) {
      texte(statut, 'Un nouveau jour a commencé. Copie ton texte avant de recharger la page.');
      return;
    }
    controles.disabled = true;
    texte(statut, 'Enregistrement…');
    const r = await appel('POST', { mot }, chemin);
    controles.disabled = false;
    texte(statut, r.ok ? 'Mot du jour enregistré.'
      : messageEchec(r.status, 'Mot du jour non enregistré. Ton texte est encore dans le champ.'));
  });
}

function annoncer(etatCalcule) {
  const hote = $('althea-annonce');
  if (!hote) return;
  hote.textContent = '';
  // Le Système n'annonce QUE ce qui se franchit. Rien à annoncer = silence :
  // il ne meuble pas, et il ne reproche rien (règle cardinale ③).
  const proche = etatCalcule.skills
    .filter((s) => s.suivant && s.suivant.reste > 0 && s.suivant.reste <= 3)
    .sort((a, b) => a.suivant.reste - b.suivant.reste)[0];
  if (!proche) return;
  const fenetre = document.createElement('div');
  fenetre.className = 'althea-fenetre';
  const voix = document.createElement('p');
  voix.className = 'voix';
  voix.textContent = `[ ${proche.suivant.nomVise} — à portée ]`;
  const corps = document.createElement('p');
  corps.className = 'corps';
  corps.textContent = `${proche.nom} : encore ${proche.suivant.reste} pour le rang ${ROMAIN[proche.suivant.rangVise]}.`;
  fenetre.append(voix, corps);
  hote.appendChild(fenetre);
}

// La parole de Léo. Deux registres, une seule voix : le Système proclame entre
// crochets, Léo conseille ici. Elle ne juge jamais un silence.
function parlerLeo(etatCalcule) {
  const el = $('althea-leo');
  if (!el) return;
  if (!etatCalcule.skills.length) {
    el.textContent = 'Pose tes premiers skills et je te dirai où tu en es.';
    return;
  }
  const aNourrir = etatCalcule.skills.filter((s) => s.etatDuJour !== true && !s.verrouille);
  if (aNourrir.length === 0) {
    el.textContent = 'Tout est tenu aujourd’hui. Rien à faire de plus — profite.';
    return;
  }
  const proche = etatCalcule.skills
    .filter((s) => s.suivant && s.suivant.reste > 0)
    .sort((a, b) => a.suivant.reste - b.suivant.reste)[0];
  const debut = `${aNourrir.length} skill${aNourrir.length > 1 ? 's' : ''} à nourrir aujourd’hui.`;
  el.textContent = proche
    ? `${debut} Le plus près du rang suivant : ${proche.nom}, à ${proche.suivant.reste}.`
    : debut;
}

// ---------- Flux ----------

async function charger() {
  const r = await appel('GET');
  if (!r.ok) {
    muet(r.status === 401
      ? 'Ouvre ta session pour voir ton Système.'
      : 'Le Système ne répond pas pour l’instant.', r.status === 401);
    return;
  }
  etat.donnees = { ...r.data, releves: r.data?.releves || [] };
  rendre(etat.donnees);
  installerMotDuJour();
}

function rendre(d) {
  const calcul = etatAlthea({
    avatar: d.avatar,
    skills: d.skills || [],
    conditions: d.conditions || [],
    releves: d.releves || [],
    stats: d.stats || [],
    jour: etat.jour,
    // Un mois de recul suffit à l'écran ; le cumul complet vit dans la vue du
    // cadran. On ne fait pas parcourir dix ans de dates pour afficher une ligne.
    depuis: (d.releves || []).length
      ? (d.releves || []).reduce((m, x) => (x.jour < m ? x.jour : m), d.releves[0].jour)
      : decalerJour(etat.jour, -30),
  });

  texte($('althea-nom'), (d.avatar && d.avatar.nom) || '—');
  texte($('althea-titre'), (d.avatar && d.avatar.titre_code) || 'Sans titre');
  texte($('althea-niveau'), String(calcul.niveau));
  texte($('althea-skills-tenus'), `${calcul.tenusAujourdhui} / ${calcul.skills.length}`);
  texte($('althea-nb-stats'), String(calcul.stats.length));
  texte($('althea-date'), etat.jour);

  rendreStats(calcul.stats);
  rendreSkills(calcul.skills);
  rendreJour(d.conditions || [], d.skills || [], d.releves || []);
  annoncer(calcul);
  parlerLeo(calcul);
}

(async function demarrer() {
  try { etat.client = clientSupabase(); } catch (_) {}
  const active = await session();
  etat.proprietaire = active?.user?.id;
  if (!etat.proprietaire) {
    muet('Ouvre ta session pour voir ton Système.', true);
    return;
  }
  await charger();
}());
