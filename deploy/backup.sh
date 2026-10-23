#!/bin/sh
# Backup of the production database (ezarfeshan-db), taken before a deploy.
#
# Run it on the VM, or from your own computer without copying it there:
#
#   ssh root@<VM> 'sh -s' < deploy/backup.sh                    # dump + verify
#   ssh root@<VM> 'sh -s -- --restore-test' < deploy/backup.sh  # + full restore test
#
# What it does, and refuses to skip:
#   1. pg_dump in custom format (compressed, restorable table by table) into
#      /opt/ezarfeshan/backups on the VM's disk — outside the container and
#      outside the Docker volume, so it survives both.
#   2. Reads the archive back (pg_restore --list) and checks the core tables
#      are in it. A file that cannot be listed is not a backup and is deleted.
#   3. With --restore-test: restores it into a throwaway database in the same
#      server, compares row counts table by table with the live database, then
#      drops the throwaway database.
#   4. Writes a SHA-256 next to it, for checking the off-server copy.
#
# It prints file names, sizes and row counts only — never rows, never the
# password. The file itself holds personal data (leads, subscribers) and the
# admin password hashes: keep the off-server copy encrypted (docs/DEPLOY.md).
set -eu

DB_CONTAINER=${DB_CONTAINER:-ezarfeshan-db}
DB_USER=${DB_USER:-ezarfeshan}
DB_NAME=${DB_NAME:-ezarfeshan}
BACKUP_DIR=${BACKUP_DIR:-/opt/ezarfeshan/backups}
RESTORE_TEST=no
[ "${1:-}" = "--restore-test" ] && RESTORE_TEST=yes

# tables that must be in every dump; their counts are compared on restore
TABLES="leads users articles topics subscribers settings media pages audit_logs _prisma_migrations"

fail() { echo "BACKUP FAILED: $*" >&2; exit 1; }
psql_live() { docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$1" -Atq -c "$2"; }

docker inspect -f '{{.State.Running}}' "$DB_CONTAINER" 2>/dev/null | grep -q true \
  || fail "container $DB_CONTAINER is not running"

umask 077
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

STAMP=$(date -u +%Y%m%d-%H%M%SZ)
FILE="$BACKUP_DIR/$DB_NAME-$STAMP.dump"

echo "== dump"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc --no-owner --no-privileges > "$FILE.partial" \
  || { rm -f "$FILE.partial"; fail "pg_dump exited with an error"; }
[ -s "$FILE.partial" ] || { rm -f "$FILE.partial"; fail "dump is empty"; }

echo "== verify archive"
docker exec -i "$DB_CONTAINER" pg_restore --list < "$FILE.partial" > "$FILE.toc" \
  || { rm -f "$FILE.partial" "$FILE.toc"; fail "archive cannot be read back"; }
for t in $TABLES; do
  grep -q "TABLE DATA public $t " "$FILE.toc" || { rm -f "$FILE.partial" "$FILE.toc"; fail "table $t is missing from the archive"; }
done
mv "$FILE.partial" "$FILE"
rm -f "$FILE.toc"
( cd "$BACKUP_DIR" && sha256sum "$(basename "$FILE")" > "$(basename "$FILE").sha256" )

echo "== row counts (live)"
for t in $TABLES; do
  printf '  %-20s %s\n' "$t" "$(psql_live "$DB_NAME" "SELECT count(*) FROM \"$t\"")"
done
echo "  last migration       $(psql_live "$DB_NAME" "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1")"

if [ "$RESTORE_TEST" = yes ]; then
  CHECK_DB="${DB_NAME}_restore_check"
  echo "== restore test into $CHECK_DB"
  docker exec "$DB_CONTAINER" dropdb -U "$DB_USER" --if-exists "$CHECK_DB"
  docker exec "$DB_CONTAINER" createdb -U "$DB_USER" "$CHECK_DB"
  # the dump carries CREATE EXTENSION pg_trgm; the throwaway database gets it from there
  if ! docker exec -i "$DB_CONTAINER" pg_restore -U "$DB_USER" -d "$CHECK_DB" --no-owner --no-privileges --exit-on-error < "$FILE"; then
    docker exec "$DB_CONTAINER" dropdb -U "$DB_USER" --if-exists "$CHECK_DB"
    fail "restore test failed — the file is kept, but do not deploy until this is understood"
  fi
  MISMATCH=0
  for t in $TABLES; do
    a=$(psql_live "$DB_NAME" "SELECT count(*) FROM \"$t\"")
    b=$(psql_live "$CHECK_DB" "SELECT count(*) FROM \"$t\"")
    if [ "$a" = "$b" ]; then printf '  %-20s %s = %s  ok\n' "$t" "$a" "$b"
    else printf '  %-20s %s ≠ %s  MISMATCH\n' "$t" "$a" "$b"; MISMATCH=1; fi
  done
  docker exec "$DB_CONTAINER" dropdb -U "$DB_USER" "$CHECK_DB"
  [ "$MISMATCH" = 0 ] || fail "restored row counts differ (a write during the dump is the usual cause; run again)"
  echo "  restore test passed; $CHECK_DB dropped"
fi

echo "== result"
ls -l "$FILE" | awk '{print "  file   " $NF "\n  size   " $5 " bytes"}'
echo "  sha256 $(cut -d' ' -f1 "$FILE.sha256")"
echo "  free   $(df -h "$BACKUP_DIR" | awk 'NR==2 {print $4 " left on " $6}')"
echo
echo "Copy it off the server (from your own computer), then check the hash:"
echo "  scp root@<VM>:$FILE root@<VM>:$FILE.sha256 ."
echo "  sha256sum -c $(basename "$FILE").sha256"
