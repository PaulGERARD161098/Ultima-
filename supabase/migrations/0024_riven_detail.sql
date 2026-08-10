-- Ultima — migration 0024 : RIVEN en détail (la personne, le métier, la capacité).
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) : le SQL
-- vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- Cadrage complet, format 6 points : CADRAGE-RIVEN-DETAIL.md. Dictée de Paul du
-- 2026-08-10 (« les catégorisations des contacts ne sont pas assez précises […]
-- que je puisse renseigner des contacts sans forcément créer des nœuds, que je
-- puisse également créer plusieurs nœuds »), ambiguïtés levées par question :
--   ① la PERSONNE est séparée du NŒUD (0, 1 ou N rattachements, un rôle chacun) ;
--   ② quatre axes de détail sur la fiche (nature, métiers, capacités, relation) ;
--   ③ le MÉTIER PRINCIPAL fait la branche de l'arbre → secteur_activite INCHANGÉ.
--
-- ADDITIF ET NON DESTRUCTIF, sans exception :
--   - onze colonnes nullables sur network_nodes, aucune renommée, aucun CHECK
--     existant durci, aucune donnée touchée ;
--   - secteur_activite garde son rôle exact (branche de l'arbre, cf. 0006 D3) :
--     js/arbre.js n'est pas modifié par cette boucle, c'est un critère de réussite ;
--   - deux tables neuves, isolées ; leur suppression rend l'état d'avant à
--     l'identique (bloc rollback en fin de fichier).
--
-- Invariants 0001-0023 conservés :
--   - RLS active DÈS la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) — jamais auth.uid() nu
--     (advisor 0003 auth_rls_initplan).
--   - owner_id NOT NULL default auth.uid() (cf. 0004), FK auth.users cascade,
--     owner_id JAMAIS accepté du client (l'API ne le transmet pas).
--   - search_path épinglé sur toute fonction (advisor 0011, cf. 0002).
--   - Ce que l'API valide (api/_lib/validate.js), la base le contraint aussi.
--   - Aucune vue ; aucun security definer.
-- PAS DE SEED : peupler RIVEN est un geste de Paul (RADAR : « la donnée manque
-- à la racine »), jamais une invention de Léo.

-- ---------------------------------------------------------------------------
-- 0. Garde de validité des tableaux de tags (métiers secondaires, certifications).
--
--    POURQUOI UNE FONCTION plutôt qu'une CHECK écrite en ligne : Postgres
--    INTERDIT les sous-requêtes dans une contrainte CHECK, et vérifier « chaque
--    élément du tableau est non vide et borné » réclame un unnest — donc une
--    sous-requête. Une fonction IMMUTABLE encapsule le test : la CHECK l'appelle,
--    la contrainte reste une expression scalaire, et le prédicat est écrit UNE
--    fois pour les deux colonnes concernées (pre-mortem P1).
--
--    immutable : le résultat ne dépend que des arguments (aucune lecture de
--    table, aucun réglage de session) — exigence de Postgres pour une CHECK.
--    search_path = '' : rien à détourner (cf. 0002) ; cardinality/unnest/
--    char_length/btrim/array_position vivent dans pg_catalog, toujours résolu
--    implicitement même avec un search_path vide.
--
--    Contrat : NULL est licite (champ non renseigné). Un tableau VIDE l'est
--    aussi en base, mais l'API le normalise vers NULL (pre-mortem P6) — la base
--    ne l'interdit pas, elle n'a pas à trancher une convention de présentation.
-- ---------------------------------------------------------------------------
create or replace function public.riven_tags_valides(
  tags    text[],
  max_n   integer,
  max_len integer
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    tags is null
    or (
      cardinality(tags) <= max_n
      -- aucun élément NULL : un tag vide de sens n'a rien à faire dans la liste
      and array_position(tags, null) is null
      -- chaque élément : non vide une fois détouré, et borné en longueur
      and not exists (
        select 1
        from unnest(tags) as t
        where char_length(btrim(t)) = 0
           or char_length(t) > max_len
      )
    );
$$;

comment on function public.riven_tags_valides(text[], integer, integer) is
  'RIVEN 0024 — prédicat de validité d''un tableau de tags (cardinalité, pas de NULL, éléments non vides et bornés). IMMUTABLE : utilisable en contrainte CHECK.';

-- ---------------------------------------------------------------------------
-- 1. network_nodes : les quatre axes de détail (onze colonnes nullables).
--
--    AXE A — nature affinée. `type` (4 valeurs figées de 0001) reste : il porte
--    la couleur du marqueur, l'icône et les filtres. `nature` le précise SANS le
--    remplacer, en TEXTE LIBRE + suggestions — décision D3 de 0006 reconduite :
--    les mondes de Paul évoluent, une liste fermée en CHECK obligerait une
--    migration à chaque nouveau cas de figure.
--
--    AXE B — métiers multiples. secteur_activite reste le MÉTIER PRINCIPAL et
--    l'unique clé de regroupement de l'arbre (réponse ③ de Paul). Les autres
--    métiers vivent dans un text[] : un artisan « plomberie + chauffage + PAC »
--    est enfin descriptible sans dupliquer sa fiche.
--
--    AXE C — capacités concrètes : ce qu'ils savent faire, et jusqu'où.
--
--    AXE D — qualité de la relation : ce qui sert à CHOISIR qui appeler.
--    Les trois échelles sont en 1..5, bornes IDENTIQUES à effort_temps /
--    effort_energie (0005) — une seule grammaire de notation dans tout RIVEN.
--    disponibilite est un TEXTE et pas une échelle : « sous 48 h » ou « chargé
--    jusqu'en septembre » est une information exploitable, « 3/5 » n'en est pas.
--
--    Longueurs : miroir EXACT de api/_lib/validate.js et des maxlength du
--    formulaire (traveler.html) — la base contraint ce que l'API valide.
-- ---------------------------------------------------------------------------
alter table public.network_nodes
  -- Axe A
  add column if not exists nature text
    check (nature is null or char_length(nature) <= 80),
  -- Axe B
  add column if not exists metiers_secondaires text[],
  -- Axe C
  add column if not exists prestations text
    check (prestations is null or char_length(prestations) <= 2000),
  add column if not exists zone_intervention text
    check (zone_intervention is null or char_length(zone_intervention) <= 200),
  add column if not exists rayon_km smallint
    check (rayon_km is null or rayon_km between 0 and 2000),
  add column if not exists effectif integer
    check (effectif is null or effectif between 0 and 100000),
  add column if not exists certifications text[],
  -- Axe D
  add column if not exists fiabilite smallint
    check (fiabilite is null or fiabilite between 1 and 5),
  add column if not exists reactivite smallint
    check (reactivite is null or reactivite between 1 and 5),
  add column if not exists niveau_prix smallint
    check (niveau_prix is null or niveau_prix between 1 and 5),
  add column if not exists disponibilite text
    check (disponibilite is null or char_length(disponibilite) <= 120);

-- Gardes des deux tableaux (cf. §0). Nommées : le rollback les vise, et un
-- message d'erreur nommé est lisible côté API.
alter table public.network_nodes
  drop constraint if exists network_nodes_metiers_secondaires_valides;
alter table public.network_nodes
  add constraint network_nodes_metiers_secondaires_valides
    check (public.riven_tags_valides(metiers_secondaires, 12, 120));

alter table public.network_nodes
  drop constraint if exists network_nodes_certifications_valides;
alter table public.network_nodes
  add constraint network_nodes_certifications_valides
    check (public.riven_tags_valides(certifications, 12, 80));

comment on column public.network_nodes.secteur_activite is
  'RIVEN — MÉTIER PRINCIPAL. Unique clé de regroupement de l''arbre (js/arbre.js : une branche par secteur normalisé). Les autres métiers vont dans metiers_secondaires.';
comment on column public.network_nodes.metiers_secondaires is
  'RIVEN 0024 — autres métiers de la fiche (texte libre + suggestions, D3). N''influence PAS la branche de l''arbre.';

-- PAS D'INDEX sur les tableaux (GIN) ni sur les échelles. Les requêtes réelles
-- ne les justifient pas : le front charge TOUTES les fiches de l'owner en un
-- GET (api/reseau.js) et filtre en mémoire — motif inchangé depuis 0001. Un
-- index GIN coûterait à chaque écriture pour zéro lecture servie. Règle « index
-- justifiés par les requêtes réelles » (0007/0009/0013).

-- ---------------------------------------------------------------------------
-- 2. personnes : les gens, séparés des nœuds.
--
--    LE CŒUR DE LA DEMANDE. Une personne existe PAR ELLE-MÊME : elle n'a besoin
--    d'aucun nœud pour être enregistrée (« renseigner des contacts sans
--    forcément créer des nœuds »), et elle peut en servir plusieurs (« créer
--    plusieurs nœuds »). Elle ne porte donc AUCUNE colonne node_id : le lien
--    vit dans personne_noeuds (§3), qui est le seul endroit où il peut être
--    multiple.
--
--    Champs calqués sur network_nodes pour les coordonnées (mêmes bornes,
--    mêmes règles) : une seule grammaire de saisie dans RIVEN.
--
--    personnes_owner_id_uniq : cible du double scellement AD-4 de §3 (motif
--    0008/0009/0011/0013). Elle est créée ICI parce que la table est neuve —
--    contrairement à network_nodes, dont la cible existe déjà (cf. §3).
-- ---------------------------------------------------------------------------
create table public.personnes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  nom        text not null check (char_length(nom) between 1 and 200),
  -- Fonction « en général » (métier de la personne). Le rôle AU SEIN d'un nœud
  -- donné vit sur le rattachement (§3) : la même personne peut être gérante ici
  -- et apporteuse d'affaires là.
  fonction   text check (fonction is null or char_length(fonction) <= 120),
  telephone  text check (telephone is null or char_length(telephone) <= 30),
  email      text check (email is null or char_length(email) <= 200),
  notes      text check (notes is null or char_length(notes) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint personnes_owner_id_uniq unique (owner_id, id)
);

create index personnes_owner_id_idx on public.personnes (owner_id);

create trigger personnes_set_updated_at
  before update on public.personnes
  for each row execute function public.set_updated_at();

alter table public.personnes enable row level security;

create policy personnes_select on public.personnes
  for select using (owner_id = (select auth.uid()));

create policy personnes_insert on public.personnes
  for insert with check (owner_id = (select auth.uid()));

create policy personnes_update on public.personnes
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy personnes_delete on public.personnes
  for delete using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 3. personne_noeuds : le rattachement (personne × nœud × rôle).
--
--    C'est LUI qui rend vraies les deux phrases de Paul : zéro ligne ici → une
--    personne sans aucun nœud ; N lignes → une personne sur N nœuds, avec un
--    rôle DIFFÉRENT sur chacun.
--
--    ON DELETE CASCADE des deux côtés, mais l'asymétrie est voulue et elle
--    compte : supprimer une FICHE retire le rattachement et LAISSE la personne
--    au registre (elle a une existence propre — c'est tout l'objet de la
--    boucle) ; supprimer une PERSONNE retire ses rattachements et ne touche
--    aucune fiche.
--
--    DOUBLE SCELLEMENT AD-4 (motif 0008/0009/0011/0013) : un rattachement ne
--    peut relier qu'une personne ET une fiche du MÊME owner. Impossible de
--    pointer vers le réseau d'autrui même si la RLS était mal configurée —
--    la garde qui compte, puisqu'il s'agit de PII (pre-mortem P4).
--    Cibles : personnes_owner_id_uniq (§2, créée ici) et
--    network_nodes_owner_id_uniq — index unique créé par 0008, que l'on ne
--    RECRÉE PAS : le refaire échoue en 42P07 (constat à l'application de 0013).
-- ---------------------------------------------------------------------------
create table public.personne_noeuds (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid()
              references auth.users (id) on delete cascade,

  personne_id uuid not null references public.personnes (id) on delete cascade,
  node_id     uuid not null references public.network_nodes (id) on delete cascade,

  -- Rôle DE CETTE personne DANS CE nœud : « gérant », « conducteur de travaux »,
  -- « apporteur d'affaires ». Texte libre + suggestions (D3), optionnel : on
  -- peut rattacher d'abord et qualifier plus tard (RADAR n°2, saisie au pouce).
  role        text check (role is null or char_length(role) <= 120),

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint personne_noeuds_personne_scelle
    foreign key (owner_id, personne_id)
    references public.personnes (owner_id, id) on delete cascade,
  constraint personne_noeuds_node_scelle
    foreign key (owner_id, node_id)
    references public.network_nodes (owner_id, id) on delete cascade,

  -- Une personne n'est rattachée qu'une fois à une fiche donnée : deux rôles
  -- sur le MÊME nœud se disent dans un seul libellé, pas en doublant la ligne.
  -- La tête (owner_id, personne_id) sert AUSSI « les nœuds de cette personne ».
  constraint personne_noeuds_owner_personne_node_uniq
    unique (owner_id, personne_id, node_id)
);

-- Requête inverse, la plus fréquente : « les personnes de CETTE fiche » (fiche
-- ouverte dans le panneau) → WHERE owner_id, node_id. L'unique ci-dessus, de
-- tête (owner_id, personne_id), ne la couvre pas. Miroir de
-- talent_refs_reseau_owner_node_idx (0013).
create index personne_noeuds_owner_node_idx
  on public.personne_noeuds (owner_id, node_id);

create trigger personne_noeuds_set_updated_at
  before update on public.personne_noeuds
  for each row execute function public.set_updated_at();

alter table public.personne_noeuds enable row level security;

create policy personne_noeuds_select on public.personne_noeuds
  for select using (owner_id = (select auth.uid()));

create policy personne_noeuds_insert on public.personne_noeuds
  for insert with check (owner_id = (select auth.uid()));

-- UPDATE existe ici (contrairement à talent_refs_reseau, lien nu) : le rôle est
-- un attribut mutable du rattachement.
create policy personne_noeuds_update on public.personne_noeuds
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy personne_noeuds_delete on public.personne_noeuds
  for delete using (owner_id = (select auth.uid()));

-- rollback (ordre inverse des dépendances) :
--   drop policy if exists personne_noeuds_delete on public.personne_noeuds;
--   drop policy if exists personne_noeuds_update on public.personne_noeuds;
--   drop policy if exists personne_noeuds_insert on public.personne_noeuds;
--   drop policy if exists personne_noeuds_select on public.personne_noeuds;
--   drop table if exists public.personne_noeuds;   -- index + FK + trigger en cascade
--   drop policy if exists personnes_delete on public.personnes;
--   drop policy if exists personnes_update on public.personnes;
--   drop policy if exists personnes_insert on public.personnes;
--   drop policy if exists personnes_select on public.personnes;
--   drop table if exists public.personnes;         -- index + trigger en cascade
--   alter table public.network_nodes
--     drop constraint if exists network_nodes_certifications_valides,
--     drop constraint if exists network_nodes_metiers_secondaires_valides,
--     drop column if exists disponibilite,
--     drop column if exists niveau_prix,
--     drop column if exists reactivite,
--     drop column if exists fiabilite,
--     drop column if exists certifications,
--     drop column if exists effectif,
--     drop column if exists rayon_km,
--     drop column if exists zone_intervention,
--     drop column if exists prestations,
--     drop column if exists metiers_secondaires,
--     drop column if exists nature;
--   drop function if exists public.riven_tags_valides(text[], integer, integer);
--   -- network_nodes_owner_id_uniq NON touché : il appartient à 0008.
--   -- Données : additif pur, aucune donnée d'avant 0024 n'a été déplacée.
