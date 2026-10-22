-- LE PLAFOND, ÉPROUVÉ SUR LA VRAIE BASE — puis tout est ANNULÉ (aucune ligne ne reste).
-- Où : dashboard Supabase → projet `ultima` → SQL Editor → coller → Run.
-- ⚠️ LE SIGNAL DE RÉUSSITE EST UNE ERREUR : le script pose 100 tentatives au nom d'un compte réel,
-- constate que la 101ᵉ est refusée, puis lève volontairement une exception — c'est elle qui ANNULE
-- la transaction. Lire le message :
--   · « PLAFOND_OK … »  → réussi, la base refuse bien la 101ᵉ ; rien n'a été écrit.
--   · « ECHEC … »       → le plafond ne se comporte pas comme prévu ; ne pas fusionner, me le dire.
--   · « IMPOSSIBLE … »  → aucun compte dans auth.users : le plafond se prouve avec un propriétaire réel.
-- À lancer APRÈS la migration et AVANT tout usage de Léo (la table est alors vide).
do $$
declare
  uid uuid;
  acceptees int := 0;
  refus text := null;
  deja int;
begin
  select id into uid from auth.users order by created_at limit 1;
  if uid is null then
    raise exception 'IMPOSSIBLE : aucun compte dans auth.users';
  end if;
  select count(*) into deja from public.leo_appels where owner_id = uid;
  if deja <> 0 then
    raise exception 'IMPOSSIBLE : ce compte a déjà % ligne(s) dans leo_appels — la preuve se fait sur une table vide', deja;
  end if;

  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, true);
  set local role authenticated;

  for i in 1..101 loop
    begin
      insert into public.leo_appels (trace_id, quadrant, modele, phase)
      values (gen_random_uuid(), 'verif', 'verif', 'tentee');
      acceptees := acceptees + 1;
    exception when sqlstate 'PT429' then
      get stacked diagnostics refus = message_text;
      exit;
    end;
  end loop;
  reset role;

  if acceptees = 100 and refus = 'leo_calls_quota_exhausted' then
    raise exception 'PLAFOND_OK : % tentatives acceptées, la suivante refusée (%) — transaction annulée, aucune ligne ne reste', acceptees, refus;
  end if;
  raise exception 'ECHEC : % tentative(s) acceptée(s), refus = %', acceptees, coalesce(refus, 'aucun');
end
$$;
