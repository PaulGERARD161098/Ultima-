#!/usr/bin/env bash
# Le plafond d'appels de Léo, EXÉCUTÉ — migration `20261019160000_leo_appels.sql`
# appliquée sur un PostgreSQL jetable (socket Unix, aucun écouteur TCP, aucune
# base réelle, aucun secret). Écrit le 19/10/2026.
#
# Pourquoi il existe : `tests/unit-leo-appels.mjs` lit le SQL comme du texte ; il
# ne dit pas que le trigger REFUSE le 101ᵉ appel, que deux appels simultanés ne
# passent pas tous deux sous le seuil, qu'une ligne ne s'antidate pas, ni que les
# droits tiennent. Un garde-fou se prouve du côté où il peut être contourné.
#
# Usage (hors root, binaire PostgreSQL ≥ 15 présent) :
#   bash tests/leo-appels-postgres.sh
#   LEO_APPELS_MIGRATION=/chemin/copie-sabotee.sql bash tests/leo-appels-postgres.sh
# `TMPDIR` doit être lisible par l'utilisateur qui lance le script. Code 0 : tout
# est vert ; 1 : au moins une vérification a échoué ; 2 : environnement refusé.
set -euo pipefail
if [[ "$(id -u)" == 0 ]]; then echo 'Refus : ne pas lancer en root (initdb refuse).' >&2; exit 2; fi
for secret_name in PGPASSWORD DATABASE_URL SUPABASE_SERVICE_ROLE_KEY SUPABASE_ACCESS_TOKEN GITHUB_TOKEN GH_TOKEN; do
  if [[ -v "$secret_name" ]]; then echo 'Refus : variable de secret présente.' >&2; exit 2; fi
done
repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
migration="${LEO_APPELS_MIGRATION:-$repo_root/supabase/migrations/20261019160000_leo_appels.sql}"
bootstrap="$repo_root/tests/fixtures/leo-appels-bootstrap.sql"
pg_bin="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
if [[ -z "$pg_bin" || ! -x "$pg_bin/initdb" ]]; then echo 'Refus : binaires PostgreSQL absents.' >&2; exit 2; fi
fixture_dir="$(mktemp -d "${TMPDIR:-/tmp}/leo-appels-pg.XXXXXX")"
socket_dir="$fixture_dir/socket"; mkdir "$socket_dir"
cleanup() {
  result=$?
  trap - EXIT
  if [[ -f "$fixture_dir/data/postmaster.pid" ]]; then
    "$pg_bin/pg_ctl" -D "$fixture_dir/data" -m immediate -w -t 10 stop >/dev/null 2>&1 || true
  fi
  if [[ "$result" != 0 && -f "$fixture_dir/server.log" ]]; then tail -n 20 "$fixture_dir/server.log" >&2; fi
  rm -rf "${fixture_dir:?}"
  exit "$result"
}
trap cleanup EXIT

"$pg_bin/initdb" -D "$fixture_dir/data" --username=postgres --auth-local=trust --auth-host=reject --no-locale --encoding=UTF8 >/dev/null 2>&1
"$pg_bin/pg_ctl" -D "$fixture_dir/data" -l "$fixture_dir/server.log" -w -t 20 \
  -o "-p 54329 -k $socket_dir -c listen_addresses='' -c max_connections=60" start >/dev/null
psql_base=("$pg_bin/psql" -X -q -h "$socket_dir" -p 54329 -U postgres -d postgres)
admin() { "${psql_base[@]}" -v ON_ERROR_STOP=1 "$@"; }

A=11111111-1111-4111-8111-111111111111; B=22222222-2222-4222-8222-222222222222
C=33333333-3333-4333-8333-333333333333; D=44444444-4444-4444-8444-444444444444
admin -f "$bootstrap" >/dev/null
admin -f "$migration" >/dev/null

echecs=0
ok() { if [[ "$2" == 1 ]]; then echo "  ok     $1"; else echo "  ÉCHEC  $1"; echecs=$((echecs+1)); fi; }
# Une session « authentifiée » : rôle + identité posés, puis le SQL fourni sur l'entrée.
session() { # $1 = uuid, $2 = rôle ; SQL sur stdin → sortie standard + erreurs
  { printf "set role %s;\nselect set_config('request.jwt.claim.sub','%s',false) \\\\gset\n" "$2" "$1"; cat; } \
    | "${psql_base[@]}" -At 2>&1 || true
}
lignes() { admin -At -c "select count(*) from public.leo_appels where owner_id='$1'"; }
VALEUR="(gen_random_uuid(),'riven','test','tentee')"

# Verrou de non-vacuité : la table existe, vide, et l'amorce a posé ses quatre comptes.
ok 'non-vacuité : table vide, 4 comptes' "$([[ "$(lignes $A)" == 0 && "$(admin -At -c 'select count(*) from auth.users')" == 4 ]] && echo 1 || echo 0)"

echo '— les scripts de vérification que Paul colle dans le SQL Editor de Supabase (supabase/verifs/)'
# Lecture seule : 16 lignes, toutes vraies. Chaque ligne fausse est rapportée sous son nom.
resultats="$(admin -At -F'|' -f "$repo_root/supabase/verifs/leo_appels-1-etat.sql")"
ok 'verif 1 : les 16 lignes sont lues (verrou de non-vacuité)' "$([[ "$(grep -c '|[tf]$' <<<"$resultats")" == 16 ]] && echo 1 || echo 0)"
while IFS='|' read -r numero nom valeur; do
  [[ "$valeur" == f ]] && ok "verif 1 · ligne $numero : $nom" 0
done <<<"$resultats"
ok 'verif 1 : aucune ligne fausse' "$([[ "$(grep -c '|f$' <<<"$resultats" || true)" == 0 ]] && echo 1 || echo 0)"
# Le plafond sur la vraie base, annulé : le signal de réussite est une ERREUR dont le message dit PLAFOND_OK.
sortie="$("${psql_base[@]}" -At -f "$repo_root/supabase/verifs/leo_appels-2-plafond-annule.sql" 2>&1 || true)"
ok 'verif 2 : « PLAFOND_OK » (100 acceptées, la 101ᵉ refusée)' "$([[ "$sortie" == *'PLAFOND_OK : 100 tentatives'* ]] && echo 1 || echo 0)"
[[ "$sortie" != *'PLAFOND_OK'* ]] && echo "$sortie" | head -3
ok 'verif 2 : tout est annulé, aucune ligne ne reste' "$([[ "$(admin -At -c 'select count(*) from public.leo_appels')" == 0 ]] && echo 1 || echo 0)"

echo '— le plafond d'"'"'appels (100 tentatives / 24 h / propriétaire)'
sortie="$(session $A authenticated <<SQL
do \$\$
declare refus boolean := false; m text;
begin
  for i in 1..100 loop
    insert into public.leo_appels(trace_id,quadrant,modele,phase) values $VALEUR;
  end loop;
  begin
    insert into public.leo_appels(trace_id,quadrant,modele,phase) values $VALEUR;
  exception when sqlstate 'PT429' then
    refus := true;
    get stacked diagnostics m = message_text;
  end;
  if not refus then raise exception 'PLAFOND NON APPLIQUÉ'; end if;
  if m <> 'leo_calls_quota_exhausted' then raise exception 'MESSAGE %', m; end if;
end \$\$;
SQL
)"
ok '100 tentatives passent, la 101ᵉ est refusée PT429 (leo_calls_quota_exhausted)' "$([[ -z "$sortie" ]] && echo 1 || echo 0)"
[[ -n "$sortie" ]] && echo "$sortie" | head -3
ok 'exactement 100 lignes posées pour A' "$([[ "$(lignes $A)" == 100 ]] && echo 1 || echo 0)"
sortie="$(session $B authenticated <<SQL
insert into public.leo_appels(trace_id,quadrant,modele,phase) values $VALEUR;
SQL
)"
ok "un autre propriétaire n'est pas touché" "$([[ -z "$sortie" && "$(lignes $B)" == 1 ]] && echo 1 || echo 0)"
sortie="$(session $A authenticated <<'SQL'
insert into public.leo_appels(trace_id,quadrant,modele,phase,tokens_entree,tokens_sortie)
values (gen_random_uuid(),'riven','test','reussie',1200,300);
SQL
)"
ok "une issue ('reussie') ne compte pas dans le plafond d'appels" "$([[ -z "$sortie" && "$(lignes $A)" == 101 ]] && echo 1 || echo 0)"

echo '— la borne de volume (400 lignes / 24 h, toutes phases)'
sortie="$(session $A authenticated <<'SQL'
do $$
declare refus boolean := false; m text;
begin
  for i in 1..299 loop
    insert into public.leo_appels(trace_id,quadrant,modele,phase)
    values (gen_random_uuid(),'riven','test','echouee');
  end loop;
  begin
    insert into public.leo_appels(trace_id,quadrant,modele,phase)
    values (gen_random_uuid(),'riven','test','echouee');
  exception when sqlstate 'PT429' then
    refus := true;
    get stacked diagnostics m = message_text;
  end;
  if not refus then raise exception 'VOLUME NON BORNÉ'; end if;
  if m <> 'leo_calls_volume_exhausted' then raise exception 'MESSAGE %', m; end if;
end $$;
SQL
)"
ok 'la 401ᵉ ligne est refusée PT429 (leo_calls_volume_exhausted)' "$([[ -z "$sortie" && "$(lignes $A)" == 400 ]] && echo 1 || echo 0)"

echo '— l'"'"'horloge est celle de la base'
sortie="$(session $C authenticated <<SQL
insert into public.leo_appels(trace_id,quadrant,modele,phase,le)
values (gen_random_uuid(),'riven','test','tentee', now() - interval '3 days');
SQL
)"
ok "un client ne peut pas choisir « le » (droit d'écriture par colonnes)" "$([[ "$sortie" == *'permission denied'* && "$(lignes $C)" == 0 ]] && echo 1 || echo 0)"
# Même un chemin PRIVILÉGIÉ (superutilisateur, qui contourne les droits de colonnes) est ré-horodaté par le trigger.
admin -c "insert into public.leo_appels(owner_id,trace_id,quadrant,modele,phase,le) values ('$C', gen_random_uuid(),'riven','test','tentee', now() - interval '3 days')" >/dev/null
age="$(admin -At -c "select extract(epoch from (clock_timestamp() - le))::int from public.leo_appels where owner_id='$C'")"
ok 'une ligne antidatée par un chemin privilégié est ré-horodatée par le trigger (âge < 60 s)' "$([[ "$age" -lt 60 ]] && echo 1 || echo 0)"

echo '— la fenêtre glisse'
admin -c "update public.leo_appels set le = now() - interval '25 hours' where owner_id='$A'" >/dev/null
sortie="$(session $A authenticated <<SQL
insert into public.leo_appels(trace_id,quadrant,modele,phase) values $VALEUR;
SQL
)"
ok 'après 25 h, les anciennes lignes ne comptent plus : un appel repasse' "$([[ -z "$sortie" ]] && echo 1 || echo 0)"

echo '— les droits et la RLS'
sortie="$(session $A authenticated <<'SQL'
update public.leo_appels set quadrant = 'x';
SQL
)"; ok 'UPDATE refusé à un utilisateur authentifié' "$([[ "$sortie" == *'permission denied'* ]] && echo 1 || echo 0)"
sortie="$(session $A authenticated <<'SQL'
delete from public.leo_appels;
SQL
)"; ok 'DELETE refusé' "$([[ "$sortie" == *'permission denied'* ]] && echo 1 || echo 0)"
sortie="$(session $A authenticated <<'SQL'
truncate public.leo_appels;
SQL
)"; ok 'TRUNCATE refusé' "$([[ "$sortie" == *'permission denied'* ]] && echo 1 || echo 0)"
sortie="$(session $A anon <<'SQL'
select count(*) from public.leo_appels;
SQL
)"; ok "aucun accès anonyme (SELECT)" "$([[ "$sortie" == *'permission denied'* ]] && echo 1 || echo 0)"
sortie="$(session $A authenticated <<SQL
insert into public.leo_appels(owner_id,trace_id,quadrant,modele,phase)
values ('$B', gen_random_uuid(),'riven','test','tentee');
SQL
)"; ok "écrire au nom d'un autre propriétaire est refusé (droit de colonne « owner_id » retiré)" "$([[ "$sortie" == *'permission denied'* ]] && echo 1 || echo 0)"
sortie="$(session $A authenticated <<'SQL'
insert into public.leo_appels(id,trace_id,quadrant,modele,phase)
values (gen_random_uuid(), gen_random_uuid(),'riven','test','tentee');
SQL
)"; ok "choisir « id » est refusé (droit de colonne)" "$([[ "$sortie" == *'permission denied'* ]] && echo 1 || echo 0)"
# La RLS d'INSERT tient SEULE, indépendamment des droits de colonnes : on rouvre temporairement le droit sur owner_id.
admin -c "grant insert (owner_id) on public.leo_appels to authenticated" >/dev/null
sortie="$(session $A authenticated <<SQL
insert into public.leo_appels(owner_id,trace_id,quadrant,modele,phase)
values ('$B', gen_random_uuid(),'riven','test','tentee');
SQL
)"; ok "défense en profondeur : la RLS refuse seule l'écriture au nom d'autrui" "$([[ "$sortie" == *'row-level security'* ]] && echo 1 || echo 0)"
admin -c "revoke insert (owner_id) on public.leo_appels from authenticated" >/dev/null

echo '— une trace = une tentative et une issue, jamais plus'
TRACE=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
sortie="$(session $C authenticated <<SQL
insert into public.leo_appels(trace_id,quadrant,modele,phase) values ('$TRACE','riven','test','tentee');
SQL
)"; ok 'première tentative sur une trace : passe' "$([[ -z "$sortie" ]] && echo 1 || echo 0)"
sortie="$(session $C authenticated <<SQL
insert into public.leo_appels(trace_id,quadrant,modele,phase) values ('$TRACE','riven','test','tentee');
SQL
)"; ok 'rejouer la même tentative est refusé (leo_appels_une_tentee)' "$([[ "$sortie" == *'leo_appels_une_tentee'* ]] && echo 1 || echo 0)"
sortie="$(session $C authenticated <<SQL
insert into public.leo_appels(trace_id,quadrant,modele,phase,tokens_entree,tokens_sortie) values ('$TRACE','riven','test','reussie',10,5);
SQL
)"; ok "l'issue de cette trace passe" "$([[ -z "$sortie" ]] && echo 1 || echo 0)"
sortie="$(session $C authenticated <<SQL
insert into public.leo_appels(trace_id,quadrant,modele,phase) values ('$TRACE','riven','test','echouee');
SQL
)"; ok "une seconde issue (même contradictoire) est refusée (leo_appels_une_issue)" "$([[ "$sortie" == *'leo_appels_une_issue'* ]] && echo 1 || echo 0)"
sortie="$(session $A authenticated <<SQL
select count(*) filter (where owner_id <> '$A') from public.leo_appels;
SQL
)"; ok 'un propriétaire ne lit que ses lignes' "$([[ "$sortie" == 0 ]] && echo 1 || echo 0)"
sortie="$(session $A authenticated <<'SQL'
select leo_private.appels_plafond();
SQL
)"; ok 'la fonction du plafond ne s'"'"'appelle pas directement' "$([[ "$sortie" == *'permission denied'* ]] && echo 1 || echo 0)"

echo '— la forme : aucune colonne de contenu'
colonnes="$(admin -At -c "select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns where table_schema='public' and table_name='leo_appels'")"
ok 'colonnes exactes (aucun message, aucune réponse, aucun intitulé)' \
  "$([[ "$colonnes" == 'id,owner_id,trace_id,quadrant,modele,phase,tokens_entree,tokens_sortie,le' ]] && echo 1 || echo 0)"

echo '— DEUX APPELS SIMULTANÉS ne passent pas tous deux sous le seuil (verrou consultatif)'
# ⚠️ Chaque client garde sa transaction OUVERTE 0,5 s après l'insertion : sans verrou, les 30 lisent
# « 90 » avant qu'aucun ne valide et passent tous (120 lignes). Une version sans cette attente laissait
# le calendrier décider — et le sabotage « verrou retiré » est passé au vert le 19/10 (DR).
session $D authenticated <<SQL >/dev/null
do \$\$ begin
  for i in 1..90 loop insert into public.leo_appels(trace_id,quadrant,modele,phase) values $VALEUR; end loop;
end \$\$;
SQL
rafale="$(seq 1 30 | xargs -P 30 -I{} "$pg_bin/psql" -X -q -h "$socket_dir" -p 54329 -U postgres -d postgres -At \
  -c "set role authenticated; select set_config('request.jwt.claim.sub','$D',false); begin; insert into public.leo_appels(trace_id,quadrant,modele,phase) values $VALEUR; select pg_sleep(0.5); commit;" 2>&1 || true)"
refuses="$(grep -c 'leo_calls_quota_exhausted' <<<"$rafale" || true)"
ok "30 appels simultanés à 90/100 : exactement 100 lignes au total (10 passent, 20 refusés)" \
  "$([[ "$(lignes $D)" == 100 && "$refuses" == 20 ]] && echo 1 || echo 0)"
echo "         (lignes : $(lignes $D), refus vus : $refuses)"

if (( echecs > 0 )); then echo "LEO-APPELS-POSTGRES ÉCHEC : $echecs vérification(s)"; exit 1; fi
echo 'LEO-APPELS-POSTGRES OK'
