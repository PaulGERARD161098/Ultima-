#!/usr/bin/env node
// Rappel d'ouverture de séance : la charte de Léo de ce dépôt est-elle intacte
// et à jour ? Copié à l'identique dans les dix dépôts (source :
// Ultima-/.claude/leo-portable/leo-rappel.mjs). Lecture seule, aucun réseau,
// ne fait jamais échouer l'ouverture de séance (sortie 0 dans tous les cas).
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const racine = resolve(process.env.CLAUDE_PROJECT_DIR || '.');
const SCEAU = /<!-- leo-portable:empreinte[^>]*-->/;
const lu = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const empreinte = (t) => createHash('sha256').update(t.replace(SCEAU, '<!-- leo-portable:empreinte -->'), 'utf8').digest('hex').slice(0, 12);
const annonce = (t) => /<!-- leo-portable:empreinte sha256:([0-9a-f]{12}) -->/.exec(t)?.[1] || null;

function etat() {
  const reglages = lu(join(racine, '.claude/settings.json'));
  let agent = null;
  try { agent = reglages ? JSON.parse(reglages).agent : null; } catch { /* réglages illisibles : signalé ci-dessous */ }
  const source = lu(join(racine, '.claude/leo-portable/leo.md'));
  const estUltima = Boolean(source);
  const copie = estUltima ? source : lu(join(racine, '.claude/agents/leo.md'));
  if (!copie) return '⚠️ LÉO — aucune charte dans ce dépôt (.claude/agents/leo.md absent) : propager depuis Ultima (node outils/leo-portable.mjs --propager <dépôt>).';
  const a = annonce(copie);
  if (!a) return estUltima ? '⚠️ LÉO — charte portable non scellée : node outils/leo-portable.mjs --sceller.' : '⚠️ LÉO — la charte de ce dépôt n\'est pas la copie portable scellée : re-propager depuis Ultima.';
  if (a !== empreinte(copie)) return `⚠️ LÉO — charte ALTÉRÉE sur place (sceau ${a} ≠ contenu ${empreinte(copie)}) : ne pas la corriger ici, re-propager depuis Ultima.`;
  const lignes = [`LÉO — charte portable sha256:${a}${agent === 'leo' ? ', agent par défaut' : ' — ⚠️ "agent": "leo" absent de .claude/settings.json'}.`];
  if (!estUltima) {
    const reference = lu(resolve(racine, '../Ultima-/.claude/leo-portable/leo.md'));
    if (reference) {
      const r = annonce(reference);
      lignes.push(r === a ? 'À jour : même sceau que la source d\'Ultima (clone voisin).' : `⚠️ PÉRIMÉE : la source d'Ultima est à sha256:${r}. Re-propager depuis Ultima.`);
    } else {
      lignes.push('Fraîcheur non mesurable ici (Ultima non cloné à côté) : comparer ce sceau à celui d\'Ultima avant de s\'y fier.');
    }
  }
  return lignes.join(' ');
}
try { console.log(etat()); } catch (e) { console.log(`LÉO — rappel indisponible (${e.message}).`); }
