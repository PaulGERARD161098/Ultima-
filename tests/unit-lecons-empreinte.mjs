// Unitaires du sceau des leçons (Node pur, zéro réseau, zéro navigateur).
//
// Pourquoi ce harnais existe : `memoire/LECONS.md` vit en huit exemplaires et
// son sceau sert à repérer une copie divergente d'un coup d'œil. Un sceau qu'on
// oublie de mettre à jour est PIRE que pas de sceau — il affirme une identité
// fausse, et deux copies réellement différentes affichent alors le même hash.
// Le contrôle porte donc d'abord sur le cas où le sceau MENT, pas sur le cas
// où tout va bien : c'est du côté où le garde-fou se contourne qu'on l'éprouve.
//
// Chaque contrôle est construit sur un cas dont on connaît déjà la réponse.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { etat, sceller, hacher, corpsDe, FICHIER_PAR_DEFAUT } from '../finubar/lecons-empreinte.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const OUTIL = resolve(ICI, '../finubar/lecons-empreinte.mjs');
const verdicts = {};

const bac = mkdtempSync(join(tmpdir(), 'lecons-'));
const fichier = join(bac, 'LECONS.md');
const CORPS = '# Leçons\n\nUne leçon témoin, écrite pour ce test.\n';

/** Lance le CLI ; rend { code, sortie }. Le code est ce qui compte : c'est lui
 *  que `tests/lancer.sh` lit, et donc lui qui fait échouer une fusion. */
function cli(...args) {
  try {
    const sortie = execFileSync(process.execPath, [OUTIL, fichier, ...args],
      { encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, sortie };
  } catch (e) {
    return { code: e.status ?? 1, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

try {
  // ---------- Verrou de non-vacuité : l'outil voit-il seulement le fichier ? ----------
  // Sans ce contrôle, tous les suivants passeraient au vert sur un fichier vide
  // ou introuvable, et le harnais entier ne dirait rien de ce qu'il prétend dire.
  writeFileSync(fichier, CORPS);
  const scelle = sceller(fichier);
  verdicts.nonVacuite = scelle.revision === 1 && /^[0-9a-f]{12}$/.test(scelle.hash);
  verdicts.sceauEcritEnTete = readFileSync(fichier, 'utf8').startsWith('<!-- lecons:empreinte v1 ');

  // ---------- Un fichier scellé et intact : le sceau tient ----------
  verdicts.intactAccorde = etat(fichier).accord === true;
  verdicts.intactCliVert = cli('--verifier').code === 0;

  // ---------- ⛔ LE CAS QUI COMPTE : le corps change, le sceau reste ----------
  const avec = readFileSync(fichier, 'utf8');
  writeFileSync(fichier, `${avec}\nUne leçon ajoutée en douce, sans re-sceller.\n`);
  verdicts.sceauMenteurDetecte = etat(fichier).accord === false;
  const menteur = cli('--verifier');
  verdicts.sceauMenteurFaitEchouer = menteur.code === 1;
  verdicts.sceauMenteurEstNomme = /LE SCEAU MENT/.test(menteur.sortie);

  // ---------- Re-sceller : la révision monte, le sceau redevient vrai ----------
  const rescelle = sceller(fichier);
  verdicts.revisionMonte = rescelle.revision === 2 && rescelle.inchange === false;
  verdicts.rescelleAccorde = etat(fichier).accord === true;

  // ---------- Re-sceller un fichier INCHANGÉ ne fabrique pas de divergence ----------
  // Sans cette garde, chaque passage ferait monter la révision et les huit
  // copies afficheraient des numéros différents pour un contenu identique :
  // le sceau accuserait alors une divergence qui n'existe pas, et on
  // finirait par ne plus le croire du tout.
  const idem = sceller(fichier);
  verdicts.rescellerIdentiqueNeBougePas = idem.inchange === true && idem.revision === 2;

  // ---------- Un fichier SANS sceau le dit, et fait échouer --verifier ----------
  writeFileSync(fichier, CORPS);
  const nu = cli('--verifier');
  verdicts.sansSceauFaitEchouer = nu.code === 1;
  verdicts.sansSceauEstNomme = /n'a PAS de sceau/.test(nu.sortie);

  // ---------- Les fins de ligne Windows ne fabriquent pas un faux écart ----------
  // Un faux écart use la confiance dans le sceau aussi sûrement qu'un écart manqué.
  verdicts.crlfNeComptePas = hacher(CORPS) === hacher(CORPS.replace(/\n/g, '\r\n'));

  // ---------- Le corps haché exclut bien la ligne de sceau ----------
  // Si elle y était, le hash dépendrait de lui-même et ne serait jamais stable.
  verdicts.corpsExclutLeSceau =
    corpsDe(`<!-- lecons:empreinte v9 2026-01-01 sha256:000000000000 -->\n${CORPS}`) === CORPS;

  // ---------- Le fichier RÉEL du dépôt est scellé et d'accord avec lui-même ----------
  // C'est le contrôle qui protège la fusion : une leçon ajoutée sans re-sceller
  // rend `tests/lancer.sh` rouge ici, pas trois semaines plus tard.
  const reel = etat(FICHIER_PAR_DEFAUT);
  verdicts.depotScelle = Boolean(reel.sceau);
  verdicts.depotAccorde = reel.accord === true;
} finally {
  rmSync(bac, { recursive: true, force: true });
}

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LECONS-EMPREINTE OK' : 'UNIT-LECONS-EMPREINTE ECHEC');
process.exit(ok ? 0 : 1);
