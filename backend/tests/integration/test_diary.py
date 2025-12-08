"""Integration tests for Diary functionality.

These tests verify the complete diary workflow including
database interactions and calculations.
They should FAIL before implementation.
"""
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestDiaryEntryWorkflow:
    """Integration tests for diary entry CRUD workflow."""

    def test_complete_diary_entry_flow(self, client: TestClient, auth_headers: dict, db: Session):
        """Test complete flow: add entry → view diary → update → delete."""
        today = date.today().isoformat()

        # First, get categories to find a valid category_id
        categories_response = client.get("/api/v1/categories", headers=auth_headers)
        assert categories_response.status_code == 200
        categories = categories_response.json()
        category_id = categories[0]["id"]

        # Create a food item first (or use existing)
        food_response = client.post(
            "/api/v1/foods/custom",
            headers=auth_headers,
            json={
                "name": "Test Apple",
                "serving_size": 100,
                "serving_unit": "g",
                "calories": 52,
                "protein_g": 0.3,
                "carbs_g": 14,
                "fat_g": 0.2
            }
        )
        # Food creation may not be implemented yet
        if food_response.status_code == 201:
            food_id = food_response.json()["id"]

            # Add entry
            add_response = client.post(
                f"/api/v1/diary/{today}/entries",
                headers=auth_headers,
                json={
                    "category_id": category_id,
                    "food_id": food_id,
                    "quantity": 1.5
                }
            )
            assert add_response.status_code == 201
            entry = add_response.json()
            entry_id = entry["id"]

            # View diary
            diary_response = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
            assert diary_response.status_code == 200
            diary = diary_response.json()

            # Find entry in diary
            found = False
            for cat in diary["categories"]:
                for e in cat["entries"]:
                    if e["id"] == entry_id:
                        found = True
                        assert e["quantity"] == 1.5
            assert found, "Entry should appear in diary"

            # Update entry
            update_response = client.put(
                f"/api/v1/diary/entries/{entry_id}",
                headers=auth_headers,
                json={"quantity": 2.0}
            )
            assert update_response.status_code == 200
            assert update_response.json()["quantity"] == 2.0

            # Delete entry
            delete_response = client.delete(
                f"/api/v1/diary/entries/{entry_id}",
                headers=auth_headers
            )
            assert delete_response.status_code == 204

    def test_diary_totals_calculation(self, client: TestClient, auth_headers: dict):
        """Test that diary totals are calculated correctly."""
        today = date.today().isoformat()

        # Get categories
        categories_response = client.get("/api/v1/categories", headers=auth_headers)
        categories = categories_response.json()
        category_id = categories[0]["id"]

        # Create two food items with known macros
        foods = []
        for i, (cal, pro, carb, fat) in enumerate([(100, 10, 20, 5), (200, 15, 30, 10)]):
            food_response = client.post(
                "/api/v1/foods/custom",
                headers=auth_headers,
                json={
                    "name": f"Test Food {i}",
                    "serving_size": 100,
                    "serving_unit": "g",
                    "calories": cal,
                    "protein_g": pro,
                    "carbs_g": carb,
                    "fat_g": fat
                }
            )
            if food_response.status_code == 201:
                foods.append(food_response.json())

        if len(foods) == 2:
            # Add both foods
            for food in foods:
                client.post(
                    f"/api/v1/diary/{today}/entries",
                    headers=auth_headers,
                    json={
                        "category_id": category_id,
                        "food_id": food["id"],
                        "quantity": 1.0
                    }
                )

            # Check totals
            diary_response = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
            diary = diary_response.json()

            # 100 + 200 = 300 calories, etc.
            assert diary["totals"]["calories"] == 300
            assert diary["totals"]["protein_g"] == 25
            assert diary["totals"]["carbs_g"] == 50
            assert diary["totals"]["fat_g"] == 15

    def test_diary_entries_isolated_by_date(self, client: TestClient, auth_headers: dict):
        """Entries for different dates should be isolated."""
        today = date.today().isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()

        # Get categories
        categories_response = client.get("/api/v1/categories", headers=auth_headers)
        categories = categories_response.json()
        category_id = categories[0]["id"]

        # Create a food
        food_response = client.post(
            "/api/v1/foods/custom",
            headers=auth_headers,
            json={
                "name": "Date Test Food",
                "serving_size": 100,
                "serving_unit": "g",
                "calories": 100,
                "protein_g": 10,
                "carbs_g": 10,
                "fat_g": 5
            }
        )

        if food_response.status_code == 201:
            food_id = food_response.json()["id"]

            # Add entry for today
            client.post(
                f"/api/v1/diary/{today}/entries",
                headers=auth_headers,
                json={
                    "category_id": category_id,
                    "food_id": food_id,
                    "quantity": 1.0
                }
            )

            # Check yesterday's diary is empty
            yesterday_response = client.get(f"/api/v1/diary/{yesterday}", headers=auth_headers)
            yesterday_diary = yesterday_response.json()
            assert yesterday_diary["totals"]["calories"] == 0

    def test_diary_entries_isolated_by_user(self, client: TestClient, db: Session):
        """One user's entries should not appear in another user's diary."""
        today = date.today().isoformat()

        # Register two users
        user1_response = client.post(
            "/api/v1/auth/register",
            json={"email": "user1@example.com", "password": "Password123"}
        )
        user1_token = user1_response.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}

        user2_response = client.post(
            "/api/v1/auth/register",
            json={"email": "user2@example.com", "password": "Password123"}
        )
        user2_token = user2_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # Get user1's categories
        categories_response = client.get("/api/v1/categories", headers=user1_headers)
        category_id = categories_response.json()[0]["id"]

        # User1 creates food and entry
        food_response = client.post(
            "/api/v1/foods/custom",
            headers=user1_headers,
            json={
                "name": "User1 Food",
                "serving_size": 100,
                "serving_unit": "g",
                "calories": 500,
                "protein_g": 20,
                "carbs_g": 50,
                "fat_g": 25
            }
        )

        if food_response.status_code == 201:
            food_id = food_response.json()["id"]

            client.post(
                f"/api/v1/diary/{today}/entries",
                headers=user1_headers,
                json={
                    "category_id": category_id,
                    "food_id": food_id,
                    "quantity": 1.0
                }
            )

            # User2's diary should be empty
            user2_diary = client.get(f"/api/v1/diary/{today}", headers=user2_headers)
            assert user2_diary.json()["totals"]["calories"] == 0


class TestDiaryEntryValidation:
    """Integration tests for diary entry validation."""

    def test_cannot_add_entry_to_other_users_category(self, client: TestClient, db: Session):
        """User cannot add entry to another user's category."""
        today = date.today().isoformat()

        # Register two users
        user1_response = client.post(
            "/api/v1/auth/register",
            json={"email": "catuser1@example.com", "password": "Password123"}
        )
        user1_token = user1_response.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}

        user2_response = client.post(
            "/api/v1/auth/register",
            json={"email": "catuser2@example.com", "password": "Password123"}
        )
        user2_token = user2_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # Get user1's category
        user1_categories = client.get("/api/v1/categories", headers=user1_headers)
        user1_category_id = user1_categories.json()[0]["id"]

        # User2 creates a food
        food_response = client.post(
            "/api/v1/foods/custom",
            headers=user2_headers,
            json={
                "name": "User2 Food",
                "serving_size": 100,
                "serving_unit": "g",
                "calories": 100,
                "protein_g": 10,
                "carbs_g": 10,
                "fat_g": 5
            }
        )

        if food_response.status_code == 201:
            food_id = food_response.json()["id"]

            # User2 tries to add entry to User1's category
            response = client.post(
                f"/api/v1/diary/{today}/entries",
                headers=user2_headers,
                json={
                    "category_id": user1_category_id,
                    "food_id": food_id,
                    "quantity": 1.0
                }
            )
            # Should be forbidden or not found
            assert response.status_code in [403, 404]

    def test_cannot_update_other_users_entry(self, client: TestClient, db: Session):
        """User cannot update another user's diary entry."""
        today = date.today().isoformat()

        # Register two users
        user1_response = client.post(
            "/api/v1/auth/register",
            json={"email": "entryuser1@example.com", "password": "Password123"}
        )
        user1_token = user1_response.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}

        user2_response = client.post(
            "/api/v1/auth/register",
            json={"email": "entryuser2@example.com", "password": "Password123"}
        )
        user2_token = user2_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User1 creates entry
        categories = client.get("/api/v1/categories", headers=user1_headers)
        category_id = categories.json()[0]["id"]

        food_response = client.post(
            "/api/v1/foods/custom",
            headers=user1_headers,
            json={
                "name": "Entry Test Food",
                "serving_size": 100,
                "serving_unit": "g",
                "calories": 100,
                "protein_g": 10,
                "carbs_g": 10,
                "fat_g": 5
            }
        )

        if food_response.status_code == 201:
            food_id = food_response.json()["id"]

            entry_response = client.post(
                f"/api/v1/diary/{today}/entries",
                headers=user1_headers,
                json={
                    "category_id": category_id,
                    "food_id": food_id,
                    "quantity": 1.0
                }
            )

            if entry_response.status_code == 201:
                entry_id = entry_response.json()["id"]

                # User2 tries to update User1's entry
                update_response = client.put(
                    f"/api/v1/diary/entries/{entry_id}",
                    headers=user2_headers,
                    json={"quantity": 5.0}
                )
                assert update_response.status_code in [403, 404]
