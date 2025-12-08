"""
Contract tests for custom meal API endpoints.

Tests the API contract for custom meal management, ensuring endpoints
match the OpenAPI specification in contracts/api.yaml.
"""

import pytest
from datetime import datetime
from uuid import uuid4


class TestCustomMealContract:
    """Test custom meal API endpoints against contract."""

    def test_list_meals_empty(self, client, auth_headers):
        """GET /meals returns empty list for new user."""
        response = client.get("/api/v1/meals", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_create_meal_success(self, client, auth_headers, sample_custom_food):
        """POST /meals creates new meal with items."""
        meal_data = {
            "name": "Breakfast Combo",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }

        response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()

        # Verify response structure
        assert "id" in data
        assert data["name"] == "Breakfast Combo"
        assert "items" in data
        assert len(data["items"]) == 1
        assert "totals" in data
        assert "calories" in data["totals"]
        assert "protein_g" in data["totals"]
        assert "carbs_g" in data["totals"]
        assert "fat_g" in data["totals"]
        assert "created_at" in data

    def test_create_meal_validation_errors(self, client, auth_headers):
        """POST /meals validates required fields."""
        # Missing name
        response = client.post(
            "/api/v1/meals",
            json={"items": []},
            headers=auth_headers
        )
        assert response.status_code == 422

        # Missing items
        response = client.post(
            "/api/v1/meals",
            json={"name": "Test"},
            headers=auth_headers
        )
        assert response.status_code == 422

        # Empty items
        response = client.post(
            "/api/v1/meals",
            json={"name": "Test", "items": []},
            headers=auth_headers
        )
        assert response.status_code == 422

        # Invalid quantity
        response = client.post(
            "/api/v1/meals",
            json={
                "name": "Test",
                "items": [{"food_id": "custom:123", "quantity": -1}]
            },
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_list_meals_with_data(self, client, auth_headers, sample_custom_food):
        """GET /meals returns list of user's meals."""
        # Create a meal first
        meal_data = {
            "name": "Lunch Special",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 2.0
                }
            ]
        }
        create_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        assert create_response.status_code == 201

        # List meals
        response = client.get("/api/v1/meals", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["name"] == "Lunch Special"
        assert "totals" in data[0]

    def test_get_meal_by_id(self, client, auth_headers, sample_custom_food):
        """GET /meals/{id} returns meal details."""
        # Create meal
        meal_data = {
            "name": "Dinner Combo",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.5
                }
            ]
        }
        create_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = create_response.json()["id"]

        # Get meal by ID
        response = client.get(f"/api/v1/meals/{meal_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == meal_id
        assert data["name"] == "Dinner Combo"
        assert len(data["items"]) == 1
        assert data["items"][0]["quantity"] == 1.5

    def test_get_meal_not_found(self, client, auth_headers):
        """GET /meals/{id} returns 404 for non-existent meal."""
        fake_id = str(uuid4())
        response = client.get(f"/api/v1/meals/{fake_id}", headers=auth_headers)
        assert response.status_code == 404

    def test_update_meal(self, client, auth_headers, sample_custom_food):
        """PUT /meals/{id} updates meal name and items."""
        # Create meal
        meal_data = {
            "name": "Original Name",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }
        create_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = create_response.json()["id"]

        # Update meal
        update_data = {
            "name": "Updated Name",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 2.0
                }
            ]
        }
        response = client.put(
            f"/api/v1/meals/{meal_id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["items"][0]["quantity"] == 2.0

    def test_delete_meal(self, client, auth_headers, sample_custom_food):
        """DELETE /meals/{id} soft deletes meal."""
        # Create meal
        meal_data = {
            "name": "To Delete",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }
        create_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = create_response.json()["id"]

        # Delete meal
        response = client.delete(f"/api/v1/meals/{meal_id}", headers=auth_headers)
        assert response.status_code == 204

        # Verify meal not in list
        list_response = client.get("/api/v1/meals", headers=auth_headers)
        meals = list_response.json()
        assert len(meals) == 0

        # Verify 404 on get
        get_response = client.get(f"/api/v1/meals/{meal_id}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_user_isolation(self, client, auth_headers, sample_custom_food):
        """Users can only access their own meals."""
        # Create meal as user 1
        meal_data = {
            "name": "User 1 Meal",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }
        response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = response.json()["id"]

        # Create second user
        user2_data = {"email": "user2@example.com", "password": "password123"}
        client.post("/api/v1/auth/register", json=user2_data)
        login_response = client.post("/api/v1/auth/login", json=user2_data)
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User 2 should not see user 1's meal
        list_response = client.get("/api/v1/meals", headers=user2_headers)
        assert len(list_response.json()) == 0

        # User 2 cannot access user 1's meal
        get_response = client.get(f"/api/v1/meals/{meal_id}", headers=user2_headers)
        assert get_response.status_code == 404

    def test_meal_with_multiple_items(self, client, auth_headers, sample_custom_food, db_session):
        """Can create meal with multiple food items."""
        # Create second custom food via API
        food2_data = {
            "name": "Food 2",
            "serving_size": 50.0,
            "serving_unit": "g",
            "calories": 150,
            "protein_g": 8.0,
            "carbs_g": 10.0,
            "fat_g": 5.0
        }
        food2_response = client.post(
            "/api/v1/custom-foods",
            json=food2_data,
            headers=auth_headers
        )
        food2_id = food2_response.json()["id"].replace("custom:", "")

        # Create meal with both foods
        meal_data = {
            "name": "Complex Meal",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                },
                {
                    "food_id": food2_id,
                    "quantity": 2.0
                }
            ]
        }

        response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert len(data["items"]) == 2

        # Verify totals are calculated correctly
        assert data["totals"]["calories"] > 0
        assert data["totals"]["protein_g"] > 0

    def test_meal_name_length_validation(self, client, auth_headers, sample_custom_food):
        """Meal name must not exceed 100 characters."""
        long_name = "a" * 101
        meal_data = {
            "name": long_name,
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }

        response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        assert response.status_code == 422
