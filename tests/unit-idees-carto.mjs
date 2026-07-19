// Unitaires de la carto des idées CÔTÉ CLIENT (boucle AD-4c) — Node pur, ZÉRO
// réseau, ZÉRO navigateur, sur le modèle de unit-carto-generee.mjs. Importe les
// fonctions PURES exportées par js/idees.js (le rendu navigateur y est gardé :
// l'import sous Node n'a aucun effet de bord).
// Fixtures = les 4 idées seed ADR-001..004, thèmes du registre adramelech/IDEES.md.
import {
  themePrincipal, libelleArchipel, numeroAdr, tronquer,
  grouperParTheme, calculerLayout, DONNEES_DEMO,
} from '../js/idees.js';

const verdicts = {};

// ---------- Fixtures : les 4 idées seed (thèmes du registre IDEES.md) ----------
const IDEES = [
  { id: 'u-001', adr_num: 1, nom: 'GLANEUR', type: 'business', theme: 'bâtiment · économie circulaire · logistique', statut: 'à raffiner', partenaire: 'Godefroy' },
  { id: 'u-002', adr_num: 2, nom: 'PROTÉE', type: 'business', theme: 'bâtiment · énergie · organisation', statut: 'à raffiner', partenaire: 'Julien' },
  { id: 'u-003', adr_num: 3, nom: 'INTENDANT', type: 'pro · business', theme: 'bâtiment · logistique de chantier · approvisionnement', statut: 'à raffiner', partenaire: null },
  { id: 'u-004', adr_num: 4, nom: 'MYCÉLIUM', type: 'pro · business', theme: 'commercial · data client · fidélisation · recommandation', statut: 'à raffiner', partenaire: null },
];
const LIENS = [
  { source_id: 'u-001', target_id: 'u-002' },
  { source_id: 'u-001', target_id: 'u-003' },
  { source_id: 'u-002', target_id: 'u-004' },
  { source_id: 'u-003', target_id: 'u-004' },
];

// ---------- 1. Thème principal : 1er token de « a · b · c » ----------
verdicts.themePremierToken =
  themePrincipal('bâtiment · économie circulaire · logistique') === 'bâtiment' &&
  themePrincipal('commercial · data client') === 'commercial' &&
  themePrincipal('  seul  ') === 'seul';
verdicts.themeNul =
  themePrincipal(null) === null && themePrincipal(undefined) === null &&
  themePrincipal('') === null && themePrincipal('   ') === null &&
  themePrincipal('· sans tête') === null;

// ---------- 2. Libellés : capitalisation, null → « À classer » ----------
verdicts.libelles =
  libelleArchipel('bâtiment') === 'Bâtiment' &&
  libelleArchipel('commercial') === 'Commercial' &&
  libelleArchipel(null) === 'À classer';

// ---------- 3. Numéro gravé zéro-paddé ----------
verdicts.numeroZeroPadde =
  numeroAdr(1) === 'ADR-001' && numeroAdr(42) === 'ADR-042' &&
  numeroAdr(123) === 'ADR-123' && numeroAdr(1234) === 'ADR-1234';

// ---------- 4. Troncature déterministe ----------
verdicts.troncature =
  tronquer('court', 10) === 'court' &&
  tronquer('exactement10', 12) === 'exactement10' &&
  tronquer('pro · business (outil né d’un besoin propre)', 14) ===
    tronquer('pro · business (outil né d’un besoin propre)', 14) &&
  tronquer('abcdefghij', 5).endsWith('…') && tronquer('abcdefghij', 5).length <= 5;

// ---------- 5. Regroupement : Bâtiment [1,2,3] puis Commercial [4] ----------
const archipels = grouperParTheme(IDEES);
const parLabel = Object.fromEntries(archipels.map((a) => [a.libelle, a.idees.map((i) => i.adr_num)]));
verdicts.deuxArchipels = archipels.length === 2;
verdicts.archipelsAttendus =
  JSON.stringify(parLabel['Bâtiment']) === JSON.stringify([1, 2, 3]) &&
  JSON.stringify(parLabel['Commercial']) === JSON.stringify([4]);
verdicts.ordreArchipels =
  archipels[0].libelle === 'Bâtiment' && archipels[1].libelle === 'Commercial';
// Tri interne par adr_num même si l'entrée est mélangée.
const melange = grouperParTheme([IDEES[3], IDEES[1], IDEES[2], IDEES[0]]);
verdicts.triInterne =
  JSON.stringify(melange.map((a) => a.idees.map((i) => i.adr_num))) ===
  JSON.stringify(archipels.map((a) => a.idees.map((i) => i.adr_num)));
// Clé de groupe insensible à la casse (« Bâtiment » rejoint « bâtiment »).
const casseMixte = grouperParTheme([
  { id: 'x1', adr_num: 1, nom: 'A', type: 't', theme: 'Bâtiment · x', statut: 'brute' },
  { id: 'x2', adr_num: 2, nom: 'B', type: 't', theme: 'bâtiment · y', statut: 'brute' },
]);
verdicts.casseInsensible = casseMixte.length === 1 && casseMixte[0].idees.length === 2;

// ---------- 6. Thème null → « À classer », toujours en DERNIER ----------
const avecOrpheline = grouperParTheme([
  { id: 'x0', adr_num: 0, nom: 'ORPHELINE', type: 'test', theme: null, statut: 'brute' },
  ...IDEES,
]);
verdicts.aClasserDernier =
  avecOrpheline.length === 3 &&
  avecOrpheline[2].libelle === 'À classer' &&
  avecOrpheline[2].idees[0].nom === 'ORPHELINE';

// ---------- 7. Layout : déterministe, borné, une position par île ----------
const l1 = calculerLayout(archipels, LIENS);
const l2 = calculerLayout(grouperParTheme(IDEES), LIENS.map((l) => ({ ...l })));
verdicts.layoutDeterministe = JSON.stringify(l1) === JSON.stringify(l2);
verdicts.uneIleParIdee = l1.iles.length === IDEES.length;
const positions = new Set(l1.iles.map((i) => `${i.x}|${i.y}`));
verdicts.positionsDistinctes = positions.size === l1.iles.length;
verdicts.ilesDansLeCadre = l1.iles.every((i) =>
  i.x - l1.rx >= 0 && i.x + l1.rx <= l1.largeur &&
  i.y - l1.ry >= 0 && i.y + l1.ry <= l1.hauteur);
verdicts.colonnesParArchipel = l1.archipels.length === 2 &&
  l1.archipels[0].x < l1.archipels[1].x;

// ---------- 8. Ponts : 4 tracés, ancrés aux centres des îles liées ----------
const parId = Object.fromEntries(l1.iles.map((i) => [i.idee.id, i]));
verdicts.quatrePonts = l1.ponts.length === 4;
verdicts.pontsAncres = LIENS.every((lien) => l1.ponts.some((p) => {
  const a = parId[lien.source_id];
  const b = parId[lien.target_id];
  return (p.x1 === a.x && p.y1 === a.y && p.x2 === b.x && p.y2 === b.y) ||
         (p.x1 === b.x && p.y1 === b.y && p.x2 === a.x && p.y2 === a.y);
}));
// Robustesse : extrémité inconnue, auto-lien et doublon ignorés SANS bruit.
const lBruit = calculerLayout(archipels, [
  ...LIENS,
  { source_id: 'u-001', target_id: 'inconnu' },
  { source_id: 'u-002', target_id: 'u-002' },
  { source_id: 'u-002', target_id: 'u-001' }, // doublon non orienté de 001↔002
  null,
]);
verdicts.liensInvalidesIgnores = lBruit.ponts.length === 4;

// ---------- 9. Données démo alignées sur le registre (mode démo utilisable) ----------
const demoArch = grouperParTheme(DONNEES_DEMO.idees);
verdicts.demoAligneeRegistre =
  DONNEES_DEMO.idees.length === 4 && DONNEES_DEMO.liens.length === 4 &&
  DONNEES_DEMO.idees.every((i, k) => i.adr_num === k + 1 && i.statut === 'à raffiner') &&
  demoArch.length === 2 &&
  demoArch[0].libelle === 'Bâtiment' && demoArch[0].idees.length === 3 &&
  demoArch[1].libelle === 'Commercial' && demoArch[1].idees.length === 1 &&
  calculerLayout(demoArch, DONNEES_DEMO.liens).ponts.length === 4;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-IDEES-CARTO OK' : 'UNIT-IDEES-CARTO ECHEC');
process.exit(ok ? 0 : 1);
