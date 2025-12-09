/**
 * AddFoodModal Component
 *
 * Modal for adding food entries with search and manual entry options.
 */
import { useState, useEffect, useRef } from 'react';
import FoodSearch from '../FoodSearch';
import { Food } from '../../services/foodSearch';
import { createCustomFood } from '../../services/customFoods';

interface AddFoodModalProps {
  isOpen: boolean;
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  onSubmit: (food: FoodData) => void;
}

export interface FoodData {
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  quantity: number;
}

interface FormErrors {
  name?: string;
  serving_size?: string;
  serving_unit?: string;
  calories?: string;
  protein_g?: string;
  carbs_g?: string;
  fat_g?: string;
  quantity?: string;
}

export default function AddFoodModal({
  isOpen,
  categoryId,
  categoryName,
  onClose,
  onSubmit,
}: AddFoodModalProps) {
  const [formData, setFormData] = useState<FoodData>({
    name: '',
    brand: null,
    serving_size: 1,
    serving_unit: 'serving',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    quantity: 1,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAsCustom, setSaveAsCustom] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        brand: null,
        serving_size: 1,
        serving_unit: 'serving',
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        quantity: 1,
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (field: keyof FoodData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field changes
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }

    if (formData.serving_size <= 0) {
      newErrors.serving_size = 'Serving size must be greater than 0';
    }

    if (!formData.serving_unit.trim()) {
      newErrors.serving_unit = 'Serving unit is required';
    }

    if (formData.calories < 0) {
      newErrors.calories = 'Calories cannot be negative';
    }

    if (formData.protein_g < 0) {
      newErrors.protein_g = 'Protein cannot be negative';
    }

    if (formData.carbs_g < 0) {
      newErrors.carbs_g = 'Carbs cannot be negative';
    }

    if (formData.fat_g < 0) {
      newErrors.fat_g = 'Fat cannot be negative';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Save as custom food if checkbox is checked
      if (saveAsCustom) {
        await createCustomFood({
          name: formData.name,
          brand: formData.brand,
          serving_size: formData.serving_size,
          serving_unit: formData.serving_unit,
          calories: formData.calories,
          protein_g: formData.protein_g,
          carbs_g: formData.carbs_g,
          fat_g: formData.fat_g,
        });
      }

      // Add to diary
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to add food:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleFoodSelect = (food: Food) => {
    // Pre-fill form with selected food data
    setFormData({
      name: food.name,
      brand: null,
      serving_size: food.serving_size,
      serving_unit: food.serving_unit,
      calories: Math.round(food.calories),
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      quantity: 1,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="add-food-modal"
    >
      <div
        className="bg-surface-secondary rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id="modal-title" className="m-0 text-xl text-content font-semibold">Add Food to {categoryName}</h2>
          <button
            className="w-8 h-8 min-w-[44px] min-h-[44px] text-2xl text-content-secondary bg-transparent border-none rounded cursor-pointer flex items-center justify-center transition-colors duration-200 hover:text-content hover:bg-surface-tertiary"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="px-5 py-5" onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="m-0 mb-3 text-base font-semibold text-content-secondary">Search Foods</h3>
            <FoodSearch onSelect={handleFoodSelect} />
          </div>

          <div className="flex items-center text-center my-6 before:content-[''] before:flex-1 before:border-b before:border-border after:content-[''] after:flex-1 after:border-b after:border-border">
            <span className="px-4 text-xs text-content-tertiary font-medium">OR ENTER MANUALLY</span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="food-name" className="text-sm font-medium text-content-secondary">Food Name *</label>
              <input
                id="food-name"
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Chicken Breast"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-content-tertiary min-h-[44px]"
              />
              {errors.name && (
                <span id="name-error" className="text-error text-xs mt-1">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="food-brand" className="text-sm font-medium text-content-secondary">Brand (optional)</label>
              <input
                id="food-brand"
                type="text"
                value={formData.brand || ''}
                onChange={(e) =>
                  handleChange('brand', e.target.value || null)
                }
                placeholder="e.g., Tyson"
                className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-content-tertiary min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="serving-size" className="text-sm font-medium text-content-secondary">Serving Size *</label>
                <input
                  id="serving-size"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.serving_size}
                  onChange={(e) =>
                    handleChange('serving_size', parseFloat(e.target.value) || 0)
                  }
                  aria-invalid={!!errors.serving_size}
                  aria-describedby={
                    errors.serving_size ? 'serving-size-error' : undefined
                  }
                  className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 min-h-[44px]"
                />
                {errors.serving_size && (
                  <span id="serving-size-error" className="text-error text-xs mt-1">
                    {errors.serving_size}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="serving-unit" className="text-sm font-medium text-content-secondary">Serving Unit *</label>
                <input
                  id="serving-unit"
                  type="text"
                  value={formData.serving_unit}
                  onChange={(e) => handleChange('serving_unit', e.target.value)}
                  placeholder="e.g., oz, g, cup"
                  aria-invalid={!!errors.serving_unit}
                  aria-describedby={
                    errors.serving_unit ? 'serving-unit-error' : undefined
                  }
                  className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-content-tertiary min-h-[44px]"
                />
                {errors.serving_unit && (
                  <span id="serving-unit-error" className="text-error text-xs mt-1">
                    {errors.serving_unit}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="quantity" className="text-sm font-medium text-content-secondary">Quantity *</label>
                <input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleChange('quantity', parseFloat(e.target.value) || 0)
                  }
                  aria-invalid={!!errors.quantity}
                  aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                  className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 min-h-[44px]"
                />
                {errors.quantity && (
                  <span id="quantity-error" className="text-error text-xs mt-1">
                    {errors.quantity}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2">
              <h3 className="m-0 mb-3 text-base font-semibold text-content">Nutrition per Serving</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="calories" className="text-sm font-medium text-content-secondary">Calories *</label>
                  <input
                    id="calories"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.calories}
                    onChange={(e) =>
                      handleChange('calories', parseInt(e.target.value) || 0)
                    }
                    aria-invalid={!!errors.calories}
                    aria-describedby={
                      errors.calories ? 'calories-error' : undefined
                    }
                    className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 min-h-[44px]"
                  />
                  {errors.calories && (
                    <span id="calories-error" className="text-error text-xs mt-1">
                      {errors.calories}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="protein" className="text-sm font-medium text-content-secondary">Protein (g) *</label>
                  <input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein_g}
                    onChange={(e) =>
                      handleChange('protein_g', parseFloat(e.target.value) || 0)
                    }
                    aria-invalid={!!errors.protein_g}
                    aria-describedby={
                      errors.protein_g ? 'protein-error' : undefined
                    }
                    className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 min-h-[44px]"
                  />
                  {errors.protein_g && (
                    <span id="protein-error" className="text-error text-xs mt-1">
                      {errors.protein_g}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="carbs" className="text-sm font-medium text-content-secondary">Carbs (g) *</label>
                  <input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs_g}
                    onChange={(e) =>
                      handleChange('carbs_g', parseFloat(e.target.value) || 0)
                    }
                    aria-invalid={!!errors.carbs_g}
                    aria-describedby={errors.carbs_g ? 'carbs-error' : undefined}
                    className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 min-h-[44px]"
                  />
                  {errors.carbs_g && (
                    <span id="carbs-error" className="text-error text-xs mt-1">
                      {errors.carbs_g}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fat" className="text-sm font-medium text-content-secondary">Fat (g) *</label>
                  <input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fat_g}
                    onChange={(e) =>
                      handleChange('fat_g', parseFloat(e.target.value) || 0)
                    }
                    aria-invalid={!!errors.fat_g}
                    aria-describedby={errors.fat_g ? 'fat-error' : undefined}
                    className="px-3 py-3 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 min-h-[44px]"
                  />
                  {errors.fat_g && (
                    <span id="fat-error" className="text-error text-xs mt-1">
                      {errors.fat_g}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-content-secondary">
                <input
                  type="checkbox"
                  checked={saveAsCustom}
                  onChange={(e) => setSaveAsCustom(e.target.checked)}
                  className="w-auto cursor-pointer min-w-[44px] min-h-[44px]"
                />
                <span className="select-none">Save as custom food for future use</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
            <button
              type="button"
              className="px-5 py-3 text-base font-medium text-content-secondary bg-transparent border border-border rounded-md cursor-pointer transition-all duration-200 hover:text-content hover:bg-surface-tertiary min-h-[44px]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 text-base font-medium text-white bg-primary border-none rounded-md cursor-pointer transition-colors duration-200 hover:bg-primary-hover disabled:bg-border disabled:text-content-tertiary disabled:cursor-not-allowed min-h-[44px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
