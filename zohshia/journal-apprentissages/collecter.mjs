#!/usr/bin/env node
// Mesure de préparation : fichiers et empreintes, jamais contenu des incidents.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..', '..');
const PIECES = ['zohshia/journal-apprentissages/badge.json', 'zohshia/journal-apprentissages/TECHNO.md',
  'zohshia/journal-apprentissages/UTILISER.md', 'zohshia/journal-apprentissages/MISE-EN-SERVICE.md',
  'memoire/LECONS.md', 'memoire/JOURNAL-APPRENTISSAGES.json', 'memoire/LECONS-PROCEDURE.md',
  'finubar/lecons-rappel.mjs', 'outils/journal-apprentissages/consulter.mjs'];

export function collecter(racine = RACINE) {
  const sources = PIECES.map(chemin => {
    try {
      const b = readFileSync(join(racine, chemin));
      return { chemin, etat: b.length ? 'lu' : 'vide', octets: b.length, sha256: createHash('sha256').update(b).digest('hex') };
    } catch { return { chemin, etat: 'non_accessible', octets: null, sha256: null }; }
  });
  return { version: 1, mesure_le: new Date().toISOString(), perimetre: 'Arbre local ; empreintes de fichiers, aucune preuve d’exécution des raccordements.',
    automatique: 'non_recu', sources, complet: sources.every(s => s.etat === 'lu') };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inv = collecter();
  writeFileSync(join(ICI, 'inventaire.json'), JSON.stringify(inv, null, 2) + '\n');
  console.log(`${inv.sources.length} pièces mesurées ; ${inv.complet ? 'toutes lisibles' : 'couverture incomplète'} ; automatisation non reçue.`);
  if (!inv.complet) process.exitCode = 1;
}
