#!/usr/bin/env bash
set -o errexit

# Install dependencies
pip install -r requirements.txt #--break-system-packages

# Collect static files
python3 manage.py collectstatic --no-input --clear

# Apply database migrations
python3 manage.py makemigrations
python3 manage.py migrate

# create superuser
#./createsuperuser.py

# populate db
#./add_projects.py
