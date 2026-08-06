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

import { etatAlthea, decalerJour } from './althea-progression.mjs';

const $ = (id) => document.getElementById(id);

// Le jour de PAUL, en date locale — jamais l'UTC du navigateur. Un relevé pris
// à 23 h 40 doit se ranger le jour qu'il a vécu (règle cardinale ④).
function jourLocal(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const etat = { session: null, donnees: null, jour: jourLocal() };

function texte(el, valeur) { if (el) el.textContent = valeur; }

function muet(message) {
  texte($('althea-skills'), '');
  const skills = $('althea-skills');
  if (skills) skills.innerHTML = '<p class="althea-vide"></p>';
  const p = skills && skills.querySelector('p');
  if (p) p.textContent = message;
  const jour = $('althea-jour');
  if (jour) {
    jour.innerHTML = '<p class="althea-vide"></p>';
    jour.querySelector('p').textContent = message;
  }
  texte($('althea-leo'), 'Ouvre ta session et je te dis où tu en es.');
}

async function session() {
  const cfg = window.ULTIMA_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  try {
    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    return data && data.session ? data.session : null;
  } catch (_) {
    return null;
  }
}

async function appel(methode, corps) {
  if (!etat.session || !etat.session.access_token) return { ok: false, status: 401 };
  const options = {
    method: methode,
    headers: {
      Authorization: `Bearer ${etat.session.access_token}`,
      // Le serveur ne peut pas CONNAÎTRE le fuseau de Paul ; il peut refuser
      // une date aberrante. On le lui dit, il vérifie la plausibilité.
      'X-Jour-Local': etat.jour,
    },
  };
  if (corps !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(corps);
  }
  try {
    const reponse = await fetch('/api/althea', options);
    const json = await reponse.json().catch(() => null);
    return { ok: reponse.ok, status: reponse.status, data: json && json.data };
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

// Les gestes du jour, avec leur case. Un geste = une case = un clic.
function rendreJour(conditions, skills, releves) {
  const hote = $('althea-jour');
  if (!hote) return;
  hote.textContent = '';
  const parSkill = new Map(skills.map((s) => [s.id, s]));
  const actives = conditions.filter((c) => c.actif !== false);
  if (!actives.length) {
    const vide = document.createElement('p');
    vide.className = 'althea-vide';
    vide.textContent = 'Aucun geste à cocher pour l’instant.';
    hote.appendChild(vide);
    return;
  }
  for (const c of actives) {
    const releve = releves.find((r) => r.condition_id === c.id && r.jour === etat.jour);
    const ligne = document.createElement('div');
    ligne.className = 'althea-geste';

    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'althea-case';
    // Trois états, et l'attribut le dit : true (tenu), false (manqué déclaré),
    // absent (NON RENSEIGNÉ — le troisième état, celui qui ne juge pas).
    if (releve) bouton.setAttribute('aria-pressed', releve.tenu ? 'true' : 'false');
    else bouton.removeAttribute('aria-pressed');
    bouton.textContent = releve && releve.tenu ? '✦' : '';
    bouton.setAttribute('aria-label', `Cocher : ${c.libelle}`);
    bouton.addEventListener('click', () => basculer(c, releve));

    const lib = document.createElement('span');
    lib.className = 'lib';
    lib.textContent = c.libelle;
    const sous = document.createElement('small');
    const skill = parSkill.get(c.skill_id);
    sous.textContent = `${skill ? skill.nom : ''} · ${libelleCadence(c)}`;
    lib.appendChild(sous);

    ligne.append(bouton, lib);
    hote.appendChild(ligne);
  }
}

function libelleCadence(c) {
  if (c.cadence === 'quotidien') return 'chaque jour';
  if (c.cadence === 'tous_les_n_jours') return `tous les ${c.seuil} jours`;
  if (c.cadence === 'volume_semaine') return `${c.seuil} ${c.unite || ''} par semaine`.trim();
  if (c.cadence === 'duree_jour') return `${c.seuil} ${c.unite || 'min'} par jour`;
  if (c.cadence === 'n_par_jour') return `${c.seuil} par jour`;
  return '';
}

// Un clic fait le tour des trois états : non renseigné → tenu → manqué → non
// renseigné. Revenir au silence est un geste À PART ENTIÈRE : se tromper de
// case ne doit pas laisser une trace fausse en base.
async function basculer(condition, releve) {
  let r;
  if (!releve) {
    r = await appel('POST', { condition_id: condition.id, jour: etat.jour, tenu: true });
  } else if (releve.tenu) {
    r = await appel('POST', { condition_id: condition.id, jour: etat.jour, tenu: false });
  } else {
    r = await appel('DELETE', { id: releve.id });
  }
  if (r.ok) await charger();
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
      : 'Le Système ne répond pas pour l’instant.');
    return;
  }
  const d = r.data || {};
  etat.donnees = d;

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
  etat.session = await session();
  if (!etat.session) {
    muet('Ouvre ta session pour voir ton Système.');
    return;
  }
  await charger();
}());
