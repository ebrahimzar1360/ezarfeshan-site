# Local PostgreSQL control. Uses the extracted EnterpriseDB binaries -- no
# installer, no service, no administrator rights.
#
# ASCII ONLY. PowerShell 5.1 reads a BOM-less script as CP1252, so a UTF-8
# em-dash or curly quote decodes into a stray double quote and the parser fails
# somewhere far from the real line. Keep this file plain ASCII.
#
#   powershell -File tools/db/pg.ps1 init     # one-off: create the cluster + database
#   powershell -File tools/db/pg.ps1 start
#   powershell -File tools/db/pg.ps1 stop
#   powershell -File tools/db/pg.ps1 status
#   powershell -File tools/db/pg.ps1 psql
#
# Port 55432 rather than 5432: nothing else on this machine should collide with
# it, and a stray connection string pointing at a "real" 5432 cannot reach this
# development cluster by accident.

param([Parameter(Position = 0)][string]$Action = 'status')

$PGROOT = "C:\Users\Nadimico.com\pg\pgsql"
$BIN    = "$PGROOT\bin"
$DATA   = "C:\Users\Nadimico.com\pg\data"
$LOG    = "C:\Users\Nadimico.com\pg\pg.log"
$PORT   = 55432
$DBNAME = 'ezarfeshan'
$DBUSER = 'ezarfeshan'
$DBPASS = 'devpassword'

if (-not (Test-Path "$BIN\postgres.exe")) {
  Write-Error "PostgreSQL binaries not found at $BIN"
  exit 1
}

function Invoke-Init {
  if (Test-Path "$DATA\PG_VERSION") {
    Write-Output "cluster already initialised at $DATA"
  } else {
    New-Item -ItemType Directory -Force -Path $DATA | Out-Null
    $pwFile = Join-Path $env:TEMP 'pgpw.txt'
    # -w/--pwfile keeps the password off the command line and out of the process list
    Set-Content -Path $pwFile -Value $DBPASS -Encoding ascii -NoNewline
    & "$BIN\initdb.exe" -D $DATA -U $DBUSER --pwfile=$pwFile -E UTF8 --locale=C 2>&1 |
      Select-String -Pattern 'success|error|FATAL' | ForEach-Object { Write-Output $_.Line }
    Remove-Item $pwFile -Force -ErrorAction SilentlyContinue
  }

  Invoke-Start
  Start-Sleep -Seconds 2

  $exists = & "$BIN\psql.exe" -U $DBUSER -p $PORT -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DBNAME'"
  if ($exists -match '1') {
    Write-Output "database '$DBNAME' already exists"
  } else {
    & "$BIN\createdb.exe" -U $DBUSER -p $PORT $DBNAME
    Write-Output "database '$DBNAME' created"
  }

  # Extensions used by Persian search: pg_trgm for trigram similarity, unaccent
  # to fold diacritics. Postgres has no Persian stemmer, so trigram matching
  # carries the search rather than to_tsvector('persian', ...).
  & "$BIN\psql.exe" -U $DBUSER -p $PORT -d $DBNAME -c "CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS unaccent;" | Out-Null
  Write-Output "extensions: pg_trgm, unaccent"
  Write-Output ""
  Write-Output "DATABASE_URL=`"postgresql://${DBUSER}:${DBPASS}@localhost:${PORT}/${DBNAME}?schema=public`""
}

function Invoke-Start {
  & "$BIN\pg_isready.exe" -p $PORT -q
  if ($LASTEXITCODE -eq 0) { Write-Output "already running on port $PORT"; return }

  # Start-Process with -W (no wait), not "pg_ctl -w" called directly.
  # pg_ctl leaves the postmaster holding its inherited stdout, so piping or
  # capturing that command blocks until the database shuts down, which looks
  # exactly like a hung start. Readiness is polled below instead.
  # No -Wait, and the streams go to files. The postmaster keeps whatever stdout
  # it inherits open for its whole life, so any form of waiting on this process
  # -- a pipe, a capture, -Wait -- hangs until the database shuts down.
  # Readiness is decided by the poll below instead.
  $pgArgs = @('-D', $DATA, '-l', $LOG, '-o', "-p $PORT", '-W', 'start')
  Start-Process -FilePath "$BIN\pg_ctl.exe" -ArgumentList $pgArgs -NoNewWindow `
    -RedirectStandardOutput "$env:TEMP\pgctl-out.log" -RedirectStandardError "$env:TEMP\pgctl-err.log"

  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 400
    & "$BIN\pg_isready.exe" -p $PORT -q
    if ($LASTEXITCODE -eq 0) { Write-Output "started on port $PORT"; return }
  }
  Write-Output "did not come up -- see $LOG"
}

function Invoke-Stop {
  if (-not (Test-Path "$DATA\postmaster.pid")) { Write-Output "not running"; return }
  & "$BIN\pg_ctl.exe" -D $DATA -m fast -w stop
}

function Invoke-Status {
  & "$BIN\pg_isready.exe" -p $PORT
}

switch ($Action.ToLower()) {
  'init'   { Invoke-Init }
  'start'  { Invoke-Start }
  'stop'   { Invoke-Stop }
  'status' { Invoke-Status }
  'psql'   { & "$BIN\psql.exe" -U $DBUSER -p $PORT -d $DBNAME }
  default  { Write-Output "usage: pg.ps1 [init|start|stop|status|psql]" }
}
