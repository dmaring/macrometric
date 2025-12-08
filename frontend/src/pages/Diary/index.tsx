/**
 * Diary Page
 *
 * Main page for viewing and managing daily food diary.
 */
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDiary } from '../../hooks/useDiary';
import { useNavigate } from 'react-router-dom';
import DateNavigator from '../../components/DateNavigator';
import MacroDisplay from '../../components/MacroDisplay';
import MealCategory from '../../components/MealCategory';
import AddFoodModal, { FoodData } from '../../components/AddFoodModal';
import MealCard from '../../components/MealCard';
import { getCustomMeals, CustomMeal } from '../../services/meals';
import { addMealToDiary } from '../../services/diary';
import './Diary.css';

interface SelectedCategory {
  id: string;
  name: string;
}

export default function DiaryPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [mealCategoryId, setMealCategoryId] = useState<string | null>(null);

  const {
    diary,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh,
  } = useDiary(selectedDate);

  const handleDateChange = useCallback((newDate: Date) => {
    setSelectedDate(newDate);
  }, []);

  const handleAddFood = useCallback((categoryId: string) => {
    const category = diary?.categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory({ id: categoryId, name: category.name });
    }
  }, [diary?.categories]);

  const handleCloseModal = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const handleSubmitFood = useCallback(
    async (foodData: FoodData) => {
      if (!selectedCategory) return;

      await addEntry({
        category_id: selectedCategory.id,
        food: {
          name: foodData.name,
          brand: foodData.brand,
          serving_size: foodData.serving_size,
          serving_unit: foodData.serving_unit,
          calories: foodData.calories,
          protein_g: foodData.protein_g,
          carbs_g: foodData.carbs_g,
          fat_g: foodData.fat_g,
        },
        quantity: foodData.quantity,
      });
    },
    [selectedCategory, addEntry]
  );

  const handleEditEntry = useCallback(
    async (entryId: string) => {
      // For now, just log - will implement edit modal in future
      console.log('Edit entry:', entryId);
    },
    []
  );

  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      if (window.confirm('Are you sure you want to delete this entry?')) {
        await deleteEntry(entryId);
      }
    },
    [deleteEntry]
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // Load custom meals when meal selector is opened
  useEffect(() => {
    if (showMealSelector) {
      loadCustomMeals();
    }
  }, [showMealSelector]);

  const loadCustomMeals = async () => {
    try {
      const meals = await getCustomMeals();
      setCustomMeals(meals);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const handleAddMeal = useCallback((categoryId: string) => {
    setMealCategoryId(categoryId);
    setShowMealSelector(true);
  }, []);

  const handleMealToDiary = useCallback(
    async (meal: CustomMeal) => {
      if (!mealCategoryId) return;

      try {
        await addMealToDiary(selectedDate, meal.id, mealCategoryId);
        setShowMealSelector(false);
        setMealCategoryId(null);
        await refresh();
      } catch (error) {
        console.error('Error adding meal to diary:', error);
        alert('Failed to add meal. Please try again.');
      }
    },
    [mealCategoryId, selectedDate, refresh]
  );

  const handleCloseMealSelector = useCallback(() => {
    setShowMealSelector(false);
    setMealCategoryId(null);
  }, []);

  // Categories already include their entries from the backend
  const categories = diary?.categories || [];

  return (
    <div className="diary-page" data-testid="diary-page">
      <header className="diary-header">
        <h1>MacroMetric</h1>
        <div className="diary-header__actions">
          <button
            className="settings-button"
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="diary-content">
        <DateNavigator date={selectedDate} onDateChange={handleDateChange} />

        {loading ? (
          <div className="loading-state" data-testid="diary-loading">
            <div className="loading-spinner" />
            <p>Loading diary...</p>
          </div>
        ) : error ? (
          <div className="error-state" data-testid="diary-error">
            <p>Failed to load diary</p>
            <button className="retry-button" onClick={refresh}>
              Try Again
            </button>
          </div>
        ) : diary ? (
          <>
            <MacroDisplay
              calories={diary.totals.calories}
              protein={diary.totals.protein_g}
              carbs={diary.totals.carbs_g}
              fat={diary.totals.fat_g}
              goals={diary.goals ? {
                calories: diary.goals.calories || 0,
                protein: diary.goals.protein_g || 0,
                carbs: diary.goals.carbs_g || 0,
                fat: diary.goals.fat_g || 0,
              } : undefined}
            />

            <section className="categories-section">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <MealCategory
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    entries={category.entries}
                    onAddFood={handleAddFood}
                    onAddMeal={handleAddMeal}
                    onEditEntry={handleEditEntry}
                    onDeleteEntry={handleDeleteEntry}
                  />
                ))
              ) : (
                <div className="empty-diary">
                  <p>No meal categories available. Add categories in settings.</p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      {selectedCategory && (
        <AddFoodModal
          isOpen={!!selectedCategory}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onClose={handleCloseModal}
          onSubmit={handleSubmitFood}
        />
      )}

      {showMealSelector && (
        <div className="meal-selector-modal">
          <div className="meal-selector-modal__overlay" onClick={handleCloseMealSelector} />
          <div className="meal-selector-modal__content">
            <div className="meal-selector-modal__header">
              <h2>Select a Meal</h2>
              <button
                type="button"
                onClick={handleCloseMealSelector}
                className="meal-selector-modal__close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="meal-selector-modal__body">
              {customMeals.length === 0 ? (
                <div className="meal-selector-modal__empty">
                  <p>No custom meals yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseMealSelector();
                      navigate('/settings');
                    }}
                    className="meal-selector-modal__create-btn"
                  >
                    Create Your First Meal
                  </button>
                </div>
              ) : (
                <div className="meal-selector-modal__meals">
                  {customMeals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onAddToDiary={handleMealToDiary}
                      compact={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
