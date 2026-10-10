// ZOH SHIA — la dérive de la série, éprouvée sur un dépôt dont on connaît la
// réponse (04/10/2026).
//
// Paul : « ZOH doit rester à jour de toute façon ». `derive.mjs` dit, à
// l'ouverture de chaque séance, de combien le dépôt de référence a dépassé la
// série. Les réponses au pre-mortem :
//   · « À JOUR » DIT À TORT → un dépôt fabriqué ici avance d'un commit hors
//     série puis d'un commit SUR un fichier de la série : les deux comptes
//     doivent être exacts, et la phrase doit changer de nature.
//   · LE SILENCE SE LIT « À JOUR » → dépôt absent, base inconnue, base qui
//     n'est pas un ancêtre : chacun rend « non mesurable » avec sa raison.
//   · UN CHEMIN FUIT → la phrase ne porte jamais un chemin de la série.
//   · LE HOOK BLOQUE UNE SÉANCE → le mode rappel sort 0, même sans dépôt.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mesurerDerive, phraseDerive, cheminsDeLaSerie } from '../zohshia/renodevis/derive.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const verdicts = {};
const dit = (nom, ok) => { verdicts[nom] = ok === true; };

const tmp = mkdtempSync(join(tmpdir(), 'zohshia-derive-'));
process.on('exit', () => rmSync(tmp, { recursive: true, force: true }));
const depot = join(tmp, 'reference');
const racine = join(tmp, 'ultima');
mkdirSync(depot);
const git = (...a) => execFileSync('git', ['-C', depot, '-c', 'user.name=t', '-c', 'user.email=t', ...a], { encoding: 'utf8' }).trim();
const ecrire = (f, t) => { mkdirSync(dirname(join(depot, f)), { recursive: true }); writeFileSync(join(depot, f), t); };

git('init', '-q', '-b', 'main');
ecrire('lib/retouche.ts', 'a\n'); ecrire('lib/libre.ts', 'a\n'); ecrire('lib/retire.ts', 'a\n');
git('add', '-A'); git('commit', '-q', '-m', 'base');
const base = git('rev-parse', 'HEAD');

// La série du faux dépôt : elle retouche `lib/retouche.ts`, retire nommément
// `lib/retire.ts`, et porte un motif qui ne doit JAMAIS compter.
const serie = join(racine, 'outils', 'zohshia', 'renodevis', 'neutre');
mkdirSync(serie, { recursive: true });
writeFileSync(join(serie, 'BASE'), base + '\n');
writeFileSync(join(serie, 'neutre.diff'), 'diff --git a/lib/retouche.ts b/lib/retouche.ts\n--- a/lib/retouche.ts\n+++ b/lib/retouche.ts\n');
writeFileSync(join(serie, 'retirer.txt'), '# en-tête\n**/*.md\nlib/retire.ts\n');
const mesure = () => mesurerDerive({ racine, depot, ref: 'main' });

dit('cheminsDeLaSerie', [...cheminsDeLaSerie(racine)].sort().join() === 'lib/retire.ts,lib/retouche.ts');

const m0 = mesure();
dit('aJourSurLaBase', m0.mesurable && m0.commits === 0 && m0.touchent === 0 && /à jour/.test(phraseDerive(m0)));

ecrire('lib/libre.ts', 'b\n'); ecrire('NOTES.md', 'x\n'); git('add', '-A'); git('commit', '-q', '-m', 'hors série');
const m1 = mesure();
dit('avanceHorsSerie', m1.mesurable && m1.commits === 1 && m1.touchent === 0
  && /aucun sur un fichier/.test(phraseDerive(m1)) && !/EN RETARD/.test(phraseDerive(m1)));

ecrire('lib/retouche.ts', 'b\n'); git('add', '-A'); git('commit', '-q', '-m', 'sur la série');
ecrire('lib/retire.ts', 'b\n'); git('add', '-A'); git('commit', '-q', '-m', 'sur un retrait nommé');
const m2 = mesure();
const p2 = phraseDerive(m2);
dit('enRetardSurLaSerie', m2.mesurable && m2.commits === 3 && m2.touchent === 2 && m2.fichiers_touches === 2
  && /EN RETARD/.test(p2) && /dont 2/.test(p2));
dit('aucunCheminDansLaPhrase', ![p2, phraseDerive(m1), phraseDerive(m0)].some((p) => /lib\/|\.ts\b/.test(p)));

// ---- Un report se déclare, il ne se tait pas (10/10) ------------------------
const report = (contenu) => writeFileSync(join(serie, 'REPORT.json'), contenu);
const decision = { le: '2026-10-10', condition: 'après le chantier X', pourquoi: 'il réécrit les mêmes fichiers', base };
report(JSON.stringify(decision));
const pr = phraseDerive(mesure());
dit('reportValideDit', /EN RETARD/.test(pr) && /Report décidé le 2026-10-10 : rafraîchir après le chantier X/.test(pr)
  && !/Rafraîchir la série/.test(pr));
report(JSON.stringify({ ...decision, base: 'e'.repeat(40) }));
const pp = phraseDerive(mesure());
dit('reportPerimeIgnoreEtDit', /Rafraîchir la série/.test(pp) && /Report ignoré : report périmé/.test(pp) && !/Report décidé/.test(pp));
report('{ pas du json');
dit('reportIllisibleIgnoreEtDit', /Report ignoré : REPORT\.json illisible/.test(phraseDerive(mesure())));
report(JSON.stringify({ ...decision, pourquoi: 'x'.repeat(201) }));
dit('reportTropLongRefuse', /mal formé/.test(phraseDerive(mesure())));
dit('reportSansObjetSignale', /le retirer/.test(phraseDerive({ ...m0, report: { valide: true } })));
rmSync(join(serie, 'REPORT.json'));
dit('sansReportInchange', phraseDerive(mesure()) === p2);

// ---- Non mesurable, et DIT -------------------------------------------------
const absent = mesurerDerive({ racine, depot: join(tmp, 'nulle-part'), ref: 'main' });
dit('depotAbsentDit', absent.mesurable === false && /absent/.test(absent.raison) && /NON MESURABLE/.test(phraseDerive(absent)));
writeFileSync(join(serie, 'BASE'), 'f'.repeat(40) + '\n');
const inconnu = mesure();
dit('baseInconnueDite', inconnu.mesurable === false && /inconnu/.test(inconnu.raison));
git('checkout', '-q', '--orphan', 'autre'); git('commit', '-q', '-m', 'sans ancêtre commun');
writeFileSync(join(serie, 'BASE'), base + '\n');
const orphelin = mesurerDerive({ racine, depot, ref: 'autre' });
dit('pasUnAncetreDit', orphelin.mesurable === false && /ancêtre/.test(orphelin.raison));
writeFileSync(join(serie, 'BASE'), 'pas-un-sha\n');
dit('baseIllisibleDite', mesure().mesurable === false);
rmSync(join(serie, 'BASE'));
dit('serieAbsenteDite', mesure().mesurable === false && /série absente/.test(mesure().raison));
dit('mesureNulleDite', /NON MESURABLE/.test(phraseDerive(null)));

// ---- Le hook ne bloque jamais une séance ------------------------------------
const hook = spawnSync(process.execPath, [join(ICI, '..', 'zohshia', 'renodevis', 'derive.mjs'), '--rappel', '--depot', join(tmp, 'nulle-part')], { encoding: 'utf8', timeout: 10000 });
let sortie = null;
try { sortie = JSON.parse(hook.stdout); } catch { sortie = null; }
dit('rappelSortZeroEtParle', hook.status === 0 && sortie?.hookSpecificOutput?.hookEventName === 'SessionStart'
  && /NON MESURABLE/.test(sortie.hookSpecificOutput.additionalContext));

// ---- Le hook est branché, et seulement dans Ultima ---------------------------
const reglages = JSON.parse(execFileSync('cat', [join(ICI, '..', '.claude', 'settings.json')], { encoding: 'utf8' }));
dit('hookBranche', (reglages.hooks?.SessionStart || []).flatMap((e) => e.hooks || [])
  .some((h) => /zohshia\/renodevis\/derive\.mjs"? --rappel$/.test(h.command || '')));

const echecs = Object.entries(verdicts).filter(([, ok]) => !ok).map(([k]) => k);
console.log(JSON.stringify(verdicts, null, 2));
if (Object.keys(verdicts).length < 12) { console.log('=== verrou de non-vacuité : trop peu de verdicts ==='); process.exit(1); }
if (echecs.length) { console.log(`=== ${echecs.length} VERDICT(S) EN ÉCHEC ===\n  ${echecs.join('\n  ')}`); process.exit(1); }
console.log('=== UNIT-ZOHSHIA-DERIVE OK ===');
