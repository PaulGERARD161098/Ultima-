# CADRAGE — Images avant/après (RénoBoost IA et Léo) — 28/11/2026

> Go de cadrage donné par Paul le 28/11/2026. **Cadrage seulement** : aucune
> clé, aucune dépense, aucune ligne de code tant que les décisions du §7 ne
> sont pas tranchées. Le dépôt RénoBoost n'est pas attaché à cette séance : ses
> règles (§12.2 : ce qui se promet) sont à relire avant l'étape ②.

## ① Le but (MS)
Un pro ou un particulier envoie la photo d'une pièce ; il reçoit en moins
d'une minute 2 à 3 rendus « après travaux » réalistes (isolation, peinture,
cuisine, salle de bains, façade), marqués **« visuel indicatif généré par IA »**.
- **Client visé** : le particulier qui hésite à demander un devis (RénoBoost
  IA), et le pro partenaire qui veut montrer le résultat avant de signer.
- **Indicateur** : taux de demandes de devis après un rendu, lu dans la base
  RénoBoost (rendus produits → devis demandés → rendez-vous tenus). Jamais
  promettre une signature.
- **Pour Léo** : le même procédé, sur demande de Paul (« montre-moi cette
  pièce refaite »), pour préparer un rendez-vous ou un pitch.

## ② Les étapes
1. **Maquette avant code (EL)** : 3 photos de test (pièces sans personne, sans
   adresse visible), 3 consignes, rendus produits à la main dans Google AI
   Studio par Paul → on juge la qualité avant toute intégration.
2. **Skill `rendu-avant-apres`** pour Léo : consigne type par corps de métier,
   appel à l'API Gemini image, filigrane et mention « indicatif ».
3. **Pilotage d'abord (règle back-office du 13/10)** : dans l'administration
   RénoBoost, un écran de contrôle avant toute ouverture au public — compteur
   de rendus par jour, coût estimé, plafond, arrêt d'un clic, journal des
   refus.
4. **Intégration RénoBoost IA** : route serveur (clé côté serveur uniquement),
   plafond quotidien atomique en base (modèle `leo_appels`), photo supprimée
   après rendu sauf accord explicite.
5. **Preuve (DR)** : cas hostiles — photo avec visage, photo hors sujet,
   consigne détournée, plafond atteint, clé absente — chacun doit refuser
   proprement.

## ③ Les moyens (ZS)
| Option | Verdict |
|---|---|
| **API Gemini image (« Nano Banana », Google AI Studio)** | **Retenue** : édite une photo fournie à partir d'une consigne, API officielle, quelques centimes par image, ajoute un filigrane invisible SynthID |
| Canva (génération d'image, déjà raccordé) | Écartée : génère, n'édite pas fidèlement une photo réelle |
| Skill communautaire « banana » | Écartée comme code : on reprend la méthode, appel écrit nous-mêmes |
| Logiciel de déco 3D / designer | Écartée : lent, cher, hors époque pour un premier rendu |

**Prix : non confirmé à la source.** Les pages officielles (ai.google.dev)
sont injoignables depuis la séance du 28/11 ; les sources tierces divergent :
de ≈ 0,02 $ à ≈ 0,15 $ par image selon le modèle et la résolution, et la
gratuité en accès API est contredite d'une source à l'autre
([Google, instantané de la page de prix](https://ai.google.dev/gemini-api/docs/pricing?authuser=6),
[myarchitectai](https://www.myarchitectai.com/blog/nano-banana-api-pricing),
[developer.puter.com](https://developer.puter.com/tutorials/gemini-api-pricing/),
[magichour](https://magichour.ai/blog/nano-banana-pro-pricing)). À relire par
Paul sur ai.google.dev/pricing avant la décision ②. Ordre de grandeur : 100
rendus × 3 images × 0,05 $ ≈ 15 $ par mois.

**Moyens touchés** : clé Google (secret réseau ou variable Vercel, jamais dans
le dépôt), hôte `generativelanguage.googleapis.com` à autoriser, Supabase
(stockage temporaire, compteur), dépôt RénoBoost (route + écran), Ultima
(skill de Léo).

## ④ Les critères de réussite (vérifiables)
- 3 rendus sur 3 jugés « crédibles » par Paul sur les photos de test.
- Rendu en < 60 s, coût mesuré par rendu lu sur la console Google.
- 0 photo conservée sans accord ; 0 clé dans le dépôt (balayage).
- Le plafond refuse la n+1ᵉ demande (test en base, comme `PLAFOND_OK`).
- Chaque rendu porte la mention « visuel indicatif » à l'écran.

## ⑤ Ce qu'on ne fait PAS
- Pas de rendu présenté comme un engagement de résultat ou de prix.
- Pas de visage, de plaque, d'adresse : refus ou floutage avant envoi.
- Pas d'ouverture au public avant l'écran de pilotage éprouvé.
- Pas de vidéo, pas de 3D, pas de stockage long des photos.

## ⑥ Pre-mortem — « à 3 mois, c'est un échec : pourquoi ? »
1. **Rendus irréalistes** (meubles qui changent, murs déplacés) → le client
   perd confiance. *Parade* : maquette de l'étape 1 avant tout code, consigne
   « conserver la géométrie ».
2. **Facture qui dérive** (robots, abus) → *Parade* : plafond en base, pas de
   rendu sans compte, alerte de dépense Google.
3. **Litige « on m'avait montré ça »** → *Parade* : mention, filigrane,
   conditions d'usage, aucun prix sur l'image.
4. **Fuite de photos privées** → *Parade* : suppression après rendu, données
   en UE, consentement explicite.

## ⑦ Décisions attendues de Paul
1. Valider l'ordre de grandeur de dépense (≈ 15 $/mois au départ, plafond à
   fixer) après lecture de la page de prix officielle.
2. Créer la clé Google AI Studio avec facturation et me la donner par le
   formulaire de secret (jamais dans la conversation).
3. Fournir 3 photos de test sans personne ni adresse.
