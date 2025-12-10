import React, { useState, useEffect } from 'react';
import {
  CustomFood,
  CreateCustomFoodRequest,
  createCustomFood,
  updateCustomFood,
} from '../../services/customFoods';

interface CustomFoodFormProps {
  food?: CustomFood;
  onSave: () => void;
  onCancel: () => void;
}

const CustomFoodForm: React.FC<CustomFoodFormProps> = ({ food, onSave, onCancel }) => {
  // T054: Form state management
  const [formData, setFormData] = useState<CreateCustomFoodRequest>({
    name: '',
    brand: null,
    serving_size: null as unknown as number,
    serving_unit: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect mode: edit if food is provided, create otherwise
  const isEditMode = !!food;

  // Initialize form data in edit mode
  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name,
        brand: food.brand,
        serving_size: food.serving_size,
        serving_unit: food.serving_unit,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
      });
    }
  }, [food]);

  // T053: Validation function
  const validateCustomFood = (data: CreateCustomFoodRequest): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!data.name || data.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    if (!data.serving_size || data.serving_size <= 0) {
      if (!data.serving_size) {
        newErrors.serving_size = 'Serving size is required';
      } else {
        newErrors.serving_size = 'Serving size must be positive';
      }
    }

    if (!data.serving_unit || data.serving_unit.trim() === '') {
      newErrors.serving_unit = 'Serving unit is required';
    }

    // Non-negative nutritional values
    if (data.calories < 0) {
      newErrors.calories = 'Calories cannot be negative';
    }

    if (data.protein_g < 0) {
      newErrors.protein_g = 'Protein cannot be negative';
    }

    if (data.carbs_g < 0) {
      newErrors.carbs_g = 'Carbs cannot be negative';
    }

    if (data.fat_g < 0) {
      newErrors.fat_g = 'Fat cannot be negative';
    }

    return newErrors;
  };

  // T055: Handle input changes
  const handleChange = (field: keyof CreateCustomFoodRequest, value: string) => {
    let processedValue: string | number | null = value;

    // Process numeric fields
    if (['serving_size', 'calories', 'protein_g', 'carbs_g', 'fat_g'].includes(field)) {
      processedValue = value === '' ? 0 : Number(value);
    }

    // Handle brand (can be null)
    if (field === 'brand' && value === '') {
      processedValue = null;
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof CreateCustomFoodRequest) => {
    const validationErrors = validateCustomFood(formData);
    if (validationErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
    }
  };

  // T056: Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCustomFood(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        // Update existing food
        await updateCustomFood(food.id, formData);
      } else {
        // Create new food
        await createCustomFood(formData);
      }

      onSave();
    } catch (err) {
      setError('Failed to save custom food. Please try again.');
      console.error('Error saving custom food:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // T057-T060: Form UI
  return (
    <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
      {/* T058: Form title based on mode */}
      <h2 className="m-0 mb-6 text-2xl text-content font-semibold">
        {isEditMode ? 'Edit Custom Food' : 'Create Custom Food'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-content mb-2">
            Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            placeholder="Protein Shake"
            aria-label="Food name"
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-error">{errors.name}</p>
          )}
        </div>

        {/* Brand (optional) */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-content mb-2">
            Brand
          </label>
          <input
            id="brand"
            type="text"
            value={formData.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
            className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            placeholder="HomeMade"
            aria-label="Brand name (optional)"
          />
        </div>

        {/* Serving Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="serving_size" className="block text-sm font-medium text-content mb-2">
              Serving Size *
            </label>
            <input
              id="serving_size"
              type="number"
              step="0.01"
              value={formData.serving_size || ''}
              onChange={(e) => handleChange('serving_size', e.target.value)}
              onBlur={() => handleBlur('serving_size')}
              className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              placeholder="250"
              aria-label="Serving size"
              aria-describedby={errors.serving_size ? 'serving_size-error' : undefined}
            />
            {errors.serving_size && (
              <p id="serving_size-error" className="mt-1 text-sm text-error">{errors.serving_size}</p>
            )}
          </div>

          <div>
            <label htmlFor="serving_unit" className="block text-sm font-medium text-content mb-2">
              Serving Unit *
            </label>
            <input
              id="serving_unit"
              type="text"
              value={formData.serving_unit}
              onChange={(e) => handleChange('serving_unit', e.target.value)}
              onBlur={() => handleBlur('serving_unit')}
              className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              placeholder="ml, g, cup, etc."
              aria-label="Serving unit"
              aria-describedby={errors.serving_unit ? 'serving_unit-error' : undefined}
            />
            {errors.serving_unit && (
              <p id="serving_unit-error" className="mt-1 text-sm text-error">{errors.serving_unit}</p>
            )}
          </div>
        </div>

        {/* Nutritional Information */}
        <div className="pt-4 border-t border-border">
          <h3 className="m-0 mb-4 text-lg text-content font-semibold">Nutritional Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Calories */}
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-content mb-2">
                Calories
              </label>
              <input
                id="calories"
                type="number"
                step="0.01"
                value={formData.calories}
                onChange={(e) => handleChange('calories', e.target.value)}
                onBlur={() => handleBlur('calories')}
                className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                placeholder="200"
                aria-label="Calories"
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
                value={formData.protein_g}
                onChange={(e) => handleChange('protein_g', e.target.value)}
                onBlur={() => handleBlur('protein_g')}
                className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                placeholder="30"
                aria-label="Protein in grams"
                aria-describedby={errors.protein_g ? 'protein_g-error' : undefined}
              />
              {errors.protein_g && (
                <p id="protein_g-error" className="mt-1 text-sm text-error">{errors.protein_g}</p>
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
                value={formData.carbs_g}
                onChange={(e) => handleChange('carbs_g', e.target.value)}
                onBlur={() => handleBlur('carbs_g')}
                className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                placeholder="10"
                aria-label="Carbohydrates in grams"
                aria-describedby={errors.carbs_g ? 'carbs_g-error' : undefined}
              />
              {errors.carbs_g && (
                <p id="carbs_g-error" className="mt-1 text-sm text-error">{errors.carbs_g}</p>
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
                value={formData.fat_g}
                onChange={(e) => handleChange('fat_g', e.target.value)}
                onBlur={() => handleBlur('fat_g')}
                className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                placeholder="5"
                aria-label="Fat in grams"
                aria-describedby={errors.fat_g ? 'fat_g-error' : undefined}
              />
              {errors.fat_g && (
                <p id="fat_g-error" className="mt-1 text-sm text-error">{errors.fat_g}</p>
              )}
            </div>
          </div>
        </div>

        {/* T060: Error display */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/30 rounded-md">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* T059: Save and cancel buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || Object.keys(errors).length > 0}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Food'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-surface-tertiary text-content border border-border rounded-lg hover:bg-surface transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomFoodForm;
