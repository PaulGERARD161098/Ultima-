// Unitaires — la cause d'un 502 de Léo, dite en mots FERMÉS (02/10).
// Les journaux Vercel ne sont pas lisibles depuis les séances : c'est la bulle
// qui dit pourquoi l'appel IA a échoué. Jamais le message brut du fournisseur.
import { readFileSync } from 'node:fs';
import { causeEchecIA, MOTIF_CAUSE_IA } from '../api/_lib/leo.js';

const verdicts = {};
const cas = [
  [{ status: 401, message: 'invalid x-api-key' }, 'ia 401'],
  [{ status: 400, message: 'Your credit balance is too low to access the Anthropic API.' }, 'ia 400 crédit'],
  [{ status: 400, message: 'tools.0: invalid schema' }, 'ia 400'],
  [{ status: 429, message: 'rate limited' }, 'ia 429'],
  [{ status: 529, message: 'Overloaded' }, 'ia 529'],
  [{ name: 'APIConnectionTimeoutError' }, 'ia délai'],
  [{ name: 'APIConnectionError' }, 'ia réseau'],
  [null, 'ia réseau'],
  [{ status: 'abc' }, 'ia réseau']
];
verdicts.casConnus = cas.every(([e, attendu]) => causeEchecIA(e) === attendu);
verdicts.toujoursDansLaListe = cas.every(([e]) => MOTIF_CAUSE_IA.test(causeEchecIA(e))) &&
  MOTIF_CAUSE_IA.test('ia vide');
// Le message du fournisseur ne fuit jamais, même s'il porte une adresse.
verdicts.sansMessageBrut = !causeEchecIA({ status: 401, message: 'clé de paul@exemple.fr refusée' }).includes('@');
// Le front filtre avec LA MÊME liste : deux copies, un contrôle qui les compare.
const front = readFileSync(new URL('../js/leo-accueil.js', import.meta.url), 'utf8');
const regexFront = (front.match(/\/\^ia \(.*?\)\$\//) || [''])[0];
verdicts.frontMemeListe = regexFront.length > 0 && regexFront === '/' + MOTIF_CAUSE_IA.source + '/';
// La route passe la cause sur ses deux 502.
const route = readFileSync(new URL('../api/leo.js', import.meta.url), 'utf8');
verdicts.routeDitLaCause = /cause: 'ia vide'/.test(route) && /cause: causeEchecIA\(erreur\)/.test(route);

console.log(JSON.stringify(verdicts, null, 2));
const tout = Object.values(verdicts).every((v) => v === true);
console.log(tout ? 'UNIT-LEO-CAUSE OK' : 'UNIT-LEO-CAUSE ECHEC');
process.exit(tout ? 0 : 1);
