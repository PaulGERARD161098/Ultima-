// Chargement sélectif des compétences métier de Léo par quadrant et intention.
// Garde la taille injectée dans le prompt serveur sous MAX_CARACTERES_SELECTION (9 000 car.)
// tout en activant automatiquement les binômes cohérents (packs de 2).
import { COMPETENCES_PAR_NOM } from './leo-competences.mjs';

export const MAX_CARACTERES_SELECTION = 10000;
export const MAX_COMPETENCES_ACTIVES = 4;

// Socle toujours actif : garde-fous anti-injection, zéro IBAN, synthèse concise.
const SOCLE = 'administratif';

// Compétences par défaut selon le quadrant actif (quand aucun déclencheur ne couvre tout).
const DEFAUT_PAR_QUADRANT = Object.freeze({
  direction: ['rythme-direction', 'arbitrage-direction'],
  'sola-air-paris': ['achats-chantier', 'suivi-sous-traitants'],
  amo: ['achats-chantier', 'suivi-sous-traitants'],
  'renoboost-ia': ['email-naturel', 'brief-interlocuteur'],
});

// Binômes cohérents (packs de 2) : activer l'un appelle son complément s'il reste du budget.
const BINOMES = Object.freeze({
  'rythme-direction': 'arbitrage-direction',
  'arbitrage-direction': 'rythme-direction',
  'compte-rendu-express': 'email-naturel',
  'email-naturel': 'compte-rendu-express',
  'suivi-sous-traitants': 'achats-chantier',
  'achats-chantier': 'suivi-sous-traitants',
  'brief-interlocuteur': 'preparation-reunion',
  'preparation-reunion': 'brief-interlocuteur',
});

// Déclencheurs déterministes sur la demande de Paul (texte normalisé sans accents).
const DECLENCHEURS = Object.freeze([
  ['achats-chantier', /\b(achat|achats|fourniture|fournitures|goulotte|goulottes|condensat|condensats|cable|cables|devis fournisseur|qui achete|100\s*%|chantier 100)\b/],
  ['suivi-sous-traitants', /\b(sous-traitant|sous-traitants|prestataire|prestataires|poseur|poseurs|decennale|rc pro|facture|ecart|relance.*(devis|facture|prestataire|poseur)|retard.*(chantier|pose))\b/],
  ['rythme-direction', /\b(brief|matinal|matin|journee|priorites|revue hebdo|hebdo|vendredi|bilan de la semaine|arbitrages lundi)\b/],
  ['arbitrage-direction', /\b(arbitr\w*|hesite|avocat du diable|risques|angle mort|angles morts|trancher|challeng\w*|pour ou contre|options)\b/],
  ['compte-rendu-express', /\b(compte[- ]rendu|cr|notes brutes|sortie de|apres[- ](reunion|appel|rdv|chantier)|decisions prises|synthese de reunion)\b/],
  ['email-naturel', /\b(mail|email|courriel|message|sms|whatsapp|repondre|relancer|ecrire a|brouillon|ton naturel|humaniser)\b/],
  ['preparation-reunion', /\b(reunion|rdv|rendez-vous|ordre du jour|preparer.*(appel|visio|point|entretien|reunion))\b/],
  ['brief-interlocuteur', /\b(interlocuteur|prospect|profil|qui est|avant.*(rdv|rencontre|appel)|linkedin|accroche|accroches)\b/],
]);

function normaliser(texte) {
  if (typeof texte !== 'string') return '';
  return texte.toLocaleLowerCase('fr').normalize('NFD').replace(/\p{M}/gu, '');
}

export function extraireTexteDemande(messages) {
  if (!Array.isArray(messages)) return '';
  const recents = [];
  for (let i = messages.length - 1; i >= 0 && recents.length < 2; i--) {
    const m = messages[i];
    if (m?.role !== 'user') continue;
    if (typeof m.content === 'string') {
      recents.push(m.content);
    } else if (Array.isArray(m.content)) {
      const morceaux = m.content
        .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
        .map((b) => b.text);
      if (morceaux.length > 0) recents.push(morceaux.join(' '));
    }
  }
  return recents.join(' ');
}

export function selectionnerCompetences(quadrant, demande = '') {
  const texteDemande = Array.isArray(demande) ? extraireTexteDemande(demande) : demande;
  const ordre = [];
  const ajouter = (nom) => {
    if (!nom || !COMPETENCES_PAR_NOM[nom] || ordre.includes(nom)) return;
    ordre.push(nom);
  };

  // 1. Socle toujours présent.
  ajouter(SOCLE);

  // 2. Compétences déclenchées par l'intention de Paul (+ leur binôme cohérent).
  const normalise = normaliser(texteDemande);
  const declenchees = [];
  if (normalise) {
    for (const [nom, regex] of DECLENCHEURS) {
      if (regex.test(normalise)) {
        declenchees.push(nom);
        ajouter(nom);
      }
    }
    for (const nom of declenchees) {
      ajouter(BINOMES[nom]);
    }
  }

  // 3. Complément par affinité de quadrant (sans écraser les déclencheurs explicites).
  const defauts = DEFAUT_PAR_QUADRANT[quadrant] || ['email-naturel'];
  for (const nom of defauts) {
    ajouter(nom);
  }

  // 4. Assemblage strictement borné en nombre et en caractères.
  const retenues = [];
  let taille = 0;
  for (const nom of ordre) {
    if (retenues.length >= MAX_COMPETENCES_ACTIVES) break;
    const bloc = COMPETENCES_PAR_NOM[nom];
    const ajout = (retenues.length > 0 ? 2 : 0) + bloc.length;
    if (taille + ajout > MAX_CARACTERES_SELECTION) continue;
    retenues.push(nom);
    taille += ajout;
  }

  return {
    noms: retenues,
    texte: retenues.map((nom) => COMPETENCES_PAR_NOM[nom]).join('\n\n'),
  };
}
