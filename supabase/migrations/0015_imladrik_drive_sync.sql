-- Ultima — migration 0015 : IMLADRIK / boucle Drive, sous-boucle ② (push).
-- Ne JAMAIS appliquer sans validation Paul (gate migrations). Additif et non
-- destructif : 3 colonnes d'ancrage sur `imladrik_entrees` (aucune table touchée,
-- aucune donnée déplacée). La RLS et les policies existantes de la table couvrent
-- déjà ces colonnes (owner_id = auth.uid()).
--
-- But : relier chaque page de journal à son fichier dans le Drive de Paul, pour
-- une sauvegarde UN SEUL SENS (Ultima → Drive) idempotente :
--   - `drive_file_id`     : l'id du Google Doc créé pour cette page (null = jamais poussée) ;
--   - `drive_content_hash`: empreinte du contenu au dernier push (saute le ré-upload si inchangé) ;
--   - `drive_synced_at`   : horodatage du dernier push réussi.
-- Ces colonnes ne portent AUCUN secret ni contenu — juste des références/état.

alter table public.imladrik_entrees
  add column if not exists drive_file_id      text
    check (drive_file_id is null or char_length(drive_file_id) <= 200),
  add column if not exists drive_content_hash text
    check (drive_content_hash is null or char_length(drive_content_hash) <= 128),
  add column if not exists drive_synced_at    timestamptz;

-- rollback :
--   alter table public.imladrik_entrees
--     drop column if exists drive_synced_at,
--     drop column if exists drive_content_hash,
--     drop column if exists drive_file_id;
--   -- Les Google Docs déjà créés dans le Drive de Paul ne sont PAS supprimés par
--   -- ce rollback (ils vivent côté Google) ; seul l'ancrage en base disparaît.
