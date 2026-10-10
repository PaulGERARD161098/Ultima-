-- ZOH SHIA · RénoDevis — LA FINITION : ce que la base de référence porte APRÈS
-- les migrations de la techno, et qui n'est écrit dans aucune d'elles (posé
-- depuis une autre brique de la base partagée). Relevé le 04/10/2026.
--
-- ⛔ UN PRO NE S'ACCORDE PAS LE RÔLE D'ADMINISTRATEUR. Les privilèges par défaut
-- donnent à tout compte connecté l'écriture de TOUTES les colonnes de
-- `profiles`, `role` compris — et la policy de mise à jour l'autorise sur sa
-- propre ligne. Sans ce bloc, un pro qui écrit `role = 'admin'` sur son profil
-- lit ensuite toutes les données de tous les pros (`is_admin()` est dans
-- presque toutes les policies). Le droit d'écriture se donne donc colonne par
-- colonne, SANS `role` (ni `id` en mise à jour).
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, nom, entreprise, tel, email, secteur, zone, statut, mentions_legales,
              logo_url, site_url, linkedin_url, atouts, assurance_url, garanties_url,
              qualifications_url, attestations_valides_jusqu_au, siret, adresse,
              tva_intra, rge, decennale, forme_juridique, capital_social)
  on public.profiles to authenticated;
grant update (nom, entreprise, tel, email, secteur, zone, statut, mentions_legales,
              logo_url, site_url, linkedin_url, atouts, assurance_url, garanties_url,
              qualifications_url, attestations_valides_jusqu_au, siret, adresse,
              tva_intra, rge, decennale, forme_juridique, capital_social)
  on public.profiles to authenticated;
-- ⛔ CE `revoke` EFFACE AUSSI LES DROITS PAR COLONNE posés par les migrations
-- (révoquer au niveau de la table révoque chaque colonne). Toute colonne de
-- `profiles` accordée par une migration doit donc figurer dans ces deux listes.
-- Constaté le 10/10 : sans `forme_juridique` et `capital_social`, la base neuve
-- reproduisait l'incident du 09/10 en production (« Enregistrer mon entreprise »
-- refusé, 42501) ; c'est la validation contre la référence qui l'a vu.

-- ⛔ `is_admin()` NE S'APPELLE PAS SANS ÊTRE CONNECTÉ. Elle sert dans les
-- policies, évaluées avec les droits de l'appelant connecté ; `anon` n'en a
-- aucun usage, et le droit par défaut (PUBLIC) le lui donnait.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- Les deux fonctions d'horodatage s'exécutent sans chemin de recherche : un
-- objet homonyme posé dans un autre schéma ne peut pas s'y substituer.
alter function public.artisans_touch() set search_path = '';
alter function public.paiements_touch() set search_path = '';

-- ⛔ LA SIGNATURE PAR IDENTIFIANT EST REFUSÉE À UN INCONNU. Un appelant non
-- connecté ne signe un devis par son identifiant que si ce devis porte encore
-- un lien de cette forme (`signature_uuid_ouverte`, drapeau DÉRIVÉ, jamais
-- saisi). Le parcours normal passe par un jeton révocable, résolu côté serveur.
-- Le garde lit `auth.role()` et non `current_user` : dans une fonction SECURITY
-- DEFINER, `current_user` vaut le propriétaire, et le garde ne mordrait jamais.
create or replace function public.sign_devis_public(p_id uuid, p_signed_by text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_statut text; v_uuid_ouvert boolean;
begin
  select statut, coalesce(signature_uuid_ouverte, false)
    into v_statut, v_uuid_ouvert
    from public.devis where id = p_id;
  if not found then raise exception 'devis introuvable'; end if;

  if auth.role() = 'anon' and not v_uuid_ouvert then
    raise exception 'lien obsolete : ce devis se signe par son lien personnel'
      using errcode = 'P0001';
  end if;

  if exists (select 1 from public.relance_liens l where l.devis_id = p_id)
     and not exists (
       select 1 from public.relance_liens l
        where l.devis_id = p_id and l.revoked_at is null
     )
  then
    raise exception 'lien revoque : ce devis n''est plus signable en ligne'
      using errcode = 'P0001';
  end if;

  if v_statut in ('Refusé', 'Annulé', 'Perdu') then
    raise exception 'statut arrete : ce devis est « % » et ne peut plus etre signe', v_statut
      using errcode = 'P0001';
  end if;

  return public.sign_devis_interne(p_id, p_signed_by);
end;
$function$;

-- Le lien d'un pro vers son identifiant dans la brique commerciale voisine, et
-- la commission SANS valeur par défaut : un taux absent se voit, un 0 implicite
-- se lirait comme une décision (le taux est propre à chaque pro).
-- (`pro_id` et son index unique sont posés avant la migration du 06/10 qui les lit :
--  retouche de la recette, 10/10.)
alter table public.artisans alter column commission_pct drop default;
alter table public.artisans alter column commission_pct drop not null;
