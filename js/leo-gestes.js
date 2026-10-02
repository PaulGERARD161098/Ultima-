// js/leo-gestes.js — l'écran « Ce que Léo a fait » (leo.html), B1 ⑤.
// Cadrage : CADRAGE-2026-09-22-leo-pilote-tout.md §15.4 · maquette validée par
// Paul le 02/10 : design/preview-leo-defaire.html.
//
// Rendu 100 % data-driven depuis GET /api/leo/ecritures (jeton de session).
//   · pas de session    → message qui renvoie à la boussole ;
//   · API indisponible  → message, aucune ligne inventée ;
//   · « Défaire »       → POST { etape: 'defaire', traceId } ; le serveur relit
//                         la trace, refuse si quelque chose est né dessus.
// ⛔ `textContent` partout : les noms de cible sont des données de Paul.

const FUSEAU = 'Europe/Paris';

// Le verbe vient du SERVEUR (`phraseGeste`, api/_lib/leo-execution.js) : une
// seule source pour l'écran et le mail du matin.
const propre = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// Ce qui est né sur la cible — aligné sur `NE_SUR_LA_CIBLE` (js/leo-accueil.js).
const LIENS = {
  flammes: 'une flamme y est née',
  idees_liens: 'un lien la relie à une autre idée',
  serment_liens: 'une passerelle y a été posée',
  scenario_liens: 'une passerelle y a été posée',
  scenarios: 'un scénario y est né',
  situations: 'il a été marqué « advenu »'
};

function el(nom, classe, texte) {
  const n = document.createElement(nom);
  if (classe) n.className = classe;
  if (texte !== undefined && texte !== null) n.textContent = texte;
  return n;
}

const heure = (iso) => new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU, hour: '2-digit', minute: '2-digit'
}).format(new Date(iso));
const jourCle = (iso) => new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSEAU, year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date(iso));
const jourCourt = (iso) => new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU, day: '2-digit', month: '2-digit'
}).format(new Date(iso));

function titreDuJour(cle, maintenant) {
  const aujourdhui = jourCle(maintenant.toISOString());
  const hier = jourCle(new Date(maintenant.getTime() - 24 * 3600 * 1000).toISOString());
  if (cle === aujourdhui) return 'Aujourd’hui';
  if (cle === hier) return 'Hier';
  return new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(cle + 'T12:00:00Z'));
}

function texteEtat(g) {
  switch (g.etat) {
    case 'fait': return g.defaisable ? 'Fait' : 'Fait — ne se défait pas d’ici';
    case 'defait': return g.defaitLe
      ? 'Défait par toi, le ' + jourCourt(g.defaitLe) + ' à ' + heure(g.defaitLe) : 'Défait par toi';
    case 'lie': return 'Ne se défait plus : ' + (propre(LIENS, g.lie) ? LIENS[g.lie] : 'quelque chose y est né') + ' depuis';
    case 'retouche': return 'Ne se défait plus : tu l’as retouché depuis';
    case 'disparu': return 'N’existe plus';
    case 'echec': return 'N’a pas abouti : rien n’a été écrit';
    case 'interrompu': return 'Issue inconnue : vérifie avant de refaire';
    default: return '—';
  }
}

function texteQuoi(g) {
  return typeof g.quoi === 'string' && g.quoi ? g.quoi : 'A agi';
}

let jeton = null;
const annonce = () => document.getElementById('gestes-annonce');

function ligne(g) {
  const li = el('li', 'geste');
  li.setAttribute('data-etat', g.etat);
  li.appendChild(el('span', 'geste-heure', heure(g.le)));
  const quoi = el('span', 'geste-quoi', texteQuoi(g));
  // Le nom n'est montré que s'il est lu VIVANT par le serveur.
  if (g.cible && g.etat !== 'defait') {
    quoi.appendChild(document.createTextNode(' '));
    quoi.appendChild(el('span', 'geste-cible', '« ' + g.cible + ' »'));
  }
  li.appendChild(quoi);
  const etat = el('span', 'geste-etat', texteEtat(g));
  etat.setAttribute('tabindex', '-1');
  li.appendChild(etat);
  if (g.etat === 'fait' && g.defaisable === true) {
    const bouton = el('button', 'leo-defaire', 'Défaire');
    bouton.type = 'button';
    bouton.setAttribute('aria-label', 'Défaire : ' + quoi.textContent);
    bouton.addEventListener('click', () => defaire(g, li, bouton, etat));
    li.appendChild(bouton);
  }
  return li;
}

async function defaire(g, li, bouton, etat) {
  if (bouton.disabled) return;
  bouton.disabled = true;
  bouton.setAttribute('aria-busy', 'true');
  let r = null;
  try {
    const reponse = await fetch('/api/leo/ecritures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + jeton },
      body: JSON.stringify({ etape: 'defaire', traceId: g.traceId })
    });
    let corps = null;
    try { corps = await reponse.json(); } catch { corps = null; }
    r = { httpOk: reponse.ok, statut: reponse.status, corps };
  } catch {
    r = null;
  }
  bouton.remove();
  if (r && r.httpOk && r.corps && r.corps.ok === true) {
    li.setAttribute('data-etat', 'defait');
    const cible = li.querySelector('.geste-cible');
    if (cible) { cible.previousSibling?.remove(); cible.remove(); }
    etat.textContent = 'Défait par toi, à l’instant' +
      (r.corps.data && r.corps.data.journalise === false ? ' (le journal n’a pas pu le noter)' : '');
  } else {
    li.setAttribute('data-etat', r && r.statut >= 400 && r.statut < 500 ? 'refuse' : 'inconnu');
    const leo = window.UltimaLeo;
    etat.textContent = leo && typeof leo.messageRefusDefaire === 'function'
      ? leo.messageRefusDefaire(r) : 'Je n’ai pas pu le défaire. Rien n’a été retiré.';
  }
  // ⛔ Le bouton a disparu : le focus va à ce que la ligne est devenue.
  etat.focus();
  const a = annonce();
  if (a) a.textContent = etat.textContent;
}

function rendre(gestes) {
  const hote = document.getElementById('gestes');
  if (!gestes.length) {
    hote.replaceChildren(el('p', 'etat-message', 'Léo n’a rien fait sans demander ces sept derniers jours.'));
    return;
  }
  const maintenant = new Date();
  const fragments = [];
  let jour = null;
  let liste = null;
  for (const g of gestes) {
    const cle = jourCle(g.le);
    if (cle !== jour) {
      jour = cle;
      fragments.push(el('h3', 'gestes-jour', titreDuJour(cle, maintenant)));
      liste = el('ul', 'gestes');
      fragments.push(liste);
    }
    liste.appendChild(ligne(g));
  }
  hote.replaceChildren(...fragments);
}

function message(texte) {
  document.getElementById('gestes').replaceChildren(el('p', 'etat-message', texte));
}

async function demarrer() {
  const cfg = window.ULTIMA_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY
      || !window.supabase || typeof window.supabase.createClient !== 'function') {
    message('Configuration absente : le journal de Léo ne peut pas être servi ici.');
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
  jeton = session.access_token;
  try {
    const reponse = await fetch('/api/leo/ecritures', {
      headers: { Authorization: 'Bearer ' + jeton, Accept: 'application/json' }
    });
    if (!reponse.ok) {
      message(reponse.status === 401
        ? 'Session expirée. Reconnecte-toi depuis la boussole.'
        : 'Le journal de Léo est indisponible pour le moment.');
      return;
    }
    const charge = await reponse.json();
    if (!charge || charge.ok !== true || !charge.data || !Array.isArray(charge.data.gestes)) {
      message('Le journal de Léo est indisponible pour le moment.');
      return;
    }
    rendre(charge.data.gestes);
  } catch {
    message('Le journal de Léo est indisponible pour le moment.');
  }
}

demarrer();
