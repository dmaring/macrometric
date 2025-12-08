"""FastAPI dependencies for authentication and database access."""
from typing import Generator, Optional
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from src.core.database import SessionLocal
from src.core.security import verify_token
from src.models.user import User

# HTTP Bearer token security scheme
bearer_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    """Database session dependency.

    Yields a database session that is automatically closed
    after the request is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_optional(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[User]:
    """Get current user if authenticated, None otherwise.

    Use this for endpoints that work with or without authentication.
    """
    if credentials is None:
        return None

    user_id = verify_token(credentials.credentials, token_type="access")
    if user_id is None:
        return None

    try:
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        return user
    except (ValueError, TypeError):
        return None


def get_current_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> User:
    """Get current authenticated user.

    Raises 401 Unauthorized if not authenticated or token is invalid.
    Use this for endpoints that require authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    user_id = verify_token(credentials.credentials, token_type="access")
    if user_id is None:
        raise credentials_exception

    try:
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    except (ValueError, TypeError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user.

    Raises 403 Forbidden if user account is disabled.
    Currently all users are considered active.
    """
    # In the future, could check for is_active flag
    return current_user
