"""Diary service for managing food entries."""
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional, List, Dict
from collections import defaultdict
import uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.models.diary import DiaryEntry
from src.models.food import FoodItem, FoodSource
from src.models.custom_food import CustomFood
from src.models.meal_category import MealCategory
from src.models.user import User
from src.models.daily_goal import DailyGoal


class DiaryService:
    """Service for diary operations."""

    def __init__(self, db: Session):
        self.db = db

    def _get_food(self, food_id: uuid.UUID):
        """
        Get food from either CustomFood or FoodItem table.

        Args:
            food_id: Food UUID

        Returns:
            Food object (CustomFood or FoodItem)
        """
        # Try CustomFood first
        custom_food = self.db.query(CustomFood).filter(CustomFood.id == food_id).first()
        if custom_food:
            return custom_food

        # Try FoodItem
        food_item = self.db.query(FoodItem).filter(FoodItem.id == food_id).first()
        return food_item

    def _get_entry_response_dict(self, entry) -> Dict:
        """Build entry response dictionary with food data loaded dynamically."""
        food = self._get_food(entry.food_id)
        if not food:
            # Return placeholder for deleted food
            return {
                "id": str(entry.id),
                "food": {
                    "id": str(entry.food_id),
                    "name": "[Deleted Food]",
                    "brand": None,
                    "serving_size": 0.0,
                    "serving_unit": "",
                    "calories": 0,
                    "protein_g": 0.0,
                    "carbs_g": 0.0,
                    "fat_g": 0.0,
                },
                "quantity": float(entry.quantity),
            }

        return {
            "id": str(entry.id),
            "food": {
                "id": str(food.id),
                "name": food.name,
                "brand": food.brand if hasattr(food, 'brand') else None,
                "serving_size": float(food.serving_size),
                "serving_unit": food.serving_unit,
                "calories": food.calories,
                "protein_g": float(food.protein_g),
                "carbs_g": float(food.carbs_g),
                "fat_g": float(food.fat_g),
            },
            "quantity": float(entry.quantity),
        }

    @staticmethod
    def validate_quantity(quantity: float) -> bool:
        """Validate that quantity is positive."""
        return quantity > 0

    @staticmethod
    def validate_entry_date(entry_date: date) -> bool:
        """Validate that date is not more than 1 year in future."""
        max_future_date = date.today() + timedelta(days=365)
        return entry_date <= max_future_date

    @staticmethod
    def calculate_entry_macros(food: FoodItem, quantity: float) -> Dict:
        """Calculate macros for an entry based on quantity."""
        return {
            "calories": int(food.calories * quantity),
            "protein_g": Decimal(str(food.protein_g)) * Decimal(str(quantity)),
            "carbs_g": Decimal(str(food.carbs_g)) * Decimal(str(quantity)),
            "fat_g": Decimal(str(food.fat_g)) * Decimal(str(quantity)),
        }

    def calculate_daily_totals(self, entries: List[DiaryEntry]) -> Dict:
        """Calculate total macros from a list of entries."""
        totals = {
            "calories": 0,
            "protein_g": Decimal("0"),
            "carbs_g": Decimal("0"),
            "fat_g": Decimal("0"),
        }

        for entry in entries:
            food = self._get_food(entry.food_id)
            if not food:
                continue  # Skip deleted foods

            quantity = float(entry.quantity)
            totals["calories"] += int(food.calories * quantity)
            totals["protein_g"] += Decimal(str(food.protein_g)) * Decimal(str(quantity))
            totals["carbs_g"] += Decimal(str(food.carbs_g)) * Decimal(str(quantity))
            totals["fat_g"] += Decimal(str(food.fat_g)) * Decimal(str(quantity))

        return totals

    @staticmethod
    def group_entries_by_category(entries: List[DiaryEntry]) -> Dict[uuid.UUID, List[DiaryEntry]]:
        """Group entries by their category ID."""
        grouped = defaultdict(list)
        for entry in entries:
            grouped[entry.category_id].append(entry)
        return dict(grouped)

    def get_diary(self, user_id: uuid.UUID, diary_date: date) -> Dict:
        """Get diary data for a specific date.

        Returns categories with their entries and daily totals.
        """
        # Get user's categories
        categories = (
            self.db.query(MealCategory)
            .filter(MealCategory.user_id == user_id)
            .order_by(MealCategory.display_order)
            .all()
        )

        # Get entries for the date
        entries = (
            self.db.query(DiaryEntry)
            .filter(
                DiaryEntry.user_id == user_id,
                DiaryEntry.entry_date == diary_date,
            )
            .all()
        )

        # Group entries by category
        entries_by_category = self.group_entries_by_category(entries)

        # Build response
        category_data = []
        for category in categories:
            cat_entries = entries_by_category.get(category.id, [])
            category_data.append({
                "id": str(category.id),
                "name": category.name,
                "display_order": category.display_order,
                "is_default": category.is_default,
                "entries": [
                    self._get_entry_response_dict(entry)
                    for entry in cat_entries
                ],
            })

        # Calculate totals
        totals = self.calculate_daily_totals(entries)

        # Get user's goals if they exist
        goal = self.db.query(DailyGoal).filter(DailyGoal.user_id == user_id).first()
        goals_data = None
        if goal:
            goals_data = {
                "calories": goal.calories,
                "protein_g": float(goal.protein_g) if goal.protein_g is not None else None,
                "carbs_g": float(goal.carbs_g) if goal.carbs_g is not None else None,
                "fat_g": float(goal.fat_g) if goal.fat_g is not None else None,
            }

        return {
            "date": diary_date.isoformat(),
            "categories": category_data,
            "totals": {
                "calories": totals["calories"],
                "protein_g": float(totals["protein_g"]),
                "carbs_g": float(totals["carbs_g"]),
                "fat_g": float(totals["fat_g"]),
            },
            "goals": goals_data,
        }

    def add_entry(
        self,
        user_id: uuid.UUID,
        entry_date: date,
        category_id: uuid.UUID,
        food_id: uuid.UUID,
        quantity: float,
    ) -> DiaryEntry:
        """Add a new diary entry."""
        # Validate quantity
        if not self.validate_quantity(quantity):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Quantity must be positive",
            )

        # Validate date
        if not self.validate_entry_date(entry_date):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Entry date cannot be more than 1 year in the future",
            )

        # Verify category belongs to user
        category = (
            self.db.query(MealCategory)
            .filter(
                MealCategory.id == category_id,
                MealCategory.user_id == user_id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

        # Verify food exists (check both CustomFood and FoodItem)
        food = self._get_food(food_id)
        if not food:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food not found",
            )

        # Create entry
        entry = DiaryEntry(
            user_id=user_id,
            category_id=category_id,
            food_id=food_id,
            entry_date=entry_date,
            quantity=Decimal(str(quantity)),
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)

        return entry

    def update_entry(
        self,
        user_id: uuid.UUID,
        entry_id: uuid.UUID,
        quantity: Optional[float] = None,
        category_id: Optional[uuid.UUID] = None,
    ) -> DiaryEntry:
        """Update an existing diary entry."""
        # Get entry
        entry = (
            self.db.query(DiaryEntry)
            .filter(
                DiaryEntry.id == entry_id,
                DiaryEntry.user_id == user_id,
            )
            .first()
        )
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entry not found",
            )

        # Update fields
        if quantity is not None:
            if not self.validate_quantity(quantity):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Quantity must be positive",
                )
            entry.quantity = Decimal(str(quantity))

        if category_id is not None:
            # Verify category belongs to user
            category = (
                self.db.query(MealCategory)
                .filter(
                    MealCategory.id == category_id,
                    MealCategory.user_id == user_id,
                )
                .first()
            )
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found",
                )
            entry.category_id = category_id

        self.db.commit()
        self.db.refresh(entry)

        return entry

    def delete_entry(self, user_id: uuid.UUID, entry_id: uuid.UUID) -> None:
        """Delete a diary entry."""
        entry = (
            self.db.query(DiaryEntry)
            .filter(
                DiaryEntry.id == entry_id,
                DiaryEntry.user_id == user_id,
            )
            .first()
        )
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entry not found",
            )

        self.db.delete(entry)
        self.db.commit()

    def create_inline_food(
        self,
        user_id: uuid.UUID,
        name: str,
        brand: Optional[str],
        serving_size: float,
        serving_unit: str,
        calories: int,
        protein_g: float,
        carbs_g: float,
        fat_g: float,
    ) -> FoodItem:
        """Create a food item inline for quick manual entry.

        Used when adding entries without food search (temporary until US2).
        """
        food = FoodItem(
            name=name,
            brand=brand,
            serving_size=Decimal(str(serving_size)),
            serving_unit=serving_unit,
            calories=calories,
            protein_g=Decimal(str(protein_g)),
            carbs_g=Decimal(str(carbs_g)),
            fat_g=Decimal(str(fat_g)),
            source=FoodSource.CUSTOM,
            created_by_user_id=user_id,
        )
        self.db.add(food)
        self.db.commit()
        self.db.refresh(food)

        return food
