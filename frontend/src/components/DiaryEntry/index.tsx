/**
 * DiaryEntry Component
 *
 * Displays a single food entry in the diary.
 */
import './DiaryEntry.css';

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

interface DiaryEntryProps {
  entry: Entry;
  onEdit: (entryId: string) => void;
  onDelete: (entryId: string) => void;
  compact?: boolean;
  expanded?: boolean;
}

export default function DiaryEntry({
  entry,
  onEdit,
  onDelete,
  compact = false,
  expanded = false,
}: DiaryEntryProps) {
  const { food, quantity } = entry;

  // Calculate macros based on quantity
  const calories = Math.round(food.calories * quantity);
  const protein = Math.round(food.protein_g * quantity * 10) / 10;
  const carbs = Math.round(food.carbs_g * quantity * 10) / 10;
  const fat = Math.round(food.fat_g * quantity * 10) / 10;

  const handleClick = () => {
    onEdit(entry.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit(entry.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(entry.id);
  };

  return (
    <div
      className={`diary-entry ${compact ? 'compact' : ''}`}
      data-testid="diary-entry"
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="entry-main">
        <div className="entry-info">
          <span className="food-name">{food.name}</span>
          {food.brand && <span className="food-brand">{food.brand}</span>}
          <span className="serving-info">
            {quantity} × {food.serving_size}{food.serving_unit}
          </span>
        </div>

        <div className="entry-macros">
          <span className="entry-calories">{calories} cal</span>
          {(expanded || !compact) && (
            <span className="entry-macro-details">
              <span className="macro">P: {protein}g</span>
              <span className="macro">C: {carbs}g</span>
              <span className="macro">F: {fat}g</span>
            </span>
          )}
        </div>
      </div>

      <div className="entry-actions">
        <button
          className="edit-button"
          onClick={(e) => { e.stopPropagation(); onEdit(entry.id); }}
          aria-label="Edit entry"
        >
          Edit
        </button>
        <button
          className="delete-button"
          onClick={handleDelete}
          aria-label="Delete entry"
        >
          ×
        </button>
      </div>
    </div>
  );
}
