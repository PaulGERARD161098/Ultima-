// L'ordre relevé dans le registre fait foi, même s'il diffère des noms.
// Une liste complète, non vide et sans doublons est obligatoire avant rejeu.
export function erreursOrdre(presentes, ordre) {
  if (!Array.isArray(ordre) || !ordre.length || ordre.some(n => typeof n !== 'string' || !n.endsWith('.sql'))) return ['ordre relevé absent ou invalide'];
  const erreurs = [];
  if (!presentes.length) erreurs.push('aucune migration lue au commit — dépôt non récupéré ?');
  if (new Set(ordre).size !== ordre.length) erreurs.push('doublon dans l’ordre relevé');
  const absentes = presentes.filter(n => !ordre.includes(n));
  const disparues = ordre.filter(n => !presentes.includes(n));
  if (absentes.length) erreurs.push(`migrations sans place relevée : ${absentes.join(', ')} — relever leur ordre dans la base de référence`);
  if (disparues.length) erreurs.push(`migrations relevées mais absentes du commit : ${disparues.join(', ')}`);
  return erreurs;
}
