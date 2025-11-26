from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from core.config import settings
from core.database import engine, Base
from app import customers, infrastructure, services, settings as app_settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    yield
    # Shutdown: Cleanup if needed
    print("Application shutting down...")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="REST API for Internet Management System",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Internet Management API",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.app_name}

# Include routers
app.include_router(customers.router)
app.include_router(infrastructure.router)
app.include_router(services.router)
app.include_router(app_settings.router)

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
