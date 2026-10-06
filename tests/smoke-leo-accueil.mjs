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
await page.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });

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
await pageM.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
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
// ======= B-bis. LES YEUX DE LÉO SUR RIVEN (boucle ①, 2026-08-01) =======
// L'état borné du quadrant, joint à chaque question, pour répondre « où j'en
// suis ». Arbitrage de Paul : les NOMS partent vers l'IA — c'est ce qui rend
// Léo utile (« relance Untel ») — mais « bien protégés ». La protection tient
// en cinq règles dures, et une règle de confidentialité se teste PAR
// L'ABSENCE : on cherche dans ce qui partirait les coordonnées, les notes et
// les identifiants, et on exige de NE PAS les y trouver. Vérifier seulement la
// présence des noms ne prouverait rien.
console.log('— B-bis. Les yeux de Léo sur RIVEN (noms protégés) —');
{
  const pageY = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });
  await pageY.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
  await pageY.waitForFunction(() => window.UltimaRiven !== undefined, null, { timeout: 20000 });

  // Fixture volontairement COMPLÈTE : chaque fiche porte tout ce qu'une vraie
  // fiche porte (téléphone, e-mail, adresse, coordonnées, notes), pour que
  // l'absence prouve quelque chose.
  const vu = await pageY.evaluate(() => {
    const noeuds = [
      { id: 'n1', type: 'artisan', nom: 'Menuiserie Delcourt', secteur_activite: 'Menuiserie', statut: 'actif',
        telephone: '03 20 55 41 20', email: 'contact@menuiserie-delcourt.fr', adresse: '12 rue Nationale',
        ville: 'Lille', lat: 50.6292, lng: 3.0573, notes: 'Très fiable sur les délais.' },
      { id: 'n2', type: 'artisan', nom: 'Plomberie Roux & Fils', secteur_activite: 'Plomberie', statut: 'actif',
        telephone: '04 78 30 12 45', email: 'contact@plomberie-roux.fr', notes: 'Disponible sous 48 h.' },
      { id: 'n3', type: 'partenaire', nom: 'Agence Habitat Sud', secteur_activite: 'Courtage', statut: 'actif',
        telephone: '04 91 54 22 10', notes: 'Apporte des dossiers de rénovation.' },
      { id: 'n4', type: 'partenaire', nom: 'Courtage Bâti Ouest', secteur_activite: 'Courtage', statut: 'actif',
        notes: 'Commission 5 %.' },
      { id: 'n5', type: 'lead', nom: 'M. Lambert — rénovation toiture', secteur_activite: 'Toiture',
        statut: 'prospect', telephone: '06 12 34 56 78', email: 'p.lambert@gmail.com',
        notes: 'Devis envoyé le 15/06.' },
      { id: 'n6', type: 'lead', nom: 'Mme Nguyen — extension maison', statut: 'termine',
        email: 'nguyen.famille@free.fr', notes: 'Budget à confirmer.' },
      { id: 'n7', type: 'chantier', nom: 'Réhabilitation immeuble Voltaire', statut: 'en_cours',
        adresse: '112 boulevard Voltaire', notes: 'Livraison en septembre.' },
    ];
    const relations = [
      { id: 'r1', statut: 'en_cours', notes: 'Dossiers copropriétés.' },
      { id: 'r2', statut: 'contact_etabli' }, { id: 'r3', statut: 'fructueux' },
      { id: 'r4', statut: 'arrete', raison_arret: 'plus de disponibilité' },
    ];
    const journal = [
      { id: 'j1', node_id: 'n5', relance_at: '2026-07-01', relance_faite: false,
        note: 'Devis toiture envoyé, attend la banque.', prochaine_etape: 'Relancer M. Lambert' },
      { id: 'j2', node_id: 'n7', relance_at: '2026-08-01', relance_faite: false,
        note: 'Plans reçus de l’architecte.', prochaine_etape: 'Envoyer le chiffrage' },
      { id: 'j3', node_id: 'n1', relance_at: '2026-09-01', relance_faite: false, note: 'plus tard' },
      { id: 'j4', node_id: 'n2', relance_at: '2026-07-02', relance_faite: true, note: 'déjà fait' },
    ];
    const etat = window.UltimaRiven.construireEtatRiven(
      noeuds, relations, journal, [{ id: 'a1' }], '2026-08-01');
    return { etat, brut: JSON.stringify(etat) };
  });

  // ---- Les comptes. ----
  const c = vu.etat.compteurs;
  verifier('Yeux RIVEN : le réseau est compté', c['contacts au réseau'] === 7, JSON.stringify(c));
  verifier('Yeux RIVEN : les types sont comptés',
    c['artisans'] === 2 && c['partenaires'] === 2 && c['chantiers'] === 1, JSON.stringify(c));
  verifier('Yeux RIVEN : un lead terminé n’est plus actif', c['leads actifs'] === 1, JSON.stringify(c));
  verifier('Yeux RIVEN : les relations vivantes sont comptées',
    c['relations en cours'] === 2 && c['relations fructueuses'] === 1, JSON.stringify(c));
  verifier('Yeux RIVEN : relances dues = échues ou du jour, jamais celles déjà faites',
    c['relances dues'] === 2, JSON.stringify(c));
  verifier('Yeux RIVEN : les relances en retard sont distinguées du jour même',
    c['relances en retard'] === 1, JSON.stringify(c));
  verifier('Yeux RIVEN : les alertes J-2 remontent', c['chantiers en alerte J-2'] === 1);

  // ---- Les noms : présents, c'est l'arbitrage de Paul. ----
  const contacts = vu.etat.listes['Les contacts du réseau'] || [];
  verifier('Yeux RIVEN : les contacts sont nommés', contacts.length === 7, JSON.stringify(contacts.length));
  verifier('Yeux RIVEN : un nom est accompagné de sa CATÉGORIE, rien de plus',
    contacts.every((e) => Object.keys(e).every((k) => k === 'libelle' || k === 'marque'))
    && contacts.every((e) => ['artisan', 'partenaire', 'lead', 'chantier'].includes(e.marque)),
    JSON.stringify(contacts[0]));
  verifier('Yeux RIVEN : les plus vivants d’abord (leads en tête, chantiers en queue)',
    contacts[0].marque === 'lead' && contacts[contacts.length - 1].marque === 'chantier',
    JSON.stringify(contacts.map((e) => e.marque)));

  const relances = vu.etat.listes['Les relances dues'] || [];
  verifier('Yeux RIVEN : les relances dues sont NOMMÉES (c’est l’utilité de Léo)',
    relances.length === 2 && relances.some((r) => /Lambert/.test(r.libelle)), JSON.stringify(relances));
  verifier('Yeux RIVEN : l’échéance est une catégorie, jamais une date brute',
    relances.every((r) => r.marque === 'en retard' || r.marque === 'aujourd’hui'), JSON.stringify(relances));

  const secteurs = vu.etat.listes['Les secteurs du réseau'] || [];
  verifier('Yeux RIVEN : les secteurs sont listés',
    secteurs.length === 4 && secteurs[0].libelle === 'Courtage', JSON.stringify(secteurs[0]));

  // ---- L'ABSENCE : « bien protégés » se prouve par ce qui NE part PAS. ----
  const coordonnees = ['03 20 55 41 20', '04 78 30 12 45', '04 91 54 22 10', '06 12 34 56 78',
    'contact@menuiserie-delcourt.fr', 'p.lambert@gmail.com', 'nguyen.famille@free.fr',
    '12 rue Nationale', '112 boulevard Voltaire', '50.6292', '3.0573', 'Lille'];
  const fuitesCoord = coordonnees.filter((mot) => vu.brut.includes(mot));
  verifier('ABSENCE — aucune coordonnée (téléphone, e-mail, adresse, position, ville)',
    fuitesCoord.length === 0, fuitesCoord.join(', '));

  const contenus = ['fiable sur les délais', 'Disponible sous 48', 'dossiers de rénovation',
    'Commission 5', 'Devis envoyé le 15/06', 'Budget à confirmer', 'Livraison en septembre',
    'attend la banque', 'Plans reçus', 'Relancer M. Lambert', 'Envoyer le chiffrage',
    'plus tard', 'déjà fait', 'copropriétés', 'plus de disponibilité'];
  const fuitesContenu = contenus.filter((mot) => vu.brut.includes(mot));
  verifier('ABSENCE — aucun contenu écrit SUR quelqu’un (notes, journal, prochaine étape)',
    fuitesContenu.length === 0, fuitesContenu.join(', '));

  verifier('ABSENCE — aucun identifiant',
    !/"n[1-7]"|"r[1-4]"|"j[1-4]"|"a1"/.test(vu.brut), vu.brut.slice(0, 120));
  verifier('ABSENCE — aucune date brute',
    !/2026-0[789]-\d\d/.test(vu.brut));

  // ---- Bornes du serveur : l'état doit passer validerEtatQuadrant. ----
  verifier('Yeux RIVEN : ≤ 12 compteurs (borne serveur)', Object.keys(c).length <= 12);
  verifier('Yeux RIVEN : ≤ 4 listes (borne serveur)', Object.keys(vu.etat.listes).length <= 4);
  verifier('Yeux RIVEN : chaque libellé de compteur respecte le motif serveur',
    Object.keys(c).every((k) => /^[\wÀ-ÿ' ’()–-]{1,60}$/.test(k)), JSON.stringify(Object.keys(c)));
  verifier('Yeux RIVEN : chaque entrée respecte les bornes serveur',
    Object.keys(vu.etat.listes).every((k) => vu.etat.listes[k].length <= 40
      && vu.etat.listes[k].every((e) => e.libelle.length <= 200 && (!e.marque || e.marque.length <= 60))));

  // ---- Le carnet d'adresses ne s'exporte pas : 200 fiches → 40 au plus. ----
  const borne = await pageY.evaluate(() => {
    const gros = Array.from({ length: 200 }, (_, i) => ({
      id: 'x' + i, type: 'artisan', nom: 'Contact numéro ' + i, statut: 'actif',
    }));
    const e = window.UltimaRiven.construireEtatRiven(gros, [], [], [], '2026-08-01');
    return { contacts: e.listes['Les contacts du réseau'].length, compte: e.compteurs['contacts au réseau'] };
  });
  verifier('Yeux RIVEN : 200 fiches → 40 noms au plus (jamais un export du carnet)',
    borne.contacts === 40 && borne.compte === 200, JSON.stringify(borne));

  // Un réseau vide ne fabrique pas de liste fantôme.
  const vide = await pageY.evaluate(() =>
    window.UltimaRiven.construireEtatRiven([], [], [], [], '2026-08-01'));
  verifier('Yeux RIVEN : un réseau vide donne des comptes à zéro, aucune liste',
    vide.compteurs['contacts au réseau'] === 0 && Object.keys(vide.listes).length === 0,
    JSON.stringify(vide));

  await pageY.close();
}

console.log('— C. Voix de Léo (L2, /api/leo stubée) —');
const pageV = await navigateur.newPage({ viewport: { width: 1280, height: 800 } });
const erreursVoix = [];
// C11 provoque EXPRÈS un 500 sur l'API d'écriture : exempté PENDANT C11 seulement.
let echecEcritureProvoque = false;
pageV.on('console', (msg) => {
  if (msg.type() !== 'error') return;
  // Les scénarios C2/C3 provoquent EXPRÈS un 503 et une panne sur /api/leo :
  // le navigateur journalise ces échecs de ressource — attendus, pas des bugs.
  if (/Failed to load resource/.test(msg.text()) &&
      (msg.location()?.url || '').includes('/api/leo')) return;
  if (echecEcritureProvoque && /Failed to load resource/.test(msg.text()) &&
      (msg.location()?.url || '').includes('/api/reseau/journal')) return;
  erreursVoix.push(msg.text());
});
pageV.on('pageerror', (err) => erreursVoix.push(String(err)));
await preparerPage(pageV);
await pageV.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });

// Ouvre un cartouche AVEC voix (jeton de test — aucune vraie session requise).
// `candidats` optionnel (L2b) : résolution locale des cibles dictées.
async function ouvrirCartoucheVoix(cle, candidats) {
  await pageV.evaluate((params) => {
    document.querySelectorAll('.leo-voile').forEach((v) => v.remove());
    window.sessionStorage.clear();
    window.UltimaLeo.accueillirQuadrant({
      quadrant: params.cle,
      blason: 'boussole',
      salutation: 'Scénario voix.',
      sections: [{ titre: 'Où on en est', lignes: ['—'] }],
      voix: { quadrant: 'riven', jeton: 'jeton-de-test', candidats: params.candidats }
    });
  }, { cle, candidats });
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
// C1-bis. Lisibilité sous le thème de nuit (Paul, 06/10 : « je vois mal ») :
// le champ et la bulle de Paul portaient un crème écrit en dur sous une encre
// devenue claire. Pire cas de chaque fond (chaque arrêt d'un dégradé), texte
// saisi ET indication du champ, mesurés sur les couleurs réellement rendues.
await pageV.locator('.leo-voix-champ').fill('note l’idée TEST-ANNEAU');
const couplesVoix = await pageV.evaluate(() => {
  const fonds = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const st = getComputedStyle(n);
      const lues = (st.backgroundImage.match(/rgba?\([^)]+\)/g) || [])
        .filter((c) => !/,\s*0(\.0+)?\)$/.test(c));
      if (/^rgba?\(/.test(st.backgroundColor) && !/,\s*0\)$/.test(st.backgroundColor)) lues.push(st.backgroundColor);
      if (lues.length) return lues;
    }
    return ['rgb(255, 255, 255)'];
  };
  const champ = document.querySelector('.leo-voix-champ');
  const bulle = document.querySelector('.leo-bulle-paul');
  return [
    { nom: 'texte saisi', texte: getComputedStyle(champ).color, fonds: fonds(champ) },
    { nom: 'indication du champ', texte: getComputedStyle(champ, '::placeholder').color, fonds: fonds(champ) },
    { nom: 'bulle de Paul', texte: getComputedStyle(bulle).color, fonds: fonds(bulle) },
  ];
});
for (const c of couplesVoix) {
  const pire = Math.min(...c.fonds.map((f) => ratio(versHex(c.texte), versHex(f))));
  verifier(`Contraste ${c.nom} (nuit, pire arrêt du fond) ≥ 4,5:1`, pire >= 4.5,
    `${pire.toFixed(2)}:1 — ${c.texte} sur ${c.fonds.join(' / ')}`);
}
await pageV.locator('.leo-voix-champ').fill('');
verifier('Bearer envoyé (jeton de session)', requetesLeo[0]?.autorisation === 'Bearer jeton-de-test');
verifier('Corps : quadrant + historique user', requetesLeo[0]?.corps?.quadrant === 'riven' &&
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

// C2-bis (W2, audit du 05/10). Route réservée au propriétaire, réglage absent :
// la note nomme la VRAIE cause (la variable), pas « clé API en attente ».
await pageV.unroute('**/api/leo');
await pageV.route('**/api/leo', (route) => route.fulfill({
  status: 503, contentType: 'application/json',
  body: JSON.stringify({ ok: false, error: 'Accès réservé non réglé' })
}));
await ouvrirCartoucheVoix('voix-reserve');
await pageV.locator('.leo-voix-champ').fill('Bonjour Léo.');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForFunction(() => document.querySelector('.leo-voix-formulaire') === null, { timeout: 5000 });
const noteReserve = (await pageV.locator('.leo-section-voix .leo-vide').textContent()) || '';
verifier('503 réservé : la note nomme ULTIMA_PROPRIETAIRES', noteReserve.includes('ULTIMA_PROPRIETAIRES'));
verifier('503 réservé : jamais « clé API en attente »', !noteReserve.includes('clé API'));

// C3. Panne réseau : bulle d'erreur générique, texte dicté restitué au champ.
await pageV.unroute('**/api/leo');
await pageV.route('**/api/leo', (route) => route.abort());
await ouvrirCartoucheVoix('voix-panne');
await pageV.locator('.leo-voix-champ').fill('Message qui échoue');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-bulle-erreur', { timeout: 5000 });
verifier('Panne : bulle d’erreur générique, qui dit « réseau »',
  ((await pageV.locator('.leo-bulle-erreur').textContent()) || '').includes("n'a pas pu répondre (réseau)"));
verifier('Panne : le texte dicté est restitué dans le champ',
  (await pageV.locator('.leo-voix-champ').inputValue()) === 'Message qui échoue');
verifier('Panne : le champ est réarmé (saisissable)', await pageV.locator('.leo-voix-champ').isEnabled());

// C3 bis. Une réponse en échec dit son CODE (et rien d'autre du serveur) :
// c'est ce qui permet de diagnostiquer sans les journaux Vercel.
for (const [code, corps, suffixe] of [
  [502, { ok: false, error: "Léo n'a pas pu répondre" }, ''],
  // La cause du serveur, si elle est dans la liste fermée, s'ajoute au code…
  [502, { ok: false, error: "Léo n'a pas pu répondre", cause: 'ia 400 crédit' }, ' · ia 400 crédit'],
  // … et jamais un texte quelconque.
  [502, { ok: false, error: "Léo n'a pas pu répondre", cause: '<b>injecté</b>' }, ''],
  [504, null, '']
]) {
  await pageV.unroute('**/api/leo');
  await pageV.route('**/api/leo', (route) => route.fulfill({ status: code,
    contentType: corps ? 'application/json' : 'text/html',
    body: corps ? JSON.stringify(corps) : '<html>FUNCTION_INVOCATION_TIMEOUT</html>' }));
  await ouvrirCartoucheVoix('voix-code-' + code);
  await pageV.locator('.leo-voix-champ').fill('Message qui échoue');
  await pageV.locator('.leo-voix-envoyer').click();
  await pageV.waitForSelector('.leo-bulle-erreur', { timeout: 5000 });
  const texteErreur = (await pageV.locator('.leo-bulle-erreur').textContent()) || '';
  verifier('Échec ' + code + (suffixe || '') + ' : la bulle dit son code, sans recopier le serveur',
    texteErreur === "Léo n'a pas pu répondre (code " + code + suffixe + ') — réessayez.', texteErreur);
}

// ===================== C4-C7. Les mains de Léo (L2b, API stubées) =====================
// La carte de confirmation est un rendu DÉTERMINISTE de la reformulation
// SERVEUR ; l'exécution ne part QUE sur « Confirmer », vers l'API d'écriture
// existante (Bearer + corps exact du gabarit) ; « Annuler » n'appelle rien ;
// ref ambiguë → confirmation impossible ; proposition malformée → pas de carte.
const CANDIDATS_TEST = {
  cibles: [
    { id: 'aaaaaaaa-0000-0000-0000-000000000001', libelle: 'M. Lambert' },
    { id: 'aaaaaaaa-0000-0000-0000-000000000002', libelle: 'M. Martin' }
  ]
};
const REFORMULATION = 'Noter au journal de « M. Lambert » : « Appelé ce matin. »';

function stubberLeoAvecProposition(proposition) {
  return pageV.route('**/api/leo', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { reponse: 'Je te propose ceci.', proposition } })
  }));
}

// C4. Proposition valide → carte + Confirmer → POST exact + message d'issue.
await pageV.unroute('**/api/leo');
await stubberLeoAvecProposition({
  outil: 'proposer_journal',
  args: { cible_ref: 'Lambert', texte: 'Appelé ce matin.' },
  reformulation: REFORMULATION
});
const requetesJournal = [];
await pageV.route('**/api/reseau/journal', (route) => {
  requetesJournal.push({
    methode: route.request().method(),
    autorisation: route.request().headers()['authorization'] || '',
    corps: route.request().postDataJSON()
  });
  return route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { id: 'j-1' } })
  });
});
await ouvrirCartoucheVoix('mains-ok', CANDIDATS_TEST);
await pageV.locator('.leo-voix-champ').fill('Note que j’ai appelé Lambert ce matin.');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-carte-action', { timeout: 5000 });
verifier('Carte de confirmation affichée', await pageV.locator('.leo-carte-action').count() === 1);
verifier('La carte porte la reformulation SERVEUR (déterministe)',
  ((await pageV.locator('.leo-carte-texte').textContent()) || '').trim() === REFORMULATION);
verifier('La carte nomme la cible RÉSOLUE avant tout POST [S-L2b-1]',
  ((await pageV.locator('.leo-carte-cible').textContent()) || '').includes('M. Lambert') &&
  requetesJournal.length === 0);
verifier('Saisie coupée tant que la carte est ouverte',
  await pageV.locator('.leo-voix-champ').isDisabled() && await pageV.locator('.leo-voix-envoyer').isDisabled());
verifier('Boutons Confirmer + Annuler présents (≥ 44 px)', await pageV.evaluate(() => {
  const c = document.querySelector('.leo-carte-confirmer');
  const a = document.querySelector('.leo-carte-annuler');
  return Boolean(c) && Boolean(a) &&
    c.getBoundingClientRect().height >= 44 && a.getBoundingClientRect().height >= 44;
}));
verifier('Aucune exécution avant confirmation', requetesJournal.length === 0);
await pageV.locator('.leo-carte-confirmer').click();
await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
verifier('Confirmer → un POST vers /api/reseau/journal', requetesJournal.length === 1 &&
  requetesJournal[0].methode === 'POST');
verifier('Exécution avec le Bearer de session',
  requetesJournal[0]?.autorisation === 'Bearer jeton-de-test');
verifier('Corps EXACT du gabarit (id résolu localement + note dictée)',
  JSON.stringify(requetesJournal[0]?.corps) === JSON.stringify({
    node_id: 'aaaaaaaa-0000-0000-0000-000000000001', note: 'Appelé ce matin.'
  }));
verifier("Message d'issue « Action exécutée » (reformulation)",
  ((await pageV.locator('.leo-bulle-issue').textContent()) || '') ===
  '[Action exécutée : ' + REFORMULATION + ']');
verifier('La carte se ferme et la saisie se réarme',
  await pageV.locator('.leo-carte-action').count() === 0 &&
  await pageV.locator('.leo-voix-champ').isEnabled());
verifier("L'issue rejoint l'historique : elle repart au tour suivant", await (async () => {
  const requetesSuite = [];
  await pageV.unroute('**/api/leo');
  await pageV.route('**/api/leo', (route) => {
    requetesSuite.push(route.request().postDataJSON());
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { reponse: 'Bien noté.' } })
    });
  });
  await pageV.locator('.leo-voix-champ').fill('Merci.');
  await pageV.locator('.leo-voix-envoyer').click();
  await pageV.waitForFunction(() =>
    document.querySelectorAll('.leo-bulle-leo:not(.leo-bulle-attente)').length >= 2, { timeout: 5000 });
  const messages = requetesSuite[0]?.messages || [];
  return messages.some((m) => m.role === 'user' &&
    m.content === '[Action exécutée : ' + REFORMULATION + ']');
})());

// C5. Annuler → AUCUN appel d'exécution + message d'annulation.
await pageV.unroute('**/api/leo');
await stubberLeoAvecProposition({
  outil: 'proposer_journal',
  args: { cible_ref: 'Lambert', texte: 'À annuler.' },
  reformulation: 'Noter au journal de « M. Lambert » : « À annuler. »'
});
await ouvrirCartoucheVoix('mains-annulation', CANDIDATS_TEST);
await pageV.locator('.leo-voix-champ').fill('Note un truc.');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-carte-action', { timeout: 5000 });
const appelsAvantAnnulation = requetesJournal.length;
await pageV.locator('.leo-carte-annuler').click();
await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
verifier('Annuler → aucun POST d’exécution', requetesJournal.length === appelsAvantAnnulation);
verifier("Message d'issue « Action annulée par Paul »",
  ((await pageV.locator('.leo-bulle-issue').textContent()) || '') === '[Action annulée par Paul]');
verifier('Annulation : carte fermée, saisie réarmée',
  await pageV.locator('.leo-carte-action').count() === 0 &&
  await pageV.locator('.leo-voix-champ').isEnabled());

// C6. Référence ambiguë (« M. » touche Lambert ET Martin) → confirmation impossible.
await pageV.unroute('**/api/leo');
await stubberLeoAvecProposition({
  outil: 'proposer_journal',
  args: { cible_ref: 'M.', texte: 'Cible floue.' },
  reformulation: 'Noter au journal de « M. » : « Cible floue. »'
});
await ouvrirCartoucheVoix('mains-ambigue', CANDIDATS_TEST);
await pageV.locator('.leo-voix-champ').fill('Note pour M.');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-carte-action', { timeout: 5000 });
verifier('Ref ambiguë : pas de bouton Confirmer (seul Annuler reste)',
  await pageV.locator('.leo-carte-confirmer').count() === 0 &&
  await pageV.locator('.leo-carte-annuler').count() === 1);
verifier('Ref ambiguë : aucune cible affichée [S-L2b-1]',
  await pageV.locator('.leo-carte-cible').count() === 0);
verifier('Ref ambiguë : la carte le dit sobrement',
  ((await pageV.locator('.leo-carte-blocage').textContent()) || '').includes('ambiguë'));
await pageV.locator('.leo-carte-annuler').click();
await pageV.waitForFunction(() => document.querySelector('.leo-carte-action') === null, { timeout: 5000 });

// C7. Proposition malformée (args non-string) → IGNORÉE : bulle texte seule.
await pageV.unroute('**/api/leo');
await stubberLeoAvecProposition({
  outil: 'proposer_journal',
  args: { cible_ref: { $ne: null }, texte: 42 },
  reformulation: 'Forme douteuse.'
});
await ouvrirCartoucheVoix('mains-malformee', CANDIDATS_TEST);
await pageV.locator('.leo-voix-champ').fill('Message.');
await pageV.locator('.leo-voix-envoyer').click();
await pageV.waitForSelector('.leo-bulle-leo:not(.leo-bulle-attente)', { timeout: 5000 });
verifier('Proposition malformée : aucune carte, seule la bulle texte',
  await pageV.locator('.leo-carte-action').count() === 0 &&
  ((await pageV.locator('.leo-bulle-leo:not(.leo-bulle-attente)').textContent()) || '')
    .includes('Je te propose ceci.'));
verifier('Proposition malformée : la saisie reste utilisable',
  await pageV.locator('.leo-voix-champ').isEnabled());

// ===================== C8-C12. B1 ④ — l'anneau vert agit (cadrage §13) =====================
// Une proposition VERTE s'exécute sans clic, mais seulement DERRIÈRE une trace
// posée par le serveur : ouvrir → acte → clore, dans cet ordre. Tout refus du
// journal retombe sur la carte, avec ZÉRO requête d'écriture.
const TRACE = '3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607';
const CREE = 'bbbbbbbb-0000-4000-8000-000000000009';
let sequence = [];
let corpsEcritures = [];
// La cible est dictée EXACTEMENT (« M. Lambert ») : S1 réserve l'exécution
// sans clic à l'égalité exacte — une inclusion retombe sur la carte (C13).
async function stubberVert({ ouverture, acte, cibleRef = 'M. Lambert' }) {
  sequence = [];
  corpsEcritures = [];
  await pageV.unroute('**/api/leo');
  await stubberLeoAvecProposition({
    outil: 'proposer_journal',
    args: { cible_ref: cibleRef, texte: 'Appelé ce matin.' },
    reformulation: REFORMULATION,
    anneau: 'vert'
  });
  await pageV.unroute('**/api/leo/ecritures');
  await pageV.route('**/api/leo/ecritures', (route) => {
    const corps = route.request().postDataJSON();
    corpsEcritures.push(corps);
    sequence.push(corps.etape);
    if (corps.etape === 'ouvrir') return ouverture(route);
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { traceId: TRACE, issue: corps.issue } }) });
  });
  await pageV.unroute('**/api/reseau/journal');
  await pageV.route('**/api/reseau/journal', (route) => { sequence.push('acte'); return acte(route); });
}
const ouvertureOk = (route) => route.fulfill({ status: 200, contentType: 'application/json',
  body: JSON.stringify({ ok: true, data: { traceId: TRACE, restant: 39 } }) });
const acteOk = (route) => route.fulfill({ status: 200, contentType: 'application/json',
  body: JSON.stringify({ ok: true, data: { id: CREE } }) });
// Attente NOMMÉE : un sabotage qui supprime la carte doit rougir sur un
// verdict qui le dit, pas sur un TimeoutError anonyme.
const carteApparait = () => pageV.waitForSelector('.leo-carte-action', { timeout: 5000 })
  .then(() => true, () => false);
async function dicter(cle) {
  await ouvrirCartoucheVoix(cle, CANDIDATS_TEST);
  await pageV.locator('.leo-voix-champ').fill('Note que j’ai appelé Lambert ce matin.');
  await pageV.locator('.leo-voix-envoyer').click();
}

// C8. Vert nominal : aucun clic, ouvrir AVANT l'acte, clore APRÈS.
await stubberVert({ ouverture: ouvertureOk, acte: acteOk });
await dicter('vert-ok');
await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
for (let i = 0; i < 50 && sequence.length < 3; i++) await pageV.waitForTimeout(50);
verifier('B1-a — vert : AUCUNE carte, aucun clic', await pageV.locator('.leo-carte-action').count() === 0);
verifier('B1-a — ordre : ouvrir → acte → clore', sequence.join(' → ') === 'ouvrir → acte → clore',
  sequence.join(' → '));
verifier("Ouvrir porte la proposition, JAMAIS l'anneau",
  JSON.stringify(corpsEcritures[0]) === JSON.stringify({
    etape: 'ouvrir', outil: 'proposer_journal',
    args: { cible_ref: 'M. Lambert', texte: 'Appelé ce matin.' }, quadrant: 'riven'
  }), JSON.stringify(corpsEcritures[0]));
verifier("Clore : la trace, l'issue, la CIBLE par identifiant — zéro contenu dicté",
  JSON.stringify(corpsEcritures[1]) === JSON.stringify({
    etape: 'clore', traceId: TRACE, issue: 'reussie', cibleId: CREE
  }), JSON.stringify(corpsEcritures[1]));
verifier('Paul le voit : « Fait sans demander » + la cible RÉSOLUE, dans le fil',
  ((await pageV.locator('.leo-bulle-issue .leo-bulle-texte').textContent()) || '') ===
  '[Fait sans demander : ' + REFORMULATION + ' → Cible : « M. Lambert »]');
// B1 ⑤ : à côté du texte, le bouton « Défaire » — nommé, ≥ 44 px.
verifier('B1 ⑤ — la bulle porte son bouton « Défaire » (nommé, ≥ 44 px)', await pageV.evaluate(() => {
  const b = document.querySelector('.leo-bulle-issue .leo-defaire');
  if (!b) return false;
  const r = b.getBoundingClientRect();
  return b.textContent === 'Défaire' && /^Défaire : /.test(b.getAttribute('aria-label') || '') &&
    r.width >= 44 && r.height >= 44;
}));
verifier('Vert : la saisie se réarme', await pageV.locator('.leo-voix-champ').isEnabled());

// C9. Fail-closed : le journal refuse (503) ou tombe (réseau) → la carte, ZÉRO acte.
for (const [nom, ouverture] of [
  ['503', (route) => route.fulfill({ status: 503, contentType: 'application/json',
    body: JSON.stringify({ ok: false, error: 'Journal indisponible' }) })],
  ['réseau', (route) => route.abort()],
  // Une trace qui n'a pas la forme d'une trace n'en est pas une.
  ['trace forgée', (route) => route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { traceId: 'pas-une-trace' } }) })]
]) {
  await stubberVert({ ouverture, acte: acteOk });
  await dicter('vert-ko-' + nom);
  const carte = await carteApparait();
  verifier(`Journal ${nom} → la carte, et ZÉRO requête d'écriture`,
    carte && !sequence.includes('acte') && await pageV.locator('.leo-carte-confirmer').count() === 1,
    sequence.join(' → '));
  if (carte) {
    await pageV.locator('.leo-carte-annuler').click();
    await pageV.waitForFunction(() => document.querySelector('.leo-carte-action') === null, { timeout: 5000 });
  }
}

// C10. B1-f — plafond atteint (429) : Léo demande au lieu d'agir.
await stubberVert({ ouverture: (route) => route.fulfill({ status: 429, contentType: 'application/json',
  body: JSON.stringify({ ok: false, error: 'Plafond d’écritures atteint' }) }), acte: acteOk });
await dicter('vert-plafond');
const cartePlafond = await carteApparait();
verifier('B1-f — plafond : la carte, zéro acte', cartePlafond && !sequence.includes('acte'),
  sequence.join(' → '));
if (cartePlafond) await pageV.locator('.leo-carte-confirmer').click();
await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
verifier('Plafond : Paul confirme, et c’est LUI qui écrit (un seul acte)',
  sequence.filter((s) => s === 'acte').length === 1);

// C11. Un 500, une réponse illisible ou perdue peuvent suivre une écriture.
echecEcritureProvoque = true;
for (const [nom, acte] of [
  ['500', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false }) })],
  ['illisible', (route) => route.fulfill({ status: 200, contentType: 'text/plain', body: 'réponse tronquée' })],
  ['perdue', (route) => route.abort('failed')]
]) {
  await stubberVert({ ouverture: ouvertureOk, acte });
  await dicter('vert-inconnu-' + nom);
  await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
  await pageV.waitForTimeout(150);
  verifier('Issue inconnue ' + nom + ' : tentative seule, un acte et aucun renvoi',
    corpsEcritures.length === 1 && sequence.filter((s) => s === 'acte').length === 1 &&
    await pageV.locator('.leo-carte-action').count() === 0 &&
    ((await pageV.locator('.leo-bulle-issue').textContent()) || '').includes('Résultat de l’action inconnu'),
    sequence.join(' → '));
}
// Un refus explicite avant écriture autorise la clôture d'échec.
await stubberVert({ ouverture: ouvertureOk, acte: (route) => route.fulfill({ status: 403,
  contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Refus' }) }) });
await dicter('vert-refuse');
await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
for (let i = 0; i < 50 && sequence.length < 3; i++) await pageV.waitForTimeout(50);
verifier('Refus explicite : clôture échouée et un seul acte',
  corpsEcritures[1]?.issue === 'echouee' && corpsEcritures[1]?.motif === 'statut 403' &&
  sequence.filter((s) => s === 'acte').length === 1);
echecEcritureProvoque = false;

// C12. Un anneau à la casse approximative n'est pas vert : la carte.
sequence = [];
await pageV.unroute('**/api/leo');
await stubberLeoAvecProposition({
  outil: 'proposer_journal', args: { cible_ref: 'Lambert', texte: 'Casse.' },
  reformulation: 'Noter au journal de « M. Lambert » : « Casse. »', anneau: 'VERT'
});
await dicter('vert-casse');
const carteCasse = await carteApparait();
verifier("Anneau 'VERT' → la carte, aucun appel au journal",
  carteCasse && sequence.length === 0 && await pageV.locator('.leo-carte-confirmer').count() === 1,
  sequence.join(' → '));
if (carteCasse) await pageV.locator('.leo-carte-annuler').click();

// C13. S1 — cible résolue par INCLUSION (« Lambert » → « M. Lambert ») :
// la carte la NOMME, et rien ne part sans Paul.
await stubberVert({ ouverture: ouvertureOk, acte: acteOk, cibleRef: 'Lambert' });
await dicter('vert-inclusion');
const carteInclusion = await carteApparait();
verifier('S1 — inclusion : la carte, qui nomme la cible résolue',
  carteInclusion && ((await pageV.locator('.leo-carte-cible').textContent()) || '').includes('M. Lambert'));
verifier("S1 — inclusion : ZÉRO appel au journal ni à l'API d'écriture",
  sequence.length === 0, sequence.join(' → '));
if (carteInclusion) await pageV.locator('.leo-carte-annuler').click();

// C14. S3 — Paul ferme le cartouche pendant que Léo réfléchit : RIEN ne part.
await stubberVert({ ouverture: ouvertureOk, acte: acteOk });
await pageV.unroute('**/api/leo');
await pageV.route('**/api/leo', async (route) => {
  await new Promise((r) => setTimeout(r, 600));
  return route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { reponse: 'Je te propose ceci.', proposition: {
      outil: 'proposer_journal', args: { cible_ref: 'M. Lambert', texte: 'Appelé ce matin.' },
      reformulation: REFORMULATION, anneau: 'vert' } } }) }).catch(() => {});
});
await dicter('vert-ferme');
await pageV.keyboard.press('Escape');
await pageV.waitForTimeout(1500);
verifier('S3 — cartouche fermé avant la réponse : zéro journal, zéro acte',
  sequence.length === 0 && await pageV.locator('.leo-voile').count() === 0, sequence.join(' → '));

// C15. S4 — deux enrichissements de suite : le second PORTE le premier.
const IDEE_ID = 'cccccccc-0000-4000-8000-000000000001';
const corpsPatch = [];
await pageV.unroute('**/api/leo/ecritures');
await pageV.route('**/api/leo/ecritures', (route) => route.fulfill({ status: 200,
  contentType: 'application/json', body: JSON.stringify({ ok: true, data: { traceId: TRACE } }) }));
await pageV.route('**/api/idees/items', (route) => {
  corpsPatch.push(route.request().postDataJSON());
  return route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { id: IDEE_ID } }) });
});
await pageV.evaluate((id) => {
  document.querySelectorAll('.leo-voile').forEach((v) => v.remove());
  window.UltimaLeo.accueillirQuadrant({
    quadrant: 'enrichir', blason: 'boussole', salutation: 'Scénario enrichissement.',
    sections: [{ titre: 'Où on en est', lignes: ['—'] }],
    voix: { quadrant: 'adramelech', jeton: 'jeton-de-test',
      candidats: { idees: [{ id, libelle: 'Atelier bois', essence: 'E0' }] } }
  });
}, IDEE_ID);
for (const ajout of ['A1', 'A2']) {
  await pageV.unroute('**/api/leo');
  // ORANGE depuis le 02/10 (choix ① de Paul) : la carte, puis Confirmer.
  await stubberLeoAvecProposition({ outil: 'proposer_enrichissement_idee',
    args: { idee_ref: 'Atelier bois', ajout },
    reformulation: 'Enrichir l’idée « Atelier bois » avec : « ' + ajout + ' »', anneau: 'orange' });
  const avant = corpsPatch.length;
  await pageV.locator('.leo-voix-champ').fill('Enrichis Atelier bois : ' + ajout);
  await pageV.locator('.leo-voix-envoyer').click();
  await pageV.locator('.leo-carte-confirmer').click({ timeout: 5000 });
  for (let i = 0; i < 60 && corpsPatch.length === avant; i++) await pageV.waitForTimeout(50);
  await pageV.waitForFunction(() => !document.querySelector('.leo-voix-champ')?.disabled, { timeout: 5000 });
}
verifier('S4 — le second enrichissement porte le premier (rien n’est effacé)',
  corpsPatch.length === 2 && corpsPatch[1]?.essence === 'E0\n\nA1\n\nA2',
  JSON.stringify(corpsPatch.map((c) => c.essence)));

// C15 bis. Une idée créée devient une cible sans rechargement.
await pageV.evaluate(() => {
  document.querySelectorAll('.leo-voile').forEach((v) => v.remove());
  window.UltimaLeo.accueillirQuadrant({ quadrant: 'creation', blason: 'boussole', salutation: 'Création.',
    sections: [{ titre: 'État', lignes: ['—'] }],
    voix: { quadrant: 'adramelech', jeton: 'jeton-de-test', candidats: { idees: [], prochainAdrNum: 100 } } });
});
for (const proposition of [
  { outil: 'proposer_idee', args: { titre: 'Atelier nouveau', resume: 'Base' }, reformulation: 'Créer Atelier nouveau', anneau: 'vert' },
  { outil: 'proposer_enrichissement_idee', args: { idee_ref: 'Atelier nouveau', ajout: 'Suite' }, reformulation: 'Enrichir Atelier nouveau', anneau: 'orange' }
]) {
  await pageV.unroute('**/api/leo');
  await stubberLeoAvecProposition(proposition);
  const avant = corpsPatch.length;
  await pageV.locator('.leo-voix-champ').fill('Action explicite');
  await pageV.locator('.leo-voix-envoyer').click();
  if (proposition.anneau === 'orange') await pageV.locator('.leo-carte-confirmer').click({ timeout: 5000 });
  await pageV.waitForFunction(() => !document.querySelector('.leo-voix-champ')?.disabled, { timeout: 5000 });
  verifier('Création puis enrichissement : un appel sans rechargement', corpsPatch.length === avant + 1);
}
verifier('Nouvelle idée : essence initiale conservée', corpsPatch.at(-1)?.essence === 'Base\n\nSuite');

// C16. Écho d'issue BORNÉ : une page longue écrite sans clic ne bloque pas le
// tour suivant (le serveur refuse tout message > 4 000 caractères).
const LONGUE = 'Noter au journal de « M. Lambert » : « ' + 'x'.repeat(5000) + ' »';
await stubberVert({ ouverture: ouvertureOk, acte: acteOk });
await pageV.unroute('**/api/leo');
await stubberLeoAvecProposition({ outil: 'proposer_journal',
  args: { cible_ref: 'M. Lambert', texte: 'Appelé ce matin.' }, reformulation: LONGUE, anneau: 'vert' });
await dicter('vert-long');
await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
const bulleLongue = (await pageV.locator('.leo-bulle-issue').textContent()) || '';
const tourSuivant = [];
await pageV.unroute('**/api/leo');
await pageV.route('**/api/leo', (route) => {
  tourSuivant.push(route.request().postDataJSON());
  return route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { reponse: 'Bien noté.' } }) });
});
await pageV.locator('.leo-voix-champ').fill('Merci.');
await pageV.locator('.leo-voix-envoyer').click();
for (let i = 0; i < 60 && tourSuivant.length === 0; i++) await pageV.waitForTimeout(50);
const echos = (tourSuivant[0]?.messages || []).filter((m) => /^\[Fait sans demander/.test(m.content));
verifier('Écho borné : Paul voit tout dans la bulle', bulleLongue.length > 5000, String(bulleLongue.length));
// Verrou de non-vacuité : l'écho existe bien dans le tour suivant.
verifier('Écho borné : le tour suivant porte l’écho, sous 4 000 caractères',
  echos.length === 1 && echos[0].content.length <= 1000 && echos[0].content.endsWith('…]') &&
  (tourSuivant[0]?.messages || []).every((m) => m.content.length <= 4000),
  String(echos[0]?.content.length));

// ===================== C17. B1 ⑤ — le défaire, joué dans la bulle (cadrage §15) =====================
// Le bouton vit sur la bulle « Fait sans demander », et nulle part ailleurs
// dans le cartouche. Un clic, une requête `{ etape: 'defaire', traceId }` —
// jamais une cible, jamais un outil : le serveur relit la trace.
let cloreRepondu = 0;
let defaireArrive = 0;
async function routerEcritures({ defaire, cloreDelai = 0 }) {
  await pageV.unroute('**/api/leo/ecritures');
  await pageV.route('**/api/leo/ecritures', async (route) => {
    const corps = route.request().postDataJSON();
    corpsEcritures.push(corps);
    sequence.push(corps.etape);
    if (corps.etape === 'ouvrir') return ouvertureOk(route);
    if (corps.etape === 'defaire') { defaireArrive = Date.now(); return defaire(route); }
    if (cloreDelai) await new Promise((r) => setTimeout(r, cloreDelai));
    cloreRepondu = Date.now();
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { traceId: TRACE, issue: corps.issue } }) }).catch(() => {});
  });
}
const defaitOk = (route) => route.fulfill({ status: 200, contentType: 'application/json',
  body: JSON.stringify({ ok: true, data: { traceId: TRACE, defaite: true, journalise: true } }) });
const boutonDefaire = () => pageV.waitForSelector('.leo-bulle-issue .leo-defaire', { timeout: 5000 })
  .then(() => true, () => false);

// C17a. Nominal : un clic → la requête exacte, la bulle devient « Défait », le focus la suit.
await stubberVert({ ouverture: ouvertureOk, acte: acteOk });
await routerEcritures({ defaire: defaitOk });
await dicter('defaire-ok');
const aBouton = await boutonDefaire();
for (let i = 0; i < 50 && !sequence.includes('clore'); i++) await pageV.waitForTimeout(50);
if (aBouton) await pageV.locator('.leo-bulle-issue .leo-defaire').click();
await pageV.waitForSelector('.leo-bulle-issue[data-etat="defait"]', { timeout: 5000 }).catch(() => {});
verifier('B1 ⑤ — Défaire : UNE requête, exactement { etape, traceId }',
  aBouton && JSON.stringify(corpsEcritures.at(-1)) === JSON.stringify({ etape: 'defaire', traceId: TRACE }) &&
  sequence.filter((x) => x === 'defaire').length === 1, JSON.stringify(corpsEcritures.at(-1)));
verifier('B1 ⑤ — Défaire ne rejoue aucun acte', sequence.filter((x) => x === 'acte').length === 1,
  sequence.join(' → '));
const apresDefaire = await pageV.evaluate(() => {
  const b = document.querySelector('.leo-bulle-issue');
  return { etat: b?.getAttribute('data-etat'), texte: b?.querySelector('.leo-bulle-texte')?.textContent || '',
    bouton: !!b?.querySelector('.leo-defaire'), focus: document.activeElement === b };
});
verifier('B1 ⑤ — la bulle dit « Défait », sans bouton', apresDefaire.etat === 'defait' && !apresDefaire.bouton &&
  apresDefaire.texte.startsWith('[Défait : ' + REFORMULATION), apresDefaire.texte);
verifier('B1 ⑤ — le focus va à la bulle devenue « Défait » (pas à la page)', apresDefaire.focus);
// Léo l'apprend au tour suivant.
const tourApres = [];
await pageV.unroute('**/api/leo');
await pageV.route('**/api/leo', (route) => {
  tourApres.push(route.request().postDataJSON());
  return route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { reponse: 'Entendu.' } }) });
});
await pageV.locator('.leo-voix-champ').fill('Merci.');
await pageV.locator('.leo-voix-envoyer').click();
for (let i = 0; i < 60 && tourApres.length === 0; i++) await pageV.waitForTimeout(50);
verifier('B1 ⑤ — Léo apprend le défaire au tour suivant',
  (tourApres[0]?.messages || []).some((m) => m.content === '[Paul a défait : ' + REFORMULATION + ']'));

// C17b. Un clic AVANT la fin de la clôture : le défaire l'attend (sinon « rien à défaire »).
// ⛔ Les deux instants sont REMIS À ZÉRO, et on attend la clôture avant de
// juger : un premier jet lisait les valeurs du cas précédent, et restait vert
// sur un code qui n'attendait plus rien (sabotage du 02/10).
await stubberVert({ ouverture: ouvertureOk, acte: acteOk });
await routerEcritures({ defaire: defaitOk, cloreDelai: 700 });
cloreRepondu = 0;
defaireArrive = 0;
await dicter('defaire-rapide');
if (await boutonDefaire()) await pageV.locator('.leo-bulle-issue .leo-defaire').click();
await pageV.waitForSelector('.leo-bulle-issue[data-etat="defait"]', { timeout: 5000 }).catch(() => {});
for (let i = 0; i < 40 && cloreRepondu === 0; i++) await pageV.waitForTimeout(50);
verifier('B1 ⑤ — le défaire part APRÈS la réponse de la clôture',
  cloreRepondu > 0 && defaireArrive > 0 && defaireArrive >= cloreRepondu, `${defaireArrive - cloreRepondu} ms`);

// C17c. Refus : une flamme est née dessus → Léo le dit, RIEN n'a été retiré.
for (const [nom, defaire, attendu] of [
  ['lié', (route) => route.fulfill({ status: 409, contentType: 'application/json',
    body: JSON.stringify({ ok: false, error: 'Lié : flammes' }) }), 'une flamme y est née depuis'],
  ['retouché', (route) => route.fulfill({ status: 409, contentType: 'application/json',
    body: JSON.stringify({ ok: false, error: 'Retouchée depuis' }) }), 'tu l’as retouché depuis'],
  ['perdu', (route) => route.abort('failed'), 'Je ne sais pas si c’est défait'],
  // Un message serveur inconnu n'est JAMAIS recopié tel quel.
  ['inconnu', (route) => route.fulfill({ status: 409, contentType: 'application/json',
    body: JSON.stringify({ ok: false, error: '<b>injecté</b>' }) }), 'Je n’ai pas pu le défaire. Rien n’a été retiré.']
]) {
  await stubberVert({ ouverture: ouvertureOk, acte: acteOk });
  await routerEcritures({ defaire });
  await dicter('defaire-' + nom);
  if (await boutonDefaire()) await pageV.locator('.leo-bulle-issue .leo-defaire').click();
  await pageV.waitForSelector('.leo-bulle-issue:not([data-etat="fait"])', { timeout: 5000 }).catch(() => {});
  const refus = await pageV.evaluate(() => {
    const b = document.querySelector('.leo-bulle-issue');
    const leo = [...document.querySelectorAll('.leo-bulle-leo')].at(-1);
    return { etat: b?.getAttribute('data-etat'), texte: b?.querySelector('.leo-bulle-texte')?.textContent || '',
      bouton: !!b?.querySelector('.leo-defaire'), leo: leo?.textContent || '', focus: document.activeElement === leo,
      html: leo?.innerHTML || '' };
  });
  verifier('B1 ⑤ — refus ' + nom + ' : Léo le dit, la bulle garde « Fait sans demander », plus de bouton',
    refus.etat !== 'fait' && refus.etat !== 'defait' && !refus.bouton &&
    refus.texte.startsWith('[Fait sans demander') && refus.leo.includes(attendu) && refus.focus &&
    !refus.html.includes('<b>'), JSON.stringify(refus));
}

// C17c bis. Le double clic (revue F4) : une seule requête, et la bulle reste
// « Défait » — pas de bulle de refus ajoutée par un doublon.
{
  let n = 0;
  await stubberVert({ ouverture: ouvertureOk, acte: acteOk });
  await routerEcritures({ defaire: async (route) => {
    n += 1;
    await new Promise((r) => setTimeout(r, 400));
    return n === 1 ? defaitOk(route) : route.fulfill({ status: 404, contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'Cible introuvable' }) });
  } });
  await dicter('defaire-double');
  const bullesLeoAvant = await pageV.locator('.leo-bulle-leo').count();
  if (await boutonDefaire()) await pageV.locator('.leo-bulle-issue .leo-defaire').dblclick();
  await pageV.waitForTimeout(1200);
  const etatDouble = await pageV.evaluate(() => document.querySelector('.leo-bulle-issue')?.getAttribute('data-etat'));
  verifier('B1 ⑤ — double clic : UNE requête, la bulle reste « Défait », aucun refus ajouté',
    sequence.filter((x) => x === 'defaire').length === 1 && etatDouble === 'defait' &&
    await pageV.locator('.leo-bulle-leo').count() === bullesLeoAvant,
    `${sequence.join(' → ')} · ${etatDouble}`);
}

// C17d. Une réussite sans cible lisible : pas de bouton (le serveur refuserait).
await stubberVert({ ouverture: ouvertureOk, acte: (route) => route.fulfill({ status: 200,
  contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }) });
await routerEcritures({ defaire: defaitOk });
await dicter('defaire-sans-cible');
await pageV.waitForSelector('.leo-bulle-issue', { timeout: 5000 });
await pageV.waitForTimeout(150);
verifier('B1 ⑤ — sans cible lisible, aucun bouton « Défaire »',
  /Fait sans demander/.test((await pageV.locator('.leo-bulle-issue').textContent()) || '') &&
  await pageV.locator('.leo-bulle-issue .leo-defaire').count() === 0);

// C17e. L'idée défaite quitte la mémoire de la page : le tour suivant ne la vise plus.
const IDEE_DEFAITE = 'cccccccc-0000-4000-8000-0000000000de';
await pageV.unroute('**/api/idees/items');
await pageV.route('**/api/idees/items', (route) => route.fulfill({ status: 200, contentType: 'application/json',
  body: JSON.stringify({ ok: true, data: { id: IDEE_DEFAITE } }) }));
await pageV.evaluate(() => {
  document.querySelectorAll('.leo-voile').forEach((v) => v.remove());
  window.__candidatsDefaire = { idees: [], prochainAdrNum: 200 };
  window.UltimaLeo.accueillirQuadrant({ quadrant: 'defaire-idee', blason: 'boussole', salutation: 'Défaire.',
    sections: [{ titre: 'État', lignes: ['—'] }],
    voix: { quadrant: 'adramelech', jeton: 'jeton-de-test', candidats: window.__candidatsDefaire } });
});
sequence = []; corpsEcritures = [];
await routerEcritures({ defaire: defaitOk });
await pageV.unroute('**/api/leo');
await stubberLeoAvecProposition({ outil: 'proposer_idee', args: { titre: 'Idée à défaire' },
  reformulation: 'Créer l’idée « Idée à défaire »', anneau: 'vert' });
await pageV.locator('.leo-voix-champ').fill('Capture une idée Idée à défaire');
await pageV.locator('.leo-voix-envoyer').click();
await boutonDefaire();
const avantDefaire = await pageV.evaluate((id) => window.__candidatsDefaire.idees.some((i) => i.id === id), IDEE_DEFAITE);
await pageV.locator('.leo-bulle-issue .leo-defaire').click().catch(() => {});
await pageV.waitForSelector('.leo-bulle-issue[data-etat="defait"]', { timeout: 5000 }).catch(() => {});
const apresDefaireIdee = await pageV.evaluate((id) => window.__candidatsDefaire.idees.some((i) => i.id === id), IDEE_DEFAITE);
// Non-vacuité : l'idée était bien devenue une cible AVANT le défaire.
verifier('B1 ⑤ — l’idée créée était une cible, et le défaire l’en retire', avantDefaire && !apresDefaireIdee,
  `${avantDefaire} → ${apresDefaireIdee}`);

verifier('Zéro erreur console (voix)', erreursVoix.length === 0, erreursVoix.slice(0, 3).join(' | '));
await pageV.close();

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE LÉO ACCUEIL VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
