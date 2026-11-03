---
name: rapport-client-pro
description: 'Produire un bilan commercial mensuel par professionnel de Paul depuis RB, RenoDevis et ses agendas, sous forme de mail court prêt à transférer. Déclencher sur « rapport client pro : X », bilan client professionnel, SOLA, DOKLĚS ou SPC dans ce contexte. Fournir ici à la demande ; envoyer à Paul seulement sur mandat explicite ou tâche mensuelle configurée.'
---

# Rapport client pro

## Mandat validé le 23 octobre 2026

Produire un mail distinct par professionnel actif avec lequel Paul travaille, une page maximum. À « rapport client pro : X », fournir ici le mail en writing block, sans envoi implicite. Pour la tâche mensuelle autorisée, envoyer uniquement à Paul Gérard, paul.gerard@renoboostia.fr, jamais aux professionnels ni aux clients finaux. Première édition : vendredi 30 octobre 2026 ; dernier vendredi mensuel à 16h Europe/Paris. Une compétence ne programme rien à elle seule.

Commencer avec SOLA, DOKLĚS et SPC. Identifier les autres collaborations actives dans RB avec preuve ; ne pas confondre profils, prospects professionnels, comptes de test et clients actifs. Isoler les cas ambigus pour Paul.

## Sources réelles

Recouper RB (contacts, projets, notes et RDV), RenoDevis (devis, envois et signatures) et les agendas de Paul. Consulter Gmail de façon ciblée pour compléter les faits HH et retours métier manquants, sans scanner toute la boîte.

Repères vérifiés le 23/10/2026, à revalider au passage :
- RB : https://www.renoboostia.fr ; RD : https://relance-renoboostia.com.
- Base partagée Supabase RenoboostIA : `mwaryfscxgrulauwwque`. Lecture SQL réussie ; tables public.clients, prospects, rdv, devis, profiles ; 211 clients, 2 prospects, 37 rdv et 34 devis au contrôle, chiffres historiques et non référence de total futur.
- rdv : pro_id, ghl_id, contact_ghl_id, pris_le, debut_le, fin_le, issue, client_id.
- devis : client_id, owner_id, statut, montant_ht, signed_at, extra. Relire schéma et conventions avant tout calcul. Ne pas présumer que montant est HT.
- Agendas : `paul.gerard@renoboostia.fr` et `pag.gerard@gmail.com`. Paginer ; lire les descriptions utiles ; dédupliquer les copies intercalendriers.
- SOLA : RB/GHL et RD. DOKLĚS : HH puis GHL avec reprise publicitaire annoncée le 24/10 ; vérifier son démarrage réel. SPC : HH, RB et agenda. HH désigne helloArtisan dans les échanges de Paul.

Résoudre le pro exact et les liens owner_id, pro_id, artisan_id, client_id avant de joindre les données. Ne pas attribuer les devis de tout le compte admin à un seul pro. Une lecture Supabase ne prouve pas une connexion GHL complète : vérifier fraîcheur et couverture du miroir, signaler les manques. Un fichier de code ne prouve pas l'état des données. Production du rapport en lecture seule ; traiter les réparations API dans un mandat séparé, sans écrasement ni migration implicites.

## Période et comptage

Indiquer début et arrêté en Europe/Paris : premier du mois à 00h jusqu'à l'exécution. Présenter « bilan au [date] » si le mois n'est pas terminé. Les événements après l'arrêté et avant la fin du mois seront présentés dans un bref complément du bilan suivant, daté et séparé des totaux courants ; sans ancien arrêté vérifiable, ne pas inventer ce rattrapage. Garder les affaires antérieures encore ouvertes dans le stock.

Dédupliquer par pro et identifiants stables ; téléphone/email normalisés servent d'indices, jamais de fusion aveugle. Exclure essais et données fictives.

| Indicateur | Règle |
|---|---|
| Clients joints au téléphone | Clients uniques ayant eu un échange réel daté dans la période. Exclure appels sans réponse, messageries et imports. RDV ou devis ne prouvent pas un appel. |
| Clients avec RDV planifié | Clients uniques avec prise de RDV documentée dans la période, même pour une visite ultérieure. Ne pas remplacer silencieusement date de prise inconnue par date de visite. |
| RDV réalisés | Visites de la période avec résultat effectué prouvé. Heure passée et statut agenda confirmed ne prouvent pas la présence. |
| Présence / absence | show/(show+no-show) et no-show/(show+no-show), visites échues de la période à issue connue. Exclure reports/annulations ; signaler séparément les issues inconnues. BERTIN déclaré en suspens le 23/10 n'est pas absent. |
| Devis en cours / RDV | RDV réalisés dans la période ayant donné lieu à au moins un devis envoyé encore ouvert à l'arrêté / RDV réalisés dans la période. Prouver lien et envoi ; un RDV compte une fois. Exclure brouillons, variantes en double, signé/perdu. |
| Affaires en cours | Projets commerciaux ouverts à l'arrêté, même antérieurs au mois ; compter les affaires, pas les devis alternatifs ou tous les contacts. Lister client, étape et prochaine action. |
| Signatures et CA signé HT | Affaires réellement signées dans la période avec date et preuve. Détail HT par signature et somme HT ; exclure variantes non retenues et doubles imports. Utiliser HT prouvé, jamais TTC pris pour HT ou TVA uniforme supposée. Ne pas assimiler signé à encaissé. |

Dénominateur nul : « — (aucun RDV éligible) ». Couverture incomplète : nombre confirmé avec réserve ou « non renseigné », jamais faux zéro. Calculer les euros en décimal, arrondir aux centimes ; pourcentages à une décimale maximum.

## Mail final, une page

Objet : « [Professionnel] — Bilan commercial — [mois année] ».

Bonjour,

Voici votre bilan commercial du [début] au [arrêté].

Tableau compact : clients joints au téléphone ; clients avec RDV planifié ; RDV réalisés ; présence ; absence sans prévenir ; RDV avec devis en cours (n/d et %) ; affaires en cours. Ajouter signatures et CA signé HT lorsqu'ils sont prouvés. Si aucune signature et couverture complète, une seule ligne suffit ; sinon mentionner non vérifiable.

Affaires en cours : lignes courtes, client / étape / prochaine action.
Signatures : client / montant HT pour chacune, puis total, si applicable.
Réserves : seulement les limites matérielles, en français simple.

Bien cordialement,
Paul

Ne pas ajouter jargon, tableau de bord, coordonnées privées inutiles, chiffres fictifs ou mention HH/helloArtisan dans le mail à transférer sauf demande explicite. Garder détails techniques et preuves dans une note séparée pour Paul.

## Vérification, planification et envoi

Recompter les listes nominatives puis rapprocher aux sources ; résoudre les contradictions. Deux vues d'une même base ne sont pas indépendantes. Pour réviser le dispositif, croiser quatre angles : utilité du pro, charge opérateur, calendrier/dépendances, risques de doublon et d'attribution.

Découvrir les outils réels et lire les compétences pertinentes. Avant de programmer une tâche utilisant une app, réussir un appel de lecture sur cette app. Vérifier destinataire Paul et isolation d'un pro par mail ; rechercher avant envoi un message déjà envoyé pour ce pro/période/édition. En cas d'issue d'envoi inconnue, rechercher avant rejeu. N'envoyer aucun mail réel pour tester sans mandat.

Si une source critique est inaccessible, alerter Paul séparément, ne pas envoyer de bilan chiffré trompeur, poursuivre les autres pros accessibles. Rapporter uniquement les envois réellement confirmés ; un succès d'envoi ne prouve pas réception. Ne pas prétendre que le suivi quotidien, GHL ou l'envoi ont été testés parce que la compétence est publiée.
