#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f ".env" ]; then
  echo "Arquivo .env não encontrado na raiz do projeto."
  exit 1
fi

ORIGINAL_URL=$(grep -E '^DATABASE_URL=' .env | head -n1 | sed 's/^DATABASE_URL=//')

if [ -z "$ORIGINAL_URL" ]; then
  echo "DATABASE_URL não encontrada no .env."
  exit 1
fi

BACKUP_URL=$(printf "%s" "$ORIGINAL_URL" | sed 's/?pgbouncer=true&/?/; s/&pgbouncer=true//')

mkdir -p backups

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="backups/bussola_backup_${TIMESTAMP}.sql"

echo "Gerando backup em ${FILENAME}..."
pg_dump "$BACKUP_URL" > "$FILENAME"
echo "Backup concluído com sucesso."

