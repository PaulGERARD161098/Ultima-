// Recette du vrai cartouche avec réponses HTTP fictives : aucun modèle ni
// service métier appelé. Complète les tests de fonctions pures et l'accueil.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:8123';
const PLAN = { titre: 'Finir le chantier Léo', etapes: ['Préparer', 'Vérifier', 'Recevoir'] };
const CACHE = new URL('./.cache/', import.meta.url).pathname;
mkdirSync(CACHE, { recursive: true });
let controles = 0;
function verifier(nom, valeur) { assert.ok(valeur, nom); controles++; console.log('OK ' + nom); }
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || chromium.executablePath()
});

async function fixture(viewport = { width: 1280, height: 850 }) {
  const page = await browser.newPage({ viewport });
  const erreurs = [], sorties = [], appels = [];
  let repondre = async () => ({ reponse: 'Réponse de test.' });
  page.on('pageerror', e => erreurs.push(String(e)));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== BASE) { sorties.push(url.href); return route.abort(); }
    if (url.pathname.startsWith('/api/')) {
      sorties.push(url.pathname); return route.abort();
    }
    return route.continue();
  });
  await page.route(BASE + '/__leo_interaction_fixture__', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/leo.css"><title>Recette Léo</title><body><script src="/js/leo-accueil.js"></script></body></html>'
  }));
  await page.route(BASE + '/api/leo', async route => {
    const corps = route.request().postDataJSON(); appels.push(corps);
    const data = await repondre(corps);
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data }) });
  });
  await page.goto(BASE + '/__leo_interaction_fixture__');
  await page.evaluate(() => window.UltimaLeo.accueillirQuadrant({
    quadrant: 'riven', forcer: true, sansPropositions: true,
    salutation: 'Recette isolée', sections: [],
    voix: { quadrant: 'riven', jeton: 'fixture-sans-session-reelle' }
  }));
  await page.locator('.leo-voix-champ').waitFor();
  async function envoyer(texte, attendre = true) {
    await page.locator('.leo-voix-champ').fill(texte);
    await page.locator('.leo-voix-envoyer').click();
    if (attendre) await page.waitForFunction(() => {
      const champ = document.querySelector('.leo-voix-champ');
      return champ && !champ.disabled && !document.querySelector('.leo-bulle-attente');
    });
  }
  async function proposer() {
    repondre = async () => ({ reponse: 'Voici le plan.', interaction: { plan: PLAN } });
    await envoyer('Cadre ce chantier.');
    await page.locator('.leo-suivi-adopter').waitFor();
  }
  const jauge = () => page.locator('.leo-suivi-tache progress').evaluate(p => ({ valeur: p.value, total: p.max }));
  async function terminer() {
    verifier('Aucun service externe ou métier appelé', sorties.length === 0);
    verifier('Aucune erreur JavaScript du cartouche', erreurs.length === 0);
    await page.close();
  }
  return { page, appels, envoyer, proposer, jauge, terminer,
    reponse: f => { repondre = f; } };
}

try {
  // Adoption, numérotation, idempotence d'un jalon et bornage à deux rappels.
  const a = await fixture();
  await a.proposer();
  verifier('Une proposition ne confirme aucun jalon', await a.page.locator('.leo-suivi-tache progress').count() === 0);
  await a.page.locator('.leo-suivi-adopter').click();
  verifier('Le plan adopté conserve ses trois jalons numérotés', await a.page.locator('.leo-suivi-tache ol li').count() === 3);
  verifier('Adopter ne rappelle pas le modèle', a.appels.length === 1);
  verifier('La jauge débute à zéro sur trois', JSON.stringify(await a.jauge()) === JSON.stringify({ valeur: 0, total: 3 }));
  await a.envoyer('étape 1 terminée');
  await a.envoyer('étape 1 terminée');
  verifier('Confirmer deux fois le même jalon ne compte qu’une fois', (await a.jauge()).valeur === 1 && a.appels.length === 1);
  for (const numero of [1, 2, 3]) {
    a.reponse(async () => ({ reponse: 'Piste conservée.',
      interaction: { focus: { numero, texte: 'Gain de fin de tâche ' + numero } } }));
    await a.envoyer('Une autre idée numéro ' + numero);
  }
  verifier('Deux rappels affichés et troisième réponse structurée refusée',
    await a.page.getByText('Gain de fin de tâche 1', { exact: true }).count() === 1 &&
    await a.page.getByText('Gain de fin de tâche 2', { exact: true }).count() === 1 &&
    await a.page.getByText('Gain de fin de tâche 3', { exact: true }).count() === 0);
  verifier('Les contextes portent les compteurs réellement consommés',
    JSON.stringify(a.appels.slice(1).map(c => c.interaction.rappels_focus)) === '[0,1,2]');
  verifier('Une réponse du modèle ne fait pas avancer les jalons', (await a.jauge()).valeur === 1);
  await a.terminer();

  // Changement de priorité explicite : aucune insistance, reprise sans reset.
  const b = await fixture({ width: 390, height: 844 });
  await b.proposer();
  await b.envoyer('Je valide le plan');
  verifier('Adoption par dictée sans appel IA supplémentaire', b.appels.length === 1 && (await b.jauge()).valeur === 0);
  b.reponse(async () => ({ reponse: 'Idée notée.',
    interaction: { focus: { numero: 1, texte: 'Premier gain avant la pause' } } }));
  await b.envoyer('Autre piste à mettre de côté.');
  verifier('Un rappel est effectivement affiché avant la pause',
    await b.page.getByText('Premier gain avant la pause', { exact: true }).count() === 1);
  b.reponse(async () => ({ reponse: 'Je suis ta priorité.',
    interaction: { focus: { numero: 2, texte: 'Rappel pendant la pause interdit' } } }));
  await b.envoyer('Ok point d’étape validé. Avançons sur un autre sujet');
  verifier('Le changement de cap suspend la tâche dans le contexte', b.appels.at(-1).interaction.tache.etat === 'suspendue');
  verifier('Même un rappel reçu du serveur reste supprimé pendant la pause',
    await b.page.getByText('Rappel pendant la pause interdit', { exact: true }).count() === 0);
  verifier('Le point de reprise est visible', (await b.page.locator('.leo-suivi-etat').textContent()).includes('En pause — reprise : Préparer'));
  b.reponse(async () => ({ reponse: 'On reprend.' }));
  await b.envoyer('reprenons');
  verifier('La reprise conserve le plan et le rappel déjà consommé',
    b.appels.at(-1).interaction.tache.etat === 'en_cours' &&
    b.appels.at(-1).interaction.tache.titre === PLAN.titre &&
    b.appels.at(-1).interaction.rappels_focus === 1);
  verifier('La provenance du suivi reste lisible après reprise', await b.page.locator('.leo-suivi-source').isVisible());
  verifier('Pas de débordement horizontal sur téléphone', await b.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await b.page.screenshot({ path: CACHE + '/leo-interaction-mobile.png', fullPage: true });
  await b.terminer();

  // Une requête longue n'invente pas de progrès et verrouille le plan proposé.
  const c = await fixture();
  await c.proposer();
  const taille = await c.page.locator('.leo-suivi-adopter').boundingBox();
  verifier('Bouton d’adoption haut d’au moins 44px', taille && taille.height >= 44);
  let liberer;
  const attente = new Promise(resolve => { liberer = resolve; });
  c.reponse(async () => { await attente; return { reponse: 'Réponse terminée.' }; });
  await c.envoyer('Précise le résultat avant adoption.', false);
  await c.page.locator('.leo-bulle-attente progress').waitFor();
  verifier('La jauge d’attente est indéterminée', await c.page.locator('.leo-bulle-attente progress').getAttribute('value') === null);
  verifier('L’adoption est désactivée pendant la requête', await c.page.locator('.leo-suivi-adopter').isDisabled());
  await c.page.locator('.leo-suivi-adopter').evaluate(bouton => bouton.click());
  verifier('Le clic ne crée pas de tâche au milieu d’un appel', await c.page.locator('.leo-suivi-tache progress').count() === 0);
  liberer();
  await c.page.waitForFunction(() => !document.querySelector('.leo-voix-champ').disabled);
  verifier('L’adoption redevient disponible à la fin de l’appel', await c.page.locator('.leo-suivi-adopter').isEnabled());
  await c.terminer();
  console.log(`${controles} contrôles navigateur réussis ; réponses IA simulées, pas de recette du ton du modèle.`);
} finally {
  await browser.close();
}
