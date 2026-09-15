import { destinations, filtrerDestinations } from '../js/leo-navigation.mjs';

let echecs = 0;
function verifier(nom, condition) {
  if (condition) console.log(`PASS ${nom}`);
  else { console.log(`FAIL ${nom}`); echecs++; }
}

const routes = destinations();
verifier('le registre fournit des routes', routes.length > 10);
verifier('chaque route est déterministe', routes.every((r) => r.id && r.nom && r.cible && r.chemin));
verifier('la recherche trouve RIVEN par son nom', filtrerDestinations('riven', routes).some((r) => r.id === 'riven'));
verifier('la recherche trouve un projet par son sens', filtrerDestinations('relations', routes).some((r) => r.id === 'riven'));
verifier('une recherche inconnue reste vide', filtrerDestinations('mordor', routes).length === 0);
verifier('les résultats sont bornés', filtrerDestinations('', routes).length <= 8);

process.exit(echecs ? 1 : 0);
