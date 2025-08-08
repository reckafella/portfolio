#!/bin/bash

# Activate virtual environment
source .env/bin/activate

# Install flake8 and autopep8 if not installed
pip install flake8 autopep8 isort

echo "Running flake8 to identify issues..."
flake8 --statistics --count

echo "Auto-fixing some issues with autopep8..."
find . -name "*.py" -not -path "./migrations/*" -not -path "./.env/*" -not -path "./static/*" | xargs autopep8 --in-place --aggressive --aggressive

echo "Fixing import order with isort..."
find . -name "*.py" -not -path "./migrations/*" -not -path "./.env/*" -not -path "./static/*" | xargs isort

echo "Running flake8 again to check remaining issues..."
flake8 --statistics --count
