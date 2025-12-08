"""Goals API endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.core.deps import get_db, get_current_user
from src.services.goals import GoalsService
from src.models.user import User

router = APIRouter(prefix="/goals", tags=["Goals"])


# Request/Response schemas
class SetGoalsRequest(BaseModel):
    """Request to set daily goals."""
    calories: Optional[int] = Field(None, ge=500, le=10000, description="Daily calorie target")
    protein_g: Optional[float] = Field(None, ge=0, description="Protein target in grams")
    carbs_g: Optional[float] = Field(None, ge=0, description="Carbs target in grams")
    fat_g: Optional[float] = Field(None, ge=0, description="Fat target in grams")


class GoalsResponse(BaseModel):
    """Daily goals response."""
    calories: Optional[int]
    protein_g: Optional[float]
    carbs_g: Optional[float]
    fat_g: Optional[float]

    class Config:
        from_attributes = True


@router.get(
    "",
    response_model=Optional[GoalsResponse],
    summary="Get daily goals",
)
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's daily macro goals.

    Returns null if no goals are set.
    """
    service = GoalsService(db)
    goal = service.get_goals(current_user.id)

    if not goal:
        return None

    return GoalsResponse(
        calories=goal.calories,
        protein_g=float(goal.protein_g) if goal.protein_g is not None else None,
        carbs_g=float(goal.carbs_g) if goal.carbs_g is not None else None,
        fat_g=float(goal.fat_g) if goal.fat_g is not None else None,
    )


@router.put(
    "",
    response_model=GoalsResponse,
    summary="Set daily goals",
)
def set_goals(
    data: SetGoalsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Set or update daily macro goals.

    If goals already exist, this will update them.
    Setting goals marks onboarding as complete.
    """
    service = GoalsService(db)
    goal = service.set_goals(
        user_id=current_user.id,
        calories=data.calories,
        protein_g=data.protein_g,
        carbs_g=data.carbs_g,
        fat_g=data.fat_g,
    )

    return GoalsResponse(
        calories=goal.calories,
        protein_g=float(goal.protein_g) if goal.protein_g is not None else None,
        carbs_g=float(goal.carbs_g) if goal.carbs_g is not None else None,
        fat_g=float(goal.fat_g) if goal.fat_g is not None else None,
    )


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete daily goals",
)
def delete_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete daily goals."""
    service = GoalsService(db)
    service.delete_goals(current_user.id)


@router.post(
    "/skip-onboarding",
    status_code=status.HTTP_200_OK,
    summary="Skip onboarding",
)
def skip_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Skip goal setting and mark onboarding as complete."""
    service = GoalsService(db)
    service.skip_onboarding(current_user.id)
    return {"message": "Onboarding skipped"}
