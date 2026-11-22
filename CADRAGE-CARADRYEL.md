# CADRAGE-CARADRYEL — le scriptorium : centraliser les écrits de Paul

> Dicté par Paul le 2026-11-22 : *« on crée Caradryel, nouveau projet, au même
> titre qu'Imladrik — centralisation de mes écrits, avec un accès direct à mon
> Drive perso pour chacun ; en visu permanent : Lettres à Léo, Vies volées,
> Catabasis, Anabasis ; qu'il m'aide à bien écrire et garder la cohérence de
> mes écrits. Cadre et maquette ça. »*
> Boucle **C0** : ce cadrage + la maquette statique
> `design/preview-caradryel.html`. **Zéro code produit, zéro migration.**

## 0. Interprétation retenue (dictée vocale)

- **Caradryel** = un **cap d'OMEGA**, frère d'IMLADRIK (`js/registre-lv3.mjs`,
  `omega.enfants`), pas un cap *sous* IMLADRIK. → arbitrage A1 si Paul le veut
  dans IMLADRIK.
- **« Accès direct à mon Drive »** = depuis chaque écrit, **un geste** ouvre le
  Google Doc d'origine. Le texte reste écrit **dans Google Docs** ; Ultima ne
  reconstruit pas d'éditeur.
- **« Visu permanent »** = les quatre œuvres restent visibles sur tous les écrans
  de Caradryel (la boussole à la porte, puis un rail latéral dans l'atelier).
- **« Qu'il m'aide »** = **Léo**, la seule interlocutrice d'Ultima (pas d'agent
  nouveau). ⚠️ Ambiguïté signalée en A2 : *Lettres à Léo* s'adresse-t-il à Léo,
  l'agent ?

## 1. Constat mesuré (Drive, lecture des métadonnées seules, 22/11)

Les quatre œuvres **existent déjà**, en Google Docs étoilés, dans le Drive de Paul
(le contenu n'a pas été lu) :

| Œuvre | Créée | Dernière modif. | Remarque |
|---|---|---|---|
| Lettres à Léo | 25/10/2026 | 17/11/2026 | doublon `.docx` plus ancien (25/10) à côté |
| Vies volées | 27/08/2026 | 01/11/2026 | même dossier que Catabasis |
| Catabasis | 21/08/2025 | 22/11/2026 | la plus volumineuse |
| Anabasis | 22/11/2026 | 22/11/2026 | ouverte aujourd'hui, presque vide |

Deux dossiers parents distincts. Un doc « Léo » (1 Ko, avril) existe aussi :
il n'entre pas dans le périmètre sans l'avis de Paul.

**Côté Ultima, l'existant à réutiliser (EB)** : OAuth Drive d'IMLADRIK déjà
construit (`api/_lib/drive.js` : PKCE, cookie d'état signé, jeton chiffré,
scope minimal `drive.file`, endpoints `api/imladrik/drive/*` dont
`disconnect`) ; la forme boussole Lv3 ; le panneau de Léo présent sur
toutes les pages ; le plafond de 100 appels de Léo par 24 h. ⚠️ L'état réel du
branchement Drive en production (variables posées ? compte connecté ?) **n'est
pas mesuré** : il se lit via `/api/imladrik/drive/status` en C1.

## 2. Format 6 points (Directive EL)

**① Le but.** À la fin du chantier, Paul ouvre Caradryel et voit ses quatre
œuvres. D'un geste, il ouvre l'une d'elles dans Google Docs. Il demande à Léo
une relecture : style, ou cohérence avec la « bible » de l'œuvre et avec les
autres œuvres. Léo répond en citant le passage. **Ligne MS :** cette boucle ne
rapproche **d'aucun client ni contrat**. C'est du perso, assumé : elle sert
l'objectif propre du perso (écrire mieux, finir les textes). Si une publication
est visée (édition, concours), elle devient l'indicateur → question A4.

**② Les étapes.** Une boucle à la fois, chacune fermée avant la suivante :

| Boucle | Livre | Gate |
|---|---|---|
| **C0** (ici) | cadrage + maquette statique | — |
| **C1** la porte | entrée `caradryel` au registre Lv3, coque `caradryel.html` (boussole des 4 œuvres), table `caradryel_oeuvres` (titre, `drive_file_id`, statut, ordre ; RLS par propriétaire) ; « Ouvrir dans Drive » alimenté **après connexion** seulement | migration = **rouge** (Paul l'applique) |
| **C2** le lien Drive | Google Picker (scope `drive.file`) : Paul **choisit** ses 4 docs une fois, et Ultima ne voit que ceux-là. Lecture du texte par `files.export` (`text/plain`) | revue sécurité (auth/données) |
| **C3** la relecture | Léo relit une œuvre à la demande : style (rythme, répétitions, voix), avec citation du passage. Lecture seule, rien n'est écrit dans les Docs | plafond Léo inchangé |
| **C4** la bible | Léo **propose** des fiches de cohérence (personnages, lieux, chronologie, motifs, règles de voix) ; Paul valide ; puis contrôle croisé entre œuvres (Catabasis ↔ Anabasis : descente et remontée) | migration `caradryel_fiches` = rouge |

**③ Les moyens.** Fichiers : `js/registre-lv3.mjs`, `caradryel.html` + `js/caradryel.js`
(motif des coques Lv3), `api/caradryel*.js`, réemploi de `api/_lib/drive.js`
(et non une copie), `supabase/migrations/…_caradryel.sql`, harnais
`tests/smoke-caradryel*` + `tests/unit-caradryel*`.
**Ligne ZS** (sources du 22/11/2026 ci-dessous) :

| Option | Verdict |
|---|---|
| **Docs reste l'éditeur, Ultima indexe et Léo relit** (Picker + `drive.file` + export) | **retenue** : capacité native d'un service déjà en place, API officielle, 0 € (Google Cloud gratuit, acté le 30/07), scope minimal, aucun éditeur à construire |
| Éditeur intégré à Ultima, avec les textes en base | écartée : copie des textes intimes, double vérité avec Drive, des semaines de code |
| Scope `drive.readonly` (tout le Drive) | écartée : Ultima verrait tout le Drive pour lire 4 fichiers |
| Projet Claude ou Gemini dans Docs, sans Ultima | plus rapide aujourd'hui, mais **hors d'Ultima** (JL) et sans bible persistante ; écartée comme destination, acceptable comme dépannage pendant C1–C3 |

Sources : Google, « Choose Google Drive API scopes » et « Google Picker —
web apps » : `drive.file` donne accès aux seuls fichiers que l'utilisateur ouvre
avec le Picker ou partage avec l'application
(developers.google.com/workspace/drive/api/guides/api-specific-auth ;
…/drive/picker/guides/web-picker, consultées le 22/11/2026).

**④ Les critères de réussite (vérifiables).**
- C1 : sans session, `caradryel.html` ne sert **aucun** titre ni lien Drive
  (harnais avec verrou de non-vacuité : la page s'est bien chargée). Avec session,
  4 œuvres affichées, et chaque lien ouvre le bon Doc.
- C2 : un Doc **non choisi** dans le Picker renvoie un refus Google
  (le garde-fou s'éprouve du côté contournable).
- C3 : une relecture cite au moins un passage **présent mot pour mot** dans le
  Doc (contrôle automatique). Aucun texte d'œuvre dans les logs serveur
  (balayage des logs du test).
- C4 : une contradiction **plantée volontairement** dans un Doc de test est
  détectée (l'instrument est validé sur un cas dont on connaît la réponse).

**⑤ Ce qu'on ne fait PAS.** Pas d'éditeur dans Ultima, pas d'écriture de Léo dans
les Docs (v1 : lecture seule), pas d'autre écrit que les 4 sans l'accord de Paul,
pas de publication, pas de partage, pas de traitement du doublon `.docx`
(c'est à Paul d'en décider), pas de nouvel agent.

**⑥ Pre-mortem — « Caradryel a échoué : pourquoi ? »**
1. *Paul n'y va jamais : il écrit dans Docs et Caradryel fait un détour.* →
   La porte est un tremplin : 1 geste vers Docs. Léo est appelable depuis la page.
   On mesure les ouvertures (comptes seuls).
2. *Léo invente une incohérence, ou lisse la voix de Paul.* → Toute remarque cite
   son passage, sinon elle n'est pas affichée. Léo signale, elle ne réécrit pas sans
   qu'on le lui demande. Règle « des remarques, pas du jugement ».
3. *Fuite d'intime* (texte dans les logs, dans le HTML servi, chez un tiers). →
   Régime §5 intégral : fail-closed, aucune donnée en dur, texte jamais stocké ni
   journalisé, seules les fiches validées vont en base. L'envoi à l'API Claude
   est assumé et dit à Paul (A3).
4. *Coût* : relire 4 œuvres à chaque question. → Relecture à la demande, une
   œuvre à la fois. Mise en cache du prompt pour le texte, et le plafond des
   100 appels s'applique.
5. *Le Picker ne voit pas les docs, ou le jeton expire.* → Lien de repli
   toujours affiché (l'URL du Doc enregistrée en C1), et `drive/status` le dit
   en clair.
6. *Dérive de périmètre* (tous les écrits, carnets, journal MAEDRETHNIR…). →
   Les 4 d'abord. Une œuvre de plus = une ligne en base, sur décision de Paul.

## 3. Pilotage back-office (règle du 13/10)

Le contrôle est prévu dès C1, dans l'administration d'Ultima : quels Docs
sont autorisés, la dernière lecture par Léo (date, œuvre, jamais le texte),
la déconnexion Drive en un clic (`disconnect`, déjà construit), et un
interrupteur « relecture Léo » coupé par défaut tant que C3 n'est pas éprouvé.
Il est utilisable avant la première lecture réelle.

## 4. Sécurité (résumé, régime §5 de CADRAGE-CONSOLE)

Données intimes : RLS par propriétaire, fail-closed, pas de mode démo.
`drive.file` seulement. Jetons chiffrés au repos (déjà en place). Aucun texte
d'œuvre dans les logs, dans les erreurs ou dans le HTML servi. La maquette ne
porte **que les titres** (donnés par Paul en clair) et des exemples **fictifs
marqués comme tels** : aucun identifiant de fichier, aucun extrait réel.

## 5. Arbitrages attendus de Paul

- **A1** Caradryel est-il un cap d'**OMEGA** frère d'IMLADRIK (reco), ou un cap
  *dans* IMLADRIK ?
- **A2** *Lettres à Léo* : la destinataire est-elle Léo, l'agent ? Si oui,
  Léo relit-elle ces lettres comme les autres œuvres, ou les tient-elle à part ?
  (reco : à part, relecture de style seulement, sur demande explicite)
- **A3** Accord de principe : le texte d'une œuvre peut partir vers l'API
  Claude le temps d'une relecture (rien n'est stocké). Sans cet accord, C3 et C4 n'existent
  pas.
- **A4** Y a-t-il un horizon de publication (édition, concours, date) ? Si oui,
  il devient l'indicateur MS du projet.
- **A5** Le blason : une plume dressée et un dragon enroulé autour (reco,
  écho de Kalamn-talaen), ou autre.

## 6. Points de vue à éprouver (Paul choisit lesquels creuser)

- **L'adversaire** — quelqu'un qui obtient une session ou un log : *quel
  texte intime peut-il lire ? Le scope Drive le laisse-t-il sortir des 4 Docs ?*
- **Paul-auteur, un soir, sur son téléphone** : *combien de gestes entre l'envie
  et la phrase écrite ? Caradryel aide-t-il, ou ajoute-t-il un écran de plus ?*
- **Un éditeur ou un lecteur exigeant** : *la bible tient-elle sur 4 œuvres
  et sur des années ? La voix de Paul reste-t-elle la sienne après les remarques
  de Léo ?*
