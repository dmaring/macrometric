"""DailyGoal model for user's daily macro targets."""
from decimal import Decimal
from typing import Optional
import uuid

from sqlalchemy import Column, Integer, DECIMAL, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.models.base import Base


class DailyGoal(Base):
    """User's daily macro and calorie goals.

    One goal set per user. All fields are optional to allow
    users to track only the metrics they care about.
    """
    __tablename__ = "daily_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # One goal per user
    )

    # Optional macro targets
    calories = Column(Integer, nullable=True)
    protein_g = Column(DECIMAL(6, 2), nullable=True)
    carbs_g = Column(DECIMAL(6, 2), nullable=True)
    fat_g = Column(DECIMAL(6, 2), nullable=True)

    # Relationship
    user = relationship("User", back_populates="daily_goal")

    def __repr__(self):
        return f"<DailyGoal(user_id={self.user_id}, calories={self.calories})>"
