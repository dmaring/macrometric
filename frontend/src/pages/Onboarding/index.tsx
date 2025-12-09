/**
 * Onboarding Page
 *
 * Initial goal-setting page for new users.
 */
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { setGoals, skipOnboarding } from '../../services/goals';
import { useAuth } from '../../hooks/useAuth';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface to-surface-secondary p-8 sm:p-4 transition-colors duration-200" data-testid="onboarding-page">
      <div className="w-full max-w-xl bg-surface-secondary rounded-xl p-10 sm:p-8 shadow-2xl border border-border">
        <div className="text-center mb-8">
          <h1 className="m-0 mb-2 text-3xl text-content font-semibold">Set Your Daily Goals</h1>
          <p className="m-0 text-content-secondary text-base">
            Track what matters to you. You can always change these later in
            settings.
          </p>
        </div>

        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3">
            <h2 className="m-0 text-lg font-semibold text-content-secondary">Calorie Target</h2>
            <p className="m-0 text-sm text-content-tertiary">How many calories do you want to consume per day?</p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="calories" className="text-sm font-medium text-content-secondary">Daily Calories (optional)</label>
              <div className="relative flex items-center">
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
                  className="flex-1 px-3 py-3 pr-12 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-content-tertiary min-h-[44px]"
                />
                <span className="absolute right-3 text-content-tertiary text-sm pointer-events-none">cal</span>
              </div>
              {errors.calories && (
                <span id="calories-error" className="text-error text-xs mt-1">
                  {errors.calories}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <h2 className="m-0 mb-2 text-lg font-semibold text-content-secondary">Macro Targets</h2>
              <p className="m-0 text-sm text-content-tertiary">Set targets for protein, carbs, and fat (all optional).</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-6 mt-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="protein" className="text-sm font-medium text-content-secondary">Protein</label>
                <div className="relative flex items-center">
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
                    className="w-full px-3 py-3 pr-10 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-content-tertiary min-h-[44px]"
                  />
                  <span className="absolute right-3 text-content-tertiary text-sm pointer-events-none">g</span>
                </div>
                {errors.protein_g && (
                  <span id="protein-error" className="text-error text-xs mt-1">
                    {errors.protein_g}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="carbs" className="text-sm font-medium text-content-secondary">Carbs</label>
                <div className="relative flex items-center">
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
                    className="w-full px-3 py-3 pr-10 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-content-tertiary min-h-[44px]"
                  />
                  <span className="absolute right-3 text-content-tertiary text-sm pointer-events-none">g</span>
                </div>
                {errors.carbs_g && (
                  <span id="carbs-error" className="text-error text-xs mt-1">
                    {errors.carbs_g}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="fat" className="text-sm font-medium text-content-secondary">Fat</label>
                <div className="relative flex items-center">
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
                    className="w-full px-3 py-3 pr-10 text-base text-content bg-surface-tertiary border border-border rounded-md focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-content-tertiary min-h-[44px]"
                  />
                  <span className="absolute right-3 text-content-tertiary text-sm pointer-events-none">g</span>
                </div>
                {errors.fat_g && (
                  <span id="fat-error" className="text-error text-xs mt-1">
                    {errors.fat_g}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 mt-6">
            <button
              type="button"
              className="flex-1 px-6 py-3.5 text-base font-medium text-content-secondary bg-transparent border border-border rounded-md cursor-pointer transition-all duration-200 hover:text-content hover:bg-surface-tertiary disabled:bg-transparent disabled:text-content-tertiary disabled:cursor-not-allowed min-h-[44px]"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="flex-[2] px-6 py-3.5 text-base font-medium text-white bg-primary border-none rounded-md cursor-pointer transition-colors duration-200 hover:bg-primary-hover disabled:bg-border disabled:text-content-tertiary disabled:cursor-not-allowed min-h-[44px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Set Goals'}
            </button>
          </div>

          <p className="text-center text-content-tertiary text-sm mt-4">
            You can change or clear these goals anytime from your settings.
          </p>
        </form>
      </div>
    </div>
  );
}
