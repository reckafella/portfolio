from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os
import json

from forms.projects import return_project_form_schema
from forms.contact import (
    ContactRequest, return_contact_form_schema, return_contact_form
)

# Initialize FastAPI app
app = FastAPI(
    title="Portfolio API",
    description="FastAPI backend for personal portfolio",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Portfolio API is running"}


@app.get("/api/forms/contact")
async def get_contact_form_schema():
    """Get contact form schema/configuration"""
    return await return_contact_form_schema()


@app.get("/api/forms/project")
async def get_project_form_schema():
    """Get project form schema/configuration"""
    return await return_project_form_schema()


@app.get("/api/projects")
async def get_projects():
    """Get all projects"""
    # Placeholder for actual project retrieval logic
    project_path = os.path.join(os.path.dirname(__file__), "data", "projects.json")
    try:
        with open(project_path) as f:
            projects = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load projects data" + str(e))

    return {
        "projects": projects
    }


@app.post("/api/contact")
async def contact_form(contact_data: ContactRequest):
    """Handle contact form submission"""
    return await return_contact_form(contact_data)


# Serve React static files in production
frontend_build_dir = Path(__file__).parent.parent / "frontend" / "build"

if frontend_build_dir.exists():
    # Mount static files
    app.mount("/static", StaticFiles(directory=str(frontend_build_dir / "assets")), name="assets")

    # Serve React app for all non-API routes
    @app.get("/{path:path}")
    async def serve_react_app(path: str = ""):
        """Serve React application"""
        # Check if it's an API route
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")

        # Serve index.html for all other routes (React Router)
        index_file = frontend_build_dir / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        else:
            raise HTTPException(status_code=404, detail="Frontend not built")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
