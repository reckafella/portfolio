#!/usr/bin/env bash
set -o errexit

# Update pip && install dependencies
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Collect static files
python3 manage.py collectstatic --no-input --clear

# Apply database migrations
python3 manage.py makemigrations --verbosity 3
python3 manage.py makemigrations app --verbosity 3
python3 manage.py makemigrations blog --verbosity 3

python3 manage.py migrate --verbosity 3
python3 manage.py migrate app --verbosity 3
python3 manage.py migrate blog --verbosity 3

# create superuser
python3 ./createsuperuser.py

# populate db
#python3 ./add_projects.py

# run autopep8 to fix code style
autopep8 --in-place --aggressive --aggressive --recursive .
