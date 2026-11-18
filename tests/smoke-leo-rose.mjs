import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

// Toutes les réponses viennent du checkout ou des fixtures. Aucune socket de serveur.
const origine = 'https://ultima.test';
const types = { html: 'text/html', mjs: 'application/javascript', js: 'application/javascript', css: 'text/css', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const navigateur = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
try {
  for (const mobile of [false, true]) {
    const contexte = await navigateur.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 },
    });
    await contexte.addInitScript(({ mobile }) => {
      window.webkitSpeechRecognition = undefined;
      window.SpeechRecognition = mobile ? class {
        start() {
          this.onstart?.();
          const segment = [{ transcript: 'Ouvre la première priorité' }];
          segment.isFinal = true;
          this.onresult?.({ resultIndex: 0, results: [segment] });
        }
        stop() { this.onend?.(); }
        abort() { window.dicteeAnnulee = true; this.onend?.(); }
      } : undefined;
    }, { mobile });
    let reponse = { ok: true, data: { riven: { relances_dues: 2 } } };
    let appels = 0;
    await contexte.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origine) return route.abort();
      if (url.pathname === '/js/vendor/supabase-js-2.110.0.min.js') {
        return route.fulfill({ contentType: 'application/javascript', body: `
          const auth = {
            getSession: async () => ({ data: { session: JSON.parse(sessionStorage.getItem('session-test')) } }),
            onAuthStateChange: (fn) => {
              window.sessionDeTest = (evenement, session) => {
                sessionStorage.setItem('session-test', JSON.stringify(session));
                fn(evenement, session);
              };
            },
          };
          window.supabase = { createClient: () => ({ auth }) };` });
      }
      if (url.pathname === '/api/cockpit') {
        assert.equal(route.request().headers().authorization, 'Bearer session-fictive');
        appels += 1;
        return route.fulfill({ status: reponse ? 200 : 503, json: reponse || { ok: false } });
      }
      if (url.pathname === '/api/reseau') {
        return route.fulfill({ json: { ok: true, data: {
          nodes: [{ id: 'test', nom: 'Contact fictif', type: 'personne' }],
          journal: [
            { id: 'relance-1', node_id: 'test', prochaine_etape: 'Relance fictive A', relance_at: '2026-01-01' },
            { id: 'relance-2', node_id: 'test', prochaine_etape: 'Relance fictive B', relance_at: '2026-01-01' },
          ],
        } } });
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, data: null } });
      if (!/^\/[a-z0-9_./-]+$/i.test(url.pathname) || url.pathname.split('/').includes('..')) return route.abort();
      const type = types[url.pathname.split('.').at(-1)];
      if (!type) return route.fulfill({ status: 404 });
      const path = fileURLToPath(new URL('..' + url.pathname, import.meta.url));
      return route.fulfill({ path, contentType: type }).catch(() => route.fulfill({ status: 404 }));
    });
    const page = await contexte.newPage();
    await page.goto(origine + '/index.html');
    await page.waitForFunction(() => typeof window.sessionDeTest === 'function');
    const ouvrir = page.getByRole('button', { name: 'Rose des vents', exact: true });
    assert.equal(await ouvrir.isVisible(), false);
    assert.equal(appels, 0);

    await page.evaluate(() => window.sessionDeTest('SIGNED_IN', { access_token: 'session-fictive' }));
    await ouvrir.click();
    const rose = page.getByRole('dialog', { name: 'Rose des vents' });
    await rose.getByRole('button', { name: /2 relances à traiter/ }).waitFor();
    assert.equal(await rose.locator('.leo-rose-aiguille').count(), 6);
    const micro = rose.getByRole('button', { name: /Dicter/ });
    assert.equal(await micro.count(), mobile ? 1 : 0);
    assert.equal(await rose.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
    const champ = rose.getByRole('textbox', { name: 'Sur quoi veux-tu avancer ?' });
    await rose.getByRole('button', { name: 'Donner un cap à Léo' }).click();
    assert.equal(await champ.evaluate((el) => el === document.activeElement), true);
    const saisir = async (texte) => { await champ.fill(texte); await champ.press('Enter'); };
    await saisir('Ouvre ça');
    await rose.getByText(/Quel projet veux-tu ouvrir/).waitFor();
    await saisir('Ouvre Artidispo et Riven');
    await rose.getByText(/Artidispo ou Riven/).waitFor();

    if (mobile) await micro.click();
    await page.evaluate(() => window.sessionDeTest('SIGNED_OUT', null));
    await rose.waitFor({ state: 'hidden' });
    if (mobile) assert.equal(await page.evaluate(() => window.dicteeAnnulee), true);
    assert.equal(await page.getByText('2 relances à traiter').count(), 0);
    await page.evaluate(() => window.sessionDeTest('SIGNED_IN', { access_token: 'session-fictive' }));
    reponse = null;
    await ouvrir.click();
    await rose.getByText('Source Riven indisponible.').waitFor();
    assert.equal(await rose.getByRole('listitem').count(), 0);
    await rose.getByRole('button', { name: 'Fermer', exact: true }).click();

    reponse = { ok: true, data: { riven: { relances_dues: 2 } } };
    await ouvrir.click();
    await rose.getByRole('button', { name: /2 relances à traiter/ }).waitFor();
    if (mobile) {
      await micro.click();
      assert.equal(await champ.inputValue(), 'Ouvre la première priorité');
      await champ.press('Enter');
    } else {
      await saisir('Ouvre la première priorité');
    }
    await page.waitForURL('**/riven.html?vue=relances');
    await page.waitForFunction(() => !document.getElementById('espace-accueil').hidden);
    assert.equal(await page.locator('#espace-ciel').isVisible(), false);
    await page.locator('.zone-relances').getByRole('button', { name: /Relance fictive A/ }).waitFor();
    assert.equal(await page.locator('.zone-relances .item-relance').count(), 2);
    await page.goto(origine + '/index.html');
    await ouvrir.click();
    await rose.locator('[data-cap="riven"] .leo-rose-nom').click();
    await page.waitForURL('**/riven.html?vue=relances');
    console.log(`Rose de Léo · ${mobile ? 'mobile' : 'ordinateur'} · navigation, session et panne de source`);
    await contexte.close();
  }
} finally {
  await navigateur.close();
}
