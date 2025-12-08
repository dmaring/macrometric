"""Macrometric Backend API - FastAPI Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.middleware import ErrorHandlingMiddleware, RequestLoggingMiddleware
from src.api import router as api_router

app = FastAPI(
    title="Macrometric API",
    description="Macro nutrient and calorie tracking API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add custom middleware
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL] if settings.FRONTEND_URL else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Include API routes
app.include_router(api_router, prefix="/api/v1")
