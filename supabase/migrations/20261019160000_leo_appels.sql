-- LE JOURNAL DES APPELS DE LÉO AU MODÈLE — compteur, plafond, mesure (19/10/2026).
--
-- Pourquoi : Paul, 19/10 — « ça ne doit pas tout exploser en termes de prix ».
-- `api/leo.js` appelle le modèle (Opus 4.8) sans aucun compteur : la seule garde
-- est « un appel par 3 s » en mémoire d'instance, soit un pire cas théorique de
-- plusieurs milliers de dollars par jour ; le seul plafond dur est la limite de
-- dépense de la console Anthropic, que le code ne voit pas. Ce journal donne
-- (1) un PLAFOND atomique, partagé entre instances, (2) une MESURE : combien
-- d'appels, quels tokens, par jour — sans laquelle « Ultima vaut-il son prix ? »
-- ne se tranche pas.
--
-- ⛔ GATE : cette migration n'est PAS appliquée par la séance qui l'écrit
-- (SQL/RLS = décision de Paul). Le code (`api/_lib/leo-appels.js`) fonctionne
-- AVANT son application, en mode dégradé (plafond local par instance, dit en log).
--
-- ⛔ ZÉRO CONTENU : ni message, ni réponse, ni intitulé — le quadrant, le nom du
-- modèle et deux compteurs de tokens. Une ligne ne peut pas contenir de PII par
-- la forme de ses colonnes.
--
-- ⚠️ LES DEUX VALEURS DU PLAFOND SONT DOUBLÉES dans `api/_lib/leo-appels.js`
-- (une fonction SQL ne s'importe pas) ; `tests/unit-leo-appels.mjs` lit ce
-- fichier et exige qu'elles coïncident — sans lui, le code afficherait un
-- plafond que la base n'applique pas.
--   · 100 appels (phase 'tentee') par fenêtre glissante de 24 h et par
--     propriétaire. Hypothèse de départ (≈ 3 $ par jour au coût typique estimé,
--     ≤ 12 $ au pire) — Paul le fixe ; le changer = une migration d'une ligne.
--   · 400 lignes au total (toutes phases) par fenêtre de 24 h : borne le volume
--     qu'un compte quelconque peut déposer, l'inscription au projet d'auth
--     d'Ultima étant OUVERTE (cf. `api/_lib/proprietaire.js`).

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create table public.leo_appels (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid()
                  references auth.users (id) on delete cascade,

  -- Une tentative et son issue partagent la trace : `tentee` est posée AVANT
  -- l'appel (c'est elle qui compte pour le plafond — un emballement qui échoue
  -- en boucle doit mordre aussi), `reussie` / `echouee` APRÈS, avec les tokens.
  trace_id        uuid not null,

  quadrant        text not null check (char_length(quadrant) between 1 and 40),
  modele          text not null check (char_length(modele) between 1 and 80),

  -- ⛔ Liste DOUBLÉE dans `PHASES_APPEL` (api/_lib/leo-appels.js), gardée par test.
  phase           text not null check (phase in ('tentee', 'reussie', 'echouee')),

  tokens_entree   integer check (tokens_entree is null or tokens_entree between 0 and 10000000),
  tokens_sortie   integer check (tokens_sortie is null or tokens_sortie between 0 and 10000000),

  le              timestamptz not null default now()
);

create index leo_appels_owner_le_idx on public.leo_appels (owner_id, le desc);
create index leo_appels_owner_trace_idx on public.leo_appels (owner_id, trace_id);

alter table public.leo_appels enable row level security;

create policy leo_appels_select on public.leo_appels
  for select using (owner_id = (select auth.uid()));

create policy leo_appels_insert on public.leo_appels
  for insert with check (owner_id = (select auth.uid()));

-- Un journal ne se corrige pas, ne se vide pas, et n'a aucun accès anonyme.
revoke all on public.leo_appels from anon;
revoke update, delete, truncate on public.leo_appels from authenticated;

-- LE PLAFOND, ATOMIQUE — même forme que `leo_private.ecritures_plafond()` :
-- verrou consultatif par propriétaire, lecture du compte, refus PT429. Posé en
-- trigger pour que deux appels simultanés ne passent pas tous les deux sous le
-- seuil (la lecture puis l'insertion côté code seraient une course).
create function leo_private.appels_plafond()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('leo_appels:' || new.owner_id::text, 0));

  -- Borne de volume, toutes phases (abus par un compte quelconque).
  if (select count(*) from public.leo_appels
      where owner_id = new.owner_id
      and le >= pg_catalog.clock_timestamp() - interval '24 hours') >= 400 then
    raise exception using errcode = 'PT429', message = 'leo_calls_volume_exhausted';
  end if;

  -- Le plafond d'appels : seules les tentatives comptent.
  if new.phase = 'tentee' and (select count(*) from public.leo_appels
      where owner_id = new.owner_id and phase = 'tentee'
      and le >= pg_catalog.clock_timestamp() - interval '24 hours') >= 100 then
    raise exception using errcode = 'PT429', message = 'leo_calls_quota_exhausted';
  end if;

  -- L'horloge est celle de la base : un client ne peut pas antidater une ligne
  -- pour sortir de la fenêtre.
  new.le := pg_catalog.clock_timestamp();
  return new;
end;
$$;

revoke all on function leo_private.appels_plafond() from public, anon, authenticated;

create trigger leo_appels_plafond_before_insert
before insert on public.leo_appels for each row
execute function leo_private.appels_plafond();

commit;
