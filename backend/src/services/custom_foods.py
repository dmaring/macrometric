"""
Custom Foods service for managing user-created food items.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from src.models.custom_food import CustomFood


class CustomFoodsService:
    """Service for managing custom food items."""

    def __init__(self, db: Session):
        self.db = db

    def create_custom_food(
        self,
        user_id: UUID,
        name: str,
        serving_size: float,
        serving_unit: str,
        calories: int,
        protein_g: float,
        carbs_g: float,
        fat_g: float,
        brand: Optional[str] = None,
    ) -> CustomFood:
        """
        Create a new custom food for a user.

        Args:
            user_id: User's UUID
            name: Food name
            serving_size: Serving size amount
            serving_unit: Serving unit (g, oz, cup, etc.)
            calories: Calories per serving
            protein_g: Protein in grams per serving
            carbs_g: Carbohydrates in grams per serving
            fat_g: Fat in grams per serving
            brand: Optional brand name

        Returns:
            Created CustomFood instance
        """
        # Validate inputs
        if not name or len(name.strip()) == 0:
            raise ValueError("Food name is required")

        if serving_size <= 0:
            raise ValueError("Serving size must be positive")

        if not serving_unit or len(serving_unit.strip()) == 0:
            raise ValueError("Serving unit is required")

        if calories < 0:
            raise ValueError("Calories cannot be negative")

        if protein_g < 0 or carbs_g < 0 or fat_g < 0:
            raise ValueError("Macros cannot be negative")

        custom_food = CustomFood(
            user_id=user_id,
            name=name.strip(),
            brand=brand.strip() if brand else None,
            serving_size=serving_size,
            serving_unit=serving_unit.strip(),
            calories=calories,
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
        )

        self.db.add(custom_food)
        self.db.commit()
        self.db.refresh(custom_food)

        return custom_food

    def get_custom_foods(self, user_id: UUID) -> List[CustomFood]:
        """
        Get all custom foods for a user.

        Args:
            user_id: User's UUID

        Returns:
            List of CustomFood instances
        """
        return (
            self.db.query(CustomFood)
            .filter(CustomFood.user_id == user_id)
            .order_by(CustomFood.name)
            .all()
        )

    def get_custom_food(self, user_id: UUID, food_id: UUID) -> Optional[CustomFood]:
        """
        Get a specific custom food for a user.

        Args:
            user_id: User's UUID
            food_id: Food's UUID

        Returns:
            CustomFood instance or None
        """
        return (
            self.db.query(CustomFood)
            .filter(CustomFood.id == food_id, CustomFood.user_id == user_id)
            .first()
        )

    def update_custom_food(
        self,
        user_id: UUID,
        food_id: UUID,
        name: Optional[str] = None,
        brand: Optional[str] = None,
        serving_size: Optional[float] = None,
        serving_unit: Optional[str] = None,
        calories: Optional[int] = None,
        protein_g: Optional[float] = None,
        carbs_g: Optional[float] = None,
        fat_g: Optional[float] = None,
    ) -> Optional[CustomFood]:
        """
        Update a custom food.

        Args:
            user_id: User's UUID
            food_id: Food's UUID
            (other params): Fields to update

        Returns:
            Updated CustomFood instance or None if not found
        """
        custom_food = self.get_custom_food(user_id, food_id)

        if not custom_food:
            return None

        # Update fields
        if name is not None:
            if len(name.strip()) == 0:
                raise ValueError("Food name cannot be empty")
            custom_food.name = name.strip()

        if brand is not None:
            custom_food.brand = brand.strip() if brand else None

        if serving_size is not None:
            if serving_size <= 0:
                raise ValueError("Serving size must be positive")
            custom_food.serving_size = serving_size

        if serving_unit is not None:
            if len(serving_unit.strip()) == 0:
                raise ValueError("Serving unit cannot be empty")
            custom_food.serving_unit = serving_unit.strip()

        if calories is not None:
            if calories < 0:
                raise ValueError("Calories cannot be negative")
            custom_food.calories = calories

        if protein_g is not None:
            if protein_g < 0:
                raise ValueError("Protein cannot be negative")
            custom_food.protein_g = protein_g

        if carbs_g is not None:
            if carbs_g < 0:
                raise ValueError("Carbs cannot be negative")
            custom_food.carbs_g = carbs_g

        if fat_g is not None:
            if fat_g < 0:
                raise ValueError("Fat cannot be negative")
            custom_food.fat_g = fat_g

        self.db.commit()
        self.db.refresh(custom_food)

        return custom_food

    def delete_custom_food(self, user_id: UUID, food_id: UUID) -> bool:
        """
        Delete a custom food.

        Args:
            user_id: User's UUID
            food_id: Food's UUID

        Returns:
            True if deleted, False if not found
        """
        custom_food = self.get_custom_food(user_id, food_id)

        if not custom_food:
            return False

        self.db.delete(custom_food)
        self.db.commit()

        return True

    def search_custom_foods(self, user_id: UUID, query: str) -> List[CustomFood]:
        """
        Search user's custom foods by name.

        Args:
            user_id: User's UUID
            query: Search term

        Returns:
            List of matching CustomFood instances
        """
        if not query or len(query.strip()) == 0:
            return []

        search_term = f"%{query.strip().lower()}%"

        return (
            self.db.query(CustomFood)
            .filter(
                CustomFood.user_id == user_id,
                CustomFood.name.ilike(search_term),
            )
            .order_by(CustomFood.name)
            .all()
        )
