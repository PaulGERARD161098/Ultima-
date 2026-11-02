#!/usr/bin/env node
// ZOH SHIA — LE GÉNÉRATEUR DE DEVIS (deuxième étoile, Paul, 08/10/2026).
//
// Un fichier de paramètres (JSON, HORS du dépôt) + `gabarit.html` → un devis PDF,
// dans la forme exacte des factures de Paul. La techno ne porte AUCUNE valeur :
// émetteur, client, IBAN, logo, montants arrivent tous par les paramètres.
//
// Les réponses au pre-mortem :
//   · UN MONTANT FAUX D'UN CENTIME → tout se calcule en CENTIMES entiers, arrondi
//     au demi supérieur, jamais en flottant ; testé (tests/unit-zohshia-devis.mjs).
//   · UN CHAMP INJECTE DU HTML DANS LE PDF → chaque valeur est échappée avant
//     d'entrer dans le gabarit ; testé avec une balise script.
//   · UN DEVIS PART AVEC UN TROU → un champ obligatoire vide, un montant mal formé,
//     un {{CHAMP}} non résolu : refus, rien n'est écrit.
//   · LE RENDU DÉPEND D'UN FICHIER DISPARU → logo et polices sont embarqués dans
//     le HTML (data:) ; le PDF ne pointe vers rien.
//
// Usage :
//   node zohshia/devis/generer.mjs --parametres <devis.json> --sortie <dossier> [--html-seulement]
// Navigateur : variable ZOH_CHROMIUM, sinon le Chromium de Playwright, sinon `chromium`.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ICI = dirname(fileURLToPath(import.meta.url));
export const GABARIT = join(ICI, 'gabarit.html');

export class ErreurDevis extends Error {}

// ── Montants : centimes entiers, jamais de flottant ──────────────────────────
export function centimes(texte, champ) {
  const s = String(texte ?? '').trim().replace(',', '.');
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(s)) throw new ErreurDevis(`${champ} : montant mal formé (« ${texte} »)`);
  const [e, d = ''] = s.split('.');
  return Number(e) * 100 + Number((d + '00').slice(0, 2));
}
// Un taux en pourcentage (« 20 », « 5,5 ») en points de base : 20 % → 2000.
export function pointsDeBase(texte, champ) {
  const s = String(texte ?? '').trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) throw new ErreurDevis(`${champ} : taux mal formé (« ${texte} »)`);
  const bp = Math.round(Number(s) * 100);
  if (bp < 0 || bp > 10000) throw new ErreurDevis(`${champ} : taux hors de 0–100 %`);
  return bp;
}
// a × bp / 10 000, arrondi au demi supérieur, en entiers.
export const appliquer = (c, bp) => Math.floor((c * bp + 5000) / 10000);

export function euros(c) {
  const e = Math.floor(c / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${e},${String(c % 100).padStart(2, '0')} €`;
}
const taux = (bp) => `${(bp / 100).toString().replace('.', ',')}%`;

export function montants(p) {
  const tvaBp = pointsDeBase(p.taux_tva, 'taux_tva');
  const acBp = pointsDeBase(p.acompte_pct, 'acompte_pct');
  if (!Array.isArray(p.lignes) || !p.lignes.length) throw new ErreurDevis('lignes : au moins une ligne');
  const lignes = p.lignes.map((l, i) => {
    const q = Number(l.quantite);
    if (!Number.isInteger(q) || q < 1 || q > 10000) throw new ErreurDevis(`lignes[${i}].quantite : entier de 1 à 10 000`);
    const pu = centimes(l.pu_ht, `lignes[${i}].pu_ht`);
    const ht = pu * q;
    return { ...l, q, pu, ht, ttc: ht + appliquer(ht, tvaBp) };
  });
  const ht = lignes.reduce((s, l) => s + l.ht, 0);
  const tva = appliquer(ht, tvaBp);
  const ttc = ht + tva;
  const acompte = appliquer(ttc, acBp);
  return { tvaBp, acBp, lignes, ht, tva, ttc, acompte, solde: ttc - acompte };
}

// ── Entrées hostiles par défaut ──────────────────────────────────────────────
export const echapper = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function texte(o, chemin, { requis = true, max = 200 } = {}) {
  const v = chemin.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
  if (v == null || String(v).trim() === '') {
    if (requis) throw new ErreurDevis(`${chemin} : obligatoire`);
    return '';
  }
  const s = String(v).trim();
  if (s.length > max) throw new ErreurDevis(`${chemin} : ${max} caractères au plus`);
  return s;
}

export function valider(p) {
  if (!p || typeof p !== 'object') throw new ErreurDevis('paramètres : objet JSON attendu');
  const numero = texte(p, 'numero', { max: 30 });
  if (!/^[A-Za-z0-9-]+$/.test(numero)) throw new ErreurDevis('numero : lettres, chiffres et tirets seulement');
  const iban = texte(p, 'emetteur.iban', { max: 42 }).replace(/\s+/g, '');
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) throw new ErreurDevis('emetteur.iban : format IBAN attendu');
  for (const c of ['date_emission', 'date_validite', 'emetteur.nom', 'emetteur.adresse', 'emetteur.ville',
    'emetteur.mentions_legales', 'emetteur.bic', 'client.nom', 'client.adresse', 'client.ville']) {
    texte(p, c, { max: c === 'emetteur.mentions_legales' ? 400 : 200 });
  }
  p.lignes?.forEach((_, i) => texte(p, `lignes.${i}.libelle`));
  return { numero, iban };
}

// ── Polices et logo, embarqués ───────────────────────────────────────────────
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
function enDonnee(chemin) {
  const type = MIME[extname(chemin).toLowerCase()];
  if (!type) throw new ErreurDevis(`${chemin} : type de fichier non pris en charge`);
  if (!existsSync(chemin)) throw new ErreurDevis(`${chemin} : introuvable`);
  return `data:${type};base64,${readFileSync(chemin).toString('base64')}`;
}
function policesCss(dossier) {
  if (!dossier) return '';
  return [[400, 'poppins-latin-400-normal.woff2'], [500, 'poppins-latin-500-normal.woff2']]
    .filter(([, f]) => existsSync(join(dossier, f)))
    .map(([w, f]) => `@font-face { font-family: "Poppins"; font-weight: ${w}; src: url(${enDonnee(join(dossier, f))}); }`)
    .join('\n  ');
}

// ── Le gabarit rempli ────────────────────────────────────────────────────────
export function remplir(p, { base = process.cwd(), gabarit = readFileSync(GABARIT, 'utf8') } = {}) {
  const { numero, iban } = valider(p);
  const m = montants(p);
  const E = (v) => echapper(v ?? '');
  const lignes = m.lignes.map((l) => `    <tr>
      <td>${E(l.libelle)}</td>
      <td>${E(`${l.q} ${l.unite || 'unité'}`)}</td>
      <td>${euros(l.pu)}</td>
      <td>${taux(m.tvaBp)}</td>
      <td>${euros(l.ht)}</td>
      <td>${euros(l.ttc)}</td>
    </tr>${l.detail ? `\n    <tr><td class="detail" colspan="6">${E(l.detail)}</td></tr>` : ''}`).join('\n');
  const logo = p.emetteur.logo ? `<img src="${enDonnee(resolve(base, p.emetteur.logo))}" alt="">` : '';
  const conditions = (Array.isArray(p.conditions) ? p.conditions : []).map((c, i) => {
    const t = texte({ c }, 'c', { max: 400 });
    if (!/^[^:]{1,60} : /.test(t)) throw new ErreurDevis(`conditions[${i}] : forme « Titre : texte » attendue`);
    const [titre, ...reste] = t.split(' : ');
    return `  <b>${E(titre)}</b> : ${E(reste.join(' : '))}<br>`;
  }).join('\n');
  const champs = {
    POLICES_CSS: policesCss(p.polices ? resolve(base, p.polices) : ''),
    LOGO: logo, NUMERO: E(numero), REF_PAIEMENT: E(numero),
    DATE_EMISSION: E(p.date_emission), DATE_VALIDITE: E(p.date_validite),
    TYPE_VENTE: E(p.type_vente || 'Prestations de services'),
    EMETTEUR_NOM: E(p.emetteur.nom), EMETTEUR_ADRESSE: E(p.emetteur.adresse), EMETTEUR_VILLE: E(p.emetteur.ville),
    MENTIONS_LEGALES: E(p.emetteur.mentions_legales), MOYEN_PAIEMENT: E(p.moyen_paiement || 'Virement'),
    IBAN: E(iban), BIC: E(p.emetteur.bic),
    CLIENT_NOM: E(p.client.nom), CLIENT_SIREN: E(p.client.siren || ''),
    CLIENT_ADRESSE: E(p.client.adresse), CLIENT_VILLE: E(p.client.ville),
    CLIENT_TVA_LIGNE: p.client.tva ? `        <div class="l2">N° de TVA ${E(p.client.tva)}</div>\n` : '',
    LIGNES: lignes, TAUX_TVA: taux(m.tvaBp), ACOMPTE_PCT: (m.acBp / 100).toString().replace('.', ','),
    TOTAL_HT: euros(m.ht), TOTAL_TVA: euros(m.tva), TOTAL_TTC: euros(m.ttc),
    ACOMPTE: euros(m.acompte), SOLDE: euros(m.solde), CONDITIONS: conditions,
  };
  // Un seul passage : une valeur qui contiendrait « {{X}} » n'est jamais relue.
  const html = gabarit.replace(/\{\{([A-Z_]+)\}\}/g, (tout, k) => {
    if (!(k in champs)) throw new ErreurDevis(`gabarit : champ {{${k}}} sans valeur`);
    return champs[k];
  });
  return { html, montants: m, numero };
}

// ── Le rendu PDF ─────────────────────────────────────────────────────────────
export function trouverChromium() {
  if (process.env.ZOH_CHROMIUM) return process.env.ZOH_CHROMIUM;
  const pw = '/opt/pw-browsers';
  if (existsSync(pw)) {
    const d = readdirSync(pw).filter((n) => /^chromium-\d+$/.test(n)).sort().pop();
    if (d && existsSync(join(pw, d, 'chrome-linux', 'chrome'))) return join(pw, d, 'chrome-linux', 'chrome');
  }
  return 'chromium';
}

function imprimer(htmlChemin, pdfChemin) {
  const r = spawnSync(trouverChromium(), ['--headless', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer',
    `--print-to-pdf=${pdfChemin}`, pathToFileURL(htmlChemin).href], { encoding: 'utf8', timeout: 120000 });
  if (r.error || r.status !== 0 || !existsSync(pdfChemin)) {
    throw new ErreurDevis(`rendu PDF impossible (${r.error?.code || `code ${r.status}`}) — le HTML est conservé`);
  }
}

function argument(nom) {
  const i = process.argv.indexOf(nom);
  return i > -1 ? process.argv[i + 1] : undefined;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  try {
    const fichier = argument('--parametres');
    const sortie = argument('--sortie');
    if (!fichier || !sortie) throw new ErreurDevis('usage : --parametres <devis.json> --sortie <dossier> [--html-seulement]');
    const p = JSON.parse(readFileSync(fichier, 'utf8'));
    const { html, montants: m, numero } = remplir(p, { base: dirname(resolve(fichier)) });
    mkdirSync(sortie, { recursive: true });
    const nom = `Devis-${numero}`;
    const htmlChemin = join(resolve(sortie), `${nom}.html`);
    writeFileSync(htmlChemin, html);
    if (!process.argv.includes('--html-seulement')) imprimer(htmlChemin, join(resolve(sortie), `${nom}.pdf`));
    console.log(`✓ ${nom} | HT ${euros(m.ht)} | TVA ${euros(m.tva)} | TTC ${euros(m.ttc)} | acompte ${euros(m.acompte)} | solde ${euros(m.solde)}`);
  } catch (e) {
    console.error(`✗ ${e instanceof ErreurDevis || e instanceof SyntaxError ? e.message : 'erreur inattendue'}`);
    process.exit(1);
  }
}
