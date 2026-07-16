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

- **TRAVELLER** : Godefroy (partenaire pressenti) ; le réseau d'artisans
  d'Ultima est le vivier naturel des premiers clients « mise à la benne ».
- **BCP** : à terme, structure à part — pilotage financier séparé.

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

- **TRAVELLER** : Julien (partenaire pressenti) ; le réseau fournit
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

- **TRAVELLER** : les chantiers sont déjà des nœuds du réseau — l'INTENDANT
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

- **TRAVELLER** : le cœur du mécanisme existe déjà — relances au bon moment
  (journal/relances v2), leads et relations d'apport d'affaires ; MYCÉLIUM
  est la doctrine commerciale qui exploite cet outillage. Le lien
  parrain → filleul est une relation typée du réseau.
- **ADR-003 INTENDANT** : un chantier bien approvisionné se termine bien —
  l'INTENDANT fabrique les victoires, MYCÉLIUM les exploite.
- **ADR-002 PROTÉE** : même doctrine applicable à ses chantiers (« on
  applique ça partout »).
