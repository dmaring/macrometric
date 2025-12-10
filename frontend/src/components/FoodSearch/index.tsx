/**
 * FoodSearch component for searching nutrition database.
 *
 * Allows users to search for foods and displays nutritional information.
 */
import { useState, useEffect, useCallback } from 'react';
import { searchFoods, Food } from '../../services/foodSearch';

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
      const response = await searchFoods(searchQuery);
      setResults(response.results);
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
    <div className="w-full relative" data-testid="food-search">
      <div className="mb-2">
        <input
          type="text"
          className="w-full px-4 py-3 text-base border-2 border-border rounded-lg transition-colors duration-200 focus:outline-none focus:border-primary bg-surface text-content placeholder:text-content-tertiary min-h-[44px]"
          placeholder="Search for foods..."
          value={query}
          onChange={handleQueryChange}
          aria-label="Search for foods"
        />
      </div>

      {isLoading && (
        <div className="p-4 text-center text-content-secondary text-sm">Searching...</div>
      )}

      {error && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-md text-error text-sm">{error}</div>
      )}

      {!isLoading && !error && query.length >= 2 && results.length === 0 && (
        <div className="p-4 text-center text-content-secondary text-sm">No foods found. Try a different search term.</div>
      )}

      {results.length > 0 && (
        <div className="max-h-96 overflow-y-auto border border-border rounded-lg bg-surface">
          {results.map((food) => (
            <button
              key={food.id}
              className="w-full p-4 text-left border-none border-b border-border bg-surface cursor-pointer transition-colors duration-200 hover:bg-surface-secondary last:border-b-0 min-h-[44px]"
              onClick={() => handleSelectFood(food)}
              type="button"
            >
              <div className="font-semibold text-content mb-2">{food.name}</div>
              <div className="flex flex-wrap gap-4 mb-1">
                <span className="text-sm text-content-secondary">
                  {food.calories !== null && food.calories !== undefined
                    ? `${food.calories} cal`
                    : 'Cal: N/A'}
                </span>
                <span className="text-sm text-content-secondary">
                  {food.protein_g !== null && food.protein_g !== undefined
                    ? `${food.protein_g}g protein`
                    : 'Protein: N/A'}
                </span>
                <span className="text-sm text-content-secondary">
                  {food.carbs_g !== null && food.carbs_g !== undefined
                    ? `${food.carbs_g}g carbs`
                    : 'Carbs: N/A'}
                </span>
                <span className="text-sm text-content-secondary">
                  {food.fat_g !== null && food.fat_g !== undefined
                    ? `${food.fat_g}g fat`
                    : 'Fat: N/A'}
                </span>
              </div>
              <div className="text-xs text-content-tertiary">
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
