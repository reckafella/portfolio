#!/usr/bin/env bash
set -o errexit

# Install dependencies
pip install -r requirements.txt #--break-system-packages

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
#./createsuperuser.py

# populate db
#./add_projects.py
