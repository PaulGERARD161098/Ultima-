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
- **BCP** : à terme, structure à part — pilotage financier séparé.

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
- **BCP** : à terme, structure à part — pilotage financier séparé.

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
- **BCP** : chaque commande est une charge — le rapprochement commande/facture
  a un pendant financier.

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
