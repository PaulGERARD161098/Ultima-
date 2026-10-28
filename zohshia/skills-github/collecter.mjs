import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ici = dirname(fileURLToPath(import.meta.url));
export const racine = resolve(ici, '../..');
const digest = texte => createHash('sha256').update(texte).digest('hex');
const etatsWork = new Set(['installe_verifie', 'non_installe_personnellement']);
const etatsDepot = new Set(['prepare_sur_branche', 'present_dans_source', 'non_present_dans_source']);
const libelles = {
 installe_verifie: 'Installé et vérifié',
 non_installe_personnellement: 'Pas de copie personnelle constatée',
 prepare_sur_branche: 'Préparé sur cette branche',
 present_dans_source: 'Présent dans la source vérifiée',
 non_present_dans_source: 'Absent de cette source'
};
export function verifierCopieAmont(id, base = racine) {
 const dossier = join(base, '.claude', 'skills', id);
 const provenance = JSON.parse(readFileSync(join(dossier, 'references/provenance.json'), 'utf8'));
 if (!Array.isArray(provenance.files) || provenance.files.length < 4) throw Error('Références amont manquantes : ' + id);
 for (const fichier of provenance.files) {
  let relatif;
  if (fichier.path === 'LICENSE') relatif = 'LICENSE.txt';
  else {
   const prefixe = 'skills/' + id + '/';
   if (!fichier.path?.startsWith(prefixe) || fichier.path.split('/').includes('..')) throw Error('Chemin amont invalide');
   const fin = fichier.path.slice(prefixe.length);
   relatif = 'references/upstream/' + (fin === 'SKILL.md' ? 'source.md' : fin);
  }
  const octets = readFileSync(join(dossier, relatif));
  const empreinte = createHash('sha1').update(Buffer.from('blob ' + octets.length + '\0')).update(octets).digest('hex');
  if (empreinte !== fichier.blob_sha) throw Error('Source amont périmée : ' + id + '/' + relatif);
 }
 return provenance;
}
export function validerCatalogue(catalogue, base = racine) {
 if (catalogue?.schema_version !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(catalogue.date_verification || '') ||
     !Array.isArray(catalogue.skills) || !catalogue.skills.length || !Array.isArray(catalogue.pistes)) throw Error('Catalogue incomplet');
 const ids = new Set();
 for (const s of catalogue.skills) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id) || ids.has(s.id)) throw Error('Identifiant vide, invalide ou dupliqué');
  ids.add(s.id);
  for (const champ of ['label', 'famille', 'usage', 'invocation', 'limite']) {
   if (typeof s[champ] !== 'string' || !s[champ].trim() || s[champ].includes('|') || s[champ].includes('\n')) throw Error('Champ absent ou non affichable : ' + champ);
  }
  if (!s.invocation.includes(s.id)) throw Error('Invocation sans nom de compétence');
  if (!['github', 'assemblage'].includes(s.origine) || !etatsWork.has(s.installation?.work) || !etatsDepot.has(s.installation?.ultima)) throw Error('Statut inconnu');
  if (!Array.isArray(s.sources) || !s.sources.length || s.sources.some(p => !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(p.repository || '') || p.commit && !/^[a-f0-9]{40}$/.test(p.commit))) throw Error('Source invalide');
  if (s.installation.work === 'installe_verifie' && (!/^[a-f0-9]{64}$/.test(s.preuve_work?.sha256 || '') || s.preuve_work.le !== catalogue.date_verification)) throw Error('Installation personnelle sans preuve datée');
  if (s.installation.ultima !== 'non_present_dans_source') {
   const attendu = '.claude/skills/' + s.id + '/SKILL.md';
   if (s.preuve_ultima?.path !== attendu) throw Error('Chemin de compétence inattendu');
   const texte = readFileSync(join(base, attendu), 'utf8');
   const nom = /^name:\s*(.+)$/m.exec(texte)?.[1].trim().replace(/^["']|["']$/g, '');
   if (nom !== s.id || digest(texte) !== s.preuve_ultima.sha256) throw Error('Preuve de compétence périmée : ' + s.id);
   if (['emails', 'copy-editing', 'email-writer'].includes(s.id)) {
    const amont = verifierCopieAmont(s.id, base);
    if (amont.commit !== s.sources[0].commit || amont.upstream !== s.sources[0].repository) throw Error('Provenance incohérente : ' + s.id);
   }
  }
 }
 for (const p of catalogue.pistes) {
  if (!p.id || ids.has(p.id) || !['consulte_non_installe', 'piste_non_installee'].includes(p.statut) || !p.description) throw Error('Piste ambiguë ou présentée comme installation');
  ids.add(p.id);
 }
 return catalogue;
}
export function documents(c) {
 const date = c.date_verification;
 const externes = c.skills.filter(s => s.origine === 'github').length;
 const assemblages = c.skills.filter(s => s.origine === 'assemblage').length;
 let catalogue = '# Catalogue des compétences\n\n## Périmètre vérifié\n\nRelevé du ' + date + ' : ' + externes + ' compétences récupérées via des dépôts, ' + assemblages + ' assemblages internes et ' + c.pistes.length + ' pistes séparées. Les capacités d’exécution restent à éprouver dans chaque projet.\n\nLes états sont datés et propres à chaque environnement. Une lecture passée ne signifie pas une installation.\n\n';
 for (const famille of [...new Set(c.skills.map(s => s.famille))]) {
  catalogue += '## ' + famille + '\n\n| Compétence | Utilité | Work | Dépôt source |\n|---|---|---|---|\n';
  for (const s of c.skills.filter(s => s.famille === famille)) catalogue += '| ' + s.id + ' | ' + s.usage + ' | ' + libelles[s.installation.work] + ' | ' + libelles[s.installation.ultima] + ' |\n';
  catalogue += '\n';
 }
 catalogue += '## Pistes non installées\n\n| Piste | État | Limite |\n|---|---|---|\n' + c.pistes.map(p => '| ' + p.label + ' | ' + p.statut + ' | ' + p.description + ' |').join('\n') + '\n\nCes pistes ne doivent pas être appelées comme des compétences installées.\n';
 const appels = '# Appeler les compétences\n\n## Demander le résultat\n\nExprimer le travail attendu et, si utile, le nom de la compétence. Choisir selon le besoin et les accès réels.\n\n## Exemples d’appel\n\n| Besoin | Formulation à réutiliser |\n|---|---|\n' + c.skills.map(s => '| ' + s.label + ' | ' + s.invocation + ' |').join('\n') +
 '\n\n## Choisir l’environnement\n\nDans Work, appeler la compétence personnelle par son nom ou le sélecteur de skills. Sur mobile, ouvrir Plugins puis Skills pour consulter les compétences installées.\n\nDans un environnement de développement ayant le dépôt, charger le SKILL.md indiqué et ses références utiles. Les copies de rédaction conservent leur licence et leur version amont. Vérifier la version du dépôt réellement chargée.\n\nDans Léo sur le site, le catalogue oriente la demande. Le résumé projeté ne remplace pas les guides complets. Si le guide ou les outils ne peuvent pas être chargés, Léo doit le dire. Cliquer sur une fiche n’exécute pas un moteur et n’accorde aucun droit.\n\n## Combinaisons utiles\n\n- Devis : emails pour le parcours, email-writer pour un échange individuel, copy-editing pour la révision.\n- Présentation : presentations-claires avec pitch-source et composition-editoriale.\n- Communauté : community-marketing pour le parcours, puis les compétences de thème et de blocs pour les changements techniques.\n- Contrôle : anti-pattern pour croiser les approches et une vérification adaptée au livrable.\n\n## Remettre à jour\n\nAprès chaque ajout ou retrait demandé, remesurer les environnements, actualiser le registre et régénérer les fiches. Ne changer la date qu’après une mesure réelle. Aucune routine permanente n’est activée.\n';
 const sources = '# Sources et limites\n\n## Registre de référence\n\nLe registre catalogue.json porte noms, utilités, appels, environnements, sources et preuves. Les fiches sont générées par collecter.mjs ; le mode --verifier refuse une copie périmée.\n\n## Sources par compétence\n\n| Compétence | Source constatée | Révision |\n|---|---|---|\n' +
 c.skills.map(s => '| ' + s.id + ' | ' + s.sources.map(p => p.repository + (p.path ? '/' + p.path : '')).join(' ; ') + ' | ' + s.sources.map(p => p.commit ? p.commit.slice(0, 12) : 'Import non retracé').join(' ; ') + ' |').join('\n') +
 '\n\n## Limites par compétence\n\n' + c.skills.map(s => '- ' + s.id + ' : ' + s.limite).join('\n') +
 '\n\n## Licences et réemploi\n\nLes trois compétences de rédaction conservent leur licence MIT et les sources documentaires. Les adaptations de présentation conservent leurs fichiers de provenance et leurs licences. Pour les autres copies, lire la licence du dossier avant redistribution. Aucun droit n’est déduit du seul hébergement dans un dépôt.\n\nLes anciennes compétences restent à leur emplacement. Les trois nouvelles copies dans le dépôt sont des instantanés des adaptations personnelles ; aucune synchronisation permanente n’est annoncée.\n\n## Couverture\n\n' + c.couverture + '\n\nLes états installés reposent sur une lecture courante de la bibliothèque ou du dépôt. Les services fournis par des plugins ne sont pas confondus avec des acquisitions de skills personnels.\n';
 return { 'CATALOGUE.md': catalogue, 'APPELER.md': appels, 'SOURCES.md': sources };
}
if (import.meta.url === 'file://' + process.argv[1]) {
 const c = validerCatalogue(JSON.parse(readFileSync(join(ici, 'catalogue.json'), 'utf8')));
 for (const [nom, contenu] of Object.entries(documents(c))) {
  const path = join(ici, nom);
  if (process.argv.includes('--verifier')) {
   if (readFileSync(path, 'utf8') !== contenu) throw Error('Fiche périmée : ' + nom);
  } else writeFileSync(path, contenu);
 }
 console.log('Catalogue vérifié : ' + c.skills.length + ' compétences, ' + c.pistes.length + ' pistes');
}

