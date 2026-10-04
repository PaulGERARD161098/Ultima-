// ZOH SHIA — ce qui empêche la techno de RénoDevis de mentir (2026-10-04).
//
// Les réponses au pre-mortem de la boucle 2, une par verdict :
//   · LA FICHE SE PÉRIME → chaque élément MESURÉ de `inventaire.json` (variable,
//     tâche planifiée, route, table hors dépôt, fichier codé pour SOLA) doit
//     figurer dans la fiche. Une recollecte qui découvre une variable nouvelle
//     fait rougir ce test tant que la fiche ne la nomme pas.
//   · ELLE SERT DE CARTE À UN ATTAQUANT → aucune forme de secret, aucun
//     identifiant (UUID), aucune adresse e-mail dans tout `zohshia/` ; le
//     dossier n'est ni déployé (`.vercelignore`) ni servi (préfixe privé).
//   · ELLE DÉCRIT SOLA, PAS UN ARTISAN QUELCONQUE → la liste du code écrit pour
//     SOLA est exigée dans la fiche, fichier par fichier.
//   · LE MANUEL SE CACHE → chaque étape porte son mode (Auto / Manuel).
//   · LE VERT PAR VACUITÉ → verrous de non-vacuité AVANT toute recherche
//     d'absence (un inventaire vide couvrirait tout, un dossier vide serait
//     sans secret).
//
// ⚠️ PÉRIMÈTRE, nommément : ce test lit l'inventaire tel qu'il a été collecté.
// Il ne relit PAS RénoDevis (la CI d'Ultima n'y a pas accès) : la fraîcheur se
// mesure en relançant `zohshia/renodevis/collecter.mjs`, qui dit la dérive.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { estCheminPrive } from '../middleware.js';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER = join(RACINE, 'zohshia');
const lire = (...p) => readFileSync(join(RACINE, ...p), 'utf8');

const verdicts = {};
const chiffres = {};
const dit = (nom, ok) => { verdicts[nom] = ok === true; };

// ---- L'inventaire, et ses verrous de non-vacuité ---------------------------
let inv = null;
try { inv = JSON.parse(lire('zohshia', 'renodevis', 'inventaire.json')); } catch { inv = null; }
dit('inventaireLisible', !!inv);
inv = inv || { source: {}, variables: [], crons: [], routes: [], migrations: [], tables: { hors_depot: [] }, code_pour_sola: [] };
dit('inventaireDitSaSource', /^[0-9a-f]{40}$/.test(inv.source.commit || '')
  && inv.source.depot === 'PaulGERARD161098/RenoDevis' && !Number.isNaN(Date.parse(inv.source.date_commit || '')));
// Des planchers MESURÉS le 04/10 (39 · 4 · 19 · 41 · 8 · 39), pris un peu en
// dessous : ils attrapent une collecte vide ou tronquée, pas une évolution.
dit('verrouVariables', inv.variables.length >= 30);
dit('verrouCrons', inv.crons.length >= 4);
dit('verrouRoutes', inv.routes.length >= 10);
dit('verrouMigrations', inv.migrations.length >= 30);
dit('verrouCodeSola', inv.code_pour_sola.length >= 10);
// Le cas qui a été payé : une variable lue par `listeEnv(` sur deux lignes
// échappait à la collecte. On l'exige NOMMÉMENT.
dit('collecteVoitLesLecturesMultilignes', inv.variables.some((v) => v.nom === 'SYNC_EMAIL_INTERNES'));
chiffres.mesure = {
  commit: (inv.source.commit || '').slice(0, 7), variables: inv.variables.length, crons: inv.crons.length,
  routes: inv.routes.length, migrations: inv.migrations.length,
  horsDepot: inv.tables.hors_depot.length, codeSola: inv.code_pour_sola.length,
};

// ---- La couverture : la fiche nomme tout ce qui est mesuré -----------------
const fiche = lire('zohshia', 'renodevis', 'AJOUTER-UN-ARTISAN.md');
const techno = lire('zohshia', 'renodevis', 'TECHNO.md');
const manquants = {
  variables: inv.variables.map((v) => v.nom).filter((n) => !fiche.includes('`' + n + '`')),
  crons: inv.crons.map((c) => c.chemin).filter((c) => !fiche.includes('`' + c + '`')),
  routes: inv.routes.filter((r) => !techno.includes('`' + r + '`')),
  tablesHorsDepot: inv.tables.hors_depot.filter((t) => !techno.includes('`' + t + '`')),
  codeSola: inv.code_pour_sola.map((c) => c.fichier).filter((f) => !fiche.includes('`' + f + '`')),
};
Object.entries(manquants).forEach(([k, v]) => dit('ficheCouvre_' + k, v.length === 0));
const tousManquants = Object.fromEntries(Object.entries(manquants).filter(([, v]) => v.length));
if (Object.keys(tousManquants).length) { chiffres.manquants = tousManquants; }

// ---- Chaque étape dit qui agit et comment ----------------------------------
const lignesEtapes = fiche.split('\n').filter((l) => /^\| \d+ \|/.test(l));
dit('verrouEtapes', lignesEtapes.length >= 10);
dit('chaqueEtapeDitSonMode', lignesEtapes.length >= 10
  && lignesEtapes.every((l) => /\b(Auto|Manuel)\b/.test(l)));
// Texte à plat : une phrase coupée en fin de ligne (« effet métier\n> réel »)
// se lit comme une phrase entière.
const ficheAPlat = fiche.replace(/[>*]/g, ' ').replace(/\s+/g, ' ');
dit('lesGatesSontDits', /effet métier réel/.test(ficheAPlat) && /mandat/.test(ficheAPlat)
  && /n'autorise rien/.test(ficheAPlat));

// ---- Aucune carte d'attaque : ni secret, ni identifiant, ni adresse --------
function fichiers(d) {
  return readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? fichiers(p) : [p];
  });
}
const cibles = [...fichiers(DOSSIER), join(RACINE, '.claude', 'skills', 'zohshia', 'SKILL.md')];
const contenus = cibles.map((p) => ({ p: p.replace(RACINE + '/', ''), t: readFileSync(p, 'utf8') }));
dit('verrouFichiersScrutes', contenus.length >= 5 && contenus.every((c) => c.t.length > 200));
const FORMES_SECRET = [
  /\bsk_(live|test)_[A-Za-z0-9]{8,}/, /\brk_(live|test)_[A-Za-z0-9]{8,}/, /\bwhsec_[A-Za-z0-9]{8,}/,
  /\bre_[A-Za-z0-9]{16,}/, /\beyJ[A-Za-z0-9_-]{20,}\./, /\bghp_[A-Za-z0-9]{20,}/, /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-ant-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bxox[abp]-[A-Za-z0-9-]{10,}/,
  /^[A-Z][A-Z0-9_]{2,}=\S+/m, // une ligne au format .env : NOM=valeur
];
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const fuites = contenus.flatMap((c) => [
  ...FORMES_SECRET.filter((re) => re.test(c.t)).map((re) => `${c.p} : forme de secret ${re}`),
  ...(UUID.test(c.t) ? [`${c.p} : identifiant (UUID)`] : []),
  ...(EMAIL.test(c.t) ? [`${c.p} : adresse e-mail`] : []),
]);
dit('aucunSecretAucunIdentifiantAucuneAdresse', fuites.length === 0);
if (fuites.length) { chiffres.fuites = fuites; }

// ---- Ni déployé, ni servi ---------------------------------------------------
dit('nonDeploye', /^zohshia\/$/m.test(lire('.vercelignore')));
dit('nonServi', ['/zohshia', '/zohshia/renodevis/inventaire.json', '/zohshia/renodevis/AJOUTER-UN-ARTISAN.md']
  .every((p) => estCheminPrive(p) === true));

// ---- L'étoile dit où vit la techno -----------------------------------------
const { NOEUDS } = await import('../js/registre-lv3.mjs');
dit('etoileZohShiaPointeLaTechno', /RénoDevis/.test(NOEUDS.zohshia?.resume || '')
  && /\/zohshia/.test(NOEUDS.zohshia?.resume || ''));

const echecs = Object.entries(verdicts).filter(([, ok]) => !ok).map(([k]) => k);
console.log(JSON.stringify(verdicts, null, 2));
console.log('Mesures :', JSON.stringify(chiffres, null, 2));
if (echecs.length) {
  console.log(`\n=== ${echecs.length} VERDICT(S) EN ÉCHEC ===\n  ` + echecs.join('\n  '));
  process.exit(1);
}
console.log('\n=== UNIT-ZOHSHIA OK ===');
