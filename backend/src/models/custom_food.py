"""
Custom Food model.

User-created food items for tracking homemade recipes and local foods.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.models.base import Base
import uuid


class CustomFood(Base):
    """
    User-created custom food item.

    Allows users to save foods not found in external databases.
    """

    __tablename__ = "custom_foods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=True)
    serving_size = Column(DECIMAL(8, 2), nullable=False)
    serving_unit = Column(String(50), nullable=False)
    calories = Column(Integer, nullable=False)
    protein_g = Column(DECIMAL(6, 2), nullable=False)
    carbs_g = Column(DECIMAL(6, 2), nullable=False)
    fat_g = Column(DECIMAL(6, 2), nullable=False)

    # Relationships
    user = relationship("User", back_populates="custom_foods")

    def __repr__(self):
        return f"<CustomFood(id={self.id}, name='{self.name}', user_id={self.user_id})>"
