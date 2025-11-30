#!/bin/bash

DB_NAME="zona-atletismo-webapp-db"

# npx wrangler d1 execute $DB_NAME $LOCATION --file=./drizzle/
npx wrangler d1 execute $DB_NAME $LOCATION --file=./drizzle/0000_yellow_moira_mactaggert.sql
npx wrangler d1 execute $DB_NAME $LOCATION --file=./drizzle/0001_nebulous_sentinel.sql
