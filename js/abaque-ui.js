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

import { simuler, regimeDirigeant, DEFAUTS } from './abaque.mjs';

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
    postes: lireLignes('postes-liste'),
    investissements: lireLignes('invest-liste'),
    locations: lireLignes('location-liste'),
  };
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

// ---------- Boucle de recalcul ----------
function recalculer() {
  try {
    rendre(simuler(lireEntrees()));
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

  // Recalcul délégué : tout input/change dans le formulaire relance le calcul.
  const form = document.getElementById('form-abaque');
  form.addEventListener('input', recalculer);
  form.addEventListener('change', recalculer);

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

  recalculer();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', amorcer);
  } else {
    amorcer();
  }
}
