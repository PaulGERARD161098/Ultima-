// Projection serveur du catalogue déjà publié : aucune seconde liste de technos.
// Seul l'aperçu des capacités est extrait ; aucun guide complet ni empreinte.
import stock from './zohshia-technos.mjs';

// 7000 → 9000 le 02/11/2026 : huit technos publiées pèsent 7134 caractères, le
// catalogue se déclarait « partielle » et en taisait une. 9000 laisse la place
// d'environ deux technos de plus ; coût : environ 550 tokens de plus par lecture
// du stock, et seulement quand Léo lit ce stock (Léo est en pause depuis le 01/11).
export const MAX_STOCK_ZOH_CHARS = 9000;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const texte = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;

function apercuCapacites(techno) {
  const onglet = techno.onglets.find(o => o.id === 'techno') || techno.onglets[0];
  if (!Array.isArray(onglet?.blocs)) return null;
  const paragraphes = onglet.blocs.filter(b => b?.t === 'p' && Array.isArray(b.r))
    .map(b => b.r.filter(r => Array.isArray(r) && typeof r[0] === 'string')
      .map(r => r[0]).join('').replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (!paragraphes.length) return null;
  const extrait = paragraphes.slice(0, 2).join(' ');
  return { texte: extrait.length > 900 ? extrait.slice(0, 899) + '…' : extrait,
    tronque: extrait.length > 900 || paragraphes.length > 2 };
}

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
      capacites_apercu: apercuCapacites(techno),
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
