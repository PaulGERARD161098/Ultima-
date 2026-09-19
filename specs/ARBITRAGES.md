# Les arbitrages — quand deux specs se contredisent

> Une bibliothèque qui empile des documents normatifs sans dire lequel gagne ne
> range rien : elle déplace le conflit d'un cran plus loin, là où la prochaine
> séance le découvrira seule et le tranchera dans son coin.
>
> **Un arbitrage s'écrit ici, daté, avec qui l'a pris, ce qu'il abroge, ce qu'il
> laisse debout, et à partir de quand il mord.**

---

## A1 · Le registre visuel — le document Hopus l'emporte sur `DESIGN-LANGAGE.md`

**Tranché par Paul le 2026-09-18.** Question posée : *« le document Hopus demande
cartes / ombres / arrondis / icônes, `DESIGN-LANGAGE.md` les interdit (règles 1,
7, 8, 10) — qui gagne ? »* → **le document gagne.**

### Ce que ça abroge

| `RenoBoost/DESIGN-LANGAGE.md` | Remplacé par |
|---|---|
| règle 1 — *ni arrondi ni ombre, un filet de 1 px* | `contrats/00-foundations.md` § radius + élévation |
| règle 3 — *un seul lavis, sur la bande* | `contrats/00-foundations.md` § système de surfaces |
| règle 7 — *les faits en `dt`/`dd`, pas des cartes à icône* | `contrats/01-composants.md` — `FeatureCard`, `MetricChip` |
| règle 8 — *une seule couleur fonctionnelle visible par bloc* | `contrats/00-foundations.md` § rythme de section |
| règle 10 — *aucune icône décorative* | `contrats/01-composants.md` — `IconTile` |
| § 6 — *les sections sombres ne sont pas le fond systématique* | **maintenu** — le document dit la même chose (§ 6) |

### ⚠️ Ce que l'arbitrage NE couvre PAS, et qui reste debout

Un point précis sort de la question posée, et il ne se décide pas au registre
visuel : **le § 2 de `DESIGN-LANGAGE.md` — les encres et les paires de contraste.**

- Ce ne sont **pas des choix esthétiques mais des mesures** : sky-600 rend
  **4,10:1** sur blanc, emerald-600 **3,77:1** — sous le seuil AA dès qu'ils
  portent du texte. Les encres (sky-700 · emerald-700 · red-700) et la paire
  `--color-primary-solide` / `-encre` existent pour ça.
- **Le document Hopus ne les contredit pas : il n'en parle pas.** Sa propre
  *Definition of Done* (§ 11) exige au contraire responsive, clavier et
  accessibilité.
- Les onze contrastes repassés au-dessus d'AA le 16/09 (#479) ont été payés une
  fois. Les reperdre par ricochet d'un arbitrage de registre serait une
  régression que personne n'a demandée.

⇒ **§ 2 de `DESIGN-LANGAGE.md`, les tokens d'encre et les tests qui les tiennent
survivent intégralement.** Tout pattern de cette bibliothèque s'y conforme.

### ⛔ À partir de quand l'arbitrage mord

**À la bascule de la vitrine, pas avant** — Paul a tranché le même jour que D2
(l'application à RénoBoost) s'ouvre **après** les trois gestes réels en attente
(dépôt d'un devis PDF, rattachement de fiche, écriture Réno), et la vitrine V3/V4
a été fermée le 16/09 (« on s'arrête là sur le site »).

Jusqu'à cette bascule, `DESIGN-LANGAGE.md` **décrit ce qui tourne en production**
et reste la règle de toute retouche de la vitrine. Il ne devient faux qu'au
commit qui bascule — et c'est ce commit-là qui le réécrit, comme le document
l'exige lui-même.

### ✅ Éprouvé le 19/09 au soir — A1 ne bloque QU'UN pattern, et il faut le dire

*Trois patterns ont été posés sur la vitrine ce soir-là — `ReasonCards`,
`ComparisonMatrix`, `InteractiveCalculator` (RenoBoost PR #495) — **sous le
registre ancien**, sans arrondi, sans ombre, sans icône décorative. Ils passent.*

⛔ **Donc A1 n'est pas un verrou sur la bibliothèque entière.** La lecture
paresseuse de cet arbitrage — « le registre est gelé jusqu'à la bascule, donc
on ne pose plus rien » — est fausse, et elle coûterait des semaines. Sur les
quinze patterns, **un seul** exige réellement ce que la règle 1 interdit :

| Pattern | A1 le bloque&nbsp;? | Pourquoi |
|---|---|---|
| `BentoBenefits` | **oui** | une grille bento EST une grille de blocs arrondis et ombrés ; sans A1 en vigueur, elle n'a pas de forme |
| `ProductShowcase` · `MobileShowcase` | **non** | ils attendent des **captures réelles** du produit, qui n'existent pas. Rien à voir avec le registre |
| `LeadMagnet` | **non** | il attend un **contenu à offrir**, qui n'est pas écrit, et la gate G1 de RenoBoost |
| les onze autres | **non** | posés, ou posables tels quels |

⚠️ **Et la règle de décision qui généralise le cas** : un arbitrage qui « ne
mord pas encore » n'interdit pas d'avancer — il interdit d'avancer **avec les
moyens qu'il n'a pas encore autorisés**. La question à se poser devant chaque
pattern n'est pas « l'arbitrage est-il actif&nbsp;? » mais « **ce pattern a-t-il
besoin de ce que l'arbitrage rouvre&nbsp;?** ». Onze fois sur quinze, non.

⚠️ **Ne pas réécrire `DESIGN-LANGAGE.md` avant.** Un document normatif qui
décrirait un site qui n'existe pas encore ferait deux vérités concurrentes sur
la même page — et la prochaine séance croirait la mauvaise.
