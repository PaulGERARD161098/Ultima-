// ABAQUE — front du simulateur de lancement (quadrant NICOL BOLAS, boucle NB-2).
// Ce module NE CALCULE RIEN : il lit le formulaire, construit l'objet `entrees`,
// appelle `simuler()` du moteur figé js/abaque.mjs (seule source de calcul), puis
// rend les sorties. Recalcul à chaque changement d'input.
//
// Contraintes (CSP stricte, finance = sensible) :
//   - injection DOM exclusivement createElement/textContent (jamais innerHTML
//     avec des valeurs) ;
//   - aucune donnée financière en console/logs, erreurs génériques ;
//   - déterministe : même saisie → même rendu (la courbe SVG ne dépend ni de
//     l'heure ni de l'aléa) ;
//   - v1 sans base, sans réseau : tout est local dans la page.

import { simuler, arbitrageAchatLocation, regimeDirigeant, DEFAUTS } from './abaque.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';

// ---------- Formatage déterministe (fr-FR, ICU stable) ----------
const fmtEuro = new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
});
const fmtEuroCourt = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});
function euro(v) { return fmtEuro.format(Number.isFinite(v) ? v : 0); }

const LIBELLE_REGIME = { assimile: 'assimilé-salarié', tns: 'travailleur non salarié (TNS)' };

// ---------- Petits fabricants DOM ----------
function el(nom, classe, texte) {
  const n = document.createElement(nom);
  if (classe) { n.className = classe; }
  if (texte !== undefined) { n.textContent = texte; }
  return n;
}
function svgEl(nom, attrs, texte) {
  const n = document.createElementNS(SVG_NS, nom);
  for (const cle of Object.keys(attrs || {})) { n.setAttribute(cle, attrs[cle]); }
  if (texte !== undefined) { n.textContent = texte; }
  return n;
}
function champ(labelTexte, input, unite) {
  const box = el('div', 'champ');
  const lab = el('label', null, labelTexte);
  lab.htmlFor = input.id;
  box.appendChild(lab);
  box.appendChild(input);
  if (unite) { box.appendChild(el('span', 'unite', unite)); }
  return box;
}

// Génère un id unique et stable au sein de la page (pour relier label↔input).
let compteurId = 0;
function neufId(prefixe) { compteurId += 1; return prefixe + '-' + compteurId; }

function inputNombre(valeur, opts) {
  const input = document.createElement('input');
  input.type = 'number';
  input.id = neufId('n');
  input.value = String(valeur);
  input.setAttribute('inputmode', 'decimal');
  if (opts && opts.step !== undefined) { input.step = String(opts.step); }
  if (opts && opts.min !== undefined) { input.min = String(opts.min); }
  input.dataset.champ = opts.champ;
  return input;
}

// ---------- Lecture des champs scalaires ----------
function lireNombre(id, defaut) {
  const n = document.getElementById(id);
  const v = n ? parseFloat(n.value) : NaN;
  return Number.isFinite(v) ? v : defaut;
}

// ---------- Lignes ajoutables ----------
const DEFAUTS_UI = {
  postes: [
    { libelle: 'Dirigeant', nbEtp: 1, brutMensuel: 3000, estDirigeant: true },
    { libelle: 'Technicien', nbEtp: 1, brutMensuel: 2500, estDirigeant: false },
  ],
  investissements: [
    { libelle: 'Matériel', montantHt: 15000, moisEngagement: 1, dureeAmortMois: 60 },
  ],
  locations: [
    { libelle: 'Local / véhicule', mensualiteHt: 900, moisDebut: 1 },
  ],
};

function ligneTexteLibelle(valeur) {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = neufId('t');
  input.value = valeur;
  input.dataset.champ = 'libelle';
  input.autocomplete = 'off';
  return input;
}

function boutonSupprimer(ligne) {
  const b = el('button', 'bouton-supprimer', '×');
  b.type = 'button';
  b.setAttribute('aria-label', 'Retirer cette ligne');
  b.addEventListener('click', () => { ligne.remove(); recalculer(); });
  return b;
}

function lignePoste(p) {
  const ligne = el('div', 'ligne ligne-poste');
  ligne.dataset.type = 'poste';
  const lib = ligneTexteLibelle(p.libelle);
  ligne.appendChild(champ('Poste', lib));
  ligne.querySelector('.champ').classList.add('large');
  ligne.appendChild(champ('ETP', inputNombre(p.nbEtp, { champ: 'nbEtp', step: 0.5, min: 0 })));
  ligne.appendChild(champ('Brut / rému. mensuel', inputNombre(p.brutMensuel, { champ: 'brutMensuel', step: 100, min: 0 }), '€'));
  const caseBox = el('div', 'champ ligne-case');
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.id = neufId('c');
  chk.checked = p.estDirigeant === true;
  chk.dataset.champ = 'estDirigeant';
  const labChk = el('label', null, 'Dirigeant');
  labChk.htmlFor = chk.id;
  caseBox.appendChild(chk);
  caseBox.appendChild(labChk);
  ligne.appendChild(caseBox);
  ligne.appendChild(boutonSupprimer(ligne));
  return ligne;
}

function ligneInvest(i) {
  const ligne = el('div', 'ligne ligne-invest');
  ligne.dataset.type = 'invest';
  const lib = ligneTexteLibelle(i.libelle);
  ligne.appendChild(champ('Investissement', lib));
  ligne.querySelector('.champ').classList.add('large');
  ligne.appendChild(champ('Montant HT', inputNombre(i.montantHt, { champ: 'montantHt', step: 100, min: 0 }), '€'));
  ligne.appendChild(champ('Mois', inputNombre(i.moisEngagement, { champ: 'moisEngagement', step: 1, min: 1 })));
  ligne.appendChild(champ('Amort. (mois)', inputNombre(i.dureeAmortMois, { champ: 'dureeAmortMois', step: 1, min: 0 })));
  ligne.appendChild(boutonSupprimer(ligne));
  return ligne;
}

function ligneLocation(l) {
  const ligne = el('div', 'ligne ligne-location');
  ligne.dataset.type = 'location';
  const lib = ligneTexteLibelle(l.libelle);
  ligne.appendChild(champ('Location', lib));
  ligne.querySelector('.champ').classList.add('large');
  ligne.appendChild(champ('Mensualité HT', inputNombre(l.mensualiteHt, { champ: 'mensualiteHt', step: 50, min: 0 }), '€'));
  ligne.appendChild(champ('Mois de début', inputNombre(l.moisDebut, { champ: 'moisDebut', step: 1, min: 1 })));
  ligne.appendChild(boutonSupprimer(ligne));
  return ligne;
}

// Lit une liste de lignes en objets d'entrée pour `simuler`.
function lireLignes(conteneurId, mapping) {
  const conteneur = document.getElementById(conteneurId);
  const out = [];
  for (const ligne of conteneur.querySelectorAll('.ligne')) {
    const o = {};
    for (const input of ligne.querySelectorAll('[data-champ]')) {
      const cle = input.dataset.champ;
      if (input.type === 'checkbox') { o[cle] = input.checked; }
      else if (input.type === 'number') { const v = parseFloat(input.value); o[cle] = Number.isFinite(v) ? v : 0; }
      else { o[cle] = input.value; }
    }
    out.push(mapping ? mapping(o) : o);
  }
  return out;
}

// ---------- Construction de l'objet `entrees` ----------
function lireEntrees() {
  return {
    statutJuridique: document.getElementById('statutJuridique').value,
    tresorerieInitiale: lireNombre('tresorerieInitiale', 0),
    horizonMois: lireNombre('horizonMois', DEFAUTS.horizonMois),
    caMensuel: lireNombre('caMensuel', 0),
    margeBruteCible: lireNombre('margeBruteCible', 35) / 100,
    chargesStructureMensuelles: lireNombre('chargesStructureMensuelles', 0),
    delaiEncaissementJours: lireNombre('delaiEncaissementJours', DEFAUTS.delaiEncaissementJours),
    delaiFournisseurJours: lireNombre('delaiFournisseurJours', DEFAUTS.delaiFournisseurJours),
    delaiChargesJours: lireNombre('delaiChargesJours', DEFAUTS.delaiChargesJours),
    tauxChargesPatronales: lireNombre('tauxChargesPatronales', 42) / 100,
    tauxChargesSalariales: lireNombre('tauxChargesSalariales', 22) / 100,
    tauxChargesDirigeantTns: lireNombre('tauxChargesDirigeantTns', 45) / 100,
    coefAnnualisation: lireNombre('coefAnnualisation', DEFAUTS.coefAnnualisation),
    margeSecurite: lireNombre('margeSecurite', 20) / 100,
    moduleTva: Boolean(document.getElementById('moduleTva') && document.getElementById('moduleTva').checked),
    tauxTvaCollectee: lireNombre('tauxTvaCollectee', 20) / 100,
    tauxTvaDeductible: lireNombre('tauxTvaDeductible', 20) / 100,
    saisonnalite: lireSaisonnalite(),
    postes: lireLignes('postes-liste'),
    investissements: lireLignes('invest-liste'),
    locations: lireLignes('location-liste'),
  };
}

// ---------- Saisonnalité : 12 coefficients mensuels (1 = mois moyen) ----------
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function lireSaisonnalite() {
  const coefs = [];
  for (let m = 1; m <= 12; m++) { coefs.push(lireNombre('saison-' + m, 1)); }
  return coefs;
}

function construireSaisonnalite() {
  const grille = document.getElementById('saison-grille');
  if (!grille) { return; }
  grille.replaceChildren();
  for (let m = 1; m <= 12; m++) {
    const box = el('div', 'champ champ-saison');
    const lab = el('label', null, MOIS[m - 1]);
    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'saison-' + m;
    input.value = '1';
    input.step = '0.1';
    input.min = '0';
    input.setAttribute('inputmode', 'decimal');
    input.setAttribute('aria-label', 'Coefficient de saisonnalité — ' + MOIS[m - 1]);
    lab.htmlFor = input.id;
    box.appendChild(lab);
    box.appendChild(input);
    grille.appendChild(box);
  }
}

// Active/désactive les taux de TVA selon la case « Modéliser le décalage de TVA ».
function majTvaEtat() {
  const actif = Boolean(document.getElementById('moduleTva') && document.getElementById('moduleTva').checked);
  ['tauxTvaCollectee', 'tauxTvaDeductible'].forEach((id) => {
    const n = document.getElementById(id);
    if (n) { n.disabled = !actif; }
  });
}

// ---------- Courbe de trésorerie (SVG inline déterministe) ----------
function construireCourbe(treso, moisPointBas) {
  const W = 760;
  const Ht = 320;
  const padL = 70;
  const padR = 22;
  const padT = 22;
  const padB = 46;
  const plotW = W - padL - padR;
  const plotH = Ht - padT - padB;
  const H = treso.length;

  let minV = Math.min(0, ...treso);
  let maxV = Math.max(0, ...treso);
  if (minV === maxV) { maxV = minV + 1; }
  const etendue = maxV - minV;

  const xFor = (m) => (H > 1 ? padL + ((m - 1) / (H - 1)) * plotW : padL + plotW / 2);
  const yFor = (v) => padT + ((maxV - v) / etendue) * plotH;

  const svg = svgEl('svg', {
    viewBox: '0 0 ' + W + ' ' + Ht,
    role: 'img',
    'aria-label': 'Courbe de trésorerie sur ' + H + ' mois. Point le plus bas au mois '
      + (moisPointBas || 1) + ' : ' + fmtEuroCourt.format(Math.round(treso[(moisPointBas || 1) - 1])) + ' euros.',
  });
  svg.appendChild(svgEl('rect', { class: 'courbe-fond', x: 0, y: 0, width: W, height: Ht }));

  // Cadre du tracé.
  svg.appendChild(svgEl('line', { class: 'courbe-grille', x1: padL, y1: padT, x2: padL, y2: padT + plotH }));
  svg.appendChild(svgEl('line', { class: 'courbe-grille', x1: padL, y1: padT + plotH, x2: padL + plotW, y2: padT + plotH }));

  // Ligne de zéro (si dans la plage).
  if (minV <= 0 && maxV >= 0) {
    const y0 = yFor(0);
    svg.appendChild(svgEl('line', { class: 'courbe-zero', x1: padL, y1: y0, x2: padL + plotW, y2: y0 }));
    svg.appendChild(svgEl('text', { class: 'courbe-label', x: padL - 8, y: y0 + 4, 'text-anchor': 'end' }, '0 €'));
  }

  // Étiquettes des bornes verticales.
  svg.appendChild(svgEl('text', { class: 'courbe-label', x: padL - 8, y: padT + 4, 'text-anchor': 'end' }, fmtEuroCourt.format(Math.round(maxV)) + ' €'));
  svg.appendChild(svgEl('text', { class: 'courbe-label', x: padL - 8, y: padT + plotH + 4, 'text-anchor': 'end' }, fmtEuroCourt.format(Math.round(minV)) + ' €'));

  // Aire sous la courbe (depuis la ligne du bas du tracé).
  const basePts = treso.map((v, i) => xFor(i + 1) + ',' + yFor(v));
  const aire = 'M' + xFor(1) + ',' + (padT + plotH) + ' L'
    + basePts.join(' L') + ' L' + xFor(H) + ',' + (padT + plotH) + ' Z';
  svg.appendChild(svgEl('path', { class: 'courbe-aire', d: aire }));

  // Ligne de trésorerie.
  const ligne = 'M' + basePts.join(' L');
  svg.appendChild(svgEl('path', { class: 'courbe-ligne', d: ligne }));

  // Points mensuels.
  treso.forEach((v, i) => {
    svg.appendChild(svgEl('circle', { class: 'courbe-point', cx: xFor(i + 1), cy: yFor(v), r: 2.6 }));
  });

  // Étiquettes de mois (début, milieu, fin).
  const moisAffiches = H > 1 ? [1, Math.ceil(H / 2), H] : [1];
  for (const m of moisAffiches) {
    svg.appendChild(svgEl('text', {
      class: 'courbe-label', x: xFor(m), y: padT + plotH + 22, 'text-anchor': 'middle',
    }, 'M' + m));
  }

  // Point bas mis en évidence.
  if (moisPointBas >= 1 && moisPointBas <= H) {
    const px = xFor(moisPointBas);
    const py = yFor(treso[moisPointBas - 1]);
    svg.appendChild(svgEl('circle', { class: 'courbe-pointbas-halo', cx: px, cy: py, r: 9 }));
    svg.appendChild(svgEl('circle', { class: 'courbe-pointbas', cx: px, cy: py, r: 5 }));
    const ancre = px > W - 120 ? 'end' : 'start';
    const dx = px > W - 120 ? -12 : 12;
    svg.appendChild(svgEl('text', {
      class: 'courbe-label-bas', x: px + dx, y: py - 10, 'text-anchor': ancre,
    }, 'Point bas : ' + fmtEuroCourt.format(Math.round(treso[moisPointBas - 1])) + ' €'));
  }

  return svg;
}

// ---------- Rendu des résultats ----------
function poser(id, texte) {
  const n = document.getElementById(id);
  if (n) { n.textContent = texte; }
}

function rendre(sortie) {
  const ms = sortie.masseSalariale;
  poser('res-ms-chargee-mensuelle', euro(ms.chargeeMensuelle));
  poser('res-ms-chargee-annuelle', euro(ms.chargeeAnnuelle));
  poser('res-ms-nette', euro(ms.netteMensuelle));
  poser('res-cotisations', euro(ms.cotisationsMensuelles));

  poser('res-bfr', euro(sortie.bfrRegime));

  const alerte = document.getElementById('alerte-marge');
  if (sortie.margeInvalide) {
    poser('res-seuil', 'marge invalide');
    alerte.hidden = false;
  } else {
    const seuil = sortie.caSeuilMensuel[sortie.caSeuilMensuel.length - 1];
    poser('res-seuil', euro(seuil));
    alerte.hidden = true;
  }

  if (sortie.moisPointMort === null) {
    poser('res-point-mort', 'non atteint sur l’horizon');
  } else {
    poser('res-point-mort', 'mois ' + sortie.moisPointMort);
  }

  poser('res-plancher', euro(sortie.tresoreriePlancher));
  poser('res-point-bas', sortie.moisDuPointBas >= 1 ? 'au mois ' + sortie.moisDuPointBas : 'jamais négatif');

  poser('res-besoin', euro(sortie.besoinFinancementMin));
  poser('res-coussin', euro(sortie.coussinRecommande));

  const courbe = document.getElementById('courbe');
  courbe.replaceChildren(construireCourbe(sortie.tresorerie, sortie.moisDuPointBas));

  poser('regime-libelle', LIBELLE_REGIME[regimeDirigeant(document.getElementById('statutJuridique').value)] || '—');
}

// ---------- Arbitrage acheter / louer (branché sur le moteur) ----------
// Lit l'actif du panneau, puis calcule l'IMPACT CASH réel en RE-SIMULANT le
// scénario courant avec l'actif ajouté en achat (décaissement au mois 1) PUIS en
// location (loyer mensuel). Les deux trésoreries plancher alimentent la règle de
// cash prioritaire d'arbitrageAchatLocation. Aucune formule ici : on compose le
// moteur figé. Montants saisis TTC → passés en Ht avec TVA 0 (le décaissement =
// le TTC, cohérent avec le module TVA off par défaut).
function lireActif() {
  return {
    montantTtc: lireNombre('arb-montant', 0),
    valeurReventeTtc: lireNombre('arb-revente', 0),
    maintenanceMensuelle: lireNombre('arb-maintenance', 0),
    mensualiteLoyerTtc: lireNombre('arb-loyer', 0),
    depotGarantieTtc: lireNombre('arb-depot', 0),
    dureeUsageMois: lireNombre('arb-duree', 12),
    tauxActualisationAnnuel: lireNombre('arb-taux', 8) / 100,
  };
}

const MOTIF_ARBITRAGE = {
  contrainte_cash: 'La règle de trésorerie tranche : l’achat ferait plonger la trésorerie plancher, la location la préserve.',
  cout_actualise: 'Décision au moindre coût actualisé sur la durée d’usage réelle.',
};

function rendreArbitrage(entrees) {
  const actif = lireActif();
  // Impact cash : trésorerie plancher du scénario avec l'actif en achat vs en location.
  const invests = (entrees.investissements || []).slice();
  invests.push({ montantHt: actif.montantTtc, tauxTva: 0, moisEngagement: 1, dureeAmortMois: actif.dureeUsageMois });
  const locs = (entrees.locations || []).slice();
  locs.push({ mensualiteHt: actif.mensualiteLoyerTtc, tauxTva: 0, moisDebut: 1 });

  const plancherAchat = simuler({ ...entrees, investissements: invests }).tresoreriePlancher;
  const plancherLocation = simuler({ ...entrees, locations: locs }).tresoreriePlancher;

  const res = arbitrageAchatLocation({
    ...actif,
    impactPlancherAchat: plancherAchat,
    impactPlancherLocation: plancherLocation,
  });

  const badge = document.getElementById('arb-reco');
  badge.textContent = res.recommandation === 'louer' ? 'Louer' : 'Acheter';
  badge.dataset.reco = res.recommandation;
  poser('arb-motif', MOTIF_ARBITRAGE[res.motif] || '');
  poser('arb-van-achat', euro(res.vanAchat));
  poser('arb-van-location', euro(res.vanLocation));
  poser('arb-plancher-achat', euro(plancherAchat));
  poser('arb-plancher-location', euro(plancherLocation));
  poser('arb-bascule', res.uBascule === null
    ? 'sans objet (le loyer ne dépasse pas la maintenance)'
    : 'au-delà de ' + Math.max(1, Math.round(res.uBascule)) + ' mois');
}

// ---------- Boucle de recalcul ----------
function recalculer() {
  try {
    const entrees = lireEntrees();
    rendre(simuler(entrees));
    rendreArbitrage(entrees);
  } catch (e) {
    // Erreur générique : jamais de détail (ni de donnée) en console.
    const courbe = document.getElementById('courbe');
    courbe.replaceChildren(el('p', 'res-note', 'Calcul momentanément indisponible.'));
  }
}

// ---------- Scénarios (presets d'hypothèses) ----------
function appliquerScenario(marge, delaiEncaissement) {
  document.getElementById('margeBruteCible').value = String(marge);
  document.getElementById('delaiEncaissementJours').value = String(delaiEncaissement);
  recalculer();
}

// ---------- Export / import d'un scénario (JSON local, sans base) ----------
// Sérialise toutes les hypothèses (scalaires + lignes + actif d'arbitrage) dans
// un fichier téléchargé, et les recharge depuis un fichier local. Tout reste sur
// l'appareil : aucun réseau, aucune base, la finance ne quitte pas la page.
const SCALAIRES = [
  'statutJuridique', 'tresorerieInitiale', 'horizonMois', 'caMensuel',
  'margeBruteCible', 'chargesStructureMensuelles', 'delaiEncaissementJours',
  'delaiFournisseurJours', 'delaiChargesJours', 'tauxChargesPatronales',
  'tauxChargesSalariales', 'tauxChargesDirigeantTns', 'coefAnnualisation',
  'margeSecurite', 'moduleTva', 'tauxTvaCollectee', 'tauxTvaDeductible',
].concat(Array.from({ length: 12 }, (_, i) => 'saison-' + (i + 1)));

// Lit un champ scalaire pour l'export (case → booléen, sinon valeur texte).
function lireChampScalaire(n) { return n.type === 'checkbox' ? n.checked : n.value; }
// Applique une valeur scalaire à l'import (case → coché, sinon valeur).
function poserChampScalaire(n, v) {
  if (n.type === 'checkbox') { n.checked = (v === true || v === 'true' || v === 'on'); }
  else { n.value = String(v); }
}
const ARB_IDS = ['arb-montant', 'arb-revente', 'arb-maintenance', 'arb-loyer', 'arb-depot', 'arb-duree', 'arb-taux'];

function ioMessage(texte, estErreur) {
  const n = document.getElementById('io-message');
  if (!n) { return; }
  n.textContent = texte;
  n.classList.toggle('io-erreur', Boolean(estErreur));
}

function serialiserScenario() {
  const scalaires = {};
  SCALAIRES.forEach((id) => { const n = document.getElementById(id); if (n) { scalaires[id] = lireChampScalaire(n); } });
  const arbitrage = {};
  ARB_IDS.forEach((id) => { const n = document.getElementById(id); if (n) { arbitrage[id] = n.value; } });
  return {
    _type: 'abaque-scenario',
    _version: 1,
    scalaires,
    postes: lireLignes('postes-liste'),
    investissements: lireLignes('invest-liste'),
    locations: lireLignes('location-liste'),
    arbitrage,
  };
}

function exporter() {
  try {
    const json = JSON.stringify(serialiserScenario(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abaque-scenario.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    ioMessage('Scénario exporté dans « abaque-scenario.json ».');
  } catch (e) {
    ioMessage('Export impossible.', true);
  }
}

// Coercitions défensives : un fichier édité à la main ne doit jamais casser l'UI.
function nombreSur(v, d) { const n = parseFloat(v); return Number.isFinite(n) ? n : d; }
function texteSur(v, d) { return typeof v === 'string' ? v : d; }

function appliquerScenarioObjet(obj) {
  if (!obj || obj._type !== 'abaque-scenario' || typeof obj.scalaires !== 'object') {
    ioMessage('Fichier non reconnu (ce n’est pas un scénario ABAQUE).', true);
    return;
  }
  // Scalaires connus uniquement (les clés inconnues sont ignorées).
  Object.keys(obj.scalaires).forEach((id) => {
    if (!SCALAIRES.includes(id)) { return; }
    const n = document.getElementById(id);
    if (n) { poserChampScalaire(n, obj.scalaires[id]); }
  });
  majTvaEtat();  // reflète l'état du module TVA importé sur les taux
  const arb = (obj.arbitrage && typeof obj.arbitrage === 'object') ? obj.arbitrage : {};
  Object.keys(arb).forEach((id) => {
    if (!ARB_IDS.includes(id)) { return; }
    const n = document.getElementById(id);
    if (n) { n.value = String(arb[id]); }
  });
  // Lignes reconstruites depuis les fabricants (valeurs coercées, jamais innerHTML).
  const rebuild = (contId, liste, fab) => {
    const cont = document.getElementById(contId);
    cont.replaceChildren();
    (Array.isArray(liste) ? liste : []).forEach((o) => cont.appendChild(fab(o || {})));
  };
  rebuild('postes-liste', obj.postes, (o) => lignePoste({
    libelle: texteSur(o.libelle, 'Poste'), nbEtp: nombreSur(o.nbEtp, 1),
    brutMensuel: nombreSur(o.brutMensuel, 0), estDirigeant: o.estDirigeant === true,
  }));
  rebuild('invest-liste', obj.investissements, (o) => ligneInvest({
    libelle: texteSur(o.libelle, 'Investissement'), montantHt: nombreSur(o.montantHt, 0),
    moisEngagement: nombreSur(o.moisEngagement, 1), dureeAmortMois: nombreSur(o.dureeAmortMois, 0),
  }));
  rebuild('location-liste', obj.locations, (o) => ligneLocation({
    libelle: texteSur(o.libelle, 'Location'), mensualiteHt: nombreSur(o.mensualiteHt, 0),
    moisDebut: nombreSur(o.moisDebut, 1),
  }));
  recalculer();
  ioMessage('Scénario chargé.');
}

function importer(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let obj = null;
    try { obj = JSON.parse(reader.result); } catch (e) { ioMessage('Fichier illisible (JSON invalide).', true); return; }
    appliquerScenarioObjet(obj);
  };
  reader.onerror = () => ioMessage('Lecture du fichier impossible.', true);
  reader.readAsText(file);
}

// ---------- Amorçage ----------
function amorcer() {
  // Mention datée « à vérifier » sur les hypothèses (source unique : DEFAUTS).
  poser('avertissement', simuler({}).avertissement);
  poser('note-hypotheses', 'Hypothèses au ' + DEFAUTS.dateHypotheses + ', à vérifier — ce ne sont pas des chiffres officiels.');

  // Lignes par défaut (un scénario VERTUMNE-like, immédiatement chiffré).
  const postes = document.getElementById('postes-liste');
  DEFAUTS_UI.postes.forEach((p) => postes.appendChild(lignePoste(p)));
  const invests = document.getElementById('invest-liste');
  DEFAUTS_UI.investissements.forEach((i) => invests.appendChild(ligneInvest(i)));
  const locations = document.getElementById('location-liste');
  DEFAUTS_UI.locations.forEach((l) => locations.appendChild(ligneLocation(l)));

  // Saisonnalité (12 coefficients à 1 = plat) + état initial des taux de TVA.
  construireSaisonnalite();
  majTvaEtat();
  const caseTva = document.getElementById('moduleTva');
  if (caseTva) { caseTva.addEventListener('change', majTvaEtat); }

  // Recalcul délégué : tout input/change dans le formulaire relance le calcul.
  // (Les 12 coefficients de saison et les champs TVA vivent DANS le formulaire.)
  const form = document.getElementById('form-abaque');
  form.addEventListener('input', recalculer);
  form.addEventListener('change', recalculer);

  // Le panneau d'arbitrage vit HORS du formulaire : ses champs relancent aussi le
  // calcul (l'impact cash dépend du scénario ET de l'actif saisi).
  const arb = document.getElementById('arb-verdict').parentElement;
  arb.addEventListener('input', recalculer);
  arb.addEventListener('change', recalculer);

  document.getElementById('ajouter-poste').addEventListener('click', () => {
    postes.appendChild(lignePoste({ libelle: 'Nouveau poste', nbEtp: 1, brutMensuel: 2000, estDirigeant: false }));
    recalculer();
  });
  document.getElementById('ajouter-invest').addEventListener('click', () => {
    invests.appendChild(ligneInvest({ libelle: 'Nouvel investissement', montantHt: 5000, moisEngagement: 1, dureeAmortMois: 36 }));
    recalculer();
  });
  document.getElementById('ajouter-location').addEventListener('click', () => {
    locations.appendChild(ligneLocation({ libelle: 'Nouvelle location', mensualiteHt: 500, moisDebut: 1 }));
    recalculer();
  });

  document.getElementById('scenario-prudent').addEventListener('click', () => appliquerScenario(28, 60));
  document.getElementById('scenario-median').addEventListener('click', () => appliquerScenario(35, 45));
  document.getElementById('scenario-volontariste').addEventListener('click', () => appliquerScenario(42, 30));

  // Export / import JSON (local, sans base).
  document.getElementById('exporter-json').addEventListener('click', exporter);
  const fichier = document.getElementById('fichier-json');
  document.getElementById('importer-json').addEventListener('click', () => fichier.click());
  fichier.addEventListener('change', () => {
    if (fichier.files && fichier.files[0]) { importer(fichier.files[0]); fichier.value = ''; }
  });

  recalculer();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', amorcer);
  } else {
    amorcer();
  }
}
