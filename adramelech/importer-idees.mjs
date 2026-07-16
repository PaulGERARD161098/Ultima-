// Générateur du SEED SQL de la bibliothèque d'idées ADRAMELECH (AD-4).
//
// Rôle : produire, de façon DÉTERMINISTE et IDEMPOTENTE, le SQL qui peuple les
// tables `public.idees` et `public.idees_liens` (migration 0007) depuis le
// registre `adramelech/IDEES.md` (source unique de vérité). On NE réécrit pas le
// parseur : on RÉUTILISE `parseRegistre` / `detecterPonts` de generer-carto.mjs.
//
// GATÉ — CE SCRIPT N'EST PAS EXÉCUTÉ EN L'ÉTAT :
//   - Il n'y a pas encore de compte auth pour Paul, donc pas d'owner_id réel.
//   - L'owner_id est un ARGUMENT obligatoire (jamais en dur) ; le SQL généré
//     n'est appliqué qu'après validation Paul (gate migrations/données).
//   - Il n'écrit rien en base : il émet du SQL sur stdout. Appliquer = action
//     humaine explicite (Léo, après contre-passe), p.ex. via psql < seed.sql.
//
// Idempotence : INSERT ... ON CONFLICT DO UPDATE / DO NOTHING. Rejouable sans
// doublon ni perte — deuxième passage = mise à jour des champs, pas d'insertion
// parasite. Aucune PII n'est journalisée (le SQL est la sortie, pas un log).
//
// Usage :
//   node adramelech/importer-idees.mjs <owner_id_uuid> > seed-idees.sql
//   node adramelech/importer-idees.mjs <owner_id_uuid> --file adramelech/IDEES.md

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseRegistre, detecterPonts } from './generer-carto.mjs';

// UUID v4-ish (aligné sur api/_lib/validate.js — même forme acceptée en base).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Échappement littéral SQL : simple quote doublée. Renvoie NULL (non quoté) si
// la valeur est null/undefined/vide — jamais de chaîne vide silencieuse.
function sqlText(value) {
  if (value === null || value === undefined) return 'NULL';
  const s = String(value).trim();
  if (s === '') return 'NULL';
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) throw new Error(`Entier attendu, reçu « ${value} »`);
  return String(n);
}

// Construit le seed SQL complet, déterministe, pour un owner donné.
export function genererSeed(markdown, ownerId) {
  if (!UUID_RE.test(String(ownerId || ''))) {
    throw new Error(`owner_id invalide (UUID attendu) : « ${ownerId} »`);
  }
  const owner = sqlText(ownerId);

  const idees = parseRegistre(markdown); // throw si registre mal formé
  const ponts = detecterPonts(idees);    // paires non orientées, dédupliquées

  const lignes = [];
  lignes.push('-- SEED ADRAMELECH — généré depuis adramelech/IDEES.md (AD-4).');
  lignes.push('-- Idempotent : ON CONFLICT DO UPDATE / DO NOTHING. Rejouable.');
  lignes.push(`-- owner_id : passé en argument (jamais en dur dans le script).`);
  lignes.push(`-- ${idees.length} idée(s), ${ponts.length} pont(s).`);
  lignes.push('begin;');
  lignes.push('');

  // 1. Idées : upsert par clé métier (owner_id, adr_num). Le partenaire « — »
  //    du registre est traduit en NULL (aPartenaire = false → NULL).
  lignes.push('-- 1. Idées (upsert par clé métier owner_id + adr_num).');
  for (const idee of idees) {
    const partenaire = idee.aPartenaire ? idee.partenaire : null;
    const theme = idee.themeRaw || null;
    lignes.push(
      'insert into public.idees ' +
        '(owner_id, adr_num, nom, type, theme, statut, partenaire, epigraphe, essence) values (' +
        [
          owner,
          sqlInt(idee.num),
          sqlText(idee.nom),
          sqlText(idee.type),
          sqlText(theme),
          sqlText(idee.statut),
          sqlText(partenaire),
          sqlText(idee.epigraphe),
          sqlText(idee.essence),
        ].join(', ') +
        ')',
    );
    lignes.push(
      'on conflict (owner_id, adr_num) do update set ' +
        'nom = excluded.nom, type = excluded.type, theme = excluded.theme, ' +
        'statut = excluded.statut, partenaire = excluded.partenaire, ' +
        'epigraphe = excluded.epigraphe, essence = excluded.essence;',
    );
    lignes.push('');
  }

  // 2. Ponts : upsert par paire NON ORIENTÉE. Les idées ayant des UUID générés
  //    en base (inconnus ici), on résout source/target via la clé métier
  //    (owner_id, adr_num) par sous-requête. L'ON CONFLICT infère l'index
  //    d'expression idees_liens_paire_uniq (least/greatest) → idempotent.
  if (ponts.length) {
    lignes.push('-- 2. Ponts de synergie (upsert par paire non orientée).');
    const numDe = new Map(idees.map((i) => [i.id, i.num]));
    for (const pont of ponts) {
      const a = numDe.get(pont.a);
      const b = numDe.get(pont.b);
      if (a === undefined || b === undefined) continue; // pont vers idée absente
      lignes.push(
        'insert into public.idees_liens (owner_id, source_id, target_id)',
      );
      lignes.push(
        `select ${owner}, s.id, t.id ` +
          'from public.idees s, public.idees t ' +
          `where s.owner_id = ${owner} and s.adr_num = ${sqlInt(a)} ` +
          `and t.owner_id = ${owner} and t.adr_num = ${sqlInt(b)}`,
      );
      lignes.push(
        'on conflict (owner_id, least(source_id, target_id), ' +
          'greatest(source_id, target_id)) do nothing;',
      );
      lignes.push('');
    }
  }

  lignes.push('commit;');
  lignes.push('');
  return lignes.join('\n');
}

// ————————————————————————————————————————————————————————————————
// Exécution directe : lit IDEES.md, écrit le SQL sur stdout.
// ————————————————————————————————————————————————————————————————
function estExecuteDirectement() {
  return process.argv[1] && fileURLToPath(new URL(import.meta.url)) === process.argv[1];
}

if (estExecuteDirectement()) {
  const args = process.argv.slice(2);
  const ownerId = args.find((a) => !a.startsWith('--'));
  const fileFlag = args.indexOf('--file');
  const ici = fileURLToPath(new URL('.', import.meta.url));
  const source = fileFlag >= 0 && args[fileFlag + 1] ? args[fileFlag + 1] : `${ici}IDEES.md`;

  if (!ownerId) {
    process.stderr.write(
      'ÉCHEC seed ADRAMELECH : owner_id (UUID) requis en argument.\n' +
        'Usage : node adramelech/importer-idees.mjs <owner_id_uuid> [--file IDEES.md]\n',
    );
    process.exit(1);
  }

  try {
    const md = readFileSync(source, 'utf8');
    process.stdout.write(genererSeed(md, ownerId));
  } catch (e) {
    process.stderr.write(`ÉCHEC seed ADRAMELECH : ${e.message}\n`);
    process.exit(1);
  }
}
