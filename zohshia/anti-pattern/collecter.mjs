// Contrôle structurel de déclarations privées ; aucune preuve métier automatique.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const rempli = (v) => typeof v === 'string' && v.trim().length > 0;
const normaliser = (v) => String(v || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
export function controler(d) {
  const erreurs = [];
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { ok: false, erreurs: ['dossier absent'], portee: 'structure déclarative seulement' };
  for (const champ of ['resultat', 'critere', 'tolerance', 'dependancesCommunes', 'limites']) {
    if (!rempli(d[champ])) erreurs.push(`${champ} absent`);
  }
  const approches = Array.isArray(d.approches) ? d.approches : [];
  if (!['tache', 'plan', 'retroplanning'].includes(d.typeSujet) || typeof d.complexe !== 'boolean') erreurs.push('typeSujet et complexe requis');
  const minimum = ['plan', 'retroplanning'].includes(d.typeSujet) ? 4 : d.complexe === true ? 3 : 2;
  if (approches.length < minimum) erreurs.push(minimum + ' points de vue au minimum');
  const methodes = new Set();
  for (const a of approches) {
    if (!rempli(a?.methode) || !rempli(a?.differenceUtile)) erreurs.push('méthode ou différence utile absente');
    const cle = normaliser(a?.methode);
    if (methodes.has(cle)) erreurs.push('méthodes déclarées identiques');
    methodes.add(cle);
    if (!Array.isArray(a?.observations) || !a.observations.length) erreurs.push('observations vides');
    for (const o of Array.isArray(a?.observations) ? a.observations : []) {
      if (!rempli(o?.source) || !rempli(o?.constat) || !['mesuré', 'déclaré', 'inféré', 'non vérifié'].includes(o?.statut)) erreurs.push('observation non qualifiée');
      if (o?.statut === 'non vérifié') erreurs.push('observation non vérifiée : réception partielle');
    }
  }
  if (!['convergence', 'ecart-resolu'].includes(d.comparaison?.statut)) erreurs.push('comparaison absente ou écart non résolu');
  if (!rempli(d.comparaison?.preuve)) erreurs.push('preuve de comparaison absente');
  if (d.comparaison?.statut === 'ecart-resolu' && !rempli(d.comparaison?.resolution)) erreurs.push('résolution absente');
  return { ok: erreurs.length === 0, erreurs, portee: 'structure déclarative seulement ; contenu, sources et indépendance non certifiés' };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (!process.argv[2]) throw new Error('fichier JSON privé requis');
    const r = controler(JSON.parse(readFileSync(process.argv[2], 'utf8')));
    console.log(JSON.stringify(r, null, 2));
    if (!r.ok) process.exitCode = 1;
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
