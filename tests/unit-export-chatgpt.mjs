// Unitaires de l'empreinte du paramétrage ChatGPT (Node pur, zéro réseau).
//
// Pourquoi ce harnais existe : `EXPORT-METHODE-CHATGPT.md` porte deux blocs que
// Paul COLLE dans ChatGPT. Une fois collés, ils vivent hors du dépôt. Si les
// quatre directives bougent dans `CLAUDE.md`, ces blocs deviennent faux et rien
// ne le dit. L'empreinte est là pour que ça se VOIE ; ce harnais est là pour
// prouver que l'empreinte le voit vraiment.
//
// ⛔ CE QU'IL ÉPROUVE EN PRIORITÉ, ce n'est pas le cas où tout va bien — c'est
//    le côté par lequel le garde-fou se contourne :
//    · les directives changent → doit virer au ROUGE ;
//    · le titre de la section change → l'extraction rendrait une chaîne vide, et
//      le sha d'une chaîne vide est stable : doit virer au ROUGE, jamais au vert ;
//    · on retire les lignes d'empreinte → doit virer au ROUGE, pas se taire.
//
// ⛔ ET UN CAS VERT, DÉLIBÉRÉMENT. Un harnais qui ne rend que du rouge ne prouve
//    pas qu'il discrimine : il prouverait la même chose s'il était cassé en
//    permanence. Le dernier contrôle exige le vert sur un état scellé.

import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { etat, sceller, sectionDirectives, empreinteReelle, CLAUDE_MD, EXPORT_MD } from '../finubar/export-chatgpt-empreinte.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const OUTIL = resolve(ICI, '../finubar/export-chatgpt-empreinte.mjs');
const verdicts = {};

const bac = mkdtempSync(join(tmpdir(), 'export-chatgpt-'));
const fClaude = join(bac, 'CLAUDE.md');
const fExport = join(bac, 'EXPORT.md');

// Un CLAUDE.md témoin : assez long pour passer le minimum, et portant les
// quatre sigles, comme le vrai.
const CLAUDE_TEMOIN = `# CLAUDE.md témoin

## 🧭 LES QUATRE DIRECTIVES MAÎTRESSES

**EB** la discipline de route : une boucle à la fois, bouclée avant la suivante.
**JL** la destination : Ultima est l'unique interface de travail.
**EL** le chemin : le comment défini avant la première ligne.
**DR** la preuve : ré-éprouver ce qui a été livré.
${'Du corps de directive, écrit pour que la section dépasse le minimum exigé. '.repeat(10)}

## 🎯 Objectif final

Ce qui suit la section ne doit PAS entrer dans l'empreinte.
`;

const exportAvec = (lignes) => `# Export témoin\n\n## 7. bloc court\n\n\`\`\`\n${lignes[0]}\nDes règles.\n\`\`\`\n\n## 8. bloc long\n\n\`\`\`\n${lignes[1] ?? ''}\nD'autres règles.\n\`\`\`\n`;
const LIGNE_VIERGE = 'PARAMETRAGE 2000-01-01 · directives:000000000000';

function cli(...args) {
  try {
    const sortie = execFileSync(process.execPath, [OUTIL, fClaude, fExport, ...args],
      { encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, sortie };
  } catch (e) {
    return { code: e.status ?? 1, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

// ---- 1. L'état scellé est VERT (le contrôle discrimine) ----------------------
writeFileSync(fClaude, CLAUDE_TEMOIN);
writeFileSync(fExport, exportAvec([LIGNE_VIERGE, LIGNE_VIERGE]));
const scelle = sceller(fClaude, fExport);
verdicts.leScellementEcritLesDeuxEmpreintes = scelle.combien === 2;
verdicts.unExportScelleEstVert = cli('--verifier').code === 0;

// ---- 2. Les directives changent → ROUGE -------------------------------------
writeFileSync(fClaude, CLAUDE_TEMOIN.replace('une boucle à la fois', 'deux boucles à la fois'));
const apresChangement = cli('--verifier');
verdicts.unChangementDeDirectiveViraAuRouge = apresChangement.code === 1
  && /PÉRIMÉ/.test(apresChangement.sortie);

// ---- 3. Le titre de la section change → ROUGE, PAS vert ---------------------
// C'est le piège de vacuité : sans garde, l'extraction rendrait du vide, dont
// le sha est stable, et le contrôle passerait au vert pour toujours.
writeFileSync(fClaude, CLAUDE_TEMOIN.replace('## 🧭 LES QUATRE DIRECTIVES MAÎTRESSES', '## 🧭 Nos principes de travail'));
const titreChange = cli('--verifier');
verdicts.unTitreIntrouvableViraAuRouge = titreChange.code === 1 && /INTROUVABLE/.test(titreChange.sortie);

// ---- 4. Une section vidée de ses sigles → ROUGE -----------------------------
writeFileSync(fClaude, `# t\n\n## 🧭 LES QUATRE DIRECTIVES MAÎTRESSES\n\n${'x'.repeat(600)}\n\n## 🎯 Objectif final\n`);
const sansSigles = cli('--verifier');
verdicts.uneSectionSansLesQuatreSiglesViraAuRouge = sansSigles.code === 1 && /incomplète/.test(sansSigles.sortie);

// ---- 5. Une section trop courte → ROUGE -------------------------------------
writeFileSync(fClaude, '# t\n\n## 🧭 LES QUATRE DIRECTIVES MAÎTRESSES\n\nEB JL EL DR\n\n## 🎯 Objectif final\n');
const tropCourte = cli('--verifier');
verdicts.uneSectionTropCourteViraAuRouge = tropCourte.code === 1 && /trop courte/.test(tropCourte.sortie);

// ---- 6. Les empreintes retirées de l'export → ROUGE -------------------------
writeFileSync(fClaude, CLAUDE_TEMOIN);
writeFileSync(fExport, exportAvec(['Pas d\'empreinte ici.', 'Ni là.']));
const sansEmpreinte = cli('--verifier');
verdicts.unExportSansEmpreinteViraAuRouge = sansEmpreinte.code === 1 && /0 empreinte/.test(sansEmpreinte.sortie);

// ---- 7. Une seule empreinte sur deux blocs → ROUGE --------------------------
writeFileSync(fExport, exportAvec([`PARAMETRAGE 2026-09-21 · directives:${empreinteReelle(fClaude)}`, 'Rien.']));
const uneSeule = cli('--verifier');
verdicts.uneSeuleEmpreinteSurDeuxBlocsViraAuRouge = uneSeule.code === 1 && /1 empreinte/.test(uneSeule.sortie);

// ---- 8. Deux empreintes DIVERGENTES → ROUGE ---------------------------------
writeFileSync(fExport, exportAvec([
  `PARAMETRAGE 2026-09-21 · directives:${empreinteReelle(fClaude)}`,
  'PARAMETRAGE 2026-09-21 · directives:aaaaaaaaaaaa',
]));
const divergentes = cli('--verifier');
verdicts.deuxEmpreintesDivergentesVirentAuRouge = divergentes.code === 1 && /DIFFÉRENTES/.test(divergentes.sortie);

// ---- 9. L'empreinte ne dépend PAS de ce qui suit la section -----------------
// Sinon elle crierait « périmé » à chaque commit touchant le reste du fichier,
// et on finirait par ne plus la croire — le pire des deux états.
const avant = empreinteReelle(fClaude);
writeFileSync(fClaude, CLAUDE_TEMOIN.replace('Ce qui suit la section ne doit PAS entrer dans l\'empreinte.', 'Texte entièrement réécrit hors section.'));
verdicts.lEmpreinteIgnoreCeQuiSuitLaSection = empreinteReelle(fClaude) === avant;

// ---- 10. Le dépôt RÉEL est en accord ----------------------------------------
// Les neuf contrôles ci-dessus tournent sur un bac à sable : ils prouvent que
// l'instrument marche, pas que le document du dépôt est à jour. Celui-ci le dit.
const reel = etat(CLAUDE_MD, EXPORT_MD);
verdicts.leDepotReelEstEnAccord = reel.accord;

rmSync(bac, { recursive: true, force: true });

let echecs = 0;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '  OK  ' : '  ÉCHEC'} ${nom}`);
  if (!ok) echecs++;
}
if (!reel.accord) console.error(`  → ${reel.motif}`);
console.log(`${Object.keys(verdicts).length - echecs}/${Object.keys(verdicts).length} contrôles`);
process.exitCode = echecs ? 1 : 0;
