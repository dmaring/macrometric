import React, { useState, useEffect } from 'react';
import { getGoals, setGoals, Goals, SetGoalsRequest } from '../../services/goals';

interface GoalsFormProps {
  onSave?: () => void;
}

const GoalsForm: React.FC<GoalsFormProps> = ({ onSave }) => {
  // T018: Form state management
  const [goals, setGoalsState] = useState<Goals | null>(null);
  const [formData, setFormData] = useState<SetGoalsRequest>({
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previousGoals, setPreviousGoals] = useState<SetGoalsRequest | null>(null);

  // T016: Load goals on component mount
  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGoals();
        setGoalsState(data);
        if (data) {
          setFormData({
            calories: data.calories,
            protein_g: data.protein_g,
            carbs_g: data.carbs_g,
            fat_g: data.fat_g,
          });
        }
      } catch (err) {
        setError('Failed to load goals. Please try again.');
        console.error('Error loading goals:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  // T017: Validation function
  const validateGoals = (data: SetGoalsRequest): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (data.calories !== null && data.calories !== undefined) {
      if (data.calories < 500) {
        newErrors.calories = 'Minimum 500 calories';
      }
      if (data.calories > 10000) {
        newErrors.calories = 'Maximum 10,000 calories';
      }
      if (!Number.isInteger(data.calories)) {
        newErrors.calories = 'Must be a whole number';
      }
    }

    ['protein_g', 'carbs_g', 'fat_g'].forEach((field) => {
      const value = data[field as keyof SetGoalsRequest];
      if (value !== null && value !== undefined && value < 0) {
        newErrors[field] = 'Cannot be negative';
      }
    });

    return newErrors;
  };

  // T019: Handle input changes
  const handleChange = (field: keyof SetGoalsRequest, value: string) => {
    const numValue = value === '' ? null : Number(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof SetGoalsRequest) => {
    const validationErrors = validateGoals(formData);
    if (validationErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
    }
  };

  // T020: Handle form submission with optimistic updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateGoals(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setError(null);
    setPreviousGoals({ ...formData });

    try {
      const updatedGoals = await setGoals(formData);
      setGoalsState(updatedGoals);
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError('Failed to save goals. Please try again.');
      // Rollback to previous goals on error
      if (previousGoals) {
        setFormData(previousGoals);
      }
      console.error('Error saving goals:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (goals) {
      setFormData({
        calories: goals.calories,
        protein_g: goals.protein_g,
        carbs_g: goals.carbs_g,
        fat_g: goals.fat_g,
      });
    } else {
      setFormData({
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
      });
    }
    setErrors({});
    setError(null);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // T022: Loading skeleton
  if (loading) {
    return (
      <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
        <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Daily Goals</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-surface-tertiary rounded"></div>
          <div className="h-10 bg-surface-tertiary rounded"></div>
          <div className="h-10 bg-surface-tertiary rounded"></div>
          <div className="h-10 bg-surface-tertiary rounded"></div>
        </div>
      </div>
    );
  }

  // T024: Error state
  if (error && !saving) {
    return (
      <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
        <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Daily Goals</h2>
        <div className="p-4 bg-error/10 border border-error/30 rounded-md mb-4">
          <p className="text-error text-sm mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="text-error underline text-sm hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // T021: Form UI with Tailwind classes
  return (
    <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
      <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Daily Goals</h2>

      {/* T023: Empty state */}
      {!goals && !loading && (
        <p className="text-content-secondary mb-6">
          Set your daily targets to track progress
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Calories */}
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-content mb-2">
            Calories
          </label>
          <input
            id="calories"
            type="number"
            value={formData.calories ?? ''}
            onChange={(e) => handleChange('calories', e.target.value)}
            onBlur={() => handleBlur('calories')}
            className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            placeholder="2000"
            aria-label="Daily calorie goal"
            aria-describedby={errors.calories ? 'calories-error' : undefined}
          />
          {errors.calories && (
            <p id="calories-error" className="mt-1 text-sm text-error">{errors.calories}</p>
          )}
        </div>

        {/* Protein */}
        <div>
          <label htmlFor="protein_g" className="block text-sm font-medium text-content mb-2">
            Protein (g)
          </label>
          <input
            id="protein_g"
            type="number"
            step="0.01"
            value={formData.protein_g ?? ''}
            onChange={(e) => handleChange('protein_g', e.target.value)}
            onBlur={() => handleBlur('protein_g')}
            className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            placeholder="150"
            aria-label="Daily protein goal in grams"
            aria-describedby={errors.protein_g ? 'protein-error' : undefined}
          />
          {errors.protein_g && (
            <p id="protein-error" className="mt-1 text-sm text-error">{errors.protein_g}</p>
          )}
        </div>

        {/* Carbs */}
        <div>
          <label htmlFor="carbs_g" className="block text-sm font-medium text-content mb-2">
            Carbs (g)
          </label>
          <input
            id="carbs_g"
            type="number"
            step="0.01"
            value={formData.carbs_g ?? ''}
            onChange={(e) => handleChange('carbs_g', e.target.value)}
            onBlur={() => handleBlur('carbs_g')}
            className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            placeholder="200"
            aria-label="Daily carbohydrate goal in grams"
            aria-describedby={errors.carbs_g ? 'carbs-error' : undefined}
          />
          {errors.carbs_g && (
            <p id="carbs-error" className="mt-1 text-sm text-error">{errors.carbs_g}</p>
          )}
        </div>

        {/* Fat */}
        <div>
          <label htmlFor="fat_g" className="block text-sm font-medium text-content mb-2">
            Fat (g)
          </label>
          <input
            id="fat_g"
            type="number"
            step="0.01"
            value={formData.fat_g ?? ''}
            onChange={(e) => handleChange('fat_g', e.target.value)}
            onBlur={() => handleBlur('fat_g')}
            className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            placeholder="65"
            aria-label="Daily fat goal in grams"
            aria-describedby={errors.fat_g ? 'fat-error' : undefined}
          />
          {errors.fat_g && (
            <p id="fat-error" className="mt-1 text-sm text-error">{errors.fat_g}</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/30 rounded-md">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* T025: Save and Cancel buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || Object.keys(errors).length > 0}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-surface-tertiary text-content border border-border rounded-lg hover:bg-surface transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalsForm;
