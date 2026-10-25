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
  a.reponse(async () => ({ reponse: 'Le même plan.', interaction: { plan: PLAN } }));
  await a.envoyer('Rappelle-moi le plan courant.');
  verifier('Un plan identique reproposé ne demande pas une adoption supplémentaire',
    await a.page.locator('.leo-suivi-adopter').count() === 0);
  a.reponse(async () => ({ reponse: 'On poursuit.',
    interaction: { focus: { numero: 1, texte: 'Rappel après réinitialisation interdit' } } }));
  await a.envoyer('ok');
  verifier('Le même plan puis ok ne remet ni compteur ni confirmations à zéro',
    a.appels.at(-1).interaction.rappels_focus === 2 &&
    JSON.stringify(a.appels.at(-1).interaction.tache.confirmes) === '[0]' &&
    await a.page.getByText('Rappel après réinitialisation interdit', { exact: true }).count() === 0);
  const revision = { ...PLAN, etapes: ['Vérifier', 'Préparer', 'Recevoir'] };
  a.reponse(async () => ({ reponse: 'Ordre ajusté.', interaction: { plan: revision } }));
  await a.envoyer('Ajuste l’ordre des étapes de la même tâche.');
  await a.page.locator('.leo-suivi-adopter').click();
  a.reponse(async () => ({ reponse: 'Même tâche.' }));
  await a.envoyer('Où en sommes-nous ?');
  verifier('Réviser le plan conserve deux rappels et le jalon déclaré, après réordonnancement',
    a.appels.at(-1).interaction.rappels_focus === 2 &&
    JSON.stringify(a.appels.at(-1).interaction.tache.confirmes) === '[1]' && (await a.jauge()).valeur === 1);
  a.reponse(async () => ({ reponse: 'Nouvelle tâche cadrée.', interaction: { plan: PLAN } }));
  await a.envoyer('Nouvelle tâche : préparer un autre résultat.');
  await a.page.locator('.leo-suivi-adopter').click();
  a.reponse(async () => ({ reponse: 'Nouveau suivi.' }));
  await a.envoyer('Récapitule cette nouvelle tâche.');
  verifier('Seule une nouvelle tâche explicite repart sans rappels ni confirmations',
    a.appels.at(-1).interaction.rappels_focus === 0 &&
    a.appels.at(-1).interaction.tache.confirmes.length === 0);
  for (const n of [1, 2, 3]) await a.envoyer('étape ' + n + ' terminée');
  a.reponse(async () => ({ reponse: 'Jalons déclarés terminés.',
    interaction: { focus: { numero: 1, texte: 'Rappel après tâche terminée interdit' } } }));
  await a.envoyer('Tous les jalons sont confirmés.');
  verifier('Aucun rappel reçu n’apparaît après la confirmation de tous les jalons',
    (await a.jauge()).valeur === 3 && a.appels.at(-1).interaction.rappels_focus === 0 &&
    await a.page.getByText('Rappel après tâche terminée interdit', { exact: true }).count() === 0);
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
  await b.envoyer('On change de sujet sans perdre le point de reprise');
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
  // Un « ok » ne doit jamais adopter une proposition d'avant le changement
  // d'intention, ni une proposition remplacée par le plan déjà courant.
  const d = await fixture();
  await d.proposer();
  await d.page.locator('.leo-suivi-adopter').click();
  await d.envoyer('étape 1 terminée');
  for (const numero of [1, 2]) {
    d.reponse(async () => ({ reponse: 'Idée notée.', interaction: { focus: { numero, texte: 'Gain initial ' + numero } } }));
    await d.envoyer('Une piste ' + numero);
  }
  const autre = { titre: 'Autre résultat', etapes: ['Recueillir', 'Recevoir'] };
  d.reponse(async () => ({ reponse: 'Révision proposée.', interaction: { plan: autre } }));
  await d.envoyer('Propose une révision du plan actuel.');
  verifier('Une proposition est réellement en attente avant le changement de tâche', await d.page.locator('.leo-suivi-adopter').count() === 1);
  const ancienBouton = await d.page.locator('.leo-suivi-adopter').elementHandle();
  d.reponse(async () => ({ reponse: 'Quel résultat vises-tu ?' }));
  await d.envoyer('Nouvelle tâche : un devis client.');
  await d.envoyer('ok');
  verifier('Une nouvelle intention sans nouveau plan invalide l’ancienne proposition',
    await d.page.locator('.leo-suivi-adopter').count() === 0 &&
    d.appels.at(-1).interaction.rappels_focus === 2 &&
    d.appels.at(-1).interaction.tache.titre === PLAN.titre && (await d.jauge()).valeur === 1);
  d.reponse(async () => ({ reponse: 'Voici le nouveau plan.', interaction: { plan: autre } }));
  await d.envoyer('Cadre cette nouvelle tâche.');
  await ancienBouton.evaluate(bouton => bouton.click());
  verifier('Un ancien bouton ne peut adopter le nouveau candidat à sa place',
    (await d.jauge()).valeur === 1 && await d.page.locator('.leo-suivi-adopter').count() === 1);
  d.reponse(async () => ({ reponse: 'On reprend le travail précédent.' }));
  await d.envoyer('reprenons');
  await d.envoyer('ok');
  verifier('Reprendre la tâche précédente invalide le candidat de la nouvelle tâche',
    await d.page.locator('.leo-suivi-adopter').count() === 0 &&
    d.appels.at(-1).interaction.rappels_focus === 2 && d.appels.at(-1).interaction.tache.titre === PLAN.titre);
  d.reponse(async () => ({ reponse: 'Révision proposée.', interaction: { plan: autre } }));
  await d.envoyer('Propose une révision de la même tâche.');
  d.reponse(async () => ({ reponse: 'Voici le plan courant.', interaction: { plan: PLAN } }));
  await d.envoyer('Rappelle plutôt le plan courant.');
  verifier('Restituer le plan courant retire la révision périmée', await d.page.locator('.leo-suivi-adopter').count() === 0);
  d.reponse(async () => ({ reponse: 'Nouvelle tâche proposée.', interaction: { plan: autre } }));
  await d.envoyer('Nouvelle tâche : un résultat distinct.');
  const remplacement = { titre: 'Plan de remplacement', etapes: ['Préparer', 'Contrôler'] };
  d.reponse(async () => ({ reponse: 'Priorité ajustée.', interaction: { plan: remplacement } }));
  await d.envoyer('Urgence : ajuste la priorité.');
  await d.page.locator('.leo-suivi-adopter').click();
  d.reponse(async () => ({ reponse: 'Même suivi.' }));
  await d.envoyer('Où en sommes-nous ?');
  verifier('Une priorité sans nouvelle tâche révoque l’intention précédente', d.appels.at(-1).interaction.rappels_focus === 2);
  d.reponse(async () => ({ reponse: 'Nouvelle tâche proposée.', interaction: { plan: autre } }));
  await d.envoyer('Nouvelle tâche : un autre chantier.');
  d.reponse(async () => ({ reponse: 'Candidat remplacé.', interaction: { plan: { ...remplacement, titre: 'Candidat encore différent' } } }));
  await d.envoyer('Propose une variante du candidat.');
  await d.page.locator('.leo-suivi-adopter').click();
  d.reponse(async () => ({ reponse: 'Suivi conservé.' }));
  await d.envoyer('Vérifie le compteur.');
  verifier('Remplacer le candidat révoque son ancienne intention de nouvelle tâche',
    d.appels.at(-1).interaction.rappels_focus === 2 &&
    await d.page.getByText('Le plan proposé a changé. Le suivi courant est conservé ; demande une nouvelle tâche pour repartir séparément.', { exact: true }).count() === 1);
  await d.terminer();

  const e = await fixture();
  for (const numero of [1, 2]) {
    e.reponse(async () => ({ reponse: 'Idée conservée.', interaction: { focus: { numero, texte: 'Gain sans plan ' + numero } } }));
    await e.envoyer('Une piste sans plan ' + numero);
  }
  verifier('Deux rappels sont effectivement affichés avant tout plan', await e.page.getByText('Gain sans plan 2', { exact: true }).count() === 1);
  e.reponse(async () => ({ reponse: 'Nouveau plan.', interaction: { plan: PLAN } }));
  await e.envoyer('Nouvelle tâche : préparer ce chantier.');
  await e.page.locator('.leo-suivi-adopter').click();
  e.reponse(async () => ({ reponse: 'Suivi neuf.' }));
  await e.envoyer('Où en est cette nouvelle tâche ?');
  verifier('Nouvelle tâche explicite sans ancien plan : compteur remis à zéro', e.appels.at(-1).interaction.rappels_focus === 0);
  await e.terminer();
  console.log(`${controles} contrôles navigateur réussis ; réponses IA simulées, pas de recette du ton du modèle.`);
} finally {
  await browser.close();
}
