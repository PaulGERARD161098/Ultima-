// L'adaptateur LV4 — registre de navigation → données du ciel (étape ③).
//
// Unitaire PUR : ni navigateur, ni réseau, ni DOM. L'adaptateur est un module
// sans I/O, donc il s'éprouve sans rien allumer — et il DOIT l'être ici plutôt
// qu'à travers une maquette, où un défaut de conversion se confondrait avec un
// défaut de rendu.
//
// Ce que ce harnais prouve :
//   1. Un écran devient une constellation : ses caps, leurs états, leurs cibles.
//   2. Aucune PII, aucune couleur inventée, aucune écriture dans le registre.
//   3. LA PROFONDEUR : déplier montre les enfants SANS quitter l'étage, et les
//      rattache par un trait.
//   4. LA GARDE : on ne déplie que ce qui appartient à l'étage. C'est ce qui
//      empêchait le dépliage de s'emballer, et ça vit désormais dans
//      l'adaptateur — un garde-fou que l'appelant doit penser à installer n'est
//      pas un garde-fou.
//   5. LE CHEMIN : le fil d'Ariane se lit dans le registre, et un registre
//      malade (boucle, nœud inconnu) ne fait pas tourner la page sans fin.
//   6. L'ISOLEMENT (2026-08-28) : cliquer une constellation ne montre plus
//      QU'ELLE — ses frères disparaissent, ses deux étages paraissent d'un
//      coup, et le foyer lui-même n'est pas peint. Éprouvé sur le VRAI
//      registre autant que sur un registre construit : c'est le produit que
//      Paul regarde, pas un cas d'école.
import { versCiel, cheminVers, descendDe } from '../js/adaptateur-lv4.mjs';
import { NOEUDS } from '../js/registre-lv3.mjs';

const verdicts = {};
const dit = (nom, valeur) => { verdicts[nom] = valeur; };

// ---------- 1. Un écran devient une constellation ----------
const racine = versCiel('racine', NOEUDS);
const attendus = NOEUDS.racine.enfants;
dit('racineRendTousSesCaps', racine.noeuds.length === attendus.length);
dit('racineGardeLOrdreDuRegistre',
  racine.noeuds.map((n) => n.id).join(',') === attendus.join(','));
dit('racineNommeLaConstellationCommeLEcran',
  racine.noeuds.every((n) => n.secteur_activite === NOEUDS.racine.nom));
dit('capsPortentLeurEtat',
  racine.noeuds.every((n) => n.statut === (NOEUDS[n.id].etat || '')));
dit('capsPortentLeurCible',
  racine.noeuds.every((n) => n.cible === (NOEUDS[n.id].cible || null)));

// ---------- 2. Ce que l'adaptateur n'a PAS le droit de faire ----------
// La règle du 2026-07-30 : une règle de confidentialité se teste par l'ABSENCE.
// Ici, l'absence de personnes — le ciel LV4 est une carte d'ÉCRANS, et si des
// personnes s'y glissaient un jour, elles seraient de la PII servie en clair.
dit('aucunePersonne', racine.personnes.length === 0 && racine.rattachements.length === 0);
dit('aucuneCouleurInventee',
  racine.noeuds.every((n) => !('couleur' in n) && !('type_couleur' in n)));
// Le registre est LU, jamais écrit : on compare un instantané pris avant.
const avant = JSON.stringify(NOEUDS);
versCiel('racine', NOEUDS, { deplie: NOEUDS.racine.enfants[0] });
dit('registreIntact', JSON.stringify(NOEUDS) === avant);

// ---------- 3. La profondeur ----------
// Le pire cas se CONSTRUIT (règle du 2026-08-01) : un registre à trois étages,
// où l'écran, l'objet déplié et ses enfants existent tous les trois. Le
// registre du jour ne garantit pas cette configuration ; on ne la souhaite pas,
// on la pose.
const REG = {
  ecran: { nom: 'ÉCRAN', enfants: ['a', 'b'] },
  a: { nom: 'A', etat: 'Ouvert', cible: 'a.html', enfants: ['a1', 'a2'] },
  b: { nom: 'B', etat: 'À venir', enfants: [] },
  a1: { nom: 'A1', etat: 'Ouvert', cible: 'a1.html' },
  a2: { nom: 'A2', etat: 'Ouvert', cible: 'a2.html' },
  intrus: { nom: 'INTRUS', enfants: ['x'] },
  x: { nom: 'X' }
};

const plie = versCiel('ecran', REG);
const ouvert = versCiel('ecran', REG, { deplie: 'a' });
dit('deplieAjouteLesEnfants', ouvert.noeuds.length === plie.noeuds.length + 2);
dit('deplieNeQuittePasLEtage',
  ouvert.idsDuNiveau.join(',') === 'a,b' && plie.idsDuNiveau.join(',') === 'a,b');
dit('enfantsDeplieFormentLeurConstellation',
  ouvert.noeuds.filter((n) => ['a1', 'a2'].includes(n.id))
    .every((n) => n.secteur_activite === 'A'));
dit('enfantsDeplieRattachesAuParent',
  ouvert.relations.filter((r) => r.source_id === 'a').length === 2);
dit('deplieAnnonceCeQuIlADeplie', ouvert.deplie === 'a' && plie.deplie === null);

// ---------- 4. La garde ----------
// Déplier un objet qui n'est PAS de l'étage ne doit RIEN faire — c'est la
// correction de l'emballement, remontée de la maquette dans l'adaptateur.
const horsEtage = versCiel('ecran', REG, { deplie: 'intrus' });
dit('gardeRefuseCeQuiNEstPasDeLEtage',
  horsEtage.noeuds.length === plie.noeuds.length && horsEtage.deplie === null);
const inexistant = versCiel('ecran', REG, { deplie: 'jamais-vu' });
dit('gardeRefuseLInconnu', inexistant.noeuds.length === plie.noeuds.length);
// Un objet SANS enfants se déplie sans rien ajouter, et sans casser.
const vide = versCiel('ecran', REG, { deplie: 'b' });
dit('deplierUnObjetVideNAjouteRien', vide.noeuds.length === plie.noeuds.length);
dit('ecranInconnuRendNull', versCiel('jamais-vu', REG) === null);

// ---------- 5. Le chemin ----------
const chemin = cheminVers('a', REG, 'ecran');
dit('cheminRemonteJusquALaRacine', chemin.join('/') === 'ecran/a');
dit('cheminDUnPetitEnfant', cheminVers('a1', REG, 'ecran').join('/') === 'ecran/a/a1');
dit('cheminDeLaRacineEstElleMeme', cheminVers('ecran', REG, 'ecran').join('/') === 'ecran');
dit('cheminDUnInconnuEstVide', cheminVers('jamais-vu', REG, 'ecran').length === 0);
// Un nœud qui existe mais qui ne descend pas de la racine n'invente pas de fil.
dit('cheminHorsArbreEstVide', cheminVers('x', REG, 'ecran').length === 0);
// UN REGISTRE MALADE NE DOIT PAS EMPORTER LA PAGE. Une boucle parent↔enfant
// ferait tourner une remontée naïve sans fin ; on l'éprouve au lieu de parier
// qu'elle n'arrivera pas.
const BOUCLE = { p: { nom: 'P', enfants: ['q'] }, q: { nom: 'Q', enfants: ['p'] } };
dit('cheminSurviveALaBoucle', cheminVers('q', BOUCLE, 'jamais').length === 0);

// Et sur le VRAI registre, le chemin doit exister pour chaque écran réel.
const ecransReels = Object.keys(NOEUDS).filter((id) => (NOEUDS[id].enfants || []).length > 0);
dit('cheminExistePourTousLesEcransReels',
  ecransReels.every((id) => cheminVers(id, NOEUDS).length > 0));

// ---------- 6. L'ISOLEMENT ----------
// Le pire cas est ici le registre RÉEL : c'est lui qui porte les formes que la
// règle doit distinguer — une tête pleine (NICOL BOLAS), une tête vide (RIVEN),
// et des jumeaux reliés (RESHIRAM ⇄ ZEKROM) qui vivent DEUX étages plus bas.
// 2026-09-29 : l'écran est OMEGA (ex-ULTIMA) et le foyer isolé de référence est
// IMLADRIK (ex-NAGA : GRIMA et NAGA sont supprimés, IMLADRIK porte désormais
// ses cinq caps dont ADRAMELECH et TAO).
const plieOmega = versCiel('omega', NOEUDS);
const foyerImladrik = versCiel('omega', NOEUDS, { isole: 'imladrik' });
const idsImladrik = foyerImladrik.noeuds.map((n) => n.id);

// ① On ne montre QUE les enfants directs du foyer.
// REMPLACE `isoleMontreLesDeuxEtages` (2026-08-28), qui exigeait les têtes ET
// leurs projets. Paul a resserré la règle le 31/08 : « affiche-moi juste les
// grands thèmes ». L'ancien verdict n'est pas abandonné, il est INVERSÉ — et
// c'est son absence, ci-dessous, qui le remplace : un test qui exigeait une
// présence doit devenir un test qui exige l'absence, sinon on ne mesure plus
// rien du changement.
dit('isoleNeMontreQueLesEnfantsDirects',
  idsImladrik.join(',') === NOEUDS.imladrik.enfants.join(',')
  && idsImladrik.length === 5);
// ①bis Et surtout : les PETITS-enfants ne sont pas peints. C'est ce verdict-là
// qui garde la nouvelle règle ; sans lui, un retour au comportement d'avant
// passerait vert (les enfants directs y étaient aussi).
dit('isoleNeDescendPasAuDeuxiemeEtage',
  ['reshiram', 'zekrom', 'registre', 'archipels', 'rapprochements']
    .every((id) => !idsImladrik.includes(id)));
// ② Les frères ont disparu : RIVEN et NICOL BOLAS (frères d'IMLADRIK sous
// OMEGA) ne sont plus là, ni rien de ce qu'ils portent.
dit('isoleFaitDisparaitreLesFreres',
  !idsImladrik.includes('riven') && !idsImladrik.includes('nicol-bolas')
  && !idsImladrik.includes('abaque'));
// ③ Le foyer lui-même n'est pas peint (« ça n'affiche pas forcément encore le foyer »).
dit('isoleNePeintPasLeFoyer', !idsImladrik.includes('imladrik'));

// ④ LA RÉCURSION — le cœur de la demande du 31/08 : « ensuite, quand on clique
// dessus, la suivante s'applique ». Le geste doit être IDENTIQUE à tous les
// étages : isoler un thème montre ses enfants directs, et eux seuls. On
// l'éprouve sur les deux étages du dessous plutôt que sur le seul cas du jour,
// qui serait un échantillon favorable.
const imladrik = foyerImladrik;
dit('isoleDescendDUnCranQuelQueSoitLEtage',
  imladrik.noeuds.map((n) => n.id).join(',') === NOEUDS.imladrik.enfants.join(','));
const tao = versCiel('omega', NOEUDS, { isole: 'tao' });
dit('isoleSAppliquePareilDeuxEtagesPlusBas',
  tao.noeuds.map((n) => n.id).join(',') === NOEUDS.tao.enfants.join(','));

// La règle de groupement : une seule constellation à l'écran, au nom du FOYER.
// REMPLACE `isoleGroupeLesProjetsSousLeurTete` et `isoleRangeUneTeteVideSousLeFoyer`
// (2026-08-28) : à un seul étage, grouper par tête fabriquerait autant d'amas
// d'UNE étoile que de têtes, chacun étiqueté du nom de l'étoile qu'il contient.
const secteurDe = (jeu, id) => (jeu.noeuds.find((n) => n.id === id) || {}).secteur_activite;
dit('isoleGroupeToutSousLeNomDuFoyer',
  foyerImladrik.noeuds.every((n) => n.secteur_activite === 'IMLADRIK'));
// Tête vide (MAEDRETHNIR, feuille) ET têtes pleines (ADRAMELECH, TAO) : même amas.
dit('isoleNommeLAmasDApresLeFoyerMemeAvecUneTeteVide',
  secteurDe(foyerImladrik, 'maedrethnir') === 'IMLADRIK'
  && secteurDe(foyerImladrik, 'adramelech') === 'IMLADRIK'
  && secteurDe(foyerImladrik, 'tao') === 'IMLADRIK');
// NICOL BOLAS isolé : son amas porte son nom, plus celui d'un macro-quadrant.
const nicol = versCiel('omega', NOEUDS, { isole: 'nicol-bolas' });
dit('isoleNicolBolasNommeSonAmas',
  nicol.noeuds.length > 0 && nicol.noeuds.every((n) => n.secteur_activite === 'NICOL BOLAS'));
// Plus aucun secteur GRIMA / NAGA nulle part : ces amas n'existent plus.
dit('aucunSecteurGrimaNagaDansLesIsolements',
  ['omega', 'imladrik', 'tao', 'nicol-bolas', 'adramelech'].every((f) => {
    const jeu = versCiel('omega', NOEUDS, { isole: f });
    return jeu.noeuds.every((n) => n.secteur_activite !== 'GRIMA' && n.secteur_activite !== 'NAGA');
  }));
dit('isolerGrimaOuNagaEstRefuse',
  versCiel('omega', NOEUDS, { isole: 'grima' }).isole === null
  && versCiel('omega', NOEUDS, { isole: 'naga' }).isole === null);

// Les traits. REMPLACE `isoleRattacheChaqueProjetASaTete` (2026-08-28) : il
// n'y a plus de projet à rattacher, donc plus un seul arc de rattachement —
// et c'est cette ABSENCE qu'on mesure, un arc orphelin serait un trait vers
// une étoile qui n'est pas là.
dit('isoleNInventePlusDeRattachement',
  foyerImladrik.relations.filter((r) => r.type === 'apport_affaires').length === 0);
// La passerelle des jumeaux survit à l'isolement, MAIS SEULEMENT quand les deux
// bouts sont peints. Elle a changé d'étage avec la règle : RESHIRAM ⇄ ZEKROM
// vivent sous TAO, donc elle apparaît en isolant TAO — et plus en isolant IMLADRIK,
// où aucun des deux n'est peint. Éprouvée par la présence ET par l'absence.
const passerelle = (jeu) => jeu.relations.filter((r) => r.type === 'chantier_commun');
dit('isoleGardeLaPasserelleDesJumeaux',
  passerelle(tao).length === 1 && passerelle(tao)[0].source_id === 'reshiram'
  && passerelle(tao)[0].target_id === 'zekrom'
  && passerelle(tao)[0].libelle === NOEUDS.reshiram.lienLibelle);
dit('isoleNInventePasDArcVersLInvisible',
  passerelle(foyerImladrik).length === 0 && passerelle(imladrik).length === 0);

// Ce qui peut encore se déplier, ce sont les TÊTES, et elles seules.
dit('isoleAnnonceSesTetes',
  foyerImladrik.idsDuNiveau.join(',') === NOEUDS.imladrik.enfants.join(',')
  && foyerImladrik.isole === 'imladrik' && foyerImladrik.deplie === null);
dit('nonIsoleLeDitAussi', plieOmega.isole === null);

// ---------- 6bis. LES GARDES DE L'ISOLEMENT ----------
// Quatre refus, quatre raisons distinctes. Un seul cas oublié suffirait à
// rendre un écran vide ou menteur : on les éprouve tous les quatre.
const memeQuePlie = (jeu) =>
  jeu.noeuds.map((n) => n.id).join(',') === plieOmega.noeuds.map((n) => n.id).join(',')
  && jeu.isole === null;
dit('gardeRefuseDIsolerLEcranLuiMeme',
  memeQuePlie(versCiel('omega', NOEUDS, { isole: 'omega' })));
dit('gardeRefuseDIsolerUneFeuille',
  memeQuePlie(versCiel('omega', NOEUDS, { isole: 'riven' })));
dit('gardeRefuseDIsolerLInconnu',
  memeQuePlie(versCiel('omega', NOEUDS, { isole: 'jamais-vu' })));
// Le cas qui vient de l'URL : `omega.html#alpha`. ALPHA existe et a des
// enfants, mais il ne relève PAS de cet écran — l'isoler ferait afficher, sous
// le bandeau d'OMEGA, le contenu d'ALPHA.
dit('gardeRefuseUnNoeudEtrangerALEcran',
  memeQuePlie(versCiel('omega', NOEUDS, { isole: 'alpha' })));

// Le registre reste LU, jamais écrit — y compris par le chemin de l'isolement.
const avantIsolement = JSON.stringify(NOEUDS);
versCiel('omega', NOEUDS, { isole: 'imladrik' });
dit('isolementNEcritPasDansLeRegistre', JSON.stringify(NOEUDS) === avantIsolement);
// Aucune personne ne s'y glisse non plus (règle de l'ABSENCE, 2026-07-30).
dit('isolementSansPersonne',
  foyerImladrik.personnes.length === 0 && foyerImladrik.rattachements.length === 0);

// ---------- 6ter. `descendDe` ----------
dit('descendDeVoitUnPetitEnfant', descendDe('omega', 'maedrethnir', NOEUDS) === true);
dit('descendDeVoitUnEnfantDirect', descendDe('imladrik', 'tao', NOEUDS) === true);
dit('descendDeVoitAdramelechSousImladrik', descendDe('imladrik', 'adramelech', NOEUDS) === true);
dit('descendDeRefuseUnEtranger', descendDe('nicol-bolas', 'imladrik', NOEUDS) === false);
dit('descendDeRefuseSoiMeme', descendDe('imladrik', 'imladrik', NOEUDS) === false);
dit('descendDeRefuseLInconnu', descendDe('imladrik', 'jamais-vu', NOEUDS) === false);
dit('descendDeRefuseLesMacroQuadrantsSupprimes',
  descendDe('omega', 'grima', NOEUDS) === false && descendDe('omega', 'naga', NOEUDS) === false);
// Un registre qui boucle ne doit pas faire tourner la page sans fin : la file
// est bornée, et on l'éprouve au lieu de parier.
dit('descendDeSurvitALaBoucle', descendDe('p', 'jamais-vu', BOUCLE) === false);


console.log(JSON.stringify(verdicts, null, 2));
console.log(`Écrans réels éprouvés : ${ecransReels.length}`);
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT ADAPTATEUR-LV4 VERT' : 'UNIT ADAPTATEUR-LV4 ROUGE');
process.exit(ok ? 0 : 1);
