import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const contrat = JSON.parse(readFileSync(new URL('./CONTRAT.json', import.meta.url), 'utf8'));
const nom = value => typeof value === 'string' && /^[a-z][a-z0-9_-]{0,79}$/.test(value);
const preuve = value => value && value.etat === 'mesure' && typeof value.reference === 'string' && value.reference.trim().length > 0 && value.reference.length <= 500 && typeof value.le === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value.le) && Number.isFinite(Date.parse(value.le));
export function collecter(dossier) {
  const fonctions = dossier?.fonctions;
  if (!Array.isArray(fonctions) || !fonctions.length || fonctions.length > 500 || !fonctions.every(nom) || new Set(fonctions).size !== fonctions.length) throw new Error('Inventaire de fonctions absent, vide ou invalide.');
  const couverture = dossier.couverture, controles = dossier.controles;
  if (!couverture || typeof couverture !== 'object' || Array.isArray(couverture) || !controles || typeof controles !== 'object' || Array.isArray(controles)) throw new Error('Preuves de pilotage absentes.');
  const fonctionsSansPreuve = fonctions.filter(f => !preuve(couverture[f]));
  const controlesSansPreuve = contrat.controles.filter(c => !preuve(controles[c]));
  return { version: contrat.version, verification: 'structure-des-attestations', fonctionnementReelSonde: false, fonctions: fonctions.length, controles: contrat.controles.length, fonctionsSansPreuve, controlesSansPreuve, attestationsCompletes: !fonctionsSansPreuve.length && !controlesSansPreuve.length };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--dossier') throw new Error('Usage : collecter.mjs --dossier <fichier-prive>');
    const report = collecter(JSON.parse(readFileSync(process.argv[3], 'utf8')));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.attestationsCompletes ? 0 : 1;
  } catch { console.error('Dossier de pilotage illisible ou invalide ; aucune attestation admise.'); process.exitCode = 2; }
}

