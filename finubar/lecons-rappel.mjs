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

  // ⛔ LA COUPE TOMBE SUR UNE FRONTIÈRE D'ENTRÉE, ET ELLE DIT CE QU'ELLE
  // LAISSE DEHORS — corrigé le 30/09. Avant, `brut.slice(0, MAX_OCTETS)`
  // coupait AU MILIEU D'UN MOT : mesuré ce jour-là, à la ligne 861 sur 1908.
  // Quatre familles entières — « Ce qu'on donne à Paul », « Conduire une
  // boucle », « Plusieurs dépôts », « Économie », soit 54 leçons sur 141 —
  // n'atteignaient AUCUNE séance, sur AUCUN des dix dépôts. Le rappel
  // annonçait « TRONQUÉ » sans dire quoi : on savait qu'il manquait quelque
  // chose, jamais lequel.
  //
  // ⚠️ POURQUOI SUR UNE ENTRÉE ET NON SUR UNE FAMILLE. La première version de
  // ce correctif coupait à la dernière FAMILLE entière : elle servait 35 Ko au
  // lieu de 63, parce que la famille 2 pèse 42 Ko et ne tenait pas. Plus
  // honnête, mais elle échangeait 26 Ko de leçons réellement délivrées contre
  // de la franchise. Couper sur une entrée garde le volume ET nomme le manque.
  //
  // ⚠️ Ça ne rend pas la place perdue — c'est le fichier qu'il faut élaguer,
  // pas la borne qu'il faut lever. Mais un manque NOMMÉ se va chercher, et un
  // manque anonyme se prend pour une absence de leçon.
  const familles = [...brut.matchAll(/^## .+$/gm)].map((m) => ({
    titre: m[0].slice(3).trim(), debut: m.index,
  }));
  const entrees = [...brut.matchAll(/\n\n\*\*[^*\n]/g)].map((m) => m.index + 2);
  let texte = brut;
  let coupe = brut.length;
  const dehors = [];
  let partielle = null;
  if (Buffer.byteLength(brut, 'utf8') > MAX_OCTETS) {
    // La dernière entrée qui tient ENTIÈREMENT. À défaut d'entrée, coupe brute
    // plutôt que rien servi.
    for (const i of entrees) {
      if (Buffer.byteLength(brut.slice(0, i), 'utf8') <= MAX_OCTETS) coupe = i;
    }
    if (coupe === brut.length) coupe = MAX_OCTETS;
    texte = brut.slice(0, coupe);
    for (const f of familles) if (f.debut >= coupe) dehors.push(f.titre);
    // La famille qui contient la coupe est servie À MOITIÉ : on la nomme, avec
    // le compte d'entrées servies sur son total. Sans ça, une famille amputée
    // se lit comme une famille complète — le pire des deux états.
    const dedans = familles.filter((f) => f.debut < coupe);
    const courante = dedans[dedans.length - 1];
    if (courante) {
      const finFam = familles.find((f) => f.debut > courante.debut)?.debut ?? brut.length;
      if (finFam > coupe) {
        const compte = (bout) =>
          (brut.slice(courante.debut, bout).match(/\n\n\*\*[^*\n]/g) || []).length;
        partielle = { titre: courante.titre, servies: compte(coupe), total: compte(finFam) };
      }
    }
  }
  const trop_long = dehors.length > 0 || partielle !== null;

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
  const pied = !trop_long ? [] : [
    '',
    `⛔ CE RAPPEL EST INCOMPLET — il s'arrête à ${MAX_OCTETS} octets, sur une`,
    '   frontière de leçon (jamais au milieu de l\'une d\'elles).',
    ...(partielle
      ? [`   · ${partielle.titre} — ${partielle.servies} leçons sur ${partielle.total} servies`]
      : []),
    ...dehors.map((t) => `   · ${t} — AUCUNE leçon servie`),
    '   Ce qui manque est dans memoire/LECONS.md, en entier : le lire avant de',
    "   travailler sur ce que ces familles couvrent. ⚠️ Et c'est le FICHIER qui",
    '   doit être élagué, jamais cette borne qui doit être levée.',
  ];
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
