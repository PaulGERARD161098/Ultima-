-- Ultima — migration 0013 : IMLADRIK / boucle Drive, sous-boucle ① (connexion).
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations / RLS →
-- escalade Opus). Le SQL vit ici ; Léo l'applique au fil principal après go Paul.
--
-- Additif et non destructif : une seule table neuve (imladrik_drive_tokens),
-- aucune table existante touchée. Réserve le stockage du jeton de rafraîchissement
-- Google pour la sauvegarde du journal IMLADRIK vers le Drive PERSONNEL de Paul.
--
-- Sécurité (cadrage securite-auditeur 2026-07-23, CADRAGE-CONSOLE §3.4) :
--   - Le jeton de rafraîchissement Google est **chiffré au repos** (AES-256-GCM,
--     clé `DRIVE_TOKEN_ENC_KEY` en env Vercel, JAMAIS en base) : un dump base ou
--     un contournement RLS en lecture ne livre aucun credential exploitable.
--     Seul du texte chiffré (b64url iv|tag|ciphertext) est stocké ici.
--   - L'access_token n'est PAS persisté (court, régénéré à la demande).
--   - RLS stricte par owner : owner_id = (select auth.uid()) (initplan, cf. 0003),
--     une policy par opération, WITH CHECK sur les écritures. owner_id NOT NULL
--     default auth.uid() (cf. 0004), FK auth.users cascade, JAMAIS accepté du
--     client. Mono-utilisateur : owner_id en clé primaire = une ligne par personne.
--   - Ni jeton ni contenu en logs (règle CLAUDE.md étendue §5).
--
-- La sous-boucle ② (push du journal) ajoutera l'ancrage id↔drive_file_id par une
-- migration ADDITIVE ultérieure (jamais en retouchant imladrik_entrees).

create table public.imladrik_drive_tokens (
  -- Une seule connexion Drive par personne (mono-utilisateur) → owner_id = PK.
  owner_id             uuid primary key default auth.uid()
                       references auth.users (id) on delete cascade,

  -- Jeton de rafraîchissement Google CHIFFRÉ (AES-256-GCM). Format applicatif :
  -- b64url(iv) . b64url(tag) . b64url(ciphertext). Déchiffrable uniquement avec
  -- DRIVE_TOKEN_ENC_KEY (hors base). Borne large, jamais en clair.
  refresh_token_chiffre text not null check (char_length(refresh_token_chiffre) between 1 and 4000),

  -- Scope réellement accordé (attendu : « https://www.googleapis.com/auth/drive.file »).
  scope                text not null check (char_length(scope) between 1 and 500),

  -- Id du dossier Drive dédié créé par l'app (drive.file). Null tant que non créé.
  drive_folder_id      text check (drive_folder_id is null or char_length(drive_folder_id) <= 200),

  connected_at         timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger imladrik_drive_tokens_set_updated_at
  before update on public.imladrik_drive_tokens
  for each row execute function public.set_updated_at();

-- RLS : accès strictement limité à owner_id = (select auth.uid()).
alter table public.imladrik_drive_tokens enable row level security;

create policy imladrik_drive_tokens_select on public.imladrik_drive_tokens
  for select using (owner_id = (select auth.uid()));

create policy imladrik_drive_tokens_insert on public.imladrik_drive_tokens
  for insert with check (owner_id = (select auth.uid()));

create policy imladrik_drive_tokens_update on public.imladrik_drive_tokens
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy imladrik_drive_tokens_delete on public.imladrik_drive_tokens
  for delete using (owner_id = (select auth.uid()));

-- rollback :
--   drop policy if exists imladrik_drive_tokens_delete on public.imladrik_drive_tokens;
--   drop policy if exists imladrik_drive_tokens_update on public.imladrik_drive_tokens;
--   drop policy if exists imladrik_drive_tokens_insert on public.imladrik_drive_tokens;
--   drop policy if exists imladrik_drive_tokens_select on public.imladrik_drive_tokens;
--   drop table if exists public.imladrik_drive_tokens;  -- (trigger drop en cascade)
--   -- Avant tout drop : révoquer les jetons Google côté Google (endpoint revoke),
--   -- sinon la connexion reste active côté Google même sans la ligne en base.
