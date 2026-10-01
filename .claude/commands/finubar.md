---
description: Appelle FINUBAR pour lire le pilotage transverse des projets et proposer une prochaine action.
argument-hint: [projet ou question — ou rien pour l’état d’ensemble]
---

Lis `.claude/skills/finubar/SKILL.md` avant de répondre. Cette commande appelle
le dispositif existant ; son format et ses règles restent dans ce skill.

Demande de Paul : $ARGUMENTS

Sans argument, restitue brièvement les projets qui appellent, les gestes en
attente et une prochaine action. Lis `finubar/macro.json` et le grain
`FINUBAR.md` ; annonce la date de collecte et toute source non examinée.
Avec un argument, réponds depuis ces mêmes preuves et leurs documents liés.
Une lecture ne vaut pas autorisation de modifier un projet ou d’envoyer un message.

À la fin d’une séance qui modifie un dépôt, applique le geste de fin de séance
du skill et régénère les deux agrégats avec le collecteur, jamais à la main.
