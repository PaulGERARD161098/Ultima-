// Vérification de FINUBAR — la table de marche (finubar.html + js/finubar.js).
//
// Prouve : la page charge sans erreur ni requête externe ; les quatre états de
// session se comportent comme prévu (fail-closed) ; l'ordre de l'agrégat est
// rendu TEL QUEL (la page ne recalcule rien) ; un grain illisible reste visible ;
// aucune idée/projet perdu entre la donnée et le DOM ; le contraste AA est
// mesuré SUR LES TEXTES DYNAMIQUES ; responsive 390 px sans scroll horizontal.
//
// ⛔ CE HARNAIS FERME UNE PART DE L'ANGLE MORT NOMMÉ LE 2026-08-20 : « les pages
// authentifiées ne sont pas couvertes ». Ici la session est stubée, donc les
// textes rendus APRÈS authentification sont réellement mesurés — c'est
// exactement ce qui manquait à `idees.html` quand il portait un 3,64:1 invisible.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs += 1; }
}

// Jeu d'essai FIXE — sa réponse est connue d'avance, ligne par ligne. Il n'est
// PAS tiré de finubar/macro.json : un harnais qui lit la donnée du jour devient
// vert ou rouge selon l'humeur du dépôt, et ne prouve plus rien sur le rendu.
const DONNEES = {
  le: '2026-08-21',
  projets: [
    {
      ok: true, motif: '', depot: 'x/Alpha', rang: 0, jours_depuis_maj: 1, jours_en_attente: null,
      derive: { tete: 'abc1234', tete_le: '2026-08-21T09:00:00Z', commits_depuis: 4 },
      grain: {
        projet: 'Alpha', depot: 'x/Alpha', cap: 'le cap d Alpha', rattache_a: 'ROADMAP-A.md',
        etat: 'en_cours', jalon: { nom: 'Jalon A', critere_de_sortie: 'compteur = 1' },
        dernier_arret: { le: '2026-08-20', quoi: 'la chose faite', commit: 'deadbee' },
        prochaine_action: 'la suite d Alpha', bloque_par: [], en_attente_depuis: '',
        boucles_ouvertes: [{ quoi: 'PR #1', depuis: '2026-08-19' }], maj: '2026-08-20',
      },
    },
    {
      ok: true, motif: '', depot: 'x/Beta', rang: 1, jours_depuis_maj: 0, jours_en_attente: 17,
      derive: { tete: 'fff0000', tete_le: '2026-08-21T09:00:00Z', commits_depuis: 0 },
      grain: {
        projet: 'Beta', depot: 'x/Beta', cap: 'le cap de Beta', rattache_a: 'ROADMAP-B.md',
        etat: 'en_attente_de_paul', jalon: { nom: 'Jalon B', critere_de_sortie: 'un geste' },
        dernier_arret: { le: '2026-08-21', quoi: 'autre chose', commit: 'cafe123' },
        prochaine_action: 'la suite de Beta', bloque_par: ['le geste attendu'],
        en_attente_depuis: '2026-08-04', boucles_ouvertes: [], maj: '2026-08-21',
      },
    },
    { ok: false, motif: 'bloc illisible', depot: 'x/Gamma', grain: null, derive: null, rang: 9, jours_depuis_maj: null, jours_en_attente: null },
  ],
  macro: {
    total: 3, lisibles: 2, illisibles: 1, en_cours: 1, en_attente_de_paul: 1,
    au_repos: 0, derives: 1, boucles_ouvertes: 1, gestes_de_paul: [{ projet: 'Beta', geste: 'le geste attendu' }],
  },
  cartouche: {
    signaux: [
      { projet: 'Alpha', dit: 'a avancé de 4 commit(s) depuis sa dernière note', pourquoi: 'derive' },
      { projet: 'Beta', dit: 'attend un geste : le geste attendu — ouvert depuis 17 j', pourquoi: 'attente' },
    ],
    action: { projet: 'Beta', nature: 'geste', faire: 'le geste attendu', cap: 'le cap de Beta' },
    illisibles: 1,
  },
  constellation: { noeuds: [], relations: [] },
};

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// client : 'aucun' (config vide) | 'deconnecte' | 'connecte'
// api    : null (aucun stub) | { status, body }
async function ouvrir({ client, api }, viewport = { width: 1280, height: 900 }) {
  const page = await navigateur.newPage({ viewport });
  const journal = { erreurs: [], externes: [], appelsApi: 0 };
  page.on('pageerror', (e) => journal.erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') journal.erreurs.push(m.text()); });
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) journal.externes.push(url);
    if (url.includes('/api/finubar')) journal.appelsApi += 1;
  });

  await page.route('**/api/finubar', (r) => (api
    ? r.fulfill({ status: api.status, contentType: 'application/json', body: JSON.stringify(api.body) })
    : r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Erreur interne' }) })));

  if (client === 'aucun') {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', { value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
    });
  } else {
    const session = client === 'connecte'
      ? '{ user: { id: "u-test" }, access_token: "jeton-factice" }'
      : 'null';
    await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
      contentType: 'application/javascript',
      body: `window.supabase = { createClient: function () { return { auth: {
        getSession: function () { return Promise.resolve({ data: { session: ${session} } }); },
        onAuthStateChange: function () {}
      } }; } };`,
    }));
  }

  await page.goto(`${BASE}/finubar.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(600);
  return { page, journal };
}

// Contraste WCAG contre le fond RÉELLEMENT peint par les ancêtres.
// (Même mesure que smoke-idees.mjs. Un fond supposé est un fond faux — leçon
// du 2026-08-20 : on remonte jusqu'au premier fond opaque au lieu de nommer
// un jeton, et l'alpha compte.)
function contrasteSurFondPeint(page, selecteur) {
  return page.evaluate(([sel]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const lum = (p) => 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]);
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
    };
    const el = document.querySelector(sel);
    if (!el) return 0;
    const texte = parse(getComputedStyle(el).color);
    let n = el, fond = null;
    while (n && n !== document.documentElement.parentNode) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a >= 0.5) { fond = bg; break; }
      n = n.parentNode;
    }
    if (!texte || !fond) return 0;
    const a = lum(texte.rgb), b = lum(fond.rgb);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, [selecteur]);
}

// ------------------------------------------------------- §1 fail-closed
console.log('§1 — sans session, la page se tait au lieu d\'inventer');
{
  const { page, journal } = await ouvrir({ client: 'aucun', api: null });
  // On lit le CONTENEUR, pas le paragraphe d'attente : le rendu le remplace.
  // (Première version de ce harnais : elle interrogeait `#matin-message`,
  // disparu au premier rendu, et rendait « (vide) » — une sonde qui vise un
  // élément que le code supprime mesure l'absence, pas le message.)
  const msg = await page.textContent('#matin-corps');
  verifier('config absente → message explicite', /Configuration absente/.test(msg || ''), msg || '(vide)');
  verifier('config absente → AUCUN appel à l\'API', journal.appelsApi === 0);
  verifier('aucune erreur console', journal.erreurs.length === 0, journal.erreurs.join(' | '));
  verifier('aucune requête externe', journal.externes.length === 0, journal.externes.join(' | '));
  verifier('la table de marche reste vide', (await page.locator('#marche > li').count()) === 0);
  await page.close();
}
{
  const { page, journal } = await ouvrir({ client: 'deconnecte', api: null });
  const msg = await page.textContent('#matin-corps');
  verifier('session fermée → renvoi vers la boussole', /boussole/i.test(msg), msg);
  verifier('session fermée → AUCUN appel à l\'API', journal.appelsApi === 0);
  await page.close();
}
{
  const { page } = await ouvrir({ client: 'connecte', api: { status: 401, body: { ok: false, error: 'Authentification requise' } } });
  const msg = await page.textContent('#matin-corps');
  verifier('401 → message de reconnexion, jamais de détail interne', /Session expirée/.test(msg), msg);
  verifier('401 → aucun état inventé à l\'écran', (await page.locator('#marche > li').count()) === 0);
  await page.close();
}
{
  const { page } = await ouvrir({ client: 'connecte', api: { status: 500, body: { ok: false, error: 'Erreur interne' } } });
  const msg = await page.textContent('#matin-corps');
  verifier('500 → message générique', /indisponible/.test(msg), msg);
  await page.close();
}

// ------------------------------------------------------- §2 rendu
console.log('§2 — avec session, la page rend l\'agrégat TEL QUEL');
const { page, journal } = await ouvrir({ client: 'connecte', api: { status: 200, body: { ok: true, data: DONNEES } } });
{
  verifier('un seul appel à l\'API', journal.appelsApi === 1, String(journal.appelsApi));
  verifier('aucune erreur console', journal.erreurs.length === 0, journal.erreurs.join(' | '));
  verifier('aucune requête externe', journal.externes.length === 0, journal.externes.join(' | '));

  const lignes = page.locator('#marche > li');
  verifier('un bloc par projet, illisible COMPRIS', (await lignes.count()) === 3, String(await lignes.count()));

  const noms = await page.locator('.projet-nom').allTextContents();
  verifier('l\'ordre du moteur est respecté à l\'identique',
    noms.join(' > ') === 'Alpha > Beta > x/Gamma', noms.join(' > '));

  const texte = await page.textContent('#marche');
  verifier('le grain illisible affiche son motif', /bloc illisible/.test(texte));
  verifier('la dérive est annoncée en clair', /avancé de 4 commit/.test(texte));
  verifier('la tête réelle du dépôt est citée', /abc1234/.test(texte));
  verifier('le geste attendu est rendu', /le geste attendu/.test(texte));
  verifier('l\'ancienneté du geste est rendue', /depuis 17 j/.test(texte));
  verifier('le critère de sortie du jalon est rendu', /compteur = 1/.test(texte));
  verifier('le commit du dernier arrêt est rendu', /deadbee/.test(texte));
  verifier('la boucle ouverte est rendue', /PR #1/.test(texte));
  // Le projet qui appelle porte sa marque ; les autres non — sinon la marque
  // ne dit plus rien (un signal qui s'allume partout n'est pas un signal).
  verifier('seuls les projets qui appellent sont marqués',
    (await page.locator('.projet.appelle').count()) === 2, String(await page.locator('.projet.appelle').count()));

  const matin = await page.textContent('#matin-corps');
  verifier('le cartouche rend ses deux signaux',
    /a avancé de 4 commit/.test(matin) && /ouvert depuis 17 j/.test(matin));
  verifier('l\'action est celle du moteur', /Beta — le geste attendu/.test(matin), matin);
  verifier('un geste de Paul est annoncé comme tel', /geste de Paul/.test(matin));
  verifier('le POURQUOI accompagne l\'action', /le cap de Beta/.test(matin));

  const prov = await page.textContent('#provenance');
  verifier('la page dit DE QUAND date ce qu\'elle affiche', /2026-08-21/.test(prov), prov);
  verifier('la page dit comment se rafraîchir', /collecter\.mjs/.test(prov));
}

// ------------------------------------------------------- §3 contraste
console.log('§3 — contraste AA des textes DYNAMIQUES (session stubée)');
{
  const cibles = [
    ['.signal-dit', 'texte d\'un signal du matin'],
    ['.matin-action-faire', 'l\'action du matin'],
    ['.matin-action-cap', 'le pourquoi de l\'action'],
    ['.projet-nom', 'nom d\'un projet'],
    ['.projet-etat', 'étiquette d\'état'],
    ['.projet-cap', 'cap d\'un projet'],
    ['.projet-depot', 'nom du dépôt'],
    ['.ligne-cle', 'clé d\'une ligne'],
    ['.derive', 'l\'avertissement de dérive'],
    ['.projet-gestes li', 'un geste attendu'],
    ['#provenance', 'la note de provenance'],
  ];
  for (const [sel, nom] of cibles) {
    const r = await contrasteSurFondPeint(page, sel);
    verifier(`AA (≥ 4,5:1) — ${nom}`, r >= 4.5, `${r.toFixed(2)}:1 sur ${sel}`);
  }
}
await page.close();

// ------------------------------------------------------- §4 mobile
console.log('§4 — 390 px : rien ne déborde');
{
  const { page: p390 } = await ouvrir(
    { client: 'connecte', api: { status: 200, body: { ok: true, data: DONNEES } } },
    { width: 390, height: 844 });
  const debord = await p390.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  verifier('aucun scroll horizontal en 390 px', debord <= 0, `${debord} px`);
  verifier('les projets sont tous rendus en mobile', (await p390.locator('#marche > li').count()) === 3);
  // Cibles tactiles : le seul lien de la page doit rester atteignable au doigt.
  const h = await p390.locator('.retour-ultima').evaluate((n) => n.getBoundingClientRect().height);
  verifier('le retour vers Ultima fait au moins 24 px de haut', h >= 24, `${h} px`);
  await p390.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== smoke-finubar : TOUT VERT ===' : `\n=== smoke-finubar : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
