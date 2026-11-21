import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const blob = (bytes) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

export function collecter(depot, reference) {
  if (!/^[a-f0-9]{40}$/.test(reference.commit || '') || !Number.isFinite(Date.parse(reference.date_commit))) throw new Error('Référence non mesurée.');
  if (!Array.isArray(reference.capacites) || reference.capacites.length < 6) throw new Error('Référence vide ou incomplète.');
  const racine = resolve(depot);
  const capacites = reference.capacites.map((c) => {
    if (!/^[a-z-]+$/.test(c.id) || !Array.isArray(c.fichiers) || !c.fichiers.length) throw new Error('Capacité invalide.');
    return { id: c.id, modules: c.fichiers.map((f, i) => {
      const chemin = resolve(racine, f.chemin);
      const rel = relative(racine, chemin);
      if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('Chemin hors source.');
      const contenu = readFileSync(chemin);
      if (!contenu.length || blob(contenu) !== f.blob) throw new Error(`Source absente ou modifiée : ${c.id}.`);
      return { id: `${c.id}-${i + 1}`, empreinte: hash(contenu) };
    }) };
  });
  if (new Set(capacites.map((c) => c.id)).size !== capacites.length) throw new Error('Capacités dupliquées.');
  return { schema: 'analyse-energetique/1', source: { commit: reference.commit, date_commit: reference.date_commit }, capacites };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const args = process.argv.slice(2);
    const arg = (nom) => { const i = args.indexOf(nom); if (i < 0 || !args[i + 1]) throw new Error(`Argument requis : ${nom}`); return args[i + 1]; };
    const reference = JSON.parse(readFileSync(arg('--reference'), 'utf8'));
    const resultat = collecter(arg('--depot'), reference);
    const sortie = arg('--sortie');
    if (args.includes('--verifier')) {
      if (JSON.stringify(JSON.parse(readFileSync(sortie, 'utf8'))) !== JSON.stringify(resultat)) throw new Error('Inventaire périmé.');
    } else writeFileSync(sortie, JSON.stringify(resultat, null, 2) + '\n');
    console.log(`✓ ${resultat.capacites.length} capacités mesurées, empreintes conformes.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
