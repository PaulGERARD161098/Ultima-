// Vérification du moteur Finubar (`finubar/agreger.mjs`) — Node pur, zéro I/O.
//
// ⛔ Discipline de la charte (2026-08-17) : « AVANT DE CROIRE UNE MESURE, LUI
// DEMANDER CE QU'ELLE RÉPOND SUR UN CAS DONT ON CONNAÎT DÉJÀ LA RÉPONSE ».
// Les quatre premiers cas sont des cas de RÉFÉRENCE : leur réponse est connue
// d'avance et écrite dans le nom du verdict. Un moteur qui répond la même chose
// à tous les cas — le signe d'alerte des trois sondes fausses d'août — échoue ici.
//
// ⛔ Et son corollaire (2026-08-17) : un filtre qui exclut des cas doit COMPTER
// ce qu'il exclut. `agreger` fait remonter les grains illisibles AVEC leur motif
// au lieu de les écarter en silence ; §5 le vérifie.
import {
  extraireBloc, lireGrain, joursEntre, agreger, cartoucheDuMatin,
  versConstellation, MOTS_INTERDITS, BALISE_DEBUT, BALISE_FIN,
} from '../finubar/agreger.mjs';

let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs += 1; }
}

const grainDe = (o) => `${BALISE_DEBUT}\n\`\`\`json\n${JSON.stringify(o, null, 2)}\n\`\`\`\n${BALISE_FIN}`;

// ---------------------------------------------------------------- §1 extraction
console.log('§1 — extraction du bloc balisé');
{
  const fichier = `# FINUBAR — Truc\n\nblabla humain\n\n${grainDe({ projet: 'Truc' })}\n\n## Journal\n- une entrée\n`;
  const bloc = extraireBloc(fichier);
  verifier('un fichier bien formé rend son bloc', bloc !== null && JSON.parse(bloc).projet === 'Truc');
  verifier('un fichier SANS balise rend null (et non un objet vide)', extraireBloc('# rien ici') === null);
  verifier('une balise ouverte jamais refermée rend null', extraireBloc(`${BALISE_DEBUT}\n{`) === null);
  verifier('un bloc vide rend null', extraireBloc(`${BALISE_DEBUT}\n\n${BALISE_FIN}`) === null);
  verifier('une entrée non-texte rend null', extraireBloc(null) === null && extraireBloc(42) === null);
  // La preuve que l'extraction ne répond pas « oui » à tout : deux entrées
  // différentes doivent donner deux réponses différentes.
  verifier('deux fichiers différents donnent deux blocs différents',
    extraireBloc(grainDe({ projet: 'A' })) !== extraireBloc(grainDe({ projet: 'B' })));
}

// ---------------------------------------------------------------- §2 validation
console.log('§2 — lecture d\'un grain, entrée hostile par défaut');
{
  const bon = lireGrain(JSON.stringify({
    projet: 'RénoDevis', depot: 'x/RenoDevis', cap: 'encaisser le premier euro',
    etat: 'en_cours', jalon: { nom: 'J1', critere_de_sortie: 'paiements = 1' },
    dernier_arret: { le: '2026-08-21', quoi: 'cron élargi', commit: 'a593a8f' },
    prochaine_action: 'déployer', bloque_par: ['embarquer SOLA'],
    boucles_ouvertes: [{ quoi: 'PR #101', depuis: '2026-08-21' }], maj: '2026-08-21',
  }), 'x/RenoDevis');
  verifier('un grain complet est lu', bon.ok && bon.grain.projet === 'RénoDevis');
  verifier('la liste des gestes est conservée', bon.grain.bloque_par.length === 1);

  const casse = lireGrain('{ ceci n\'est pas du json', 'x/Y');
  verifier('un JSON cassé ne lève pas — il rend un motif', casse.ok === false && casse.motif === 'bloc illisible');
  verifier('un grain cassé garde son dépôt (il reste nommable)', casse.depot === 'x/Y');

  const sansNom = lireGrain('{"etat":"en_cours"}', 'x/Z');
  verifier('un grain sans projet est refusé', sansNom.ok === false && sansNom.motif === 'projet non nommé');

  const etatInvente = lireGrain('{"projet":"P","etat":"formidable"}', 'x/P');
  verifier('un état inconnu retombe sur au_repos (fail-closed)', etatInvente.grain.etat === 'au_repos');

  const debordant = lireGrain(JSON.stringify({
    projet: 'P', cap: 'c'.repeat(9000), bloque_par: new Array(50).fill('g'),
  }), 'x/P');
  verifier('un texte de 9 000 caractères est borné à 400', debordant.grain.cap.length === 400);
  verifier('une liste de 50 entrées est bornée à 10', debordant.grain.bloque_par.length === 10);
  verifier('des champs absents donnent des chaînes vides, jamais undefined',
    debordant.grain.dernier_arret.quoi === '' && debordant.grain.prochaine_action === '');
}

// ---------------------------------------------------------------- §3 jours
console.log('§3 — l\'écart en jours, sur des dates dont on connaît la réponse');
{
  verifier('du 20 au 21 août = 1 jour', joursEntre('2026-08-20', '2026-08-21') === 1);
  verifier('le même jour = 0 jour', joursEntre('2026-08-21', '2026-08-21') === 0);
  verifier('du 12 juillet au 21 août = 40 jours', joursEntre('2026-07-12', '2026-08-21') === 40);
  verifier('passage d\'année : 31/12 → 01/01 = 1 jour', joursEntre('2026-12-31', '2027-01-01') === 1);
  // ⛔ LE verdict qui compte : une date absente ne doit PAS répondre 0.
  // Un 0 se lirait « à jour » — exactement le contraire de « je ne sais pas ».
  verifier('une date absente rend null, PAS 0', joursEntre('', '2026-08-21') === null);
  verifier('une date malformée rend null, PAS 0', joursEntre('hier', '2026-08-21') === null);
}

// ---------------------------------------------------------------- §4 rang
console.log('§4 — l\'ordre de remontée, cas de référence');
{
  const e = (projet, etat, maj, derive) => ({
    ...lireGrain(JSON.stringify({ projet, etat, maj, prochaine_action: 'faire ' + projet }), 'd/' + projet),
    derive,
  });
  const a = agreger([
    e('Repos', 'au_repos', '2026-08-01'),
    e('EnCours', 'en_cours', '2026-08-20'),
    e('Attente', 'en_attente_de_paul', '2026-08-05'),
    e('Derive', 'en_cours', '2026-08-20', { commits_depuis: 3, tete: 'abc' }),
  ], '2026-08-21');
  const ordre = a.projets.map((p) => p.grain.projet);
  verifier('le dérivé passe devant tout', ordre[0] === 'Derive', ordre.join(' > '));
  verifier('puis ce qui attend Paul', ordre[1] === 'Attente', ordre.join(' > '));
  verifier('puis l\'en-cours, puis le repos', ordre[2] === 'EnCours' && ordre[3] === 'Repos', ordre.join(' > '));
  verifier('les comptes macro sont justes',
    a.macro.total === 4 && a.macro.derives === 1 && a.macro.en_attente_de_paul === 1 && a.macro.au_repos === 1);
  // La preuve d'anti-uniformité : un agrégat où TOUT est au repos ne doit pas
  // produire le même ordre de tête que celui-ci.
  const b = agreger([e('X', 'au_repos', '2026-08-01'), e('Y', 'au_repos', '2026-08-19')], '2026-08-21');
  verifier('à rang égal, le plus anciennement noté remonte', b.projets[0].grain.projet === 'X');

  // ⛔ LE cas qui a fait changer le tri le 21/08. Trois projets attendent Paul,
  // tous notés le même jour : à ce stade le tri retombait sur l'ALPHABET et
  // remontait `artisan-builder` devant RénoBoost, dont le geste attend depuis
  // le 04/08. Un ordre déterministe qui n'est pas un ordre JUSTE est pire qu'un
  // ordre absent : on le suit.
  const att = (projet, depuis) => lireGrain(JSON.stringify({
    projet, etat: 'en_attente_de_paul', maj: '2026-08-21',
    en_attente_depuis: depuis, bloque_par: ['geste ' + projet],
    prochaine_action: 'faire ' + projet,
  }), 'd/' + projet);
  const c = agreger([
    att('aaa-projet-recent', '2026-08-21'),
    att('zzz-projet-ancien', '2026-08-04'),
    att('mmm-projet-moyen', '2026-08-11'),
  ], '2026-08-21');
  verifier('le geste le plus anciennement ouvert remonte, quel que soit le nom',
    c.projets.map((p) => p.grain.projet).join(' > ') === 'zzz-projet-ancien > mmm-projet-moyen > aaa-projet-recent',
    c.projets.map((p) => p.grain.projet).join(' > '));
  verifier('l\'ancienneté du geste est mesurée en jours', c.projets[0].jours_en_attente === 17);
  verifier('un projet sans date d\'attente ne prétend pas en avoir une',
    agreger([att('X', '')], '2026-08-21').projets[0].jours_en_attente === null);
  const cart = cartoucheDuMatin(c);
  verifier('le cartouche dit depuis quand le geste est ouvert',
    cart.signaux[0].dit.includes('ouvert depuis 17 j'), cart.signaux[0].dit);
}

// ---------------------------------------------------------------- §5 illisibles
console.log('§5 — un projet illisible remonte AVEC son motif (jamais écarté en silence)');
{
  const a = agreger([
    lireGrain('{"projet":"Bon","etat":"en_cours","maj":"2026-08-21"}', 'd/Bon'),
    lireGrain('pas du json', 'd/Casse'),
  ], '2026-08-21');
  verifier('le compte total inclut l\'illisible', a.macro.total === 2);
  verifier('l\'illisible est compté à part', a.macro.illisibles === 1 && a.macro.lisibles === 1);
  const casse = a.projets.find((p) => !p.ok);
  verifier('l\'illisible est présent dans la liste', Boolean(casse));
  verifier('il porte son motif et son dépôt', casse.motif === 'bloc illisible' && casse.depot === 'd/Casse');
}

// ---------------------------------------------------------------- §6 cartouche
console.log('§6 — le cartouche du matin : ≤3 signaux, 1 action, aucun reproche');
{
  const e = (projet, etat, maj, bloque, derive) => ({
    ...lireGrain(JSON.stringify({
      projet, etat, maj, cap: 'cap de ' + projet,
      prochaine_action: 'faire ' + projet, bloque_par: bloque || [],
      dernier_arret: { quoi: 'arrêt de ' + projet },
    }), 'd/' + projet),
    derive,
  });
  const a = agreger([
    e('P1', 'en_attente_de_paul', '2026-08-05', ['imprimer les stickers']),
    e('P2', 'en_cours', '2026-08-20'),
    e('P3', 'en_cours', '2026-08-19'),
    e('P4', 'au_repos', '2026-07-12'),
    e('P5', 'en_cours', '2026-08-18'),
  ], '2026-08-21');
  const c = cartoucheDuMatin(a);
  verifier('au plus 3 signaux, même avec 5 projets', c.signaux.length === 3, String(c.signaux.length));
  verifier('exactement une action', Boolean(c.action));
  // P1 attend un geste de Paul : l'action est CE GESTE, pas sa tâche de code.
  verifier('un projet qui attend Paul propose son GESTE, pas du code',
    c.action.nature === 'geste' && c.action.faire === 'imprimer les stickers', c.action.faire);
  const enCoursSeul = cartoucheDuMatin(agreger([e('Q', 'en_cours', '2026-08-20')], '2026-08-21'));
  verifier('un projet en cours propose bien sa prochaine tâche de code',
    enCoursSeul.action.nature === 'code' && enCoursSeul.action.faire === 'faire Q');
  verifier('l\'action porte son cap (le pourquoi — directive JL)', c.action.cap === 'cap de P1');
  verifier('le geste attendu est nommé', c.signaux[0].dit.includes('imprimer les stickers'));
  verifier('l\'ancienneté est dite en jours', c.signaux[0].dit.includes('16 j'), c.signaux[0].dit);

  // ⛔ Le ton se teste, il ne se relit pas. Règle ③ d'ALTHEA étendue au produit.
  const texte = JSON.stringify(c).toLowerCase();
  MOTS_INTERDITS.forEach((mot) => {
    verifier(`le cartouche ne dit jamais « ${mot} »`, !texte.includes(mot));
  });

  const vide = cartoucheDuMatin(agreger([], '2026-08-21'));
  verifier('zéro projet → zéro signal et zéro action (pas de plantage)',
    vide.signaux.length === 0 && vide.action === null);
}

// ---------------------------------------------------------------- §7 constellation
console.log('§7 — la sortie constellation (branchée sur rien, mais tenue en vie)');
{
  const e = (projet, etat, rattache) => lireGrain(JSON.stringify({
    projet, etat, maj: '2026-08-21', rattache_a: rattache,
  }), 'd/' + projet);
  const a = agreger([
    e('A', 'en_cours', 'ROADMAP-MASTER.md'),
    e('B', 'en_attente_de_paul', 'ROADMAP-MASTER.md'),
    e('C', 'au_repos', ''),
  ], '2026-08-21');
  const ciel = versConstellation(a);
  verifier('un nœud par projet lisible', ciel.noeuds.length === 3);
  verifier('aucun projet perdu entre l\'agrégat et le ciel',
    ciel.noeuds.map((n) => n.libelle).sort().join(',') === 'A,B,C');
  verifier('deux projets de même cap sont reliés', ciel.relations.length === 1);
  verifier('un projet sans cap n\'invente pas de relation',
    !ciel.relations.some((r) => r.de === 'd/C' || r.vers === 'd/C'));
  verifier('le signal d\'appel ne s\'allume que sur ce qui appelle',
    ciel.noeuds.filter((n) => n.signal === 1).length === 1);
}

console.log(echecs === 0 ? '\n=== unit-finubar : TOUT VERT ===' : `\n=== unit-finubar : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
