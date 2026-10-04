// ZOH SHIA côté navigateur — un badge par techno, son contenu dedans.
//
// Rendu 100 % data-driven depuis GET /api/zohshia (jeton de session Supabase,
// même mécanique que js/finubar.js). La route est réservée au PROPRIÉTAIRE.
// Injection DOM par createElement/textContent EXCLUSIVEMENT — jamais d'innerHTML :
// le contenu vient de fichiers markdown du dépôt, découpés en blocs de texte par
// `zohshia/publier.mjs` ; aucun HTML ne traverse.
//
// Fail-closed : pas de configuration, pas de session, 401, 403, 503, réseau ou
// forme inattendue → un message, et rien d'autre. Un plan à moitié affiché se
// lirait comme un plan complet.

function el(nom, classe, texte) {
  const n = document.createElement(nom);
  if (classe) n.className = classe;
  if (texte !== undefined && texte !== null) n.textContent = String(texte);
  return n;
}

// Un « run » est [texte, style] : '' normal, 'b' gras, 'i' italique, 'c' code.
const BALISE = { b: 'strong', i: 'em', c: 'code' };
function remplir(hote, runs) {
  if (!Array.isArray(runs)) return hote;
  for (const run of runs) {
    if (!Array.isArray(run) || typeof run[0] !== 'string') continue;
    const balise = BALISE[run[1]];
    hote.appendChild(balise ? el(balise, null, run[0]) : document.createTextNode(run[0]));
  }
  return hote;
}

function rendreBloc(b) {
  switch (b && b.t) {
    case 'h2': return remplir(el('h3'), b.r);
    case 'h3': return remplir(el('h4'), b.r);
    case 'p': return remplir(el('p'), b.r);
    case 'code': return el('pre', null, b.texte);
    case 'note': {
      const d = el('div', 'note');
      (Array.isArray(b.paras) ? b.paras : []).forEach((p) => d.appendChild(remplir(el('p'), p)));
      return d;
    }
    case 'liste': {
      const l = el(b.ordonnee ? 'ol' : 'ul');
      (Array.isArray(b.items) ? b.items : []).forEach((it) => l.appendChild(remplir(el('li'), it)));
      return l;
    }
    case 'table': {
      const enveloppe = el('div', 'tableau');
      const t = el('table');
      const tete = el('thead'); const rt = el('tr');
      (Array.isArray(b.entetes) ? b.entetes : []).forEach((c) => rt.appendChild(remplir(el('th', null), c)));
      tete.appendChild(rt); t.appendChild(tete);
      const corps = el('tbody');
      (Array.isArray(b.lignes) ? b.lignes : []).forEach((ligne) => {
        const tr = el('tr');
        (Array.isArray(ligne) ? ligne : []).forEach((c) => tr.appendChild(remplir(el('td'), c)));
        corps.appendChild(tr);
      });
      t.appendChild(corps); enveloppe.appendChild(t);
      return enveloppe;
    }
    default: return null;
  }
}

function rendreOnglet(hote, onglet) {
  hote.replaceChildren();
  (Array.isArray(onglet.blocs) ? onglet.blocs : []).forEach((b) => {
    const n = rendreBloc(b);
    if (n) hote.appendChild(n);
  });
}

function rendreTechno(t, index) {
  const li = el('li', 'techno');
  const idPanneau = `techno-${index}`;
  const badge = el('button', 'badge-techno');
  badge.type = 'button';
  badge.setAttribute('aria-expanded', 'false');
  badge.setAttribute('aria-controls', idPanneau);
  badge.appendChild(el('span', 'badge-sceau', String(index + 1)));
  const corps = el('span', 'badge-corps');
  corps.appendChild(el('span', 'badge-nom', t.badge));
  const mesure = t.mesure && t.mesure.le ? ` · plan mesuré le ${t.mesure.le}` : '';
  corps.appendChild(el('span', 'badge-meta', `${t.etat || ''}${mesure}`));
  badge.appendChild(corps);
  li.appendChild(badge);

  const panneau = el('div', 'techno-ouverte');
  panneau.id = idPanneau;
  panneau.hidden = true;
  const onglets = Array.isArray(t.onglets) ? t.onglets : [];
  const barre = el('div', 'onglets');
  barre.setAttribute('role', 'tablist');
  barre.setAttribute('aria-label', t.badge);
  const contenu = el('div', 'contenu');
  contenu.setAttribute('role', 'tabpanel');
  contenu.tabIndex = 0;
  const boutons = onglets.map((o, i) => {
    const b = el('button', 'onglet', o.titre);
    b.type = 'button';
    b.id = `${idPanneau}-onglet-${i}`;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.addEventListener('click', () => choisir(i));
    barre.appendChild(b);
    return b;
  });
  function choisir(i) {
    boutons.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    contenu.setAttribute('aria-labelledby', boutons[i].id);
    rendreOnglet(contenu, onglets[i]);
  }
  barre.addEventListener('keydown', (e) => {
    const i = boutons.indexOf(document.activeElement);
    if (i < 0) return;
    const j = e.key === 'ArrowRight' ? (i + 1) % boutons.length : e.key === 'ArrowLeft' ? (i - 1 + boutons.length) % boutons.length : -1;
    if (j < 0) return;
    e.preventDefault(); boutons[j].focus(); choisir(j);
  });
  panneau.appendChild(barre);
  panneau.appendChild(contenu);
  li.appendChild(panneau);

  badge.addEventListener('click', () => {
    const ouvert = badge.getAttribute('aria-expanded') === 'true';
    badge.setAttribute('aria-expanded', String(!ouvert));
    panneau.hidden = ouvert;
    if (!ouvert && boutons.length && !boutons.some((b) => b.getAttribute('aria-selected') === 'true')) choisir(0);
  });
  return li;
}

function message(texte) {
  document.getElementById('technos').replaceChildren(el('p', 'etat-message', texte));
}

function rendre(donnees) {
  const technos = Array.isArray(donnees.technos) ? donnees.technos.filter((t) => t && typeof t.badge === 'string') : [];
  if (!technos.length) { message('Aucune techno publiée.'); return; }
  const liste = el('ul', 'technos');
  technos.forEach((t, i) => liste.appendChild(rendreTechno(t, i)));
  document.getElementById('technos').replaceChildren(liste);
  const prov = document.getElementById('provenance');
  prov.replaceChildren();
  prov.appendChild(document.createTextNode(
    `Publié le ${donnees.publie_le || '—'} — ${technos.length} techno(s). État figé au dernier commit, réservé au propriétaire. Pour le rafraîchir : `));
  prov.appendChild(el('code', null, 'node zohshia/publier.mjs'));
  prov.appendChild(document.createTextNode(', puis commiter.'));
}

const MESSAGES = {
  401: 'Session expirée. Reconnecte-toi depuis la boussole.',
  403: 'Accès réservé au propriétaire.',
  503: 'Accès réservé : le réglage du propriétaire n’est pas encore posé.',
};

async function demarrer() {
  const cfg = window.ULTIMA_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY
      || !window.supabase || typeof window.supabase.createClient !== 'function') {
    message('Configuration absente : ZOH SHIA ne peut pas être servi ici.');
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
    const reponse = await fetch('/api/zohshia', { headers: { Authorization: 'Bearer ' + session.access_token } });
    if (!reponse.ok) { message(MESSAGES[reponse.status] || 'ZOH SHIA est indisponible pour le moment.'); return; }
    const charge = await reponse.json();
    if (!charge || charge.ok !== true || !charge.data) { message('ZOH SHIA est indisponible pour le moment.'); return; }
    rendre(charge.data);
  } catch {
    message('ZOH SHIA est indisponible pour le moment.');
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer, { once: true });
  else demarrer();
}
