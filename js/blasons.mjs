// Ultima Lv3 — CATALOGUE DES GRAVURES (blasons de cap + cœurs de boussole).
// ---------------------------------------------------------------------------
// Module ES PUR : que des chaînes SVG statiques, aucune I/O, aucun DOM, aucune
// donnée. C'est la bibliothèque d'emblèmes du registre antique d'Ultima —
// disque parchemin, cerne d'or, emblème encre pour les caps ; médaillon d'or
// gravé pour le cœur des boussoles.
//
// Toutes ces gravures PRÉEXISTAIENT dans le produit (js/boussole.js — supprimé en L2,
// js/imladrik-carto.js, ultima.html, tao.html) : ce fichier les rassemble en un
// seul endroit pour que le noyau (js/boussole-noyau.mjs) puisse rendre
// n'importe quel nœud sans qu'aucune page ne porte de SVG de cap.
// Cadrage : CADRAGE-LV3.md §2 et §5.
//
// Contrat : le contenu est STATIQUE et défini ici → insertion en innerHTML sûre
// (aucune donnée utilisateur ne transite jamais par ce module).

// ---------- Fabriques communes ----------

// Disque de cap : parchemin cerné d'or, emblème à l'encre. `label` alimente
// l'aria-label (lecture d'écran) — c'est le seul texte de la gravure.
function disque(interieur, label) {
  return '<svg class="cap-blason-svg" viewBox="0 0 72 72" role="img" '
    + 'aria-label="Blason gravé : ' + label + '" focusable="false">'
    + '<circle cx="36" cy="36" r="33" fill="#f9f1dc" stroke="#a9884a" stroke-width="2.4"/>'
    + '<circle cx="36" cy="36" r="28.5" fill="none" stroke="#5a4118" stroke-width="1"/>'
    + interieur + '</svg>';
}

// Médaillon de cœur : or bruni, anneau de clous cardinaux. `cle` rend l'id du
// dégradé unique (une page peut porter plusieurs SVG ; jamais deux mêmes ids).
function medaillon(cle, interieur) {
  const or = 'or-' + cle;
  return '<svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">'
    + '<defs><radialGradient id="' + or + '" cx="38%" cy="32%" r="78%">'
    + '<stop offset="0" stop-color="#f4e6bd"/>'
    + '<stop offset="55%" stop-color="#e3cd93"/>'
    + '<stop offset="100%" stop-color="#cbab63"/></radialGradient></defs>'
    + '<circle cx="60" cy="60" r="55" fill="url(#' + or + ')" stroke="#6e5320" stroke-width="2.6"/>'
    + '<circle cx="60" cy="60" r="49" fill="none" stroke="#6e5320" stroke-width="1" opacity="0.7"/>'
    + '<circle cx="60" cy="60" r="45" fill="none" stroke="#a9884a" stroke-width="0.8"/>'
    + '<g fill="#6e5320">'
    + '<circle cx="60" cy="8.5" r="1.7"/><circle cx="60" cy="111.5" r="1.7"/>'
    + '<circle cx="8.5" cy="60" r="1.7"/><circle cx="111.5" cy="60" r="1.7"/></g>'
    + interieur + '</svg>';
}

// Aile plumée (tournée à droite) — le doublet TAO : RESHIRAM blanche,
// ZEKROM noire en miroir.
function aile(remplissage) {
  return '<g stroke="#3b2f1c" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">'
    + '<path d="M23 49 C 23 40, 25 32, 33 27 C 40 22, 48 22, 54 23'
    + ' C 49 26, 47 29, 47.5 32 C 44 30, 41 31, 40 34'
    + ' C 43 34, 45 36, 45 39 C 41 37, 38 38, 37 41'
    + ' C 40 41, 42 43, 42 45 C 37 44, 30 47, 23 49 Z" fill="' + remplissage + '"/>'
    + '</g>'
    + '<path d="M27 46 C 31 35, 40 28, 51 25" stroke="#a9884a" stroke-width="0.7" fill="none" opacity="0.6"/>';
}

// L'épée au soleil (sigle IMLADRIK, figé par Paul le 2026-07-17).
const EPEE_SOLEIL =
  '<g fill="none" stroke="#3b2f1c" stroke-width="1.6">'
  + '<circle cx="36" cy="29" r="9.5"/>'
  + '<path d="M20.5 29 H 24.5"/><path d="M47.5 29 H 51.5"/>'
  + '<path d="M25.2 18.2 l 2.9 2.9"/><path d="M43.9 36.9 l 2.9 2.9"/>'
  + '<path d="M46.8 18.2 l -2.9 2.9"/><path d="M28.1 36.9 l -2.9 2.9"/></g>'
  + '<circle cx="36" cy="29" r="6.5" fill="none" stroke="#e0c48a" stroke-width="0.8" opacity="0.7"/>'
  + '<g fill="#3b2f1c">'
  + '<path d="M36 11.5 L38.2 16.5 L38.2 48 L33.8 48 L33.8 16.5 Z"/>'
  + '<rect x="26.5" y="48" width="19" height="3.4" rx="1.7"/>'
  + '<rect x="34.2" y="51.4" width="3.6" height="7"/>'
  + '<circle cx="36" cy="61" r="2.9"/></g>'
  + '<path d="M36 15.5 V 46.5" stroke="#e0c48a" stroke-width="0.8" opacity="0.7"/>';

// ---------- Blasons de cap ----------

export const BLASONS = {
  // — Rose des vents : la maison Ultima (supra-division personnelle).
  rose: disque(
    '<path d="M36 12 L40.5 31.5 L60 36 L40.5 40.5 L36 60 L31.5 40.5 L12 36 L31.5 31.5 Z" fill="#3b2f1c"/>'
    + '<path d="M36 18 L38.5 33.5 L54 36 L38.5 38.5 L36 54 L33.5 38.5 L18 36 L33.5 33.5 Z" fill="#a9884a" opacity="0.55"/>'
    + '<circle cx="36" cy="36" r="2.4" fill="#f9f1dc" stroke="#5a4118" stroke-width="1"/>',
    'la rose des vents d’Ultima'),

  // — Alpha : la capitale grecque sur son stylobate (supra-division pro).
  alpha: disque(
    '<g fill="none" stroke="#3b2f1c" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M23 50 L 36 18 L 49 50"/><path d="M28.5 39 H 43.5"/></g>'
    + '<path d="M18 56 H 54" stroke="#a9884a" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>'
    + '<path d="M22 20 q 14 -7 28 0" fill="none" stroke="#a9884a" stroke-width="1.1" opacity="0.6"/>',
    'la capitale alpha gravée'),

  // — Les quatre quadrants (gravures d'ultima.html).
  riven: disque(
    '<path d="M36 12 L40.5 31.5 L60 36 L40.5 40.5 L36 60 L31.5 40.5 L12 36 L31.5 31.5 Z" fill="#3b2f1c"/>'
    + '<g stroke="#5a4118" stroke-width="1.3" stroke-linecap="round">'
    + '<path d="M36 36 L50 22 M36 36 L50 50 M36 36 L22 50 M36 36 L22 22"/></g>'
    + '<circle cx="36" cy="36" r="2.4" fill="#f9f1dc" stroke="#5a4118" stroke-width="1"/>',
    'une boussole'),

  balance: disque(
    '<g stroke="#5a4118" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M36 22 V49"/><path d="M20 27 H52"/><path d="M28 51 Q36 47.5 44 51"/>'
    + '<path d="M22 27 L17 37 M22 27 L27 37 M15 37 Q22 45 29 37"/>'
    + '<path d="M50 27 L45 37 M50 27 L55 37 M43 37 Q50 45 57 37"/></g>'
    + '<circle cx="36" cy="22" r="2.6" fill="#3b2f1c"/>',
    'une balance'),

  ouroboros: disque(
    '<g fill="none" stroke="#3b2f1c" stroke-width="1.4" stroke-linejoin="round">'
    + '<path d="M30 24.5 C 26.5 17.5, 21 12.8, 13.5 12.3'
    + ' C 15.7 15.2, 15.1 17.8, 12.8 19.6'
    + ' C 16.3 20, 18.4 22.2, 17.6 25.3'
    + ' C 20.7 24.3, 23.6 25.7, 25 28.6'
    + ' C 26.5 26.5, 28.3 25.3, 30 25.5 Z"/></g>'
    + '<g fill="none" stroke="#3b2f1c" stroke-width="0.9" opacity="0.85">'
    + '<path d="M29.4 24.8 C 25 20.6, 19.8 16.2, 14.4 13.8"/>'
    + '<path d="M29.4 25.4 C 24.6 22.8, 19.4 20.8, 13.8 19.8"/></g>'
    + '<path d="M34.78 22.05 A14 14 0 1 0 37.22 22.05" fill="none" stroke="#3b2f1c" stroke-width="3" stroke-linecap="round"/>'
    + '<path d="M37.2 20.9 L41.2 23 L37.6 23.7 Z" fill="#3b2f1c"/>'
    + '<path d="M31.4 21.8 C 32.4 19.5, 35.4 18.7, 38 19.9 L 40.6 21.3 L 38.8 22.1'
    + ' L 40.4 23.5 L 36.8 23.9 C 33.9 24.3, 31.9 23.4, 31.4 21.8 Z" fill="#3b2f1c"/>'
    + '<path d="M32.8 20.2 L 33.6 17.4 L 34.9 19.8 Z" fill="#3b2f1c"/>'
    + '<circle cx="34.3" cy="21.3" r="0.9" fill="#e0c48a"/>'
    + '<path d="M43 47.5 A14 14 0 0 0 49.8 39" fill="none" stroke="#e0c48a" stroke-width="0.8" opacity="0.6"/>',
    'un ouroboros ailé'),

  imladrik: disque(EPEE_SOLEIL, 'une épée dressée devant un soleil'),

  // — TAO et ses deux pôles.
  tao: disque(
    '<circle cx="36" cy="36" r="24" fill="#efe3c4" stroke="#5a4118" stroke-width="1"/>'
    + '<path d="M36 12 A24 24 0 0 1 36 60 A12 12 0 0 1 36 36 A12 12 0 0 0 36 12 Z" fill="#3b2f1c"/>'
    + '<circle cx="36" cy="24" r="4.5" fill="#efe3c4"/>'
    + '<circle cx="36" cy="48" r="4.5" fill="#3b2f1c"/>',
    'le yin-yang du TAO'),
  aileBlanche: disque(aile('#ffffff'), 'l’aile blanche de RESHIRAM'),
  aileNoire: disque('<g transform="translate(72,0) scale(-1,1)">' + aile('#241c12') + '</g>',
    'l’aile noire de ZEKROM'),

  // — Les caps d'IMLADRIK.
  plume: disque(
    '<path d="M46 16 C 38 20, 30 30, 27 44 L 29.5 45 C 35 33, 41 24, 48 19 Z" fill="#3b2f1c"/>'
    + '<path d="M43 22 C 39 27, 35 33, 32 40" stroke="#e0c48a" stroke-width="0.8" fill="none" opacity="0.8"/>'
    + '<path d="M27 44 L 24.5 50 L 30 47.5 Z" fill="#3b2f1c"/>'
    + '<path d="M22 55 H 50" stroke="#3b2f1c" stroke-width="1.6" stroke-linecap="round"/>'
    + '<path d="M22 55 H 38" stroke="#a9884a" stroke-width="0.8" stroke-linecap="round" opacity="0.7"/>',
    'une plume d’écriture sur une ligne'),

  bifurcation: disque(
    '<path d="M36 56 V 40" stroke="#3b2f1c" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
    + '<path d="M36 40 C 36 32, 28 30, 24 22" stroke="#3b2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + '<path d="M36 40 C 36 30, 36 26, 36 20" stroke="#3b2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + '<path d="M36 40 C 36 32, 44 30, 48 22" stroke="#3b2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + '<g fill="#a9884a">'
    + '<path d="M24 14 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z"/>'
    + '<path d="M36 10 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z"/>'
    + '<path d="M48 14 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z"/></g>',
    'un chemin qui bifurque vers trois futurs'),

  flamme: disque(
    '<path d="M36 15 C 42 23, 48 28, 48 38 C 48 47, 43 53, 36 54'
    + ' C 29 53, 24 47, 24 38 C 24 31, 28 27, 30 23'
    + ' C 31 27, 33 29, 36 30 C 34 25, 34 20, 36 15 Z" fill="#3b2f1c"/>'
    + '<path d="M36 32 C 39 36, 41 38, 41 42 C 41 47, 39 49, 36 50'
    + ' C 33 49, 31 47, 31 42 C 31 38, 33 36, 36 32 Z" fill="#e8cf8f"/>'
    + '<path d="M26 58 H 46" stroke="#3b2f1c" stroke-width="2" stroke-linecap="round"/>',
    'une flamme qui ne s’éteint pas'),

  // — Les caps d'ALPHA.
  essor: disque(
    '<path d="M22 50 L46 26" stroke="#3b2f1c" stroke-width="2.6" stroke-linecap="round" fill="none"/>'
    + '<path d="M28 50 L48 30" stroke="#a9884a" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>'
    + '<path d="M46 22 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 Z" fill="#3b2f1c"/>',
    'l’étoile en essor de Renoboost IA'),
  portail: disque(
    '<path d="M23 51 V37 a13 13 0 0 1 26 0 V51" fill="none" stroke="#3b2f1c" stroke-width="2.4"/>'
    + '<path d="M20 51 H52" stroke="#3b2f1c" stroke-width="2.4" stroke-linecap="round"/>'
    + '<path d="M31 40 h10 m0 0 l-3.6 -3.6 m3.6 3.6 l-3.6 3.6" fill="none" stroke="#a9884a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    'le portail d’YCOME'),

  // — Les caps de NICOL BOLAS.
  abaque: disque(
    '<g stroke="#3b2f1c" stroke-width="1.8" stroke-linecap="round">'
    + '<path d="M18 26 H 54"/><path d="M18 36 H 54"/><path d="M18 46 H 54"/></g>'
    + '<g fill="#3b2f1c"><circle cx="25" cy="26" r="3"/><circle cx="33" cy="26" r="3"/>'
    + '<circle cx="47" cy="36" r="3"/><circle cx="39" cy="36" r="3"/>'
    + '<circle cx="25" cy="46" r="3"/></g>'
    + '<g fill="#a9884a"><circle cx="47" cy="26" r="3"/><circle cx="25" cy="36" r="3"/>'
    + '<circle cx="47" cy="46" r="3"/></g>'
    + '<path d="M16 20 H 56" stroke="#a9884a" stroke-width="1.1" opacity="0.7"/>',
    'un boulier'),
  revenus: disque(
    '<g fill="none" stroke="#3b2f1c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M27 50 V 24 m0 0 l-5 6 m5 -6 l5 6"/>'
    + '<path d="M45 22 V 48 m0 0 l-5 -6 m5 6 l5 -6"/></g>'
    + '<path d="M18 56 H 54" stroke="#a9884a" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>',
    'deux flux, l’entrée et la sortie'),
  impots: disque(
    '<path d="M24 16 H 48 V 50 H 24 Z" fill="#f4ead0" stroke="#3b2f1c" stroke-width="1.8"/>'
    + '<g stroke="#3b2f1c" stroke-width="1.2" stroke-linecap="round">'
    + '<path d="M29 24 H 43"/><path d="M29 30 H 43"/><path d="M29 36 H 38"/></g>'
    + '<circle cx="44" cy="52" r="6" fill="#3b2f1c"/>'
    + '<circle cx="44" cy="52" r="3" fill="none" stroke="#e0c48a" stroke-width="0.9"/>',
    'un parchemin scellé'),
  echeancier: disque(
    '<g fill="none" stroke="#3b2f1c" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">'
    + '<path d="M24 16 H 48"/><path d="M24 56 H 48"/>'
    + '<path d="M26 16 C 26 30, 46 42, 46 56"/><path d="M46 16 C 46 30, 26 42, 26 56"/></g>'
    + '<path d="M31 50 q 5 -5 10 0 l 0 4 H 31 Z" fill="#3b2f1c"/>'
    + '<path d="M36 30 v 8" stroke="#a9884a" stroke-width="1.4" stroke-linecap="round"/>',
    'un sablier'),

  // — Les caps d'ADRAMELECH.
  archipels: disque(
    '<g fill="#3b2f1c">'
    + '<path d="M20 34 q 6 -9 13 -2 q 5 5 -1 6 q -8 1 -12 -4 Z"/>'
    + '<path d="M40 26 q 5 -7 11 -1 q 4 4 -1 5 q -7 1 -10 -4 Z"/>'
    + '<path d="M34 46 q 7 -8 14 -1 q 4 4 -2 5 q -9 1 -12 -4 Z"/></g>'
    + '<g fill="none" stroke="#a9884a" stroke-width="1.1" stroke-linecap="round" opacity="0.8">'
    + '<path d="M18 44 q 5 -3 10 0 t 10 0"/><path d="M20 54 q 6 -3 12 0 t 12 0"/></g>',
    'des îles sur la mer gravée'),
  rapprochements: disque(
    '<g fill="#3b2f1c"><circle cx="24" cy="28" r="6"/><circle cx="48" cy="44" r="6"/></g>'
    + '<path d="M28.5 32.5 L 43.5 39.5" stroke="#a9884a" stroke-width="2" stroke-linecap="round"/>'
    + '<g fill="none" stroke="#3b2f1c" stroke-width="1.2" opacity="0.6">'
    + '<circle cx="24" cy="28" r="10"/><circle cx="48" cy="44" r="10"/></g>',
    'deux idées reliées par un pont'),
};

// ---------- Cœurs de boussole (médaillons) ----------

export const COEURS = {
  // Racine : le monde-anneau rayonnant (sceau d'Ultima).
  anneau: medaillon('anneau',
    '<g stroke="#4a3512" fill="none" stroke-linecap="round">'
    + '<circle cx="60" cy="60" r="17" stroke-width="2.4"/>'
    + '<circle cx="60" cy="60" r="8.5" stroke-width="1.6"/>'
    + '<path d="M60 40 L60 30 M60 80 L60 90 M80 60 L90 60 M40 60 L30 60'
    + ' M74.1 45.9 L81.2 38.8 M45.9 45.9 L38.8 38.8'
    + ' M74.1 74.1 L81.2 81.2 M45.9 74.1 L38.8 81.2" stroke-width="1.4"/></g>'
    + '<circle cx="60" cy="60" r="2.1" fill="#4a3512"/>'),

  // Supra-division personnelle : la rose des vents.
  rose: medaillon('rose',
    '<path d="M60 18 L66 54 L102 60 L66 66 L60 102 L54 66 L18 60 L54 54 Z" fill="#3b2f1c"/>'
    + '<path d="M60 30 L64 56 L90 60 L64 64 L60 90 L56 64 L30 60 L56 56 Z" fill="#a9884a" opacity="0.5"/>'
    + '<circle cx="60" cy="60" r="3.4" fill="#f9f1dc" stroke="#5a4118" stroke-width="1"/>'),

  // Supra-division professionnelle : l'alpha sur son stylobate.
  alpha: medaillon('alpha',
    '<g fill="none" stroke="#4a3512" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M38 84 L 60 30 L 82 84"/><path d="M47 65 H 73"/></g>'
    + '<path d="M32 94 H 88" stroke="#a9884a" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>'
    + '<path d="M36 30 q 24 -12 48 0" fill="none" stroke="#a9884a" stroke-width="1.8" opacity="0.6"/>'),

  // NICOL BOLAS : la balance.
  balance: medaillon('balance',
    '<g stroke="#4a3512" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M60 36 V 84"/><path d="M33 45 H 87"/><path d="M46 88 Q60 82 74 88"/>'
    + '<path d="M36 45 L 27 62 M36 45 L 45 62 M23 62 Q36 76 49 62"/>'
    + '<path d="M84 45 L 75 62 M84 45 L 93 62 M71 62 Q84 76 97 62"/></g>'
    + '<circle cx="60" cy="36" r="4.4" fill="#3b2f1c"/>'),

  // ADRAMELECH : l'ouroboros ailé.
  ouroboros: medaillon('ouroboros',
    '<g fill="none" stroke="#3b2f1c" stroke-width="2.4" stroke-linejoin="round">'
    + '<path d="M50 40 C 44 26, 34 17, 21 16 C 25 21, 24 26, 20 29'
    + ' C 26 30, 30 34, 28 39 C 34 37, 39 40, 41 45 C 44 41, 47 39, 50 40 Z"/></g>'
    + '<path d="M57.5 36 A25 25 0 1 0 62.5 36" fill="none" stroke="#3b2f1c" stroke-width="5.4" stroke-linecap="round"/>'
    + '<path d="M52 35 C 54 31, 59 29, 64 32 L 69 34 L 65 36 L 68 39 L 61 39.5'
    + ' C 56 40, 53 38, 52 35 Z" fill="#3b2f1c"/>'
    + '<circle cx="57" cy="34.5" r="1.5" fill="#e0c48a"/>'),

  // TAO : le yin-yang.
  tao: medaillon('tao',
    '<circle cx="60" cy="60" r="34" fill="#efe3c4" stroke="#5a4118" stroke-width="1.4"/>'
    + '<path d="M60 26 A34 34 0 0 1 60 94 A17 17 0 0 1 60 60 A17 17 0 0 0 60 26 Z" fill="#3b2f1c"/>'
    + '<circle cx="60" cy="43" r="6.4" fill="#efe3c4"/>'
    + '<circle cx="60" cy="77" r="6.4" fill="#3b2f1c"/>'),

  // IMLADRIK : Kalamn-talaen — l'épée enlacée du dragon. C'est le NOM GRAVÉ de
  // la boussole du quadrant, pas un agent : l'agent unique d'Ultima reste Léo.
  kalamn: medaillon('kalamn',
    '<g fill="none" stroke="#3b2f1c" stroke-width="3.2" stroke-linecap="round">'
    + '<path d="M38 82 C 30 74, 30 62, 42 58 C 54 54, 70 56, 76 46"/>'
    + '<path d="M76 46 C 80 39, 76 31, 68 30"/></g>'
    + '<path d="M38 82 C 42 88, 50 90, 57 87 L 53 83 C 48 85, 43 84, 40 80 Z" fill="#3b2f1c"/>'
    + '<path d="M47 57 C 42 47, 46 38, 56 34 C 52 40, 52 46, 55 51 Z" fill="#3b2f1c" opacity="0.85"/>'
    + '<g fill="#3b2f1c">'
    + '<path d="M60 14 L62.4 20 L62.4 74 L57.6 74 L57.6 20 Z"/>'
    + '<rect x="49" y="74" width="22" height="3.6" rx="1.8"/>'
    + '<rect x="58.1" y="77.6" width="3.8" height="8"/>'
    + '<circle cx="60" cy="89" r="3.1"/></g>'
    + '<path d="M60 18 V 72" stroke="#e0c48a" stroke-width="0.9" opacity="0.75"/>'
    + '<path d="M52 66 C 58 63, 66 63, 70 58" fill="none" stroke="#3b2f1c" stroke-width="3.2" stroke-linecap="round"/>'
    + '<path d="M68 30 C 63 29, 59 31, 57 35 C 61 36, 66 36, 69 34 L 74 33 L 69.5 31.5 Z" fill="#3b2f1c"/>'
    + '<circle cx="64.5" cy="32.5" r="1" fill="#e8cf8f"/>'
    + '<path d="M67 29.5 l 1.5 -3.5 l 1.5 3" fill="none" stroke="#3b2f1c" stroke-width="1.1" stroke-linecap="round"/>'),
};
