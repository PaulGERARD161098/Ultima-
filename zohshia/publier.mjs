#!/usr/bin/env node
// ZOH SHIA — PUBLIER L'ÉCRAN : un badge par techno, son contenu dedans.
//
// Paul, 04/10/2026 : « dans ZOH je veux un badge par techno […] et le contenu est
// dedans ». Chaque techno porte un `badge.json` (zohshia/<techno>/) qui POINTE
// des sections de ses fichiers ; ce script les transforme en données figées au
// commit, écrites dans `api/_lib/zohshia-technos.mjs`, que `/api/zohshia` sert
// au seul propriétaire. Même montage que Finubar.
//
// Les réponses au pre-mortem :
//   · L'ÉCRAN MONTRE UN PLAN PÉRIMÉ → chaque fichier source est condensé
//     (sha256) dans la donnée ; `tests/unit-zohshia-ecran.mjs` recalcule et
//     rougit au moindre écart. La page affiche la date de publication.
//   · UN NOM PROPRE, UN SECRET OU UNE ADRESSE ARRIVE À L'ÉCRAN → la donnée
//     produite est relue par le détecteur de l'extraction ; un seul = refus.
//   · DU TEXTE DEVIENT DU CODE DANS LA PAGE → le markdown est découpé ici en
//     blocs de TEXTE (titres, paragraphes, listes, tableaux) ; la page ne fait
//     que du `textContent`. Aucun HTML ne traverse.
//   · UNE SECTION POINTÉE DISPARAÎT → refus : un onglet vide se lirait comme un
//     onglet sans rien à dire.
//
// Usage : node zohshia/publier.mjs [--verifier]   (--verifier : n'écrit rien,
// sort en erreur si la donnée versionnée n'est plus à jour)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chargerRecette, nomPropreDans } from './renodevis/neutraliser.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..');
export const CIBLE = join(RACINE, 'api', '_lib', 'zohshia-technos.mjs');

// ── Le texte en ligne : gras, code, italique, liens réduits à leur texte ──────
export function enLigne(texte) {
  const runs = [];
  const motif = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let dernier = 0;
  for (const m of texte.matchAll(motif)) {
    if (m.index > dernier) runs.push([texte.slice(dernier, m.index), '']);
    const s = m[0];
    if (m[1]) runs.push([s.slice(1, -1), 'c']);
    else if (m[2]) runs.push([s.slice(2, -2), 'b']);
    else if (m[3]) runs.push([s.slice(1, -1), 'i']);
    else runs.push([s.slice(1, s.indexOf('](')), '']);
    dernier = m.index + s.length;
  }
  if (dernier < texte.length) runs.push([texte.slice(dernier), '']);
  return runs.filter(([t]) => t.length);
}

// ── Le markdown en blocs de texte ────────────────────────────────────────────
export function enBlocs(md) {
  const blocs = [];
  const lignes = md.replace(/\r/g, '').split('\n');
  let para = [];
  const fermerPara = () => { if (para.length) { blocs.push({ t: 'p', r: enLigne(para.join(' ')) }); para = []; } };
  for (let i = 0; i < lignes.length; i += 1) {
    const l = lignes[i];
    if (/^```/.test(l)) {
      fermerPara();
      const code = [];
      for (i += 1; i < lignes.length && !/^```/.test(lignes[i]); i += 1) code.push(lignes[i]);
      blocs.push({ t: 'code', texte: code.join('\n') });
      continue;
    }
    const titre = l.match(/^(#{1,4})\s+(.*)$/);
    if (titre) {
      fermerPara();
      if (titre[1].length >= 2) blocs.push({ t: titre[1].length === 2 ? 'h2' : 'h3', r: enLigne(titre[2]) });
      continue;
    }
    if (/^\s*\|/.test(l)) {
      fermerPara();
      const rangees = [];
      for (; i < lignes.length && /^\s*\|/.test(lignes[i]); i += 1) {
        const cellules = lignes[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (cellules.every((c) => /^:?-{2,}:?$/.test(c))) continue;
        rangees.push(cellules.map(enLigne));
      }
      i -= 1;
      blocs.push({ t: 'table', entetes: rangees[0] || [], lignes: rangees.slice(1) });
      continue;
    }
    const puce = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (puce) {
      fermerPara();
      const ordonnee = /\d/.test(puce[2]);
      const items = [puce[3]];
      for (i += 1; i < lignes.length; i += 1) {
        const suite = lignes[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (suite) { items.push(suite[3]); continue; }
        if (/^\s{2,}\S/.test(lignes[i])) { items[items.length - 1] += ' ' + lignes[i].trim(); continue; }
        break;
      }
      i -= 1;
      blocs.push({ t: 'liste', ordonnee, items: items.map(enLigne) });
      continue;
    }
    if (/^>\s?/.test(l)) {
      fermerPara();
      const note = [];
      for (; i < lignes.length && /^>/.test(lignes[i]); i += 1) note.push(lignes[i].replace(/^>\s?/, ''));
      i -= 1;
      // Une ligne vide dans la citation sépare deux paragraphes de la note.
      const paras = note.join('\n').split(/\n\s*\n/).map((p) => enLigne(p.replace(/\n/g, ' ').trim())).filter((p) => p.length);
      blocs.push({ t: 'note', paras });
      continue;
    }
    if (!l.trim()) { fermerPara(); continue; }
    para.push(l.trim());
  }
  fermerPara();
  return blocs;
}

// Les sections d'un fichier dont le titre de niveau 2 commence par un préfixe.
export function sections(md, prefixes) {
  const morceaux = md.split(/\n(?=## )/);
  return prefixes.map((p) => {
    const m = morceaux.find((x) => x.startsWith(p));
    if (!m) throw new Error(`section « ${p} » introuvable`);
    return m;
  }).join('\n');
}

const sha = (t) => createHash('sha256').update(t).digest('hex');

export function construire() {
  const recette = chargerRecette(RACINE);
  const technos = [];
  const sources = {};
  for (const d of readdirSync(ICI).sort()) {
    const fiche = join(ICI, d, 'badge.json');
    if (!existsSync(fiche)) continue;
    const b = JSON.parse(readFileSync(fiche, 'utf8'));
    if (!b.badge || !Array.isArray(b.onglets) || !b.onglets.length) throw new Error(`${d}/badge.json incomplet`);
    sources[`${d}/badge.json`] = sha(readFileSync(fiche, 'utf8'));
    const onglets = b.onglets.map((o) => {
      const texte = readFileSync(join(ICI, d, o.source), 'utf8');
      sources[`${d}/${o.source}`] = sha(texte);
      const corps = o.sections ? sections(texte, o.sections) : texte;
      const blocs = enBlocs(corps);
      if (blocs.length < 3) throw new Error(`${d} · onglet « ${o.titre} » presque vide (${blocs.length} blocs)`);
      return { id: o.id, titre: o.titre, blocs };
    });
    let mesure = null;
    try { mesure = JSON.parse(readFileSync(join(ICI, d, 'inventaire.json'), 'utf8')).source || null; } catch { mesure = null; }
    technos.push({
      id: d,
      ordre: b.ordre ?? 99,
      badge: b.badge,
      etat: b.etat || '',
      // Le plan est mesuré sur un commit du dépôt de référence : on dit lequel, et de quand.
      mesure: mesure ? { commit: String(mesure.commit || '').slice(0, 7) || null, le: String(mesure.date_commit || '').slice(0, 10) || null } : null,
      onglets,
    });
  }
  if (!technos.length) throw new Error('aucune techno publiée — refus (vert par vacuité)');
  technos.sort((a, b) => a.ordre - b.ordre);
  const donnee = { publie_le: new Date().toISOString().slice(0, 10), technos, sources };
  const texte = JSON.stringify(donnee);
  const n = nomPropreDans(texte, recette);
  if (n) throw new Error(`la donnée de l'écran porte un nom propre (« ${n} ») — refus`);
  if (/(sk_live|sk_test|whsec_|eyJhbGciOi|-----BEGIN)/.test(texte)) throw new Error('la donnée de l’écran porte une forme de secret — refus');
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(texte)) throw new Error('la donnée de l’écran porte une adresse e-mail — refus');
  return donnee;
}

export function enModule(donnee) {
  return '// GÉNÉRÉ par `node zohshia/publier.mjs` — ne pas modifier à la main.\n'
    + '// La techno de ZOH SHIA, à l’état pur, servie au SEUL propriétaire par /api/zohshia.\n'
    + `export default ${JSON.stringify(donnee, null, 1)};\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const donnee = construire();
    if (process.argv.includes('--verifier')) {
      const { default: actuelle } = await import(CIBLE);
      if (JSON.stringify(actuelle.sources) !== JSON.stringify(donnee.sources)) {
        console.error('✗ la donnée de l’écran n’est plus à jour — lancer node zohshia/publier.mjs');
        process.exit(1);
      }
      console.log('✓ la donnée de l’écran est à jour');
    } else {
      writeFileSync(CIBLE, enModule(donnee));
      const blocs = donnee.technos.reduce((n, t) => n + t.onglets.reduce((m, o) => m + o.blocs.length, 0), 0);
      console.log(`✓ ${donnee.technos.length} techno(s), ${blocs} blocs → api/_lib/zohshia-technos.mjs`);
    }
  } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}
