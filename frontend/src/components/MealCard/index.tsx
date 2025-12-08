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
import './styles.css';

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
      <div className={`meal-card meal-card--compact ${className}`} role="article" aria-label={`Meal: ${meal.name}`}>
        <div className="meal-card__compact-content">
          <div className="meal-card__compact-info">
            <h4 className="meal-card__compact-name">{meal.name}</h4>
            <span className="meal-card__compact-calories">{meal.totals.calories} cal</span>
          </div>
          <button
            type="button"
            onClick={() => onAddToDiary(meal)}
            disabled={disabled || loading}
            className="meal-card__compact-add-btn"
            aria-label={`Add ${meal.name} to diary`}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <article
      className={`meal-card ${className}`}
      aria-label={`Meal: ${meal.name}`}
      role="article"
    >
      <div className="meal-card__header">
        <div className="meal-card__title-section">
          <h3 className="meal-card__name">{meal.name}</h3>
          <div className="meal-card__meta">
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
            className="meal-card__expand-btn"
            aria-label={isCollapsed ? 'Expand meal details' : 'Collapse meal details'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
      </div>

      <div className="meal-card__totals" data-testid="macro-breakdown">
        <div className="meal-card__total">
          <span className="meal-card__total-value">{meal.totals.calories}</span>
          <span className="meal-card__total-label">cal</span>
        </div>
        <div className="meal-card__total">
          <span className="meal-card__total-value">{meal.totals.protein_g.toFixed(1)}g</span>
          <span className="meal-card__total-label">protein</span>
          {macroPercent && <span className="meal-card__total-percent">{macroPercent.protein}%</span>}
        </div>
        <div className="meal-card__total">
          <span className="meal-card__total-value">{meal.totals.carbs_g.toFixed(1)}g</span>
          <span className="meal-card__total-label">carbs</span>
          {macroPercent && <span className="meal-card__total-percent">{macroPercent.carbs}%</span>}
        </div>
        <div className="meal-card__total">
          <span className="meal-card__total-value">{meal.totals.fat_g.toFixed(1)}g</span>
          <span className="meal-card__total-label">fat</span>
          {macroPercent && <span className="meal-card__total-percent">{macroPercent.fat}%</span>}
        </div>
      </div>

      {!isCollapsed && itemCount > 0 && (
        <div className="meal-card__items">
          {meal.items.map((item, index) => (
            <div key={index} className="meal-card__item">
              <div className="meal-card__item-name">
                {item.food.name}
                {item.food.brand && (
                  <span className="meal-card__item-brand">({item.food.brand})</span>
                )}
                {item.is_deleted && (
                  <span className="meal-card__item-deleted">(deleted)</span>
                )}
              </div>
              <div className="meal-card__item-serving">
                {item.quantity} × {item.food.serving_size} {item.food.serving_unit}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="meal-card__actions">
        <button
          type="button"
          onClick={() => onAddToDiary(meal)}
          disabled={disabled || loading}
          className="meal-card__add-btn"
          aria-label={`Add ${meal.name} to diary`}
        >
          {loading ? 'Adding...' : 'Add to Diary'}
        </button>
      </div>
    </article>
  );
};

export default MealCard;
