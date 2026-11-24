// Ultima — Contrôleur du poste de commandement unifié Léo (V2.1).
// Zéro donnée en dur dans le HTML : tout vient de `/api/pro-pilotage` et `/api/leo`
// derrière session Supabase vérifiée.
// - Bascule instantanée Direction (Global) | Renoboost IA | Sola Air Paris | AMO.
// - Fil de conversation Léo PERSISTÉ et strictement CLOISONNÉ par scope (`pro_fils_leo`).
// - Cartes de confirmation en anneau orange exécutées via `window.UltimaLeo.construirePlanExecution`.
// - Bouton « Copier » 1 clic sur chaque CR, préparation ou brouillon (zéro envoi auto).

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
let filActif = [];
let envoiEnCours = false;

const AMORCES_RACCOURCIS = {
  priorites: 'Quelles sont mes priorités et relances urgentes du jour dans ce contexte ?',
  chantier: 'Challenge mon organisation de chantier sur les 6 verrous (technique/copro, achats 100 %, accord écrit poseur, client/acompte, rétroplanning J-7→J+1, marge) : quelles sont les premières questions à verrouiller ?',
  achats: 'Applique la méthode Chantier 100 % certain : prépare le tableau achats (qui commande, où, prix HT, livraison, preuve) et la question prête à transmettre au prestataire.',
  reunion: 'Aide-moi à préparer ma prochaine réunion : ordre du jour court, décisions à trancher et questions clés.',
  cr: 'Je vais coller mes notes brutes de réunion : prépare-toi à sortir le compte rendu en 12 lignes max (Décidé · À confirmer · Actions · Axe vente).',
  mail: 'Aide-moi à rédiger un brouillon d’e-mail professionnel (premier jet, jamais envoyé) : demande-moi le destinataire et l’intention.'
};

const BLASONS_SVG = {
  'renoboost-ia': '<svg class="dir-blason" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M4 19 L19 4 M19 4 H10 M19 4 V13"/><circle cx="7" cy="16" r="1.5"/></svg>',
  'sola-air-paris': '<svg class="dir-blason" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7 7M17 17L18.7 18.7M18.7 5.3L17 7M7 17L5.3 18.7"/></svg>',
  amo: '<svg class="dir-blason" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M12 3 L5 20 M12 3 L19 20 M7.5 14 H16.5"/><circle cx="12" cy="5.5" r="1.2"/></svg>'
};

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
  for (const tab of document.querySelectorAll('.dir-tab')) {
    const actif = tab.dataset.scope === scope;
    tab.classList.toggle('is-actif', actif);
    tab.setAttribute('aria-selected', actif ? 'true' : 'false');
  }
  if (scope === 'direction') {
    $('dir-titre').textContent = 'Vue d’ensemble';
    $('dir-sous-titre').textContent = 'Arbitre tes priorités transverses ici, ou entre dans l’une de tes trois structures cloisonnées.';
    $('dir-badge-cloison').textContent = 'Direction générale · Trois structures cloisonnées';
    $('dir-leo-scope').textContent = 'Direction';
    $('dir-leo-desc').textContent = 'Vision consolidée · arbitrage multi-structures';
  } else {
    const nom = structure?.nom || LIBELLES_SCOPES[scope] || scope;
    $('dir-titre').textContent = nom;
    $('dir-sous-titre').textContent = structure?.resume || 'Espace professionnel strictement cloisonné.';
    $('dir-badge-cloison').textContent = `Espace strictement cloisonné · ${nom}`;
    $('dir-leo-scope').textContent = nom;
    $('dir-leo-desc').textContent = scope === 'sola-air-paris'
      ? 'Cloisonné · posture challenger chantier (6 verrous)'
      : 'Fil strictement cloisonné · zéro donnée croisée';
  }
}

function rendreDirection(donnees) {
  const structures = donnees.structures || [];
  const totalOuvertes = structures.reduce((s, x) => s + (x.compteurs?.taches_ouvertes || 0), 0);
  const totalRelances = structures.reduce((s, x) => s + (x.compteurs?.relances_dues || 0), 0);
  const totalDossiers = structures.reduce((s, x) => s + (x.compteurs?.dossiers_actifs || 0), 0);
  const totalBloquees = structures.reduce((s, x) => s + (x.compteurs?.bloquees || 0), 0);

  const metriques = $('dir-metriques');
  metriques.textContent = '';
  const items = [
    ['Tâches ouvertes', totalOuvertes, false],
    ['Relances dues', totalRelances, true],
    ['Dossiers actifs', totalDossiers, false],
    ['Points bloqués', totalBloquees, totalBloquees > 0]
  ];
  for (const [label, val, or] of items) {
    const div = document.createElement('div');
    div.className = 'dir-metrique';
    const l = document.createElement('div');
    l.className = 'dir-metrique-label';
    l.textContent = label;
    const v = document.createElement('div');
    v.className = or ? 'dir-metrique-val dir-metrique-val--or' : 'dir-metrique-val';
    v.textContent = String(val);
    div.append(l, v);
    metriques.appendChild(div);
  }

  const conteneurCartes = $('dir-cartes-structures');
  conteneurCartes.textContent = '';
  for (const s of structures) {
    const carte = document.createElement('article');
    carte.className = 'dir-carte';

    const haut = document.createElement('div');
    const top = document.createElement('div');
    top.className = 'dir-carte-top';
    top.innerHTML = BLASONS_SVG[s.id] || '';
    const badge = document.createElement('span');
    badge.className = 'dir-carte-badge';
    badge.textContent = 'Cloisonné';
    top.appendChild(badge);

    const h2 = document.createElement('h2');
    h2.textContent = s.nom;
    const p = document.createElement('p');
    p.textContent = s.resume;
    haut.append(top, h2, p);

    const pied = document.createElement('div');
    pied.className = 'dir-carte-pied';
    const resume = document.createElement('span');
    resume.textContent = `${s.compteurs.taches_ouvertes} ouvertes · ${s.compteurs.relances_dues} relance(s)`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dir-btn-lien';
    btn.textContent = 'Ouvrir →';
    btn.addEventListener('click', () => basculerScope(s.id));
    pied.append(resume, btn);

    carte.append(haut, pied);
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
    btn.className = 'dir-btn-lien';
    btn.textContent = 'Aller →';
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
      btn.className = 'dir-btn-mini';
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

  // Documents (avec bouton Copier 1 clic)
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
      extrait.textContent = String(doc.contenu || '').slice(0, 220);
      bloc.append(tag, titre, extrait);

      const btnCopier = document.createElement('button');
      btnCopier.type = 'button';
      btnCopier.className = 'dir-btn-mini';
      btnCopier.textContent = 'Copier';
      btnCopier.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(doc.contenu || '');
          btnCopier.textContent = 'Copié';
          setTimeout(() => { btnCopier.textContent = 'Copier'; }, 1500);
        } catch {
          annoncer('Copie impossible depuis ce navigateur.');
        }
      });
      li.append(bloc, btnCopier);
      ulDocs.appendChild(li);
    }
  }
}

// ===== CARNET DE BORD LÉO (PERSISTÉ PAR SCOPE) =====
function rendreFilLeo(propositionEnAttente = null) {
  const zone = $('dir-leo-fil');
  if (!zone) return;
  zone.textContent = '';

  if (!filActif.length) {
    const p = document.createElement('div');
    p.className = 'dir-msg-leo';
    const nom = LIBELLES_SCOPES[scopeActif] || scopeActif;
    p.textContent = scopeActif === 'direction'
      ? 'Vue Direction ouverte. Choisis un raccourci ci-dessus ou dis-moi sur quelle structure arbitrer.'
      : scopeActif === 'sola-air-paris'
        ? 'Espace Sola Air Paris ouvert (cloisonné). Donne-moi un chantier : je te challenge sur les 6 verrous et les achats 100 % certains.'
        : `Espace ${nom} ouvert (cloisonné). Priorités, relances, CR ou brouillons : je t’écoute.`;
    zone.appendChild(p);
  }

  for (const msg of filActif) {
    const div = document.createElement('div');
    div.className = msg.role === 'user' ? 'dir-msg-user' : 'dir-msg-leo';
    div.textContent = msg.content;
    zone.appendChild(div);
  }

  if (propositionEnAttente) {
    const carte = document.createElement('div');
    carte.className = 'dir-carte-orange';
    const tag = document.createElement('div');
    tag.className = 'dir-carte-orange-tag';
    tag.textContent = 'Confirmation requise · anneau orange';
    const texte = document.createElement('div');
    texte.textContent = propositionEnAttente.reformulation || propositionEnAttente.outil;
    const actions = document.createElement('div');
    actions.className = 'dir-carte-orange-actions';

    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.className = 'dir-btn-confirmer';
    btnOk.textContent = 'Confirmer';
    btnOk.addEventListener('click', async () => {
      btnOk.disabled = true;
      const plan = window.UltimaLeo?.construirePlanExecution?.(propositionEnAttente);
      if (!plan || !plan.ok) {
        annoncer('Proposition non exécutable.');
        rendreFilLeo(null);
        return;
      }
      const res = await appelApi(plan.methode, plan.url, plan.corps);
      if (res.status === 200 && res.json?.ok) {
        annoncer('Enregistré dans la structure.');
        filActif.push({ role: 'assistant', content: `✔ Enregistré : ${propositionEnAttente.reformulation}` });
        await sauverFilLeo();
        await chargerScope(false);
        rendreFilLeo(null);
      } else {
        annoncer(res.json?.error || 'Échec de l’enregistrement.');
        btnOk.disabled = false;
      }
    });

    const btnNon = document.createElement('button');
    btnNon.type = 'button';
    btnNon.className = 'dir-btn-mini';
    btnNon.textContent = 'Annuler';
    btnNon.addEventListener('click', () => {
      annoncer('Proposition annulée.');
      rendreFilLeo(null);
    });

    actions.append(btnOk, btnNon);
    carte.append(tag, texte, actions);
    zone.appendChild(carte);
  }

  zone.scrollTop = zone.scrollHeight;
}

async function chargerFilLeo() {
  if (!jetonSession) return;
  const { status, json } = await appelApi('GET', `/api/pro-pilotage?scope=${encodeURIComponent(scopeActif)}&ressource=fil`);
  filActif = status === 200 && Array.isArray(json?.data?.messages) ? json.data.messages.slice(-30) : [];
  rendreFilLeo(null);
}

async function sauverFilLeo() {
  if (!jetonSession) return;
  await appelApi('POST', '/api/pro-pilotage', {
    ressource: 'fil',
    scope: scopeActif,
    messages: filActif.slice(-30)
  }).catch(() => {});
}

async function envoyerALeo(texteBrut) {
  const texte = String(texteBrut || '').trim();
  if (!texte || !jetonSession || envoiEnCours) return;
  envoiEnCours = true;
  const btn = $('dir-leo-envoyer');
  if (btn) btn.disabled = true;

  filActif.push({ role: 'user', content: texte });
  if (filActif.length > 30) filActif = filActif.slice(-30);
  rendreFilLeo(null);

  try {
    const { status, json } = await appelApi('POST', '/api/leo', {
      quadrant: scopeActif,
      messages: filActif,
      etat: dernierEtatLeo || undefined
    });
    if (status === 200 && json?.ok && json.data?.reponse) {
      filActif.push({ role: 'assistant', content: json.data.reponse });
      if (filActif.length > 30) filActif = filActif.slice(-30);
      await sauverFilLeo();
      rendreFilLeo(json.data.proposition || null);
    } else {
      const msg = json?.error || 'Léo n’a pas pu répondre.';
      annoncer(msg);
      filActif.push({ role: 'assistant', content: `[${msg}]` });
      rendreFilLeo(null);
    }
  } finally {
    envoiEnCours = false;
    if (btn) btn.disabled = false;
  }
}

async function chargerScope(rechargerFil = true) {
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
  if (rechargerFil) await chargerFilLeo();
}

function basculerScope(nouveauScope) {
  scopeActif = normaliserScopeUrl(nouveauScope);
  const url = new URL(window.location.href);
  url.searchParams.set('scope', scopeActif);
  window.history.replaceState({}, '', url);
  annoncer('');
  chargerScope(true);
}

async function verifierVps() {
  const pill = $('dir-vps-statut');
  if (!pill || !jetonSession) return;
  const { status, json } = await appelApi('GET', '/api/pro-pilotage?ressource=vps-health');
  if (status === 200 && json?.data?.vps === 'en_ligne') {
    pill.textContent = '● VPS 24/7';
    pill.classList.add('is-online');
  } else {
    pill.textContent = '○ VPS hors ligne';
    pill.classList.remove('is-online');
  }
}

async function demarrer() {
  for (const tab of document.querySelectorAll('.dir-tab')) {
    tab.addEventListener('click', () => basculerScope(tab.dataset.scope));
  }
  for (const chip of document.querySelectorAll('.dir-chip')) {
    chip.addEventListener('click', () => {
      const amorce = AMORCES_RACCOURCIS[chip.dataset.leoPrompt];
      if (amorce) envoyerALeo(amorce);
    });
  }

  $('dir-leo-reset').addEventListener('click', async () => {
    filActif = [];
    await sauverFilLeo();
    rendreFilLeo(null);
    annoncer('Fil réinitialisé pour ce contexte.');
  });

  const leoInput = $('dir-leo-input');
  leoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('dir-leo-form').requestSubmit();
    }
  });
  $('dir-leo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = leoInput.value;
    leoInput.value = '';
    await envoyerALeo(val);
  });

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
      await chargerScope(false);
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
      await chargerScope(false);
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
      await chargerScope(false);
    } else {
      annoncer(res.json?.error || 'Erreur lors de l’enregistrement.');
    }
  });

  jetonSession = await lireJeton();
  majEntete(scopeActif, null);
  verifierVps();
  await chargerScope(true);
}

demarrer();
