"""
Integration tests for custom meal functionality.

Tests end-to-end meal creation, management, and diary integration flows.
"""

import pytest
from datetime import date
from uuid import uuid4


class TestCustomMealIntegration:
    """Integration tests for custom meal workflows."""

    def test_full_meal_lifecycle(
        self,
        client,
        auth_headers,
        sample_custom_food,
        sample_meal_category,
        db_session
    ):
        """Test complete meal lifecycle: create → update → use → delete."""
        # Step 1: Create meal
        meal_data = {
            "name": "Breakfast Special",
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
        assert create_response.status_code == 201
        meal_id = create_response.json()["id"]

        # Step 2: Update meal name
        update_data = {
            "name": "Ultimate Breakfast",
            "items": [
                {
                    "food_id": sample_custom_food['id'],
                    "quantity": 2.0
                }
            ]
        }
        update_response = client.put(
            f"/api/v1/meals/{meal_id}",
            json=update_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Ultimate Breakfast"

        # Step 3: Add meal to diary
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": sample_meal_category["id"]
        }
        diary_response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert diary_response.status_code == 201
        entries = diary_response.json()
        assert len(entries) == 1
        assert entries[0]["quantity"] == 2.0

        # Step 4: Verify in diary
        get_diary = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
        diary = get_diary.json()
        assert diary["totals"]["calories"] > 0

        # Step 5: Delete meal
        delete_response = client.delete(
            f"/api/v1/meals/{meal_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 204

        # Step 6: Verify meal not in list
        list_response = client.get("/api/v1/meals", headers=auth_headers)
        assert len(list_response.json()) == 0

        # Step 7: Verify diary entries still exist (historical data preserved)
        get_diary_after = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
        diary_after = get_diary_after.json()
        assert diary_after["totals"]["calories"] > 0

    def test_meal_with_deleted_custom_food(
        self,
        client,
        auth_headers,
        sample_custom_food,
        db_session
    ):
        """Meal shows indicator when component food is deleted."""
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

        # Delete the custom food
        client.delete(
            f"/api/v1/custom-foods/{sample_custom_food['id']}",
            headers=auth_headers
        )

        # Get meal - should show deleted indicator
        get_response = client.get(f"/api/v1/meals/{meal_id}", headers=auth_headers)
        assert get_response.status_code == 200
        meal = get_response.json()
        assert len(meal["items"]) == 1
        assert meal["items"][0]["is_deleted"] is True

    def test_create_complex_meal_and_add_to_multiple_days(
        self,
        client,
        auth_headers,
        sample_custom_food,
        sample_meal_category,
        db_session
    ):
        """Create meal with multiple items and add to different days."""
        # Create additional foods via API
        from tests.conftest import create_test_custom_food

        food2 = create_test_custom_food(
            client,
            auth_headers,
            name="Eggs",
            serving_size=2,
            serving_unit="large",
            calories=140,
            protein_g=12.0,
            carbs_g=1.0,
            fat_g=10.0
        )

        food3 = create_test_custom_food(
            client,
            auth_headers,
            name="Toast",
            serving_size=2,
            serving_unit="slices",
            calories=160,
            protein_g=6.0,
            carbs_g=30.0,
            fat_g=2.0
        )

        # Create complex meal
        meal_data = {
            "name": "Full Breakfast",
            "items": [
                {"food_id": sample_custom_food['id'], "quantity": 1.0},
                {"food_id": food2['id'], "quantity": 1.0},
                {"food_id": food3['id'], "quantity": 1.0}
            ]
        }
        meal_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = meal_response.json()["id"]
        meal = meal_response.json()

        # Verify totals calculated
        assert meal["totals"]["calories"] > 0
        assert meal["totals"]["protein_g"] > 0

        # Add to today
        today = date.today().isoformat()
        add_data = {
            "meal_id": meal_id,
            "category_id": sample_meal_category["id"]
        }
        today_response = client.post(
            f"/api/v1/diary/{today}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert len(today_response.json()) == 3

        # Add to tomorrow (different date)
        from datetime import timedelta
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        tomorrow_response = client.post(
            f"/api/v1/diary/{tomorrow}/add-meal",
            json=add_data,
            headers=auth_headers
        )
        assert len(tomorrow_response.json()) == 3

        # Verify both days have entries
        today_diary = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
        tomorrow_diary = client.get(f"/api/v1/diary/{tomorrow}", headers=auth_headers)

        assert today_diary.json()["totals"]["calories"] > 0
        assert tomorrow_diary.json()["totals"]["calories"] > 0

    def test_update_meal_replaces_items(
        self,
        client,
        auth_headers,
        sample_custom_food,
        db_session
    ):
        """Updating meal replaces all items."""
        # Create second food via API
        from tests.conftest import create_test_custom_food

        food2 = create_test_custom_food(
            client,
            auth_headers,
            name="Food 2",
            serving_size=50,
            serving_unit="g",
            calories=100,
            protein_g=5.0,
            carbs_g=10.0,
            fat_g=3.0
        )

        # Create meal with food 1
        meal_data = {
            "name": "Original Meal",
            "items": [
                {"food_id": sample_custom_food['id'], "quantity": 1.0}
            ]
        }
        create_response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )
        meal_id = create_response.json()["id"]
        original_calories = create_response.json()["totals"]["calories"]

        # Update meal to use food 2
        update_data = {
            "name": "Updated Meal",
            "items": [
                {"food_id": food2['id'], "quantity": 2.0}
            ]
        }
        update_response = client.put(
            f"/api/v1/meals/{meal_id}",
            json=update_data,
            headers=auth_headers
        )
        updated_calories = update_response.json()["totals"]["calories"]

        # Totals should change
        assert updated_calories != original_calories

        # Get meal to verify
        get_response = client.get(f"/api/v1/meals/{meal_id}", headers=auth_headers)
        meal = get_response.json()
        assert len(meal["items"]) == 1
        assert meal["items"][0]["quantity"] == 2.0

    def test_multiple_meals_per_user(
        self,
        client,
        auth_headers,
        sample_custom_food
    ):
        """User can create and manage multiple meals."""
        meal_names = ["Breakfast", "Lunch", "Dinner", "Snack"]

        # Create multiple meals
        for name in meal_names:
            meal_data = {
                "name": name,
                "items": [
                    {"food_id": sample_custom_food['id'], "quantity": 1.0}
                ]
            }
            response = client.post(
                "/api/v1/meals",
                json=meal_data,
                headers=auth_headers
            )
            assert response.status_code == 201

        # List all meals
        list_response = client.get("/api/v1/meals", headers=auth_headers)
        meals = list_response.json()
        assert len(meals) == 4

        # Verify all names present
        returned_names = [meal["name"] for meal in meals]
        for name in meal_names:
            assert name in returned_names

    def test_unauthorized_access_meal(self, client, sample_custom_food):
        """Cannot access meals without authentication."""
        response = client.get("/api/v1/meals")
        assert response.status_code == 401

        # Cannot create
        meal_data = {
            "name": "Test",
            "items": [{"food_id": sample_custom_food['id'], "quantity": 1.0}]
        }
        create_response = client.post("/api/v1/meals", json=meal_data)
        assert create_response.status_code == 401

    def test_meal_totals_calculation(
        self,
        client,
        auth_headers,
        db_session
    ):
        """Meal totals are calculated correctly from items."""
        # Create foods with known values via API
        from tests.conftest import create_test_custom_food

        food1 = create_test_custom_food(
            client,
            auth_headers,
            name="Food 1",
            serving_size=100,
            serving_unit="g",
            calories=100,
            protein_g=10.0,
            carbs_g=15.0,
            fat_g=5.0
        )

        food2 = create_test_custom_food(
            client,
            auth_headers,
            name="Food 2",
            serving_size=50,
            serving_unit="g",
            calories=50,
            protein_g=5.0,
            carbs_g=8.0,
            fat_g=2.0
        )

        # Create meal: 2x food1 + 1x food2
        # Expected: (2 * 100) + (1 * 50) = 250 calories
        #           (2 * 10) + (1 * 5) = 25g protein
        #           (2 * 15) + (1 * 8) = 38g carbs
        #           (2 * 5) + (1 * 2) = 12g fat
        meal_data = {
            "name": "Calculated Meal",
            "items": [
                {"food_id": food1['id'], "quantity": 2.0},
                {"food_id": food2['id'], "quantity": 1.0}
            ]
        }
        response = client.post(
            "/api/v1/meals",
            json=meal_data,
            headers=auth_headers
        )

        totals = response.json()["totals"]
        assert totals["calories"] == 250
        assert totals["protein_g"] == 25.0
        assert totals["carbs_g"] == 38.0
        assert totals["fat_g"] == 12.0
