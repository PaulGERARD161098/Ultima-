// ZOH SHIA — le générateur de devis (deuxième étoile, 08/10/2026).
// Ce qui est tenu : les montants au centime, l'échappement, les refus, la forme
// devis du gabarit, et la neutralité de l'exemple. Le rendu PDF n'est pas testé
// ici (il dépend d'un navigateur) ; le HTML qu'il imprime, si.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { remplir, montants, centimes, appliquer, euros, echapper, ErreurDevis } from '../zohshia/devis/generer.mjs';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const verdicts = {};
const dit = (nom, ok) => { verdicts[nom] = ok === true; };
const refuse = (f) => { try { f(); return false; } catch (e) { return e instanceof ErreurDevis; } };

const base = () => ({
  numero: 'D-TEST-01', date_emission: '1 janvier 2030', date_validite: '31 janvier 2030',
  taux_tva: '20', acompte_pct: '50',
  emetteur: { nom: 'Émetteur', adresse: '1 VOIE', ville: '00000 VILLE - France', mentions_legales: 'Mentions',
    iban: 'FR76 0000 0000 0000 0000 0000 000', bic: 'XXXXXXXXXXX' },
  client: { nom: 'Client', adresse: '2 VOIE', ville: '00000 VILLE - France' },
  lignes: [{ libelle: 'Prestation', detail: 'Détail', quantite: 1, pu_ht: '500.00' }],
  conditions: ['Responsabilité : texte'],
});

// ---- Les montants, au centime ------------------------------------------------
const m = montants(base());
dit('casConnu500', m.ht === 50000 && m.tva === 10000 && m.ttc === 60000 && m.acompte === 30000 && m.solde === 30000);
dit('centimesSansFlottant', centimes('0.29', 'x') === 29 && centimes('1,1', 'x') === 110 && centimes('500', 'x') === 50000);
dit('arrondiDemiSuperieur', appliquer(5, 5000) === 3 && appliquer(4, 5000) === 2 && appliquer(33333, 2000) === 6667);
const impair = montants({ ...base(), lignes: [{ libelle: 'x', quantite: 3, pu_ht: '111.11' }] });
dit('acomptePlusSoldeEgaleTTC', impair.acompte + impair.solde === impair.ttc && impair.ht === 33333 && impair.tva === 6667 && impair.ttc === 40000);
dit('tauxDecimal', montants({ ...base(), taux_tva: '5,5' }).tva === 2750);
dit('formatEuros', euros(123456789) === '1 234 567,89 €' && euros(5) === '0,05 €');

// ---- Les refus : rien ne sort avec un trou --------------------------------------
dit('refusMontantMalForme', refuse(() => montants({ ...base(), lignes: [{ libelle: 'x', quantite: 1, pu_ht: '5e2' }] })));
dit('refusQuantite', refuse(() => montants({ ...base(), lignes: [{ libelle: 'x', quantite: 1.5, pu_ht: '1' }] })));
dit('refusTaux', refuse(() => montants({ ...base(), acompte_pct: '150' })));
dit('refusSansLigne', refuse(() => montants({ ...base(), lignes: [] })));
dit('refusChampVide', refuse(() => remplir({ ...base(), client: { ...base().client, nom: '  ' } })));
dit('refusIban', refuse(() => remplir({ ...base(), emetteur: { ...base().emetteur, iban: 'pas un iban' } })));
dit('refusNumero', refuse(() => remplir({ ...base(), numero: '../x' })));
dit('refusChampGabaritOrphelin', refuse(() => remplir(base(), { gabarit: '<p>{{INCONNU}}</p>' })));

// ---- L'échappement : une valeur ne devient jamais du code ------------------------
const piege = remplir({ ...base(), client: { ...base().client, nom: '<script>x</script>{{NUMERO}}' } }).html;
dit('echappement', !piege.includes('<script>x') && piege.includes('&lt;script&gt;') && piege.includes('{{NUMERO}}') && echapper(`"'&`) === '&quot;&#39;&amp;');

// ---- La forme devis, sur le HTML réellement produit (verrou de non-vacuité d'abord) ---
const { html } = remplir(base());
dit('verrouHtmlNonVide', html.length > 3000 && html.includes('D-TEST-01'));
dit('formeDevis', html.includes('>Devis<') && !html.includes('>Facture<') && html.includes('Date de validité')
  && html.includes('Bon pour accord') && html.includes('Acompte 50 % à la signature') && html.includes('300,00 €'));
dit('aucunChampResiduel', !/\{\{[A-Z_]+\}\}/.test(html.replace('{{NUMERO}}', '')));
dit('tvaClientFacultative', !html.includes('N° de TVA') && remplir({ ...base(), client: { ...base().client, tva: 'FR00' } }).html.includes('N° de TVA FR00'));

// ---- L'exemple reste neutre et valide dans sa forme -------------------------------
const ex = JSON.parse(readFileSync(join(RACINE, 'zohshia', 'devis', 'exemple.parametres.json'), 'utf8'));
dit('exempleNeutre', ex.lignes?.[0]?.pu_ht === '0.00' && /^D-AAAA/.test(ex.numero) && /0000 0000/.test(ex.emetteur?.iban));

const echecs = Object.entries(verdicts).filter(([, ok]) => !ok).map(([k]) => k);
console.log(JSON.stringify(verdicts, null, 2));
if (echecs.length) {
  console.log(`\n=== ${echecs.length} VERDICT(S) EN ÉCHEC ===\n  ` + echecs.join('\n  '));
  process.exit(1);
}
console.log('\n=== UNIT-ZOHSHIA-DEVIS OK ===');
