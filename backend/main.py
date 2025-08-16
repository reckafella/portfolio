from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

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

@app.get("/api/projects")
async def get_projects():
    """Get all projects"""
    # TODO: Implement database queries
    return {
        "projects": [
            {
                "id": 1,
                "title": "Sample Project",
                "description": "This is a sample project",
                "technologies": ["Python", "FastAPI", "React"]
            }
        ]
    }

@app.post("/api/contact")
async def contact_form(name: str, email: str, message: str):
    """Handle contact form submission"""
    # TODO: Implement contact form logic
    return {"status": "success", "message": "Message sent successfully"}

# Serve React static files in production
frontend_build_dir = Path(__file__).parent.parent / "frontend" / "build"

if frontend_build_dir.exists():
    # Mount static files
    app.mount("/static", StaticFiles(directory=str(frontend_build_dir / "static")), name="static")
    
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
