#!/usr/bin/env node
// Lecture locale seulement : aucune source importée n'est exécutée.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const texte = v => typeof v === 'string' && v.trim().length > 0;
const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const NIVEAUX = new Set(['mesuré', 'déclaré', 'inféré', 'non vérifié']);
const STATUTS = new Set(['observation', 'a_eprouver', 'relie_a_une_lecon', 'retire']);
const NATURES = new Set(['incident', 'reussite', 'idee']);
const normaliser = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function valider(j, lecons) {
  if (!j || j.version !== 1 || !date(j.mis_a_jour_le) || j.source_regles !== 'memoire/LECONS.md') throw new Error('Entête du journal invalide.');
  if (!texte(lecons)) throw new Error('Mémoire canonique absente ou vide.');
  const c = j.couverture;
  if (!c || !Array.isArray(c.relues) || !c.relues.length || !c.relues.every(texte)
      || !Array.isArray(c.manquantes) || !c.manquantes.every(texte) || !texte(c.limite)) throw new Error('Couverture de lecture manquante.');
  if (!Array.isArray(j.entrees) || !j.entrees.length) throw new Error('Journal vide : aucune observation à consulter.');
  const ids = new Set();
  for (const e of j.entrees) {
    if (!e || !/^JA-\d{8}-\d{3}$/.test(e.id ?? '') || ids.has(e.id)) throw new Error('Identifiant absent ou dupliqué.');
    ids.add(e.id);
    if (!date(e.le) || !NATURES.has(e.nature) || !STATUTS.has(e.statut)
        || !['cas', 'constat', 'consequence', 'piste', 'limites', 'verification_suivante'].every(k => texte(e[k]))
        || !Array.isArray(e.mots_cles) || !e.mots_cles.length || !e.mots_cles.every(texte)
        || !e.explication || !NIVEAUX.has(e.explication.niveau) || !texte(e.explication.texte)
        || !Array.isArray(e.sources) || !e.sources.length
        || !e.sources.every(s => s && ['depot', 'declaration', 'document'].includes(s.type) && texte(s.reference) && NIVEAUX.has(s.niveau))) {
      throw new Error(`Entrée ${e.id} incomplète ou niveau de preuve inconnu.`);
    }
    if (e.statut === 'relie_a_une_lecon') {
      if (!e.lecon_canonique || e.lecon_canonique.chemin !== j.source_regles
          || !texte(e.lecon_canonique.titre) || !lecons.includes(e.lecon_canonique.titre)) throw new Error(`Leçon canonique introuvable pour ${e.id}.`);
    } else if (e.lecon_canonique !== null) throw new Error(`Lien de leçon incohérent pour ${e.id}.`);
  }
  return j;
}

export function lire(racine = RACINE) {
  const lecons = readFileSync(join(racine, 'memoire/LECONS.md'), 'utf8');
  const journal = valider(JSON.parse(readFileSync(join(racine, 'memoire/JOURNAL-APPRENTISSAGES.json'), 'utf8')), lecons);
  return { journal, lecons };
}

export function rechercher({ journal, lecons }, cas) {
  const mots = [...new Set(normaliser(cas).split(/[^\p{L}\p{N}]+/u).filter(m => m.length >= 3))];
  if (!mots.length) throw new Error('Décrire le cas avec au moins un mot de trois caractères.');
  const score = t => mots.filter(m => normaliser(t).includes(m)).length;
  const observations = journal.entrees.filter(e => e.statut !== 'retire')
    .map(e => ({ score: score([e.cas, ...e.mots_cles, e.constat, e.piste].join(' ')), entree: e }))
    .filter(e => e.score > 0).sort((a, b) => b.score - a.score || a.entree.id.localeCompare(b.entree.id));
  const blocs = lecons.split(/\n(?=\*\*)/);
  const regles = blocs.map(t => ({ score: score(t), texte: t })).filter(e => e.score > 0).sort((a, b) => b.score - a.score);
  return { methode: 'Recherche lexicale ; ni preuve d’analogie ni lecture complète des règles.', observations, regles };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const args = process.argv.slice(2);
    if (!(args.length === 0 || (args.length === 1 && args[0] === '--verifier') || (args.length === 2 && args[0] === '--cas'))) throw new Error('Usage : consulter.mjs [--verifier | --cas "situation"].');
    const contenu = lire();
    if (args[0] === '--verifier') console.log(`Journal valide : ${contenu.journal.entrees.length} entrées ; contenu des preuves non audité par ce contrôle.`);
    else console.log(JSON.stringify({
      source_regles: contenu.journal.source_regles,
      version: contenu.journal.version,
      couverture: contenu.journal.couverture,
      ...(args[0] === '--cas' ? rechercher(contenu, args[1]) : { journal: contenu.journal, regles_a_lire_integralement: 'memoire/LECONS.md' }),
    }, null, 2));
  } catch (e) { console.error(`Journal indisponible : ${e.message}`); process.exitCode = 1; }
}
