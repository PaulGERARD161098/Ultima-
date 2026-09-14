-- Correctifs préparés, à appliquer avant le code qui appelle denouer_situation.
-- Aucune suppression de données par la migration. Si un lien préexistant
-- croise deux propriétaires, la validation annule TOUTE la transaction.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.idees add constraint idees_owner_id_id_key unique (owner_id, id);
alter table public.idees_liens
  add constraint idees_liens_source_scelle foreign key (owner_id, source_id)
    references public.idees(owner_id, id) on delete cascade,
  add constraint idees_liens_target_scelle foreign key (owner_id, target_id)
    references public.idees(owner_id, id) on delete cascade;

alter table public.intendant_besoins
  drop constraint intendant_besoins_fournisseur_node_id_fkey,
  add constraint intendant_besoins_fournisseur_scelle
    foreign key (owner_id, fournisseur_node_id)
    references public.network_nodes(owner_id, id) on delete set null (fournisseur_node_id);

-- SET NULL sans liste effaçait également owner_id / id (NOT NULL).
alter table public.althea_skills
  drop constraint althea_skills_evolution_scellee,
  add constraint althea_skills_evolution_scellee foreign key (owner_id, evolue_en)
    references public.althea_skills(owner_id, id) on delete set null (evolue_en);
alter table public.situations
  drop constraint situations_advenu_scelle,
  add constraint situations_advenu_scelle foreign key (owner_id, id, scenario_advenu_id)
    references public.scenarios(owner_id, situation_id, id)
    on delete set null (scenario_advenu_id);

create function public.situations_effacer_date_advenu()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.scenario_advenu_id is null then new.advenu_le := null; end if;
  return new;
end;
$$;
create trigger situations_effacer_date_advenu
before update of scenario_advenu_id on public.situations
for each row execute function public.situations_effacer_date_advenu();
revoke all on function public.situations_effacer_date_advenu() from public, anon, authenticated;

-- Un seul appel = une transaction. Le verrou de la situation sérialise deux
-- dénouements concurrents ; toute erreur de coupe annule aussi le choix.
-- SECURITY INVOKER : toutes les opérations restent soumises à la RLS.
create function public.denouer_situation(p_situation uuid, p_scenario uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  cible public.situations%rowtype;
  nb_coupees integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise' using errcode = '42501';
  end if;
  select * into cible from public.situations
    where id = p_situation and owner_id = auth.uid() for update;
  if not found then return null; end if;

  update public.situations set scenario_advenu_id = p_scenario,
    advenu_le = case when p_scenario is null then null else now() end
    where id = p_situation and owner_id = auth.uid() returning * into cible;
  if p_scenario is not null then
    delete from public.scenarios
      where situation_id = p_situation and owner_id = auth.uid() and id <> p_scenario;
    get diagnostics nb_coupees = row_count;
  end if;
  return jsonb_build_object('id', cible.id, 'scenario_advenu_id', cible.scenario_advenu_id,
    'advenu_le', cible.advenu_le, 'coupees', nb_coupees);
end;
$$;
revoke all on function public.denouer_situation(uuid, uuid) from public, anon;
grant execute on function public.denouer_situation(uuid, uuid) to authenticated;
commit;
