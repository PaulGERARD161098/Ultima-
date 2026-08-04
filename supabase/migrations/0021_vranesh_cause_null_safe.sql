-- Ultima — migration 0021 : la portée de la cause, rendue NULL-safe.
-- APPLIQUÉE le 2026-08-04 (go de Paul « Applique », dans la foulée de 0020).
--
-- CORRECTIF DE 0020, ET LA LEÇON VAUT AU-DELÀ.
-- 0020 posait :
--     check (cause is null or etat = 'ecarte')
-- Cette contrainte ne refusait RIEN quand `etat` était NULL — c'est-à-dire sur
-- TOUS les plans existants, qu'aucune qualification n'avait encore touchés :
--     cause is null           → false
--     etat = 'ecarte'         → NULL   (et non false : `etat` vaut NULL)
--     false OR NULL           → NULL
-- Or un CHECK ne rejette que sur FALSE (logique ternaire SQL) : NULL passe.
-- Une cause pouvait donc se poser sur un plan non écarté, exactement ce que la
-- règle prétendait interdire.
--
-- 🔻 Comment ça a été trouvé : par une PREUVE PAR LE REFUS jouée en base juste
-- après l'application — un UPDATE illégitime, attendu en échec, qui a réussi.
-- Aucune relecture n'aurait attrapé ça : la contrainte se LIT juste. La règle
-- « une règle de confidentialité se teste par l'absence » (2026-07-30) s'étend
-- donc : **une contrainte se teste par le refus, et sur le cas NULL d'abord.**
--
-- `is not distinct from` ne renvoie jamais NULL : NULL vs 'ecarte' donne false,
-- donc la contrainte rejette. Les deux sens ont été éprouvés après coup —
-- l'illégitime refusé, le légitime accepté — sans laisser une seule écriture.

alter table public.scenarios drop constraint if exists scenarios_cause_scope;

alter table public.scenarios
  add constraint scenarios_cause_scope
  check (cause is null or etat is not distinct from 'ecarte');

-- rollback :
--   -- Revenir à la forme permissive de 0020 (déconseillé : elle ne refuse rien
--   -- sur les plans non qualifiés).
--   alter table public.scenarios drop constraint if exists scenarios_cause_scope;
--   alter table public.scenarios
--     add constraint scenarios_cause_scope check (cause is null or etat = 'ecarte');
--   -- Données : ni cette migration ni son rollback ne touchent une seule ligne.
