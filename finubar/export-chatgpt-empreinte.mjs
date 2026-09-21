#!/usr/bin/env node
// EXPORT CHATGPT — l'empreinte des directives, et ce qu'elle sert à voir.
//
// ⛔ LE PROBLÈME QU'ELLE RÈGLE (POV « le mainteneur de janvier », 2026-09-21).
//    `EXPORT-METHODE-CHATGPT.md` porte deux blocs que Paul COLLE dans ChatGPT.
//    Une fois collés, ils vivent hors du dépôt : plus rien ne les relie aux
//    directives dont ils sont la traduction. Le jour où EB, JL, EL ou DR
//    bougent dans `CLAUDE.md`, le paramétrage de ChatGPT devient faux — et
//    RIEN ne le dit. Paul continue de travailler avec un outil réglé sur une
//    version morte, en croyant l'inverse. C'est le pire des deux états : le
//    silence s'y lit comme une bonne nouvelle.
//
//    D'où une ligne d'empreinte DANS chaque bloc à coller : la date, et le
//    sha256 de la section des quatre directives telle qu'elle était au moment
//    de l'écrire. Paul demande son empreinte à ChatGPT, la compare à celle que
//    `--verifier` calcule, et sait en un coup d'œil si son réglage est périmé.
//
// ⛔ ET POURQUOI LE VERROU DE NON-VACUITÉ EST LA PARTIE QUI COMPTE. Ce contrôle
//    cherche une section par ses titres. Le jour où un titre est reformulé,
//    l'extraction rend une chaîne VIDE — et le sha256 d'une chaîne vide est
//    parfaitement stable. Le contrôle passerait alors au vert en ne mesurant
//    plus rien, indéfiniment. C'est la règle du dépôt : toute recherche
//    d'absence est précédée d'un verrou de non-vacuité. Ici, la section extraite
//    doit être substantielle ET nommer les quatre directives, sinon on sort en
//    erreur — on refuse de rendre un verdict plutôt que d'en rendre un creux.
//
// Usage :
//   node finubar/export-chatgpt-empreinte.mjs             → affiche l'état
//   node finubar/export-chatgpt-empreinte.mjs --verifier  → code 1 si périmé
//   node finubar/export-chatgpt-empreinte.mjs --sceller   → réécrit l'empreinte

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Le hachage est REPRIS du sceau des leçons, pas réécrit : il normalise déjà
// les fins de ligne (un clone Windows ne doit pas paraître divergent) et il est
// déjà éprouvé par `tests/unit-lecons-empreinte.mjs`. Deux fonctions de hachage
// pour le même dépôt, ce serait deux vérités en puissance.
import { hacher } from './lecons-empreinte.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
export const CLAUDE_MD = resolve(ICI, '..', 'CLAUDE.md');
export const EXPORT_MD = resolve(ICI, '..', 'EXPORT-METHODE-CHATGPT.md');

// Les bornes de la section gouvernée. Elles sont volontairement larges : c'est
// le CORPS des directives qui compte, pas la ponctuation des titres.
const DEBUT = /^##\s.*QUATRE DIRECTIVES/m;
const FIN = /^##\s.*Objectif final/m;

// Ce que la section DOIT contenir pour qu'on accepte de la hacher.
const MINIMUM_CARACTERES = 500;
const SIGLES = ['EB', 'JL', 'EL', 'DR'];

// L'empreinte telle qu'elle apparaît DANS les blocs à coller — donc lisible,
// pas un commentaire HTML : Paul doit pouvoir la lire dans ChatGPT et la dire.
const MOTIF_EMPREINTE = /PARAMETRAGE (\d{4}-\d{2}-\d{2}) · directives:([0-9a-f]{12})/g;

/** Rend la section des quatre directives, ou lève si elle n'est pas
 *  reconnaissable. Lever est délibéré : un contrôle qui ne trouve plus ce
 *  qu'il surveille doit se taire en rouge, jamais passer en vert. */
export function sectionDirectives(texteClaudeMd) {
  const debut = texteClaudeMd.match(DEBUT);
  if (!debut) throw new Error('Section des directives INTROUVABLE dans CLAUDE.md (titre changé ?)');
  const apres = texteClaudeMd.slice(debut.index);
  const fin = apres.slice(1).match(FIN);
  const section = fin ? apres.slice(0, fin.index + 1) : apres;

  if (section.length < MINIMUM_CARACTERES) {
    throw new Error(`Section des directives trop courte (${section.length} < ${MINIMUM_CARACTERES}) — extraction vide ou tronquée`);
  }
  const manquants = SIGLES.filter((s) => !new RegExp(`\\b${s}\\b`).test(section));
  if (manquants.length) {
    throw new Error(`Section des directives incomplète — sigles absents : ${manquants.join(', ')}`);
  }
  return section;
}

export function empreinteReelle(cheminClaudeMd = CLAUDE_MD) {
  return hacher(sectionDirectives(readFileSync(cheminClaudeMd, 'utf8')));
}

/** Les empreintes inscrites dans l'export. Plusieurs, une par bloc à coller :
 *  si elles divergent entre elles, le document porte déjà deux vérités. */
export function empreintesInscrites(texteExport) {
  return [...texteExport.matchAll(MOTIF_EMPREINTE)].map((m) => ({ date: m[1], hash: m[2] }));
}

/** Rend { reelle, inscrites, accord, motif }. `accord` faux dès qu'un doute
 *  existe — un verdict incertain vaut rouge, jamais vert. */
export function etat(cheminClaudeMd = CLAUDE_MD, cheminExport = EXPORT_MD) {
  const reelle = empreinteReelle(cheminClaudeMd);
  const inscrites = empreintesInscrites(readFileSync(cheminExport, 'utf8'));

  // Non-vacuité, deuxième verrou : zéro empreinte inscrite ne prouve rien. Sans
  // ce test, un export dont on aurait retiré les lignes passerait au vert.
  if (inscrites.length < 2) {
    return { reelle, inscrites, accord: false, motif: `Le document porte ${inscrites.length} empreinte(s) ; les deux blocs à coller doivent chacun porter la leur` };
  }
  const distinctes = [...new Set(inscrites.map((i) => i.hash))];
  if (distinctes.length > 1) {
    return { reelle, inscrites, accord: false, motif: `Les blocs à coller portent des empreintes DIFFÉRENTES (${distinctes.join(', ')}) — deux vérités dans un même document` };
  }
  if (distinctes[0] !== reelle) {
    return { reelle, inscrites, accord: false, motif: `Les directives de CLAUDE.md ont changé depuis l'écriture de l'export (inscrit ${distinctes[0]}, réel ${reelle}). Le paramétrage de ChatGPT est PÉRIMÉ.` };
  }
  return { reelle, inscrites, accord: true, motif: '' };
}

export function sceller(cheminClaudeMd = CLAUDE_MD, cheminExport = EXPORT_MD, aujourdhui = new Date()) {
  const reelle = empreinteReelle(cheminClaudeMd);
  const date = aujourdhui.toISOString().slice(0, 10);
  const texte = readFileSync(cheminExport, 'utf8');
  const remplacees = texte.replace(MOTIF_EMPREINTE, `PARAMETRAGE ${date} · directives:${reelle}`);
  const combien = empreintesInscrites(texte).length;
  if (!combien) throw new Error('Aucune ligne PARAMETRAGE à sceller dans l\'export — la poser d\'abord dans les deux blocs');
  writeFileSync(cheminExport, remplacees);
  return { hash: reelle, date, combien };
}

// ---- CLI ----
const estCLI = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (estCLI) {
  const mds = process.argv.slice(2).filter((a) => a.endsWith('.md'));
  const [claudeMd = CLAUDE_MD, exportMd = EXPORT_MD] = mds;
  try {
    if (process.argv.includes('--sceller')) {
      const r = sceller(claudeMd, exportMd);
      console.log(`scellé — ${r.combien} empreinte(s) à ${r.date} · directives:${r.hash}`);
    } else {
      const { reelle, inscrites, accord, motif } = etat(claudeMd, exportMd);
      console.log(`directives réelles sha256:${reelle} · inscrites : ${inscrites.map((i) => `${i.date}/${i.hash}`).join(', ') || 'aucune'}`);
      if (!accord) {
        console.error(`⚠️ ${motif}`);
        if (process.argv.includes('--verifier')) process.exit(1);
      } else {
        console.log('✅ le paramétrage ChatGPT correspond aux directives en vigueur');
      }
    }
  } catch (e) {
    // Une extraction impossible est un ÉCHEC, pas un silence. C'est ce qui
    // empêche ce contrôle de devenir vert en cessant de mesurer.
    console.error(`⚠️ ${e.message}`);
    process.exit(1);
  }
}
