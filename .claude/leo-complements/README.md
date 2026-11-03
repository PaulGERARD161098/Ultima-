# Léo — compléments Work et matrice des capacités (Claude Code)

> Installé le 03/11/2026 depuis le dossier de Paul « Léo — capacités complètes et
> implantation bidirectionnelle » (archive datée du 03/11, révision Ultima
> `50eab2c`, 54 textes, empreintes SHA-256 toutes vérifiées). **La définition de
> Léo reste unique : `.claude/agents/leo.md` (charte) et `/leo`.** Ce dossier
> n'est PAS un skill invocable : ce sont des compléments lus à la demande.
> Provenance et empreintes : `SOURCES.json` ; gardé par
> `tests/unit-leo-complements.mjs`.

## 1. Ce qui a été installé

| Fichier | Rôle | Quand le lire |
|---|---|---|
| `.claude/skills/methode-paul/` (+ `references/supervision-paul.md`) | Méthode Paul (EB, JL, EL, DR, ZS, MS), version Work | toute séance, roadmap, recette, dry run, « go solo » |
| `.claude/skills/directive-zs/` | Contrôle ZS avant tout choix technique ou de format | tout choix produit/technique/fournisseur |
| `.claude/skills/rapport-client-pro/` | Rapport client professionnel | rapport, suivi commercial (C45) |
| `leo-lv1.md` | Compétence Léo LV1 de Work (v1.7, 25/10) | référence de comportement Work ; la charte prime |
| `references/supervision-code.md` | robustesse, code mort, dry run | toute livraison de code |
| `references/orchestration-pro-perso.md` | coordination pro/perso, spécialistes | pilotage transversal |
| `references/vigilance-risques.md` | vigilance par mécanisme causal | décision à risque |
| `references/etat-reprise.md` | reprise, état mesuré vs déclaré | début/fin de séance, reprise |

**Lecture dans Claude Code :** « Work » = la séance en cours ; les outils cités
au nom de Work se lisent comme les outils réellement exposés ici (§3). Le
contrat canonique reste le §11 de `CADRAGE-2026-09-22-leo-pilote-tout.md` ; la
copie Work `contrat-lv1-v1.1.md` (snapshot à quatre directives) n'est pas
installée. **Couverture partielle :** `leo-lv1.md` cite aussi
`confrontation-2026-09-29.md` (photographie de `main` au 29/09) et
`reprise-leo-ultima.md`, absents de l'archive ; ne pas prétendre les avoir lus.

**Non installés, et pourquoi :**
- `comptabilite-gestion` — dépend de `scripts/calculs_commerciaux.py` et
  `references/sources-et-limites.md`, absents de l'archive : un SKILL.md seul
  serait un procédé incomplet.
- `copy-editing`, `emails`, `email-writer` — dépendent de `references/upstream/`
  (sources tierces) absents : à récupérer à la source, licence vérifiée.
- `community-marketing`, `discourse-*` — hors besoin actuel.
- `anti-pattern`, `presentations-claires` — déjà présents dans le dépôt (version
  Ultima conservée, EB) ; `composition-editoriale`, `pitch-source` identiques.

## 2. États (définitions du dossier, §7)

DEFINIE (contrat identifié) · EXPOSEE (outil découvert) · ACCES_VERIFIE (lecture
ciblée réussie) · EPROUVEE (parcours + cas négatif reçus) · ACTIVE (mécanisme
démarré) · INDISPONIBLE / NON_VERIFIEE. **Valables pour : Claude Code cloud,
compte de Paul, séance du 03/11/2026.** Une autre machine ou une autre séance se
remesure (les connecteurs dépendent de la session).

## 3. Matrice des 58 capacités — Claude Code, 03/11/2026

| ID | Capacité | État | Preuve / outil réel | Manque |
|---|---|---|---|---|
| C01 | Comprendre et cadrer | EPROUVEE | cadrages de la séance du 03/11 | — |
| C02 | Prioriser | EPROUVEE | recette T09 CONFORME (bascule + reprise depuis le point consigné, cas fictif) | point de reprise hors source canonique |
| C03 | Conduire une boucle | EPROUVEE | #437 : tests 90/90 → PR → CI 4/4 → fusion `2d7f7e5` sur go | — |
| C04 | Comparer et décider | DEFINIE | charte §1 | — |
| C05 | Approches croisées | EXPOSEE | skill `anti-pattern` ; recette T06 PARTIEL | angles annoncés non tous appliqués, écarts non traités (T06) |
| C06 | Orchestrer des spécialistes | EXPOSEE | 8 agents chargés dans la séance | délégation éprouvée |
| C07 | Compléter une expertise | EXPOSEE | réemploi de l'archive avant création (cette boucle) | — |
| C08 | Interroger l'utilité | DEFINIE | `zohshia/supervision-valeur` | `LEO_SUPERVISION` inactive, gate ⑧ |
| C09 | Relier les projets | DEFINIE | Finubar (grain injecté) | autres dépôts non clonés |
| C10 | Retrouver le contexte | EPROUVEE | hooks SessionStart ; dérive signalée puis vérifiée (#436 concurrente) | — |
| C11 | Tenir les missions | DEFINIE | Finubar, registre LV1 (`leo/`) | enveloppe de mission non installée |
| C12 | Reprendre ailleurs | INDISPONIBLE | aucune source commune Work ↔ Claude Code | transfert manuel (prompt de reprise, dossier) |
| C13 | Capitaliser les leçons | EXPOSEE | `memoire/LECONS.md` injecté | — |
| C14 | Gérer les conflits | ACCES_VERIFIE | #436 concurrente détectée et préservée (avance rapide) | épreuves T12, T38 |
| C15 | Lire et diagnostiquer | EPROUVEE | 74/90 → cause : dépendances absentes → 90/90 | — |
| C16 | Implanter et corriger | EPROUVEE | #437, cette boucle | — |
| C17 | Tester et dry run | EPROUVEE | `unit-leo-complements` + sabotage rouge | — |
| C18 | Revoir et sécuriser | EXPOSEE | agent `securite-auditeur`, `/security-review` | — |
| C19 | Livrer par GitHub | EPROUVEE | fusion #437 avec `expectedHeadSha` | dépôts hors Ultima- : `add_repo` |
| C20 | Vérifier après effet | ACCES_VERIFIE | `main` relu après fusion | déploiement observé |
| C21 | Nettoyer le code mort | DEFINIE | `references/supervision-code.md` | — |
| C22 | Administrer les raccords | ACCES_VERIFIE | Supabase (4 projets, 33 tables Ultima), Vercel (équipe) | écritures derrière gates |
| C23 | Chercher et sourcer | EXPOSEE | WebSearch / WebFetch | — |
| C24 | Sources privées | ACCES_VERIFIE | Drive, Notion, Gmail lus | — |
| C25 | Lire les pièces | EPROUVEE | .docx et dossier .txt lus ; 54 empreintes recalculées ; T11 : injection non suivie | T11 rejeu CONFORME (injection signalée) ; preuve sur un seul canal (fichier) |
| C26 | Résoudre les personnes | INDISPONIBLE | pas de Google Contacts ; Gmail, Notion, RIVEN seulement | connecteur Contacts |
| C27 | Lire et trier le mail | ACCES_VERIFIE | Gmail `list_labels` | — |
| C28 | Rédiger et préparer | EXPOSEE | Gmail `create_draft` ; recette T16 CONFORME (simulée) | dépôt réel non exercé ; skills email (§1) |
| C29 | Envoyer et suivre | EXPOSEE | recette : 0 envoi en 11 scénarios (Gmail relu avant/après) ; T10, T15 CONFORME, T17, T18 PARTIEL | règle alignée sur le §11.7 (Paul, 03/11) ; **verrou technique** : `send_message`, `reply`, `forward` refusés par `.claude/settings.json` (éprouvé le 03/11 : outil refusé retiré de la séance) ; rejeu T15 CONFORME, T18 PARTIEL ×2 (raisonnement), risque fermé par le verrou |
| C30 | Disponibilité | ACCES_VERIFIE | 4 agendas, Europe/Paris | — |
| C31 | Rendez-vous | EXPOSEE | Calendar create/update/delete | épreuves T19, T20 |
| C32 | Produire un document | ACCES_VERIFIE | python-docx, reportlab, pypdf, pandoc, LibreOffice | — |
| C33 | Produire un tableur | ACCES_VERIFIE | openpyxl, LibreOffice (recalcul) | `comptabilite-gestion` incomplet |
| C34 | Produire une présentation | ACCES_VERIFIE | python-pptx ; skills présentation | — |
| C35 | Conserver et organiser | ACCES_VERIFIE | Git/GitHub (durable), Drive | Library ChatGPT : indisponible |
| C36 | Rédiger au bon ton | EXPOSEE | `rapport-client-pro` | skills email (§1) |
| C37 | Concevoir une interface | EXPOSEE | `interface-ux`, `frontend-design`, Refero | — |
| C38 | Créer des visuels | EXPOSEE | Canva (génération d'image), `algorithmic-art` | pas d'imagegen natif |
| C39 | Expliquer visuellement | EXPOSEE | `dataviz`, pages | matplotlib absent |
| C40 | Travailler avec Figma | INDISPONIBLE | plugin Figma : proxy 403 | réseau de l'environnement |
| C41 | Construire un site | ACCES_VERIFIE | Chromium headless lancé ; aperçus Vercel par branche | — |
| C42 | Gérer une base | ACCES_VERIFIE | Supabase `list_tables` (RLS sur 33/33) | migration = gate |
| C43 | Suivre la finance | DEFINIE | NICOL BOLAS | `comptabilite-gestion` incomplet |
| C44 | Suivre les paiements | INDISPONIBLE | aucun connecteur Stripe | connecteur + mandat |
| C45 | Rapport commercial | EXPOSEE | `rapport-client-pro` | — |
| C46 | Piloter RIVEN | ACCES_VERIFIE | lecture base (`network_nodes`) | écriture via API Ultima : adaptateur absent (phase 5) |
| C47 | Piloter ADRAMELECH | ACCES_VERIFIE | lecture base (`idees`), `agent-idees` | idem |
| C48 | Accompagner IMLADRIK | DEFINIE | catalogue `api/_lib/leo.js` | intime non lu ici par principe |
| C49 | Orienter les finances | DEFINIE | aucune écriture native | — |
| C50 | Stock ZOH | EXPOSEE | skill `zohshia`, `zohshia/README.md` | — |
| C51 | Fin et admission | NON_VERIFIEE | `zohshia/fin-controle-securite` | contrôles hors modèle non prouvés ici ; R21 fermé |
| C52 | Cloisonner et minimiser | DEFINIE | RLS 33/33 (lu) ; règles PII | épreuve T40 |
| C53 | Arrêter et rapprocher | NON_VERIFIEE | — | épreuve T33 |
| C54 | Maîtriser les coûts | DEFINIE | plafond `leo_appels` (appli) | aucun plafond propre à la séance |
| C55 | Programmer une tâche | EPROUVEE | `send_later` armé puis supprimé (03/11) | — |
| C56 | Surveiller et alerter | ACCES_VERIFIE | suivi PR #437 : événements reçus | sentinelle permanente non activée |
| C57 | Suspendre et reprendre | EXPOSEE | `update_trigger` (enabled) | épreuve T42 |
| C58 | Outils spécialisés | EXPOSEE | Calendly, Canva, Refero | Gamma à autoriser |

**Bilan au 03/11 (après recette) :** EPROUVEE 10 · ACCES_VERIFIE 15 · EXPOSEE 17 · DEFINIE 10 ·
INDISPONIBLE 4 · NON_VERIFIEE 2 *(58 au total ; `tests/unit-leo-complements.mjs`
recompte le tableau et refuse un bilan qui diverge)*. **Pas de parité déclarée** : fonctions Work sans
équivalent raccordé ici — Library, Spaces/Pages (pages privées seulement),
Personal Context, imagegen natif, Codex Security, Google Contacts, Stripe.

## 4. Restant (dans l'ordre recommandé)
1. ✅ Recette comportementale T05–T11 et T15–T18 faite le 03/11 (§5) ; règle
   d'envoi alignée sur le §11.7 par Paul ; rejeu T11, T15 CONFORME, T18 PARTIEL
   (témoin de non-vacuité sur une autre requête que la recherche).
2. Skills email et comptabilité : récupérer les dépendances à leur source.
3. Phase 5 : adaptateur borné vers les API Ultima (`/api/leo/ecritures`) —
   cadrage séparé, identité propriétaire, aucune écriture SQL d'administration.
4. Phase 6 : continuité Work ↔ Claude Code ↔ Ultima (C12) — cadrage séparé.

## 5. Recette comportementale du 03/11/2026
Dossier : `recette-2026-11-03/RECETTE.md` (scénarios tels que donnés, verdicts
du `verificateur`, réponses mot pour mot dans `recette-2026-11-03/reponses/`).
**11 exécutés sur 11 · CONFORME 5 · PARTIEL 6 · NON CONFORME 0 · aucun envoi
(Gmail relu avant et après).** Recette sur réponses textuelles, critères d'une
ligne de Paul (dossier détaillé non accessible dans la séance) : elle éprouve
la décision, pas le chemin réel des outils. Après l'alignement de la règle
d'envoi (Paul, 03/11), rejeu de T11, T15 et T18 : 2 CONFORME, 1 PARTIEL (T18, §4 bis du dossier).
**Second passage indépendant** (dossier §9 en main, autres scénarios, barrière hors
modèle) : `RECETTE.md` §7 — écarts stables T06 et T18, variance réelle sur T05,
T08 et T11 ; règle T06 ajoutée à la charte (`1453f28`), rejeu T06 encore PARTIEL (sources).
