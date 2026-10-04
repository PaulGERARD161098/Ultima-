# Fondation de contrôle R21 — préparation seulement

Cette arborescence reconstruit le kit perdu **depuis la fondation déjà fusionnée
de la PR #306**. Elle ne l'importe pas dans `leo-control-r21`, ne crée ni secret
ni approbation et ne déclenche aucun workflow. Le workflow fourni est un snapshot
inerte : même après une copie accidentelle, son unique job échoue fermé.

`manifest.json` inventorie le snapshot. Ses champs, notamment
`expected_workflow_sha`, restent des données : l'hôte de confiance doit fournir
séparément à `verify_foundation` les empreintes du manifeste et du workflow.
Copier les valeurs attendues depuis le paquet reviendrait à laisser le paquet
s'auto-approuver.

Le test `tests/runtime/test_control_r21.py` vérifie les ancres, les fichiers et
le refus fermé. Il mute explicitement `expected_workflow_sha` et exige que le
harnais rejette alors le paquet. Comme les autres tests runtime, il ne doit être
exécuté que dans la CI Docker isolée du workflow « Léo LV1 — fixtures isolées ».

Étapes ultérieures, hors de cette préparation : revue indépendante du diff et
des preuves CI ; import humain dans le dépôt exclu ; ancrage extérieur ; accord
exact ; déclenchement humain ; effet sur la seule fixture ; checkpoint et reprise.
