// Vérification boucle NB-2 : front du simulateur ABAQUE (abaque.html).
// Le moteur js/abaque.mjs est la SEULE source de calcul (importé par le module
// de page js/abaque-ui.js) — le front ne recode aucune formule.
// Prouve : page charge sans erreur console ni requête externe ; les résultats
// s'affichent ; changer le statut juridique (SASU → EI) change une valeur de
// charge affichée (exigence Paul) ; la courbe de trésorerie est rendue (SVG
// inline déterministe) ; contraste AA mesuré sur les couleurs réellement
// rendues ; responsive mobile (390×844, pas de scroll horizontal).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

async function ouvrir(viewport) {
  const page = await navigateur.newPage({ viewport });
  const journal = { erreurs: [], externes: [] };
  page.on('pageerror', (e) => journal.erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') journal.erreurs.push(m.text()); });
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) journal.externes.push(url);
  });
  await page.goto(`${BASE}/abaque.html`, { waitUntil: 'load', timeout: 20000 });
  // Le module calcule au chargement ; on attend qu'une valeur soit posée.
  await page.waitForFunction(() => {
    const n = document.getElementById('res-coussin');
    return n && n.textContent && n.textContent !== '—';
  }, { timeout: 10000 });
  return { page, journal };
}

// Contraste WCAG entre une couleur rendue (fill/color) et un jeton de fond.
function contraste(page, selecteur, propriete, jetonFond) {
  return page.evaluate(([sel, prop, jeton]) => {
    function lum(rgb) {
      const c = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    function parse(couleur) {
      const m = couleur.match(/rgba?\(([^)]+)\)/);
      if (m) { const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2]]; }
      const h = couleur.trim().replace('#', '');
      if (/^[0-9a-f]{6}$/i.test(h)) {
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      return null;
    }
    const el = document.querySelector(sel);
    if (!el) return 0;
    const texte = parse(getComputedStyle(el)[prop]);
    const fond = parse(getComputedStyle(document.documentElement).getPropertyValue(jeton));
    if (!texte || !fond) return 0;
    const l1 = lum(texte), l2 = lum(fond);
    return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
  }, [selecteur, propriete, jetonFond]);
}

// ============ 1. Chargement, rendu, en-tête, retour ============
console.log('— 1. Chargement mobile (390×844) : rendu, en-tête, retour —');
{
  const { page, journal } = await ouvrir({ width: 390, height: 844 });

  verifier('Titre ABAQUE (H1)', /Abaque/i.test((await page.locator('h1').textContent()) || ''));
  verifier('Blason balance dans le cartouche', (await page.locator('header.cartouche .blason-svg').count()) === 1);
  verifier('Lien retour « ← Ultima » vers ultima.html',
    (await page.locator('.retour-ultima').getAttribute('href')) === 'ultima.html');
  const boiteRetour = await page.locator('.retour-ultima').boundingBox();
  verifier('Tap target retour ≥ 44 px', Boolean(boiteRetour) && boiteRetour.height >= 44, `h: ${boiteRetour && boiteRetour.height}`);

  // Régime affiché (déduit du statut par regimeDirigeant()).
  const regime = (await page.locator('#regime-libelle').textContent()) || '';
  verifier('Régime dirigeant affiché (SASU → assimilé-salarié)', /assimil/i.test(regime), regime);

  // Résultats : des montants en euros, pas des tirets.
  for (const id of ['res-ms-chargee-mensuelle', 'res-ms-chargee-annuelle', 'res-cotisations', 'res-bfr', 'res-besoin', 'res-coussin']) {
    const t = (await page.locator('#' + id).textContent()) || '';
    verifier(`Résultat #${id} chiffré (€)`, /\d/.test(t) && /€/.test(t), t);
  }
  const seuil = (await page.locator('#res-seuil').textContent()) || '';
  verifier('Seuil de rentabilité chiffré', /\d/.test(seuil) && /€/.test(seuil), seuil);
  const pointMort = (await page.locator('#res-point-mort').textContent()) || '';
  verifier('Point mort renseigné (mois ou « non atteint »)', /mois|non atteint/i.test(pointMort), pointMort);

  // Avertissement horodaté.
  const avert = (await page.locator('#avertissement').textContent()) || '';
  verifier('Avertissement « non contractuel » présent', /non contractuel/i.test(avert), avert.slice(0, 60));
  const note = (await page.locator('#note-hypotheses').textContent()) || '';
  verifier('Hypothèses horodatées « à vérifier »', /à vérifier/.test(note) && /2026-07-22/.test(note), note.slice(0, 80));

  // Courbe de trésorerie rendue (SVG inline, ligne + point bas).
  verifier('SVG de courbe présent', (await page.locator('#courbe svg').count()) === 1);
  verifier('Ligne de trésorerie tracée', (await page.locator('#courbe svg .courbe-ligne').count()) === 1);
  verifier('Point bas marqué', (await page.locator('#courbe svg .courbe-pointbas').count()) === 1);
  const nbPoints = await page.locator('#courbe svg .courbe-point').count();
  verifier('Un point par mois (18 par défaut)', nbPoints === 18, `points: ${nbPoints}`);

  // Déterminisme : recharger → même SVG octet pour octet.
  const svg1 = await page.evaluate(() => document.querySelector('#courbe svg').outerHTML);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => {
    const n = document.getElementById('res-coussin');
    return n && n.textContent && n.textContent !== '—';
  }, { timeout: 10000 });
  const svg2 = await page.evaluate(() => document.querySelector('#courbe svg').outerHTML);
  verifier('Courbe déterministe (deux relevés identiques)', svg1 === svg2 && svg1.length > 0);

  // Contrastes AA sur les couleurs réellement rendues.
  const cVal = await contraste(page, '.res-valeur', 'color', '--ile');
  verifier('Contraste valeur de résultat ≥ 4,5:1', cVal >= 4.5, `${cVal}:1`);
  const cLib = await contraste(page, '.res-libelle', 'color', '--ile');
  verifier('Contraste libellé de résultat ≥ 4,5:1', cLib >= 4.5, `${cLib}:1`);
  const cLabel = await contraste(page, '.courbe-label', 'fill', '--parchemin');
  verifier('Contraste étiquette de courbe ≥ 4,5:1', cLabel >= 4.5, `${cLabel}:1`);
  const cLigne = await contraste(page, '.courbe-ligne', 'stroke', '--parchemin');
  verifier('Contraste ligne de courbe ≥ 3:1 (objet graphique)', cLigne >= 3, `${cLigne}:1`);
  const cBas = await contraste(page, '.courbe-label-bas', 'fill', '--parchemin');
  verifier('Contraste étiquette point bas ≥ 4,5:1', cBas >= 4.5, `${cBas}:1`);

  verifier('Pas de scroll horizontal (mobile 390 px)', await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth + 1));
  verifier('Zéro requête externe', journal.externes.length === 0, journal.externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SCRATCH}/abaque-mobile.png`, fullPage: true });
  await page.close();
}

// ============ 2. Statut vivant : SASU → EI change une charge affichée ============
console.log('— 2. Statut juridique vivant (SASU → EI) —');
{
  const { page, journal } = await ouvrir({ width: 1200, height: 900 });

  const cotisSasu = (await page.locator('#res-cotisations').textContent()) || '';
  const chargeeSasu = (await page.locator('#res-ms-chargee-mensuelle').textContent()) || '';

  await page.selectOption('#statutJuridique', 'ei');
  // Le recalcul est synchrone au 'change' ; on attend que la valeur diffère.
  await page.waitForFunction((avant) => {
    const n = document.getElementById('res-cotisations');
    return n && n.textContent && n.textContent !== avant;
  }, cotisSasu, { timeout: 5000 }).catch(() => {});

  const cotisEi = (await page.locator('#res-cotisations').textContent()) || '';
  const chargeeEi = (await page.locator('#res-ms-chargee-mensuelle').textContent()) || '';
  const regimeEi = (await page.locator('#regime-libelle').textContent()) || '';

  verifier('URSSAF/cotisations change avec le statut', cotisSasu !== cotisEi, `SASU=${cotisSasu} · EI=${cotisEi}`);
  verifier('Masse salariale chargée change avec le statut', chargeeSasu !== chargeeEi, `SASU=${chargeeSasu} · EI=${chargeeEi}`);
  verifier('Régime EI affiché « TNS »', /TNS/.test(regimeEi), regimeEi);
  verifier('Zéro erreur console (bascule statut)', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ============ 3. Scénarios + marge invalide (garde-fou) ============
console.log('— 3. Scénarios et garde-fou marge ≤ 0 —');
{
  const { page, journal } = await ouvrir({ width: 1200, height: 900 });

  // Scénario prudent : la marge cible passe à 28 %.
  await page.click('#scenario-prudent');
  await page.waitForTimeout(100);
  verifier('Scénario prudent applique marge 28 %', (await page.locator('#margeBruteCible').inputValue()) === '28');

  // Marge à 0 → garde-fou : alerte visible, seuil « marge invalide ».
  await page.fill('#margeBruteCible', '0');
  await page.waitForTimeout(100);
  verifier('Alerte marge invalide visible', await page.locator('#alerte-marge').isVisible());
  verifier('Seuil affiché « marge invalide »', /marge invalide/i.test((await page.locator('#res-seuil').textContent()) || ''));
  verifier('Zéro erreur console (marge 0)', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ============ 4. Arbitrage acheter/louer (NB-2b) ============
console.log('— 4. Arbitrage acheter / louer (règle de cash prioritaire) —');
{
  const { page, journal } = await ouvrir({ width: 1200, height: 900 });

  // Rendu de base : une recommandation + VAN + planchers + bascule chiffrés.
  const reco0 = (await page.locator('#arb-reco').textContent()) || '';
  verifier('Recommandation affichée (Louer/Acheter)', /Louer|Acheter/.test(reco0), reco0);
  for (const id of ['arb-van-achat', 'arb-van-location', 'arb-plancher-achat', 'arb-plancher-location']) {
    const t = (await page.locator('#' + id).textContent()) || '';
    verifier(`Arbitrage #${id} chiffré (€)`, /\d/.test(t) && /€/.test(t), t);
  }
  const motif0 = (await page.locator('#arb-motif').textContent()) || '';
  verifier('Motif de la recommandation affiché', motif0.length > 10, motif0.slice(0, 40));
  const bascule0 = (await page.locator('#arb-bascule').textContent()) || '';
  verifier('Durée de bascule renseignée', /mois|sans objet/.test(bascule0), bascule0);

  // Règle de cash prioritaire (le cœur VERTUMNE « louer le parc ») : trésorerie
  // confortable + achat massif → l'achat casse le plancher, la location le
  // préserve → reco « Louer » motivée par le cash, quel que soit le coût.
  await page.fill('#tresorerieInitiale', '1000000');
  await page.fill('#arb-montant', '2000000');
  await page.fill('#arb-loyer', '100');
  await page.waitForFunction(() =>
    /Louer/.test(document.getElementById('arb-reco').textContent || ''), { timeout: 5000 }).catch(() => {});
  const recoCash = (await page.locator('#arb-reco').textContent()) || '';
  const motifCash = (await page.locator('#arb-motif').textContent()) || '';
  const badgeReco = await page.locator('#arb-reco').getAttribute('data-reco');
  verifier('Achat massif + tréso confortable → « Louer »', /Louer/.test(recoCash), recoCash);
  verifier('Motif = contrainte de trésorerie', /trésorerie|plancher/i.test(motifCash), motifCash.slice(0, 60));
  verifier('Badge data-reco = louer', badgeReco === 'louer', String(badgeReco));
  const plancherAchatCash = (await page.locator('#arb-plancher-achat').textContent()) || '';
  verifier('Plancher si achat négatif (achat casse le cash)', /-/.test(plancherAchatCash), plancherAchatCash);

  // Contraste AA du badge de reco sur son fond (--ile).
  const cBadge = await contraste(page, '.arb-reco-badge', 'color', '--ile');
  verifier('Contraste badge de reco ≥ 4,5:1', cBadge >= 4.5, `${cBadge}:1`);

  verifier('Zéro erreur console (arbitrage)', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SCRATCH}/abaque-arbitrage.png`, fullPage: true });
  await page.close();
}

// ============ 5. Export / import JSON (scénario local, sans base) ============
console.log('— 5. Export / import JSON —');
{
  const page = await navigateur.newPage({ viewport: { width: 1200, height: 900 }, acceptDownloads: true });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  await page.goto(`${BASE}/abaque.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForFunction(() => {
    const n = document.getElementById('res-coussin');
    return n && n.textContent && n.textContent !== '—';
  }, { timeout: 10000 });

  // Une valeur distinctive, puis export → fichier téléchargé, parsé.
  await page.fill('#caMensuel', '77777');
  await page.waitForTimeout(80);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 8000 }),
    page.click('#exporter-json'),
  ]);
  const chemin = await download.path();
  const obj = JSON.parse(readFileSync(chemin, 'utf-8'));
  verifier('Export : fichier de type « abaque-scenario »', obj._type === 'abaque-scenario', obj._type);
  verifier('Export : hypothèse capturée (caMensuel)', String(obj.scalaires.caMensuel) === '77777', String(obj.scalaires.caMensuel));
  verifier('Export : lignes de main d’œuvre présentes', Array.isArray(obj.postes) && obj.postes.length >= 1);
  verifier('Export : actif d’arbitrage capturé', obj.arbitrage && 'arb-montant' in obj.arbitrage);

  // On change la valeur, puis on recharge le fichier → la valeur revient.
  await page.fill('#caMensuel', '10000');
  await page.waitForTimeout(50);
  const tmp = `${SCRATCH}/scenario-test.json`;
  writeFileSync(tmp, JSON.stringify(obj));
  await page.setInputFiles('#fichier-json', tmp);
  await page.waitForFunction(() => document.getElementById('caMensuel').value === '77777', { timeout: 5000 }).catch(() => {});
  verifier('Import : hypothèse restaurée (round-trip)', (await page.locator('#caMensuel').inputValue()) === '77777');
  verifier('Import : message de succès', /chargé/i.test((await page.locator('#io-message').textContent()) || ''));
  // Le recalcul a bien tourné après import (coussin chiffré).
  verifier('Import : recalcul effectué', /\d/.test((await page.locator('#res-coussin').textContent()) || ''));

  // Fichier non-scénario → message d'erreur, aucune casse.
  const mauvais = `${SCRATCH}/scenario-bad.json`;
  writeFileSync(mauvais, JSON.stringify({ foo: 1 }));
  await page.setInputFiles('#fichier-json', mauvais);
  await page.waitForTimeout(200);
  verifier('Import fichier non-scénario → erreur explicite',
    /non reconnu/i.test((await page.locator('#io-message').textContent()) || ''));

  verifier('Zéro erreur console (export/import)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE ABAQUE VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
