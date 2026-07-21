# CADRAGE — RESHIRAM & ZEKROM (le doublet réel ↔ idéal)

> Deux **consoles autonomes** de la boussole LV2 (décision Paul 2026-07-21 :
> autonomes, jamais fusionnées en une division), **reliées par une passerelle**.
> Ce cadrage est co-localisé parce que la passerelle les traverse — il ne les
> fusionne pas. Cadrage seul : **aucun code**. Source amont : `CADRAGE-CONSOLE.md`
> §2bis (registre des caps).

## 0. Le principe des deux caps (rappel figé)

- **RESHIRAM — « le travail de la réalité »** : le **réel**, le concret. Rien
  d'idéalisé ; chaque élément adossé à un **fait, un chiffre, une preuve**.
- **ZEKROM — « la quête de l'idéal »** : les **idéaux, volontés, idées hautes**,
  le **cap directionnel** (motivation, sens). Console qui doit **faire rêver**.
- **Concurrence, pas opposition** : l'écart mesuré réel↔idéal EST le plan de
  route. L'un nourrit l'autre.

## 1. RESHIRAM — console « le travail de la réalité »

**But.** Cartographier et travailler la **réalité concrète** de ce que Paul
sait/peut faire : talents, capacités, plus-values, réseau, réalisations — pour
savoir précisément **ce qu'il peut réellement proposer**.

**Objets (modèle de données, à confirmer) :**
- **Talents / savoir-faire** — réels, chacun **adossé à une preuve** (une
  réalisation, un chiffre). Ex. BTP : métré, coordination de chantier, relation
  artisan… Niveau réel, pas auto-idéalisé.
- **Capacités / moyens mobilisables** — temps réellement disponible, outils,
  capital, réseau activable.
- **Plus-values** — ce qui distingue concrètement Paul, **chiffré si possible**.
- **Réalisations / preuves** — chantiers faits, projets livrés (le socle
  factuel des talents).
- **Réseau réel** — **ne pas dupliquer TRAVELER** : RESHIRAM en lit une **vue
  « capital réseau »** (qui je connais, dans quel secteur) et pointe vers les
  fiches TRAVELER. Reco Léo : lien, pas copie.

**Fonctions visées (v1 mini, à cadrer par boucle) :**
- Cartographie visuelle des talents (registre carte savante).
- Saisie **ancrée sur preuve** : Léo challenge l'auto-complaisance (« sur quoi
  tu bases ça ? un fait, un chiffre »).
- Vue synthèse « **mon offre réelle** » (ce que je peux proposer aujourd'hui).
- Lecture de capacité réelle (temps/ressources dispo).

**Règle cardinale.** Aucune projection, aucun idéal ici — **uniquement du
concret vérifiable**. Ce qui relève du rêve part dans ZEKROM.

## 2. ZEKROM — console « la quête de l'idéal »

**But.** Capter et structurer les **idéaux, volontés et idées hautes** de Paul :
le **cap directionnel** qui oriente la motivation, la pensée et la
conceptualisation des projets. Console **inspirante**.

**Objets (modèle de données, à confirmer) :**
- **Idéaux / visions** — les grandes aspirations (vers quoi Paul veut aller).
- **Volontés / intentions directionnelles** — un idéal formulé en **cap**.
- **Projets idéaux** — les projets rêvés (pas encore réels), libres de la
  contrainte du réel.
- **Sens / valeurs** — ce qui donne la direction (⚠️ chevauche IMLADRIK, cf. §4).

**Fonctions visées (v1 mini) :**
- Espace d'expression **libre** (dictée), sans censure par le réel.
- Formulation « un idéal → une direction » (le cap).
- Registre visuel qui **fait rêver** (sans jamais sacrifier lisibilité/sécu).

**Règle cardinale.** Ici, on **n'idéalise pas moins** : le réel ne bride pas
l'expression. Le lien au réel se fait **via la passerelle**, pas en censurant.

## 3. La passerelle réel ↔ idéal (le cœur du doublet)

Mécanisme qui relie les deux consoles autonomes :

- **Rétroplanning idéal → réel** : partir d'un idéal/projet ZEKROM → le
  confronter à RESHIRAM (**quels talents/capacités réels je possède, lesquels
  manquent**) → en déduire **de quoi j'ai besoin, à quoi ça correspond, comment
  on le fait, combien ça coûte, sur quelle durée** (analyse de besoin long
  terme).
- **Enrichissement bidirectionnel** (« qu'est-ce qui nourrit quoi ») : au survol
  d'un item RESHIRAM, Léo montre quel idéal ZEKROM il peut servir ; et
  inversement, un idéal ZEKROM montre les talents réels qui pourraient le
  concrétiser.
- **Analyse de coût/besoin** : chaque projet (réel comme idéal) porte un
  **besoin chiffré sur la durée**. Reco Léo : **déléguer le calcul à NICOL
  BOLAS** (finance) plutôt que de le dupliquer.
- Traduction visuelle déjà posée sur la boussole : la **passerelle pointillée**
  entre les deux caps (LV2-①). Ici on cadre la passerelle **de données**.

## 4. Articulation avec les quadrants (anti-duplication) — reco Léo

- **RESHIRAM ↔ TRAVELER** : le réseau réel **vit dans TRAVELER** ; RESHIRAM en
  lit une vue, n'en copie rien.
- **ZEKROM ↔ ADRAMELECH** : ADRAMELECH = **bibliothèque d'idées** (quoi faire,
  souvent exécutable) ; ZEKROM = **idéaux/direction** (le pourquoi, vers où,
  faire rêver). ZEKROM **se nourrit** d'ADRAMELECH sans le remplacer.
- **ZEKROM ↔ IMLADRIK** : IMLADRIK = dév. perso **opérationnel** (journal,
  objectifs datés, valeurs) ; ZEKROM = **aspirations directionnelles**. Frontière
  à confirmer par Paul (risque de recouvrement le plus fort).

## 5. Sécurité

Auto-évaluation, talents, idéaux = **données personnelles/introspectives**. Le
§5 de `CADRAGE-CONSOLE.md` s'applique : **auth, RLS, jamais en logs**,
chiffrement au repos à évaluer (comme IMLADRIK/NICOL BOLAS). Les consoles
n'exposent que des données **derrière auth**.

## 6. Arbitrages ouverts — décisions attendues de Paul

1. **Frontières §4** : valider RESHIRAM↔TRAVELER (lien, pas copie) et surtout
   **ZEKROM↔IMLADRIK↔ADRAMELECH** (où s'arrête chacun ?).
2. **Modèle de données** : nouvelles tables Supabase (talents, idéaux, liens) —
   la conception SQL est une **gate** (migration = validation Paul).
3. **Passerelle v1** : lien **manuel** (Paul valide les rapprochements réel/idéal)
   ou **auto** (Léo propose) ?
4. **Analyse de coût** : autonome dans R/Z, ou **déléguée à NICOL BOLAS** ?
   (reco : déléguée.)
5. **Périmètre v1 de chaque console** : tranché au mini-cadrage de sa boucle,
   pas maintenant (pas de spéculation).
6. **Ordre** : commencer par **RESHIRAM** (le réel — socle factuel, alimente le
   rétroplanning) puis **ZEKROM**, ou l'inverse ? (reco Léo : RESHIRAM d'abord.)

> Prochaine étape après validation : mini-cadrage de la **première console**
> (reco : RESHIRAM), puis conception du modèle de données (gate migration).
