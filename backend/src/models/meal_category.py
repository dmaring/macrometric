"""MealCategory model for organizing diary entries."""
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.models.base import BaseModel


class MealCategory(BaseModel):
    """Meal category model.

    User-customizable meal groupings (e.g., Breakfast, Lunch, Dinner).
    Default categories are created on user registration.
    """

    __tablename__ = "meal_categories"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(50), nullable=False)
    display_order = Column(Integer, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)

    # Relationships
    # user = relationship("User", back_populates="meal_categories")
    # diary_entries = relationship("DiaryEntry", back_populates="category")

    def __repr__(self):
        return f"<MealCategory(id={self.id}, name={self.name}, order={self.display_order})>"
