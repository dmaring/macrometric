"""DiaryEntry model for food logging."""
from sqlalchemy import Column, Date, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.models.base import BaseModel


class DiaryEntry(BaseModel):
    """Diary entry model.

    A food logged to a specific date and meal category.
    """

    __tablename__ = "diary_entries"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("meal_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    food_id = Column(
        UUID(as_uuid=True),
        nullable=False,  # References either food_items.id or custom_foods.id
    )
    entry_date = Column(Date, nullable=False, index=True)
    quantity = Column(Numeric(8, 2), nullable=False)

    # Relationships
    user = relationship("User", backref="diary_entries")
    category = relationship("MealCategory", backref="diary_entries")
    # Note: food relationship is dynamically loaded via service layer
    # food = relationship("FoodItem", backref="diary_entries")  # Removed due to flexible reference

    def __repr__(self):
        return f"<DiaryEntry(id={self.id}, date={self.entry_date}, quantity={self.quantity})>"
