// Unitaires — route d'import par lots (api/_lib/import-personnes.js),
// CADRAGE-RIVEN-IMPORT.md critères C5, C6, C8. Client Supabase FACTICE :
// zéro réseau ; il enregistre ce qui aurait été écrit, pour prouver
// « rien n'est écrit » sur les refus structurels.
import { readFileSync } from 'node:fs';
import { importerPersonnes, LOT_MAX } from '../api/_lib/import-personnes.js';

const N_A = '11111111-2222-4333-8444-555555555555';
const N_AUTRUI = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

function clientFactice({ fichesVisibles = [N_A], echecInsert = false, echecLien = false } = {}) {
  const ecrits = { personnes: [], liens: [] };
  let seq = 0;
  const client = {
    ecrits,
    from(table) {
      return {
        select() {
          return { in: async (_c, ids) => ({ data: ids.filter((id) => fichesVisibles.includes(id)).map((id) => ({ id })), error: null }) };
        },
        insert(valeur) {
          const lignes = Array.isArray(valeur) ? valeur : [valeur];
          const resultat = () => {
            if (table === 'personnes' && echecInsert) return { data: null, error: { code: '23514' } };
            if (table === 'personne_noeuds' && echecLien) return { data: null, error: { code: '23503' } };
            const cible = table === 'personnes' ? ecrits.personnes : ecrits.liens;
            const ids = lignes.map((l) => { cible.push(l); return { id: `id-${++seq}` }; });
            return { data: ids, error: null };
          };
          return {
            select() {
              const r = resultat();
              const promesse = Promise.resolve(r);
              promesse.single = async () => ({ data: r.data ? r.data[0] : null, error: r.error });
              return promesse;
            },
          };
        },
      };
    },
  };
  return client;
}

const verdicts = {};

// Verrou de non-vacuité : un lot valide écrit bien.
{
  const c = clientFactice();
  const r = await importerPersonnes(c, { personnes: [{ nom: 'A' }, { nom: 'B', telephone: '+33612345601' }] });
  verdicts.nonVacuite = r.status === 200 && r.data.creees === 2 && c.ecrits.personnes.length === 2;
}

// C5 : une ligne invalide ne fait pas tomber le lot.
{
  const c = clientFactice();
  const lignes = Array.from({ length: 100 }, (_, i) => ({ nom: `P${i}` }));
  lignes[42] = { nom: 'X', email: 'pas-un-mail' };
  const r = await importerPersonnes(c, { personnes: lignes });
  verdicts.ligneInvalideIsolee = r.status === 200 && r.data.creees === 99 &&
    r.data.refusees.length === 1 && r.data.refusees[0].index === 42 && r.data.refusees[0].raison === 'Email invalide';
  verdicts.raisonSansContenu = !JSON.stringify(r.data).includes('pas-un-mail');
}

// C6 : refus STRUCTURELS → 400 et RIEN n'est écrit.
for (const [cas, corps, opts] of [
  ['lot101', { personnes: Array.from({ length: LOT_MAX + 1 }, (_, i) => ({ nom: `P${i}` })) }],
  ['lotVide', { personnes: [] }],
  ['pasUnTableau', { personnes: { nom: 'A' } }],
  ['cleEnTrop', { personnes: [{ nom: 'A' }], owner_id: N_A }],
  ['champInconnu', { personnes: [{ nom: 'A' }, { nom: 'B', owner_id: N_AUTRUI }] }],
  ['idForge', { personnes: [{ nom: 'A' }, { nom: 'B', id: N_A }] }],
  ['nodeIdMalforme', { personnes: [{ nom: 'A' }, { nom: 'B', node_id: "1' or 1=1" }] }],
  ['nodeIdAutrui', { personnes: [{ nom: 'A' }, { nom: 'B', node_id: N_AUTRUI }] }],
  ['ligneNull', { personnes: [{ nom: 'A' }, null] }],
]) {
  const c = clientFactice(opts);
  const r = await importerPersonnes(c, corps);
  verdicts[`refus_${cas}`] = r.status === 400 && c.ecrits.personnes.length === 0 && c.ecrits.liens.length === 0;
}

// Rattachement : fiche de l'utilisateur → personne + lien.
{
  const c = clientFactice();
  const r = await importerPersonnes(c, { personnes: [{ nom: 'A' }, { nom: 'B', node_id: N_A }] });
  verdicts.rattachement = r.status === 200 && r.data.creees === 2 && r.data.rattachees === 1 &&
    c.ecrits.liens.length === 1 && c.ecrits.liens[0].node_id === N_A && !('node_id' in c.ecrits.personnes[1]);
}
// Lien refusé par la base : la personne reste, l'échec est rapporté.
{
  const c = clientFactice({ echecLien: true });
  const r = await importerPersonnes(c, { personnes: [{ nom: 'B', node_id: N_A }] });
  verdicts.lienEchoueRapporte = r.status === 200 && r.data.creees === 1 && r.data.rattachees === 0 &&
    r.data.rattachementsEchoues.join() === '0';
}
// Échec base sur l'INSERT groupé → 500 générique, code seul transmis au log.
{
  const r = await importerPersonnes(clientFactice({ echecInsert: true }), { personnes: [{ nom: 'A' }] });
  verdicts.echecBase500 = r.status === 500 && r.error === 'Erreur interne' && r.dbError.code === '23514';
}

// C8 : le handler ne logue qu'un contexte et un code, jamais une ligne.
{
  const src = readFileSync(new URL('../api/reseau/import.js', import.meta.url), 'utf8');
  const logs = src.match(/logError\([^)]*\)/g) || [];
  verdicts.logsSansContenu = logs.length >= 2 && logs.every((l) => /\.code\)|\?\.name\)/.test(l));
}

let rouge = false;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '✅' : '❌'} ${nom}`);
  if (!ok) rouge = true;
}
if (rouge) process.exit(1);
