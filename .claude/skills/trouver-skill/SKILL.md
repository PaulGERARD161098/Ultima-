---
name: trouver-skill
description: Trouver, évaluer et absorber un skill, un plugin ou un serveur MCP externe pour Léo, ou faire l'inventaire des skills déjà installés. Déclencher quand Paul envoie une vidéo, une capture ou un lien vers un outil (« ce skill a l'air bien », « on peut l'absorber ? »), quand une tâche manque d'une compétence, ou pour un ménage des skills.
---

# Trouver et absorber un skill — pour Léo

Applique la **règle d'absorption** de la charte de Léo (§3, six points) ;
dernier passage complet : `.claude/leo-complements/README.md` §6 (38 outils).

## Étapes
1. **Ce qui existe déjà** : lister `.claude/skills/`, les skills du compte
   claude.ai (dossier `synced` de la séance), les agents, les connecteurs
   exposés. Inventaire et ménage : `references/ecc/skill-stocktake`.
2. **Chercher à la source** : annuaire skills.sh et méthode de
   `references/find-skills` (le CLI `npx skills` envoie une télémétrie : ne pas
   l'installer, lire l'annuaire et les dépôts par WebFetch) ; méthode de
   recherche : `references/ecc/skill-scout`.
3. **Vérifier le jour même** : dépôt officiel, licence, étoiles lues sur
   GitHub, dernier commit, ce qui part chez un tiers, coût. Une vidéo ou un
   agrégateur n'est pas une source. Pour un MCP : `references/ecc/mcp-dependency-review`.
4. **Verdict** : absorber · déjà couvert · geste de Paul · à cadrer · écarté ·
   refusé — avec la directive qui tranche (ZS, MS, JL, sécurité).
5. **Absorber la méthode, pas le code** : textes relus, licence copiée, commit
   épinglé, `SKILL.md` amont renommé `GUIDE.md` sous `references/`, regroupés
   dans un skill-parapluie existant ou nouveau (une description de plus
   coûte des tokens à chaque séance).
6. **Consigner** le verdict au §6 du README des compléments ; tout code tiers,
   clé d'API, dépense, connecteur claude.ai reste un geste de Paul.

## Sources (licences dans `references/`)
`vercel-labs/skills` @ `e7fd0e9e52f0` (MIT) : find-skills ·
`affaan-m/everything-claude-code` @ `4adeee6732a1` (MIT) : skill-scout,
skill-stocktake, mcp-dependency-review. Récupérés le 28/11/2026.
