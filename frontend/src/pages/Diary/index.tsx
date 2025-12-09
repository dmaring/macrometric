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
import { DiaryPageSkeleton } from '../../components/Skeleton';
import { getCustomMeals, CustomMeal } from '../../services/meals';
import { addMealToDiary } from '../../services/diary';
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
    <div className="min-h-screen bg-surface transition-colors duration-200" data-testid="diary-page">
      <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-4 bg-surface-secondary border-b border-border gap-4 sm:gap-0">
        <h1 className="text-2xl font-semibold text-content text-center sm:text-left m-0">MacroMetric</h1>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 text-sm font-medium text-content-secondary bg-transparent border border-border rounded transition-all duration-200 hover:text-content hover:bg-surface-tertiary cursor-pointer min-h-[44px]"
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-content-secondary bg-transparent border border-border rounded transition-all duration-200 hover:text-content hover:bg-surface-tertiary cursor-pointer min-h-[44px]"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-6">
        {loading ? (
          <DiaryPageSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-error" data-testid="diary-error">
            <p className="m-0">Failed to load diary</p>
            <button
              className="px-4 py-2 text-sm text-white bg-primary rounded cursor-pointer border-none transition-colors duration-200 hover:bg-primary-hover min-h-[44px]"
              onClick={refresh}
            >
              Try Again
            </button>
          </div>
        ) : diary ? (
          <>
            <DateNavigator date={selectedDate} onDateChange={handleDateChange} />
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

            <section className="flex flex-col gap-4">
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
                <div className="flex flex-col items-center justify-center py-12 text-center text-content-tertiary">
                  <p className="m-0 text-base">No meal categories available. Add categories in settings.</p>
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75" onClick={handleCloseMealSelector} />
          <div className="relative bg-surface-secondary border border-border rounded-lg w-full max-w-[600px] max-h-[80vh] flex flex-col z-[1001]">
            <div className="flex justify-between items-center px-6 py-6 border-b border-border">
              <h2 className="m-0 text-2xl text-content font-semibold">Select a Meal</h2>
              <button
                type="button"
                onClick={handleCloseMealSelector}
                className="p-2 bg-transparent border-none text-content-secondary text-2xl cursor-pointer transition-colors duration-200 hover:text-content min-h-[44px] min-w-[44px]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-6 overflow-y-auto">
              {customMeals.length === 0 ? (
                <div className="text-center py-12 px-4 text-content-secondary">
                  <p className="m-0 mb-6 text-lg">No custom meals yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseMealSelector();
                      navigate('/settings');
                    }}
                    className="px-6 py-3 bg-success text-white border-none rounded cursor-pointer text-base font-semibold transition-colors duration-200 hover:bg-success/80 min-h-[44px]"
                  >
                    Create Your First Meal
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
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
