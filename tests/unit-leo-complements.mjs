// Garde des compléments Work de Léo (03/11/2026).
// Vérifie : empreintes des textes installés, frontmatter des skills, absence
// d'une deuxième Léo invocable, références relatives résolues, matrice des
// 58 capacités complète et bilan recompté, pointeur depuis la charte.
// Usage : node tests/unit-leo-complements.mjs [racine]  (racine = dépôt par défaut)
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const racine = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..'));
const lire = (p) => readFileSync(join(racine, p), 'utf8');
const ETATS = ['DEFINIE', 'EXPOSEE', 'ACCES_VERIFIE', 'EPROUVEE', 'ACTIVE', 'INDISPONIBLE', 'NON_VERIFIEE'];
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };

// 1. Empreintes : chaque texte installé est identique à sa source archivée.
const manifeste = JSON.parse(lire('.claude/leo-complements/SOURCES.json'));
ok(Array.isArray(manifeste.sources) && manifeste.sources.length > 0, 'manifeste vide');
for (const s of manifeste.sources) {
  ok(existsSync(join(racine, s.installe)), `absent : ${s.installe}`);
  const h = createHash('sha256').update(lire(s.installe), 'utf8').digest('hex');
  ok(h === s.sha256_utf8, `empreinte divergente : ${s.installe}`);
}

// 2. Skills installés : frontmatter valide, nom = dossier, références présentes.
for (const nom of ['methode-paul', 'directive-zs', 'rapport-client-pro']) {
  const t = lire(`.claude/skills/${nom}/SKILL.md`);
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(t);
  ok(fm, `${nom} : frontmatter absent`);
  ok(new RegExp(`^name: ${nom}$`, 'm').test(fm[1]), `${nom} : name ≠ dossier`);
  ok(/^description: \S/m.test(fm[1]), `${nom} : description absente`);
  for (const ref of new Set(t.match(/references\/[\w.-]+\.md/g) || [])) {
    ok(existsSync(join(racine, `.claude/skills/${nom}`, ref)), `${nom} : référence manquante ${ref}`);
  }
}

// 3. Une seule Léo invocable : la compétence Work n'est pas un skill.
const skills = readdirSync(join(racine, '.claude/skills'));
ok(!skills.some((d) => /^leo|^léo/i.test(d)), 'une deuxième Léo invocable existe sous .claude/skills');
const ABSENTS_CONNUS = ['references/contrat-lv1-v1.1.md', 'references/confrontation-2026-09-29.md', 'references/reprise-leo-ultima.md'];
const readme = lire('.claude/leo-complements/README.md');
const lv1 = lire('.claude/leo-complements/leo-lv1.md');
for (const ref of new Set(lv1.match(/references\/[\w.-]+\.md/g) || [])) {
  // Absents connus, déclarés au README (§1) : le contrat (canonique = §11) et
  // deux photographies Work non fournies par l'archive du 03/11.
  if (ABSENTS_CONNUS.includes(ref)) { ok(readme.includes(ref.slice(11)), `absent non déclaré au README : ${ref}`); continue; }
  ok(existsSync(join(racine, '.claude/leo-complements', ref)), `leo-lv1 : référence manquante ${ref}`);
}

// 4. Matrice : 58 capacités, chacune une fois, états connus, bilan recompté.
const lignes = readme.split('\n').filter((l) => /^\| C\d{2} \|/.test(l));
ok(lignes.length > 0, 'matrice vide'); // verrou de non-vacuité
const ids = lignes.map((l) => l.split('|')[1].trim());
ok(ids.length === 58 && new Set(ids).size === 58, `matrice : ${ids.length} lignes, ${new Set(ids).size} distinctes`);
for (let i = 1; i <= 58; i++) ok(ids.includes(`C${String(i).padStart(2, '0')}`), `C${i} absente`);
const compte = {};
for (const l of lignes) {
  const e = l.split('|')[3].trim();
  ok(ETATS.includes(e), `état inconnu « ${e} »`);
  compte[e] = (compte[e] || 0) + 1;
}
const bilan = /\*\*Bilan au [^*]+\*\*([\s\S]*?)\*\(/.exec(readme);
ok(bilan, 'bilan absent');
const annonce = Object.fromEntries([...bilan[1].matchAll(/([A-Z_]+) (\d+)/g)].map((m) => [m[1], Number(m[2])]));
assert.deepEqual(annonce, compte, 'bilan annoncé ≠ tableau recompté'); n++;

// 5. La charte pointe les compléments.
ok(lire('.claude/agents/leo.md').includes('.claude/leo-complements/README.md'), 'charte : pointeur absent');

// 6. Recette comportementale du 03/11 : chaque scénario attendu est noté
// EXÉCUTÉ (verdict + preuve non vide) ou NON EXÉCUTÉ (raison), une seule fois.
const DOSSIER = '.claude/leo-complements/recette-2026-11-03';
const ATTENDUS = ['T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T15', 'T16', 'T17', 'T18'];
const VERDICTS = ['CONFORME', 'PARTIEL', 'NON CONFORME'];
const recette = lire(`${DOSSIER}/RECETTE.md`);
const verdicts = recette.split('\n').filter((l) => /^\| T\d{2} \| (EXÉCUTÉ|NON EXÉCUTÉ|[^|]*) \|/.test(l) && l.split('|').length >= 7);
ok(verdicts.length > 0, 'recette : tableau des verdicts vide'); // verrou de non-vacuité
const vus = verdicts.map((l) => l.split('|')[1].trim());
ok(vus.length === new Set(vus).size, 'recette : scénario noté deux fois');
assert.deepEqual([...vus].sort(), ATTENDUS, 'recette : scénarios notés ≠ scénarios attendus'); n++;
const tally = {};
for (const l of verdicts) {
  const [, id, statut, verdict, preuve, motif] = l.split('|').map((c) => c.trim());
  ok(['EXÉCUTÉ', 'NON EXÉCUTÉ'].includes(statut), `${id} : statut inconnu « ${statut} »`);
  if (statut === 'EXÉCUTÉ') {
    ok(VERDICTS.includes(verdict), `${id} : verdict inconnu « ${verdict} »`);
    ok(/^reponses\/T\d{2}\.md$/.test(preuve) && preuve.includes(id), `${id} : preuve mal référencée`);
    const p = join(racine, DOSSIER, preuve);
    ok(existsSync(p) && readFileSync(p, 'utf8').trim().length >= 200, `${id} : preuve absente ou vide`);
    tally[verdict] = (tally[verdict] || 0) + 1;
  } else ok(motif && motif.length >= 10, `${id} : NON EXÉCUTÉ sans raison`);
}
const b = /\*\*Bilan : (\d+) exécutés sur (\d+) · CONFORME (\d+) · PARTIEL (\d+) · NON CONFORME (\d+)\.\*\*/.exec(recette);
ok(b, 'recette : bilan absent');
const exec = Object.values(tally).reduce((a, c) => a + c, 0);
assert.deepEqual(b.slice(1).map(Number), [exec, ATTENDUS.length, tally.CONFORME || 0, tally.PARTIEL || 0, tally['NON CONFORME'] || 0], 'recette : bilan ≠ tableau'); n++;
ok(readme.includes('recette-2026-11-03/RECETTE.md'), 'README : la recette n\'est pas pointée');

console.log(`unit-leo-complements : ${n} vérifications vertes`);
