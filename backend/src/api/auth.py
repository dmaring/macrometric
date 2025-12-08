"""Authentication API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from src.core.deps import get_db, get_current_user
from src.services.auth import AuthService
from src.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Request/Response schemas
class UserRegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str


class UserLoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str


class TokenResponse(BaseModel):
    """Token response with user data."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """User data response."""
    id: str
    email: str
    onboarding_completed: bool

    class Config:
        from_attributes = True


class AuthResponse(TokenResponse):
    """Full authentication response with tokens and user data."""
    id: str
    email: str
    onboarding_completed: bool


class MessageResponse(BaseModel):
    """Simple message response."""
    message: str


class PasswordResetRequest(BaseModel):
    """Password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation with new password."""
    password: str


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    data: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """Register a new user account.

    Creates a new user with email and password, generates auth tokens,
    and creates default meal categories (Breakfast, Lunch, Dinner).
    """
    auth_service = AuthService(db)
    user, access_token, refresh_token = auth_service.register(
        email=data.email,
        password=data.password,
    )

    return AuthResponse(
        id=str(user.id),
        email=user.email,
        onboarding_completed=user.onboarding_completed,
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login with email and password",
)
def login(
    data: UserLoginRequest,
    db: Session = Depends(get_db),
):
    """Authenticate user and return tokens."""
    auth_service = AuthService(db)
    user, access_token, refresh_token = auth_service.login(
        email=data.email,
        password=data.password,
    )

    return AuthResponse(
        id=str(user.id),
        email=user.email,
        onboarding_completed=user.onboarding_completed,
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
def refresh(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Get new access and refresh tokens using a refresh token."""
    auth_service = AuthService(db)
    access_token, refresh_token = auth_service.refresh_tokens(data.refresh_token)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout current user",
)
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Logout the current user.

    Currently this is a no-op server-side. Client should discard tokens.
    """
    auth_service = AuthService(db)
    auth_service.logout(current_user)

    return MessageResponse(message="Successfully logged out")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get the current authenticated user's information."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        onboarding_completed=current_user.onboarding_completed,
    )


@router.post(
    "/password-reset",
    response_model=MessageResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request password reset",
)
def request_password_reset(
    data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    """Request a password reset email.

    Always returns 202 Accepted to prevent email enumeration attacks.
    In production, would send an email with a reset link.
    """
    auth_service = AuthService(db)
    auth_service.request_password_reset(email=data.email)

    return MessageResponse(
        message="If the email exists, a password reset link has been sent"
    )


@router.post(
    "/password-reset/{token}",
    response_model=MessageResponse,
    summary="Reset password with token",
)
def reset_password(
    token: str,
    data: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    """Reset password using a valid reset token.

    The token is obtained from the password reset email link.
    """
    auth_service = AuthService(db)
    auth_service.reset_password(token=token, new_password=data.password)

    return MessageResponse(message="Password has been reset successfully")
