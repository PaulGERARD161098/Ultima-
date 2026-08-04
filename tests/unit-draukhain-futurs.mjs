// Unitaires du RETOUR DE LA PASSERELLE (Node pur, zéro réseau, 2026-08-04).
// `joindreFuturs` recoud trois lectures déjà bornées par RLS pour dire à un
// serment DRAUKHAIN quels futurs VRANESH le MENACENT ou le SERVENT.
// Ce qui est éprouvé ici est surtout ce qui ne doit PAS casser :
//   ① une lecture en erreur (migration non appliquée, table absente) vaut
//      liste vide — DRAUKHAIN reste servi comme avant ;
//   ② un lien dont le scénario a disparu est IGNORÉ, jamais rendu à moitié
//      (les scénarios se font réellement supprimer par un dénouement) ;
//   ③ `advenu` ne vaut vrai que pour LE scénario désigné par sa situation ;
//   ④ aucun champ inattendu ne fuit vers le client (§5 : on n'envoie que ce
//      qui sera montré).
import { joindreFuturs } from '../api/serments.js';

const verdicts = {};
const lecture = (data) => ({ data, error: null });
const enErreur = { data: null, error: { code: '42P01' } };

const SCENARIOS = lecture([
  { id: 'sc1', situation_id: 'si1', deroule: 'le futur qui a poussé' },
  { id: 'sc2', situation_id: 'si1', deroule: 'un futur resté hypothétique' },
  { id: 'sc3', situation_id: 'si2', deroule: 'un futur d’un autre thème' },
]);
const SITUATIONS = lecture([
  { id: 'si1', intitule: 'THÈME A — son sous-titre', scenario_advenu_id: 'sc1' },
  { id: 'si2', intitule: 'THÈME B', scenario_advenu_id: null },
]);

// ---------- 1. Le cas nominal : trois liens, trois lignes ----------
{
  const liens = lecture([
    { id: 'l1', serment_id: 'se1', scenario_id: 'sc1', rapport: 'sert' },
    { id: 'l2', serment_id: 'se1', scenario_id: 'sc2', rapport: 'menace' },
    { id: 'l3', serment_id: 'se2', scenario_id: 'sc3', rapport: null },
  ]);
  const out = joindreFuturs(liens, SCENARIOS, SITUATIONS);
  verdicts.nominalCompte = out.length === 3;
  verdicts.nominalRattachement =
    out[0].serment_id === 'se1' && out[0].deroule === 'le futur qui a poussé';
  verdicts.nominalRapport = out[0].rapport === 'sert' && out[1].rapport === 'menace';
  verdicts.nominalTheme = out[0].theme === 'THÈME A — son sous-titre';
  verdicts.nominalRapportNull = out[2].rapport === null;
}

// ---------- 2. `advenu` : seulement le scénario désigné par SA situation ----------
{
  const liens = lecture([
    { id: 'l1', serment_id: 'se1', scenario_id: 'sc1', rapport: 'sert' },
    { id: 'l2', serment_id: 'se1', scenario_id: 'sc2', rapport: 'menace' },
    { id: 'l3', serment_id: 'se2', scenario_id: 'sc3', rapport: 'sert' },
  ]);
  const out = joindreFuturs(liens, SCENARIOS, SITUATIONS);
  verdicts.advenuVrai = out[0].advenu === true;                 // sc1 EST l'advenu de si1
  verdicts.advenuFauxMemeTheme = out[1].advenu === false;       // sc2 est du même thème, mais non retenu
  verdicts.advenuFauxThemeOuvert = out[2].advenu === false;     // si2 n'a rien tranché
}

// ---------- 3. Dégradation : une lecture en erreur ne casse rien ----------
{
  verdicts.liensEnErreur =
    joindreFuturs(enErreur, SCENARIOS, SITUATIONS).length === 0;
  const liens = lecture([{ id: 'l1', serment_id: 'se1', scenario_id: 'sc1', rapport: 'sert' }]);
  // Scénarios illisibles : le lien n'a plus de cible résoluble → rien à montrer,
  // et surtout PAS une ligne vide qui laisserait croire à un futur sans texte.
  verdicts.scenariosEnErreur = joindreFuturs(liens, enErreur, SITUATIONS).length === 0;
  // Situations illisibles : la ligne subsiste (le futur existe), sans thème ni
  // sceau — dégradation propre, jamais d'exception.
  const sansSituations = joindreFuturs(liens, SCENARIOS, enErreur);
  verdicts.situationsEnErreur =
    sansSituations.length === 1 && sansSituations[0].theme === '' &&
    sansSituations[0].advenu === false;
  verdicts.absents = joindreFuturs(undefined, undefined, undefined).length === 0;
}

// ---------- 4. Un lien orphelin est ignoré, pas rendu à moitié ----------
// Cas RÉEL : un dénouement supprime les branches non retenues ; un lien qui
// pointait vers l'une d'elles perd sa cible.
{
  const liens = lecture([
    { id: 'l1', serment_id: 'se1', scenario_id: 'sc-supprime', rapport: 'menace' },
    { id: 'l2', serment_id: 'se1', scenario_id: 'sc1', rapport: 'sert' },
  ]);
  const out = joindreFuturs(liens, SCENARIOS, SITUATIONS);
  verdicts.orphelinIgnore = out.length === 1 && out[0].scenario_id === 'sc1';
}

// ---------- 5. Liens mal formés : ni serment, ni scénario ----------
{
  const liens = lecture([
    { id: 'l1', serment_id: null, scenario_id: 'sc1', rapport: 'sert' },
    { id: 'l2', serment_id: 'se1', scenario_id: null, rapport: 'sert' },
    null,
  ]);
  verdicts.malFormesEcartes = joindreFuturs(liens, SCENARIOS, SITUATIONS).length === 0;
}

// ---------- 6. §5 — rien de plus que ce qui sera montré ----------
{
  const liens = lecture([
    { id: 'l1', serment_id: 'se1', scenario_id: 'sc1', rapport: 'sert',
      owner_id: 'o1', entree_id: null, created_at: '2026-08-01T10:40:00Z' },
  ]);
  const [ligne] = joindreFuturs(liens, SCENARIOS, SITUATIONS);
  const attendus = ['id', 'serment_id', 'scenario_id', 'situation_id',
    'rapport', 'deroule', 'theme', 'advenu'];
  verdicts.champsExacts =
    Object.keys(ligne).sort().join(',') === attendus.slice().sort().join(',');
  verdicts.pasDOwnerId = !('owner_id' in ligne);
}

let echecs = 0;
Object.entries(verdicts).forEach(([nom, ok]) => {
  if (ok) { console.log(`  ✅ ${nom}`); } else { console.log(`  ❌ ${nom}`); echecs += 1; }
});
console.log(echecs === 0 ? '=== DRAUKHAIN FUTURS VERT ===' : `=== ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
