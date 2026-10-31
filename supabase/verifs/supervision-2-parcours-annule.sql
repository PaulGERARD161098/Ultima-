-- LE PARCOURS, ÉPROUVÉ SUR LA VRAIE BASE — puis tout est ANNULÉ (aucune ligne ne reste).
-- Où : dashboard Supabase → projet `ultima` → SQL Editor → coller → Run.
-- ⚠️ LE SIGNAL DE RÉUSSITE EST UNE ERREUR : le script soumet, re-soumet, refuse et re-soumet
-- au nom d'un compte réel, vérifie chaque réponse, puis lève volontairement une exception —
-- c'est elle qui ANNULE la transaction. Lire le message :
--   · « PARCOURS_OK … » → réussi ; rien n'a été écrit.
--   · « ECHEC … »       → une étape ne répond pas comme prévu ; ne pas activer, me le dire.
--   · « IMPOSSIBLE … »  → aucun compte, ou registre déjà utilisé par ce compte.
-- À lancer APRÈS la migration et AVANT d'ouvrir LEO_SUPERVISION (le registre est alors vide).
do $$
declare
  uid uuid;
  autre uuid;
  deja int;
  r1 jsonb; r2 jsonb; r3 jsonb; r4 jsonb;
  faux text := null;
  vu_par_autre int := null;
begin
  select id into uid from auth.users order by created_at limit 1;
  if uid is null then raise exception 'IMPOSSIBLE : aucun compte dans auth.users'; end if;
  select id into autre from auth.users where id <> uid order by created_at limit 1;
  select count(*) into deja from public.supervision_decisions where owner_id = uid;
  if deja <> 0 then
    raise exception 'IMPOSSIBLE : ce compte a déjà % proposition(s) — la preuve se fait sur un registre vide', deja;
  end if;

  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, true);
  set local role authenticated;

  -- Toute erreur imprévue d'une étape devient un ECHEC lisible, jamais un message brut.
  begin
    r1 := public.supervision_soumettre('verif-1', 'zoh:verif', 'conserver', array['zoh:verif'], '{"id":"verif-1"}'::jsonb);
    r2 := public.supervision_soumettre('verif-2', 'zoh:verif', 'conserver', array['zoh:verif'], '{"id":"verif-2"}'::jsonb);
    r3 := public.supervision_arbitrer((r1->>'id')::uuid, 'REFUSEE', 'vérification');
    r4 := public.supervision_soumettre('verif-3', 'zoh:verif', 'conserver', array['zoh:verif'], '{"id":"verif-3"}'::jsonb);
  exception when others then
    raise exception 'ECHEC : erreur inattendue au parcours (SQLSTATE %, %)', sqlstate, sqlerrm;
  end;
  begin
    perform public.supervision_soumettre('verif-4', 'zoh:verif', 'conserver', array['fake-uuid-123'], '{}'::jsonb);
  exception when sqlstate '22023' then
    get stacked diagnostics faux = message_text;
  end;

  if autre is not null then
    perform set_config('request.jwt.claim.sub', autre::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', autre)::text, true);
    select count(*) into vu_par_autre from public.supervision_decisions;
  end if;
  reset role;

  if r1->>'resultat' = 'inseree' and r2->>'resultat' = 'deja_en_attente' and r2->>'id' = r1->>'id'
     and r3->>'statut' = 'REFUSEE' and r4->>'resultat' = 'deja_tranchee' and faux = 'invalid_proof'
     and coalesce(vu_par_autre, 0) = 0 then
    raise exception 'PARCOURS_OK : soumise, doublon reconnu, refusée, refus tenu, faux ID refusé (%)%  — transaction annulée, aucune ligne ne reste',
      faux, case when autre is null then ', cloisonnement non éprouvé (un seul compte)' else ', invisible pour un autre compte' end;
  end if;
  raise exception 'ECHEC : r1=% r2=% r3=% r4=% faux=% vu_par_autre=%', r1, r2, r3, r4, coalesce(faux, 'aucun'), vu_par_autre;
end
$$;
