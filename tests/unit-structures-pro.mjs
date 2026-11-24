// Tests unitaires et adverses — socle multi-structures pro (Boucle 1).
// Node pur, zéro réseau, zéro base réelle.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  STRUCTURES_PRO,
  IDS_STRUCTURES_PRO,
  VUE_DIRECTION,
  estStructurePro,
  normaliserScopePro,
  normaliserStructurePro,
  validerCreationTache,
  validerMajTache,
  validerCreationDossier,
  validerMajDossier,
  validerCreationDocument,
  validerFilLeo,
  filtrerParStructure,
  synthetiserDirection
} from '../api/_lib/structures-pro.mjs';
import { creerHandler } from '../api/pro-pilotage.js';

const UUID_1 = '11111111-1111-4111-8111-111111111111';
const UUID_2 = '22222222-2222-4222-8222-222222222222';
const UUID_3 = '33333333-3333-4333-8333-333333333333';

// ---------- 1. Registre canonique des 3 structures ----------
assert.deepEqual(IDS_STRUCTURES_PRO, ['renoboost-ia', 'sola-air-paris', 'amo']);
assert.equal(estStructurePro('renoboost-ia'), true);
assert.equal(estStructurePro('sola-air-paris'), true);
assert.equal(estStructurePro('amo'), true);
assert.equal(estStructurePro('direction'), false);
assert.equal(estStructurePro('autre'), false);
assert.equal(normaliserScopePro(' DIRECTION '), 'direction');
assert.equal(normaliserScopePro('Sola-Air-Paris'), 'sola-air-paris');
assert.equal(normaliserScopePro('inconnue'), null);
assert.equal(normaliserStructurePro('direction'), null);

// ---------- 2. Validations pures fail-closed ----------
{
  // Création tâche refusée en scope direction ou structure inconnue
  assert.ok(validerCreationTache({ structure_id: 'direction', titre: 'Test' }).erreur);
  assert.ok(validerCreationTache({ structure_id: 'inconnue', titre: 'Test' }).erreur);
  // Date calendrier impossible refusée
  assert.ok(validerCreationTache({ structure_id: 'amo', titre: 'CR', echeance: '2026-02-30' }).erreur);
  // Création valide
  const okTache = validerCreationTache({
    structure_id: 'sola-air-paris',
    titre: '  Relancer devis clim Paris 16  ',
    type: 'relance',
    priorite: 'haute',
    echeance: '2026-11-25'
  });
  assert.equal(okTache.erreur, undefined);
  assert.equal(okTache.donnees.titre, 'Relancer devis clim Paris 16');
  assert.equal(okTache.donnees.structure_id, 'sola-air-paris');
}

{
  // Mise à jour tâche exige UUID + structure_id + au moins un champ
  assert.ok(validerMajTache({ id: 'pas-uuid', structure_id: 'amo', statut: 'fait' }).erreur);
  assert.ok(validerMajTache({ id: UUID_1, structure_id: 'direction', statut: 'fait' }).erreur);
  assert.ok(validerMajTache({ id: UUID_1, structure_id: 'amo' }).erreur);
  const okMaj = validerMajTache({ id: UUID_1, structure_id: 'amo', statut: 'en_cours' });
  assert.equal(okMaj.erreur, undefined);
  assert.deepEqual(okMaj.patch, { statut: 'en_cours' });
}

{
  // Dossiers & documents
  assert.ok(validerCreationDossier({ structure_id: 'direction', titre: 'Dossier' }).erreur);
  const okDos = validerCreationDossier({ structure_id: 'amo', titre: 'Chantier République' });
  assert.equal(okDos.erreur, undefined);
  assert.equal(okDos.donnees.statut, 'actif');
  assert.ok(validerMajDossier({ id: UUID_1, structure_id: 'amo' }).erreur);

  assert.ok(validerCreationDocument({
    structure_id: 'sola-air-paris',
    type: 'inconnu',
    titre: 'CR',
    contenu: 'Texte'
  }).erreur);
  const okDoc = validerCreationDocument({
    structure_id: 'sola-air-paris',
    type: 'compte_rendu',
    titre: 'CR associés 23/11',
    contenu: 'Décidé : lancement offre hiver.',
    dossier_id: UUID_2
  });
  assert.equal(okDoc.erreur, undefined);
  assert.equal(okDoc.donnees.dossier_id, UUID_2);
}

// ---------- 3. Garde défensive & synthèse Direction ----------
{
  const melange = [
    { id: UUID_1, structure_id: 'renoboost-ia', titre: 'Relance pro A', type: 'relance', priorite: 'haute', statut: 'a_faire', echeance: '2026-11-20' },
    { id: UUID_2, structure_id: 'sola-air-paris', titre: 'Point Matthieu', type: 'tache', priorite: 'normale', statut: 'en_cours', echeance: '2026-11-26' },
    { id: UUID_3, structure_id: 'amo', titre: 'CR maîtrise ouvrage', type: 'decision', priorite: 'haute', statut: 'bloque', echeance: '2026-11-24' }
  ];
  const seulSola = filtrerParStructure(melange, 'sola-air-paris');
  assert.equal(seulSola.length, 1);
  assert.equal(seulSola[0].structure_id, 'sola-air-paris');

  const synthese = synthetiserDirection({ taches: melange, dossiers: [], documents: [] }, '2026-11-23');
  assert.equal(synthese.scope, VUE_DIRECTION);
  assert.equal(synthese.structures.length, 3);
  const rb = synthese.structures.find((s) => s.id === 'renoboost-ia');
  const amo = synthese.structures.find((s) => s.id === 'amo');
  assert.equal(rb.compteurs.relances_dues, 1);
  assert.equal(amo.compteurs.bloquees, 1);
  assert.equal(synthese.priorites_transverses[0].structure_id, 'renoboost-ia');
  assert.equal(synthese.priorites_transverses[0].structure_nom, STRUCTURES_PRO['renoboost-ia'].nom);
}

// ---------- 4. Handler HTTP — tests d'étanchéité et garde-fous ----------
function creerFausseReponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    end(payload) {
      this.body = typeof payload === 'string' ? JSON.parse(payload) : payload;
      return this;
    }
  };
  return res;
}

function creerRequete({ method = 'GET', query = {}, body = undefined } = {}) {
  return {
    method,
    query,
    headers: body !== undefined ? { 'content-type': 'application/json' } : {},
    body
  };
}

function creerClientMemoire(etat, { fuiteVolontaire = false, erreurCode = null } = {}) {
  return {
    from(table) {
      const filtres = [];
      const chaine = {
        select() { return chaine; },
        eq(col, val) { filtres.push([col, val]); return chaine; },
        order() { return chaine; },
        insert(ligne) {
          return {
            select() {
              return {
                async single() {
                  if (erreurCode) return { data: null, error: { code: erreurCode } };
                  const creee = { id: UUID_3, ...ligne };
                  etat[table].push(creee);
                  return { data: creee, error: null };
                }
              };
            }
          };
        },
        update(patch) {
          const uFiltres = [];
          const uChaine = {
            eq(col, val) { uFiltres.push([col, val]); return uChaine; },
            async select() {
              if (erreurCode) return { data: null, error: { code: erreurCode } };
              const trouvees = etat[table].filter((r) => uFiltres.every(([c, v]) => r[c] === v));
              for (const r of trouvees) Object.assign(r, patch);
              return { data: trouvees, error: null };
            }
          };
          return uChaine;
        },
        then(resolve) {
          if (erreurCode) return resolve({ data: null, error: { code: erreurCode } });
          let lignes = [...(etat[table] || [])];
          if (!fuiteVolontaire) {
            lignes = lignes.filter((r) => filtres.every(([c, v]) => r[c] === v));
          }
          return resolve({ data: lignes, error: null });
        }
      };
      return chaine;
    }
  };
}

// 4a. Auth fail-closed + DELETE interdit
{
  const handler = creerHandler({ authentifier: async () => ({ status: 'unauthenticated' }) });
  const res = creerFausseReponse();
  await handler(creerRequete({ method: 'GET', query: { scope: 'direction' } }), res);
  assert.equal(res.statusCode, 401);

  const resDel = creerFausseReponse();
  await handler(creerRequete({ method: 'DELETE' }), resDel);
  assert.equal(resDel.statusCode, 405);
}

// 4b. Table absente → 503 explicite
{
  const client = creerClientMemoire({ pro_taches: [], pro_dossiers: [], pro_documents: [] }, { erreurCode: '42P01' });
  const handler = creerHandler({ authentifier: async () => ({ status: 'ok', client }) });
  const res = creerFausseReponse();
  await handler(creerRequete({ method: 'GET', query: { scope: 'amo' } }), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.cause, 'pilotage pro non installé');
}

// 4c. Étanchéité stricte : même si le client SQL fuit d'autres structures, la garde serveur les bloque
{
  const etat = {
    pro_taches: [
      { id: UUID_1, structure_id: 'renoboost-ia', titre: 'Tâche RB', type: 'tache', priorite: 'haute', statut: 'a_faire' },
      { id: UUID_2, structure_id: 'sola-air-paris', titre: 'Tâche Sola', type: 'relance', priorite: 'normale', statut: 'a_faire' },
      { id: UUID_3, structure_id: 'amo', titre: 'Tâche AMO', type: 'decision', priorite: 'haute', statut: 'en_cours' }
    ],
    pro_dossiers: [],
    pro_documents: []
  };
  const clientFuyard = creerClientMemoire(etat, { fuiteVolontaire: true });
  const handler = creerHandler({ authentifier: async () => ({ status: 'ok', client: clientFuyard }) });

  const resSola = creerFausseReponse();
  await handler(creerRequete({ method: 'GET', query: { scope: 'sola-air-paris' } }), resSola);
  assert.equal(resSola.statusCode, 200);
  assert.equal(resSola.body.data.taches.length, 1);
  assert.equal(resSola.body.data.taches[0].structure_id, 'sola-air-paris');

  // Tentative de PATCH croisé (modifier tâche RB en déclarant structure_id = amo) → 404
  const clientPropre = creerClientMemoire(etat);
  const handlerPropre = creerHandler({ authentifier: async () => ({ status: 'ok', client: clientPropre }) });
  const resCroise = creerFausseReponse();
  await handlerPropre(creerRequete({
    method: 'PATCH',
    body: { ressource: 'tache', id: UUID_1, structure_id: 'amo', statut: 'fait' }
  }), resCroise);
  assert.equal(resCroise.statusCode, 404);
  assert.equal(etat.pro_taches[0].statut, 'a_faire');

  // Tentative de POST en scope 'direction' → 400
  const resDirPost = creerFausseReponse();
  await handlerPropre(creerRequete({
    method: 'POST',
    body: { ressource: 'tache', structure_id: 'direction', titre: 'Interdit' }
  }), resDirPost);
  assert.equal(resDirPost.statusCode, 400);
}

// ---------- 4bis. Validation des fils Léo cloisonnés (pro_fils_leo) ----------
{
  assert.ok(validerFilLeo({ scope: 'inconnu', messages: [] }).erreur);
  assert.ok(validerFilLeo({ scope: 'amo', messages: [{ role: 'system', content: 'hack' }] }).erreur);
  assert.ok(validerFilLeo({ scope: 'amo', messages: [{ role: 'user', content: '   ' }] }).erreur);
  const okFil = validerFilLeo({
    scope: 'sola-air-paris',
    messages: [
      { role: 'user', content: '  Point sur Sola Air Paris  ' },
      { role: 'assistant', content: 'Voici les priorités.' }
    ]
  });
  assert.equal(okFil.erreur, undefined);
  assert.equal(okFil.donnees.scope, 'sola-air-paris');
  assert.equal(okFil.donnees.messages.length, 2);
  assert.equal(okFil.donnees.messages[0].content, 'Point sur Sola Air Paris');
}

// ---------- 4ter. Contrôle santé VPS via /api/pro-pilotage?ressource=vps-health ----------
{
  const hEnLigne = creerHandler({
    authentifier: async () => ({ status: 'ok', client: creerClientMemoire({}) }),
    fetcher: async () => ({ ok: true, json: async () => ({ ok: true, service: 'leo-vps' }) })
  });
  const resOn = creerFausseReponse();
  await hEnLigne(creerRequete({ method: 'GET', query: { ressource: 'vps-health' } }), resOn);
  assert.equal(resOn.statusCode, 200);
  assert.equal(resOn.body.data.vps, 'en_ligne');

  const hHorsLigne = creerHandler({
    authentifier: async () => ({ status: 'ok', client: creerClientMemoire({}) }),
    fetcher: async () => { throw new Error('timeout'); }
  });
  const resOff = creerFausseReponse();
  await hHorsLigne(creerRequete({ method: 'GET', query: { ressource: 'vps-health' } }), resOff);
  assert.equal(resOff.statusCode, 200);
  assert.equal(resOff.body.data.vps, 'hors_ligne');
}

// ---------- 5. Contrôle statique du contrat SQL de la migration ----------
{
  const sql = readFileSync(
    new URL('../supabase/migrations/20261123180000_structures_pro_direction.sql', import.meta.url),
    'utf8'
  );
  for (const table of ['pro_taches', 'pro_dossiers', 'pro_documents', 'pro_fils_leo']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(sql, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated;`));
    assert.doesNotMatch(sql, new RegExp(`grant\\s+delete\\b[^;]*${table}`, 'i'));
  }
  // structure_id ne doit jamais apparaître dans un GRANT UPDATE
  const grantsUpdate = sql.match(/grant update \([^)]+\)/gi) || [];
  assert.ok(grantsUpdate.length === 4);
  for (const g of grantsUpdate) {
    assert.doesNotMatch(g, /\bstructure_id\b/i);
    assert.doesNotMatch(g, /\bowner_id\b/i);
  }
  // FK composite d'étanchéité entre pro_documents et pro_dossiers
  assert.match(sql, /foreign key \(dossier_id, owner_id, structure_id\)/i);
}

console.log('OK unit-structures-pro');
