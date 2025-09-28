#!/bin/bash
set -e

echo "🚀 Starting FastAPI + React build process..."

# Check if we're in the correct directory
if [ ! -f "MIGRATION-README.md" ]; then
    echo "❌ Error: Build script must be run from project root"
    exit 1
fi

echo "📦 Building React frontend..."
cd frontend

# Install Node.js dependencies
if [ -f "package.json" ]; then
    npm ci
    npm run build
    echo "✅ Frontend build completed"
else
    echo "⚠️  No package.json found, skipping frontend build"
fi

cd ..

echo "🐍 Installing Python dependencies..."
cd backend

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  No requirements.txt found, skipping backend setup"
fi

cd ..

echo "🎉 Build process completed successfully!"
