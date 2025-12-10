"""
USDA FoodData Central API client.

Provides access to USDA's comprehensive food nutrition database.
"""
from dataclasses import dataclass
from typing import List, Optional
import httpx


@dataclass
class USDAFood:
    """
    Represents a food item from USDA FoodData Central.

    All nutrient values are per 100g serving unless otherwise specified.
    """
    fdc_id: str
    name: str
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    serving_size: float = 100
    serving_unit: str = 'g'


class USDAClient:
    """Client for USDA FoodData Central API."""

    BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize USDA API client.

        Args:
            api_key: USDA API key (required). Get one at https://api.data.gov/signup/

        Raises:
            ValueError: If api_key is not provided
        """
        if not api_key:
            raise ValueError(
                "USDA API key is required. Get one at https://api.data.gov/signup/ "
                "and set USDA_API_KEY in your .env file"
            )
        self.api_key = api_key
        self.client = httpx.Client(timeout=10.0)

    def search_foods(self, query: str, page_size: int = 10) -> List[USDAFood]:
        """
        Search for foods by name.

        Args:
            query: Search term (e.g., "apple", "chicken breast")
            page_size: Maximum number of results to return (default: 10)

        Returns:
            List of USDAFood objects matching the search query.

        Raises:
            Exception: If API request fails
        """
        params = {
            'query': query,
            'pageSize': page_size,
            'dataType': ['Foundation', 'SR Legacy'],  # Highest quality data
            'api_key': self.api_key,
        }

        response = self.client.get(f'{self.BASE_URL}/foods/search', params=params)

        if response.status_code == 403:
            raise Exception(
                'USDA API access forbidden. Check your API key or get one at '
                'https://api.data.gov/signup/'
            )
        if response.status_code != 200:
            raise Exception(f'USDA API error: {response.status_code}')

        data = response.json()
        foods = []

        for item in data.get('foods', []):
            food = self._parse_search_result(item)
            if food:
                foods.append(food)

        return foods

    def get_food_details(self, fdc_id: str) -> Optional[USDAFood]:
        """
        Get detailed information for a specific food.

        Args:
            fdc_id: USDA FoodData Central ID

        Returns:
            USDAFood object with detailed information, or None if not found.
        """
        params = {'api_key': self.api_key}

        response = self.client.get(f'{self.BASE_URL}/food/{fdc_id}', params=params)

        if response.status_code == 404:
            return None

        if response.status_code == 403:
            raise Exception(
                'USDA API access forbidden. Check your API key or get one at '
                'https://api.data.gov/signup/'
            )
        if response.status_code != 200:
            raise Exception(f'USDA API error: {response.status_code}')

        data = response.json()
        return self._parse_food_details(data)

    def _parse_search_result(self, item: dict) -> Optional[USDAFood]:
        """Parse a food item from search results."""
        try:
            # Extract nutrients from search result format
            nutrients = {
                'Energy': 0,
                'Protein': 0,
                'Carbohydrate, by difference': 0,
                'Total lipid (fat)': 0,
            }

            for nutrient in item.get('foodNutrients', []):
                nutrient_name = nutrient.get('nutrientName', '')
                value = nutrient.get('value', 0)

                if nutrient_name == 'Energy':
                    nutrients['Energy'] = value
                elif nutrient_name == 'Protein':
                    nutrients['Protein'] = value
                elif nutrient_name == 'Carbohydrate, by difference':
                    nutrients['Carbohydrate, by difference'] = value
                elif nutrient_name == 'Total lipid (fat)':
                    nutrients['Total lipid (fat)'] = value

            return USDAFood(
                fdc_id=str(item['fdcId']),
                name=item['description'],
                calories=nutrients['Energy'],
                protein_g=nutrients['Protein'],
                carbs_g=nutrients['Carbohydrate, by difference'],
                fat_g=nutrients['Total lipid (fat)'],
            )
        except (KeyError, ValueError):
            return None

    def _parse_food_details(self, data: dict) -> Optional[USDAFood]:
        """Parse detailed food information."""
        try:
            # Extract nutrients from details format
            nutrients = {
                'Energy': 0,
                'Protein': 0,
                'Carbohydrate, by difference': 0,
                'Total lipid (fat)': 0,
            }

            for nutrient in data.get('foodNutrients', []):
                nutrient_name = nutrient.get('nutrient', {}).get('name', '')
                value = nutrient.get('amount', 0)

                if nutrient_name == 'Energy':
                    nutrients['Energy'] = value
                elif nutrient_name == 'Protein':
                    nutrients['Protein'] = value
                elif nutrient_name == 'Carbohydrate, by difference':
                    nutrients['Carbohydrate, by difference'] = value
                elif nutrient_name == 'Total lipid (fat)':
                    nutrients['Total lipid (fat)'] = value

            return USDAFood(
                fdc_id=str(data['fdcId']),
                name=data['description'],
                calories=nutrients['Energy'],
                protein_g=nutrients['Protein'],
                carbs_g=nutrients['Carbohydrate, by difference'],
                fat_g=nutrients['Total lipid (fat)'],
                serving_size=data.get('servingSize', 100),
                serving_unit=data.get('servingSizeUnit', 'g'),
            )
        except (KeyError, ValueError):
            return None

    def __del__(self):
        """Close HTTP client on cleanup."""
        self.client.close()
