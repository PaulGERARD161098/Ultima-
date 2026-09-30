#!/usr/bin/env node
// LEÇONS — injection d'ouverture de séance (hook SessionStart).
//
// ⛔ CE FICHIER EST COPIÉ À L'IDENTIQUE dans le `.claude/` des 10 dépôts, avec
//    `memoire/LECONS.md` à côté. SA SOURCE UNIQUE EST
//    `Ultima-/finubar/lecons-rappel.mjs`. Toute évolution se fait ICI, puis se
//    re-copie ; on ne corrige jamais une copie sur place, sinon les dix
//    divergent et plus personne ne sait laquelle fait foi. Même motif, même
//    raison que `rappel.mjs` : le script ne dépend de RIEN — ni paquet npm, ni
//    module du dépôt — donc un dépôt sans dépendances installées lit quand même
//    ses leçons.
//
// POURQUOI LE FICHIER ENTIER, ET PAS UN RÉSUMÉ. Une leçon résumée redevient un
// conseil : ce qui la rend opérante, c'est l'incident qui l'a payée. Le coût en
// contexte est assumé — il vaut une erreur évitée par séance.
//
// ⛔ ET POURQUOI IL DIT QUAND IL TRONQUE. Au-delà de MAX_OCTETS le fichier est
// coupé, et la coupure est ANNONCÉE dans la sortie. Un rappel amputé en silence
// se lirait comme un rappel complet : le lecteur croirait avoir tout vu. C'est
// la leçon « un garde-fou qui cesse de fonctionner doit le DIRE », appliquée au
// garde-fou lui-même.
//
// Il ne doit JAMAIS faire échouer l'ouverture d'une séance : il sort toujours
// avec le code 0, quoi qu'il arrive.
//
// ⛔ MAIS « NE PAS FAIRE ÉCHOUER » N'EST PAS « SE TAIRE » — corrigé le 30/09.
// Jusqu'à cette date, un `memoire/LECONS.md` ABSENT faisait sortir le script
// sans un mot : zéro octet, code 0. La séance s'ouvrait donc SANS aucune leçon,
// et rien ne le disait — exactement l'état que ce fichier dénonce trois
// paragraphes plus haut à propos de la troncature et du sceau manquant.
// Mesuré ce jour-là sur une racine vide : 0 octet émis.
// ⚠️ L'annonce ne coûte RIEN au garde-fou d'origine : elle passe par le même
// `additionalContext` et le même code 0. Ce qui devait être évité, c'est un
// code de sortie non nul, jamais une phrase.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 60 Ko : large devant la taille actuelle (~11 Ko), assez bas pour qu'un
// fichier parti en vrille ne noie pas l'ouverture. Si la borne se met à mordre,
// c'est que le fichier a besoin d'être élagué — pas la borne relevée.
const MAX_OCTETS = 60_000;

// ⛔ LE MOTIF DU SCEAU EST RECOPIÉ ICI, et c'est délibéré. Sa source est
// `finubar/lecons-empreinte.mjs`, mais ce script-ci est copié dans le `.claude/`
// de dix dépôts et ne doit dépendre de RIEN — un dépôt sans ses dépendances
// installées doit quand même lire ses leçons. Un import vers `finubar/`, qui
// n'existe que dans Ultima, casserait les neuf autres.
// Si le format du sceau change, il change aux DEUX endroits : c'est le prix
// assumé de l'indépendance, et il est nommé plutôt que tu.
const MOTIF_SCEAU = /^<!-- lecons:empreinte (v\d+ \d{4}-\d{2}-\d{2} sha256:[0-9a-f]{12}) -->$/m;

try {
  const ICI = dirname(fileURLToPath(import.meta.url));
  // Deux emplacements, parce que ce script vit à deux endroits : dans Ultima il
  // est sous `finubar/`, dans les copies il est sous `.claude/`. Dans les deux
  // cas `memoire/LECONS.md` est à la racine du dépôt, un cran au-dessus.
  const RACINE = process.env.CLAUDE_PROJECT_DIR || resolve(ICI, '..');
  const FICHIER = join(RACINE, 'memoire', 'LECONS.md');

  // ⛔ L'ABSENCE SE DIT. Voir l'en-tête : un rappel muet se lit comme un rappel
  // qui n'avait rien à dire, et c'est le pire des deux états.
  if (!existsSync(FICHIER)) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: [
          '⚠️ LEÇONS — `memoire/LECONS.md` est ABSENT de ce dépôt.',
          "La séance s'ouvre donc SANS la mémoire de méthode. Sa source unique est",
          '`Ultima-/memoire/LECONS.md` : la recopier ici, octet pour octet.',
        ].join('\n'),
      },
    }));
    process.exit(0);
  }

  const brut = readFileSync(FICHIER, 'utf8');
  const trop_long = Buffer.byteLength(brut, 'utf8') > MAX_OCTETS;
  const texte = trop_long ? brut.slice(0, MAX_OCTETS) : brut;

  // Le sceau est ANNONCÉ, et son absence aussi. Sans lui, deux dépôts divergents
  // affichent des leçons différentes sans que rien ne le signale — et le silence
  // se lit comme une bonne nouvelle.
  const sceau = brut.match(MOTIF_SCEAU)?.[1];
  const entete = [
    '════ LEÇONS À NE PAS OUBLIER — mémoire de méthode des dix dépôts ════',
    sceau
      ? `Empreinte de cette copie : ${sceau} — elle doit être la même dans les dix dépôts.`
      : '⚠️ Cette copie n\'a PAS de sceau : impossible de dire si elle est à jour. La sceller dans Ultima.',
    'Chaque règle ci-dessous a été payée par une erreur réelle. Les relire ici',
    'coûte moins cher que de les repayer. Source : memoire/LECONS.md',
  ];
  const pied = trop_long
    ? [`⚠️ TRONQUÉ à ${MAX_OCTETS} octets — la fin manque, lire memoire/LECONS.md en entier.`]
    : [];
  const rappel = [
    '⛔ En fin de séance : si une erreur a coûté quelque chose, elle devient une',
    "   leçon dans memoire/LECONS.md, avec l'incident qui l'a payée.",
  ];

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: [...entete, '', texte, ...pied, ...rappel].join('\n'),
    },
  }));
} catch {
  process.exit(0);
}
