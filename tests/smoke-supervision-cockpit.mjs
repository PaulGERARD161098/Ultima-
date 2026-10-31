// Vérification du COCKPIT DE SUPERVISION — finubar.html + js/supervision-cockpit.mjs.
//
// Prouve, dans un vrai navigateur, session stubée et API simulée AVEC ÉTAT :
//   · le registre absent (migration non appliquée) se dit, sans casser la table ;
//   · le dossier écrit par Léo reste du TEXTE (balise hostile non interprétée) ;
//   · un geste exige deux pressions ; armer un geste désarme les autres ;
//   · le corps envoyé est exactement celui attendu (aucun champ en trop) ;
//   · après décision, la liste est relue et les gestes disparaissent ;
//   · un 409 se dit par sa cause ; aucune requête externe, aucune erreur console ;
//   · contraste AA des boutons et de l'interrupteur, sur le fond réellement peint.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) console.log(`  ✅ ${nom}`);
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs += 1; }
}
const FINUBAR = { le: '2026-10-31', projets: [], macro: { total: 0, lisibles: 0, illisibles: 0, hors_seance: 0, en_cours: 0, en_attente_de_paul: 0, au_repos: 0, derives: 0, boucles_ouvertes: 0, gestes_de_paul: [] }, cartouche: { signaux: [], action: null, illisibles: 0 }, constellation: { noeuds: [], relations: [] } };
const ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const HOSTILE = '<img src=x onerror="window.__pirate=1">';
const ligne = (statut = 'EN_ATTENTE') => ({
  id: ID, objet_id: 'zoh:renodevis', recommandation: 'suspendre', statut,
  preuves_ids: ['finubar:P/Ultima-', 'zoh:renodevis'], cree_le: '2026-10-31T10:00:00Z',
  tranche_le: statut === 'EN_ATTENTE' ? null : '2026-10-31T11:00:00Z', decision_notes: statut === 'EN_ATTENTE' ? null : 'Vu',
  preuves_connues: true,
  proposition: { constat: 'Constat ' + HOSTILE, besoin: 'Besoin', typeBenefice: 'protection', preuveDependancesId: 'zoh:dep', preuveProtectionsId: 'zoh:prot', gainAttendu: '12 $ par mois', contrefactuel: 'Rien ne manque',
    retourArriere: 'Réactiver', reexamen: { responsable: 'Paul', declencheur: 'Mensuel', criterePoursuite: 'Usage', critereArret: 'Aucun' } },
});

const navigateur = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function ouvrir(api) {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });
  const journal = { erreurs: [], externes: [], posts: [], gets: 0 };
  page.on('pageerror', (e) => journal.erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') journal.erreurs.push(m.text()); });
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:')) journal.externes.push(u); });
  await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({ contentType: 'application/javascript',
    body: `window.supabase = { createClient: function () { return { auth: {
      getSession: function () { return Promise.resolve({ data: { session: { user: { id: 'u' }, access_token: 'jeton-factice' } } }); },
      onAuthStateChange: function () {} } }; } };` }));
  await page.route('**/api/finubar', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: FINUBAR }) }));
  await page.route('**/api/supervision', async (r) => {
    const req = r.request();
    if (req.headers().authorization !== 'Bearer jeton-factice') return r.fulfill({ status: 401, contentType: 'application/json', body: '{"ok":false,"error":"Authentification requise"}' });
    if (req.method() === 'GET') { journal.gets += 1; const x = api.lire(); return r.fulfill({ status: x.status, contentType: 'application/json', body: JSON.stringify(x.body) }); }
    const corps = JSON.parse(req.postData() || '{}');
    journal.posts.push(corps);
    const x = api.ecrire(corps);
    return r.fulfill({ status: x.status, contentType: 'application/json', body: JSON.stringify(x.body) });
  });
  await page.goto(`${BASE}/finubar.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(700);
  return { page, journal };
}

console.log('§1 — registre absent : la cause est dite, la table survit');
{
  const { page, journal } = await ouvrir({ lire: () => ({ status: 503, body: { ok: false, error: 'Registre absent' } }) });
  const t = await page.textContent('#supervision-corps');
  verifier('migration à appliquer nommée', /migration est à appliquer/.test(t), t);
  verifier('la table de marche est rendue quand même', /Ce matin/.test(await page.textContent('body')));
  verifier('aucun geste offert sans registre', (await page.locator('.supervision-bouton').count()) === 0);
  verifier('aucune requête externe', journal.externes.length === 0, journal.externes.join(' | '));
  await page.close();
}
{
  const { page } = await ouvrir({ lire: () => ({ status: 503, body: { ok: false, error: 'Registre indisponible' } }) });
  const t = await page.textContent('#supervision-corps');
  verifier('autre 503 : jamais « migration à appliquer »', !/migration/.test(t) && /indisponible/.test(t), t);
  await page.close();
}

console.log('§2 — liste vide : l’interrupteur se lit');
{
  const { page } = await ouvrir({ lire: () => ({ status: 200, body: { ok: true, data: { propositions: [], soumission_active: false } } }) });
  const t = await page.textContent('#supervision-corps');
  verifier('interrupteur coupé affiché', /Soumission par Léo coupée/.test(t), t);
  verifier('état vide dit', /Aucune proposition/.test(t), t);
  await page.close();
}

console.log('§3 — une proposition en attente, puis l’arbitrage');
{
  let etat = 'EN_ATTENTE';
  const { page, journal } = await ouvrir({
    lire: () => ({ status: 200, body: { ok: true, data: { propositions: [ligne(etat)], soumission_active: true } } }),
    ecrire: (c) => { if (c.action === 'arbitrer') etat = c.decision; return { status: 200, body: { ok: true, data: { id: ID, statut: etat } } }; },
  });
  const carte = page.locator('#supervision-corps li.supervision');
  verifier('une carte rendue', (await carte.count()) === 1);
  verifier('titre lisible', /Suspendre — zoh:renodevis/.test(await carte.textContent()));
  verifier('balise hostile restée texte', (await carte.textContent()).includes(HOSTILE) && (await page.locator('#supervision-corps img').count()) === 0);
  verifier('aucun script exécuté', (await page.evaluate(() => window.__pirate)) === undefined);
  verifier('les preuves et l’avertissement de pertinence', /finubar:P\/Ultima- · zoh:renodevis/.test(await carte.textContent()) && /existent au catalogue.*pertinence/.test(await carte.textContent()));
  verifier('bénéfice, preuve des dépendances et des protections nommés', /Bénéfice\s*protection/.test(await carte.textContent()) && /Preuve des dépendances\s*zoh:dep/.test(await carte.textContent()) && /Preuve des protections\s*zoh:prot/.test(await carte.textContent()));
  verifier('la note a une étiquette', (await page.locator(`label[for="note-${ID}"]`).count()) === 1);
  const [accepter, refuser] = [page.getByRole('button', { name: 'Accepter', exact: true }), page.getByRole('button', { name: 'Refuser', exact: true })];
  await accepter.click();
  verifier('première pression : rien n’est envoyé', journal.posts.length === 0);
  verifier('le bouton demande confirmation', (await page.getByRole('button', { name: 'Confirmer : accepter', exact: true }).count()) === 1);
  await refuser.click();
  verifier('armer « refuser » désarme « accepter »', (await page.getByRole('button', { name: 'Accepter', exact: true }).count()) === 1 && (await page.getByRole('button', { name: 'Confirmer : refuser', exact: true }).count()) === 1);
  verifier('toujours rien envoyé', journal.posts.length === 0);
  // contraste AA du bouton armé et de l'interrupteur
  const contraste = (sel) => page.evaluate((s) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (p) => 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]);
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
    const e = document.querySelector(s); if (!e) return 0;
    const t = parse(getComputedStyle(e).color); let n = e, fond = null;
    while (n && n.nodeType === 1) { const b = parse(getComputedStyle(n).backgroundColor); if (b && b.a >= 0.5) { fond = b; break; } n = n.parentNode; }
    if (!t || !fond) return 0; const a = lum(t.rgb), b = lum(fond.rgb); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, sel);
  const cArme = await contraste('.supervision-bouton.arme');
  const cInter = await contraste('.supervision-interrupteur');
  verifier('contraste AA du bouton armé', cArme >= 4.5, cArme.toFixed(2));
  verifier('contraste AA de l’interrupteur', cInter >= 4.5, cInter.toFixed(2));
  await page.fill(`#note-${ID}`, 'Pas maintenant');
  await page.getByRole('button', { name: 'Confirmer : refuser', exact: true }).click();
  await page.waitForTimeout(400);
  verifier('un seul envoi', journal.posts.length === 1, JSON.stringify(journal.posts));
  verifier('corps exact', JSON.stringify(journal.posts[0]) === JSON.stringify({ action: 'arbitrer', decision: 'REFUSEE', id: ID, notes: 'Pas maintenant' }), JSON.stringify(journal.posts[0]));
  verifier('liste relue après décision', journal.gets >= 2);
  verifier('statut affiché « Refusée »', /Refusée/.test(await page.textContent('#supervision-corps')));
  verifier('plus aucun geste sur une décision tranchée', (await page.locator('.supervision-bouton').count()) === 0);
  verifier('annonce de réussite', /Proposition refusée/.test(await page.textContent('.supervision-annonce')));
  verifier('aucune erreur console', journal.erreurs.length === 0, journal.erreurs.join(' | '));
  verifier('aucune requête externe', journal.externes.length === 0, journal.externes.join(' | '));
  await page.close();
}

console.log('§3 bis — une ligne non contrôlée (entrée hors sas) est dite comme telle');
{
  const brute = { ...ligne(), preuves_connues: false };
  const { page } = await ouvrir({ lire: () => ({ status: 200, body: { ok: true, data: { propositions: [brute], soumission_active: false } } }) });
  const t = await page.textContent('#supervision-corps');
  verifier('« introuvable au catalogue » affiché', /introuvable au catalogue : dossier non contrôlé/.test(t), t);
  verifier('jamais « existent » pour elle', !/existent au catalogue/.test(t));
  await page.close();
}
{
  const inconnue = { ...ligne(), preuves_connues: undefined };
  const { page } = await ouvrir({ lire: () => ({ status: 200, body: { ok: true, data: { propositions: [inconnue], soumission_active: false } } }) });
  verifier('index indisponible : non vérifié', /non vérifiée/.test(await page.textContent('#supervision-corps')));
  await page.close();
}

console.log('§4 — un conflit (déjà tranchée ailleurs) se dit par sa cause');
{
  const { page, journal } = await ouvrir({
    lire: () => ({ status: 200, body: { ok: true, data: { propositions: [ligne()], soumission_active: true } } }),
    ecrire: () => ({ status: 409, body: { ok: false, error: 'Proposition déjà tranchée' } }),
  });
  await page.getByRole('button', { name: 'Retirer', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmer : retirer', exact: true }).click();
  await page.waitForTimeout(400);
  verifier('corps de retrait exact', JSON.stringify(journal.posts[0]) === JSON.stringify({ action: 'retirer', id: ID }), JSON.stringify(journal.posts[0]));
  verifier('409 dit « déjà tranchée »', /déjà tranchée/.test(await page.textContent('.supervision-annonce')));
  await page.close();
}

console.log('§5 — 390 px : pas de défilement horizontal');
{
  const page = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
  await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({ contentType: 'application/javascript',
    body: 'window.supabase={createClient:function(){return{auth:{getSession:function(){return Promise.resolve({data:{session:{user:{id:"u"},access_token:"jeton-factice"}}})},onAuthStateChange:function(){}}}}};' }));
  await page.route('**/api/finubar', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: FINUBAR }) }));
  await page.route('**/api/supervision', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { propositions: [ligne()], soumission_active: true } }) }));
  await page.goto(`${BASE}/finubar.html`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  verifier('aucun débordement horizontal', debord <= 1, String(debord));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== smoke-supervision-cockpit : TOUT VERT ===' : `\n=== smoke-supervision-cockpit : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
