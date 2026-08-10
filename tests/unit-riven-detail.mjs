// Unitaires RIVEN 0024 — le détail des fiches, la personne, le rattachement.
// Node pur, zéro réseau, zéro navigateur. Prouve le MIROIR API/DB : chaque
// borne testée ici est la même que le CHECK de
// supabase/migrations/0024_riven_detail.sql. Une entrée invalide donne une
// ERREUR STRUCTURÉE (→ 400 côté handler), jamais une exception (→ 500).
// Testable SANS la migration : validate.js valide le corps avant PostgREST.
//
// Couvre les critères ① et ⑥ de CADRAGE-RIVEN-DETAIL.md §4, et les
// pre-mortems P6 (vide → null, une seule convention) et P1 (bornes des tags).
import { validateNode, validatePersonne, validateRattachement } from '../api/_lib/validate.js';

const verdicts = {};
const UUID_A = '11111111-2222-4333-8444-555555555555';
const UUID_B = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

// ---------------------------------------------------------------------------
// A. Les onze champs de détail sur un nœud
// ---------------------------------------------------------------------------

// 1. Liste blanche : les onze champs passent rejectUnknown. Sans leur ajout à
//    NODE_FIELDS, tout POST/PATCH les portant serait rejeté en bloc.
const complet = validateNode({
  type: 'artisan',
  nom: 'Plomberie Roux & Fils',
  secteur_activite: 'Plomberie',
  nature: 'Entreprise',
  metiers_secondaires: ['Chauffage', 'Pompe à chaleur'],
  prestations: 'Sanitaire complet, remplacement de chaudière.',
  zone_intervention: 'Rhône et Ain',
  rayon_km: 60,
  effectif: 7,
  certifications: ['RGE', 'QualiPAC'],
  fiabilite: 5,
  reactivite: 4,
  niveau_prix: 3,
  disponibilite: 'sous 48 h',
}, 'create');
verdicts.onzeChampsAcceptes = !complet.error &&
  complet.value.nature === 'Entreprise' &&
  complet.value.metiers_secondaires.length === 2 &&
  complet.value.certifications[0] === 'RGE' &&
  complet.value.rayon_km === 60 &&
  complet.value.effectif === 7 &&
  complet.value.fiabilite === 5 &&
  complet.value.reactivite === 4 &&
  complet.value.niveau_prix === 3 &&
  complet.value.disponibilite === 'sous 48 h' &&
  complet.value.zone_intervention === 'Rhône et Ain' &&
  complet.value.prestations.startsWith('Sanitaire');

// 2. Non-régression : le flux court d'avant (nom + type) n'émet AUCUN des
//    champs neufs. Le formulaire replié ne doit rien envoyer de fantôme.
const court = validateNode({ type: 'artisan', nom: 'Zoé Sans Détail' }, 'create');
verdicts.fluxCourtIntact = !court.error &&
  !('nature' in court.value) && !('metiers_secondaires' in court.value) &&
  !('fiabilite' in court.value) && Object.keys(court.value).length === 2;

// 3. Un champ inconnu reste refusé (la liste blanche ne s'est pas ouverte).
const inconnu = validateNode({ nom: 'X', metier_principal: 'Plomberie' }, 'update');
verdicts.champInconnuRefuse = inconnu.error === 'Champ non autorisé : metier_principal';

// 4. Cardinalité des tags = 12 (CHECK riven_tags_valides). 12 passe, 13 non.
const douze = validateNode(
  { nom: 'X', metiers_secondaires: Array.from({ length: 12 }, (_, i) => 'm' + i) }, 'update');
const treize = validateNode(
  { nom: 'X', metiers_secondaires: Array.from({ length: 13 }, (_, i) => 'm' + i) }, 'update');
verdicts.cardinalite12 = !douze.error && douze.value.metiers_secondaires.length === 12 &&
  treize.error === 'Métiers : 12 au maximum';

// 5. Longueur d'un tag : 120 pour un métier, 80 pour une certification —
//    bornes DIFFÉRENTES, exactement comme les deux CHECK de 0024.
const metier120 = validateNode({ nom: 'X', metiers_secondaires: ['a'.repeat(120)] }, 'update');
const metier121 = validateNode({ nom: 'X', metiers_secondaires: ['a'.repeat(121)] }, 'update');
const certif80 = validateNode({ nom: 'X', certifications: ['a'.repeat(80)] }, 'update');
const certif81 = validateNode({ nom: 'X', certifications: ['a'.repeat(81)] }, 'update');
verdicts.bornesTags = !metier120.error && metier121.error === 'Métiers trop long' &&
  !certif80.error && certif81.error === 'Certifications trop long';

// 6. Un tag vide (ou blanc) fait échouer TOUT le champ : jamais de rejet
//    silencieux d'un élément au milieu d'une liste que Paul croit enregistrée.
const tagVide = validateNode({ nom: 'X', certifications: ['RGE', '   '] }, 'update');
verdicts.tagVideRefuse = tagVide.error === 'Certifications : entrée vide';

// 7. Un tag non-texte, et un champ qui n'est pas un tableau : erreurs, pas
//    d'exception.
const tagNombre = validateNode({ nom: 'X', certifications: ['RGE', 42] }, 'update');
const pasUnTableau = validateNode({ nom: 'X', certifications: 'RGE' }, 'update');
verdicts.tagsTypes = tagNombre.error === 'Certifications invalide' &&
  pasUnTableau.error === 'Certifications invalide';

// 8. P6 — LA CONVENTION DU VIDE, dans les deux sens : un tableau vide devient
//    null (jamais [] sur le fil), et null explicite reste null (vidage).
const tableauVide = validateNode({ nom: 'X', metiers_secondaires: [] }, 'update');
const tableauNull = validateNode({ nom: 'X', metiers_secondaires: null }, 'update');
verdicts.videNormaliseVersNull = !tableauVide.error &&
  tableauVide.value.metiers_secondaires === null &&
  !tableauNull.error && tableauNull.value.metiers_secondaires === null;

// 9. Les tags sont détourés (« RGE » et «  RGE  » donnent la même chose) : la
//    base stocke ce que Paul lira, pas ses espaces de frappe.
const tagsDetoures = validateNode({ nom: 'X', certifications: ['  RGE  ', 'Qualibat'] }, 'update');
verdicts.tagsDetoures = !tagsDetoures.error &&
  tagsDetoures.value.certifications[0] === 'RGE';

// 10. Échelles 1..5 (mêmes bornes que les efforts de 0005) : 0 et 6 refusés.
const note0 = validateNode({ nom: 'X', fiabilite: 0 }, 'update');
const note6 = validateNode({ nom: 'X', fiabilite: 6 }, 'update');
const note1 = validateNode({ nom: 'X', fiabilite: 1 }, 'update');
const note5 = validateNode({ nom: 'X', niveau_prix: 5 }, 'update');
verdicts.echelles1a5 = note0.error === 'Fiabilité invalide' &&
  note6.error === 'Fiabilité invalide' &&
  !note1.error && note1.value.fiabilite === 1 &&
  !note5.error && note5.value.niveau_prix === 5;

// 11. Rayon et effectif : 0 est LICITE (un artisan qui ne se déplace pas), le
//     négatif ne l'est pas, le décimal non plus (smallint / integer en base).
const rayon0 = validateNode({ nom: 'X', rayon_km: 0 }, 'update');
const rayonNegatif = validateNode({ nom: 'X', rayon_km: -1 }, 'update');
const rayonDecimal = validateNode({ nom: 'X', rayon_km: 12.5 }, 'update');
const rayonTropGrand = validateNode({ nom: 'X', rayon_km: 2001 }, 'update');
const effectifMax = validateNode({ nom: 'X', effectif: 100000 }, 'update');
verdicts.bornesNombres = !rayon0.error && rayon0.value.rayon_km === 0 &&
  rayonNegatif.error === "Rayon d'intervention invalide" &&
  rayonDecimal.error === "Rayon d'intervention invalide" &&
  rayonTropGrand.error === "Rayon d'intervention invalide" &&
  !effectifMax.error && effectifMax.value.effectif === 100000;

// 12. Bornes des textes de détail (miroir des CHECK char_length de 0024).
const nature80 = validateNode({ nom: 'X', nature: 'a'.repeat(80) }, 'update');
const nature81 = validateNode({ nom: 'X', nature: 'a'.repeat(81) }, 'update');
const dispo121 = validateNode({ nom: 'X', disponibilite: 'a'.repeat(121) }, 'update');
verdicts.bornesTextes = !nature80.error && nature81.error === 'Nature trop long' &&
  dispo121.error === 'Disponibilité trop long';

// 13. Vidage en édition : chaque champ de détail accepte null (la ligne de
//     fiche disparaît), y compris les nombres.
const vidage = validateNode(
  { nom: 'X', nature: null, fiabilite: null, certifications: null }, 'update');
verdicts.vidageDetail = !vidage.error && vidage.value.nature === null &&
  vidage.value.fiabilite === null && vidage.value.certifications === null;

// ---------------------------------------------------------------------------
// B. La personne — elle n'a besoin d'AUCUN nœud
// ---------------------------------------------------------------------------

// 14. LE CŒUR DE LA DEMANDE : un nom suffit. Aucun node_id n'est requis, et le
//     validateur n'en produit aucun.
const personneNue = validatePersonne({ nom: 'Godefroy Aubert' }, 'create');
verdicts.personneSansNoeud = !personneNue.error &&
  personneNue.value.nom === 'Godefroy Aubert' &&
  Object.keys(personneNue.value).length === 1;

// 15. Une personne ne PEUT PAS porter de nœud : le champ est refusé par la
//     liste blanche. Le lien vit sur le rattachement, et nulle part ailleurs —
//     c'est ce qui garantit qu'il peut être multiple.
const personneAvecNoeud = validatePersonne({ nom: 'X', node_id: UUID_A }, 'create');
verdicts.personneNePortePasDeNoeud = personneAvecNoeud.error === 'Champ non autorisé : node_id';

// 16. Nom obligatoire en création, borné à 200, détouré.
const sansNom = validatePersonne({ fonction: 'Gérant' }, 'create');
const nomVide = validatePersonne({ nom: '   ' }, 'create');
const nom200 = validatePersonne({ nom: 'a'.repeat(200) }, 'create');
const nom201 = validatePersonne({ nom: 'a'.repeat(201) }, 'create');
const nomDetoure = validatePersonne({ nom: '  Karim Roux  ' }, 'create');
verdicts.personneNom = sansNom.error === 'Nom invalide' && nomVide.error === 'Nom invalide' &&
  !nom200.error && nom201.error === 'Nom invalide' &&
  nomDetoure.value.nom === 'Karim Roux';

// 17. Champs optionnels bornés, e-mail validé dans la forme (comme un nœud).
const fonction121 = validatePersonne({ nom: 'X', fonction: 'a'.repeat(121) }, 'update');
const mauvaisMail = validatePersonne({ nom: 'X', email: 'pas-un-mail' }, 'update');
const bonMail = validatePersonne({ nom: 'X', email: 'k.roux@exemple.fr' }, 'update');
const mailVide = validatePersonne({ nom: 'X', email: null }, 'update');
verdicts.personneChamps = fonction121.error === 'Fonction trop long' &&
  mauvaisMail.error === 'Email invalide' &&
  !bonMail.error && bonMail.value.email === 'k.roux@exemple.fr' &&
  !mailVide.error && mailVide.value.email === null;

// 18. Update vide refusé (aucun PATCH sans contenu ne part vers PostgREST).
const updateVide = validatePersonne({}, 'update');
verdicts.personneUpdateVide = updateVide.error === 'Aucun champ à mettre à jour';

// ---------------------------------------------------------------------------
// C. Le rattachement — 0, 1 ou N, avec un rôle par nœud
// ---------------------------------------------------------------------------

// 19. Création : les deux UUID sont exigés, le rôle est facultatif (on rattache
//     d'abord, on qualifie plus tard — RADAR n°2, saisie au pouce).
const lienNu = validateRattachement({ personne_id: UUID_A, node_id: UUID_B }, 'create');
verdicts.rattachementSansRole = !lienNu.error &&
  lienNu.value.personne_id === UUID_A && lienNu.value.node_id === UUID_B &&
  !('role' in lienNu.value);

// 20. Un identifiant qui n'est pas un UUID est refusé AVANT la base.
const idBidon = validateRattachement({ personne_id: 'demo-p1', node_id: UUID_B }, 'create');
const noeudBidon = validateRattachement({ personne_id: UUID_A, node_id: 'demo-n2' }, 'create');
verdicts.rattachementUuid = idBidon.error === 'Identifiant de personne invalide' &&
  noeudBidon.error === 'Identifiant de fiche invalide';

// 21. LA DEMANDE N°3 : rien dans le validateur ne limite le nombre de nœuds
//     d'une personne — deux rattachements de la MÊME personne vers deux nœuds
//     différents, avec deux rôles distincts, sont tous deux valides.
const chezA = validateRattachement({ personne_id: UUID_A, node_id: UUID_B, role: 'Gérant' }, 'create');
const chezB = validateRattachement(
  { personne_id: UUID_A, node_id: '99999999-8888-4777-8666-555555555555', role: "Apporteur d'affaires" },
  'create');
verdicts.memePersonnePlusieursNoeuds = !chezA.error && !chezB.error &&
  chezA.value.personne_id === chezB.value.personne_id &&
  chezA.value.node_id !== chezB.value.node_id &&
  chezA.value.role !== chezB.value.role;

// 22. Le rôle est borné à 120 (CHECK de 0024).
const role121 = validateRattachement({ personne_id: UUID_A, node_id: UUID_B, role: 'a'.repeat(121) }, 'create');
verdicts.roleBorne = role121.error === 'Rôle trop long';

// 23. En update, SEUL le rôle bouge : déplacer un rattachement est interdit
//     (on le retire et on le recrée, motif des edges RIVEN).
const majRole = validateRattachement({ role: 'Référent chantier' }, 'update');
const deplacement = validateRattachement({ node_id: UUID_B }, 'update');
const updateVideLien = validateRattachement({}, 'update');
verdicts.rattachementUpdate = !majRole.error && majRole.value.role === 'Référent chantier' &&
  deplacement.error === 'Champ non autorisé : node_id' &&
  updateVideLien.error === 'Aucun champ à mettre à jour';

// 24. Corps invalides (tableau, null) : erreur structurée, jamais d'exception.
verdicts.corpsInvalides =
  validatePersonne(null, 'create').error === 'Corps de requête invalide' &&
  validateRattachement([], 'create').error === 'Corps de requête invalide' &&
  validateNode('x', 'create').error === 'Corps de requête invalide';

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-RIVEN-DETAIL OK' : 'UNIT-RIVEN-DETAIL ECHEC');
process.exit(ok ? 0 : 1);
