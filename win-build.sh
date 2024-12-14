#!/usr/bin/env bash
set -o errexit

# Update pip && install dependencies
python3.exe -m pip install --upgrade pip
python3.exe -m pip install -r requirements.txt

# Collect static files
python3.exe manage.py collectstatic --no-input --clear

# Apply database migrations
python3.exe manage.py makemigrations
python3.exe manage.py makemigrations app
python3.exe manage.py makemigrations blog

python3.exe manage.py migrate
python3.exe manage.py migrate app
python3.exe manage.py migrate blog

# create superuser
python3.exe ./createsuperuser.py

# populate db
#python3 ./add_projects.py
