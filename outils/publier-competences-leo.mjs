// Projection des compétences métier (.claude/skills) vers le prompt serveur de Léo.
// Pourquoi une projection et pas une lecture à l'exécution : `.vercelignore`
// exclut `*.md` du déploiement — un readFileSync du SKILL.md en production
// tomberait sur un fichier absent. Même chaîne que zohshia/anti-pattern/publier-leo.mjs.
// Usage : node outils/publier-competences-leo.mjs [--verifier]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// LISTE BLANCHE : seules les compétences métier utilisables sans outil de séance.
// Les compétences de développement (sécurité, tests, design…) n'entrent jamais.
// Organisées en socle + 3 packs de 2 cohérents entre eux (chargement sélectif au runtime).
export const COMPETENCES_PROJETEES = [
  'administratif',
  'achats-chantier',
  'preparation-reunion',
  // Pack 1 : Pilotage & Décision
  'rythme-direction',
  'arbitrage-direction',
  // Pack 2 : Communication & Réunions
  'email-naturel',
  'compte-rendu-express',
  // Pack 3 : Opérations & Interlocuteurs
  'suivi-sous-traitants',
  'brief-interlocuteur',
];

export const MAX_CARACTERES = 10000; // garde de coût PAR TOUR (chargement sélectif : ~2 500 tokens max)
export const MAX_CARACTERES_PAR_COMPETENCE = 5500; // borne individuelle d'un SKILL.md projeté (socle administratif = 5250 car.)
export const MAX_CARACTERES_CATALOGUE = 24000; // borne globale du catalogue projeté

const racine = new URL('../', import.meta.url);
const cible = new URL('api/_lib/leo-competences.mjs', racine);

// Corps d'un SKILL.md : sans frontmatter ni section « Origine » (l'attribution
// reste au dépôt ; le prompt ne garde que la procédure).
export function corps(texte, nom) {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(texte);
  if (!fm) throw new Error(`${nom} : frontmatter absent`);
  if (!new RegExp(`^name: ${nom}$`, 'm').test(fm[1])) throw new Error(`${nom} : name ≠ dossier`);
  const sansFm = texte.slice(fm[0].length);
  const coupe = sansFm.search(/^## Origine\s*$/m);
  const utile = (coupe === -1 ? sansFm : sansFm.slice(0, coupe)).trim();
  if (utile.length === 0) throw new Error(`${nom} : corps vide`); // verrou de non-vacuité
  return utile;
}

export function generer(lire = (chemin) => readFileSync(new URL(chemin, racine), 'utf8')) {
  const empreintes = {};
  const parNom = {};
  const blocs = [];
  for (const nom of COMPETENCES_PROJETEES) {
    const texte = lire(`.claude/skills/${nom}/SKILL.md`);
    empreintes[nom] = createHash('sha256').update(texte).digest('hex');
    const bloc = `### Compétence « ${nom} »\n${corps(texte, nom)}`;
    if (bloc.length > MAX_CARACTERES_PAR_COMPETENCE) {
      throw new Error(`Compétence « ${nom} » trop volumineuse (${bloc.length} > ${MAX_CARACTERES_PAR_COMPETENCE})`);
    }
    parNom[nom] = bloc;
    blocs.push(bloc);
  }
  const tout = blocs.join('\n\n');
  if (tout.length > MAX_CARACTERES_CATALOGUE) {
    throw new Error(`Compétences trop volumineuses (${tout.length} > ${MAX_CARACTERES_CATALOGUE})`);
  }
  return '// GÉNÉRÉ par outils/publier-competences-leo.mjs ; ne pas modifier à la main.\n'
    + `export const EMPREINTES_COMPETENCES = ${JSON.stringify(empreintes)};\n`
    + `export const COMPETENCES_PAR_NOM = ${JSON.stringify(parNom)};\n`
    + `export const COMPETENCES_LEO = ${JSON.stringify(tout)};\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const attendu = generer();
  if (process.argv.includes('--verifier')) {
    if (readFileSync(cible, 'utf8') !== attendu) throw new Error('Projection des compétences périmée : relancer outils/publier-competences-leo.mjs');
    console.log('Projection des compétences à jour');
  } else {
    writeFileSync(cible, attendu);
    console.log(`${COMPETENCES_PROJETEES.length} compétence(s) projetée(s) vers Léo`);
  }
}
