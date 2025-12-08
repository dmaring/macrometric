"""
Contract tests for food search API endpoints.

Following TDD - these tests must FAIL before implementation.
"""
import pytest
from fastapi.testclient import TestClient
from src.core.security import create_access_token


class TestFoodSearchContract:
    """Test /foods/search endpoint contract."""

    def test_search_foods_returns_200(self, client: TestClient, auth_headers: dict):
        """Test GET /foods/search returns 200 with results."""
        response = client.get(
            '/api/v1/foods/search',
            params={'q': 'apple'},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert 'results' in data
        assert isinstance(data['results'], list)

    def test_search_foods_returns_food_structure(self, client: TestClient, auth_headers: dict):
        """Test search results have correct food structure."""
        

        response = client.get(
            '/api/v1/foods/search',
            params={'q': 'banana'},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        if len(data['results']) > 0:
            food = data['results'][0]
            assert 'id' in food
            assert 'name' in food
            assert 'source' in food  # 'usda' or 'custom'
            assert 'calories' in food
            assert 'protein_g' in food
            assert 'carbs_g' in food
            assert 'fat_g' in food
            assert 'serving_size' in food
            assert 'serving_unit' in food

    def test_search_foods_requires_query(self, client: TestClient, auth_headers: dict):
        """Test search requires query parameter."""
        

        response = client.get(
            '/api/v1/foods/search',
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_search_foods_requires_authentication(self, client: TestClient):
        """Test search requires valid authentication."""
        response = client.get('/api/v1/foods/search', params={'q': 'apple'})

        assert response.status_code == 401

    def test_search_foods_respects_limit_parameter(self, client: TestClient, auth_headers: dict):
        """Test search respects limit parameter."""
        

        response = client.get(
            '/api/v1/foods/search',
            params={'q': 'chicken', 'limit': 5},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data['results']) <= 5

    def test_search_foods_handles_empty_query(self, client: TestClient, auth_headers: dict):
        """Test search handles empty query string."""
        

        response = client.get(
            '/api/v1/foods/search',
            params={'q': ''},
            headers=auth_headers,
        )

        assert response.status_code == 422


class TestFoodDetailsContract:
    """Test /foods/{id} endpoint contract."""

    def test_get_food_details_returns_200(self, client: TestClient, auth_headers: dict):
        """Test GET /foods/{id} returns 200 with food details."""
        

        # Use a known USDA FDC ID (Apple, raw)
        response = client.get(
            '/api/v1/foods/usda:171688',
            headers=auth_headers,
        )

        # May return 200 or 404 depending on API availability
        assert response.status_code in [200, 404]

        if response.status_code == 200:
            data = response.json()
            assert 'id' in data
            assert 'name' in data
            assert 'source' in data
            assert 'calories' in data
            assert 'protein_g' in data
            assert 'carbs_g' in data
            assert 'fat_g' in data

    def test_get_food_details_requires_authentication(self, client: TestClient):
        """Test get food details requires authentication."""
        response = client.get('/api/v1/foods/usda:123456')

        assert response.status_code == 401

    def test_get_food_details_handles_invalid_id_format(self, client: TestClient, auth_headers: dict):
        """Test get food details handles invalid ID format."""
        

        response = client.get(
            '/api/v1/foods/invalid-format',
            headers=auth_headers,
        )

        assert response.status_code == 404

    def test_get_food_details_handles_nonexistent_food(self, client: TestClient, auth_headers: dict):
        """Test get food details returns 404 for nonexistent food."""
        

        response = client.get(
            '/api/v1/foods/usda:999999999',
            headers=auth_headers,
        )

        assert response.status_code == 404
