#!/usr/bin/env node
// La bibliothèque de specs — la collecte. Recense les specs qui vivent déjà
// dans les dépôts voisins et réécrit `specs/INDEX.md` + `specs/index.json`.
//
// ⛔ Pourquoi l'état d'une spec est DÉRIVÉ et jamais saisi.
// Un champ « vivante / périmée » tenu à la main n'est pas tenu : il est juste
// le jour où quelqu'un le pose, et faux ensuite — sauf qu'il continue de se
// lire comme un fait. C'est la leçon que Finubar a déjà payée sur les grains.
// Ici l'état vient de la date du dernier commit qui a touché le fichier, et
// de rien d'autre.
//
// ⛔ Et quand la date n'est PAS mesurable, on ne l'invente pas.
// Un clone superficiel (`--depth 1`) ne porte qu'un commit : `git log` y rend
// la date du HEAD pour TOUS les fichiers. Daté ainsi, un index déclarerait
// « vivantes » cent specs dont trois le sont. La collecte détecte ce cas,
// refuse de dater, et l'écrit en toutes lettres avec la commande pour y
// remédier. Une mesure indisponible qui le dit vaut mieux qu'une mesure
// plausible qui ment.
//
// Aucune écriture hors de `specs/`. Aucun réseau. `git` via execFileSync en
// tableau d'arguments — jamais de shell.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE_ULTIMA = resolve(ICI, '..');
const VOISINAGE = resolve(RACINE_ULTIMA, '..');
// ⛔ La liste des dépôts N'EST PAS redéfinie ici. Elle vit dans
// `finubar/depots.json` depuis le 21/08 ; une seconde liste divergerait, et on
// croirait la mauvaise. La bibliothèque indexe les mêmes huit dépôts que Finubar.
const FICHIER_DEPOTS = join(RACINE_ULTIMA, 'finubar', 'depots.json');
const SORTIE_JSON = join(ICI, 'index.json');
const SORTIE_MD = join(ICI, 'INDEX.md');

// Où une spec peut vivre dans un dépôt. Profondeur 1 : on ne descend pas dans
// `app/`, `js/` ou `node_modules/` — une spec qui s'y cacherait n'est de toute
// façon trouvable par personne, et c'est un défaut à corriger, pas à indexer.
const DOSSIERS = ['.', 'docs', 'standards', 'design', 'specs', 'memoire'];

// Les familles NORMATIVES — ce que la bibliothèque recense.
const FAMILLES = [
  [/^SPEC[-_]|^spec-|_SPEC|-SPEC/i, 'spec'],
  [/-CONTRAT\.md$|^CONTRAT/i, 'contrat'],
  [/^CADRAGE/i, 'cadrage'],
  [/^ARCHI/i, 'architecture'],
  [/^PLAN-/i, 'plan'],
  [/^DESIGN|^CRITIQUE-DESIGN/i, 'design'],
  [/^RECETTE/i, 'recette'],
  [/^STANDARD|^CLAUDE-STANDARD/i, 'standard'],
  [/^ROADMAP-(?!\d{4})/i, 'roadmap'],
];

// ⛔ Les journaux de séance sont ÉCARTÉS, et le nombre d'écartés est affiché.
// Ce ne sont pas des specs : ce sont des traces datées de ce qui s'est passé.
// Les mélanger noierait les quarante documents normatifs dans deux cents notes.
// Un filtre qui écarte en silence se lit comme une absence — d'où le compteur.
const ECARTES = [
  [/^REPRISE/i, 'journal de reprise'],
  [/^ROADMAP-\d{4}/i, 'roadmap de fin de séance'],
  [/^AUDIT/i, 'audit daté'],
  [/^GARAGE|^REPERE|^NOTE-|^POST-|^LINKEDIN/i, 'note de séance'],
  [/^DR-\d{4}/i, 'dry run daté'],
  [/\.SUPPRIME\.md$/i, 'garde-fou retiré (note de suppression)'],
  [/^README|^CLAUDE\.md$|^FINUBAR\.md$|^SKILLS?\.md$|^BIBLIO-SKILLS\.md$|^SPECS\.md$/i, 'fichier de dépôt'],
  [/^ACTIONS-PAUL|^CONTENU-A-FOURNIR|^DECISIONS-EN-ATTENTE|^LECONS/i, 'registre vivant'],
];

const SEUIL_VIVANTE = 30;   // jours
const SEUIL_DORMANTE = 120; // jours

function dateLocaleIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const arguments_ = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const aujourdhui = (arguments_[0] || dateLocaleIso()).slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(aujourdhui)) {
  console.error('Date attendue au format AAAA-MM-JJ.');
  process.exit(2);
}

function git(dossier, arguments_git) {
  try {
    return execFileSync('git', ['-C', dossier, ...arguments_git], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

function estSuperficiel(dossier) {
  return (git(dossier, ['rev-parse', '--is-shallow-repository']) || '').trim() === 'true';
}

// Un seul `git log` par dépôt — pas un par fichier. Le format met la date sur
// sa propre ligne, suivie des chemins touchés ; la PREMIÈRE date rencontrée
// pour un chemin est la plus récente (git log sort en ordre antéchronologique).
function datesParFichier(dossier) {
  const brut = git(dossier, ['log', '--date=short', '--format=%x00%ad', '--name-only']);
  if (!brut) return null;
  const dates = new Map();
  let courante = null;
  for (const ligne of brut.split('\n')) {
    if (ligne.startsWith('\0')) { courante = ligne.slice(1).trim(); continue; }
    const chemin = ligne.trim();
    if (chemin && courante && !dates.has(chemin)) dates.set(chemin, courante);
  }
  return dates;
}

function joursEcoules(depuis, jusqu) {
  const a = Date.parse(`${depuis}T00:00:00Z`), b = Date.parse(`${jusqu}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

function famille(nom) {
  for (const [motif, nomFamille] of FAMILLES) if (motif.test(nom)) return nomFamille;
  return null;
}

function motifEcart(nom) {
  for (const [motif, raison] of ECARTES) if (motif.test(nom)) return raison;
  return null;
}

function listerMd(racine, sousDossier) {
  const chemin = join(racine, sousDossier);
  if (!existsSync(chemin)) return [];
  let entrees;
  try { entrees = readdirSync(chemin, { withFileTypes: true }); } catch { return []; }
  return entrees
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
    .map((e) => (sousDossier === '.' ? e.name : `${sousDossier}/${e.name}`));
}

function recenser(dossierDepot) {
  const superficiel = estSuperficiel(dossierDepot);
  const dates = superficiel ? null : datesParFichier(dossierDepot);
  const retenues = [];
  const ecartees = new Map();
  let vus = 0;

  for (const sousDossier of DOSSIERS) {
    for (const chemin of listerMd(dossierDepot, sousDossier)) {
      vus += 1;
      const nom = chemin.split('/').pop();
      const raison = motifEcart(nom);
      if (raison) { ecartees.set(raison, (ecartees.get(raison) || 0) + 1); continue; }
      const f = famille(nom);
      if (!f) { ecartees.set('hors famille normative', (ecartees.get('hors famille normative') || 0) + 1); continue; }

      const derniere = dates ? (dates.get(chemin) || null) : null;
      const age = derniere ? joursEcoules(derniere, aujourdhui) : null;
      let etat;
      if (superficiel) etat = 'non daté (clone superficiel)';
      else if (!derniere) etat = 'non daté (hors historique)';
      else if (age <= SEUIL_VIVANTE) etat = 'vivante';
      else if (age <= SEUIL_DORMANTE) etat = 'dormante';
      else etat = 'fossile';

      let lignes = 0;
      try { lignes = readFileSync(join(dossierDepot, chemin), 'utf8').split('\n').length; } catch { lignes = 0; }
      retenues.push({ chemin, famille: f, derniere_touche: derniere, age_jours: age, etat, lignes });
    }
  }

  retenues.sort((a, b) => (a.famille === b.famille ? a.chemin.localeCompare(b.chemin) : a.famille.localeCompare(b.famille)));
  return { superficiel, vus, retenues, ecartees: Object.fromEntries(ecartees) };
}

// ── Collecte ────────────────────────────────────────────────────────────────
const depots = JSON.parse(readFileSync(FICHIER_DEPOTS, 'utf8'));
const projets = [];
for (const d of depots) {
  const dossierDepot = d.dossier === 'Ultima-' ? RACINE_ULTIMA : resolve(VOISINAGE, d.dossier);
  if (!existsSync(join(dossierDepot, '.git'))) {
    // ⛔ « non mesuré » et « 0 spec » ne sont PAS la même chose. Un dépôt absent
    // qui s'écrirait « 0 » ferait croire à une bibliothèque complète.
    projets.push({ dossier: d.dossier, depot: d.depot, mesure: false, motif: 'dépôt absent du voisinage de cette séance' });
    continue;
  }
  projets.push({ dossier: d.dossier, depot: d.depot, mesure: true, ...recenser(dossierDepot) });
}

const mesures = projets.filter((p) => p.mesure);
// Verrou de non-vacuité nº1 — aucun dépôt lisible : il n'y a rien à écrire, et
// un index vide écrit malgré tout serait pris pour un constat.
if (!mesures.length) {
  console.error('Aucun dépôt lisible dans le voisinage. Rien écrit — un index vide se lirait comme « aucune spec ».');
  process.exit(3);
}
const total = mesures.reduce((n, p) => n + p.retenues.length, 0);
// Verrou de non-vacuité nº2 — des dépôts lus, mais pas une seule spec retenue :
// c'est le filtre qui est cassé, pas le rayonnage qui est vide.
if (!total) {
  console.error(`Aucune spec retenue sur ${mesures.reduce((n, p) => n + p.vus, 0)} fichiers .md lus. Le filtre est en cause — rien écrit.`);
  process.exit(4);
}

const index = { le: aujourdhui, seuils: { vivante: SEUIL_VIVANTE, dormante: SEUIL_DORMANTE }, total, projets };
writeFileSync(SORTIE_JSON, `${JSON.stringify(index, null, 2)}\n`);

// ── Rendu ───────────────────────────────────────────────────────────────────
const ETAT_SIGNE = { vivante: '🟢', dormante: '🟡', fossile: '⚪' };
const l = [];
l.push('# INDEX — les specs des huit dépôts');
l.push('');
l.push(`> ⛔ **Fichier généré par \`node specs/collecter.mjs\` — ne pas éditer à la main.**`);
l.push(`> Toute correction se fait dans le dépôt d'origine de la spec, jamais ici :`);
l.push(`> la bibliothèque indexe, elle ne recopie pas.`);
l.push(`>`);
l.push(`> Collecté le **${aujourdhui}** · **${total}** specs recensées sur **${mesures.length}** dépôts lus (sur ${projets.length}).`);
l.push('');
l.push(`État dérivé de la dernière touche git : 🟢 vivante (≤ ${SEUIL_VIVANTE} j) · 🟡 dormante (≤ ${SEUIL_DORMANTE} j) · ⚪ fossile · ❔ non datée.`);
l.push('');

for (const p of projets) {
  l.push(`## ${p.dossier} — \`${p.depot}\``);
  l.push('');
  if (!p.mesure) {
    l.push(`❔ **Non mesuré** — ${p.motif}.`);
    l.push('');
    l.push(`Pour le mesurer : cloner \`${p.depot}\` à côté d'Ultima, puis relancer \`node specs/collecter.mjs\`.`);
    l.push('');
    continue;
  }
  if (p.superficiel) {
    l.push(`⚠️ **Clone superficiel** — aucune date n'est mesurable ici (\`git log\` y rend la date du HEAD pour tous les fichiers).`);
    l.push(`Pour dater : \`git -C ${p.dossier} fetch --depth=1000 origin main\`, puis relancer la collecte.`);
    l.push('');
  }
  if (!p.retenues.length) {
    l.push(`⚠️ **Aucune spec retenue** sur ${p.vus} fichiers \`.md\` lus — à vérifier : ce dépôt devrait en porter.`);
    l.push('');
    continue;
  }
  l.push('| État | Spec | Famille | Dernière touche | Lignes |');
  l.push('|---|---|---|---|---|');
  for (const s of p.retenues) {
    const signe = ETAT_SIGNE[s.etat] || '❔';
    const quand = s.derniere_touche ? `${s.derniere_touche} (${s.age_jours} j)` : '—';
    l.push(`| ${signe} | \`${s.chemin}\` | ${s.famille} | ${quand} | ${s.lignes} |`);
  }
  l.push('');
  const ecartes = Object.entries(p.ecartees).sort((a, b) => b[1] - a[1]);
  const totalEcartes = ecartes.reduce((n, [, c]) => n + c, 0);
  l.push(`*${p.retenues.length} retenues · ${totalEcartes} écartées sur ${p.vus} fichiers lus — ${ecartes.map(([r, c]) => `${c} ${r}`).join(', ') || 'aucune'}.*`);
  l.push('');
}

writeFileSync(SORTIE_MD, `${l.join('\n')}\n`);
console.log(`${total} specs recensées sur ${mesures.length}/${projets.length} dépôts → ${relative(RACINE_ULTIMA, SORTIE_MD)}`);
for (const p of mesures) {
  const drapeau = p.superficiel ? ' ⚠ non daté (clone superficiel)' : '';
  console.log(`  ${p.dossier} : ${p.retenues.length} retenues / ${p.vus} lues${drapeau}`);
}
for (const p of projets.filter((x) => !x.mesure)) console.log(`  ${p.dossier} : non mesuré (${p.motif})`);
