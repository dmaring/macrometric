"""Contract tests for Categories API endpoints.

These tests verify the API contract matches the OpenAPI specification.
They should FAIL before implementation.
"""
import pytest
from fastapi.testclient import TestClient


class TestGetCategoriesContract:
    """Contract tests for GET /api/v1/categories"""

    def test_get_categories_returns_200(self, client: TestClient, auth_headers: dict):
        """Get categories should return 200."""
        response = client.get("/api/v1/categories", headers=auth_headers)
        assert response.status_code == 200

    def test_get_categories_returns_list(self, client: TestClient, auth_headers: dict):
        """Get categories should return a list."""
        response = client.get("/api/v1/categories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_categories_includes_default_categories(self, client: TestClient, auth_headers: dict):
        """New user should have default categories (Breakfast, Lunch, Dinner)."""
        response = client.get("/api/v1/categories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        category_names = [c["name"] for c in data]
        assert "Breakfast" in category_names
        assert "Lunch" in category_names
        assert "Dinner" in category_names

    def test_get_categories_sorted_by_display_order(self, client: TestClient, auth_headers: dict):
        """Categories should be sorted by display_order."""
        response = client.get("/api/v1/categories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        orders = [c["display_order"] for c in data]
        assert orders == sorted(orders)

    def test_category_has_required_fields(self, client: TestClient, auth_headers: dict):
        """Each category should have required fields."""
        response = client.get("/api/v1/categories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        for category in data:
            assert "id" in category
            assert "name" in category
            assert "display_order" in category
            assert "is_default" in category

    def test_get_categories_unauthorized_returns_401(self, client: TestClient):
        """Get categories without auth should return 401."""
        response = client.get("/api/v1/categories")
        assert response.status_code == 401
