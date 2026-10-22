#!/bin/sh
# Prepares the database and static files, then starts the given command (gunicorn).
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput --verbosity 0

exec "$@"
