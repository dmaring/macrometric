/**
 * MealCategory Component
 *
 * Displays a meal category with its entries.
 */
import { useState } from 'react';
import DiaryEntry from '../DiaryEntry';

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
    <section className="bg-surface-secondary rounded-lg overflow-hidden border border-border" role="region" aria-label={name}>
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-surface-tertiary">
        <button
          className="flex items-center gap-2 p-2 bg-transparent border-none text-content cursor-pointer flex-1 min-w-[150px] min-h-[44px] group"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={name}
        >
          <span className="text-xs text-content-tertiary">{collapsed ? '▶' : '▼'}</span>
          <h2 className="m-0 text-base font-semibold text-content group-hover:text-primary transition-colors duration-200">{name}</h2>
          {collapsed && entries.length > 0 && (
            <span className="text-xs text-content-tertiary ml-2">{entries.length} items</span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-content-secondary">{totals.calories} cal</span>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 text-sm font-medium text-primary bg-transparent border border-primary rounded cursor-pointer transition-all duration-200 hover:bg-primary/10 min-h-[44px]"
            onClick={() => onAddFood(id)}
            aria-label={`Add food to ${name}`}
          >
            + Add Food
          </button>
          {onAddMeal && (
            <button
              className="px-3 py-1.5 text-sm font-medium text-primary bg-transparent border border-primary rounded cursor-pointer transition-all duration-200 hover:bg-primary/10 min-h-[44px]"
              onClick={() => onAddMeal(id)}
              aria-label={`Add meal to ${name}`}
            >
              + Add Meal
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 pb-4">
          {entries.length === 0 ? (
            <div className="p-4 text-center text-content-tertiary">
              <p className="m-0 text-sm">No foods logged yet. Add food to get started.</p>
            </div>
          ) : (
            <ul className="list-none m-0 p-0 flex flex-col gap-2" role="list">
              {entries.map((entry) => (
                <li key={entry.id} className="m-0 p-0">
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
