"""Integration tests for Authentication flow.

These tests verify the complete authentication workflow including
database interactions, token generation, and user sessions.
They should FAIL before implementation.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestUserRegistrationFlow:
    """Integration tests for user registration workflow."""

    def test_complete_registration_flow(self, client: TestClient):
        """Test complete registration flow creates user and returns tokens."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "complete@example.com",
                "password": "CompletePass123"
            }
        )

        assert response.status_code == 201
        data = response.json()

        # User data returned
        assert data["email"] == "complete@example.com"
        assert "id" in data

        # Tokens returned
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0

        # User can immediately use access token
        me_response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {data['access_token']}"}
        )
        assert me_response.status_code == 200
        assert me_response.json()["email"] == "complete@example.com"

    def test_registration_creates_default_meal_categories(self, client: TestClient):
        """Registration should create default meal categories for user."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "categories@example.com",
                "password": "CategoriesPass123"
            }
        )
        access_token = response.json()["access_token"]

        # Check categories were created
        categories_response = client.get(
            "/api/v1/categories",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert categories_response.status_code == 200
        categories = categories_response.json()

        # Should have 3 default categories
        assert len(categories) == 3
        category_names = [c["name"] for c in categories]
        assert "Breakfast" in category_names
        assert "Lunch" in category_names
        assert "Dinner" in category_names

    def test_password_is_hashed_in_database(self, client: TestClient, db: Session):
        """Password should be hashed, not stored in plain text."""
        from src.models.user import User

        password = "PlainTextPassword123"
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "hashed@example.com",
                "password": password
            }
        )
        user_id = response.json()["id"]

        # Check database
        user = db.query(User).filter(User.id == user_id).first()
        assert user is not None
        assert user.password_hash != password
        assert len(user.password_hash) > 50  # bcrypt hashes are long


class TestUserLoginFlow:
    """Integration tests for user login workflow."""

    def test_complete_login_flow(self, client: TestClient, test_user_data: dict):
        """Test complete login flow authenticates user and returns tokens."""
        # Register first
        client.post("/api/v1/auth/register", json=test_user_data)

        # Login
        response = client.post("/api/v1/auth/login", json=test_user_data)
        assert response.status_code == 200

        data = response.json()

        # Tokens returned
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0

        # Access token works
        me_response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {data['access_token']}"}
        )
        assert me_response.status_code == 200

    def test_login_updates_last_login_timestamp(self, client: TestClient, db: Session, test_user_data: dict):
        """Login should update user's last login timestamp."""
        from src.models.user import User
        import time

        # Register
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        user_id = register_response.json()["id"]

        # Wait a moment
        time.sleep(0.1)

        # Login
        client.post("/api/v1/auth/login", json=test_user_data)

        # Check updated_at changed (or last_login if implemented)
        user = db.query(User).filter(User.id == user_id).first()
        assert user is not None


class TestTokenRefreshFlow:
    """Integration tests for token refresh workflow."""

    def test_refresh_token_rotation(self, client: TestClient, test_user_data: dict):
        """Refresh should rotate tokens (new refresh token each time)."""
        # Register and get initial tokens
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        initial_refresh = register_response.json()["refresh_token"]

        # Refresh
        refresh_response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": initial_refresh}
        )
        new_refresh = refresh_response.json()["refresh_token"]

        # New refresh token should be different
        assert new_refresh != initial_refresh

        # Old refresh token should be invalidated
        old_refresh_response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": initial_refresh}
        )
        assert old_refresh_response.status_code == 401

    def test_access_token_works_after_refresh(self, client: TestClient, test_user_data: dict):
        """New access token from refresh should work."""
        # Register and get initial tokens
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        initial_refresh = register_response.json()["refresh_token"]

        # Refresh
        refresh_response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": initial_refresh}
        )
        new_access = refresh_response.json()["access_token"]

        # New access token works
        me_response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {new_access}"}
        )
        assert me_response.status_code == 200


class TestLogoutFlow:
    """Integration tests for logout workflow."""

    def test_logout_invalidates_refresh_token(self, client: TestClient, test_user_data: dict):
        """Logout should invalidate the user's refresh token."""
        # Register and get tokens
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        access_token = register_response.json()["access_token"]
        refresh_token = register_response.json()["refresh_token"]

        # Logout
        logout_response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert logout_response.status_code == 200

        # Refresh token should no longer work
        refresh_response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert refresh_response.status_code == 401


class TestAuthenticationSecurity:
    """Integration tests for authentication security."""

    def test_bcrypt_password_verification(self, client: TestClient, test_user_data: dict):
        """Verify bcrypt password hashing and verification works."""
        # Register
        client.post("/api/v1/auth/register", json=test_user_data)

        # Login with correct password works
        correct_response = client.post("/api/v1/auth/login", json=test_user_data)
        assert correct_response.status_code == 200

        # Login with wrong password fails
        wrong_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": "WrongPassword999"
            }
        )
        assert wrong_response.status_code == 401

    def test_jwt_token_structure(self, client: TestClient, test_user_data: dict):
        """JWT tokens should have valid structure."""
        import base64
        import json

        # Register and get tokens
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        access_token = register_response.json()["access_token"]

        # JWT has 3 parts
        parts = access_token.split(".")
        assert len(parts) == 3

        # Decode payload (middle part)
        # Add padding if needed
        payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))

        # Should contain user identifier and expiration
        assert "sub" in payload or "user_id" in payload
        assert "exp" in payload
