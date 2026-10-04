#!/usr/bin/env node
// ZOH SHIA · RénoDevis — LA DÉRIVE DE LA SÉRIE, mesurée sans la chercher.
//
// Paul, 04/10/2026 : « ZOH doit rester à jour de toute façon : Ultima en porte
// le code et travaille toujours avec les autres dépôts ». La série de
// neutralisation est rangée contre un commit du dépôt de référence (`BASE`).
// Ce module dit de combien la tête du dépôt l'a dépassée, et combien de ces
// commits touchent un fichier que la série retouche — c'est là que
// l'extraction refusera.
//
// ⛔ CE N'EST PAS UNE PREUVE. Seule `extraire.mjs --verifier` prouve que le
// code s'extrait. Ce module est un INDICATEUR : il dit quand aller la lancer.
//
// ⛔ DES COMPTES, JAMAIS DES CHEMINS. La liste des fichiers retouchés vit dans
// `outils/` et NOMME ce qu'elle retire (un chemin porte parfois un nom propre).
// Rien de ce module ne la recopie : il ne rend que des nombres et des SHA.
//
// ⛔ NON MESURABLE SE DIT. Dépôt de référence absent du disque, série absente,
// commit de base inconnu du clone local : chaque cas rend `mesurable: false`
// avec sa raison. Un silence se lirait « à jour » — le pire des deux états.
//
// Aucun réseau, aucune écriture. `git` est appelé en tableau d'arguments, avec
// un délai borné : ce module tourne à l'ouverture de chaque séance.
//
// Usage : node zohshia/renodevis/derive.mjs [--depot <chemin>] [--ref origin/main] [--rappel]
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RACINE } from './neutraliser.mjs';

const SERIE = (racine) => join(racine, 'outils', 'zohshia', 'renodevis', 'neutre');

/** Les chemins que la série retouche ou retire nommément (jamais rendus). */
export function cheminsDeLaSerie(racine = RACINE) {
  const dossier = SERIE(racine);
  const diff = readFileSync(join(dossier, 'neutre.diff'), 'utf8');
  const chemins = new Set([...diff.matchAll(/^diff --git a\/(\S+) b\//gm)].map((m) => m[1]));
  for (const l of readFileSync(join(dossier, 'retirer.txt'), 'utf8').split('\n')) {
    const c = l.trim();
    // Les motifs (`**/*.md`, `docs/**`) retirent ce qui arrive : un fichier qui
    // y tombe ne fait jamais conflit. Seuls les chemins NOMMÉS comptent.
    if (c && !c.startsWith('#') && !c.includes('*')) chemins.add(c);
  }
  return chemins;
}

/**
 * Mesure la dérive. Rend toujours un objet, jamais d'exception :
 *   { mesurable: true, base, tete, commits, touchent, releve_le }
 *   { mesurable: false, raison, base? }
 */
export function mesurerDerive({ racine = RACINE, depot, ref = 'origin/main' } = {}) {
  const dossierDepot = depot || resolve(racine, '..', 'RenoDevis');
  const fichierBase = join(SERIE(racine), 'BASE');
  if (!existsSync(fichierBase)) return { mesurable: false, raison: 'série absente (outils/zohshia/renodevis/neutre/BASE)' };
  const base = readFileSync(fichierBase, 'utf8').trim();
  if (!/^[0-9a-f]{40}$/.test(base)) return { mesurable: false, raison: 'BASE de la série illisible' };
  if (!existsSync(join(dossierDepot, '.git'))) {
    return { mesurable: false, base: base.slice(0, 7), raison: 'dépôt de référence absent de cette séance' };
  }
  const git = (args) => execFileSync('git', ['-C', dossierDepot, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000, maxBuffer: 16 * 1024 * 1024,
  }).trim();
  let tete;
  try { tete = git(['rev-parse', '--verify', `${ref}^{commit}`]); } catch {
    return { mesurable: false, base: base.slice(0, 7), raison: `référence ${ref} introuvable dans le clone local` };
  }
  try { git(['cat-file', '-e', `${base}^{commit}`]); } catch {
    return { mesurable: false, base: base.slice(0, 7), raison: 'commit de base inconnu du clone local (le récupérer : git fetch)' };
  }
  let ancetre = true;
  try { git(['merge-base', '--is-ancestor', base, tete]); } catch { ancetre = false; }
  if (!ancetre) {
    return { mesurable: false, base: base.slice(0, 7), raison: `la base de la série n'est pas un ancêtre de ${ref} (historique réécrit, ou clone en retard)` };
  }
  let commits;
  let fichiers;
  try {
    commits = Number(git(['rev-list', '--count', `${base}..${tete}`]));
    fichiers = git(['diff', '--name-only', '--no-renames', base, tete]).split('\n').filter(Boolean);
  } catch {
    return { mesurable: false, base: base.slice(0, 7), raison: 'lecture git interrompue (délai dépassé ?)' };
  }
  const serie = cheminsDeLaSerie(racine);
  const touches = fichiers.filter((f) => serie.has(f));
  let touchent = 0;
  if (touches.length) {
    try { touchent = Number(git(['rev-list', '--count', `${base}..${tete}`, '--', ...touches])); } catch { touchent = touches.length ? -1 : 0; }
  }
  // La fraîcheur du clone local : sans elle, « à jour » pourrait vouloir dire
  // « à jour d'un clone d'il y a trois semaines ».
  let releve = null;
  try { releve = statSync(join(dossierDepot, '.git', 'FETCH_HEAD')).mtime.toISOString(); } catch { releve = null; }
  return { mesurable: true, base: base.slice(0, 7), tete: tete.slice(0, 7), commits, touchent, fichiers_touches: touches.length, releve_le: releve };
}

/** La phrase, la même pour le rappel, la collecte et l'écran. */
export function phraseDerive(m) {
  if (!m || !m.mesurable) {
    return `ZOH SHIA — dérive NON MESURABLE : ${m?.raison || 'mesure absente'}. Ne pas lire « à jour » : rien n'a été mesuré.`;
  }
  const releve = m.releve_le ? ` (clone relevé le ${m.releve_le.slice(0, 16).replace('T', ' ')} UTC)` : ' (date de relevé du clone inconnue)';
  if (m.commits === 0) return `ZOH SHIA — à jour : la série suit RénoDevis ${m.tete}${releve}.`;
  if (m.touchent === 0) {
    return `ZOH SHIA — RénoDevis a avancé de ${m.commits} commit(s) depuis la série (${m.base} → ${m.tete})${releve}, `
      + 'aucun sur un fichier qu\'elle retouche : extraction attendue verte, à confirmer par extraire.mjs --verifier.';
  }
  const n = m.touchent < 0 ? 'certains' : `${m.touchent}`;
  return `ZOH SHIA — ⚠️ EN RETARD : RénoDevis a avancé de ${m.commits} commit(s) depuis la série (${m.base} → ${m.tete})${releve}, `
    + `dont ${n} sur des fichiers qu'elle retouche (${m.fichiers_touches} fichier(s)) : l'extraction refusera probablement. Rafraîchir la série (TECHNO §8).`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (nom) => { const i = process.argv.indexOf(`--${nom}`); return i > 0 ? process.argv[i + 1] : undefined; };
  // ⛔ En mode rappel, RIEN ne doit faire échouer l'ouverture d'une séance.
  let m;
  try { m = mesurerDerive({ depot: arg('depot'), ref: arg('ref') || 'origin/main' }); } catch (e) {
    m = { mesurable: false, raison: `erreur inattendue (${String(e?.message || e).slice(0, 80)})` };
  }
  const phrase = phraseDerive(m);
  if (process.argv.includes('--rappel')) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: phrase } }));
    process.exit(0);
  }
  console.log(phrase);
  process.exit(m.mesurable ? 0 : 1);
}
