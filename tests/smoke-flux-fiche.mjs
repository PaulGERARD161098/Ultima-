// Vérification des flux hybride v1×v2 : fiche → journal → pilotage relation.
// Mode démo forcé (config vidée) pour exercer les mutations locales sans réseau.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Cache local préparé par lancer.sh (fixture Leaflet npm, captures).
const SCRATCH = new URL('./.cache', import.meta.url).pathname;

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));

// Force le mode démo malgré la config réelle.
await page.addInitScript(() => {
  // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1200);

verdicts.modeDemo = !(await page.locator('#bandeau-demo').isHidden());

// LA CARTE EST SUPPRIMÉE (2026-08-13) : la fiche s'ouvrait depuis un marqueur
// Leaflet, elle s'ouvre désormais depuis une ÉTOILE. Le flux éprouvé ici —
// fiche, journal, pilotage — est le même ; seule la porte d'entrée a changé.
await page.locator('.barre-onglets button', { hasText: 'Ciel' }).click();
await page.waitForTimeout(800);

// Ouvre la fiche du nœud « Plomberie Roux » (3 relations dont une arrêtée).
// `dispatchEvent` : dans un volume, les zones de captation se chevauchent et
// une étoile devant en masque une autre (le pointage réel est couvert par
// smoke-ciel, `tapOuvreLaBonneFiche`).
const etoiles = page.locator('#ciel-scene .ciel-etoile[data-noeud-id]');
const n = await etoiles.count();
verdicts.etoiles = n;
let ficheTrouvee = false;
for (let i = 0; i < n; i++) {
  await etoiles.nth(i).dispatchEvent('click');
  await page.waitForTimeout(150);
  const titre = await page.locator('#panneau-titre').textContent();
  if (titre && titre.includes('Plomberie Roux')) { ficheTrouvee = true; break; }
}
verdicts.fichePlomberie = ficheTrouvee;

// GÉOMÉTRIE DE LA LIGNE DE RELATION (2026-08-13, 390 px). Le titre était
// écrasé par le select et les boutons, jusqu'à se casser une lettre par ligne.
// On mesure ce qui n'allait pas : la largeur réelle du texte, et la hauteur de
// la ligne. Un « ça a l'air bien » n'aurait rien attrapé — le défaut a vécu des
// semaines sous les yeux de tout le monde.
const ligneRelation = await page.evaluate(() => {
  const el = document.querySelector('.item-relation');
  const texte = document.querySelector('.item-relation-texte');
  if (!el || !texte) return null;
  return { hauteur: el.getBoundingClientRect().height,
           largeurTexte: texte.getBoundingClientRect().width };
});
verdicts.relationTexteRespirable = !!ligneRelation && ligneRelation.largeurTexte >= 150;
verdicts.relationLigneCompacte = !!ligneRelation && ligneRelation.hauteur <= 200;

// Journal : la fiche de Plomberie Roux doit voir l'entrée de la relation r1.
verdicts.entreesAvant = await page.locator('.entree-journal').count();

// Ajoute une entrée de journal sur le nœud avec relance.
await page.locator('.form-journal textarea').fill('Point fait avec Roux, devis en cours.');
await page.locator('.form-journal input[type="text"]').fill('Rappeler vendredi');
await page.locator('.form-journal input[type="date"]').fill('2026-07-11');
await page.locator('.form-journal button[type="submit"]').click();
await page.waitForTimeout(300);
verdicts.entreesApres = await page.locator('.entree-journal').count();
verdicts.relanceVisible = await page.locator('.entree-journal-relance').count();

// Coche « relance faite » sur la première relance.
await page.locator('.entree-journal-relance input[type="checkbox"]').first().check();
await page.waitForTimeout(200);
verdicts.relanceFaite = await page.locator('.entree-journal-relance.faite').count() >= 1;

// Pilotage : passe la première relation active à « Arrêté » (prompt de raison).
page.once('dialog', (d) => d.accept('Test de justification.'));
const selects = page.locator('.select-statut-relation');
verdicts.selectsPilotage = await selects.count();
const premierActif = selects.first();
await premierActif.selectOption('arrete');
await page.waitForTimeout(300);
verdicts.arretJustifieAffiche = (await page.locator('.item-relation-note', { hasText: 'Arrêt :' }).count()) >= 1;

// Refus d'arrêt sans raison : prompt annulé → statut inchangé + toast erreur.
page.once('dialog', (d) => d.dismiss());
const deuxieme = selects.nth(1);
const valeurAvant = await deuxieme.inputValue();
await deuxieme.selectOption('arrete');
await page.waitForTimeout(300);
verdicts.arretRefuseSansRaison = (await deuxieme.inputValue()) === valeurAvant;

await page.screenshot({ path: `${SCRATCH}/smoke2.png` });
console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs page:', erreurs.length ? erreurs : 'aucune');

const ok = verdicts.modeDemo && verdicts.fichePlomberie &&
  verdicts.entreesApres === verdicts.entreesAvant + 1 &&
  verdicts.relanceVisible >= 1 && verdicts.relanceFaite &&
  verdicts.selectsPilotage >= 2 && verdicts.arretJustifieAffiche &&
  verdicts.arretRefuseSansRaison && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE2 OK' : 'SMOKE2 ECHEC');
process.exit(ok ? 0 : 1);
