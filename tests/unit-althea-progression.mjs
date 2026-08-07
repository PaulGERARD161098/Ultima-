// Unitaires du MOTEUR DE PROGRESSION d'ALTHEA (Node pur, zéro réseau, zéro
// navigateur, zéro base). 2026-08-06.
//
// Ce harnais n'éprouve pas « est-ce que ça calcule » — il éprouve **les six
// règles cardinales du quadrant** (CADRAGE-ALTHEA.md §3). Une règle qu'on écrit
// dans un document et qu'aucun test ne défend est une intention, pas une règle.
//
// Ce qui est prouvé ici, dans l'ordre d'importance :
//   ① UN JOUR NON RENSEIGNÉ N'EST PAS UN ÉCHEC — il ne compte pas, il ne rompt
//      pas l'élan, il ne descend aucun rang. C'est la règle qui décide de la
//      vie du quadrant : la trahir, c'est punir le silence que Paul a
//      explicitement exclu (« ce n'est pas obligatoire »).
//   ② L'ACQUIS NE SE PERD JAMAIS — jours tenus, rang et meilleur élan ne
//      redescendent sur aucun historique qui s'allonge.
//   ④ LE COMPTEUR NE MENT PAS — fenêtres glissantes fermées à gauche, dates
//      locales, changement de semaine et passage à l'heure d'été.
//   + les cadences dictées, le OU des groupes, la règle `tous`/`un`,
//     le niveau (socle + paliers) et les stats (socle + niveau).

import {
  conditionTenue, skillTenu, compterSkill, rangPour, nomDuRang,
  versLeRangSuivant, niveau, valeurStat, etatAlthea,
  ecartJours, decalerJour, estJourValide, volumeSemaine, RANGS,
} from '../js/althea-progression.mjs';

let echecs = 0;
let total = 0;
function verifier(nom, obtenu, attendu) {
  total += 1;
  const a = JSON.stringify(obtenu);
  const b = JSON.stringify(attendu);
  if (a !== b) {
    echecs += 1;
    console.error(`  ✗ ${nom}\n      attendu ${b}\n      obtenu  ${a}`);
  }
}
function bloc(titre) { console.log(titre); }

const rel = (condition_id, jour, tenu, quantite) => ({ condition_id, jour, tenu, quantite });

// ───────────────────────────── 0. Les dates ─────────────────────────────
bloc('0. Les dates — en local, jamais en UTC');
verifier('date réelle', estJourValide('2026-08-06'), true);
verifier('date impossible refusée', estJourValide('2026-02-30'), false);
verifier('format libre refusé', estJourValide('6/8/2026'), false);
verifier('écart simple', ecartJours('2026-08-01', '2026-08-06'), 5);
verifier('écart négatif', ecartJours('2026-08-06', '2026-08-01'), -5);
verifier('décalage arrière', decalerJour('2026-03-01', -1), '2026-02-28');
verifier('bissextile', decalerJour('2024-03-01', -1), '2024-02-29');
// Le passage à l'heure d'été (Europe/Paris, nuit du 29 mars 2026) : une journée
// de 23 h ne doit pas faire disparaître un jour du calendrier.
verifier('passage heure d’été — la veille', decalerJour('2026-03-29', -1), '2026-03-28');
verifier('passage heure d’été — le lendemain', decalerJour('2026-03-29', 1), '2026-03-30');
verifier('écart à travers le changement d’heure', ecartJours('2026-03-28', '2026-03-30'), 2);
// Passage à l'heure d'hiver (25 octobre 2026) : la journée de 25 h non plus.
verifier('heure d’hiver — pas de jour en double', ecartJours('2026-10-24', '2026-10-26'), 2);

// ──────────────── 1. RÈGLE ① — le silence n'est pas un échec ────────────────
bloc('1. Règle ① — un jour non renseigné n’est PAS un échec');
{
  const c = { id: 'c1', skill_id: 's1', cadence: 'quotidien', groupe: 0 };
  verifier('aucun relevé → null (ni vrai ni faux)',
    conditionTenue(c, [], '2026-08-06'), null);
  verifier('relevé tenu → vrai',
    conditionTenue(c, [rel('c1', '2026-08-06', true)], '2026-08-06'), true);
  verifier('manqué DÉCLARÉ → faux',
    conditionTenue(c, [rel('c1', '2026-08-06', false)], '2026-08-06'), false);

  // Le cœur du sujet : un trou de silence ne rompt pas l'élan.
  const s = { id: 's1', nourriture: 'tous' };
  const releves = [
    rel('c1', '2026-08-01', true), rel('c1', '2026-08-02', true),
    /* 03 et 04 : rien du tout — Paul n'a pas ouvert l'app */
    rel('c1', '2026-08-05', true), rel('c1', '2026-08-06', true),
  ];
  const r = compterSkill(s, [c], releves, '2026-08-01', '2026-08-06');
  verifier('4 jours tenus, 2 jours de silence', r.tenus, 4);
  verifier('le silence NE ROMPT PAS l’élan', r.elan, 4);
  verifier('meilleur élan intact', r.meilleurElan, 4);

  // Et un jour DÉCLARÉ manqué, lui, rompt bien la série.
  const avecManque = [
    rel('c1', '2026-08-01', true), rel('c1', '2026-08-02', true),
    rel('c1', '2026-08-03', false),
    rel('c1', '2026-08-04', true), rel('c1', '2026-08-05', true), rel('c1', '2026-08-06', true),
  ];
  const r2 = compterSkill(s, [c], avecManque, '2026-08-01', '2026-08-06');
  verifier('un manqué DÉCLARÉ rompt l’élan', r2.elan, 3);
  verifier('mais les jours tenus restent comptés', r2.tenus, 5);
  verifier('et le meilleur élan garde la trace', r2.meilleurElan, 3);
}

// ──────────────── 2. RÈGLE ② — l'acquis ne se perd jamais ────────────────
bloc('2. Règle ② — l’acquis ne se perd jamais, l’état respire');
{
  const c = { id: 'c1', skill_id: 's1', cadence: 'quotidien', groupe: 0 };
  const s = { id: 's1', nourriture: 'tous' };
  const seuils = [3, 5, 8, 12, 20];

  // 7 jours tenus, puis 10 jours de rien : le rang et le cumul ne bougent pas.
  const releves = [];
  for (let i = 0; i < 7; i += 1) releves.push(rel('c1', decalerJour('2026-07-01', i), true));

  const auPic = compterSkill(s, [c], releves, '2026-07-01', '2026-07-07');
  const bienPlusTard = compterSkill(s, [c], releves, '2026-07-01', '2026-07-17');
  verifier('jours tenus inchangés après 10 jours d’absence',
    bienPlusTard.tenus, auPic.tenus);
  verifier('meilleur élan inchangé', bienPlusTard.meilleurElan, auPic.meilleurElan);
  verifier('le rang ne redescend pas',
    rangPour(bienPlusTard.tenus, seuils), rangPour(auPic.tenus, seuils));
  verifier('mais l’élan courant, lui, est retombé à… lui-même (aucun manqué déclaré)',
    bienPlusTard.elan, 7);
  verifier('et l’état du jour n’est PAS « tenu »', bienPlusTard.etatDuJour, null);

  // Un manqué déclaré tout à la fin : l'élan tombe, le rang tient.
  const avecChute = releves.concat([rel('c1', '2026-07-08', false)]);
  const apres = compterSkill(s, [c], avecChute, '2026-07-01', '2026-07-08');
  verifier('élan retombé à zéro', apres.elan, 0);
  verifier('meilleur élan gravé', apres.meilleurElan, 7);
  verifier('rang tenu malgré la chute', rangPour(apres.tenus, seuils), rangPour(auPic.tenus, seuils));
}

// ──────────────── 3. Les cadences dictées par Paul ────────────────
bloc('3. Les cinq cadences');
{
  // « sport tous les 2 jours »
  const sport = { id: 'sp', skill_id: 's', cadence: 'tous_les_n_jours', seuil: 2, groupe: 0 };
  const fait = [rel('sp', '2026-08-05', true)];
  verifier('tenu le lendemain (dans les 2 jours)', conditionTenue(sport, fait, '2026-08-06'), true);
  // ⚠️ SÉMANTIQUE TRANCHÉE ICI, et le harnais l'a forcée : au surlendemain, la
  // fenêtre ne contient plus rien. Ce n'est PAS « manqué » — c'est
  // « non renseigné ». Répondre `false` ferait retomber l'élan sur un simple
  // silence, exactement ce que la règle cardinale ① interdit. La cadence sert
  // à faire COMPTER un jour couvert par une séance récente, jamais à
  // fabriquer un échec.
  verifier('fenêtre vide au surlendemain → non renseigné, pas manqué',
    conditionTenue(sport, fait, '2026-08-07'), null);
  verifier('rien du tout → non renseigné', conditionTenue(sport, [], '2026-08-07'), null);
  // Seul un manqué DÉCLARÉ dans la fenêtre vaut faux.
  verifier('manqué déclaré dans la fenêtre → faux',
    conditionTenue(sport, [rel('sp', '2026-08-07', false)], '2026-08-07'), false);

  // « 10 km par semaine »
  const course = { id: 'co', skill_id: 's', cadence: 'volume_semaine', seuil: 10, groupe: 0 };
  const km = [
    rel('co', '2026-08-01', true, 4),
    rel('co', '2026-08-04', true, 3),
    rel('co', '2026-08-06', true, 3.5),
  ];
  verifier('10,5 km sur 7 jours → tenu', conditionTenue(course, km, '2026-08-06'), true);
  verifier('volume affiché', volumeSemaine(course, km, '2026-08-06'), 10.5);
  // ⚠️ La fenêtre est fermée à gauche : au 2026-08-08, le 01 (4 km) en est
  // SORTI. C'est le piège du changement de semaine — un relevé compté deux
  // fois, ou jamais, et le compteur ment (règle ④).
  verifier('la fenêtre glisse : le 01 est sorti', volumeSemaine(course, km, '2026-08-08'), 6.5);
  verifier('donc plus tenu', conditionTenue(course, km, '2026-08-08'), false);

  // « 30 min par jour »
  const langue = { id: 'ja', skill_id: 's', cadence: 'duree_jour', seuil: 30, groupe: 0 };
  verifier('30 min → tenu', conditionTenue(langue, [rel('ja', '2026-08-06', true, 30)], '2026-08-06'), true);
  verifier('20 min → pas tenu', conditionTenue(langue, [rel('ja', '2026-08-06', true, 20)], '2026-08-06'), false);
  verifier('rien → non renseigné', conditionTenue(langue, [], '2026-08-06'), null);

  // « 4 repas par jour »
  const repas = { id: 're', skill_id: 's', cadence: 'n_par_jour', seuil: 4, groupe: 0 };
  verifier('4 repas → tenu', conditionTenue(repas, [rel('re', '2026-08-06', true, 4)], '2026-08-06'), true);
  verifier('3 repas → pas tenu', conditionTenue(repas, [rel('re', '2026-08-06', true, 3)], '2026-08-06'), false);
}

// ──────────────── 4. Le OU des groupes, et tous/un ────────────────
bloc('4. Les groupes en OU, et la règle de nourriture');
{
  // TRADUCTEUR : italien OU espagnol OU japonais, une seule suffit.
  const trad = { id: 'tr', nourriture: 'tous' };
  const langues = [
    { id: 'it', skill_id: 'tr', cadence: 'duree_jour', seuil: 30, groupe: 1 },
    { id: 'es', skill_id: 'tr', cadence: 'duree_jour', seuil: 30, groupe: 1 },
    { id: 'ja', skill_id: 'tr', cadence: 'duree_jour', seuil: 30, groupe: 1 },
  ];
  verifier('une seule langue suffit',
    skillTenu(trad, langues, [rel('ja', '2026-08-06', true, 30)], '2026-08-06'), true);
  verifier('une langue insuffisante et rien d’autre → pas tenu',
    skillTenu(trad, langues, [rel('ja', '2026-08-06', true, 10)], '2026-08-06'), false);
  verifier('aucune langue renseignée → non renseigné',
    skillTenu(trad, langues, [], '2026-08-06'), null);

  // PEAK PERFORMANCE : quatre gardes quotidiennes, règle `tous`.
  const peak = { id: 'pk', nourriture: 'tous' };
  const gardes = [0, 1, 2, 3].map((i) => ({
    id: `g${i}`, skill_id: 'pk', cadence: 'quotidien', groupe: i,
  }));
  const troisSurQuatre = [0, 1, 2].map((i) => rel(`g${i}`, '2026-08-06', true));
  verifier('trois gardes sur quatre → PAS un jour tenu',
    skillTenu(peak, gardes, troisSurQuatre, '2026-08-06'), null);
  const troisTenuesUneManquee = troisSurQuatre.concat([rel('g3', '2026-08-06', false)]);
  verifier('une garde déclarée manquée → jour non tenu',
    skillTenu(peak, gardes, troisTenuesUneManquee, '2026-08-06'), false);
  const toutes = [0, 1, 2, 3].map((i) => rel(`g${i}`, '2026-08-06', true));
  verifier('les quatre → jour tenu', skillTenu(peak, gardes, toutes, '2026-08-06'), true);

  // SPORT : plusieurs portes, règle `un`.
  const sport = { id: 'sp', nourriture: 'un' };
  const portes = ['course', 'salle', 'velo'].map((n, i) => ({
    id: n, skill_id: 'sp', cadence: 'quotidien', groupe: i,
  }));
  verifier('une porte suffit en règle « un »',
    skillTenu(sport, portes, [rel('course', '2026-08-06', true)], '2026-08-06'), true);
}

// ──────────────── 5. Les rangs ────────────────
bloc('5. Les rangs, et leur nom');
{
  verifier('0 jour → pas encore de rang', rangPour(0), 0);
  verifier('7 jours → rang I', rangPour(7), 1);
  verifier('29 jours → toujours rang I', rangPour(29), 1);
  verifier('30 jours → rang II', rangPour(30), 2);
  verifier('365 jours → rang V', rangPour(365), 5);
  verifier('1000 jours → toujours rang V (pas de rang VI)', rangPour(1000), 5);
  verifier('rang 0 ne se nomme pas', nomDuRang(0), null);
  // Le rang II ne s'appelle plus « La Constance » : c'est un SKILL de Paul.
  verifier('le rang II s’appelle L’Assiduité', nomDuRang(2), "L'Assiduité");
  verifier('aucun rang ne porte le nom d’un skill de Paul',
    RANGS.includes('La Constance'), false);
  verifier('vers le rang suivant', versLeRangSuivant(25), {
    rangVise: 2, nomVise: "L'Assiduité", reste: 5, part: (25 - 7) / (30 - 7),
  });
  verifier('au sommet, plus rien à viser', versLeRangSuivant(400), null);
}

// ──────────────── 6. Le niveau et les stats ────────────────
bloc('6. Le niveau, et les stats qui en découlent');
{
  // Décision Paul : un palier franchi = +1 niveau, au-dessus d'un socle déclaré.
  verifier('socle seul', niveau(48, []), 48);
  verifier('socle + paliers', niveau(48, [2, 3, 4, 1, 1]), 48 + 11);
  verifier('les quêtes comptent aussi', niveau(48, [2], 3), 53);
  verifier('un socle négatif ne casse rien', niveau(-5, [1]), 1);

  // Décision Paul : chaque niveau fait gagner un point PARTOUT.
  verifier('stat = socle + niveau', valeurStat(14, 48), 62);
  verifier('un niveau de plus, un point partout', valeurStat(14, 49) - valeurStat(14, 48), 1);
  verifier('c’est le socle qui distingue',
    valeurStat(21, 48) - valeurStat(14, 48), 7);
}

// ──────────────── 7. L'état complet ────────────────
bloc('7. L’état complet, tel que l’écran le consomme');
{
  const etat = etatAlthea({
    avatar: { socle_niveau: 40, titre_code: 'farsight' },
    skills: [
      { id: 's1', nom: 'PIEDS LÉGERS', enonce: 'court 10 km par semaine', nourriture: 'tous', seuils: [1, 3, 8, 12, 20] },
      { id: 's2', nom: 'OMNIVORE', enonce: 'peut manger de tout', nourriture: 'tous', seuils: [1, 3, 8, 12, 20] },
    ],
    conditions: [
      { id: 'c1', skill_id: 's1', cadence: 'quotidien', groupe: 0 },
      { id: 'c2', skill_id: 's2', cadence: 'quotidien', groupe: 0 },
    ],
    releves: [
      rel('c1', '2026-08-04', true), rel('c1', '2026-08-05', true), rel('c1', '2026-08-06', true),
      rel('c2', '2026-08-04', true),
    ],
    stats: [{ code: 'force', socle: 14 }, { code: 'intelligence', socle: 21 }],
    jour: '2026-08-06',
    depuis: '2026-08-04',
  });

  verifier('niveau = socle + les rangs des deux skills (2 et 1)', etat.niveau, 40 + 2 + 1);
  verifier('la première stat suit le niveau', etat.stats[0].valeur, 14 + 43);
  verifier('la seconde aussi', etat.stats[1].valeur, 21 + 43);
  verifier('un skill tenu aujourd’hui', etat.tenusAujourdhui, 1);
  verifier('l’autre est en sommeil', etat.enSommeil, 1);
  verifier('le skill en sommeil n’est pas « manqué »',
    etat.skills.find((s) => s.nom === 'OMNIVORE').etatDuJour, null);
  verifier('mais son acquis est intact',
    etat.skills.find((s) => s.nom === 'OMNIVORE').tenus, 1);

  // §9 — l'état ne transporte que des COMPTES et les libellés du skill lui-même ;
  // aucun libellé de CONDITION (« pas de tabac ») n'en sort jamais.
  const texte = JSON.stringify(etat);
  verifier('aucun libellé de condition dans l’état', /libelle/.test(texte), false);
}

// ──────────────── Verdict ────────────────
console.log(`\nunit-althea-progression : ${total - echecs}/${total} assertions vertes`);
if (echecs > 0) {
  console.error(`${echecs} assertion(s) en échec`);
  process.exit(1);
}
