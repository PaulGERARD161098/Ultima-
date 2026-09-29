-- LE JOURNAL DES ÉCRITURES DE LÉO — B1 étape ③ (cadrage §12.6, 29/09/2026).
--
-- ⛔ PRÉPARÉE, NON APPLIQUÉE. Une migration ne s'applique jamais seule dans ce
-- dépôt : c'est un gate de Paul, et le mode solo ne le lève pas.
--
-- ---- Pourquoi cette table existe, et pourquoi elle pèse plus lourd qu'avant
-- Depuis l'arbitrage du 29/09, les dix outils du catalogue sont VERTS : Léo
-- pourra écrire sans demander. L'anneau ne borne donc plus rien sur eux, et ce
-- qui garde le dispositif devient : ce journal, et le plafond de volume qu'il
-- alimente. Ce n'est plus une traçabilité de confort.
--
-- ---- ⛔ APPEND-ONLY STRICT, et ce n'est pas un excès de prudence
-- La règle A4 exige que le journal s'écrive AVANT l'acte : journalisé après,
-- une interruption entre l'écriture et sa trace laisse une action sans preuve,
-- et le silence d'une garde se lit comme une bonne nouvelle.
-- Mais « écrire avant puis compléter » demanderait une policy UPDATE — donc
-- de quoi réécrire une ligne déjà posée. On pose donc PLUSIEURS LIGNES par
-- écriture, reliées par `trace_id`, et AUCUNE ne se modifie jamais :
--   'tentee'   → posée avant l'acte ;
--   'reussie' / 'echouee' → posée après ;
--   'defaite'  → posée quand Paul défait l'écriture (M3).
-- ⚠️ Une 'tentee' RESTÉE SEULE est donc elle-même une information : l'écriture
-- s'est interrompue en vol. C'est exactement ce que A4 cherche à attraper, et
-- une table modifiable l'aurait effacé.
--
-- ---- ⛔ AUCUN CONTENU DICTÉ N'ENTRE ICI
-- Ni titre d'idée, ni note de journal, ni page intime, ni nom de contact. Le
-- réseau commercial EST de la PII, et IMLADRIK est intime. Ce journal dit ce
-- qui a été FAIT, jamais ce qui a été ÉCRIT : un outil, un quadrant, un
-- anneau, une cible par son ID, une issue. `motif` ne porte qu'un motif
-- TECHNIQUE d'échec (un statut, un nom d'erreur), jamais la requête.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create table public.leo_ecritures (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- Relie les lignes d'une même écriture ('tentee' → 'reussie' → 'defaite').
  trace_id   uuid not null,

  -- ⛔ Le nom de l'outil est BORNÉ, pas enfermé dans une liste : une liste
  -- fermée ici créerait une SECONDE VÉRITÉ face au catalogue de
  -- `api/_lib/leo.js`, et le jour où elles divergent on croit la mauvaise.
  -- Le catalogue décide de ce qui existe ; cette table ne fait que le noter.
  outil      text not null check (char_length(outil) between 1 and 80),
  quadrant   text not null check (char_length(quadrant) between 1 and 40),

  -- L'anneau AU MOMENT DE L'ÉCRITURE. Il est figé dans la trace : si le
  -- catalogue retaille un anneau demain, le journal doit continuer de dire
  -- sous quel régime l'écriture a été faite — sinon on relit l'histoire avec
  -- les règles d'aujourd'hui.
  anneau     text not null check (anneau in ('vert', 'orange')),

  phase      text not null
             check (phase in ('tentee', 'reussie', 'echouee', 'defaite')),

  -- ⛔ UN IDENTIFIANT, JAMAIS UN LIBELLÉ. « l'idée 3f2a… », pas « l'idée
  -- Racheter le local de Villeurbanne ».
  cible_id   uuid,

  -- Motif TECHNIQUE d'échec seulement (statut HTTP, nom d'erreur). Borné
  -- court À DESSEIN : 200 caractères ne portent pas une page de journal, et
  -- la borne est ce qui rend la promesse « zéro contenu dicté » tenable
  -- autrement que par la discipline de celui qui écrit.
  motif      text check (motif is null or char_length(motif) <= 200),

  le         timestamptz not null default now()
);

-- Le plafond de volume compte les écritures récentes d'un propriétaire, et
-- l'écran du matin les relit dans l'ordre : c'est le même index.
create index leo_ecritures_owner_le_idx
  on public.leo_ecritures (owner_id, le desc);
-- Rassembler les lignes d'une même écriture (l'issue, le défaire).
create index leo_ecritures_owner_trace_idx
  on public.leo_ecritures (owner_id, trace_id);

alter table public.leo_ecritures enable row level security;

-- Lecture : chacun ne voit que son journal (RLS mono-utilisateur).
create policy leo_ecritures_select on public.leo_ecritures
  for select using (owner_id = (select auth.uid()));

-- Écriture : INSERT seulement.
create policy leo_ecritures_insert on public.leo_ecritures
  for insert with check (owner_id = (select auth.uid()));

-- ⛔ AUCUNE POLICY UPDATE, AUCUNE POLICY DELETE — ET LEUR ABSENCE EST LA
-- RÈGLE, pas un oubli. Sous RLS, ce qui n'est pas autorisé est refusé : le
-- silence suffit. Écrire ici un commentaire est ce qui empêchera quelqu'un
-- d'« ajouter les policies manquantes » en croyant compléter le travail.
-- Un journal qui se corrige ne prouve plus rien.

-- ⛔ ET LA CEINTURE QUI TIENT MÊME SI UNE POLICY EST AJOUTÉE UN JOUR : le
-- refus est aussi posé au niveau de la TABLE, hors RLS. Une policy ajoutée
-- par inadvertance ne suffirait donc pas à rouvrir la porte — il faudrait
-- défaire ce revoke, ce qui est un geste délibéré et visible en migration.
revoke update, delete, truncate on public.leo_ecritures from authenticated, anon;

commit;
