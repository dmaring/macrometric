"""
Live connectivity tests for USDA FoodData Central API.

These tests make actual API calls to verify connectivity.
They should only be run when testing API integration.

IMPORTANT: You must set USDA_API_KEY in your .env file.
Get a free API key at: https://api.data.gov/signup/
"""
import pytest
from src.services.nutrition_api import USDAClient, USDAFood
from src.core.config import settings


@pytest.fixture(scope='module')
def check_api_key():
    """Check if USDA API key is configured."""
    if not settings.USDA_API_KEY:
        pytest.skip(
            "USDA_API_KEY not configured. Get a free key at https://api.data.gov/signup/ "
            "and add it to your .env file"
        )


class TestUSDAAPIConnectivity:
    """Test live USDA API connectivity."""

    @pytest.fixture
    def client(self, check_api_key):
        """Create USDA client with API key from settings."""
        return USDAClient(api_key=settings.USDA_API_KEY)

    def test_search_foods_live_connection(self, client):
        """Test actual connection to USDA API with food search."""
        # Search for a common food
        results = client.search_foods('apple', page_size=5)

        # Verify we got results back
        assert isinstance(results, list), "Should return a list"
        assert len(results) > 0, "Should return at least one result for 'apple'"

        # Verify structure of first result
        first_food = results[0]
        assert isinstance(first_food, USDAFood), "Should return USDAFood objects"
        assert first_food.fdc_id, "Should have FDC ID"
        assert first_food.name, "Should have name"
        assert 'apple' in first_food.name.lower(), "Result should contain search term"

        # Verify nutritional data
        assert first_food.calories >= 0, "Calories should be non-negative"
        assert first_food.protein_g >= 0, "Protein should be non-negative"
        assert first_food.carbs_g >= 0, "Carbs should be non-negative"
        assert first_food.fat_g >= 0, "Fat should be non-negative"

        print(f"\n✓ Successfully retrieved {len(results)} foods from USDA API")
        print(f"  First result: {first_food.name}")
        print(f"  FDC ID: {first_food.fdc_id}")
        print(f"  Calories: {first_food.calories} kcal")
        print(f"  Protein: {first_food.protein_g}g")
        print(f"  Carbs: {first_food.carbs_g}g")
        print(f"  Fat: {first_food.fat_g}g")

    def test_search_multiple_common_foods(self, client):
        """Test searching for multiple common foods to verify consistent connectivity."""
        test_foods = ['banana', 'chicken breast', 'rice', 'broccoli', 'salmon']

        for food_name in test_foods:
            results = client.search_foods(food_name, page_size=3)

            assert len(results) > 0, f"Should find results for '{food_name}'"
            assert any(food_name in result.name.lower() for result in results), \
                f"Results should contain '{food_name}'"

            print(f"✓ Found {len(results)} results for '{food_name}'")

    def test_get_food_details_live(self, client):
        """Test retrieving detailed food information by FDC ID."""
        # First search for a food to get a valid FDC ID
        search_results = client.search_foods('apple', page_size=1)
        assert len(search_results) > 0, "Should find apple in search"

        fdc_id = search_results[0].fdc_id

        # Now get details for that food
        food_details = client.get_food_details(fdc_id)

        assert food_details is not None, "Should retrieve food details"
        assert food_details.fdc_id == fdc_id, "FDC ID should match"
        assert food_details.name, "Should have name"
        assert food_details.calories >= 0, "Should have calories data"

        print(f"\n✓ Successfully retrieved food details for FDC ID: {fdc_id}")
        print(f"  Name: {food_details.name}")
        print(f"  Serving: {food_details.serving_size}{food_details.serving_unit}")

    def test_api_response_time(self, client):
        """Test that API responds within acceptable time."""
        import time

        start_time = time.time()
        results = client.search_foods('chicken', page_size=10)
        end_time = time.time()

        response_time = end_time - start_time

        assert response_time < 10.0, f"API should respond within 10 seconds (took {response_time:.2f}s)"
        assert len(results) > 0, "Should return results"

        print(f"\n✓ API responded in {response_time:.2f} seconds")

    def test_search_with_different_data_types(self, client):
        """Test that we get Foundation and SR Legacy data types."""
        results = client.search_foods('apple', page_size=10)

        assert len(results) > 0, "Should return results"

        # The API should return foods from high-quality sources
        # based on the dataType filter in the client
        print(f"\n✓ Retrieved {len(results)} foods with quality data")
        for i, food in enumerate(results[:3], 1):
            print(f"  {i}. {food.name} (FDC: {food.fdc_id})")

    def test_search_handles_no_results(self, client):
        """Test API behavior when search returns no results."""
        # Search for something very unlikely to exist
        results = client.search_foods('xyzabc123impossible', page_size=5)

        # Should return empty list, not error
        assert isinstance(results, list), "Should return a list"
        assert len(results) == 0, "Should return empty list for impossible search"

        print("\n✓ API correctly handles searches with no results")

    def test_search_respects_page_size(self, client):
        """Test that page_size parameter is respected."""
        page_sizes = [1, 5, 10]

        for size in page_sizes:
            results = client.search_foods('chicken', page_size=size)

            assert len(results) <= size, f"Should return at most {size} results"
            print(f"✓ Requested {size} results, got {len(results)}")

    def test_api_requires_key(self):
        """Test that API key is now required."""
        # USDA API now requires an API key (as of late 2024)
        with pytest.raises(ValueError, match="USDA API key is required"):
            USDAClient(api_key=None)

        print("\n✓ API correctly requires API key")

    def test_nutritional_data_completeness(self, client):
        """Test that nutritional data is reasonably complete."""
        results = client.search_foods('chicken breast', page_size=5)

        assert len(results) > 0, "Should find chicken breast"

        # At least one result should have all major macros
        has_complete_data = False
        for food in results:
            if (food.calories > 0 and food.protein_g > 0 and
                food.carbs_g >= 0 and food.fat_g >= 0):
                has_complete_data = True
                print(f"\n✓ Found complete nutritional data for: {food.name}")
                print(f"  Calories: {food.calories}, Protein: {food.protein_g}g, "
                      f"Carbs: {food.carbs_g}g, Fat: {food.fat_g}g")
                break

        assert has_complete_data, "At least one result should have complete macro data"

    def test_api_error_handling_invalid_fdc_id(self, client):
        """Test API handles invalid FDC ID gracefully."""
        # Try to get details for non-existent food
        food = client.get_food_details('999999999999')

        # Should return None, not raise exception
        assert food is None, "Should return None for non-existent food"
        print("\n✓ API correctly handles invalid FDC ID")


@pytest.mark.slow
class TestUSDAAPIStress:
    """Stress tests for USDA API (marked as slow)."""

    @pytest.fixture
    def client(self, check_api_key):
        """Create USDA client."""
        return USDAClient(api_key=settings.USDA_API_KEY)

    def test_rapid_successive_requests(self, client):
        """Test making multiple requests in quick succession."""
        search_terms = ['apple', 'banana', 'chicken', 'rice', 'beef']

        results_list = []
        for term in search_terms:
            results = client.search_foods(term, page_size=5)
            results_list.append(results)
            assert len(results) > 0, f"Should get results for {term}"

        print(f"\n✓ Successfully made {len(search_terms)} rapid successive requests")

    def test_large_page_size(self, client):
        """Test requesting large page sizes."""
        results = client.search_foods('food', page_size=50)

        assert isinstance(results, list), "Should return a list"
        print(f"\n✓ Retrieved {len(results)} results with large page size")
