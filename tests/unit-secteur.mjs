// Unitaires validateNode — secteur d'activité (boucle A2, spec §2 + §7 pt 3/6).
// Node pur, zéro réseau. Prouve le miroir API/DB (borne 120) et l'optionalité :
// une entrée invalide donne une ERREUR structurée (→ 400 côté handler), jamais
// une exception (→ 500). Testable SANS la migration 0006 : validate.js ne
// touche pas la base, il valide le corps avant PostgREST.
import { validateNode } from '../api/_lib/validate.js';

const verdicts = {};

// 1. Liste blanche : secteur_activite est accepté (pas « Champ non autorisé »).
//    Sans l'ajout à NODE_FIELDS, rejectUnknown bloquerait tout POST/PATCH.
const vAccepte = validateNode({ type: 'artisan', nom: 'Plomberie Roux', secteur_activite: 'Plomberie' }, 'create');
verdicts.champAutorise = !vAccepte.error && vAccepte.value.secteur_activite === 'Plomberie';

// 2. Optionnel en création : nom seul suffit, aucun secteur émis (futur « À
//    classer » A3). Non-régression du flux nom-seul.
const vNomSeul = validateNode({ type: 'artisan', nom: 'Zoé Sans Secteur' }, 'create');
verdicts.optionnelCreation = !vNomSeul.error && !('secteur_activite' in vNomSeul.value);

// 3. Borne 120 = CHECK SQL 0006. 120 exactement passe, 121 est rejeté par un
//    message d'erreur (400), PAS par une exception (500). Miroir strict.
const vLimite = validateNode({ nom: 'X', secteur_activite: 'a'.repeat(120) }, 'update');
const vTropLong = validateNode({ nom: 'X', secteur_activite: 'a'.repeat(121) }, 'update');
verdicts.borne120 = !vLimite.error && Boolean(vTropLong.error) &&
  vTropLong.error === 'secteur_activite trop long';

// 4. Type invalide (nombre) : erreur structurée, pas d'exception.
const vType = validateNode({ nom: 'X', secteur_activite: 42 }, 'update');
verdicts.typeInvalide = Boolean(vType.error) && vType.error === 'secteur_activite invalide';

// 5. Vidage en édition : null accepté et propagé (la ligne fiche disparaîtra).
const vVidage = validateNode({ nom: 'X', secteur_activite: null }, 'update');
verdicts.vidageNull = !vVidage.error && vVidage.value.secteur_activite === null;

// 6. Le stockage est fidèle à la saisie : validate.js ne normalise PAS côté
//    serveur (accents/casse conservés ; la normalisation est un concept
//    d'affichage/regroupement, traité côté client).
const vFidele = validateNode({ nom: 'X', secteur_activite: 'Électricité Générale' }, 'update');
verdicts.pasDeNormalisationServeur = !vFidele.error &&
  vFidele.value.secteur_activite === 'Électricité Générale';

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-SECTEUR OK' : 'UNIT-SECTEUR ECHEC');
process.exit(ok ? 0 : 1);
