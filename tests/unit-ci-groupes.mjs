// Unitaires de la CI — les groupes du job navigateur et l'annulation des passages dépassés.
// ⛔ Ce qui est gardé : aucun harnais ne sort de la CI en silence. Le nombre de
// groupes est écrit DEUX fois dans tests.yml — la matrice `groupe: [...]` et
// `SMOKE_SHARD_COUNT=N`. Si elles divergent (N passe à 3, la matrice reste
// [0, 1]), le groupe 2 ne tourne nulle part et le job reste vert.
// `tests/lancer.sh` ne peut pas le voir : il ne connaît que son propre groupe.
import { readFileSync, readdirSync } from 'node:fs';

const verdicts = {};
const yml = readFileSync(new URL('../.github/workflows/tests.yml', import.meta.url), 'utf8');
const lanceur = readFileSync(new URL('./lancer.sh', import.meta.url), 'utf8');
const harnais = readdirSync(new URL('.', import.meta.url)).filter((f) => /^smoke-.*\.mjs$/.test(f));

// 0. Verrous de non-vacuité : sans harnais ni nombre de groupes lu, tout le reste est vert à vide.
const n = Number(/SMOKE_SHARD_COUNT=(\d+)/.exec(yml)?.[1]);
const matrice = /\bgroupe: \[([\d,\s]+)\]/.exec(yml)?.[1].split(',').map((x) => Number(x.trim()));
verdicts.harnaisTrouves = harnais.length >= 50;
verdicts.nombreDeGroupesLu = Number.isInteger(n) && n >= 1 && n <= 8 && Array.isArray(matrice);

// 1. La matrice va de 0 à N-1 : chaque groupe que le lanceur sait jouer est lancé, une fois.
verdicts.matriceCouvreLesGroupes = verdicts.nombreDeGroupesLu &&
  matrice.join() === Array.from({ length: n }, (_, k) => k).join();

// 2. Les variables passées par la CI sont celles que le lanceur lit. Un nom
//    renommé d'un seul côté ferait jouer à chaque groupe le groupe 0 sur 1.
verdicts.memesVariables = ['SMOKE_SHARD_INDEX', 'SMOKE_SHARD_COUNT']
  .every((v) => yml.includes(`--env ${v}=`) && lanceur.includes(`\${${v}:-`));

// 3. Chaque harnais tombe dans un groupe et un seul — la règle du lanceur (i % N).
const groupes = Array.from({ length: n }, (_, g) => harnais.filter((_, i) => i % n === g));
verdicts.partitionExacte = verdicts.nombreDeGroupesLu &&
  groupes.flat().length === harnais.length && new Set(groupes.flat()).size === harnais.length &&
  groupes.every((g) => g.length > 0) && /\(\( i % groupes != groupe \)\)/.test(lanceur);

// 4. Un push sur une PR annule le passage précédent ; jamais sur main.
verdicts.annulationSurPR = /cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/.test(yml) &&
  /group: tests-\$\{\{ github\.event\.pull_request\.number \|\| github\.sha \}\}/.test(yml);

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-CI-GROUPES OK' : 'UNIT-CI-GROUPES ECHEC');
process.exit(ok ? 0 : 1);
