#!/usr/bin/env node
// FINUBAR — rappel d'ouverture de séance (hook SessionStart).
//
// ⛔ CE FICHIER EST COPIÉ À L'IDENTIQUE dans le `.claude/` des 8 dépôts.
//    SA SOURCE UNIQUE EST `Ultima-/finubar/rappel.mjs`. Toute évolution se fait
//    ICI, puis se re-copie ; on ne corrige jamais une copie sur place, sinon les
//    huit divergent et plus personne ne sait laquelle fait foi.
//    (La copie est assumée : le script ne dépend de RIEN — ni d'un paquet npm,
//    ni du moteur `agreger.mjs`, qui n'existe que dans Ultima. Un dépôt qui
//    n'aurait pas ses dépendances installées doit quand même savoir se présenter.)
//
// Ce qu'il fait : lit le FINUBAR.md du dépôt, en sort le bloc d'état, MESURE si
// le dépôt a avancé depuis la note, et rend le tout au format attendu par le
// hook SessionStart de Claude Code.
//
// Il ne doit JAMAIS faire échouer l'ouverture d'une séance : toute anomalie
// sort en silence avec le code 0 (pas de FINUBAR.md, JSON cassé, git absent).
// Un rappel qui empêche de travailler serait pire que pas de rappel du tout.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEBUT = '<!-- finubar:debut -->';
const FIN = '<!-- finubar:fin -->';

// ⛔ LA MÊME BORNE QUE `agreger.mjs` (MAX_TEXTE = 400), et ce n'est pas un détail.
// Deux lecteurs du même grain qui bornent différemment affichent deux vérités :
// l'écran montrerait une phrase coupée et le rappel la phrase entière, ou
// l'inverse. Et sans borne du tout, un `cap` de 5 000 caractères écrit un jour
// de fatigue inonderait le contexte de CHAQUE ouverture de séance, dans les huit
// dépôts. La valeur est dupliquée ici parce que ce fichier ne dépend de RIEN
// (voir l'en-tête) — si elle change là-bas, elle change ici.
// ⚠️ Nommée `borne` et non `b` : `b` est déjà le paramètre d'un `map` plus bas,
// et l'y masquer aurait produit exactement le genre de bug qu'on ne voit pas.
const MAX_TEXTE = 400;
const borne = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX_TEXTE) : '');

try {
  // Le fichier se cherche par rapport au SCRIPT (.claude/rappel.mjs → ../), pas
  // par rapport au répertoire courant : un hook peut être lancé d'ailleurs.
  const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const fichier = join(racine, 'FINUBAR.md');
  if (!existsSync(fichier)) process.exit(0);

  const texte = readFileSync(fichier, 'utf8');
  const i = texte.indexOf(DEBUT);
  const j = i === -1 ? -1 : texte.indexOf(FIN, i);
  if (i === -1 || j === -1) process.exit(0);
  const json = texte.slice(i + DEBUT.length, j)
    .replace(/^\s*```(?:json)?/, '').replace(/```\s*$/, '').trim();
  if (!json) process.exit(0);

  let g;
  try { g = JSON.parse(json); } catch { process.exit(0); }
  if (!g || typeof g !== 'object' || !g.projet) process.exit(0);

  // La mesure qui empêche la note de mentir : le dépôt a-t-il avancé depuis ?
  let derive = '';
  try {
    const git = (a) => execFileSync('git', ['-C', racine, ...a], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000,
    }).trim();
    if (g.dernier_arret && /^[0-9a-f]{7,40}$/i.test(g.dernier_arret.commit || '')) {
      // Exclusion des fichiers de Finubar : le commit qui pose la note ne doit
      // pas la déclarer périmée (voir le commentaire long dans collecter.mjs).
      const n = Number(git(['rev-list', '--count', `${g.dernier_arret.commit}..HEAD`,
        '--', ':(exclude)FINUBAR.md', ':(exclude).claude/finubar-rappel.mjs',
        ':(exclude)finubar/macro.json', ':(exclude)api/_lib/finubar-macro.mjs']));
      if (Number.isFinite(n) && n > 0) {
        derive = `\n⚠️ Le dépôt a avancé de ${n} commit(s) depuis cette note (tête ${git(['log', '-1', '--format=%h'])}).`
          + ' Vérifier l\'état réel AVANT de la croire, puis la remettre à jour.';
      }
    }
  } catch {
    // ⛔ On ne se tait QUE si l'on ne sait rien du tout. Si le grain porte un
    // commit bien formé et que git ne le trouve pas, c'est un fait à dire : le
    // cas normal est une fusion en SQUASH, qui remplace les commits de la
    // branche par un seul commit neuf. La note pointe alors dans le vide et la
    // mesure de fraîcheur s'arrête — silencieusement si on ne l'annonce pas.
    try {
      if (g.dernier_arret && /^[0-9a-f]{7,40}$/i.test(g.dernier_arret.commit || '')) {
        const tete = execFileSync('git', ['-C', racine, 'log', '-1', '--format=%h'], {
          encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000,
        }).trim();
        derive = `\n⚠️ Le commit noté (${borne(g.dernier_arret.commit)}) est introuvable dans l'historique`
          + ` — fusion en squash, très probablement. La fraîcheur de cette note n'est donc PAS mesurable.`
          + ` Tête courante : ${tete}. À recaler en fin de séance.`;
      }
    } catch { /* git absent : là, on ne sait vraiment rien, et on se tait */ }
  }

  const l = [];
  l.push(`FINUBAR — ${borne(g.projet)} (${borne(g.depot) || '—'})`);
  if (borne(g.cap)) l.push(`CAP (le pourquoi) : ${borne(g.cap)}`);
  if (g.jalon && g.jalon.nom) {
    l.push(`JALON EN COURS : ${borne(g.jalon.nom)}`
      + (borne(g.jalon.critere_de_sortie) ? ` — sortie quand : ${borne(g.jalon.critere_de_sortie)}` : ''));
  }
  if (g.dernier_arret && (g.dernier_arret.quoi || g.dernier_arret.le)) {
    l.push(`ON S'EST ARRÊTÉ LE ${borne(g.dernier_arret.le) || '—'} SUR : ${borne(g.dernier_arret.quoi) || '—'}`
      + (borne(g.dernier_arret.commit) ? ` (${borne(g.dernier_arret.commit)})` : ''));
  }
  if (borne(g.prochaine_action)) l.push(`▶ REPRENDRE PAR : ${borne(g.prochaine_action)}`);
  if (Array.isArray(g.bloque_par) && g.bloque_par.length) {
    l.push(`EN ATTENTE D'UN GESTE DE PAUL : ${g.bloque_par.slice(0, 5).map(borne).join(' · ')}`);
  }
  if (Array.isArray(g.boucles_ouvertes) && g.boucles_ouvertes.length) {
    // LES DEUX FORMES COEXISTENT dans les grains, et il faut lire les deux :
    // Ultima écrit `{quoi, depuis}`, artisan-builder écrit des CHAÎNES. Mesuré
    // le 2026-09-07 sur ces deux dépôts ; les six autres n'ont pas été ouverts,
    // donc on ne suppose rien de leur forme — on les accepte toutes les deux.
    // Ne lire que `x.quoi` rendait, sur un grain à chaînes,
    // « BOUCLES OUVERTES :  ·  ·  » : des séparateurs sans contenu, que le
    // lecteur suivant prend pour « aucune boucle ouverte ». Le silence d'un
    // rappel se lit comme une bonne nouvelle, et c'est le pire des deux états.
    // ⚠️ Nommée `libelle` : `texte` est déjà le contenu du fichier lu plus haut.
    const libelle = (x) => borne(typeof x === 'string' ? x : x && x.quoi);
    l.push(`BOUCLES OUVERTES : ${g.boucles_ouvertes.slice(0, 5).map(libelle).filter(Boolean).join(' · ')}`);
  }
  if (borne(g.rattache_a)) l.push(`ROADMAP DÉTAILLÉE : ${borne(g.rattache_a)}`);
  l.push(`Note datée du ${borne(g.maj) || '—'}.${derive}`);
  l.push('⛔ En fin de séance : mettre à jour le bloc de FINUBAR.md (état, dernier arrêt, prochaine action) — c\'est lui qui sera lu à la prochaine ouverture.');

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: l.join('\n'),
    },
  }));
} catch {
  process.exit(0);
}
