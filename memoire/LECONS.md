<!-- lecons:empreinte v122 2026-11-10 sha256:2b3590d5a6f8 -->
# Leçons à ne pas oublier

> **Source unique des leçons de méthode, pour les dix dépôts.** Demandé par
> Paul le 2026-09-11 : *« compiler les grands points de nos sessions de travail
> pour que tu les gardes en tête dans les repos ou dans Ultima, le repo macro »*.
>
> ⛔ **Ce fichier n'est pas un journal.** Le journal des décisions vit dans
> `Ultima-/memoire/JOURNAL-DECISIONS.md` et raconte ce que Paul a tranché ; celui-ci
> retient ce qu'une **erreur** a appris. Une entrée n'arrive ici que lorsqu'un
> défaut est passé pour de vrai, et elle porte toujours **ce qu'il a coûté** :
> une règle sans son incident se lit comme un conseil, et un conseil s'oublie.
>
> ⛔ **Il est classé par famille, pas par date** — c'est ce qui le rend
> consultable en cours de travail. La date reste sur chaque entrée : elle dit
> quand la facture est tombée.

⛔ **SA SOURCE UNIQUE EST `Ultima-/memoire/LECONS.md`.** Il est **copié à
l'identique** dans les neuf autres dépôts, parce qu'une séance ouverte sur
RenoAgenda ou artisan-builder n'a pas Ultima sous la main. Toute évolution se
fait **dans Ultima**, puis se re-copie : on ne corrige jamais une copie sur
place, sinon les dix divergent et plus personne ne sait laquelle fait foi.
*(Les chemins cités portent leur dépôt en préfixe : ils doivent se lire depuis
n'importe lequel des dix — et toute commande qui en cite un se lance **depuis le
dossier qui contient les dix clones**, jamais depuis la racine d'un dépôt.)* ⇒ **Comment le sceller et le propager :
`Ultima-/memoire/LECONS-PROCEDURE.md`** — sorti d'ici le 30/09 pour ne pas
occuper, dans un fichier que dix dépôts injectent en entier, la place d'une
leçon. ⚠️ Il vit **dans Ultima seulement**, et c'est délibéré : on ne propage
jamais depuis une copie, donc une séance qui propage a Ultima sous la main. Le
préfixe de dépôt n'est pas décoratif — sans lui, ce renvoi serait mort dans les
neuf copies, et un renvoi mort se lit exactement comme un renvoi valide.

**Comment il vit.**
- **Une leçon s'ajoute quand elle est payée**, en fin de séance, dans le commit
  du travail qui l'a révélée. Jamais par anticipation : une règle qui n'a rien
  coûté n'a pas encore prouvé qu'elle servait.
- **Une leçon se relit avant d'être réutilisée.** Une note vieillit comme un
  test qui nomme une couleur supposée — voir *Rouvrir une dette commence par la
  re-mesurer*, ci-dessous, qui s'applique d'abord à ce fichier.
- **Son contenu ne se redit nulle part ailleurs.** Les `CLAUDE.md` des dépôts
  **pointent** ce fichier, ils n'en reprennent aucune ligne. *(À ne pas
  confondre avec la copie du fichier entier dans les dix dépôts, ci-dessus :
  copier un fichier tel quel se vérifie d'un `diff` ; en redire le contenu
  ailleurs, non — et c'est cette seconde forme qui fabrique deux vérités.)*

---

## 1. Mesurer, et croire ce qu'on mesure

**UNE ÉCRITURE EXPIRÉE N'EST NI FAITE NI PAS FAITE — ELLE EST EN SUSPENS**
*(2026-11-04, RenoDevis, nettoyage SOLA).* La suppression validée par Paul (10
dossiers, 3 entrées de corpus) passait par `execute_sql` de l'outil Supabase, qui
demande une confirmation à Paul et expire au bout de 60 s. Trois expirations de
suite ; après chacune, la base relue en lecture seule disait « rien de supprimé ».
Plus tard, Paul a lancé le même bloc dans l'éditeur SQL : refusé, « RD : 0 lignes au
lieu de 10 ». Une des trois demandes avait été acceptée APRÈS ma dernière relecture.
Ce qui a évité une seconde suppression : la transaction comptait ses lignes et
exigeait que les versions gardées soient présentes avant d'agir. ⛔ **La règle** :
après une expiration, la relecture ne vaut que pour l'instant où on la fait — avant
de rejouer, relire encore ; et toute écriture qui peut être rejouée porte son propre
verrou (nombre exact de lignes visées, présence de ce qu'on garde), sinon un
rejeu tardif fait le travail deux fois.

**UNE GÉNÉRATION SE VÉRIFIE SUR LES OCTETS LIVRÉS, Y COMPRIS LES SOURCES INCHANGÉES** *(2026-10-27, Ultima-).* La copie locale des sources du catalogue technologique avait une fin de ligne supplémentaire après reconstruction par patch. Le module publié a été généré et contrôlé contre ces copies, puis seul le module et les documents modifiés ont été livrés. Les autres sources sont restées exactes dans GitHub : leurs empreintes ne correspondaient donc plus au module. Coût observé : la CI s'est arrêtée à 79/80 suites ; les trois jobs partageant ce verrou ont échoué malgré les contrôles locaux favorables. Aucun changement de données métier.
⇒ Avant génération, comparer à la révision distante les empreintes Git de toutes les sources, pas seulement celles du diff. Reconstituer les fichiers sans ajouter ni retirer de caractère ; ne pas normaliser arbitrairement un fichier métier. Après génération, comparer les empreintes des fichiers livrés et vérifier la publication avec les sources exactes qui resteront dans l'arbre final. Le garde-fou a détecté l'écart ; il reste actif. Source : Ultima- PR #418, workflow 40474174207, verdict `donneeAJour` ; correction sur branche, sans publication de production.

**UN RÉSULTAT COURANT EXIGE TOUTES SES DÉPENDANCES, PAS SEULEMENT SES CHIFFRES**
*(2026-10-23, mon-dpe.fr, audit KELVIN).* L'empreinte ne couvrait pas toutes les
entrées et provenances utilisées par les réserves ; l'export gardait une appréciation
issue d'anciens besoins ou montants. Des frais de prêt absents étaient traités comme
zéro, et une PAC air/air existante échappait à la déduction du cumulus lors du passage
à une PAC assurant l'eau chaude. Conséquence constatée dans l'audit : résultats et
exports susceptibles d'être présentés comme actuels ou complets à tort ; aucune perte
financière réelle établie. Correctifs : version du moteur et empreinte étendues,
appréciation reconstruite, total incomplet signalé, décomposition des usages corrigée.
Contre-épreuve : nouveaux tests sur l'ancien code, puis suite corrigée verte.
Preuve : `mon-dpe.fr` PR #256, code `6f4df327022ca0750e4b74d73998a2a232e121bd`.
⇒ Avant d'accepter « courant » ou « total », relier chaque conclusion à ses entrées
effectives et à leur provenance ; absent ne devient pas zéro, un usage ne se compte
qu'une fois. Grille réutilisable : `Ultima-/zohshia/anti-pattern/TECHNO.md` §7.

**UN DÉPLOIEMENT ABSENT N'EST PAS UN DÉPLOIEMENT IGNORÉ** *(2026-10-21)*. Un
`ignoreCommand` qui saute un build laisse une trace : le déploiement existe, à l'état
« Ignored ». Un commit sans AUCUN déploiement ne prouve rien sur la règle — ni qu'elle
a sauté, ni qu'elle a laissé construire : la plateforme n'a peut-être jamais été
prévenue. ⛔ Avant de conclure, deux lectures : **chercher par SHA** ET **lister le
projet** autour de l'heure du commit. Rien dans les deux → « non déclenché », dit comme
tel, jamais rangé dans « ignoré ». ⛔ La preuve qu'une règle de saut laisse passer le
code est un déploiement **READY sur un commit de code**, lu à la source ; tant qu'il
n'existe pas, elle n'est pas prouvée.
*Incident : boucle coûts, 21/10. Trois fusions entre 15:30:47 et 15:30:59 UTC (Artidispo
`c7fd2fd`, RenoDevis `09f6b5a`, mon-dpe.fr `a69d619`) n'ont produit aucun déploiement
Vercel — ni ignoré, ni en erreur — alors que les commits d'avant et d'après ont déployé.
Cause probable : notifications GitHub → Vercel non reçues (non prouvée). Paul : ne rien
relancer. La preuve « le code construit encore » d'Artidispo et de mon-dpe.fr reste
donc à lire au prochain commit de code.*

**UN OBJET DE TUILE N'EST PAS UN BÂTIMENT** *(2026-10-12, mon-dpe.fr)*.
Pour surligner le logement d'un client sur la carte 3D, on prenait l'objet
renvoyé par la tuile vectorielle au point d'adresse. Or OpenFreeMap regroupe
parfois plusieurs bâtiments voisins dans UN seul MultiPolygon : tout le pâté de
maisons s'est allumé en rouge, en production de preview. Paul : *« c'est
atroce »*. Corrigé en ne gardant que la PARTIE de géométrie qui contient le
point (`mon-dpe.fr/lib/batiment-central.ts`, test « ATROCE »).
⛔ **Une donnée géographique se mesure dans sa forme réelle, pas dans celle
qu'on imagine** : avant de surligner « un bâtiment », vérifier ce qu'est un
objet de la source — un bâtiment, une partie, ou un regroupement.

**UNE SONDE SE LIT EN ENTIER, PAS SUR LE CHAMP QU'ON ATTENDAIT** *(2026-10-07, RenoDevis)*.
État des lieux « outil opérationnel » donné à Paul : « Stripe configuré, 2 artisans reliés ».
J'avais lu `actif:true` dans le battement `rr-stripe-embarquement` — et pas les autres clés
du même objet, qui disaient `test:true`, `ouverts:0`. La production tournait en mode test et
aucun compte ne pouvait encaisser : l'affirmation était fausse, et il a fallu la corriger le
lendemain devant Paul. Le même jour, une requête « échéances à venir » comptait `sent_at null`
et a montré 3 relances sur un devis signé : elles étaient `cancelled` / `skipped` — la colonne
`status` portait la réponse.

⛔ **Un champ qui dit « oui » n'épuise pas l'objet qui le porte.** Une sonde à plusieurs clés
répond à plusieurs questions ; n'en lire qu'une, c'est choisir la réponse.

⇒ **Relire TOUTES les clés d'un battement ou d'un JSON d'état avant d'en tirer une phrase** —
sans en recopier les valeurs sensibles (secret, donnée personnelle : on nomme la clé, on masque la valeur),
et lire le schéma d'une table (`information_schema.columns`) avant d'y compter un état par une
colonne de date.

**UNE SORTIE REDIRIGÉE VERS `/dev/null` EST UNE MESURE QU'ON NE FERA JAMAIS** *(2026-09-21, Ultima + RenoDevis)*.
Payé **deux fois dans la même journée**, ce qui en fait un motif et pas un accident.
① Un `npx eslint … && echo "lint OK"` : ESLint avait échoué sur
`ERR_MODULE_NOT_FOUND`, le `&&` a masqué le code de sortie, et « lint OK » est
parti à Paul. ② Un `git merge … >/dev/null 2>&1` pour éprouver une PR : la fusion
a été **refusée** (« refusing to merge unrelated histories »), l'arbre est resté
sur `main`, et j'ai annoncé « 594/594, build OK, elle est saine » — je mesurais
`main` seul. La PR a ensuite été refusée par GitHub, ce qui a révélé l'écart.

⛔ **Le silence d'une commande ne se distingue pas de son succès.** Et le pire
n'est pas de rater la mesure : c'est de croire en avoir une, puis de la donner.

⇒ **Ne jamais rediriger ni chaîner en `&&` la sortie d'une commande dont on va
croire le résultat.** Si le bruit gêne, filtrer *après* avoir relu le code de
sortie (`; echo "code=$?"`), jamais à la place. Et sur une fusion d'essai,
vérifier d'abord qu'un ancêtre commun existe : `git merge-base A B`.

**UN IDENTIFIANT ABRÉGÉ N'EST PAS L'IDENTIFIANT — ET IL NE SE COMPLÈTE JAMAIS
DE MÉMOIRE** *(2026-09-11 à 2026-10-21 — dix occurrences)*.
Un préfixe permet de reconnaître un SHA, UUID, déploiement ou ticket, jamais de le
reconstituer. Historique : **11/09**, douze caractères inventés après sept lus, refus ;
**13/09 ×2**, deux `409` à deux heures d'intervalle, malgré un compte rendu explicite ;
**30/09 ×3**, SHA fabriqués après 7, 8 puis 13 caractères justes, jusque dans le geste
qui consignait cette leçon. Le troisième a été attrapé en reprenant la valeur par
`git rev-parse` puis en la comparant caractère par caractère avant écriture.
**03/10 (RenoDevis)**, littéral Python `86f45c99` au lieu de `86f45c98…`, rejeté avant
commit par `git merge-base --is-ancestor` ; **06/10 (Ultima #356)**, SHA complet de
mémoire en `expectedHeadSha`, fusion refusée puis réussie avec le SHA lu ;
**08/10**, ancre `dernier_arret.commit` fabriquée dans Python après sept caractères
justes, découverte par le `rev-parse` lancé après écriture, avant commit ;
**21/10**, même faute dans le grain FINUBAR, rejetée par
`Ultima-/finubar/collecter.mjs` (« commit inatteignable »), pas par la relecture.

⛔ La vigilance, même celle de l'auteur de la leçon, n'a arrêté aucune récidive.
Un préfixe juste rend l'invention crédible ; un littéral dans un script reste une
saisie. Un rapport ne s'exécute pas. ⇒ **Lire l'identifiant complet puis injecter
directement sa sortie dans l'écriture** (`VRAI=$(git rev-parse origin/main)`),
jamais taper, compléter ou écrire avant de vérifier. Le préfixe d'un rapport, journal
ou d'une PR n'est pas une source.

Conserver aussi un refus aval : `expectedHeadSha` est un lease ; le collecteur
signale « grain non rattaché » ou un commit inatteignable. Ce refus a tenu quand la
vigilance échouait ; sans lui une fusion peut réussir sur un lot non vérifié.
**Deux angles morts** : un rejet distant (13/09) révèle l'absence de contrôle local,
dangereuse si une autre API n'a pas de garde ; un libellé peut tromper (30/09,
`409 Head branch was modified`). Relire les SHA des deux côtés : ici ils étaient
identiques, la branche n'avait pas bougé.

**UN COMMIT « HORS MAIN » N'EST PAS UN TRAVAIL HORS MAIN — ON COMPARE LES
CONTENUS, PAS LES SHA** *(2026-09-18)*. Vu RenoBoost sur une branche à sept
commits que `git rev-list origin/main..HEAD` disait absents de `main`, sans PR
ouverte, j'en ai conclu « du travail non intégré » et je l'ai rapporté à Paul
comme tel. Il a donné son GO sur ce constat. **Le travail était sur `main`
depuis trois jours** — PR #459, fusionnée en **squash** : les commits de branche
ne sont ancêtres de rien, leur contenu est pourtant là. `git diff origin/main..HEAD`
rendait **zéro ligne dans les deux sens**. Coût : un merge sans objet, un GO
obtenu sur un constat faux, et un `git push` qui a **recréé une branche distante
supprimée** — que le proxy m'empêche ensuite d'effacer. ⛔ Le dépôt portait DÉJÀ
la leçon du squash, écrite le 15/09, et je l'avais appliquée correctement à
RenoDevis **le matin même** : une leçon retenue sur le dépôt qui l'a payée ne se
transporte pas toute seule sur celui qu'on n'a pas travaillé. *Règle* : sur tout
dépôt qu'on n'a pas soi-même poussé, le premier geste est `git diff origin/main..HEAD`
— l'absence de diff prouve l'intégration, l'absence d'ancêtre ne prouve rien.
Et une référence `origin/<branche>` locale peut désigner une branche **supprimée
depuis** : un `push` la ressuscite au lieu de la mettre à jour.


**UNE VARIABLE QU'ON NE PEUT PAS LIRE NE SE DÉCLARE PAS PRÉSENTE** *(2026-09-15)*.
« `SUPABASE_URL` est déjà défini pour les leads, il sert ici aussi » — affirmé
parce que le code la LIT, jamais parce que je l'avais VUE. Elle était absente de
la production : la capture des leads retombe en silence sur `mailto:` quand elle
manque, donc son absence n'avait jamais fait de bruit. Coût : deux allers-retours
avec Paul, une variable ajoutée pour rien, un redéploiement de plus. *Règle* :
quand aucun outil ne permet de lire une valeur, on ne la suppose pas — on le DIT,
et on fabrique de quoi la mesurer. Ici, deux lignes de journal ont tranché ce que
trois hypothèses n'avaient pas tranché.

**UN REFUS QUI COUVRE PLUSIEURS CAUSES N'EN DÉSIGNE AUCUNE** *(2026-09-15)*. Un
écran « l'accès doit être configuré » recouvrait TROIS causes distinctes, dont
deux ne journalisaient rien. Le symptôme était identique, la correction non. Et
c'est le même défaut que « Origine refusée », corrigé L'AVANT-VEILLE au même
endroit du code, réintroduit ailleurs le lendemain — une leçon apprise à un
endroit ne se propage pas toute seule aux autres. *Règle* : tout refus nomme sa
cause CÔTÉ SERVEUR — le visiteur garde un message unique, on ne lui décrit pas la
configuration ; le journal, lui, dit laquelle des causes a parlé. Les noms de
variables ne sont pas des secrets, leurs valeurs si : on journalise la présence,
jamais le contenu.


**UN CLIENT QUI COUPE AVANT LE SERVEUR S'AVEUGLE** *(2026-09-14, RenoBoost)*.
Notre délai valait 8 s, comme le `statement_timeout` du rôle `authenticator` : notre `AbortController` gagnait la course, et l'écran ne recevait qu'un `status: 0`, un silence sans cause. Passé au-dessus, Postgres a répondu `57014` — et c'est CE motif qui a désigné la vraie correction.
⇒ *Règle* : le délai client se pose AU-DESSUS du plafond serveur. Sinon il masque le motif que le serveur aurait donné.

**UN SEUIL OU UN MOTIF SE RÈGLE CONTRE LE CORPUS, JAMAIS CONTRE L'IDÉE QU'ON
S'EN FAIT** *(2026-09-30, quatre fois dans la même heure)*. En élaguant ce
fichier, il fallait compter ses entrées — l'invariant qui garantit qu'aucune
leçon ne disparaît. Le compteur s'est trompé **quatre fois de suite**, toujours
en rendant un nombre plausible : une classe de caractères écartait les titres à
apostrophe ou à accent grave ; une recherche ligne à ligne manquait les titres
à cheval sur deux lignes ; un taux de capitales à 0,8 écartait
`UN CLONE SUPERFICIEL NE SUIT QUE \`main\`` parce que le code entre backticks
est en minuscules. Comptes successifs : 147, 113, 137, **144**.

⛔ **Le danger n'est pas l'erreur, c'est qu'un compteur faux sert d'invariant.**
Si j'avais élagué sur le compte de 137, sept leçons pouvaient disparaître sans
que rien ne le dise. Les quatre pannes ont été trouvées en **soumettant au
compteur des titres dont je connaissais la réponse** — jamais en le relisant.
⇒ Un instrument qui mesure un corpus se livre avec son jeu d'épreuve, et le jeu
contient un cas de chaque forme réelle, pas un cas type.

**AVANT DE CROIRE UNE MESURE, LUI DEMANDER CE QU'ELLE RÉPOND SUR UN CAS DONT ON
CONNAÎT DÉJÀ LA RÉPONSE** *(2026-08-17)*. Trois sondes fausses dans une seule
séance, avec le même signe d'alerte chaque fois : **une réponse trop uniforme**.
Un instrument de contraste qui condamnait un titre parfaitement lisible ; une
mesure de géométrie qui comparait des étoiles au cadre d'un blason attrapé par
un `querySelector('svg')` trop large ; une sonde de canvas qui répondait « blanc
pur » à toutes les options, y compris `eclat: 0`. Les trois se seraient
effondrées en une ligne sous ce test. *« Ça a l'air cohérent » ne valide pas un
instrument — seul un cas de référence le valide.*

**UN 204 N'EST PAS UNE SUPPRESSION — UN CODE HTTP DIT QUE LA REQUÊTE EST PASSÉE,
PAS CE QU'ELLE A FAIT** *(2026-10-03, RenoBoost + RenoDevis)*. Les journaux d'API
montraient onze `DELETE … clients?legacy_id=eq.ghl_…` répondant `204` à chaque
passage de la synchro GHL. J'en ai tiré « la synchro supprime et recrée onze fiches
toutes les quinze minutes », je l'ai annoncé à Paul comme un risque de perte de
clients, et une boucle a été ouverte sur ce constat. En base : les onze lignes
n'existaient plus depuis longtemps — PostgREST rend `204` à un `DELETE` qui ne
trouve rien —, et `pg_stat_user_tables` comptait **110 suppressions sur toute la
vie de la table**, là où onze par quart d'heure en auraient fait des milliers. Coût :
une fausse alerte donnée à Paul, et une boucle lancée pour corriger ce qui
n'existait pas.

⇒ **Une écriture se prouve en base, jamais par son code de retour** : la ligne
existait-elle avant, existe-t-elle après, et que disent les compteurs
(`n_tup_ins`, `n_tup_del`, `row_count`) ? Ce contrôle coûte une requête, il se fait
**avant** de nommer le défaut à Paul — pas après avoir ouvert la boucle.

**UNE GÉOMÉTRIE SE MESURE, ELLE NE SE VALIDE PAS À L'ŒIL** *(2026-08-01)*. Tout
élément placé dans un cadre borné voit sa `getBBox()` comparée au `viewBox`, et
s'éprouve sur un **pire cas construit**, jamais sur les seules données du jour,
qui sont un échantillon favorable. Le foyer de DRAUKHAIN débordait chez Paul
après avoir été « validé » sur un rendu regardé. *« Ça a l'air bien » n'est pas
un critère de réussite : c'est l'absence de critère.*

**UN FOND SUPPOSÉ EST UN FOND FAUX** *(2026-08-20)*. Quand un calcul et une
mesure divergent, c'est **l'hypothèse cachée du calcul** qu'il faut aller
chercher, pas l'arithmétique. Le contraste calculé d'un lien donnait 5,12:1
contre 4,36 mesuré : le lien n'était pas posé sur la nuit de la page mais sur le
sol étoilé.


**UNE COULEUR FIXE N'EST JAMAIS FAUSSE QUAND ON L'ÉCRIT : ELLE LE DEVIENT QUAND SON FOND CHANGE** *(2026-09-11, RenoBoost)*.
Trois occurrences dans la même journée — le logo, le bandeau B2B, le menu mobile —, chacune sous une raison qui avait été bonne au moment de l'écrire. Et un token d'ENCRE employé comme FOND a donné 2,14:1 en production pendant trois heures.
⇒ *Règle* : une couleur se juge relativement à son fond, jamais dans l'absolu. Les deux règles (couleur fixe sur fond qui bouge ; token d'encre employé comme fond) sont désormais MÉCANIQUES : `RenoBoost/tests/langage-encres.test.mjs`.

**CLASSER PAR LA MESURE PLUTÔT QUE PAR LE DÉBAT** *(2026-08-17)*. Pour embarquer
sept pages sur trois registres, ne pas décider en amont : appliquer le registre
probable aux sept, puis **laisser le harnais désigner celles qui résistent**.
Cinq étaient bonnes du premier coup, une seule a demandé du travail. Débattre
page par page aurait coûté plus cher, et se serait trompé.

**ROUVRIR UNE DETTE COMMENCE PAR LA RE-MESURER, JAMAIS PAR RELIRE SA
DESCRIPTION** *(2026-08-20)*. Deux notes de registre prises en défaut dans la
même séance : « 5 textes sur 2 pages, assombrir un jeton global » était en
réalité 7 textes sur 3 pages, un jeton local, et sur une page il fallait
**éclaircir**. Une dette décrite de mémoire est un souvenir, pas une mesure.

**UN CAS À RÉPONSE CONNUE DOIT ÊTRE JOUÉ DANS L'ENVIRONNEMENT DE LA VRAIE
LECTURE** *(2026-09-11)*. Après un squash, le grain Finubar d'artisan-builder
pointait le commit de la branche, que la fusion avait fait disparaître de `main`.
Le contrôle de dérive, lancé **dans le clone de travail**, répondait
tranquillement « le dépôt a avancé de 2 commits » — parce qu'un clone qui a servi
à la branche garde ses objets après la fusion, et que `rev-list` trouvait donc
encore ce commit. Rejoué sur un **clone frais**, c'est-à-dire dans les conditions
réelles de la prochaine séance, le même contrôle annonçait « commit introuvable,
la fraîcheur de cette note n'est PAS mesurable ». *Le cas à réponse connue ne
suffit pas : il doit être joué là où la lecture aura lieu. Un environnement qui a
de la mémoire fait passer des contrôles qu'un environnement neuf recale.*

**UN INSTRUMENT QUI MESURE UNE PROPRIÉTÉ DÉRIVÉE MESURE TOUT CE QUI LA PRODUIT**
*(2026-09-13)*. Pour prouver qu'un hero ne noyait plus sa photo sous deux voiles,
le harnais mesurait la **variance des pixels** du haut de la section : une image
noyée tend vers l'aplat, donc vers une variance basse. Sauf que la bande mesurée
englobait le **cartouche blanc du logo**, dont le blanc suffisait à faire
exploser la variance. L'instrument affichait vert sur le hero à deux voiles,
celui-là même qu'il existait pour prendre en défaut. Remplacé par la mesure de la
**cause** : la bande est photographiée avec les voiles, puis sans — ils portent
un attribut qui les désigne — et le rapport des luminances donne le voile réel,
79-82 % avant, 32-34 % après. *Une grandeur dérivée agrège tout ce qui entre dans
le cadre. Mesurer la cause coûte un second relevé ; c'est le prix pour que le
vert veuille dire quelque chose.* Avec son corollaire, éprouvé dans la même
séance : **le correctif qui retire le défaut doit aussi retirer le moyen de le
mesurer** — sans les éléments marqués, les deux clichés sont identiques et
l'instrument annonce 0 % de voile, le meilleur résultat possible pour la pire
raison. D'où un verrou de non-vacuité sur leur présence.

**UNE RECOMMANDATION D'AUDIT N'EST PAS UNE MESURE** *(2026-09-13)*. Un audit
design nommait trois textes sous le seuil de contraste et prescrivait la couleur
qui les corrigeait. La mesure a donné **six** familles de textes fautifs, dont
une que la lecture du code ne pouvait pas voir — et surtout, la couleur
prescrite **ne passait pas** sur l'un des deux fonds du site (4,45:1 au lieu de
4,5). Appliquer la recommandation telle quelle aurait laissé le défaut en place
en le croyant réglé, avec un constat coché pour le prouver. *Un audit dit où
regarder. Ce qu'on y trouve, et ce qui le referme, se remesurent.*

**UN COMPTEUR QUI BAISSE N'EST PAS UN PROGRÈS : C'EST UNE AFFIRMATION À VÉRIFIER**
*(2026-09-13)*. La garde de publication d'artisan-builder contrôlait
`site.telephone` et ignorait `site.telephoneHref`, un champ **parallèle,
invisible à l'écran**, employé 22 fois dans le code — dont dix-neuf liens
d'appel et les données structurées. Renseigner le premier faisait passer le
compteur de 7 à 6 blocages **pendant que chaque bouton composait encore
`+33600000000`**. Le défaut n'était pas l'absence de contrôle, c'était que le
compteur BOUGEAIT : une garde qui vérifie un champ sur deux couplés est pire
qu'aucune garde, parce qu'elle récompense le geste incomplet. Trouvé par une
séance qui suivait la passation à la lettre, pas par un test. *Quand deux champs
décrivent la même chose, la garde vérifie les deux ET leur cohérence.*

**UN CHIFFRE SANS SA COMMANDE N'EST PAS UNE MESURE** *(2026-09-13)*. Le document
de passation d'artisan-builder promettait en préambule que « chaque nombre porte
la commande qui le rend », puis affirmait « 35 emplois de l'accent avant AB3 » —
un relevé ponctuel sur un état du code qui n'existait plus. La séance d'épreuve a
cherché la commande, ne l'a pas trouvée, et a eu raison de démentir le chiffre.
*Un nombre historique se date et se rend à sa source ; il ne s'aligne pas dans le
tableau des mesures du jour.*

**MESURER CONTRE LA BONNE RÉFÉRENCE, ET DIRE LAQUELLE** *(2026-09-13)*. Le
contraste typographique d'une page a d'abord été mesuré en comparant la pile
d'affichage à `FAMILLES.corps` — une constante du module — au lieu de la police
que la page emploie RÉELLEMENT pour son corps. Résultat : 445,2 px contre
445,2 px, « aucun contraste », conclusion écrite puis corrigée. Contre la vraie
police : 70 px. *Une mesure juste sur le mauvais objet est un faux, et elle a
l'air d'une mesure.*

**UN DOCUMENT QUI ANTICIPE EST PIRE QU'UN DOCUMENT ABSENT** *(2026-09-13)*. Le
§1 de la passation annonçait AB4 « fusionné » en PR #58 au moment où il ne
l'était pas encore — le lot a été fusionné vingt minutes plus tard, rendant vraie
après coup une affirmation fausse à la lecture. Une séance d'épreuve l'a mesurée
fausse et a eu raison. *Un état se mesure à la lecture, jamais à l'écriture : un
tableau d'historique porte les commandes qui font foi CONTRE lui.*

**UN RAPPORT ENTRE DEUX POINTS NON ADJACENTS N'EST PAS UN TAUX PAR INTERVALLE**
*(2026-09-13, trouvé par une revue adverse externe, pas par moi)*. J'avais donné
à Paul, dans un prompt d'analyse, « un pic de ×230 **en un mois** » sur la série
`climatiseur mobile`. Mesure refaite : 74 000 / 320 = 231,25 porte d'**avril à
juin** — deux intervalles. Avril→mai vaut 25,3, mai→juin 9,14. Le nombre était
juste, son unité était fausse, et c'est l'unité qui portait tout le sens : ×230
en un mois se raconte comme un raz-de-marée, ×9 puis ×25 se raconte comme une
saison qui monte. *Un ratio ne dit rien tant qu'on n'a pas nommé sur combien
d'intervalles il porte — et la division ne le rappelle jamais toute seule.*

**QUAND UN TEXTE ET LE TABLEAU QUI L'ILLUSTRE DIVERGENT, C'EST LE TEXTE QUI A
TORT — ET PERSONNE NE RELIT LE TABLEAU** *(2026-09-13)*. Le PDF de la boussole
affirmait « 33 valeurs distinctes, avec un **rapport constant** d'un barreau au
suivant », et imprimait **juste en dessous** la ligne des rapports mesurés :
1,27 · 1,21 · 1,24 · 1,24 · 1,23 · 1,22 · 1,23 · 1,23 · 1,22 · 1,22. Le
démenti était dans la même page, à deux centimètres de l'affirmation, pendant
quatorze pages et une relecture complète. ⛔ *Une phrase de synthèse posée
au-dessus d'un tableau se lit à la place du tableau. Elle doit donc être
DÉRIVÉE de lui — « des rapports resserrés entre 1,21 et 1,27 » — jamais
arrondie en une propriété qu'il ne montre pas.*

**UNE AFFIRMATION NE SE CORRIGE PAS AVEC UNE AUTRE AFFIRMATION TIRÉE DU MÊME
EXTRAIT — ELLE SE RELIT À LA SOURCE** *(2026-09-13, la correction de la
correction, dans la même soirée)*. Le PDF de la boussole affirmait une « échelle
×1,22 ». Je l'ai retirée et remplacée par « rapports entre 1,21 et 1,27 »,
mesure que je croyais honnête parce qu'elle venait du **tableau imprimé dans le
document**. Elle était fausse aussi : ce tableau est un EXTRAIT — le milieu de
l'échelle, sa seule partie régulière. Relue en base sur les 33 valeurs réelles,
l'échelle va de **×1,14 à ×2,24**, avec un bas grossier (10 · 20 · 30 · 40 · 50 ·
70 · 90) et un haut très grossier (12 100 · 22 200 · 33 100 · 74 000).

⛔ **Et la première correction a créé une erreur NEUVE** : j'en avais déduit que
« 10 → 20 ne fait pas un cran » (`log(2)/log(1,22) = 3,49`). Sur l'échelle
réelle, 10 et 20 sont deux barreaux **voisins** : un calcul juste sur une
prémisse fausse. *Corriger depuis la même source seconde reproduit son biais,
avec en plus l'autorité de la correction.* Une rétractation se fait depuis la
donnée, jamais depuis le document qu'on rétracte.

⚠️ **Ce que la vraie mesure apprenait, et que le modèle cachait** : l'incertitude
n'est pas uniforme — les GRANDS chiffres, ceux qu'on montre à un artisan, sont
les MOINS précis. Le modèle ×1,22 disait l'inverse. *Une fausse régularité ne
fait pas qu'être fausse : elle supprime le fait le plus utile.*

**UN MOTIF DE RECHERCHE SE VÉRIFIE SUR LA CHAÎNE RÉELLE, SINON IL REND UN FAUX
« ABSENT »** *(2026-09-13 — trois fois dans la même soirée)*. J'ai déclaré une
affirmation retirée du code après un `grep "1\.22"` — le code écrit `1,22`, avec
une **virgule**. Elle vivait encore dans SEPT fichiers, dont le texte affiché à
Paul et l'en-tête du CSV qui circule seul, et **trois tests l'exigeaient**.
Puis un test a cherché `/74 000/` là où `toLocaleString('fr-FR')` écrit une
**espace fine insécable** (U+202F). Puis une sonde PDF a répondu « MANQUE » sur
une phrase coupée par un saut de ligne. ⛔ *Les trois ont rendu « absent » avec
la même assurance qu'un vrai absent.* Un motif qui cherche une absence se teste
d'abord sur une chaîne dont on SAIT qu'elle contient la cible.

**UN FAIT RECOPIÉ DANS SEPT FICHIERS DIVERGE ; UN FAIT EXPORTÉ NE PEUT PAS**
*(2026-09-13)*. La même affirmation vivait dans deux commentaires, le texte de
l'écran, l'en-tête du CSV, le cadrage, le générateur du PDF et trois tests.
Retirée du document, elle est restée dans le code — c'est-à-dire dans la version
que Paul VOIT et dans le fichier qu'il ENVOIE. *Un chiffre que plusieurs endroits
doivent connaître se met dans une constante exportée et une fonction qui le met
en phrase ; les autres l'importent.* Et le garde-fou qui manquait est celui qui
cherche l'ancienne affirmation **là où elle sort** — écran et export — pas là où
elle était écrite.

**« DEUX CALCULS D'ACCORD » NE MESURE PAS L'EXACTITUDE** *(2026-09-13)*. J'avais
annoncé « 0 désaccord sur 25 898 mots-clés » comme une preuve de justesse de
l'agrégation. C'en est une — de **cohérence**, pas d'exactitude : deux calculs
concordants partagent la même zone, le même import tronqué, les mêmes zéros
fabriqués et la même absence de provenance. Ils se trompent ensemble sans jamais
diverger. *Un test de concordance prouve que le moteur ne se contredit pas ; il
ne dit rien de ce qui est entré dedans. Étiqueter séparément fidélité de
transformation, cohérence de calcul et justesse de la source.* ⚠️ Et cette
mesure-là n'avait été versionnée nulle part : citée trois fois, introuvable.


**UNE MESURE JUSTE N'EST PAS UNE CONCLUSION JUSTE** *(2026-09-13, RenoDevis + RenoBoost)*.
La leçon la plus chère de la séance. J'ai mesuré que le repli d'A1 décidait de 100 % des dossiers (171 clients sur 171 sans origine) : exact, et ça reste exact. J'en ai conclu qu'il fallait le retourner : faux, il décidait dans le BON sens. La bascule aurait fait de RIA l'entrepreneur principal — CA des travaux à son bilan, autoliquidation de TVA, responsabilité des chantiers — et rien de tout cela n'était visible dans le diff, qui change un opérateur de comparaison. Paul : « non surtout pas ».
⇒ *Règle* : un repli se choisit sur ce qu'il coûte quand il SE TROMPE, jamais sur ce qu'il rapporte quand il a raison. Un chiffre exact ne dit rien du sens de ce qu'on en fait.

**UN SIGNAL AUTOMATIQUE QU'ON RÉFUTE DEUX FOIS SE LIT À LA SOURCE** *(2026-09-14)*.
Le hook de fin de tour a annoncé « 1 commit non poussé » après chaque fusion en
squash. Quatre fois j'ai re-mesuré, constaté que tout était sur `main`, et
répondu « fausse alerte » — quatre fois le même tour, quatre fois le même coût.
La cinquième, j'ai ouvert le script : il fait `git rev-list
"origin/$branche..HEAD" --count` **sans fetch préalable**, donc il compare à sa
copie locale de la branche distante. Une fusion en squash ne déplace pas la
branche : elle reste sur le commit d'avant pendant qu'on rebase la copie locale
sur `origin/main`. Le compte de 1 est EXACT, c'est sa conclusion qui ne l'est
pas. ⛔ *Re-réfuter la conclusion d'un automate ne fait rien avancer ; lire ce
qu'il mesure prend deux minutes et remplace n dénégations par une explication —
et par le réglage qui le fait taire.* La règle vaut pour un hook comme pour un
harnais, un compteur ou un advisor : **son verdict est une opinion, sa requête
est un fait.**

**UNE ESTIMATION DE GAIN QUI N'A PAS ÉTÉ MESURÉE EST UNE OPINION** *(2026-09-15)*.
Paul trouve la maquette de la vitrine trop longue. J'annonce quatre coupes
chiffrées « de tête » : retirer une photo de la galerie, ~250 px. Mesure au
navigateur : **zéro pixel**. En mobile, la galerie est un carrousel HORIZONTAL —
retirer une figure ne change rien à la hauteur. Trois autres estimations
s'écartaient du réel d'un facteur deux à cinq. ⛔ *Un gain proposé à Paul se
mesure avant d'être annoncé, surtout quand il paraît évident : c'est justement
l'évidence qui empêche de vérifier.* Et le même passage a démenti la prémisse :
la page n'était pas longue en TEXTE (514 mots contre 2483 pour l'accueil), elle
empilait sept sections aérées — **on allait couper ce qui n'était pas le
problème**.

---

**UNE GÉOMÉTRIE N'EST PAS CE QUI EST VU** *(2026-09-18)*. Un harnais déclarait
qu'un bouton flottant recouvrait une phrase, et il avait tort depuis trois jours.
Il mesurait le texte par `Range.getClientRects()`, qui rend la géométrie du texte
**tel qu'il serait s'il n'était pas coupé** : le rognage d'un ancêtre en
`overflow:hidden` lui est invisible. Le contexte mesurait 147 caractères dans une
colonne de 430 px, s'arrêtait donc à x=743 sous son ellipsis — et son Range allait
à x=1155, croisant un bouton posé à 948. `elementFromPoint` au centre du prétendu
chevauchement rendait le bouton lui-même : **il n'y avait aucun texte là**.

⚠️ La passe précédente avait déjà corrigé ce contrôle, et avait remplacé un biais
par l'autre : la boîte du bloc était trop large, le Range est trop long. **Entre
deux mesures fausses en sens inverse, la bonne n'est aucune des deux** — c'est
leur intersection avec ce qui rogne au-dessus.

⛔ **Et le verdict dépendait d'une longueur de phrase.** L'autre page testée
passait pour la seule raison que son texte faisait 33 caractères et tenait dans
la colonne. Un contrôle dont le résultat bascule selon le contenu, et non selon
le défaut qu'il traque, ne mesure pas ce qu'il croit mesurer — il attend juste
qu'une phrase grandisse.

---

**UNE CLÉ JSON PRÉSENTE N'EST PAS UNE VALEUR PRÉSENTE** *(2026-09-19)*. Le prompt
de reprise du matin annonçait « devis avec `extra.pdf_path` = 3 ». Mesuré le soir :
**un seul**. Les trois lignes portent bien la clé — `extra ? 'pdf_path'` rend 3 —
mais deux d'entre elles contiennent `null`, et `extra->>'pdf_path' is not null`
rend 1. Les deux comptes sont exacts ; ils ne comptent pas la même chose.
⛔ *En JSON, l'existence d'une clé et l'existence de sa valeur sont deux faits
distincts, et c'est toujours le second qui intéresse.* La conséquence dépassait
le chiffre : on croyait trois PDF déposés là où il y en a un, donc les trois
gestes réels étaient encore moins faits qu'annoncé. ⚠️ Un compte qui dépasse la
réalité rassure, et c'est pour ça qu'il ne se remet pas en cause tout seul :
**quand une mesure arrange, la vérifier coûte une requête de plus.**

---

**UNE CAUSE TRANSMISE N'EST PAS UNE CAUSE MESURÉE** *(2026-09-19)*. La séance du
matin avait écrit « plafonds GitHub Actions atteints ». Je l'ai répété pendant
**quatre heures** — dans deux PR, trois commentaires et un rapport — sans le
vérifier une seule fois. Or le démenti était déjà sous mes yeux : **Paul avait
relevé le plafond, et rien n'avait changé**. Ce qui était établi, c'était la
SIGNATURE (job mort en 2-3 s, zéro étape, logs en 404, `main` rouge à
l'identique) — pas sa cause. Quand j'ai enfin cherché : workflow valide, check
run sans titre ni résumé, et `rerun` refusé en **403**. Je n'avais donc ni la
cause ni le moyen de la lever, et je l'aurais su en dix minutes.
⛔ *Un diagnostic hérité se relit comme un fait parce qu'il est écrit au même
endroit que les mesures. Il se re-mesure à la première occasion, et
immédiatement dès qu'un remède appliqué ne produit aucun effet* — un remède
sans effet réfute le diagnostic, il ne prouve pas que le mal est tenace.

---

**CE QU'ON N'A PAS PU VOIR SE DIT, SURTOUT QUAND LE RESTE EST VERT** *(2026-09-19)*.
QA complète de Stellar V2 : 38/38 unitaires, 41/41 navigateur, quatre régressions
trouvées et corrigées, captures livrées. Et **RIVEN connecté n'a jamais été vu** :
sans session, la page ne rend que son écran de connexion. ⚠️ *Un rapport dense en
verts donne à un trou la texture du reste* — le lecteur en déduit une couverture
qu'il n'a pas. L'angle mort se nomme **à côté du vert**, pas en note de bas de
page, sinon les quarante et un harnais se lisent comme quarante-deux.

**UN BLOCAGE HÉRITÉ SE RELIT À SA SOURCE — LA PHRASE QUI LE FONDE SE CITE, PAS
SE RÉSUME** *(2026-09-19)*. Deux séances ont déclaré `ProductShowcase` et
`MobileShowcase` bloqués « faute de captures réelles de la console — et on n'en
fabrique pas, interdit n°1 du contrat 02 ». Le prompt de reprise du soir allait
plus loin : « ⛔ NE PAS EN FABRIQUER », et ouvrait la séance suivante sur
*« demander à Paul lequel des trois verrous il lève »*. **L'interdit dit le
contraire de ce qu'on lui faisait dire** : *« Aucune donnée fictive présentée
comme RÉELLE. Un chiffre d'exemple porte sa mention à l'écran. »* Ce n'est pas
la donnée d'exemple qui est interdite, c'est la donnée d'exemple **muette**. Il
ne fallait pas de vraies données : il fallait la vraie **interface**, et une
mention lisible à côté. Et l'interface était atteignable depuis six jours — un
harnais du dépôt ouvrait déjà `RenoBoost/dashboard.html` dans Chromium et y mesurait 1491
éléments. *Ce que ça a coûté* : deux patterns gelés sur deux séances, une
question posée à Paul qui n'avait pas lieu d'être, et un arbitrage de la
bibliothèque (`Ultima-/specs/ARBITRAGES.md` §A1) qui a recopié le motif faux et
l'a rendu officiel. *Règle* : un blocage qu'on n'a pas établi soi-même se rouvre
en **lisant le texte qui le fonde**, mot pour mot, avant d'être transmis. Un
motif résumé de séance en séance devient une loi que plus personne ne relit —
et il est d'autant plus solide qu'il a l'air prudent.

**UN COMMENTAIRE QUI AFFIRME PLUS QUE LA MESURE EST UNE FAUSSE PREUVE**
*(2026-09-19)*. En posant `minmax(0,1fr)` sur une grille portant une capture de
1280 px, j'ai écrit dans la feuille : *« `1fr` déborderait à 390 px »*, avec
l'aplomb d'un fait mesuré. L'épreuve par la casse l'a démenti dans la minute :
grille repassée en `1fr`, **aucun débordement** — la règle globale
`img{width:100%}` résout la largeur en pourcentage, et une image en pourcentage
ne contribue rien au min-content de sa piste. Le `minmax(0,…)` reste bon, mais
comme **ceinture**, pas comme correctif d'un défaut constaté. *Ce que ça a
coûté* : rien cette fois, parce que le garde-fou a été éprouvé ; tout, si la
séance s'était arrêtée au vert. ⛔ Un commentaire est un livrable **lu**, et
celui-là aurait enseigné une règle fausse à chaque relecture, avec l'autorité
d'un commentaire qui cite une mesure. *Règle* : ce qu'un commentaire affirme se
mesure comme le code qu'il décrit. Quand la mesure dit autre chose que
l'intuition, **c'est le commentaire qu'on réécrit dans le même passage** — et il
dit alors exactement ce qu'il vaut : « éprouvé, et voici ce que ça a donné ».

**UN CONTRÔLE QUI RÉPOND « ABSENT » SE REVÉRIFIE AVANT D'ÊTRE CRU** *(2026-09-21,
deux fois dans la même journée)*. Le matin : `grep -c "padding-block:52px"` rend
**0** sur un CSS qui portait `padding-block: 52px` — avec l'espace. J'ai failli
conclure qu'un travail n'était pas dans `main`. Le soir, bien pire : le harnais
`RenoBoost/tests/specs-patterns.navigateur.mjs` passe de 414 à 61 lignes après une refonte,
`grep PLAFOND` rend **0**, et j'ai commencé à écrire à Paul que **le plafond de
hauteur avait disparu**. Il était là, ligne 30, écrit en dur :
`ok(geometry.height<=12400, …)` — la valeur exacte abaissée et prouvée la veille.
*Ce que ça a coûté* : rien, parce que j'ai ouvert le fichier avant d'envoyer ;
tout, sinon — une alerte fausse sur un garde-fou de sécurité fait rouvrir un
chantier clos et détruit la confiance dans les alertes suivantes.
⛔ **Un « 0 » de `grep` n'est pas une absence, c'est une non-correspondance de
motif.** Chercher le NOM d'une constante trouve la constante, pas la règle : une
valeur peut être inlinée, renommée, déplacée, écrite avec un espace. *Règle* :
avant d'annoncer qu'une chose a disparu, **ouvrir le fichier** et chercher ce que
la chose FAIT, pas comment elle s'appelait. Et un verrou de non-vacuité sur la
recherche elle-même — « ce fichier existe-t-il, fait-il plus de zéro ligne ? » —
coûte une seconde et sauve l'annonce.


**UNE MESURE UNIQUE SUR UNE BASE PARTAGÉE NE MESURE QUE L'INSTANT** *(2026-09-14, RenoBoost)*.
J'ai annoncé « 708 ms, 6,4 fois moins » sur UN `explain analyze` pris juste après un `ANALYZE`, tout en cache, et j'ai fait redescendre un délai sur cette foi. Réessais : 1 547 · 4 411 · 7 905 · 9 094 ms, même plan, mêmes tampons.
⇒ *Règle* : un seuil se décide sur la PIRE mesure, jamais sur la première.
⊕ **Payé de nouveau le 2026-09-30** (RenoDevis, fiche B2) : « 0 devis ne porte
d'`extra.releve` », mesuré le 15/09 dans un commentaire de test, recopié dans
une fiche comme un fait du jour. Le dry run à +20 min a rendu **2**. La
conclusion (zéro euro perdu) tenait, sur une autre mesure — 0 ligne, 0 envoi.
Une mesure datée qu'on recopie se rejoue **avant** d'être écrite, pas au dry
run d'après.


**DOUZE CAS CONCORDANTS NE FONT PAS UNE LOI** *(2026-09-15, RenoDevis ; portée aussi dans RenoBoost, PR #464)*.
« L'acompte SOLA est TOUJOURS de 40 % » tenait sur 12 devis. À 27, DEV00000139 est à 50 % : un client professionnel, et le mail de l'artisan le dit mot pour mot. Aucun code n'était à toucher — le taux vit déjà sur la fiche du pro, aucun 40 en dur. Ce qui était faux, c'était le MOT.
⇒ *Règle* : une régularité observée se note comme une observation datée AVEC SON EFFECTIF, jamais comme une règle.

**UN PRIX DONNÉ EN CONVERSATION N'A PAS DE NATURE TANT QU'ON NE L'A PAS
DEMANDÉE** *(2026-10-03, RenoDevis, contre-épreuve d'un devis SOLA)*. Trois
montants dictés pour des consommables ont été pris pour des prix d'ACHAT, passés
au coefficient SOLA, et la contre-épreuve est entrée dans
`RenoDevis/docs/SOLA-MATRICE-20261001.md` comme mesurée. Paul, ensuite : c'étaient
des prix FACTURÉS au client HT, l'achat réel étant plus bas. Ce que ça a coûté :
une contre-épreuve fausse écrite comme vraie, une doc à corriger, et un tour de
questions de plus. ⛔ Dans un dépôt où **le même nombre peut être un achat, une
vente, un HT ou un TTC**, un montant sans sa nature n'est pas une donnée.
⇒ *Règle* : avant de calculer sur un prix dicté, sa nature (achat / vente,
HT / TTC, unité) se fait confirmer dans la même question ; jusque-là, le
résultat se dit « non mesuré ».


**UNE ERREUR APPLIQUÉE DES DEUX CÔTÉS D'UNE COMPARAISON NE ROUGIT JAMAIS** *(2026-10-04, Ultima — ZOH SHIA)*.
La base neuve de RénoDevis se prouve en comparant ses condensats à ceux de la
base de référence, calculés par la MÊME requête. Un échappement perdu dans un
gabarit JavaScript (`'\s+'` écrit tel quel dans un gabarit `` ` `` devient `'s+'`) normalisait les corps de fonctions
en retirant… les lettres « s ». Des deux côtés, à l'identique : la comparaison
aurait été verte sur deux bases différentes. Trouvé en RELISANT la requête
générée, pas par un test. Le même jour, le défaut inverse : un renommage fait
APRÈS sérialisation déplaçait une clé jsonb (rangées par longueur) — faux rouge
sur deux bases identiques.
⇒ *Règle* : un instrument de comparaison se valide sur un cas où les deux côtés
DIFFÈRENT réellement (sabotage d'un seul côté), et sa requête générée se relit
avant d'être crue ; toute transformation se fait avant la mise en forme
canonique, jamais après.


**UN SERVEUR QUI N'A PAS PRIS SON PORT SERT UN AUTRE BUILD** *(2026-10-06)*.
Le harnais de l'agenda d'Artidispo visait le port 5174 ; un aperçu resté vivant
d'un essai précédent l'occupait. `vite preview` a pris 5175 **sans erreur**, et
le harnais a mesuré l'ANCIEN serveur : cinq rouges sur un code vert. Il aurait
aussi bien pu rendre vert sur un code cassé. Et le nettoyage a fait pire : un
`pkill -f "vite preview"` a tué **mon propre shell**, deux fois — le motif était
écrit dans la ligne de commande qui le lançait.
*Ce que ça a coûté* : un diagnostic, et un rouge qui aurait pu être un vert.
⛔ **La règle** : un port pris doit FAIRE ÉCHOUER le lancement d'un serveur de
harnais, pas le déplacer — `--strictPort` pour Vite (seul à déplacer en silence ;
`next start` et `python -m http.server` échouent d'eux-mêmes et ne connaissent
pas ce drapeau). On arrête un serveur par le PID capturé à son lancement
(`cmd & PID=$!` puis `kill $PID`), jamais par un motif `pkill -f` que sa propre
commande contient. *Rechute le 08/10, deux fois :
`pkill -f "next start -p 3999"` puis `pkill -f "http.server 8123"` ont tué le
shell (sortie 144) — la règle était connue, pas appliquée.* *Troisième rechute
le 09/10 (RenoBoost, H1 défilant), deux fois encore : `pkill -f lancer-navigateur.sh`
puis `pkill -f "until grep -qE"` — la même ligne de commande portait le motif,
une suite de tests de 6 min a été perdue et un commit a sauté. La cause n'est
plus l'oubli : on n'avait aucun besoin de tuer quoi que ce soit — attendre la
fin d'une commande lancée en arrière-plan passe par sa notification, pas par un
`pkill` de nettoyage.*

**LE PROFIL SUPPOSÉ N'EST PAS LE CLIENT** *(2026-10-13, mon-dpe.fr — jumeaux du chantier)*.
Toute la boucle 6 a été cadrée, codée, testée et éprouvée au banc sur un profil
type : « maison 1948-1974, électricité, 100 m², F ». Tests verts, sabotages rouges,
essais réels à Écully concluants. L'essai sur les 5 VRAIS chantiers SOLA signés a
dit autre chose : 0 maison, 3 appartements en immeuble, 2 adresses sans DPE — et,
sur les 3 immeubles, la fiche recopiait la surface et l'étiquette d'un AUTRE
appartement (42 m² B, 95 m² D), avec une provenance « DPE » qui la rendait crédible.
*Ce que ça a coûté* : un défaut de données prêt à partir en production, et une
boucle entière calibrée sur un client qui n'existe pas dans le portefeuille.
⛔ **La règle** : avant de déclarer une boucle finie, elle passe sur les vrais cas
du client visé (lus en base, sans PII) — pas sur un profil qui « ressemble ».
Le profil type sert à construire ; seuls les vrais cas disent si c'est le bon.


## 2. Les garde-fous, et leur silence

**UN FILTRE EN BOUT DE CHAÎNE MASQUE LE CODE DE SORTIE DU TEST**
*(2026-11-10, RenoBoost, correctif du harnais `RenoBoost/tests/journal.navigateur.mjs`).*
`npm test 2>&1 | grep -E '^# (tests|pass|fail)' && git commit … && git push` : le `&&`
lisait le code de sortie de `grep` — 0 dès qu'une ligne correspond — jamais celui de
`npm test`. La suite affichait `# fail 1` et la chaîne a quand même commité et poussé.
Le rouge était local (la porte ESLint de `RenoBoost/tests/lint.test.mjs` échoue quand
ESLint n'est pas installé ; après `npm ci`, 1784/1784 et CI verte) : le résultat était
juste, l'ordre des gestes non — un filtre de LECTURE avait pris la place du VERROU.
⛔ **La règle** : ce qui conditionne un commit ou un push est le code de sortie du test
lui-même — `npm test > journal.txt || exit 1`, ou `set -o pipefail` avant la chaîne —
jamais celui d'un `grep`, `tail` ou `tee` posé derrière. Un affichage réussi n'est pas
un test réussi ; une chaîne qui ne peut pas s'arrêter sur un rouge n'a pas de verrou.


**« TSC IDENTIQUE » SE MESURE SUR LE COMMIT LIVRÉ, PAS SUR UN COMMIT D'AVANT**
*(2026-11-04, RenoDevis #476).* La description de la PR affirmait « tsc : 11 erreurs
avant comme après ». Le compte avait été pris AVANT d'écrire
`lib/ressemblanceSolaParcours.test.ts`, qui portait 2 erreurs de typage. La CI était
verte : elle ne type pas les fichiers de test (`tsx` exécute sans vérifier). C'est en
intégrant `main` et en recomptant fichier par fichier, avant la fusion, que l'écart
s'est vu : un commit de correction, une exécution de CI (≈ 11 min) et un accord de
fusion à redemander. ⛔ **La règle** : une affirmation sur une porte de qualité se
mesure sur la tête qu'on pousse, au dernier geste avant de l'écrire, et en
comparant fichier par fichier (`cut -d'(' -f1 | sort | uniq -c`), pas un total — un
total identique peut cacher une erreur corrigée et une autre ajoutée.

**UNE RÉSERVE QUI NOMME LE CRITÈRE FAIT UN PARTIEL, PAS UN « CONFORME AVEC
RÉSERVE »** *(2026-11-03, Ultima #441)*. Le juge de la recette de Léo a noté T18
« CONFORME (réserve) » : la réserve était qu'une recherche vide déclenchait le
renvoi sans verrou de non-vacuité — c'est-à-dire le critère même du scénario.
Le verdict a été recompté tel quel, puis propagé (« 3 CONFORME ») au README, au
dossier et au grain Finubar. La revue Codex l'a relevé sur la PR déjà verte :
un tour de correction, une exécution de CI (≈ 30 min) et un nouvel accord de
fusion. ⛔ **Avant de compter un verdict, confronter chaque réserve au critère
du scénario** : si elle en nomme un qui n'est pas tenu, le verdict est PARTIEL,
quel que soit le mot du juge. Le juge se juge aussi.

**UNE REQUÊTE CITÉE COMME PREUVE SE JOUE AVANT D'ÊTRE ÉCRITE** *(2026-10-23,
Ultima #415)*. Le relevé des dépendances du défaire
(`Ultima-/supabase/releves/20261002_leo_defaire_dependances.RELEVE.sql`) a reçu
les sept clés de `network_nodes` relevées dans les migrations, avec la phrase
« la requête ci-dessus, jouée avec network_nodes, doit rendre exactement ces sept
lignes ». Faux : cette requête (`a.attnum = any(c.conkey)`) rend une ligne par
colonne de clé — `owner_id` compris pour les clés scellées — et une par
contrainte, simple ET scellée : elle n'aurait jamais rendu sept lignes. Le harnais
regex (`Ultima-/tests/unit-leo-defaire.mjs`) était vert, PGlite dormait dans
`node_modules` depuis des semaines, et c'est la relecture Codex qui l'a vu — un
tour de correction, sur une PR déjà verte. ⛔ **La règle** : une requête donnée
comme critère d'acceptation se JOUE sur un moteur réel avant d'être écrite — sur
PGlite, migrations rejouées, quand la base n'est pas atteignable — et son verdict
entre dans un harnais (`Ultima-/tests/unit-audit-database.mjs` mesure désormais
`DEPENDANCES` contre `pg_constraint` : 17 clés, 0 écart, sabotage rouge). Une
« preuve à rejouer plus tard » que personne n'a jouée est un souvenir qui a
l'air d'une mesure.

**UNE INTERFACE QUI CALCULE NE FAIT PAS DU NAVIGATEUR UNE SOURCE DE CONFIANCE**
*(2026-10-23, mon-dpe.fr).* Le PUT du projet acceptait des résultats calculés et des
champs protégés issus du navigateur : une classe fabriquée pouvait être conservée
comme résultat courant. Une réponse de sauvegarde retardée écrasait aussi la saisie
arrivée entre-temps et annonçait un faux état enregistré. Conséquence : deux défauts
d'intégrité reproduits, sans exploitation réelle établie. Correction serveur avant
écriture et compteur d'édition côté interface, avec régressions de requête forgée et
réponse retardée. Sept tests de régression échouaient sur l'ancien ensemble de code ;
les 1 275 tests corrigés passent en local. Source : PR #256, tête `820f064`,
CI réussie du 23/10/2026 :
https://github.com/PaulGERARD161098/mon-dpe.fr/actions/runs/39937089776.
⇒ Éprouver la frontière par la requête directe et l'asynchronisme par une édition
pendant le vol ; protéger la révision serveur sans écraser le brouillon plus récent.

**UN GARDE-FOU SE MESURE SUR DES DONNÉES DE TAILLE ET DE FORME RÉELLES** *(2026-10-14, RenoDevis + mon-dpe.fr)*.
Trois garde-fous livrés le même jour passaient leurs tests sans tenir. Une relecture
adverse indépendante les a trouvés le soir même, sur les PR déjà vertes :
- le test « le PDF tient en 3 pages, même chargé » utilisait des avertissements de
  110 caractères ; ceux du moteur en font 150 à 300, et à 17 le PDF passait à 4 pages ;
- la garde qui protège les références « RR-2026… » de la correction de dictée ne
  couvrait que le tiret ASCII ; un tiret insécable (iPhone), un tiret long ou une
  référence dictée avec des espaces étaient réécrits « PAC air/air… » ;
- le test « les deux PAC ne s'additionnent jamais » restait vert sans la règle
  d'incompatibilité : une autre règle refusait avant elle.

⛔ **La donnée d'un test se copie sur la donnée réelle** : sa longueur, ses
séparateurs, ses caractères, mesurés à la source (le moteur, la base, le
clavier du téléphone). Et un test qui garde une règle se sabote **en retirant
cette règle-là**, pas en cassant le code autour.
*Rechute de la règle « UNE BOUCLE DE SABOTAGE NE SE RESTAURE PAS PAR
`git checkout` », le même jour : un `git checkout -- data/prestations.json` a
effacé le catalogue air/air non committé. Rattrapé parce que les tests sont
passés de 91 à 90.*

**QUAND L'OUTIL NE PEUT PAS VOIR, ON FABRIQUE LE BANC — TOUT DE SUITE** *(2026-10-12, mon-dpe.fr)*.
Le proxy de la séance bloquait les tuiles IGN et OpenFreeMap : la carte 3D
était codée à l'aveugle, et c'est Paul qui découvrait le rendu sur la preview —
deux allers-retours, dont un « c'est atroce ». Le banc local (Chromium, tuiles
vectorielles FACTICES fabriquées avec `geojson-vt` + `vt-pbf` déjà présents dans
`node_modules`, injectées par `page.route`) a été monté au troisième tour ; en
une heure il a attrapé trois défauts qu'aucun test ne voyait : le pâté de
maisons regroupé, des sommets dédoublonnés en degrés au lieu de mètres, et un
sol NOIR quand React Three Fiber remplaçait le matériau.
⛔ **« Je ne peux pas le voir d'ici » n'est pas un constat de fin, c'est le
signal de construire l'instrument** — avant la première preview, pas après la
deuxième. Et le banc se valide lui-même : ses images factices doivent porter
les mêmes en-têtes (CORS) que la vraie source, sinon il invente ses propres
défauts.

**UNE BOUCLE DE SABOTAGE NE SE RESTAURE PAS PAR `git checkout`** *(2026-10-10, RenoDevis)*.
Pour prouver un correctif, on casse le code puis on restaure — et la boucle
restaurait chaque fichier par `git checkout <fichier>`, qui ramène la version
COMMITTÉE. Le correctif des comptes Stripe de test (`RenoDevis/lib/embarquement.ts`)
n'était pas encore committé : le premier sabotage l'a effacé, et les six
suivants ont « éprouvé » un fichier qui n'avait plus le correctif. Seuls les
tests neufs, qui ont rougi à 7 contre 13, l'ont signalé ; réécrit à la main,
dans la même séance.

⛔ **Avant de saboter, le fichier se COPIE (ou se committe), et la boucle
restaure depuis la copie** — puis un `cmp` final prouve que le fichier est
revenu à l'identique. `git checkout` n'est une restauration que d'un fichier
propre.
*Même séance, même famille : deux sabotages sur six sont d'abord restés verts,
parce que chaque condition du correctif masquait l'autre dans les cas de test.
Un sabotage vert ne se « justifie » pas : il dit qu'il manque un cas, et on
l'écrit.*

**UNE COLONNE AJOUTÉE N'HÉRITE D'AUCUN DROIT DE COLONNE** *(2026-10-09, RenoDevis)*.
La migration du devis pro a ajouté `forme_juridique` et `capital_social` à
`profiles`. Cette table ne donne à `authenticated` aucun `UPDATE` de niveau
table : ses droits sont posés colonne par colonne — c'est ce qui tient `role`
hors d'atteinte. Les deux colonnes neuves n'en avaient donc aucun, et
l'écran les envoyait avec tout le reste : **« Enregistrer mon entreprise » était
refusé EN ENTIER** (42501), SIRET compris, pendant que l'écran disait
« vérifiez la migration 20260803 ». Paul a saisi l'identité de RénoBoost pour
rien, et l'a vu avant moi. La migration avait été « éprouvée en transaction
annulée » — sous le rôle `postgres`, celui qui a tous les droits.

⛔ **Une colonne qu'un écran écrit s'éprouve sous le rôle de cet écran**
(`set local role authenticated` + `request.jwt.claims`), jamais sous le
propriétaire. Et une table à droits par colonne demande, pour chaque colonne
ajoutée QU'UN ÉCRAN DOIT ÉCRIRE, son `grant` — jamais pour une colonne
privilégiée comme `role`, qui doit rester hors d'atteinte — la sonde `PRO-D` de `RenoDevis/CLAUDE.md` le vérifie.
*Même séance, même famille : deux assertions « aucun champ pro » étaient vraies
par vacuité — l'une sur un émetteur sans SIRET, l'autre dans un harnais qui ne
montait pas l'écran. Trouvées en cassant le code, pas en relisant le test.*

**UNE VOIE DE REPLI JAMAIS EMPRUNTÉE N'EXISTE PAS** *(2026-10-04, Ultima — ZOH SHIA)*.
L'extracteur de code neutre se disait capable d'extraire « au commit demandé »,
et sa série porte le commit où elle s'applique à coup sûr (`BASE`). Il n'avait
été éprouvé que sur `--ref origin/main`, le jour où `main` ÉTAIT ce commit. Le
dry run du soir, après six fusions sur le dépôt de référence : la série
refuse sur `main` (conflits, refus correct), et le repli — extraire au commit
de base — échouait aussi (`couldn't find remote ref`), car un dépôt local ne
sert pas un commit demandé par son seul identifiant. **Le jour où le repli
servait pour la première fois, il n'existait pas** : le livrable « code prêt
pour un nouvel artisan » était indisponible, avec un outil qui affirmait le
contraire. Même soir, même famille : la recette privée (`Ultima-/outils/`, la liste
des noms qu'on cache) n'était tenue que par `.vercelignore` — servie en local,
alors que le dossier qu'elle protège avait deux ceintures.

⛔ **Un repli se prouve en l'empruntant, pendant que le chemin principal
marche encore** — jamais « il suffira de passer le SHA ». Et un garde se pose
au même niveau que ce qu'il cache : le fichier qui NOMME les secrets mérite
au moins les ceintures du dossier qu'il protège.

**UNE CLASSE SUPPOSÉE GÉNÉRÉE PEUT NE PAS L'ÊTRE — ET LE BOUTON DISPARAÎT** *(2026-10-02, RenoDevis)*.
Le bouton « Créer » de la barre portait `bg-danger-ink text-surface`. Tailwind
n'a jamais produit `bg-danger-ink` — mesuré dans la feuille compilée par
`next build` : aucune règle. Fond transparent, texte blanc, sur un en-tête
blanc : **le bouton d'entrée du produit était invisible en production**, pendant
que `tsc`, les 779 tests, le build et la CI étaient verts. Aucune de ces portes
ne charge une feuille de style. Paul l'a trouvé à l'œil : *« je sais qu'à gauche
de "mes relances" il y a "créer" mais rien ne se voit »*.

⛔ **Une couleur qui décide de la lisibilité se prouve sur la CSS COMPILÉE, dans
un navigateur, contraste calculé** — jamais sur la présence d'une classe dans le
source. `RenoDevis/tests/nav-boutons.mjs` le fait, et s'éprouve d'abord sur
l'ancienne chaîne de classes, qu'il doit juger invisible (1,00:1). ⇒ Une couleur
qui porte du texte se déclare en **paire de jetons explicite**
(`--color-…-solide` / `-solide-encre`), comme le bouton principal ; le même soir,
le garde-fou de style du dépôt a refusé deux couleurs écrites en dur, et il
avait raison.

**UN GARDE-FOU PEUT ATTRAPER LA BONNE PANNE ET LA NOMMER FAUX** *(2026-09-28, Ultima)*.
Le contrôle d'empreinte des exports de méthode a été étendu au nouveau doc
Gemini. Éprouvé en corrompant son empreinte : il rougit — mais son message disait
« Le paramétrage de **ChatGPT** est PÉRIMÉ ». Le motif était écrit en dur du temps
où il n'existait qu'un export ; depuis, il y en a deux. Un ChatGPT parfaitement
réglé aurait été re-paramétré pendant que Gemini restait faux.

⛔ **Et le harnais était vert sur ce défaut : 13/13 avant comme après la
correction.** Il vérifiait l'accord, pas le **libellé du désaccord** — or c'est le
libellé que l'humain lit et suit. Même famille que « Ce devis a déjà été envoyé »
sur un devis jamais envoyé *(RenoDevis, 21/09)* : un message qui décrit un état
inexistant envoie chercher ailleurs, et coûte plus cher qu'une erreur muette.

⇒ **Quand on étend un contrôle à une seconde cible, lire le message d'erreur des
DEUX côtés, pas seulement la couleur.** Un motif qui nomme une cible en dur est
un bug dès qu'il y en a deux ; le faire dériver de la cible
(`basename(chemin)`) — et vérifier que la correction n'introduit pas un import
manquant, sinon elle jette au lieu d'informer, ce qui est pire.

⊕ **État affiché ≠ acte accompli** *(2026-10-29, RenoDevis)*. Deux devis importés portaient « Envoyé » sans archive d'envoi client ; Paul a dû demander si le client les avait reçus. L'envoi réel n'a été confirmé qu'ensuite par l'archive et la copie du mail. ⇒ Distinguer import, préparation, contrôle, acceptation prestataire, livraison et ouverture. Un statut ne prouve pas l'événement ; une acceptation ne prouve pas la réception. Ne pas renvoyer pour lever un doute : relire d'abord l'opération.

**UN TEST QUI PINCE UNE ADRESSE NE DIT RIEN DE CE QU'ELLE SERT** *(2026-09-27, RenoBoost)*.
`RenoBoost/tests/accueil-v3.test.mjs` exigeait le lien Calendly exact du hero, et il est
resté vert du 23 au 27/09 pendant que ce lien renvoyait « This Calendly URL is
not valid » : le plan gratuit de Paul n'autorise qu'un événement actif, et en
créer un nouveau avait désactivé celui du site. **Quatre jours sans aucun
rendez-vous possible**, trouvés par Paul sur une capture, pas par un garde-fou.
Puis le correctif a remplacé l'adresse dans les cinq fichiers repérés à la
main — et en a oublié deux (l'encart de la démo du tableau de bord, la démo
RénoDevis), retrouvés au contrôle de fin de séance. ⛔ *Deux gestes, pas un :
(1) l'état d'un service externe se LIT à sa source (l'API Calendly, champ
`active`), jamais se déduit de ce qu'on a écrit ; (2) une valeur dispersée
dans le dépôt se tient par un test qui la cherche PARTOUT
(`RenoBoost/tests/calendly-lien.test.mjs`), pas par la liste des fichiers dont on se
souvient.*

**UN FAUX SCHÉMA QUI NE PORTE PAS LES DÉCLENCHEURS DE LA PROD REND VERT CE QUE LA PROD REFUSE** *(2026-09-27, Artidispo)*.
En production Supabase, `storage.objects` porte `protect_objects_delete` : **tout**
`delete from storage.objects` en SQL lève `42501`, même sur zéro ligne. La purge
RGPD des comptes supprimés en faisait un depuis la migration 15. Son harnais était
vert — le stub `storage` n'avait pas le déclencheur — et son cron aussi, **parce
qu'aucun compte n'attendait sa purge**. Au premier compte supprimé, la purge
entière aurait levé et été annulée : plus d'anonymisation, en silence.

⛔ **Un stub prouve ce qu'il reproduit, rien d'autre.** Les contraintes que la
plateforme ajoute d'elle-même (déclencheurs, rôles, verrous) sont précisément
celles qu'on oublie d'y mettre.

⇒ **Avant d'écrire du SQL qui touche un schéma fourni par la plateforme, lister
ses déclencheurs en prod** (`pg_trigger` sur la table) et les reproduire dans le
stub ; puis **valider l'instrument sur la réponse connue** — l'ancien code doit
rougir dans le harnais corrigé *(il a rougi, exactement sur la purge RGPD)*.

**UN OUTIL « COMME LA CI » DOIT LIRE LA CI, PAS LA RECOPIER** *(2026-09-27, Artidispo)*.
`Artidispo/rejouer-local.mjs` lisait l'ordre des harnais dans `Artidispo/ci.yml` mais portait **en
dur** sa liste de stubs — dont `Artidispo/01_cron_stub.sql`, que la CI ne chargeait pas. La
migration 27 (qui planifie un cron) était **verte en local, rouge en CI** :
« schema cron does not exist ». Un cycle de CI perdu, et une confiance fausse
dans le rejeu local, qui se présentait comme fidèle.

⇒ **Chaque paramètre d'un outil qui prétend imiter la CI se lit dans la CI** — et
se prouve en retirant l'étape de `Artidispo/ci.yml` : l'outil local doit alors rougir comme
elle *(il a rougi)*.

**UN PLAFOND COMPTÉ DANS UNE POLICY NE TIENT PAS SOUS CONCURRENCE** *(2026-09-27, Artidispo)*.
Le dépôt de photos d'un dossier client était plafonné à 5 par `count(*) < 5` dans
la policy d'insertion. Chaque harnais séquentiel le confirmait (« la 6e est
refusée »). Le dry run de nuit a lancé **dix dépôts simultanés** sur un vrai
Postgres : **dix sur dix passés**. En `READ COMMITTED`, chaque transaction ne voit
que les objets déjà commités. La faille était en production depuis trois heures
(jamais exploitée : 0 dépôt).

⛔ **Un garde-fou éprouvé en séquence n'a pas été éprouvé du côté où il cède.**
Un moteur embarqué à connexion unique (pglite) ne peut même pas le montrer.

⇒ **Tout quota se réserve par une écriture qui verrouille** (`update … set n = n + 1
where … and n < max`, qui attend le verrou puis re-vérifie la condition sur la
version commitée) — et se prouve par **N sessions parallèles sur un vrai
Postgres** : l'ancien code doit laisser passer plus que le plafond *(10/10)*, le
nouveau exactement le plafond *(5/10)*.

**UN CONTRÔLE QUI NE PEUT PAS ÉCHOUER SE DÉMASQUE PAR UN TÉMOIN QUI DOIT BOUGER** *(2026-09-27)*.
`smoke-carte-celeste` affirmait « rien ne bouge en `reduced-motion` » : il relevait
les traits à 1,5 s d'écart et trouvait les mêmes coordonnées. Rejoué **sans** la
préférence, au dry run : mêmes coordonnées aussi — la caméra une fois posée, rien
ne bouge de toute façon. Le contrôle était vert par construction. Le même jour,
un second : des touchers pris au hasard au bord des cibles ne tombaient sur un
trait de la figure qu'au gré de la caméra — le défaut (les traits captaient le
doigt, 5 touchers sur 12 perdus) passait un run sur deux.
⛔ **Un contrôle d'absence n'a de valeur que si son témoin, dans l'autre état,
montre la présence** ; et un défaut déterministe se tient par un point
déterministe (le milieu de chaque trait), jamais par un tirage.
⇒ Tout contrôle « rien ne X » s'écrit APPARIÉ : l'état où X doit se produire est
mesuré dans le même harnais, et il doit être vu. *(Ici : la transition
d'extinction vaut 0,22 s sans la préférence, 0 s avec.)*

**UN GARDE-FOU QUI ROGNE EN SILENCE LAISSE PASSER CE QU'IL DEVAIT EMPÊCHER** *(2026-09-27)*.
Le moteur du ciel plafonnait la marge du mobilier à 40 % de la hauteur — « au-delà,
ce serait du mobilier avec un peu de ciel ». Au bureau, le socle complet (parole,
dock, bandeau) en prenait 45 % : la marge était rognée, et une étoile se peignait
39 px SOUS la parole, sans un avertissement. Invisible à deux étoiles sur ALPHA ;
à quatre (DOKLĚS, SYMPHO), `smoke-socle` l'a vu.
⛔ **Un plafond qui tronque ne protège de rien s'il tronque sans le dire** : il
échange un ciel trop petit contre un ciel qui passe sous les boutons.
⇒ Un garde-fou qui borne une mesure s'éprouve avec le mobilier RÉEL au complet,
et le jour où le produit grandit (le dock est arrivé le 26/09), sa borne se
remesure — elle avait été posée avant qu'il existe.

**UN NOMBRE RECOPIÉ DU REGISTRE DÉCRIT LE REGISTRE D'UN JOUR** *(2026-09-26 et 27)*.
`smoke-althea` encodait une page périmée, puis `smoke-alpha` écrivait « 2 caps »,
« 1 seul à venir », « 2 étoiles » : trois rouges sur un écran sain le jour où ALPHA
a gagné deux étoiles. Le même jour, un seuil INVENTÉ (« le ciel a au moins
300 px ») a rougi à 296 px sur un écran sain.
⛔ **Un harnais qui recopie une valeur au lieu de la lire la fige** ; un seuil qui
ne se dérive d'aucune définition teste la mémoire de son auteur.
⇒ Les comptes se LISENT au registre (`capsDe`, `NOEUDS`) avec un verrou de
non-vacuité ; les seuils se DÉRIVENT (deux cibles de 44 px ne se recouvrent pas si
leurs centres sont à ≥ 44 px — pas « le ciel fait 300 px »).

**UN OBJET DE VERDICTS INDEXÉ PAR NOM AVALE LES DOUBLONS** *(2026-09-26)*. Les
harnais notent `verdicts[nom] = ok`. Deux contrôles portant le même nom — une
boucle sur des tailles qui oublie la taille dans le libellé — et le second
**écrase** le premier : un rouge devient vert sans un bruit. Trouvé sur
`smoke-clic-exact`, `smoke-lv4-coque`, `smoke-noms-lisibles`, `smoke-socle`.
⇒ `verifier()` **lève une erreur** sur un nom déjà pris. Un harnais qui plante
vaut mieux qu'un harnais qui ment.

**UNE RÈGLE DE SÉCURITÉ ÉCRITE EN COMMENTAIRE PÉRIME AVEC LA DONNÉE** *(2026-09-26)*.
`Ultima-/js/ciel-noeud.mjs` insérait le texte de la parole par `innerHTML`, sous un
commentaire « le registre est statique, écrit par nous ». Vrai jusqu'au 02/09 : la
greffe Finubar y verse depuis des noms venus des grains des dépôts. La faille (S1)
a vécu trois semaines derrière une phrase juste le jour où elle fut écrite.
⇒ Une hypothèse de confiance ne se consigne pas en commentaire : elle se CODE
(`echapper()` à chaque insertion) et se teste (`smoke-parole-echappement`), pour ne
pas dépendre de ce que la donnée sera demain.


**UNE DONNÉE DE CRM TIERS EST UNE ENTRÉE HOSTILE, MÊME QUAND ON N'EN GARDE QUE DEUX CARACTÈRES** *(2026-09-07, RenoBoost)*.
La cause, d'abord cherchée dans la CSS, était une injection HTML : les initiales d'avatar sortaient brutes d'un nom venu de GoHighLevel.
⇒ *Règle* : ce qui vient d'un CRM tiers se traite en entrée hostile — échappé à la sortie — quelle que soit la part qu'on en affiche.

**UN CLIC DE HARNAIS TOMBE TOUJOURS SUR L'ÉLÉMENT QU'ON LUI NOMME** *(2026-09-25)*.
Paul signalait depuis des semaines que cliquer NAGA ou GRIMA « ne sélectionne
pas toujours ». `smoke-lv4-coque` était vert : il cliquait par
`dispatchEvent('click')`, qui atteint l'élément désigné quoi qu'il y ait sous
le curseur. Rejoué avec de **vrais gestes** (`mouse.move`, appui de 150 ms, tap),
le clic ratait **15 fois sur 21** : le survol redessinait le ciel et l'étoile
partait de 118 px (NAGA) à 965 px (GRIMA), puis, une fois ce défaut retiré, le
focus donné à l'appui la faisait encore viser par la caméra, 176 → 630 px avant
le relâchement.

⛔ **Un harnais qui nomme sa cible ne peut pas voir une cible qui bouge.** Il
prouve que le gestionnaire de clic répond, jamais que le clic arrive.

⇒ **Tout harnais d'un geste pointeur rejoue le geste réel** : déplacement,
appui, durée, relâchement, et le toucher à part — avec un **témoin** vert dans
les deux états (ici l'écran isolé, où rien ne bougeait) et une mesure du
**déplacement** de la cible à plusieurs paliers de temps, parce que « ça marche
si on clique vite » est exactement la forme que prend ce défaut.

**UN PLAFOND QUI MESURE LA PAGE REPLIÉE NE GARDE RIEN** *(2026-09-22)*. La
vitrine portait un seuil de hauteur de 12 400 px sur mobile, abaissé et prouvé
en le cassant le 19/09. Le 22/09, la page mesurait **11 837 px** au chargement :
vert, plafond tenu. Sauf que **neuf `<details>` étaient fermés** — la refonte
était passée de 6 à 15 replis, et **4 237 px de contenu avaient été déplacés
derrière des clics, pas retirés**. Déplié, le visiteur voit **16 074 px**, soit
**3 674 px au-dessus du plafond que le harnais prétendait garder**.

⛔ **Le harnais ne mentait pas : il mesurait autre chose que ce qu'on croyait.**
C'est pire qu'une absence de mesure, parce que le vert se lit comme une preuve.
Replier est un choix de design légitime ; ce qui ne l'est pas, c'est qu'un seuil
posé pour borner ce qu'une page pèse devienne indifférent à ce qu'elle contient.

⇒ **Tout plafond sur une page se mesure AUSSI dans l'état déplié** — `<details>`
ouverts, onglets parcourus, « voir plus » cliqués. Et la mesure dépliée exige
son propre verrou de non-vacuité : « déplié = replié » est exactement ce que
rend une page sans aucun repli, et ce serait vert.

⚠️ **Un seuil constaté n'est pas un seuil décidé.** Le second seuil a été posé à
16 200 px — la mesure du jour arrondie au-dessus — et nommé **cliquet** dans le
code : il empêche de grossir, il ne dit pas ce que la page a le droit de peser.
Confondre les deux, c'est transformer un constat en norme sans que personne
l'ait tranché.

**UN ÉLÉMENT DANS UN `<details>` FERMÉ A UNE HAUTEUR DE ZÉRO** *(2026-09-22)*.
Quatrième faux négatif de la même journée, après la casse et les accents. Un
critère « image en portrait de plus de 200 px » a rendu ABSENT un
`MobileShowcase` bel et bien présent : il vivait dans un repli fermé, donc sans
géométrie. Le verrou de non-vacuité et le témoin avaient tenu — **c'est le
CRITÈRE qui était faux, pas l'instrument**. ⇒ Toute mesure géométrique sur une
page commence par déplier ; et une absence se confirme sur le source avant
d'être annoncée.

**UN GARDE-FOU SE VÉRIFIE DU CÔTÉ OÙ IL PEUT ÊTRE CONTOURNÉ** *(2026-08-21)*.
Quatre écarts de la même forme dans une séance : une donnée protégée par un
écran et pas par la donnée ; un motif d'import supposé plutôt qu'éprouvé ; une
convention de plateforme prise pour une protection ; une liste de chemins écrite
à la main prise pour une couverture. Les quatre passaient la revue et ne
tenaient qu'à une requête près. *Corollaire, et c'est lui qui coûte* : quand on
ne **peut pas** vérifier de ce côté-là, on **retire l'hypothèse** au lieu de la
documenter. Une hypothèse documentée reste une hypothèse, et c'est le lecteur
suivant qui la paie.

*Rechute du 2026-09-13 (RenoBoost)* : les tests d'encre du 11/09 ne lisaient que `RenoBoost/style.css` ; `RenoBoost/dashboard.css` portait 64 textes sous 4,5:1, sept fois la dette de la landing, dans l'outil ouvert tous les jours. Étendus aux 6 feuilles, avec un verrou de couverture qui balaie le dépôt — une liste de fichiers écrite à la main est une couverture supposée. Les 64 ne sont pas soldés : ils sont bornés et ne peuvent que descendre.


**UN REVOKE SUR LES RÔLES NOMMÉS NE RÉVOQUE RIEN** *(2026-09-13, RenoBoost)*.
`revoke all on function ... from anon, authenticated` a rendu `success:true` et n'a rien fait : `create function` accorde EXECUTE à PUBLIC, dont anon hérite. Mesuré : `has_function_privilege('anon', ...)` = true APRÈS le revoke. Corrigé par `from public` d'abord.
⇒ *Règle* : un droit se vérifie du côté où il peut être contourné (`has_function_privilege`, pas le retour de la migration), et `success:true` n'est pas une mesure.
*Rechute du 2026-10-19 (Ultima-, AMATSU), sur une TABLE* : `revoke all on public.amatsu_lectures from anon` puis `grant select, insert, delete … to authenticated`. Mais Supabase accorde par défaut TOUS les droits sur une table neuve de `public` à anon ET à authenticated : le rôle connecté gardait UPDATE (bloqué par la RLS, faute de policy) et **TRUNCATE, que la RLS ne voit pas**. Trouvé à la relecture d'avant application, pas par un test : le harnais lisait le TEXTE de la migration. ⛔ Tout retirer d'abord (`from public, anon, authenticated`), puis donner la liste fermée ; et le prouver en EXÉCUTANT la migration dans un Postgres jetable qui reproduit les droits par défaut (`alter default privileges … grant all on tables to anon, authenticated`), puis `has_table_privilege` et un vrai `truncate` — l'ancien revoke y laissait passer le vidage (`tests/unit-amatsu-validate.mjs` §9).


**LA CLÉ SERVICE PASSE OUTRE LA RLS : LE PÉRIMÈTRE SE POSE À LA MAIN** *(2026-09-15, RenoBoost)*.
Trouvé par l'audit de fin de séance, APRÈS la fusion de #467. `kv_store` a pour clé primaire `(owner_id, key)` ; le rail lisait sur la seule `key`, en service role. Or `rb_clients_v2` existe pour plusieurs propriétaires : le rail pouvait lire, puis RÉÉCRIRE, le fichier clients de quelqu'un d'autre. Corrigé, gardé par quatre sabotages.
⇒ *Règle* : en service role, la RLS ne protège plus rien. Chaque lecture et chaque écriture pose elle-même son périmètre (ici `owner_id`), et ce périmètre se prouve en le sabotant.

**UN HARNAIS QUI N'EST PAS LE CLIENT DU PRODUIT NE PROUVE RIEN DE CE QUE LE
PRODUIT VIT** *(2026-09-14)*. La connexion d'`artisan-builder` était impossible
en production — pour tout le monde, pendant des heures — alors que
`artisan-builder/tests/verif-workspace-http.mjs` était vert sur cette même
garde. Il appelait `/api/session` en `fetch`, **en posant lui-même l'en-tête
`Origin`**. Or un navigateur ne pose pas cet en-tête : il le **calcule**, et sur
une page servie avec `Referrer-Policy: no-referrer` — ce que sont toutes les
pages privées du dépôt — il envoie « null ». Le harnais décrivait donc une
requête que le produit n'émet jamais, et il le faisait avec l'autorité d'un
contrôle vert. *Ce que ça a coûté* : deux correctifs livrés d'affilée sur une
cause **déduite** de sondes `curl`, dont un qui a fait tourner un secret pour
rien — là où un vrai navigateur a montré la cause en une sonde. *Règle* : quand
la panne vit dans ce que le client **calcule** — en-têtes de navigateur,
politique de cookie ou de referrer, CORS, rendu — le harnais **est** ce
client-là, pas son imitation. Un `fetch` éprouve un contrat HTTP ; il ne dit
rien de ce qu'un navigateur fera de ce contrat.

**UN CONTRÔLE PEUT ÊTRE VERT PAR ACCIDENT, ET SEUL L'ESSAI DE LE CASSER LE
DIT** *(2026-09-15)*. Un harnais de parcours vérifiait l'identité de chaque écran
en cherchant un motif dans le TEXTE ENTIER de la page. Il passait — mais pour la
mauvaise raison : la navigation commune nomme TOUS les écrans, donc « /studio
contient le mot Bibliothèque » est vrai. Le contrôle aurait laissé passer un
Studio qui rendrait l'accueil. Découvert en substituant volontairement un écran
attendu faux, et en constatant que rien ne virait au rouge. *Règle* : un contrôle
neuf se casse AVANT d'être cru — pas relu, cassé. Et un motif d'identité se
cherche dans ce qui identifie (le titre), jamais dans ce qui est partagé.

*Rechute du 2026-09-15 (RenoBoost), trois fois dans la journée* : cinq lignes de validation d'entrée sur `estJourDePublication` dont la suppression laissait les tests verts — le refus tenait à la comparaison stricte (`getUTCDay()` ne rend que 0-6, `NaN === 1` est faux). Retirées : du décor défensif se lit comme une protection testée. Même journée, un test de fenêtre de conversation qui ne pouvait pas échouer (réécrit) et une comparaison de signature tronquée à 8 caractères qui ne cassait rien (test ajouté).

**IL N'Y A PAS DE BONNE VUE DU DOM, IL Y A LA VUE QUI RÉPOND À LA QUESTION
POSÉE** *(2026-09-15, complète la v21)*. `body.textContent` INCLUT le contenu des
`<script>` : le payload RSC de Next y écrit « $undefined » par dizaines, et un
contrôle « la page n'affiche rien d'inachevé » posé dessus invente un défaut qui
n'existe nulle part à l'écran. `innerText`, lui, cache de vrais défauts — c'est
ce que la v21 a payé. Aucune des deux n'est « la bonne » : pour « ce qu'une
personne lit », on lit les éléments RENDUS, scripts et styles retirés ; pour « ce
qu'un lecteur d'écran reçoit », c'est `textContent` du contenu seul. La question
décide de la vue, jamais l'habitude.
*Rechute du 2026-11-03 (Artidispo)* : un contrôle d'**absence** (« le mot X n'est plus sur la
page ») lisait `innerText` — qui ne voit pas le contenu d'un `<details>` replié. La FAQ
fermée pouvait donc garder le mot interdit, contrôle vert. Corrigé en `textContent` : pour
« ce texte n'est nulle part », la vue est celle qui voit tout, replié compris. Même séance,
un **détecteur** (expression régulière des ombres décalées) aurait laissé passer toutes les
ombres réelles : il n'a été cru qu'après avoir été passé sur des cas dont la réponse était
connue (une ombre décalée → rouge, une ombre floue → vert).

**UN GARDE-FOU QUI CESSE DE FONCTIONNER DOIT LE DIRE** *(2026-08-21)*. Un test
absent de la chaîne d'intégration, un filtre qui écarte en silence, une garde
jamais appelée : leur silence se lit comme une bonne nouvelle, et c'est le pire
des deux états.

**UN FILTRE QUI EXCLUT DES CAS DOIT COMPTER ET NOMMER CE QU'IL EXCLUT**
*(2026-08-17)*. Un harnais de contraste écartait sans rien dire les textes trop
fins pour avoir un pixel pleinement opaque, c'est-à-dire **exactement les plus à
risque**, et rendait un verdict vert. Un `continue` muet transforme un angle
mort en réponse rassurante. Tout cas écarté est compté, nommé au rapport, et son
nombre est borné par un verdict.

**UN VERDICT DIFFÉRENTIEL PARDONNE PAR CONSTRUCTION, IL LUI FAUT UN VERROU**
*(2026-08-20)*. Un harnais n'exigeait « aucun défaut **nouveau** » : sept textes
sous le seuil ont dormi des semaines **dans un rapport vert**, poliment listés
sous « rappels ». Un rappel n'est pas un garde-fou. Toute page dont la dette est
soldée le déclare et retrouve un seuil **absolu**.

**TOUTE RECHERCHE D'ABSENCE EXIGE UN VERROU DE NON-VACUITÉ** *(2026-07-30,
renforcé 2026-09-07)*. « X n'est pas là » est vert sur une chaîne vide, une page
non chargée, un fichier de zéro octet. Une règle de confidentialité se teste
ainsi : chercher le contenu interdit dans ce qui part, et exiger de ne pas l'y
trouver. Vérifier seulement la présence du permis ne prouve rien.

*Rechute du 2026-09-13 (RenoBoost)* : un harnais ouvrait les pages produit en `file://` alors qu'elles référencent leurs feuilles en racine-relatif (`href="/produit.css"`) — rien ne chargeait, 9 verdicts verts sur des pages NUES. Une page sans CSS n'a effectivement pas d'ombre : le harnais avait raison sur le fond, et c'est ce qui rend l'erreur dangereuse. Corrigé par un serveur HTTP et un verrou de non-vacuité (`.pp-btn` fait au moins 44px), 18/18 verts ensuite (`RenoBoost/tests/pages-produit.navigateur.mjs`). Trois autres sondes ont menti le même jour : un token hex comparé à un style calculé en rgb (0 défaut sur 1669 éléments), un fond translucide lu comme opaque, une sonde qui ne cherchait plus les bons tokens après conversion.

*Rechute du 2026-10-19 (Ultima-)* : un verdict « aucune mention de repli » attendait `.leo-bulle-leo`, un sélecteur déjà présent avant la réponse (l'accueil de Léo) — l'absence était constatée avant que la réponse n'arrive. Le cas jumeau (« la mention est là ») a échoué au premier passage et réussi au deuxième : c'est ce passage au vert « au hasard » qui a trahi le défaut. ⛔ On attend le TEXTE exact de la réponse, jamais un sélecteur qui peut préexister ; et un harnais qui change de verdict d'un passage à l'autre ne garde rien : on le relance trois fois avant de le croire.

**UN TEST DE COURSE QUI LAISSE LE CALENDRIER DÉCIDER NE GARDE RIEN** *(2026-10-19, Ultima-)*.
Le plafond d'appels de Léo (verrou consultatif PostgreSQL) était éprouvé par 30 insertions
simultanées à 90/100. Le sabotage « verrou retiré » est passé au vert au deuxième essai :
les insertions étaient si brèves que chacune finissait avant que la suivante ne démarre —
sans verrou, la course n'avait simplement pas lieu. Le verrou avait été prouvé la première
fois, par chance. Corrigé : chaque client garde sa transaction ouverte 0,5 s après
l'insertion, ce qui rend la course inévitable sans verrou ; sabotage rouge trois fois de
suite (`Ultima-/tests/leo-appels-postgres.sh`). ⛔ Pour prouver un verrou, ne pas compter sur
la concurrence « naturelle » : tenir la fenêtre ouverte, puis casser le verrou et exiger le
rouge PLUSIEURS fois — un sabotage qui ne vire pas au rouge à tous les coups mesure le hasard.
⚠️ Corollaire : un test qui ne tourne pas dans `run-unit.mjs` ne tourne pas dans la CI ;
la partie du harnais que PGlite peut prouver (refus du 101ᵉ, droits, unicité) vit donc aussi
dans `Ultima-/tests/unit-leo-appels-sql.mjs`, le reste (la course) restant au harnais réel.

**UN ROUGE QUI VA ET VIENT EST UN DÉFAUT JUSQU'À PREUVE DU CONTRAIRE** *(2026-11-03, Artidispo)*.
Deux contrôles du tunnel d'inscription viraient au rouge « une fois sur plusieurs » : ⑱a
(photos) et ⑯b (saisie du nom). Le premier a d'abord été déclaré instable, dans une PR, et
la relance est passée au vert. Les deux étaient de vrais défauts du produit, que seul le
hasard du calendrier révélait : le bouton « Continuer » se réactivait pendant l'envoi d'une
photo (`majStatutBrouillon` ignorait l'envoi en cours), et un redessin de l'écran, déclenché
par la réponse du registre, réécrivait le champ avec la valeur nettoyée — l'espace tapé
entre deux mots disparaissait. Un artisan au doigt rapide les aurait rencontrés tous les
deux. ⛔ Un rouge intermittent ne se relance pas pour obtenir un vert : on cherche **l'ordre
d'arrivée** qui le produit, on écrit le contrôle qui **force** cet ordre (⑯f : espace, puis
réponse du registre, puis suite de la frappe), on exige qu'il soit rouge à chaque fois sur
le code fautif, puis on corrige. Si l'on ne trouve pas d'ordre, on le dit — « instable » est
une conclusion, pas un diagnostic. *Ce que ça a coûté : un commentaire public à corriger sur
la PR, et un défaut de saisie qui aurait atteint la production sous l'étiquette « test
fragile ».*

**UN RENVOI MORT SE LIT EXACTEMENT COMME UN RENVOI VALIDE** *(2026-09-07)*. Un
« §11.8 » était cité cinq fois dans les documents d'Artidispo pour une section
**jamais écrite** : le script qui devait la poser avait échoué après avoir
construit son texte. Rien ne le signalait, et c'est Paul qui l'aurait découvert
en cliquant. Corrigé par un harnais, `RenoAgenda/tests/unit/renvois-sections.test.mjs`.

⊕ **ET UN CHEMIN SANS SON DÉPÔT EST UN RENVOI MORT DANS NEUF DÉPÔTS SUR DIX**
*(2026-09-30)*. Ce fichier est copié à l'identique dans dix dépôts. Un
`` `tests/lint.test.mjs` `` écrit nu s'y lit comme un fichier du dépôt COURANT :
il n'existe que dans RenoBoost, donc neuf séances sur dix le cherchent en vain —
et un chemin qu'on ne trouve pas se lit comme une garde qu'on a supprimée.
Vingt-sept occurrences étaient dans ce cas ; toutes portent désormais leur
préfixe. ⚠️ **L'attribution se MESURE** (`git ls-files` sur les dix dépôts) et,
quand plusieurs dépôts portent le même nom de fichier, elle se lit dans le
TEXTE de la leçon — son tag, ou le domaine qu'elle cite. Trois chemins restent
nus **à dessein** : `CLAUDE.md`, `FINUBAR.md` et `memoire/LECONS.md` existent
dans les dix, et la leçon parle bien du dépôt courant. Les préfixer serait faux.
⊕ *(02/10)* Ce paragraphe en comptait quatre : `Ultima-/memoire/JOURNAL-DECISIONS.md`
n'existe en fait que dans Ultima (`git ls-tree` sur les dix `main`) — il porte
son préfixe depuis la v61, avec trois autres chemins entrés nus après cette
passe et relevés par la relecture Codex de la propagation.

**UN MÉCANISME DE CONTRÔLE POSÉ APRÈS LA PREMIÈRE COPIE LAISSE CETTE COPIE
DEHORS** *(2026-09-11)*. Ce fichier a été déposé dans RenoAgenda le matin ; le
sceau qui permet de comparer les huit copies a été posé une heure plus tard. La
première copie servie était donc déjà hors mécanisme, et son rappel d'ouverture
annonçait « cette copie n'a PAS de sceau ». Il a fallu une PR de rattrapage pour
un fichier vieux d'une heure. *Le contrôle se pose AVANT la première copie, pas
après la dernière* — et ce qui a sauvé le coup ici, c'est que le mécanisme
ANNONCE son absence : un sceau muet aurait laissé la copie passer pour à jour.

**UN DOCUMENT DE DATES N'A AUCUN MÉCANISME DE PÉREMPTION** *(2026-09-11)*. Le
rétroplanning d'Artidispo affichait deux jalons dépassés de trois jours
exactement comme les jalons à venir. Un jalon en retard ne se signale pas tout
seul : il faut le lui faire dire, comme Finubar fait dire à un grain qu'il a
vieilli.

**UN GARDE-FOU QUI LIT DU TEXTE LIT AUSSI SA PROPRE DOCUMENTATION**
*(2026-09-11)*. Une garde qui cherche un motif interdit dans un fichier trouve
aussi le commentaire qui explique pourquoi ce motif est interdit. Elle se
déclenche donc sur l'explication du correctif, pas sur le défaut. ⛔ Un contrôle
de présence se fait sur le CODE (commentaires retirés) ou sur un COMPTE attendu
— « exactement une occurrence, celle du repli voulu » — jamais sur la présence
brute d'une chaîne dans un fichier commenté. *Incident : deux assertions de
sûreté ont bloqué deux modifications correctes, parce que le commentaire que je
venais d'écrire citait le mot qu'elles interdisaient. Deux cycles perdus, et la
tentation immédiate de désarmer l'assertion — c'est-à-dire de supprimer le
garde-fou pour faire passer le correctif.*

**UN ROUGE DE COMPILATION N'EST PAS UN ROUGE D'INSTRUMENT** *(2026-09-13)*. Deux
sondes de dry run ont fait rougir un harnais navigateur — mais parce que le JSX
saboté ne compilait plus, donc la page ne chargeait pas du tout. Le harnais
sortait sur son verrou de non-vacuité, pas sur l'assertion qu'on prétendait
éprouver. Les deux sondes ont été **refaites** en cassant la propriété sans
casser la compilation (HTTP 200 vérifié avant de lire le verdict). *Une sonde
valide ne casse qu'une chose, et on vérifie que le reste tient encore.*

**UNE MAUVAISE SONDE N'EST PAS UN INSTRUMENT DÉFAILLANT — DISTINGUER LES DEUX EST
LE TRAVAIL** *(2026-09-13)*. Trois sondes sont revenues vertes dans la même
séance. Deux étaient de mauvaises sondes : elles ne cassaient pas la propriété
affirmée (insérer un bloc avant le formulaire le laissait quand même remonté ;
retirer le bouton d'appel de l'en-tête laissait neuf autres liens de contact).
La troisième révélait un vrai défaut d'instrument. Compter les trois comme
« l'instrument ne prouve rien » aurait fait réécrire deux gardes correctes ; les
compter comme « rien à signaler » aurait laissé la troisième. *Avant de conclure,
relire ce que la sonde a réellement cassé, et le comparer à ce que l'assertion
affirme.*

**UNE GARDE QUI NE PEUT PAS ÉCHOUER SE LIT COMME UNE BONNE NOUVELLE**
*(2026-09-13)*. Un harnais vérifiait qu'« il reste un chemin vers le formulaire
quelque part dans la page ». Aucune casse d'un seul composant ne pouvait la faire
rougir : le produit porte une dizaine de tels chemins. Elle a été REMPLACÉE — pas
renforcée — par une garde portant sur l'en-tête, qui n'en a qu'un, et qui rougit.
*Une assertion dont on ne sait pas fabriquer l'échec n'est pas une assertion,
c'est une phrase.*

**UN CONTRÔLE SUR UN AUTRE PORT NE TOURNE JAMAIS** *(2026-09-13)*. Neuf harnais
navigateur d'artisan-builder visaient `:3000`, le dixième `:3101`. Lancé de la
façon documentée pour tous les autres, il sortait sur `ERR_CONNECTION_REFUSED`
— qu'on lisait comme un harnais cassé, donc personne ne l'exécutait. Il était
vert. *Un réglage qu'il faut connaître pour lancer un contrôle est un contrôle
qui ne tourne pas.*

**UN OUTIL DE BUILD PEUT TUER LE SERVEUR QUE LES CONTRÔLES INTERROGENT**
*(2026-09-13)*. Après un `npx next build`, les dix harnais ont rendu dix
`ERR_CONNECTION_REFUSED` d'affilée — dix régressions apparentes, zéro réelle : le
build avait arrêté le `next dev` qu'ils interrogent. *Dix échecs identiques et
simultanés désignent l'environnement, pas le code.*

**BOUCHER UN TROU NOMMÉ N'EST PAS FERMER SA CLASSE — ET LA CORRECTION DONNE
L'ILLUSION DU CONTRAIRE** *(2026-09-13, la même journée que la correction)*. Le
matin, j'avais trouvé et corrigé le trou `Number(null) === 0` dans `formeSaine`,
le validateur de réponse du radar. Je l'ai noté comme « le contrat est fermé ».
Le soir, sept charges hostiles lui ont été présentées : **les sept sont
passées** — `volume: null`, volume négatif, volume booléen, ligne sans mot-clé,
ligne qui est une chaîne, et des totaux annonçant 9 999 mots-clés pour une seule
ligne. Le validateur vérifiait l'**enveloppe** et s'arrêtait au bord du tableau.
⛔ *Corriger un cas particulier crée le sentiment d'avoir traité le général, et
ce sentiment est plus dangereux que le trou d'origine : il retire le sujet de la
liste des choses à regarder.* La question à poser après chaque correction n'est
pas « est-ce réparé ? » mais **« de quelle famille était ce défaut, et qui
d'autre en est ? »** — puis on présente la famille entière au garde-fou.

⊕ **Réparer les données d'un dossier ne prouve pas le parcours suivant** *(2026-10-29, RenoDevis)*. Le HT d'une variante figurait dans le PDF et les données, mais manquait à l'affichage ; correction d'import puis nouvelle vérification nécessaires. Coût : intervention technique avant envoi. ⇒ Séparer « dossier corrigé » et « défaut général corrigé » ; ce dernier exige une création/importation neuve et une reprise, sans réparation manuelle. Cela ne remet pas en cause le nouveau calcul dont Paul confirme le bon fonctionnement.

**UN INVARIANT VRAI ET NON GARDÉ SE CASSE EN SILENCE** *(2026-09-13)*. Deux
invariants du radar étaient parfaitement respectés et **absolument pas testés** :
la garde `requireAdmin` (correcte — elle interroge `is_admin` avec le JWT de
l'utilisateur, et seul `true` passe) n'avait aucun test de 401/403 sur les routes
du radar ; et la séparation entre le simulateur public et les routes privées
tenait, sans qu'aucun harnais ne l'exige. *Un invariant qu'on a vérifié à l'œil
est vrai aujourd'hui ; un invariant qu'un harnais exige est vrai demain. Entre
les deux il n'y a pas une nuance de rigueur, il y a la personne qui modifiera
le fichier dans six mois sans connaître la règle.*

**UN HARNAIS PEUT ÉCHOUER POUR UNE RAISON QUI N'EST PAS CELLE QU'IL ANNONCE**
*(2026-09-13)*. La recette de forme SPC rendait `EncodingError: The source image
cannot be decoded` sur le logo du pied de page — donc, à la lettre, « le fichier
du client est illisible ». Le fichier était intact : son empreinte git était
exacte, et la recette elle-même venait de l'affirmer six lignes plus haut. Le
défaut était dans l'instrument : il appelait `image.decode()` juste après
`scrollIntoViewIfNeeded()`, sur une image différée qui était encore **en vol**.
Trois passages ont rendu le même rouge — donc pas un aléa, un faux positif
**systématique**, celui qu'on croit le plus volontiers. Coût : une boucle
complète de diagnostic sur un défaut qui n'existait pas. ⛔ *Un rouge se relit
avant d'être cru : ce que le message NOMME (« image indécodable ») et ce que
l'assertion PROUVE (« le logo est déformé ») sont deux choses, et seule la
seconde accuse le code.* Et le correctif ne se paie pas en aveuglement : un
contrôle qui dépend d'un chargement asynchrone **attend** l'état au lieu de le
supposer — l'attente ne masque rien tant qu'elle expire, une image qui ne charge
jamais fait toujours rougir la recette. Vérifié ici par deux sondes : logo
délibérément déformé et activité prioritaire retirée virent toutes deux au
rouge, et la recette repasse au vert une fois l'état restauré.


**UN HARNAIS QUI LIT L'HORLOGE ROUGIT SANS QU'UN COMMIT L'AIT CASSÉ** *(2026-09-30, RenoBoost)*.
`navigation-palier3` était rouge sur `main` depuis la fusion de #556, qui ne touchait que la vitrine. On a d'abord soupçonné #556. Rejoué sur le commit vert de la veille (`a13b1b4`), le harnais rougissait aussi : la section « 🚩 Rendez-vous annoncés sans date » n'apparaît que selon les dates des fiches (`grouperClients` reçoit `Date.now()`), et son titre en `nowrap` élargissait la page à 325 px sur un écran de 320. `main` est resté rouge environ une heure et demie ; la PR de la séance a hérité du rouge.
⇒ *Règle* : un rouge apparu sans changement de code se rejoue d'abord sur le **dernier commit vert** — s'il y rougit aussi, la cause est l'environnement (date, données), pas le diff. Et un harnais dont le verdict dépend du jour doit **figer l'horloge** : sinon il changera d'avis demain, et on corrigera le symptôme (ici le titre, `RenoBoost/dashboard.css`) sans avoir fermé la cause (`RenoBoost/tests/navigation-palier3.navigateur.mjs` lit toujours la vraie date).

**UN GARDE-FOU ÉCRIT CONTRE DES MOTS REND ROUGE LA CORRECTION ELLE-MÊME**
*(2026-09-14)*. Après avoir retiré du site SPC toutes les promesses d'astreinte,
le harnais chargé de les empêcher de revenir a failli interdire le substrat
« dépannage » et « astreinte ». Or le texte CORRIGÉ dit, en toutes lettres,
« SPC n'est pas un service de dépannage d'urgence » et « nous n'assurons pas
d'astreinte » : la règle aurait rougi sur la phrase juste, et la séance suivante
aurait retiré **la mise au point plutôt que la promesse** — exactement l'inverse
de ce qu'on voulait. Il interdit donc des MOTIFS d'engagement (`7j/7`,
`intervenir dans la journée`, `traité en priorité`), pas un vocabulaire.
⛔ *Un contrôle d'absence se relit contre le texte corrigé, pas seulement contre
le texte fautif : s'il rougit sur la bonne version, il enseigne à supprimer la
bonne version.* Et il se double d'un contrôle POSITIF — ici « la réponse doit
toujours dire que SPC n'en est pas un » — sinon on satisfait l'absence en
effaçant aussi ce qui renseigne le visiteur.


**ÉLARGIR UN GARDE-FOU EST UN GESTE DANGEREUX EN SOI** *(2026-09-13, RenoBoost)*.
La regex de `RenoBoost/tests/langage-encres.test.mjs` ne voyait pas `color: var(--primary-dark)` (sky-600, 4,10:1) : le suffixe lui échappait. Ma première correction, un `[-a-z]*` générique, a attrapé `--color-primary-solide-encre`, `--color-primary-contrast` et `--color-accent-solide-encre` — les tokens FAITS pour porter du texte — et aurait exigé de remonter TROIS plafonds pour passer, l'anti-pattern exact que ce test interdit.
⇒ *Règle* : on ne liste que les cas qu'on veut attraper (`-dark`, `-light`), au lieu d'ouvrir la porte et de filtrer après. Et un garde-fou élargi se prouve en le cassant : défaut réintroduit, `RenoBoost/style.css` passe de 9 à 10 (rouge) ; restauré, vert.


**UN BLOCKLIST NE GARANTIT RIEN, IL NETTOIE** *(2026-09-15, RenoDevis)*.
Le garde-fou PII a attrapé 12 patronymes, puis en a laissé passer un : le nom de fichier l'orthographiait autrement que la fiche client, et un détecteur par jetons ne retire que les noms qu'il CONNAÎT. Un champ de texte libre écrit par un tiers n'est pas bornable.
⇒ *Règle* : ce qu'on ne peut pas borner ne traverse pas la frontière, et ce qui la traverse se CONSTRUIT. Ici ni le nom de fichier ni le libellé de l'artisan ne passent plus ; `reference_chantier` se construit depuis un vocabulaire fermé. Signe que le remède tient : neutraliser le nettoyeur ne change plus rien à la sortie.

**UN CONTRÔLE QUI REGARDE PAR LA SEULE FENÊTRE OÙ LE DÉFAUT N'EXISTE PAS EST
PIRE QU'ABSENT** *(2026-09-14)*. Le H1 de SPC est composé d'un `<span
class="block">SPC</span>` suivi du reste de la phrase. À l'œil : deux lignes.
Dans le flux de texte : **rien ne les séparait** — `textContent` rendait
« SPCvotre expert plomberie… », ce que lisent un lecteur d'écran et un robot
d'indexation. Le harnais était VERT : il lisait `innerText`, qui **fabrique** un
saut de ligne pour un enfant `block` et donc voyait « SPC\nvotre expert… ».
Il regardait la seule projection du DOM où le défaut est invisible.
⛔ *Un contrôle a toujours une fenêtre — une propriété, une API, une vue. Quand
la propriété qu'il interroge NORMALISE ce qu'on veut vérifier, il ne prouve pas
« c'est bon », il prouve « je n'ai pas regardé ».* Et le défaut n'a pas été
trouvé dans le code ni par le harnais, mais en relisant **la page réellement
servie** après la fusion : un octet de séparation manquant ne se voit ni dans
le diff, ni dans une capture, ni dans un test qui normalise. La sonde qui
corrige la classe entière : retirer le séparateur DOIT faire rougir — vérifié.

**UN TEST QUI LIT UNE CONFIGURATION ATTESTE UNE INTENTION, JAMAIS UN EFFET**
*(2026-09-15)*. `RenoBoost/tests/preview-vitrine.test.mjs` s'appelait « la future vitrine
devient la page racine » et vérifiait qu'un rewrite `/` → `/preview-vitrine.html`
figurait bien dans `RenoBoost/vercel.json`. Vert depuis la veille. Et pendant ce temps,
`www.renoboostia.fr/` servait toujours l'ancienne page : **sur Vercel, un
fichier statique est servi AVANT les rewrites**, et `RenoBoost/index.html` occupe la
racine — le rewrite n'était jamais atteint. Le défaut n'a été vu que parce que
Paul a demandé « est-ce que ça a bien été mis à jour ? » et que la réponse est
allée voir l'URL publique, pas le dépôt. ⛔ *Entre la ligne de configuration et
le comportement, il y a un moteur qu'on n'a pas lu. Un garde-fou qui s'arrête à
la configuration occupe la place de celui qui aurait vu le problème — et il
rend le silence rassurant.* Le remplaçant mesure les deux : l'URL existe, ET
personne ne peut re-tenter la bascule par un rewrite tant qu'`RenoBoost/index.html` est
là.

---

**UN HARNAIS QUI S'ARRÊTE AU PREMIER ROUGE REND AVEUGLE TOUT CE QUI SUIT**
*(2026-09-18)*. `Ultima-/tests/lancer.sh` passe les unitaires, puis les smoke navigateur.
Le 15/09, `unit-lecons-empreinte` est passé au rouge — le sceau de ce fichier
mentait, la PR #251 y ayant ajouté 47 lignes sans le recalculer. À partir de cette
minute, le job `browser` **mourait avant d'ouvrir un seul navigateur**. Les
soixante contrôles de `smoke-leo-partout` n'ont plus tourné pendant trois jours,
et le Dock Léo (#247, #250) est entré dans `main` sans que son propre harnais
l'ait jamais vu.

⛔ **Une panne en cache toutes les suivantes, et la CI continue de dire « rouge ».**
C'est le piège : un dépôt à la CI rouge n'a pas l'air d'un dépôt aveugle, il a
l'air d'un dépôt qu'on sait cassé. Le rouge du 15/09 et le rouge du 18/09 se
ressemblaient — le premier masquait deux défauts que le second a révélés d'un
coup, dont un faux positif qui aurait bloqué la première PR venue.

⚠️ **Le signe qu'il fallait lire** : personne n'était allé voir POURQUOI la CI
était rouge depuis trois jours. **Un rouge permanent cesse d'être une
information** — il ne se distingue plus d'un rouge nouveau, et c'est exactement
ce qu'on attend d'un garde-fou qu'il fasse.

**Ce que ça change dans le geste** : quand un harnais séquentiel tombe, la
question n'est jamais seulement « qu'est-ce qui a échoué ? » mais **« qu'est-ce
qui n'a pas été exécuté à cause de ça ? »**. Un échec en tête de chaîne se traite
en priorité, non pour le vert, mais pour **récupérer la vue**.

---

**UN HARNAIS QUI N'A JAMAIS TOURNÉ AILLEURS QUE SUR LA MACHINE QUI L'A ÉCRIT NE
GARDE RIEN** *(2026-09-18)*. RenoBoost portait **huit** harnais
`*.navigateur.mjs` — contraste, rendu, géométrie, tout ce qui ne se vérifie
qu'en ouvrant une page. Aucun n'avait jamais tourné en intégration : `node
--test` ne découvre que les `*.test.mjs`, et six d'entre eux codaient en dur le
chemin d'un binaire Chromium propre au poste de développement. La CI était
verte, et ne regardait aucune page. Le jour où ils ont tourné, **cinq défauts
sont tombés d'un coup**, dont un que seule la machine d'intégration pouvait
voir : un `const ROOT = '/home/user/RenoBoost'` — vrai ici, faux partout
ailleurs. ⛔ *Un harnais qu'on ne lance jamais et un harnais qui n'existe pas se
valent exactement — à ceci près que le premier occupe la place du second et
rassure.* **Règle** : un harnais entre dans le dépôt **avec son exécution en
intégration, dans le même commit**. Pas de « on le branchera » : c'est
précisément ce qui ne s'écrit pas.

⊕ **Et l'instrument qui devait les lancer a menti le premier.** Le lanceur que
j'ai écrit ce jour-là annonçait `sortie 0` sur un harnais qui échouait : `bash`
réinitialise `$?` en entrant dans le `else`, et je lisais le code APRÈS le test
au lieu de le **capturer avant**. Trois lignes, et le garde-fou tout neuf
validait tout. ⚠️ **Le même harnais, sous mutation, a PLANTÉ** au lieu de rendre
un verdict — `getComputedStyle(null)` sur un élément que la mutation venait de
retirer : la section suivante n'a jamais tourné, et une trace d'erreur ne se lit
pas comme un échec de contrôle. *Un garde-fou se prouve en le cassant, et la
preuve ne vaut que si le rouge attendu est bien **le rouge du contrôle**, pas une
pile d'appels.*

---

**UN CRITÈRE VRAI MAIS INSUFFISANT EST VERT EXACTEMENT QUAND IL COMPTE**
*(2026-09-18)*. Le harnais du bandeau défilant vérifiait que **la piste déborde
de l'écran**. C'est vrai, c'est mesurable, et ça ne garde rien : la propriété qui
compte est que **les séries restantes couvrent encore l'écran** une fois la
première sortie — `(N-1) × largeur_de_série ≥ largeur_d'écran`. Les deux
coïncidaient tant que le bandeau portait six items. Paul en a retiré un ; sur un
écran large, un trou pouvait s'ouvrir dans le défilé **sans que le contrôle
bouge**. ⛔ *Le défaut n'a pas été révélé par un test, mais par une décision
produit* — c'est-à-dire par hasard, et après coup.

⚠️ **Le signe à reconnaître** : un critère qui mesure une **conséquence** de la
bonne propriété au lieu de la propriété elle-même. Il passe les cas nominaux, il
est facile à écrire, et il cède exactement dans le cas limite pour lequel on
l'avait mis. **Le geste qui manquait tient en une question** : *qu'est-ce qui
rendrait ce contrôle vert alors que l'écran est faux ?* Si la réponse existe, on
ne mesure pas la bonne chose. Ici, elle s'énonçait en une ligne — et le contrôle
réécrit se vérifie désormais à six largeurs d'écran, de 390 à 2560.

**UN HARNAIS QUI CRIE SUR DU SAIN FINIT ÉTEINT** *(2026-09-19)*. Le harnais neuf
qui mesure la console à 390 px a rendu **douze défauts à sa première
exécution — douze faux** : des tuiles Leaflet, qui débordent de leur cadre par
construction puisque c'est le principe d'un plan qu'on fait glisser, et les
entrées du menu rangé hors-champ à gauche, qui se superposent entre elles là où
personne ne les voit. Les deux vrais défauts étaient noyés dedans. *Ce que ça
aurait coûté* : un harnais qui hurle sur du sain n'est pas corrigé, il est
contourné — puis débranché, et il ne garde plus rien tout en ayant l'air d'un
garde-fou. *Règle* : le **hors-jeu** d'un contrôle fait partie du contrôle. Il
s'écrit dans le fichier, avec sa raison, au moment où on le pose — et un
premier passage qui trouve beaucoup se lit d'abord comme un défaut du contrôle,
pas comme une découverte.

**PHOTOGRAPHIER UN ÉCRAN TROUVE CE QU'AUCUN TEST NE REGARDE** *(2026-09-19)*. En
tirant des captures de la console pour la vitrine, deux défauts réels du produit
sont sortis, que **1465 tests unitaires et dix harnais navigateur ne voyaient
pas** : à 390 px, la grille du mois perdait **samedi et dimanche** — sept
colonnes en `minmax(52px,1fr)` réclamaient 388 px, le conteneur en recevait 276,
et l'`overflow-x:auto` absorbait l'écart **en silence**, le week-end n'étant plus
atteignable que par un glissement que rien n'annonce ; et le bouton
« Aujourd'hui », centré en `position:absolute`, se posait **sur** la pastille
voisine dès que la barre passait à trois lignes, 1618 px² de recouvrement, une
commande recevant les clics de l'autre. Un artisan travaille le samedi. *Ce que
ça a coûté* : rien ce jour-là, parce qu'une tâche de vitrine a obligé à REGARDER
l'écran. ⛔ C'est l'inverse qui est la leçon : sans cette tâche, les deux défauts
tenaient indéfiniment, verts. *Règle* : rendre un écran et le regarder est une
**mesure**, pas une illustration. Un `overflow` qui avale, un absolu qui passe
au-dessus, un texte tronqué — aucun ne lève d'exception, aucun ne rougit une CI,
et tous se voient en une seconde sur une image.

**UNE CAPTURE DU PRODUIT PÉRIME À LA PREMIÈRE REFONTE DE L'ÉCRAN QU'ELLE MONTRE**
*(2026-09-22)*. Les deux captures de la section « Tout votre suivi » de l'accueil
RenoBoost (`RenoBoost/assets/produit/`) ont été tirées le 19/09 par
`RenoBoost/scripts/capturer-console.mjs`. Le 21/09, quatre paliers ont refondu le
dashboard qu'elles montrent — navigation, palette, fiches clients. Personne n'a
relancé le script : l'accueil en production a affiché **l'interface d'avant**
pendant un jour et demi, sous la mention « Le produit réel ». *Ce que ça a coûté* :
Paul l'a vu lui-même, capture à l'appui — « je croyais qu'on avait corrigé
cela ». Aucun test ne pouvait le voir : une image périmée est une image valide.
*Règle* : **toute boucle qui change un écran photographié relance l'atelier de
capture dans le même lot**, et le dit dans son commit. Le script existait
précisément pour ça (« le jour où la console change, on relance ») ; ce qu'il
manquait, c'est le geste attaché à la boucle, pas l'outil.

**LA PORTÉE D'UNE GARDE FAIT PARTIE DE LA GARDE — UN MÉCANISME QUI TIENT UNE
INSTANCE NE TIENT PAS LA RÈGLE** *(2026-09-30)*. Paul demande d'élaguer ce
fichier. Le plan : archiver toute leçon qu'un mécanisme **vérifié** tient déjà —
une règle rendue mécanique n'a plus besoin d'occuper l'attention de chaque
ouverture de séance. Mesuré sur les 145 entrées : **73** citent un mécanisme
(harnais, sonde, contrainte, garde-fou) · **14** en **nomment** un · **2** ont
leur règle tenue par une garde nommée et prouvée en la cassant · **0** sont
archivables. Les deux survivantes portent **plus loin que leur garde** : l'une
est tenue sur les quinze feuilles d'un seul dépôt, l'autre sur deux documents
d'un autre, tandis que leurs règles — « une couleur se juge relativement à son
fond » et « un renvoi mort se lit comme un renvoi valide » — valent partout. Les
retirer perdrait une règle générale pour se protéger d'un défaut local.

⛔ **Le proxy « la leçon cite un harnais » est faux dans les DEUX sens**, et
c'est ce qui rendait la passe nécessaire plutôt que déductible. Faux positif :
la plupart citent un harnais en **racontant la panne** (« le harnais restait
vert »), pas en nommant une garde qui la retient. Faux négatif : une règle peut
être tenue par une contrainte SQL qui n'emploie jamais le mot « test ». Et les
**59** qui disent « corrigé par un harnais » sans dire lequel sont
**invérifiables par construction** — donc inarchivables, quoi qu'elles tiennent.

⚠️ **Ce que la passe a coûté, et qui n'était pas dans son périmètre.** Le pied
du rappel d'ouverture — la première chose que lit une séance décidée à régler le
problème — prescrivait : « c'est le FICHIER qui doit être élagué, jamais cette
borne qui doit être levée ». La route qu'il désigne a été parcourue : elle rend
0. Pendant ce temps la borne mordait, et **78 leçons sur 145 n'atteignaient
aucune séance sur aucun des dix dépôts** — dont « le lien se pose en fin de
message », que Paul a dû redemander le 25/09 **puis** le 30/09. Une instruction
périmée dans le fichier qu'on lit en premier coûte plus cher qu'une instruction
absente : on la croit, et on refait le trajet. Borne levée à 200 000 le 30/09
sur décision de Paul, avec sa mesure inscrite au-dessus.

⊕ **ET UN FAIT HISTORIQUE NE SE DÉRIVE PAS D'UNE VARIABLE VIVANTE** — trouvé en
sabotant, dans le correctif lui-même. La ligne qui annonce la levée était
écrite `` `60 000 → ${MAX_OCTETS}` `` : sous une borne volontairement abaissée
pour éprouver la coupe, elle affichait « 60 000 → 40000 », un **abaissement
présenté comme une levée**. L'état courant se dérive ; une date et un chiffre
passés s'écrivent. ⚠️ Le défaut n'était visible que du côté où la garde devait
mordre — jamais dans le cas nominal.

**UN PUSH NE SE FAIT PAS SUR UN RÉSULTAT DE TESTS QU'ON N'A PAS LU** *(2026-10-03,
RenoDevis)*. `a992765` est parti avec un test rouge : le plafond d'ombres
(`shadow-lg` au-dessus de la limite), dans une sortie de plusieurs centaines de
lignes que j'ai fait défiler sans lire sa dernière. Corrigé dans `7856f6b`, au
prix d'un aller-retour de CI. ⛔ Même famille que la sortie redirigée vers
`/dev/null` (famille 1) : la mesure existait, personne ne l'a lue. ⇒ *Mécanisme,
pas vigilance* : le push est conditionné au CODE DE SORTIE des tests, le
journal gardé et sa fin relue — `npm test > /tmp/t.log 2>&1; c=$?; tail -5
/tmp/t.log; [ $c -eq 0 ] && git push`. ⚠️ Pas de `grep` sur une ligne de bilan :
chaque dépôt a son format (TAP `# fail 0` ici, « N/N suites réussies » dans
Ultima), et un tube jette le code de sortie de `npm test`.


**« CONNECTÉ » N'EST PAS « PROPRIÉTAIRE »** *(2026-10-04, Ultima — Finubar)*.
`requireUser` vérifie qu'un jeton est valide, pas À QUI il appartient. Mesuré le
04/10 : l'inscription au projet d'authentification d'Ultima est OUVERTE (e-mail
et Google). `/api/finubar` servait donc la feuille de route de toute l'activité
à n'importe quel compte créé en une minute. La vérification « inscriptions
fermées ? » figurait dans le grain Finubar depuis le 20/08 — **notée, jamais
mesurée** : six semaines d'exposition derrière une ligne de liste.
⇒ *Règle* : une route qui sert une donnée du SEUL propriétaire passe par
`requireProprietaire` (`Ultima-/api/_lib/proprietaire.js`, fermé par défaut), pas par
`requireUser` ; une vérification de sécurité notée se MESURE dans la séance qui
la note — une ligne « à vérifier » se lit comme un contrôle fait.

**UN DÉTECTEUR NE VOIT QUE CE QU'ON LUI A DONNÉ À VOIR** *(2026-10-04, Ultima — ZOH SHIA)*.
Le scanner de noms propres du code neutre rendait « 0 » sur un arbre qui portait
encore `reglesSola` (une bosse de chameau échappe au mot entier) et **265**
« Paul » dans le code et à l'écran (« Envoyer à Paul ») : les noms de l'équipe
n'étaient pas dans sa liste. Un 0 juste sur sa liste, faux sur l'intention.
⇒ *Règle* : un détecteur s'éprouve sur les FORMES que prend ce qu'il cherche
(casse, bosse de chameau, préfixe, nom de fichier) ET sur la question « qu'est-ce
qu'il ne cherche pas ? » — la relecture adverse du résultat compte autant que le
résultat.


**UNE CI VERTE N'EST PAS UNE REVUE FINIE — ON LIT LE VERDICT DE LA RELECTURE
AUTOMATIQUE AVANT DE FUSIONNER** *(2026-10-06, Ultima #355 puis RenoBoost #585)*.
La relecture Codex démarre quand la PR quitte le brouillon et rend son verdict
quelques minutes APRÈS les tests unitaires. Le 06/10, Ultima #355 a été fusionnée
CI verte, revue en cours : deux constats sont arrivés après coup, et il a fallu
une PR de plus (#357) — qui en a reçu trois autres. Le même jour, sur RenoBoost
#585, la CI était entièrement verte (unitaires + navigateur) et la revue a trouvé
**deux défauts de cloisonnement réels** : une erreur 400 rejouée en « adresse
seule », et un `_` joker de `ilike` qui pouvait évincer le lien manuel — chacun
aurait pu livrer à un artisan les chantiers signés d'un autre. Aucun test ne les
voyait : ils ne s'exerçaient que sur des données que les tests ne fabriquaient pas.
*Ce que ça a coûté* : une PR de correction sur Ultima ; sur RenoBoost, rien —
parce que, cette fois, on a attendu.
⛔ **La règle** : sur un dépôt où la relecture automatique tourne, la preuve
d'intégration d'une fusion = CI verte **ET** verdict de la revue lu sur le SHA
exact (« 👍 » ou constats traités). Un constat corrigé change le SHA, donc
**rend caduc l'accord de fusion** : on redemande, on ne fusionne pas sur l'ancien go.
⚠️ Et un correctif poussé ne relance PAS la revue : seul « draft → ready » ou un
`@codex review` la déclenche. La revue du nouveau SHA, si elle compte, se demande.

**UN CONTRÔLE EN BOUT DE CHAÎNE NE RELIT PAS UNE SOURCE VIVANTE — IL ALERTE, IL NE
BLOQUE PAS UN ACTE DÉJÀ VALIDÉ** *(2026-10-08, RenoDevis #304)*. L'envoi d'un devis
relisait la bibliothèque de prix du JOUR pour revérifier la marge. Le 08/10,
`RR-20261006-8926`, validé par l'artisan, a été refusé à l'envoi : « Marge SOLA non
vérifiable ». Les prix d'achat existaient pourtant, mais rangés sous les codes du
distributeur (`SUZM71VA`, `PEAD-M71JA3`) et non sous les références fabricant du
devis (`SUZ-M71VA2-TH`, `PEAD-M71JA2`) : un rapprochement EXACT, voulu sans
approximation, rendait invisible une donnée présente. *Ce que ça a coûté* : un devis
client bloqué un matin, une séance de diagnostic, et Paul : « ça sabote l'outil ».
⛔ **La règle** : un contrôle qui relit une source modifiable par ailleurs
(bibliothèque, tarif, règle) se fait à la CRÉATION ; à l'acte final il ALERTE, il
ne bloque que sur ce qui est propre au document (sa TVA confirmée, son émetteur).
⚠️ Et avant de dire « la donnée manque », chercher sous quel autre nom elle existe :
« 0 achat sur la référence » n'est pas « 0 achat ».

**UN SCHÉMA STRICT SUR LE FORMDATA ENTIER D'UNE ACTION REACT REFUSE TOUT**
*(2026-10-08, RenoDevis #310)*. React 19 ajoute au FormData d'une action serveur
ses propres champs — `$ACTION_REF_1`, `$ACTION_1:0`, `$ACTION_1:1`,
`$ACTION_KEY`, mesurés au navigateur. `Decision.safeParse(Object.fromEntries(formData))`
avec un schéma `.strict()` refusait donc CHAQUE envoi : sur « Prix d'achat à
relier », « Relier » et « Écarter » répondaient « Demande invalide », pendant que
tsc, les tests et le build restaient verts. *Ce que ça a coûté* : un écran
inutilisable, trouvé par Paul sur capture. ⛔ **La règle** : une action serveur
lit ses champs PAR NOM (`lireChamps(formData, CHAMPS)`,
`RenoDevis/lib/formulaires.ts`) et le schéma strict ne juge que ce qu'elle a lu ;
`RenoDevis/lib/formulaires.test.ts` interdit `Object.fromEntries(form…)` dans
les fichiers `"use server"`. Même famille que « la valeur ne se porte jamais sur
le bouton » : la sérialisation d'un formulaire ne s'éprouve qu'au navigateur.

**UN HARNAIS VISUEL NE VAUT QUE DANS LE CADRE OÙ PAUL REGARDE** *(2026-11-03, Ultima,
écran ZOH « DEVIS & PAIEMENT »).* `smoke-carte-celeste` était vert, et l'écran a été
annoncé bon. Sur l'iPhone de Paul, une étoile était posée dans le nom de sa voisine, les
noms s'empilaient et un nom était coupé. Le harnais ne mesurait que les traits, pas les
noms entre eux, et en 390 × 844, alors que Safari ne laisse qu'environ 390 × 664 à la
page : à ce format seulement, le défaut se reproduisait.
*Ce que ça a coûté* : une PR de plus (#436), un aller-retour de captures, et une annonce
fausse faite à Paul.
⇒ Un contrôle d'affichage se mesure au format réel du téléphone (390 × 664 mobile pour un
iPhone sous Safari), et sur ce que l'œil lit — chevauchements, éléments posés sur un
texte, textes coupés —, pas seulement sur ce que le code dessine. Il s'étalonne sur la
capture du défaut avant d'être cru : il doit virer au rouge sur elle. Sans la capture de
Paul au bon format, « vert » se dit « vert en simulation », jamais « l'écran est bon ».

*Rechute du 2026-11-03 (Ultima, #440)* : le format réel du téléphone, c'est aussi **ses
unités**. À 390 × 664, Chromium donne `100vh` = `100dvh` ; Safari iOS, barres déployées,
donne `100vh` ≈ 740 px (grand viewport) pour 664 visibles. Un `min-height: 100vh` du
plateau l'emportait sur `height: 100dvh` : le ciel débordait sous la barre, dernier nom
coupé — invisible au harnais vert de #436. La note de reprise accusait le cadrage de
`Ultima-/js/ciel.js` : diagnostic écrit avant la mesure, et faux. *Ce que ça a coûté* : une PR de
plus et un diagnostic à refaire. ⇒ Simuler Safari en **substituant ses unités dans les
vraies feuilles** (vh/lvh → grand viewport, dvh/svh → visible), comme le bloc « Safari
iOS » de `Ultima-/tests/smoke-carte-celeste.mjs` ; une cause écrite dans un prompt de reprise est une
hypothèse tant qu'elle n'est pas reproduite.

**UN TEST VERT N'EST PAS UN GARDE-FOU TENU — IL FAUT LE CASSER ET VOIR LE MESSAGE
CHANGER** *(2026-11-05 → 07, RenoDevis)*. Quarante gardes du parcours SOLA, de la
signature par code, de l'envoi au client et du moteur de relance affichaient vert.
Passées sous le harnais de sabotage `RenoDevis/tests/sabotage/saboter.mjs` — un garde cassé à la fois,
chaque liste ouverte par un témoin SANS mutation —, cinq étaient vertes pour une
raison qui n'était pas la leur : deux doublées en amont par une autre garde, une qui
n'agit qu'avec pièce jointe, une inatteignable dans le suivi V2, une dont le refus
venait d'un contrôle plus haut. Aucune n'était fausse ; aucune ne prouvait ce qu'on
croyait. Et l'instrument lui-même a menti deux fois dans la même passe : son témoin
SQL a viré au rouge parce que le serveur PostgreSQL local était arrêté, pas parce
qu'un garde avait cédé — un faux rouge se lit comme une trouvaille ; puis un
paramètre par défaut introduit pour rendre le transport injectable
(`envoyer = envoyerEmailDevisPrepare`) a cassé un test bac à sable qui ne charge pas
le module d'envoi, alors que le correctif visait les tests.
*Ce que ça a coûté* : une demi-journée de passes à requalifier, et cinq garde-fous
qu'on aurait continué à compter comme tenus.
⇒ Trois règles, et la troisième est la plus chère. (1) Un garde ne compte comme tenu
que si, SOUS SA MUTATION, le harnais vire au rouge **sur son propre message** — un
rouge dont la cause est l'environnement ou une autre garde ne prouve rien ; d'où le
témoin sans mutation en tête de chaque liste, qui doit rester vert. (2) Une garde
verte sous mutation se déclare `tolere` avec sa raison écrite, jamais retirée en
silence : « doublée en amont » est un fait à consigner, pas un échec à cacher.
(3) Un correctif posé POUR les tests se juge sur la production : une valeur par
défaut résolue à la signature de la fonction s'évalue même quand l'appelant ne
l'utilise pas — la résoudre au point d'usage (`envoyer ?? envoyerEmailDevisPrepare`)
laisse les bacs à sable tranquilles.

## 3. Ce qu'on donne à Paul

**UN BROUILLON PRÊT CHEZ L'AGENT N'EST PAS PRÊT CHEZ PAUL**
*(2026-10-29, RenoDevis).* Texte gardé dans le navigateur et sélection des pièces non durable : il a fallu copier le message dans deux notes privées et demander une nouvelle sélection. Cinq PDF étaient préparés ; l'archive finale en joint deux, les trois autres restant accessibles par le lien. La cause exacte de la sélection finale n'est pas établie. Coût constaté : reprises manuelles et écart entre préparation annoncée et mail envoyé, sans document devenu inaccessible. ⇒ Avant « prêt à envoyer », éprouver la reprise du même brouillon dans une autre session, puis rapprocher message, destinataires, versions et pièces de l'aperçu final. Sinon nommer précisément ce qui reste local ; une note de secours n'est pas un brouillon partagé.
Méthode neutre : `Ultima-/zohshia/renodevis/TECHNO.md`, « Retour d'usage du 29 octobre 2026 » (R29-01 à R29-10).

**UNE LIVRAISON TECHNIQUE NE SOLDE PAS LES DEMANDES UTILISATEUR**
*(2026-10-22, Artidispo ; retour d’Henry transmis par Paul)*.
Après la PR Artidispo #161 (production `1dff4af9984abeede98055734f28338e5e473884`),
995 tests réussis et des parcours navigateur vérifiés, « toute la refonte validée
est en production » a donné à Paul une impression de clôture trop large.
Le retour a rouvert les points 1 (métiers), 9 (lieux) et 10 (cohérence visuelle).
Coût constaté : une relecture supplémentaire demandée à Henry puis une reprise
de cadrage par Paul ; aucune perte financière chiffrée ou rendez-vous perdu prouvé.

Cause : absence de rapprochement explicite entre les demandes numérotées et les
preuves. Le nominal « climatisation + 69130 » et la lisibilité ont été vérifiés,
mais pas toutes les formulations métier, la ville libre, `69000`, ni la continuité
avec l’accueil artisans. Les tests étaient verts sur leur périmètre réel.
Contre-épreuve publique : SOLA trouvé pour « climatisation + 69001 », absent pour
« panneau photovoltaïque », « pompe à chaleur » et « PV » ; `69000` refusé.
« Photovoltaïque + 69001 » a rendu 503 sur un essai : cause non établie,
à distinguer d’un résultat vide.

⇒ **Avant de conclure, relier chaque demande originale à son identifiant,
au comportement attendu, à la version, à la preuve et à l’état : réussi,
échoué, bloqué, reporté explicitement ou non applicable justifié.**
Un nombre de tests ne mesure pas cette couverture. Un point bloquant ouvert
interdit « tout est terminé » ; les limites se disent à côté des succès.
Rejouer les mots et les enchaînements réellement utilisés par le testeur,
et comparer les écrans successifs, pas seulement chaque page isolée.

Limites : une nouvelle demande après la validation ne devient pas
rétroactivement une régression ; dater sa réception et vérifier son périmètre.
Une panne de service n’est ni une absence d’artisan ni la preuve d’un défaut de
synonymes. L’apprentissage n’étend aucun droit et n’active aucun automatisme.

**UNE PAGE REFONDUE L'EST AUSSI DANS SON APERÇU DE PARTAGE** *(2026-10-17, RenoBoost)*.
L'accueil a été réécrit et fusionné (#608) sans relire ses balises `og:*` ni son `og-image.jpg`.
Paul a envoyé le lien à un contact sur WhatsApp : l'aperçu affichait « Des chantiers signés, pas
des promesses. » — la promesse interdite depuis le 11/09 (§12.2) — et « Régie commerciale ».
Les tests gardaient le texte RENDU de la page ; rien ne lisait ce qu'elle dit quand on la partage.

⛔ **Une refonte de page publique relit, dans la même boucle, `<title>`, `description`, `og:*`,
`twitter:*`, JSON-LD et l'IMAGE de partage — tout ce qu'un lien affiche sans que la page soit ouverte.**

⇒ **Garde posé : `RenoBoost/tests/partage.test.mjs` (interdits + image versionnée `?v=`) et
`scripts/generer-og-image.mjs` (image régénérée, refuse une promesse interdite). L'aperçu déjà
envoyé ne se rattrape pas : WhatsApp le fige à l'envoi.**

**UN CHIFFRAGE SE FAIT AVEC LA RÈGLE CODÉE, PAS AVEC LA PREMIÈRE RÈGLE TROUVÉE** *(2026-10-09, RenoBoost + RenoDevis)*.
Devis SOLA de deux monosplits : rendu trois fois avec des prix différents. ① Prix LN35 « introuvables »
alors que la banque produits (`banques_reno`) les portait — je n'avais fouillé que `corpus_devis`.
② Prix de vente posés à l'écart « +200/+300 » observé sur un autre produit, puis à « achat × 1,35 »
lu dans `RenoDevis/outils/corpus/banque.py` — l'ancien plancher. La règle réelle (marge totale 50 %, presta
à prix fixe) était codée dans `RenoDevis/lib/reglesSola.ts:calculerPrixSola` ; Paul a dû la
rappeler, après qu'une première version était déjà partie chez l'artisan.

⛔ **Un prix donné à Paul vient de la fonction qui le calcule en production, appelée sur les vraies
données — jamais d'un plancher, d'une note ou d'une marge observée ailleurs.**

⇒ **Avant tout chiffrage : chercher la fonction de prix du dépôt (`grep -rn "calculer\|tarif"
RenoDevis/lib/`), l'exécuter, et ne fouiller les données qu'ensuite, dans TOUTES les tables qui en portent.**
⊕ **ET LE DOCUMENT SORT DU GABARIT DE L'ARTISAN** *(2026-10-10, RenoDevis — devis SOLA
2 gainables)*. Un tableau HTML maison puis un PDF générique ont été livrés comme « devis » —
*« Utilise le devis Sola, jamais un truc comme ça »* — avant le générateur réel
`RenoDevis/lib/pdfSola.ts`. Puis trois refontes : pose à 800 €/j au lieu des 500 € HT la
demi-journée, apport d'affaires oublié (PU produits × 1,10, pose jamais majorée), et un prix
Koolnova donné pour sûr alors que la note interne du devis repris (`extra.note_privee`) le disait
ESTIMÉ. ⇒ **Le prix vient de la règle exécutable (`RenoDevis/lib/tarificationSola.ts` →
`tariferLignesSola`, qui appelle `calculerPrixSola`) ; `RenoDevis/docs/SOLA-MATRICE-20261001.md` en
donne le contexte métier, il ne la remplace pas. Gabarit + règle + note interne lus avant le premier
chiffre, et « apport d'affaires : oui/non ? » demandé d'emblée si rien ne le dit.**

**RIEN DE CE QUI EST DONNÉ À PAUL N'EST DÉDUIT** *(2026-09-02, directive EL)*.
Toute valeur qu'il va cliquer, taper ou croire — URL, chemin, identifiant,
chiffre, nom de fichier, état d'un service — est **lue à sa source**, et sa
provenance peut être citée. ⛔ Une déduction vraisemblable présentée comme un
fait est pire qu'une invention : elle se lit exactement comme le reste, donc
rien ne la signale. Trois conduites, sans exception : je l'ai lue, je la donne ;
je ne **peux** pas la vérifier, je le dis **avant** la valeur ; je ne la sais
pas, je cherche. *Incident fondateur : un nom de projet Vercel transformé en URL
de production et donné comme vérifié, alors que le vrai domaine était écrit à
quatre endroits du dépôt.*
*Rechute du 2026-11-03 (Artidispo)* : une adresse d'aperçu Vercel a été **composée** à partir
du nom de la branche (`artidispo-git-<branche>-…vercel.app`) et donnée à Paul. Vercel
tronque et hache les noms longs (`…git-claude-parcours-p-31a286-…`) : le lien menait nulle
part. ⛔ L'adresse d'un aperçu se **lit** dans le commentaire du bot Vercel sur la PR ou dans
`list_deployments`, jamais en recollant des morceaux qui ont l'air d'en faire une.

**TOUJOURS LES LIENS DE CE QU'IL Y A À VÉRIFIER** *(2026-08-17)*. Dès qu'un
travail est poussé, donner **la liste des liens cliquables** de tout ce que Paul
peut aller voir, **et ce qu'il faut regarder sur chacun**. Un lien par page
concernée, pas un lien générique vers la prévisualisation. *Une prévisualisation
sans adresse précise l'oblige à chercher lui-même ce qu'on vient de modifier :
c'est du travail rendu à moitié.* Quand une page n'est pas encore vérifiable, le
dire au lieu de donner un lien qui ne montrera rien.

**UNE MODIFICATION VISUELLE SE DONNE EN PREVIEW, PAS EN DESCRIPTION**
*(2026-09-22)*. Dès qu'un travail touche à ce qui se VOIT — page publique,
galerie, thème, maquette — Paul reçoit **l'adresse de la prévisualisation
déployée**, spontanément, dans le message qui annonce le travail. Et cela vaut
aussi **avant** : une modification visuelle seulement PRÉVUE se **montre** avant
d'être débattue — une option décrite en trois paragraphes se juge mal, la même
option affichée se juge en trois secondes. ⚠️ Les captures ne remplacent pas la
preview : elles figent une largeur, un thème et un état, et c'est l'état figé
qu'on croit. Elles la complètent. ⛔ Et le lien se **vérifie avant d'être donné**
(règle ci-dessus) : sur ces environnements, `curl` vers un domaine `*.vercel.app`
est refusé par le proxy sortant — la lecture passe par l'outil Vercel
`web_fetch_vercel_url`. *Incident : dix photos publiées dans une galerie, deux
captures envoyées, trois lots proposés à l'arbitrage — et Paul a dû réclamer
« préview stp ».*
⊕ **ET LE LIEN SE POSE EN FIN DE MESSAGE, SEUL, CLIQUABLE** *(2026-09-25, demandé
par Paul)*. La preview était donnée — mais au milieu du rapport, dans une
parenthèse, avec la PR à côté. Paul : *« j'aimerais bien qu'en fin du message
tu me mettes le lien, je clique directement dessus […] j'en ai marre de devoir
scroller ou de récupérer des choses un peu plus loin »*. ⛔ Un lien qu'il faut
chercher est un lien qu'on ne clique pas : le geste attendu de Paul est un
clic, pas une lecture. *Règle* : dès qu'un message appelle un regard sur une
preview, une PR ou un écran, **sa dernière ligne est l'URL nue** — rien après,
rien autour, une par message quand une seule suffit. Le rapport se lit
au-dessus ; l'adresse se clique en bas. Même logique que le prompt de reprise
(un bloc copiable en dernier) : ce que Paul doit *prendre* se met là où sa main
arrive, pas là où le récit en parle.

**UNE QUESTION REMONTÉE À PAUL DOIT ÊTRE UN CHOIX, PAS UNE ENQUÊTE NON TERMINÉE**
*(2026-08-17)*. Un arbitrage produit avait été annoncé ; c'était un diagnostic
arrêté trop tôt, et un seul geste l'a réglé. Un arbitrage se pose quand **deux
options tiennent également debout**. Sinon c'est du travail à finir, et le
déléguer à Paul lui coûte une décision qui n'existe pas.

**UNE CONSIGNE CONDITIONNELLE EST UN MANDAT, PAS UNE QUESTION** *(2026-08-04)*.
Quand Paul formule une consigne qui contient déjà sa règle de décision — « si ce
n'est pas nécessaire, supprime » — il délègue la **vérification**, pas
l'arbitrage. Vérifier factuellement, appliquer sa règle au constat, agir, rendre
compte du constat **et** de l'action. Lui renvoyer une question à choix multiples
lui redemande ce qu'il vient de trancher. *Incident : deux PR à évaluer, une
question posée au lieu de vérifier et agir ; Paul n'a pas répondu, temps perdu.*

**UN OUTIL QUI RÉPOND « INTROUVABLE » NE PROUVE PAS QUE LA CHOSE N'EXISTE PAS**
*(2026-09-11)*. « Je ne l'ai pas trouvé » et « ce n'est pas là » sont deux
constats différents, et le second ne se déduit jamais du premier. Un droit
manquant, un jeton à portée trop étroite, un proxy qui refuse : tous rendent le
même silence qu'une absence réelle. ⛔ Rapporter une absence exige d'avoir
éliminé l'aveuglement, sinon on livre un diagnostic inversé — et il se lit comme
un fait. *Incident : l'identifiant du projet Vercel écrit dans la roadmap
répondait 404 ; je l'ai rapporté en laissant entendre que le projet avait
disparu. Le bot Vercel a donné la vérité une heure plus tard : le projet était
vivant, avec exactement cet identifiant, dans exactement l'équipe interrogée —
mon jeton n'avait pas de portée dessus. La roadmap avait raison depuis le début,
et j'avais jeté le doute sur elle.* La formulation juste existe et ne coûte rien :
« je ne peux pas le vérifier avec mes accès », avant la valeur.

**CE QUE PAUL DÉSIGNE SE LIT EN ENTIER — IMAGES COMPRISES — AVANT D'INTERPRÉTER
OU DE CONCLURE À UNE ABSENCE** *(2026-09-30, RenoBoost + RenoDevis)*. Quand Paul
nomme une source (« la maquette », « les deux PDF de la présentation »), elle
passe avant toute lecture de mémoire : un nom propre qu'il dicte se cherche
d'abord **dedans**, et « ce n'est noté nulle part » ne se dit qu'après l'avoir
lue page par page, captures d'écran comprises. ⛔ Une interprétation
vraisemblable se lit exactement comme une lecture juste.
*Incident, deux fois dans la même séance : « Kelvin » a été lu comme l'agenda
(Calendly) alors que c'était kelvin°, l'outil montré dans la maquette — une
adresse, une vue aérienne, la maison en 3D par pièce. Paul a dû corriger :
« c'est déjà en stock, recherche bien ». Et la déchèterie la plus proche a été
déclarée « jamais notée nulle part » alors qu'elle figurait sur l'écran 1 de la
maquette : l'image n'avait pas été lue. Il a fallu corriger Notion et le cadrage.*

**UN CHEMIN CRITIQUE SE MESURE, IL NE SE RAISONNE PAS** *(2026-09-13)*. Dire à
Paul « fais X d'abord » est un livrable au même titre qu'une URL ou un chiffre :
c'est une valeur qu'il va **croire et exécuter**, donc elle se lit à la source.
⛔ Un ordre de priorités déduit de ce qu'on vient de coder est un biais, pas une
analyse — on met en tête ce qu'on a en tête. *Incident : j'ai donné deux fois
« poser les variables Gmail » comme priorité n°1 du chemin critique, parce que
le lot que je venais de livrer portait dessus. Une requête sur les 13 devis a
montré l'inverse : les 10 devis de la voie email n'ont ni montant ni lien, donc
Gmail alimente la RELANCE et pas l'ENCAISSEMENT ; le jalon « premier euro » ne
tenait qu'à deux gestes Stripe, sur un devis déjà signé à 4 572,70 €. Paul
n'avait pas encore agi — la facture aurait été un geste inutile posé en premier.*
Le geste juste tient en une requête : **avant d'ordonner des priorités, demander
à la base où est réellement le blocage.**

**UNE AFFIRMATION SUR UNE CIBLE QUI BOUGE PÉRIME ENTRE L'ÉCRITURE ET LA LECTURE**
*(2026-09-11)*. Écrire « CI verte » dans un corps de PR le rend vrai pour la tête
de ce moment-là, pas pour celle que Paul lira. Le document survit à la mesure.
⛔ Ce qui se dit d'un objet mouvant se DATE ou se rattache à son identifiant :
« verte sur `50aa0a4` », pas « verte ». *Incident : la mention est restée exacte
pour la tête de code et fausse deux minutes pour la tête courante, le temps d'un
commit de documentation. Repéré et dit avant que Paul ne le lise — mais c'est le
hasard du calendrier qui l'a permis, pas la méthode.*

**UN LIEN REMIS À UN TIERS DOIT SURVIVRE À CE QU'ON S'APPRÊTE À FAIRE DU DÉPÔT**
*(2026-09-11)*. Paul voulait envoyer le site SPC à un avis extérieur. Je lui ai
donné l'**alias de branche** de la préversion Vercel — vérifié vert à l'instant
où je le donnais, et condamné à mourir à la fusion de la PR, que Paul a demandée
au message suivant. Rattrapé de moi-même avant l'envoi, mais de justesse : entre
les deux messages, le lien pouvait déjà être parti chez son destinataire. Ce qui
se remet est l'**URL immuable du déploiement**, qui ne dépend d'aucune branche ;
l'alias de branche ne sert qu'en interne. *Un lien vert à l'instant du contrôle
n'est pas un lien qui tiendra : ce qui s'éprouve, c'est sa durée de vie face aux
gestes DÉJÀ PRÉVUS sur le dépôt — c'est la famille du garde-fou qu'on n'éprouve
que du côté qu'on emprunte tous les jours.*

**UNE AUTORITÉ QUI NOMME LE CHAMP SANS NOMMER LE FICHIER FAIT CHERCHER — ET ON
TROUVE UN LEURRE** *(2026-09-13)*. La garde de publication d'artisan-builder
nommait `legal.assureur` et les deux champs de décennale ; le document de
passation la désignait comme l'autorité (« demandez à la garde, pas à un
document ») ; et aucun des deux ne disait dans quel fichier les poser. Une séance
d'épreuve a ouvert `artisan-builder/mentions-legales/page.tsx` — réflexe naturel — qui AFFICHE
les trois champs sans être l'endroit où on les écrit, puis a dû lancer un `grep`
pour trouver `artisan-builder/content.ts`. *Un diagnostic qui n'indique pas l'endroit n'est pas
terminé, et le premier endroit qu'on ouvre est souvent celui qui affiche, pas
celui qui définit.*

**UNE LISTE DE « CE QU'IL RESTE À OBTENIR » SE PÉRIME ; UNE MESURE NON**
*(2026-09-13)*. Le README de SPC réclamait sept champs légaux dont **quatre
étaient déjà renseignés depuis six jours**, par un NB situé deux paragraphes plus
haut dans le même fichier. Une séance qui la suivait s'est vue renvoyée collecter
une information déjà collectée — exactement la dérive dont ce README se plaignait
lui-même. *Remplacer la liste par la commande qui la rend, et dater ce qui reste
écrit.*

**FAIRE RELIRE SON TRAVAIL PAR UNE IA ADVERSE MARCHE — À CONDITION DE RE-LOCALISER
CHAQUE CONSTAT AVANT D'AGIR** *(2026-09-13, première fois que le dispositif est
éprouvé)*. Paul a fait tourner chez ChatGPT le prompt adverse que j'avais écrit
contre le PDF de la boussole. Le retour — 17 exigences ancrées page par page —
a trouvé **quatre défauts réels que je n'avais pas vus**, dont deux dans du code
en production : `Number(m.monthlySearches)` fabriquait un zéro depuis `null`, et
`generateKeywordIdeas` n'était pas paginé (une page courte se lisait comme la
fin d'une collecte). Il a aussi corrigé une arithmétique que je venais de
publier. ⇒ **Le dispositif vaut d'être refait.**

⛔ **Mais une revue qui n'a pas exécuté le code décrit le DOCUMENT, pas le
SYSTÈME.** Sa toute première exigence demandait de « supprimer ce modèle
×1,22 **dans le moteur** » : il n'y était pas — il ne vivait que dans le
générateur du PDF et dans le cadrage. Appliquer le constat là où il le disait
aurait fait chercher, puis modifier, du code qui n'existait pas. De même, cinq
de ses dix-sept exigences portaient sur un outil **non encore écrit** : ce sont
des spécifications, pas des correctifs, et les traiter comme des bugs aurait
ouvert un chantier de plusieurs semaines sous l'étiquette « corriger ».

*Le geste qui rend une revue externe exploitable tient en trois colonnes, et il
se fait AVANT la première ligne de code :* **où est-ce vraiment** (grep, pas
mémoire) · **est-ce un défaut actif, une spec, ou déjà résolu** · **qu'est-ce
que ça casse concrètement**. Sans ce tri, on hérite du plan de quelqu'un qui
n'a pas ouvert le dépôt. ⚠️ Et ce tri ne dévalue pas la revue : c'est parce
qu'elle ignore le dépôt qu'elle attaque ce que l'auteur ne peut plus voir.

**ON FAIT RELIRE CE QUI A ÉTÉ ÉCRIT AVEC INTENTION, PAS CE QU'ON DOUTE**
*(2026-09-13, corollaire du précédent)*. Les trois cibles que j'avais moi-même
désignées comme les plus faibles dans le prompt adverse (les fragments de
dictée, l'ordre du pre-mortem, la veille indéfinie) ont donné des retours
**justes mais attendus** — je les avais déjà nommées. Les quatre vraies
trouvailles sont venues d'endroits que je n'avais pas signalés, parce que je les
croyais bons. *Désigner ses points faibles à un relecteur oriente son attention
vers ce qu'on sait déjà ; la valeur est dans ce qu'on ne pense pas à lui
montrer. Le prochain prompt adverse ne nommera donc pas mes doutes : il exigera
une passe exhaustive sur ce que j'affirme le plus tranquillement.*

---

---

**« BLOQUÉ SUR UNE RÉPONSE DE PAUL » SE RE-MESURE AVANT D'ÊTRE ANNONCÉ**
*(2026-09-19)*. J'ai écrit trois fois, sur deux séances, que la FAQ de la vitrine
« attendait trois réponses de Paul » — la granularité de zone, le mécanisme du
no-show, la liste des métiers. C'était **faux**. La maquette avait absorbé les
trois arbitrages le jour où ils avaient été pris : la zone « se définit ensemble
au premier rendez-vous », la question du no-show avait été réécrite pour promettre
le rappel et non une compensation, et « un seul partenaire par métier » ne demande
aucune liste. Trente secondes de lecture du fichier l'établissaient.

⛔ **Le coût n'est pas l'erreur, c'est ce qu'elle fait faire à Paul.** Sur la foi
de cette note, je lui ai posé une question d'arbitrage qu'il n'avait pas à
trancher — il avait déjà tout tranché. Un blocage annoncé à tort ne se paie pas
en secondes : il déplace un travail vers la seule personne qui ne peut pas le
déléguer, et il peut faire reporter un lot entier.

⚠️ **La forme du piège** : une note de blocage est écrite au moment de la
DISCUSSION d'arbitrage, donc avant que le travail ne l'absorbe. Elle est vraie
quand on l'écrit et périmée quand on la relit — comme une couleur fixe, comme un
grain Finubar. *Règle* : avant d'annoncer qu'une chose attend Paul, on ouvre le
fichier qui la porte. « Ça attendait hier » n'est pas une mesure.

**UNE LIGNE QUI SURVIT À SA RÉSOLUTION COÛTE PLUS CHER QUE PAS DE REGISTRE —
TROISIÈME FOIS** *(2026-09-19)*. `RenoBoost/ACTIONS-PAUL.md` porte sa propre
règle en tête : *« une ligne disparaît quand elle est faite, pas avant »*. Un
balayage a trouvé **quatre lignes** qui y survivaient — dont §3 bis, « le récap
ne voit rien », ouvert le 21/08 et **résolu depuis dix-sept jours** : le
battement en base disait `envoye: true`, `briquesEnErreur: 0`. Pendant dix-sept
jours, le fichier a réclamé à Paul un geste de deux minutes qui n'avait plus
lieu d'être, et listait trois causes probables toutes fausses. Même chose pour
une déduplication d'alertes écrite, testée et **en production**, encore
annoncée « non fait ». ⛔ **C'est la troisième fois que ce défaut est trouvé
dans ce fichier** — les deux premières le même jour, le 13/09. Une règle qu'on
réécrit sans changer le geste ne tient pas. *Règle* : un registre ne se croit
pas, il se **mesure**, et le moment où on le mesure est le moment où le fait
tombe — pas la relecture d'après. Corollaire pratique : quand on ouvre un
registre pour y chercher du travail, le premier geste est de vérifier que ce
qu'il annonce est encore vrai ; sinon on travaille sur l'état d'avant, et on le
fait en croyant être à jour.

**CE QUI DÉPEND DU CONTEXTE SE LIT SUR L'OBJET, PAS SUR SON VOISIN**
*(2026-10-06)*. Deux fois le même jour sur Artidispo. J'ai dit à Paul « ton offre
Supabase est Pro, l'interrupteur est sans surcoût » en lisant la **première**
organisation listée (« Paul GERARD », Pro) — le projet Artidispo vit dans
l'organisation « Artidispo », en offre **gratuite**, où l'interrupteur n'existe
pas. Et j'ai donné `openssl rand -hex 32` à un Paul sous **Windows/PowerShell** :
« openssl n'est pas reconnu ».
*Ce que ça a coûté* : une consigne fausse donnée à Paul, corrigée un message plus
tard ; un aller-retour pour une commande.
⛔ **La règle** : un attribut d'un projet (offre, région, propriétaire) se lit
**depuis le projet** — `get_project` → `organization_id` → `get_organization` —,
jamais depuis la première ligne d'une liste. Et une commande que Paul va taper
se donne pour **son** poste : Windows, PowerShell.

**UN SECRET SE GUIDE SANS PASSER PAR UN ÉCRAN QU'ON CAPTURE** *(2026-10-06)*.
Le guide du `CRON_SECRET` disait « ne m'envoie pas la valeur ». Paul a envoyé une
capture de l'éditeur SQL où il l'avait collée, en ayant « ôté un caractère pour
ne pas te la donner » : 63 caractères hexadécimaux sur 64, soit **un millier
d'essais** pour la retrouver. La valeur est dans la conversation.
*Ce que ça a coûté* : un secret de production exposé ; la rotation reste à faire
en fin de séance.
⛔ **La règle** : quand un guide fait coller un secret dans un écran (éditeur SQL,
formulaire), il dit **avant** : « ne capture pas cet écran ; si tu veux me
montrer le résultat, cadre la seule zone Résultat ». Masquer un caractère n'est
pas masquer — le dire avec le nombre d'essais qui reste. Et si la capture arrive
quand même, **la rotation est la première action**, pas une note de fin.

**UN GESTE DE PLATEFORME DONNÉ À PAUL SE VÉRIFIE SUR SA CIBLE LE SOIR MÊME** *(2026-10-23, RenoDevis, A6a)*.
Le 22/10 au soir, Paul pose la clé Stripe live et les deux webhooks réels, puis écrit
« redeploy fait ». Je réponds « je ne peux rien vérifier ce soir » : `get_project` et
`get_deployment` du connecteur Vercel rendaient 404/403 **avec** `teamId`. Le cron du
23/10 à 08:30 Paris dit encore `test: true`. Le matin, les mêmes appels **sans**
`teamId` répondent : le dernier déploiement du projet (00:54 Paris) était un **aperçu**
(cible vide), pas la production. Production redéployée par l'API à 12:09 Paris.
*Ce que ça a coûté* : un cycle de cron, soit 24 h, sur le premier geste du premier euro.
⛔ **La règle** : un redéploiement se vérifie sur **sa cible** (`target: production`) et
sur **son alias** (`relance-renoboostia.com` dans `alias`), dans la minute qui suit le
« fait » de Paul. Avant de conclure « non lisible », varier la portée de l'appel : le
connecteur Vercel lit `reno-devis-final` **sans** `teamId` et le refuse **avec**. Et le
geste donné à Paul porte sa contre-épreuve : « la fenêtre de confirmation doit dire
Production ».

## 4. Conduire une boucle

**UN PROTOTYPE D'AGENT NE PROUVE QUE LA COUCHE RÉELLEMENT ÉPROUVÉE**
*(2026-10-23, RenoDevis, comparaison des prototypes).* Un PDF fabriqué par
script temporaire a d'abord tenu lieu d'état de chantier ; la première
correction a imposé de reconstruire cet état. Les revues ont ensuite découvert
un ancien prix conservé après changement de référence et une invalidation qui
s'arrêtait aux dépendants directs. Une bibliothèque corrigée et quarante tests
réussis ont sécurisé ces cas ; ils n'ont pas raccordé le vocal, le catalogue,
la configuration professionnelle ou le stockage partagé.
*Ce que cela a coûté* : des reprises de génération et plusieurs tours de
corrections avant de pouvoir comparer les deux prototypes sur une base stable.
La reprise doit identifier séparément modèle, outils métier, hébergement,
stockage et canal, puis éprouver le parcours complet. « Prêt à recevoir un pro »
signifie que les raccordements sont déjà testés avec des données fictives et
que seules les données et configurations réelles restent à importer. Chaque
défaut reproduit devient un cas commun ; une comparaison conserve les mêmes
entrées et indique si les modèles diffèrent. La cible et la recette vivent dans
`Ultima-/zohshia/renodevis/TECHNO.md` §9 ; elles ne certifient pas une mise en ligne.

**UN PARCOURS REÇU PRIME SUR L'ADDITION DE CORRECTIFS VERTS** *(2026-10-27, RenoDevis).* Le travail SOLA était présenté par petits défauts fermés alors que la livraison attendue restait un vocal neuf jusqu'au PDF avec peu d'effort. Paul a dû rappeler le cap de fin de semaine. Le test de synthèse utilisait un document simulé ; le test de PDF natif partait d'un autre état. Coût observé : recadrage nécessaire et effort excessif encore accepté par le scénario sans référence, huit interventions simulées. L'épreuve intégrée en mode réellement prévu a ensuite établi deux interventions avec références connues. Le lot de choix groupés vise le même résultat sans références dictées ; sa preuve ne se déduit pas du scénario précédent.
⇒ Avant de choisir le prochain correctif, fixer résultat, qualité, effort utilisateur, preuve finale et échéance. Confronter ces critères au chemin réel du code, puis faire passer la même demande à travers les fonctions intégrées. Comparer les agents avec les mêmes entrées et sources. Un PDF partiel n'est pas un devis complet, un temps local n'est pas une mesure sur téléphone, une CI verte n'est pas une recette de terrain. Les données et règles du professionnel restent hors du contrat neutre ; l'implantation suivante doit nommer aussi les raccordements et capacités manquants, au lieu de promettre un simple chargement de catalogue. Sources : `RenoDevis/memoire/APPRENTISSAGES-SOLA.md`, `RenoDevis/lib/whatsappAgent.test.ts`, PR #427 ; aucun délai terrain ni gain commercial inventé.

**LA COMPILATION PEUT ÉMETTRE MÊME SI L'APPLICATION N'A PAS DE TÉLÉMÉTRIE CONFIGURÉE**
*(2026-10-23, mon-dpe.fr).* Malgré la télémétrie du framework désactivée et les
sources non envoyées, l'extension de compilation gardait sa propre télémétrie active.
La revue automatique a bloqué le suivi du build local, puis l'a refusé à nouveau
après lecture du code de l'extension et accord général de Paul : destination et
contenu transmis restaient jugés insuffisamment établis et autorisés. Coût constaté :
deux suivis bloqués ; compilation locale complète non attestée. Aucun contournement
après le second refus. La CI GitHub du SHA `820f064` a réussi séparément, préversion
READY ; recette sur base réelle, 3D et revue indépendante restent non validées.
⇒ Inventorier les sorties réseau des extensions avant le build. Un accord général
ne lève pas à lui seul un refus de plateforme ; poursuivre les contrôles indépendants
autorisés et distinguer la preuve locale, la CI, la préversion et la recette.
Source : `mon-dpe.fr` PR #256, 23/10/2026 ; aucune migration ni fusion effectuée.

**UNE SESSION LANCÉE SE RELIT À SON PREMIER ÉVÉNEMENT, PAS À SON ANNONCE** *(2026-10-19)*.
J'ai lancé (`create_session`, 19:09:57) une session « migration `leo_appels` » avec pour source la
branche `claude/ci-couts-md-seuls` — que Paul avait fusionnée (#400) et dont la branche avait été
supprimée à 19:06:43. Erreur d'initialisation `ref_not_found` à 19:10:00, coût zéro. J'ai écrit
« j'attends le résultat de la session migration » dans six messages pendant ≈ 45 minutes ; Paul a
répondu « ok on attend la migration ». Un seul `get_session` (statut, `last_init_error`) l'a
montré — fait à 19:50, quand le message n'arrivait pas. En plus, mon plan « pousser le lot sur
#400 » était caduc depuis 19:06 : Paul avait fusionné entre deux de mes messages.
⛔ **Après `create_session`, lire `get_session` et le premier événement de l'assistant AVANT
d'annoncer une attente** : une annonce n'est pas une preuve. ⛔ **Avant de viser une branche,
`git ls-remote` et l'état de la PR** (Paul fusionne sans prévenir). ⚠️ Un plan écrit « après la
PR X » se relit à l'état de X avant chaque message qui l'invoque.

**UN GO SE DEMANDE POUR UN GESTE DONT L'ACCÈS EST PROUVÉ** *(2026-10-19, Ultima-)*. J'ai
demandé à Paul son go pour appliquer `leo_appels` sur la base d'Ultima, en m'appuyant sur le
RUNBOOK du 11/07 (« vérifié en base » par le connecteur). Son go est arrivé ; `list_migrations`
sur `leosfqyidgsaescjbfom` a répondu « permission denied » — le connecteur de la séance ne liste
que Artidispo et RenoDevis. Coût : un aller-retour de Paul pour un go que je ne pouvais pas
exécuter, après avoir écrit « j'attends ton go » comme si le geste m'appartenait. ⛔ Avant de
demander un go (SQL, déploiement, envoi), prouver l'accès à la CIBLE par une lecture inoffensive
(`list_migrations`, `select 1`) : un accès constaté il y a trois mois n'est pas un accès. ⚠️ Et
jamais « un autre projet qui répond » : Artidispo et RenoDevis répondaient — ce n'étaient pas la
base d'Ultima. Quand l'accès manque, le geste de Paul se prépare au dernier cran (procédure,
script de vérification éprouvé sur une base jetable) au lieu de s'annoncer comme le mien.
*Ajout du 2026-10-19 (Ultima-, AMATSU)* : **reconnecter un connecteur en cours de séance le
RETIRE de la séance, il ne le rebranche pas** — les connecteurs se lisent à l'ouverture. Paul a
reconnecté Supabase pour que j'applique `amatsu_lectures` ; tous les outils Supabase ont disparu.
Coût : un aller-retour, puis Paul a appliqué lui-même. ⇒ Quand l'accès manque, proposer d'emblée
les deux voies chiffrées : le geste de Paul tout de suite (SQL prêt à coller + requête de contrôle),
ou une NOUVELLE séance après reconnexion — jamais « reconnecte et je le fais » dans la même séance.

**LE COMMENT AVANT LE TRAVAIL** *(directive EL)*. Étapes, moyens, critères de
réussite explicités avant d'exécuter. En pratique : **la maquette avant le
code**, éprouvée le 2026-08-01 sur VRANESH et DRAUKHAIN.

**UNE ÉTAPE QUI DÉPEND D'UN ÉTAT SE CADRE SUR SA MESURE, PAS SUR SON NOM**
*(2026-10-08, ZOH SHIA · devis pro)*. Le cadrage du générateur de devis pro
posait en étape 8 « la série de neutralisation couvre les nouveaux modules » —
une ligne, comme un ajout. Personne n'avait lancé `derive.mjs`, qui l'aurait dit
en deux secondes : la série avait **122 commits de retard**. L'étape a été
annoncée à Paul, lancée sur son « go suite », un clone neutre reconstruit, la tête
fusionnée — **46 conflits** — avant de comprendre qu'elle n'était pas la queue de
la boucle mais un chantier entier. *Ce que ça a coûté* : une étape promise puis
retirée, et le temps du clone et de la fusion d'essai. ⇒ **Toute étape qui
s'appuie sur un état qu'un outil mesure (dérive, retard, couverture) porte sa
mesure DANS le cadrage**, avec la commande qui la rend ; sans elle, l'étape n'est
pas cadrée, elle est nommée.

**UN CHOIX PRODUIT DÉCOUVERT EN LISANT LE CODE ROUVRE LE GATE — IL SE POSE EN
PANNEAU AVANT LA PREMIÈRE LIGNE, JAMAIS APRÈS** *(2026-09-30, RenoDevis, boucle
B2)*. La fiche de B2 était validée et ses trois questions répondues. En lisant le
composant pour coder, six choix que la fiche ne couvrait pas sont apparus : un
champ `achat` stocké alors que la fiche disait « pas de colonne achat », la
conversion des prix posés par chantier, un × 1,35 conservé dans `RenoDevis/releve/lignes.js` pour
les entrées non marquées, le dessin d'un bouton, une ligne d'export retirée, un
vocabulaire pour Réno. Sur « implante toutes les solutions du pre-mortem, puis
prépare des panneaux », j'ai lancé la fusion de `main`, l'installation, la
baseline, et j'allais coder avec ces six choix pris seule, pour les présenter
une fois implantés. Paul a dû arrêter : « on ne brûle pas d'étape ».
*Ce que ça a coûté* : une interruption, et vingt minutes à reconstituer ce qui
manquait — le prompt de code en six points, la maquette, une mesure que seul
Paul peut faire (combien de prix il a tapés dans sa bibliothèque), un
consommateur oublié (`RenoDevis/app/releve/ui.tsx:302`).
⛔ **Le gate d'EL n'est pas franchi une fois pour toutes** : il se rouvre à
chaque choix que la lecture révèle, et « puis des panneaux » se lit dans l'ordre
d'EL — panneaux, puis code —, jamais dans l'ordre des mots. Décider après avoir
codé, c'est coder deux fois. Et le modèle que Paul nomme pour coder est une
consigne, pas un détail : on ne continue pas dessus sur une phrase.

**UNE SEULE BOUCLE À LA FOIS, ET ON CAPITALISE** *(directive EB)*. Ne jamais
passer à autre chose sans avoir bouclé : livrée, vérifiée, committée, annotée.
Les documents de cadrage sont la source unique ; ne jamais re-scanner ni
re-décider ce qui y est déjà consigné, ne jamais créer de document parallèle.

**RÉ-ÉPROUVER CE QUI VIENT D'ÊTRE LIVRÉ** *(directive DR, 2026-09-06)*. Un test
qui passait passe encore ; le relancer n'apprend rien. Un dry run **attaque** :
il casse volontairement le code et exige que le harnais vire au rouge. ⛔ Les
failles trouvées se corrigent **dans le même passage**. Et **un dry run qui ne
trouve rien se dit aussi** : sans cette ligne, il ne se distingue pas d'un dry
run non fait.

**UNE CONSIGNE DE SÉANCE NE SE PÉRIME PAS À L'OBJET SUIVANT** *(2026-09-13)*.
Paul dit « coupe l'abonnement » sur une PR ; la consigne porte sur la SÉANCE, pas
sur cette PR-là. ⛔ Un réflexe d'outil — ici « après avoir créé une PR, s'y
abonner » — n'a pas autorité sur une instruction explicite, et il se rejoue
d'autant plus facilement qu'il est automatique : personne ne le décide, donc
personne ne le rattache à ce que Paul vient de dire. *Incident : trois
réabonnements dans la même séance après « coupe l'abonnement aussi », sur #155,
#156, #226 et #227 — treize notifications lues pour rien, quatre désabonnements,
et à chaque fois Paul a vu passer du bruit qu'il avait explicitement refusé.* Le
geste juste : quand une consigne contredit un réflexe, c'est le réflexe qui
cède, et il cède **pour toute la séance** — se redemander « est-ce qu'il me l'a
déjà interdit ? » avant l'automatisme, pas après.

⛔ **ET CETTE LEÇON A ÉTÉ REJOUÉE DANS L'HEURE QUI A SUIVI SON ÉCRITURE**, sur
les deux PR qui la portaient. C'est la partie qui compte : **écrire une leçon ne
désarme pas le réflexe qui l'a causée.** Un automatisme ne se corrige pas en le
décrivant — il se corrige en plaçant la vérification **dans le geste lui-même**.
Ici : l'abonnement se décide au moment de créer la PR, donc c'est là, dans la
même respiration que l'appel, qu'il faut se demander si Paul l'a interdit. Toute
leçon portant sur un réflexe doit nommer **le geste exact où la question se
pose**, sinon elle décrit une faute au lieu de l'empêcher.

**FERMER UNE DÉCISION NE CHIFFRE PAS CE QU'ELLE COÛTE** *(2026-09-11)*. D10 a
été validée — un numéro de téléphone dédié par artisan — alors que son prix
mensuel n'avait jamais été lu à la source. L'architecture était actée, la marge
toujours inconnue. Le risque est de lire « toutes les décisions sont fermées »
comme « plus rien ne pend ».

**EXTRAIRE PLUTÔT QUE DUPLIQUER, QUAND UN HARNAIS COUVRE** *(2026-07-30)*. Un
composant réclamé par un second appelant se **déplace** vers son propre module,
il ne se recopie pas. Le harnais dédié rend l'opération sûre : il doit passer
**sans retouche**, c'est le critère de réussite de l'extraction.

**RÉUTILISER AVANT DE REFAIRE.** Modèles déjà conçus, fixtures en cache, une
seule fusion par boucle. Conception et implémentation lourdes partent en agents,
pour préserver le contexte du fil principal ; les synthèses seules remontent.

**ON COMMITE AVANT DE MUTER — TROISIÈME FOIS PAYÉE** *(2026-09-18)*. La passe
de dry run casse volontairement le code puis restaure par `git checkout -- .`.
Cette commande **écrase tout ce qui n'est pas commité**, y compris le travail
légitime de la demi-heure précédente. Le `CLAUDE.md` d'Artidispo le disait déjà,
payé deux fois le 18/09 au matin — dont une en perdant la réécriture complète
des CGV. Le soir même, j'ai lancé une passe de sept mutations sur un état non
commité : le voile du plan, le placement des libellés, le cadre calculé et le
contrôle multi-largeurs sont partis ensemble, et tout a dû être réécrit de
mémoire. ⛔ *La séquence n'est pas « écrire → tester → muter » mais
**écrire → tester → COMMITER → muter → restaurer**. Une règle qu'on a déjà lue
deux fois et qu'on enfreint quand même n'est pas oubliée : elle n'est pas
outillée. Le geste de muter doit commencer par refuser de tourner si
`git status` n'est pas propre.*
⚠️ **Quatrième fois, le 25/09** — et la variante est instructive : la règle
avait été TENUE pour la première passe (commit `d6e3318`, puis trois
mutations), et enfreinte sur le correctif de CI qui a suivi. Un fix d'une ligne
non commité, une mutation pour le prouver, `git checkout --` pour restaurer :
le fix est reparti avec la mutation, réécrit une minute plus tard. *Le
correctif qui arrive APRÈS la passe de dry run est un nouveau cycle, avec son
propre commit avant sa propre mutation — pas une queue du cycle précédent.*
⚠️ **Cinquième fois, le 09/10** (RenoBoost, H1 défilant) : un sabotage par
`sed` sur `RenoBoost/preview-vitrine.css`, restauré par un `git checkout --` sur ce même fichier,
a emporté les huit lignes de CSS du défilement, non commitées. Rattrapé parce
que le harnais suivant est passé au vert sans la fonctionnalité, et réécrit.
La suite de la séance a tenu la variante sûre : **copie du fichier avant la
mutation, recopie après** — elle restaure l'état réel, pas l'état du dernier
commit.

**UN CONTRÔLE QUI MESURE LA MAUVAISE GRANDEUR EST VERT SUR LE DÉFAUT QU'IL
GARDE** *(2026-09-18)*. Un garde-fou sur des pastilles SVG a été écrit trois
fois avant de voir quoi que ce soit. V1 comparait `getBoundingClientRect()` à la
bande : aveugle, un élément rogné par le cadre garde un rectangle plausible qui
tombe toujours dedans. V2 comparait `getBBox()` au `viewBox` : aveugle aussi, et
plus subtilement — en `preserveAspectRatio="slice"`, la zone **réellement
dessinée** n'est qu'un SOUS-ENSEMBLE du `viewBox`, donc « être dans le viewBox »
ne veut pas dire « être dessiné ». V3 passe par `getScreenCTM()`, la
transformation exacte qu'applique le navigateur. ⛔ *Trois mutations réelles ont
survécu aux deux premières versions en restant vertes. Quand une sonde ne
trouve rien, la question n'est pas « le code est-il sain ? » mais **« cette
sonde peut-elle seulement voir ce que je crois qu'elle garde ? »** — et la seule
réponse acceptable est une mutation qui la fait virer au rouge.*

**UNE CONSTANTE GÉOMÉTRIQUE QUI DÉCRIT UN RENDU FINIT PAR LE DÉCRIRE FAUX**
*(2026-09-18)*. Deux cadrages écrits à la main — l'emprise d'une tournée, puis
le `viewBox` « sûr » d'un plan — ont chacun rogné un libellé le jour où autre
chose a bougé : le premier quand le placeur a déplacé une étiquette, le second
dès que la fenêtre a dépassé ~1900 px de large. Les deux paraissaient
inoffensifs et étaient justes le jour où ils ont été écrits. ⛔ *Ce qui décrit
une géométrie rendue se MESURE sur le rendu (`getBBox()`, le rapport réel de
l'élément) ; une valeur en dur n'est légitime qu'en REPLI, quand la mesure est
indisponible — et elle doit le dire.*

**LE DOMAINE SE GARDE À SES DEUX BORDS, PAS AU MILIEU** *(2026-09-18)*. Le même
harnais mesurait 390 / 768 / 1280 / 1600 px et déclarait une page saine.
Ajouter **1000 px** a révélé un texte qui recouvrait la carte ; ajouter
**2200 px** en a révélé un second, de cause inverse — la colonne de contenu
reste centrée quand l'écran grandit, donc elle dérive par-dessus le dessin.
Trois défauts réels vivaient exactement entre les largeurs testées. ⛔ *Une
liste de cas choisie par habitude (« mobile, tablette, portable, grand écran »)
couvre les valeurs courantes, pas les TRANSITIONS. Chercher où le comportement
CHANGE — un seuil de media query, un rapport de forme qui bascule — et mesurer
de part et d'autre.*

**`git checkout --` NE RESTAURE PAS UN FICHIER NON SUIVI** *(2026-09-13)*. Une
boucle de sondes de dry run annulait chaque sabotage par `git checkout -- <fichier>`.
Sur les fichiers **non suivis** — ceux que la séance venait de créer — la commande
échoue sans rien restaurer : trois sabotages sont restés en place, et le même
`checkout` a par ailleurs **annulé du travail légitime** sur un fichier suivi
qu'il fallait garder, qu'il a fallu réécrire entièrement. Coût : une dizaine de
minutes et une réapplication complète. *Une sonde se restaure depuis une copie
prise avant, jamais depuis git : git ne connaît pas ce qu'on vient d'écrire.*

**UN CHAMP DONT LE REFUS EST VALIDÉ EN CONTINU ENFERME CELUI QUI SAISIT**
*(2026-09-13)*. `renommerActivite` refusait un libellé vide — règle d'apparence
saine. Le champ étant piloté par l'offre validée, la **dernière lettre devenait
ineffaçable** : impossible de vider pour retaper. Le nom vide est un ÉTAT DE
SAISIE ; c'est la validation d'étape qui refuse le passage, et le schéma qui reste
le second verrou. Trouvé en relisant le diff en adversaire, pas par un clic.
*Distinguer ce qui est interdit de ce qui est simplement pas encore fini.*

**UNE RÈGLE ABSOLUE QUE LE DÉPÔT CONTREDIT DÉJÀ N'EST PAS UNE RÈGLE**
*(2026-09-13)*. « Tout champ nouveau se pose avec `.optional()`, jamais
`.default()` » — trois contre-exemples légitimes dans les fichiers que la règle
désignait, dont un posé par le chantier même qui l'énonçait. Le critère réel est
l'**omissibilité en entrée** : `.default()` est permis imbriqué dans un
`.optional()`, ou sous un parent déjà obligatoire. Relevé par une séance
d'épreuve. *Une règle qu'on ne peut pas appliquer sans exception non écrite
n'apprend rien à qui ajoute un champ.*

**LA COHÉRENCE GÉOGRAPHIQUE SE VÉRIFIE AVANT DE MESURER, PAS APRÈS** *(Paul,
2026-09-13 : « toujours avoir une cohérence géographique dans nos travaux — et
une cohérence générale aussi bien sûr »)*. Tout relevé, tout référentiel, tout
chiffre montré porte un **territoire**, et ce territoire doit être celui où la
valeur se trouve — pas celui qui était à portée de main. La question se pose
**avant** de choisir le périmètre, et elle se lit **en base**, jamais de
mémoire : *où sont les clients, les données, la valeur ?*

*Incident : le premier import Google Ads a relevé l'**Oise** — 337 284 lignes,
12 mois, une journée de travail, six défauts trouvés et fermés — alors que les
clients de Paul sont **106 dans le Rhône**, 15 dans l'Ain, 11 en Isère… et
**0 dans l'Oise**. La mesure était juste, l'outil solide, et il ne servait
personne. Le contrôle coûtait une requête de trente secondes, posée après coup.*

⛔ **Corollaire, et c'est lui qui porte** : la cohérence ne vaut pas que pour la
géographie. Un périmètre — zone, période, métier, population, échantillon —
hérité d'un exemple de documentation, d'une valeur par défaut ou de la première
chose testable est un périmètre **non choisi**. Et rien ne le signale, parce que
le résultat, lui, a l'air parfaitement propre.

**CE QUI REND INTÉGRABLE UN PAQUET DE CODE ÉCRIT HORS DU DÉPÔT** *(2026-09-13,
première fois que l'exercice ne coûte rien — à retenir pour le refaire)*. Paul a
fait produire chez ChatGPT une passe de forme complète sur le site SPC : onze
fichiers, appliqués ici **sans un seul conflit**, vérifiés et committés dans la
foulée. Ce n'est pas de la chance, et les raisons se recopient :
① **le commit de base est nommé** (`717a8a1`), pas « la dernière version » — un
`git apply --check` répond alors oui ou non, au lieu d'une fusion à la main ;
② **le patch ET les fichiers complets** sont livrés, avec la consigne de n'en
utiliser **qu'un seul** : les copies servent à comparer, jamais à écraser ;
③ **un manifeste d'empreintes** base + résultat pour chaque fichier — l'intégration
se prouve d'un `sha256sum`, elle ne s'affirme pas ;
④ **les limites sont écrites d'avance** : ce qui n'a pas été exécuté (une recette
sans sa fixture), ce qui n'est pas mesuré (« une amélioration visuelle n'est pas
une preuve de conversion »), ce qui reste interdit (schéma, registre, garde,
migrations). Une livraison qui liste ce qu'elle ne prouve PAS est la seule qu'on
puisse croire sur ce qu'elle prouve ;
⑤ **la publication reste distincte de l'intégration** : le paquet dit lui-même
que la garde affiche toujours ses huit blocages et qu'un retour 0 hors production
n'autorise rien.
⛔ *Ce qu'il faut quand même faire soi-même, et qui n'est pas facultatif* : relire
le diff en adversaire et **rejouer tout le harnais dans SON environnement**. Ici
c'est ce geste qui a trouvé le faux positif ci-dessus (§2), un logo d'en-tête qui
pointait sur le lien d'évitement au lieu de l'accueil, et une donnée devenue
morte qui portait un engagement jamais validé par le client. *Un paquet qui
s'applique proprement n'est pas un paquet vérifié.*

**LE CHAMP QUE PAUL DÉSIGNE N'EST PRESQUE JAMAIS LE SEUL** *(2026-09-14)*. Il
pointait une ligne — `site.horaires` promettait « dépannage urgent 7j/7 » sur le
site d'Ezzedine — et il a tranché : « c'est un artisan, pas un dépanneur,
enlève ». Corriger ce champ prenait une minute, et **aurait été faux** : le
balayage a rendu **neuf** endroits. La FAQ d'accueil (« nous faisons le maximum
pour intervenir dans la journée »), trois pages métier (« traité en priorité »),
une réponse qui disait **« Oui »** à « intervenez-vous en urgence le week-end ? »,
un bandeau, une fiche prestation, et un bloc entier « En cas d'urgence
plomberie » devenu mort sans que personne le remarque. J'aurais rendu compte de
« c'est enlevé » pendant que quatre pages continuaient de promettre une
astreinte — et c'est le rapport, pas le site, qui aurait menti.
⛔ *Une consigne de Paul nomme le symptôme qu'il a VU : il lit une page, il ne
lance pas un `grep`. Le geste juste tient en quatre temps — balayer la famille
entière AVANT de corriger, appliquer SA règle à chaque trouvaille, agir, puis
lui rendre le constat ET l'action.* C'est « boucher un trou nommé n'est pas
fermer sa classe » (§2) vu de l'autre bout : ici la classe est nommée par
l'utilisateur, et c'est justement pour ça qu'on la croit petite.

**LE SECOND APPELANT RAMÈNE LA DIVERGENCE PAR LA PORTE DE SERVICE**
*(2026-09-15)*. Deux écrans importaient des devis et n'écrivaient pas au même
endroit ; la correction consistait à faire DÉMÉNAGER la logique dans un rail
unique. Fait — puis, trois fonctions plus bas, le versement des anciens devis
appelait `saveDevisCloud` directement. La divergence qu'on venait de supprimer
revenait dans le même commit, écrite par la même main. Elle a été attrapée par
un test d'assemblage qui interdit à tout écran d'enregistrer un devis lui-même.
⛔ *Quand on unifie deux chemins, le test qui compte n'est pas « le rail
marche » mais « personne n'écrit à côté du rail » — et il se pose dans le même
commit, sinon la deuxième porte s'ouvre pendant qu'on admire la première.*


**RÉPARER UN DÉCLENCHEUR SANS LIRE CE QU'IL DÉCLENCHE PEUT COÛTER PLUS CHER QUE LA PANNE** *(2026-09-15, RenoBoost)*.
La route `/api/rp-digest` DÉDUISAIT son mode (`day === 5 ? 'vendredi' : 'lundi'`). La passer en quotidien sans rien d'autre aurait produit un digest du lundi CHAQUE MATIN — écrit en base et envoyé par mail — plus un second digest du vendredi à 05:00.
⇒ *Règle* : nommer plutôt que déduire. Le mode se NOMME dans le chemin planifié (`?mode=`). Avant de toucher à la cadence d'un déclencheur, lire ce qu'il déclenche.

**L'ÉTIQUETTE D'UN PANNEAU N'EST PAS UN ACCORD DE FUSION** *(2026-10-02)*.
Un panneau de décision portait l'option « reposer sur une PR neuve … tests, puis
fusion ». Paul l'a choisie, et j'ai fusionné **onze PR** sur cette étiquette.
Or le gate du dépôt dit ce que l'accord doit PORTER : *« le SHA source, la cible
et la preuve d'intégration actuelle ; un changement de l'un d'eux rend l'accord
caduc »*. Les trois ont bougé APRÈS le clic — branche repartie de `main`,
périmètre réduit de trois fichiers à deux, leçons passées de `v62` à `v63`.
⛔ **Un go obtenu sur un CADRAGE n'est pas un go sur l'ACTE** : le cadrage dit
quoi faire, l'accord de fusion dit sur quoi. ⚠️ Et le piège est qu'une option
bien rédigée **ressemble** à l'accord, d'autant plus qu'elle énumère les étapes
— c'est la même confusion que le bail de `--force-with-lease`, qui garantit une
identité et pas un contenu (famille 5, même journée). ⇒ *Règle* : l'étiquette
d'un panneau autorise la **préparation** ; la fusion se redemande en NOMMANT le
SHA, la cible et la preuve — une phrase, à la fin, quand ils sont connus. ⚠️ Le
coût ici a été nul (markdown de mémoire, additif, dix dépôts verts et mesurés),
et c'est ce qui rend la faute facile à ne pas voir : elle ne laisse pas de trace
dans le produit, seulement dans qui a décidé.

---

## 5. Plusieurs dépôts, plusieurs séances

**UN ACCORD DE FUSION SE DEMANDE SUR UN `main` RELU À L'INSTANT** *(2026-11-03,
Ultima #441)*. Paul a dit « Go fusion » sur `b701e54` ; la fusion a été refusée
(405, conflit) : une autre séance venait de fusionner #440 dans `main`, et les
deux PR touchaient `FINUBAR.md`. L'accord est devenu caduc, il a fallu fusionner
`main` dans la branche, relancer la CI (≈ 30 min) et redemander l'accord.
`expectedHeadSha` protège la tête de la PR, pas sa base. ⛔ **`git fetch origin
main` juste avant de présenter le SHA à Paul, et de nouveau juste avant de
fusionner** ; si la base a bougé, intégrer d'abord, puis demander l'accord sur
le nouveau SHA.

**« VIDE » SE MESURE CHEZ CEUX QUI LISENT, PAS SEULEMENT DANS LA LIGNE**
*(2026-10-20)*. Une ligne d'une base partagée n'est pas vide parce que ses
colonnes de montant le sont : elle peut être LUE par une autre brique, et porter
du travail fait à la main dans un champ libre. ⛔ Avant de qualifier une ligne de
« coquille », « factice » ou « sans valeur » — mot sur lequel Paul tranchera une
suppression —, deux mesures : **qui la lit** (grep des autres dépôts sur la table
et le filtre) et **ce qu'elle porte de manuel** (clés d'`extra` posées par un
humain). Sans elles, la description est une déduction présentée comme un fait.
*Incident : inventaire des dossiers e-mail de RénoDevis. J'ai présenté six devis
« Signé » sans montant comme des « coquilles vides » ; Paul a répondu « retire
aussi les 6 signés ». En cadrant la suite, `RenoBoost/pilotage-pros.js`,
`RenoBoost/api/chaine-pose.mjs` et `RenoBoost/api/rp-sync-poses.mjs` lisent
justement les devis `Signé` (pilotage, chaîne de pose, RénoPredict), et ces six
dossiers portaient `signature_manuelle` et le texte du projet. Décision
reposée à Paul, inversée (« les garder ») — rattrapé AVANT tout effet, mais une
décision a été prise sur un fait faux.*
⊕ Le corollaire : quand une vérification invalide une description déjà donnée à
Paul, le dire en tête de la réponse suivante, avec ce qui change, avant toute
autre chose.

**METTRE À JOUR UN ÉTAT, C'EST METTRE À JOUR CE QUE L'INSTRUMENT LIT**
*(2026-09-22)*. Un fichier d'état qui porte À LA FOIS de la prose pour l'humain
et un bloc structuré pour la machine a **deux vérités**, et c'est toujours celle
de la machine qui compte. ⛔ Écrire la prose et croire l'état recalé est le
geste qui produit une note juste ET fausse en même temps : elle se relit bien,
elle ne mesure rien. La seule preuve est de **relancer l'instrument** et de lire
ce qu'il répond — pas de relire son propre texte.
*Incident : trois « recalages » du grain Finubar de RenoBoost dans la même
séance, tous dans le récit en tête de `FINUBAR.md` ; la collecte
(`Ultima-/finubar/collecter.mjs`) lit le bloc JSON plus bas, jamais touché. La collecte l'a dit d'elle-même
(« RénoBoost a avancé de 2 commits depuis sa dernière note ») — et Paul avait
entre-temps reçu trois comptes rendus affirmant le grain recalé. La
`prochaine_action` du JSON datait encore de la veille et demandait « valider en
preview après CI verte », c'est-à-dire exactement ce que la panne du jour
rendait impossible.*
⊕ **Corollaire pour toute écriture structurée** : revalider après écriture
(`json.loads`, relecture par l'outil), jamais à l'œil. Une écriture qui casse le
format et une écriture réussie ont la même tête dans l'éditeur.

**UNE PANNE EXTERNE EXPLIQUE LE ROUGE JUSQU'À CE QU'ELLE CESSE — ET ON NE LE
VOIT PAS TOUT SEUL** *(2026-09-22, le même soir, deux heures après les deux
leçons ci-dessous)*. Dès qu'un échec a reçu une cause extérieure crédible, il
cesse d'être regardé : chaque rouge suivant est classé sans être lu. ⛔ Le
danger n'est pas l'erreur d'attribution initiale — elle était juste — c'est
qu'**elle survit à la panne**. Quand les runners reviennent, le rouge change de
nature sans changer d'apparence, et le nôtre se cache derrière celui qu'on a
déjà expliqué.
*Incident : la CI du compte RenoBoost n'allouait plus de runners (échecs en
2 s, `runner_id: 0`, `main` rouge aussi) — constat mesuré, commenté sur la PR,
re-vérifié à 20 h : inchangé. Les runners sont revenus vers 20 h 25, et les
exécutions suivantes ont duré quatre minutes : de vraies exécutions, de vrais
échecs. C'était `RenoBoost/tests/lint.test.mjs`, ajouté deux heures plus tôt : il appelle
`npx eslint`, et le job `test` ne faisait pas `npm ci` — tous les tests
antérieurs étaient sans dépendance, donc la lacune n'avait jamais mordu. J'ai
rendu compte à Paul d'une CI à l'arrêt alors que `main` était rouge de mon
fait. Une autre séance l'a corrigé (#539, `npm ci` ajouté au job).*
⊕ Deux gestes, pas un : **(1)** re-vérifier la NATURE d'un échec à chaque
réveil, pas seulement sa présence — une durée de 2 s et une durée de 4 min ne
racontent pas la même histoire ; **(2)** un test qui appelle un binaire ou une
dépendance se valide **dans l'environnement que la CI fournit**, pas seulement
en local où `node_modules` existe déjà. Lire le workflow avant d'ajouter le
test : ce qu'il installe est la seule chose sur laquelle le test peut compter.

**UN CONTRÔLE QUE LA CI NE LANCE PAS N'EST PAS UN CONTRÔLE** *(2026-09-22)*.
La règle « on vérifie que les vérifications s'exécutent » a un cas particulier
qui se paie cher : l'outil **existe**, il est **configuré**, il **dit vrai** —
et rien ne l'appelle. Il est alors pire qu'absent, parce que sa présence dans le
dépôt se lit comme une garantie.
*Incident : `RenoBoost/accueil.js` levait un `ReferenceError` sur `isRecent` — un `const`
lu depuis une fonction SŒUR — dans la branche qui se déclenche dès qu'un lead a
moins de sept jours, donc exactement quand l'écran sert. ESLint le signalait en
toutes lettres depuis une date que personne ne sait situer. La CI n'exécute que
`test` et `navigateur`. Le correctif qui compte n'est pas la ligne corrigée,
c'est `RenoBoost/tests/lint.test.mjs` : le lint entre dans le harnais qui, lui, tourne à
chaque commit.*
⊕ Le geste généralisable : pour chaque outil de qualité présent dans un dépôt,
demander **qui l'appelle**. S'il n'y a pas de réponse, il ne garde rien.

**LE PATRIMOINE COMPLET AVANT FUSION** *(2026-07-22)*. Avant toute fusion
touchant le front, le routage ou un renommage large, lancer les harnais **en
entier**, pas seulement ceux du fichier modifié. Un changement de liens a laissé
un harnais rouge, invisible car seuls deux autres avaient été relancés ;
rattrapé bien plus tard.

**REPRENDRE LA BRANCHE DE `origin/main` APRÈS CHAQUE SQUASH-MERGE**
*(2026-07-22, complétée le 2026-09-11)*.
`git fetch origin main && git checkout -B <branche> origin/main` **avant** tout
nouveau commit. Ne jamais empiler sur l'historique pré-squash : source de
conflits de merge récurrents.
⊕ **Et le distant, lui, porte encore l'ancienne tête** : le push suivant est
refusé (« non-fast-forward »). Le geste est alors un `--force-with-lease`, mais
**seulement après avoir prouvé qu'il ne détruit rien** :
`git diff --stat origin/main origin/<branche>` doit être **vide** — le contenu
de la branche distante est déjà dans `main`, seuls ses commits pré-squash
subsistent. Un diff non vide veut dire qu'un travail non fusionné y dort : on le
rebase, on ne force pas. *(Rejoué le 2026-09-11 : la leçon disait quoi faire du
local et rien du distant, donc elle s'arrêtait juste avant le geste qui bloque.)*

⊕ **RECHUTE DU 2026-10-02 — ET C'EST LA RÈGLE CI-DESSUS QUI A ÉTÉ SAUTÉE, PAS
UNE RÈGLE QUI MANQUAIT.** Branche de séance repartie de `main` après la
fermeture de sa PR ; le bail a été renseigné avec le sha lu par `git ls-remote`,
donc le geste 2 de l'entrée suivante était bien fait — et le push a **écrasé
`f23fd55`, un commit poussé par une séance parallèle**. ⛔ Le contrôle manquant
était celui de la ligne du dessus : `git diff --stat` entre `main` et la branche
distante n'était **pas vide** (2 fichiers, 92 insertions), et la règle dit alors
« on rebase, on ne force pas ». ⚠️ **Ce qui a endormi la vigilance** : lire le
sha du distant *ressemble* à de la diligence. Le bail vérifie une **identité**
(« le distant est bien celui que j'ai lu »), jamais un **contenu** — les deux se
confondent d'autant plus facilement que le premier échoue bruyamment. ⛔ Le coût
a été nul cette fois, et c'est la **mesure** qui le dit, pas le geste : après
récupération, son apport était identique à l'octet sur un fichier et moins à
jour sur l'autre. ⚠️ **Cause racine, et elle n'est pas le bail** : deux séances
travaillent sur la même branche désignée — troisième incident en trois jours,
après deux `v55` et deux `v57`.

**AVANT UN TRAVAIL COÛTEUX, RELIRE `main` ET LES PR OUVERTES — PAS SEULEMENT À
L'OUVERTURE DE LA SÉANCE** *(2026-11-03, Ultima)*. Deux séances ont joué **la même
recette de Léo** (T05–T18, onze agents chacune) le même matin sans le savoir : la
mienne avait vérifié `main` à l'ouverture, l'autre a démarré ensuite et a fusionné
avant moi (#441). *Ce que ça a coûté* : ≈ 1 million de jetons dépensés deux fois, et
une fusion à réconcilier en fin de séance. ⇒ Avant d'engager un lot coûteux (agents en
parallèle, harnais complets, recette), refaire `git fetch origin main` + liste des PR
ouvertes, et chercher le sujet dans les titres ; un travail déjà en cours se rejoint
ou se complète, il ne se refait pas. Le recoupement a quand même servi (variance
mesurée, `Ultima-/.claude/leo-complements/recette-2026-11-03/RECETTE.md` §7) — c'est un bénéfice constaté, pas une méthode.

**UN CLONE SUPERFICIEL NE SUIT QUE `main`, ET `--force-with-lease` REFUSE ALORS
TOUT** *(2026-09-11)*. `git clone --depth 1 -b main` écrit un refspec réduit :
`+refs/heads/main:refs/remotes/origin/main`. Un `git fetch origin <branche>`
ne crée donc **aucune** référence de suivi pour cette branche — et le bail de
`--force-with-lease`, qui se compare à cette référence absente, échoue sur
« stale info » **quelle que soit** la réalité du distant. Le réflexe dangereux
est de tomber dans `--force` : il écraserait sans rien avoir vérifié. Les deux
gestes justes, dans cet ordre :
1. fetcher en NOMMANT la destination —
   `git fetch origin <branche>:refs/remotes/origin/<branche>` ;
2. ou mieux, **nommer le commit qu'on accepte de remplacer** —
   `--force-with-lease=<branche>:<sha lu par git ls-remote>`. Le sha se lit à la
   source, jamais de mémoire.

⛔ **Et ce qui a failli passer, ce jour-là, vaut plus que la manœuvre** : ma
garde disait « `git diff --stat origin/main origin/<branche>` est vide, donc
rien à perdre » — alors que la commande **plantait** sur une référence
inconnue, et que `wc -l` comptait ses zéro ligne de sortie. *Une recherche
d'absence est verte sur une commande qui échoue.* Le verrou : exiger que la
commande **réussisse** avant d'interpréter son silence, et lui adjoindre un
témoin positif — ici, la même comparaison contre ma propre tête, qui doit,
elle, rendre un écart non nul.

**UNE PR QUI DORT SE FAIT DOUBLER** *(2026-07-30)*. Quand un autre fil pousse
sur `main` — constat : quatre avancées en une séance — rebaser puis fusionner
**sans délai**, sinon le rebase est à refaire. Un conflit sur
`Ultima-/memoire/JOURNAL-DECISIONS.md`, où deux séances écrivent le même jour en fin de
fichier, se résout **toujours par concaténation** : garder les DEUX entrées,
jamais arbitrer entre elles.
⊕ **Et une PR qu'on réconcilie se fait fermer sous la main** *(2026-10-02)* :
l'état de #327 et #329 lu à 05:00 UTC (ouvertes) a servi de base à une
réconciliation poussée à 05:40 et commentée à 05:46 — la séance chaîne les avait
fermées à 05:33 et 05:35 sur décision de Paul, et réécrit sa branche entre-temps :
une heure de travail en double, un commentaire sur une PR close. ⛔ L'état d'une
PR se relit à la seconde où l'on agit dessus — avant le push, avant le
commentaire — jamais à l'ouverture de la séance ; et deux séances sur un même
dépôt le même matin se le disent avant de toucher la même PR.

**RÉSOUDRE UN CONFLIT NE SE VÉRIFIE PAS AVEC `git diff --check`** *(2026-09-11)*.
Un merge peut porter PLUSIEURS zones de conflit dans le même fichier. J'en ai
résolu une, committé, poussé — et les marqueurs de la seconde sont partis avec.
`FINUBAR.md` n'était plus du JSON, et la suite est restée VERTE : aucun test ne
lit ce fichier. Mesuré ce jour-là, et c'est le point qui compte :

| Commande | Voit les marqueurs ? |
|---|---|
| `git diff --check` (après `git add`) | **non** — l'index les a absorbés |
| `git diff --cached --check` | **oui**, ligne par ligne |
| `git commit` | **non**, il passe sans rien dire |

⛔ Donc : après un `git add` de résolution, c'est `git diff --cached --check` qui
garde, et lui seul. Et quand le fichier résolu a une FORME (JSON, YAML), on la
reparse avant de committer.

⛔⛔ **ET LE REPARSE DOIT ARRÊTER LE COMMIT, PAS L'ACCOMPAGNER.** Une heure plus
tard, même journée, la faute s'est rejouée **en pire** : `--cached --check`
était vide, `JSON.parse` ÉCHOUAIT, et le commit est parti quand même — le parse
tournait en bout d'enchaînement, dans un `node -e` dont le code de sortie ne
gardait rien. *Un contrôle qui n'ARRÊTE pas n'est pas un garde-fou : c'est une
ligne de sortie qu'on peut ne pas lire.* La forme qui garde :

```
node -e "JSON.parse(...)" && git add F && git diff --cached --check && git commit
```

Le parse en TÊTE du `&&`, avant `git add` : son échec empêche le commit.
*Corollaire, de la même famille que « un garde-fou qui cesse de fonctionner doit
le dire » : un fichier qu'aucun harnais ne lit n'a pas de garde-fou du tout, et
sa corruption se présente comme une CI verte.*

**UN PROJET RENOMMÉ LAISSE DES NOMS MORTS LÀ OÙ ILS COÛTENT LE PLUS CHER**
*(2026-09-11)*. Paul a cherché « Artilib », le dossier vivait sous « Artidispo »,
et le chapitre d'architecture faisait encore créer un dépôt `RenoRDV` : trois
noms pour un produit sans une ligne de code. Ce qu'il faut chasser après un
renommage, ce ne sont pas les occurrences, ce sont les **valeurs qu'un lecteur
va exécuter** — nom de dépôt, domaine, URL. Les occurrences historiques peuvent
rester : elles racontent la décision.

**UNE SÉANCE NE PEUT PAS ATTACHER UN DÉPÔT D'UN AUTRE PROPRIÉTAIRE**
*(2026-09-11)*. Sept dépôts sur huit ont reçu les leçons en une passe ; le
huitième, `paggerard-boop/ripair`, a été refusé — une séance déjà ouverte sur
des dépôts de `PaulGERARD161098` ne peut pas en attacher un d'un autre compte.
Ce n'est pas contournable depuis la séance : il faut en ouvrir une sur ce dépôt.
*À savoir AVANT d'annoncer « tous les dépôts », pas après.*

**UNE ANTÉRIORITÉ SE CHERCHE SUR LE NOM, JAMAIS SUR LE MÉTIER** *(2026-09-06)*.
Une mesure disait « aucune plateforme de rendez-vous nommée Artilib n'apparaît
en recherche ». Exact, et sans valeur : l'homonyme n'était pas une plateforme de
rendez-vous, c'était une société de logiciel du même département. Le nom est
tombé le jour même de sa validation.

**UN FICHIER PARTAGÉ SE RECONSTRUIT SUR LA BASE OÙ ON POUSSE, PAS SUR CELLE QU'ON A
LUE** *(2026-09-13)*. `memoire/LECONS.md` a été lu au sceau **v9**, enrichi de
quatorze entrées, scellé **v10** — et pendant ce temps une AUTRE séance avait
fusionné sa propre leçon et scellé **v11**. Pousser le fichier tel quel aurait
**effacé sa leçon**, silencieusement, dans le fichier même qui existe pour ne
rien perdre. C'est la ligne d'empreinte en tête qui l'a montré, au moment du
`git checkout` : v11 sur la base, v10 dans la main. Le geste juste a été de
réappliquer les quatorze entrées SUR la v11, puis de re-sceller en v12 — et de
vérifier par `grep` que les deux apports survivaient. *Sur tout fichier à copies
multiples : relire la base juste avant de pousser, comparer les sceaux, et
reconstruire — jamais écraser. Et la vérification se fait sur le CONTENU des deux
apports, pas sur le fait que le sceau a changé.*


**UNE LEÇON ÉCRITE DANS UNE COPIE DONNE DEUX CORPS SOUS UN MÊME SCEAU** *(2026-09-13 et 2026-09-28, Ultima + RenoDevis + RenoBoost)*.
Le 13/09, les copies d'Ultima et de RenoDevis annonçaient toutes deux `v8 85cca6330a86` ; le corps réel de RenoDevis valait 9814804030dd (474 lignes contre 439). Cause : les 3 leçons du 11/09 avaient été écrites DANS la copie au lieu de la source, sans re-sceller. Portées dans `Ultima-/memoire/LECONS.md` (diff de 35 ajouts, 0 suppression, vérifié avant recopie), re-scellées v9 puis v10 (`51f861db94a0`), propagées à RenoDevis à chaque fois. La propagation, elle, est restée partielle : six dépôts à deux révisions de retard (v8), dont trois non attachés à la séance. Le 28/09, même faute : RenoBoost portait 2 leçons absentes de la source, vues au diff avant écrasement. Aucun contrôle croisé ne compare une copie à sa source.
⇒ *Règle* : avant d'écraser une copie par la source, la comparer (`diff`) : un ajout présent dans la copie seule est une leçon à porter dans Ultima d'abord, pas à effacer. Et une propagation partielle se DIT, dépôts nommés : non dite, elle recrée la divergence qu'on vient de réparer.
⊕ **Payé de nouveau le 2026-09-30 au soir**, entre deux séances : RenoDevis #216 a
scellé une **v55** (`17bfa3d85d25`, la sixième occurrence de l'identifiant abrégé)
pendant qu'Ultima et RenoBoost portaient une **autre v55** (`5116d2f65529`, deux
leçons de la chaîne). Deux corps, un numéro — vu au conflit de fusion de la PR
RenoDevis #217. Réconcilié en **v58** depuis Ultima, l'ajout de #216 intégré tel
quel, puis recopié.

---

**UNE BRANCHE PARTIE D'UN `main` DÉPASSÉ DÉTRUIT LE TRAVAIL DES AUTRES**
*(2026-09-21)*. Une PR ouverte le matin, fusionnée le soir par Paul pendant que
Codex refondait la vitrine : 47 commits sur `main` entre les deux. J'ai résolu
son conflit **sur ma copie locale**, vieille de sept heures. Le diff proposé
aurait **supprimé 410 lignes** du travail fusionné entre-temps —
`leads-workspace`, `documents-workspace`, une migration SQL. *Ce que ça a
coûté* : rien, parce que j'ai lancé `git diff --stat origin/main HEAD` avant de
proposer et que les suppressions m'ont sauté aux yeux ; une régression massive
sinon, et invisible en revue puisqu'une PR « de deux fichiers Markdown » ne se
lit pas ligne à ligne. ⛔ **Sur un dépôt où plusieurs agents travaillent en
parallèle, une branche vieillit en HEURES.** *Règle* : avant tout push sur une
PR qui a attendu, `git fetch` puis fusionner `main` DANS la branche — et lire le
`--stat` du diff contre `main` : **toute suppression qu'on n'a pas décidée est
un retard, pas un travail**. Quand la branche est trop en retard, la refaire
depuis `main` coûte moins cher que la réconcilier.

**UNE BRANCHE FUSIONNÉE QUI SURVIT À DISTANCE EST UNE MINE À RETARDEMENT**
*(2026-09-22)*. Le 21/09, une branche partie d'un `main` dépassé aurait supprimé
410 lignes du travail d'un autre. Le 22/09 au matin, **la même faute s'est
représentée** — `claude/specs-hopus-update-xp9z1l` existait encore sur Ultima,
à `61babd4`, et poussée telle quelle elle effaçait **1 011 lignes** :
`Ultima-/EXPORT-METHODE-CHATGPT.md`, `Ultima-/CADRAGE-RESEAU-CERCLES.md`, les leçons v31.

⛔ **Ce n'est pas la même leçon deux fois : c'est la leçon, puis sa CAUSE.**
Se souvenir de vérifier ne suffit pas — la vérification est un geste humain, et
un geste s'oublie. Ce qui rend la faute POSSIBLE, c'est qu'une branche fusionnée
reste là et vieillit pendant que `main` avance. RenoBoost ne l'a jamais posé le
problème : le dépôt a « automatically delete head branches » activé, GitHub
supprime la branche à la fusion. Ultima ne l'a pas.

⇒ Deux gestes, dans cet ordre : **(1)** activer la suppression automatique sur
tout dépôt qui ne l'a pas — c'est le réglage qui supprime la classe d'erreur, pas
l'attention ; **(2)** tant qu'il manque, ne JAMAIS récupérer une branche
distante portant le nom qu'on veut : `git checkout -B <branche> origin/main`,
toujours, et `git diff --stat origin/main HEAD` relu avant chaque push.

⚠️ **Et une contrainte mesurée le même jour** : depuis une séance Claude Code
web, `git push origin --delete <branche>` répond « Everything up-to-date » et
**ne supprime rien** — le proxy refuse la refspec de suppression, en silence.
Trois tentatives, même résultat. Il n'y a pas non plus d'outil GitHub de
suppression de branche exposé. ⇒ Le ménage des branches est une action de Paul
dans l'interface, ou le réglage du dépôt. Ne pas y passer du temps depuis la
séance : ça ne marche pas, et l'échec est muet.

**UN DOCUMENT DE REPRISE POSÉ SUR UNE BRANCHE NON FUSIONNÉE EST INVISIBLE À LA
SÉANCE SUIVANTE** *(2026-09-30, Ultima + RenoBoost)*. Une séance neuve part de
`main`. Tant que la PR attend, le plan, le cadrage et la maquette n'y sont pas —
et aucun grain Finubar ne les pointe si on ne l'a pas écrit. ⛔ Un document de
reprise se juge **depuis `main`, à froid** : nomme-t-il la branche et les PR,
un grain y conduit-il, la première action est-elle univoque ? Sinon il n'est
pas fini, quelle que soit sa qualité.
*Incident : le plan de la chaîne a été déclaré prêt. La relecture adverse
confiée à Léo a répondu « pas fini pour une reprise à froid » : ni branche ni PR
nommées, aucun grain ne pointait le plan, deux règles se contredisaient sur le
premier geste. Cinq manques bloquants, corrigés dans le même passage.*
⊕ **Corollaire, payé le même soir** : dans ce conteneur, `RenoAgenda` et
`DATARENO-` sont clonés en minuscules (`renoagenda`, `datareno-`). La collecte
(`Ultima-/finubar/collecter.mjs`) les dit alors « semés mais non déclarés » et sort en
code 4. Elle se lance depuis un miroir de liens symboliques aux noms de
`Ultima-/finubar/depots.json` — le miroir est le dossier qui contient les dix
liens, et c'est DE LUI qu'on lance `node --preserve-symlinks
--preserve-symlinks-main Ultima-/finubar/collecter.mjs`, jamais depuis la racine
d'un dépôt, où le chemin ne résout pas.
Ne pas « corriger » `Ultima-/finubar/depots.json` : ce sont les noms réels des dépôts.

**UN DOCUMENT ÉCRIT POUR UN TIERS VIEILLIT PENDANT QU'ON L'ÉCRIT** *(2026-09-21)*.
Un rapport d'état des specs, demandé par Paul pour être confronté à Codex, livré
à 15 h. À 23 h le même jour, Codex avait refondu la page qu'il décrivait : sa
table « pattern → section » et ses numéros de ligne étaient caducs, mais rien
dans le document ne le disait — il se lisait comme un état courant. *Ce que ça a
coûté* : une relecture de Codex sur une carte périmée, évitée de justesse. ⛔ Le
réflexe de le RÉÉCRIRE est le mauvais : ses cinq écarts et leurs motifs étaient
la seule trace de ce qui avait été décidé et pourquoi. *Règle* : un document
d'état porte **sa date et son commit en tête**, et quand le monde a bougé on lui
ajoute un avertissement qui dit ce qui a changé et ce qui reste valable — on ne
le réécrit pas, on ne le supprime pas. Un instantané daté est utile ; un
instantané qui se croit courant est un piège.

**UNE CONSIGNE PÉRIMÉE DANS UN RAPPEL AUTOMATIQUE EST PIRE QUE PAS DE RAPPEL**
*(2026-09-22)*. Pendant trois jours et demi, chaque check-in que je me
reprogrammais portait : « les jobs GitHub meurent en 1-3 s, une CI rouge ne dit
rien du code — vérifier en local ». C'était vrai, mesuré, et ça a évité de
fausses chasses. La CI est revenue le 21/09 à 22h12 ; la phrase, elle, serait
repartie telle quelle dans le rappel suivant. *Ce que ça aurait coûté* : la
première vraie CI rouge après la panne, écartée d'un revers de main par une
séance qui suit sa propre note. *Règle* : un rappel qu'on se transmet d'un
passage à l'autre se RELIT à chaque fois comme on relirait celui d'un autre, et
toute consigne que la mesure du jour dément s'y retire **explicitement**, en
disant qu'elle est périmée et depuis quand — pas en disparaissant, sinon la
séance suivante la réinvente.

**UN DOC DE DESIGN ADAPTÉ D'UN AUTRE DÉPÔT PORTE LA DATE DE SA SOURCE, ET SE
RELIT QUAND ELLE BOUGE** *(2026-09-25)*. `RenoDevis/DESIGN-COCKPIT.md` (14/09) adaptait
les dix règles de `RenoBoost/DESIGN-LANGAGE.md` (11/09) — et interdisait les
arrondis. La source a été **refondue le 20/09** (cadres arrondis, Hopus), la
console l'a suivie le 22/09, les polices ont changé le 24/09 : trois jalons,
aucun n'a fait relire l'adaptation. C'est **Paul** qui l'a vu, devant l'écran :
« j'ai pas l'impression qu'on ait mis à jour avec les specs de la vitrine ».
⛔ Un document qui dit « adapté de X » est périmé le jour où X change, et rien
ne le signale — il se lit exactement comme un document à jour. Le réflexe :
avant toute passe visuelle, `git log` de la source amont depuis la date écrite
en tête de l'adaptation ; si elle a bougé, on relit AVANT de polir. *Le garde-fou
mécanique (plafond d'arrondis à zéro) protégeait la règle du 14/09 contre les
écrans, pas contre le temps.*

**LE `diff` INTER-DÉPÔTS N'EST PAS HORS DE PORTÉE : IL N'EST PAS EN CI**
*(2026-09-30)*. Le paragraphe ci-dessus disait « rien ne compare »
sans dire « en CI », et se lisait donc comme « la comparaison est hors de
portée tant que Paul n'a pas donné un secret ». C'est inexact : **une séance
qui a les dépôts attachés les compare sans aucun secret nouveau**, d'un `diff`
sur le disque. C'est ce `diff` qui autorise l'étape 3, et il se refait à chaque
propagation : **on ne présume pas qu'une copie est pure, on le vérifie avant
d'écraser.**

**UN CLONE EST UNE PHOTO, PAS UN ÉTAT — LE `diff` SE FAIT SUR `origin/main`**
*(2026-09-30)*. Ce jour-là, j'ai mesuré les dix copies **sur le
disque** et conclu que trois dépôts n'avaient pas le fichier. Faux : deux
l'avaient reçu quatre heures plus tôt, par une autre séance, et mes clones
datant de l'ouverture ne le savaient pas. **Un clone est une photo, pas un
état.** Toute mesure inter-dépôts se lit avec `git show origin/main:<fichier>`
après un `fetch`.

**DEUX SÉANCES QUI SCELLENT PRODUISENT DEUX RÉVISIONS DU MÊME NUMÉRO**
*(2026-09-30)*. Une autre séance a porté la source de
v44 à v47 pendant que je travaillais ; j'ai re-scellé depuis v44 et fabriqué
une **seconde v45**, `sha256:5949d1888628` là où la sienne portait
`8fc13b32c497`. Le numéro de révision est un compteur local, pas un
identifiant : **c'est le sha256 qui identifie, jamais le `v<n>`.** Avant de
sceller, relire le sceau sur `origin/main` — et si une autre séance est en vol
sur ce fichier, la propagation attend qu'elle ait atterri.

**PROPAGER UN FICHIER LU PAR UN HOOK, C'EST TROIS PIÈCES, PAS UNE**
*(2026-09-30)*. Un `memoire/LECONS.md` déposé seul dans un dépôt est
un fichier que **personne n'ouvre** : ce qui le fait lire à l'ouverture de
séance, c'est `.claude/lecons-rappel.mjs` **et** son enregistrement en
`SessionStart` dans `.claude/settings.json`. Les trois vont ensemble. Ce
jour-là, trois dépôts (`renoboost-console`, `Artidispo`, `DATARENO-`) portaient
le fichier **sans** le hook — n'en poser qu'une pièce donne l'apparence d'une
copie à jour sans qu'une seule leçon n'atteigne jamais une séance.

**LA CIBLE D'UNE PROPAGATION SE LIT DANS SA LISTE, ELLE NE SE COMPTE PAS DE MÉMOIRE**
*(2026-09-30)*. Ce fichier a annoncé « les huit dépôts » et « les sept autres »
jusqu'au 30/09, alors que la liste en portait **dix** : deux dépôts manquaient
à sa propre consigne de propagation. `ripair` reste dehors, et pour une raison
écrite — hors de `Ultima-/finubar/depots.json`, fork partagé avec un tiers.

**UNE BRANCHE ANCIENNE QUI REÇOIT `main` SE RELIT PAR SES APPELANTS, PAS PAR SES CONFLITS**
*(2026-10-23, mon-dpe.fr #250)*. Ouverte le 14/10, #250 a reçu `main` le 23/10 :
cinq conflits textuels ont été résolus, puis 1 315 tests et la CI sont passés au vert.
La revue Codex a pourtant relevé deux défauts P1 que ni les conflits ni les tests
ne montraient. Vitruve (#256, arrivé entre-temps) appelait `travauxProposables`,
que #250 avait restreinte à une seule PAC. Et le catalogue changeait sans changer
de version, alors que #256 s'en servait comme empreinte. Coût : un cycle de
correction et deux go de fusion de plus. Le go a aussi dû être redemandé parce
que `main` avait encore bougé entre la question et la réponse, et que la
question annonçait l'ancienne tête comme cible. Les défauts n'ont pas atteint la
production.
⇒ Après avoir fusionné `main` dans une branche ancienne, chercher sur `origin/main`
les appelants que `main` a AJOUTÉS pour chaque fonction et chaque donnée que la PR
modifie, et attendre la revue automatique avant de fusionner. Relire la tête de
`main` au moment de poser la question de fusion, puis juste avant de fusionner.

## 6. Économie

**ON NE DEMANDE PAS L'ACCORD DE FUSION TANT QUE PAUL RÉPOND ENCORE SUR LE FOND**
*(2026-11-05, Ultima #446 → #449)*. Une seule fiche d'idée (ADR-012) a produit
quatre PR et cinq CI complètes : à chaque fois, l'accord était demandé sur un SHA
pendant que des questions restaient ouvertes. La réponse suivante de Paul tombait
après l'accord, donc dans une nouvelle PR, puisqu'un commit de plus rend l'accord
caduc. Mesuré sur les check runs : 13 à 17 min par job navigateur, deux jobs par
exécution, alors que la règle « une PR par séance » vise une seule CI. La CI lourde
ne sautait jamais, parce que le diff portait `carto-idees.html` (généré) et un
test `.mjs`. ⛔ **Tant qu'une question de fond est posée à Paul, on committe et on
pousse, mais on ne demande pas l'accord : on le demande une fois, quand il n'a plus
rien à trancher.** S'il donne un accord et une correction dans le même message, on
fusionne le SHA approuvé et la correction attend la PR de clôture de la séance.

**LE GRAIN SE RELIT EN ADVERSAIRE AVANT LA PR, PAS APRÈS LE VERT** *(2026-11-03,
Ultima #441)*. Après une CI verte et juste avant l'accord de Paul, la relecture
du grain Finubar a trouvé « reste la fusion de #440 » alors que #440 était
fusionnée : un commit de plus, une CI complète (≈ 30 min, la PR touchant un
fichier de test) et un nouvel accord. ⛔ **Avant d'ouvrir la PR — et de nouveau
avant de demander l'accord —, chercher dans le grain tout ce que la séance a
rendu faux** : les fusions faites, les étapes accomplies, les « reste à ».

**UNE ROUTINE DONT L'ARRÊT DÉPEND D'UN OUTIL ABSENT NE S'ARRÊTE JAMAIS — ELLE COÛTE** *(2026-10-19)*.
La routine horaire « Réponse d'Henry » (créée le 28/09, session persistante) devait, si Henry
répondait, prévenir Paul puis se supprimer (`delete_trigger`) ; et, à partir du 02/10 sans réponse,
prévenir puis se supprimer. Dans une session DÉCLENCHÉE, ni Gmail ni `delete_trigger` n'existent :
elle répondait chaque heure « Rien de nouveau : les outils Gmail et `delete_trigger` restent
indisponibles », en relisant un contexte de 570 k tokens. Mesuré le 19/10 par `get_session`
(`external_metadata.usage.cost_usd`) : **268,5 $ au tarif catalogue**, 346,9 M tokens de cache lus.
Même schéma pour « Veille BTP » (quotidienne depuis le 13/08, Supabase absent, « Toujours
identique ») : **40,5 $**, un cache de ≈ 258 k tokens réécrit chaque jour. Aucune des deux n'était
visible de Finubar, qui indexe les DÉPÔTS, pas les routines ni les sessions : c'est Paul, en
demandant « regarde ce qui se passe sur les autres sessions », qui a fait lire les chiffres.
⛔ **Une routine reçoit une fin DURE à sa création** : un déclenchement unique (`run_once_at`), ou
une périodicité dont le prompt teste une chose qui existe dans toute session déclenchée (la date)
et s'arrête par un geste qu'elle sait faire — jamais une règle d'arrêt qui repose sur un outil
optionnel (`delete_trigger`, Gmail, Supabase) que la session déclenchée peut ne pas avoir.
⛔ **À chaque fin de séance : `list_triggers` (enabled) et le coût `get_session` des sessions
persistantes de ces routines** — une dérive de coût se lit en une ligne, elle ne se devine pas.
⚠️ Une session persistante relit TOUT son contexte à chaque réveil : un contrôle qui n'a pas besoin
de mémoire se lance en session neuve à chaque déclenchement (`create_new_session_on_fire`).
⚠️ `cost_usd` est un tarif catalogue, pas la facture : le forfait ou la console de Paul tranchent.

**UN `startup_failure` PARTOUT, `main` COMPRIS, C'EST LE COMPTE — PAS LE CODE** *(2026-10-19)*.
Depuis le 18/10 16:22 UTC, tous les workflows GitHub Actions tombaient en
`startup_failure`, `main` compris. J'ai cherché dans les fichiers de workflow (un
« workflow fantôme » supprimé) et noté « cause non établie ». La réponse était sur une
page que je ne peux pas ouvrir : Billing de l'organisation — budget Actions à 100 %
(« l'usage supplémentaire sera arrêté ») et autorisation de paiement refusée. Coût : la
CI absente en fin de séance, une PR sans contrôle GitHub, une piste fausse entretenue des
heures. ⛔ Une panne qui touche TOUS les workflows d'un compte à la fois : demander
d'abord à Paul les pages Billing (une capture suffit), pas fouiller le code. ⚠️ Le budget
s'arrête sans prévenir le dépôt : une alerte à 75 % se pose dans « Budgets and alerts »
(geste de Paul). Puis l'onglet Usage **groupé par dépôt** a tranché en une capture :
`Ultima-/.github/workflows/tests.yml` facturait ≈ 29 min par exécution (27 pour le
harnais navigateur), jouée même pour un commit de `.md`.

**UNE COMMANDE QUE LA PLATEFORME EXÉCUTE SE VÉRIFIE SUR LA PLATEFORME** *(2026-10-19)*.
RenoBoost : `ignoreCommand` de Vercel vert en local, sabotages compris, puis
`ERROR 127` au premier déploiement : `RenoBoost/.vercelignore` retirait
`RenoBoost/scripts/` AVANT l'exécution ; tout retour autre que 0 ou 1 casse le
déploiement. Commande déplacée dans `RenoBoost/vercel.json` : 365 caractères
pour une limite de 256, second `ERROR`. Coût : deux aperçus perdus, avant fusion.
⇒ Lire la doc du champ avant écriture et le journal du PREMIER déploiement ;
tester les limites découvertes (`RenoBoost/tests/vercel-ignore-build.test.mjs`,
`MAX_IGNORE_COMMAND`). Ne dépendre d'aucun fichier que la plateforme retire ;
ramener tout code inattendu à « construire ». Le local prouve la logique, pas le milieu.

*Rechute le même jour, Ultima-, `Ultima-/tests/unit-ci-md-seuls.mjs`* : trois
tentatives pour simuler un `grep` en panne. ① Faux binaire dans `os.tmpdir()` :
vert localement, inexécuté en CI sous `docker --tmpfs /tmp` (`noexec`), donc vrai
grep appelé. ② Fonction par `BASH_ENV` : verte sous `noexec` en root avec
l'environnement de séance, inactive en conteneur minimal (bash 5.2.21 sans
`SHLVL`, fichier pourtant lu ; cause non établie). ③ Lien symbolique vers
`node`, qui rejette les options de grep : fonctionne sans dépendre du montage
ou de l'environnement. Coût : trois CI, dont deux rouges malgré le banc local.

Le banc probant reproduit **ensemble** : utilisateur `nobody`, `env -i` (PATH et
HOME seuls), TMPDIR en tmpfs `noexec,nosuid,mode=1777`, dossier lisible par
`nobody` (hors `/tmp/claude-0`, remis en 700 par la séance). Il reproduit ② et
valide ③, suite complète 68/68. Le verrou « le faux grep MORD ici » désigne la
cause au lieu d'un simple `false`. ⛔ Trois sabotages affichés « rouge ✔ » étaient
en fait rouges pour `EACCES`, dossier illisible : imposer **la référence verte
AVANT**, puis vérifier le verdict attendu de chaque sabotage. Reproduire un seul
facteur n'est pas reproduire l'environnement.

**`pkill -f` AVEC UN MOTIF QUE SA PROPRE COMMANDE CONTIENT TUE LE SHELL** *(2026-10-12)*.
`pkill -f "next start -p 3123"` puis `pkill -f "http.server 8765"` : le motif
figurait dans la ligne de commande du shell qui l'exécutait — le shell s'est tué
lui-même (code 144), deux fois dans la séance, et une restauration de fichier
sabotage en dépendait. ⛔ Arrêter un processus par son **PID** (relu par `ps`,
avec un motif `[n]ext-server` qui ne se reconnaît pas lui-même), jamais par un
`pkill -f` sur une chaîne qu'on vient de taper.
*Rechute du 2026-10-19 (Ultima-, AMATSU)* : `pkill -f "http.server 8123"` en tête
de la commande qui devait committer et pousser — le shell s'est tué (code 144),
rien n'a été committé, l'étape a été rejouée. La leçon était injectée à
l'ouverture ; elle ne l'a pas empêché parce que le geste était un nettoyage
« en passant », pas une étape pensée.

**UN OUTIL LANCÉ PAR `npx` SANS INSTALLATION N'EST PAS L'OUTIL DU PROJET**
*(2026-09-15)*. `npx eslint .` a rendu « rien à signaler » deux fois avant que
je remarque l'absence de `node_modules` : npx téléchargeait une autre version,
qui plantait sur la configuration du dépôt (`Cannot find package 'globals'`) et
dont je ne lisais que la dernière ligne. Un lint qui ne prouve rien coûte plus
cher qu'un lint absent : il rassure. ⛔ *Avant de citer le résultat d'un outil
de projet, vérifier qu'on a lancé CELUI du projet — `npm install` d'abord, et
lire la sortie entière, pas son `tail`.*
⊕ **L'inverse est vrai aussi** *(2026-10-01)* : un `node_modules` qui EXISTE
mais date d'avant une fusion qui a touché `RenoDevis/package-lock.json` est un autre
outil que celui du projet. Sur `main` de RenoDevis, que la CI venait de passer
vert (680 tests), le premier passage local a rendu **673/680 et `tsc` rouge** —
`pdf-lib` et `@pdf-lib/fontkit`, ajoutés par #219, manquaient en local. `npm ci`,
puis 680/680 et `tsc` 0. Un rouge local après une fusion se remesure après
`npm ci` **avant** d'être cru — sans quoi on rapporte une régression qui
n'existe pas, et on la cherche.
**ÉCONOMIE DE CONTEXTE.** Sous-agents pour les gros volumes de lecture,
synthèses seulement dans le fil principal. Tiers de modèle économe par défaut ;
escalade **signalée** uniquement sur les sujets à risque — droits d'accès en
base, authentification, middleware, décision d'architecture.

**ON NE RAPATRIE PAS UN FICHIER ENTIER POUR EN LIRE UNE LIGNE** *(2026-09-11)*.
Mesurer l'état des huit copies de CE fichier demandait exactement **une ligne
par dépôt** : le sceau, en tête. J'ai rapatrié **cinq fichiers entiers** par
l'outil de lecture GitHub, qui ne sait pas tronquer — environ 110 Ko pour cinq
lignes utiles, dans une séance où le reste du travail avait encore besoin de
place. Le même constat s'obtenait pour rien :
`git show origin/main:<chemin> | head -1` sur un clone déjà là, ou un clone
superficiel là où il n'y en avait pas.
⛔ **Le réflexe qui manquait est une question, pas un outil** : *quelle fraction
du fichier répond à ma question ?* Si c'est une ligne, c'est `git` qui répond —
jamais l'outil qui rend le document complet.

⊕ **Et son corollaire, qui a bien tenu le même jour : ce qu'on DÉPLACE ne doit
pas traverser le contexte.** La propagation du fichier aux sept dépôts s'est
faite par clone, copie, commit, push — le contenu n'est jamais passé en
paramètre d'outil. L'écrire par un outil d'écriture distante aurait fait
transiter 22 Ko **sept fois**, pour un fichier qu'aucun de nous n'avait besoin
de relire. *Un octet qui passe par le fil coûte ; un octet que `git` déplace de
disque à disque ne coûte rien.*


