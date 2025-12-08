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
import './styles.css';

const Settings: React.FC = () => {
  const { logout } = useAuth();
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
    <div className="settings">
      <div className="settings__header">
        <h1>Settings</h1>
        <button
          type="button"
          onClick={() => navigate('/diary')}
          className="settings__back-btn"
        >
          Back to Diary
        </button>
      </div>

      <div className="settings__tabs">
        <button
          type="button"
          className={`settings__tab ${activeTab === 'goals' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button
          type="button"
          className={`settings__tab ${activeTab === 'foods' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('foods')}
        >
          Custom Foods
        </button>
        <button
          type="button"
          className={`settings__tab ${activeTab === 'meals' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('meals')}
        >
          Custom Meals
        </button>
        <button
          type="button"
          className={`settings__tab ${activeTab === 'categories' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          className={`settings__tab ${activeTab === 'account' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
      </div>

      <div className="settings__content">
        {activeTab === 'goals' && (
          <div className="settings__section">
            <h2>Daily Goals</h2>
            <p>Goals section - To be implemented</p>
          </div>
        )}

        {activeTab === 'foods' && (
          <div className="settings__section">
            <h2>Custom Foods</h2>
            <p>Custom foods section - To be implemented</p>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="settings__section">
            <div className="settings__section-header">
              <h2>Custom Meals</h2>
              {!showMealBuilder && (
                <button
                  type="button"
                  onClick={handleCreateMeal}
                  className="settings__create-btn"
                >
                  Create New Meal
                </button>
              )}
            </div>

            {showMealBuilder ? (
              <div className="settings__meal-builder">
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
          <div className="settings__section">
            <h2>Meal Categories</h2>
            <p className="settings__description">
              Manage your meal categories. Drag and drop to reorder, edit names, or add new categories.
            </p>
            {categoriesLoading ? (
              <p>Loading categories...</p>
            ) : categoriesError ? (
              <p className="settings__error">{categoriesError}</p>
            ) : (
              <CategoryManager
                categories={categories}
                onUpdate={loadCategories}
              />
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="settings__section">
            <h2>Account Settings</h2>

            <div className="settings__account-section">
              <h3>Password</h3>
              <p className="settings__description">
                Reset your password using the password reset flow.
              </p>
              <button
                type="button"
                onClick={() => navigate('/password-reset')}
                className="settings__action-btn settings__action-btn--secondary"
              >
                Reset Password
              </button>
            </div>

            <div className="settings__account-section settings__account-section--danger">
              <h3>Delete Account</h3>
              <p className="settings__description">
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
                className="settings__action-btn settings__action-btn--danger"
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
