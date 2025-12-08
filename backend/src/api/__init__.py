"""API routes package."""
from fastapi import APIRouter

from src.api.auth import router as auth_router
from src.api.diary import router as diary_router
from src.api.categories import router as categories_router
from src.api.goals import router as goals_router
from src.api.foods import router as foods_router
from src.api.custom_foods import router as custom_foods_router
from src.api.meals import router as meals_router

# Main API router that aggregates all endpoint routers
router = APIRouter()

# Include all routes
router.include_router(auth_router)
router.include_router(diary_router)
router.include_router(categories_router)
router.include_router(goals_router)
router.include_router(foods_router)
router.include_router(custom_foods_router)
router.include_router(meals_router)
