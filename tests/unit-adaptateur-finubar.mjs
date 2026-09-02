// Vérification de `js/adaptateur-finubar.mjs` — Node pur, zéro I/O, zéro DOM.
//
// ⛔ Discipline de la charte (2026-08-17) : « AVANT DE CROIRE UNE MESURE, LUI
// DEMANDER CE QU'ELLE RÉPOND SUR UN CAS DONT ON CONNAÎT DÉJÀ LA RÉPONSE ».
// Les cas de §1 et §2 sont construits pour que le résultat attendu soit écrit
// dans le nom du verdict — et surtout pour que deux entrées DIFFÉRENTES
// donnent deux réponses différentes. Un adaptateur qui répondrait pareil à
// tout (le signe d'alerte des trois sondes fausses d'août) échoue ici.
import {
  greffer, signaux, degreDuRang, idDeDepot, libelleDegre, DEGRES,
} from '../js/adaptateur-finubar.mjs';
import { NOEUDS, chemin, verifierRegistre } from '../js/registre-lv3.mjs';
import { BLASONS } from '../js/blasons.mjs';

let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs += 1; }
}

// Un projet de l'agrégat, réduit à ce que l'adaptateur lit.
const P = (projet, depot, etat, rang, ciel) => ({
  ok: true, depot, ciel, rang,
  grain: { projet, depot, etat, jalon: { nom: 'jalon de ' + projet }, cap: 'cap de ' + projet },
});
const AGREGAT = {
  projets: [
    P('RénoAgenda', 'x/RenoAgenda', 'en_attente_de_paul', 1, 'renoboost-ia'),
    P('RénoDevis', 'x/RenoDevis', 'en_cours', 2, 'renoboost-ia'),
    P('Ultima', 'x/Ultima-', 'en_cours', 2, 'racine'),
    P('Ailleurs', 'x/Ailleurs', 'au_repos', 3, 'alpha'),
    P('Inconnu', 'x/Inconnu', 'en_cours', 2, 'ce-noeud-nexiste-pas'),
    { ok: false, depot: 'x/HorsSeance', ciel: 'alpha', rang: 9, grain: null, hors_seance: true },
  ],
};

// ---------------------------------------------------------------- §1 la greffe
console.log('§1 — la greffe : les projets deviennent des astres');
{
  const R = greffer(NOEUDS, AGREGAT);

  verifier('le registre d\'origine n\'est PAS modifié en place',
    !Array.isArray(NOEUDS['renoboost-ia'].enfants),
    'sans quoi deux rendus successifs porteraient les astres en double');

  verifier('les deux briques s\'accrochent à RENOBOOST IA',
    (R['renoboost-ia'].enfants || []).includes(idDeDepot('x/RenoAgenda'))
    && (R['renoboost-ia'].enfants || []).includes(idDeDepot('x/RenoDevis')));

  verifier('le projet accroché à « racine » n\'a PAS d\'étoile',
    R[idDeDepot('x/Ultima-')] === undefined,
    'se peindre au milieu de sa propre carte n\'ajoute aucune information');

  verifier('un projet accroché à un nœud INCONNU tombe sous ALPHA (il ne disparaît pas)',
    (R.alpha.enfants || []).includes(idDeDepot('x/Inconnu')));

  verifier('un dépôt illisible ou hors séance ne devient pas une étoile',
    R[idDeDepot('x/HorsSeance')] === undefined,
    'un angle mort de l\'observateur n\'est pas un fait sur le projet');

  // ⛔ LE VERDICT QUI PROTÈGE LA PORTE. RENOBOOST IA ouvrait renoboostia.fr ;
  // devenu constellation, il ISOLE au lieu d'ouvrir. Sans ce cap, le site
  // deviendrait inatteignable en silence.
  const porte = R['porte:renoboost-ia'];
  verifier('la cible du parent survit à la greffe, en cap à part',
    Boolean(porte) && porte.cible === NOEUDS['renoboost-ia'].cible && porte.externe === true);
  verifier('cette porte est le PREMIER cap, avant les projets',
    R['renoboost-ia'].enfants[0] === 'porte:renoboost-ia');

  verifier('un astre n\'a pas de cible (c\'est un état, pas une porte)',
    R[idDeDepot('x/RenoAgenda')].cible === null);
  verifier('l\'état est traduit en français lisible',
    R[idDeDepot('x/RenoAgenda')].etat === 'Attend un geste'
    && R[idDeDepot('x/RenoDevis')].etat === 'En cours');

  // Le registre augmenté doit rester COHÉRENT : c'est le contrat que le moteur
  // du ciel et la coque supposent tous les deux.
  const anomalies = verifierRegistre(R, BLASONS, null);
  verifier('le registre greffé passe sa propre vérification de cohérence',
    anomalies.length === 0, anomalies.join(' | '));

  // Deux entrées différentes → deux réponses différentes.
  const vide = greffer(NOEUDS, { projets: [] });
  verifier('un agrégat VIDE laisse le registre strictement inchangé',
    JSON.stringify(Object.keys(vide)) === JSON.stringify(Object.keys(NOEUDS))
    && vide['renoboost-ia'].enfants === undefined);
  verifier('un agrégat absent ne lève pas', Object.keys(greffer(NOEUDS, null)).length > 0);
}

// ---------------------------------------------------------------- §2 les signaux
console.log('§2 — les signaux, propagés vers le haut');
{
  const R = greffer(NOEUDS, AGREGAT);
  const S = signaux(R, AGREGAT, chemin);

  verifier('un projet qui attend un geste appelle en OR',
    S[idDeDepot('x/RenoAgenda')].degre === 'appel');
  verifier('un projet en cours est une BRAISE, pas un appel',
    S[idDeDepot('x/RenoDevis')].degre === 'braise');
  verifier('un projet au repos ne porte AUCUN signal',
    S[idDeDepot('x/Ailleurs')] === undefined,
    'l\'absence de couleur est un silence, jamais une note');

  verifier('le parent hérite du degré le plus fort de sa descendance',
    S['renoboost-ia'].degre === 'appel' && DEGRES.appel > DEGRES.braise);
  verifier('la couleur monte jusqu\'à la supra-division',
    S.alpha.degre === 'appel');
  verifier('le compte est celui des projets, sans doublon',
    S['renoboost-ia'].compte === 2, JSON.stringify(S['renoboost-ia']));

  verifier('la racine n\'est jamais peinte (elle n\'a pas d\'étoile)',
    S.racine === undefined);
  verifier('une branche sans projet reste éteinte',
    S['ultima-perso'] === undefined && S.naga === undefined && S.grima === undefined,
    'sinon tout s\'allume, et plus rien n\'appelle');

  // Le cas de référence qui interdit la réponse uniforme : sans projet en
  // attente, ALPHA doit changer de degré — pas rester or.
  const calme = { projets: [P('RénoDevis', 'x/RenoDevis', 'en_cours', 2, 'renoboost-ia')] };
  const Sc = signaux(greffer(NOEUDS, calme), calme, chemin);
  verifier('sans geste en attente, ALPHA passe en braise (la réponse n\'est pas uniforme)',
    Sc.alpha.degre === 'braise');
  verifier('un agrégat vide n\'allume rien du tout',
    Object.keys(signaux(NOEUDS, { projets: [] }, chemin)).length === 0);
}

// ------------------------------------------------------------- §3 la traduction
console.log('§3 — du rang au degré, et le libellé dit au lecteur d\'écran');
{
  verifier('rang 0 (a dérivé) → à recaler', degreDuRang(0) === 'recaler');
  verifier('rang 1 (attend Paul) → appel', degreDuRang(1) === 'appel');
  verifier('rang 2 (en cours) → braise', degreDuRang(2) === 'braise');
  verifier('rang 3 (au repos) → rien', degreDuRang(3) === null);
  verifier('rang 9 (illisible / hors séance) → rien, JAMAIS un signal',
    degreDuRang(9) === null,
    'peindre un angle mort le transformerait en constat sur le projet');

  verifier('le libellé dit le compte, au singulier', libelleDegre('appel', 1).includes('1 projet attend'));
  verifier('… et au pluriel', libelleDegre('appel', 3).includes('3 projets attendent'));
  verifier('un degré inconnu ne fabrique pas de phrase', libelleDegre('bidon', 2) === '');

  // ⛔ Le ton. « Ultima compte, elle ne reproche pas » : aucun libellé produit
  // ici ne porte de jugement. Même liste que `MOTS_INTERDITS` de Finubar.
  const interdits = ['retard', 'échec', 'faute', 'seulement', 'oubli', 'négligé'];
  const tous = ['appel', 'recaler', 'braise'].map((d) => libelleDegre(d, 2)).join(' ').toLowerCase();
  verifier('aucun libellé ne porte de reproche',
    interdits.every((mot) => !tous.includes(mot)), tous);
}

console.log(echecs === 0 ? '\n=== unit-adaptateur-finubar : TOUT VERT ===' : `\n=== unit-adaptateur-finubar : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
