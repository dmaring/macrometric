"""
Custom Meals API endpoints.

Allows users to create, read, update, and delete custom meal presets.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from src.core.deps import get_db, get_current_user
from src.models.user import User
from src.services.custom_meal import CustomMealService


router = APIRouter(prefix='/meals', tags=['meals'])


class MealItemCreate(BaseModel):
    """Food item in a meal."""

    food_id: UUID
    quantity: float = Field(..., gt=0)


class CustomMealCreate(BaseModel):
    """Request body for creating custom meal."""

    name: str = Field(..., min_length=1, max_length=100)
    items: List[MealItemCreate] = Field(..., min_items=1)


class CustomMealUpdate(BaseModel):
    """Request body for updating custom meal."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    items: Optional[List[MealItemCreate]] = Field(None, min_items=1)


class MealItemResponse(BaseModel):
    """Meal item response."""

    food_id: str
    food_name: str
    quantity: float
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    is_deleted: bool = False


class CustomMealResponse(BaseModel):
    """Custom meal response."""

    id: str
    name: str
    items: List[MealItemResponse]
    totals: dict
    created_at: str

    @staticmethod
    def from_model(custom_meal, service: CustomMealService):
        """Convert CustomMeal model to response."""
        # Get nutritional totals
        totals = service.get_meal_totals(custom_meal)

        # Convert items
        items_response = []
        for item in custom_meal.items:
            food = service._get_food(item.food_id)
            if not food:
                # Food was deleted, mark as deleted
                items_response.append(
                    MealItemResponse(
                        food_id=str(item.food_id),
                        food_name="[Deleted Food]",
                        quantity=float(item.quantity),
                        calories=0,
                        protein_g=0.0,
                        carbs_g=0.0,
                        fat_g=0.0,
                        is_deleted=True,
                    )
                )
                continue

            quantity = float(item.quantity)

            items_response.append(
                MealItemResponse(
                    food_id=str(food.id),
                    food_name=food.name,
                    quantity=quantity,
                    calories=int(food.calories * quantity),
                    protein_g=float(food.protein_g) * quantity,
                    carbs_g=float(food.carbs_g) * quantity,
                    fat_g=float(food.fat_g) * quantity,
                    is_deleted=False,
                )
            )

        # Get created_at from model if available, otherwise use current time
        created_at = getattr(custom_meal, 'created_at', None)
        if created_at:
            created_at_str = created_at.isoformat()
        else:
            from datetime import datetime
            created_at_str = datetime.utcnow().isoformat()

        return CustomMealResponse(
            id=str(custom_meal.id),
            name=custom_meal.name,
            items=items_response,
            totals={
                "calories": int(totals["calories"]),
                "protein_g": round(totals["protein_g"], 2),
                "carbs_g": round(totals["carbs_g"], 2),
                "fat_g": round(totals["fat_g"], 2),
            },
            created_at=created_at_str,
        )


@router.post('', response_model=CustomMealResponse, status_code=201)
def create_custom_meal(
    meal_data: CustomMealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new custom meal."""
    service = CustomMealService(db)

    try:
        # Convert Pydantic models to dictionaries
        items = [{"food_id": item.food_id, "quantity": item.quantity} for item in meal_data.items]

        custom_meal = service.create_custom_meal(
            user_id=current_user.id,
            name=meal_data.name,
            items=items,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return CustomMealResponse.from_model(custom_meal, service)


@router.get('', response_model=List[CustomMealResponse])
def get_custom_meals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all custom meals for the current user."""
    service = CustomMealService(db)
    custom_meals = service.get_custom_meals(current_user.id)

    return [CustomMealResponse.from_model(meal, service) for meal in custom_meals]


@router.get('/{meal_id}', response_model=CustomMealResponse)
def get_custom_meal(
    meal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific custom meal."""
    service = CustomMealService(db)
    custom_meal = service.get_custom_meal(current_user.id, meal_id)

    if not custom_meal:
        raise HTTPException(status_code=404, detail='Custom meal not found')

    return CustomMealResponse.from_model(custom_meal, service)


@router.put('/{meal_id}', response_model=CustomMealResponse)
def update_custom_meal(
    meal_id: UUID,
    meal_data: CustomMealUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a custom meal."""
    service = CustomMealService(db)

    try:
        # Convert Pydantic models to dictionaries if items are provided
        items = None
        if meal_data.items is not None:
            items = [{"food_id": item.food_id, "quantity": item.quantity} for item in meal_data.items]

        custom_meal = service.update_custom_meal(
            user_id=current_user.id,
            meal_id=meal_id,
            name=meal_data.name,
            items=items,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not custom_meal:
        raise HTTPException(status_code=404, detail='Custom meal not found')

    return CustomMealResponse.from_model(custom_meal, service)


@router.delete('/{meal_id}', status_code=204)
def delete_custom_meal(
    meal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a custom meal (soft delete)."""
    service = CustomMealService(db)
    deleted = service.delete_custom_meal(current_user.id, meal_id)

    if not deleted:
        raise HTTPException(status_code=404, detail='Custom meal not found')
