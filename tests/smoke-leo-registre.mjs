// Parcours navigateur du registre LV1 depuis l'accueil réel. Transport et
// identité fictifs : aucun accès Supabase, fournisseur IA ou donnée réelle.
// Exécution uniquement dans le conteneur navigateur CI (tests/lancer.sh).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
const MISSION = '11111111-1111-4111-8111-111111111111';
const TOKEN = 'registre-token-factice';
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.setDefaultTimeout(10000);
const external = [], errors = [], writes = [], reads = [];
page.on('pageerror', error => errors.push(String(error)));
// Refus effectif des sorties : l'observation seule ne suffirait pas.
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.origin !== BASE) { external.push(url.origin); await route.abort(); }
  else await route.continue();
});
await page.route('**/js/vendor/supabase-js-2.110.0.min.js', route => route.fulfill({
  contentType: 'application/javascript',
  body: `(() => {
    let session = { user: { id: '22222222-2222-4222-8222-222222222222' }, access_token: '${TOKEN}' };
    const callbacks = [];
    window.__fixtureLogout = () => { session = null; callbacks.forEach(fn => fn('SIGNED_OUT', null)); };
    window.supabase = { createClient: () => ({ auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: fn => { callbacks.push(fn); return { data: { subscription: { unsubscribe() {} } } }; },
      signOut: async () => { window.__fixtureLogout(); return { error: null }; }
    } }) };
  })();`,
}));
const json = (route, status, body) => route.fulfill({
  status, contentType: 'application/json; charset=utf-8', body: JSON.stringify(body),
});
await page.route('**/api/cockpit', route => json(route, 200, { ok: true, data: {
  reshiram: { talents: 0, a_etayer: 0, offre: 0 },
  zekrom: { ideaux: 0, a_orienter: 0, acquis: 0, a_construire: 0 }, riven: { relances_dues: 0 },
} }));
await page.route('**/api/finubar', route => json(route, 200, { ok: true, data: {
  le: '2026-09-29', projets: [], macro: {}, cartouche: { signaux: [] },
} }));
const registry = {
  mission: { id: MISSION, version: 1, state: 'in_progress', next_action: 'Préparer la recette',
    scope: 'memory', contract_version: '1.1', skill_version: '1.0',
    expires_at: '2099-01-01T00:00:00Z', stopped: false },
  budget: { max_units: 20, max_calls: 20, used_units: 0, calls: 0 },
  operations: [], operations_truncated: false,
};
let mode = 'success';
await page.route('**/api/leo-registre*', async route => {
  const request = route.request();
  assert.equal(request.headers().authorization, `Bearer ${TOKEN}`, 'identité issue de la session');
  if (request.method() === 'GET') {
    assert.equal(new URL(request.url()).searchParams.get('mission'), MISSION);
    reads.push(request.url());
    return json(route, 200, { ok: true, data: registry });
  }
  assert.equal(request.method(), 'POST');
  const body = request.postDataJSON();
  writes.push(body);
  assert.equal(body.mission, MISSION);
  if (body.action === 'stop') {
    registry.mission.stopped = true;
    registry.mission.version++;
    return json(route, 200, { ok: true, data: registry });
  }
  assert.equal(body.action, 'write_memory');
  assert.deepEqual(Object.keys(body).sort(), ['action', 'expected_version', 'mission', 'operation_id', 'patch']);
  assert.equal(body.expected_version, registry.mission.version, 'version du snapshot chargé');
  assert.ok(typeof body.operation_id === 'string' && body.operation_id.length > 0);
  if (mode === 'conflict') {
    registry.mission.version++;
    registry.mission.next_action = 'Modification concurrente';
    return json(route, 409, { ok: false, error: 'Version ou opération divergente : relisez le registre' });
  }
  Object.assign(registry.mission, body.patch);
  registry.mission.version++;
  registry.budget.used_units++;
  registry.budget.calls++;
  const receipt = { operation_id: body.operation_id, status: 'completed', result: {
    mission_version: registry.mission.version, state: registry.mission.state, next_action: registry.mission.next_action,
  } };
  registry.operations.unshift(receipt);
  // L'effet existe mais sa réponse est perdue : la relecture doit retrouver
  // le reçu sans produire un second POST ni une seconde unité consommée.
  if (mode === 'unknown') return json(route, 503, {
    ok: false, error: 'Résultat incertain : consultez le registre avant tout nouvel essai',
  });
  return json(route, 200, { ok: true, data: { ...receipt, replayed: false } });
});

const field = suffix => page.locator('#leo-mission-' + suffix);
async function messageMatches(pattern) {
  await page.waitForFunction(source => new RegExp(source, 'i').test(
    document.getElementById('leo-mission-message').textContent), pattern.source);
}
async function ready() {
  await page.waitForFunction(() => document.getElementById('leo-mission-dialog')?.getAttribute('aria-busy') === 'false');
}
async function refresh(expectedMessage = /Registre relu/) {
  const count = reads.length;
  await field('relire').click();
  await messageMatches(expectedMessage);
  await ready();
  assert.equal(reads.length, count + 1, 'relecture explicite unique');
}
try {
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForFunction(() => !document.getElementById('leo-mission-ouvrir')?.disabled);
  assert.equal(await page.locator('#ecran-connexion').isVisible(), false, 'accueil authentifié réel');
  await field('ouvrir').click();
  assert.equal(await field('dialog').isVisible(), true);
  await field('id').fill(MISSION);
  await field('consulter').click();
  await messageMatches(/Mission consultée/);
  assert.match(await field('courant').textContent(), /En cours.*Version 1/);
  assert.equal(await field('action').inputValue(), 'Préparer la recette');
  assert.equal(reads.length, 1);
  console.log('✅ Entrée accueil authentifiée → consultation de mission');

  await field('action').fill('Recette préparée');
  await field('enregistrer').click();
  await messageMatches(/Mémo enregistré/);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].patch.next_action, 'Recette préparée');
  assert.equal(await field('enregistrer').isEnabled(), false, 'nouvelle lecture exigée');
  await refresh();
  assert.match(await field('courant').textContent(), /Version 2/);
  assert.equal(await field('prochaine').textContent(), 'Recette préparée');
  console.log('✅ Mise à jour avec version attendue → reçu → relecture');

  mode = 'conflict';
  await field('action').fill('Brouillon à conserver');
  await field('enregistrer').click();
  await messageMatches(/mission a changé/);
  assert.equal(writes.length, 2, 'pas de renvoi automatique du conflit');
  assert.equal(await field('action').inputValue(), 'Brouillon à conserver');
  assert.equal(await field('enregistrer').isEnabled(), false);
  await refresh();
  assert.equal(await field('action').inputValue(), 'Brouillon à conserver', 'relecture préserve la saisie');
  assert.equal(await field('prochaine').textContent(), 'Modification concurrente');
  assert.match(await field('courant').textContent(), /Version 3/);
  assert.equal(writes.length, 2);
  console.log('✅ Conflit : version courante et brouillon distincts, aucun rejeu');

  mode = 'unknown';
  await field('action').fill('Réponse perdue mais effet enregistré');
  await field('enregistrer').click();
  await messageMatches(/Résultat non confirmé/);
  assert.equal(writes.length, 3);
  assert.equal(await field('action').inputValue(), 'Réponse perdue mais effet enregistré');
  assert.equal(await field('enregistrer').isEnabled(), false);
  const journal = await page.evaluate(() => sessionStorage.getItem(
    'ultima-leo-recovery:22222222-2222-4222-8222-222222222222'));
  assert.ok(journal, 'marqueur durable avant la réponse');
  assert.equal(journal.includes(TOKEN), false);
  assert.equal(journal.includes('Réponse perdue'), false, 'aucun contenu métier dans le journal');
  assert.equal(JSON.parse(journal).operation_id, writes[2].operation_id);
  // Nouvelle instance réelle de la page : le marqueur survit, pas le brouillon.
  page.on('dialog', dialog => dialog.accept());
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => !document.getElementById('leo-mission-ouvrir')?.disabled);
  await field('ouvrir').click();
  await messageMatches(/Résultat non confirmé/);
  assert.equal(await field('enregistrer').isEnabled(), false);
  await refresh(/Écriture précédente confirmée, aucun nouvel envoi/);
  assert.equal(await field('enregistrer').isEnabled(), false, 'reçu réconcilié sans nouvelle saisie');
  assert.match(await field('courant').textContent(), /Version 4/);
  assert.equal(await field('prochaine').textContent(), 'Réponse perdue mais effet enregistré');
  assert.equal(writes.length, 3, 'reprise après rechargement sans second effet');
  assert.equal(registry.budget.used_units, 2);
  assert.equal(await page.evaluate(() => sessionStorage.getItem(
    'ultima-leo-recovery:22222222-2222-4222-8222-222222222222')), null);
  console.log('✅ Réponse perdue → marqueur minimal → rechargement → reçu sans doublon');

  await field('arreter').click();
  await messageMatches(/Arrêt confirmé/);
  assert.equal(writes.length, 4);
  assert.deepEqual(writes[3], { action: 'stop', mission: MISSION });
  assert.match(await field('courant').textContent(), /Arrêtée/);
  await field('action').fill('Impossible après arrêt');
  assert.equal(await field('enregistrer').isEnabled(), false);
  assert.equal(await field('arreter').isEnabled(), false);
  const fits = await field('dialog').evaluate(el => {
    const box = el.getBoundingClientRect();
    return box.left >= 0 && box.right <= innerWidth + 1 && el.scrollWidth <= el.clientWidth + 1;
  });
  assert.ok(fits, 'dialogue utilisable à 390 px sans débordement horizontal');
  console.log('✅ Arrêt confirmé bloque les écritures ; présentation mobile sans débordement');

  await page.evaluate(() => window.__fixtureLogout());
  assert.equal(await field('dialog').isVisible(), false);
  assert.equal(await field('ouvrir').isEnabled(), false);
  assert.equal(await field('action').inputValue(), '');
  assert.equal(await field('id').inputValue(), '');
  assert.equal(await field('prochaine').textContent(), '');
  assert.equal(await field('courant').textContent(), '');
  assert.equal(writes.length, 4);
  assert.deepEqual(external, [], 'aucune sortie réseau externe');
  assert.deepEqual(errors, [], 'aucune exception navigateur');
  console.log('✅ Déconnexion purge le contenu ; zéro réseau externe et exception');
} finally {
  await context.close();
  await browser.close();
}
