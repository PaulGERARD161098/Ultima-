// Dialogue avec Léo — étape A (maquette validée par Paul le 20/11/2026).
// Prouve : la réponse de Léo garde ses lignes, listes (numérotation de Léo
// comprise) et son gras ; ce que le modèle écrit en HTML reste du TEXTE
// (tentative d'injection) ; le champ accepte plusieurs lignes (Maj+Entrée)
// et Entrée envoie ; un long collage de Paul est replié sans être tronqué à
// l'envoi ; un seul bouton de sortie, « Fermer » ; zéro erreur de page.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

const REPONSE = [
  '**Décidé**',
  '1. Campagne de leads dans l’Allier',
  '2. Commission 50/50 sur le courtage',
  '',
  '**Actions**',
  '- Paul · prototype de contrat',
  '- <img src=x onerror="window.__pirate=1">',
  '### Ce que ça rapproche',
  '<script>window.__pirate=2</script> le contrat de partenariat',
  '5. numérotation reprise par Léo',
].join('\n');

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

for (const [largeur, hauteur] of [[1280, 860], [390, 844]]) {
  console.log(`— ${largeur} px —`);
  const page = await navigateur.newPage({ viewport: { width: largeur, height: hauteur } });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e)));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'ULTIMA_CONFIG', { value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
  });
  const requetes = [];
  let reponse = REPONSE;
  await page.route('**/api/leo', (route) => {
    requetes.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { reponse } }) });
  });
  await page.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
  await page.evaluate(() => {
    document.querySelectorAll('.leo-voile').forEach((v) => v.remove());
    window.sessionStorage.clear();
    window.UltimaLeo.accueillirQuadrant({
      quadrant: 'dialogue-a', blason: 'boussole', salutation: 'Scénario dialogue.',
      sections: [{ titre: 'Où on en est', lignes: ['—'] }],
      voix: { quadrant: 'riven', jeton: 'jeton-de-test' },
    });
  });
  const champ = page.locator('.leo-voix-champ');

  // 1. Un seul bouton de sortie, libellé « Fermer ».
  verifier('le bouton de sortie s’appelle « Fermer »', (await page.locator('#leo-partir').textContent())?.trim() === 'Fermer');

  // 1-bis. Étape B : un panneau latéral à droite, toute la hauteur, page visible
  // à gauche sur bureau ; plein écran sur téléphone ; « Fermer » en haut ; la
  // saisie dans l'écran.
  await page.waitForTimeout(300); // fin de l'animation d'entrée
  const g = await page.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const c = r('#leo-cartouche'), f = r('.leo-voix-formulaire'), x = r('#leo-partir');
    return { gauche: c.left, droite: c.right, haut: c.top, bas: c.bottom, largeur: c.width,
      vw: window.innerWidth, vh: window.innerHeight, formBas: f.bottom, fermerHaut: x.top };
  });
  verifier('panneau collé au bord droit, sur toute la hauteur',
    Math.abs(g.droite - g.vw) <= 1 && g.haut <= 1 && Math.abs(g.bas - g.vh) <= 1, JSON.stringify(g));
  verifier(largeur > 640 ? 'bureau : panneau ≤ 480 px, la page reste visible à gauche' : 'téléphone : panneau plein écran',
    largeur > 640 ? g.largeur <= 481 && g.gauche > 0 : Math.round(g.largeur) === g.vw, JSON.stringify(g));
  verifier('« Fermer » en haut du panneau', g.fermerHaut < 80, `${Math.round(g.fermerHaut)} px`);
  verifier('la saisie est dans l’écran', g.formBas <= g.vh, `${Math.round(g.formBas)} / ${g.vh}`);

  // 2. Champ multiligne : Maj+Entrée va à la ligne SANS envoyer, Entrée envoie.
  verifier('le champ est une zone de plusieurs lignes', await champ.evaluate((c) => c.tagName === 'TEXTAREA'));
  await champ.click();
  await page.keyboard.type('ligne une');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.type('ligne deux');
  verifier('Maj+Entrée : retour à la ligne, aucun envoi', (await champ.inputValue()).includes('\n') && requetes.length === 0);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.leo-bulle-leo:not(.leo-bulle-attente)', { timeout: 5000 });
  const envoye = requetes[0]?.messages?.at(-1)?.content || '';
  verifier('Entrée : envoyé avec ses deux lignes', envoye === 'ligne une\nligne deux', JSON.stringify(envoye));
  verifier('le message de Paul garde ses lignes à l’écran', await page.locator('.leo-bulle-paul').first()
    .evaluate((b) => getComputedStyle(b).whiteSpace === 'pre-wrap'));

  // 3. La réponse de Léo est mise en forme.
  const bulleLeo = page.locator('.leo-bulle-leo:not(.leo-bulle-attente)').last();
  const forme = await bulleLeo.evaluate((b) => ({
    gras: [...b.querySelectorAll('strong')].map((s) => s.textContent),
    ol: b.querySelectorAll('ol li').length,
    ul: b.querySelectorAll('ul li').length,
    titre: b.querySelector('.leo-md-titre')?.textContent || '',
    valeurs: [...b.querySelectorAll('ol li')].map((li) => li.value),
  }));
  verifier('le gras est rendu (pas d’astérisques)', forme.gras.includes('Décidé') && !(await bulleLeo.textContent()).includes('**'),
    JSON.stringify(forme.gras));
  verifier('liste numérotée et liste à puces rendues', forme.ol === 3 && forme.ul === 2, JSON.stringify(forme));
  verifier('la numérotation de Léo est gardée (1, 2… puis 5)', JSON.stringify(forme.valeurs) === '[1,2,5]', JSON.stringify(forme.valeurs));
  verifier('le titre « ### » est rendu', forme.titre === 'Ce que ça rapproche');

  // 4. ⛔ Injection : le HTML du modèle reste du texte, rien ne s'exécute.
  const injection = await bulleLeo.evaluate((b) => ({
    balises: b.querySelectorAll('img, script, iframe, a, [onerror]').length,
    texte: b.textContent.includes('<img src=x onerror=') && b.textContent.includes('<script>'),
    pirate: window.__pirate === undefined,
  }));
  verifier('⛔ aucune balise du modèle n’est créée', injection.balises === 0, JSON.stringify(injection));
  verifier('⛔ le HTML du modèle s’affiche comme du texte', injection.texte);
  verifier('⛔ aucun script du modèle ne s’exécute', injection.pirate);

  // 5. Une réponse d'une seule ligne reste un nœud texte (la bulle d'attente en dépend).
  reponse = 'Bien reçu.';
  await champ.fill('Merci.');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => [...document.querySelectorAll('.leo-bulle-leo:not(.leo-bulle-attente)')]
    .some((b) => b.textContent === 'Bien reçu.'), null, { timeout: 5000 });
  verifier('réponse d’une ligne : un seul nœud texte', await page.evaluate(() => {
    const b = [...document.querySelectorAll('.leo-bulle-leo')].at(-1);
    return b.childNodes.length === 1 && b.firstChild.nodeType === 3;
  }));

  // 6. Long collage : replié à l'écran, envoyé en entier.
  const colle = 'Notes de réunion. '.repeat(60);
  await champ.fill(colle);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.leo-bulle-collee', { timeout: 5000 });
  const repli = await page.locator('.leo-bulle-collee details').evaluate((d) => ({
    ouvert: d.open, resume: d.querySelector('summary').textContent,
  }));
  verifier('le collage est replié, avec sa longueur', !repli.ouvert && /Texte collé · .*caractères/.test(repli.resume), JSON.stringify(repli));
  verifier('le collage part en entier vers Léo', requetes.at(-1)?.messages?.some((m) => m.content === colle.trim()));

  // 6-bis. Conversation longue (revue Codex du 21/11) : c'est le FIL qui défile,
  // pas le panneau, et la dernière réponse arrive à l'écran sans geste de Paul.
  reponse = Array.from({ length: 18 }, (_, i) => `- ligne ${i + 1} de la réponse`).join('\n');
  for (let i = 0; i < 3; i++) {
    const avant = await page.locator('.leo-bulle-leo:not(.leo-bulle-attente)').count();
    await champ.fill('Question longue ' + i);
    await page.keyboard.press('Enter');
    await page.waitForFunction((n) => document.querySelectorAll('.leo-bulle-leo:not(.leo-bulle-attente)').length > n, avant, { timeout: 5000 });
  }
  const defile = await page.evaluate(() => {
    const c = document.getElementById('leo-cartouche'), d = document.querySelector('.leo-dialogue');
    const der = [...document.querySelectorAll('.leo-bulle-leo')].at(-1).getBoundingClientRect();
    return { panneau: c.scrollHeight > c.clientHeight + 1, fil: d.scrollHeight > d.clientHeight,
      derniere: der.bottom <= window.innerHeight + 1 && der.top >= 0 };
  });
  verifier('conversation longue : le fil défile, pas le panneau', defile.fil && !defile.panneau, JSON.stringify(defile));
  verifier('conversation longue : la dernière réponse est à l’écran', defile.derniere, JSON.stringify(defile));

  // 7. Rien ne déborde, et la page reste saine.
  verifier('rien ne déborde horizontalement', await page.evaluate(() => {
    const c = document.getElementById('leo-cartouche').getBoundingClientRect();
    return c.left >= 0 && c.right <= window.innerWidth && document.documentElement.scrollWidth <= window.innerWidth;
  }));
  verifier('zéro erreur de page', erreurs.length === 0, erreurs[0]);
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== smoke-leo-dialogue : TOUT VERT ===' : `\n=== smoke-leo-dialogue : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
