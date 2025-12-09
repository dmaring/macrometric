/**
 * Settings Page
 *
 * Provides user account and preference management:
 * - Daily macro/calorie goals
 * - Custom foods management
 * - Custom meals management
 * - Account settings
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import MealBuilder from '../../components/MealBuilder';
import CustomMealList from '../../components/CustomMealList';
import CategoryManager from '../../components/CategoryManager';
import {
  getCustomMeals,
  createCustomMeal,
  updateCustomMeal,
  deleteCustomMeal,
  CustomMeal,
  CreateMealRequest,
} from '../../services/meals';
import {
  getCategories,
  MealCategory,
} from '../../services/categories';
import api from '../../services/api';

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'goals' | 'foods' | 'meals' | 'categories' | 'account'>('meals');
  const [meals, setMeals] = useState<CustomMeal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState('');
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  const [editingMeal, setEditingMeal] = useState<CustomMeal | undefined>(undefined);
  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const navigate = useNavigate();

  // Load custom meals
  useEffect(() => {
    if (activeTab === 'meals') {
      loadMeals();
    }
  }, [activeTab]);

  // Load categories
  useEffect(() => {
    if (activeTab === 'categories') {
      loadCategories();
    }
  }, [activeTab]);

  const loadMeals = async () => {
    setMealsLoading(true);
    setMealsError('');
    try {
      const mealsData = await getCustomMeals();
      setMeals(mealsData);
    } catch (error) {
      setMealsError('Failed to load custom meals');
      console.error('Error loading meals:', error);
    } finally {
      setMealsLoading(false);
    }
  };

  const handleCreateMeal = () => {
    setEditingMeal(undefined);
    setShowMealBuilder(true);
  };

  const handleEditMeal = (meal: CustomMeal) => {
    setEditingMeal(meal);
    setShowMealBuilder(true);
  };

  const handleSaveMeal = async (mealData: CreateMealRequest) => {
    try {
      if (editingMeal) {
        // Update existing meal
        await updateCustomMeal(editingMeal.id, mealData);
      } else {
        // Create new meal
        await createCustomMeal(mealData);
      }

      setShowMealBuilder(false);
      setEditingMeal(undefined);
      await loadMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Failed to save meal. Please try again.');
    }
  };

  const handleCancelMealBuilder = () => {
    setShowMealBuilder(false);
    setEditingMeal(undefined);
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteCustomMeal(mealId);
      await loadMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal. Please try again.');
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError('');
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      setCategoriesError('Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/me');

      // Log out and redirect to login
      await logout();
      navigate('/login');

      // Show success message
      alert('Your account has been successfully deleted.');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-surface min-h-screen transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-8 gap-4">
        <h1 className="m-0 text-3xl text-content font-bold">Settings</h1>
        <button
          type="button"
          onClick={() => navigate('/diary')}
          className="px-6 py-3 bg-content-secondary text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-content-tertiary min-h-[44px]"
        >
          Back to Diary
        </button>
      </div>

      <div className="flex gap-2 border-b-2 border-border mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <button
          type="button"
          className={`px-6 py-3 bg-transparent border-none border-b-2 ${activeTab === 'goals' ? 'border-primary text-primary' : 'border-transparent text-content-secondary'} cursor-pointer text-base font-medium transition-all duration-200 hover:text-content -mb-0.5 min-h-[44px] whitespace-nowrap`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button
          type="button"
          className={`px-6 py-3 bg-transparent border-none border-b-2 ${activeTab === 'foods' ? 'border-primary text-primary' : 'border-transparent text-content-secondary'} cursor-pointer text-base font-medium transition-all duration-200 hover:text-content -mb-0.5 min-h-[44px] whitespace-nowrap`}
          onClick={() => setActiveTab('foods')}
        >
          Custom Foods
        </button>
        <button
          type="button"
          className={`px-6 py-3 bg-transparent border-none border-b-2 ${activeTab === 'meals' ? 'border-primary text-primary' : 'border-transparent text-content-secondary'} cursor-pointer text-base font-medium transition-all duration-200 hover:text-content -mb-0.5 min-h-[44px] whitespace-nowrap`}
          onClick={() => setActiveTab('meals')}
        >
          Custom Meals
        </button>
        <button
          type="button"
          className={`px-6 py-3 bg-transparent border-none border-b-2 ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-content-secondary'} cursor-pointer text-base font-medium transition-all duration-200 hover:text-content -mb-0.5 min-h-[44px] whitespace-nowrap`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          className={`px-6 py-3 bg-transparent border-none border-b-2 ${activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-content-secondary'} cursor-pointer text-base font-medium transition-all duration-200 hover:text-content -mb-0.5 min-h-[44px] whitespace-nowrap`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
      </div>

      <div className="min-h-96">
        {activeTab === 'goals' && (
          <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
            <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Daily Goals</h2>
            <p className="text-content-secondary">Goals section - To be implemented</p>
          </div>
        )}

        {activeTab === 'foods' && (
          <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
            <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Custom Foods</h2>
            <p className="text-content-secondary">Custom foods section - To be implemented</p>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="m-0 text-2xl text-content font-semibold">Custom Meals</h2>
              {!showMealBuilder && (
                <button
                  type="button"
                  onClick={handleCreateMeal}
                  className="px-6 py-3 bg-success text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-success/80 min-h-[44px]"
                >
                  Create New Meal
                </button>
              )}
            </div>

            {showMealBuilder ? (
              <div className="mt-6">
                <MealBuilder
                  meal={editingMeal}
                  onSave={handleSaveMeal}
                  onCancel={handleCancelMealBuilder}
                />
              </div>
            ) : (
              <CustomMealList
                meals={meals}
                onEdit={handleEditMeal}
                onDelete={handleDeleteMeal}
                loading={mealsLoading}
                error={mealsError}
              />
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
            <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Meal Categories</h2>
            <p className="m-0 mb-4 text-content-secondary text-sm leading-relaxed">
              Manage your meal categories. Drag and drop to reorder, edit names, or add new categories.
            </p>
            {categoriesLoading ? (
              <p className="text-content-secondary">Loading categories...</p>
            ) : categoriesError ? (
              <p className="p-4 bg-error/10 border border-error/30 rounded-md text-error text-sm">{categoriesError}</p>
            ) : (
              <CategoryManager
                categories={categories}
                onUpdate={loadCategories}
              />
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
            <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Account Settings</h2>

            <div className="p-6 border border-border rounded-lg mb-6 bg-surface">
              <h3 className="m-0 mb-3 text-lg text-content font-semibold">Theme</h3>
              <p className="m-0 mb-4 text-content-secondary text-sm leading-relaxed">
                Choose your preferred color theme. System will follow your device's theme setting.
              </p>
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 ${theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-content-secondary'} rounded-lg cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5 text-sm font-medium min-h-20`}
                  aria-pressed={theme === 'light'}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 ${theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-content-secondary'} rounded-lg cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5 text-sm font-medium min-h-20`}
                  aria-pressed={theme === 'dark'}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 ${theme === 'system' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-content-secondary'} rounded-lg cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5 text-sm font-medium min-h-20`}
                  aria-pressed={theme === 'system'}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>System</span>
                </button>
              </div>
              <p className="m-0 p-3 bg-surface-tertiary rounded-md text-sm text-content-secondary">
                Current theme: <strong className="text-content">{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</strong>
                {theme === 'system' && ' (following system preference)'}
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg mb-6 bg-surface">
              <h3 className="m-0 mb-3 text-lg text-content font-semibold">Password</h3>
              <p className="m-0 mb-4 text-content-secondary text-sm leading-relaxed">
                Reset your password using the password reset flow.
              </p>
              <button
                type="button"
                onClick={() => navigate('/password-reset')}
                className="px-6 py-3 bg-primary text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-primary-hover min-h-[44px]"
              >
                Reset Password
              </button>
            </div>

            <div className="p-6 border border-error/30 rounded-lg bg-error/5">
              <h3 className="m-0 mb-3 text-lg text-error font-semibold">Delete Account</h3>
              <p className="m-0 mb-4 text-content-secondary text-sm leading-relaxed">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    'Are you absolutely sure you want to delete your account? This will permanently delete:\n\n' +
                    '• All diary entries\n' +
                    '• Custom foods and meals\n' +
                    '• Daily goals\n' +
                    '• Meal categories\n\n' +
                    'This action CANNOT be undone.'
                  );

                  if (confirmed) {
                    handleDeleteAccount();
                  }
                }}
                className="px-6 py-3 bg-error text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-error/80 min-h-[44px]"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
