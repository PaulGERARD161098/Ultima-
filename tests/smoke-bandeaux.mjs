// LES BANDEAUX ET LES MESSAGES — critique impeccable du 26/09 (§24 du cadrage).
//
// Paul : « corrige les bandeaux et les messages, pas le fond de carte stellaire
// ni les étoiles ». Ce harnais tient chaque constat RETENU de la critique, sur
// l'accueil tel que Paul le voit (session, agrégat Finubar, dock de Léo), au
// bureau (1440 × 900) et au téléphone à la hauteur réelle de Safari (390 × 664).
//
// ⛔ Vu rouge sur le code d'avant. Chaque recherche d'absence a son verrou :
// le bandeau est peint, le dock est proactif, le panneau est ouvert.
//
// ⚠️ LE DOCK EST MONTÉ PAR LE HARNAIS (même raison que `smoke-socle`) : sa
// condition de montage exige une vraie session Supabase.
import { chromium } from 'playwright';
import { AGREGAT } from '../design/preview-accueil-finubar-fixture.mjs';

const BASE = 'http://127.0.0.1:8123';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
const verdicts = {};
const chiffres = {};
function verifier(nom, condition, detail = '') {
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

async function ouvrir([largeur, hauteur], chemin = 'index.html') {
  const telephone = largeur < 700;
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, hasTouch: telephone, isMobile: telephone });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${largeur} ${chemin} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${largeur} ${chemin} console: ${m.text()}`); } });
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
  await page.route('**/api/cockpit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/finubar', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: AGREGAT }) }));
  await page.goto(`${BASE}/${chemin}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
  await page.evaluate(() => {
    const el = document.getElementById('ecran-connexion');
    if (el) { el.hidden = true; el.style.display = 'none'; }
    const s = document.querySelector('.boussole-scene');
    if (s) { s.removeAttribute('inert'); }
  });
  await page.evaluate(() => window.UltimaCielNoeud && window.UltimaCielNoeud.poserSession('jeton-d-essai'));
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const m = await import('/js/leo-navigation.mjs');
    const b = document.createElement('button');
    document.body.appendChild(b);
    m.monterNavigationLeo({ bouton: b });
  });
  await page.waitForTimeout(1500);
  return { page, contexte, telephone };
}

// Ce que le doigt atteint vraiment : la boîte ET le centre (leçon du 26/09).
const cible = (page, sel) => page.evaluate((sel) => [...document.querySelectorAll(sel)].map((el) => {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const vu = r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
  const d = vu ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
  return { h: Math.round(r.height), w: Math.round(r.width), vu, atteint: !!d && (d === el || el.contains(d)), texte: el.textContent.trim().slice(0, 20) };
}).filter((x) => x.vu), sel);

// ===========================================================================
for (const taille of [[1440, 900], [390, 664]]) {
  const { page, contexte, telephone } = await ouvrir(taille);
  const cle = telephone ? 'téléphone' : 'bureau';

  // ---- LÉO SEUL EN BAS (Paul, 08/10/2026) ----
  // « Supprime le bandeau du bas et le bandeau sur Alpha — tu gardes que le
  // bandeau Léo, tout en bas. » Le bandeau Finubar est retiré, la parole n'est
  // plus peinte, et le dock est la pièce la plus basse de l'écran. Verrou : le
  // dock est monté (sinon « rien en bas » serait vert sur une page vide).
  const socle = await page.evaluate(() => {
    const d = document.getElementById('leo-dock');
    const rd = d ? d.getBoundingClientRect() : null;
    const parole = document.getElementById('boussole-parole');
    const rp = parole ? parole.getBoundingClientRect() : null;
    // Toute autre pièce FIXE peinte sous le haut du dock lui ferait concurrence.
    const concurrents = rd ? [...document.querySelectorAll('body *')].filter((el) => {
      if (el === d || d.contains(el) || el.contains(d)) { return false; }
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') { return false; }
      const r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 12 && r.height < window.innerHeight * 0.5 && r.bottom > rd.top;
    }).map((el) => el.id || el.className) : [];
    return { dock: Boolean(d), bandeau: Boolean(document.getElementById('finubar-bandeau')),
      ecartBas: rd ? Math.round(window.innerHeight - rd.bottom) : null,
      parole: rp ? [Math.round(rp.width), Math.round(rp.height)] : null, concurrents };
  });
  verifier(`${cle} : verrou — le dock de Léo est monté`, socle.dock);
  verifier(`${cle} : aucun bandeau Finubar dans la page`, socle.bandeau === false);
  verifier(`${cle} : le dock est tout en bas (≤ 24 px du bord)`, socle.ecartBas !== null && socle.ecartBas >= 0 && socle.ecartBas <= 24, `${socle.ecartBas} px`);
  verifier(`${cle} : la parole n'est plus peinte`, !!socle.parole && socle.parole[0] <= 1 && socle.parole[1] <= 1, JSON.stringify(socle.parole));
  verifier(`${cle} : aucune autre pièce fixe ne partage le bas avec Léo`, socle.concurrents.length === 0, JSON.stringify(socle.concurrents));

  // ---- La recommandation de Léo se LANCE ----
  const dock = await page.evaluate(() => {
    const d = document.getElementById('leo-dock');
    const boutons = [...d.querySelectorAll('button')].map((x) => ({ texte: x.textContent.trim(), actif: !x.disabled,
      vu: getComputedStyle(x).display !== 'none' && x.getBoundingClientRect().width > 0, classe: x.className }));
    return { proactif: d.classList.contains('leo-dock--proactif'), boutons,
      grises: boutons.filter((x) => x.vu && !x.actif).length,
      fondPrimaire: getComputedStyle(d.querySelector('.leo-dock-action--primaire')).backgroundColor };
  });
  verifier(`${cle} : verrou — le dock porte la recommandation`, dock.proactif);
  const yAller = dock.boutons.find((x) => /Y aller/.test(x.texte));
  verifier(`${cle} : un bouton « Y aller » visible et actif`, !!yAller && yAller.vu && yAller.actif, JSON.stringify(dock.boutons.map((x) => x.texte + (x.vu ? '' : '·caché') + (x.actif ? '' : '·inactif'))));
  verifier(`${cle} : aucun bouton grisé affiché`, dock.grises === 0, `${dock.grises}`);
  verifier(`${cle} : le bouton principal n'est plus le bleu plein`, dock.fondPrimaire !== 'rgb(26, 90, 120)', dock.fondPrimaire);
  const chercher = await cible(page, '#leo-dock .leo-dock-action--primaire');
  verifier(`${cle} : « Aller à… » reste atteignable`, chercher.length === 1 && chercher[0].atteint, JSON.stringify(chercher));

  // ---- Les cibles tactiles (au doigt) ----
  if (telephone) {
    const boutonsDock = await cible(page, '#leo-dock button');
    verifier('téléphone : #leo-dock button ≥ 44 px', boutonsDock.length >= 2 && boutonsDock.every((x) => x.h >= 44), boutonsDock.map((x) => x.h).join(','));
  }

  // ---- Le texte ne descend pas sous 12 px ----
  const petits = await page.evaluate(() => ['.titre-surligne', '.leo-dock-identite']
    .map((s) => { const el = document.querySelector(s); return el ? [s, parseFloat(getComputedStyle(el).fontSize)] : [s, null]; }));
  verifier(`${cle} : aucun texte du socle ni de l'en-tête sous 12 px`, petits.every(([, px]) => px === null || px >= 11.95), JSON.stringify(petits));

  // ---- La légende n'est pas peinte sous le socle ----
  const legende = await page.evaluate(() => {
    const l = document.querySelector('.ciel-noeud-plateau > .ciel-legende');
    if (!l) { return 'absente'; }
    const cs = getComputedStyle(l);
    return cs.display === 'none' || cs.visibility === 'hidden' ? 'retirée' : 'peinte';
  });
  verifier(`${cle} : la légende n'est pas peinte sous le socle`, legende !== 'peinte', legende);

  // ---- « Y aller » isole bien le projet recommandé ----
  // La fixture recommande « Projet Delta », accroché sous RENOBOOST IA.
  const bouton = page.locator('#leo-dock button', { hasText: 'Y aller' });
  if (await bouton.count()) {
    if (telephone) { await bouton.tap(); } else { await bouton.click(); }
    await page.waitForTimeout(2200);
    const apres = await page.evaluate(() => ({ hash: location.hash,
      astre: !!document.querySelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id^="depot:"]') }));
    verifier(`${cle} : « Y aller » isole le projet recommandé (RENOBOOST IA, ses dépôts)`, apres.hash === '#renoboost-ia' && apres.astre, JSON.stringify(apres));
  } else {
    verifier(`${cle} : « Y aller » isole le projet recommandé (RENOBOOST IA, ses dépôts)`, false, 'pas de bouton');
  }

  // ---- Le fil nomme l'accueil « Accueil » ----
  const fil = await page.evaluate(() => (document.querySelector('.ciel-fil') || {}).textContent || '');
  verifier(`${cle} : le fil commence par « Accueil », pas par « ULTIMA »`, /^\s*Accueil/.test(fil), fil.replace(/\s+/g, ' ').trim());
  if (telephone) {
    const etapes = await cible(page, '.ciel-fil-etape');
    verifier('téléphone : étapes du fil ≥ 44 px', etapes.length > 0 && etapes.every((x) => x.h >= 44), etapes.map((x) => x.h).join(','));
  }

  // ---- Le panneau « Où allons-nous ? » ----
  await page.evaluate(() => document.querySelector('#leo-dock .leo-dock-action--primaire').click());
  await page.waitForTimeout(500);
  const panneau = await page.evaluate(() => {
    const p = document.querySelector('.leo-nav-panneau');
    const saisie = p.querySelector('.leo-nav-recherche');
    const fond = getComputedStyle(saisie).backgroundColor;
    const ph = getComputedStyle(saisie, '::placeholder').color;
    const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const [pr, pg, pb, pa = 1] = rgb(ph);
    const [fr, fg, fb] = rgb(fond);
    const melange = [pr * pa + fr * (1 - pa), pg * pa + fg * (1 - pa), pb * pa + fb * (1 - pa)];
    const l1 = lum(melange), l2 = lum([fr, fg, fb]);
    const contraste = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    p.scrollTop = p.scrollHeight;
    const res = [...p.querySelectorAll('.leo-nav-resultat')];
    const dernier = res.length ? res[res.length - 1].getBoundingClientRect() : null;
    return { contraste, finite: Number.isFinite(contraste), n: res.length, dernierBas: dernier ? Math.round(dernier.bottom) : null, vh: innerHeight };
  });
  chiffres[`${cle} panneau`] = panneau;
  verifier(`${cle} : verrou — le panneau liste des destinations`, panneau.n >= 3, `${panneau.n}`);
  verifier(`${cle} : le texte indicatif de la recherche est lisible (≥ 4,5)`, panneau.finite && panneau.contraste >= 4.5, panneau.contraste.toFixed(2));
  verifier(`${cle} : le dernier résultat s'atteint en faisant défiler le panneau`, panneau.dernierBas !== null && panneau.dernierBas <= panneau.vh, `${panneau.dernierBas} / ${panneau.vh}`);
  const fermer = await cible(page, '.leo-nav-fermer');
  verifier(`${cle} : « Fermer » ≥ 44 px`, fermer.length === 1 && fermer[0].h >= 44, JSON.stringify(fermer));
  // Le focus reste dans une boîte modale.
  // 30 tabulations vers l'avant PUIS 30 vers l'arrière : plus que le nombre
  // d'éléments du panneau, dans les deux sens — sinon un piège absent passe
  // pour un piège qui tient (premier jet : 16 tabulations en alternance, vert
  // sur un panneau que l'évaluation B voyait fuir à la 12ᵉ).
  let dehors = 0;
  for (const touche of ['Tab', 'Shift+Tab']) {
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press(touche);
      const dedans = await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('.leo-nav-panneau'));
      if (!dedans) { dehors += 1; }
    }
  }
  verifier(`${cle} : le focus ne sort pas du panneau (30 tabulations dans chaque sens)`, dehors === 0, `${dehors} sortie(s)`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const ferme = await page.evaluate(() => document.querySelector('.leo-nav-voile').hidden);
  verifier(`${cle} : Échap ferme toujours le panneau`, ferme === true);
  await contexte.close();
}

// ---- Le retour des coques dit « Accueil » et se touche du doigt ----
{
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true });
  const page = await contexte.newPage();
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
  await page.goto(`${BASE}/alpha.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1200);
  const r = await cible(page, '.console-retour a');
  await contexte.close();
  verifier('alpha.html : le retour dit « ↞ Accueil »', r.length === 1 && /Accueil/.test(r[0].texte), JSON.stringify(r));
  verifier('alpha.html : le retour ≥ 44 px au doigt', r.length === 1 && r[0].h >= 44, JSON.stringify(r));
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE BANDEAUX VERT ===' : '\n=== SMOKE BANDEAUX ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
