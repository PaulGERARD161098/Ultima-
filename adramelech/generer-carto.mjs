// Générateur de la carte des idées ADRAMELECH (sous-boucle AD-1).
//
// Rôle : REMPLACER la carte écrite à la main par un rendu DÉTERMINISTE calculé
// depuis le registre `adramelech/IDEES.md` (source unique de vérité). On ne
// refait pas le style — le registre antique de `carto-idees.html` (thèmes
// clair/sombre, cartouches, rose des vents, terre ferme TRAVELER) est réutilisé
// tel quel ; on branche seulement la source.
//
// Contraintes NON négociables (cadrage AD-1) :
//   - Node pur, ZÉRO dépendance, ZÉRO réseau.
//   - 100 % déterministe : interdits Math.random / Date.now / new Date. Les
//     positions sont des fonctions pures de l'ordre + d'un hash stable des IDs.
//     Même registre → sortie octet-pour-octet identique.
//   - Zéro idée perdue : le parseur ÉCHOUE BRUYAMMENT (exception → exit ≠ 0) si
//     une entrée est mal formée ; jamais une idée silencieusement escamotée.
//
// Le fichier produit (`adramelech/carto-idees.html`) n'est JAMAIS servi en
// public : `adramelech/` est dans `.vercelignore` et bloqué au middleware
// (AD-0). On ne crée aucune route publique ; le <style> inline est cohérent avec
// ce statut privé et avec le fichier de référence.
//
// API exportée (utilisée par tests/unit-carto-generee.mjs) :
//   parseRegistre(markdown)   -> [idee]        (throw si mal formé)
//   grouperArchipels(idees)   -> [archipel]    (un par thème principal)
//   detecterPonts(idees)      -> [{a,b}]       (synergies ADR↔ADR)
//   genererDocument(markdown) -> string        (HTML complet, déterministe)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ————————————————————————————————————————————————————————————————
// 1. Parseur déterministe de IDEES.md
// ————————————————————————————————————————————————————————————————

// Une idée est un bloc débutant par « ## ADR-### — NOM ». On isole d'abord tous
// les blocs candidats (ligne d'en-tête souple), puis on parse strictement.
const LIGNE_CANDIDATE = /^##\s+ADR-\d{3}\b/;
// En-tête strict : ID + tiret (em/en/court, tolérance de rédaction) + nom non vide.
const ENTETE_STRICT = /^##\s+(ADR-\d{3})\s+[—–-]\s+(\S.*?)\s*$/;
const LIGNE_CHAMP = /^-\s+\*\*(.+?)\*\*\s*:\s*(.*)$/;

function nettoyerMd(s) {
  return String(s)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Épigraphe = paragraphe italique « *Nom : … .* » suivant l'en-tête. On garde la
// version courte (avant le premier tiret cadratin), fidèle au registre.
function extraireEpigraphe(lignes) {
  let i = 1;
  while (i < lignes.length && lignes[i].trim() === '') i++;
  const t0 = i < lignes.length ? lignes[i].trim() : '';
  if (!t0.startsWith('*') || t0.startsWith('**')) return { full: '', court: '' };
  const parts = [];
  for (let j = i; j < lignes.length; j++) {
    parts.push(lignes[j].trim());
    if (/\*\s*$/.test(lignes[j].trim())) break;
  }
  let txt = parts.join(' ').trim().replace(/^\*/, '').replace(/\*$/, '').trim();
  txt = txt.replace(/^Nom\s*:\s*/i, '').trim();
  const court = txt.split(/\s+—\s+/)[0].trim();
  return { full: nettoyerMd(txt), court: nettoyerMd(court) };
}

// Première phrase / premier paragraphe de la section « ### L'idée ».
function extraireEssence(bloc) {
  const idx = bloc.search(/^###\s+L['’]idée\s*$/m);
  if (idx < 0) return '';
  const suite = bloc.slice(idx).split('\n').slice(1);
  const para = [];
  let commence = false;
  for (const l of suite) {
    if (l.trim() === '') { if (commence) break; else continue; }
    if (/^#{2,3}\s/.test(l)) break;
    para.push(l.trim());
    commence = true;
  }
  return nettoyerMd(para.join(' '));
}

// Parse une chaîne markdown (le registre) en tableau d'idées.
// ÉCHOUE (throw) sur toute entrée mal formée : jamais de perte silencieuse.
export function parseRegistre(markdown) {
  const lignes = String(markdown).split('\n');
  const debuts = [];
  lignes.forEach((l, i) => { if (LIGNE_CANDIDATE.test(l)) debuts.push(i); });

  const idees = [];
  const vus = new Set();

  for (let b = 0; b < debuts.length; b++) {
    const debut = debuts[b];
    const fin = b + 1 < debuts.length ? debuts[b + 1] : lignes.length;
    const lignesBloc = lignes.slice(debut, fin);
    const bloc = lignesBloc.join('\n');

    const mEntete = lignesBloc[0].match(ENTETE_STRICT);
    if (!mEntete) {
      throw new Error(`Entrée mal formée : en-tête d'idée illisible « ${lignesBloc[0].trim()} »`);
    }
    const id = mEntete[1];
    const nom = mEntete[2].trim();
    if (vus.has(id)) throw new Error(`Entrée mal formée : identifiant ${id} en double`);
    vus.add(id);

    const champs = {};
    for (const l of lignesBloc) {
      const m = l.match(LIGNE_CHAMP);
      if (m) champs[m[1].trim()] = m[2].trim();
    }

    const type = (champs['Type'] || '').trim();
    const statut = (champs['Statut'] || '').trim();
    // Champs structurels requis : leur absence = idée mal formée (fail bruyant).
    if (!type) throw new Error(`Entrée mal formée : ${id} sans champ **Type**`);
    if (!statut) throw new Error(`Entrée mal formée : ${id} sans champ **Statut**`);

    // Thème : OPTIONNEL. Vide → aucun thème principal → archipel « À classer ».
    const themeRaw = (champs['Thème'] || '').trim();
    const themes = themeRaw
      ? themeRaw.split('·').map((t) => t.trim()).filter(Boolean)
      : [];
    const themePrincipal = themes.length ? themes[0] : null;
    // Clé de regroupement normalisée (casse insensible, espaces réduits).
    const themeKey = themePrincipal ? themePrincipal.toLowerCase().replace(/\s+/g, ' ') : null;

    const partenaireVal = (champs['Partenaire envisagé'] || '').trim();
    const aPartenaire = partenaireVal !== '' && !partenaireVal.startsWith('—') && !partenaireVal.startsWith('-');

    const mDate = bloc.match(/\*\*Capturée le\*\*\s*:\s*(\d{4}-\d{2}-\d{2})/);
    const captureLe = mDate ? mDate[1] : null;

    // Ponts : toute référence ADR-### DIFFÉRENTE de l'ID courant, dans tout le
    // bloc (Liens inter-segments ET enrichissement — c'est là que vivent les
    // synergies). Dédupliqué. Filtré ensuite aux idées réellement existantes.
    const refs = new Set();
    const reRef = /ADR-\d{3}/g;
    let mr;
    while ((mr = reRef.exec(bloc)) !== null) {
      if (mr[0] !== id) refs.add(mr[0]);
    }

    const epi = extraireEpigraphe(lignesBloc);

    idees.push({
      id,
      num: parseInt(id.slice(4), 10),
      nom,
      type,
      statut,
      themeRaw,
      themes,
      themePrincipal,
      themeKey,
      themeLabel: themePrincipal ? cap(themePrincipal) : 'À classer',
      partenaire: partenaireVal,
      aPartenaire,
      captureLe,
      epigraphe: epi.court || nom,
      essence: extraireEssence(bloc),
      liens: [...refs].sort(),
    });
  }

  return idees;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ————————————————————————————————————————————————————————————————
// 2. Regroupement en archipels (un par thème principal) + ponts
// ————————————————————————————————————————————————————————————————

// Un archipel par thème principal distinct. Les idées sans thème forment
// l'archipel « À classer ». Ordre stable : par plus petit numéro d'idée présent
// dans l'archipel (ordre d'apparition au registre) ; idées triées par numéro.
export function grouperArchipels(idees) {
  const parCle = new Map();
  for (const idee of idees) {
    const cle = idee.themeKey || ' à classer';
    if (!parCle.has(cle)) parCle.set(cle, { key: cle, label: idee.themeLabel, idees: [] });
    parCle.get(cle).idees.push(idee);
  }
  const archipels = [...parCle.values()];
  for (const a of archipels) a.idees.sort((x, y) => x.num - y.num);
  archipels.sort((a, b) => Math.min(...a.idees.map((i) => i.num)) - Math.min(...b.idees.map((i) => i.num)));
  return archipels;
}

// Ponts = arêtes non orientées entre idées existantes qui se citent.
export function detecterPonts(idees) {
  const existants = new Set(idees.map((i) => i.id));
  const aretes = new Set();
  for (const idee of idees) {
    for (const cible of idee.liens) {
      if (!existants.has(cible) || cible === idee.id) continue;
      const [a, b] = [idee.id, cible].sort();
      aretes.add(`${a}|${b}`);
    }
  }
  return [...aretes].sort().map((s) => { const [a, b] = s.split('|'); return { a, b }; });
}

// ————————————————————————————————————————————————————————————————
// 3. Géométrie déterministe (fonctions pures — aucun aléa, aucune horloge)
// ————————————————————————————————————————————————————————————————

// Hash FNV-1a 32 bits stable → graine reproductible par ID d'idée.
function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Générateur pseudo-aléatoire LCG déterministe (graine → suite fixe).
function suiteLcg(graine) {
  let s = graine >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const f1 = (v) => Math.round(v * 10) / 10; // arrondi stable, sortie compacte

// Contour d'île organique mais DÉTERMINISTE (dérivé du hash de l'ID).
function cheminIle(cx, cy, rx, ry, graine) {
  const n = 11;
  const alea = suiteLcg(graine);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 0.82 + 0.26 * alea();
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return lisserFerme(pts);
}

// Spline fermée Catmull-Rom → cubiques de Bézier (tracé antique lisse).
function lisserFerme(p) {
  const n = p.length;
  let d = `M${f1(p[0][0])},${f1(p[0][1])} `;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${f1(c1x)},${f1(c1y)} ${f1(c2x)},${f1(c2y)} ${f1(p2[0])},${f1(p2[1])} `;
  }
  return d + 'Z';
}

// Bande de dessin des îles (sous les cartouches, au-dessus de la terre ferme).
const BANDE = { x: 70, y: 125, w: 860, h: 385 };

// Dispose les archipels en grille, chaque île à une position pure de son rang.
function disposer(archipels) {
  const positions = new Map();
  const cadres = [];
  const N = archipels.length;
  if (N === 0) return { positions, cadres };
  const archCols = Math.ceil(Math.sqrt(N));
  const archRows = Math.ceil(N / archCols);
  const cellW = BANDE.w / archCols;
  const cellH = BANDE.h / archRows;
  const labelH = 34;

  archipels.forEach((arc, ai) => {
    const col = ai % archCols, row = Math.floor(ai / archCols);
    const cellX = BANDE.x + col * cellW, cellY = BANDE.y + row * cellH;
    cadres.push({ label: arc.label, cx: cellX + cellW / 2, y: cellY + 20 });

    const k = arc.idees.length;
    const iCols = Math.ceil(Math.sqrt(k));
    const iRows = Math.ceil(k / iCols);
    const areaX = cellX, areaY = cellY + labelH, areaW = cellW, areaH = cellH - labelH;
    const subH = areaH / iRows;
    const rx = Math.max(Math.min(areaW / iCols / 2 - 14, 72), 40);
    const ry = Math.max(Math.min(subH / 2 - 16, 50), 30);

    arc.idees.forEach((idee, ii) => {
      const r = Math.floor(ii / iCols);
      const compteRangee = Math.min(iCols, k - r * iCols);
      const posDansRangee = ii - r * iCols;
      const cx = areaX + areaW * ((posDansRangee + 0.5) / compteRangee);
      const cy = areaY + subH * (r + 0.5);
      positions.set(idee.id, { cx, cy, rx, ry });
    });
  });
  return { positions, cadres };
}

// ————————————————————————————————————————————————————————————————
// 4. Rendu SVG + document HTML (registre antique réutilisé tel quel)
// ————————————————————————————————————————————————————————————————

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function rendreIle(idee, pos) {
  const { cx, cy, rx, ry } = pos;
  const graine = hash32(idee.id);
  const principal = cheminIle(cx, cy, rx, ry, graine);
  const halo = cheminIle(cx, cy, rx + 8, ry + 8, graine);
  const lignePart = idee.aPartenaire ? `${idee.id} · avec ${idee.partenaire}` : `${idee.id} · ${idee.statut}`;
  const tag = idee.themePrincipal ? cap(idee.themePrincipal) : 'à classer';
  return `      <g>
        <path d="${halo}" fill="none" stroke="var(--encre-claire)" stroke-width="0.6" opacity="0.7"/>
        <path d="${principal}" fill="var(--ile)" stroke="var(--encre)" stroke-width="1.6"/>
        <text x="${f1(cx)}" y="${f1(cy - 6)}" text-anchor="middle" font-size="17" letter-spacing="2" fill="var(--encre)" style="font-variant:small-caps">${esc(cap(idee.nom.toLowerCase()))}</text>
        <text x="${f1(cx)}" y="${f1(cy + 12)}" text-anchor="middle" font-size="10.5" letter-spacing="1.5" fill="var(--encre-pale)">${esc(lignePart)}</text>
        <text x="${f1(cx)}" y="${f1(cy + 28)}" text-anchor="middle" font-size="11" font-style="italic" fill="var(--encre-claire)">${esc(tag)}</text>
      </g>`;
}

function rendrePont(pont, positions) {
  const A = positions.get(pont.a), B = positions.get(pont.b);
  if (!A || !B) return '';
  const mx = (A.cx + B.cx) / 2, my = (A.cy + B.cy) / 2;
  const dx = B.cx - A.cx, dy = B.cy - A.cy;
  const len = Math.hypot(dx, dy) || 1;
  // Décalage perpendiculaire déterministe (signe = parité du hash de l'arête).
  const signe = (hash32(pont.a + pont.b) & 1) ? 1 : -1;
  const bomb = 0.16 * len * signe;
  const ctrlX = mx + (-dy / len) * bomb, ctrlY = my + (dx / len) * bomb;
  // Points d'accroche : bord des îles vers le contrôle (pas le centre).
  const ax = A.cx + (ctrlX - A.cx) / len * (A.rx * 0.9);
  const ay = A.cy + (ctrlY - A.cy) / len * (A.ry * 0.9);
  const bx = B.cx + (ctrlX - B.cx) / len * (B.rx * 0.9);
  const by = B.cy + (ctrlY - B.cy) / len * (B.ry * 0.9);
  return `        <path d="M${f1(ax)},${f1(ay)} Q${f1(ctrlX)},${f1(ctrlY)} ${f1(bx)},${f1(by)}"/>`;
}

function rendreAncrages(idees, positions) {
  const ancres = idees.filter((i) => i.aPartenaire && positions.has(i.id));
  if (ancres.length === 0) return { lignes: '', ports: '' };
  const lignes = [];
  const ports = [];
  ancres.forEach((idee, k) => {
    const p = positions.get(idee.id);
    // Port réparti sur la terre ferme, indépendant de la colonne de l'île.
    const px = ancres.length === 1 ? 500 : f1(150 + (700 * k) / (ancres.length - 1));
    const py = 560;
    const bx = f1(p.cx), by = f1(p.cy + p.ry);
    const c1y = f1(by + 40), c2y = f1(by + (py - by) * 0.55);
    lignes.push(`        <path d="M${bx},${by} C${bx},${c1y} ${px},${c2y} ${px},${f1(py)}"/>`);
    ports.push(`        <circle cx="${px}" cy="${f1(py)}" r="3"/>` +
      `<text x="${px}" y="${f1(py + 18)}" text-anchor="middle" font-size="10.5" letter-spacing="1.5">${esc(idee.partenaire.toUpperCase())}</text>`);
  });
  return { lignes: lignes.join('\n'), ports: ports.join('\n') };
}

function rendreSvg(idees, archipels, ponts) {
  const { positions, cadres } = disposer(archipels);

  const iles = archipels.flatMap((a) => a.idees).map((i) => rendreIle(i, positions.get(i.id))).join('\n');
  const labelsArch = cadres.map((c) =>
    `      <g>
        <text x="${f1(c.cx)}" y="${f1(c.y)}" text-anchor="middle" font-size="16" letter-spacing="5" fill="var(--encre)" style="font-variant:small-caps">${esc(c.label)}</text>
        <line x1="${f1(c.cx - 60)}" y1="${f1(c.y + 7)}" x2="${f1(c.cx + 60)}" y2="${f1(c.y + 7)}" stroke="var(--filet)" stroke-width="0.6"/>
      </g>`).join('\n');
  const routes = ponts.map((p) => rendrePont(p, positions)).filter(Boolean).join('\n');
  const ordreIles = archipels.flatMap((a) => a.idees);
  const { lignes: ancrLignes, ports } = rendreAncrages(ordreIles, positions);

  const N = idees.length;
  const statuts = [...new Set(idees.map((i) => i.statut))];
  const dates = idees.map((i) => i.captureLe).filter(Boolean).sort();
  const dateMax = dates.length ? dates[dates.length - 1] : '—';
  const echelle = statuts.length === 1
    ? `échelle : toutes en statut « ${statuts[0]} »`
    : `${N} idées · ${archipels.length} archipels`;

  const corpsIles = N === 0
    ? `      <text x="500" y="320" text-anchor="middle" font-size="18" font-style="italic" fill="var(--encre-pale)">L'archipel est encore une mer nue — aucune idée au registre.</text>`
    : `${labelsArch}
${iles}`;

  const blocRoutes = routes
    ? `      <!-- routes de synergie (pointillés de cire) -->
      <g fill="none" stroke="var(--cire)" stroke-width="1.4" stroke-dasharray="6 5">
${routes}
      </g>`
    : '';
  const blocAncrages = (ancrLignes || ports)
    ? `      <!-- ancrages au réseau TRAVELER -->
      <g fill="none" stroke="var(--encre-pale)" stroke-width="0.9">
${ancrLignes}
      </g>
      <g fill="var(--encre)">
${ports}
      </g>`
    : '';

  return `    <svg viewBox="0 0 1000 640" role="img" aria-label="Carte de l’archipel d’ADRAMELECH : ${N} îles d’idées regroupées en ${archipels.length} archipels par thème, reliées par des routes de synergie, au-dessus de la terre ferme de TRAVELER">
      <defs>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/>
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35 0 0 0 0 0.28 0 0 0 0 0.16 0 0 0 0.05 0"/>
          <feComposite operator="over" in2="SourceGraphic"/>
        </filter>
      </defs>

      <!-- fond marin + grain -->
      <rect width="1000" height="640" fill="var(--mer)"/>
      <rect width="1000" height="640" fill="transparent" filter="url(#grain)"/>

      <!-- filets de bordure gravée -->
      <rect x="10" y="10" width="980" height="620" fill="none" stroke="var(--encre-claire)" stroke-width="2"/>
      <rect x="18" y="18" width="964" height="604" fill="none" stroke="var(--filet)" stroke-width="0.8"/>

      <!-- lignes de rhumb depuis la rose des vents (haut) -->
      <g stroke="var(--filet)" stroke-width="0.5" opacity="0.45">
        <line x1="500" y1="70" x2="60" y2="520"/>
        <line x1="500" y1="70" x2="940" y2="520"/>
        <line x1="500" y1="70" x2="270" y2="540"/>
        <line x1="500" y1="70" x2="730" y2="540"/>
        <line x1="500" y1="70" x2="500" y2="540"/>
        <line x1="500" y1="70" x2="60" y2="300"/>
        <line x1="500" y1="70" x2="940" y2="300"/>
      </g>

      <!-- rose des vents -->
      <g transform="translate(500 70)" stroke="var(--encre-claire)" fill="var(--encre-claire)">
        <circle r="30" fill="none" stroke-width="1"/>
        <circle r="23" fill="none" stroke="var(--filet)" stroke-width="0.6"/>
        <path d="M0,-42 L5,-7 L0,0 L-5,-7 Z"/>
        <path d="M0,42 L5,7 L0,0 L-5,7 Z" fill="none" stroke-width="1"/>
        <path d="M-42,0 L-7,-5 L0,0 L-7,5 Z" fill="none" stroke-width="1"/>
        <path d="M42,0 L7,-5 L0,0 L7,5 Z" fill="none" stroke-width="1"/>
        <text y="-48" text-anchor="middle" font-size="13" stroke="none">N</text>
      </g>

${corpsIles}

${blocRoutes}

      <!-- terre ferme TRAVELER -->
      <path d="M-5,575 C120,552 240,592 380,570 C520,548 610,590 740,566 C850,546 930,570 1005,558 L1005,645 L-5,645 Z"
            fill="var(--ile)" stroke="var(--encre)" stroke-width="1.6"/>
      <g stroke="var(--encre-claire)" stroke-width="0.5" opacity="0.6">
        <line x1="30" y1="596" x2="90" y2="596"/><line x1="130" y1="604" x2="205" y2="604"/>
        <line x1="410" y1="598" x2="480" y2="598"/><line x1="560" y1="606" x2="640" y2="606"/>
        <line x1="800" y1="596" x2="880" y2="596"/>
      </g>
      <text x="500" y="626" text-anchor="middle" font-size="15" letter-spacing="6" fill="var(--encre)" style="font-variant:small-caps">Terre ferme de Traveler — le réseau</text>

${blocAncrages}

      <!-- cartouche titre -->
      <g>
        <rect x="34" y="32" width="330" height="62" fill="var(--parchemin)" stroke="var(--encre-claire)" stroke-width="1.2"/>
        <rect x="39" y="37" width="320" height="52" fill="none" stroke="var(--filet)" stroke-width="0.6"/>
        <text x="199" y="59" text-anchor="middle" font-size="16" letter-spacing="5" fill="var(--encre)" style="font-variant:small-caps">Archipel d’Adramelech</text>
        <text x="199" y="79" text-anchor="middle" font-size="10.5" font-style="italic" fill="var(--encre-pale)">${esc(N)} idée${N > 1 ? 's' : ''} · ${esc(archipels.length)} archipel${archipels.length > 1 ? 's' : ''} · relevé ${esc(dateMax)}</text>
      </g>

      <!-- cartouche légende -->
      <g>
        <rect x="636" y="32" width="330" height="74" fill="var(--parchemin)" stroke="var(--encre-claire)" stroke-width="1.2"/>
        <rect x="641" y="37" width="320" height="64" fill="none" stroke="var(--filet)" stroke-width="0.6"/>
        <line x1="654" y1="54" x2="700" y2="54" stroke="var(--cire)" stroke-width="1.4" stroke-dasharray="6 5"/>
        <text x="710" y="58" font-size="11" fill="var(--encre)">route de synergie entre idées</text>
        <line x1="654" y1="74" x2="700" y2="74" stroke="var(--encre-pale)" stroke-width="0.9"/>
        <text x="710" y="78" font-size="11" fill="var(--encre)">ancrage au réseau TRAVELER</text>
        <circle cx="677" cy="92" r="3" fill="var(--encre)"/>
        <text x="710" y="96" font-size="11" fill="var(--encre)">port d’attache (contact, acquis)</text>
      </g>

      <!-- échelle -->
      <g transform="translate(40 520)">
        <line x1="0" y1="0" x2="120" y2="0" stroke="var(--encre)" stroke-width="1"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--encre)" stroke-width="1"/>
        <line x1="60" y1="-3" x2="60" y2="3" stroke="var(--encre)" stroke-width="1"/>
        <line x1="120" y1="-4" x2="120" y2="4" stroke="var(--encre)" stroke-width="1"/>
        <text x="60" y="16" text-anchor="middle" font-size="10" font-style="italic" fill="var(--encre-pale)">${esc(echelle)}</text>
      </g>
    </svg>`;
}

function rendreReleve(idee, ponts, parId) {
  const synergies = ponts
    .filter((p) => p.a === idee.id || p.b === idee.id)
    .map((p) => (p.a === idee.id ? p.b : p.a))
    .map((cible) => parId.get(cible))
    .filter(Boolean)
    .map((autre) => autre.nom);
  const synTxt = synergies.length ? esc(synergies.join(', ')) : 'aucune route relevée';
  const part = idee.aPartenaire ? esc(idee.partenaire) : esc(idee.partenaire || '—');
  const themeAff = idee.themeRaw ? esc(idee.themeRaw) : 'à classer';
  return `    <article class="releve">
      <div class="ligne-haute"><span>${esc(cap(idee.type))} · ${esc(idee.themeLabel)}</span><span class="sceau">${esc(idee.statut)}</span></div>
      <h2>${esc(cap(idee.nom.toLowerCase()))}<span class="adr">${esc(idee.id)}</span></h2>
      <p class="epigraphe">${esc(idee.epigraphe)}</p>
      <p class="essence">${esc(idee.essence)}</p>
      <dl>
        <dt>Partenaire</dt><dd>${part}</dd>
        <dt>Thèmes</dt><dd>${themeAff}</dd>
        <dt>Synergies</dt><dd>${synTxt}</dd>
      </dl>
    </article>`;
}

// STYLE réutilisé tel quel du fichier de référence (registre antique,
// thèmes clair/sombre). On ne le refait pas — on branche la source.
const STYLE = `<style>
  :root {
    --parchemin: #efe3c8;
    --mer: #e6d5ae;
    --ile: #ecdfbe;
    --encre: #3b2b14;
    --encre-claire: #5a4118;
    --encre-pale: #8a7147;
    --cire: #8a3324;
    --filet: #a98e5f;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --parchemin: #201a10;
      --mer: #181307;
      --ile: #262013;
      --encre: #e6d7b4;
      --encre-claire: #c8b184;
      --encre-pale: #9c8a63;
      --cire: #d08060;
      --filet: #6a5a3a;
    }
  }
  :root[data-theme="dark"] {
    --parchemin: #201a10;
    --mer: #181307;
    --ile: #262013;
    --encre: #e6d7b4;
    --encre-claire: #c8b184;
    --encre-pale: #9c8a63;
    --cire: #d08060;
    --filet: #6a5a3a;
  }
  :root[data-theme="light"] {
    --parchemin: #efe3c8;
    --mer: #e6d5ae;
    --ile: #ecdfbe;
    --encre: #3b2b14;
    --encre-claire: #5a4118;
    --encre-pale: #8a7147;
    --cire: #8a3324;
    --filet: #a98e5f;
  }

  body {
    background: var(--parchemin);
    color: var(--encre);
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino,
      "Book Antiqua", Georgia, "Times New Roman", serif;
    line-height: 1.55;
    margin: 0;
    padding: 2.5rem 1.25rem 3.5rem;
  }
  .feuille {
    max-width: 1080px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
  }

  /* ——— En-tête en cartouche ——— */
  header.cartouche {
    border: 1px solid var(--encre-claire);
    outline: 1px solid var(--filet);
    outline-offset: 4px;
    padding: 1.6rem 2rem 1.4rem;
    text-align: center;
  }
  .surtitre {
    font-size: 0.78rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--encre-pale);
    margin: 0 0 0.55rem;
  }
  h1 {
    font-variant: small-caps;
    font-weight: 600;
    font-size: clamp(1.9rem, 4.5vw, 2.7rem);
    letter-spacing: 0.14em;
    margin: 0;
    text-wrap: balance;
  }
  .devise {
    font-style: italic;
    color: var(--encre-claire);
    margin: 0.6rem 0 0;
    font-size: 1.02rem;
  }

  /* ——— La carte ——— */
  figure.carte {
    margin: 0;
    border: 1px solid var(--encre-claire);
    outline: 1px solid var(--filet);
    outline-offset: 4px;
    overflow-x: auto;
    background: var(--mer);
  }
  figure.carte svg { display: block; width: 100%; height: auto; min-width: 640px; }
  figcaption {
    font-size: 0.85rem;
    font-style: italic;
    color: var(--encre-pale);
    padding: 0.55rem 1rem 0.65rem;
    border-top: 1px solid var(--filet);
    background: var(--parchemin);
  }

  /* ——— Cartouches de précision ——— */
  .releves {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
    gap: 1.4rem;
  }
  article.releve {
    border: 1px solid var(--encre-claire);
    box-shadow: inset 0 0 0 3px var(--parchemin), inset 0 0 0 4px var(--filet);
    background: var(--ile);
    padding: 1.35rem 1.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }
  .releve .ligne-haute {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    font-size: 0.74rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--encre-pale);
  }
  .sceau {
    color: var(--cire);
    border: 1px solid var(--cire);
    border-radius: 999px;
    padding: 0.1rem 0.65rem 0.14rem;
    letter-spacing: 0.18em;
    white-space: nowrap;
  }
  .releve h2 {
    font-variant: small-caps;
    font-weight: 600;
    letter-spacing: 0.12em;
    font-size: 1.45rem;
    margin: 0;
  }
  .releve h2 .adr { font-variant: normal; font-size: 0.8rem; letter-spacing: 0.2em; color: var(--encre-pale); margin-left: 0.6rem; }
  .epigraphe {
    font-style: italic;
    color: var(--encre-claire);
    font-size: 0.95rem;
    margin: 0;
  }
  .releve p.essence { margin: 0.15rem 0 0; max-width: 62ch; }
  .releve dl {
    margin: 0.5rem 0 0;
    border-top: 1px solid var(--filet);
    padding-top: 0.7rem;
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 1rem;
    row-gap: 0.3rem;
    font-size: 0.92rem;
  }
  .releve dt {
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--encre-pale);
    padding-top: 0.15rem;
  }
  .releve dd { margin: 0; }

  footer.colophon {
    text-align: center;
    font-size: 0.88rem;
    font-style: italic;
    color: var(--encre-pale);
    border-top: 1px solid var(--filet);
    padding-top: 1.1rem;
  }
</style>`;

// Assemble le document complet, de façon déterministe.
export function genererDocument(markdown) {
  const idees = parseRegistre(markdown);
  const archipels = grouperArchipels(idees);
  const ponts = detecterPonts(idees);
  const parId = new Map(idees.map((i) => [i.id, i]));

  const N = idees.length;
  const dates = idees.map((i) => i.captureLe).filter(Boolean).sort();
  const dateMax = dates.length ? dates[dates.length - 1] : '—';
  const devise = N === 0
    ? 'Aucune idée levée à ce jour — le registre attend la première dictée.'
    : `Carte des idées de Paul — ${N} île${N > 1 ? 's' : ''} reconnue${N > 1 ? 's' : ''}, aucune perdue · relevée le ${dateMax}`;

  const svg = rendreSvg(idees, archipels, ponts);
  const releves = archipels.flatMap((a) => a.idees).map((i) => rendreReleve(i, ponts, parId)).join('\n\n');

  const blocReleves = N === 0 ? '' : `
  <section class="releves" aria-label="Relevés de précision, une entrée par idée">
${releves}
  </section>
`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>ADRAMELECH — Carte des idées</title>
</head>
<body>
${STYLE}

<div class="feuille">
  <header class="cartouche">
    <p class="surtitre">Ultima · Quadrant des idées</p>
    <h1>Archipel d’Adramelech</h1>
    <p class="devise">${esc(devise)}</p>
  </header>

  <figure class="carte">
${svg}
    <figcaption>Les routes en pointillé de cire relient les idées qui se nourrissent l’une l’autre ; les traits fins descendent vers l’acquis du réseau. Carte générée depuis le registre <code>adramelech/IDEES.md</code> par <code>generer-carto.mjs</code> — ${esc(N)} idée${N > 1 ? 's' : ''}, ${esc(archipels.length)} archipel${archipels.length > 1 ? 's' : ''}, aucune perdue.</figcaption>
  </figure>
${blocReleves}
  <footer class="colophon">
    Cap du quadrant : ne jamais rater une idée — capturer, classer, rapprocher, enrichir.<br>
    Rendu déterministe du registre <code>adramelech/IDEES.md</code> ; cette carte se relève à chaque idée nouvelle.
  </footer>
</div>
</body>
</html>
`;
}

// ————————————————————————————————————————————————————————————————
// 5. Exécution directe : lit IDEES.md, écrit carto-idees.html
// ————————————————————————————————————————————————————————————————

function estExecuteDirectement() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (estExecuteDirectement()) {
  const ici = fileURLToPath(new URL('.', import.meta.url));
  const source = `${ici}IDEES.md`;
  const cible = `${ici}carto-idees.html`;
  try {
    const md = readFileSync(source, 'utf8');
    const html = genererDocument(md);
    writeFileSync(cible, html);
    const idees = parseRegistre(md);
    const archipels = grouperArchipels(idees);
    process.stdout.write(
      `carto-idees.html régénérée : ${idees.length} idées, ${archipels.length} archipels ` +
      `(${archipels.map((a) => `${a.label}×${a.idees.length}`).join(', ')}), ` +
      `${detecterPonts(idees).length} ponts.\n`);
  } catch (e) {
    process.stderr.write(`ÉCHEC génération carto ADRAMELECH : ${e.message}\n`);
    process.exit(1);
  }
}
