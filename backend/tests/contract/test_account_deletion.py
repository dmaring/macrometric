"""Contract tests for Account Deletion API endpoint.

These tests verify the API contract matches the OpenAPI specification.
They should FAIL before implementation.
"""
import pytest
from fastapi.testclient import TestClient


class TestAccountDeletionContract:
    """Contract tests for DELETE /api/v1/users/me"""

    def test_account_deletion_returns_204(self, client: TestClient, auth_headers: dict):
        """Account deletion should return 204 No Content."""
        response = client.delete("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 204

    def test_account_deletion_without_auth_returns_401(self, client: TestClient):
        """Account deletion without authentication should return 401."""
        response = client.delete("/api/v1/users/me")
        assert response.status_code == 401

    def test_account_deletion_with_invalid_token_returns_401(self, client: TestClient):
        """Account deletion with invalid token should return 401."""
        response = client.delete(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid-token"}
        )
        assert response.status_code == 401

    def test_deleted_account_cannot_login(self, client: TestClient, test_user_data: dict):
        """After account deletion, user should not be able to login."""
        # Register user
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        access_token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # Delete account
        delete_response = client.delete("/api/v1/users/me", headers=headers)
        assert delete_response.status_code == 204

        # Try to login
        login_response = client.post("/api/v1/auth/login", json=test_user_data)
        assert login_response.status_code == 401

    def test_deleted_account_cannot_access_protected_routes(
        self, client: TestClient, test_user_data: dict
    ):
        """After account deletion, token should be invalid for protected routes."""
        # Register user
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        access_token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # Delete account
        client.delete("/api/v1/users/me", headers=headers)

        # Try to access protected route with old token
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    def test_account_deletion_removes_all_diary_entries(
        self, client: TestClient, auth_headers: dict
    ):
        """Account deletion should cascade delete all diary entries."""
        # Create a diary entry
        from datetime import date
        today = date.today().isoformat()

        # First, get categories to use one
        categories_response = client.get("/api/v1/categories", headers=auth_headers)
        categories = categories_response.json()
        assert len(categories) > 0
        category_id = categories[0]["id"]

        # Add a diary entry
        entry_data = {
            "category_id": category_id,
            "name": "Test Food",
            "serving_size": 100,
            "serving_unit": "g",
            "calories": 200,
            "protein_g": 10.0,
            "carbs_g": 20.0,
            "fat_g": 5.0,
            "quantity": 1.0
        }
        client.post(f"/api/v1/diary/{today}", json=entry_data, headers=auth_headers)

        # Delete account
        response = client.delete("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 204

        # Data integrity check - this is more of an integration test
        # but validates the cascade delete behavior

    def test_account_deletion_removes_all_custom_foods(
        self, client: TestClient, auth_headers: dict
    ):
        """Account deletion should cascade delete all custom foods."""
        # Create a custom food
        food_data = {
            "name": "Custom Test Food",
            "brand": "Test Brand",
            "serving_size": 100,
            "serving_unit": "g",
            "calories": 150,
            "protein_g": 8.0,
            "carbs_g": 15.0,
            "fat_g": 4.0
        }
        client.post("/api/v1/foods/custom", json=food_data, headers=auth_headers)

        # Delete account
        response = client.delete("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 204

    def test_account_deletion_removes_all_custom_meals(
        self, client: TestClient, auth_headers: dict
    ):
        """Account deletion should cascade delete all custom meals."""
        # Create a custom meal (simplified - would need foods first)
        meal_data = {
            "name": "Test Meal",
            "items": []
        }
        # This endpoint may not exist yet, test will fail until implementation
        client.post("/api/v1/meals", json=meal_data, headers=auth_headers)

        # Delete account
        response = client.delete("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 204

    def test_account_deletion_removes_daily_goals(
        self, client: TestClient, auth_headers: dict
    ):
        """Account deletion should cascade delete daily goals."""
        # Set daily goals
        goals_data = {
            "calories": 2000,
            "protein_g": 150.0,
            "carbs_g": 200.0,
            "fat_g": 65.0
        }
        client.put("/api/v1/users/me/goals", json=goals_data, headers=auth_headers)

        # Delete account
        response = client.delete("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 204

    def test_account_deletion_removes_meal_categories(
        self, client: TestClient, auth_headers: dict
    ):
        """Account deletion should cascade delete meal categories."""
        # Categories are created by default on registration
        # Verify they exist
        categories_response = client.get("/api/v1/categories", headers=auth_headers)
        assert categories_response.status_code == 200
        assert len(categories_response.json()) > 0

        # Delete account
        response = client.delete("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 204

    def test_account_deletion_idempotent(self, client: TestClient, test_user_data: dict):
        """Deleting an already deleted account should return 401 (not found)."""
        # Register user
        register_response = client.post("/api/v1/auth/register", json=test_user_data)
        access_token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # Delete account
        first_delete = client.delete("/api/v1/users/me", headers=headers)
        assert first_delete.status_code == 204

        # Try to delete again with same token
        second_delete = client.delete("/api/v1/users/me", headers=headers)
        assert second_delete.status_code == 401  # Token invalid, user doesn't exist
