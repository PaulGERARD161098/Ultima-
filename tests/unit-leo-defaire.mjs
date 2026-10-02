// Unitaires — B1 ⑤, le défaire des écritures de Léo (cadrage §15).
// `api/_lib/leo-execution.js` contre une BASE FACTICE en mémoire : plusieurs
// tables, une RLS simulée (le client ne voit que les lignes de son
// propriétaire), des suppressions réelles. Zéro réseau.
//
// Critère B1-d (§15.3 ④) : CHAQUE type vert a son défaire JOUÉ — un contrôle
// rougit si un outil vert n'a pas le sien ; refus si une flamme est née sur le
// serment ; une trace défaite ne se re-défait pas.
import { readFileSync, readdirSync } from 'node:fs';
import {
  defaireEcriture,
  listerEcritures,
  DEFAIRES,
  DEPENDANCES,
  REFUS_DEFAIRE
} from '../api/_lib/leo-execution.js';
import { OUTILS_PAR_QUADRANT, anneauDe } from '../api/_lib/leo.js';
import { composerMatin, lignesLeo } from '../api/_lib/finubar-matin-corps.mjs';

const verdicts = {};
const PAUL = '11111111-2222-4333-8444-555555555555';
const AUTRUI = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const MAINTENANT = Date.parse('2026-10-02T09:00:00Z');
const IL_Y_A = (ms) => new Date(MAINTENANT - ms).toISOString();
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

// ---------- La base factice ----------
// `echecs` : tables dont la LECTURE échoue ; `echecSuppression` : la
// suppression échoue ; `voleur` : une autre requête supprime la cible juste
// avant la nôtre (la course).
function baseFactice(tables, { echecs = [], echecSuppression = false, voleur = false } = {}) {
  const t = {};
  for (const [nom, lignes] of Object.entries(tables)) t[nom] = lignes.map((l) => ({ owner_id: PAUL, ...l }));
  const inserts = [];
  const suppressions = [];
  function visibles(nom) { return (t[nom] || []).filter((l) => l.owner_id === PAUL); }
  function requete(nom, mode) {
    const filtres = [];
    let limite = Infinity;
    let unique = false;
    let ordre = null;
    const executer = () => {
      if (mode === 'select' && echecs.includes(nom)) return { data: null, error: { code: 'XX000' } };
      if (mode === 'delete' && echecSuppression) return { data: null, error: { code: 'XX000' } };
      let lignes = visibles(nom).filter((l) => filtres.every((f) => f(l)));
      if (ordre) lignes = lignes.slice().sort((a, b) => (ordre.asc ? 1 : -1) * String(a[ordre.col]).localeCompare(String(b[ordre.col])));
      lignes = lignes.slice(0, limite);
      if (mode === 'delete') {
        if (voleur) { t[nom] = t[nom].filter((l) => !lignes.includes(l)); lignes = []; }
        t[nom] = (t[nom] || []).filter((l) => !lignes.includes(l));
        suppressions.push(...lignes.map((l) => ({ table: nom, id: l.id })));
      }
      if (unique) return { data: lignes[0] || null, error: null };
      return { data: lignes.map((l) => ({ ...l })), error: null };
    };
    const q = {
      select() { return q; },
      eq(col, val) { filtres.push((l) => l[col] === val); return q; },
      in(col, vals) { filtres.push((l) => vals.includes(l[col])); return q; },
      gte(col, val) { filtres.push((l) => l[col] >= val); return q; },
      order(col, o = {}) { ordre = { col, asc: o.ascending !== false }; return q; },
      limit(n) { limite = n; return q; },
      maybeSingle() { unique = true; return q; },
      then(ok, ko) { return Promise.resolve(executer()).then(ok, ko); }
    };
    return q;
  }
  return {
    t, inserts, suppressions,
    from(nom) {
      return {
        select() { return requete(nom, 'select'); },
        delete() { return requete(nom, 'delete'); },
        insert(ligne) {
          inserts.push({ table: nom, ligne });
          (t[nom] = t[nom] || []).push({ ...ligne, owner_id: PAUL, le: new Date(MAINTENANT).toISOString() });
          return Promise.resolve({ error: null });
        }
      };
    }
  };
}

// Une trace réussie de l'outil `outil` sur `cible`, il y a une heure.
function trace(traceId, outil, cible, { owner = PAUL, phaseIssue = 'reussie', quadrant = 'adramelech', outilIssue = outil } = {}) {
  return [
    { owner_id: owner, trace_id: traceId, outil, quadrant, anneau: 'vert', phase: 'tentee', cible_id: null, le: IL_Y_A(3600e3) },
    ...(phaseIssue ? [{ owner_id: owner, trace_id: traceId, outil: outilIssue, quadrant, anneau: 'vert', phase: phaseIssue,
      cible_id: phaseIssue === 'reussie' ? cible : null, le: IL_Y_A(3599e3) }] : [])
  ];
}
const CREE = IL_Y_A(3600e3);
const defaire = (base, traceId) => defaireEcriture(base, PAUL, { etape: 'defaire', traceId });

// ---------- 1. LE CATALOGUE : chaque vert a son défaire, et rien d'autre ----------
const tousLesOutils = [...new Set(Object.values(OUTILS_PAR_QUADRANT).flat().map((o) => o.name))];
const verts = tousLesOutils.filter((n) => anneauDe(n) === 'vert').sort();
// Non-vacuité : le catalogue n'est pas vide, et il compte bien neuf verts.
verdicts.nonVacuiteCatalogue = tousLesOutils.length === 10 && verts.length === 9;
verdicts.chaqueVertASonDefaire = verts.join(',') === Object.keys(DEFAIRES).sort().join(',');
verdicts.enrichissementSansDefaire = !('proposer_enrichissement_idee' in DEFAIRES) &&
  anneauDe('proposer_enrichissement_idee') === 'orange';

// ---------- 2. LA TABLE DE CHAQUE DÉFAIRE EST CELLE QUE SA ROUTE SUPPRIME ----------
// On ne recopie pas : on demande au front l'URL de son plan, puis on lit dans
// le fichier de la route la table de sa branche DELETE.
{
  const fenetre = {};
  const source = readFileSync(new URL('../js/leo-accueil.js', import.meta.url), 'utf8');
  new Function('window', 'document', source)(fenetre, undefined);
  const { construirePlanExecution } = fenetre.UltimaLeo;
  const C = {
    cibles: [{ id: id(901), libelle: 'M. Lambert' }],
    chantiers: [{ id: id(902), libelle: 'Voltaire' }],
    serments: [{ id: id(903), libelle: 'Courir' }],
    situations: [{ id: id(904), libelle: 'Rachat' }],
    prochainAdrNum: 7
  };
  const ARGS = {
    proposer_idee: { titre: 'X' },
    proposer_besoin: { chantier_ref: 'Voltaire', libelle: 'Chaux' },
    proposer_journal: { cible_ref: 'M. Lambert', texte: 'x' },
    proposer_relance: { cible_ref: 'M. Lambert', echeance: '2026-10-09' },
    proposer_page_journal: { contenu: 'x' },
    proposer_serment: { intitule: 'x' },
    proposer_flamme: { serment_ref: 'Courir', texte: 'x' },
    proposer_situation: { intitule: 'x' },
    proposer_scenario: { situation_ref: 'Rachat', deroule: 'x' }
  };
  const ecarts = [];
  for (const outil of verts) {
    const plan = construirePlanExecution({ outil, args: ARGS[outil] }, C);
    if (!plan.ok || plan.methode !== 'POST') { ecarts.push(outil + ':plan'); continue; }
    const fichier = new URL('..' + plan.url.replace(/^\/api/, '/api') + '.js', import.meta.url);
    const route = readFileSync(fichier, 'utf8');
    const brancheDelete = route.slice(route.lastIndexOf('// DELETE'));
    const table = (brancheDelete.match(/\.from\('([a-z_]+)'\)\s*\.delete\(\)/) || [])[1];
    if (!table || table !== DEFAIRES[outil].table) ecarts.push(outil + ':' + table);
  }
  verdicts.tableDeLaRoute = ecarts.length === 0;
  if (ecarts.length) console.error('écarts table/route :', ecarts);
}

// ---------- 3. LE RELEVÉ EST EXHAUSTIF : chaque clé étrangère des migrations y est ----------
{
  const CIBLES = Object.keys(DEPENDANCES);
  const dossier = new URL('../supabase/migrations/', import.meta.url);
  const trouvees = new Set();
  for (const nom of readdirSync(dossier).filter((f) => f.endsWith('.sql')).sort()) {
    const sql = readFileSync(new URL(nom, dossier), 'utf8').replace(/--[^\n]*/g, '');
    const re = /references\s+(?:public\.)?([a-z_]+)\s*\(([^)]*)\)/gi;
    let m;
    while ((m = re.exec(sql))) {
      const cible = m[1].toLowerCase();
      if (!CIBLES.includes(cible)) continue;
      const avant = sql.slice(0, m.index);
      const ctx = [...avant.matchAll(/(?:create\s+table\s+(?:if\s+not\s+exists\s+)?|alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?)(?:public\.)?([a-z_]+)/gi)].at(-1);
      const source = ctx ? ctx[1].toLowerCase() : '?';
      const refs = m[2].split(',').map((x) => x.trim().toLowerCase());
      const fk = avant.match(/foreign\s+key\s*\(([^)]*)\)\s*$/i);
      const cols = fk ? fk[1].split(',').map((x) => x.trim().toLowerCase())
        : [(avant.slice(avant.lastIndexOf('\n') + 1).match(/^\s*([a-z_]+)\s/i) || [])[1]?.toLowerCase()];
      const colonne = cols[refs.indexOf('id')];
      trouvees.add(`${cible}<-${source}.${colonne}`);
    }
  }
  const releve = new Set(Object.entries(DEPENDANCES).flatMap(([c, deps]) => deps.map((d) => `${c}<-${d.table}.${d.colonne}`)));
  // Non-vacuité : un analyseur qui ne trouve rien serait « inclus » partout.
  verdicts.nonVacuiteMigrations = trouvees.size >= 10;
  verdicts.releveCouvreLesMigrations = [...trouvees].every((x) => releve.has(x));
  verdicts.releveSansFantome = [...releve].every((x) => trouvees.has(x));
  if (!verdicts.releveCouvreLesMigrations || !verdicts.releveSansFantome) {
    console.error('migrations :', [...trouvees].sort(), '\nrelevé :', [...releve].sort());
  }
  // Le fichier de relevé dit la même chose que la constante.
  const fichier = readFileSync(new URL('../supabase/releves/20261002_leo_defaire_dependances.RELEVE.sql', import.meta.url), 'utf8');
  const lignes = [...fichier.matchAll(/^-- ([a-z_]+)\s+\| ([a-z_]+)\s+\| ([a-z_]+)\s+\| [cn]$/gm)]
    .map((x) => `${x[1]}<-${x[2]}.${x[3]}`);
  verdicts.fichierReleveCoincide = lignes.length === releve.size && lignes.every((x) => releve.has(x));
  // Le dry run du 02/10 : la règle « set null » est bien couverte.
  verdicts.advenuCouvert = releve.has('scenarios<-situations.scenario_advenu_id');
}

// ---------- 4. CHAQUE TYPE VERT : son défaire JOUÉ, de bout en bout ----------
{
  const TABLE_CIBLE = Object.fromEntries(Object.entries(DEFAIRES).map(([o, d]) => [o, d.table]));
  const echecs = [];
  let n = 0;
  for (const outil of verts) {
    n += 1;
    const traceId = id(100 + n);
    const cible = id(200 + n);
    const table = TABLE_CIBLE[outil];
    const base = baseFactice({
      leo_ecritures: trace(traceId, outil, cible),
      [table]: [{ id: cible, created_at: CREE, updated_at: CREE, node_id: id(901), serment_id: id(903), situation_id: id(904) }]
    });
    const r = await defaire(base, traceId);
    const defaite = base.inserts.find((i) => i.table === 'leo_ecritures');
    const ok = r.status === 200 && r.data.defaite === true && r.data.journalise === true &&
      base.suppressions.length === 1 && base.suppressions[0].table === table && base.suppressions[0].id === cible &&
      base.t[table].length === 0 &&
      defaite && defaite.ligne.phase === 'defaite' && defaite.ligne.cible_id === cible &&
      defaite.ligne.outil === outil && defaite.ligne.trace_id === traceId;
    if (!ok) echecs.push(outil);
    // Re-défaire la même trace : refusé, et rien ne bouge.
    const avant = base.inserts.length;
    const re = await defaire(base, traceId);
    if (!(re.status === 409 && re.message === REFUS_DEFAIRE.deja && base.inserts.length === avant)) echecs.push(outil + ':re');
  }
  verdicts.neufDefairesJoues = n === 9 && echecs.length === 0;
  if (echecs.length) console.error('défaires en échec :', echecs);
}

// ---------- 5. LES REFUS : rien n'est supprimé, rien n'est posé ----------
async function refuse(tables, traceId, attendu, opts) {
  const base = baseFactice(tables, opts);
  const r = await defaire(base, traceId);
  const intact = base.suppressions.length === 0 && base.inserts.length === 0;
  return { ok: r.status === attendu.status && (!attendu.message || r.message === attendu.message) && intact, r };
}
const T = id(1); const S = id(2); const F = id(3);
{
  // Une flamme est née sur le serment.
  const flamme = await refuse({
    leo_ecritures: trace(T, 'proposer_serment', S, { quadrant: 'imladrik' }),
    serments: [{ id: S, created_at: CREE, updated_at: CREE }],
    flammes: [{ id: F, serment_id: S }]
  }, T, { status: 409, message: 'Lié : flammes' });
  verdicts.flammeBloqueLeSerment = flamme.ok;

  // Le scénario a été marqué « advenu » : `set null`, pas de cascade — refusé quand même.
  const advenu = await refuse({
    leo_ecritures: trace(T, 'proposer_scenario', S, { quadrant: 'imladrik' }),
    scenarios: [{ id: S, situation_id: id(904) }],
    situations: [{ id: id(904), scenario_advenu_id: S }]
  }, T, { status: 409, message: 'Lié : situations' });
  verdicts.advenuBloqueLeScenario = advenu.ok;

  // Une idée liée à une autre.
  const lien = await refuse({
    leo_ecritures: trace(T, 'proposer_idee', S),
    idees: [{ id: S, created_at: CREE, updated_at: CREE }],
    idees_liens: [{ id: F, source_id: id(77), target_id: S }]
  }, T, { status: 409, message: 'Lié : idees_liens' });
  verdicts.lienBloqueLIdee = lien.ok;

  // Une page reliée à un serment par une passerelle.
  const passerelle = await refuse({
    leo_ecritures: trace(T, 'proposer_page_journal', S, { quadrant: 'imladrik' }),
    imladrik_entrees: [{ id: S, created_at: CREE, updated_at: CREE }],
    serment_liens: [{ id: F, serment_id: id(5), entree_id: S }]
  }, T, { status: 409, message: 'Lié : serment_liens' });
  verdicts.passerelleBloqueLaPage = passerelle.ok;

  // Retouchée à la main depuis : la défaire effacerait la retouche de Paul.
  const retouche = await refuse({
    leo_ecritures: trace(T, 'proposer_idee', S),
    idees: [{ id: S, created_at: CREE, updated_at: IL_Y_A(60e3) }]
  }, T, { status: 409, message: REFUS_DEFAIRE.retouchee });
  verdicts.retoucheeRefusee = retouche.ok;
  const horodatageIllisible = await refuse({
    leo_ecritures: trace(T, 'proposer_idee', S),
    idees: [{ id: S, created_at: CREE, updated_at: null }]
  }, T, { status: 409, message: REFUS_DEFAIRE.retouchee });
  verdicts.horodatageIllisibleRefuse = horodatageIllisible.ok;

  // L'enrichissement (vert avant le 02/10) : sa cible est une idée DE PAUL.
  const enrichi = await refuse({
    leo_ecritures: trace(T, 'proposer_enrichissement_idee', S),
    idees: [{ id: S, created_at: CREE, updated_at: CREE }]
  }, T, { status: 409, message: REFUS_DEFAIRE.geste });
  verdicts.enrichissementNeSeDefaitPas = enrichi.ok;

  // Une issue qui change d'outil en route (forgée par PostgREST) : refusée.
  const forge = await refuse({
    leo_ecritures: trace(T, 'proposer_flamme', S, { outilIssue: 'proposer_serment' }),
    serments: [{ id: S, created_at: CREE, updated_at: CREE }]
  }, T, { status: 409, message: REFUS_DEFAIRE.geste });
  verdicts.issueForgeeRefusee = forge.ok;

  // La trace d'AUTRUI : invisible sous la RLS — inconnue, rien ne bouge.
  const autrui = await refuse({
    leo_ecritures: trace(T, 'proposer_idee', S, { owner: AUTRUI }),
    idees: [{ id: S, owner_id: AUTRUI, created_at: CREE, updated_at: CREE }]
  }, T, { status: 404 });
  verdicts.traceDAutruiInconnue = autrui.ok;

  // Un échec, une tentative seule : rien à défaire.
  const echec = await refuse({ leo_ecritures: trace(T, 'proposer_idee', S, { phaseIssue: 'echouee' }) },
    T, { status: 409, message: REFUS_DEFAIRE.rien });
  const seule = await refuse({ leo_ecritures: trace(T, 'proposer_idee', S, { phaseIssue: null }) },
    T, { status: 409, message: REFUS_DEFAIRE.rien });
  verdicts.rienADefaire = echec.ok && seule.ok;

  // La cible a déjà disparu (Paul l'a supprimée lui-même) : 404, aucune défaite posée.
  const disparue = await refuse({ leo_ecritures: trace(T, 'proposer_idee', S), idees: [] },
    T, { status: 404, message: REFUS_DEFAIRE.disparue });
  verdicts.cibleDisparue = disparue.ok;

  // ⛔ FAIL-CLOSED : ne pas pouvoir lire les flammes, c'est refuser.
  const aveugle = await refuse({
    leo_ecritures: trace(T, 'proposer_serment', S, { quadrant: 'imladrik' }),
    serments: [{ id: S, created_at: CREE, updated_at: CREE }],
    flammes: [{ id: F, serment_id: S }]
  }, T, { status: 503 }, { echecs: ['flammes'] });
  verdicts.lectureDependanceEnEchecRefuse = aveugle.ok;
  const journalAveugle = await refuse({ leo_ecritures: trace(T, 'proposer_idee', S) },
    T, { status: 503 }, { echecs: ['leo_ecritures'] });
  verdicts.journalIllisibleRefuse = journalAveugle.ok;

  // La course : une autre requête a supprimé la cible entre la lecture et la
  // nôtre → 404, et AUCUNE 'defaite' posée (une seule par trace, sans index).
  const course = baseFactice({ leo_ecritures: trace(T, 'proposer_idee', S),
    idees: [{ id: S, created_at: CREE, updated_at: CREE }] }, { voleur: true });
  const rc = await defaire(course, T);
  verdicts.courseSansDoubleDefaite = rc.status === 404 && course.inserts.length === 0;

  // Le corps est une liste FERMÉE : une cible ou un outil glissés refusent tout.
  const corpsBase = baseFactice({ leo_ecritures: trace(T, 'proposer_idee', S),
    idees: [{ id: S, created_at: CREE, updated_at: CREE }] });
  const glisses = await Promise.all([
    defaireEcriture(corpsBase, PAUL, { etape: 'defaire', traceId: T, cibleId: id(66) }),
    defaireEcriture(corpsBase, PAUL, { etape: 'defaire', traceId: T, outil: 'proposer_idee' }),
    defaireEcriture(corpsBase, PAUL, { etape: 'defaire', traceId: 'pas-une-trace' }),
    defaireEcriture(corpsBase, PAUL, { etape: 'defaire' }),
    defaireEcriture(corpsBase, PAUL, null),
    defaireEcriture(corpsBase, PAUL, [T])
  ]);
  verdicts.corpsFerme = glisses.every((r) => r.status === 400) &&
    corpsBase.suppressions.length === 0 && corpsBase.inserts.length === 0;
}

// ---------- 6. L'ÉCRAN « CE QUE LÉO A FAIT » ----------
{
  const tr = (n) => id(300 + n);
  const base = baseFactice({
    leo_ecritures: [
      ...trace(tr(1), 'proposer_idee', id(401)),                                 // fait, défaisable
      ...trace(tr(2), 'proposer_serment', id(402), { quadrant: 'imladrik' }),    // lié (flamme)
      ...trace(tr(3), 'proposer_idee', id(403)),                                 // défait
      { owner_id: PAUL, trace_id: tr(3), outil: 'proposer_idee', quadrant: 'adramelech', anneau: 'vert', phase: 'defaite', cible_id: id(403), le: IL_Y_A(60e3) },
      ...trace(tr(4), 'proposer_besoin', null, { phaseIssue: 'echouee', quadrant: 'riven' }),
      ...trace(tr(5), 'proposer_idee', null, { phaseIssue: null }),             // interrompu
      ...trace(tr(6), 'proposer_idee', id(406)),                                 // disparu
      ...trace(tr(7), 'proposer_relance', id(407), { quadrant: 'riven' }),       // fait, nommé par son contact
      ...trace(tr(8), 'proposer_idee', id(408)),                                 // retouché
      ...trace(tr(9), 'proposer_enrichissement_idee', id(409)),                  // fait, sans défaire
      ...trace(tr(10), 'proposer_idee', id(410), { owner: AUTRUI })              // invisible
    ],
    idees: [
      { id: id(401), nom: 'Atelier bois', created_at: CREE, updated_at: CREE },
      { id: id(408), nom: 'Retouchée', created_at: CREE, updated_at: IL_Y_A(60e3) },
      { id: id(409), nom: 'Idée de Paul', created_at: CREE, updated_at: CREE }
    ],
    serments: [{ id: id(402), intitule: 'Courir le dimanche', created_at: CREE, updated_at: CREE }],
    flammes: [{ id: id(500), serment_id: id(402) }],
    journal: [{ id: id(407), node_id: id(901) }],
    network_nodes: [{ id: id(901), nom: 'M. Lambert' }]
  });
  const r = await listerEcritures(base, PAUL, { maintenant: MAINTENANT });
  const g = Object.fromEntries((r.data?.gestes || []).map((x) => [x.traceId, x]));
  verdicts.ecranNonVide = r.status === 200 && r.data.gestes.length === 9;
  verdicts.ecranFait = g[tr(1)]?.etat === 'fait' && g[tr(1)].defaisable === true && g[tr(1)].cible === 'Atelier bois';
  verdicts.ecranLie = g[tr(2)]?.etat === 'lie' && g[tr(2)].lie === 'flammes' && g[tr(2)].defaisable === false &&
    g[tr(2)].cible === 'Courir le dimanche';
  verdicts.ecranDefaitSansNom = g[tr(3)]?.etat === 'defait' && !('cible' in g[tr(3)]) && typeof g[tr(3)].defaitLe === 'string';
  verdicts.ecranEchecEtInterrompu = g[tr(4)]?.etat === 'echec' && g[tr(5)]?.etat === 'interrompu' &&
    !g[tr(4)].defaisable && !g[tr(5)].defaisable;
  verdicts.ecranDisparu = g[tr(6)]?.etat === 'disparu' && !g[tr(6)].defaisable && !('cible' in g[tr(6)]);
  verdicts.ecranRelanceNommeeParSonContact = g[tr(7)]?.cible === 'M. Lambert' && g[tr(7)].defaisable === true;
  verdicts.ecranRetouche = g[tr(8)]?.etat === 'retouche' && !g[tr(8)].defaisable;
  verdicts.ecranEnrichissementSansBouton = g[tr(9)]?.etat === 'fait' && !g[tr(9)].defaisable && !('cible' in g[tr(9)]);
  verdicts.ecranSansAutrui = !g[tr(10)];
  // ⛔ L'écran ne rend jamais l'adresse de la cible : le bouton passe par la trace.
  verdicts.ecranSansCibleId = r.data.gestes.every((x) => !('cibleId' in x) && !('cible_id' in x));
  verdicts.ecranDuPlusRecent = r.data.gestes.every((x, i, a) => i === 0 || String(a[i - 1].le) >= String(x.le));
  // Le verbe vient du serveur, jamais le nom technique de l'outil.
  verdicts.ecranVerbes = g[tr(1)]?.quoi === 'A créé une idée' && g[tr(4)]?.quoi === 'A tenté d’ajouter un besoin' &&
    r.data.gestes.every((x) => typeof x.quoi === 'string' && !/proposer_/.test(x.quoi));

  // Une dépendance illisible : la ligne touchée reste lisible, SANS nom ni
  // bouton — et n'éteint pas les autres tables. L'idée est lue d'abord, le
  // serment ensuite : si l'échec du second effaçait le premier, ou si le
  // premier posait son bouton après le repli, l'un des deux verdicts rougit.
  const aveugle = baseFactice({
    leo_ecritures: [...trace(tr(1), 'proposer_idee', id(401)), ...trace(tr(2), 'proposer_serment', id(402))],
    idees: [{ id: id(401), nom: 'Atelier bois', created_at: CREE, updated_at: CREE }],
    serments: [{ id: id(402), intitule: 'Courir', created_at: CREE, updated_at: CREE }],
    flammes: [{ id: id(500), serment_id: id(402) }]
  }, { echecs: ['flammes'] });
  const ra = await listerEcritures(aveugle, PAUL, { maintenant: MAINTENANT });
  const ga = Object.fromEntries((ra.data?.gestes || []).map((x) => [x.traceId, x]));
  verdicts.ecranAveugleSansBouton = ra.status === 200 && ra.data.gestes.length === 2 &&
    ga[tr(2)]?.defaisable === false && !('cible' in ga[tr(2)]) && ga[tr(2)].etat === 'fait';
  verdicts.ecranAveugleNEteintPasLesAutres = ga[tr(1)]?.defaisable === true && ga[tr(1)].cible === 'Atelier bois';
  // Et rien ne bouge APRÈS la réponse : on laisse filer la boucle d'événements.
  const instantane = JSON.stringify(ra.data);
  await new Promise((r) => setTimeout(r, 20));
  verdicts.ecranFigeApresReponse = JSON.stringify(ra.data) === instantane;
  const journalAveugle = await listerEcritures(baseFactice({}, { echecs: ['leo_ecritures'] }), PAUL, { maintenant: MAINTENANT });
  verdicts.ecranJournalIllisible = journalAveugle.status === 503;
}

// ---------- 6 bis. LE MAIL DU MATIN : verbe + heure + état, rien d'autre ----------
{
  const SECRET = 'Racheter le local de Villeurbanne';
  const gestes = [
    { traceId: id(1), outil: 'proposer_idee', le: '2026-10-02T07:12:00Z', etat: 'fait', quoi: 'A créé une idée', cible: SECRET, defaisable: true },
    { traceId: id(2), outil: 'proposer_journal', le: '2026-10-01T15:05:00Z', etat: 'defait', quoi: 'A noté au journal', contenu: SECRET },
    { traceId: id(3), outil: 'proposer_besoin', le: '2026-10-01T14:02:00Z', etat: 'echec', quoi: 'A tenté d’ajouter un besoin' }
  ];
  const lignes = lignesLeo({ lien: 'https://ultima.example/leo', gestes }, '2026-10-02');
  const texte = lignes.join('\n');
  // Non-vacuité : la section existe, porte ses trois lignes et ses heures de Paris.
  verdicts.mailNonVide = lignes[0] === 'CE QUE LÉO A FAIT DEPUIS HIER' &&
    texte.includes('09:12 — a créé une idée') && texte.includes('hier 17:05 — a noté au journal (défait par toi)') &&
    texte.includes('(n’a pas abouti)');
  verdicts.mailSansContenu = !texte.includes(SECRET) && !texte.includes('Villeurbanne');
  const mail = composerMatin({ le: '2026-10-02', macro: {}, cartouche: {} },
    { aujourdhui: '2026-10-02', lien: 'https://ultima.example/finubar', leo: { lien: 'https://ultima.example/leo', gestes } });
  const liens = [...(mail.texte + mail.html).matchAll(/https?:\/\/[^\s"<]+/g)].map((m) => m[0]);
  // ⛔ Aucun lien d'action : deux lectures seulement, sans paramètre.
  verdicts.mailSansLienDAction = liens.length > 0 &&
    liens.every((u) => u === 'https://ultima.example/leo' || u === 'https://ultima.example/finubar') &&
    !/defaire|traceId|etape/i.test(liens.join(' '));
  verdicts.mailHtmlSansContenu = !mail.html.includes(SECRET);
  // Le mail qui ne PEUT pas lire le journal le dit, au lieu de se taire.
  const aveugle = lignesLeo({ lien: 'https://ultima.example/leo', gestes: null }, '2026-10-02').join('\n');
  verdicts.mailAveugleLeDit = /ne lit pas encore le journal/.test(aveugle) && aveugle.includes('https://ultima.example/leo');
  // Sans `leo`, le composeur rend le mail d'avant : aucune section ajoutée.
  const avant = composerMatin({ le: '2026-10-02', macro: {}, cartouche: {} }, { aujourdhui: '2026-10-02', lien: 'https://ultima.example/finubar' });
  verdicts.mailSansLeoInchange = !/LÉO|Léo/.test(avant.texte + avant.html);
  // Le porteur réel passe la section, avec le lien de l'ÉCRAN.
  const porteur = readFileSync(new URL('../api/finubar-matin.mjs', import.meta.url), 'utf8');
  verdicts.mailPorteurBranche = /leo: \{ lien: lienLeo, gestes: null \}/.test(porteur) &&
    /replace\(\/\\\/finubar\$\/, '\/leo'\)/.test(porteur);
}

// ---------- 7. La route est mince, et le défaire passe par elle ----------
{
  const route = readFileSync(new URL('../api/leo/ecritures.js', import.meta.url), 'utf8');
  verdicts.routeDefaire = /defaireEcriture\(auth\.client, auth\.user\.id, corps\)/.test(route) &&
    /listerEcritures\(auth\.client, auth\.user\.id\)/.test(route) &&
    !/\.delete\(|\.from\(/.test(route);
  // Le GET passe la même authentification que le POST : elle est AVANT la bifurcation.
  verdicts.routeGetAuthentifie = route.indexOf('requireUser(req)') > -1 &&
    route.indexOf('requireUser(req)') < route.indexOf("req.method === 'GET'");
}

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const tout = Object.values(verdicts).every((v) => v === true);
console.log(tout ? 'UNIT-LEO-DEFAIRE OK' : 'UNIT-LEO-DEFAIRE ECHEC');
process.exit(tout ? 0 : 1);
