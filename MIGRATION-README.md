# Portfolio - FastAPI + React Migration

This branch contains the migration from Django to FastAPI (backend) + React (frontend).

## 🏗️ **Architecture Overview**

```
portfolio/
├── backend/          # FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── main.py
├── frontend/         # React frontend  
│   ├── src/
│   ├── public/
│   └── package.json
├── [django-code]/    # Original Django implementation (preserved)
└── docs/            # Migration documentation
```

## 🚀 **Technology Stack**

### **Backend (FastAPI)**
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **Alembic**: Database migrations
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **Cloudinary**: Image/media storage

### **Frontend (React)**
- **React 18**: UI framework with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **React Query**: Server state management
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

## 🔄 **Migration Strategy**

1. **Phase 1**: FastAPI backend with core APIs
2. **Phase 2**: React frontend with basic components
3. **Phase 3**: Feature parity with Django version
4. **Phase 4**: Enhanced features and optimizations

## 📊 **Feature Mapping**

| Django Feature | FastAPI Equivalent | Status |
|----------------|-------------------|---------|
| Django Models | SQLAlchemy Models | 🔄 Planning |
| Django Views | FastAPI Routes | 🔄 Planning |
| Django Templates | React Components | 🔄 Planning |
| Django Forms | React Forms + Validation | 🔄 Planning |
| Authentication | JWT + FastAPI Security | 🔄 Planning |
| File Upload | FastAPI + Cloudinary | 🔄 Planning |

## 🌐 **Deployment Options**

### **Option 1: Monorepo Deployment (Recommended)**
- Single Render service with both frontend and backend
- FastAPI serves React build files
- Simpler deployment and domain management

### **Option 2: Separate Services**
- Backend API on one Render service
- Frontend SPA on another Render service
- CORS configuration required

## 🛠️ **Development Setup**

### **Backend Development**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### **Frontend Development**
```bash
cd frontend
npm install
npm run dev
```

## 📝 **Migration Notes**

- Original Django code preserved for reference
- Database schema will be recreated using Alembic
- Authentication system redesigned with JWT
- File upload system migrated to FastAPI + Cloudinary
- Frontend rebuilt with modern React patterns

## 🚀 **Deployment Strategy**

Using Render.com with monorepo approach for cost efficiency and simplicity.
