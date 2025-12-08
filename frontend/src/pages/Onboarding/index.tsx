/**
 * Onboarding Page
 *
 * Initial goal-setting page for new users.
 */
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { setGoals, skipOnboarding } from '../../services/goals';
import { useAuth } from '../../hooks/useAuth';
import './Onboarding.css';

interface FormData {
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
}

interface FormErrors {
  calories?: string;
  protein_g?: string;
  carbs_g?: string;
  fat_g?: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate calories
    if (formData.calories) {
      const cal = parseInt(formData.calories);
      if (isNaN(cal) || cal < 500 || cal > 10000) {
        newErrors.calories = 'Calories must be between 500 and 10,000';
      }
    }

    // Validate macros
    const macroFields: Array<{ field: keyof FormData; label: string }> = [
      { field: 'protein_g', label: 'Protein' },
      { field: 'carbs_g', label: 'Carbs' },
      { field: 'fat_g', label: 'Fat' },
    ];

    for (const { field, label } of macroFields) {
      if (formData[field]) {
        const value = parseFloat(formData[field]);
        if (isNaN(value) || value < 0) {
          newErrors[field] = `${label} must be a positive number`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Check if at least one field is filled
    const hasAnyValue = Object.values(formData).some((val) => val !== '');
    if (!hasAnyValue) {
      setErrors({ calories: 'Please set at least one goal, or click Skip' });
      return;
    }

    setIsSubmitting(true);
    try {
      await setGoals({
        calories: formData.calories ? parseInt(formData.calories) : null,
        protein_g: formData.protein_g ? parseFloat(formData.protein_g) : null,
        carbs_g: formData.carbs_g ? parseFloat(formData.carbs_g) : null,
        fat_g: formData.fat_g ? parseFloat(formData.fat_g) : null,
      });
      completeOnboarding();
      navigate('/diary');
    } catch (error) {
      console.error('Failed to set goals:', error);
      setErrors({ calories: 'Failed to save goals. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await skipOnboarding();
      completeOnboarding();
      navigate('/diary');
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-page" data-testid="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Set Your Daily Goals</h1>
          <p>
            Track what matters to you. You can always change these later in
            settings.
          </p>
        </div>

        <form className="goals-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Calorie Target</h2>
            <p>How many calories do you want to consume per day?</p>
            <div className="form-group">
              <label htmlFor="calories">Daily Calories (optional)</label>
              <div className="input-with-unit">
                <input
                  id="calories"
                  type="number"
                  min="500"
                  max="10000"
                  value={formData.calories}
                  onChange={(e) => handleChange('calories', e.target.value)}
                  placeholder="e.g., 2000"
                  aria-invalid={!!errors.calories}
                  aria-describedby={errors.calories ? 'calories-error' : undefined}
                />
                <span className="input-unit">cal</span>
              </div>
              {errors.calories && (
                <span id="calories-error" className="form-error">
                  {errors.calories}
                </span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Macro Targets</h2>
            <p>Set targets for protein, carbs, and fat (all optional).</p>
            <div className="macro-grid">
              <div className="form-group">
                <label htmlFor="protein">Protein</label>
                <div className="input-with-unit">
                  <input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein_g}
                    onChange={(e) => handleChange('protein_g', e.target.value)}
                    placeholder="e.g., 150"
                    aria-invalid={!!errors.protein_g}
                    aria-describedby={
                      errors.protein_g ? 'protein-error' : undefined
                    }
                  />
                  <span className="input-unit">g</span>
                </div>
                {errors.protein_g && (
                  <span id="protein-error" className="form-error">
                    {errors.protein_g}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="carbs">Carbs</label>
                <div className="input-with-unit">
                  <input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs_g}
                    onChange={(e) => handleChange('carbs_g', e.target.value)}
                    placeholder="e.g., 250"
                    aria-invalid={!!errors.carbs_g}
                    aria-describedby={errors.carbs_g ? 'carbs-error' : undefined}
                  />
                  <span className="input-unit">g</span>
                </div>
                {errors.carbs_g && (
                  <span id="carbs-error" className="form-error">
                    {errors.carbs_g}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fat">Fat</label>
                <div className="input-with-unit">
                  <input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fat_g}
                    onChange={(e) => handleChange('fat_g', e.target.value)}
                    placeholder="e.g., 65"
                    aria-invalid={!!errors.fat_g}
                    aria-describedby={errors.fat_g ? 'fat-error' : undefined}
                  />
                  <span className="input-unit">g</span>
                </div>
                {errors.fat_g && (
                  <span id="fat-error" className="form-error">
                    {errors.fat_g}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              type="button"
              className="skip-button"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Set Goals'}
            </button>
          </div>

          <p className="info-text">
            You can change or clear these goals anytime from your settings.
          </p>
        </form>
      </div>
    </div>
  );
}
