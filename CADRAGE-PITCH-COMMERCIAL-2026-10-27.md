# Pitch commercial — ZOH et RénoBoost Prospection

## Mandat et résultat

Demande de Paul du 27/10/2026 : créer la techno « pitch commercial » dans ZOH, conserver toute l'ossature des discours, puis façonner trois discours (RénoBoost, IceStream, ALTILEO), adaptés au profil appelé et au service ou client représenté. Leur lieu d'utilisation prévu est RénoBoost → Prospection.

But commercial : qualifier un besoin et obtenir un rendez-vous utile avec les bons participants. Indicateurs à mesurer en usage : besoins confirmés, rendez-vous acceptés et tenus ; aucun gain encore mesuré.

## Cadrage de cette livraison

- Étapes : inspecter le catalogue existant, conserver l'ossature dictée, ajouter le badge, régénérer sa projection et vérifier les sources ; préparer la suite métier.
- Moyens : dossier neutre `zohshia/pitch-commercial/`, générateur existant `zohshia/publier.mjs`, projection `api/_lib/zohshia-technos.mjs`. L'accès GitHub fonctionne ; le clone HTTPS direct demande une authentification absente, donc utilisation du connecteur.
- Réussite : un cinquième badge avec trois onglets non vides ; toutes les consignes ci-dessous présentes ; noms et données de campagne hors du socle neutre.
- Hors périmètre de ce lot : modification de l'écran Prospection, migration de base, envoi réel, fusion et déploiement. La suite d'intégration reste explicitement ouverte.
- Risques : inventer une offre ou une preuve → inconnues explicites ; confondre sous-traitance entrante et sortante → question ; mélanger les marques → campagnes séparées ; déclarer l'écran disponible sur la seule présence d'un fichier → statuts distincts.
- ZS : réutiliser les fichiers et le générateur déjà présents, sans abonnement ni API IA supplémentaire. Une génération automatique à chaque appel ajouterait coût et variabilité sans besoin établi ; adaptation humaine depuis le socle retenue pour ce lot. Aucun coût total chiffré n'est revendiqué.

## Décisions commerciales conservées

Chaque phrase est orientée vers la personne contactée, son besoin et son résultat. AIDA : accroche métier CVC ; intérêt envers le client ; désir étayé par une preuve sociale réelle ; action avec deux créneaux.

Le motif du contact et la demande de rendez-vous sont directs. Les variantes historiques « si je vous appelle, ce n'est pas un hasard », « je connais votre métier et vos enjeux » et « je suis convaincu qu'on peut faire des affaires ensemble » expriment l'intention ; la règle ultérieure de Paul interdit d'en faire un discours centré sur le vendeur. Les formulations actives sont donc réorientées vers le prospect dans `OSSATURE.md`.

Conserver les variantes : confrère à Lyon uniquement si réel et autorisé ; rappel court si pressé ; « C'est quand le pire moment pour vous voir ? » selon le contexte, suivi de deux propositions. Ni nombre de clients ni chiffre d'affaires fictifs.

À connaître en fin de conversation : dépendance à la sous-traitance, poids des relances devis, pertes de clients et autre participant utile au rendez-vous. En cas de doute, poser la question ; confirmer la priorité.

## Trois campagnes à façonner

| Campagne | Base disponible | À confirmer avant finalisation |
|---|---|---|
| RénoBoost | Développement clientèle directe, préparation et suivi des devis, relances ; cible CVC travaillée dans cet échange | Service précis prioritaire, disponibilité actuelle des fonctions et preuve utilisable |
| IceStream | Catalogue PAC et climatisation présent dans le dépôt RénoBoost, migrations du 23/06/2026 lues via recherche GitHub | Mandat commercial actuel, profil acheté/contacté, offre, bénéfices démontrés, conditions et preuves ; un catalogue ancien ne les prouve pas |
| ALTILEO | Nom fourni par Paul | Activité, service vendu, client représenté, cible, zone et preuves ; recherche GitHub sans résultat, ce qui ne prouve pas une absence d'activité |

## Brouillon RénoBoost — artisan CVC

Bonjour [prénom]. Cet appel concerne votre activité de chauffage et de climatisation sur [zone], pour convenir d'un rendez-vous autour du développement de votre clientèle directe et du suivi de vos devis.

Aujourd'hui, votre priorité serait plutôt de moins dépendre de la sous-traitance, ou de passer moins de temps sur les devis et les relances ? [Écouter ; clarifier si nécessaire.]

Donc le sujet principal pour vous, c'est [besoin confirmé]. Pour votre entreprise, l'objectif serait [bénéfice correspondant au service retenu]. [Insérer une preuve autorisée et vérifiée si disponible ; sinon omettre.]

Pour regarder cela sur votre cas, vous préférez [créneau 1] ou [créneau 2] ? Qui aurait intérêt à participer avec vous ?

Statut : brouillon à adapter ; aucune preuve sociale ni disponibilité produit actuelle validée dans cette séance.

## Reprise vers Prospection

Étape suivante : confirmer les offres et profils manquants, façonner les trois discours et leurs variantes appel/mail. Puis inspecter le stockage et le parcours Prospection existants avant maquette et raccord : choisir la campagne et le profil, consulter le discours, noter la qualification et la prochaine action au bon prospect. Aucun duplicata de la base clients.

Références inspectées : `RenoBoost/prospection-pro.js` et `RenoBoost/prospection-workspace.css` repérés via recherche ; leur contenu complet et le stockage des scripts restent à inspecter avant implémentation. Le catalogue ZOH est servi au propriétaire par `Ultima-/api/zohshia.js` ; aucun droit modifié par ce lot.

## Vérification de l'ossature — consigne finale du 27/10/2026

Priorité confirmée par Paul : assurer l'ossature avec tous les éléments du jour ; les adaptations viennent ensuite. Les trois marques restent des campagnes futures distinctes ; aucune précision d'offre n'est requise pour terminer ce socle commun.

| Élément demandé | Emplacement de référence | État documentaire |
|---|---|---|
| Discours direct, bref, motif du contact et rendez-vous | OSSATURE.md — Appel principal | Présent |
| Toujours parler du prospect, jamais développer une présentation de soi | TECHNO.md — Résultat attendu et règles | Présent |
| Répondre au besoin et le reformuler avant la solution | OSSATURE.md — Appel principal | Présent |
| AIDA : accroche métier, intérêt client, désir, action | TECHNO.md — Méthode AIDA | Présent |
| Accroche dédiée aux professionnels CVC | OSSATURE.md — Variante CVC | Présent |
| Sous-traitance, administratif, devis, relances et temps chantier/client | OSSATURE.md — Variante CVC et qualification | Présent |
| Preuve sociale réelle, référence comparable et pertinence de la zone | OSSATURE.md — Appel principal | Présent |
| Nombre de clients et CA généré seulement si sourcés et attribuables | TECHNO.md — Règles ; MISE-EN-SERVICE.md — Préparer une campagne | Encadré ; aucun chiffre disponible ajouté |
| Confrère à Lyon, seulement si réel | Décisions commerciales conservées ; OSSATURE.md — référence à [ville] | Conservé sans affirmation factuelle |
| Variante « pire moment », rappel court et deux créneaux | OSSATURE.md — Variantes de rendez-vous | Présent |
| Quatre informations : sous-traitance, relances lourdes, perte clients, participant | OSSATURE.md — Qualification en fin d'échange | Présent |
| En cas de doute, poser une question, puis confirmer | TECHNO.md — Règles ; OSSATURE.md — ambiguïté | Présent |
| Appel et mail adaptés au profil, service et client représenté | TECHNO.md — Entrées et sorties ; OSSATURE.md — Mail | Présent ; adaptation reportée à la suite |
| Utilisation future dans RB → Prospection | Reprise vers Prospection ; MISE-EN-SERVICE.md — Utilisation | Prévue, non implémentée |

Relecture depuis le prospect : son problème ne doit pas être présumé ; les exemples restent des pistes à confirmer. Relecture depuis le vendeur : un prochain rendez-vous et les bons participants doivent être identifiables. Relecture adverse : ni confrère, ni résultat, ni service disponible ne sont fabriqués pour compléter les blancs. Il s'agit d'une vérification documentaire, pas d'une recette d'appel réel ni d'un test de l'écran.

État de livraison : socle et badge généré sauvegardés sur la branche de la PR #424 ; non fusionnés. Les contrôles structurels de la livraison précédente passent et la projection distante a été relue. Tests applicatifs et affichage non vérifiés. Prochaine étape à la demande de Paul : adapter l'ossature à chacune des trois campagnes.
