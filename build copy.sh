#!/usr/bin/env bash
set -o errexit

# Update pip && install dependencies
python3 -m pip install -r requirements.txt

# Collect static files
python3 manage.py collectstatic --no-input --clear

# Apply database migrations
python3 manage.py makemigrations authentication
python3 manage.py makemigrations --empty authentication --name transfer_auth_data
python3 manage.py migrate authentication

python3 manage.py makemigrations app
python3 manage.py makemigrations blog

# python3 manage.py migrate
python3 manage.py migrate app
python3 manage.py migrate blog

# create superuser
python3 ./manage.py create_superuser

# create users missing profiles
python ./manage.py create_missing_profiles
