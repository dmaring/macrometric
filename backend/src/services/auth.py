"""Authentication service for user registration, login, and token management."""
from typing import Optional, Tuple
import uuid
import re

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.models.user import User
from src.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)


class AuthService:
    """Service for authentication operations."""

    # Password validation regex: at least 8 chars, 1 letter, 1 number
    PASSWORD_PATTERN = re.compile(r'^(?=.*[A-Za-z])(?=.*\d).{8,}$')

    def __init__(self, db: Session):
        self.db = db

    def validate_password(self, password: str) -> bool:
        """Validate password meets requirements.

        Requirements:
        - At least 8 characters
        - At least one letter
        - At least one number
        """
        return bool(self.PASSWORD_PATTERN.match(password))

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email address."""
        return self.db.query(User).filter(User.email == email.lower()).first()

    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Get a user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def register(
        self,
        email: str,
        password: str,
    ) -> Tuple[User, str, str]:
        """Register a new user.

        Args:
            email: User's email address
            password: User's password

        Returns:
            Tuple of (user, access_token, refresh_token)

        Raises:
            HTTPException: If email already exists or password is invalid
        """
        # Normalize email
        email = email.lower().strip()

        # Check if email already exists
        existing_user = self.get_user_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        # Validate password
        if not self.validate_password(password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be at least 8 characters with at least one letter and one number",
            )

        # Create user
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            onboarding_completed=False,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Create default meal categories for the user
        self._create_default_categories(user.id)

        # Generate tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return user, access_token, refresh_token

    def _create_default_categories(self, user_id: uuid.UUID) -> None:
        """Create default meal categories for a new user.

        Default categories: Breakfast, Lunch, Dinner
        """
        # Import here to avoid circular imports
        from src.models.meal_category import MealCategory

        default_categories = [
            ("Breakfast", 1),
            ("Lunch", 2),
            ("Dinner", 3),
        ]

        for name, order in default_categories:
            category = MealCategory(
                user_id=user_id,
                name=name,
                display_order=order,
                is_default=True,
            )
            self.db.add(category)

        self.db.commit()

    def login(
        self,
        email: str,
        password: str,
    ) -> Tuple[User, str, str]:
        """Authenticate a user and return tokens.

        Args:
            email: User's email address
            password: User's password

        Returns:
            Tuple of (user, access_token, refresh_token)

        Raises:
            HTTPException: If credentials are invalid
        """
        # Normalize email
        email = email.lower().strip()

        # Find user
        user = self.get_user_by_email(email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Verify password
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Generate tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return user, access_token, refresh_token

    def refresh_tokens(self, refresh_token: str) -> Tuple[str, str]:
        """Refresh access and refresh tokens.

        Args:
            refresh_token: The current refresh token

        Returns:
            Tuple of (new_access_token, new_refresh_token)

        Raises:
            HTTPException: If refresh token is invalid
        """
        user_id = verify_token(refresh_token, token_type="refresh")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # Verify user still exists
        try:
            user = self.get_user_by_id(uuid.UUID(user_id))
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        # Generate new tokens
        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        return new_access_token, new_refresh_token

    def logout(self, user: User) -> None:
        """Log out a user.

        Currently this is a no-op as we don't track token blacklists.
        In a production system, you might want to:
        - Add tokens to a blacklist (Redis)
        - Invalidate all user sessions
        - Track active refresh tokens in DB
        """
        # For now, logout is handled client-side by removing tokens
        pass
