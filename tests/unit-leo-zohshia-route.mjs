// Transport du vrai handler ; ne prouve pas le raisonnement du modèle réel.
import assert from 'node:assert/strict';
import * as leo from '../api/_lib/leo.js';
import { decrireStockZoh } from '../api/_lib/leo-zohshia.mjs';
import { creerRoute } from './fixtures/leo-zoh-route.mjs';
import { readFileSync } from 'node:fs';
const stock = JSON.parse(decrireStockZoh());
const NOMINAL = [{ type: 'text', text: 'Une brique candidate reste à vérifier pour ce projet.' }];
// Les sorties sont issues d'une simulation Work, pas du modèle de production.
// On éprouve ici leur consommation par le handler et le parseur réels.
const comportement = JSON.parse(readFileSync(new URL('./fixtures/leo-zoh-comportement.json', import.meta.url), 'utf8'));
assert.equal(comportement.cas.length, 7);
for (const cas of comportement.cas) {
  const r = creerRoute({ content: [{ type: 'text', text: cas.reponse }] });
  const resultat = await r.handler({ method: 'POST', body: { quadrant: 'ultima',
    messages: [{ role: 'user', content: cas.demande }] } }, {});
  assert.equal(resultat.status, 200, cas.id);
  assert.ok(resultat.data.reponse.length > 0, cas.id);
  assert.ok(!resultat.data.reponse.includes('<leo_plan>'), 'balise interne non affichée : ' + cas.id);
  assert.equal(Boolean(resultat.data.interaction?.plan), cas.plan_attendu, cas.id);
  assert.equal(resultat.data.proposition, undefined, 'pas d’activation : ' + cas.id);
}
const scenarios = [
  ['ultima', 'On démarre un projet de présentation commerciale de huit pages.'],
  ['riven', 'On crée un outil de devis depuis une dictée pour un nouveau professionnel.'],
  ['bcp', 'On démarre une méthode pour vérifier les calculs de rentabilité.'],
  ['adramelech', 'Je lance un service et je veux pouvoir le superviser et l’arrêter.'],
  ['imladrik', 'Nouveau projet personnel de jardinage. Que peut-on réutiliser ?'],
  ['finubar', 'On démarre un projet ; regarde les technologies existantes avant de construire.']
];
for (const [quadrant, demande] of scenarios) {
  const r = creerRoute();
  const body = { quadrant, messages: [{ role: 'user', content: demande }],
    catalogue_zoh: { technos: [{ id: 'FAUX_STOCK_CLIENT' }] } };
  const avant = structuredClone(body);
  const reponse = await r.handler({ method: 'POST', body }, {});
  assert.equal(reponse.status, 200);
  assert.equal(r.journal.requetes.length, 1, 'un seul appel');
  assert.equal(r.journal.ouvertures.length, 1);
  assert.equal(r.journal.clotures[0][2].phase, 'reussie');
  const requete = r.journal.requetes[0];
  const systeme = requete.system.map(b => b.text).join('\n');
  assert.ok(systeme.includes('catalogue_zoh_non_autoritatif=' + decrireStockZoh()));
  for (const t of stock.technos) assert.ok(systeme.includes(t.capacites_apercu.texte));
  assert.ok(!systeme.includes('FAUX_STOCK_CLIENT'), 'le navigateur ne remplace pas le stock serveur');
  assert.ok(JSON.stringify(requete.messages).includes(demande));
  assert.ok(systeme.includes('rappels') || systeme.includes('recentrage'), 'interaction récente préservée');
  assert.equal(r.journal.sdk[0].maxRetries, 0);
  assert.equal(r.journal.sdk[0].timeout, 30000);
  assert.deepEqual(requete.tools || [], leo.outilsPour(quadrant) || []);
  assert.ok(!reponse.data.proposition, 'consulter ne crée aucune proposition d’exécution');
  assert.deepEqual(body, avant, 'le contexte reçu reste inchangé');
}
const body = { quadrant: 'ultima', messages: [{ role: 'user', content: 'On démarre un projet.' }] };
for (const [auth, status] of [['unauthenticated',401], ['interdit',403], ['unconfigured',503], ['reserve_non_regle',503]]) {
  const r = creerRoute({ auth });
  assert.equal((await r.handler({ method: 'POST', body }, {})).status, status);
  assert.equal(r.journal.sdk.length, 0);
  assert.equal(r.journal.ouvertures.length, 0);
}
for (const [requete, status] of [
  [{ method: 'GET', body },405],
  [{ method: 'POST', body: { ...body, quadrant: 'inconnu' } },400],
  [{ method: 'POST', body: { ...body, messages: [] } },400]
]) {
  const r = creerRoute();
  assert.equal((await r.handler(requete, {})).status, status);
  assert.equal(r.journal.sdk.length, 0);
  assert.equal(r.journal.ouvertures.length, 0);
}
{
  const r = creerRoute({ quota: false });
  assert.equal((await r.handler({ method: 'POST', body }, {})).status, 429);
  assert.equal(r.journal.sdk.length, 0);
}
{
  const r = creerRoute({ content: [...NOMINAL, { type: 'tool_use', name: 'installer_techno_zoh', input: { secret: 'ARGUMENT_PRIVE' } }] });
  const reponse = await r.handler({ method: 'POST', body }, {});
  assert.equal(reponse.status, 200);
  assert.equal(reponse.data.proposition, undefined, 'un outil inventé par le modèle est refusé');
  assert.ok(!JSON.stringify(r.journal.logs).includes('ARGUMENT_PRIVE'));
}
{
  const r = creerRoute({ panne: true });
  const reponse = await r.handler({ method: 'POST', body }, {});
  assert.equal(reponse.status, 502);
  assert.ok(!JSON.stringify(reponse).includes('DETAIL_FOURNISSEUR_PRIVE'));
  assert.equal(r.journal.clotures[0][2].phase, 'echouee');
}
console.log('UNIT-LEO-ZOHSHIA-ROUTE OK : six scénarios, contexte serveur, garde propriétaire et plafond, aucun nouvel outil');
