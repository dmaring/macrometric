"""
Custom Foods API endpoints.

Allows users to create, read, update, and delete custom food items.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from src.core.deps import get_db, get_current_user
from src.models.user import User
from src.services.custom_foods import CustomFoodsService


router = APIRouter(prefix='/custom-foods', tags=['custom-foods'])


class CustomFoodCreate(BaseModel):
    """Request body for creating custom food."""

    name: str = Field(..., min_length=1, max_length=255)
    brand: Optional[str] = Field(None, max_length=255)
    serving_size: float = Field(..., gt=0)
    serving_unit: str = Field(..., min_length=1, max_length=50)
    calories: int = Field(..., ge=0)
    protein_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fat_g: float = Field(..., ge=0)


class CustomFoodUpdate(BaseModel):
    """Request body for updating custom food."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    brand: Optional[str] = Field(None, max_length=255)
    serving_size: Optional[float] = Field(None, gt=0)
    serving_unit: Optional[str] = Field(None, min_length=1, max_length=50)
    calories: Optional[int] = Field(None, ge=0)
    protein_g: Optional[float] = Field(None, ge=0)
    carbs_g: Optional[float] = Field(None, ge=0)
    fat_g: Optional[float] = Field(None, ge=0)


class CustomFoodResponse(BaseModel):
    """Custom food response."""

    id: str
    name: str
    brand: Optional[str]
    serving_size: float
    serving_unit: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float

    @staticmethod
    def from_model(custom_food):
        """Convert CustomFood model to response."""
        return CustomFoodResponse(
            id=f"custom:{custom_food.id}",
            name=custom_food.name,
            brand=custom_food.brand,
            serving_size=float(custom_food.serving_size),
            serving_unit=custom_food.serving_unit,
            calories=custom_food.calories,
            protein_g=float(custom_food.protein_g),
            carbs_g=float(custom_food.carbs_g),
            fat_g=float(custom_food.fat_g),
        )


@router.post('', response_model=CustomFoodResponse, status_code=201)
def create_custom_food(
    food_data: CustomFoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new custom food."""
    service = CustomFoodsService(db)

    try:
        custom_food = service.create_custom_food(
            user_id=current_user.id,
            name=food_data.name,
            brand=food_data.brand,
            serving_size=food_data.serving_size,
            serving_unit=food_data.serving_unit,
            calories=food_data.calories,
            protein_g=food_data.protein_g,
            carbs_g=food_data.carbs_g,
            fat_g=food_data.fat_g,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return CustomFoodResponse.from_model(custom_food)


@router.get('', response_model=List[CustomFoodResponse])
def get_custom_foods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all custom foods for the current user."""
    service = CustomFoodsService(db)
    custom_foods = service.get_custom_foods(current_user.id)

    return [CustomFoodResponse.from_model(food) for food in custom_foods]


@router.get('/{food_id}', response_model=CustomFoodResponse)
def get_custom_food(
    food_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific custom food."""
    service = CustomFoodsService(db)
    custom_food = service.get_custom_food(current_user.id, food_id)

    if not custom_food:
        raise HTTPException(status_code=404, detail='Custom food not found')

    return CustomFoodResponse.from_model(custom_food)


@router.put('/{food_id}', response_model=CustomFoodResponse)
def update_custom_food(
    food_id: UUID,
    food_data: CustomFoodUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a custom food."""
    service = CustomFoodsService(db)

    try:
        custom_food = service.update_custom_food(
            user_id=current_user.id,
            food_id=food_id,
            name=food_data.name,
            brand=food_data.brand,
            serving_size=food_data.serving_size,
            serving_unit=food_data.serving_unit,
            calories=food_data.calories,
            protein_g=food_data.protein_g,
            carbs_g=food_data.carbs_g,
            fat_g=food_data.fat_g,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not custom_food:
        raise HTTPException(status_code=404, detail='Custom food not found')

    return CustomFoodResponse.from_model(custom_food)


@router.delete('/{food_id}', status_code=204)
def delete_custom_food(
    food_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a custom food."""
    service = CustomFoodsService(db)
    deleted = service.delete_custom_food(current_user.id, food_id)

    if not deleted:
        raise HTTPException(status_code=404, detail='Custom food not found')
