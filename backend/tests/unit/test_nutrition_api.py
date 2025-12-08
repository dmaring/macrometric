"""
Unit tests for USDA FoodData Central API client.

Following TDD - these tests must FAIL before implementation.
"""
import pytest
from unittest.mock import Mock, patch
from src.services.nutrition_api import USDAClient, USDAFood


class TestUSDAClient:
    """Test USDA API client."""

    @pytest.fixture
    def client(self):
        """Create client instance."""
        return USDAClient()

    def test_search_foods_returns_results(self, client):
        """Test searching for foods returns list of USDAFood objects."""
        with patch.object(client.client, 'get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: {
                    'foods': [
                        {
                            'fdcId': 123456,
                            'description': 'Apple, raw',
                            'foodNutrients': [
                                {'nutrientName': 'Energy', 'value': 52},
                                {'nutrientName': 'Protein', 'value': 0.26},
                                {'nutrientName': 'Carbohydrate, by difference', 'value': 13.81},
                                {'nutrientName': 'Total lipid (fat)', 'value': 0.17},
                            ],
                        }
                    ]
                }
            )

            results = client.search_foods('apple', page_size=10)

            assert len(results) == 1
            assert isinstance(results[0], USDAFood)
            assert results[0].fdc_id == '123456'
            assert results[0].name == 'Apple, raw'
            assert results[0].calories == 52
            assert results[0].protein_g == 0.26
            assert results[0].carbs_g == 13.81
            assert results[0].fat_g == 0.17

    def test_search_foods_handles_empty_results(self, client):
        """Test search returns empty list when no results."""
        with patch.object(client.client, 'get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: {'foods': []}
            )

            results = client.search_foods('nonexistentfood123')

            assert results == []

    def test_search_foods_handles_missing_nutrients(self, client):
        """Test search handles foods with missing nutrient data."""
        with patch.object(client.client, 'get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: {
                    'foods': [
                        {
                            'fdcId': 123456,
                            'description': 'Unknown Food',
                            'foodNutrients': [
                                {'nutrientName': 'Energy', 'value': 100},
                            ],
                        }
                    ]
                }
            )

            results = client.search_foods('unknown')

            assert len(results) == 1
            assert results[0].calories == 100
            assert results[0].protein_g == 0
            assert results[0].carbs_g == 0
            assert results[0].fat_g == 0

    def test_get_food_details_returns_food(self, client):
        """Test getting detailed food information."""
        with patch.object(client.client, 'get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: {
                    'fdcId': 123456,
                    'description': 'Banana, raw',
                    'foodNutrients': [
                        {'nutrient': {'name': 'Energy'}, 'amount': 89},
                        {'nutrient': {'name': 'Protein'}, 'amount': 1.09},
                        {'nutrient': {'name': 'Carbohydrate, by difference'}, 'amount': 22.84},
                        {'nutrient': {'name': 'Total lipid (fat)'}, 'amount': 0.33},
                    ],
                    'servingSize': 100,
                    'servingSizeUnit': 'g',
                }
            )

            food = client.get_food_details('123456')

            assert food.fdc_id == '123456'
            assert food.name == 'Banana, raw'
            assert food.calories == 89
            assert food.protein_g == 1.09
            assert food.carbs_g == 22.84
            assert food.fat_g == 0.33
            assert food.serving_size == 100
            assert food.serving_unit == 'g'

    def test_get_food_details_handles_404(self, client):
        """Test getting details for non-existent food returns None."""
        with patch.object(client.client, 'get') as mock_get:
            mock_get.return_value = Mock(status_code=404)

            food = client.get_food_details('999999')

            assert food is None

    def test_search_foods_handles_api_error(self, client):
        """Test search handles API errors gracefully."""
        with patch.object(client.client, 'get') as mock_get:
            mock_get.side_effect = Exception('Network error')

            with pytest.raises(Exception) as exc_info:
                client.search_foods('apple')

            assert 'Network error' in str(exc_info.value)

    def test_search_foods_respects_page_size(self, client):
        """Test search uses specified page size parameter."""
        with patch.object(client.client, 'get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: {'foods': []}
            )

            client.search_foods('apple', page_size=25)

            # Verify API was called with correct page size
            call_args = mock_get.call_args
            assert 'params' in call_args.kwargs
            assert call_args.kwargs['params']['pageSize'] == 25


class TestUSDAFood:
    """Test USDAFood data class."""

    def test_usda_food_creation(self):
        """Test creating USDAFood with all fields."""
        food = USDAFood(
            fdc_id='123456',
            name='Apple, raw',
            calories=52,
            protein_g=0.26,
            carbs_g=13.81,
            fat_g=0.17,
            serving_size=100,
            serving_unit='g',
        )

        assert food.fdc_id == '123456'
        assert food.name == 'Apple, raw'
        assert food.calories == 52
        assert food.protein_g == 0.26
        assert food.carbs_g == 13.81
        assert food.fat_g == 0.17
        assert food.serving_size == 100
        assert food.serving_unit == 'g'

    def test_usda_food_defaults(self):
        """Test USDAFood with default values."""
        food = USDAFood(
            fdc_id='123456',
            name='Unknown Food',
        )

        assert food.calories == 0
        assert food.protein_g == 0
        assert food.carbs_g == 0
        assert food.fat_g == 0
        assert food.serving_size == 100
        assert food.serving_unit == 'g'
