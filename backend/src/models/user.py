"""User model for authentication and profile data."""
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship

from src.models.base import BaseModel


class User(BaseModel):
    """User account model.

    Stores user credentials and profile information.
    Related to DailyGoal, MealCategory, CustomFood, CustomMeal, and DiaryEntry.
    """

    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    onboarding_completed = Column(Boolean, default=False, nullable=False)

    # Relationships
    daily_goal = relationship("DailyGoal", back_populates="user", uselist=False, cascade="all, delete-orphan")
    custom_foods = relationship("CustomFood", back_populates="user", cascade="all, delete-orphan")
    custom_meals = relationship("CustomMeal", back_populates="user", cascade="all, delete-orphan")
    # meal_categories = relationship("MealCategory", back_populates="user")
    # diary_entries = relationship("DiaryEntry", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
