#!/usr/bin/env bash
# R17/R25/R27/R28: real PostgreSQL 17 concurrency, exclusively in disposable CI.
# Caller MUST provide readonly/network-none/cap-drop container, user 999,
# tmpfs /tmp >=256 MiB; bind only proposal SQL and these fixtures readonly.
# No real credentials, Supabase, TCP listeners, migrations or external services.
# PostgreSQL 17 primary docs: /docs/17/app-initdb.html, app-pg-ctl.html,
# app-psql.html (ON_ERROR_STOP exit 3, VERBOSITY verbose includes SQLSTATE).
set -euo pipefail
if [[ "${LV1_PG_ISOLATED:-}" != 1 || "$(id -u)" != 999 ]]; then
  echo 'Refus : conteneur PostgreSQL isolé utilisateur 999 requis.' >&2
  exit 2
fi
for secret_name in PGPASSWORD DATABASE_URL SUPABASE_SERVICE_ROLE_KEY SUPABASE_ACCESS_TOKEN GITHUB_TOKEN GH_TOKEN; do
  if [[ -v "$secret_name" ]]; then
    echo 'Refus : variable de secret présente.' >&2
    exit 2
  fi
done
repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
pg_bin=/usr/lib/postgresql/17/bin
fixture_dir="$(mktemp -d /tmp/leo-pg.XXXXXX)"
cluster_dir="$fixture_dir/data"
socket_dir="$fixture_dir/socket"
mkdir "$socket_dir"
holder_pid=''
race_a_pid=''
race_b_pid=''
cleanup() {
  result=$?
  trap - EXIT TERM INT
  exec 3>&- || true
  for child in "$holder_pid" "$race_a_pid" "$race_b_pid"; do
    if [[ -n "$child" ]]; then kill "$child" 2>/dev/null || true; fi
  done
  if [[ -f "$cluster_dir/postmaster.pid" ]]; then
    "$pg_bin/pg_ctl" -D "$cluster_dir" -m immediate -w -t 10 stop >/dev/null 2>&1 || true
  fi
  # Only this mktemp-created fixture is disposed. Logs survive failures until
  # container exit and contain exclusively synthetic identifiers and SQL.
  if [[ "$result" != 0 ]]; then
    for log in "$fixture_dir"/*.log; do
      if [[ -f "$log" ]]; then cat "$log" >&2; fi
    done
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT
"$pg_bin/initdb" -D "$cluster_dir" --username=postgres --auth-local=trust --auth-host=reject --no-locale --encoding=UTF8 >"$fixture_dir/init.log" 2>&1
"$pg_bin/pg_ctl" -D "$cluster_dir" -l "$fixture_dir/server.log" -w -t 15 \
  -o "-k $socket_dir -c listen_addresses='' -c statement_timeout=10000 -c idle_in_transaction_session_timeout=10000 -c max_connections=16 -c shared_buffers=32MB" start
psql_base=("$pg_bin/psql" -X -q -h "$socket_dir" -v ON_ERROR_STOP=1 -v VERBOSITY=verbose)
admin() { "${psql_base[@]}" -U postgres -d postgres "$@"; }
admin -f "$repo_root/tests/fixtures/leo-registre-bootstrap.sql"
admin -f "$repo_root/leo/proposals/registre-postgres.sql"
# Reproduce the installed old SQLSTATE, then apply the actual corrective file.
admin <<'SQL'
DO $$ BEGIN
  EXECUTE replace(pg_get_functiondef('leo_private.write_memory_impl(uuid,text,bigint,jsonb)'::regprocedure), '''PT409''', '''40001''');
END $$;
SQL
admin -f "$repo_root/supabase/migrations/20261001070311_leo_registre_conflicts_pt409.sql"
admin <<'SQL'
INSERT INTO public.leo_missions(id,owner,expires_at,max_units,max_calls)
VALUES ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        clock_timestamp()+interval '1 hour',1,1);
DO $$ BEGIN
  IF current_setting('listen_addresses') <> '' THEN RAISE EXCEPTION 'TCP listener forbidden'; END IF;
  IF (SELECT count(*) FROM public.leo_missions) <> 1 THEN RAISE EXCEPTION 'non-vacuity failed'; END IF;
END $$;
SQL
# Hold the mission row before starting both independent authenticated clients.
# FIFO keeps a transaction open without a timing-based pg_sleep assumption.
mkfifo "$fixture_dir/holder-input"
admin <"$fixture_dir/holder-input" >"$fixture_dir/holder.log" 2>&1 &
holder_pid=$!
exec 3>"$fixture_dir/holder-input"
printf '%s\n' 'BEGIN;' "SELECT id FROM public.leo_missions WHERE id='11111111-1111-4111-8111-111111111111' FOR UPDATE;" "\\! touch $fixture_dir/locked" >&3
for ((attempt=0; attempt<80; attempt++)); do
  [[ -f "$fixture_dir/locked" ]] && break
  sleep 0.05
done
[[ -f "$fixture_dir/locked" ]] || { echo 'Verrou initial non acquis.' >&2; exit 1; }
for side in a b; do
  cat >"$fixture_dir/race-$side.sql" <<SQL
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_write_memory('11111111-1111-4111-8111-111111111111',
  'op-$side',1,'{"state":"in_progress","next_action":"fixture"}'::jsonb);
SQL
done
"${psql_base[@]}" -U authenticated -d 'dbname=postgres application_name=lv1-race-a' -f "$fixture_dir/race-a.sql" >"$fixture_dir/race-a.log" 2>&1 &
race_a_pid=$!
"${psql_base[@]}" -U authenticated -d 'dbname=postgres application_name=lv1-race-b' -f "$fixture_dir/race-b.sql" >"$fixture_dir/race-b.log" 2>&1 &
race_b_pid=$!
waiting=0
for ((attempt=0; attempt<80; attempt++)); do
  waiting="$(admin -Atc "SELECT count(*) FROM pg_stat_activity WHERE application_name IN ('lv1-race-a','lv1-race-b') AND usename='authenticated' AND wait_event_type='Lock';")"
  [[ "$waiting" == 2 ]] && break
  sleep 0.05
done
[[ "$waiting" == 2 ]] || { echo 'Deux clients concurrents bloqués sur verrous non observés.' >&2; exit 1; }
printf '%s\n' 'COMMIT;' '\q' >&3
exec 3>&-
wait "$holder_pid"
holder_pid=''
a_status=0
b_status=0
wait "$race_a_pid" || a_status=$?
wait "$race_b_pid" || b_status=$?
race_a_pid=''
race_b_pid=''
if [[ "$a_status" == 0 && "$b_status" == 3 ]]; then
  winner=op-a
  loser_log="$fixture_dir/race-b.log"
elif [[ "$b_status" == 0 && "$a_status" == 3 ]]; then
  winner=op-b
  loser_log="$fixture_dir/race-a.log"
else
  echo "Concurrence invalide : codes psql $a_status/$b_status (attendu 0/3)." >&2
  exit 1
fi
grep -Eq 'PT409: +version_conflict' "$loser_log" || { echo 'Conflit SQLSTATE PT409 absent.' >&2; exit 1; }
assert_final() {
  admin <<'SQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.leo_missions WHERE id='11111111-1111-4111-8111-111111111111'
    AND version=2 AND used_units=1 AND calls=1 AND state='in_progress' AND next_action='fixture')
    THEN RAISE EXCEPTION 'mission/version/budget incorrect'; END IF;
  IF (SELECT count(*) FROM public.leo_operations) <> 1
    THEN RAISE EXCEPTION 'operation count incorrect'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.leo_operations WHERE status='completed'
    AND result->>'mission_version'='2') THEN RAISE EXCEPTION 'operation result missing'; END IF;
END $$;
SQL
}
assert_final
# Replay the winning original request despite stale expected_version and full
# budget. It must return the saved receipt and consume no second unit/call.
replayed="$("${psql_base[@]}" -U authenticated -d postgres -At -v winner="$winner" <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_write_memory('11111111-1111-4111-8111-111111111111',
  :'winner',1,'{"state":"in_progress","next_action":"fixture"}'::jsonb)->>'replayed';
SQL
)"
[[ "$replayed" == true ]] || { echo 'Reçu idempotent absent.' >&2; exit 1; }
assert_final
echo 'PostgreSQL 17 : deux clients authentifiés en attente mesurés ; un succès, un conflit PT409 ; version 2, une opération, un appel, une unité ; reprise sans doublon.'

# Atomic quota: 39 attempts, two independently authenticated concurrent inserts.
admin -f "$repo_root/supabase/migrations/20260929220000_leo_ecritures.sql"
admin -f "$repo_root/supabase/migrations/20260930190000_leo_ecritures_durcissement.sql"
admin -c 'GRANT SELECT ON public.leo_ecritures TO authenticated;'
admin -f "$repo_root/supabase/migrations/20261001070343_leo_ecritures_plafond_atomique.sql"
admin <<'SQL'
INSERT INTO public.leo_ecritures(owner_id,trace_id,outil,quadrant,anneau,phase)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),'proposer_idee','adramelech','vert','tentee'
FROM generate_series(1,39);
SQL
mkfifo "$fixture_dir/quota-holder-input"
admin <"$fixture_dir/quota-holder-input" >"$fixture_dir/quota-holder.log" 2>&1 &
holder_pid=$!
exec 3>"$fixture_dir/quota-holder-input"
printf '%s\n' 'BEGIN;' "SELECT pg_advisory_xact_lock(hashtextextended('leo_ecritures:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',0));" "\\! touch $fixture_dir/quota-locked" >&3
for ((attempt=0; attempt<80; attempt++)); do
  [[ -f "$fixture_dir/quota-locked" ]] && break
  sleep 0.05
done
[[ -f "$fixture_dir/quota-locked" ]] || { echo 'Verrou quota absent.' >&2; exit 1; }
for side in a b; do
  cat >"$fixture_dir/quota-$side.sql" <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
INSERT INTO public.leo_ecritures(trace_id,outil,quadrant,anneau,phase)
VALUES (gen_random_uuid(),'proposer_idee','adramelech','vert','tentee');
SQL
done
"${psql_base[@]}" -U authenticated -d 'dbname=postgres application_name=quota-a' -f "$fixture_dir/quota-a.sql" >"$fixture_dir/quota-a.log" 2>&1 &
race_a_pid=$!
"${psql_base[@]}" -U authenticated -d 'dbname=postgres application_name=quota-b' -f "$fixture_dir/quota-b.sql" >"$fixture_dir/quota-b.log" 2>&1 &
race_b_pid=$!
for ((attempt=0; attempt<80; attempt++)); do
  waiting="$(admin -Atc "SELECT count(*) FROM pg_stat_activity WHERE application_name IN ('quota-a','quota-b') AND wait_event_type='Lock';")"
  [[ "$waiting" == 2 ]] && break
  sleep 0.05
done
[[ "$waiting" == 2 ]] || { echo 'Deux réservations concurrentes non observées.' >&2; exit 1; }
printf '%s\n' 'COMMIT;' '\q' >&3
exec 3>&-
wait "$holder_pid"; holder_pid=''
a_status=0; b_status=0
wait "$race_a_pid" || a_status=$?
wait "$race_b_pid" || b_status=$?
race_a_pid=''; race_b_pid=''
if [[ "$a_status" == 0 && "$b_status" == 3 ]]; then
  loser_log="$fixture_dir/quota-b.log"
elif [[ "$b_status" == 0 && "$a_status" == 3 ]]; then
  loser_log="$fixture_dir/quota-a.log"
else
  echo "Quota concurrent invalide : $a_status/$b_status" >&2; exit 1
fi
rg -q 'PT429:.*leo_write_quota_exhausted' "$loser_log" 2>/dev/null || grep -Eq 'PT429:.*leo_write_quota_exhausted' "$loser_log"
[[ "$(admin -Atc "SELECT count(*) FROM public.leo_ecritures WHERE phase='tentee';")" == 40 ]]
# Closing a completed write remains possible after the quota is exhausted.
"${psql_base[@]}" -U authenticated -d postgres <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
INSERT INTO public.leo_ecritures(trace_id,outil,quadrant,anneau,phase)
SELECT trace_id,outil,quadrant,anneau,'reussie' FROM public.leo_ecritures LIMIT 1;
SQL
[[ "$(admin -Atc "SELECT count(*) FROM public.leo_ecritures WHERE phase='reussie';")" == 1 ]]
echo 'Plafond atomique : deux clients en attente, un succès, un PT429, exactement 40 tentatives ; clôture encore possible.'

# Checkpoint: restore the reviewed live metadata in this DISPOSABLE fixture,
# then exercise the guarded proposal. psql only: no Node executable/image needed.
admin -v snapshot="$(cat "$repo_root/leo/proposals/registre-checkpoint-snapshot.json")" <<'SQL'
SELECT value->>'definition' FROM jsonb_array_elements(:'snapshot'::jsonb->'functions')
\gexec
-- The historical fixture has an older operations SELECT policy. Reproduce the
-- observed policies too, so the metadata guard is genuinely exercised.
SELECT format('DROP POLICY %I ON %I.%I',p->>'policyname',p->>'schemaname',p->>'tablename')
FROM jsonb_array_elements(:'snapshot'::jsonb->'metadata') m,
LATERAL jsonb_array_elements(m->'items') p WHERE m->>'kind'='policies'
\gexec
SELECT format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s USING (%s)',
  p->>'policyname',p->>'schemaname',p->>'tablename',p->>'permissive',p->>'cmd',
  (SELECT string_agg(CASE WHEN r='public' THEN 'PUBLIC' ELSE quote_ident(r) END,',')
   FROM jsonb_array_elements_text(p->'roles') r),p->>'qual')
FROM jsonb_array_elements(:'snapshot'::jsonb->'metadata') m,
LATERAL jsonb_array_elements(m->'items') p WHERE m->>'kind'='policies'
\gexec
SQL
admin -f "$repo_root/leo/proposals/registre-checkpoint.sql"
admin <<'SQL'
INSERT INTO public.leo_missions(id,owner,expires_at,max_units,max_calls)
VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        clock_timestamp()+interval '1 hour',100,100);
SQL
checkpoint_patch() {
  # Only the fixed integer constants below reach this fixture formatter.
  printf '{"checkpoint":{"task_id":"cccccccc-cccc-4ccc-8ccc-cccccccccccc","titre":"Checkpoint fixture","etapes":["Prepare","Verifier"],"confirmes":[],"rappels":%s,"etat":"en_cours","revision":1},"checkpoint_command":{"kind":"%s","expected_task_id":%s}}' "$1" "$2" "$3"
}
cp_adopt="$(checkpoint_patch 0 adopt null)"
cp_one="$(checkpoint_patch 1 update '"cccccccc-cccc-4ccc-8ccc-cccccccccccc"')"
cp_two="$(checkpoint_patch 2 update '"cccccccc-cccc-4ccc-8ccc-cccccccccccc"')"
cp_three="$(checkpoint_patch 3 update '"cccccccc-cccc-4ccc-8ccc-cccccccccccc"')"
"${psql_base[@]}" -U authenticated -d postgres -v patch="$cp_adopt" <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_write_memory('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cp-adopt',1,:'patch'::jsonb);
SQL
mkfifo "$fixture_dir/checkpoint-holder-input"
admin <"$fixture_dir/checkpoint-holder-input" >"$fixture_dir/checkpoint-holder.log" 2>&1 &
holder_pid=$!
exec 3>"$fixture_dir/checkpoint-holder-input"
printf '%s\n' 'BEGIN;' "SELECT id FROM public.leo_missions WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' FOR UPDATE;" "\\! touch $fixture_dir/checkpoint-locked" >&3
for ((attempt=0; attempt<80; attempt++)); do
  [[ -f "$fixture_dir/checkpoint-locked" ]] && break
  sleep 0.05
done
[[ -f "$fixture_dir/checkpoint-locked" ]] || { echo 'Verrou checkpoint initial absent.' >&2; exit 1; }
cat >"$fixture_dir/checkpoint-race.sql" <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_write_memory('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',:'operation',2,:'patch'::jsonb);
SQL
"${psql_base[@]}" -U authenticated -d 'dbname=postgres application_name=checkpoint-a' -v operation=cp-a -v patch="$cp_one" -f "$fixture_dir/checkpoint-race.sql" >"$fixture_dir/checkpoint-a.log" 2>&1 &
race_a_pid=$!
"${psql_base[@]}" -U authenticated -d 'dbname=postgres application_name=checkpoint-b' -v operation=cp-b -v patch="$cp_one" -f "$fixture_dir/checkpoint-race.sql" >"$fixture_dir/checkpoint-b.log" 2>&1 &
race_b_pid=$!
waiting=0
for ((attempt=0; attempt<80; attempt++)); do
  waiting="$(admin -Atc "SELECT count(*) FROM pg_stat_activity WHERE application_name IN ('checkpoint-a','checkpoint-b') AND usename='authenticated' AND wait_event_type='Lock';")"
  [[ "$waiting" == 2 ]] && break
  sleep 0.05
done
[[ "$waiting" == 2 ]] || { echo 'Deux clients checkpoint en attente non observes.' >&2; exit 1; }
printf '%s\n' 'COMMIT;' '\q' >&3
exec 3>&-
wait "$holder_pid"; holder_pid=''
a_status=0; b_status=0
wait "$race_a_pid" || a_status=$?
wait "$race_b_pid" || b_status=$?
race_a_pid=''; race_b_pid=''
if [[ "$a_status" == 0 && "$b_status" == 3 ]]; then
  winner=cp-a; loser_log="$fixture_dir/checkpoint-b.log"
elif [[ "$b_status" == 0 && "$a_status" == 3 ]]; then
  winner=cp-b; loser_log="$fixture_dir/checkpoint-a.log"
else
  echo "Concurrence checkpoint invalide : $a_status/$b_status" >&2; exit 1
fi
grep -Eq 'PT409: +version_conflict' "$loser_log" || { echo 'Conflit checkpoint PT409 absent.' >&2; exit 1; }
assert_checkpoint() {
  local observed
  observed="$(admin -At -v version="$1" -v reminders="$2" -v spent="$3" <<'SQL'
SELECT CASE WHEN EXISTS(SELECT 1 FROM public.leo_missions m
  WHERE m.id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    AND m.version=:'version'::bigint AND m.calls=:'spent'::bigint AND m.used_units=:'spent'::bigint
    AND m.checkpoint->>'rappels'=:'reminders' AND m.checkpoint->>'task_id'='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
    AND (SELECT count(*) FROM public.leo_operations o WHERE o.mission_id=m.id)=:'spent'::bigint
    AND (SELECT count(*) FROM public.leo_operations o WHERE o.mission_id=m.id AND o.status='completed')=:'spent'::bigint)
  THEN 'ok' ELSE 'failed' END;
SQL
)"
  [[ "$observed" == ok ]] || { echo 'Checkpoint/version/budget/operations par mission incorrects.' >&2; exit 1; }
}
assert_checkpoint 3 1 2
cp_replayed="$("${psql_base[@]}" -U authenticated -d postgres -At -v winner="$winner" -v patch="$cp_one" <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_write_memory('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',:'winner',2,:'patch'::jsonb)->>'replayed';
SQL
)"
[[ "$cp_replayed" == true ]] || { echo 'Recu checkpoint gagnant absent.' >&2; exit 1; }
assert_checkpoint 3 1 2
"${psql_base[@]}" -U authenticated -d postgres -v patch="$cp_two" <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_write_memory('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cp-second',3,:'patch'::jsonb);
SQL
assert_checkpoint 4 2 3
third_status=0
"${psql_base[@]}" -U authenticated -d postgres -v patch="$cp_three" >"$fixture_dir/checkpoint-third.log" 2>&1 <<'SQL' || third_status=$?
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_write_memory('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cp-third',4,:'patch'::jsonb);
SQL
[[ "$third_status" == 3 ]] && grep -Eq '22023: +invalid_checkpoint' "$fixture_dir/checkpoint-third.log" || { echo 'Troisieme rappel non refuse par SQL.' >&2; exit 1; }
assert_checkpoint 4 2 3
cp_read="$("${psql_base[@]}" -U authenticated -d postgres -At <<'SQL'
SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT public.leo_status('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')->'mission'->'checkpoint'->>'rappels';
SQL
)"
[[ "$cp_read" == 2 ]] || { echo 'Nouvelle lecture checkpoint ne conserve pas deux rappels.' >&2; exit 1; }
echo 'Checkpoint PostgreSQL 17 : deux clients bloques observes, un succes/un PT409, un seul rappel/version/debit ; recu rejoue sans doublon ; second rappel conserve, troisieme refuse.'

