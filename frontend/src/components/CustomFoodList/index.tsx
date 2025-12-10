import React from 'react';
import { CustomFood } from '../../services/customFoods';

interface CustomFoodListProps {
  foods: CustomFood[];
  onEdit: (food: CustomFood) => void;
  onDelete: (foodId: string) => void;
  loading: boolean;
  error: string;
}

const CustomFoodList: React.FC<CustomFoodListProps> = ({
  foods,
  onEdit,
  onDelete,
  loading,
  error,
}) => {
  // T049: Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-content-secondary">Loading custom foods...</p>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-surface-tertiary rounded"></div>
          <div className="h-24 bg-surface-tertiary rounded"></div>
          <div className="h-24 bg-surface-tertiary rounded"></div>
        </div>
      </div>
    );
  }

  // T051: Error state
  if (error) {
    return (
      <div className="p-4 bg-error/10 border border-error/30 rounded-md">
        <p className="text-error text-sm">{error}</p>
      </div>
    );
  }

  // T050: Empty state
  if (foods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-content-secondary text-lg mb-4">
          No custom foods yet. Create one to get started!
        </p>
      </div>
    );
  }

  // T046: Delete functionality with confirmation
  const handleDelete = (food: CustomFood) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${food.name}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      onDelete(food.id);
    }
  };

  // T047: CustomFoodList UI with food cards
  return (
    <div className="space-y-4">
      {foods.map((food) => (
        <div
          key={food.id}
          className="bg-surface border border-border rounded-lg p-6 transition-colors duration-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h3 className="m-0 text-lg text-content font-semibold">
                {food.name}
              </h3>
              {food.brand && (
                <p className="m-0 mt-1 text-sm text-content-secondary">
                  {food.brand}
                </p>
              )}
              <p className="m-0 mt-1 text-sm text-content-secondary">
                Serving: {food.serving_size} {food.serving_unit}
              </p>
            </div>

            {/* T048: Edit and delete buttons with accessibility */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(food)}
                className="px-4 py-2 bg-primary text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-primary-hover min-h-[44px]"
                aria-label={`Edit ${food.name}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(food)}
                className="px-4 py-2 bg-error text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-error/80 min-h-[44px]"
                aria-label={`Delete ${food.name}`}
              >
                Delete
              </button>
            </div>
          </div>

          {/* Nutritional information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <p className="m-0 text-xs text-content-secondary uppercase">Calories</p>
              <p className="m-0 mt-1 text-lg text-content font-semibold">
                {food.calories}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs text-content-secondary uppercase">Protein</p>
              <p className="m-0 mt-1 text-lg text-content font-semibold">
                {food.protein_g}g
              </p>
            </div>
            <div>
              <p className="m-0 text-xs text-content-secondary uppercase">Carbs</p>
              <p className="m-0 mt-1 text-lg text-content font-semibold">
                {food.carbs_g}g
              </p>
            </div>
            <div>
              <p className="m-0 text-xs text-content-secondary uppercase">Fat</p>
              <p className="m-0 mt-1 text-lg text-content font-semibold">
                {food.fat_g}g
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomFoodList;
