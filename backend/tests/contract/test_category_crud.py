"""
Contract tests for category CRUD API endpoints.

Tests creating, updating, and deleting meal categories.
"""

import pytest
from datetime import date


class TestCategoryCRUD:
    """Test POST, PUT, DELETE /categories endpoints."""

    def test_create_category_success(self, client, auth_headers):
        """POST /categories creates a new category."""
        category_data = {
            "name": "Snacks"
        }
        response = client.post(
            "/api/v1/categories",
            json=category_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Snacks"
        assert "id" in data
        assert data["display_order"] > 0
        assert data["is_default"] is False

    def test_create_category_with_display_order(self, client, auth_headers):
        """POST /categories allows setting display_order."""
        category_data = {
            "name": "Pre-Workout",
            "display_order": 1
        }
        response = client.post(
            "/api/v1/categories",
            json=category_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["display_order"] == 1

    def test_create_category_validation(self, client, auth_headers):
        """POST /categories validates required fields."""
        # Missing name
        response = client.post(
            "/api/v1/categories",
            json={},
            headers=auth_headers
        )
        assert response.status_code == 422

        # Empty name
        response = client.post(
            "/api/v1/categories",
            json={"name": ""},
            headers=auth_headers
        )
        assert response.status_code == 422

        # Name too long
        response = client.post(
            "/api/v1/categories",
            json={"name": "x" * 51},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_update_category_name(self, client, auth_headers):
        """PUT /categories/{id} updates category name."""
        # Get existing category
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        lunch_category = next(c for c in categories if c["name"] == "Lunch")

        # Update name
        response = client.put(
            f"/api/v1/categories/{lunch_category['id']}",
            json={"name": "Brunch"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Brunch"
        assert data["id"] == lunch_category["id"]

    def test_update_category_display_order(self, client, auth_headers):
        """PUT /categories/{id} updates display order."""
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        category = categories[0]

        response = client.put(
            f"/api/v1/categories/{category['id']}",
            json={"display_order": 99},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_order"] == 99

    def test_update_nonexistent_category(self, client, auth_headers):
        """PUT /categories/{id} returns 404 for non-existent category."""
        from uuid import uuid4

        response = client.put(
            f"/api/v1/categories/{uuid4()}",
            json={"name": "New Name"},
            headers=auth_headers
        )
        assert response.status_code == 404

    def test_delete_empty_category(self, client, auth_headers):
        """DELETE /categories/{id} removes category without entries."""
        # Create a new category
        category_data = {"name": "Test Delete"}
        create_response = client.post(
            "/api/v1/categories",
            json=category_data,
            headers=auth_headers
        )
        category_id = create_response.json()["id"]

        # Delete it
        response = client.delete(
            f"/api/v1/categories/{category_id}",
            headers=auth_headers
        )
        assert response.status_code == 204

        # Verify it's gone
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        assert not any(c["id"] == category_id for c in categories)

    def test_delete_category_with_entries(
        self,
        client,
        auth_headers,
        sample_custom_food
    ):
        """DELETE /categories/{id} returns 409 if category has entries."""
        # Get Breakfast category
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        breakfast = next(c for c in categories if c["name"] == "Breakfast")

        # Add an entry to breakfast
        today = date.today().isoformat()
        entry_data = {
            "category_id": breakfast["id"],
            "food_id": sample_custom_food["id"],
            "quantity": 1.0
        }
        client.post(
            f"/api/v1/diary/{today}/entries",
            json=entry_data,
            headers=auth_headers
        )

        # Try to delete category with entries
        response = client.delete(
            f"/api/v1/categories/{breakfast['id']}",
            headers=auth_headers
        )
        assert response.status_code == 409
        assert "entries" in response.json()["detail"].lower()

    def test_delete_nonexistent_category(self, client, auth_headers):
        """DELETE /categories/{id} returns 404 for non-existent category."""
        from uuid import uuid4

        response = client.delete(
            f"/api/v1/categories/{uuid4()}",
            headers=auth_headers
        )
        assert response.status_code == 404

    def test_user_isolation_create(self, client, auth_headers):
        """Users cannot see other users' categories."""
        # User 1 creates category
        category_data = {"name": "User 1 Category"}
        user1_response = client.post(
            "/api/v1/categories",
            json=category_data,
            headers=auth_headers
        )
        assert user1_response.status_code == 201
        user1_category_id = user1_response.json()["id"]

        # Create user 2
        user2_data = {"email": "user2@example.com", "password": "password123"}
        client.post("/api/v1/auth/register", json=user2_data)
        login_response = client.post("/api/v1/auth/login", json=user2_data)
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User 2 should not see user 1's category
        user2_categories = client.get(
            "/api/v1/categories",
            headers=user2_headers
        ).json()
        assert not any(c["id"] == user1_category_id for c in user2_categories)

    def test_user_isolation_update(self, client, auth_headers):
        """Users cannot update other users' categories."""
        # User 1 creates category
        category_data = {"name": "User 1 Category"}
        user1_response = client.post(
            "/api/v1/categories",
            json=category_data,
            headers=auth_headers
        )
        user1_category_id = user1_response.json()["id"]

        # Create user 2
        user2_data = {"email": "user2b@example.com", "password": "password123"}
        client.post("/api/v1/auth/register", json=user2_data)
        login_response = client.post("/api/v1/auth/login", json=user2_data)
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User 2 tries to update user 1's category
        response = client.put(
            f"/api/v1/categories/{user1_category_id}",
            json={"name": "Hacked"},
            headers=user2_headers
        )
        assert response.status_code == 404

    def test_user_isolation_delete(self, client, auth_headers):
        """Users cannot delete other users' categories."""
        # User 1 creates category
        category_data = {"name": "User 1 Category"}
        user1_response = client.post(
            "/api/v1/categories",
            json=category_data,
            headers=auth_headers
        )
        user1_category_id = user1_response.json()["id"]

        # Create user 2
        user2_data = {"email": "user2c@example.com", "password": "password123"}
        client.post("/api/v1/auth/register", json=user2_data)
        login_response = client.post("/api/v1/auth/login", json=user2_data)
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User 2 tries to delete user 1's category
        response = client.delete(
            f"/api/v1/categories/{user1_category_id}",
            headers=user2_headers
        )
        assert response.status_code == 404

    def test_cannot_delete_default_categories(self, client, auth_headers):
        """Cannot delete default categories (Breakfast, Lunch, Dinner)."""
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        breakfast = next(c for c in categories if c["name"] == "Breakfast")

        response = client.delete(
            f"/api/v1/categories/{breakfast['id']}",
            headers=auth_headers
        )
        # Should fail - default categories are protected
        assert response.status_code in [403, 409]

    def test_category_name_uniqueness_per_user(self, client, auth_headers):
        """User cannot create duplicate category names."""
        # Create first category
        response1 = client.post(
            "/api/v1/categories",
            json={"name": "Snacks"},
            headers=auth_headers
        )
        assert response1.status_code == 201

        # Try to create duplicate
        response2 = client.post(
            "/api/v1/categories",
            json={"name": "Snacks"},
            headers=auth_headers
        )
        assert response2.status_code == 409
