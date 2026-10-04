// ZOH SHIA · RénoDevis — LE MOTEUR DE NEUTRALISATION (04/10/2026).
//
// Il transforme un fichier du dépôt de référence en sa version NEUTRE : la
// techno sans aucun nom d'artisan, de client, de fournisseur, de marque, ni
// identifiant de l'instance de référence (Paul : « la technologie en pur »).
//
// Ce module ne porte AUCUN nom propre. Ce qu'il faut retirer vit HORS de
// zohshia/, dans deux fichiers privés : `outils/zohshia/noms-propres.json` (les
// jetons interdits) et `outils/zohshia/renodevis/recette.json` (comment les
// retirer). Le moteur ne fait qu'appliquer — et refuser.
//
// Les réponses au pre-mortem, une par mode d'échec :
//   · UNE RETOUCHE PÉRIME (le dépôt a changé sous elle) → un remplacement de
//     fichier est épinglé par l'empreinte sha256 de l'original ; une retouche de
//     texte doit trouver son « avant » EXACTEMENT une fois. Sinon : refus, avec
//     le fichier et la raison. Jamais d'application approximative.
//   · UN NOM PROPRE SURVIT → après transformation, le texte est relu ; un seul
//     jeton (sans casse, en mot entier) ou identifiant d'instance = refus.
//   · UN COMMENTAIRE ANECDOTIQUE BLOQUE TOUT → une ligne de COMMENTAIRE pure qui
//     porte un nom propre est retirée, et comptée. Le code, lui, ne se retire
//     jamais en silence : il exige une retouche nommée.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const echapper = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function chargerRecette(racine = RACINE) {
  const { jetons } = JSON.parse(readFileSync(join(racine, 'outils', 'zohshia', 'noms-propres.json'), 'utf8'));
  const recette = JSON.parse(readFileSync(join(racine, 'outils', 'zohshia', 'renodevis', 'recette.json'), 'utf8'));
  const interdits = [...jetons, ...(recette.identifiants_instance || [])];
  if (!interdits.length) throw new Error('recette vide : aucun jeton interdit — refus (vert par vacuité)');
  // En mot entier, sans casse : « isolation » ne déclenche pas.
  const entier = new RegExp(`(^|[^a-z0-9à-ÿ])(${interdits.map(echapper).join('|')})([^a-z0-9à-ÿ]|$)`, 'i');
  // ET en bosse de chameau : `reglesXyz` cache le jeton derrière une minuscule,
  // que le mot entier ne voit pas. Forme Capitalisée, non suivie d'une minuscule.
  const bosses = interdits.filter((j) => /^[a-z]+$/i.test(j)).map((j) => j[0].toUpperCase() + j.slice(1).toLowerCase());
  const chameau = new RegExp(`()(${bosses.map(echapper).join('|')})(?![a-zà-ÿ])`);
  const motif = { test: (l) => entier.test(l) || chameau.test(l), match: (l) => l.match(entier) || l.match(chameau) };
  return { ...recette, interdits, motif, racine };
}

/** Le texte porte-t-il un nom propre ? Rend le premier trouvé, ou null. */
export function nomPropreDans(texte, recette) {
  for (const ligne of texte.split('\n')) {
    const m = recette.motif.match(ligne);
    if (m) return m[2];
  }
  return null;
}

// Une ligne de commentaire PURE, selon le langage du fichier.
function estCommentaire(ligne, chemin) {
  const l = ligne.trim();
  if (extname(chemin) === '.sql') return l.startsWith('--');
  return l.startsWith('//') || l.startsWith('/*') || l.startsWith('*') || l.startsWith('{/*');
}

export const sha256 = (texte) => createHash('sha256').update(texte).digest('hex');

/**
 * Rend la version neutre d'un fichier, ou lève une erreur qui dit pourquoi.
 * `journal` compte ce qui a été fait, pour le rapport.
 */
export function neutraliserFichier(chemin, texte, recette) {
  const journal = { chemin, remplace: false, retouches: 0, renommages: 0, commentairesRetires: 0 };
  let t = texte;

  const remplacement = recette.remplacer?.[chemin];
  if (remplacement) {
    const vu = sha256(texte);
    if (vu !== remplacement.sha256) {
      throw new Error(`${chemin} : l'original a changé (sha256 ${vu.slice(0, 12)}… ≠ ${remplacement.sha256.slice(0, 12)}…) — relire le fichier, refaire sa version neutre, puis mettre à jour l'empreinte`);
    }
    t = readFileSync(join(recette.racine, remplacement.par), 'utf8');
    journal.remplace = true;
  }

  for (const r of (recette.retouches || []).filter((x) => x.fichier === chemin)) {
    const n = t.split(r.avant).length - 1;
    if (n !== 1) throw new Error(`${chemin} : la retouche « ${r.pourquoi} » trouve son texte ${n} fois au lieu d'une — elle a périmé`);
    t = t.replace(r.avant, r.apres);
    journal.retouches += 1;
  }

  for (const [avant, apres] of recette.renommer || []) {
    const n = t.split(avant).length - 1;
    if (n) { t = t.split(avant).join(apres); journal.renommages += n; }
  }

  const lignes = t.split('\n');
  const gardees = lignes.filter((l) => !(recette.motif.test(l) && estCommentaire(l, chemin)));
  journal.commentairesRetires = lignes.length - gardees.length;
  t = gardees.join('\n');

  const reste = nomPropreDans(t, recette);
  if (reste) {
    const ligne = t.split('\n').findIndex((l) => recette.motif.test(l)) + 1;
    throw new Error(`${chemin}:${ligne} : un nom propre survit (« ${reste} ») hors commentaire — il faut une retouche nommée dans la recette`);
  }
  return { texte: t, journal };
}

/** Lit un fichier du dépôt de référence à une révision donnée (jamais l'arbre de travail). */
export function lireAuCommit(depot, ref, chemin) {
  return execFileSync('git', ['-C', depot, 'show', `${ref}:${chemin}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

export function listerAuCommit(depot, ref, dossier) {
  return execFileSync('git', ['-C', depot, 'ls-tree', '-r', '--name-only', ref, '--', dossier], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
}

export function commitDe(depot, ref) {
  return execFileSync('git', ['-C', depot, 'rev-parse', '--short', ref], { encoding: 'utf8' }).trim();
}
