"""Categories API endpoints."""
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.core.deps import get_db, get_current_user
from src.models.user import User
from src.services.category import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


class CategoryResponse(BaseModel):
    """Category response."""
    id: str
    name: str
    display_order: int
    is_default: bool


class CategoryInput(BaseModel):
    """Category input for create/update."""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    display_order: Optional[int] = Field(None, ge=1)


class ReorderRequest(BaseModel):
    """Request to reorder categories."""
    category_ids: List[uuid.UUID] = Field(..., min_items=1)


@router.get(
    "",
    response_model=List[CategoryResponse],
    summary="Get user's meal categories",
)
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all meal categories for the current user, sorted by display order."""
    service = CategoryService(db)
    categories = service.get_categories(current_user.id)

    return [
        CategoryResponse(
            id=str(cat.id),
            name=cat.name,
            display_order=cat.display_order,
            is_default=cat.is_default,
        )
        for cat in categories
    ]


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a meal category",
)
def create_category(
    data: CategoryInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new meal category."""
    if not data.name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Name is required"
        )

    service = CategoryService(db)
    category = service.create_category(
        user_id=current_user.id,
        name=data.name.strip(),
        display_order=data.display_order
    )

    return CategoryResponse(
        id=str(category.id),
        name=category.name,
        display_order=category.display_order,
        is_default=category.is_default,
    )


@router.put(
    "/reorder",
    status_code=status.HTTP_200_OK,
    summary="Reorder meal categories",
)
def reorder_categories(
    data: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reorder meal categories for drag-and-drop functionality."""
    service = CategoryService(db)
    service.reorder_categories(current_user.id, data.category_ids)

    return {"message": "Categories reordered successfully"}


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Update a meal category",
)
def update_category(
    category_id: uuid.UUID,
    data: CategoryInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing meal category."""
    service = CategoryService(db)

    # Prepare update data
    name = data.name.strip() if data.name else None

    category = service.update_category(
        user_id=current_user.id,
        category_id=category_id,
        name=name,
        display_order=data.display_order
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return CategoryResponse(
        id=str(category.id),
        name=category.name,
        display_order=category.display_order,
        is_default=category.is_default,
    )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a meal category",
)
def delete_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a meal category."""
    service = CategoryService(db)
    deleted = service.delete_category(current_user.id, category_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
