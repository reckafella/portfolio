#!/usr/bin/env bash
set -o errexit

# Build the frontend
cd frontend/

npm run build

exit 0
