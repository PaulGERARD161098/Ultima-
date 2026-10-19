-- AMATSU, LE DRAGON DE L'AIR — boucle 2a (CADRAGE-IMLADRIK.md §12, 18/10/2026).
--
-- ⛔ NON APPLIQUÉE. Ne JAMAIS appliquer sans le go explicite de Paul : gate
-- migrations ET §5 IMLADRIK (données intimes : ce que Paul soumet à Amatsu est
-- de sa vie). Additive : une table neuve, aucune table existante touchée.
--
-- ---- Ce que la table porte, et pourquoi si peu
-- Amatsu ne porte pas d'objet : il pose sa question à ceux des autres caps.
-- Une LECTURE est la trace d'une question posée : ce qui a été soumis (une
-- décision, un projet, une idée — en texte dicté, 2a) et les trois réponses
-- de Paul aux trois vents, dans ses mots (décision de Paul du 18/10 : la
-- grille des trois vents, « jamais une note »). Datée par le serveur : le vent
-- retombe, une lecture se RELIT (pre-mortem (d) du §12.3), elle ne se corrige
-- pas — d'où AUCUNE policy UPDATE et pas d'`updated_at` (DEFAIRES : retouche
-- false). La passerelle vers l'objet jugé (idée, serment, situation, chantier)
-- est la boucle 2b : la paire (owner_id, id) est posée unique dès maintenant
-- pour qu'elle puisse s'y sceller (motif AD-4 des liens 0018).
--
-- Invariants du dépôt : RLS initplan `(select auth.uid())`, une policy par
-- opération, WITH CHECK sur l'écriture, owner_id NOT NULL default auth.uid(),
-- CHECK miroirs de l'API (`validateLectureAmatsu`, bornes 200/500/500/500),
-- anon sans droit. PAS DE SEED : une lecture est un geste de Paul en séance.
begin;

create table public.amatsu_lectures (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- Ce qui est soumis à Amatsu : la décision, le projet, l'idée — fidèle à la dictée.
  objet      text not null check (char_length(objet) between 1 and 200),
  -- Les trois vents, les réponses de Paul dans ses mots.
  bise       text not null check (char_length(bise) between 1 and 500),     -- plus libre ?
  souffle    text not null check (char_length(souffle) between 1 and 500),  -- cohérent avec moi-même, mes choix, ma paix ?
  ouragan    text not null check (char_length(ouragan) between 1 and 500),  -- emporté par le vent ?

  created_at timestamptz not null default now(),

  -- Ancrage composite pour les passerelles de la boucle 2b (scellement AD-4).
  constraint amatsu_lectures_owner_id_uniq unique (owner_id, id)
);

-- Listing « mes lectures, les plus récentes d'abord » : owner_id en tête (RLS).
create index amatsu_lectures_owner_date_idx
  on public.amatsu_lectures (owner_id, created_at desc);

alter table public.amatsu_lectures enable row level security;

create policy amatsu_lectures_select on public.amatsu_lectures
  for select using (owner_id = (select auth.uid()));

create policy amatsu_lectures_insert on public.amatsu_lectures
  for insert with check (owner_id = (select auth.uid()));

-- Pas de policy UPDATE : une lecture ne se corrige pas, elle se relit.

create policy amatsu_lectures_delete on public.amatsu_lectures
  for delete using (owner_id = (select auth.uid()));

-- ⛔ TOUT RETIRER, PUIS DONNER LE STRICT NÉCESSAIRE. Supabase accorde par
-- défaut TOUS les droits sur une table neuve de `public` à anon ET à
-- authenticated. Ne retirer que ceux d'anon (première écriture, relue le 19/10
-- avant application) laissait au rôle connecté UPDATE — que la RLS bloque, faute
-- de policy — et TRUNCATE, que la RLS NE VOIT PAS. Même geste que leo_ecritures
-- (`revoke update, delete, truncate … from authenticated, anon`), en plus net :
-- une liste fermée de ce qui est permis, plutôt qu'une liste de ce qui ne l'est pas.
revoke all on public.amatsu_lectures from public, anon, authenticated;
grant select, insert, delete on public.amatsu_lectures to authenticated;

commit;
