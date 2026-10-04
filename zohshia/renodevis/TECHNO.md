# ZOH SHIA · RénoDevis — la techno

> **Premier élément de ZOH SHIA, le dragon de la technologie** (Paul, 04/10/2026).
> Ce fichier dit **de quoi RénoDevis est fait et où chaque pièce vit**. Le
> geste « ajouter un artisan » est dans `AJOUTER-UN-ARTISAN.md`, à côté.
>
> ⛔ **Il ne recopie pas le code, il le POINTE.** Chaque pièce renvoie au
> fichier de RénoDevis qui la porte. Les listes (variables, routes, tables,
> tâches planifiées) ne sont pas écrites à la main : elles sont **mesurées**
> par `collecter.mjs` dans `inventaire.json`, et `tests/unit-zohshia.mjs`
> rougit si ce document en oublie une.
>
> ⛔ **Des noms, jamais des valeurs.** Aucun secret, aucune adresse, aucun
> identifiant de devis ni d'artisan. Ce dossier n'est **pas déployé**
> (`.vercelignore`) : il vit dans le dépôt privé, jamais sur le site public.
>
> **Mesuré sur** : voir `inventaire.json` → `source.commit`. Avant de
> s'appuyer sur ce document, relancer la collecte (voir `../README.md`).

## 1. La pile

| Couche | Ce que c'est | Où |
|---|---|---|
| Application | Next.js (App Router) + TypeScript, déployée sur Vercel | `app/`, `components/`, `lib/` |
| Base | Supabase (Postgres + Auth + Storage), **base PARTAGÉE** avec RénoBoost, RénoAgenda et RénoPredict | `supabase/migrations/` (partiel, voir §5) |
| Relevé de chantier | Application hors-réseau embarquée (React), remontée explicite | `releve/` |
| Tâches planifiées | Crons Vercel, protégés par `CRON_SECRET` | `vercel.json` + `app/api/cron/` |
| Portes de qualité | `npx tsc --noEmit` · `npm test` · `npm run build` (pas de lint, délibéré) | `CLAUDE.md` de RénoDevis |

## 2. La chaîne, du relevé à la relance

Un dossier est **un devis** (`devis`), qui naît `brouillon` et avance :

| Maillon | Ce qui se passe | Où ça vit |
|---|---|---|
| Relevé | Visite sur place, saisie hors-réseau, conditions de TVA réduite capturées | `releve/`, `app/releve/actions.ts` |
| Chiffrage | Lignes depuis le catalogue (prix de VENTE seulement, l'achat reste serveur), TVA calculée par `lib/tva.ts` | `lib/tva.ts`, `lib/tarifCatalogue.ts`, vue `catalogue_vente` |
| Devis | Création à la main, à la voix ou depuis un devis proche du corpus ; contrôles avant validation | `app/devis/nouveau/`, `lib/controleDevis.ts`, `lib/modeles.ts` |
| Envoi | Mail « au nom de » l'artisan (voie A) ou depuis son domaine (voie C) | `lib/expediteur.ts`, `docs/EXPEDITEUR-ARTISAN.md` |
| Suivi | Lien par JETON (révocable), ouvertures tracées, devis « chauds » | `app/d/[token]/`, `relance_liens` |
| Signature | Par jeton, côté serveur | `app/d/[token]/actions.ts` |
| Paiement | Stripe Connect, destination charge : la plateforme ne détient aucun fonds | `lib/stripe.ts`, `app/api/stripe/webhook/` |
| Relance | Le moteur prépare, l'artisan valide (mode `valide`) | `app/api/cron/relances/`, `lib/cellule.ts`, `relance_gabarits` |
| Facture | Facture client miroir, factures fournisseurs rattachées au devis | `app/devis/[id]/`, `app/api/devis/[id]/facture-fournisseur/` |

## 3. Les routes serveur (mesurées)

`/api/bibliotheque/catalogues` · `/api/bibliotheque/documents` ·
`/api/bibliotheque/matrices/neutre-court` · `/api/bibliotheque/matrices/sola-air` ·
`/api/bibliotheque/reno/fiche` · `/api/bibliotheque/reno` · `/api/corpus/[id]/pdf` ·
`/api/cron/prevenance` · `/api/cron/relances` · `/api/cron/stripe-embarquement` ·
`/api/cron/sync-email` · `/api/devis/[id]/documents` ·
`/api/devis/[id]/facture-fournisseur` · `/api/devis/extraire` · `/api/devis/proposer` ·
`/api/reno/retour` · `/api/reno` · `/api/sms/stop` · `/api/stripe/webhook`

## 4. Les services externes

| Service | Rôle | Sans lui |
|---|---|---|
| Supabase | Base, comptes, fichiers | Rien ne tourne |
| Stripe Connect | Paiement en ligne, un compte connecté par artisan | Aucun bouton de paiement, le reste fonctionne |
| Resend | Envoi des mails (devis, relances, retours) | Aucun mail ne part |
| Gmail | Synchro des devis envoyés hors plateforme | Synchro arrêtée (503), rien ne casse |
| Twilio | SMS de relance — **canal muet** depuis le 05/08 | Rien (dégradation propre) |
| Anthropic | Assistant Réno | Réno répond « non configuré » |
| mon-dpe.fr | Audit PAC, appelé par HTTP (le moteur ne se recopie **jamais** ici) | L'écran d'audit s'annonce indisponible |
| RénoBoost / hub | Extraction PDF, page devis historique | Extraction indisponible |

## 5. Les tables que ce dépôt NE SAIT PAS créer — le verrou du clonage

Le code les lit, aucune migration de RénoDevis ne les crée : elles vivent dans la
base partagée, créées ailleurs (RénoBoost, le hub). **Tant que cette liste n'est
pas vide, une instance neuve ne se reconstruit pas depuis le seul dépôt.** C'est
pourquoi l'option retenue le 04/10 est d'ajouter un artisan à la plateforme
existante, pas de cloner l'instance.

`catalogue_icestream` · `clients` · `devis` · `devis_events` · `feedbacks` ·
`profiles` · `relance_queue` · `sentinelle_etat`

## 6. Les règles de RénoDevis qui comptent pour dupliquer

Elles sont écrites et justifiées dans le `CLAUDE.md` de RénoDevis ; on ne les
recopie pas, on les nomme pour qu'aucune ne soit oubliée :

- **La base est partagée** : tout retrait de droit se vérifie sur les quatre dépôts.
- **Aucune détention de fonds** (A5) ; **vendeur hybride** (A1, repli côté artisan) ;
  **commission sur le HT** (A3).
- **Les prix d'achat ne descendent jamais dans le navigateur** (F-A4).
- **Le taux de TVA se recalcule toujours**, jamais recopié d'un devis (`lib/tva.ts`).
- **Le manuel gagne, l'auto propose** (Directive IA).
- **La requête d'empreinte** du `CLAUDE.md` de RénoDevis est la preuve en base
  de chaque lot : c'est elle qu'on rejoue après avoir ajouté un artisan.
