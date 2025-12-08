"""Goals service for managing daily macro targets."""
from decimal import Decimal
from typing import Optional, Dict
import uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.models.daily_goal import DailyGoal
from src.models.user import User


class GoalsService:
    """Service for daily goal operations."""

    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def validate_calories(calories: Optional[int]) -> bool:
        """Validate calorie target is in acceptable range."""
        if calories is None:
            return True
        return 500 <= calories <= 10000

    @staticmethod
    def validate_macro(value: Optional[float]) -> bool:
        """Validate macro value is non-negative."""
        if value is None:
            return True
        return value >= 0

    def get_goals(self, user_id: uuid.UUID) -> Optional[DailyGoal]:
        """Get user's daily goals.

        Returns:
            DailyGoal if exists, None otherwise
        """
        return (
            self.db.query(DailyGoal)
            .filter(DailyGoal.user_id == user_id)
            .first()
        )

    def set_goals(
        self,
        user_id: uuid.UUID,
        calories: Optional[int] = None,
        protein_g: Optional[float] = None,
        carbs_g: Optional[float] = None,
        fat_g: Optional[float] = None,
    ) -> DailyGoal:
        """Set or update user's daily goals.

        Creates a new goal record if one doesn't exist, otherwise updates.
        """
        # Validate inputs
        if not self.validate_calories(calories):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Calories must be between 500 and 10,000",
            )

        for value, name in [
            (protein_g, "Protein"),
            (carbs_g, "Carbs"),
            (fat_g, "Fat"),
        ]:
            if not self.validate_macro(value):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"{name} cannot be negative",
                )

        # Get existing goal or create new
        goal = self.get_goals(user_id)

        if goal:
            # Update existing
            if calories is not None:
                goal.calories = calories
            if protein_g is not None:
                goal.protein_g = Decimal(str(protein_g))
            if carbs_g is not None:
                goal.carbs_g = Decimal(str(carbs_g))
            if fat_g is not None:
                goal.fat_g = Decimal(str(fat_g))
        else:
            # Create new
            goal = DailyGoal(
                user_id=user_id,
                calories=calories,
                protein_g=Decimal(str(protein_g)) if protein_g is not None else None,
                carbs_g=Decimal(str(carbs_g)) if carbs_g is not None else None,
                fat_g=Decimal(str(fat_g)) if fat_g is not None else None,
            )
            self.db.add(goal)

        # Mark user's onboarding as complete
        user = self.db.query(User).filter(User.id == user_id).first()
        if user and not user.onboarding_completed:
            user.onboarding_completed = True

        self.db.commit()
        self.db.refresh(goal)

        return goal

    def delete_goals(self, user_id: uuid.UUID) -> None:
        """Delete user's daily goals."""
        goal = self.get_goals(user_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goals not found",
            )

        self.db.delete(goal)
        self.db.commit()

    def skip_onboarding(self, user_id: uuid.UUID) -> None:
        """Mark onboarding as complete without setting goals."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.onboarding_completed = True
        self.db.commit()
