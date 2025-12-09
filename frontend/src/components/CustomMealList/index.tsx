/**
 * CustomMealList Component
 *
 * Displays a list of user's custom meals with:
 * - Search/filter functionality
 * - Expandable meal details
 * - Edit and delete actions
 * - Nutritional totals
 * - Empty and loading states
 */
import React, { useState, useMemo } from 'react';
import { CustomMeal } from '../../services/meals';

interface CustomMealListProps {
  meals: CustomMeal[];
  onEdit: (meal: CustomMeal) => void;
  onDelete: (mealId: string) => void;
  loading?: boolean;
  error?: string;
}

const CustomMealList: React.FC<CustomMealListProps> = ({
  meals,
  onEdit,
  onDelete,
  loading = false,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [deleteConfirmMealId, setDeleteConfirmMealId] = useState<string | null>(null);

  // Sort meals by creation date (newest first)
  const sortedMeals = useMemo(() => {
    return [...meals].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [meals]);

  // Filter meals by search query
  const filteredMeals = useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedMeals;
    }

    const query = searchQuery.toLowerCase();
    return sortedMeals.filter((meal) => meal.name.toLowerCase().includes(query));
  }, [sortedMeals, searchQuery]);

  const handleToggleExpand = (mealId: string) => {
    setExpandedMealId((prev) => (prev === mealId ? null : mealId));
  };

  const handleDeleteClick = (mealId: string) => {
    setDeleteConfirmMealId(mealId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmMealId) {
      onDelete(deleteConfirmMealId);
      setDeleteConfirmMealId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmMealId(null);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-content-secondary">
        <p>Loading meals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-error/10 text-error rounded-lg border border-error/20">
        <p>{error}</p>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="p-12 text-center text-content-secondary">
        <h3 className="text-xl text-content mb-2">No custom meals yet</h3>
        <p className="text-content-secondary">Create your first meal preset to quickly log recurring meals.</p>
      </div>
    );
  }

  const deleteConfirmMeal = meals.find((m) => m.id === deleteConfirmMealId);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="text-lg font-semibold text-content-secondary">{meals.length} meals</div>
        <input
          type="text"
          className="flex-1 max-w-xs px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          placeholder="Search meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredMeals.length === 0 ? (
        <div className="p-8 text-center text-content-secondary italic">
          <p>No meals match your search.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredMeals.map((meal) => {
            const isExpanded = expandedMealId === meal.id;
            const itemCount = meal.items.length;

            return (
              <article
                key={meal.id}
                className={`bg-surface border rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'border-primary' : 'border-border'} hover:shadow-md`}
                aria-label={`Custom meal: ${meal.name}`}
              >
                <div
                  className="p-5 cursor-pointer select-none focus:outline-2 focus:outline-primary focus:-outline-offset-2"
                  onClick={() => handleToggleExpand(meal.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleToggleExpand(meal.id);
                    }
                  }}
                >
                  <div>
                    <h3 className="m-0 mb-2 text-lg text-content">{meal.name}</h3>
                    <div className="text-xs text-content-secondary">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} • Created{' '}
                      {formatDate(meal.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <span className="inline-flex px-3 py-1.5 bg-surface-secondary rounded text-content-secondary font-medium">
                      {meal.totals.calories} cal
                    </span>
                    <span className="inline-flex px-3 py-1.5 bg-surface-secondary rounded text-content-secondary font-medium">
                      {meal.totals.protein_g.toFixed(1)}g protein
                    </span>
                    <span className="inline-flex px-3 py-1.5 bg-surface-secondary rounded text-content-secondary font-medium">
                      {meal.totals.carbs_g.toFixed(1)}g carbs
                    </span>
                    <span className="inline-flex px-3 py-1.5 bg-surface-secondary rounded text-content-secondary font-medium">
                      {meal.totals.fat_g.toFixed(1)}g fat
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-border">
                    <div className="mt-4 flex flex-col gap-3">
                      {meal.items.map((item, index) => (
                        <div key={index} className="p-3 bg-surface-tertiary rounded">
                          <div className="font-medium text-content mb-1">
                            {item.food.name}
                            {item.is_deleted && (
                              <span className="text-error text-xs italic ml-2">
                                (deleted)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-content-secondary">
                            {item.food.serving_size} {item.food.serving_unit} • Quantity:{' '}
                            {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 p-5 border-t border-border bg-surface-tertiary">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2.5 bg-primary text-white border-none rounded text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover focus:outline-2 focus:outline-primary focus:outline-offset-2 min-h-[44px]"
                    onClick={() => onEdit(meal)}
                    aria-label={`Edit ${meal.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2.5 bg-error text-white border-none rounded text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-error/90 focus:outline-2 focus:outline-error focus:outline-offset-2 min-h-[44px]"
                    onClick={() => handleDeleteClick(meal.id)}
                    aria-label={`Delete ${meal.name}`}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {deleteConfirmMealId && deleteConfirmMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-surface rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="m-0 mb-4 text-xl text-content">Delete {deleteConfirmMeal.name}?</h3>
            <p className="m-0 mb-6 text-content-secondary text-sm">This action cannot be undone. The meal preset will be permanently deleted.</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-3 bg-error text-white border-none rounded text-base font-semibold cursor-pointer hover:bg-error/90 min-h-[44px]"
                onClick={handleConfirmDelete}
                aria-label="Confirm delete"
              >
                Confirm
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 bg-border text-content-secondary border-none rounded text-base font-semibold cursor-pointer hover:bg-surface-tertiary min-h-[44px]"
                onClick={handleCancelDelete}
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMealList;
