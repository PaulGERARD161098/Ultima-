# ADRAMELECH — Bibliothèque d'idées

> Registre de capture du quadrant ADRAMELECH (cadrage : `CADRAGE-CONSOLE.md`
> §3.3). Tant que la boucle ADRAMELECH n'a pas livré sa base et son interface,
> les idées sont capturées ici — format structuré, prêt à être importé tel
> quel. Cap du quadrant : **ne jamais rater une idée**, classer, rapprocher,
> enrichir, trier pro/perso/business, chercher la cohérence avec le reste
> d'Ultima.
>
> Chaque idée : ID `ADR-###`, nom attribué, reformulation fidèle à la dictée,
> enrichissement (pistes pour la rendre concrète), liens inter-segments,
> statut (`brute` / `à raffiner` / `exploitable` / `close`).
>
> **Direction pour la boucle ADRAMELECH** (vision Paul 2026-07-16, cadrée dans
> `CADRAGE-CONSOLE.md` §3.3) : à l'échelle, l'agent `agent-idees` fera des
> **regroupements automatiques par thème** (archipels cohérents), du **tri
> pertinent plutôt que de la donnée brute**, et des **ponts entre idées** —
> sans jamais en perdre aucune. Le champ **Thème** ci-dessous est l'axe de
> regroupement de départ ; le renseigner avec soin à chaque capture prépare
> ce tri. La carte `carto-idees.html` est le socle visuel qui grandira.

---

## Classement stratégique — AD-5b (volet analyse, 2026-07-16)

> Sortie du volet analyse stratégique (grille des 7 blocs, cadrage
> `CADRAGE-ADRAMELECH.md` §8). Chaque idée passée à la grille, scorée /10
> (pondération actée : **Temps ×2 + Rémunérateur ×2**, dénominateur 7), et mise
> en concurrence mécanique avec le socle rémunérateur **Renoboost IA** (chantiers
> + installations à domicile). Le détail vit dans le bloc « Analyse stratégique »
> de chaque idée. Chiffres [hyp.] = à instruire.

| Rang | Idée | Score pondéré | Rôle vs Renoboost IA | Verdict |
|---|---|---|---|---|
| 1 | **MYCÉLIUM** (ADR-004) | **8,1**/10 | multiplicateur | Top 3 — démultiplie le socle à capex ~0 |
| 2 | **INTENDANT** (ADR-003) | **7,9**/10 | enabler | Top 3 — dérisque le socle, fabrique les victoires |
| 3 | **PROTÉE** (ADR-002) | **6,3**/10 | montée en puissance | Top 3 — extension disciplinée du socle |
| 4 | GLANEUR (ADR-001) | 5,0/10 | satellite | Hors top 3 — retenir le *service* (débarras chantier), ajourner l'*entreprise* |

**Lecture système (l'essentiel).** Ce ne sont pas 4 paris indépendants mais **un
moteur qui se renforce** : **PROTÉE** industrialise le socle → **INTENDANT**
fabrique les victoires (chantiers sans manquant) → **MYCÉLIUM** transforme chaque
victoire en 2 clients → et les surplus détectés par INTENDANT + les chantiers de
PROTÉE **alimentent GLANEUR**. Le top 3 n'est donc pas « les 3 meilleures idées »
mais **les 3 rouages du même socle** ; GLANEUR est le satellite qui vit de leurs
déchets.

**Ce que la grille a prouvé (test de la pondération).** La pondération vitesse +
rentabilité **écarte GLANEUR** (seule idée à capital lourd et rampe longue : son
score *baisse* à 5,0) et **révèle les 3 leviers adossés au socle** (INTENDANT et
MYCÉLIUM montent parce qu'ils sont quasi gratuits et immédiats). La grille élimine
bien — elle ne se contente pas de classer.

**Séquence de démarrage recommandée** (⏳ décision Paul — « par lequel commencer »).
L'ordre du score n'est pas l'ordre d'exécution ; la dépendance logique commande :
1. **INTENDANT en premier** — le moins cher (**3-8 j-h [hyp.]**, zéro actif),
   dérisque le socle *tout de suite* et **fabrique la matière première de
   MYCÉLIUM** (les victoires). Version *outil interne* d'abord (SaaS ajourné).
2. **MYCÉLIUM ensuite** — capex ~0, se déploie sur l'outillage TRAVELER existant,
   mais **a besoin des victoires** de l'INTENDANT pour ne pas tourner à vide.
3. **PROTÉE en parallèle/fond** — le vrai moteur de revenu, mais lourd (BFR aides,
   certifications, recrutement) : la démarrer **bridée** (frigoriste↔PAC + une
   aide maîtrisée), élargir sur preuve de trésorerie.

**Incertitudes maîtresses à instruire avant tout capital** : le **BFR de portage
des aides** (PROTÉE, potentiellement plusieurs dizaines de k€ [hyp.]) ;
l'**adoption quotidienne** de l'INTENDANT (tenir la saisie) ; le **coefficient de
propagation réel** de MYCÉLIUM (0,08-0,25 [hyp.], pas la cible de 2).

---

## ADR-001 — GLANEUR

*Nom : glaner, c'est ramasser ce que les autres laissent — registre ancien et
noble (les Glaneuses), fidèle à l'esprit du projet.*

- **Capturée le** : 2026-07-16 (dictée vocale de Paul)
- **Type** : business
- **Thème** : bâtiment · économie circulaire · logistique
- **Partenaire envisagé** : Godefroy
- **Statut** : à raffiner

### L'idée

Monter un **service de récupération des invendus et des matériaux jetés du
bâtiment**, en trois étages qui se nourrissent l'un l'autre :

1. **La tournée de collecte** : un camion fait le tour des grandes surfaces de
   bricolage — cible prioritaire : les magasins **Leroy Merlin** — pour
   récupérer les invendus, les fins de série et tout ce qui part à la benne.
   Beaucoup de matériaux bruts encore parfaitement utilisables sont jetés.
2. **La mise à la benne payante pour artisans** : service couplé — on vient
   directement sur les chantiers récupérer ce qui n'est pas nécessaire
   (chutes, surplus, dépose), et on **facture les artisans** pour ce
   débarras qu'ils devraient sinon décharger eux-mêmes. La collecte est donc
   rémunérée deux fois : par l'artisan qui s'en débarrasse, puis par la
   revente.
3. **L'entrepôt** : un lieu pour stocker et exposer la matière récupérée, puis
   faire de l'**achat-revente** et de la **mise à disposition de stock**
   (distribution).

### Enrichissement (pistes pour rendre l'idée exécutable)

- Modèle à double revenu (débarras facturé + revente) : la marchandise a un
  coût d'acquisition nul ou négatif — c'est la force du modèle.
- Points à instruire : cadre réglementaire des déchets du bâtiment (statut de
  « déchet » vs « réemploi », agréments éventuels), convention de reprise avec
  les enseignes (Leroy Merlin a des obligations REP bâtiment depuis 2023 —
  angle d'approche possible : leur simplifier cette obligation), coût
  camion + entrepôt vs volume collecté.
- Voisinage existant : ressourceries du bâtiment / plateformes de réemploi —
  à cartographier pour se différencier (l'angle « service aux artisans sur
  chantier » est le différenciant).

### Liens inter-segments

- **TRAVELER** : Godefroy (partenaire pressenti) ; le réseau d'artisans
  d'Ultima est le vivier naturel des premiers clients « mise à la benne ».
- **BALTHAZAR GELD** : à terme, structure à part — pilotage financier séparé.

### Analyse stratégique

> Première fiche stratégique ADRAMELECH (boucle AD-5, volet 2). Grille éprouvée
> sur l'idée pilote. Ligne de base du benchmark : le cœur rémunérateur d'Ultima
> = **chantiers + installations à domicile**. Les valeurs chiffrées absentes du
> registre sont marquées **[hyp.]** — à instruire, pas à tenir pour acquises.

#### A. Positionnement — Océan Bleu/Rouge et 5 forces

**Grille ERRC** (référentiel : ressourceries du bâtiment, plateformes de réemploi, bennes/déchetteries classiques)

- **Exclure** — le tri en aval déporté sur le client final ; l'attente que l'artisan transporte lui-même ses déchets ; le modèle « plateforme passive » qui attend le dépôt.
- **Atténuer** — la dépendance à une seule enseigne (Leroy Merlin comme unique source amont) ; le poids du stock dormant en entrepôt (matière qui ne tourne pas).
- **Renforcer** — la revente à coût d'acquisition nul/négatif ; la couverture géographique par tournée fixe (fiabilité de passage).
- **Créer** — le **service de débarras facturé sur chantier** couplé à la collecte (le double revenu), inexistant chez les acteurs de réemploi ; l'angle « on vous simplifie votre obligation REP » vendu à l'enseigne.

**5 forces de Porter**

- **Rivalité intra-secteur — moyenne.** Ressourceries et plateformes existent mais sont mal positionnées sur le service aux artisans *sur chantier* ; la concurrence frontale sur la revente de matériaux est réelle mais fragmentée.
- **Nouveaux entrants — fort.** Barrière à l'entrée faible sur le principe (un camion, un local) ; c'est un métier facilement copiable une fois la preuve faite. Le contrat d'enseigne est le seul vrai fossé.
- **Substituts — fort.** La benne classique et la déchetterie restent le réflexe par défaut, souvent moins chers à l'usage pour l'artisan pressé ; le don direct entre chantiers existe déjà gratuitement.
- **Pouvoir des fournisseurs (enseignes + artisans amont) — fort.** Leroy Merlin peut internaliser, changer de prestataire, ou imposer ses conditions ; sans convention de reprise signée, le gisement amont n'est pas sécurisé.
- **Pouvoir des clients (acheteurs de matière) — moyen.** Acheteurs opportunistes, sensibles au prix ; pas de fidélité forte, mais la matière à bas coût donne de la marge de manœuvre.

**Conclusion.** Océan **bleu sur un segment étroit** — le *débarras chantier facturé couplé à la revalorisation* — mais **rouge sur ses deux extrémités** (la revente de matériaux d'occasion et la collecte amont d'enseigne, où d'autres sont déjà installés et où la barrière d'entrée est basse). Le bleu n'est défendable que si le contrat d'enseigne et la relation artisan tiennent lieu de fossé.

#### B. Diagnostic — SWOT croisé (TOWS)

**Forces (internes)** — coût d'acquisition matière nul/négatif ; double revenu ; réseau d'artisans TRAVELER déjà là (vivier de clients « mise à la benne ») ; adossement possible au socle chantiers (matière captive via PROTÉE/INTENDANT).
**Faiblesses (internes)** — intensité capitalistique (camion + entrepôt) ; besoin de volume pour amortir les fixes ; compétence logistique/négociation d'enseigne non détenue aujourd'hui ; structure « à part » = dispersion du dirigeant.
**Opportunités (externes)** — obligation REP bâtiment des enseignes depuis 2023 (angle d'entrée) ; pression réglementaire et image sur le réemploi ; hausse du coût de mise en décharge qui rend le service plus attractif.
**Menaces (externes)** — cadre réglementaire déchet/réemploi contraignant (agréments, statut de « déchet ») ; internalisation par l'enseigne ; substituts moins chers ; entrants faciles.

**Axes issus des croisements**
- **FO (offensif)** — brancher le réseau d'artisans TRAVELER sur le service débarras, et vendre à Leroy Merlin le « on absorbe votre REP » : les deux forces adressent les deux meilleures opportunités. **C'est l'axe le plus fort.**
- **WO (réorientation)** — la faiblesse capitalistique se compense en démarrant *sans entrepôt* : commencer par le service débarras chantier (revenu immédiat, actif léger), l'entrepôt/revente en phase 2 une fois le flux prouvé.
- **WT (survie)** — sans convention d'enseigne signée et sans clarté réglementaire, ne pas engager le capital lourd : tester le débarras facturé seul avant tout achat de camion/bail.

#### C. Business model — Lean Canvas chiffré

**Segments clients** — (1) artisans du réseau (payeurs du débarras) ; (2) enseignes de bricolage (source amont, cible d'un contrat de reprise) ; (3) acheteurs de matière revalorisée (particuliers bricoleurs, petits artisans, autoconstructeurs).
**Proposition de valeur** — « on vous débarrasse vos déchets de chantier moins cher et plus simple qu'une benne, et on revend la matière encore bonne à petit prix ».
**Canaux** — réseau TRAVELER (bouche-à-oreille artisan), convention d'enseigne, entrepôt-vitrine + revente en ligne [hyp.].
**Sources de revenus** — **double** : (a) facturation du débarras à l'artisan ; (b) revente de la matière (marge quasi totale, acquisition nulle/négative).
**Structure de coûts** — camion (achat/loc + carburant + entretien), entrepôt (loyer + charges), main-d'œuvre (chauffeur-manutentionnaire), assurance/réglementaire, temps dirigeant.

**Besoins réels chiffrés** — *toutes valeurs [hyp.], à instruire ; le registre ne porte aucun chiffre.*
- **Camion** — VUL type fourgon/benne 3,5 t. Occasion à l'achat **15-30 k€** ; ou location **800-1 200 €/mois** [hyp.]. Recommandation de séquencement : **location d'abord** (préserve le cash, évite l'immobilisation avant preuve de flux).
- **Entrepôt** — **300-800 m²**, à **5-15 €/m²/mois** selon zone → **2-8 k€/mois** [hyp.]. Reportable en phase 2 (cf. axe WO).
- **Personnes / ETP** — démarrage à **1-2 ETP** [hyp.] : 1 chauffeur-manutentionnaire plein temps + dirigeant (Paul/Godefroy) à temps partiel. Le métier est physique et chronophage : la manutention est le vrai goulot.
- **Cash pour tenir avant équilibre** — fixes mensuels estimés **4-11 k€/mois** [hyp.] (loc camion + entrepôt + 1 salaire chargé). Pour tenir **6-12 mois** : **25-130 k€** de trésorerie [hyp.]. La fourchette est large parce que le point mort dépend entièrement du volume amont, non connu.
- **Extrapolation de revenu [hyp., illustrative]** :
  - *Débarras* : 20 artisans actifs × panier 150 €/passage × 2 passages/mois = **6 000 €/mois**.
  - *Revente* : 40 m³/mois collectés × 80 €/m³ valorisé = **3 200 €/mois**.
  - Total ordre de grandeur **≈ 9 000 €/mois** de produit — à comparer aux **4-11 k€** de fixes : **le modèle n'est à l'équilibre qu'au-delà d'un seuil de volume qu'il faut prouver empiriquement**, pas garanti au démarrage.

#### D. Risque — Prémortem (2-3 ans, GLANEUR a échoué)

- **Réglementaire.** Le statut « déchet » impose agréments/traçabilité que la structure n'a pas ; la revente est bloquée ou alourdie. — *Signal avancé : premières collectes faites « au feeling » sans clarifier le statut juridique de la matière ; pas de conseil réglementaire sollicité avant le premier camion.*
- **Volume / logistique.** Le gisement amont est trop faible ou trop dispersé ; les tournées coûtent plus qu'elles ne rapportent ; l'entrepôt se remplit de matière qui ne tourne pas. — *Signal avancé : taux de remplissage camion < 50 %, stock dormant qui gonfle, rotation entrepôt qui s'allonge.*
- **Cash.** Les fixes (camion + bail + salaire) brûlent la trésorerie avant que le flux ne s'installe. — *Signal avancé : point mort repoussé mois après mois, marge par tournée sous les fixes au 3e mois.*
- **Dépendance enseigne.** Tout repose sur Leroy Merlin ; l'enseigne internalise, change de prestataire, ou ne signe jamais. — *Signal avancé : engagement resté verbal, jamais de convention écrite ; source unique jamais diversifiée.*
- **Concurrence / substituts.** Une ressourcerie voisine ou la benne classique restent moins chères ; l'entrant facile copie le service local. — *Signal avancé : artisans qui renégocient à la baisse dès le 2e passage, churn client précoce.*
- **Dispersion du dirigeant.** Structure « à part » qui détourne Paul du socle rémunérateur sans atteindre sa masse critique. — *Signal avancé : heures dirigeant sur GLANEUR croissantes pendant que le chiffre du socle stagne.*

#### E. Scoring /10

- **Simple — 3/10.** Trois métiers en un (logistique de collecte, négociation d'enseigne, revente/stock) ; actif lourd ; réglementaire déchet. Loin d'un lancement léger.
- **Efficace — 6/10.** L'angle service-débarras-sur-chantier résout un vrai point de douleur artisan de façon nette ; le mécanisme est clair, l'exécution est le risque.
- **Rémunérateur — 6/10.** Double revenu et acquisition nulle = marge structurellement forte *par unité* ; mais l'équilibre est conditionné au volume et mange du capital avant de payer.
- **Utile — 8/10.** Réemploi, réduction déchets, service concret aux artisans, adossement REP : utilité économique et environnementale élevée.
- **Temps — 3/10.** Camion + entrepôt + convention d'enseigne + cadre réglementaire = mise en route longue ; le socle, lui, tourne déjà.

**Pondération.** Par défaut égale → **(3+6+6+8+3)/5 = 5,2/10**.
**Recommandation de pondération pour Paul** : privilégier **Temps** et **Rémunérateur** (contexte : « on ne retient que 3 idées, pas le temps pour plus » → la vitesse de retour compte double). Suggestion ×2 sur ces deux critères :
(3×1 + 6×1 + 6×**2** + 8×1 + 3×**2**) / 7 = (3+6+12+8+6)/7 = **5,0/10**. La pondération orientée vitesse/rentabilité *baisse* le score — GLANEUR est justement faible là où Paul a le moins de marge.

#### F. Benchmark obligatoire vs cœur rémunérateur

Mise en concurrence mécanique avec le socle **chantiers + installations à domicile** :

- **Rapporte-t-elle plus / mieux / plus vite ?** — **Non, pas en l'état.** Le socle génère du revenu *immédiat*, avec des compétences *déjà détenues* et un actif *déjà amorti*. GLANEUR exige capital neuf (camion, entrepôt), compétences neuves (logistique, négo d'enseigne) et une rampe de plusieurs mois avant équilibre incertain. Sur les axes qui comptent pour Paul (Temps, Rémunérateur nets de mise de fonds), **le socle bat GLANEUR**.
- **Complète-t-elle ou disperse-t-elle ?** — **Elle complète, mais par le bas et par synergie, pas comme entreprise rivale.** Les artisans du réseau TRAVELER sont des clients « mise à la benne » naturels ; PROTÉE (déposes/surplus) et INTENDANT (lignes commandées non posées) *alimentent* la matière de GLANEUR. La synergie est réelle et déjà notée au registre. Mais montée en structure autonome « à part », elle **disperse** le dirigeant hors du socle.

**Verdict tranché.** GLANEUR **ne mérite pas une place au top 3 comme entreprise autonome** : trop lourde, trop lente, équilibre conditionnel, elle perd le benchmark contre le socle sur les critères prioritaires. **Elle mérite d'être conservée comme *service satellite adossé au socle*** : démarrer par le seul débarras facturé sur les chantiers du réseau (actif léger, revenu immédiat, zéro entrepôt), en faire une ligne de service du cœur plutôt qu'une structure séparée. Le volet entrepôt/revente/convention d'enseigne reste une option de phase 2, à n'ouvrir que sur signaux de volume prouvés (cf. prémortem). Formulé autrement : **retenir le *service*, ajourner l'*entreprise*.**

#### G. Provision d'exécution

Si la version *service satellite* est retenue :
- **`data-ingenieur`** — modèle de la matière collectée (catalogue de stock : matière, m³, provenance chantier, état, prix) et du flux débarras (passage → facturation) ; adossement à la fiche chantier TRAVELER existante plutôt qu'un silo neuf.
- **`front-carto`** — vue tournée sur carte (points de collecte, optimisation d'itinéraire OSM déjà dans la stack) et fiche stock.
- **`interface-ux`** — parcours artisan « demander un débarras » et parcours acheteur « voir le stock » ; wording sobre.
- **`securite-auditeur` / `verificateur`** — dès qu'une donnée client/artisan ou une facturation est en base (surface à risque).
- **Agent à créer éventuel** — un `agent-logistique` (optimisation de tournées + remplissage camion) si le volume justifie l'automatisation ; à ne créer qu'au passage à l'échelle, pas en v1.

**Automatisations à plus forte valeur** (ordre de priorité) :
1. **Facturation débarras** automatique (passage saisi → facture artisan) — c'est le revenu immédiat, à automatiser en premier.
2. **Catalogue de stock** tenu à jour (entrée matière → fiche revente) — condition de la rotation.
3. **Matching artisan ↔ matière** — un artisan du réseau cherche X, l'entrepôt l'a : notification. Fort effet réseau, mais utile seulement à volume suffisant.
4. **Tournées optimisées** — gain logistique réel, mais pertinent seulement quand les points de collecte se multiplient. À différer.

---

## ADR-002 — PROTÉE

*Nom : Protée, le dieu grec qui change de forme à volonté — l'adaptabilité
faite entreprise.*

- **Capturée le** : 2026-07-16 (dictée vocale de Paul)
- **Type** : business
- **Thème** : bâtiment · énergie · organisation
- **Partenaire envisagé** : Julien
- **Statut** : à raffiner

### L'idée

Monter une **entreprise flexible du bâtiment et de l'énergie**, dont la force
n'est pas un produit unique mais la **vitesse de réaction** :

- **Réagir aux saisons et aux températures** : la même entreprise pose de la
  climatisation quand il fait chaud et des pompes à chaleur quand il fait
  froid — elle s'adapte au lieu de subir la saisonnalité.
- **Surfer sur toutes les vagues** : panneaux solaires / photovoltaïques,
  pompes à chaleur, et chaque mode ou dispositif qui émergera — capable de
  faire plusieurs choses à la fois, ou une chose puis une autre, puis une
  autre, sans être prisonnière d'un seul marché.
- **Capter les subventions, proprement** : récupérer tout ce qui existe comme
  aides (MaPrimeRénov', CEE…) mais en faisant le travail **bien** — à
  l'opposé des acteurs peu fiables qui ont abîmé la réputation du secteur.
  La fiabilité est le différenciant commercial.
- **L'organisation comme cœur du projet** : un plan d'attaque très précis et
  des équipes internes de gens compétents, formés, **eux-mêmes polyvalents**
  sur plusieurs types d'installation — la flexibilité de l'entreprise repose
  sur la polyvalence des équipes.

### Enrichissement (pistes pour rendre l'idée exécutable)

- Points à instruire : certifications par activité (RGE par domaine —
  QualiPAC, QualiPV, etc. — condition d'accès aux aides), plan de formation
  croisée des équipes (frigoriste ↔ PAC est le pont le plus court),
  trésorerie du multi-activité (stocks et outillage par métier).
- Le calendrier des aides publiques change vite : la veille réglementaire est
  une fonction à part entière de cette entreprise — c'est elle qui déclenche
  les pivots.
- Synergie possible avec ADR-001 (GLANEUR) : les chantiers de PROTÉE génèrent
  déposes et surplus que GLANEUR collecte et revalorise.

### Liens inter-segments

- **TRAVELER** : Julien (partenaire pressenti) ; le réseau fournit
  sous-traitants et apporteurs d'affaires.
- **BALTHAZAR GELD** : à terme, structure à part — pilotage financier séparé.

### Analyse stratégique

> Deuxième fiche stratégique ADRAMELECH (boucle AD-5b, volet 2). Même grille
> que l'idée pilote GLANEUR. Ligne de base du benchmark : le cœur rémunérateur
> d'Ultima = **Renoboost IA** (chantiers + installations à domicile).
> Particularité tranchée ici : PROTÉE n'est pas un satellite du socle — elle en
> est **quasi la réplique industrialisée**, ce que le benchmark (bloc F) doit
> arbitrer sans complaisance. Toute valeur absente du registre est marquée
> **[hyp.]** — à instruire, pas à tenir pour acquise.

#### A. Positionnement — Océan Bleu/Rouge et 5 forces

**Grille ERRC** (référentiel : installateurs RGE classiques mono-métier, éco-délinquants du secteur des aides)

- **Exclure** — la mono-saisonnalité subie (chômage technique l'hiver du climaticien, l'été du chauffagiste) ; les pratiques d'éco-délinquance (démarchage agressif, chantiers bâclés, aides captées sans travail sérieux) qui plombent la réputation du secteur ; le mono-produit prisonnier d'un seul marché d'aide.
- **Atténuer** — la dépendance à une seule aide/un seul dispositif (diversifier MaPrimeRénov' + CEE + marchés hors-aide) ; la sous-traitance non maîtrisée qui dilue la qualité (cause première de la mauvaise réputation).
- **Renforcer** — la **fiabilité** comme signature commerciale (travail bien fait, traçable) ; la polyvalence des équipes internes (frigoriste ↔ PAC) qui lisse la charge annuelle ; la veille réglementaire des aides érigée en fonction pilote.
- **Créer** — l'**entreprise « caméléon »** qui pivote produit/saison sans changer de structure (le nom PROTÉE) ; la promesse « aides captées *proprement* » vendue comme rupture face aux éco-délinquants ; le pilotage réglementaire proactif qui déclenche les pivots *avant* le marché.

**5 forces de Porter**

- **Rivalité intra-secteur — fort.** Marché de la rénovation énergétique saturé, très concurrentiel, avec une guerre des prix tirée vers le bas par les acteurs low-cost ; la différenciation par la fiabilité est possible mais s'affronte à un secteur bruyant.
- **Nouveaux entrants — moyen.** Barrière réelle : les certifications RGE par activité (QualiPAC/QualiPV) prennent des mois et exigent des audits — ce n'est pas « un camion et un local » comme GLANEUR ; mais le vivier d'installateurs qui basculent sur l'aide est vaste.
- **Substituts — moyen.** Peu de substituts *techniques* (une PAC reste une PAC), mais l'auto-installation, les mono-spécialistes moins chers et le report d'achat (attentisme lié à l'instabilité des aides) captent de la demande.
- **Pouvoir des fournisseurs (fabricants matériel + main-d'œuvre qualifiée) — fort.** Tension sur les frigoristes/poseurs PAC qualifiés (recrutement de polyvalents = ressource rare) ; dépendance aux fabricants pour les délais et les prix du matériel PAC/PV.
- **Pouvoir des clients — moyen.** Client final sensible au prix et au montant d'aide, peu fidèle par nature (achat unique) ; mais la fiabilité et la recommandation (cf. MYCÉLIUM) réduisent la volatilité.

**Conclusion.** Océan **rouge sur le marché** (rénovation énergétique = mêlée dense, prix cassés, aides instables), mais avec une **poche bleue défendable : la fiabilité érigée en marque dans un secteur abîmé par les éco-délinquants**. Le bleu n'est pas dans *ce* qu'on installe (tout le monde installe PAC/PV) mais dans le *comment* : sérieux traçable + polyvalence anti-saisonnalité + pilotage réglementaire. Fossé fragile tant que la réputation n'est pas capitalisée.

#### B. Diagnostic — SWOT croisé (TOWS)

**Forces (internes)** — compétences installation déjà détenues via le socle Renoboost IA (PROTÉE n'invente pas le métier) ; positionnement fiabilité aligné sur l'ADN d'Ultima ; polyvalence des équipes = lissage de charge ; réseau TRAVELER (Julien, sous-traitants, apporteurs).
**Faiblesses (internes)** — multi-métier = complexité opérationnelle et certifications multiples ; BFR lourd (aides payées en différé) ; recrutement de polyvalents rares ; dispersion possible du dirigeant sur trop de fronts.
**Opportunités (externes)** — vague durable de la rénovation énergétique (aides publiques massives) ; secteur décrédibilisé = place ouverte pour un acteur *fiable* ; saisonnalité clim/PAC exploitable en couverture annuelle.
**Menaces (externes)** — instabilité chronique du calendrier des aides (rabot MaPrimeRénov', évolutions CEE) ; guerre des prix ; durcissement des contrôles anti-fraude (double tranchant : assainit mais alourdit) ; pénurie de main-d'œuvre qualifiée.

**Axes issus des croisements**
- **FO (offensif)** — brancher les compétences installation déjà là + la marque fiabilité sur la vague d'aides et le vide de confiance du secteur : **c'est l'axe le plus fort, et il recoupe le socle Renoboost IA** (cf. bloc F).
- **WO (réorientation)** — la faiblesse « multi-métier trop large » se compense en démarrant sur **le pont le plus court (frigoriste ↔ PAC)** et une seule aide maîtrisée, puis en élargissant PV/autres sur preuve ; ne pas ouvrir tous les métiers d'un coup.
- **WT (survie)** — face à l'instabilité des aides + BFR + pénurie de talents, ne pas bâtir un multi-activité tentaculaire avant d'avoir sécurisé trésorerie de portage et un noyau d'équipe polyvalente ; sinon la flexibilité devient éparpillement.

#### C. Business model — Lean Canvas chiffré (besoins réels)

**Segments clients** — (1) particuliers propriétaires éligibles aux aides (rénovation énergétique du logement) ; (2) petit tertiaire / copropriétés [hyp.] ; (3) apporteurs d'affaires du réseau TRAVELER (Julien, sous-traitants).
**Proposition de valeur** — « on installe PAC, clim et photovoltaïque **bien fait et fiable**, on capte proprement toutes vos aides, et on est là toute l'année quelle que soit la saison — l'inverse des acteurs qui ont abîmé le secteur ».
**Canaux** — réseau TRAVELER (apport d'affaires, recommandation type MYCÉLIUM), référencement RGE (annuaire officiel des aides), bouche-à-oreille de la fiabilité.
**Sources de revenus** — vente + pose d'équipements (PAC, clim, PV), le montant d'aide venant *réduire le reste-à-charge client* (pas un revenu propre) ; marge sur matériel + main-d'œuvre.
**Structure de coûts** — main-d'œuvre qualifiée (poste dominant), matériel/stock multi-métier, outillage spécialisé par activité, certifications RGE et leur maintien, veille réglementaire, portage de trésorerie (BFR aides), assurances (décennale par activité).

**Besoins réels chiffrés** — *toutes valeurs [hyp.], à instruire ; le registre ne porte aucun chiffre.*
- **Certifications RGE par activité** — QualiPAC (PAC), QualiPV (photovoltaïque), et RGE dédié par domaine [hyp.]. Coût unitaire **≈ 1-2 k€/qualification/an** (audit + adhésion + formation référent) ; **délai d'obtention 2-6 mois** par qualification, audit de chantier périodique obligatoire [hyp.]. **Conséquence : le multi-métier multiplie les certifications — barrière de temps réelle, à séquencer, pas à empiler d'emblée.**
- **Équipes polyvalentes / ETP** — démarrage **2-4 ETP** [hyp.] : 1-2 binômes de pose + dirigeant technique (Paul/Julien). Plan de **formation croisée frigoriste ↔ PAC** (le pont le plus court, cité au registre) : **≈ 2-5 k€/personne** + temps improductif de montée en compétence [hyp.]. Le PV s'ajoute en second pont. **Le vrai goulot est humain : le polyvalent qualifié est rare et cher.**
- **Outillage / stock multi-métier** — station de charge et détection frigo, sertissage, matériel élec + calepinage PV, EPI travail en hauteur : **≈ 10-30 k€** d'outillage initial multi-activité [hyp.] ; stock tampon d'équipements pour tenir les délais fabricants **[hyp., variable]**.
- **Trésorerie / BFR aides** — c'est **le besoin structurant** : MaPrimeRénov' et CEE sont payés **en différé** (semaines à mois après la pose). Si l'entreprise avance tout ou partie de l'aide au client (mandataire), elle porte **30-90 % du ticket** pendant ce délai [hyp.]. Sur un flux de quelques chantiers/mois à **8-15 k€** de ticket, le BFR peut atteindre **plusieurs dizaines de k€** en portage permanent [hyp.]. **Sous-estimer ce poste est la première cause d'échec (cf. prémortem).**
- **Extrapolation de revenu [hyp., illustrative]** :
  - *PAC air/eau* : ticket **12-15 k€**, marge brute **25-30 %** → **≈ 3-4 k€/chantier** [hyp.].
  - *PV (3 kWc)* : ticket **8-10 k€**, marge **20-25 %** [hyp.].
  - *Clim (mono/multisplit)* : ticket **2-4 k€**, cycle court, bon remplissage estival [hyp.].
  - À **4-6 chantiers/mois** toutes activités confondues : produit d'ordre **20-40 k€/mois** [hyp.] — nettement au-dessus de GLANEUR, **mais grevé par le BFR et la masse salariale qualifiée** ; l'équilibre dépend du taux de charge annuel des équipes polyvalentes, pas du seul ticket.

#### D. Risque — Prémortem (2-3 ans, PROTÉE a échoué)

- **Dépendance aux aides et à leur calendrier.** Un rabot MaPrimeRénov' / une refonte CEE assèche la demande du jour au lendemain ; l'entreprise avait calé son modèle sur un dispositif qui a changé. — *Signal avancé : > 50 % du chiffre adossé à une seule aide ; pas de veille réglementaire active ; carnet qui se vide à chaque annonce gouvernementale.*
- **Réputation / qualité.** Un afflux de chantiers a dégradé le « bien fait » ; malfaçons, litiges, avis négatifs — PROTÉE devient indistinguable des éco-délinquants qu'elle prétendait combattre. — *Signal avancé : recours à la sous-traitance non contrôlée, délais tendus, premiers litiges décennale, note d'avis en baisse.*
- **Trésorerie du multi-activité.** Le portage des aides + le stock multi-métier + la masse salariale brûlent le cash avant que les paiements différés ne rentrent. — *Signal avancé : encours d'aides à recevoir qui gonfle, tension de trésorerie récurrente en fin de mois, recours au découvert.*
- **Dispersion sur trop de métiers.** Vouloir tout faire (clim + PAC + PV + « chaque dispositif qui émergera ») disperse l'outillage, les certifications et l'attention ; aucune activité n'atteint sa masse critique. — *Signal avancé : certifications empilées plus vite que les chantiers correspondants, équipes qui zappent d'un métier à l'autre sans rentabiliser aucun, dirigeant en pompier permanent.*
- **Recrutement de polyvalents rares.** L'entreprise ne trouve pas / ne retient pas les profils qualifiés multi-métier ; la polyvalence promise reste théorique, la flexibilité s'effondre. — *Signal avancé : postes ouverts non pourvus > 3 mois, turn-over des poseurs, dépendance à un seul homme-clé.*
- **Confusion avec le socle Renoboost IA.** PROTÉE cannibalise ou double le cœur rémunérateur au lieu de le renforcer — deux structures qui se marchent dessus sur le même métier. — *Signal avancé : mêmes clients, mêmes chantiers arbitrés entre deux entités ; coûts de structure dupliqués sans chiffre additionnel.*

#### E. Scoring /10

- **Simple — 3/10.** Multi-métier + certifications RGE multiples + veille réglementaire + BFR aides + recrutement de rares polyvalents : opérationnellement lourd. Atténué par le fait que le métier d'installation est *déjà* détenu (socle), mais la promesse « flexible/polyvalente » ajoute la complexité, elle ne la retire pas.
- **Efficace — 7/10.** Le positionnement fiabilité dans un secteur abîmé est un levier net et crédible ; la couverture anti-saisonnalité (clim été / PAC hiver) résout un vrai problème de charge. Mécanisme clair ; l'exécution multi-métier est le risque.
- **Rémunérateur — 8/10.** C'est le cœur de la vache à lait : tickets élevés (PAC/PV), volume tiré par les aides, marge réelle. Le meilleur potentiel de revenu des idées vues à ce jour — sous réserve que le BFR et la masse salariale ne mangent pas la marge.
- **Utile — 8/10.** Transition énergétique, service concret, aides captées proprement (assainit un secteur) : utilité économique et environnementale élevée, cohérente avec l'ADN Ultima.
- **Temps — 5/10.** Plus rapide à lancer que GLANEUR **parce que PROTÉE prolonge un socle déjà en marche** (compétences et clientèle existantes) ; mais la *vision complète* (multi-métier certifié + équipes polyvalentes) porte des délais de certification (2-6 mois/qualif) et de recrutement. Départ possible vite sur le pont frigoriste↔PAC, montée en puissance lente.

**Pondération actée par Paul** — Temps ×2 et Rémunérateur ×2, dénominateur 7 :
`(Simple + Efficace + Rému×2 + Utile + Temps×2) / 7`
= `(3 + 7 + 8×2 + 8 + 5×2) / 7` = `(3 + 7 + 16 + 8 + 10) / 7` = `44 / 7` = **6,3/10**.

*Repère : non pondéré = (3+7+8+8+5)/5 = 6,2/10. Ici la pondération vitesse/rentabilité **maintient/relève** légèrement le score (Rémunérateur fort), à l'inverse de GLANEUR (5,0) où elle l'abaissait. PROTÉE est forte précisément là où Paul a le moins de marge — d'où un score nettement supérieur.*

#### F. Benchmark obligatoire vs Renoboost IA

Mise en concurrence mécanique avec le socle **Renoboost IA (chantiers + installations à domicile)**. Particularité décisive : **PROTÉE ne s'oppose pas au socle, elle en est la forme industrialisée et diversifiée** (mêmes installations à domicile, même logique d'aides).

- **Rapporte-t-elle plus / mieux / plus vite ?** — **Potentiellement plus et mieux, pas forcément plus vite.** Plus : elle élargit le socle (clim + PAC + PV vs offre actuelle) et lisse la saisonnalité → meilleur taux de charge annuel. Mieux : la marque fiabilité + veille réglementaire structure et défend le cœur. Mais « plus vite » est nuancé par les certifications et le recrutement de polyvalents : la *montée en puissance* est graduelle. Sur les axes prioritaires (Rémunérateur, Temps), **PROTÉE fait au moins jeu égal avec le socle et le dépasse en potentiel** — parce qu'elle *est* le socle, en plus ambitieux.
- **Complète-t-elle, prolonge-t-elle, ou disperse-t-elle ?** — **Elle prolonge le socle (montée en gamme/en puissance), avec un risque de dispersion localisé** : non pas hors du cœur (comme GLANEUR), mais *à l'intérieur* du cœur, par excès de métiers ouverts simultanément. La dispersion n'est pas structurelle, elle est dosable — d'où l'axe WO (démarrer frigoriste↔PAC + une aide, élargir sur preuve). Synergie déjà au registre : **les chantiers PROTÉE alimentent GLANEUR** en déposes/surplus, et la doctrine MYCÉLIUM s'y applique.

**Verdict tranché.** Contrairement à GLANEUR (satellite à ajourner), **PROTÉE est une candidate sérieuse au top 3 — précisément parce qu'elle est la montée en puissance du socle Renoboost IA, pas une diversification hors-cœur.** Elle gagne le benchmark sur le Rémunérateur et fait jeu égal sur le Temps, là où Paul a le moins de marge. **Réserve non négociable :** la retenir comme *extension disciplinée du socle*, pas comme conglomérat multi-métier. Formulé : **retenir l'entreprise, brider l'ambition — un métier-pont d'abord (frigoriste↔PAC), une aide maîtrisée, la fiabilité capitalisée avant tout élargissement.** Le PV et le « chaque dispositif qui émergera » sont des options de phase 2, ouvertes sur preuve de trésorerie et d'équipe.

#### G. Provision d'exécution

Si la version *extension disciplinée du socle* est retenue :
- **`data-ingenieur`** — modèle chantier énergie (activité, équipement, ticket, aide associée, statut du dossier d'aide, encours à recevoir) adossé à la fiche chantier TRAVELER existante ; suivi du BFR aides (poste financier BALTHAZAR GELD).
- **`front-carto`** — vue chantiers par activité/saison sur carte, planning de charge des équipes polyvalentes ; fiche dossier d'aide.
- **`interface-ux`** — parcours « monter un dossier d'aide » (checklist MaPrimeRénov'/CEE) et parcours devis multi-activité ; wording sobre, cohérent avec la promesse fiabilité.
- **`securite-auditeur` / `verificateur`** — dès qu'une donnée client (éligibilité aide = PII sensible : revenus, adresse, situation) est en base : surface à risque élevée, RLS stricte obligatoire.
- **Agent à créer éventuel** — un **`agent-veille-aides`** (veille réglementaire des dispositifs MaPrimeRénov'/CEE, érigée en fonction pilote au registre) : suit les évolutions, alerte sur les rabots, déclenche les pivots. C'est la fonction que le registre désigne comme cœur du projet — forte valeur, à créer si PROTÉE est retenue.

**Automatisations à plus forte valeur** (ordre de priorité) :
1. **Veille réglementaire des aides** — surveillance des dispositifs + alerte de pivot ; c'est le différenciant opérationnel cité au registre, à automatiser en premier.
2. **Montage des dossiers d'aide** — checklist + pré-remplissage par chantier (éligibilité → pièces → dépôt → suivi de paiement) ; réduit le BFR en accélérant l'encaissement.
3. **Planification multi-métier saisonnière** — affectation des équipes polyvalentes selon saison/charge (clim été ↔ PAC hiver) ; maximise le taux de charge annuel.
4. **Suivi de l'encours d'aides à recevoir** — tableau de bord BFR (pendant financier BALTHAZAR GELD) ; pilote le risque trésorerie du prémortem.

---

## ADR-003 — INTENDANT

*Nom : l'intendant, c'est celui qui veille à ce que rien ne manque jamais —
registre ancien et sérieux, fidèle au rôle exact de l'outil.*

- **Capturée le** : 2026-07-16 (dictée vocale de Paul)
- **Type** : pro · business (outil né d'un besoin propre, généralisable)
- **Thème** : bâtiment · logistique de chantier · approvisionnement
- **Partenaire envisagé** : — (besoin propre de Paul)
- **Statut** : à raffiner

### L'idée

Un **outil de pilotage à 100 % opérationnel de l'approvisionnement de
chantier**, né d'un constat répété : dès qu'une commande est un peu spéciale,
ça se passe mal — il y a toujours des manquants, des produits cassés, des
choses qui ne vont pas, et le chantier déraille.

Le cœur de l'outil est un **matching à trois sources** :

1. **Les besoins du client** — ce que le chantier exige, pièce par pièce.
2. **Mes commandes** — ce qui est effectivement commandé et ce qui arrive.
3. **Mon stock à moi** — ce que j'ai déjà et qui n'a pas besoin d'être
   commandé.

À partir de ce matching, l'outil répond aux questions du quotidien : est-ce
que je dois passer commande ? De quoi exactement ? Et il **pilote le
calendrier** : les produits arrivent **la veille ou l'avant-veille**, **en bon
état**, et **le lendemain il y a la pose**. Si des besoins s'ajoutent en cours
de route, je les saisis, l'outil recalcule les manquants et je repasse
commande — rien ne passe entre les mailles.

**Le cas d'école** (vécu) : un chantier de fenêtres entièrement compromis
parce qu'il manquait **l'aile de recouvrement** — une seule pièce absente et
tout le chantier est foutu. C'est exactement ce que le matching doit rendre
impossible : le manquant se voit **avant** le jour de pose, pas dessus.

### Enrichissement (pistes pour rendre l'idée exécutable)

- Ce n'est « pas la mer à boire » (dixit Paul) : le noyau v1 est une
  **check-list de rapprochement** — besoins ⟷ commandé ⟷ en stock — avec
  trois états par ligne (couvert / commandé-en-attente / manquant) et une
  alerte tant qu'il reste un manquant à J-2 de la pose.
- Étapes de vie d'une ligne : besoin identifié → couvert (stock ou commande)
  → livré → **contrôlé en bon état** (le contrôle réception fait partie du
  pilotage : la casse découverte le jour de la pose = manquant).
- Sources d'entrée à instruire : saisie vocale (registre ADRAMELECH oblige),
  import des devis/bons de commande fournisseurs (parsing = à évaluer,
  éventuel coût → gate).
- Généralisable ensuite à d'autres artisans (produit à part entière), mais la
  v1 se cale sur les chantiers de Paul — boucler petit d'abord.

### Liens inter-segments

- **TRAVELER** : les chantiers sont déjà des nœuds du réseau — l'INTENDANT
  pourrait s'adosser à une fiche chantier existante plutôt que créer un
  silo ; les fournisseurs sont des contacts.
- **ADR-001 GLANEUR** : les surplus de chantier détectés par l'INTENDANT
  (lignes commandées non posées) sont exactement la matière que GLANEUR
  collecte et revalorise.
- **BALTHAZAR GELD** : chaque commande est une charge — le rapprochement commande/facture
  a un pendant financier.

### Analyse stratégique

> Troisième fiche stratégique ADRAMELECH (boucle AD-5b, volet 2). Même grille
> que GLANEUR. **Particularité INTENDANT** : ce n'est pas une entreprise rivale
> du socle, c'est un **outil de pilotage adossé au cœur rémunérateur**
> (Renoboost IA — chantiers + installations). La ligne de base du benchmark
> reste le socle, mais le critère bascule : on évalue un **multiplicateur/
> dérisqueur** (léger, rapide, rentable *indirectement* en évitant les chantiers
> foirés), pas un centre de revenu autonome. Valeurs chiffrées absentes du
> registre marquées **[hyp.]**.

#### A. Positionnement — Océan Bleu/Rouge et 5 forces

**Grille ERRC** (référentiel : logiciels de gestion de chantier / ERP BTP — Batigest, Tolteck, Obat, Codial ; tableurs artisanaux ; rien du tout)

- **Exclure** — la lourdeur ERP (compta, paie, devis complets, RH) ; le paramétrage long avant le premier usage ; la logique « logiciel de gestion » là où il faut une check-list opérationnelle.
- **Atténuer** — la double saisie (ressaisir ce qui existe déjà en devis/BC) ; la dépendance à un parsing fournisseur coûteux et fragile.
- **Renforcer** — la simplicité de la check-list à trois états ; l'alerte proactive J-2 (l'outil parle *avant* qu'on lui demande).
- **Créer** — le **matching à trois sources** (besoins client ⟷ commandes ⟷ stock) **au niveau de la pièce**, doublé du **contrôle réception intégré comme étape de pilotage** (la casse découverte = un manquant). C'est le cœur inexistant chez les ERP, qui suivent la *commande* mais ne rapprochent jamais finement besoin ⟷ stock ⟷ état-réel-livré. Le manquant se voit avant la pose, pas dessus.

**5 forces de Porter** — *à lire à deux étages : usage interne (v1) vs ambition produit SaaS.*

- **Rivalité intra-secteur — faible en interne, moyenne-forte en SaaS.** En usage propre, aucune rivalité (outil captif). Sur le marché, les ERP BTP existent mais font mal ce matching fin ; la concurrence frontale existe sur le créneau « logiciel artisan », encombré.
- **Nouveaux entrants — nul en interne, fort en SaaS.** Le concept (check-list de rapprochement) est simple et copiable une fois la preuve faite ; aucune barrière technologique — le seul fossé serait l'usage réel et l'ajustement métier.
- **Substituts — fort.** Excel, le carnet, la mémoire du chef de chantier restent le réflexe gratuit par défaut ; c'est le vrai concurrent, y compris pour Paul lui-même.
- **Pouvoir des fournisseurs (au sens parsing de BC) — moyen.** Pas de format standard des bons de commande fournisseurs : le parsing est hétérogène, fragile, potentiellement coûteux → gate.
- **Pouvoir des clients (autres artisans, si productisé) — moyen-fort.** Faible propension des TPE du bâtiment à payer « un logiciel de plus » ; adoption lente ; le prescripteur est rare.

**Conclusion.** En usage **interne**, la question bleu/rouge ne se pose quasiment pas : c'est un **outil captif à ROI direct**, sans marché à conquérir. En ambition **produit SaaS**, océan **rouge** (ERP BTP encombré), **bleu seulement sur l'angle étroit** du matching trois-sources + contrôle réception — bleu mais peu défendable (copiable). La valeur sûre est en interne ; le produit est un pari secondaire, spéculatif.

#### B. Diagnostic — SWOT croisé (TOWS)

**Forces (internes)** — **né d'un besoin propre vécu** (le cas de l'aile de recouvrement) : v1 immédiatement utile et testable sur un vrai chantier, *product-market fit interne garanti* ; stack Ultima déjà là ; adossable à la fiche chantier TRAVELER existante ; saisie vocale déjà dans le registre ADRAMELECH ; actif quasi nul (aucun capital lourd, contraste total avec GLANEUR/PROTÉE).
**Faiblesses (internes)** — suppose une **discipline de saisie au quotidien** (besoins/commandes tenus à jour dans le feu du chantier) ; la valeur est un **évitement** (invisible, difficile à mesurer et à facturer) ; parsing BC fournisseurs incertain ; un seul utilisateur au départ = pas de validation multi-contexte.
**Opportunités (externes)** — aucun outil ne fait ce matching fin pour les petits poseurs ; digitalisation lente mais réelle du BTP ; le coût des reprises/pénalités est un vrai point de douleur secteur.
**Menaces (externes)** — « Excel suffit » pour beaucoup ; un ERP existant peut ajouter la brique ; adoption des autres artisans difficile.

**Axes issus des croisements**
- **FO (offensif)** — exploiter le besoin propre vécu **+** l'absence d'outil fin : construire la v1 check-list **pour les chantiers de Paul**, prouver le ROI sur soi avant toute généralisation. **C'est l'axe le plus fort — et il coûte presque rien.**
- **WO (réorientation)** — compenser la faiblesse « valeur invisible » en **instrumentant la mesure dès la v1** : compter les manquants détectés à J-2 = des victoires chiffrées, un récit de preuve.
- **WT (survie)** — ne **pas généraliser** avant d'avoir bouclé le besoin propre ; ne pas engager le parsing coûteux tant que la saisie vocale/manuelle n'a pas prouvé la valeur.

#### C. Business model — Lean Canvas chiffré

**Étage 1 — OUTIL INTERNE (le certain).** ROI = chantiers sauvés.
- **Ordre de grandeur d'un chantier foiré [hyp.]** — sur une commande spéciale ratée : re-déplacement d'équipe (2-4 personnes × jour perdu ≈ 800-1 500 €), relivraison/stockage, pénalité de retard client, reprise, décalage des chantiers suivants → **surcoût direct ≈ 500-2 500 €/incident [hyp.]**, hors atteinte à la réputation (qui, elle, prive MYCÉLIUM de sa victoire).
- **Fréquence évitable [hyp.]** — si Paul fait **100-150 chantiers/an** dont **~30 % « spéciaux »** = 30-45 chantiers à risque ; incident sur **10-20 %** d'entre eux = **3-9 incidents/an** évitables × 500-2 500 € = **≈ 1,5-22 k€/an de valeur préservée [hyp.]**. Même au plancher de la fourchette, cela couvre plusieurs fois le dev.
- **Effort de dev v1 [hyp.]** — la « check-list de rapprochement » (3 états par ligne : couvert / commandé-en-attente / manquant + alerte J-2) sur la stack Ultima existante = **3-8 jours-homme [hyp.]**, agents internes. **Actif matériel : nul.**
- **Sources d'entrée** — saisie vocale (déjà au registre) ; import devis/BC fournisseurs (**parsing = à évaluer, coût éventuel → gate**).
- **Personnes** — **0 ETP dédié** : Paul est l'utilisateur ; `data-ingenieur` + front pour le build. Le vrai coût n'est pas l'argent, c'est **la discipline de saisie**.

**Étage 2 — PRODUIT SaaS généralisable (le spéculatif).**
- **Segments [hyp.]** — artisans poseurs multi-pièces (menuisiers/fenêtres, cuisinistes, salle de bain, PAC), TPE bâtiment 1-10 salariés.
- **Prix [hyp.]** — **20-50 €/mois/artisan**, positionné *sous* l'ERP complet.
- **Coût de productisation [hyp.]** — multi-tenant, parsing robuste, support = **plusieurs dizaines de jours-homme [hyp.]** + coûts récurrents (hébergement, parsing). Marché fragmenté, adoption lente.
- **Verdict d'étage** : le SaaS est une **option de phase 2**, à n'ouvrir qu'après un cycle chantier complet piloté par l'outil en interne.

#### D. Risque — Prémortem (2-3 ans, INTENDANT a échoué)

- **Sur-ingénierie.** On a construit un ERP au lieu de la check-list simple ; le noyau à valeur immédiate est noyé sous des fonctions jamais utilisées. — *Signal avancé : la v1 dépasse 8-10 j-h sans avoir tourné sur un vrai chantier ; la feuille de route parle de modules avant d'avoir sauvé un premier manquant.*
- **Adoption / saisie non tenue au quotidien.** L'outil suppose une saisie des besoins/commandes que Paul ne tient pas dans le feu du chantier ; il se désynchronise du réel et perd sa fiabilité — donc son seul intérêt. — *Signal avancé : lignes non mises à jour, écart entre l'outil et le terrain dès le 2e-3e chantier.*
- **Parsing fournisseurs trop coûteux.** On s'enlise à parser des BC hétérogènes ; le coût dépasse la valeur avant que la saisie manuelle ait fait ses preuves. — *Signal avancé : budget/temps parsing qui gonfle alors qu'aucun manquant n'a encore été détecté par la voie simple.*
- **Généralisation prématurée.** On a voulu vendre aux autres artisans avant d'avoir bouclé le besoin propre ; produit générique mal ajusté, dispersion. — *Signal avancé : chantier multi-tenant lancé alors que Paul n'a pas encore un cycle chantier complet piloté par l'outil.*
- **Valeur invisible.** L'évitement ne se mesure pas, personne ne « voit » les chantiers sauvés, l'outil est abandonné faute de preuve ressentie. — *Signal avancé : aucun compteur de manquants-détectés-à-J-2, aucun récit de victoire capitalisé.*

#### E. Scoring /10

*Note : pour un outil interne, « Rémunérateur » = **valeur créée/économisée** (chantiers sauvés, pénalités et reprises évitées), pas revenu direct ; le revenu SaaS est spéculatif et lointain, la note porte sur la valeur préservée, réelle et proche. « Temps » : 10 = très rapide à lancer.*

- **Simple — 8/10.** Noyau = check-list de rapprochement à 3 états + alerte J-2 ; « pas la mer à boire » (dixit Paul). Le risque est la sur-ingénierie, pas une complexité intrinsèque.
- **Efficace — 8/10.** Résout un point de douleur net et **vécu** (l'aile de recouvrement) ; le matching trois-sources rend le manquant visible avant la pose. Réserve : dépend de la discipline de saisie.
- **Rémunérateur — 7/10.** Valeur créée/économisée forte et **rapide** vs coût de dev quasi nul (ROI indirect élevé) ; plafonné parce que l'évitement est difficile à mesurer et que le revenu SaaS direct reste spéculatif.
- **Utile — 9/10.** Sert **directement le socle rémunérateur** — il le dérisque au quotidien ; utilité opérationnelle immédiate.
- **Temps — 8/10.** v1 légère sur stack existante (**3-8 j-h [hyp.]**), aucun actif lourd, testable dès le prochain chantier — à l'opposé des mois de rampe de GLANEUR.

**Pondération actée (Temps ×2, Rémunérateur ×2, dénominateur 7).**
`(Simple + Efficace + Rému×2 + Utile + Temps×2)/7`
= `(8 + 8 + 7×2 + 9 + 8×2)/7` = `(8 + 8 + 14 + 9 + 16)/7` = `55/7` ≈ **7,9/10**.
La pondération orientée vitesse/rentabilité *maintient* le score haut — INTENDANT est fort précisément là où Paul a le moins de marge (Temps et Rémunérateur), à l'inverse exact de GLANEUR (5,0/10).

#### F. Benchmark obligatoire vs cœur rémunérateur (Renoboost IA)

- **Rapporte-t-il plus / mieux / plus vite ?** — **La question ne s'applique pas frontalement : il ne rivalise pas, il dérisque et accélère le socle.** INTENDANT n'est pas un centre de revenu ; c'est un **enabler**. Chaque chantier sauvé = revenu du socle *préservé* + équipe non immobilisée + réputation protégée. Le rapport coût/levier est exceptionnel : **3-8 j-h [hyp.]** pour préserver **1,5-22 k€/an [hyp.]** *et*, surtout, la fiabilité d'exécution qui alimente MYCÉLIUM. Là où GLANEUR et PROTÉE exigent du capital neuf et des compétences neuves, INTENDANT est l'inverse : **quasi zéro mise, valeur immédiate sur l'actif déjà en place**.
- **Double synergie registre.** (a) Les **surplus détectés** (lignes commandées non posées) sont exactement la matière que **GLANEUR** collecte et revalorise → INTENDANT est un capteur amont de GLANEUR. (b) Un **chantier bien approvisionné se termine bien** → fin de chantier réussie = LE moment que **MYCÉLIUM** exploite (« frappez après une victoire »). INTENDANT **fabrique les victoires** que MYCÉLIUM transforme en clients.

**Verdict tranché.** INTENDANT est un **candidat top 3 franc — comme *enabler* à fort levier et faible coût, pas comme entreprise.** Il gagne le benchmark non pas en battant le socle sur le revenu, mais en étant **la brique qui protège et démultiplie le socle** à mise quasi nulle. Le risque n'est **pas économique** (coût dérisoire) mais **d'exécution/adoption** : tenir la saisie au quotidien et résister à la sur-ingénierie. Formulé autrement : **retenir l'*outil* interne d'abord, ajourner le *produit* SaaS.**

#### G. Provision d'exécution

Si la version *outil interne v1* est retenue :
- **`data-ingenieur`** — modèle de données du matching (ligne : besoin / commande / stock, 3 états + étape « contrôlé en bon état ») **adossé à la fiche chantier TRAVELER existante plutôt qu'un silo neuf** ; pendant financier BALTHAZAR GELD (chaque commande = une charge, rapprochement commande/facture).
- **`front-carto` / `interface-ux`** — saisie rapide (vocale en priorité, registre ADRAMELECH oblige), vue check-list par chantier, **alertes J-2** lisibles ; parcours « ajouter un besoin en cours → recalcul des manquants » ; wording sobre, registre antique.
- **`securite-auditeur` / `verificateur`** — dès qu'une donnée chantier/client/fournisseur est en base (surface à risque).

**Automatisations à plus forte valeur** (ordre de priorité) :
1. **Alerte manquant J-2** (passage automatique en état « manquant » tant qu'une ligne n'est pas couverte à l'approche de la pose) — c'est le cœur du dérisquage, à livrer en premier.
2. **Recalcul automatique des manquants** à chaque ajout de besoin — condition de la fiabilité (« rien entre les mailles »).
3. **Import BC fournisseurs** (parsing = **à évaluer, coût éventuel → gate**) — à n'ouvrir qu'après preuve de valeur par saisie vocale/manuelle.
4. **Feeds inter-idées** (phase 2) — surplus détectés → GLANEUR ; fin-de-chantier réussie → MYCÉLIUM. À différer jusqu'à la boucle interne bouclée.

---

## ADR-004 — MYCÉLIUM

*Nom : le mycélium est le réseau souterrain qui fait surgir les champignons
de proche en proche — l'image même de la propagation par les clients
(« comme des champignons, paf, paf, paf »).*

- **Capturée le** : 2026-07-16 (dictée vocale de Paul)
- **Type** : pro · business
- **Thème** : commercial · data client · fidélisation · recommandation
- **Partenaire envisagé** : — (levier propre de Paul)
- **Statut** : à raffiner

### L'idée

**Chaque client doit générer deux autres clients.** L'idée maîtresse : c'est
la **donnée** — le pilotage de la data client — qui est le plus important.
Dans le **même outil** que le suivi de chantier, enchaîner systématiquement :

1. **Bien piloter les chantiers existants** — la qualité d'exécution est le
   socle : sans victoire, rien à exploiter.
2. **La bonne relance client au bon moment** — piloté par la donnée, pas au
   hasard.
3. **Frapper au moment de la satisfaction** : la maxime dictée par Paul —
   *« frappez après une victoire et vous obtiendrez une autre victoire »*.
   La fin de chantier réussie est LE moment : demande de satisfaction,
   demande de recommandation, avis **cinq étoiles Google** — tac, tac, tac,
   et on enchaîne, à chaque fois, sans exception.

Objectif chiffré et simple : **1 client → 2 clients**. Ce sont les clients
qui génèrent le lien ; la propagation se fait de proche en proche, comme des
champignons. « Ce n'est pas compliqué » — c'est une discipline systématique,
pas une prouesse technique. **À ne pas oublier.**

### Enrichissement (pistes pour rendre l'idée exécutable)

- Le mécanisme v1 est une **séquence post-chantier automatisable** : chantier
  livré → J+2 demande de satisfaction → si satisfait, demande d'avis Google
  + demande de recommandation nominative (« à qui pensez-vous ? ») → chaque
  nom donné devient un lead rattaché à son parrain. Le taux mesuré :
  recommandations obtenues / chantier.
- La métrique de pilotage est le **coefficient de propagation** (clients
  générés par client) : l'objectif de 2 se lit sur un dashboard, chantier
  par chantier — qui a donné, qui n'a pas encore été sollicité.
- Point d'attention : sollicitation d'avis conforme (consentement, pas
  d'achat d'avis) — la sincérité est cohérente avec la fiabilité revendiquée
  dans ADR-002 PROTÉE.

### Liens inter-segments

- **TRAVELER** : le cœur du mécanisme existe déjà — relances au bon moment
  (journal/relances v2), leads et relations d'apport d'affaires ; MYCÉLIUM
  est la doctrine commerciale qui exploite cet outillage. Le lien
  parrain → filleul est une relation typée du réseau.
- **ADR-003 INTENDANT** : un chantier bien approvisionné se termine bien —
  l'INTENDANT fabrique les victoires, MYCÉLIUM les exploite.
- **ADR-002 PROTÉE** : même doctrine applicable à ses chantiers (« on
  applique ça partout »).

### Analyse stratégique

> Fiche stratégique ADRAMELECH (boucle AD-5b, volet 2). Même grille que l'idée
> pilote GLANEUR. Ligne de base du benchmark : le cœur rémunérateur d'Ultima =
> **Renoboost IA** (chantiers + installations à domicile). Particularité de
> MYCÉLIUM : ce n'est ni une entreprise ni un actif lourd, mais une **doctrine
> commerciale + séquence automatisable** dont l'objet est *1 client → 2 clients*.
> Elle ne concurrence pas le socle : elle le **démultiplie**. Toutes les valeurs
> absentes du registre sont marquées **[hyp.]** — à instruire, pas à tenir pour
> acquises.

#### A. Positionnement — Océan Bleu/Rouge et 5 forces

**Grille ERRC** (référentiel : bouche-à-oreille passif, plateformes d'avis payantes, parrainage classique, agences de génération de leads)

- **Exclure** — l'achat de leads froids en agence ; l'attente passive que le client satisfait parle « un jour » de lui-même ; l'avis sollicité au hasard, hors du moment de satisfaction.
- **Atténuer** — la dépendance à un canal publicitaire payant ; la déperdition du signal de satisfaction (client content dont l'enthousiasme n'est jamais capté ni converti).
- **Renforcer** — la **relance au bon moment pilotée par la donnée** (outillage TRAVELER relances v2 déjà là) ; la **traçabilité parrain → filleul** comme relation typée du réseau.
- **Créer** — la **séquence disciplinée « frapper après une victoire »** (J+2 satisfaction → avis 5★ Google + recommandation nominative → lead rattaché au parrain), et le **coefficient de propagation** comme métrique de pilotage chantier par chantier — inexistants dans le bouche-à-oreille passif et dans le parrainage classique non instrumenté.

**5 forces de Porter** (lues du point de vue de MYCÉLIUM comme *levier d'acquisition du socle*, non comme entreprise)

- **Rivalité intra-secteur — faible.** Le mécanisme s'exerce sur *la propre base client* de Renoboost IA ; il n'y a pas de marché disputé, seulement un gisement interne sous-exploité. La concurrence ne se joue pas ici.
- **Nouveaux entrants — moyen.** Un concurrent peut copier la doctrine (elle n'est pas brevetable), mais il ne peut pas copier *la base client et la qualité d'exécution de Renoboost IA* qui l'alimentent — le fossé est le socle lui-même, pas la méthode.
- **Substituts — moyen.** La publicité payante et l'achat de leads restent des substituts d'acquisition ; ils sont plus chers mais immédiats et sans dépendance à la satisfaction. MYCÉLIUM ne les élimine pas, elle les rend marginaux si le coefficient tient.
- **Pouvoir des fournisseurs — faible.** Pas de fournisseur amont : la « matière » est la satisfaction client, produite en interne par la qualité d'exécution. Seule dépendance externe : Google (plateforme d'avis) et sa politique de conformité.
- **Pouvoir des clients (les parrains) — moyen.** Le client reste libre de recommander ou non ; on ne peut ni le contraindre ni acheter son avis. Le seul levier est la qualité du chantier et la justesse du moment — d'où la fragilité amont.

**Conclusion.** Océan **franchement bleu** : MYCÉLIUM n'affronte personne, elle exploite un gisement interne (la satisfaction non convertie) que la plupart des artisans laissent perdre. Le seul point **rouge** est la dépendance à Google pour le canal d'avis et à la qualité d'exécution en amont pour la matière première. L'angle — *la systématisation disciplinée « frapper après une victoire », adossée à la data client, contre le hasard du bouche-à-oreille* — est défendable tant que le socle produit des victoires et que la sollicitation reste conforme.

#### B. Diagnostic — SWOT croisé (TOWS)

**Forces (internes)** — coût de mise en œuvre quasi nul ; s'appuie sur l'outillage TRAVELER **déjà existant** (relances v2, leads, relations d'apport, lien parrain → filleul typé) ; agit directement sur l'acquisition du socle ; métrique claire et pilotable (coefficient de propagation) ; cohérente avec la fiabilité revendiquée (avis sincères, cf. PROTÉE).
**Faiblesses (internes)** — dépend entièrement de la qualité d'exécution en amont (« sans victoire, rien à exploiter ») ; exige une **discipline d'équipe tenue dans la durée**, la partie humaine la plus fragile ; coefficient réel non prouvé, l'objectif de 2 est une cible ambitieuse ; suppose une data client tenue proprement.
**Opportunités (externes)** — poids décisif des avis Google dans la décision d'achat en rénovation ; secteur BTP où le coût du lead payant est élevé et la confiance rare — la recommandation nominative vaut plus qu'une pub ; réputation du secteur abîmée par les acteurs peu fiables (angle de différenciation).
**Menaces (externes)** — durcissement de la politique Google sur la sollicitation d'avis (filtrage, pénalisation) ; lassitude client si la sollicitation est trop mécanique ; RGPD/consentement sur la donnée de recommandation nominative.

**Axes issus des croisements**
- **FO (offensif) — l'axe le plus fort.** Brancher la séquence post-chantier sur l'outillage de relance TRAVELER *déjà en place* pour capter systématiquement l'avis 5★ + la reco nominative au pic de satisfaction : une force interne (coût nul, outil existant) sur la meilleure opportunité (poids des avis en BTP). Retour quasi immédiat, mise de fonds quasi nulle.
- **WO (réorientation)** — la faiblesse « dépend de la qualité amont » se compense en **couplant MYCÉLIUM à INTENDANT** : l'INTENDANT fabrique des fins de chantier réussies (rien ne manque le jour de pose), MYCÉLIUM n'a plus qu'à les exploiter. On ne sollicite que sur les chantiers effectivement réussis.
- **WT (survie)** — contre le risque Google + discipline non tenue : n'automatiser que la partie conforme (consentement explicite, pas d'incitation à l'avis), et ancrer la séquence dans le process (déclenchement automatique à J+2) plutôt que dans la bonne volonté quotidienne d'un humain.

#### C. Business model — Lean Canvas chiffré

**Nature.** MYCÉLIUM **n'est pas un centre de profit autonome** : c'est un **levier d'acquisition du socle**. Elle ne se lit pas en chiffre d'affaires propre, mais en *chantiers additionnels générés à coût quasi nul* sur Renoboost IA.

**Segments** — les clients existants de Renoboost IA (parrains potentiels) ; les leads qu'ils génèrent (filleuls) ; l'équipe qui exécute la discipline.
**Proposition de valeur** — pour Renoboost IA : « chaque chantier réussi devient une machine à en produire d'autres, sans budget pub » ; pour le client : reconnaissance de sa satisfaction et facilité à recommander un artisan fiable.
**Canaux** — outillage TRAVELER existant (relances v2, fiche lead, relations d'apport) ; avis Google ; le lien parrain → filleul typé en base.
**Sources de « revenu »** — indirecte : marge des chantiers additionnels acquis gratuitement.
**Structure de coûts** — quasi nulle en capex ; l'essentiel est de l'**effort de mise en place** (paramétrage de la séquence, intégration à l'outil de suivi) + de la **discipline** récurrente.

**Impact chiffré [hyp., illustratif — le registre ne porte aucun chiffre]**
- Hypothèses de base : **N = 60 chantiers/an** sur Renoboost IA [hyp.] ; taux de sollicitation effective **80 %** [hyp.] ; taux de recommandation nominative obtenue **40 %** par chantier sollicité [hyp.] ; conversion filleul → chantier signé **25 %** [hyp.].
- **Coefficient de propagation réel** = 0,80 × 0,40 × 0,25 ≈ **0,08 chantier converti par chantier** en scénario prudent → **≈ 5 chantiers additionnels/an** [hyp.]. En scénario volontariste (sollicitation 90 %, reco 70 %, conversion 40 %), coefficient ≈ 0,25 → **≈ 15 chantiers additionnels/an** [hyp.]. **La cible affichée de 2 est un cap mobilisateur, pas une prévision** : 2 supposerait 2 chantiers signés *par* chantier, soit un niveau de reco+conversion hors de portée d'une séquence seule.
- **Valeur créée** : à marge chantier **≈ 2-4 k€** [hyp.], 5 à 15 chantiers additionnels = **10-60 k€ de marge/an** captés à coût marginal quasi nul.
- **Comparaison au payant** : un lead BTP qualifié coûte **30-150 €** [hyp.] et un client acquis en publicité/agence **300-1 500 €** [hyp.]. Les 5-15 clients de MYCÉLIUM représentent donc **1,5 à 22 k€ de coût d'acquisition évité/an** [hyp.], *en plus* de la marge. Le ratio valeur/coût est structurellement le plus élevé de l'archipel.

**Besoins réels** — **faible capex.** (1) Effort de mise en place de la **séquence post-chantier automatisée** (chantier livré → J+2 satisfaction → avis Google + reco nominative → lead rattaché au parrain) ; (2) **intégration à l'outil de suivi existant** (TRAVELER, relances v2 — pas de silo neuf) ; (3) **discipline d'équipe** dans la durée, le vrai coût récurrent. Estimation : **quelques jours-agents de paramétrage** [hyp.], zéro actif immobilisé.

#### D. Risque — Prémortem (2-3 ans, MYCÉLIUM a échoué)

- **Qualité d'exécution insuffisante en amont.** Les chantiers ne se terminent pas assez bien pour qu'on ose solliciter : sans victoire, rien à exploiter, la séquence tourne à vide. — *Signal avancé : taux de satisfaction post-chantier bas ou non mesuré ; sollicitations reportées « parce que le chantier s'est mal fini ».*
- **Discipline non tenue dans la durée.** La séquence dépend d'un geste humain qui s'érode : on oublie de solliciter dès que l'activité s'intensifie. — *Signal avancé : part des chantiers effectivement sollicités qui décroît mois après mois ; séquence déclenchée « à la main » plutôt qu'automatiquement.*
- **Sollicitation d'avis non conforme.** Incitation maladroite ou achat implicite d'avis → filtrage/pénalisation Google, atteinte à la réputation. — *Signal avancé : avis supprimés par Google, pic d'avis suspects, absence de recueil de consentement.*
- **Coefficient réel très en dessous de la cible.** Les clients recommandent peu, ou les filleuls ne convertissent pas : coefficient qui plafonne à 0,05-0,10 au lieu d'approcher la cible. — *Signal avancé : dashboard coefficient sous 0,1 pendant deux trimestres ; peu de noms donnés par chantier.*
- **Data client non tenue.** Le lien parrain → filleul n'est pas typé/tracé proprement : impossible de mesurer, donc de piloter, donc de corriger. — *Signal avancé : leads entrants non rattachés à leur parrain ; coefficient non calculable faute de données propres.*
- **Lassitude client.** Sollicitation trop mécanique perçue comme du harcèlement, qui abîme la relation au lieu de la prolonger. — *Signal avancé : plaintes, désabonnements, taux de réponse en chute.*

#### E. Scoring /10

- **Simple — 7/10.** Ce n'est ni un actif lourd ni un métier neuf : une séquence automatisable + une discipline, sur un outil qui existe. Ce qui la complexifie n'est pas technique mais humain (tenir la discipline, tenir la data).
- **Efficace — 7/10.** Elle attaque directement l'acquisition, au point de contact le plus favorable (le pic de satisfaction). Mécanisme net ; efficacité entièrement conditionnée à la qualité amont et au coefficient réel.
- **Rémunérateur — 9/10.** C'est le **revenu du socle démultiplié à coût quasi nul** : marge additionnelle de 10-60 k€/an [hyp.] pour un capex proche de zéro. Le meilleur ratio valeur/mise de fonds de l'archipel.
- **Utile — 7/10.** Utilité surtout économique (croissance du socle) et réputationnelle (avis sincères, fiabilité) ; moins d'utilité sociétale directe que GLANEUR, mais renforce la confiance dans un secteur qui en manque.
- **Temps — 9/10.** **Déployable très vite** : elle s'adosse à l'outillage TRAVELER déjà en place (relances v2, leads, relations d'apport). Pas de camion, pas d'entrepôt, pas de convention à négocier — quelques jours de paramétrage.

**Pondération actée (Temps ×2 et Rémunérateur ×2, dénominateur 7).**
`(7 + 7 + 9×2 + 7 + 9×2) / 7` = `(7 + 7 + 18 + 7 + 18) / 7` = `57/7` = **8,1/10**.
*À titre de repère, moyenne simple = (7+7+9+7+9)/5 = **7,8/10**.* Ici la pondération vitesse/rentabilité **relève** le score — exactement l'inverse de GLANEUR (qui baissait à 5,0) : MYCÉLIUM est forte précisément là où Paul a le moins de marge (le temps et le rendement du capital).

#### F. Benchmark obligatoire vs Renoboost IA

Mise en concurrence mécanique avec le socle **Renoboost IA** — mais la question n'est pas « rivalise-t-elle ? » (non), c'est « **démultiplie-t-elle mieux qu'un euro réinvesti dans le socle en direct ?** ».

- **Rapporte-t-elle plus / mieux / plus vite qu'un euro investi dans le socle ?** — **Oui, en levier.** Un euro mis en publicité/leads achète un client une fois, à 300-1 500 € [hyp.] pièce. Un euro (ou un jour-agent) mis dans MYCÉLIUM installe un *mécanisme qui produit des clients en continu à coût marginal nul*, tant que le socle produit des victoires. Sur les deux critères prioritaires de Paul — Temps et Rémunérateur — MYCÉLIUM ne bat pas le socle, elle en **augmente le rendement** : c'est le multiplicateur, pas le concurrent.
- **Complète-t-elle ou disperse-t-elle ?** — **Elle complète, par le haut.** Zéro dispersion du dirigeant : pas de structure « à part », pas de métier neuf. Elle vit *dans* le même outil que le suivi de chantier. Synergie de registre forte : **INTENDANT fabrique les victoires** (chantiers sans manquant), **MYCÉLIUM les exploite** ; et la **même doctrine est applicable à PROTÉE** (« on applique ça partout »).

**Verdict tranché.** MYCÉLIUM est **candidate top 3 comme levier de croissance le moins cher et le plus rapide de l'archipel** : elle ne concurrence pas le socle, elle le démultiplie, à capex quasi nul et en déploiement immédiat sur l'existant. Sa **fragilité n'est pas économique mais conditionnelle** : elle *dépend* de la qualité d'exécution en amont et de la conformité des avis — au point qu'isolée, sans victoires à exploiter, elle ne vaut rien. La bonne lecture n'est donc pas « entreprise ou service » (comme GLANEUR) mais « **socle d'abord, MYCÉLIUM par-dessus** » : à retenir comme **doctrine transverse du cœur rémunérateur**, pas comme brique isolée. Formulé autrement : **ce n'est pas une idée de plus, c'est le multiplicateur des autres.**

#### G. Provision d'exécution

- **`data-ingenieur`** — pilotage de la **data client** et calcul du **coefficient de propagation** (clients générés / client) ; typage propre de la relation **parrain → filleul** dans TRAVELER (lead rattaché à son parrain) ; adossement aux relances v2 et à la fiche lead existantes plutôt qu'un silo neuf.
- **`interface-ux`** — conception de la **séquence post-chantier** (J+2 satisfaction → avis Google + reco nominative) et du **dashboard chantier par chantier** (qui a donné, qui reste à solliciter, coefficient courant) ; wording sobre, non mécanique, pour éviter la lassitude.
- **`securite-auditeur` / `verificateur`** — **conformité consentement/avis** dès que la donnée de recommandation nominative entre en base (PII, RGPD, politique Google : pas d'achat ni d'incitation à l'avis).

**Automatisations à plus forte valeur** (ordre de priorité) :
1. **Séquence post-chantier J+2** (chantier livré → demande de satisfaction → si satisfait, avis Google + reco nominative) — le cœur du mécanisme, à automatiser en premier.
2. **Relance au bon moment pilotée par la donnée** (déclenchement au pic de satisfaction, pas au hasard) — s'appuie sur relances v2 existant.
3. **Dashboard coefficient de propagation** — rend la discipline mesurable et donc tenable ; condition du pilotage.
