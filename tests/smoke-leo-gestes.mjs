// Harnais navigateur — l'écran « Ce que Léo a fait » (leo.html), B1 ⑤.
// Cadrage §15.4 · maquette validée le 02/10 (design/preview-leo-defaire.html).
// /api/leo/ecritures et le client Supabase sont STUBÉS : zéro réseau réel.
//
// Ce qu'il prouve : une ligne par geste, rangée par jour ; le bouton n'existe
// que sur une ligne défaisable ; un clic envoie { etape, traceId } et rien
// d'autre ; la ligne devient « Défait », perd son nom, et le focus la suit ;
// un refus se dit sans recopier le serveur ; les noms passent en textContent.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, ok, detail = '') {
  if (!ok) echecs += 1;
  console.log(`  ${ok ? '✅' : '❌'} ${nom}${!ok && detail ? ' — ' + detail : ''}`);
}

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const maintenant = Date.now();
const ilYa = (min) => new Date(maintenant - min * 60e3).toISOString();
const INJECTION = '<img src=x onerror="window.__pwn=1">';
const GESTES = [
  { traceId: id(1), outil: 'proposer_idee', quadrant: 'adramelech', le: ilYa(5), etat: 'fait', defaisable: true,
    cible: 'Un atelier bois', quoi: 'A créé une idée' },
  { traceId: id(2), outil: 'proposer_relance', quadrant: 'riven', le: ilYa(10), etat: 'fait', defaisable: true,
    cible: INJECTION, quoi: 'A programmé une relance' },
  { traceId: id(3), outil: 'proposer_serment', quadrant: 'imladrik', le: ilYa(26 * 60), etat: 'lie', lie: 'flammes',
    defaisable: false, cible: 'Courir le dimanche', quoi: 'A scellé un serment' },
  { traceId: id(4), outil: 'proposer_journal', quadrant: 'riven', le: ilYa(27 * 60), etat: 'defait',
    defaitLe: ilYa(26.5 * 60), defaisable: false, quoi: 'A noté au journal' },
  { traceId: id(5), outil: 'proposer_besoin', quadrant: 'riven', le: ilYa(28 * 60), etat: 'echec',
    defaisable: false, quoi: 'A tenté d’ajouter un besoin' }
];

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
});

// connecte : session factice | api : { status, body } du GET | defaire : réponse du POST
async function ouvrir({ connecte = true, api, defaire }, viewport = { width: 1280, height: 900 }) {
  const page = await navigateur.newPage({ viewport });
  const journal = { erreurs: [], externes: [], posts: [] };
  page.on('pageerror', (e) => journal.erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    // Les refus provoqués EXPRÈS (409, 503) journalisent un échec de ressource.
    if (/Failed to load resource/.test(m.text()) && (m.location()?.url || '').includes('/api/leo/ecritures')) return;
    journal.erreurs.push(m.text());
  });
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) journal.externes.push(url);
  });
  await page.route('**/api/leo/ecritures', (r) => {
    if (r.request().method() === 'POST') {
      journal.posts.push({ corps: r.request().postDataJSON(), auth: r.request().headers().authorization || '' });
      return defaire ? defaire(r) : r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' });
    }
    return r.fulfill({ status: api.status, contentType: 'application/json', body: JSON.stringify(api.body) });
  });
  const session = connecte ? '{ user: { id: "u-test" }, access_token: "jeton-factice" }' : 'null';
  await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
    contentType: 'application/javascript',
    body: `window.supabase = { createClient: function () { return { auth: {
      getSession: function () { return Promise.resolve({ data: { session: ${session} } }); },
      onAuthStateChange: function () {}
    } }; } };`
  }));
  await page.goto(`${BASE}/leo.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(400);
  return { page, journal };
}
const OK = { status: 200, body: { ok: true, data: { gestes: GESTES } } };
const defaitOk = (r) => r.fulfill({ status: 200, contentType: 'application/json',
  body: JSON.stringify({ ok: true, data: { traceId: id(1), defaite: true, journalise: true } }) });

console.log('— A. Le rendu —');
{
  const { page, journal } = await ouvrir({ api: OK, defaire: defaitOk });
  const etat = await page.evaluate(() => ({
    lignes: document.querySelectorAll('.geste').length,
    jours: [...document.querySelectorAll('.gestes-jour')].map((h) => h.textContent),
    boutons: [...document.querySelectorAll('.geste')].map((l) => !!l.querySelector('.leo-defaire')),
    etats: [...document.querySelectorAll('.geste')].map((l) => l.getAttribute('data-etat')),
    textes: [...document.querySelectorAll('.geste')].map((l) => l.textContent),
    img: document.querySelectorAll('#gestes img').length,
    pwn: window.__pwn === 1,
    tailles: [...document.querySelectorAll('.leo-defaire')].map((b) => {
      const r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44;
    }),
    labels: [...document.querySelectorAll('.leo-defaire')].map((b) => b.getAttribute('aria-label'))
  }));
  // Non-vacuité : les cinq lignes sont là, avant de chercher ce qui n'y est pas.
  verifier('Une ligne par geste (5)', etat.lignes === 5, String(etat.lignes));
  verifier('Rangées par jour : Aujourd’hui puis Hier', etat.jours.join('|') === 'Aujourd’hui|Hier', etat.jours.join('|'));
  verifier('« Défaire » seulement sur les lignes défaisables',
    JSON.stringify(etat.boutons) === JSON.stringify([true, true, false, false, false]), JSON.stringify(etat.boutons));
  verifier('Boutons ≥ 44 px et nommés par leur geste', etat.tailles.length === 2 && etat.tailles.every(Boolean) &&
    etat.labels[0] === 'Défaire : A créé une idée « Un atelier bois »', JSON.stringify(etat.labels));
  verifier('La cible vivante est nommée', etat.textes[0].includes('« Un atelier bois »'));
  verifier('Lié : la raison est dite, sans bouton', etat.textes[2].includes('Ne se défait plus : une flamme y est née depuis'));
  verifier('Défait : sans nom, avec la date', !/«/.test(etat.textes[3]) && /Défait par toi, le \d\d\/\d\d à \d\d:\d\d/.test(etat.textes[3]),
    etat.textes[3]);
  verifier('Échec : « A tenté d’… », rien n’a été écrit', etat.textes[4].includes('A tenté d’ajouter un besoin') &&
    etat.textes[4].includes('N’a pas abouti'));
  verifier('Un nom hostile reste du texte (textContent)', etat.img === 0 && !etat.pwn && etat.textes[1].includes(INJECTION));

  // Le clic.
  await page.locator('.geste').first().locator('.leo-defaire').click();
  await page.waitForSelector('.geste[data-etat="defait"] >> nth=0', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(150);
  const apres = await page.evaluate(() => {
    const l = document.querySelector('.geste');
    return { etat: l.getAttribute('data-etat'), bouton: !!l.querySelector('.leo-defaire'),
      nom: !!l.querySelector('.geste-cible'), texte: l.querySelector('.geste-etat').textContent,
      focus: document.activeElement === l.querySelector('.geste-etat'),
      annonce: document.getElementById('gestes-annonce').textContent };
  });
  verifier('Le clic envoie { etape, traceId } — rien d’autre, avec le jeton',
    journal.posts.length === 1 &&
    JSON.stringify(journal.posts[0].corps) === JSON.stringify({ etape: 'defaire', traceId: id(1) }) &&
    journal.posts[0].auth === 'Bearer jeton-factice', JSON.stringify(journal.posts));
  verifier('La ligne devient « Défait », perd son nom et son bouton',
    apres.etat === 'defait' && !apres.bouton && !apres.nom && apres.texte.startsWith('Défait par toi'), JSON.stringify(apres));
  verifier('Le focus va à l’état de la ligne, et l’annonce le dit', apres.focus && apres.annonce === apres.texte);
  verifier('Zéro requête externe', journal.externes.length === 0, journal.externes.join(' '));
  verifier('Zéro erreur console', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.close();
}

console.log('— B. Les refus —');
for (const [nom, defaire, attendu] of [
  ['lié', (r) => r.fulfill({ status: 409, contentType: 'application/json', body: '{"ok":false,"error":"Lié : flammes"}' }),
    'une flamme y est née depuis'],
  ['brut', (r) => r.fulfill({ status: 409, contentType: 'application/json', body: '{"ok":false,"error":"<b>serveur</b>"}' }),
    'Je n’ai pas pu le défaire. Rien n’a été retiré.'],
  ['perdu', (r) => r.abort('failed'), 'Je ne sais pas si c’est défait']
]) {
  const { page } = await ouvrir({ api: OK, defaire });
  await page.locator('.geste').first().locator('.leo-defaire').click();
  await page.waitForSelector('.geste:first-child:not([data-etat="fait"])', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(150);
  const r = await page.evaluate(() => {
    const l = document.querySelector('.geste');
    return { etat: l.getAttribute('data-etat'), texte: l.querySelector('.geste-etat').textContent,
      html: l.querySelector('.geste-etat').innerHTML, nom: !!l.querySelector('.geste-cible'),
      bouton: !!l.querySelector('.leo-defaire'), focus: document.activeElement === l.querySelector('.geste-etat') };
  });
  verifier('Refus ' + nom + ' : dit pour Paul, la cible reste nommée, plus de bouton',
    r.etat !== 'defait' && r.etat !== 'fait' && r.texte.includes(attendu) && r.nom && !r.bouton && r.focus &&
    !r.html.includes('<b>'), JSON.stringify(r));
  await page.close();
}

console.log('— C. Les états sans liste —');
for (const [nom, opts, attendu] of [
  ['déconnecté', { connecte: false, api: OK }, 'Session fermée'],
  ['API 503', { api: { status: 503, body: { ok: false, error: 'Journal indisponible' } } }, 'indisponible'],
  ['API 401', { api: { status: 401, body: { ok: false } } }, 'Session expirée'],
  ['vide', { api: { status: 200, body: { ok: true, data: { gestes: [] } } } }, 'rien fait sans demander'],
  ['corps malformé', { api: { status: 200, body: { ok: true, data: { gestes: 'non' } } } }, 'indisponible']
]) {
  const { page } = await ouvrir(opts);
  const texte = await page.locator('#gestes').textContent();
  verifier('État ' + nom + ' : message, aucune ligne inventée',
    texte.includes(attendu) && await page.locator('.geste').count() === 0, texte);
  await page.close();
}

console.log('— D. Téléphone (390 px) —');
{
  const { page } = await ouvrir({ api: OK, defaire: defaitOk }, { width: 390, height: 844 });
  const m = await page.evaluate(() => ({
    deborde: document.documentElement.scrollWidth > window.innerWidth + 1,
    lignes: document.querySelectorAll('.geste').length,
    coupes: [...document.querySelectorAll('.geste .leo-defaire, .geste-etat')].filter((n) => {
      const r = n.getBoundingClientRect(); return r.right > window.innerWidth + 1 || r.left < -1;
    }).length
  }));
  verifier('390 px : aucune ligne ne déborde (non vide)', m.lignes === 5 && !m.deborde && m.coupes === 0, JSON.stringify(m));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE LÉO GESTES VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
