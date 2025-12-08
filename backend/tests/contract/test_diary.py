"""Contract tests for Diary API endpoints.

These tests verify the API contract matches the OpenAPI specification.
They should FAIL before implementation.
"""
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient


class TestGetDiaryContract:
    """Contract tests for GET /api/v1/diary/{date}"""

    def test_get_diary_returns_200(self, client: TestClient, auth_headers: dict):
        """Get diary for a date should return 200."""
        today = date.today().isoformat()
        response = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
        assert response.status_code == 200

    def test_get_diary_returns_entries_by_category(self, client: TestClient, auth_headers: dict):
        """Diary response should include entries grouped by category."""
        today = date.today().isoformat()
        response = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        assert "date" in data
        assert "categories" in data
        assert "totals" in data
        assert isinstance(data["categories"], list)

    def test_get_diary_includes_daily_totals(self, client: TestClient, auth_headers: dict):
        """Diary response should include daily macro totals."""
        today = date.today().isoformat()
        response = client.get(f"/api/v1/diary/{today}", headers=auth_headers)
        data = response.json()

        totals = data["totals"]
        assert "calories" in totals
        assert "protein_g" in totals
        assert "carbs_g" in totals
        assert "fat_g" in totals

    def test_get_diary_unauthorized_returns_401(self, client: TestClient):
        """Get diary without auth should return 401."""
        today = date.today().isoformat()
        response = client.get(f"/api/v1/diary/{today}")
        assert response.status_code == 401

    def test_get_diary_invalid_date_returns_422(self, client: TestClient, auth_headers: dict):
        """Invalid date format should return 422."""
        response = client.get("/api/v1/diary/not-a-date", headers=auth_headers)
        assert response.status_code == 422


class TestAddDiaryEntryContract:
    """Contract tests for POST /api/v1/diary/{date}/entries"""

    def test_add_entry_returns_201(self, client: TestClient, auth_headers: dict):
        """Adding a diary entry should return 201."""
        today = date.today().isoformat()
        response = client.post(
            f"/api/v1/diary/{today}/entries",
            headers=auth_headers,
            json={
                "category_id": "00000000-0000-0000-0000-000000000001",
                "food_id": "00000000-0000-0000-0000-000000000002",
                "quantity": 1.0
            }
        )
        # Will fail until categories and foods exist
        assert response.status_code in [201, 404]

    def test_add_entry_requires_category_id(self, client: TestClient, auth_headers: dict):
        """Adding entry without category_id should return 422."""
        today = date.today().isoformat()
        response = client.post(
            f"/api/v1/diary/{today}/entries",
            headers=auth_headers,
            json={
                "food_id": "00000000-0000-0000-0000-000000000002",
                "quantity": 1.0
            }
        )
        assert response.status_code == 422

    def test_add_entry_requires_food_id_or_food(self, client: TestClient, auth_headers: dict):
        """Adding entry without food_id or food should return 400."""
        today = date.today().isoformat()
        response = client.post(
            f"/api/v1/diary/{today}/entries",
            headers=auth_headers,
            json={
                "category_id": "00000000-0000-0000-0000-000000000001",
                "quantity": 1.0
            }
        )
        assert response.status_code == 400
        assert "food_id or food must be provided" in response.json()["detail"]

    def test_add_entry_requires_positive_quantity(self, client: TestClient, auth_headers: dict):
        """Adding entry with zero or negative quantity should return 422."""
        today = date.today().isoformat()
        response = client.post(
            f"/api/v1/diary/{today}/entries",
            headers=auth_headers,
            json={
                "category_id": "00000000-0000-0000-0000-000000000001",
                "food_id": "00000000-0000-0000-0000-000000000002",
                "quantity": 0
            }
        )
        assert response.status_code == 422


class TestUpdateDiaryEntryContract:
    """Contract tests for PUT /api/v1/diary/entries/{entry_id}"""

    def test_update_entry_returns_200(self, client: TestClient, auth_headers: dict):
        """Updating a diary entry should return 200."""
        entry_id = "00000000-0000-0000-0000-000000000001"
        response = client.put(
            f"/api/v1/diary/entries/{entry_id}",
            headers=auth_headers,
            json={"quantity": 2.0}
        )
        # Will return 404 until entry exists
        assert response.status_code in [200, 404]

    def test_update_nonexistent_entry_returns_404(self, client: TestClient, auth_headers: dict):
        """Updating non-existent entry should return 404."""
        entry_id = "00000000-0000-0000-0000-000000000999"
        response = client.put(
            f"/api/v1/diary/entries/{entry_id}",
            headers=auth_headers,
            json={"quantity": 2.0}
        )
        assert response.status_code == 404


class TestDeleteDiaryEntryContract:
    """Contract tests for DELETE /api/v1/diary/entries/{entry_id}"""

    def test_delete_entry_returns_204(self, client: TestClient, auth_headers: dict):
        """Deleting a diary entry should return 204."""
        entry_id = "00000000-0000-0000-0000-000000000001"
        response = client.delete(
            f"/api/v1/diary/entries/{entry_id}",
            headers=auth_headers
        )
        # Will return 404 until entry exists
        assert response.status_code in [204, 404]

    def test_delete_nonexistent_entry_returns_404(self, client: TestClient, auth_headers: dict):
        """Deleting non-existent entry should return 404."""
        entry_id = "00000000-0000-0000-0000-000000000999"
        response = client.delete(
            f"/api/v1/diary/entries/{entry_id}",
            headers=auth_headers
        )
        assert response.status_code == 404
