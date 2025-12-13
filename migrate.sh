#!/bin/bash

DB_NAME="zona-atletismo-webapp-db"

LOCATION=$1
# location must be either local or remote
if [[ "$LOCATION" != "local" && "$LOCATION" != "remote" ]]; then
  echo "Error: First argument must be either local or remote"
  echo "Usage: ./migrate.sh local|remote drizzle/your_file.sql"
  exit 1
fi

FILE_PATH=$2

if [[ -z "$FILE_PATH" ]]; then
  echo "Error: No file path provided."
  echo "Usage: ./migrate.sh local|remote drizzle/your_file.sql"
  exit 1
fi

if [[ ! "$FILE_PATH" =~ ^drizzle/ ]]; then
  echo "Error: File path must start with 'drizzle/'"
  exit 1
fi

MIGRATION_LOG="migrated.$LOCATION.txt"
if [ -f "$MIGRATION_LOG" ]; then
  if grep -Fxq "$FILE_PATH" "$MIGRATION_LOG"; then
    echo "Migration $FILE_PATH already applied to $LOCATION."
    exit 0
  fi
fi

# npx wrangler d1 execute $DB_NAME $LOCATION --file=./drizzle/file.sql
if npx wrangler d1 execute $DB_NAME --$LOCATION --file=./$FILE_PATH; then
  echo "Migration executed successfully on $LOCATION database."

  echo "$FILE_PATH" >> $MIGRATION_LOG
  echo "Logged migration to $MIGRATION_LOG"
else
  echo "Error: Migration failed."
  exit 1
fi
