#!/usr/bin/env python3
"""
Quick script to test USDA API connectivity.

Run this script to verify your USDA API key is working.
"""
import sys
import os

# Add parent directory to path so we can import from src
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.services.nutrition_api import USDAClient
from src.core.config import settings


def test_connection():
    """Test USDA API connection."""
    print("=" * 60)
    print("USDA API Connectivity Test")
    print("=" * 60)
    print()

    # Check if API key is configured
    if not settings.USDA_API_KEY:
        print("❌ ERROR: USDA_API_KEY is not configured!")
        print()
        print("To fix this:")
        print("1. Get a free API key at: https://api.data.gov/signup/")
        print("2. Create a .env file in the backend/ directory")
        print("3. Add the line: USDA_API_KEY=your_key_here")
        print()
        return False

    print(f"✓ API Key configured: {settings.USDA_API_KEY[:8]}...")
    print()

    # Try to create client
    try:
        client = USDAClient(api_key=settings.USDA_API_KEY)
        print("✓ USDA client initialized")
    except ValueError as e:
        print(f"❌ Failed to create client: {e}")
        return False

    # Try to search for a food
    print()
    print("Testing food search...")
    try:
        results = client.search_foods('apple', page_size=3)

        if not results:
            print("⚠️  Warning: No results returned for 'apple'")
            return False

        print(f"✓ Search successful! Found {len(results)} results")
        print()
        print("Sample results:")
        print("-" * 60)

        for i, food in enumerate(results, 1):
            print(f"{i}. {food.name}")
            print(f"   FDC ID: {food.fdc_id}")
            print(f"   Calories: {food.calories} kcal")
            print(f"   Protein: {food.protein_g}g | Carbs: {food.carbs_g}g | Fat: {food.fat_g}g")
            print()

    except Exception as e:
        print(f"❌ Search failed: {e}")
        print()
        print("Common issues:")
        print("- Invalid API key (get a new one at https://api.data.gov/signup/)")
        print("- Network connectivity problems")
        print("- API rate limit exceeded (wait an hour)")
        return False

    # Try to get food details
    print()
    print("Testing food details retrieval...")
    try:
        fdc_id = results[0].fdc_id
        food = client.get_food_details(fdc_id)

        if food:
            print(f"✓ Successfully retrieved details for: {food.name}")
            print(f"   Serving size: {food.serving_size}{food.serving_unit}")
        else:
            print("⚠️  Warning: Food details not found")

    except Exception as e:
        print(f"❌ Details retrieval failed: {e}")
        return False

    print()
    print("=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print()
    print("Your USDA API connection is working correctly!")
    print("You can now run the full test suite with:")
    print("  uv run pytest tests/live/test_usda_api_connectivity.py -v -s")
    print()

    return True


if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
