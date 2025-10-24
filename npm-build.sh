#!/usr/bin/env bash
set -o errexit

# Build the frontend
cd frontend/

NODE_ENV=production npm run build

cd ..

# Ensure proper permissions for the build directory
chmod -R 755 frontend/build/
python3 manage.py collectstatic --no-input --clear

exit 0
