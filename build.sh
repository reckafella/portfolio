#!/usr/bin/env bash
set -o errexit

# Update pip && install dependencies
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Install Node.js and npm if not present
if ! command -v npm &> /dev/null; then
    echo "npm not found, installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

cd frontend/

# Install frontend dependencies
npm install
npm audit fix --force

# Build the frontend with production settings
NODE_ENV=production npm run build

cd ..

# Copy Django static assets to React build directory
echo "Copying Django static assets to React build..."
cp -r app/static/* frontend/build/static/ 2>/dev/null || echo "No Django static assets to copy"

# Ensure proper permissions for the build directory
chmod -R 755 frontend/build/

# Collect static files
python3 manage.py collectstatic --no-input --clear


# Apply database migrations
python3 manage.py makemigrations

python3 manage.py migrate

# create superuser
python3 ./manage.py create_superuser

# create users missing profiles
python ./manage.py create_missing_profiles

# populate db
#python3 ./add_projects.py
