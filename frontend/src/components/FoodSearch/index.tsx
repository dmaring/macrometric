/**
 * FoodSearch component for searching nutrition database.
 *
 * Allows users to search for foods and displays nutritional information.
 */
import { useState, useEffect, useCallback } from 'react';
import { searchFoods, Food } from '../../services/foodSearch';
import './FoodSearch.css';

interface FoodSearchProps {
  onSelect: (food: Food) => void;
}

export default function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const foods = await searchFoods(searchQuery);
      setResults(foods);
    } catch (err) {
      console.error('Food search error:', err);
      setError('Error searching for foods. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Clear results immediately when query is empty
    if (newQuery.length === 0) {
      setResults([]);
      setError(null);
    }
  };

  const handleSelectFood = (food: Food) => {
    onSelect(food);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="food-search" data-testid="food-search">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search for foods..."
          value={query}
          onChange={handleQueryChange}
          aria-label="Search for foods"
        />
      </div>

      {isLoading && (
        <div className="search-status">Searching...</div>
      )}

      {error && (
        <div className="search-error">{error}</div>
      )}

      {!isLoading && !error && query.length >= 2 && results.length === 0 && (
        <div className="search-status">No foods found. Try a different search term.</div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((food) => (
            <button
              key={food.id}
              className="search-result-item"
              onClick={() => handleSelectFood(food)}
              type="button"
            >
              <div className="result-name">{food.name}</div>
              <div className="result-macros">
                <span className="macro-item">
                  {food.calories !== null && food.calories !== undefined
                    ? `${food.calories} cal`
                    : 'Cal: N/A'}
                </span>
                <span className="macro-item">
                  {food.protein_g !== null && food.protein_g !== undefined
                    ? `${food.protein_g}g protein`
                    : 'Protein: N/A'}
                </span>
                <span className="macro-item">
                  {food.carbs_g !== null && food.carbs_g !== undefined
                    ? `${food.carbs_g}g carbs`
                    : 'Carbs: N/A'}
                </span>
                <span className="macro-item">
                  {food.fat_g !== null && food.fat_g !== undefined
                    ? `${food.fat_g}g fat`
                    : 'Fat: N/A'}
                </span>
              </div>
              <div className="result-serving">
                {food.serving_size && food.serving_unit
                  ? `Per ${food.serving_size}${food.serving_unit}`
                  : 'Serving size: N/A'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
