// SUPERVISION ET RÉEMPLOI — le sas de forme, sans dépendance.
//
// Remplace Ajv (décision de Paul, 31/10/2026 : aucune librairie nouvelle). Il
// interprète le SOUS-ENSEMBLE de JSON Schema employé par `CONTRAT.schema.json`
// et REFUSE tout le reste : un mot-clé ou un format inconnu lève une erreur au
// lieu d'être ignoré. C'est l'équivalent du mode strict d'Ajv — un contrat qui
// évoluerait sans que ce sas sache le lire ne doit pas passer en silence.
//
// Pur : aucun accès disque, réseau ou base. L'appelant fournit le schéma.
// Les erreurs portent un CHEMIN (`/sources/0/id`) et une raison, jamais la
// valeur reçue : une proposition peut contenir des données métier.
//
// Limites d'hôte (ajoutées au contrat, qui n'en fixe pas) : taille totale,
// nombre d'éléments par liste, longueur d'un texte. Une entrée hostile ne doit
// pas pouvoir coûter plus cher à contrôler qu'elle n'en vaut.

export const LIMITES_PAR_DEFAUT = Object.freeze({ maxOctets: 32768, maxElements: 20, maxLongueur: 4000 });

const MOTS_CLES = new Set([
  '$schema', 'type', 'additionalProperties', 'required', 'properties',
  'enum', 'minLength', 'minItems', 'items', 'const', 'format',
]);
const TYPES = new Set(['object', 'string', 'array', 'boolean']);
const DATE_HEURE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?(Z|[+-](\d{2}):(\d{2}))$/i;

class SchemaNonPrisEnCharge extends Error {}

/** RFC 3339 `date-time` : forme exacte ET date réelle (pas de 30 février). */
export function estDateHeure(v) {
  if (typeof v !== 'string') return false;
  const m = DATE_HEURE.exec(v);
  if (!m) return false;
  const [an, mois, jour, h, min, s] = m.slice(1, 7).map(Number);
  if (mois < 1 || mois > 12 || jour < 1 || h > 23 || min > 59 || s > 60) return false;
  const joursDuMois = new Date(Date.UTC(an, mois, 0)).getUTCDate();
  if (jour > joursDuMois) return false;
  if (m[9] !== undefined && (Number(m[9]) > 23 || Number(m[10]) > 59)) return false;
  return Number.isFinite(Date.parse(v));
}

function estObjetSimple(v) {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

function typeOk(type, v) {
  if (type === 'object') return estObjetSimple(v);
  if (type === 'array') return Array.isArray(v);
  return typeof v === type;
}

function controler(schema, valeur, chemin, erreurs, limites) {
  if (!estObjetSimple(schema)) throw new SchemaNonPrisEnCharge(`schéma invalide en ${chemin || '/'}`);
  for (const cle of Object.keys(schema)) {
    if (!MOTS_CLES.has(cle)) throw new SchemaNonPrisEnCharge(`mot-clé non pris en charge : ${cle}`);
  }
  if (schema.type !== undefined && !TYPES.has(schema.type)) throw new SchemaNonPrisEnCharge(`type non pris en charge : ${schema.type}`);
  if (schema.format !== undefined && schema.format !== 'date-time') throw new SchemaNonPrisEnCharge(`format non pris en charge : ${schema.format}`);
  if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) {
    throw new SchemaNonPrisEnCharge('additionalProperties doit valoir false');
  }

  const ici = chemin || '/';
  if (schema.type !== undefined && !typeOk(schema.type, valeur)) {
    erreurs.push(`${ici} : type ${schema.type} attendu`);
    return;
  }
  if (schema.const !== undefined && valeur !== schema.const) erreurs.push(`${ici} : valeur imposée non respectée`);
  if (schema.enum !== undefined && !schema.enum.includes(valeur)) erreurs.push(`${ici} : valeur hors liste`);

  if (typeof valeur === 'string') {
    const longueur = [...valeur].length;
    if (schema.minLength !== undefined && longueur < schema.minLength) erreurs.push(`${ici} : texte trop court`);
    if (longueur > limites.maxLongueur) erreurs.push(`${ici} : texte trop long`);
    if (schema.format === 'date-time' && !estDateHeure(valeur)) erreurs.push(`${ici} : date-heure RFC 3339 attendue`);
  }

  if (Array.isArray(valeur)) {
    if (schema.minItems !== undefined && valeur.length < schema.minItems) erreurs.push(`${ici} : liste trop courte`);
    if (valeur.length > limites.maxElements) { erreurs.push(`${ici} : liste trop longue`); return; }
    if (schema.items !== undefined) valeur.forEach((el, i) => controler(schema.items, el, `${chemin}/${i}`, erreurs, limites));
  }

  if (estObjetSimple(valeur)) {
    const proprietes = schema.properties ?? {};
    for (const requis of schema.required ?? []) {
      if (!Object.hasOwn(valeur, requis)) erreurs.push(`${chemin}/${requis} : requis`);
    }
    for (const cle of Object.keys(valeur)) {
      if (!Object.hasOwn(proprietes, cle)) {
        if (schema.additionalProperties === false) erreurs.push(`${chemin}/${cle.slice(0, 64)} : champ non prévu`);
        continue;
      }
      controler(proprietes[cle], valeur[cle], `${chemin}/${cle}`, erreurs, limites);
    }
  }
}

/**
 * Vérifie une proposition déjà désérialisée contre le schéma du contrat.
 * Ne lève jamais sur une entrée hostile : seul un SCHÉMA hors sous-ensemble lève.
 * @returns {{ valide: boolean, erreurs: string[] }}
 */
export function verifierForme(proposition, schema, limites = LIMITES_PAR_DEFAUT) {
  const l = { ...LIMITES_PAR_DEFAUT, ...limites };
  let octets;
  try {
    octets = Buffer.byteLength(JSON.stringify(proposition) ?? '', 'utf8');
  } catch {
    return { valide: false, erreurs: ['/ : non sérialisable'] };
  }
  if (octets > l.maxOctets) return { valide: false, erreurs: ['/ : charge trop lourde'] };
  const erreurs = [];
  controler(schema, proposition, '', erreurs, l);
  return { valide: erreurs.length === 0, erreurs: [...new Set(erreurs)] };
}

export { SchemaNonPrisEnCharge };
