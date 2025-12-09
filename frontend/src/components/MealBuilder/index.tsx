/**
 * MealBuilder Component
 *
 * Allows users to create or edit custom meals by:
 * - Entering a meal name
 * - Searching for foods
 * - Adding foods with quantities
 * - Viewing real-time nutritional totals
 * - Saving the meal preset
 */
import React, { useState, useCallback, useEffect } from 'react';
import { searchFoods, Food } from '../../services/foods';
import { CustomMeal, CreateMealRequest } from '../../services/meals';

interface MealBuilderProps {
  meal?: CustomMeal;
  onSave: (mealData: CreateMealRequest) => void;
  onCancel: () => void;
}

interface MealItemInBuilder {
  food: Food;
  quantity: number;
  is_deleted?: boolean;
}

const MealBuilder: React.FC<MealBuilderProps> = ({ meal, onSave, onCancel }) => {
  const [name, setName] = useState(meal?.name || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [mealItems, setMealItems] = useState<MealItemInBuilder[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Load existing meal items if editing
  useEffect(() => {
    if (meal?.items) {
      const items: MealItemInBuilder[] = meal.items.map((item) => ({
        food: {
          id: item.food.id,
          name: item.food.name,
          brand: item.food.brand,
          source: item.food.source as 'usda' | 'custom',
          calories: item.food.calories,
          protein_g: item.food.protein_g,
          carbs_g: item.food.carbs_g,
          fat_g: item.food.fat_g,
          serving_size: item.food.serving_size,
          serving_unit: item.food.serving_unit,
        },
        quantity: item.quantity,
        is_deleted: item.is_deleted,
      }));
      setMealItems(items);
    }
  }, [meal]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const results = await searchFoods(searchQuery, 10);
        setSearchResults(results.results);
      } catch (error) {
        setSearchError('Error searching for foods');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddFood = useCallback(
    (food: Food) => {
      // Check if food already added
      if (mealItems.some((item) => item.food.id === food.id)) {
        setSearchError('Food already added to meal');
        return;
      }

      setMealItems((prev) => [
        ...prev,
        {
          food,
          quantity: 1,
        },
      ]);
      setSearchQuery('');
      setSearchResults([]);
      setSearchError('');
    },
    [mealItems]
  );

  const handleQuantityChange = useCallback((index: number, quantity: number) => {
    setMealItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.max(0.01, quantity) };
      return updated;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setMealItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const calculateTotals = useCallback(() => {
    return mealItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.food.calories * item.quantity,
        protein_g: acc.protein_g + item.food.protein_g * item.quantity,
        carbs_g: acc.carbs_g + item.food.carbs_g * item.quantity,
        fat_g: acc.fat_g + item.food.fat_g * item.quantity,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
  }, [mealItems]);

  const handleSave = useCallback(() => {
    setValidationError('');

    // Validate meal name
    if (!name.trim()) {
      setValidationError('Meal name is required');
      return;
    }

    // Validate at least one item
    if (mealItems.length === 0) {
      setValidationError('Add at least one food to the meal');
      return;
    }

    // Build meal data
    const mealData: CreateMealRequest = {
      name: name.trim(),
      items: mealItems.map((item) => ({
        food_id: item.food.id,
        quantity: item.quantity,
      })),
    };

    onSave(mealData);
  }, [name, mealItems, onSave]);

  const totals = calculateTotals();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-surface rounded-lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="meal-name" className="font-semibold text-content">Meal Name</label>
          <input
            id="meal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Breakfast Combo"
            maxLength={100}
            className="w-full px-4 py-3 border border-border rounded-lg bg-surface-tertiary text-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="flex flex-col gap-2 relative">
          <label htmlFor="food-search" className="font-semibold text-content">Add Foods</label>
          <input
            id="food-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search foods to add..."
            className="w-full px-4 py-3 border border-border rounded-lg bg-surface-tertiary text-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          {isSearching && <div className="text-sm text-content-secondary italic mt-2">Searching...</div>}

          {searchError && <div className="text-sm text-error bg-error/10 rounded px-3 py-2 mt-2">{searchError}</div>}

          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-surface border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {searchResults.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-4 hover:bg-surface-secondary transition-colors border-b border-border last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium text-content">{food.name}</div>
                    <div className="text-xs text-content-secondary mt-1">
                      {food.calories} cal • {food.protein_g}g protein • {food.carbs_g}g carbs •{' '}
                      {food.fat_g}g fat
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddFood(food)}
                    className="px-4 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-primary-hover transition-colors min-h-[44px] ml-4"
                    aria-label={`Add ${food.name}`}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {mealItems.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-content">Meal Items</h3>
            {mealItems.map((item, index) => (
              <div key={`${item.food.id}-${index}`} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-surface-secondary rounded-lg border border-border">
                <div className="flex-1">
                  <div className="font-medium text-content">
                    {item.food.name}
                    {item.is_deleted && <span className="text-error text-sm italic ml-2"> (deleted)</span>}
                  </div>
                  <div className="text-sm text-content-secondary mt-1">
                    {item.food.serving_size} {item.food.serving_unit}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.01"
                    step="0.1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-border rounded bg-surface text-content text-center focus:outline-none focus:border-primary"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="px-4 py-2 bg-error text-white rounded font-semibold text-sm hover:bg-error/90 transition-colors min-h-[44px]"
                    aria-label={`Remove ${item.food.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {mealItems.length > 0 && (
          <div className="bg-surface-secondary rounded-lg p-5 border border-border">
            <h3 className="text-lg font-semibold text-content mb-4">Meal Totals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-3 bg-surface rounded">
                <span className="text-sm text-content-secondary mb-1">Calories</span>
                <span className="text-2xl font-bold text-content">{Math.round(totals.calories)}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-surface rounded">
                <span className="text-sm text-content-secondary mb-1">Protein</span>
                <span className="text-2xl font-bold text-content">{totals.protein_g.toFixed(1)}g</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-surface rounded">
                <span className="text-sm text-content-secondary mb-1">Carbs</span>
                <span className="text-2xl font-bold text-content">{totals.carbs_g.toFixed(1)}g</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-surface rounded">
                <span className="text-sm text-content-secondary mb-1">Fat</span>
                <span className="text-2xl font-bold text-content">{totals.fat_g.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        )}

        {validationError && <div className="p-4 bg-error/10 text-error rounded-lg text-sm font-medium">{validationError}</div>}

        <div className="flex gap-4">
          <button type="button" onClick={handleSave} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold text-base hover:bg-primary-hover transition-colors min-h-[44px]">
            Save Meal
          </button>
          <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 bg-surface-tertiary text-content-secondary rounded-lg font-semibold text-base hover:bg-border transition-colors min-h-[44px]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealBuilder;
