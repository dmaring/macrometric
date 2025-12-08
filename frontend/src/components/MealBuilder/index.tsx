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
import './styles.css';

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
    <div className="meal-builder">
      <div className="meal-builder__form">
        <div className="meal-builder__field">
          <label htmlFor="meal-name">Meal Name</label>
          <input
            id="meal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Breakfast Combo"
            maxLength={100}
          />
        </div>

        <div className="meal-builder__field">
          <label htmlFor="food-search">Add Foods</label>
          <input
            id="food-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search foods to add..."
          />

          {isSearching && <div className="meal-builder__searching">Searching...</div>}

          {searchError && <div className="meal-builder__error">{searchError}</div>}

          {searchResults.length > 0 && (
            <div className="meal-builder__results">
              {searchResults.map((food) => (
                <div key={food.id} className="meal-builder__result-item">
                  <div className="meal-builder__result-info">
                    <div className="meal-builder__result-name">{food.name}</div>
                    <div className="meal-builder__result-nutrition">
                      {food.calories} cal • {food.protein_g}g protein • {food.carbs_g}g carbs •{' '}
                      {food.fat_g}g fat
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddFood(food)}
                    className="meal-builder__add-btn"
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
          <div className="meal-builder__items">
            <h3>Meal Items</h3>
            {mealItems.map((item, index) => (
              <div key={`${item.food.id}-${index}`} className="meal-builder__item">
                <div className="meal-builder__item-info">
                  <div className="meal-builder__item-name">
                    {item.food.name}
                    {item.is_deleted && <span className="meal-builder__deleted"> (deleted)</span>}
                  </div>
                  <div className="meal-builder__item-serving">
                    {item.food.serving_size} {item.food.serving_unit}
                  </div>
                </div>
                <div className="meal-builder__item-controls">
                  <input
                    type="number"
                    min="0.01"
                    step="0.1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                    className="meal-builder__quantity"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="meal-builder__remove-btn"
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
          <div className="meal-builder__totals">
            <h3>Meal Totals</h3>
            <div className="meal-builder__totals-grid">
              <div className="meal-builder__total">
                <span className="meal-builder__total-label">Calories</span>
                <span className="meal-builder__total-value">{Math.round(totals.calories)}</span>
              </div>
              <div className="meal-builder__total">
                <span className="meal-builder__total-label">Protein</span>
                <span className="meal-builder__total-value">{totals.protein_g.toFixed(1)}g</span>
              </div>
              <div className="meal-builder__total">
                <span className="meal-builder__total-label">Carbs</span>
                <span className="meal-builder__total-value">{totals.carbs_g.toFixed(1)}g</span>
              </div>
              <div className="meal-builder__total">
                <span className="meal-builder__total-label">Fat</span>
                <span className="meal-builder__total-value">{totals.fat_g.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        )}

        {validationError && <div className="meal-builder__validation-error">{validationError}</div>}

        <div className="meal-builder__actions">
          <button type="button" onClick={handleSave} className="meal-builder__save-btn">
            Save Meal
          </button>
          <button type="button" onClick={onCancel} className="meal-builder__cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealBuilder;
