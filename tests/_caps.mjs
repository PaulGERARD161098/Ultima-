// LECTURE DES CAPS, INDÉPENDAMMENT DU SUPPORT — boussole ou ciel.
// ---------------------------------------------------------------------------
// POURQUOI CE MODULE EXISTE. LV5 / P3 fait passer sept coques de la boussole au
// ciel. Six harnais de navigation les décrivaient en boussole (`a.cap`,
// `.cap-nom`, `.cap--avenir`, `.boussole-plateau.is-pret`) — environ 200
// assertions. Les réécrire chacun dans son coin, c'était six occasions de
// diverger sur la même question : « qu'est-ce qu'un cap, et comment le lit-on ».
// Un composant réclamé par un second appelant se DÉPLACE au lieu de se recopier
// (règle du 2026-07-30) ; ici il y en a six.
//
// CE QUI CHANGE ENTRE LES DEUX SUPPORTS, et ce n'est pas qu'une affaire de
// sélecteurs :
//   — la boussole faisait de chaque cap un `<a href>` ; l'étoile est un
//     `<g role="button">`. **Il n'y a plus de href à lire.** La cible se prouve
//     donc EN CLIQUANT, ce qui est une preuve plus forte qu'un attribut lu —
//     c'est l'arbitrage rendu en LV4 ④a, où l'ancre a été retirée parce
//     qu'enveloppée, l'étoile perdait le focus clavier ;
//   — le nom d'un cap est un `<text>` dans le groupe, pas un `.cap-nom` ;
//   — « à venir » se lit sur `aria-disabled`, pas sur une classe de style.
//
// CE MODULE NE JUGE RIEN. Il lit. Les verdicts restent dans les harnais, avec
// leur contexte — un module de lecture qui se met à décider devient un second
// harnais que personne ne relit.

/** Le plateau est-il rendu par le ciel (et non par la boussole) ? */
export function auCiel(page) {
  return page.evaluate(() => !!document.querySelector('#ciel-noeud-plateau'));
}

/**
 * Attend que le plateau soit prêt, quel que soit le support.
 * `is-pret` est un CONTRAT entre le produit et ses instruments : la boussole le
 * posait, le ciel le pose aussi (js/ciel-noeud.mjs). Onze points d'attente en
 * dépendent ; le changer aurait coûté onze réécritures pour un gain nul.
 */
export function attendrePret(page, timeout = 20000) {
  return page.waitForSelector('.boussole-plateau.is-pret, .ciel-noeud-plateau.is-pret', { timeout });
}

/**
 * Les caps de l'écran, dans l'ordre du DOM.
 * Rend `{ id, nom, cible, avenir }` — `cible` vaut `null` au ciel, où elle ne
 * s'obtient qu'en cliquant (voir `naviguerVers`). Le harnais qui veut prouver
 * une cible doit donc CLIQUER, pas lire.
 */
export function lireCaps(page) {
  return page.evaluate(() => {
    const auCiel = !!document.querySelector('#ciel-noeud-plateau');
    if (!auCiel) {
      return Array.from(document.querySelectorAll('.cap')).map((el) => ({
        // `data-id` — LU DANS `boussole-noyau.mjs`, pas supposé. Mon premier
        // jet cherchait `data-cap` et rendait `id: null` sur toute la boussole :
        // les clics et les survols auraient échoué à trouver leur cible, en
        // silence, sur les écrans qui n'ont pas encore migré.
        id: el.dataset.id || el.getAttribute('data-noeud-id') || null,
        nom: (el.querySelector('.cap-nom')?.textContent || '').trim(),
        cible: el.getAttribute('href') || null,
        avenir: el.classList.contains('cap--avenir')
          || el.getAttribute('aria-disabled') === 'true'
      }));
    }
    return Array.from(document.querySelectorAll('g.ciel-etoile[data-noeud-id]')).map((g) => ({
      id: g.getAttribute('data-noeud-id'),
      // Le nom peint. Il peut être tronqué par le moteur au-delà de 20
      // caractères : c'est le nom AFFICHÉ qu'on rend, pas celui du registre —
      // et le harnais qui compare doit le savoir.
      nom: (g.querySelector('text.ciel-nom')?.textContent || '').trim(),
      cible: null,
      avenir: g.getAttribute('aria-disabled') === 'true'
    }));
  });
}

/**
 * Clique le cap `id` et rend l'URL atteinte (ou `null` si rien n'a bougé).
 * Au ciel, `dispatchEvent('click')` et non `.click()` de Playwright : la caméra
 * ne se pose jamais tout à fait (approche asymptotique), donc attendre une cible
 * IMMOBILE serait attendre pour toujours. C'est déjà ce que fait `smoke-ciel`.
 */
export async function naviguerVers(page, id, timeout = 8000) {
  const avant = page.url();
  const auC = await auCiel(page);
  const sel = auC
    ? `g.ciel-etoile[data-noeud-id="${id}"] .ciel-zone`
    : `.cap[data-id="${id}"]`;
  const cible = page.locator(sel).first();
  if (!(await cible.count())) { return null; }
  await cible.dispatchEvent('click');
  await page.waitForURL((u) => String(u) !== avant, { timeout }).catch(() => {});
  return page.url() === avant ? null : page.url();
}

/**
 * Survole le cap `id` — c'est ainsi que la parole de Léo se remplit, sur les
 * deux supports.
 */
export async function survoler(page, id) {
  const auC = await auCiel(page);
  const sel = auC
    ? `g.ciel-etoile[data-noeud-id="${id}"]`
    : `.cap[data-id="${id}"]`;
  const cible = page.locator(sel).first();
  if (!(await cible.count())) { return false; }
  await cible.dispatchEvent('mouseenter');
  await cible.hover().catch(() => {});
  return true;
}

/**
 * Les cibles listées par le repli `<noscript>`.
 * AU CIEL, C'EST LÀ QUE LES `href` VIVENT DÉSORMAIS, et c'est pourquoi ce repli
 * compte davantage qu'au temps de la boussole, pas moins : sans JavaScript, cette
 * liste EST la navigation.
 */
export function lireRepli(page) {
  return page.evaluate(() => {
    const n = document.querySelector('#ciel-noeud-plateau noscript, .boussole-plateau noscript');
    if (!n) { return []; }
    // Le contenu d'un <noscript> est du TEXTE quand les scripts sont actifs :
    // le navigateur ne le parse pas. On le lit donc comme tel.
    const brut = n.textContent || '';
    return Array.from(brut.matchAll(/href="([^"]+)"/g)).map((m) => m[1]);
  });
}
