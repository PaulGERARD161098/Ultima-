// Dictée vocale par champ (v3-④) : couverture exacte, cycle nominal, ajout
// sans remplacement, interim, champ jamais bloqué, une écoute à la fois,
// erreurs typées, plafond, clavier/aria, découverte unique, API absente.
// L'API n'existe pas en headless : stub SpeechRecognition injecté AVANT le
// chargement, piloté par window.__stubReco (résultats, erreurs, fin).
// U6 : le harnais passe par python http.server (pas de middleware) → le header
// Permissions-Policy est vérifié par lecture du fichier middleware.js.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Cache local préparé par lancer.sh (fixture Leaflet npm, captures).
const SCRATCH = new URL('./.cache', import.meta.url).pathname;

const TOAST_DECOUVERTE = "Nouveau : touchez le micro d'un champ pour dicter.";

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const verdicts = {};
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

async function preparerRoutes(page) {
  // Force le mode démo malgré la config réelle.
  await page.addInitScript(() => {
  // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

// Stub Web Speech API : classe start/stop/abort + gestionnaires, instances
// auto-enregistrées dans window.__stubReco.instances. onstart est différé
// (setTimeout 0) pour pouvoir tester le double-tap avant démarrage.
function stubSpeechRecognition() {
  window.__stubReco = { instances: [] };
  class FauxSpeechRecognition {
    constructor() {
      this.lang = '';
      this.continuous = null;
      this.interimResults = null;
      this.maxAlternatives = null;
      this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null;
      this.appels = { start: 0, stop: 0, abort: 0 };
      this.termine = false;
      window.__stubReco.instances.push(this);
    }
    start() {
      this.appels.start += 1;
      setTimeout(() => { if (this.onstart) this.onstart(); }, 0);
    }
    stop() {
      this.appels.stop += 1;
      setTimeout(() => this.emettreFin(), 0);
    }
    abort() {
      this.appels.abort += 1;
      setTimeout(() => this.emettreFin(), 0);
    }
    emettreResultat(texte, estFinal) {
      const segment = [{ transcript: texte }];
      segment.isFinal = estFinal;
      if (this.onresult) this.onresult({ resultIndex: 0, results: [segment] });
    }
    emettreErreur(code) {
      if (this.onerror) this.onerror({ error: code });
      this.emettreFin();
    }
    emettreFin() {
      if (this.termine) return;
      this.termine = true;
      if (this.onend) this.onend();
    }
  }
  window.SpeechRecognition = FauxSpeechRecognition;
}

// ================= Run 1 : avec stub (contexte neuf, localStorage vierge) ===

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
const messagesConsole = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => {
  messagesConsole.push(m.text());
  if (m.type() === 'error') erreurs.push('console: ' + m.text());
});
await preparerRoutes(page);
await page.addInitScript(stubSpeechRecognition);

const nbInstances = () => page.evaluate(() => window.__stubReco.instances.length);
const emettre = ([texte, final]) => page.evaluate(([t, f]) => {
  const i = window.__stubReco.instances;
  i[i.length - 1].emettreResultat(t, f);
}, [texte, final]);
const emettreFin = () => page.evaluate(() => {
  const i = window.__stubReco.instances;
  i[i.length - 1].emettreFin();
});
// Depuis la relance (08/10), une coupure qui suit des mots ROUVRE l'écoute : la
// dictée ne se termine que lorsqu'une écoute s'achève sans rien entendre.
const finirParSilence = async () => {
  await emettreFin();
  await page.waitForTimeout(80);
  await emettreFin(); // l'écoute relancée se termine sans un mot : fin de la dictée
  await page.waitForTimeout(80);
};
const emettreErreur = (code) => page.evaluate((c) => {
  const i = window.__stubReco.instances;
  i[i.length - 1].emettreErreur(c);
}, code);

await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

// Ouvre une fiche via l'onglet Contacts (2 taps, comme Paul).
const ongletContacts = page.locator('.barre-onglets button', { hasText: 'Contacts' });
await ongletContacts.click();
await page.waitForTimeout(200);
await page.locator('.item-contact').first().click();
await page.waitForTimeout(300);

// 17a. Découverte : toast à la PREMIÈRE fiche.
const decouverte1 = (await page.locator('.toast').allTextContents()).includes(TOAST_DECOUVERTE);

// 1. couvertureExacte — les 4 champs couverts, les exclus sans micro.
const microJournalNote = page.locator('.form-journal textarea + button.bouton-micro');
const microJournalEtape = page.locator('.form-journal input[type="text"] + button.bouton-micro');
const partieJournal = (await microJournalNote.count()) === 1 && (await microJournalEtape.count()) === 1;
await page.locator('.actions-fiche button', { hasText: 'Modifier' }).click();
await page.waitForTimeout(200);
const microNotes = page.locator('#noeud-notes + button.bouton-micro');
const partieNotes = (await microNotes.count()) === 1 &&
  (await microNotes.getAttribute('aria-label')) === 'Dicter — Notes';
const exclusions = await page.evaluate(() =>
  ['contacts-recherche', 'noeud-nom', 'noeud-telephone', 'noeud-email', 'noeud-lat', 'champ-email']
    .every((id) => {
      const el = document.getElementById(id);
      return el && !el.closest('.champ-vocal');
    }));
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(200);
await page.locator('.actions-fiche button', { hasText: 'Relier' }).click();
await page.waitForTimeout(200);
const partieRelation = (await page.locator('#relation-notes + button.bouton-micro').count()) === 1;
await page.locator('#bouton-annuler-relation').click();
await page.waitForTimeout(200);
// La recherche du CIEL porte un micro en mode remplacement : capacité
// transférée depuis la recherche carte, supprimée le 2026-08-13 (elle en était
// le seul porteur, elle serait morte avec elle).
// Sans changer d'onglet : le micro est dans le document, visible ou non — et
// une navigation ici laisserait le harnais ailleurs qu'où la suite l'attend
// (défaut introduit puis corrigé le 2026-08-13).
const microCiel = page.locator('#ciel-recherche + button.bouton-micro');
const partieCiel = (await microCiel.count()) === 1 &&
  (await page.evaluate(() =>
    document.getElementById('ciel-recherche').dataset.dicteeMode === 'remplacement'));
verdicts.couvertureExacte = partieJournal && partieNotes && exclusions && partieRelation &&
  partieCiel;

// 13. tapTarget44 — cibles ≥ 44×44 au viewport 390, texte jamais sous le bouton.
const boiteNote = await microJournalNote.boundingBox();
const boiteEtape = await microJournalEtape.boundingBox();
const paddings = await page.evaluate(() => {
  const note = document.querySelector('.form-journal textarea');
  const etape = document.querySelector('.form-journal input[type="text"]');
  return [note, etape].map((el) => parseFloat(getComputedStyle(el).paddingRight));
});
verdicts.tapTarget44 = [boiteNote, boiteEtape].every((b) => b && b.width >= 44 && b.height >= 44) &&
  paddings.every((p) => p >= 48);

// 3 + 4. reglagesFr et cycleNominal sur la textarea du journal.
const champNote = page.locator('.form-journal textarea');
const champEtape = page.locator('.form-journal input[type="text"]');
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
verdicts.reglagesFr = await page.evaluate(() => {
  const i = window.__stubReco.instances;
  const r = i[i.length - 1];
  return r.lang === 'fr-FR' && r.continuous === false && r.interimResults === true;
});
const enEcoute = (await microJournalNote.getAttribute('aria-pressed')) === 'true';
const statutEcoute = (await page.locator('#statut-dictee').textContent()).includes('Je vous écoute…');
await emettre(['devis envoyé ce matin', true]);
const valeurFinale = (await champNote.inputValue()) === 'devis envoyé ce matin';
await finirParSilence();
await page.waitForTimeout(80);
verdicts.cycleNominal = enEcoute && statutEcoute && valeurFinale &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'false' &&
  (await page.locator('#statut-dictee').textContent()) === 'Dictée terminée.';

// 5. ajoutJamaisRemplacement — la dictée AJOUTE (espace unique).
await champNote.fill('Déjà noté.');
await microJournalNote.click();
await page.waitForTimeout(80);
await emettre(['suite', true]);
await finirParSilence();
await page.waitForTimeout(80);
verdicts.ajoutJamaisRemplacement = (await champNote.inputValue()) === 'Déjà noté. suite';

// 6. interimVisible — l'interim s'affiche puis est remplacé par le final.
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
await emettre(['devis en', false]);
const interimAffiche = (await champNote.inputValue()).endsWith('devis en');
await emettre(['devis envoyé', true]);
const finalRemplace = (await champNote.inputValue()) === 'devis envoyé';
await finirParSilence();
await page.waitForTimeout(80);
verdicts.interimVisible = interimAffiche && finalRemplace;

// 7. champJamaisBloque — jamais disabled/readonly ; la frappe reprend la main.
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
await emettre(['devis en', false]);
const jamaisBloque = await page.evaluate(() => {
  const t = document.querySelector('.form-journal textarea');
  return t.disabled === false && t.readOnly === false;
});
await champNote.press('x');
await page.waitForTimeout(80);
const abortAppele = await page.evaluate(() => {
  const i = window.__stubReco.instances;
  return i[i.length - 1].appels.abort === 1;
});
verdicts.champJamaisBloque = jamaisBloque && abortAppele &&
  (await champNote.inputValue()) === 'x' &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'false';

// 8. doubleTapSansDoublon — re-tap = stop + une seule insertion ; double-tap
// nerveux avant onstart = une seule instance démarrée.
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
await emettre(['note unique', true]);
await microJournalNote.click(); // re-tap pendant l'écoute
await page.waitForTimeout(80);
const stopApresRetap = await page.evaluate(() => {
  const i = window.__stubReco.instances;
  return i[i.length - 1].appels.stop === 1;
});
const uneInsertion = (await champNote.inputValue()) === 'note unique';
const instancesAvant = await nbInstances();
await page.evaluate(() => {
  const b = document.querySelector('.form-journal textarea + button.bouton-micro');
  b.click(); b.click(); // double-tap synchrone, avant l'onstart différé
});
await page.waitForTimeout(80);
const uneSeuleDemarree = (await nbInstances()) === instancesAvant + 1 &&
  (await page.evaluate(() => {
    const i = window.__stubReco.instances;
    return i[i.length - 1].appels.start === 1;
  }));
await emettreFin();
await page.waitForTimeout(80);
verdicts.doubleTapSansDoublon = stopApresRetap && uneInsertion && uneSeuleDemarree;

// 9. uneEcouteALaFois — B démarre, A s'arrête ; jamais deux boutons pressés.
await champNote.fill('');
await champEtape.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
const indexA = (await nbInstances()) - 1;
await microJournalEtape.click();
const pressesApresTap = await page.evaluate(() =>
  document.querySelectorAll('.bouton-micro[aria-pressed="true"]').length);
await page.waitForTimeout(80);
const bascule = await page.evaluate((iA) => {
  const inst = window.__stubReco.instances;
  return inst[iA].appels.stop >= 1 && inst.length === iA + 2 && inst[iA + 1].appels.start === 1;
}, indexA);
verdicts.uneEcouteALaFois = pressesApresTap === 1 && bascule &&
  (await microJournalEtape.getAttribute('aria-pressed')) === 'true' &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'false';
await emettreFin();
await page.waitForTimeout(80);

// 10. erreurPermission — toast exact, bouton au repos et re-cliquable.
await microJournalNote.click();
await page.waitForTimeout(80);
await emettreErreur('not-allowed');
await page.waitForTimeout(80);
const toastPermission = (await page.locator('.toast-erreur').last().textContent()) ===
  'Micro refusé. Autorisez le micro dans les réglages du navigateur, ou tapez votre texte.';
const reposApresErreur = (await microJournalNote.getAttribute('aria-pressed')) === 'false';
const instancesAvantRetente = await nbInstances();
await microJournalNote.click();
await page.waitForTimeout(80);
const retente = (await nbInstances()) === instancesAvantRetente + 1 &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'true';
await emettreFin();
await page.waitForTimeout(80);
verdicts.erreurPermission = toastPermission && reposApresErreur && retente;

// 11. erreurSilence — toast exact, champ inchangé.
await champNote.fill('Bonjour.');
await microJournalNote.click();
await page.waitForTimeout(80);
await emettreErreur('no-speech');
await page.waitForTimeout(80);
verdicts.erreurSilence = (await page.locator('.toast-erreur').last().textContent()) ===
  "Je n'ai rien entendu. Touchez le micro et réessayez." &&
  (await champNote.inputValue()) === 'Bonjour.';

// 12. clavierEtAria — Tab depuis le champ → bouton, Entrée rejoue le cycle.
await champNote.fill('');
await champNote.focus();
await page.keyboard.press('Tab');
const focusSurMicro = await page.evaluate(() =>
  document.activeElement && document.activeElement.classList.contains('bouton-micro'));
await page.keyboard.press('Enter');
await page.waitForTimeout(80);
const ecouteClavier = (await microJournalNote.getAttribute('aria-pressed')) === 'true';
await emettre(['au clavier', true]);
await finirParSilence();
await page.waitForTimeout(80);
verdicts.clavierEtAria = focusSurMicro && ecouteClavier &&
  (await champNote.inputValue()) === 'au clavier' &&
  (await microJournalNote.getAttribute('aria-label')) === 'Dicter — Nouvelle entrée de journal' &&
  (await microJournalEtape.getAttribute('aria-label')) === 'Dicter — Prochaine étape';

// 15. plafondRespecte — maxlength 500 de « Prochaine étape » : tronqué + toast.
const remplissage = 'x'.repeat(495);
await champEtape.fill(remplissage);
await microJournalEtape.click();
await page.waitForTimeout(80);
await emettre(['aaaaaaaaaaaaaaaaaaaa', true]); // 20 caractères dictés
await page.waitForTimeout(50);
const toastPlafond = (await page.locator('.toast-erreur').last().textContent()) ===
  'Limite de texte atteinte.';
await finirParSilence();
await page.waitForTimeout(80);
const valeurPlafonnee = await champEtape.inputValue();
verdicts.plafondRespecte = toastPlafond && valeurPlafonnee.length === 500 &&
  valeurPlafonnee.startsWith(remplissage);

// 18. relanceApresPause (08/10) — la coupure qui suit des mots rouvre l'écoute :
// la suite s'écrit derrière, une espace entre les deux, et la dictée continue.
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
const avantRelance = await nbInstances();
await emettre(['premier', true]);
await emettreFin();
await page.waitForTimeout(80);
const relancee = (await nbInstances()) === avantRelance + 1 && // avantRelance compte déjà l'écoute initiale
  (await microJournalNote.getAttribute('aria-pressed')) === 'true';
await emettre(['second', true]);
const suiteEcrite = (await champNote.inputValue()) === 'premier second';
await finirParSilence();
verdicts.relanceApresPause = relancee && suiteEcrite &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'false' &&
  (await champNote.inputValue()) === 'premier second' &&
  (await page.locator('#statut-dictee').textContent()) === 'Dictée terminée.';

// 19. silenceApresRelance — le « no-speech » d'une écoute relancée clôt la dictée
// sans toast d'erreur : se taire n'est pas une faute.
await champNote.fill('');
const toastsAvantSilence = await page.locator('.toast-erreur').count();
await microJournalNote.click();
await page.waitForTimeout(80);
await emettre(['garde', true]);
await emettreFin();
await page.waitForTimeout(80);
await emettreErreur('no-speech');
await page.waitForTimeout(80);
verdicts.silenceApresRelance = (await page.locator('.toast-erreur').count()) <= toastsAvantSilence &&
  (await champNote.inputValue()) === 'garde' &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'false';

// 20. retapSansRelance — re-tap après des mots : arrêt, AUCUNE écoute rouverte.
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
await emettre(['fin voulue', true]);
const avantRetap = await nbInstances();
await microJournalNote.click();
await page.waitForTimeout(120);
verdicts.retapSansRelance = (await nbInstances()) === avantRetap &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'false' &&
  (await champNote.inputValue()) === 'fin voulue';

// 21. plafondRelances — un navigateur qui couperait sans fin : 40 relances, puis arrêt.
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
const debutBoucle = await nbInstances();
for (let k = 0; k < 45; k += 1) {
  if ((await microJournalNote.getAttribute('aria-pressed')) !== 'true') break;
  await emettre(['m', true]);
  await emettreFin();
  await page.waitForTimeout(20);
}
verdicts.plafondRelances = (await nbInstances()) - debutBoucle === 40 && // 40 relances après l'écoute initiale
  (await microJournalNote.getAttribute('aria-pressed')) === 'false';

// 22. reseauHorsLigne — sans réseau : message exact, texte déjà dicté conservé.
await champNote.fill('');
await microJournalNote.click();
await page.waitForTimeout(80);
await emettre(['avant coupure', true]);
await emettreErreur('network');
await page.waitForTimeout(80);
verdicts.reseauHorsLigne = (await page.locator('.toast-erreur').last().textContent()) ===
  'Pas de réseau : la dictée du navigateur en a besoin. Votre texte est gardé ; utilisez le micro du clavier.' &&
  (await champNote.inputValue()) === 'avant coupure' &&
  (await microJournalNote.getAttribute('aria-pressed')) === 'false';

// 16. U6-headerMicro — vérifié par lecture du fichier (le serveur statique du
// harnais ne passe pas par le middleware Vercel).
const middleware = readFileSync(new URL('../middleware.js', import.meta.url), 'utf8');
verdicts.u6HeaderMicro = middleware.includes('microphone=(self)') &&
  middleware.includes('camera=()') && middleware.includes('geolocation=()') &&
  middleware.includes('payment=()');

// 17b. Découverte : rechargement (même contexte, localStorage conservé) →
// le toast ne réapparaît pas.
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(800);
await ongletContacts.click();
await page.waitForTimeout(200);
await page.locator('.item-contact').first().click();
await page.waitForTimeout(500);
const decouverte2 = !(await page.locator('.toast').allTextContents()).includes(TOAST_DECOUVERTE);

// 14. zeroFuiteConsole — aucune transcription du test dans la console (PII).
verdicts.zeroFuiteConsole = messagesConsole.every((t) => !t.includes('devis') && !t.includes('suite'));

await page.screenshot({ path: `${SCRATCH}/dictee-390.png` });
await page.close();

// ================= Run 2 : API ABSENTE (Firefox…) — zéro bouton, zéro bruit ==

const contexte2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page2 = await contexte2.newPage();
const erreurs2 = [];
page2.on('pageerror', (e) => erreurs2.push('pageerror: ' + e.message));
page2.on('console', (m) => { if (m.type() === 'error') erreurs2.push('console: ' + m.text()); });
await preparerRoutes(page2);
await page2.addInitScript(() => {
  // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  window.SpeechRecognition = undefined;
  window.webkitSpeechRecognition = undefined;
});
await page2.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page2.waitForTimeout(1000);
await page2.locator('.barre-onglets button', { hasText: 'Contacts' }).click();
await page2.waitForTimeout(200);
await page2.locator('.item-contact').first().click();
await page2.waitForTimeout(500);
await page2.locator('.actions-fiche button', { hasText: 'Modifier' }).click();
await page2.waitForTimeout(200);
const decouverte3 = !(await page2.locator('.toast').allTextContents()).includes(TOAST_DECOUVERTE);
verdicts.apiAbsente = (await page2.locator('[aria-label^="Dicter"]').count()) === 0 &&
  (await page2.locator('.bouton-micro').count()) === 0 && erreurs2.length === 0;
verdicts.decouverteUnique = decouverte1 && decouverte2 && decouverte3;
await contexte2.close();

// ================= Bilan ====================================================

console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-DICTEE OK' : 'SMOKE-DICTEE ECHEC');
process.exit(ok ? 0 : 1);
