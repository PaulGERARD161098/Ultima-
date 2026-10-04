-- ZOH SHIA · RénoDevis — LE SOCLE : ce que la techno trouve en base avant sa
-- première migration.
--
-- Neuf tables, sept fonctions et leurs règles sont nées AILLEURS que dans le
-- dépôt de la techno (base partagée avec d'autres briques). Sans elles, aucune
-- de ses migrations ne s'applique sur une base neuve. Elles sont relevées dans
-- la base de référence, à l'état OÙ LES MIGRATIONS LES ATTENDENT :
--   · une colonne, une contrainte ou une policy que les migrations posent
--     elles-mêmes n'est PAS ici — sinon le socle masquerait une migration
--     défaillante (`rejouer.sh` le vérifie : intersection vide, sinon rouge) ;
--   · les policies que les migrations réécrivent sont posées dans leur forme
--     d'ORIGINE, pour que la réécriture soit réellement rejouée.
-- La preuve que l'ensemble rend la base de référence est la comparaison
-- d'empreinte, pas ce commentaire.
--
-- ⛔ Techno pure : aucune ligne de donnée, aucun nom propre.

-- ── Le profil, puis les fonctions qui le lisent ─────────────────────────────
create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  nom text,
  entreprise text,
  role text not null default 'pro' constraint profiles_role_check check (role in ('admin', 'pro')),
  tel text,
  email text,
  secteur text,
  zone text,
  statut text default 'Actif',
  created_at timestamptz not null default now(),
  mentions_legales text
);

create or replace function public.is_admin()
 returns boolean
 language sql
 stable security definer
 set search_path to ''
as $function$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$function$;

create or replace function public.set_updated_at()
 returns trigger
 language plpgsql
 set search_path to ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- ── Tables ──────────────────────────────────────────────────────────────────
create table public.clients (
  id uuid not null default gen_random_uuid() primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  nom text not null,
  tel text,
  email text,
  localisation text,
  budget text,
  rdv text,
  projet text,
  intention text constraint clients_intention_check check (intention in ('high', 'med', 'low')),
  statut text,
  devis_statut text,
  adresse_ban jsonb,
  dpe jsonb,
  enrichi_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  pro_id text,
  legacy_id text,
  extra jsonb,
  siret text,
  raison_sociale text,
  date_debut_collaboration date,
  constraint clients_owner_legacy_key unique (owner_id, legacy_id)
);
create index idx_clients_owner on public.clients (owner_id);

create table public.devis (
  id uuid not null default gen_random_uuid() primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  montant numeric,
  statut text,
  date date,
  lignes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  extra jsonb,
  signed_by text,
  signed_at timestamptz,
  montant_ht numeric,
  cout_achat numeric,
  acompte_recu_le date,
  chantier_prevu_le date,
  chantier_duree_j numeric,
  chantier_fait_le date,
  commission_pct numeric,
  signature_uuid_ouverte boolean not null default false
);
create index idx_devis_client on public.devis (client_id);
create index idx_devis_owner on public.devis (owner_id);

create table public.devis_events (
  id bigint generated always as identity primary key,
  devis_id uuid not null references public.devis(id) on delete cascade,
  type text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index devis_events_devis_type_idx on public.devis_events (devis_id, type, created_at desc);

create table public.relance_queue (
  id bigint generated always as identity primary key,
  devis_id uuid not null references public.devis(id) on delete cascade,
  scheduled_for date not null,
  step smallint not null,
  status text not null default 'pending'
    constraint relance_queue_status_check check (status in ('pending', 'sent', 'cancelled', 'skipped')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint relance_queue_devis_id_step_key unique (devis_id, step)
);
create index relance_queue_due_idx on public.relance_queue (status, scheduled_for);

create table public.sentinelle_etat (
  cle text not null primary key constraint sentinelle_etat_cle_forme check (cle ~ '^[a-z0-9:_-]{1,64}$'),
  valeur jsonb not null default '{}'::jsonb,
  maj_le timestamptz not null default now()
);
create index sentinelle_etat_maj_le_idx on public.sentinelle_etat (maj_le desc);

create table public.feedbacks (
  id uuid not null default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  auteur text not null constraint feedbacks_auteur_check check (char_length(auteur) >= 2 and char_length(auteur) <= 40),
  brique text not null constraint feedbacks_brique_check check (brique in ('boost', 'agenda', 'relance', 'predict')),
  gravite text not null constraint feedbacks_gravite_check check (gravite in ('bloquant', 'genant', 'idee')),
  message text not null constraint feedbacks_message_check check (char_length(message) >= 5 and char_length(message) <= 8000),
  saisie text constraint feedbacks_saisie_check check (saisie in ('clavier', 'dictee', 'mixte')),
  page_url text constraint feedbacks_page_url_check check (char_length(page_url) <= 500),
  page_titre text constraint feedbacks_page_titre_check check (char_length(page_titre) <= 300),
  viewport text constraint feedbacks_viewport_check check (char_length(viewport) <= 40),
  user_agent text constraint feedbacks_user_agent_check check (char_length(user_agent) <= 300),
  statut text not null default 'nouveau'
    constraint feedbacks_statut_check check (statut in ('nouveau', 'en_cours', 'fait', 'refuse')),
  reponse text constraint feedbacks_reponse_check check (char_length(reponse) <= 4000),
  traite_le timestamptz
);
create index feedbacks_auteur_idx on public.feedbacks (auteur, created_at desc);
create index feedbacks_tri_idx on public.feedbacks (statut, created_at desc);

-- Le catalogue des fournisseurs. Il porte le prix d'ACHAT : sa lecture se
-- ferme aux administrateurs par une migration de la techno, qui expose à sa
-- place une vue de vente sans prix d'achat.
create table public.catalogue_fournisseur (
  id uuid not null default gen_random_uuid() primary key,
  produit text not null,
  categorie text,
  reference text,
  prix_vente_u numeric(10,2),
  delai_commande integer not null default 0,
  unite text default 'u',
  lien_marque text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index catalogue_fournisseur_sort_idx on public.catalogue_fournisseur (sort_order);

-- Le stock du pro. La techno ne le lit pas ; sa signature le DÉCRÉMENTE (lignes
-- de devis issues du stock). Sans lui, signer un devis échouerait.
create table public.stock (
  id text not null primary key,
  owner_id uuid not null references public.profiles(id),
  produit text,
  categorie text,
  marque text,
  lien_marque text,
  reference text,
  quantite numeric default 0,
  unite text,
  prix_achat_u numeric default 0,
  prix_vente_u numeric default 0,
  delai_commande integer default 0,
  date_dispo text,
  facture_ref text,
  facture_montant numeric,
  facture_date text,
  statut text default 'en stock',
  extra jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Fonctions qui lisent les tables ─────────────────────────────────────────
create or replace function public.devis_on_signed()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.statut = 'Signé' and coalesce(old.statut, '') <> 'Signé' then
    update public.relance_queue
       set status = 'cancelled'
     where devis_id = new.id and status = 'pending';
    insert into public.devis_events (devis_id, type, meta)
    values (new.id, 'signed', jsonb_build_object('signed_by', new.signed_by));
  end if;
  return new;
end;
$function$;

create or replace function public.feedbacks_touch_traite_le()
 returns trigger
 language plpgsql
 set search_path to ''
as $function$
begin
  if new.statut is distinct from old.statut then
    new.traite_le := case when new.statut = 'nouveau' then null else now() end;
  end if;
  return new;
end;
$function$;

create or replace function public.get_devis_public(p_id uuid)
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select jsonb_build_object(
    'id',           d.id,
    'numero',       d.extra->>'numero',
    'statut',       d.statut,
    'date',         d.date,
    'validite',     d.extra->>'validite',
    'montant',      d.montant,
    'lignes',       (
      select coalesce(jsonb_agg(jsonb_build_object(
               'produit',  l->>'produit',
               'qte',      nullif(l->>'qte','')::numeric,
               'unite',    l->>'unite',
               'pu_vente', nullif(l->>'pu_vente','')::numeric
             )), '[]'::jsonb)
      from jsonb_array_elements(coalesce(d.lignes, '[]'::jsonb)) l
    ),
    'pro_nom',      d.extra->>'pro_nom',
    'client_nom',   d.extra->>'client_nom',
    'projet',       d.extra->>'projet',
    'prestations',  d.extra->>'prestations',
    'aides',        d.extra->>'aides',
    'note',         d.extra->>'note',
    'etage',        d.extra->>'etage',
    'forte_hauteur', coalesce(d.extra->'forte_hauteur', 'false'::jsonb),
    'contraintes',  d.extra->>'contraintes',
    'signed_by',    d.signed_by,
    'signed_at',    d.signed_at
  )
  from public.devis d
  where d.id = p_id;
$function$;

-- Les deux RPC du devis public existent AVANT la techno (une autre brique les a
-- posées) : ses migrations commencent par en retirer les droits (20260817),
-- puis les RÉÉCRIVENT entièrement (20260817d, 20260817e). Seule leur signature
-- compte ici ; un corps qui servirait par erreur refuse au lieu de signer.
create or replace function public.sign_devis_public(p_id uuid, p_signed_by text)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  raise exception 'socle : réécrite par la migration 20260817d';
end;
$function$;

create or replace function public.log_devis_open(p_id uuid)
 returns boolean language plpgsql security definer set search_path to 'public'
as $function$
begin
  raise exception 'socle : réécrite par la migration 20260817e';
end;
$function$;

-- ── Déclencheurs de socle ───────────────────────────────────────────────────
create trigger trg_clients_updated before update on public.clients
  for each row execute function public.set_updated_at();
create trigger trg_devis_updated before update on public.devis
  for each row execute function public.set_updated_at();
create trigger trg_devis_on_signed after update of statut on public.devis
  for each row execute function public.devis_on_signed();
create trigger feedbacks_touch_traite_le before update on public.feedbacks
  for each row execute function public.feedbacks_touch_traite_le();

-- ── RLS : toutes fermées par défaut, ouvertes policy par policy ─────────────
alter table public.profiles              enable row level security;
alter table public.clients               enable row level security;
alter table public.devis                 enable row level security;
alter table public.devis_events          enable row level security;
alter table public.relance_queue         enable row level security;
alter table public.sentinelle_etat       enable row level security;  -- aucune policy : serveur seul
alter table public.feedbacks             enable row level security;  -- aucune policy : serveur seul
alter table public.catalogue_fournisseur enable row level security;
alter table public.stock                 enable row level security;

create policy profiles_select on public.profiles for select to authenticated
  using ((id = auth.uid()) or is_admin());
create policy profiles_insert on public.profiles for insert to authenticated
  with check ((id = auth.uid()) or is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using ((id = auth.uid()) or is_admin()) with check ((id = auth.uid()) or is_admin());

-- Forme d'ORIGINE : une migration de la techno l'étend aux pros rattachés.
create policy clients_select on public.clients for select to authenticated
  using ((owner_id = auth.uid()) or is_admin());
create policy clients_insert on public.clients for insert to authenticated
  with check ((owner_id = auth.uid()) or is_admin());
create policy clients_update on public.clients for update to authenticated
  using ((owner_id = auth.uid()) or is_admin()) with check ((owner_id = auth.uid()) or is_admin());
create policy clients_delete on public.clients for delete to authenticated
  using ((owner_id = auth.uid()) or is_admin());

-- Forme d'ORIGINE pour select et update : même raison.
create policy devis_select on public.devis for select to authenticated
  using ((owner_id = auth.uid()) or is_admin());
create policy devis_insert on public.devis for insert to authenticated
  with check ((owner_id = auth.uid()) or is_admin());
create policy devis_update on public.devis for update to authenticated
  using ((owner_id = auth.uid()) or is_admin()) with check ((owner_id = auth.uid()) or is_admin());
create policy devis_delete on public.devis for delete to authenticated
  using ((owner_id = auth.uid()) or is_admin());

create policy devis_events_select_owner on public.devis_events for select to authenticated
  using (exists (select 1 from devis d where d.id = devis_events.devis_id and ((d.owner_id = auth.uid()) or is_admin())));
create policy devis_events_insert_owner on public.devis_events for insert to authenticated
  with check (exists (select 1 from devis d where d.id = devis_events.devis_id and ((d.owner_id = auth.uid()) or is_admin())));

create policy relance_queue_select_owner on public.relance_queue for select to authenticated
  using (exists (select 1 from devis d where d.id = relance_queue.devis_id and ((d.owner_id = auth.uid()) or is_admin())));

-- Forme d'ORIGINE : lisible par tout compte connecté. Une migration de la
-- techno la ferme aux administrateurs (le prix d'achat ne sort pas).
create policy catalogue_select_authenticated on public.catalogue_fournisseur for select to authenticated
  using (true);
create policy catalogue_write_admin on public.catalogue_fournisseur for all to authenticated
  using (is_admin()) with check (is_admin());

create policy stock_select on public.stock for select to authenticated
  using ((owner_id = auth.uid()) or is_admin());
create policy stock_insert on public.stock for insert to authenticated
  with check ((owner_id = auth.uid()) or is_admin());
create policy stock_update on public.stock for update to authenticated
  using ((owner_id = auth.uid()) or is_admin()) with check ((owner_id = auth.uid()) or is_admin());
create policy stock_delete on public.stock for delete to authenticated
  using ((owner_id = auth.uid()) or is_admin());
