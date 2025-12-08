/**
 * AddFoodModal Component
 *
 * Modal for adding food entries with search and manual entry options.
 */
import { useState, useEffect, useRef } from 'react';
import FoodSearch from '../FoodSearch';
import { Food } from '../../services/foodSearch';
import { createCustomFood } from '../../services/customFoods';
import './AddFoodModal.css';

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
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="add-food-modal"
    >
      <div
        className="add-food-modal"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="modal-header">
          <h2 id="modal-title">Add Food to {categoryName}</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="search-section">
            <h3>Search Foods</h3>
            <FoodSearch onSelect={handleFoodSelect} />
          </div>

          <div className="divider">
            <span>OR ENTER MANUALLY</span>
          </div>

          <div className="food-form">
            <div className="form-group">
              <label htmlFor="food-name">Food Name *</label>
              <input
                id="food-name"
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Chicken Breast"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <span id="name-error" className="form-error">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="food-brand">Brand (optional)</label>
              <input
                id="food-brand"
                type="text"
                value={formData.brand || ''}
                onChange={(e) =>
                  handleChange('brand', e.target.value || null)
                }
                placeholder="e.g., Tyson"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serving-size">Serving Size *</label>
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
                />
                {errors.serving_size && (
                  <span id="serving-size-error" className="form-error">
                    {errors.serving_size}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="serving-unit">Serving Unit *</label>
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
                />
                {errors.serving_unit && (
                  <span id="serving-unit-error" className="form-error">
                    {errors.serving_unit}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
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
                />
                {errors.quantity && (
                  <span id="quantity-error" className="form-error">
                    {errors.quantity}
                  </span>
                )}
              </div>
            </div>

            <div className="macros-section">
              <h3>Nutrition per Serving</h3>
              <div className="macros-grid">
                <div className="form-group">
                  <label htmlFor="calories">Calories *</label>
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
                  />
                  {errors.calories && (
                    <span id="calories-error" className="form-error">
                      {errors.calories}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="protein">Protein (g) *</label>
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
                  />
                  {errors.protein_g && (
                    <span id="protein-error" className="form-error">
                      {errors.protein_g}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="carbs">Carbs (g) *</label>
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
                  />
                  {errors.carbs_g && (
                    <span id="carbs-error" className="form-error">
                      {errors.carbs_g}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="fat">Fat (g) *</label>
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
                  />
                  {errors.fat_g && (
                    <span id="fat-error" className="form-error">
                      {errors.fat_g}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={saveAsCustom}
                  onChange={(e) => setSaveAsCustom(e.target.checked)}
                />
                <span>Save as custom food for future use</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
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
