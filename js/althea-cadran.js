// ALTHEA — le cadran, en grand (vue dédiée, décision Paul 2026-08-06).
// Fail-closed comme la page principale : pas de session, pas de dessin.
//
// La géométrie est CALCULÉE, pas dessinée à la main : la rose s'adapte au
// nombre de skills, et le cadre est dimensionné pour que les étiquettes
// tiennent — c'est la leçon payée deux fois sur la maquette (un anneau parti
// hors cadre, un nom de cap qui débordait de 3 px).

import { etatAlthea, decalerJour, jourAlthea } from './althea-progression.mjs';

const ROMAIN = ['', 'I', 'II', 'III', 'IV', 'V'];
const SVG = 'http://www.w3.org/2000/svg';
const VB = 620;              // le cadre, large exprès : les noms ont de la place
const C = VB / 2;
const R = 210;               // rayon de la rose
const RA = 52;               // rayon d'un anneau de skill

function el(nom, attrs, texte) {
  const n = document.createElementNS(SVG, nom);
  for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
  if (texte !== undefined) n.textContent = texte;
  return n;
}

// Place les caps en rose : premier plein Nord, puis sens horaire — même règle
// que toutes les boussoles d'Ultima (CADRAGE-LV3 §2).
export function positionsRose(n, centre = C, rayon = R) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i * 2 * Math.PI) / n;
    out.push({
      x: centre + rayon * Math.sin(a),
      y: centre - rayon * Math.cos(a),
      // Le cap du haut écrit vers le HAUT ; les autres vers le bas. Écrire vers
      // le centre ferait mordre l'étiquette sur le cœur.
      versLeHaut: Math.cos(a) > 0.5,
    });
  }
  return out;
}

function dessiner(skills, jour) {
  const svg = el('svg', {
    class: 'althea-cadran', viewBox: `0 0 ${VB} ${VB}`, role: 'img',
    'aria-label': `Cadran des skills : ${skills.map((s) => `${s.nom} rang ${s.rang}`).join(', ')}`,
  });
  const pts = positionsRose(skills.length);
  skills.forEach((s, i) => {
    const p = pts[i];
    const g = el('g', { transform: `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})` });
    g.appendChild(el('circle', { class: 'anneau-fond', r: RA }));
    const part = s.suivant ? Math.max(0, Math.min(1, s.suivant.part)) : 1;
    const plein = el('circle', {
      class: 'anneau-plein', r: RA,
      pathLength: 100, 'stroke-dasharray': `${(part * 100).toFixed(1)} 100`,
    });
    g.appendChild(plein);
    g.appendChild(el('circle', { class: 'disque', r: RA - 11 }));
    if (p.versLeHaut) {
      g.appendChild(el('text', { class: 'rang-txt', y: -RA - 14 }, ROMAIN[s.rang] || '–'));
      g.appendChild(el('text', { class: 'nom-skill', y: -RA - 32 }, s.nom));
    } else {
      g.appendChild(el('text', { class: 'rang-txt', y: RA + 22 }, ROMAIN[s.rang] || '–'));
      g.appendChild(el('text', { class: 'nom-skill', y: RA + 40 }, s.nom));
    }
    svg.appendChild(g);
  });
  svg.appendChild(el('circle', { class: 'coeur', cx: C, cy: C, r: 76 }));
  svg.appendChild(el('text', { class: 'coeur-txt', x: C, y: C - 6 }, jour));
  svg.appendChild(el('text', { class: 'coeur-sous', x: C, y: C + 14 },
    `${skills.filter((s) => s.etatDuJour === true).length} / ${skills.length} tenus`));
  return svg;
}

(async function demarrer() {
  const hote = document.getElementById('althea-cadran-hote');
  const note = document.getElementById('althea-cadran-note');
  const dire = (m) => { hote.textContent = ''; const p = document.createElement('p'); p.className = 'althea-vide'; p.textContent = m; hote.appendChild(p); };

  const cfg = window.ULTIMA_CONFIG || {};
  if (!cfg.SUPABASE_URL || !window.supabase) { dire('Ouvre ta session pour voir ton cadran.'); return; }
  let session = null;
  try {
    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    session = (await client.auth.getSession()).data.session;
  } catch (_) { session = null; }
  if (!session) { dire('Ouvre ta session pour voir ton cadran.'); return; }

  const jour = jourAlthea();
  let d = null;
  try {
    const rep = await fetch('/api/althea', {
      headers: { Authorization: `Bearer ${session.access_token}`, 'X-Jour-Local': jour },
    });
    if (!rep.ok) { dire('Le Système ne répond pas pour l’instant.'); return; }
    d = (await rep.json()).data;
  } catch (_) { dire('Le Système ne répond pas pour l’instant.'); return; }

  const calcul = etatAlthea({
    avatar: d.avatar, skills: d.skills || [], conditions: d.conditions || [],
    releves: d.releves || [], stats: d.stats || [], jour,
    depuis: (d.releves || []).length
      ? (d.releves || []).reduce((m, x) => (x.jour < m ? x.jour : m), d.releves[0].jour)
      : decalerJour(jour, -30),
  });
  if (!calcul.skills.length) { dire('Aucun skill posé pour l’instant.'); return; }
  hote.textContent = '';
  hote.appendChild(dessiner(calcul.skills, jour));
  if (note) note.textContent = `Niveau ${calcul.niveau} — l’anneau montre ce qu’il reste avant le rang suivant.`;
}());
