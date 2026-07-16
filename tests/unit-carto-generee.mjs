// Unitaires de la carto ADRAMELECH générée (sous-boucle AD-1). Node pur, ZÉRO
// réseau, ZÉRO navigateur — sur le modèle de unit-secteur.mjs / unit-auth.mjs.
// Prouve les invariants du cadrage §5 AD-1 pt 4 :
//   - déterminisme (même registre → sortie octet-pour-octet identique),
//   - zéro idée perdue (chaque ADR-### du registre apparaît dans la sortie),
//   - regroupement correct (chaque idée dans l'archipel de son thème principal ;
//     nombre d'archipels = nombre de thèmes principaux distincts),
//   - idée sans thème → archipel « À classer » (fixture EN MÉMOIRE, IDEES.md
//     n'est pas modifié),
//   - parseur robuste : une entrée mal formée FAIT ÉCHOUER le parseur (jamais de
//     perte silencieuse).
import { readFileSync } from 'node:fs';
import {
  parseRegistre, grouperArchipels, detecterPonts, genererDocument,
} from '../adramelech/generer-carto.mjs';

const REGISTRE = new URL('../adramelech/IDEES.md', import.meta.url);
const md = readFileSync(REGISTRE, 'utf8');
const verdicts = {};

// ---------- 1. Déterminisme : deux générations → sortie identique ----------
const doc1 = genererDocument(md);
const doc2 = genererDocument(md);
verdicts.deterministe = doc1 === doc2 && doc1.length > 0;

// ---------- 2. Zéro idée perdue : chaque ADR-### du registre est rendu ----------
// Réels ID au registre = en-têtes « ## ADR-### — … » (pas les placeholders de
// l'intro, écrits « ADR-### » avec des dièses).
const idsRegistre = [...md.matchAll(/^##\s+(ADR-\d{3})\s+—/gm)].map((m) => m[1]);
verdicts.zeroIdeePerdue = idsRegistre.length >= 4 &&
  idsRegistre.every((id) => doc1.includes(id));

// ---------- 3. Regroupement correct ----------
const idees = parseRegistre(md);
const archipels = grouperArchipels(idees);
// Chaque idée est dans l'archipel de sa clé de thème principal.
const chaqueIdeeBienPlacee = archipels.every((arc) =>
  arc.idees.every((i) => (i.themeKey || ' à classer') === arc.key));
// Nombre d'archipels = nombre de thèmes principaux distincts (null → 1 groupe).
const clesDistinctes = new Set(idees.map((i) => i.themeKey || ' à classer'));
verdicts.regroupementCorrect = chaqueIdeeBienPlacee &&
  archipels.length === clesDistinctes.size;
// Donnée de référence : GLANEUR+PROTÉE+INTENDANT sous « Bâtiment », MYCÉLIUM
// seul sous « Commercial » (les 3 premiers ont « bâtiment » en tête de Thème).
const parLabel = Object.fromEntries(archipels.map((a) => [a.label, a.idees.map((i) => i.id)]));
verdicts.archipelsAttendus =
  JSON.stringify(parLabel['Bâtiment']) === JSON.stringify(['ADR-001', 'ADR-002', 'ADR-003']) &&
  JSON.stringify(parLabel['Commercial']) === JSON.stringify(['ADR-004']);

// ---------- 4. Idée sans thème → archipel « À classer » (fixture en mémoire) ----------
// On n'ajoute PAS l'idée à IDEES.md : la fixture vit ici, en mémoire.
const fixtureSansTheme = `## ADR-900 — ORPHELINE

*Nom : idée test sans thème — vérifie le repli « À classer ».*

- **Type** : test
- **Thème** :
- **Statut** : brute
`;
const ideesFix = parseRegistre(fixtureSansTheme);
const archFix = grouperArchipels(ideesFix);
verdicts.ideeSansTheme = ideesFix.length === 1 &&
  ideesFix[0].themePrincipal === null &&
  archFix.length === 1 &&
  archFix[0].label === 'À classer' &&
  archFix[0].idees[0].id === 'ADR-900';
// La sortie complète rend bien le libellé « À classer ».
verdicts.aClasserRendu = genererDocument(fixtureSansTheme).includes('À classer');

// ---------- 5. Parseur robuste : entrée mal formée → échec bruyant ----------
function echoue(markdownCasse) {
  try { parseRegistre(markdownCasse); return false; }
  catch { return true; }
}
// (a) champ **Statut** manquant → pas d'escamotage silencieux, on lève.
const sansStatut = `## ADR-901 — CASSEE

- **Type** : test
- **Thème** : bâtiment
`;
// (b) en-tête d'idée sans nom → illisible → on lève.
const sansNom = `## ADR-902 —

- **Type** : test
- **Statut** : brute
`;
// (c) identifiant en double → on lève.
const enDouble = `## ADR-903 — UNE

- **Type** : test
- **Statut** : brute

## ADR-903 — DEUX

- **Type** : test
- **Statut** : brute
`;
verdicts.parseurRobuste = echoue(sansStatut) && echoue(sansNom) && echoue(enDouble);
// Non-régression : une idée BIEN formée ne lève jamais.
verdicts.bienFormeeOk = !echoue(fixtureSansTheme) && parseRegistre(md).length === idsRegistre.length;

// ---------- 6. Ponts : synergies ADR↔ADR détectées (non orientées, dédupliquées) ----------
const ponts = detecterPonts(idees);
const cles = new Set(ponts.map((p) => `${p.a}|${p.b}`));
verdicts.pontsDetectes = ponts.length === 4 &&
  cles.has('ADR-001|ADR-002') && cles.has('ADR-001|ADR-003') &&
  cles.has('ADR-002|ADR-004') && cles.has('ADR-003|ADR-004');

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-CARTO-GENEREE OK' : 'UNIT-CARTO-GENEREE ECHEC');
process.exit(ok ? 0 : 1);
