"""Contract tests for Authentication API endpoints.

These tests verify the API contract matches the OpenAPI specification.
They should FAIL before implementation.
"""
import pytest
from fastapi.testclient import TestClient


class TestAuthRegisterContract:
    """Contract tests for POST /api/v1/auth/register"""

    def test_register_success_returns_201(self, client: TestClient):
        """Registration should return 201 with user data."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecurePass123"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["email"] == "newuser@example.com"
        assert "password" not in data
        assert "password_hash" not in data

    def test_register_returns_access_token(self, client: TestClient):
        """Registration should return access and refresh tokens."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "tokenuser@example.com",
                "password": "SecurePass123"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email_returns_409(self, client: TestClient):
        """Duplicate email registration should return 409 Conflict."""
        user_data = {
            "email": "duplicate@example.com",
            "password": "SecurePass123"
        }
        # First registration
        client.post("/api/v1/auth/register", json=user_data)
        # Duplicate registration
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 409

    def test_register_invalid_email_returns_422(self, client: TestClient):
        """Invalid email format should return 422."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "not-an-email",
                "password": "SecurePass123"
            }
        )
        assert response.status_code == 422

    def test_register_weak_password_returns_422(self, client: TestClient):
        """Weak password should return 422."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "weak@example.com",
                "password": "short"
            }
        )
        assert response.status_code == 422


class TestAuthLoginContract:
    """Contract tests for POST /api/v1/auth/login"""

    def test_login_success_returns_200(self, client: TestClient, test_user_data: dict):
        """Successful login should return 200 with tokens."""
        # Register first
        client.post("/api/v1/auth/register", json=test_user_data)

        # Login
        response = client.post("/api/v1/auth/login", json=test_user_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials_returns_401(self, client: TestClient, test_user_data: dict):
        """Invalid credentials should return 401."""
        # Register first
        client.post("/api/v1/auth/register", json=test_user_data)

        # Login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": "WrongPassword123"
            }
        )
        assert response.status_code == 401

    def test_login_nonexistent_user_returns_401(self, client: TestClient):
        """Non-existent user login should return 401."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SomePassword123"
            }
        )
        assert response.status_code == 401


class TestAuthRefreshContract:
    """Contract tests for POST /api/v1/auth/refresh"""

    def test_refresh_success_returns_200(self, client: TestClient, test_user_data: dict):
        """Valid refresh token should return new access token."""
        # Register and get tokens
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        refresh_token = register_response.json()["refresh_token"]

        # Refresh
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token_returns_401(self, client: TestClient):
        """Invalid refresh token should return 401."""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid-token"}
        )
        assert response.status_code == 401


class TestAuthLogoutContract:
    """Contract tests for POST /api/v1/auth/logout"""

    def test_logout_success_returns_200(self, client: TestClient, auth_headers: dict):
        """Logout should return 200."""
        response = client.post("/api/v1/auth/logout", headers=auth_headers)
        assert response.status_code == 200

    def test_logout_unauthorized_returns_401(self, client: TestClient):
        """Logout without auth should return 401."""
        response = client.post("/api/v1/auth/logout")
        assert response.status_code == 401


class TestAuthMeContract:
    """Contract tests for GET /api/v1/auth/me"""

    def test_me_success_returns_200(self, client: TestClient, auth_headers: dict, test_user_data: dict):
        """Get current user should return 200 with user data."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert "id" in data
        assert "password" not in data

    def test_me_unauthorized_returns_401(self, client: TestClient):
        """Get current user without auth should return 401."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401
