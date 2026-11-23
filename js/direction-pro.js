// Ultima — Contrôleur front Double Vue Direction & 3 Structures (Boucle 3).
// Zéro donnée en dur dans le HTML : tout vient de `/api/pro-pilotage` derrière
// session Supabase vérifiée. Chaque bascule d'onglet met à jour le contexte
// strictement cloisonné de Léo (`quadrant` + `etat` borné).

import {
  LIBELLES_SCOPES,
  normaliserScopeUrl,
  yeuxDirection,
  yeuxStructure
} from './direction-etat.mjs';

const $ = (id) => document.getElementById(id);

let scopeActif = normaliserScopeUrl(new URLSearchParams(window.location.search).get('scope'));
let jetonSession = null;
let dernierEtatLeo = null;

function annoncer(texte) {
  const zone = $('dir-statut-live');
  if (zone) zone.textContent = texte || '';
}

function afficherEtat(nom) {
  for (const id of ['dir-chargement', 'dir-auth', 'dir-non-installe', 'dir-erreur', 'vue-direction', 'vue-structure']) {
    const el = $(id);
    if (el) el.hidden = id !== nom;
  }
}

async function lireJeton() {
  const cfg = window.ULTIMA_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase) return null;
  try {
    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

async function appelApi(methode, chemin, corps) {
  const options = {
    method: methode,
    headers: { Authorization: `Bearer ${jetonSession}` }
  };
  if (corps !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(corps);
  }
  const reponse = await fetch(chemin, options);
  const json = await reponse.json().catch(() => ({}));
  return { status: reponse.status, json };
}

function majEntete(scope, structure) {
  document.body.setAttribute('data-leo-quadrant', scope);
  const tabs = document.querySelectorAll('.dir-tab');
  for (const tab of tabs) {
    const actif = tab.dataset.scope === scope;
    tab.classList.toggle('is-actif', actif);
    tab.setAttribute('aria-selected', actif ? 'true' : 'false');
  }
  if (scope === 'direction') {
    $('dir-titre').textContent = 'Direction — Vue globale';
    $('dir-sous-titre').textContent = 'Vision consolidée de tes trois structures professionnelles, sans mélange de données.';
    $('dir-badge-cloison').textContent = 'Vue consolidée · Renoboost IA · Sola Air Paris · AMO';
    $('dir-parler-leo').textContent = 'Parler à Léo (Direction)';
  } else {
    const nom = structure?.nom || LIBELLES_SCOPES[scope] || scope;
    $('dir-titre').textContent = nom;
    $('dir-sous-titre').textContent = structure?.resume || 'Espace professionnel dédié.';
    $('dir-badge-cloison').textContent = `Espace strictement cloisonné · ${nom}`;
    $('dir-parler-leo').textContent = `Parler à Léo (${nom})`;
  }
}

function rendreDirection(donnees) {
  const conteneurCartes = $('dir-cartes-structures');
  conteneurCartes.textContent = '';
  for (const s of donnees.structures || []) {
    const carte = document.createElement('article');
    carte.className = 'dir-carte';
    const h2 = document.createElement('h2');
    h2.textContent = s.nom;
    const p = document.createElement('p');
    p.textContent = s.resume;
    const c = document.createElement('div');
    c.className = 'dir-compteurs';
    const stats = [
      `${s.compteurs.taches_ouvertes} ouvertes`,
      `${s.compteurs.relances_dues} relances dues`,
      `${s.compteurs.bloquees} bloquées`,
      `${s.compteurs.dossiers_actifs} dossiers`
    ];
    for (const label of stats) {
      const span = document.createElement('span');
      span.textContent = label;
      c.appendChild(span);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dir-btn';
    btn.textContent = `Ouvrir ${s.nom}`;
    btn.addEventListener('click', () => basculerScope(s.id));
    carte.append(h2, p, c, btn);
    conteneurCartes.appendChild(carte);
  }

  const ul = $('dir-liste-transverses');
  ul.textContent = '';
  const priorites = donnees.priorites_transverses || [];
  if (!priorites.length) {
    const li = document.createElement('li');
    li.className = 'dir-vide';
    li.textContent = 'Aucune priorité ouverte sur les trois structures.';
    ul.appendChild(li);
    return;
  }
  for (const p of priorites) {
    const li = document.createElement('li');
    li.className = 'dir-item';
    const bloc = document.createElement('div');
    const tag = document.createElement('span');
    tag.className = 'dir-item-tag';
    tag.textContent = p.structure_nom;
    const titre = document.createElement('strong');
    titre.textContent = p.titre;
    const meta = document.createElement('div');
    meta.className = 'dir-item-meta';
    meta.textContent = [p.type, `priorité ${p.priorite}`, p.echeance ? `échéance ${p.echeance}` : ''].filter(Boolean).join(' · ');
    bloc.append(tag, titre, meta);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dir-btn';
    btn.textContent = 'Aller';
    btn.addEventListener('click', () => basculerScope(p.structure_id));
    li.append(bloc, btn);
    ul.appendChild(li);
  }
}

function rendreStructure(donnees) {
  const liensEl = $('str-liens');
  liensEl.textContent = '';
  const liens = donnees.structure?.liens || [];
  liensEl.hidden = liens.length === 0;
  for (const l of liens) {
    const a = document.createElement('a');
    a.href = l.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = `${l.nom} ↗`;
    liensEl.appendChild(a);
  }

  // Tâches
  const ulTaches = $('str-liste-taches');
  ulTaches.textContent = '';
  const taches = (donnees.taches || []).filter((t) => t.statut !== 'fait');
  if (!taches.length) {
    const li = document.createElement('li');
    li.className = 'dir-vide';
    li.textContent = 'Aucune tâche ouverte dans cette structure.';
    ulTaches.appendChild(li);
  } else {
    for (const t of taches) {
      const li = document.createElement('li');
      li.className = 'dir-item';
      const bloc = document.createElement('div');
      const titre = document.createElement('strong');
      titre.textContent = t.titre;
      const meta = document.createElement('div');
      meta.className = 'dir-item-meta';
      meta.textContent = [t.type, `priorité ${t.priorite}`, t.echeance ? `échéance ${t.echeance}` : ''].filter(Boolean).join(' · ');
      bloc.append(titre, meta);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dir-btn';
      btn.textContent = 'Fait';
      btn.addEventListener('click', async () => {
        const res = await appelApi('PATCH', '/api/pro-pilotage', {
          ressource: 'tache',
          id: t.id,
          structure_id: scopeActif,
          statut: 'fait'
        });
        if (res.status === 200) {
          annoncer('Tâche marquée faite.');
          await chargerScope();
        } else {
          annoncer(res.json?.error || 'Impossible de mettre à jour.');
        }
      });
      li.append(bloc, btn);
      ulTaches.appendChild(li);
    }
  }

  // Dossiers
  const ulDossiers = $('str-liste-dossiers');
  ulDossiers.textContent = '';
  const dossiers = donnees.dossiers || [];
  if (!dossiers.length) {
    const li = document.createElement('li');
    li.className = 'dir-vide';
    li.textContent = 'Aucun dossier ouvert dans cette structure.';
    ulDossiers.appendChild(li);
  } else {
    for (const d of dossiers) {
      const li = document.createElement('li');
      li.className = 'dir-item';
      const bloc = document.createElement('div');
      const titre = document.createElement('strong');
      titre.textContent = d.titre;
      const meta = document.createElement('div');
      meta.className = 'dir-item-meta';
      meta.textContent = [d.statut, d.prochaine_action].filter(Boolean).join(' · ');
      bloc.append(titre, meta);
      li.appendChild(bloc);
      ulDossiers.appendChild(li);
    }
  }

  // Documents
  const ulDocs = $('str-liste-documents');
  ulDocs.textContent = '';
  const docs = donnees.documents || [];
  if (!docs.length) {
    const li = document.createElement('li');
    li.className = 'dir-vide';
    li.textContent = 'Aucun compte rendu, préparation ou brouillon enregistré.';
    ulDocs.appendChild(li);
  } else {
    for (const doc of docs) {
      const li = document.createElement('li');
      li.className = 'dir-item';
      const bloc = document.createElement('div');
      const tag = document.createElement('span');
      tag.className = 'dir-item-tag';
      tag.textContent = doc.type;
      const titre = document.createElement('strong');
      titre.textContent = doc.titre;
      const extrait = document.createElement('div');
      extrait.className = 'dir-item-meta';
      extrait.textContent = String(doc.contenu || '').slice(0, 180);
      bloc.append(tag, titre, extrait);
      li.appendChild(bloc);
      ulDocs.appendChild(li);
    }
  }
}

async function chargerScope() {
  afficherEtat('dir-chargement');
  if (!jetonSession) {
    afficherEtat('dir-auth');
    return;
  }
  const { status, json } = await appelApi('GET', `/api/pro-pilotage?scope=${encodeURIComponent(scopeActif)}`);
  if (status === 401) {
    afficherEtat('dir-auth');
    return;
  }
  if (status === 503 && json?.cause === 'pilotage pro non installé') {
    afficherEtat('dir-non-installe');
    return;
  }
  if (status !== 200 || !json?.ok) {
    afficherEtat('dir-erreur');
    return;
  }
  const donnees = json.data;
  majEntete(scopeActif, donnees.structure);
  if (scopeActif === 'direction') {
    dernierEtatLeo = yeuxDirection(donnees);
    rendreDirection(donnees);
    afficherEtat('vue-direction');
  } else {
    dernierEtatLeo = yeuxStructure(scopeActif, donnees);
    rendreStructure(donnees);
    afficherEtat('vue-structure');
  }
}

function basculerScope(nouveauScope) {
  scopeActif = normaliserScopeUrl(nouveauScope);
  const url = new URL(window.location.href);
  url.searchParams.set('scope', scopeActif);
  window.history.replaceState({}, '', url);
  annoncer('');
  chargerScope();
}

function ouvrirLeoDansContexte() {
  if (!jetonSession || !window.UltimaLeo?.accueillirQuadrant) return;
  const nom = LIBELLES_SCOPES[scopeActif] || scopeActif;
  window.UltimaLeo.accueillirQuadrant({
    quadrant: scopeActif,
    blason: 'boussole',
    salutation: scopeActif === 'direction'
      ? 'Vue Direction ouverte. Sur quelle structure veux-tu arbitrer ou avancer ?'
      : `Espace ${nom} ouvert (cloisonné). Quelle priorité, relance ou rédaction préparons-nous ?`,
    sections: [],
    sansPropositions: true,
    forcer: true,
    voix: {
      quadrant: scopeActif,
      jeton: jetonSession,
      etat: dernierEtatLeo,
      notifier: () => {
        annoncer('Action de Léo enregistrée.');
        chargerScope();
      }
    }
  });
}

async function demarrer() {
  for (const tab of document.querySelectorAll('.dir-tab')) {
    tab.addEventListener('click', () => basculerScope(tab.dataset.scope));
  }
  $('dir-parler-leo').addEventListener('click', ouvrirLeoDansContexte);

  $('form-tache').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await appelApi('POST', '/api/pro-pilotage', {
      ressource: 'tache',
      structure_id: scopeActif,
      titre: $('tache-titre').value,
      type: $('tache-type').value,
      priorite: $('tache-priorite').value,
      echeance: $('tache-echeance').value || undefined
    });
    if (res.status === 200) {
      $('form-tache').reset();
      annoncer('Tâche enregistrée dans cette structure.');
      await chargerScope();
    } else {
      annoncer(res.json?.error || 'Erreur lors de l’ajout.');
    }
  });

  $('form-dossier').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await appelApi('POST', '/api/pro-pilotage', {
      ressource: 'dossier',
      structure_id: scopeActif,
      titre: $('dossier-titre').value,
      prochaine_action: $('dossier-action').value
    });
    if (res.status === 200) {
      $('form-dossier').reset();
      annoncer('Dossier ouvert dans cette structure.');
      await chargerScope();
    } else {
      annoncer(res.json?.error || 'Erreur lors de l’ouverture du dossier.');
    }
  });

  $('form-document').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await appelApi('POST', '/api/pro-pilotage', {
      ressource: 'document',
      structure_id: scopeActif,
      type: $('doc-type').value,
      titre: $('doc-titre').value,
      contenu: $('doc-contenu').value
    });
    if (res.status === 200) {
      $('form-document').reset();
      annoncer('Document enregistré (premier jet).');
      await chargerScope();
    } else {
      annoncer(res.json?.error || 'Erreur lors de l’enregistrement.');
    }
  });

  jetonSession = await lireJeton();
  majEntete(scopeActif, null);
  await chargerScope();
}

demarrer();
