#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Build frontend
cd frontend/
npm install
NODE_ENV=production npm run build
cd ..

# Collect static files (they'll need to be served from external storage on Vercel)
python3 manage.py collectstatic --no-input --clear

# Note: Database migrations should be run separately, not during build
# You'll need to run migrations manually or via a separate script
