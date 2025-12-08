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
import './styles.css';

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
      <div className="custom-meal-list__loading">
        <p>Loading meals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom-meal-list__error">
        <p>{error}</p>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="custom-meal-list__empty">
        <h3>No custom meals yet</h3>
        <p>Create your first meal preset to quickly log recurring meals.</p>
      </div>
    );
  }

  const deleteConfirmMeal = meals.find((m) => m.id === deleteConfirmMealId);

  return (
    <div className="custom-meal-list">
      <div className="custom-meal-list__header">
        <div className="custom-meal-list__count">{meals.length} meals</div>
        <input
          type="text"
          className="custom-meal-list__search"
          placeholder="Search meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredMeals.length === 0 ? (
        <div className="custom-meal-list__no-results">
          <p>No meals match your search.</p>
        </div>
      ) : (
        <div className="custom-meal-list__items">
          {filteredMeals.map((meal) => {
            const isExpanded = expandedMealId === meal.id;
            const itemCount = meal.items.length;

            return (
              <article
                key={meal.id}
                className={`custom-meal-list__card ${isExpanded ? 'custom-meal-list__card--expanded' : ''}`}
                aria-label={`Custom meal: ${meal.name}`}
              >
                <div
                  className="custom-meal-list__card-header"
                  onClick={() => handleToggleExpand(meal.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleToggleExpand(meal.id);
                    }
                  }}
                >
                  <div className="custom-meal-list__card-title">
                    <h3>{meal.name}</h3>
                    <div className="custom-meal-list__card-meta">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} • Created{' '}
                      {formatDate(meal.created_at)}
                    </div>
                  </div>

                  <div className="custom-meal-list__card-totals">
                    <span className="custom-meal-list__total">
                      {meal.totals.calories} cal
                    </span>
                    <span className="custom-meal-list__total">
                      {meal.totals.protein_g.toFixed(1)}g protein
                    </span>
                    <span className="custom-meal-list__total">
                      {meal.totals.carbs_g.toFixed(1)}g carbs
                    </span>
                    <span className="custom-meal-list__total">
                      {meal.totals.fat_g.toFixed(1)}g fat
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="custom-meal-list__card-body">
                    <div className="custom-meal-list__items-list">
                      {meal.items.map((item, index) => (
                        <div key={index} className="custom-meal-list__food-item">
                          <div className="custom-meal-list__food-name">
                            {item.food.name}
                            {item.is_deleted && (
                              <span className="custom-meal-list__deleted-badge">
                                (deleted)
                              </span>
                            )}
                          </div>
                          <div className="custom-meal-list__food-details">
                            {item.food.serving_size} {item.food.serving_unit} • Quantity:{' '}
                            {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="custom-meal-list__card-actions">
                  <button
                    type="button"
                    className="custom-meal-list__edit-btn"
                    onClick={() => onEdit(meal)}
                    aria-label={`Edit ${meal.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="custom-meal-list__delete-btn"
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
        <div className="custom-meal-list__modal-overlay">
          <div className="custom-meal-list__modal">
            <h3>Delete {deleteConfirmMeal.name}?</h3>
            <p>This action cannot be undone. The meal preset will be permanently deleted.</p>
            <div className="custom-meal-list__modal-actions">
              <button
                type="button"
                className="custom-meal-list__confirm-btn"
                onClick={handleConfirmDelete}
                aria-label="Confirm delete"
              >
                Confirm
              </button>
              <button
                type="button"
                className="custom-meal-list__cancel-btn"
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
