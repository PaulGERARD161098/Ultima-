#!/usr/bin/env node
// LEÇONS — l'empreinte, et ce qu'elle sert à voir.
//
// ⛔ LE PROBLÈME QU'ELLE RÈGLE (posé le 2026-09-11, à la demande de Paul :
//    « le fichier leçon il faut pouvoir le mettre à jour tout le temps sur tous
//    les repos »). `memoire/LECONS.md` vit en huit exemplaires, un par dépôt,
//    parce qu'une séance ouverte sur RenoAgenda n'a pas Ultima sous la main.
//    Huit copies d'un fichier qui bouge souvent, c'est huit vérités qui
//    divergent — et la divergence ne se VOIT pas : deux fichiers de 300 lignes
//    qui diffèrent d'un paragraphe se lisent pareil.
//
//    D'où une ligne d'empreinte en tête du fichier : une révision, une date, et
//    le sha256 du corps. Deux dépôts se comparent alors d'un coup d'œil, sans
//    rien télécharger, sans réseau — ce qui compte, l'egress des bacs à sable
//    étant refusé par la politique réseau.
//
// ⛔ ET POURQUOI UN TEST L'ACCOMPAGNE. Une empreinte qu'on oublie de mettre à
//    jour est PIRE que pas d'empreinte : elle affirme une identité fausse, et
//    deux copies réellement différentes affichent alors le même sceau. Le
//    contrôle `--verifier` recalcule et échoue sur l'écart ; il tourne dans
//    `tests/lancer.sh`. C'est la règle « un garde-fou qui cesse de fonctionner
//    doit le DIRE », appliquée au sceau lui-même.
//
// Usage :
//   node finubar/lecons-empreinte.mjs             → affiche l'état
//   node finubar/lecons-empreinte.mjs --verifier  → code 1 si le sceau ment
//   node finubar/lecons-empreinte.mjs --sceller   → réécrit le sceau (révision +1)

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
export const FICHIER_PAR_DEFAUT = resolve(ICI, '..', 'memoire', 'LECONS.md');

// Le sceau est un commentaire HTML : invisible à la lecture rendue, présent
// dans la source, et sur UNE ligne pour qu'un diff le montre seul.
const MOTIF = /^<!-- lecons:empreinte v(\d+) (\d{4}-\d{2}-\d{2}) sha256:([0-9a-f]{12}) -->$/m;

/** Le corps = le fichier PRIVÉ de sa ligne de sceau. C'est lui qu'on hache :
 *  sinon le hash dépendrait de lui-même et ne pourrait jamais être stable. */
export function corpsDe(texte) {
  return texte.replace(MOTIF, '').replace(/^\n+/, '');
}

export function hacher(corps) {
  // Fins de ligne normalisées : un clone Windows ne doit pas paraître divergent
  // alors que le contenu est identique. Un faux écart use la confiance dans le
  // sceau aussi sûrement qu'un écart manqué.
  return createHash('sha256').update(corps.replace(/\r\n/g, '\n'), 'utf8').digest('hex').slice(0, 12);
}

export function lireSceau(texte) {
  const m = texte.match(MOTIF);
  return m ? { revision: Number(m[1]), date: m[2], hash: m[3] } : null;
}

/** Rend { sceau, reel, accord } — `accord` faux si le sceau ment ou manque. */
export function etat(chemin = FICHIER_PAR_DEFAUT) {
  const texte = readFileSync(chemin, 'utf8');
  const sceau = lireSceau(texte);
  const reel = hacher(corpsDe(texte));
  return { sceau, reel, accord: Boolean(sceau) && sceau.hash === reel };
}

export function sceller(chemin = FICHIER_PAR_DEFAUT, aujourdhui = new Date()) {
  const texte = readFileSync(chemin, 'utf8');
  const ancien = lireSceau(texte);
  const corps = corpsDe(texte);
  const hash = hacher(corps);
  // Révision inchangée si le corps n'a pas bougé : re-sceller un fichier
  // identique ne doit pas fabriquer une fausse divergence avec les sept copies.
  if (ancien && ancien.hash === hash) return { ...ancien, inchange: true };
  const revision = (ancien?.revision ?? 0) + 1;
  const date = aujourdhui.toISOString().slice(0, 10);
  writeFileSync(chemin, `<!-- lecons:empreinte v${revision} ${date} sha256:${hash} -->\n${corps}`);
  return { revision, date, hash, inchange: false };
}

// ---- CLI ----
const estCLI = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (estCLI) {
  const chemin = process.argv.find((a) => a.endsWith('.md')) ?? FICHIER_PAR_DEFAUT;
  if (process.argv.includes('--sceller')) {
    const r = sceller(chemin);
    console.log(r.inchange
      ? `inchangé — v${r.revision} ${r.date} sha256:${r.hash}`
      : `scellé — v${r.revision} ${r.date} sha256:${r.hash}`);
  } else {
    const { sceau, reel, accord } = etat(chemin);
    if (!sceau) {
      console.error(`⚠️ ${chemin} n'a PAS de sceau. Le poser : --sceller`);
      process.exit(process.argv.includes('--verifier') ? 1 : 0);
    }
    console.log(`sceau v${sceau.revision} ${sceau.date} sha256:${sceau.hash} · contenu réel sha256:${reel}`);
    if (!accord) {
      console.error('⚠️ LE SCEAU MENT : le fichier a changé sans être re-scellé. Lancer --sceller.');
      if (process.argv.includes('--verifier')) process.exit(1);
    }
  }
}
