// Cartouche réel → vrai handler → fournisseur factice → réponse affichée.
// HTTP local uniquement ; ne prétend pas tester le raisonnement du modèle réel.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creerRoute } from './fixtures/leo-zoh-route.mjs';
import { decrireStockZoh } from '../api/_lib/leo-zohshia.mjs';

const BASE = 'http://127.0.0.1:8123';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const entry = html.match(/<button\b[^>]*id="leo-mission-ouvrir"[^>]*>[\s\S]*?<\/button>/)?.[0];
const dialog = html.match(/<dialog id="leo-mission-dialog"[\s\S]*?<\/dialog>/)?.[0];
assert.ok(entry && dialog, 'éléments extraits du produit actuel');
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || chromium.executablePath() });
try {
  for (const largeur of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width: largeur, height: 844 } });
    const erreurs = [], appelsInterdits = [];
    const retour = 'Réponse de transport : une brique ZOH est candidate, guides à vérifier.';
    const api = creerRoute({ content: [{ type: 'text', text: retour }] });
    page.on('pageerror', e => erreurs.push(String(e)));
    await page.route('**/*', route => {
      const u = new URL(route.request().url());
      if (u.origin !== BASE || u.pathname.startsWith('/api/')) {
        appelsInterdits.push(u.origin === BASE ? u.pathname : u.origin);
        return route.abort();
      }
      return route.continue();
    });
    await page.route(BASE + '/__leo_stock_zoh_fixture__', route => route.fulfill({
      contentType: 'text/html', body: '<!doctype html><html lang="fr"><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/leo.css"><body>' + entry + dialog +
        '<script src="/js/leo-registre-client.js"></script><script src="/js/leo-registre-ui.js"></script><script src="/js/leo-accueil.js"></script></body></html>'
    }));
    let corpsRecu;
    await page.route(BASE + '/api/leo', async route => {
      corpsRecu = route.request().postDataJSON();
      assert.match(route.request().headers().authorization || '', /^Bearer /);
      const r = await api.handler({ method: route.request().method(), body: corpsRecu }, {});
      await route.fulfill({ status: r.status, contentType: 'application/json',
        body: JSON.stringify(r.status === 200 ? { ok: true, data: r.data } : { ok: false, error: r.message }) });
    });
    await page.goto(BASE + '/__leo_stock_zoh_fixture__');
    await page.evaluate(() => {
      window.UltimaLeoRegistreUI.poserSession({ user: { id: '11111111-2222-4333-8444-555555555555' }, access_token: 'fixture-token' });
      window.UltimaLeo.accueillirQuadrant({ quadrant: 'ultima', forcer: true, sansPropositions: true,
        salutation: 'Recette du stock', sections: [], voix: { quadrant: 'ultima', jeton: 'fixture-token' } });
    });
    const demande = 'On démarre une présentation commerciale ; regarde ce que nous avons déjà dans ZOH.';
    await page.locator('.leo-voix-champ').fill(demande);
    await page.locator('.leo-voix-envoyer').click();
    await page.getByText(retour, { exact: true }).waitFor();
    assert.equal(corpsRecu.messages.at(-1).content, demande);
    assert.equal(api.journal.requetes.length, 1);
    const appel = api.journal.requetes[0];
    assert.ok(appel.system.some(b => b.text.includes('catalogue_zoh_non_autoritatif=' + decrireStockZoh())));
    assert.ok(JSON.stringify(appel.messages).includes(demande));
    assert.equal(api.journal.ouvertures.length, 1);
    assert.equal(api.journal.clotures.length, 1);
    assert.deepEqual(appelsInterdits, []);
    assert.deepEqual(erreurs, []);
    console.log(`OK ${largeur} : cartouche → contexte ZOH serveur → fournisseur factice → réponse visible, zéro appel externe`);
    await page.close();
  }
} finally { await browser.close(); }
