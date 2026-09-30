// tests/unit-finubar-grain.mjs — le grain doit PARSER, et rien ne le vérifiait.
//
// ⛔ POURQUOI CE HARNAIS EXISTE (28/09/2026, payé le jour même). Une fusion de
//    `main` a laissé TROIS marqueurs de conflit dans `FINUBAR.md`. Le fichier a
//    été commité et POUSSÉ dans cet état : son bloc JSON ne parsait plus, donc
//    `finubar/collecter.mjs` — qui agrège les huit dépôts — était cassé.
//
// ⛔ ET RIEN NE L'A VU. `tests/run-unit.mjs` rendait 38/44 et
//    `unit-export-chatgpt` 13/13, tous deux VERTS sur un grain illisible. Le
//    dépôt contrôlait l'empreinte de LECONS.md, l'accord des exports, la
//    non-vacuité de leur liste — et pas la chose la plus simple : que le fichier
//    que la collecte consomme soit du JSON.
//
// ⚠️ C'est exactement la règle DR « on vérifie que les vérifications
//    s'exécutent » retournée contre le dépôt : l'absence de contrôle se lit
//    comme un contrôle réussi.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const GRAIN = resolve(ICI, '..', 'FINUBAR.md');
const verdicts = {};
const texte = readFileSync(GRAIN, 'utf8');

// 1. Aucun marqueur de conflit. Le défaut réel du 28/09, et le moins subtil.
verdicts.aucunMarqueurDeConflit =
  !/^(<{7}|={7}|>{7})/m.test(texte);

// 2. Le bloc JSON existe. ⛔ Verrou de non-vacuité du contrôle 3 : sans lui, un
//    fichier dont le bloc a été renommé ou retiré rendrait `parse` non appelé,
//    donc aucun échec — vert en ne mesurant plus rien.
const bloc = texte.match(/```json\s*(\{[\s\S]*?\})\s*```/);
verdicts.leBlocJsonExiste = Boolean(bloc);

// 3. Il parse. C'est la seule chose que `collecter.mjs` exige vraiment.
let grain = null;
try { grain = bloc ? JSON.parse(bloc[1]) : null; } catch { grain = null; }
verdicts.leBlocJsonParse = grain !== null;

// 4. Les champs dont la collecte dépend sont là et non vides. Un grain qui parse
//    mais ne porte plus `dernier_arret.commit` rend la dérive immesurable — le
//    défaut de RenoDevis du 21/09, sous une autre forme.
verdicts.dernierArretEstComplet = Boolean(
  grain?.dernier_arret?.le && grain?.dernier_arret?.commit && grain?.dernier_arret?.quoi,
);
verdicts.prochaineActionNEstPasVide = Boolean(grain?.prochaine_action?.trim());

let echecs = 0;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '  OK  ' : '  ÉCHEC'} ${nom}`);
  if (!ok) echecs++;
}
console.log(`${Object.keys(verdicts).length - echecs}/${Object.keys(verdicts).length} contrôles`);
console.log(echecs ? 'UNIT-FINUBAR-GRAIN ECHEC' : 'UNIT-FINUBAR-GRAIN OK');
process.exitCode = echecs ? 1 : 0;
