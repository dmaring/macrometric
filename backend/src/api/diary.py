"""Diary API endpoints."""
from datetime import date
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.core.deps import get_db, get_current_user
from src.services.diary import DiaryService
from src.services.custom_meal import CustomMealService
from src.models.user import User

router = APIRouter(prefix="/diary", tags=["Diary"])


# Request/Response schemas
class InlineFoodInput(BaseModel):
    """Food data for inline creation."""
    name: str = Field(..., min_length=1, max_length=255)
    brand: Optional[str] = None
    serving_size: float = Field(..., gt=0)
    serving_unit: str = Field(..., min_length=1, max_length=50)
    calories: int = Field(..., ge=0)
    protein_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fat_g: float = Field(..., ge=0)


class AddEntryRequest(BaseModel):
    """Request to add a diary entry."""
    category_id: uuid.UUID
    food_id: Optional[uuid.UUID] = None
    food: Optional[InlineFoodInput] = None
    quantity: float = Field(..., gt=0, description="Number of servings (must be positive)")


class UpdateEntryRequest(BaseModel):
    """Request to update a diary entry."""
    quantity: Optional[float] = Field(None, gt=0, description="Number of servings")
    category_id: Optional[uuid.UUID] = None


class FoodResponse(BaseModel):
    """Food data in response."""
    id: str
    name: str
    brand: Optional[str]
    serving_size: float
    serving_unit: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float


class EntryResponse(BaseModel):
    """Diary entry response."""
    id: str
    food: FoodResponse
    quantity: float


class CategoryResponse(BaseModel):
    """Category with entries response."""
    id: str
    name: str
    display_order: int
    is_default: bool
    entries: list[EntryResponse]


class TotalsResponse(BaseModel):
    """Daily macro totals."""
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float


class DiaryResponse(BaseModel):
    """Full diary response for a date."""
    date: str
    categories: list[CategoryResponse]
    totals: TotalsResponse
    goals: Optional[TotalsResponse]


def _get_food_response(entry, service: DiaryService) -> FoodResponse:
    """Helper to get food response from diary entry."""
    food = service._get_food(entry.food_id)
    if not food:
        # Return placeholder for deleted food
        return FoodResponse(
            id=str(entry.food_id),
            name="[Deleted Food]",
            brand=None,
            serving_size=0.0,
            serving_unit="",
            calories=0,
            protein_g=0.0,
            carbs_g=0.0,
            fat_g=0.0,
        )

    return FoodResponse(
        id=str(food.id),
        name=food.name,
        brand=food.brand if hasattr(food, 'brand') else None,
        serving_size=float(food.serving_size),
        serving_unit=food.serving_unit,
        calories=food.calories,
        protein_g=float(food.protein_g),
        carbs_g=float(food.carbs_g),
        fat_g=float(food.fat_g),
    )


@router.get(
    "/{diary_date}",
    response_model=DiaryResponse,
    summary="Get diary for a date",
)
def get_diary(
    diary_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all diary entries for a specific date, grouped by meal category."""
    service = DiaryService(db)
    return service.get_diary(current_user.id, diary_date)


@router.post(
    "/{diary_date}/entries",
    response_model=EntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a diary entry",
)
def add_entry(
    diary_date: date,
    data: AddEntryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new food entry to the diary for a specific date and category.

    Either food_id (for existing food) or food (for inline creation) must be provided.
    """
    if not data.food_id and not data.food:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either food_id or food must be provided",
        )

    service = DiaryService(db)

    # If inline food provided, create it first
    food_id = data.food_id
    if data.food:
        food = service.create_inline_food(
            user_id=current_user.id,
            name=data.food.name,
            brand=data.food.brand,
            serving_size=data.food.serving_size,
            serving_unit=data.food.serving_unit,
            calories=data.food.calories,
            protein_g=data.food.protein_g,
            carbs_g=data.food.carbs_g,
            fat_g=data.food.fat_g,
        )
        food_id = food.id

    entry = service.add_entry(
        user_id=current_user.id,
        entry_date=diary_date,
        category_id=data.category_id,
        food_id=food_id,
        quantity=data.quantity,
    )

    return EntryResponse(
        id=str(entry.id),
        food=_get_food_response(entry, service),
        quantity=float(entry.quantity),
    )


@router.put(
    "/entries/{entry_id}",
    response_model=EntryResponse,
    summary="Update a diary entry",
)
def update_entry(
    entry_id: uuid.UUID,
    data: UpdateEntryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing diary entry (quantity or category)."""
    service = DiaryService(db)
    entry = service.update_entry(
        user_id=current_user.id,
        entry_id=entry_id,
        quantity=data.quantity,
        category_id=data.category_id,
    )

    return EntryResponse(
        id=str(entry.id),
        food=_get_food_response(entry, service),
        quantity=float(entry.quantity),
    )


@router.delete(
    "/entries/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a diary entry",
)
def delete_entry(
    entry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a diary entry."""
    service = DiaryService(db)
    service.delete_entry(current_user.id, entry_id)


class AddMealRequest(BaseModel):
    """Request to add a custom meal to diary."""
    meal_id: uuid.UUID
    category_id: uuid.UUID


class AddMealResponse(BaseModel):
    """Response after adding a meal to diary."""
    entries_added: int
    entries: list[EntryResponse]


@router.post(
    "/{diary_date}/add-meal",
    response_model=list[EntryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add a custom meal to diary",
)
def add_meal_to_diary(
    diary_date: date,
    data: AddMealRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add all foods from a custom meal to the diary for a specific date and category.

    This creates a diary entry for each food item in the meal.
    """
    # Get the meal
    meal_service = CustomMealService(db)
    custom_meal = meal_service.get_custom_meal(current_user.id, data.meal_id)

    if not custom_meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom meal not found",
        )

    # Add each food item from the meal to the diary
    diary_service = DiaryService(db)
    entries = []

    for meal_item in custom_meal.items:
        entry = diary_service.add_entry(
            user_id=current_user.id,
            entry_date=diary_date,
            category_id=data.category_id,
            food_id=meal_item.food_id,
            quantity=float(meal_item.quantity),
        )

        entries.append(
            EntryResponse(
                id=str(entry.id),
                food=_get_food_response(entry, diary_service),
                quantity=float(entry.quantity),
            )
        )

    return entries
