// Unitaires lots.mjs — le découpage du job navigateur en lots parallèles.
// ⛔ Ce qui est gardé : aucun harnais ne sort de la CI en silence. Un harnais
// qu'aucun lot ne prend ne tourne plus nulle part, et le job reste vert.
// Deux façons d'y arriver, deux contrôles : une répartition qui perd ou double
// un harnais, et une matrice de tests.yml qui ne va pas de 1 à N.
import { readFileSync } from 'node:fs';
import { harnais, lot } from './lots.mjs';

const verdicts = {};
const tous = harnais(new URL('.', import.meta.url));

// 0. Verrou de non-vacuité : une partition de zéro fichier est toujours juste.
verdicts.harnaisTrouves = tous.length >= 50;

// 1. Pour 1 à 6 lots : chaque harnais dans un lot et un seul, aucun lot vide.
verdicts.partitionExacte = [1, 2, 3, 4, 5, 6].every((n) => {
  const lots = Array.from({ length: n }, (_, k) => lot(tous, `${k + 1}/${n}`));
  const reunis = lots.flat();
  return lots.every((l) => l.length > 0) &&
    reunis.length === tous.length &&
    new Set(reunis).size === tous.length &&
    [...reunis].sort().join() === tous.join();
});

// 2. Un LOT mal écrit lève, il ne rend jamais une liste vide qu'on jouerait en vert.
verdicts.lotInvalideRefuse = ['0/4', '5/4', '4', '', 'a/b', '1/0', '1/4/2', ' 1/4', undefined]
  .every((spec) => { try { lot(tous, spec); return false; } catch { return true; } });

// 3. La matrice de tests.yml va de 1 à N, N étant le dénominateur passé à LOT.
//    Sans ce contrôle, passer à « /5 » en oubliant d'ajouter 5 à la matrice
//    ferait disparaître un harnais sur cinq, CI verte.
const yml = readFileSync(new URL('../.github/workflows/tests.yml', import.meta.url), 'utf8');
const n = Number(/LOT: \$\{\{ matrix\.lot \}\}\/(\d+)/.exec(yml)?.[1]);
const matrice = /\blot: \[([\d,\s]+)\]/.exec(yml)?.[1].split(',').map((x) => Number(x.trim()));
verdicts.matriceCouvreLesLots = Number.isInteger(n) && n > 0 && Array.isArray(matrice) &&
  matrice.join() === Array.from({ length: n }, (_, k) => k + 1).join();

// 4. Les deux protections du job : plafond de durée, annulation des passages dépassés.
verdicts.plafondDeDuree = /browser:[\s\S]*?timeout-minutes: \d+/.test(yml);
verdicts.annulationSurPR = /cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/.test(yml);

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LOTS OK' : 'UNIT-LOTS ECHEC');
process.exit(ok ? 0 : 1);
