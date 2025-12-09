/**
 * DiaryEntry Component
 *
 * Displays a single food entry in the diary.
 */

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
      className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-surface-tertiary rounded cursor-pointer transition-colors duration-200 hover:bg-surface focus:outline-2 focus:outline-primary focus:outline-offset-2 group`}
      data-testid="diary-entry"
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-medium text-content">{food.name}</span>
          {food.brand && <span className="text-sm text-content-secondary">{food.brand}</span>}
          <span className="text-xs text-content-tertiary">
            {quantity} × {food.serving_size}{food.serving_unit}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold text-primary">{calories} cal</span>
          {(expanded || !compact) && (
            <span className="flex gap-3 text-sm text-content-secondary sm:flex hidden">
              <span className="whitespace-nowrap">P: {protein}g</span>
              <span className="whitespace-nowrap">C: {carbs}g</span>
              <span className="whitespace-nowrap">F: {fat}g</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 sm:opacity-100">
        <button
          className="px-2 py-1 text-xs text-primary bg-transparent border border-primary rounded cursor-pointer transition-colors duration-200 hover:bg-primary/10 min-h-[44px] min-w-[44px]"
          onClick={(e) => { e.stopPropagation(); onEdit(entry.id); }}
          aria-label="Edit entry"
        >
          Edit
        </button>
        <button
          className="w-6 h-6 min-w-[44px] min-h-[44px] text-base text-content-secondary bg-transparent border-none rounded cursor-pointer flex items-center justify-center transition-colors duration-200 hover:text-error hover:bg-error/10"
          onClick={handleDelete}
          aria-label="Delete entry"
        >
          ×
        </button>
      </div>
    </div>
  );
}
