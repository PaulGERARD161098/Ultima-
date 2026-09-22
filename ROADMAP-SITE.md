# ROADMAP-SITE — Ultima (carte réseau)

> Mise à jour : 2026-07-02 (P0). Le backlog chiffré (U#) vivra dans
> `AUDIT-<date>.md` généré en P1 — ce fichier ne liste que le cap.

## Livré en P0 (MVP)

- Carte Leaflet/OSM plein écran, marqueurs colorés par type (artisan,
  partenaire, lead, chantier) + légende, relations en traits typés.
- Filtres type + statut ; fiche nœud en panneau latéral ; ajout de nœud ;
  création de relation depuis la fiche.
- Mode démo (config Supabase vide) avec jeu de données d'exemple — le site est
  visualisable avant même la création du projet Supabase.
- Responsive mobile (filtres repliables, fiche plein écran), contrastes AA,
  tap targets ≥ 44 px, toasts sobres.

## Livré le 2026-07-06 (hybride v1×v2, arbitrage Paul)

- Relations pilotables depuis la fiche : statut (idée → contact établi →
  en cours → fructueux / arrêté), arrêt justifié obligatoire, une seule
  relation active par paire/type, traits de la carte modulés par statut.
- Journal « où j'en suis » dans la fiche : entrées datées sur le nœud ou une
  relation, prochaine étape, date de relance, case « relance faite ».

## Prochaines étapes — cap Interface v3 (cadrage dicté 2026-07-06, voir PRODUIT.md)

1. ✅ 2026-07-06 — **Accueil « Bienvenue, Paul »** livré : carte de livre
   d'enfance (parchemin/encre/Caveat auto-hébergée), relances dues en panneaux
   de bois (cocher « Fait » sans quitter l'Accueil), pilotage par statut,
   suggestions R1-R4, raccourcis, barre d'onglets Accueil/Carte/Contacts
   (Contacts provisoire). 43 verdicts navigateur + non-régression, AA prouvé.
2. ✅ 2026-07-06 — **Onglet Contacts** livré : liste triée + recherche
   insensible casse/accents, saisie progressive (nom seul requis, position
   optionnelle, badge « À placer »), harnais smoke-contacts (20 verdicts).
3. 🟡 **Déploiement Vercel** : repo prêt (repli publiable, zéro env) — reste
   l'import du repo sur vercel.com/new (action Paul, 2 min, gratuit).
4. ✅ 2026-07-07 — **Saisie vocale** par champ (Web Speech API, sans clé) :
   micro sur les 4 champs de texte libre, fr-FR, ajout sans remplacement,
   clavier prioritaire, progressive enhancement (Firefox : aucun bouton),
   harnais smoke-dictee 17 verdicts + contre-passe 28 verdicts. PR #16
   (fusion = go Paul, contient U6 middleware).
5. ✅ 2026-07-07 — **Géocodage** d'adresse (Nominatim/OSM) : « Trouver sur la
   carte » sous le champ Adresse, endpoint interne `/api/geocode` (politique
   Nominatim respectée : 1 req/s, User-Agent, cache front), suggestions,
   aperçu carte, lat/lng repliés « Coordonnées précises (avancé) » [U10+U11].
   PR en attente de fusion (go Paul). Vivier : U12 clic-carte, U13 dictée
   adresse.

## Cap Refonte Accueil (dicté 2026-07-07 — cadrage : REFONTE-ACCUEIL.md)

Vision : la carte de France antique (direction B « Age of Mythology » actée
sur previews) devient l'écran d'arrivée ; fusion Accueil × Carte ; les
contenus v3-① revivent dans un volet « Aujourd'hui » ; auth invisible (actée,
jamais supprimée). Boucles ordonnées :

1. ✅ 2026-07-07 — **R1 — Habillage antique** fusionné (PR #20, contre-passe
   GO) : sépia par paliers, voile Ptolémée, cadre parchemin, cartouche
   ULTIMA, arrivée au boot sur la Carte (Accueil par onglet) ; harnais
   smoke-antique au patrimoine. Vivier R4 consigné dans CADRAGE (z-index
   spec, trait sous-traitance, rose des vents, preuve RA1/RA2 en prod).
2. **R2 — Fusion Accueil × Carte** : volet « Aujourd'hui » (bottom-sheet),
   barre réduite à Carte · Contacts, badge chiffré des relances.
3. **R3 — Ergonomie pouce + auth invisible** : « + » flottant, fiche en
   bottom-sheet, session persistante (une connexion par appareil).
4. **R4 — Finitions** : monstres marins, rose des vents, garde-fous perf
   (risques RA1-RA5 du cadrage).

## Vivier (impact × effort, après le cap v3)

1. ✅ 2026-07-06 — Supabase réel branché côté front (config URL + clé
   publiable, sortie du mode démo) [U4] et écriture connectée réparée [U1-U3].
   Restent 2 actions Paul : env Vercel (API) + Site URL/Redirect auth
   (voir CADRAGE, Actions humaines).
2. Géocodage d'adresse à la saisie (éviter la saisie manuelle lat/lng) —
   Nominatim/OSM d'abord (gratuit), en respectant leur politique d'usage.
3. ✅ 2026-07-07 — Recherche texte (nom/ville) + zoom sur résultat [v3-⑥,
   U14-U17] : instantanée dès 2 caractères, halo d'encre, « + Ajouter »
   pré-rempli à 0 résultat, hors filtres avec annonce, dictée en
   remplacement. PR en attente de fusion (go Paul). U18 au vivier (→ R2).
4. Fiche relation complète (intérêt qualitatif, efforts 1..5 — déjà en base/API).
5. Regroupement de marqueurs (clustering) au-delà de ~100 nœuds.
6. ✅ 2026-09-22 — Import des contacts de l'iPhone (vCard `.vcf` → registre
   `personnes`) : `CADRAGE-RIVEN-IMPORT.md` (+ audit §7 bis), PR #285. Suites
   demandées par Paul : revue contact par contact, puis sécuriser RIVEN (§7).
   L'import CSV reste au vivier.
7. Filtrage par zone dessinée (préparation de tournée).
8. Vue liste synchronisée à côté de la carte (survol croisé — motif
   systeme-commercial).

## Cap actuel — Pivot Arbre (dicté 2026-07-08, livré 2026-07-09)

L'entrée d'Ultima devient une **page de connexion « Ultima »** (carte-anneau
originale) et, une fois connecté, **un arbre des contacts remplace la carte**
comme écran principal (branches = secteurs d'activité, ramifications =
contacts). La carte reste un onglet secondaire (D2a — géocodage/recherche y
vivent). Boucles A1-A4 livrées (PR #24, `REFONTE-ARBRE.md`). Suspend
REFONTE-ACCUEIL R2-R4 (registre R1 réutilisé, rien de jeté).

Suites livrées le **2026-07-11** (solo, détail dans CADRAGE ÉTAT) :
- **Registre antique et sérieux** aligné (PR #28) : purge des résidus
  « enfantins » (police manuscrite Caveat + panneaux de bois) → typo
  old-style système + plaques de parchemin.
- **RB2 verrouillé** (PR #29) : contrastes bannière secteur + aide connexion.
- **Gate auth durcie** (PR #32) : `auth.getUser()` sur les 5 endpoints.
- **Arbre responsive en largeur** (PR #34) : paliers 3→6 colonnes selon
  l'écran, mobile pixel-identique — validé par Paul.
Gates dashboard restantes : `RUNBOOK-GATES.md`.

## Hors périmètre assumé (revoir plus tard)

Temps réel multi-postes, rôles avancés, app mobile native, analytics.

## Décisions actées

- Leaflet/OSM (gratuit, pas de clé exposée). Bascule Google Maps = décision
  Paul (clé + coût API).
- Vanilla HTML/CSS/JS, zéro framework — cohérence avec l'écosystème existant.
