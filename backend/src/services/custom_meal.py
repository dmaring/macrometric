"""
Custom Meals service for managing user-created meal presets.
"""
from typing import List, Optional, Dict
from uuid import UUID
from sqlalchemy.orm import Session
from src.models.custom_meal import CustomMeal, CustomMealItem
from src.models.food import FoodItem
from src.models.custom_food import CustomFood


class CustomMealService:
    """Service for managing custom meal presets."""

    def __init__(self, db: Session):
        self.db = db

    def _validate_food_exists(self, food_id: UUID, user_id: UUID) -> bool:
        """
        Check if a food exists in either CustomFood or FoodItem tables.

        Args:
            food_id: Food UUID
            user_id: User UUID (for custom food ownership check)

        Returns:
            True if food exists and user has access, False otherwise
        """
        # Check CustomFood table (user-specific)
        custom_food = self.db.query(CustomFood).filter(
            CustomFood.id == food_id,
            CustomFood.user_id == user_id
        ).first()

        if custom_food:
            return True

        # Check FoodItem table (global foods from API)
        food_item = self.db.query(FoodItem).filter(FoodItem.id == food_id).first()

        return food_item is not None

    def create_custom_meal(
        self,
        user_id: UUID,
        name: str,
        items: List[Dict[str, any]],  # List of {food_id: UUID, quantity: float}
    ) -> CustomMeal:
        """
        Create a new custom meal for a user.

        Args:
            user_id: User's UUID
            name: Meal name
            items: List of dictionaries with food_id and quantity

        Returns:
            Created CustomMeal instance

        Raises:
            ValueError: If validation fails
        """
        # Validate inputs
        if not name or len(name.strip()) == 0:
            raise ValueError("Meal name is required")

        if len(name.strip()) > 100:
            raise ValueError("Meal name must be 100 characters or less")

        if not items or len(items) == 0:
            raise ValueError("Meal must contain at least one food item")

        # Validate all food items exist
        for item in items:
            if not self._validate_food_exists(item["food_id"], user_id):
                raise ValueError("One or more food items not found")

        # Create the meal
        custom_meal = CustomMeal(
            user_id=user_id,
            name=name.strip(),
            is_deleted=False,
        )

        self.db.add(custom_meal)
        self.db.flush()  # Get the meal ID before adding items

        # Add meal items
        for item in items:
            if item["quantity"] <= 0:
                raise ValueError("Quantity must be positive")

            meal_item = CustomMealItem(
                meal_id=custom_meal.id,
                food_id=item["food_id"],
                quantity=item["quantity"],
            )
            self.db.add(meal_item)

        self.db.commit()
        self.db.refresh(custom_meal)

        return custom_meal

    def get_custom_meals(self, user_id: UUID, include_deleted: bool = False) -> List[CustomMeal]:
        """
        Get all custom meals for a user.

        Args:
            user_id: User's UUID
            include_deleted: Whether to include soft-deleted meals

        Returns:
            List of CustomMeal instances
        """
        query = self.db.query(CustomMeal).filter(CustomMeal.user_id == user_id)

        if not include_deleted:
            query = query.filter(CustomMeal.is_deleted == False)

        return query.order_by(CustomMeal.name).all()

    def get_custom_meal(self, user_id: UUID, meal_id: UUID) -> Optional[CustomMeal]:
        """
        Get a specific custom meal for a user.

        Args:
            user_id: User's UUID
            meal_id: Meal's UUID

        Returns:
            CustomMeal instance or None
        """
        return (
            self.db.query(CustomMeal)
            .filter(
                CustomMeal.id == meal_id,
                CustomMeal.user_id == user_id,
                CustomMeal.is_deleted == False,
            )
            .first()
        )

    def update_custom_meal(
        self,
        user_id: UUID,
        meal_id: UUID,
        name: Optional[str] = None,
        items: Optional[List[Dict[str, any]]] = None,
    ) -> Optional[CustomMeal]:
        """
        Update a custom meal.

        Args:
            user_id: User's UUID
            meal_id: Meal's UUID
            name: New meal name (optional)
            items: New list of items to replace existing ones (optional)

        Returns:
            Updated CustomMeal instance or None if not found

        Raises:
            ValueError: If validation fails
        """
        custom_meal = self.get_custom_meal(user_id, meal_id)

        if not custom_meal:
            return None

        # Update name if provided
        if name is not None:
            if len(name.strip()) == 0:
                raise ValueError("Meal name cannot be empty")
            if len(name.strip()) > 100:
                raise ValueError("Meal name must be 100 characters or less")
            custom_meal.name = name.strip()

        # Update items if provided
        if items is not None:
            if len(items) == 0:
                raise ValueError("Meal must contain at least one food item")

            # Validate all food items exist
            for item in items:
                if not self._validate_food_exists(item["food_id"], user_id):
                    raise ValueError("One or more food items not found")

            # Delete existing items
            self.db.query(CustomMealItem).filter(
                CustomMealItem.meal_id == meal_id
            ).delete()

            # Add new items
            for item in items:
                if item["quantity"] <= 0:
                    raise ValueError("Quantity must be positive")

                meal_item = CustomMealItem(
                    meal_id=custom_meal.id,
                    food_id=item["food_id"],
                    quantity=item["quantity"],
                )
                self.db.add(meal_item)

        self.db.commit()
        self.db.refresh(custom_meal)

        return custom_meal

    def delete_custom_meal(self, user_id: UUID, meal_id: UUID) -> bool:
        """
        Soft delete a custom meal.

        Args:
            user_id: User's UUID
            meal_id: Meal's UUID

        Returns:
            True if deleted, False if not found
        """
        custom_meal = self.get_custom_meal(user_id, meal_id)

        if not custom_meal:
            return False

        custom_meal.is_deleted = True
        self.db.commit()

        return True

    def _get_food(self, food_id: UUID):
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

    def get_meal_totals(self, meal: CustomMeal) -> Dict[str, float]:
        """
        Calculate the nutritional totals for a meal.

        Args:
            meal: CustomMeal instance

        Returns:
            Dictionary with calories, protein_g, carbs_g, fat_g totals
        """
        totals = {
            "calories": 0,
            "protein_g": 0.0,
            "carbs_g": 0.0,
            "fat_g": 0.0,
        }

        for item in meal.items:
            food = self._get_food(item.food_id)
            if not food:
                continue  # Skip if food no longer exists

            quantity = float(item.quantity)

            totals["calories"] += food.calories * quantity
            totals["protein_g"] += float(food.protein_g) * quantity
            totals["carbs_g"] += float(food.carbs_g) * quantity
            totals["fat_g"] += float(food.fat_g) * quantity

        return totals
