"""
Food search API endpoints.

Provides endpoints for searching and retrieving food nutrition data.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from src.core.deps import get_db, get_current_user
from src.core.config import settings
from src.models.user import User
from src.services.food_search import FoodSearchService


router = APIRouter(prefix='/foods', tags=['foods'])


class FoodResponse(BaseModel):
    """Food item response."""

    id: str
    name: str
    source: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    serving_size: float
    serving_unit: str


class FoodSearchResponse(BaseModel):
    """Food search results response."""

    results: List[FoodResponse]


@router.get('/search', response_model=FoodSearchResponse)
def search_foods(
    q: str = Query(..., min_length=1, description='Search query'),
    limit: int = Query(10, ge=1, le=50, description='Maximum results'),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Search for foods across all sources.

    Returns foods from USDA database and custom foods.
    """
    service = FoodSearchService(db, usda_api_key=settings.USDA_API_KEY)
    results = service.search(q, user_id=current_user.id, limit=limit)

    return FoodSearchResponse(
        results=[FoodResponse(**result.to_dict()) for result in results]
    )


@router.get('/{food_id}', response_model=FoodResponse)
def get_food_details(
    food_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get detailed information for a specific food.

    Food ID format: "source:id" (e.g., "usda:171688")
    """
    service = FoodSearchService(db, usda_api_key=settings.USDA_API_KEY)
    food = service.get_food(food_id, user_id=current_user.id)

    if not food:
        raise HTTPException(status_code=404, detail='Food not found')

    return FoodResponse(**food.to_dict())
