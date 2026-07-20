// Cartouche d'accueil de Léo (boucle L1) — mode démo (fixture de test).
// Prouve : le cartouche apparaît après le boot des données, porte les 3
// sections (Où on en est / Travaux en cours / Propositions), la proposition
// n°1 correspond au manquant J-2 de l'INTENDANT (AD-5c-δ : chantier Voltaire,
// pose à J+1, 1 manquant) devant la relance EN RETARD (M. Lambert, 2 jours),
// fermeture par Échap et par « C'est parti », NON-réapparition dans la même
// session (sessionStorage), focus initial + piège de focus, propositions
// cliquables (fiche ouverte), fail-closed sans données, contraste AA calculé,
// mobile plein écran doux, zéro requête externe, zéro erreur console.
// Leaflet/OSM stubés, config Supabase vide (mode démo), zéro erreur tolérée.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

// ---- Contraste WCAG (mêmes formules que le reste du harnais). ----
function luminance(hex) {
  const m = hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16) / 255);
  const lin = m.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function ratio(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

async function preparerPage(page) {
  await page.route('**://unpkg.com/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// ===================== A. Desktop : apparition, contenu, fermetures =====================
console.log('— A. Cartouche de Léo (desktop, mode démo) —');
const page = await navigateur.newPage({ viewport: { width: 1280, height: 800 } });

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));
// Hôtes attendus de l'app (tous stubés par preparerPage) : le cartouche de
// Léo, lui, ne doit déclencher AUCUNE requête supplémentaire (zéro IA, zéro
// coût). Tout autre hôte est une fuite réseau interdite.
const HOTES_OK = ['127.0.0.1:8123', 'unpkg.com', 'tile.openstreetmap.org'];
const requetesExternes = [];
page.on('request', (req) => {
  const url = req.url();
  if (url.startsWith('data:')) return;
  if (!HOTES_OK.some((h) => new URL(url).host.endsWith(h))) requetesExternes.push(url);
});

await preparerPage(page);
await page.goto(`${BASE}/traveler.html`, { waitUntil: 'load', timeout: 20000 });

// 1. Apparition après le boot des données.
await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
const cartouche = page.locator('#leo-cartouche');
verifier('Cartouche visible après le boot', await cartouche.isVisible());
verifier('role="dialog" + aria-modal', await cartouche.evaluate((el) =>
  el.getAttribute('role') === 'dialog' && el.getAttribute('aria-modal') === 'true'));
verifier('Titre « Léo » (aria-labelledby)', await cartouche.evaluate((el) => {
  const t = document.getElementById(el.getAttribute('aria-labelledby'));
  return Boolean(t) && t.textContent.trim() === 'Léo';
}));
verifier('Blason boussole présent (SVG muet)', await page.locator('.leo-blason[aria-hidden="true"]').count() === 1);
const salutation = (await page.locator('.leo-salutation').textContent())?.trim();
verifier('Salutation sobre', /Bienvenue, Paul/.test(salutation || ''), `lu: ${salutation}`);

// 2. Les 3 sections.
const sousTitres = (await page.locator('.leo-sous-titre').allTextContents()).map((t) => t.trim());
verifier('3 sections présentes', sousTitres.length === 3, JSON.stringify(sousTitres));
verifier('Section « Où on en est »', sousTitres.includes('Où on en est'));
verifier('Section « Travaux en cours »', sousTitres.includes('Travaux en cours'));
verifier('Section « Propositions »', sousTitres.includes('Propositions'));

// Où on en est : la dernière entrée du jeu de démo (demo-j3, hier).
const journal = (await page.locator('.leo-journal').textContent()) || '';
verifier('Dernière note du journal restituée', /Plans reçus de l’architecte/.test(journal), `lu: ${journal}`);
verifier('Cible de la note nommée', /Mme Nguyen/.test(journal));

// Travaux en cours : comptes du jeu de démo (1 retard, 1 du jour, 2 leads).
const travaux = (await page.locator('.leo-travail').allTextContents()).map((t) => t.trim());
verifier('1 relance en retard comptée', travaux.some((t) => /^1 relance en retard$/.test(t)), JSON.stringify(travaux));
verifier('1 relance du jour comptée', travaux.some((t) => /^1 relance aujourd'hui$/.test(t)));
verifier('2 leads à suivre comptés', travaux.some((t) => /^2 leads à suivre$/.test(t)));

// 3. Propositions : la n°1 EST le manquant J-2 de l'INTENDANT (AD-5c-δ),
//    devant la relance en retard ; le plafond de 3 évince l'idée dormante.
const propositions = (await page.locator('.leo-proposition').allTextContents()).map((t) => t.trim());
verifier('1 à 3 propositions', propositions.length >= 1 && propositions.length <= 3, `${propositions.length}`);
verifier('Proposition n°1 = manquant J-2 (chantier Voltaire, pose dans 1 jour, 1 manquant)',
  /^Chantier « Réhabilitation immeuble Voltaire »/.test(propositions[0] || '') &&
  /pose dans 1 jour/.test(propositions[0] || '') && /1 manquant/.test(propositions[0] || '') &&
  /Compléter l'intendance\./.test(propositions[0] || ''), `lue: ${propositions[0]}`);
verifier('La relance la plus en retard suit (M. Lambert, 2 jours)',
  /^Relancer/.test(propositions[1] || '') && /M\. Lambert/.test(propositions[1] || '') &&
  /en retard de 2 jours/.test(propositions[1] || ''), `lue: ${propositions[1]}`);
verifier('La relance du jour est proposée (Mme Nguyen)',
  propositions.some((p) => /Aujourd'hui/.test(p) && /Mme Nguyen/.test(p)), JSON.stringify(propositions));
verifier("Plafond de 3 : l'idée dormante cède sa place au manquant J-2",
  propositions.length === 3 && !propositions.some((p) => /dort depuis plus de 14 jours/.test(p)),
  JSON.stringify(propositions));

// 4. Accessibilité : focus initial sur « C'est parti », Tab piégé.
verifier("Focus initial sur « C'est parti »", await page.evaluate(() =>
  document.activeElement && document.activeElement.id === 'leo-partir'));
await page.keyboard.press('Tab');
verifier('Tab reste piégé dans le cartouche', await page.evaluate(() =>
  document.getElementById('leo-cartouche').contains(document.activeElement)));

// 5. Contraste AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    parchemin: cs.getPropertyValue('--parchemin').trim(),
    titre: getComputedStyle(document.querySelector('.leo-titre')).color,
    salutation: getComputedStyle(document.querySelector('.leo-salutation')).color,
    travail: getComputedStyle(document.querySelector('.leo-travail')).color,
    proposition: getComputedStyle(document.querySelector('.leo-proposition')).color,
    partir: getComputedStyle(document.querySelector('.leo-partir')).color,
  };
});
for (const [nom, couleur] of [['titre', styles.titre], ['salutation', styles.salutation],
  ['travail', styles.travail], ['proposition', styles.proposition]]) {
  const r = ratio(versHex(couleur), styles.parchemin);
  verifier(`Contraste ${nom} sur parchemin ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
}
const rPartir = ratio(versHex(styles.partir), '#1a5a78'); // haut (le plus clair) du dégradé
verifier('Contraste « C\'est parti » ≥ 4,5:1', rPartir >= 4.5, `${rPartir.toFixed(2)}:1`);

// 6. Échap ferme.
await page.keyboard.press('Escape');
verifier('Échap ferme le cartouche', await page.locator('#leo-cartouche').count() === 0);

// 7. Non-réapparition dans la même session de navigation (sessionStorage).
verifier('Marqueur de session posé', await page.evaluate(() =>
  window.sessionStorage.getItem('ultima-leo-accueil-vu') === '1'));
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('.cartouche-ultima', { timeout: 20000 });
await page.waitForTimeout(600); // le boot démo est synchrone : marge large
verifier('Pas de réapparition après rechargement (même session)',
  await page.locator('#leo-cartouche').count() === 0);

// 8. Proposition cliquable → fiche concernée (endroit existant de l'app).
await page.evaluate(() => window.sessionStorage.removeItem('ultima-leo-accueil-vu'));
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
await page.locator('.leo-proposition').first().click();
verifier('Le clic ferme le cartouche', await page.locator('#leo-cartouche').count() === 0);
await page.waitForSelector('#panneau:not([hidden])', { timeout: 20000 });
const titreFiche = (await page.locator('#panneau-titre').textContent())?.trim();
verifier('La fiche du chantier Voltaire est ouverte (manquant J-2)',
  /Voltaire/.test(titreFiche || ''), `titre: ${titreFiche}`);
verifier("La section Intendance est visible dans la fiche",
  await page.locator('.section-intendance').count() === 1);

// 9. Fermeture par le bouton « C'est parti ».
await page.evaluate(() => window.sessionStorage.removeItem('ultima-leo-accueil-vu'));
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
await page.locator('#leo-partir').click();
verifier('« C\'est parti » ferme le cartouche', await page.locator('#leo-cartouche').count() === 0);

// 10. Fail-closed : sans données, jamais de cartouche (et le marqueur reste vierge).
const failClosed = await page.evaluate(() => {
  window.sessionStorage.removeItem('ultima-leo-accueil-vu');
  window.UltimaLeo.accueillir({ noeuds: [], relations: [], journal: [] }, {});
  return {
    cartouche: document.getElementById('leo-cartouche') === null,
    marqueur: window.sessionStorage.getItem('ultima-leo-accueil-vu') === null,
  };
});
verifier('Fail-closed : pas de données → pas de cartouche', failClosed.cartouche && failClosed.marqueur);

// 11. Pureté du calcul : calculerRecap est exposée et déterministe.
const recapVide = await page.evaluate(() =>
  window.UltimaLeo.calculerRecap({ noeuds: [], relations: [], journal: [] }, '2026-07-18'));
verifier('calculerRecap pure : état vide → récap vide', recapVide.dernierJournal === null &&
  recapVide.retard === 0 && recapVide.duJour === 0 && recapVide.propositions.length === 0);

// 12. L2 fail-closed : en démo (pas de session), jamais de zone voix.
verifier('Sans session : pas de zone « Parler à Léo »',
  await page.locator('.leo-section-voix').count() === 0);

verifier('Zéro requête réseau hors app (le cartouche ne fait aucun appel)',
  requetesExternes.length === 0, requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (desktop)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));
await page.close();

// ===================== B. Mobile : plein écran doux, tap targets =====================
console.log('— B. Cartouche de Léo (mobile 375×700) —');
const pageM = await navigateur.newPage({ viewport: { width: 375, height: 700 } });
const erreursMobile = [];
pageM.on('console', (msg) => { if (msg.type() === 'error') erreursMobile.push(msg.text()); });
pageM.on('pageerror', (err) => erreursMobile.push(String(err)));
await preparerPage(pageM);
await pageM.goto(`${BASE}/traveler.html`, { waitUntil: 'load', timeout: 20000 });
await pageM.waitForSelector('#leo-cartouche', { timeout: 20000 });

const gabarit = await pageM.evaluate(() => {
  const c = document.getElementById('leo-cartouche').getBoundingClientRect();
  const p = document.getElementById('leo-partir').getBoundingClientRect();
  const prop = document.querySelector('.leo-proposition').getBoundingClientRect();
  return { largeur: c.width, boutonH: p.height, propositionH: prop.height, viewport: window.innerWidth };
});
verifier('Mobile : cartouche plein écran doux (pleine largeur)',
  Math.round(gabarit.largeur) === gabarit.viewport, `${gabarit.largeur}px / ${gabarit.viewport}px`);
verifier('Tap target « C\'est parti » ≥ 44 px', gabarit.boutonH >= 44, `${gabarit.boutonH}px`);
verifier('Tap target proposition ≥ 44 px', gabarit.propositionH >= 44, `${gabarit.propositionH}px`);

await pageM.locator('#leo-partir').click();
verifier('Fermeture au doigt (mobile)', await pageM.locator('#leo-cartouche').count() === 0);
verifier('Zéro erreur console (mobile)', erreursMobile.length === 0, erreursMobile.slice(0, 3).join(' | '));
await pageM.close();

// ===================== C. Voix de Léo (L2) : conversation, gate, panne =====================
// L'API /api/leo est STUBÉE (zéro IA, zéro coût, zéro réseau sortant) : on
// prouve le contrat front — Bearer + quadrant + historique envoyés, bulles
// rendues, gate 503 qui retire la zone, panne qui restitue le texte dicté.
console.log('— C. Voix de Léo (L2, /api/leo stubée) —');
const pageV = await navigateur.newPage({ viewport: { width: 1280, height: 800 } });
const erreursVoix = [];
pageV.on('console', (msg) => {
  if (msg.type() !== 'error') return;
  // Les scénarios C2/C3 provoquent EXPRÈS un 503 et une panne sur /api/leo :
  // le navigateur journalise ces échecs de ressource — attendus, pas des bugs.
  if (/Failed to load resource/.test(msg.text()) &&
      (msg.location()?.url || '').includes('/api/leo')) return;
  erreursVoix.push(msg.text());
});
pageV.on('pageerror', (err) => erreursVoix.push(String(err)));
await preparerPage(pageV);
await pageV.goto(`${BASE}/traveler.html`, { waitUntil: 'load', timeout: 20000 });

// Ouvre un cartouche AVEC voix (jeton de test — aucune vraie session requise).
async function ouvrirCartoucheVoix(cle) {
  await pageV.evaluate((cleQuadrant) => {
    document.querySelectorAll('.leo-voile').forEach((v) => v.remove());
    window.sessionStorage.clear();
    window.UltimaLeo.accueillirQuadrant({
      quadrant: cleQuadrant,
      blason: 'boussole',
      salutation: 'Scénario voix.',
      sections: [{ titre: 'Où on en est', lignes: ['—'] }],
      voix: { quadrant: 'traveler', jeton: 'jeton-de-test' }
    });
  }, cle);
}

// C1. Réponse OK : Bearer + corps conformes, bulles Paul puis Léo.
const requetesLeo = [];
await pageV.route('**/api/leo', (route) => {
  requetesLeo.push({
    autorisation: route.request().headers()['authorization'] || '',
    corps: route.request().postDataJSON()
  });
  return route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { reponse: 'Bien reçu, Paul. Prochaine action : relancer M. Lambert.' } })
  });
});
await ouvrirCartoucheVoix('voix-ok');
verifier('Zone « Parler à Léo » présente avec session', await pageV.locator('.leo-section-voix').count() === 1);
await pageV.locator('.leo-voix-champ').fill('Où en est le réseau ?');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-bulle-leo:not(.leo-bulle-attente)', { timeout: 5000 });
verifier('Bulle de Paul rendue', (await pageV.locator('.leo-bulle-paul').textContent())?.includes('Où en est le réseau ?'));
verifier('Bulle de Léo rendue', (await pageV.locator('.leo-bulle-leo:not(.leo-bulle-attente)').textContent() || '').includes('Prochaine action'));
verifier('Bearer envoyé (jeton de session)', requetesLeo[0]?.autorisation === 'Bearer jeton-de-test');
verifier('Corps : quadrant + historique user', requetesLeo[0]?.corps?.quadrant === 'traveler' &&
  Array.isArray(requetesLeo[0]?.corps?.messages) && requetesLeo[0].corps.messages[0].role === 'user');

// Second tour : l'historique repart EN ENTIER (l'API est sans état).
await pageV.locator('.leo-voix-champ').fill('Détaille.');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForFunction(() => document.querySelectorAll('.leo-bulle-leo:not(.leo-bulle-attente)').length === 2, { timeout: 5000 });
verifier('Historique cumulé au 2e tour (user, assistant, user)',
  requetesLeo[1]?.corps?.messages?.length === 3 &&
  requetesLeo[1].corps.messages.map((m) => m.role).join(',') === 'user,assistant,user');

// C2. Gate coût (503) : la zone se retire proprement, note sincère affichée.
await pageV.unroute('**/api/leo');
await pageV.route('**/api/leo', (route) => route.fulfill({
  status: 503, contentType: 'application/json',
  body: JSON.stringify({ ok: false, error: "La voix de Léo n'est pas encore branchée" })
}));
await ouvrirCartoucheVoix('voix-gate');
await pageV.locator('.leo-voix-champ').fill('Bonjour Léo.');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForFunction(() => document.querySelector('.leo-voix-formulaire') === null, { timeout: 5000 });
verifier('503 : le formulaire se retire (gate coût non levée)',
  await pageV.locator('.leo-voix-formulaire').count() === 0);
verifier('503 : note sincère « pas encore branchée »',
  ((await pageV.locator('.leo-section-voix .leo-vide').textContent()) || '').includes('pas encore branchée'));
verifier('503 : le cartouche, lui, reste ouvert', await pageV.locator('#leo-cartouche').count() === 1);

// C2b. Les mains (L2b) : une proposition d'action ouvre la plaque de
// confirmation — rien ne part tant que Paul n'a pas cliqué ; « Confirmer »
// envoie {action, confirme:true} ; « Annuler » consigne à l'historique.
await pageV.unroute('**/api/leo');
const requetesAction = [];
await pageV.route('**/api/leo', (route) => {
  const corps = route.request().postDataJSON();
  requetesAction.push(corps);
  if (corps.action) {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: {
        reponse: 'C’est fait. Capturer l\'idée « Serre mobile » (business) au registre ADRAMELECH.',
        action_executee: { outil: 'creer_idee', resultat: { adr_num: 5 } }
      } })
    });
  }
  return route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: {
      reponse: 'Je capture « Serre mobile » (business) — je confirme ?',
      action: {
        outil: 'creer_idee',
        arguments: { nom: 'Serre mobile', type: 'business' },
        resume: 'Capturer l\'idée « Serre mobile » (business) au registre ADRAMELECH.'
      }
    } })
  });
});
await ouvrirCartoucheVoix('voix-action');
await pageV.locator('.leo-voix-champ').fill('Capture une idée : serre mobile');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-action', { timeout: 5000 });
verifier('Proposition : plaque de confirmation affichée',
  ((await pageV.locator('.leo-action-resume').textContent()) || '').includes('Serre mobile'));
verifier('Proposition : le champ est gelé (une action à la fois)',
  !(await pageV.locator('.leo-voix-champ').isEnabled()));
verifier('Proposition : AUCUNE écriture envoyée sans clic',
  requetesAction.length === 1 && requetesAction[0].action === undefined);
await pageV.locator('.leo-action-confirmer').click();
await pageV.waitForFunction(() => document.querySelector('.leo-action') === null, { timeout: 5000 });
verifier('Confirmation : {action, confirme:true} envoyés',
  requetesAction.length === 2 && requetesAction[1].confirme === true &&
  requetesAction[1].action?.outil === 'creer_idee' &&
  requetesAction[1].action?.arguments?.nom === 'Serre mobile' &&
  requetesAction[1].messages === undefined);
verifier('Confirmation : bulle « C’est fait »',
  (await pageV.locator('.leo-bulle-leo:not(.leo-bulle-attente)').allTextContents())
    .some((t) => t.includes('C’est fait')));
verifier('Confirmation : le champ est réarmé', await pageV.locator('.leo-voix-champ').isEnabled());

// Annulation : plaque retirée, rien envoyé de plus, historique consigné.
await pageV.locator('.leo-voix-champ').fill('Encore une idée : four solaire');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-action', { timeout: 5000 });
const envoisAvantAnnulation = requetesAction.length;
await pageV.locator('.leo-action-annuler').click();
verifier('Annulation : plaque retirée sans requête',
  await pageV.locator('.leo-action').count() === 0 &&
  requetesAction.length === envoisAvantAnnulation);
await pageV.locator('.leo-voix-champ').fill('Où en est le registre ?');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForFunction((n) => {
  return document.querySelectorAll('.leo-bulle-paul').length === n;
}, 3, { timeout: 5000 });
verifier("Annulation : consignée à l'historique du tour suivant",
  JSON.stringify(requetesAction[requetesAction.length - 1].messages || [])
    .includes('Action annulée par Paul'));

// C3. Panne réseau : bulle d'erreur générique, texte dicté restitué au champ.
await pageV.unroute('**/api/leo');
await pageV.route('**/api/leo', (route) => route.abort());
await ouvrirCartoucheVoix('voix-panne');
await pageV.locator('.leo-voix-champ').fill('Message qui échoue');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-bulle-erreur', { timeout: 5000 });
verifier('Panne : bulle d’erreur générique', ((await pageV.locator('.leo-bulle-erreur').textContent()) || '').includes("n'a pas pu répondre"));
verifier('Panne : le texte dicté est restitué dans le champ',
  (await pageV.locator('.leo-voix-champ').inputValue()) === 'Message qui échoue');
verifier('Panne : le champ est réarmé (saisissable)', await pageV.locator('.leo-voix-champ').isEnabled());

verifier('Zéro erreur console (voix)', erreursVoix.length === 0, erreursVoix.slice(0, 3).join(' | '));
await pageV.close();

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE LÉO ACCUEIL VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
