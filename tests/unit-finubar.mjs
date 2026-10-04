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
  extraireBloc, lireGrain, joursEntre, agreger, cartoucheDuMatin, reprendreGrain,
  versConstellation, libelleAnciennete, MOTS_INTERDITS, BALISE_DEBUT, BALISE_FIN,
  MAX_RECIT, CHAMPS_RECIT,
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

// ------------------------------------------------------- §2bis borne de récit
// Posée le 2026-09-03, sur une MESURE : `dernier_arret.quoi` valait exactement
// 400 — la borne haute — sur les CINQ grains lus ce jour-là. Autrement dit :
// coupé au milieu d'une phrase sur les cinq, et rien ne le disait. Le grain
// était devenu un journal, ce que le pre-mortem (mode n°2) annonçait.
//
// Deux exigences, et la seconde compte autant que la première : la coupe se
// fait au MOT (une coupe au caractère se lit comme un fichier corrompu), et
// elle se NOMME (règle du 2026-08-17 : un filtre qui exclut compte et nomme).
console.log('§2bis — un récit trop long est coupé au mot, et la coupe se dit');
{
  const court = lireGrain(JSON.stringify({
    projet: 'P', dernier_arret: { quoi: 'cron élargi aux quatre briques' },
    prochaine_action: 'déployer',
  }), 'x/P');
  // Cas de référence n°1 : un grain bien tenu ne déclenche RIEN. Sans lui, une
  // sonde qui crierait sur tout aurait l'air de marcher.
  verifier('un récit court passe intact', court.grain.dernier_arret.quoi === 'cron élargi aux quatre briques');
  verifier('et ne signale aucune coupe', court.recits.length === 0);

  // ⛔ LA VALEUR ATTENDUE EST ÉCRITE EN DUR (181 = 180 + l'ellipse), elle n'est
  // PAS dérivée de MAX_RECIT. Première version de ce test : longueurs et seuil
  // tirés de la constante — il restait vert quand on portait la borne à 99 999,
  // parce qu'il se recalibrait sur ce qu'il prétendait mesurer. Une sonde qui
  // bouge avec son objet ne mesure rien (règle du 2026-08-17).
  verifier('la borne de récit vaut bien 180', MAX_RECIT === 180, String(MAX_RECIT));

  // ⛔ ET LE TEXTE EST CONSTRUIT POUR QUE LA POSITION 180 TOMBE AU MILIEU D'UN
  // MOT — sinon une coupe au caractère passerait par chance. Deuxième version
  // de ce test : « mot mot mot… », période 4, dont 180 est un multiple : la
  // coupe brutale tombait pile sur une frontière et le test restait vert.
  const phrase = 'alpha bravo charlie delta echo foxtrot golf hotel india juliett kilo lima '.repeat(6).trim();
  verifier('cas construit : la 180ᵉ position tombe au milieu d’un mot',
    phrase[179] !== ' ' && phrase[180] !== ' ', JSON.stringify(phrase.slice(174, 186)));

  const long = lireGrain(JSON.stringify({
    projet: 'P',
    dernier_arret: { quoi: phrase },
    prochaine_action: phrase,
    bloque_par: [phrase],
    boucles_ouvertes: [{ quoi: phrase, depuis: '2026-09-03' }],
  }), 'x/P');
  const coupe = long.grain.dernier_arret.quoi;
  verifier('un récit long est ramené sous la borne', coupe.length <= 181, `${coupe.length} car.`);
  verifier('la coupe se voit (ellipse finale)', coupe.endsWith('…'));
  // Le verdict de « au mot » ne regarde pas le résultat : il regarde l'ORIGINAL
  // à l'endroit de la coupe. Si le caractère suivant n'y est pas une espace,
  // c'est qu'on a tranché dans un mot — quel que soit l'aspect du rendu.
  const garde = coupe.slice(0, -1);
  verifier('elle tombe sur un mot entier, jamais au milieu',
    phrase.startsWith(garde) && phrase[garde.length] === ' ',
    `coupé après « ${garde.slice(-14)} », suivi de « ${phrase[garde.length]} »`);
  verifier('les QUATRE champs de récit sont nommés',
    CHAMPS_RECIT.every((c) => long.recits.includes(c)), long.recits.join(', '));
  verifier('dix boucles trop longues comptent pour UN défaut, pas dix',
    long.recits.filter((c) => c === 'boucles_ouvertes[].quoi').length === 1);

  // Cas de référence n°2 : un texte SANS espace (identifiant, URL collée) n'a
  // aucun mot où couper. Il doit rester lisible, pas devenir une ellipse seule
  // — c'est le cas qu'une coupe « au dernier espace » naïve rend vide.
  const sansEspace = lireGrain(JSON.stringify({
    projet: 'P', prochaine_action: 'a'.repeat(230),
  }), 'x/P');
  verifier('un texte sans espace reste substantiel (pas réduit à « … »)',
    sansEspace.grain.prochaine_action.length > 160, String(sansEspace.grain.prochaine_action.length));

  // Et le grain illisible garde la MÊME forme : sinon la collecte, qui lit
  // `p.recits`, planterait sur les dépôts cassés — ceux-là mêmes qu'elle doit
  // encore savoir afficher (règle ⑤).
  const casse = lireGrain('{ pas du json', 'x/Y');
  verifier('un grain illisible expose quand même recits: []', Array.isArray(casse.recits));

  // Cas payé le 30/09 : le grain d'artisan-builder portait 27 boucles écrites en
  // TEXTE NU (`"…"` au lieu de `{ quoi, depuis }`). Le lecteur cherchait `b.quoi`,
  // ne le trouvait pas, et les écartait TOUTES sans rien dire : la collecte
  // affichait 0 boucle ouverte pour ce dépôt. Un filtre qui écarte en silence
  // se lit comme « rien à signaler ». Une boucle en texte nu se lit comme son `quoi`.
  const nu = lireGrain(JSON.stringify({
    projet: 'P', boucles_ouvertes: ['boucle en texte nu', { quoi: 'boucle objet', depuis: '2026-09-01' }, 42, null],
  }), 'x/P');
  verifier('une boucle écrite en texte nu reste visible',
    nu.grain.boucles_ouvertes.some((b) => b.quoi === 'boucle en texte nu' && b.depuis === ''),
    JSON.stringify(nu.grain.boucles_ouvertes));
  verifier('la forme objet est lue comme avant', nu.grain.boucles_ouvertes.some((b) => b.quoi === 'boucle objet' && b.depuis === '2026-09-01'));
  verifier('ce qui n\'est ni texte ni objet reste écarté (42, null)', nu.grain.boucles_ouvertes.length === 2,
    String(nu.grain.boucles_ouvertes.length));
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

// ------------------------------------------------------- §5bis dépôt hors séance
// Le défaut du 02/09/2026 : la collecte lit le disque, une séance ne clone que
// les dépôts qui lui sont attachés, et les autres ressortaient en « FINUBAR.md
// absent » — un constat sur le dépôt là où il n'y avait qu'un angle mort de
// l'observateur. Trois grains sains ont été annoncés manquants ce matin-là.
//
// Ce qui se vérifie ici tient en deux exigences OPPOSÉES, et c'est leur tension
// qui fait la correction : le hors-séance sort du compte des illisibles (sinon
// il noie les vraies alertes) SANS sortir de l'agrégat (sinon il se lit « rien
// à signaler », ce que la règle ⑤ interdit).
console.log('§5bis — un dépôt non attaché n\'est pas un grain cassé, et ne disparaît pas non plus');
{
  const a = agreger([
    lireGrain('{"projet":"Bon","etat":"en_cours","maj":"2026-08-21"}', 'd/Bon'),
    lireGrain('pas du json', 'd/Casse'),
    { ok: false, hors_seance: true, motif: 'dépôt non attaché à cette séance', depot: 'd/Loin', grain: null, derive: null },
  ], '2026-08-21');

  verifier('les trois sont comptés', a.macro.total === 3);
  verifier('le hors-séance N\'EST PAS compté illisible',
    a.macro.illisibles === 1, `illisibles=${a.macro.illisibles}`);
  verifier('il a son propre compteur', a.macro.hors_seance === 1);
  verifier('les trois compteurs couvrent le total',
    a.macro.lisibles + a.macro.illisibles + a.macro.hors_seance === a.macro.total);

  // ⛔ LA LIGNE QUI TIENT LE LOT. Sortir du compte ne doit jamais valoir sortir
  // de la liste : un dépôt qu'on n'a pas ouvert reste affiché, à sa place.
  const loin = a.projets.find((p) => p.depot === 'd/Loin');
  verifier('il RESTE dans la liste, avec son motif', Boolean(loin) && loin.motif === 'dépôt non attaché à cette séance');
  verifier('le cartouche porte les deux comptes séparément',
    cartoucheDuMatin(a).illisibles === 1 && cartoucheDuMatin(a).hors_seance === 1);

  // Et le cas de référence (règle du 2026-08-17 : demander à la mesure ce
  // qu'elle répond sur un cas dont on connaît déjà la réponse) — sans aucun
  // hors-séance, le compteur vaut 0 et `illisibles` retrouve exactement sa
  // valeur d'avant la correction. Une sonde qui répondrait pareil dans les deux
  // situations ne mesurerait rien.
  const b = agreger([lireGrain('pas du json', 'd/Casse')], '2026-08-21');
  verifier('sans hors-séance, le compteur vaut 0 et illisibles est inchangé',
    b.macro.hors_seance === 0 && b.macro.illisibles === 1);
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

// ---------------------------------------------------------------- §6bis dates
console.log('§6bis — une date à venir ne s\'affiche jamais comme un nombre négatif');
{
  verifier('17 jours se dit « ouvert depuis 17 j »',
    libelleAnciennete(17, 'geste') === ' — ouvert depuis 17 j', libelleAnciennete(17, 'geste'));
  verifier('0 jour se dit « ouvert depuis 0 j », pas rien',
    libelleAnciennete(0, 'geste') === ' — ouvert depuis 0 j', libelleAnciennete(0, 'geste'));
  verifier('la forme « note » a son propre libellé',
    libelleAnciennete(3, 'note') === ' — notée il y a 3 j', libelleAnciennete(3, 'note'));
  verifier('une mesure absente ne dit rien du tout', libelleAnciennete(null) === '');
  // ⛔ LE verdict de la section. Une note datée de demain (faute de frappe,
  // copier-coller, fuseau) produisait « ouvert depuis -3 j » : un bug affiché
  // comme une information. Il est désormais nommé pour ce qu'il est.
  verifier('une date à venir est signalée, jamais rendue en négatif',
    libelleAnciennete(-3, 'geste') === ' — datée d\'une date à venir, à corriger',
    libelleAnciennete(-3, 'geste'));
  verifier('aucun libellé ne contient de nombre négatif',
    ![-1, -30, -400].some((j) => /-\d/.test(libelleAnciennete(j, 'geste'))));

  // Et de bout en bout, à travers le cartouche.
  const futur = lireGrain(JSON.stringify({
    projet: 'Futur', etat: 'en_attente_de_paul', maj: '2026-08-21',
    en_attente_depuis: '2026-09-15', bloque_par: ['un geste daté de demain'],
    prochaine_action: 'corriger la date',
  }), 'd/Futur');
  const c = cartoucheDuMatin(agreger([futur], '2026-08-21'));
  verifier('le cartouche ne rend aucun négatif', !/-\d+ j/.test(c.signaux[0].dit), c.signaux[0].dit);
  verifier('il dit qu\'il y a une date à corriger', /à corriger/.test(c.signaux[0].dit), c.signaux[0].dit);
}

// ------------------------------------------------- §6ter commit introuvable
console.log('§6ter — un commit noté introuvable se DIT, il ne se tait pas');
{
  const g = (projet, derive) => ({
    ...lireGrain(JSON.stringify({
      projet, etat: 'en_cours', maj: '2026-08-21', cap: 'cap',
      prochaine_action: 'la suite', dernier_arret: { quoi: 'la chose', commit: 'deadbee' },
    }), 'd/' + projet),
    derive,
  });
  const a = agreger([
    g('Squashe', { tete: 'aaa1111', tete_le: '', commits_depuis: null, commit_inconnu: true }),
    g('Sain', { tete: null, tete_le: null, commits_depuis: 0, commit_inconnu: false }),
  ], '2026-08-21');

  verifier('un commit introuvable est compté À PART', a.macro.commits_inconnus === 1);
  // ⛔ Le verdict qui compte : il ne doit PAS grossir le compte des dérivés.
  // On ne sait pas si ce dépôt a dérivé — c'est justement le problème.
  verifier('il n\'est PAS compté comme une dérive', a.macro.derives === 0);
  verifier('un grain sain ne déclenche rien',
    a.projets.find((p) => p.grain.projet === 'Sain').derive.commit_inconnu === false);

  const c = cartoucheDuMatin(a);
  const dit = c.signaux.map((s) => s.dit).join(' | ');
  // Le libellé ne dit plus « introuvable » : depuis le dry run du 07/09 il
  // couvre AUSSI le grain jamais rattaché, où il n'y a pas de commit à ne pas
  // trouver. Ce qui est vrai des deux, et donc ce qu'on mesure ici, c'est que
  // la fraîcheur est annoncée comme non mesurable.
  verifier('le cartouche le dit', /aucun commit atteignable/.test(dit) && /recaler/.test(dit), dit);
  verifier('et il dit quoi faire', /recaler/.test(dit), dit);
  verifier('sans reprocher quoi que ce soit',
    !MOTS_INTERDITS.some((m) => JSON.stringify(c).toLowerCase().includes(m)));
  // Un cas où l'on ne sait rien du tout (pas de mesure git) reste muet : on ne
  // fabrique pas un avertissement à partir d'une absence de mesure.
  const sansMesure = cartoucheDuMatin(agreger([g('Aveugle', null)], '2026-08-21'));
  verifier('aucune mesure git → aucun avertissement inventé',
    !/introuvable/.test(JSON.stringify(sansMesure)));
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

// ---------------------------------------------------------------- §8 livraison
console.log('§8 — les deux formes de l\'agrégat disent la même chose, et la route importe la bonne');
{
  const { readFileSync } = await import('node:fs');
  const ici = (p) => new URL('../' + p, import.meta.url).pathname;

  // Le jumeau lisible et le module importé par la fonction sont écrits ensemble
  // par la collecte. S'ils divergent, c'est qu'une main est passée sur l'un des
  // deux — et l'écran servirait alors autre chose que ce que la revue a lu.
  const json = JSON.parse(readFileSync(ici('finubar/macro.json'), 'utf8'));
  const texteModule = readFileSync(ici('api/_lib/finubar-macro.mjs'), 'utf8');
  const dedans = texteModule.slice(texteModule.indexOf('export default ') + 15, -2);
  verifier('macro.json et le module servi disent exactement la même chose',
    JSON.stringify(json) === JSON.stringify(JSON.parse(dedans)));
  verifier('le module généré porte son avertissement « ne pas éditer »',
    /GÉNÉRÉ/.test(texteModule.slice(0, 200)));

  // ⛔ Le verdict qui protège le déploiement. Les dix autres routes du dépôt
  // importent depuis `./_lib/` ; un import qui SORT de l'arbre `api/` passe la
  // revue locale et peut rendre 500 en production, faute d'être embarqué par le
  // traceur de fichiers. Aucun harnais local ne peut voir ce 500 — celui-ci
  // vérifie donc la seule chose vérifiable : que le motif est le bon.
  const route = readFileSync(ici('api/finubar.js'), 'utf8');
  verifier('la route importe le module depuis ./_lib/ (motif éprouvé du dépôt)',
    /from '\.\/_lib\/finubar-macro\.mjs'/.test(route));
  verifier('la route n\'importe RIEN hors de l\'arbre api/',
    !/from '\.\.\/(?!_lib)/.test(route), (route.match(/from '[^']+'/g) || []).join(' '));
  verifier('la route reste derrière le garde PROPRIÉTAIRE (l\'inscription est ouverte)',
    /requireProprietaire/.test(route) && !/requireUser\(/.test(route) && /403/.test(route));
  verifier('la route n\'accepte que GET', /ALLOWED = \['GET'\]/.test(route));

  // Un fichier généré qui n'est jamais propre après un push finit par être
  // commité sans être lu. Deux collectes de suite sur le même état doivent
  // rendre exactement le même octet — sinon le bruit est permanent.
  // ⚠️ Depuis le 07/09, `mesurerGit` vit dans son propre module : elle était
  // enfermée dans un script CLI qu'aucun harnais ne pouvait importer, et un
  // défaut y a dormi pour cette raison. Les deux verdicts ci-dessous lisent
  // donc `mesure-git.mjs` — et le COMPORTEMENT qu'ils devinent dans le texte
  // est désormais exercé pour de vrai par unit-finubar-mesure-git.mjs.
  // ⛔ LA GARDE CONTRE L'AGRÉGAT AMPUTÉ (dry run du 07/09). Une séance qui
  // n'a qu'un dépôt attaché avait fait tomber l'agrégat de 5 dépôts lus à 1,
  // et `api/_lib/finubar-macro.mjs` est ce que lit le mail du matin : l'état
  // amputé serait parti à 7 h avec l'aplomb d'un état complet. Éprouvée en
  // vrai dans ce passage — refus en code 3, `--partiel` en 0, agrégat intact.
  // Ce verdict-ci empêche seulement qu'on la retire sans le vouloir.
  const cli = readFileSync(ici('finubar/collecter.mjs'), 'utf8');
  verifier('la collecte REFUSE d\'écrire un agrégat qui perdrait des dépôts lus',
    /if \(apres < avant\)/.test(cli) && /process\.exit\(3\)/.test(cli));
  verifier('  \u21b3 et la perte reste possible, mais ASSUMÉE explicitement',
    /--partiel/.test(cli));
  verifier('  \u21b3 les options n\'usurpent pas la place de la date',
    /filter\(\(a\) => !a\.startsWith\('--'\)\)/.test(cli),
    '--partiel serait relu comme une date et sortirait en 2 avant la garde');

  const collecte = readFileSync(ici('finubar/mesure-git.mjs'), 'utf8');
  verifier('l\'empreinte de tête n\'est gardée que s\'il y a une dérive à expliquer',
    /if \(!commitsDepuis\) return \{ tete: null/.test(collecte));
  // ⚠️ `commits_depuis === 0` (aucune dérive) et `commits_depuis === null`
  // (commit noté introuvable) sont DEUX états, et `!p.derive.commits_depuis`
  // les confondait — le second se faisait condamner pour la règle du premier.
  // Trouvé rouge le 2026-09-03 sur un état réel : le grain de RénoAgenda pointe
  // un commit disparu dans un squash. La distinction n'est pas cosmétique, et
  // la seconde assertion dit pourquoi : sans la tête, on n'aurait plus de quoi
  // recaler le grain — c'est exactement le moment où on en a besoin (cf. §6ter,
  // que cette ligne contredisait).
  verifier('aucun projet SANS dérive ne porte d\'empreinte de tête',
    json.projets.filter((p) => p.derive && p.derive.commits_depuis === 0)
      .every((p) => p.derive.tete === null));
  verifier('un commit introuvable, LUI, garde sa tête (c\'est de quoi recaler)',
    json.projets.filter((p) => p.derive && p.derive.commit_inconnu)
      .every((p) => typeof p.derive.tete === 'string' && p.derive.tete.length > 0));
}

// ════════════════════════════════════════════════════════════════════════════
// §8 — LA REPRISE D'UN GRAIN NON RELU (boucle n°1, fermée le 07/09).
//
// ⛔ CE QUE CE HARNAIS SURVEILLE, ET CE N'EST PAS « EST-CE QU'ON GARDE BIEN ».
// Garder est le côté facile, et il marche du premier coup. Le danger est
// l'autre : qu'un grain gardé se fasse passer pour une mesure du jour. On
// remplacerait alors une perte franche — visible, donc corrigible — par un
// mensonge tranquille. C'est la cause n°1 du pre-mortem de cette boucle, et
// tout ce qui suit la vise.
// ════════════════════════════════════════════════════════════════════════════

console.log('\n§9 — un grain repris garde son âge, et le DIT');

const grainType = {
  projet: 'X', depot: 'o/x', cap: '', rattache_a: '', etat: 'en_cours',
  jalon: { nom: '', critere_de_sortie: '' },
  dernier_arret: { le: '2026-08-01', quoi: 'q', commit: 'abc1234' },
  prochaine_action: 'a', bloque_par: [], en_attente_depuis: '',
  boucles_ouvertes: [], maj: '2026-08-01',
};
const avantType = {
  ok: true, motif: '', depot: 'o/x', grain: grainType, recits: [], ciel: 'alpha',
  hors_seance: false, reprise: false, mesure_le: '2026-09-01',
  derive: { tete: 'aaa1111', tete_le: '2026-09-01T10:00:00+02:00', commits_depuis: 0, commit_inconnu: false },
  // les trois champs DÉRIVÉS, que la reprise doit jeter
  jours_depuis_maj: 31, jours_en_attente: null, rang: 2,
};

const r = reprendreGrain(avantType, { depot: 'o/x', ciel: 'vranesh', precedentLe: '2026-09-06' });
verifier('le grain est CONSERVÉ, pas vidé', r && r.ok === true && r.grain && r.grain.projet === 'X');
verifier('⛔ il est marqué REPRIS — il n\'a pas été rouvert aujourd\'hui', r.reprise === true);
verifier('⛔ et il porte la date de sa VRAIE mesure, pas celle du jour',
  r.mesure_le === '2026-09-01', r.mesure_le);
verifier('il reste hors_seance : le dépôt n\'était pas là', r.hors_seance === true);
verifier('l\'accroche vient de depots.json, pas de l\'agrégat repris',
  r.ciel === 'vranesh', `${r.ciel} — sinon déplacer une étoile n'aurait aucun effet ici`);
// ⛔ Les champs dérivés doivent DISPARAÎTRE : c'est `agreger` qui les recalcule
// à la date du jour, et c'est ce qui empêche le grain de rajeunir.
verifier('⛔ les champs dérivés sont jetés (agreger les recalcule)',
  r.jours_depuis_maj === undefined && r.jours_en_attente === undefined && r.rang === undefined);

// ⛔ LE PIÈGE DU PRE-MORTEM, et il ne se voit qu'en rejouant DEUX fois. Une
// reprise de reprise doit garder la PREMIÈRE date. Sinon une note vieille d'un
// mois se redate à chaque collecte et paraît fraîche à perpétuité — la panne
// est invisible le premier jour et totale au bout d'une semaine.
const r2 = reprendreGrain(r, { depot: 'o/x', ciel: 'alpha', precedentLe: '2026-09-07' });
verifier('⛔ une reprise de REPRISE ne redate pas : la mesure reste celle d\'origine',
  r2.mesure_le === '2026-09-01', `${r2.mesure_le} — une note qui se redate seule ment tous les jours`);

// Sans rien de fiable à reprendre, on ne fabrique pas un fait.
verifier('rien à reprendre → null (jamais un grain inventé)',
  reprendreGrain(null, {}) === null
  && reprendreGrain({ ok: false, grain: null }, {}) === null
  && reprendreGrain({ ok: true, grain: null }, {}) === null);

// ⛔ VERROU DE NON-VACUITÉ. Sans lui, tout le §8 serait vert sur une fonction
// qui rendrait `null` à tout — c'est-à-dire sur la panne d'origine, où chaque
// dépôt hors séance ressortait vide.
verifier('⛔ le test ne passe pas à vide : un grain reprenable EST repris',
  reprendreGrain(avantType, { depot: 'o/x' }) !== null);

// Les compteurs : un repris n'est pas un angle mort, et rien ne disparaît.
const a8 = agreger([
  { ...avantType, hors_seance: false, reprise: false },
  reprendreGrain(avantType, { depot: 'o/y', ciel: 'alpha', precedentLe: '2026-09-06' }),
  { ok: false, hors_seance: true, reprise: false, depot: 'o/z', grain: null, derive: null },
  { ok: false, hors_seance: false, motif: 'FINUBAR.md absent', depot: 'o/w', grain: null, derive: null },
], '2026-09-07');
verifier('le repris est compté à part', a8.macro.repris === 1, String(a8.macro.repris));
verifier('⛔ et PAS parmi les hors_seance — c\'est le compteur de l\'angle mort TOTAL',
  a8.macro.hors_seance === 1, `${a8.macro.hors_seance} — les mélanger noierait le seul chiffre alarmant`);
verifier('le repris compte comme lisible : son grain est là', a8.macro.lisibles === 2);
verifier('rien ne disparaît du total',
  a8.macro.lisibles + a8.macro.hors_seance + a8.macro.illisibles === a8.macro.total);
// ⛔ Le grain repris NE RAJEUNIT PAS : son ancienneté se compte depuis `maj`.
const repris8 = a8.projets.find((p) => p.reprise);
verifier('⛔ son ancienneté se compte depuis le grain, pas depuis la collecte',
  repris8.jours_depuis_maj === joursEntre('2026-08-01', '2026-09-07'),
  `${repris8.jours_depuis_maj} — un grain repris qui rajeunit est pire qu'un grain perdu`);

console.log(echecs === 0 ? '\n=== unit-finubar : TOUT VERT ===' : `\n=== unit-finubar : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
