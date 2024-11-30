#!/usr/bin/env bash
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python3.exe manage.py collectstatic --no-input --clear

# Apply database migrations
python3.exe manage.py makemigrations --verbosity 3
python3.exe manage.py makemigrations app --verbosity 3
python3.exe manage.py makemigrations blog --verbosity 3

python3.exe manage.py migrate --verbosity 3
python3.exe manage.py migrate app --verbosity 3
python3.exe manage.py migrate blog --verbosity 3

# create superuser
python3.exe ./createsuperuser.py

# populate db
#python3.exe ./add_projects.py
