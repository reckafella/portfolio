# FastAPI + React Monorepo Deployment on Render

## 🏗️ **Monorepo Structure for Render**

```
portfolio/
├── backend/
│   ├── app/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── build/          # React production build
│   └── package.json
├── render.yaml         # Render configuration
└── build.sh           # Build script
```

## ⚙️ **Render Configuration (render.yaml)**

```yaml
services:
  - type: web
    name: portfolio-fullstack
    env: python
    buildCommand: "./build.sh"
    startCommand: "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: NODE_VERSION  
        value: 18
```

## 📜 **Build Script (build.sh)**

```bash
#!/bin/bash
set -e

echo "Building React frontend..."
cd frontend
npm ci
npm run build

echo "Installing Python dependencies..."
cd ../backend
pip install -r requirements.txt

echo "Build completed successfully!"
```

## 🔧 **FastAPI Static File Serving**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# API routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Serve React static files
app.mount("/static", StaticFiles(directory="../frontend/build/static"), name="static")

# Serve React app for all non-API routes
@app.get("/{path:path}")
async def serve_react_app(path: str):
    return FileResponse("../frontend/build/index.html")
```

## 💰 **Cost Benefits**
- **Single Service**: $7/month instead of $14/month
- **Shared Resources**: Database and Redis shared
- **Simple Domain**: One domain for entire application

## 🚀 **Deployment Workflow**
1. Push to GitHub
2. Render auto-builds both frontend and backend
3. FastAPI serves React build files
4. Single URL for entire application
