/* ASSEMBLEUR — la maquette « accueil × Finubar » en UN SEUL fichier.
   Usage :  node design/assembler-preview-accueil.mjs <sortie.html> [--reel]

   POURQUOI IL EXISTE. La maquette vit en cinq fichiers qui en importent
   quatre autres (le moteur, le registre, l'adaptateur). C'est ce qu'il faut
   pour qu'elle montre le VRAI ciel et pas une imitation. Mais pour la faire
   regarder ailleurs qu'en local — dans une page envoyée à Paul, sur un
   téléphone, hors du dépôt — il faut un fichier qui se suffit.

   ⛔ IL ASSEMBLE, IL NE RECOPIE PAS. Aucune ligne de moteur n'est réécrite
   ici : le fichier produit contient les sources RÉELLES, lues au moment de
   l'assemblage. Une copie figée aurait divergé au premier correctif du moteur,
   et montrerait alors un ciel qui n'existe plus.

   `--reel` remplace la fixture par l'agrégat réel (`finubar/macro.json`).
   ⚠️ Le fichier produit porte alors la feuille de route des huit dépôts : il ne
   se pose NI dans `design/` (déployé en clair) NI dans le dépôt. Il se lit, et
   il reste là où on l'a écrit. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..');
const lire = (p) => readFileSync(join(RACINE, p), 'utf8');

const [sortie, ...drapeaux] = process.argv.slice(2);
if (!sortie) { console.error('usage : node design/assembler-preview-accueil.mjs <sortie.html> [--reel]'); process.exit(1); }
const reel = drapeaux.includes('--reel');

// Un module ES devient un morceau de module inline : on retire ses `import`
// (tout est déjà là) et le mot-clé `export` (rien n'est plus exporté). Les
// noms restent les mêmes, donc le code ne change pas de sens.
const enLigne = (chemin) => lire(chemin)
  .replace(/^\s*import[^;]+;\s*$/gm, '')
  .replace(/^export\s+(const|function|let)\s/gm, '$1 ');

const agregat = reel
  ? JSON.stringify(JSON.parse(lire('finubar/macro.json')), null, 1)
  : null;

// Les projets réels ne déclarent pas encore leur accroche au ciel (champ
// `ciel`, §3 du cadrage) : tant qu'elle n'est pas dans les grains, on la pose
// ici, à l'assemblage, et NULLE PART AILLEURS — pour que le jour où les grains
// la portent, il n'y ait que ces lignes à retirer.
const ACCROCHES = {
  'PaulGERARD161098/RenoBoost': 'renoboost-ia',
  'PaulGERARD161098/RenoDevis': 'renoboost-ia',
  'PaulGERARD161098/RenoAgenda': 'renoboost-ia',
  'PaulGERARD161098/RenoPredict': 'renoboost-ia',
  'PaulGERARD161098/Ultima-': 'racine',
};

const donnees = reel
  ? `const AGREGAT = (() => { const a = ${agregat};
      const accroches = ${JSON.stringify(ACCROCHES)};
      a.projets.forEach((p) => { p.ciel = accroches[p.depot] || 'alpha'; });
      return a; })();`
  : enLigne('design/preview-accueil-finubar-fixture.mjs');

const html = `<title>Ultima — l'accueil piloté par Finubar</title>
<style>
${lire('css/styles.css')}
${lire('css/ciel.css')}
${lire('css/stellaire.css')}
${lire('design/preview-accueil-finubar.css')}
</style>
<div id="scene" class="ciel-scene"></div>
<div class="hud">
  <div class="hud-haut">
    <div>
      <p class="fil" id="fil">Ultima</p>
      <h1 class="titre" id="titre">Bienvenue sur Ultima</h1>
      <p class="parole" id="parole">Sur quoi est-ce qu&rsquo;on travaille aujourd&rsquo;hui&nbsp;?</p>
    </div>
    <div class="outils">
      <button type="button" id="b-couleur" aria-pressed="true">Appel : allumé</button>
      <button type="button" id="b-ouvrir" aria-pressed="false">Chemin d&rsquo;appel : fermé</button>
      <button type="button" id="b-racine">Tout voir</button>
    </div>
  </div>
  <div>
    <div class="bandeau" id="bandeau" aria-label="Finubar — l'état des projets"></div>
    <p class="mention">${reel
      ? 'Maquette · données RÉELLES de Finubar au dernier commit · page privée'
      : 'Maquette · textes inventés · l’état réel se lit sur /finubar, derrière authentification'}</p>
  </div>
</div>
<script>
${lire('js/ciel-fond.js')}
</script>
<script>
${lire('js/ciel.js')}
</script>
<script type="module">
${enLigne('js/registre-lv3.mjs')}
${enLigne('js/adaptateur-lv4.mjs')}
${donnees}
${enLigne('design/preview-accueil-finubar.js')}
</script>
`;

writeFileSync(sortie, html);
console.log(`écrit : ${sortie} (${Math.round(html.length / 1024)} Ko, ${reel ? 'données réelles' : 'fixture'})`);
