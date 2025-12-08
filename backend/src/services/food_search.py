"""
Food search service combining USDA API and custom foods.

Provides unified search across multiple food sources with caching.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
from src.services.nutrition_api import USDAClient, USDAFood
from src.services.custom_foods import CustomFoodsService


class FoodSearchResult:
    """Unified food search result from any source."""

    def __init__(
        self,
        id: str,
        name: str,
        source: str,
        calories: float,
        protein_g: float,
        carbs_g: float,
        fat_g: float,
        serving_size: float = 100,
        serving_unit: str = 'g',
    ):
        self.id = id
        self.name = name
        self.source = source  # 'usda' or 'custom'
        self.calories = calories
        self.protein_g = protein_g
        self.carbs_g = carbs_g
        self.fat_g = fat_g
        self.serving_size = serving_size
        self.serving_unit = serving_unit

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            'id': self.id,
            'name': self.name,
            'source': self.source,
            'calories': self.calories,
            'protein_g': self.protein_g,
            'carbs_g': self.carbs_g,
            'fat_g': self.fat_g,
            'serving_size': self.serving_size,
            'serving_unit': self.serving_unit,
        }


class FoodSearchService:
    """Service for searching foods across multiple sources."""

    # Simple in-memory cache for recent searches
    _cache: dict = {}
    _cache_ttl = timedelta(minutes=15)

    def __init__(self, db: Session, usda_api_key: Optional[str] = None):
        """
        Initialize food search service.

        Args:
            db: Database session
            usda_api_key: Optional USDA API key for higher rate limits
        """
        self.db = db
        self.usda_client = USDAClient(api_key=usda_api_key)
        self.custom_foods_service = CustomFoodsService(db)

    def search(self, query: str, user_id: Optional[UUID] = None, limit: int = 10) -> List[FoodSearchResult]:
        """
        Search for foods across all sources.

        Args:
            query: Search term
            limit: Maximum number of results

        Returns:
            List of FoodSearchResult objects
        """
        if not query or len(query.strip()) == 0:
            return []

        # Check cache first
        cache_key = f"{query.lower()}:{limit}"
        if cache_key in self._cache:
            cached_data, cached_time = self._cache[cache_key]
            if datetime.utcnow() - cached_time < self._cache_ttl:
                return cached_data

        results = []

        # Search custom foods first (if user_id provided)
        if user_id:
            custom_foods = self.custom_foods_service.search_custom_foods(user_id, query)
            for food in custom_foods:
                results.append(
                    FoodSearchResult(
                        id=f'custom:{food.id}',
                        name=food.name,
                        source='custom',
                        calories=food.calories,
                        protein_g=float(food.protein_g),
                        carbs_g=float(food.carbs_g),
                        fat_g=float(food.fat_g),
                        serving_size=float(food.serving_size),
                        serving_unit=food.serving_unit,
                    )
                )

        # Search USDA API
        try:
            usda_foods = self.usda_client.search_foods(query, page_size=limit)
            for food in usda_foods:
                results.append(
                    FoodSearchResult(
                        id=f'usda:{food.fdc_id}',
                        name=food.name,
                        source='usda',
                        calories=food.calories,
                        protein_g=food.protein_g,
                        carbs_g=food.carbs_g,
                        fat_g=food.fat_g,
                        serving_size=food.serving_size,
                        serving_unit=food.serving_unit,
                    )
                )
        except Exception as e:
            # Log error but don't fail - return whatever we have
            print(f"USDA API error: {e}")

        # Cache results
        self._cache[cache_key] = (results, datetime.utcnow())

        return results[:limit]

    def get_food(self, food_id: str, user_id: Optional[UUID] = None) -> Optional[FoodSearchResult]:
        """
        Get detailed information for a specific food.

        Args:
            food_id: Food identifier (format: "source:id")
            user_id: Optional user ID for custom food lookup

        Returns:
            FoodSearchResult or None if not found
        """
        try:
            source, item_id = food_id.split(':', 1)
        except ValueError:
            return None

        if source == 'custom' and user_id:
            try:
                food = self.custom_foods_service.get_custom_food(user_id, UUID(item_id))
                if food:
                    return FoodSearchResult(
                        id=food_id,
                        name=food.name,
                        source='custom',
                        calories=food.calories,
                        protein_g=float(food.protein_g),
                        carbs_g=float(food.carbs_g),
                        fat_g=float(food.fat_g),
                        serving_size=float(food.serving_size),
                        serving_unit=food.serving_unit,
                    )
            except (ValueError, Exception):
                return None

        elif source == 'usda':
            try:
                food = self.usda_client.get_food_details(item_id)
                if food:
                    return FoodSearchResult(
                        id=food_id,
                        name=food.name,
                        source='usda',
                        calories=food.calories,
                        protein_g=food.protein_g,
                        carbs_g=food.carbs_g,
                        fat_g=food.fat_g,
                        serving_size=food.serving_size,
                        serving_unit=food.serving_unit,
                    )
            except Exception:
                return None

        return None
