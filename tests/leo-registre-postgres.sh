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
