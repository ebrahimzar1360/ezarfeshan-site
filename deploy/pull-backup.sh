#!/bin/sh
# Pre-deploy backup, run from your own computer (Git Bash on Windows, or any
# Linux/macOS shell). One command does the whole procedure in docs/DEPLOY.md:
#
#   sh deploy/pull-backup.sh                       # root@188.121.125.13, ~/ezarfeshan-backups
#   sh deploy/pull-backup.sh root@<VM> <folder>
#
#   1. runs deploy/backup.sh on the server with --restore-test (dump outside the
#      container, archive check, restore into a throwaway database, row counts
#      compared — the live database is only read)
#   2. copies the dump and its SHA-256 here with scp and checks the hash
#   3. encrypts it with GnuPG (AES-256; gpg asks for the passphrase — it is
#      never on the command line or in a file) and checks the encrypted copy
#      decrypts back to the same hash
#   4. deletes the unencrypted copy on this computer
#
# It prints the file name, size, hash check and restore result only. Needs ssh,
# scp, sha256sum and gpg — all four come with Git for Windows.
set -eu

HOST=${1:-root@188.121.125.13}
DEST=${2:-$HOME/ezarfeshan-backups}
SSH=${SSH:-ssh}
SCP=${SCP:-scp}
HERE=$(cd "$(dirname "$0")" && pwd)

for tool in sha256sum gpg; do
  command -v "$tool" >/dev/null 2>&1 || { echo "missing: $tool" >&2; exit 1; }
done

umask 077
mkdir -p "$DEST"
LOG="$DEST/backup-$(date -u +%Y%m%d-%H%M%SZ).log"

echo "== 1/4 backup on $HOST (with restore test)"
# CRs stripped: a checkout on Windows may have turned the script's line ends into CRLF
if ! tr -d '\r' < "$HERE/backup.sh" | $SSH "$HOST" 'sh -s -- --restore-test' > "$LOG" 2>&1; then
  cat "$LOG" >&2
  echo "the backup on the server failed — nothing was copied; see $LOG" >&2
  exit 1
fi
grep -q 'restore test passed' "$LOG" || { cat "$LOG" >&2; echo "no restore-test confirmation in the output" >&2; exit 1; }
REMOTE=$(sed -n 's/^  file   //p' "$LOG")
[ -n "$REMOTE" ] || { echo "could not read the file name from the server output; see $LOG" >&2; exit 1; }
NAME=$(basename "$REMOTE")

echo "== 2/4 copy and check"
$SCP "$HOST:$REMOTE" "$HOST:$REMOTE.sha256" "$DEST/"
( cd "$DEST" && sha256sum -c "$NAME.sha256" ) > "$DEST/$NAME.check" 2>&1 \
  || { cat "$DEST/$NAME.check" >&2; echo "hash check FAILED — do not use this copy" >&2; exit 1; }
SIZE=$(wc -c < "$DEST/$NAME" | tr -d ' ')

echo "== 3/4 encrypt (gpg asks for a passphrase; keep it in your password manager)"
if [ -n "${GPG_PASSPHRASE_FILE:-}" ]; then
  # for automated tests only; in normal use gpg prompts
  GPG_OPTS="--batch --pinentry-mode loopback --passphrase-file $GPG_PASSPHRASE_FILE"
else
  GPG_OPTS=""
fi
gpg $GPG_OPTS --quiet --yes --symmetric --cipher-algo AES256 --output "$DEST/$NAME.gpg" "$DEST/$NAME"
WANT=$(cut -d' ' -f1 "$DEST/$NAME.sha256")
GOT=$(gpg $GPG_OPTS --quiet --decrypt "$DEST/$NAME.gpg" | sha256sum | cut -d' ' -f1)
[ "$WANT" = "$GOT" ] || { echo "the encrypted copy does not decrypt to the same file — unencrypted copy kept at $DEST/$NAME" >&2; exit 1; }

echo "== 4/4 remove the unencrypted copy"
rm -f "$DEST/$NAME" "$DEST/$NAME.check"

echo
echo "  file          $NAME"
echo "  size          $SIZE bytes"
echo "  sha256 check  OK"
echo "  restore test  passed ($(grep -c ' ok$' "$LOG") tables, row counts equal)"
echo "  kept here     $DEST/$NAME.gpg (+ .sha256, server log $(basename "$LOG"))"
echo "  on server     $REMOTE"
