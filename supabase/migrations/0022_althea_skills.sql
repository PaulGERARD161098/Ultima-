-- Ultima — migration 0022 : ALTHEA v1 « le personnage, ses skills, ses stats ».
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) : le SQL
-- vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- Périmètre = B1 STRICT du cadrage (CADRAGE-ALTHEA.md §11) :
--   - althea_avatar     : le personnage (nom, titre porté, socle de niveau).
--   - althea_stats      : les cinq stats de Paul et leur SOCLE.
--   - althea_skills     : ce qui porte un ÉNONCÉ, un rang et des paliers.
--   - althea_conditions : ce qu'on coche dans une journée. Aucun rang.
--   - althea_releves    : un jour, une condition, tenu ou non.
-- Additif et non destructif : cinq tables neuves, aucune table existante
-- touchée, aucune donnée déplacée.
--
-- HORS B1 (différé, ne PAS modéliser ici — cf. §11) :
--   - althea_quetes / althea_interpellations / althea_abonnements_push (B2→B4) ;
--   - la dette et le gel (dérivés des quêtes : sans quêtes, ils n'existent pas).
--   Note de compat-avant : le scellement (owner_id, id) posé ici sur skills et
--   conditions sert DÉJÀ de cible aux FK composites des tables B2 (motif AD-4 de
--   0008/0009) — la suite s'ajoutera sans retoucher ces tables.
--
-- RÈGLES CARDINALES DU QUADRANT EXPRIMÉES DANS LE SCHÉMA (§3), pas seulement
-- dans l'interface — c'est le point le plus important de cette migration :
--   ① « un jour non renseigné n'est PAS un échec » → il n'y a **pas de ligne**.
--      `althea_releves.tenu` est NOT NULL : une ligne dit toujours quelque chose
--      (tenu ou manqué DÉCLARÉ). Le troisième état, « non renseigné », est
--      l'ABSENCE de ligne. Aucun défaut, aucun remplissage automatique, aucun
--      job de nuit n'a le droit d'en créer.
--   ② « l'acquis ne se perd jamais » → rien n'est stocké qui puisse redescendre :
--      ni rang, ni élan, ni jours tenus, ni valeur de stat. Tout est DÉRIVÉ
--      (js/althea-progression.mjs, module pur, éprouvé au harnais).
--   ④ « le compteur ne ment pas » → unicité (owner, condition, jour) + refus du
--      jour futur par TRIGGER (voir §5 : current_date n'est pas immutable, donc
--      inexprimable en CHECK — le trigger est la seule voie correcte).
--
-- Invariants 0001-0021 conservés :
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003).
--   - owner_id NOT NULL default auth.uid() (cf. 0004), FK auth.users cascade.
--   - Ce que l'API valide, la base le contraint aussi : CHECK d'énumération et
--     de longueur (miroir de api/_lib/validate.js), FK composites, NOT NULL.
--   - Trigger set_updated_at (search_path figé en 0002) là où updated_at existe.
--   - Aucune vue security definer ; le calcul vit dans un module pur, pas en SQL
--     (il est ainsi testable sans base — cf. tests/unit-althea-progression.mjs).
-- PAS DE SEED : les skills réels de Paul dépendent de son owner_id. Le
-- peuplement est un script séparé et GATÉ (supabase/seed-althea-paul.sql),
-- paramétré par owner_id, jamais en dur — motif RESHIRAM/ZEKROM.

-- ---------------------------------------------------------------------------
-- 1. althea_avatar : le personnage. UNE ligne par propriétaire — d'où la clé
--    primaire sur owner_id (pas d'id technique : il n'y a jamais deux
--    personnages).
--
--    socle_niveau : décision Paul (2026-08-06) — « niveau 48 ». On n'entre pas
--      dans sa propre vie au niveau 1 : le socle est déclaré, et ce qui se gagne
--      ensuite (un palier de skill franchi, une quête accomplie) s'y ajoute.
--      Le niveau AFFICHÉ n'est donc pas stocké : il est dérivé (règle ②).
--
--    titre_code : le titre PORTÉ, référence vers un catalogue qui vit en CODE
--      (js/althea-titres.mjs), pas en base. Motif blasons/registre : les règles
--      de jeu se testent sans base, et un titre s'ajoute sans migration.
-- ---------------------------------------------------------------------------
create table public.althea_avatar (
  owner_id     uuid primary key default auth.uid()
               references auth.users (id) on delete cascade,

  nom          text not null check (char_length(nom) between 1 and 120),

  -- Le titre porté. NULL = « Sans titre » — un état, pas un manque.
  titre_code   text check (titre_code is null
                           or char_length(titre_code) between 1 and 60),

  socle_niveau integer not null default 0
               check (socle_niveau between 0 and 999),

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger althea_avatar_set_updated_at
  before update on public.althea_avatar
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. althea_stats : les cinq stats dictées par Paul.
--
--    RÈGLE DE PAUL (2026-08-06) : « les stats sont arbitraires, elles augmentent
--    avec les niveaux — chaque niveau fait gagner un point partout ».
--    Donc : valeur = socle + niveau, et **la valeur n'est pas stockée**. Seul le
--    socle l'est. Ce qui distingue Paul, c'est son socle ; le niveau le fait
--    monter, il ne le dessine pas.
--
--    Le code est une énumération FERMÉE : ces cinq-là sont le vocabulaire du
--    quadrant. En ajouter une est une décision produit, donc une migration.
-- ---------------------------------------------------------------------------
create table public.althea_stats (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  code       text not null check (code in
             ('force', 'endurance', 'agilite', 'intelligence', 'charisme')),

  socle      integer not null default 0 check (socle between 0 and 999),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Une stat, une seule fois par propriétaire.
  constraint althea_stats_unicite unique (owner_id, code)
);

create trigger althea_stats_set_updated_at
  before update on public.althea_stats
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. althea_skills : l'étage qui PROGRESSE.
--
--    enonce : la phrase au présent sur le joueur — « le joueur est au top de sa
--      forme ! ». C'est le cœur du skill (§13.2-1) ; le compteur n'en est que la
--      preuve. Facultatif mais borné.
--
--    nourriture : 'tous' (défaut — le jour compte si TOUS les groupes de
--      conditions sont tenus ; le bon réglage pour PEAK PERFORMANCE : une
--      journée sans tabac mais arrosée n'en est pas une) ou 'un' (au moins un
--      groupe ; le bon pour un skill à plusieurs portes). Deux valeurs et pas
--      trois : un seuil chiffré serait un réglage de plus pour un gain nul.
--
--    unite_seuil : 'jour' (défaut) ou 'semaine' — PIEDS LÉGERS (« 10 km par
--      semaine ») se compte en semaines tenues, pas en jours.
--
--    seuils : les cinq paliers. Tableau plutôt que table de jointure : cinq
--      entiers ordonnés n'ont pas d'identité propre et ne sont jamais référencés.
--      La croissance stricte est CONTRAINTE ici (indices immutables, donc
--      exprimables en CHECK de table) — un palier IV inférieur au III rendrait
--      le rang non monotone, et la règle ② tomberait.
--
--    evolue_en : le skill SUPÉRIEUR (TRADUCTEUR → TRADUCTEUR UNIVERSEL). FK
--      composite scellée : un skill ne peut pas évoluer vers celui d'un autre.
--      ON DELETE SET NULL : supprimer la cible ne doit pas supprimer la source.
--
--    meta : le skill dont les conditions lisent l'ÉTAT DES AUTRES SKILLS et non
--      des gestes (CONSTANCE — « se relève toujours après avoir chuté »).
--      Marqué ici, calculé dans le module pur : la base ne connaît pas la règle.
--
--    verrouille : un skill se VOIT avant d'être ouvert (grisé, nommé, avec la
--      quête qui l'ouvre) — voir ce qui est verrouillé est la moitié du plaisir.
--      Un skill déverrouillé ne se reverrouille jamais (règle ②) : c'est une
--      invariance applicative, la base ne peut pas l'exprimer sans historique.
-- ---------------------------------------------------------------------------
create table public.althea_skills (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid()
              references auth.users (id) on delete cascade,

  nom         text not null check (char_length(nom) between 1 and 120),
  enonce      text check (enonce is null or char_length(enonce) between 1 and 280),
  blason      text check (blason is null or char_length(blason) between 1 and 40),

  nourriture  text not null default 'tous' check (nourriture in ('tous', 'un')),
  unite_seuil text not null default 'jour' check (unite_seuil in ('jour', 'semaine')),

  seuils      integer[] not null default '{7,30,90,180,365}'::integer[]
              check (cardinality(seuils) = 5
                     and seuils[1] > 0
                     and seuils[2] > seuils[1]
                     and seuils[3] > seuils[2]
                     and seuils[4] > seuils[3]
                     and seuils[5] > seuils[4]),

  evolue_en   uuid,
  meta        boolean not null default false,
  verrouille  boolean not null default false,
  actif       boolean not null default true,
  rang_affichage smallint not null default 0 check (rang_affichage between 0 and 99),

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Cible de scellement AD-4 pour les FK composites (conditions, et B2).
  constraint althea_skills_scelle unique (owner_id, id),
  -- Un skill n'évolue jamais en lui-même : ce serait une boucle infinie côté
  -- affichage, et le CHECK la ferme au plus près de la donnée.
  constraint althea_skills_evolution_non_reflexive check (evolue_en is null or evolue_en <> id),
  constraint althea_skills_evolution_scellee
    foreign key (owner_id, evolue_en)
    references public.althea_skills (owner_id, id) on delete set null
);

create trigger althea_skills_set_updated_at
  before update on public.althea_skills
  for each row execute function public.set_updated_at();

create index althea_skills_owner_idx on public.althea_skills (owner_id, rang_affichage);

-- ---------------------------------------------------------------------------
-- 4. althea_conditions : ce qu'on coche. AUCUN compteur ici — une condition ne
--    progresse pas, elle nourrit.
--
--    cadence : les cinq rythmes révélés par les skills réels de Paul (§13.2-2).
--      'quotidien'        — une case par jour              (légumes, sommeil)
--      'tous_les_n_jours' — tenu si couvert par ≤ N jours   (sport tous les 2 j)
--      'volume_semaine'   — somme sur 7 jours glissants ≥ N (10 km / semaine)
--      'duree_jour'       — quantité du jour ≥ N            (30 min de langue)
--      'n_par_jour'       — compte du jour ≥ N              (4 repas)
--
--    groupe : les conditions d'un MÊME groupe sont en OU — « italien ou espagnol
--      ou japonais, une seule suffit ». C'est ce qui a fait monter la règle
--      tous/un d'un cran : elle s'applique aux GROUPES, pas aux conditions.
--
--    CHECK cadence/seuil : 'quotidien' est la seule cadence sans seuil ; toutes
--      les autres en exigent un, strictement positif. Écrit en une seule
--      expression pour que le refus soit total — et éprouvé PAR LE REFUS et sur
--      le cas NULL d'abord (leçon 0020/0021 : la logique ternaire SQL laisse
--      passer en silence ce qu'on croit interdire).
-- ---------------------------------------------------------------------------
create table public.althea_conditions (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  skill_id   uuid not null,

  libelle    text not null check (char_length(libelle) between 1 and 160),
  nature     text not null check (nature in ('pratique', 'garde')),

  cadence    text not null check (cadence in
             ('quotidien', 'tous_les_n_jours', 'volume_semaine', 'duree_jour', 'n_par_jour')),

  seuil      numeric(10, 2),
  unite      text check (unite is null or char_length(unite) between 1 and 16),

  groupe     smallint not null default 0 check (groupe between 0 and 99),
  rang_affichage smallint not null default 0 check (rang_affichage between 0 and 99),
  actif      boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint althea_conditions_scelle unique (owner_id, id),
  constraint althea_conditions_skill_scelle
    foreign key (owner_id, skill_id)
    references public.althea_skills (owner_id, id) on delete cascade,

  constraint althea_conditions_cadence_seuil check (
    (cadence = 'quotidien' and seuil is null)
    or (cadence <> 'quotidien' and seuil is not null and seuil > 0)
  )
);

create trigger althea_conditions_set_updated_at
  before update on public.althea_conditions
  for each row execute function public.set_updated_at();

create index althea_conditions_owner_skill_idx
  on public.althea_conditions (owner_id, skill_id);

-- ---------------------------------------------------------------------------
-- 5. althea_releves : un jour, une condition, tenu ou non.
--
--    ⚠️ RÈGLE ① DANS LE SCHÉMA : `tenu` est NOT NULL. Une ligne dit toujours
--    quelque chose — tenu, ou manqué DÉCLARÉ par Paul. Le troisième état,
--    « non renseigné », est **l'absence de ligne**. C'est pour cela qu'il n'y a
--    ni valeur par défaut de complaisance, ni ligne pré-créée : le silence doit
--    rester du silence.
--
--    ⚠️ RÈGLE ④ — LE JOUR FUTUR : `check (jour <= current_date)` est
--    IMPOSSIBLE. current_date n'est pas immutable, et Postgres refuse une
--    fonction non immutable dans un CHECK de table. Un CHECK qui « marcherait »
--    ici serait un CHECK qu'on n'a pas relu. La seule voie correcte est un
--    TRIGGER — c'est ce qui est fait ci-dessous, et c'est exprès qu'il est
--    documenté : la prochaine personne qui voudra « simplifier en CHECK » doit
--    lire pourquoi ça ne peut pas marcher.
--
--    La DATE est LOCALE (Europe/Paris), décidée côté client et validée serveur :
--    un relevé pris à 23 h 40 se range le jour que Paul a vécu, pas le lendemain
--    selon l'humeur d'UTC. Le type `date` (sans fuseau) est le bon porteur.
-- ---------------------------------------------------------------------------
create table public.althea_releves (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid()
               references auth.users (id) on delete cascade,

  condition_id uuid not null,

  jour         date not null,

  -- true = tenu · false = manqué DÉCLARÉ. Jamais NULL : l'inconnu n'a pas de
  -- ligne (règle ①).
  tenu         boolean not null,

  -- Les minutes, les kilomètres, les repas. C'est elle que les cadences
  -- chiffrées comparent au seuil.
  quantite     numeric(10, 2) check (quantite is null or quantite >= 0),

  -- Un mot, pas une page : ALTHEA mesure, DRAUKHAIN raconte (§1.2).
  mot          text check (mot is null or char_length(mot) between 1 and 280),

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint althea_releves_condition_scelle
    foreign key (owner_id, condition_id)
    references public.althea_conditions (owner_id, id) on delete cascade,

  -- Un jour = une ligne. C'est l'unicité qui empêche le compteur de mentir.
  constraint althea_releves_unicite unique (owner_id, condition_id, jour)
);

create trigger althea_releves_set_updated_at
  before update on public.althea_releves
  for each row execute function public.set_updated_at();

create index althea_releves_owner_jour_idx
  on public.althea_releves (owner_id, jour desc);

-- Le refus du jour futur, par trigger (voir la note ci-dessus).
-- search_path figé à '' comme set_updated_at (advisor 0011, cf. 0002) : la
-- fonction ne référence que NEW et des fonctions du catalogue, qualifiées.
create or replace function public.althea_refuse_jour_futur()
returns trigger
language plpgsql
as $$
begin
  if new.jour > (pg_catalog.current_date) then
    raise exception 'ALTHEA : un relevé ne peut pas porter un jour futur (%)', new.jour
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

alter function public.althea_refuse_jour_futur() set search_path = '';

create trigger althea_releves_refuse_jour_futur
  before insert or update of jour on public.althea_releves
  for each row execute function public.althea_refuse_jour_futur();

-- ---------------------------------------------------------------------------
-- 6. RLS : une policy PAR opération sur les cinq tables, condition
--    owner_id = (select auth.uid()) (initplan, cf. 0003), WITH CHECK sur les
--    écritures. ALTHEA porte la donnée la plus sensible d'Ultima (santé,
--    psychisme) : aucune exception, aucun assouplissement.
-- ---------------------------------------------------------------------------
alter table public.althea_avatar     enable row level security;
alter table public.althea_stats      enable row level security;
alter table public.althea_skills     enable row level security;
alter table public.althea_conditions enable row level security;
alter table public.althea_releves    enable row level security;

create policy althea_avatar_select on public.althea_avatar
  for select using (owner_id = (select auth.uid()));
create policy althea_avatar_insert on public.althea_avatar
  for insert with check (owner_id = (select auth.uid()));
create policy althea_avatar_update on public.althea_avatar
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy althea_avatar_delete on public.althea_avatar
  for delete using (owner_id = (select auth.uid()));

create policy althea_stats_select on public.althea_stats
  for select using (owner_id = (select auth.uid()));
create policy althea_stats_insert on public.althea_stats
  for insert with check (owner_id = (select auth.uid()));
create policy althea_stats_update on public.althea_stats
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy althea_stats_delete on public.althea_stats
  for delete using (owner_id = (select auth.uid()));

create policy althea_skills_select on public.althea_skills
  for select using (owner_id = (select auth.uid()));
create policy althea_skills_insert on public.althea_skills
  for insert with check (owner_id = (select auth.uid()));
create policy althea_skills_update on public.althea_skills
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy althea_skills_delete on public.althea_skills
  for delete using (owner_id = (select auth.uid()));

create policy althea_conditions_select on public.althea_conditions
  for select using (owner_id = (select auth.uid()));
create policy althea_conditions_insert on public.althea_conditions
  for insert with check (owner_id = (select auth.uid()));
create policy althea_conditions_update on public.althea_conditions
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy althea_conditions_delete on public.althea_conditions
  for delete using (owner_id = (select auth.uid()));

create policy althea_releves_select on public.althea_releves
  for select using (owner_id = (select auth.uid()));
create policy althea_releves_insert on public.althea_releves
  for insert with check (owner_id = (select auth.uid()));
create policy althea_releves_update on public.althea_releves
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy althea_releves_delete on public.althea_releves
  for delete using (owner_id = (select auth.uid()));
