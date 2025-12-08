"""Users API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.deps import get_db, get_current_user
from src.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user account and all data",
)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete the current user's account and all associated data.

    This will cascade delete:
    - All diary entries
    - All custom foods
    - All custom meals
    - All meal categories
    - Daily goals

    This action cannot be undone.
    """
    try:
        # SQLAlchemy will handle cascade deletes if configured correctly in models
        db.delete(current_user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )
