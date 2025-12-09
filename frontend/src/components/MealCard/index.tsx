/**
 * MealCard Component
 *
 * Displays a custom meal with:
 * - Meal name and item count
 * - Nutritional totals
 * - List of food items
 * - Add to diary button
 * - Collapsible/expandable view
 * - Compact mode option
 */
import React, { useState } from 'react';
import { CustomMeal } from '../../services/meals';

interface MealCardProps {
  meal: CustomMeal;
  onAddToDiary: (meal: CustomMeal) => void;
  collapsed?: boolean;
  compact?: boolean;
  showDate?: boolean;
  showMacroPercent?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  onAddToDiary,
  collapsed: initialCollapsed = false,
  compact = false,
  showDate = false,
  showMacroPercent = false,
  disabled = false,
  loading = false,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const itemCount = meal.items.length;
  const hasDeletedFoods = meal.items.some((item) => item.is_deleted);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateMacroPercentages = () => {
    const totalCalories = meal.totals.calories;
    if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 };

    const proteinCal = meal.totals.protein_g * 4;
    const carbsCal = meal.totals.carbs_g * 4;
    const fatCal = meal.totals.fat_g * 9;

    return {
      protein: Math.round((proteinCal / totalCalories) * 100),
      carbs: Math.round((carbsCal / totalCalories) * 100),
      fat: Math.round((fatCal / totalCalories) * 100),
    };
  };

  const macroPercent = showMacroPercent ? calculateMacroPercentages() : null;

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 bg-surface border border-border rounded-lg ${className}`} role="article" aria-label={`Meal: ${meal.name}`}>
        <div className="flex items-center gap-3">
          <h4 className="m-0 font-semibold text-content">{meal.name}</h4>
          <span className="text-sm text-content-secondary">{meal.totals.calories} cal</span>
        </div>
        <button
          type="button"
          onClick={() => onAddToDiary(meal)}
          disabled={disabled || loading}
          className="px-4 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          aria-label={`Add ${meal.name} to diary`}
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    );
  }

  return (
    <article
      className={`bg-surface border border-border rounded-lg overflow-hidden shadow-sm ${className}`}
      aria-label={`Meal: ${meal.name}`}
      role="article"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="m-0 text-lg font-semibold text-content">{meal.name}</h3>
          <div className="text-sm text-content-secondary mt-1">
            {itemCount === 0 ? (
              <span>No items</span>
            ) : (
              <span>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
            {showDate && <span> • Created {formatDate(meal.created_at)}</span>}
          </div>
        </div>

        {itemCount > 0 && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-4 py-2 bg-surface-secondary text-content-secondary rounded font-medium text-sm hover:bg-surface-tertiary transition-colors min-h-[44px]"
            aria-label={isCollapsed ? 'Expand meal details' : 'Collapse meal details'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4" data-testid="macro-breakdown">
        <div className="flex flex-col items-center p-3 bg-surface-secondary rounded">
          <span className="text-2xl font-bold text-content">{meal.totals.calories}</span>
          <span className="text-xs text-content-secondary mt-1">cal</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-surface-secondary rounded">
          <span className="text-2xl font-bold text-content">{meal.totals.protein_g.toFixed(1)}g</span>
          <span className="text-xs text-content-secondary mt-1">protein</span>
          {macroPercent && <span className="text-xs text-content-tertiary">{macroPercent.protein}%</span>}
        </div>
        <div className="flex flex-col items-center p-3 bg-surface-secondary rounded">
          <span className="text-2xl font-bold text-content">{meal.totals.carbs_g.toFixed(1)}g</span>
          <span className="text-xs text-content-secondary mt-1">carbs</span>
          {macroPercent && <span className="text-xs text-content-tertiary">{macroPercent.carbs}%</span>}
        </div>
        <div className="flex flex-col items-center p-3 bg-surface-secondary rounded">
          <span className="text-2xl font-bold text-content">{meal.totals.fat_g.toFixed(1)}g</span>
          <span className="text-xs text-content-secondary mt-1">fat</span>
          {macroPercent && <span className="text-xs text-content-tertiary">{macroPercent.fat}%</span>}
        </div>
      </div>

      {!isCollapsed && itemCount > 0 && (
        <div className="border-t border-border p-4 bg-surface-tertiary">
          {meal.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start py-2 border-b border-border last:border-b-0">
              <div className="flex-1">
                <div className="font-medium text-content">
                  {item.food.name}
                  {item.food.brand && (
                    <span className="text-content-secondary text-sm ml-2">({item.food.brand})</span>
                  )}
                  {item.is_deleted && (
                    <span className="text-error text-sm italic ml-2">(deleted)</span>
                  )}
                </div>
                <div className="text-sm text-content-secondary mt-1">
                  {item.quantity} × {item.food.serving_size} {item.food.serving_unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={() => onAddToDiary(meal)}
          disabled={disabled || loading}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold text-base hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          aria-label={`Add ${meal.name} to diary`}
        >
          {loading ? 'Adding...' : 'Add to Diary'}
        </button>
      </div>
    </article>
  );
};

export default MealCard;
