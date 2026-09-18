# 📚 La bibliothèque de specs — les huit dépôts, un seul rayonnage

> **Posée le 2026-09-18**, sur demande de Paul : *« on se crée pour tous mes
> repos et tous mes travaux une biblio de specs »*.
>
> Elle vit dans **Ultima** parce que la directive JL le veut : Ultima est
> l'interface unique, et **rien d'autre ne se crée à côté** — tout nouveau
> besoin devient une extension d'Ultima. C'est déjà le cas de Finubar, qui
> pilote les mêmes huit dépôts depuis `finubar/`. La bibliothèque est à la
> **spec** ce que Finubar est à l'**état d'avancement**.

---

## Ce qu'elle contient, et la différence entre les deux

| Rayon | Quoi | Qui l'écrit |
|---|---|---|
| **`contrats/`** | Ce que la bibliothèque **porte** : les règles transverses, réutilisables par n'importe quel dépôt — foundations, composants, patterns, compositions. | à la main, normatif |
| **`INDEX.md`** | Ce que la bibliothèque **recense** : les specs qui vivent déjà dans les huit dépôts, avec leur état **mesuré**. | `collecter.mjs`, jamais à la main |
| **`recu/`** | Les cahiers des charges **reçus de l'extérieur**, versionnés tels quels. | personne — on ne modifie pas un document reçu |
| **`ARBITRAGES.md`** | Les décisions de Paul qui tranchent entre deux specs qui se contredisent. | à la main, daté, avec la raison |

## ⛔ Les trois règles, et pourquoi elles existent

1. **Elle indexe, elle ne recopie pas.** La spec détaillée reste où elle vit ;
   l'index porte son chemin. Recopier fabrique deux vérités qui divergent — et
   on croit la mauvaise. *(La même règle tient Finubar depuis le 21/08.)*
2. **L'état d'une spec est MESURÉ, pas déclaré.** « Vivante / dormante /
   fossile » se dérive de la date du dernier commit qui a touché le fichier,
   jamais d'un champ tenu à la main. Un champ d'état à tenir n'est pas tenu :
   il devient un cimetière qui se présente comme un catalogue.
3. **Ce qu'elle écarte, elle le DIT.** Le recensement exclut les journaux de
   séance (`REPRISE-`, `AUDIT-`, `GARAGE-`, `NOTE-`, `POST-`, les roadmaps de
   fin de séance) — et il affiche combien il en a écarté. Un filtre silencieux
   se lit comme une absence, et c'est le pire des deux états.

## S'en servir

```bash
node specs/collecter.mjs            # recense les dépôts présents, réécrit INDEX.md + index.json
node specs/collecter.mjs 2026-09-18 # à une date donnée (rejouable)
node tests/unit-specs-collecte.mjs  # le harnais du collecteur
```

⚠️ **Le collecteur ne voit que les dépôts présents à côté d'Ultima.** Une séance
n'en a presque jamais huit. Les absents sont écrits **« non mesuré »** dans
l'index, avec la commande pour les mesurer — **jamais « 0 spec »** : un dépôt
qu'on n'a pas ouvert et un dépôt vide ne se ressemblent que sur le papier.
