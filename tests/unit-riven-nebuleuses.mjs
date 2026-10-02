// Unitaires de la table des nébuleuses (js/nebuleuses-riven.js) — critère C1 et
// C9 de CADRAGE-RIVEN-NEBULEUSES.md. Node pur, zéro réseau.
//
// ⛔ Les 40 secteurs ci-dessous sont ceux saisis en base le 2026-09-30 (relevé
// en lecture seule, `select distinct secteur_activite`), avec leur DÉBUT RÉEL —
// c'est lui, et lui seul, que la table lit — et une SUITE NEUTRALISÉE
// (« secteur A »). Plusieurs suites réelles désignaient presque une entreprise :
// le réseau de Paul est une donnée à protéger, même dans un dépôt privé
// (relecture du 30/09). Si la base gagne un début que la table ne reconnaît
// pas, il tombera dans « À classer » — visible et compté — et c'est ce test
// qu'on enrichit.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('../js/nebuleuses-riven.js', import.meta.url), 'utf8');
const bac = { window: {} };
vm.runInNewContext(code, bac);
const T = bac.window.UltimaNebuleusesRiven;

const ATTENDU = {
  conseil: ['Conseil', 'Conseil - secteur A', 'Conseil - secteur B',
    'Audit - conseil', 'Recouvrement de créances - secteur A',
    'Recrutement - secteur A', 'Services - finances - secteur A'],
  finance: ['Banque - secteur A', 'Banque privée', 'Finance - secteur A'],
  medias: ['Médias', 'Médias - presse', 'Médias - secteur B', 'Édition'],
  industrie: ['Aéronautique', 'Aéronautique - secteur A', 'Holding industrielle - secteur A',
    'Ingénierie - secteur A', 'Logiciel - secteur A',
    'Technologie - secteur A'],
  btp: ['BTP - secteur A', "BTP - tout corps d'état", 'BTP - secteur B',
    'Tuyautiste', 'Isolation - secteur A', 'Isolation - secteur B', 'CVC - Relationnel',
    'Ventilation - secteur A', 'Rénovation - IA'],
  energie: ['Énergie', 'Énergie - secteur A', 'Énergie - secteur B', 'Environnement - secteur A'],
  institutions: ['Politique - secteur A', 'Études - secteur A',
    'Associatif - secteur A', 'Médico-social - secteur A'],
  commerce: ['Retail', 'Luxe - secteur A', 'Art - secteur A']
};

const verdicts = {};
const tous = Object.values(ATTENDU).flat();
verdicts.quaranteSecteurs = tous.length === 40 && new Set(tous).size === 40;

// C1 — chaque secteur réel tombe dans sa nébuleuse, aucun dans « À classer ».
const ecarts = [];
for (const [cle, secteurs] of Object.entries(ATTENDU)) {
  for (const s of secteurs) { if (T.cleDe(s) !== cle) { ecarts.push(`${s} → ${T.cleDe(s)} (attendu ${cle})`); } }
}
verdicts.chaqueSecteurDansSaNebuleuse = ecarts.length === 0;
if (ecarts.length) { console.error(ecarts.join('\n')); }

// Le vide et l'inconnu ne se perdent pas : ils vont dans « À classer ».
verdicts.videAClasser = ['', '   ', null, undefined, 42].every((s) => T.cleDe(s) === 'aclasser');
verdicts.inconnuAClasser = T.cleDe('Astrologie') === 'aclasser';

// Sans casse ni espaces de bord.
verdicts.casseEtEspaces = T.cleDe('  conseil - DIRECTION ') === 'conseil' && T.cleDe('RETAIL') === 'commerce';

// « Art » exige son espace : « Artisanat » n'est pas un art, « Art - peinture » en est un.
verdicts.artExigeSonEspace = T.cleDe('Artisanat') === 'aclasser' && T.cleDe('Art - secteur A') === 'commerce';

// Les corps d'état des artisans (données de démonstration comprises) vont dans le BTP.
verdicts.corpsDEtatDansLeBTP = ['Menuiserie', 'Plomberie', 'Électricité', 'Toiture', 'Chauffage', 'Maçonnerie']
  .every((s) => T.cleDe(s) === 'btp');
verdicts.courtageDansLeConseil = T.cleDe('Courtage') === 'conseil';
// La défense (l'armée) va dans les institutions (Paul, 02/10) ; l'industrie
// d'armement, qui commence par son métier, reste dans l'industrie.
verdicts.defenseDansLesInstitutions = T.cleDe('Défense - armée') === 'institutions' &&
  T.cleDe('defense') === 'institutions' && T.cleDe('Aéronautique - défense') === 'industrie';

// La table : neuf nébuleuses, clés uniques, teintes acceptées par la couche de fond.
const RGB_VALIDE = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
verdicts.neufNebuleuses = T.NEBULEUSES.length === 9 && new Set(T.NEBULEUSES.map((n) => n.cle)).size === 9;
verdicts.teintesAcceptees = T.NEBULEUSES.every((n) => RGB_VALIDE.test(T.teinte(n)));
verdicts.nomsCourtsBornes = T.NEBULEUSES.every((n) => n.court.length <= 18);

// repartir : ordre de la table, nébuleuses vides écartées, domaines distincts.
const noeuds = [
  { id: 'a', secteur_activite: 'Plomberie' }, { id: 'b', secteur_activite: 'Conseil' },
  { id: 'c', secteur_activite: 'Plomberie' }, { id: 'd' }, { id: 'e', secteur_activite: 'Toiture' }
];
const r = T.repartir(noeuds);
verdicts.repartirOrdreEtVides = r.map((g) => g.nebuleuse.cle).join(',') === 'conseil,btp,aclasser';
verdicts.repartirDomaines = r[1].domaines.join('|') === 'Plomberie|Toiture' && r[1].noeuds.length === 3;
verdicts.repartirRienNePerdu = r.reduce((s, g) => s + g.noeuds.length, 0) === noeuds.length;

// C9 — une seule vérité : nebuleuseDe et repartir disent la même chose, étoile par étoile.
verdicts.memeVeriteDansLesDeuxSens = r.every((g) => g.noeuds.every((n) => T.nebuleuseDe(n.secteur_activite).cle === g.nebuleuse.cle));

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-RIVEN-NEBULEUSES OK' : 'UNIT-RIVEN-NEBULEUSES ECHEC');
process.exit(ok ? 0 : 1);
