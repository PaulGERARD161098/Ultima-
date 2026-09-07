# Reprise — 06/09/2026 (soir) · Léo partout, le mail du matin, et le dry run

> **Ce fichier décrit un état daté, il ne le dérive pas.** Il est juste à la minute
> où il est écrit. Avant d'agir, vérifier — la mesure prime sur la note.

## 1. Ce qui est VIVANT (vérifié, pas déclaré)

| Quoi | Preuve |
|---|---|
| **Léo parle sur les 22 pages** | bouton « Parler à Léo », session requise ; `smoke-leo-partout` 8 sections |
| **Léo voit la table de marche** sur `/finubar` | réponse en production le 06/09 : « 16 gestes, 3 dépôts bloqués » — **recompté en base : exact** |
| **Le mail du matin part à 7 h** | reçu pour de vrai le 06/09 vers 23 h 40 après `?force=1` |
| Le bouton est dans le registre antique | parchemin/sépia/or ; gouttière mesurée par `smoke-leo-partout` §7 |

`main` = `7b928fc`. Zéro PR ouverte à la clôture. Patrimoine complet vert.

## 2. Le SEUL point non tranché

⚠️ **Les Routines DR (12 h et 18 h) visent une session persistante qui a bien ses
dépôts — mais le tir d'essai du 06/09 ne l'a pas réveillée.**

- Session : `session_019Vi5RYCmAWyWqdtGPtNF3C` — « DR — atelier permanent des dry runs ».
  Son `session_context.sources` contient `Ultima-` (**mesuré**), là où une Routine à
  session fraîche a `sources: []` (mesuré aussi : c'est ce qui a fait échouer le récap
  Finubar deux fois).
- Routines : `trig_01KMouKJL6uNtqMu2Jw26g7o` (12 h) · `trig_013E7JjAAbjsiPuw93j1pXLW` (18 h).
- **Ce qui n'a pas marché** : `fire_trigger` sur ces Routines a laissé la session à
  `used_tokens: 0` pendant 17 minutes. Elle ne s'est pas réveillée.

**Le contrôle qui tranche, au premier passage de 12 h** : la session a-t-elle bougé
(`get_session` → `used_tokens > 0`), et son rapport dit-il combien de dépôts elle a
clonés ? Le prompt lui ordonne de le déclarer en tête.

**Si elle ne se réveille pas** → repli déjà cadré : une **GitHub Action** par dépôt
(tests + lint + typecheck), qui a le code par `checkout` et ne dépend d'aucune session
Claude. Elle ne fera pas le dry run « adversaire », mais elle fera la partie mécanique,
tous les jours, sans rien demander.

## 3. Deux limites du dispositif DR, mesurées et inscrites dans son prompt

1. **Aucune notification** à Paul : le mécanisme ne vaut que pour les Routines à session
   fraîche. C'est le prix des dépôts. Son rapport passe donc par un fichier
   `DR-<date>.md` poussé dans le dépôt, plus la branche.
2. **Aucun outil MCP** (avertissement du serveur à la création) : pas de PR possible,
   pas de Supabase — donc le contrôle du jalon V0 (`audit_pac`) n'est pas faisable par
   elle. Le prompt lui ordonne de l'écrire au lieu de le taire.

## 4. Ce que le dry run de la séance a trouvé (Directive DR appliquée à soi)

- **Un bouton qui mentait** : `leo-partout` vérifiait `UltimaLeo` au CLIC, pas avant de
  poser le bouton. Sans `leo-accueil.js`, bouton mort et silencieux. Corrigé + `§8`.
- **La garde `CRON_SECRET` n'avait aucun test** alors qu'elle protège un ENVOI. `§6`,
  15 cas : variable absente, en-tête absent, secret préfixe, méthode, URL approchantes.
- ⛔ **Et mon propre test était faux** : il ne regardait que le code `503`, or la route
  en rend deux (« Service non configuré » vs « Envoi non configuré ») — une garde rendue
  permissive passait le test. Corrigé : on exige le motif.

## 5. ⏳ Ce qui n'attend que Paul

1. **Vérifier `renoboostia.fr`** sur resend.com/domains — sans ça le mail ne peut arriver
   que sur `paul.gerard@renoboostia.fr` (compte Resend en mode test).
2. **Régénérer `CRON_SECRET`** (projet Vercel `ultima`) : la valeur du 06/09 a circulé en
   clair dans une conversation et une capture. ✅ Vérifié : elle n'est **pas** dans le dépôt.
3. **Recruter et valider des artisans** (RénoAgenda, ouvert depuis 53 j) · **fiche Google
   Business** (33 j) · **imprimer un lot de stickers** (33 j). Aucun ne demande de code.

## 6. Pre-mortem à 3 mois — décembre 2026, ce dispositif ne sert plus

| Cause probable | Signal précoce | Mitigation |
|---|---|---|
| **Le mail du matin annonce un état vieux de trois semaines** et Paul cesse de l'ouvrir | l'avertissement d'âge apparaît plus de deux jours de suite | la GitHub Action nocturne qui recollecte et commite — la boucle est déjà ouverte au grain |
| **Les Routines DR n'ont jamais tourné** et personne ne l'a remarqué | aucun fichier `DR-*.md` poussé | le contrôle de 12 h ci-dessus ; en dernier ressort, les désactiver plutôt que les laisser mentir |
| **Léo devient bavarde et Paul ne lui parle plus** | Paul a dit le 06/09 « on amendera son ton et son style plus tard » — c'est une dette ouverte | boucle « ton de Léo », non ouverte à dessein |
| **L'atelier DR gonfle et coûte cher** | la Veille BTP est à 152 k tokens après trois semaines | surveiller `context_usage` ; recréer l'atelier si besoin (il est jetable, c'est son intérêt) |
| **Les trois gestes de Paul restent ouverts** — 53, 33 et 33 jours | ils sont les plus vieux du système et bloquent trois briques | ils sont en tête du mail chaque matin ; c'est précisément ce que le mail existe pour faire |

## 7. Prompt de reprise (à coller tel quel)

> Reprise Ultima. Lis `FINUBAR.md` (le grain), puis ce fichier §2.
> **Premier fait à établir, avant toute nouvelle boucle** : l'atelier DR
> (`session_019Vi5RYCmAWyWqdtGPtNF3C`) s'est-il réveillé au passage de 12 h —
> `get_session` → `used_tokens > 0` ? Et a-t-il poussé un `DR-<date>.md` ?
> Si oui : le dispositif est bon, ne rien retoucher.
> Si non : ouvrir la boucle « GitHub Action par dépôt » (§2, repli déjà cadré).
> ⛔ Ne pas ouvrir d'autre chantier avant : les trois gestes de Paul (§5) sont le
> vrai goulot, pas le code.
