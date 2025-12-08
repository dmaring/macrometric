"""
CustomMeal and CustomMealItem models.

User-created meal presets composed of multiple foods.
"""

from sqlalchemy import Column, String, Boolean, ForeignKey, DECIMAL, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from .base import Base


class CustomMeal(Base):
    """User-created meal preset."""

    __tablename__ = "custom_meals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="custom_meals")
    items = relationship(
        "CustomMealItem",
        back_populates="meal",
        cascade="all, delete-orphan",
        lazy="joined"
    )

    def __repr__(self):
        return f"<CustomMeal(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class CustomMealItem(Base):
    """Junction table for foods in a custom meal."""

    __tablename__ = "custom_meal_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meal_id = Column(UUID(as_uuid=True), ForeignKey("custom_meals.id", ondelete="CASCADE"), nullable=False, index=True)
    food_id = Column(UUID(as_uuid=True), nullable=False)  # References either food_items.id or custom_foods.id
    quantity = Column(DECIMAL(8, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    meal = relationship("CustomMeal", back_populates="items")
    # Note: food relationship is dynamically loaded via service layer
    # food = relationship("FoodItem")  # Removed due to flexible reference

    def __repr__(self):
        return f"<CustomMealItem(id={self.id}, meal_id={self.meal_id}, food_id={self.food_id}, quantity={self.quantity})>"
