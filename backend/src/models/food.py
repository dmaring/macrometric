"""FoodItem model for storing nutritional information."""
from sqlalchemy import Column, String, Integer, Numeric, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from src.models.base import BaseModel


class FoodSource(str, enum.Enum):
    """Source of food data."""
    API = "api"
    CUSTOM = "custom"
    MEAL_COMPONENT = "meal_component"


class FoodItem(BaseModel):
    """Food item model.

    Represents a food from any source (USDA API or custom).
    Stores nutritional information per serving.
    """

    __tablename__ = "food_items"

    external_id = Column(String(50), nullable=True, index=True)  # USDA FDC ID
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(255), nullable=True)
    serving_size = Column(Numeric(8, 2), nullable=False)
    serving_unit = Column(String(20), nullable=False)
    calories = Column(Integer, nullable=False)
    protein_g = Column(Numeric(6, 2), nullable=False)
    carbs_g = Column(Numeric(6, 2), nullable=False)
    fat_g = Column(Numeric(6, 2), nullable=False)
    source = Column(SQLEnum(FoodSource, values_callable=lambda x: [e.value for e in x]), nullable=False, default=FoodSource.CUSTOM)

    # User who created this food (for custom foods)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Relationships
    # diary_entries = relationship("DiaryEntry", back_populates="food")
    # custom_meal_items = relationship("CustomMealItem", back_populates="food")

    def __repr__(self):
        return f"<FoodItem(id={self.id}, name={self.name}, calories={self.calories})>"
