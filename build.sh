#!/usr/bin/env bash
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input --clear

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# create superuser
./create_superuser.py