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
import { versCiel, cheminVers } from '../design/adaptateur-lv4.mjs';
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

console.log(JSON.stringify(verdicts, null, 2));
console.log(`Écrans réels éprouvés : ${ecransReels.length}`);
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT ADAPTATEUR-LV4 VERT' : 'UNIT ADAPTATEUR-LV4 ROUGE');
process.exit(ok ? 0 : 1);
