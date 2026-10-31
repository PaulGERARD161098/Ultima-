-- SUPERVISION ET RÉEMPLOI — le registre des propositions de Léo (31/10/2026).
--
-- Pourquoi : Léo PROPOSE (conserver, mesurer, améliorer, mutualiser, simplifier,
-- suspendre, proposer un retrait), Paul TRANCHE. Ce registre garde chaque
-- proposition contrôlée, et l'empêche de revenir une fois tranchée tant que ses
-- preuves n'ont pas changé. Cadrage : `zohshia/supervision-valeur/TECHNO.md`.
--
-- ⛔ GATE : cette migration n'est PAS appliquée par la séance qui l'écrit
-- (SQL/RLS = geste de Paul, éditeur SQL). Éprouvée sur PostgreSQL en mémoire :
-- `tests/unit-supervision-sql.mjs`.
--
-- Ce que la base garantit :
--   · une ligne n'appartient qu'à son propriétaire (RLS en lecture, AUCUN droit
--     d'écriture direct : tout passe par les trois fonctions ci-dessous) ;
--   · l'EMPREINTE est calculée ICI, jamais reçue : objet, recommandation et
--     preuves triées, séparés par des caractères de contrôle que le format des
--     identifiants exclut — `ab`+`c` ne vaut pas `a`+`bc` ;
--   · la réponse dit ce qui s'est passé (`inseree`, `deja_en_attente`,
--     `deja_tranchee`, `reouverte`) : rien n'est écarté en silence ;
--   · rien ne se supprime : `OBSOLETE` remplace la purge, sinon un refus
--     perdrait son empreinte et la proposition reviendrait ;
--   · un REFUS bloque le même objet et la même recommandation, quelles que
--     soient les preuves, jusqu'à la date de réexamen fixée par Paul (sans
--     date : indéfiniment) — décision de Paul du 31/10, revue S1.
--
-- ⚠️ Ce que la base NE garantit PAS : que l'arbitrage vienne de Paul plutôt que
-- de Léo. Les outils de Léo s'exécutent sous l'identité de Paul ; la base ne
-- distingue pas les deux. La séparation tient au CODE : Léo n'a aucun outil
-- d'arbitrage (gardé par test), seule la route du cockpit appelle
-- `supervision_arbitrer`.
--
-- Hypothèse de volume (à ajuster) : 50 propositions par fenêtre glissante de
-- 24 h et par propriétaire — l'inscription au projet d'auth d'Ultima étant
-- OUVERTE (`api/_lib/proprietaire.js`), un compte quelconque ne doit pas
-- pouvoir remplir la table.
--
-- Statuts en `text` + `check` plutôt qu'un type ENUM (convention des tables de
-- Léo : un ENUM se modifie mal dans une migration).

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create table public.supervision_decisions (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null default auth.uid()
                        references auth.users (id) on delete cascade,
  proposition_id        text not null check (char_length(proposition_id) between 1 and 128),
  objet_id              text not null
                        check (objet_id ~ '^(zoh|finubar|leo):[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$'),
  recommandation        text not null check (recommandation in (
                          'conserver', 'mesurer', 'ameliorer', 'mutualiser',
                          'simplifier', 'suspendre', 'proposer_retrait')),
  statut                text not null default 'EN_ATTENTE'
                        check (statut in ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'OBSOLETE')),
  empreinte_materielle  text not null check (empreinte_materielle ~ '^[0-9a-f]{64}$'),
  preuves_ids           text[] not null check (cardinality(preuves_ids) between 1 and 22),
  -- Le dossier tel que contrôlé, pour que Paul le lise au cockpit. Borné comme
  -- le sas de forme côté serveur (32 Ko).
  proposition           jsonb not null check (jsonb_typeof(proposition) = 'object'
                          and octet_length(proposition::text) <= 32768),
  cree_le               timestamptz not null default now(),
  tranche_le            timestamptz,
  decision_notes        text check (decision_notes is null or char_length(decision_notes) <= 2000),
  prochain_reexamen_le  timestamptz,
  constraint supervision_unicite_empreinte unique (owner_id, empreinte_materielle),
  constraint supervision_tranche_coherent check (
    (statut in ('ACCEPTEE', 'REFUSEE')) = (tranche_le is not null))
);

create index supervision_owner_statut_idx on public.supervision_decisions (owner_id, statut, cree_le desc);
create index supervision_owner_objet_idx on public.supervision_decisions (owner_id, objet_id);

alter table public.supervision_decisions enable row level security;

create policy supervision_select on public.supervision_decisions
  for select using (owner_id = (select auth.uid()));

-- Aucune écriture directe, aucun accès anonyme.
revoke all on public.supervision_decisions from public, anon, authenticated;
grant select on public.supervision_decisions to authenticated;

-- ── L'identifiant d'une preuve : même format que `api/_lib/supervision-preuves.mjs`.
-- Seules `zoh:` et `finubar:` prouvent ; `leo:` n'est qu'un objet.
create function public.supervision_empreinte(p_objet text, p_recommandation text, p_preuves text[])
returns text language sql immutable strict set search_path = ''
as $$
  select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
    p_objet || pg_catalog.chr(31) || p_recommandation || pg_catalog.chr(31)
      || pg_catalog.array_to_string(p_preuves, pg_catalog.chr(30)), 'UTF8')), 'hex')
$$;
revoke all on function public.supervision_empreinte(text, text, text[]) from public, anon, authenticated;

-- ── SOUMETTRE : contrôle, empreinte, insertion — atomique ──────────────────────
create function public.supervision_soumettre(
  p_proposition_id text, p_objet_id text, p_recommandation text,
  p_preuves text[], p_proposition jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_preuves text[];
  v_empreinte text;
  v_id uuid;
  v_statut text;
  v_reexamen timestamptz;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if p_proposition_id is null or p_objet_id is null or p_recommandation is null
     or p_preuves is null or p_proposition is null then
    raise exception using errcode = '22023', message = 'invalid_request';
  end if;
  if cardinality(p_preuves) not between 1 and 22
     or exists (select 1 from pg_catalog.unnest(p_preuves) as u(id)
                where u.id is null or u.id !~ '^(zoh|finubar):[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$') then
    raise exception using errcode = '22023', message = 'invalid_proof';
  end if;
  -- Une preuve répétée est refusée, pas dédoublonnée : elle gonflerait le dossier.
  select pg_catalog.array_agg(u.id order by u.id collate "C") into v_preuves
    from (select distinct d.id from pg_catalog.unnest(p_preuves) as d(id)) as u;
  if cardinality(v_preuves) <> cardinality(p_preuves) then
    raise exception using errcode = '22023', message = 'repeated_proof';
  end if;

  v_empreinte := public.supervision_empreinte(p_objet_id, p_recommandation, v_preuves);

  -- Sérialisé par propriétaire : verrou, refus, doublon et plafond se lisent ensemble.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('supervision:' || v_uid::text, 0));

  -- LE REFUS TIENT JUSQU'À SA DATE DE RÉEXAMEN (Paul, 31/10/2026 ; revue S1) : un refus
  -- bloque le même objet avec la même recommandation, QUELLES QUE SOIENT LES PREUVES —
  -- sinon une preuve sans rapport suffirait à faire revenir ce que Paul a écarté. Sans
  -- date de réexamen, il tient indéfiniment. Remplace le « déblocage par une preuve
  -- nouvelle » de la recette reçue.
  select d.id into v_id
    from public.supervision_decisions d
    where d.owner_id = v_uid and d.objet_id = p_objet_id and d.recommandation = p_recommandation
      and d.statut = 'REFUSEE'
      and (d.prochain_reexamen_le is null or d.prochain_reexamen_le > pg_catalog.now())
    order by d.tranche_le desc
    limit 1;
  if v_id is not null then
    return pg_catalog.jsonb_build_object('resultat', 'deja_tranchee', 'id', v_id, 'statut', 'REFUSEE');
  end if;

  select d.id, d.statut, d.prochain_reexamen_le into v_id, v_statut, v_reexamen
    from public.supervision_decisions d
    where d.owner_id = v_uid and d.empreinte_materielle = v_empreinte
    for update;

  -- Le plafond ne compte que ce qui AJOUTE une ligne : un doublon garde sa réponse
  -- explicite même plafond atteint (revue du 31/10).
  if v_id is null and (select count(*) from public.supervision_decisions
      where owner_id = v_uid and cree_le >= pg_catalog.now() - interval '24 hours') >= 50 then
    raise exception using errcode = 'PT429', message = 'supervision_volume_exhausted';
  end if;

  if v_id is null then
    -- Les contraintes de la table vérifient objet, recommandation et dossier.
    insert into public.supervision_decisions
      (owner_id, proposition_id, objet_id, recommandation, empreinte_materielle, preuves_ids, proposition)
    values (v_uid, p_proposition_id, p_objet_id, p_recommandation, v_empreinte, v_preuves, p_proposition)
    returning id into v_id;
    return pg_catalog.jsonb_build_object('resultat', 'inseree', 'id', v_id, 'statut', 'EN_ATTENTE');
  end if;

  -- Retirée avant arbitrage (OBSOLETE), ou refusée dont la date de réexamen est passée
  -- (le bloc du refus l'aurait arrêtée sinon) : la même proposition revient en attente.
  -- ⚠️ La décision précédente n'est pas conservée (unicité de l'empreinte) : limite dite.
  -- La date est revérifiée ici : ce n'est pas au seul bloc du refus de garder la porte.
  if v_statut = 'OBSOLETE'
     or (v_statut = 'REFUSEE' and v_reexamen is not null and v_reexamen <= pg_catalog.now()) then
    update public.supervision_decisions
      set statut = 'EN_ATTENTE', proposition_id = p_proposition_id,
          proposition = p_proposition, cree_le = pg_catalog.now(),
          tranche_le = null, decision_notes = null, prochain_reexamen_le = null
      where id = v_id;
    return pg_catalog.jsonb_build_object('resultat', 'reouverte', 'id', v_id, 'statut', 'EN_ATTENTE');
  end if;

  return pg_catalog.jsonb_build_object(
    'resultat', case when v_statut = 'EN_ATTENTE' then 'deja_en_attente' else 'deja_tranchee' end,
    'id', v_id, 'statut', v_statut);
exception
  when check_violation or invalid_text_representation then
    raise exception using errcode = '22023', message = 'invalid_request';
end;
$$;

-- ── ARBITRER : Paul seul, par la route du cockpit (aucun outil de Léo) ────────
create function public.supervision_arbitrer(
  p_id uuid, p_decision text, p_notes text default null, p_prochain_reexamen timestamptz default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_statut text;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if p_id is null or p_decision is null or p_decision not in ('ACCEPTEE', 'REFUSEE')
     or (p_notes is not null and char_length(p_notes) > 2000)
     -- Une date de réexamen est dans le futur : passée, elle rouvrirait le refus aussitôt.
     or (p_prochain_reexamen is not null and p_prochain_reexamen <= pg_catalog.now()) then
    raise exception using errcode = '22023', message = 'invalid_request';
  end if;
  select d.statut into v_statut from public.supervision_decisions d
    where d.id = p_id and d.owner_id = v_uid for update;
  -- Introuvable et appartenant à autrui : même réponse (pas de fuite d'existence).
  if v_statut is null then
    raise exception using errcode = 'P0002', message = 'decision_not_found';
  end if;
  if v_statut <> 'EN_ATTENTE' then
    raise exception using errcode = 'P0001', message = 'decision_not_pending';
  end if;
  update public.supervision_decisions
    set statut = p_decision, tranche_le = pg_catalog.now(),
        decision_notes = p_notes, prochain_reexamen_le = p_prochain_reexamen
    where id = p_id;
  return pg_catalog.jsonb_build_object('id', p_id, 'statut', p_decision);
end;
$$;

-- ── RETIRER : défaire une proposition encore en attente (anneau vert) ─────────
create function public.supervision_retirer(p_id uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_statut text;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  select d.statut into v_statut from public.supervision_decisions d
    where d.id = p_id and d.owner_id = v_uid for update;
  if v_statut is null then
    raise exception using errcode = 'P0002', message = 'decision_not_found';
  end if;
  if v_statut <> 'EN_ATTENTE' then
    raise exception using errcode = 'P0001', message = 'decision_not_pending';
  end if;
  update public.supervision_decisions set statut = 'OBSOLETE' where id = p_id;
  return pg_catalog.jsonb_build_object('id', p_id, 'statut', 'OBSOLETE');
end;
$$;

revoke all on function public.supervision_soumettre(text, text, text, text[], jsonb) from public, anon;
revoke all on function public.supervision_arbitrer(uuid, text, text, timestamptz) from public, anon;
revoke all on function public.supervision_retirer(uuid) from public, anon;
grant execute on function public.supervision_soumettre(text, text, text, text[], jsonb) to authenticated;
grant execute on function public.supervision_arbitrer(uuid, text, text, timestamptz) to authenticated;
grant execute on function public.supervision_retirer(uuid) to authenticated;

commit;
