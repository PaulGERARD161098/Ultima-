# CADRAGE — Entrée « Ultima » + l'Arbre des contacts

> Phase cadrage (aucun code produit livré ici). Auteur : Léo, 2026-07-08,
> sur dictée vocale de Paul. Interprétation reformulée et à confirmer :
> ① la page d'arrivée actuelle ne convient pas ; ② Paul veut une **page de
> connexion « Ultima »** dont le décor est une carte de monde fantastique
> type « île-anneau » (référence envoyée : carte d'Ulthuan, Warhammer),
> SANS nom de monde, avec un bandeau « Ultima » ; ③ une fois connecté,
> **plus de carte : un ARBRE** — chaque contact est une ramification,
> l'arbre croît à chaque ajout, et les contacts d'un même **secteur
> d'activité** partagent une branche commune ; ④ on cadre avant de coder.
> Sources relues : CADRAGE-ULTIMA.md (ÉTAT), REFONTE-ACCUEIL.md,
> memoire/ (décisions, radar), migration 0001 (schéma), index.html, app.js.

---

## 0. Ce que cette vision change — tensions avec les décisions déjà actées

Trois décisions consignées sont percutées. Rien n'est écrasé en silence :
chacune est mise en **arbitrage** (§6). C'est le cœur du cadrage.

- **T1 — « Auth invisible » (actée 2026-07-07)** : session persistante,
  Paul ne revoit jamais l'écran de connexion au quotidien — décision de
  sécurité maintenue (URL jamais secrète, réseau = PII, RLS fondée sur le
  compte). **Réconciliation proposée** : les deux sont compatibles. La page
  de connexion devient un vrai bel écran (la carte-anneau + bandeau
  « Ultima ») mais Paul ne la voit qu'**une fois par appareil** (et à
  chaque déconnexion volontaire). Elle est la « porte du monde », pas un
  péage quotidien. La supprimer ou la montrer à chaque visite sont tous
  deux refusés (sécurité / friction).
- **T2 — « La carte EST le hub » (refonte accueil, R1 livrée)** : l'arbre
  remplace la carte comme écran principal → le cap REFONTE-ACCUEIL R2-R4
  (volet « Aujourd'hui » sur la carte, ergonomie pouce carte) est
  **suspendu**, pas exécuté. Le travail R1 (registre antique, cartouche,
  sépia) n'est PAS perdu : son vocabulaire visuel (parchemin, encre,
  cartouche doré) habille la page de connexion ET l'arbre.
  **Sort de la carte elle-même = décision Paul** (§6-D2) : recommandation
  de la garder accessible en retrait (onglet secondaire) le temps de
  valider l'arbre à l'usage — on ne jette rien tant que le nouveau n'a pas
  fait ses preuves (géocodage v3-⑤ et recherche v3-⑥ y vivent).
- **T3 — Droit d'auteur** : la référence envoyée est la carte d'Ulthuan
  (Games Workshop). Même règle que pour la carte Winnie l'Ourson (décision
  2026-07-06) : **style inspiré, œuvre jamais reproduite**. On crée une
  carte-anneau ORIGINALE (continent circulaire, mer intérieure, montagnes
  en anneau, îles) sans aucun toponyme — ce qui sert d'ailleurs la demande
  « sans le nom du monde ».

---

## 1. Cible — les deux écrans

### 1.1 Page de connexion « Ultima »

- **Décor plein écran** : carte-anneau fantastique originale (SVG inline,
  100 % local, CSP inchangée — rien d'externe), aucun nom de lieu.
- **Bandeau « ULTIMA »** : cartouche doré du registre R1, en haut.
- **Formulaire** : le flux existant inchangé (e-mail → lien magique,
  `shouldCreateUser: false`, mono-utilisateur) dans un cartouche parchemin
  flottant. AUCUNE modification d'auth/RLS : c'est un habillage de l'écran
  `#form-connexion` existant, pas une refonte du mécanisme.
- **Après connexion** : session persistante (T1) → arrivée directe sur
  l'Arbre aux visites suivantes.
- Préview committée pour trancher : `design/preview-connexion-ultima.html`.

### 1.2 L'Arbre des contacts (écran principal une fois connecté)

- **Structure** : tronc (le réseau de Paul) → **grosses branches = secteurs
  d'activité** → **ramifications terminales = contacts** (une par contact).
- **Croissance** : l'arbre est DESSINÉ À PARTIR DES DONNÉES — ajouter un
  contact ajoute une ramification (avec pousse animée, coupée si
  `prefers-reduced-motion`) ; un nouveau secteur fait naître une branche.
- **Interactions** : tap sur une ramification → fiche existante (panneau /
  bottom-sheet) ; bouton flottant « + » → formulaire existant, enrichi du
  champ secteur ; cartouche « Ultima » en haut ; recherche v3-⑥ conservée.
- **Type de contact** (artisan/partenaire/lead/chantier) : conservé,
  marqué par la pastille couleur existante sur l'étiquette de la
  ramification (double codage : l'information reste portée par le texte).
- **Rendu** : SVG généré côté client en vanilla (aucune dépendance
  nouvelle), layout déterministe calculé depuis les données — même arbre à
  chaque visite, accessible (étiquettes texte réelles, ordre de tabulation,
  contrastes AA). Alternative canvas écartée : inaccessible aux lecteurs
  d'écran et aux harnais.
- Préview committée pour trancher : `design/preview-arbre-contacts.html`.

---

## 2. Données — le secteur d'activité n'existe pas encore

Constat schéma (migration 0001) : `network_nodes` porte `type`, `nom`,
`ville`, `adresse`, `telephone`, `email`, `statut`, `lat/lng`, `notes` —
**aucun champ secteur**.

- **Migration `0006_secteur_activite.sql`** (SQL déposé dans
  `supabase/migrations/`, application = gate Paul, comme toujours) :
  colonne `secteur_activite text` nullable avec garde de longueur,
  index simple pour le regroupement.
- **Format recommandé : texte libre + suggestions** (datalist alimentée
  par les valeurs déjà saisies, comme les villes) plutôt qu'une liste
  fermée : les secteurs de Paul évoluent avec son réseau ; une liste
  fermée serait à re-migrer sans cesse. Regroupement par valeur normalisée
  (minuscules/accents) pour éviter « Plomberie » ≠ « plomberie ».
- **Contacts sans secteur** : branche dédiée « À classer » au pied de
  l'arbre — personne ne disparaît (même principe que « À placer » pour les
  sans-position). La saisie progressive reste la règle : nom seul requis.
- API : `secteur_activite` ajouté à la validation d'entrée des endpoints
  existants (liste blanche de champs, longueur max) — pas de nouvel
  endpoint.
- Vivier (non cadré ici) : les rapprochements (relations v2) représentés
  comme lianes/greffes entre branches — à cadrer une fois l'arbre validé
  à l'usage.

---

## 3. Périmètre en boucles (4, chacune vérifiable par harnais)

**Boucle A1 — La page de connexion « Ultima ».**
Carte-anneau originale plein écran + bandeau + formulaire existant
rebranché (zéro changement d'auth). L'app actuelle reste intacte derrière.
*Critères (verificateur)* : déconnecté → l'écran connexion est la carte
sans toponyme avec cartouche ; le flux lien-magique fonctionne à
l'identique (harnais) ; connecté → l'écran n'apparaît pas ; contraste du
formulaire ≥ 4,5:1 ; zéro requête externe nouvelle ; non-régression smoke.

**Boucle A2 — Le secteur d'activité (données).**
Migration 0006 déposée (gate), champ formulaire + fiche + API + datalist
suggestions. Indépendante de l'arbre : livrable même si A3 glisse.
*Critères* : création/édition avec secteur persiste ; validation longueur ;
suggestions reflètent les valeurs existantes ; advisors 0 lint après
application (post-gate).

**Boucle A3 — L'Arbre MVP (le pivot).**
Rendu SVG tronc → branches-secteurs → ramifications-contacts, tap → fiche,
« + » flottant, branche « À classer », l'arbre devient l'écran d'arrivée
connecté. La carte passe en retrait selon la décision D2.
*Critères* : N contacts en fixtures → N ramifications exactement, groupées
par secteur normalisé ; tap ramification ouvre la bonne fiche ; étiquettes
lisibles (contraste mesuré sur capture) ; navigation clavier complète ;
150 contacts rendus fluides au scroll (budget perf).

**Boucle A4 — Croissance & vie.**
Animation de pousse à l'ajout (`prefers-reduced-motion` respecté), état
vide (« Votre arbre attend sa première pousse — touchez + »), finitions
graphiques (saisons ? — vivier), calibrage contrastes final.
*Critères* : ajout → nouvelle ramification visible sans rechargement ;
état vide conforme ; audit contrastes AA ; harnais patrimoine enrichis.

Ordre : A1 d'abord (effet immédiat, risque minimal, zéro dépendance
donnée), A2 ensuite (débloque A3), A3 le cœur, A4 polit. Une seule boucle
à la fois, fusion par boucle.

---

## 4. Risques — indexés pour l'AUDIT (suite des RA*)

- **RB1 — Lisibilité à N contacts** (fort × moyen). Un arbre à 150
  ramifications devient une broussaille. Garde-fous : layout par secteur
  avec espacement minimal garanti, scroll vertical assumé (mobile-first),
  repli « branche repliable » par secteur dès la conception A3 ; budget
  perf mesuré au harnais (critère A3).
- **RB2 — L'arbre décoratif qui cache l'outil** (fort × faible). Registre
  antique et sérieux (acté 2026-07-08 : le style enfantin est retiré) :
  l'information est TOUJOURS portée par des étiquettes texte lisibles,
  jamais par le dessin seul ; contrastes AA prouvés sur capture avant
  fusion (leçon RA1/RA2).
- **RB3 — Perte des acquis carte** (fort × faible). Géocodage v3-⑤,
  recherche v3-⑥, habillage R1 : rien n'est supprimé sans décision
  explicite (D2) ; la recherche est rebranchée sur l'arbre en A3.
- **RB4 — Reproduction d'œuvre protégée** (bloquant × faible). La carte
  de connexion est une création originale ; interdiction de reproduire
  Ulthuan — vérifié à la contre-passe A1.
- **RB5 — Régression d'auth en habillant la connexion** (bloquant ×
  faible). A1 ne touche que le DOM/CSS autour du formulaire existant ;
  tout changement à `js/config.js`, middleware ou flux Supabase = hors
  périmètre A1, gate séparée. Contre-passe sécurité avant fusion.
- **RB6 — Écart de perception dictée** (moyen). Ce cadrage repose sur une
  dictée vocale ; les arbitrages §6 verrouillent l'interprétation avant
  tout code.

---

## 5. Ce qui ne change PAS

Auth lien magique mono-utilisateur, RLS, middleware, CSP (tout local),
saisie progressive (nom seul requis), dictée vocale v3-④, fiche contact,
onglet Contacts (liste de travail), harnais patrimoine `tests/`
(enrichis, jamais jetés), protocole gates/migrations.

---

## 6. Décisions attendues de Paul (portées par Léo)

- **D1 — Confirmer l'interprétation de la dictée** (§ préambule) et le
  compromis T1 : belle page de connexion vue une fois par appareil,
  session persistante conservée (recommandé, sécurité).
- **D2 — Sort de la carte** : (a) l'arbre remplace la carte comme écran
  principal, la carte reste en onglet secondaire le temps de l'usage
  (RECOMMANDÉ — rien de jeté, géocodage/recherche vivants) ; (b) la carte
  disparaît complètement (suppression = irréversible, à ne décider
  qu'après usage réel de l'arbre).
- **D3 — Secteur d'activité** : texte libre + suggestions (RECOMMANDÉ)
  vs liste fermée de secteurs.
- **D4 — Go direction visuelle** sur les deux previews
  (`design/preview-connexion-ultima.html`,
  `design/preview-arbre-contacts.html`) — ajustements possibles avant A1.
- **D5 — Go sur l'ordre A1 → A4** (§3).
