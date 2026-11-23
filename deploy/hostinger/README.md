# Déploiement hybride Léo sur VPS Hostinger (Option 1)

Architecture :
- **Vercel** sert l'interface web d'Ultima.
- **VPS Hostinger** (`srv2051208.hstgr.cloud` / `191.215.46.50`) exécute le runtime permanent de Léo derrière **Caddy** (HTTPS automatique Let's Encrypt).

## Faut-il acheter un nom de domaine ?

**Non, pas obligatoirement :**
1. **Meilleure option (0 €)** : si tu possèdes déjà un domaine (ex. `renoboostia.fr`), crée un sous-domaine gratuit (`leo.renoboostia.fr`) avec un enregistrement DNS `A` → `191.215.46.50`.
2. **Sans aucun domaine perso** : tu peux tester avec `srv2051208.hstgr.cloud` (fourni par Hostinger). Si Let's Encrypt limite les certificats sur `hstgr.cloud`, bascule sur un sous-domaine perso ou un Cloudflare Tunnel gratuit.

## Mise en route sur le VPS (en SSH, jamais de secrets dans Git)

```bash
# 1. Cloner le dépôt sur le VPS
git clone https://github.com/PaulGERARD161098/Ultima-.git
cd Ultima-/deploy/hostinger

# 2. Créer le fichier de secrets local (non versionné)
cp .env.vps.example .env.vps
chmod 600 .env.vps
nano .env.vps   # renseigner LEO_DOMAIN, ALLOWED_ORIGINS, clés Supabase & Anthropic

# 3. Ouvrir uniquement 80/443 (+ SSH) sur le pare-feu Hostinger / UFW, puis lancer :
docker compose --env-file .env.vps up -d --build

# 4. Vérifier la santé en HTTPS
curl -fsS "https://<TON_DOMAINE>/health"
# Attendu : {"ok":true,"service":"leo-vps"}
```

## Garde-fous actifs par défaut
- Conteneur `leo-runtime` en lecture seule (`read_only: true`), utilisateur non-root, `cap_drop: [ALL]`.
- CORS **fail-closed** : seules les origines HTTPS listées dans `ALLOWED_ORIGINS` peuvent appeler l'API.
- `LEO_ECRITURES_AUTO=coupees` par défaut + plafond atomique 100 appels / 24 h + zéro envoi réel.
