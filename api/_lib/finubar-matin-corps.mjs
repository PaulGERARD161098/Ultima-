// La COMPOSITION du mail du matin — pure, sans I/O, donc éprouvable sous Node.
//
// Elle vit ici et non dans la route pour la raison qui vaut pour tout `_lib/` :
// ce qui décide de ce que Paul va LIRE doit pouvoir être mis en défaut par un
// harnais, sans clé, sans réseau et sans Vercel.
//
// ⛔ TROIS RÈGLES, et la première est la raison d'être de ce fichier.
//
// 1. LE MAIL DIT DE QUAND IL DATE. L'agrégat est figé au dernier commit de
//    `finubar/collecter.mjs` : un digest QUOTIDIEN posé sur une donnée qui ne
//    bouge que les jours de séance vieillit en silence, et finit par annoncer
//    chaque matin un état d'il y a trois semaines — exactement ce que Finubar
//    existe pour empêcher. L'âge est donc affiché EN TÊTE, et au-delà d'un
//    seuil il devient un avertissement, pas une mention.
// 2. AUCUNE ADRESSE, AUCUNE URL EN DUR. Le destinataire vient d'une variable
//    d'environnement (pas de PII dans le dépôt) et le lien se déduit de
//    l'environnement Vercel.
// 3. TOUT CE QUI VIENT DU GRAIN EST ÉCHAPPÉ. Les grains sont des fichiers
//    markdown écrits à la main : entrée externe, hostile par défaut. Un `<` non
//    échappé dans une prochaine action casserait le mail au mieux, injecterait
//    au pire.

// Au-delà de ce nombre de jours, l'âge de l'état cesse d'être une mention et
// devient un avertissement. Deux jours : un état de vendredi lu le lundi matin
// est encore utile, celui de la semaine dernière ne l'est plus.
export const JOURS_AVANT_ALERTE = 2;

// Combien de gestes le mail ÉNUMÈRE avant de compter le reste. Posé le
// 2026-09-06, dans la foulée du même constat de Paul sur l'écran (« c'est trop
// long ») : au 6 septembre il y avait SEIZE gestes en attente, et seize lignes
// dans un mail du matin ne se lisent pas — elles se scrollent, puis le mail
// se range sans être lu, et le dispositif entier ne sert plus à rien.
// Le mail MONTRE ce qui appelle et COMPTE le reste ; la table de marche porte
// le détail, elle est à un clic.
export const GESTES_ENUMERES = 5;

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Différence en jours pleins entre deux dates AAAA-MM-JJ. Rend null si la date
// de collecte est absente ou illisible — on préfère taire l'âge que l'inventer.
export function ageEnJours(collecteLe, aujourdhui) {
  if (typeof collecteLe !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(collecteLe)) return null;
  if (typeof aujourdhui !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(aujourdhui)) return null;
  const a = Date.UTC(...collecteLe.split('-').map(Number).map((v, i) => (i === 1 ? v - 1 : v)));
  const b = Date.UTC(...aujourdhui.split('-').map(Number).map((v, i) => (i === 1 ? v - 1 : v)));
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

export function phraseDate(collecteLe, jours) {
  if (jours === null) return 'État de collecte non daté.';
  if (jours <= 0) return `État collecté ce matin (${collecteLe}).`;
  if (jours === 1) return `État collecté hier (${collecteLe}).`;
  return `État collecté le ${collecteLe}, il y a ${jours} jours.`;
}

/**
 * Compose le mail du matin à partir de l'agrégat Finubar.
 * @param {object} agregat  { le, macro, cartouche, projets }
 * @param {object} options  { aujourdhui: 'AAAA-MM-JJ', lien: 'https://…' }
 * @returns {{ sujet: string, texte: string, html: string, jours: number|null }}
 */
export function composerMatin(agregat, options = {}) {
  const a = (agregat && typeof agregat === 'object') ? agregat : {};
  const macro = (a.macro && typeof a.macro === 'object') ? a.macro : {};
  const cart = (a.cartouche && typeof a.cartouche === 'object') ? a.cartouche : {};
  const signaux = Array.isArray(cart.signaux) ? cart.signaux : [];
  const action = (cart.action && typeof cart.action === 'object') ? cart.action : null;
  const gestes = Array.isArray(macro.gestes_de_paul) ? macro.gestes_de_paul : [];
  const lien = typeof options.lien === 'string' ? options.lien : '';
  const reste = Math.max(0, gestes.length - GESTES_ENUMERES);

  const jours = ageEnJours(a.le, options.aujourdhui);
  const perime = jours !== null && jours > JOURS_AVANT_ALERTE;

  // Le sujet dit le FAIT le plus actionnable, pas « votre digest du jour ».
  // Un sujet générique se lit une semaine puis se range sans être ouvert.
  const enAttente = Number.isInteger(macro.en_attente_de_paul) ? macro.en_attente_de_paul : 0;
  const sujet = enAttente > 0
    ? `FINUBAR — ${enAttente} dépôt${enAttente > 1 ? 's' : ''} attend${enAttente > 1 ? 'ent' : ''} un geste de toi`
    : 'FINUBAR — rien ne bloque ce matin';

  const dateDite = phraseDate(a.le, jours);
  // ⛔ « ÉTAT COLLECTÉ CE MATIN » NE VAUT PAS POUR TOUT LE MONDE. Depuis le
  // 07/09, un dépôt absent du disque garde sa dernière mesure au lieu d'être
  // effacé — c'est ce qui rend la collecte de fin de séance possible. Mais dire
  // la seule date de collecte laisserait croire que les huit ont été rouverts
  // ce matin, alors que la moitié peut dater d'avant.
  //
  // C'était la cause n°1 du pre-mortem de cette boucle : en réparant la perte
  // de grains, on risquait de la remplacer par un mensonge tranquille — pire,
  // parce qu'invisible. Le mail dit donc combien de dépôts n'ont pas été
  // rouverts. Une phrase, et l'état cesse de se faire passer pour frais.
  const repris = Number.isInteger(macro.repris) ? macro.repris : 0;
  const ditRepris = repris > 0
    // Apostrophe TYPOGRAPHIQUE, comme partout ailleurs dans ce fichier : un
    // mail dont la ponctuation change d'un paragraphe à l'autre se lit comme un
    // assemblage, pas comme une voix.
    ? `${repris} dépôt${repris > 1 ? 's' : ''} n${repris > 1 ? '’ont' : '’a'} pas été rouvert${repris > 1 ? 's' : ''} : `
      + `${repris > 1 ? 'leur état est celui de leur' : 'son état est celui de sa'} dernière mesure.`
    : '';
  const avertissement = perime
    ? `⚠️ Cet état a ${jours} jours : il est figé au dernier commit de la collecte. `
      + 'Relance `node finubar/collecter.mjs` puis commite pour le rafraîchir.'
    : '';

  // ---------- version texte (celle qui compte : elle se lit partout) ----------
  const lignes = [];
  lignes.push(sujet, '');
  lignes.push(dateDite);
  if (ditRepris) lignes.push(ditRepris);
  if (avertissement) lignes.push('', avertissement);
  lignes.push('');

  if (signaux.length) {
    lignes.push('CE QUI APPELLE');
    signaux.forEach((s) => lignes.push(`  · ${s && s.projet ? s.projet : '?'} — ${s && s.dit ? s.dit : ''}`));
    lignes.push('');
  } else {
    lignes.push('Rien n’appelle : les huit dépôts sont à jour.', '');
  }

  if (action && action.faire) {
    lignes.push(action.nature === 'geste' ? 'LA PROCHAINE ACTION — un geste de toi' : 'LA PROCHAINE ACTION');
    lignes.push(`  ${action.projet || '?'} — ${action.faire}`);
    if (action.cap) lignes.push(`  Pourquoi : ${action.cap}`);
    lignes.push('');
  }

  if (gestes.length) {
    lignes.push(`CE QUI N’ATTEND QUE TOI (${gestes.length})`);
    gestes.slice(0, GESTES_ENUMERES).forEach((g) =>
      lignes.push(`  · ${g && g.projet ? g.projet : '?'} — ${g && g.geste ? g.geste : ''}`));
    if (reste > 0) lignes.push(`  … et ${reste} autre${reste > 1 ? 's' : ''}, sur la table de marche.`);
    lignes.push('');
  }

  lignes.push(`${macro.total ?? '?'} dépôts · ${macro.en_cours ?? 0} en cours · `
    + `${enAttente} en attente d’un geste · ${macro.au_repos ?? 0} au repos · `
    + `${macro.boucles_ouvertes ?? 0} boucle(s) ouverte(s).`);
  if (lien) lignes.push('', `La table de marche : ${lien}`);

  // ---------- version HTML (même contenu, registre du site) ----------
  const li = (items) => items.map((t) => `<li style="margin:0 0 6px">${t}</li>`).join('');
  const html = `
<div style="max-width:620px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#3b2f1c;background:#f6eed9;padding:24px">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6a5636">Ultima · Finubar</p>
  <h1 style="margin:0 0 14px;font-size:22px;font-weight:normal">${esc(sujet)}</h1>
  <p style="margin:0 0 ${avertissement || ditRepris ? '6' : '18'}px;font-size:13px;color:#6a5636">${esc(dateDite)}</p>
  ${ditRepris ? `<p style="margin:0 0 ${avertissement ? '6' : '18'}px;font-size:13px;color:#6a5636">${esc(ditRepris)}</p>` : ''}
  ${avertissement ? `<p style="margin:0 0 18px;padding:10px 12px;border-left:3px solid #8a3324;background:#efe3c6;font-size:13px">${esc(avertissement)}</p>` : ''}
  ${signaux.length ? `
  <h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#6a5636;margin:0 0 8px">Ce qui appelle</h2>
  <ul style="margin:0 0 20px;padding-left:18px">${li(signaux.map((s) =>
    `<strong>${esc(s && s.projet)}</strong> — ${esc(s && s.dit)}`))}</ul>`
    : '<p style="margin:0 0 20px">Rien n’appelle : les huit dépôts sont à jour.</p>'}
  ${action && action.faire ? `
  <div style="margin:0 0 20px;padding:12px 14px;background:#efe3c6;border:1px solid #a9884a">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6a5636">
      ${action.nature === 'geste' ? 'La prochaine action — un geste de toi' : 'La prochaine action'}</p>
    <p style="margin:0;font-size:15px"><strong>${esc(action.projet)}</strong> — ${esc(action.faire)}</p>
    ${action.cap ? `<p style="margin:6px 0 0;font-size:13px;color:#6a5636">Pourquoi : ${esc(action.cap)}</p>` : ''}
  </div>` : ''}
  ${gestes.length ? `
  <h2 style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#6a5636;margin:0 0 8px">
    Ce qui n’attend que toi (${gestes.length})</h2>
  <ul style="margin:0 0 ${reste ? '6' : '20'}px;padding-left:18px">${li(gestes.slice(0, GESTES_ENUMERES).map((g) =>
    `<strong>${esc(g && g.projet)}</strong> — ${esc(g && g.geste)}`))}</ul>
  ${reste ? `<p style="margin:0 0 20px;font-size:13px;color:#6a5636">… et ${reste} autre${reste > 1 ? 's' : ''}, sur la table de marche.</p>` : ''}` : ''}
  <p style="margin:0;padding-top:14px;border-top:1px solid #a9884a;font-size:12px;color:#6a5636">
    ${esc(String(macro.total ?? '?'))} dépôts · ${esc(String(macro.en_cours ?? 0))} en cours ·
    ${esc(String(enAttente))} en attente d’un geste · ${esc(String(macro.au_repos ?? 0))} au repos ·
    ${esc(String(macro.boucles_ouvertes ?? 0))} boucle(s) ouverte(s).
    ${lien ? `<br><a href="${esc(lien)}" style="color:#8a3324">Ouvrir la table de marche</a>` : ''}
  </p>
</div>`;

  return { sujet, texte: lignes.join('\n'), html, jours };
}
