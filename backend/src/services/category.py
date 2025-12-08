"""Category management service."""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.models.meal_category import MealCategory
from src.models.diary import DiaryEntry


class CategoryService:
    """Service for managing meal categories."""

    def __init__(self, db: Session):
        self.db = db

    def get_categories(self, user_id: UUID) -> List[MealCategory]:
        """Get all categories for a user, ordered by display_order."""
        return (
            self.db.query(MealCategory)
            .filter(MealCategory.user_id == user_id)
            .order_by(MealCategory.display_order)
            .all()
        )

    def get_category(self, user_id: UUID, category_id: UUID) -> Optional[MealCategory]:
        """Get a specific category belonging to a user."""
        return (
            self.db.query(MealCategory)
            .filter(
                MealCategory.id == category_id,
                MealCategory.user_id == user_id
            )
            .first()
        )

    def create_category(
        self,
        user_id: UUID,
        name: str,
        display_order: Optional[int] = None
    ) -> MealCategory:
        """Create a new meal category.

        Args:
            user_id: User ID
            name: Category name
            display_order: Optional display order. If not provided, places at end.

        Returns:
            Created category

        Raises:
            HTTPException: If category name already exists for user
        """
        # Check for duplicate name (case-sensitive)
        existing = (
            self.db.query(MealCategory)
            .filter(
                MealCategory.user_id == user_id,
                MealCategory.name == name
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category '{name}' already exists"
            )

        # Determine display order
        if display_order is None:
            # Get highest current order
            max_order = (
                self.db.query(MealCategory.display_order)
                .filter(MealCategory.user_id == user_id)
                .order_by(MealCategory.display_order.desc())
                .first()
            )
            display_order = (max_order[0] + 1) if max_order else 1

        # Create category
        category = MealCategory(
            user_id=user_id,
            name=name,
            display_order=display_order,
            is_default=False
        )

        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        return category

    def update_category(
        self,
        user_id: UUID,
        category_id: UUID,
        name: Optional[str] = None,
        display_order: Optional[int] = None
    ) -> Optional[MealCategory]:
        """Update a category.

        Args:
            user_id: User ID
            category_id: Category ID
            name: Optional new name
            display_order: Optional new display order

        Returns:
            Updated category or None if not found

        Raises:
            HTTPException: If new name conflicts with existing category
        """
        category = self.get_category(user_id, category_id)
        if not category:
            return None

        # Check for name conflict if name is being changed
        if name is not None and name != category.name:
            existing = (
                self.db.query(MealCategory)
                .filter(
                    MealCategory.user_id == user_id,
                    MealCategory.name == name,
                    MealCategory.id != category_id
                )
                .first()
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Category '{name}' already exists"
                )
            category.name = name

        if display_order is not None:
            category.display_order = display_order

        self.db.commit()
        self.db.refresh(category)

        return category

    def delete_category(self, user_id: UUID, category_id: UUID) -> bool:
        """Delete a category.

        Args:
            user_id: User ID
            category_id: Category ID

        Returns:
            True if deleted, False if not found

        Raises:
            HTTPException: If category has entries or is default
        """
        category = self.get_category(user_id, category_id)
        if not category:
            return False

        # Check for diary entries first (more specific error)
        entry_count = (
            self.db.query(DiaryEntry)
            .filter(DiaryEntry.category_id == category_id)
            .count()
        )

        if entry_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category has {entry_count} diary entries. Please move or delete them first."
            )

        # Cannot delete default categories (checked after entries for better UX)
        if category.is_default:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete default category"
            )

        self.db.delete(category)
        self.db.commit()

        return True

    def reorder_categories(self, user_id: UUID, category_ids: List[UUID]) -> None:
        """Reorder categories based on provided list.

        Args:
            user_id: User ID
            category_ids: List of category IDs in desired order

        Raises:
            HTTPException: If validation fails
        """
        # Get all user's categories
        user_categories = self.get_categories(user_id)
        user_category_ids = {cat.id for cat in user_categories}

        # Validate: must include all and only user's categories
        provided_ids = set(category_ids)

        if provided_ids != user_category_ids:
            missing = user_category_ids - provided_ids
            extra = provided_ids - user_category_ids

            error_parts = []
            if missing:
                error_parts.append(f"Missing categories: {len(missing)}")
            if extra:
                error_parts.append(f"Invalid categories: {len(extra)}")

            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid category list. {', '.join(error_parts)}"
            )

        # Check for duplicates
        if len(category_ids) != len(provided_ids):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Duplicate category IDs in reorder list"
            )

        # Update display orders
        category_map = {cat.id: cat for cat in user_categories}

        for index, category_id in enumerate(category_ids, start=1):
            category = category_map[category_id]
            category.display_order = index

        self.db.commit()
