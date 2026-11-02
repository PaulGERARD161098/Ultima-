# Le générateur de devis — deuxième étoile de ZOH SHIA

> Posé le 08/10/2026 sur demande de Paul : *« enregistre le script de génération
> de devis dans ZOH SHIA — une seconde étoile : générateur de devis »*. Il est né
> d'un devis réel, refait dans la forme exacte des factures de Paul.

## 1. Ce que fait la techno

Un **fichier de paramètres** (JSON) et un **gabarit** (`gabarit.html`) donnent un
**devis PDF d'une page**, dans la mise en page des factures : logo, bloc émetteur
et client, tableau des lignes, détails TVA, récapitulatif, encart de paiement,
mentions de retard, pied de page légal.

Ce qui distingue le devis de la facture, et que le gabarit porte en dur :

| Facture | Devis |
|---|---|
| « Facture » | « Devis » |
| Date d'échéance | Date de validité |
| Total TTC | Total TTC, puis **acompte à la signature** et **solde à la remise** |
| Encart de paiement seul | Encart de paiement **et** cadre « Bon pour accord » |
| Mentions de retard | Validité, conditions de règlement, conditions propres au devis, puis mentions de retard |

| Fichier | Rôle |
|---|---|
| `gabarit.html` | La mise en page, neutre : que des champs entre doubles accolades |
| `generer.mjs` | Valide les paramètres, calcule, échappe, remplit, imprime en PDF (Chromium sans tête) |
| `exemple.parametres.json` | La forme des paramètres, sans aucune valeur réelle |
| `tests/unit-zohshia-devis.mjs` | Les calculs, l'échappement, les refus — dans la suite unitaire |

## 2. Faire un devis

1. Copier `exemple.parametres.json` **hors du dépôt** et le remplir : numéro,
   dates, émetteur, client, lignes, taux de TVA, pourcentage d'acompte,
   conditions. Les chemins du logo et des polices sont relatifs à ce fichier.
2. Lancer `node zohshia/devis/generer.mjs --parametres <devis.json> --sortie <dossier>`.
   La ligne rendue donne HT, TVA, TTC, acompte et solde : **les relire** avant
   d'ouvrir le PDF.
3. Ouvrir le PDF et vérifier la page unique, le nom exact du client et le
   numéro.
4. Le ranger avec ses paramètres dans le dossier de facturation de Paul.

`--html-seulement` s'arrête au HTML (aperçu sans navigateur). Le navigateur se
choisit par la variable `ZOH_CHROMIUM`, sinon le Chromium de Playwright.

## 3. Les règles de calcul

- **Tout en centimes entiers**, jamais en flottant. Arrondi au demi-centime
  supérieur.
- Ligne : HT = prix unitaire HT × quantité ; TTC de ligne = HT + TVA de la ligne.
- Totaux : TVA = arrondi(total HT × taux) ; TTC = total HT + TVA.
- **Acompte = arrondi(TTC × pourcentage)** ; **solde = TTC − acompte**. Le solde
  se déduit, il ne se recalcule pas : acompte + solde = TTC, toujours.
- Un seul taux de TVA par devis — celui des factures de prestation.

## 4. Ce qui ne vit pas ici

- **Aucune valeur** : ni identité d'émetteur, ni IBAN, ni client, ni montant.
  Tout arrive par les paramètres, qui ne se versionnent pas.
- **Ni logo, ni police** : ce sont des fichiers de l'émetteur, passés par
  chemin et embarqués dans le PDF au moment du rendu.
- **Pas de numérotation automatique** : le numéro se donne. Un compteur sans
  registre des devis émis fabriquerait des doublons.

## 5. Les gates

- **Envoyer un devis** à un client est un effet métier réel : mandat précis de
  Paul, jamais à l'initiative de l'agent. Préparer un brouillon est permis.
- **Une valeur client inconnue** (raison sociale exacte, numéro de TVA) se
  demande ; elle ne se déduit pas. Un champ facultatif vide vaut mieux qu'un
  champ plausible.
- Le générateur **refuse** plutôt que de produire un devis à trou : champ
  obligatoire vide, montant ou taux mal formé, IBAN hors format, champ du
  gabarit sans valeur.
