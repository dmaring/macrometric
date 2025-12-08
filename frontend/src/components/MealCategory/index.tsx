/**
 * MealCategory Component
 *
 * Displays a meal category with its entries.
 */
import { useState } from 'react';
import DiaryEntry from '../DiaryEntry';
import './MealCategory.css';

interface Food {
  id: string;
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Entry {
  id: string;
  food: Food;
  quantity: number;
}

interface MealCategoryProps {
  id: string;
  name: string;
  entries: Entry[];
  onAddFood: (categoryId: string) => void;
  onAddMeal?: (categoryId: string) => void;
  onEditEntry: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
  defaultCollapsed?: boolean;
}

export default function MealCategory({
  id,
  name,
  entries,
  onAddFood,
  onAddMeal,
  onEditEntry,
  onDeleteEntry,
  defaultCollapsed = false,
}: MealCategoryProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Calculate category totals
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + Math.round(entry.food.calories * entry.quantity),
      protein: acc.protein + entry.food.protein_g * entry.quantity,
      carbs: acc.carbs + entry.food.carbs_g * entry.quantity,
      fat: acc.fat + entry.food.fat_g * entry.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <section className="meal-category" role="region" aria-label={name}>
      <div className="category-header">
        <button
          className="category-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={name}
        >
          <span className="collapse-icon">{collapsed ? '▶' : '▼'}</span>
          <h2 className="category-name">{name}</h2>
          {collapsed && entries.length > 0 && (
            <span className="entry-count">{entries.length} items</span>
          )}
        </button>

        <div className="category-summary">
          <span className="category-calories">{totals.calories} cal</span>
        </div>

        <div className="category-actions">
          <button
            className="add-food-button"
            onClick={() => onAddFood(id)}
            aria-label={`Add food to ${name}`}
          >
            + Add Food
          </button>
          {onAddMeal && (
            <button
              className="add-meal-button"
              onClick={() => onAddMeal(id)}
              aria-label={`Add meal to ${name}`}
            >
              + Add Meal
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="category-content">
          {entries.length === 0 ? (
            <div className="empty-category">
              <p>No foods logged yet. Add food to get started.</p>
            </div>
          ) : (
            <ul className="entries-list" role="list">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <DiaryEntry
                    entry={entry}
                    onEdit={onEditEntry}
                    onDelete={onDeleteEntry}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
