// Projection serveur du catalogue déjà publié : aucune seconde liste de technos.
// Les guides complets, leurs blocs et les empreintes restent hors du prompt.
import stock from './zohshia-technos.mjs';

export const MAX_STOCK_ZOH_CHARS = 7000;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const texte = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;

export function decrireStockZoh(source = stock) {
  const disponible = Array.isArray(source?.technos);
  const catalogue = {
    provenance: 'catalogue_zoh_versionne',
    date_publication: /^\d{4}-\d{2}-\d{2}$/.test(source?.publie_le || '') ? source.publie_le : null,
    couverture: disponible ? 'complete' : 'indisponible',
    nombre_declare: disponible ? source.technos.length : null,
    technos: []
  };
  const ids = new Set();
  for (const techno of disponible ? source.technos : []) {
    if (!techno || !texte(techno.id, 100) || !ID.test(techno.id)
        || ids.has(techno.id) || !texte(techno.badge, 200) || !texte(techno.etat, 240)
        || !Array.isArray(techno.onglets)
        || techno.onglets.length > 12 || techno.onglets.some(o => !texte(o?.titre, 120))) {
      catalogue.couverture = 'partielle';
      continue;
    }
    ids.add(techno.id);
    catalogue.technos.push({
      id: techno.id,
      nom: techno.badge,
      etat_declare: techno.etat,
      onglets: techno.onglets.map(o => o.titre),
      fiche: 'zohshia.html#' + techno.id
    });
    if (JSON.stringify(catalogue).length > MAX_STOCK_ZOH_CHARS - 20) {
      catalogue.technos.pop();
      catalogue.couverture = 'partielle';
      break;
    }
  }
  return JSON.stringify(catalogue);
}
