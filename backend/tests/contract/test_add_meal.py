"""
Contract tests for add-meal-to-diary API endpoint.

Tests adding entire custom meals to diary as multiple individual entries.
"""

import pytest
from datetime import date


class TestAddMealToDiary:
    """Test POST /diary/{date}/add-meal endpoint."""

    def test_add_meal_to_diary_success(
        self,
        client,
        auth_headers,
        sample_custom_food,
        sample_meal_category,
        db_session
    ):
        """POST /diary/{date}/add-meal adds all meal items as entries."""
        # Create custom meal
        meal_data = {
            "name": "Breakfast Combo",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 2.0
                }
            ]
        }
        meal_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = meal_response.json()["id"]

        # Add meal to diary
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": sample_meal_category["id"]
        }
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()

        # Should return array of created diary entries
        assert isinstance(data, list)
        assert len(data) == 1  # One food in the meal
        assert data[0]["quantity"] == 2.0
        assert "food" in data[0]
        assert "id" in data[0]

    def test_add_meal_validation_errors(self, client, auth_headers):
        """POST /diary/{date}/add-meal validates required fields."""
        today = date.today().isoformat()

        # Missing meal_id
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json={"category_id": "123"},
            headers=auth_headers
        )
        assert response.status_code == 422

        # Missing category_id
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json={"meal_id": "123"},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_add_nonexistent_meal(self, client, auth_headers, sample_meal_category):
        """Cannot add non-existent meal to diary."""
        from uuid import uuid4

        today = date.today().isoformat()
        add_data = {
            "meal_id": str(uuid4()),
            "category_id": sample_meal_category["id"]
        }
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert response.status_code == 404

    def test_add_meal_with_multiple_items(
        self,
        client,
        auth_headers,
        sample_custom_food,
        sample_meal_category,
        db_session
    ):
        """Adding meal with multiple items creates multiple entries."""
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

        # Create meal with two foods
        meal_data = {
            "name": "Multi-Item Meal",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                },
                {
                    "food_id": food2_id,
                    "quantity": 1.5
                }
            ]
        }
        meal_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = meal_response.json()["id"]

        # Add to diary
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": sample_meal_category["id"]
        }
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()

        # Should have 2 entries
        assert len(data) == 2

        # Verify quantities match meal definition
        quantities = [entry["quantity"] for entry in data]
        assert 1.0 in quantities
        assert 1.5 in quantities

    def test_add_meal_appears_in_diary(
        self,
        client,
        auth_headers,
        sample_custom_food,
        sample_meal_category
    ):
        """Meal items appear in diary GET endpoint after adding."""
        # Create meal
        meal_data = {
            "name": "Test Meal",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }
        meal_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = meal_response.json()["id"]

        # Add to diary
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": sample_meal_category["id"]
        }
        client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )

        # Verify in diary
        diary_response = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
        assert diary_response.status_code == 200
        diary = diary_response.json()

        # Find the category
        category = next(
            (c for c in diary["categories"] if c["id"] == sample_meal_category["id"]),
            None
        )
        assert category is not None
        assert len(category["entries"]) >= 1

    def test_add_deleted_meal_fails(
        self,
        client,
        auth_headers,
        sample_custom_food,
        sample_meal_category
    ):
        """Cannot add deleted meal to diary."""
        # Create and delete meal
        meal_data = {
            "name": "To Delete",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }
        meal_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = meal_response.json()["id"]

        # Delete the meal
        client.delete(f"/api/v1/meals/{meal_id}", headers=auth_headers)

        # Try to add deleted meal
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": sample_meal_category["id"]
        }
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert response.status_code == 404

    def test_add_meal_invalid_category(
        self,
        client,
        auth_headers,
        sample_custom_food
    ):
        """Cannot add meal to non-existent category."""
        from uuid import uuid4

        # Create meal
        meal_data = {
            "name": "Test Meal",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }
        meal_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = meal_response.json()["id"]

        # Try to add to non-existent category
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": str(uuid4())
        }
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert response.status_code == 404

    def test_user_isolation_meals(
        self,
        client,
        auth_headers,
        sample_custom_food,
        sample_meal_category
    ):
        """User cannot add another user's meal to diary."""
        # User 1 creates meal
        meal_data = {
            "name": "User 1 Meal",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 1.0
                }
            ]
        }
        meal_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = meal_response.json()["id"]

        # Create user 2
        user2_data = {"email": "user2@example.com", "password": "password123"}
        client.post("/api/v1/auth/register", json=user2_data)
        login_response = client.post("/api/v1/auth/login", json=user2_data)
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User 2 tries to add user 1's meal
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": sample_meal_category["id"]
        }
        response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=user2_headers
        )
        assert response.status_code == 404
