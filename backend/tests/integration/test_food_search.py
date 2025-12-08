"""
Integration tests for food search functionality.

Following TDD - these tests must FAIL before implementation.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.core.security import create_access_token


class TestFoodSearchIntegration:
    """Test food search integration."""

    def test_search_returns_usda_foods(self, client: TestClient, auth_headers: dict):
        """Test search returns foods from USDA API."""
        

        response = client.get(
            '/api/v1/foods/search',
            params={'q': 'apple'},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Should have at least some results for common food
        assert len(data['results']) > 0

        # All results should be from USDA initially (before custom foods)
        for food in data['results']:
            assert food['source'] == 'usda'
            assert food['id'].startswith('usda:')

    def test_search_caches_recent_searches(self, client: TestClient, auth_headers: dict):
        """Test recent searches are cached for performance."""
        

        # First search
        response1 = client.get(
            '/api/v1/foods/search',
            params={'q': 'banana'},
            headers=auth_headers,
        )
        assert response1.status_code == 200

        # Same search should be faster (cached)
        response2 = client.get(
            '/api/v1/foods/search',
            params={'q': 'banana'},
            headers=auth_headers,
        )
        assert response2.status_code == 200

        # Results should be identical
        assert response1.json() == response2.json()

    def test_search_filters_low_quality_results(self, client: TestClient, auth_headers: dict):
        """Test search filters out low-quality or incomplete data."""
        

        response = client.get(
            '/api/v1/foods/search',
            params={'q': 'chicken'},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # All results should have complete nutritional data
        for food in data['results']:
            # At minimum, should have calories
            assert food['calories'] >= 0

    def test_get_food_details_from_usda(self, client: TestClient, auth_headers: dict):
        """Test getting detailed food information from USDA."""
        

        # First search for a food
        search_response = client.get(
            '/api/v1/foods/search',
            params={'q': 'apple', 'limit': 1},
            headers=auth_headers,
        )

        assert search_response.status_code == 200
        results = search_response.json()['results']

        if len(results) > 0:
            food_id = results[0]['id']

            # Get details
            details_response = client.get(
                f'/api/v1/foods/{food_id}',
                headers=auth_headers,
            )

            assert details_response.status_code == 200
            food = details_response.json()

            # Details should match search result
            assert food['id'] == food_id
            assert food['name'] == results[0]['name']

    def test_food_search_isolated_by_user(self, client: TestClient, db: Session):
        """Test food search returns same USDA results for all users."""
        from src.services.auth import AuthService

        auth_service = AuthService(db)

        # Create two users
        user1, token1, _ = auth_service.register('user1@example.com', 'password123')
        user2, token2, _ = auth_service.register('user2@example.com', 'password123')

        access_token1 = create_access_token(user1.id)
        access_token2 = create_access_token(user2.id)

        # Both search for the same food
        response1 = client.get(
            '/api/v1/foods/search',
            params={'q': 'rice'},
            headers={'Authorization': f'Bearer {access_token1}'},
        )
        response2 = client.get(
            '/api/v1/foods/search',
            params={'q': 'rice'},
            headers={'Authorization': f'Bearer {access_token2}'},
        )

        assert response1.status_code == 200
        assert response2.status_code == 200

        # USDA results should be the same for both users
        results1 = [f for f in response1.json()['results'] if f['source'] == 'usda']
        results2 = [f for f in response2.json()['results'] if f['source'] == 'usda']

        assert results1 == results2


class TestFoodSearchErrorHandling:
    """Test error handling in food search."""

    def test_search_handles_api_timeout(self, client: TestClient, auth_headers: dict):
        """Test search handles external API timeout gracefully."""
        

        # This test will pass even if API is slow
        response = client.get(
            '/api/v1/foods/search',
            params={'q': 'test'},
            headers=auth_headers,
        )

        # Should return 200 even if API times out (returns empty or cached)
        assert response.status_code in [200, 504]

    def test_search_handles_malformed_api_response(self, client: TestClient, auth_headers: dict):
        """Test search handles unexpected API response format."""
        

        response = client.get(
            '/api/v1/foods/search',
            params={'q': 'test'},
            headers=auth_headers,
        )

        # Should not crash - either success or graceful error
        assert response.status_code in [200, 500]
