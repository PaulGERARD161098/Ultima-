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
    // Le quatrième cas, posé le 02/09/2026 : un dépôt que la séance n'a pas
    // cloné. Il ressemble à Gamma dans la donnée (`ok: false`) et doit se lire
    // AUTREMENT à l'écran — « Finubar n'a pas pu lire ce dépôt » accuserait un
    // grain qui se porte peut-être très bien.
    { ok: false, hors_seance: true, motif: 'dépôt non attaché à cette séance', depot: 'x/Delta', grain: null, derive: null, rang: 9, jours_depuis_maj: null, jours_en_attente: null },
  ],
  macro: {
    total: 4, lisibles: 2, illisibles: 1, hors_seance: 1, en_cours: 1, en_attente_de_paul: 1,
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
  // ZOH SHIA (04/10) : la dérive de la série. La balise est HOSTILE à dessein :
  // elle doit rester un texte.
  zohshia: { mesurable: true, alerte: true, phrase: 'ZOH SHIA — ⚠️ EN RETARD de 8 commit(s) <b>balise</b>' },
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
{
  // 06/10 : en production, ce 503 s'affichait « indisponible » — la cause
  // (variable non vue par le déploiement) restait cachée à Paul.
  const { page } = await ouvrir({ client: 'connecte', api: { status: 503, body: { ok: false, error: 'Accès réservé non réglé' } } });
  const msg = await page.textContent('#matin-corps');
  verifier('503 réservé non réglé → la cause est nommée', /ULTIMA_PROPRIETAIRES/.test(msg), msg);
  verifier('503 réservé non réglé → jamais « indisponible »', !/indisponible/.test(msg), msg);
  await page.close();
}
{
  const { page } = await ouvrir({ client: 'connecte', api: { status: 503, body: { ok: false, error: 'Service non configuré' } } });
  const msg = await page.textContent('#matin-corps');
  verifier('autre 503 → message générique (liste fermée)', /indisponible/.test(msg), msg);
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
  verifier('un bloc par projet, illisible ET non collecté COMPRIS', (await lignes.count()) === 4, String(await lignes.count()));

  const noms = await page.locator('.projet-nom').allTextContents();
  verifier('l\'ordre du moteur est respecté à l\'identique',
    noms.join(' > ') === 'Alpha > Beta > x/Gamma > x/Delta', noms.join(' > '));

  const texte = await page.textContent('#marche');
  verifier('le grain illisible affiche son motif', /bloc illisible/.test(texte));

  // §2bis — les deux absences ne se disent pas pareil (défaut du 02/09/2026).
  // ⛔ La seconde assertion est celle qui compte : la page ne doit PAS accuser
  // de ne pas savoir lire un dépôt qu'elle n'a simplement pas ouvert. Sans elle,
  // le test passerait sur l'ancien libellé appliqué aux deux cas.
  const delta = page.locator('#marche > li', { hasText: 'x/Delta' });
  const texteDelta = (await delta.textContent()) || '';
  verifier('le dépôt non collecté est étiqueté « non collecté »', /non collecté/.test(texteDelta), texteDelta.slice(0, 80));
  verifier('⛔ et il n\'est PAS présenté comme illisible',
    !/n’a pas pu lire|n'a pas pu lire/.test(texteDelta), texteDelta.slice(0, 120));
  verifier('il dit que ce n\'est pas un constat sur le dépôt', /pas un constat/.test(texteDelta));
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
  verifier('la dérive de ZOH SHIA est rendue', /ZOH SHIA — ⚠️ EN RETARD de 8 commit/.test(matin), matin);
  verifier('la dérive en retard est marquée', (await page.locator('.matin-zohshia-alerte').count()) === 1);
  verifier('la dérive reste un texte', /<b>balise<\/b>/.test(matin) && (await page.locator('#matin-corps b').count()) === 0);

  const prov = await page.textContent('#provenance');
  verifier('la page dit DE QUAND date ce qu\'elle affiche', /2026-08-21/.test(prov), prov);
  verifier('la page dit comment se rafraîchir', /collecter\.mjs/.test(prov));
}

// ------------------------------------------------------- §3 contraste
console.log('§3 — contraste AA des textes DYNAMIQUES (session stubée)');
{
  const cibles = [
    ['.signal-dit', 'texte d\'un signal du matin'],
    ['.matin-zohshia', 'la dérive de ZOH SHIA'],
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
  // Le compte se DÉDUIT de la fixture, il ne se recopie pas : écrit en dur, il
  // rougissait au premier projet ajouté (02/09) alors que rien n'était cassé —
  // un test qui doit être retouché à chaque donnée nouvelle finit par être
  // retouché sans être lu.
  verifier('les projets sont tous rendus en mobile',
    (await p390.locator('#marche > li').count()) === DONNEES.projets.length);
  // Cibles tactiles : le seul lien de la page doit rester atteignable au doigt.
  const h = await p390.locator('.retour-ultima').evaluate((n) => n.getBoundingClientRect().height);
  verifier('le retour vers Ultima fait au moins 24 px de haut', h >= 24, `${h} px`);
  await p390.close();
}

// ------------------------- §5 le refus ne repose pas sur une seule barrière
// POURQUOI CETTE SECTION EXISTE (2026-08-31). Le middleware déclare `/finubar`
// privé depuis le 21/08. Mais `finubar/macro.json` est un fichier STATIQUE, et
// « le middleware intercepte bien les statiques » est une hypothèse qu'on ne
// peut PAS éprouver d'ici : l'egress de nos bacs à sable refuse le CONNECT vers
// la production (403 du proxy, re-mesuré aujourd'hui). La charte tranche ce cas
// — on retire l'hypothèse au lieu de la documenter : ce qui n'est pas déployé
// n'a plus besoin d'être intercepté.
// Ce qu'on mesure ici est donc la COHÉRENCE ENTRE LES DEUX GARDES, et c'est
// vérifiable hors ligne : tout préfixe que le middleware déclare privé et qui
// correspond à un dossier de fichiers servables doit AUSSI être hors
// déploiement. Un test qui interrogerait la production ne tournerait jamais ;
// celui-ci tourne à chaque boucle.
console.log('§5 — les deux gardes couvrent les mêmes chemins');
{
  const { readFileSync } = await import('node:fs');
  const { existsSync, statSync } = await import('node:fs');
  const { PREFIXES_PRIVES } = await import('../middleware.js');
  const ignore = readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8')
    .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  // L'EXCEPTION EST NOMMÉE, PAS TUE (règle du 2026-08-17 : un filtre qui écarte
  // des cas les compte et les nomme). `api/_lib` DOIT être déployé — le code de
  // `api/finubar.js` l'importe —, donc lui seul reste protégé par le seul
  // middleware. Si un jour un second chemin devait être écarté, il faudrait
  // l'ajouter ICI, sous les yeux du lecteur.
  const DEPLOYES_A_DESSEIN = ['/api/_lib'];
  const aVerifier = PREFIXES_PRIVES.filter((p) => !DEPLOYES_A_DESSEIN.includes(p));
  verifier('le filtre n’écarte QUE l’exception connue',
    PREFIXES_PRIVES.length - aVerifier.length === DEPLOYES_A_DESSEIN.length
    && aVerifier.length > 0,
    `écartés : ${DEPLOYES_A_DESSEIN.join(', ')} — vérifiés : ${aVerifier.join(', ')}`);
  for (const prefixe of aVerifier) {
    const dossier = prefixe.replace(/^\//, '');
    const surDisque = existsSync(new URL('../' + dossier, import.meta.url));
    // Un préfixe qui ne correspond à aucun dossier du repo n'a rien à exclure.
    if (!surDisque) {
      verifier(`${prefixe} : aucun dossier servable de ce nom`, true, '(rien à exclure)');
      continue;
    }
    verifier(`${prefixe} est aussi HORS déploiement (.vercelignore)`,
      ignore.includes(dossier + '/') || ignore.includes(dossier),
      `.vercelignore : ${ignore.join(' · ')}`);
  }
  // Le test de référence : l'instrument doit être capable de dire NON. Une
  // liste vide, un fichier illisible ou un import raté rendraient tout ce qui
  // précède vert par construction — c'est précisément la faute de 2026-08-17.
  verifier('l’instrument sait dire non (cas connu : un dossier public)',
    !ignore.includes('js/') && !ignore.includes('js'),
    'js/ est servi, il ne doit PAS être dans .vercelignore');
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== smoke-finubar : TOUT VERT ===' : `\n=== smoke-finubar : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
