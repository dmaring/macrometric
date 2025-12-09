/**
 * CategoryEditor Component
 *
 * Modal form for creating or editing meal categories.
 * Supports validation, keyboard shortcuts, and accessibility.
 */
import React, { useState, useEffect, useRef } from 'react';
import { MealCategory } from '../../services/categories';

interface CategoryEditorProps {
  mode: 'create' | 'edit';
  category?: MealCategory;
  onSave: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isModal?: boolean;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({
  mode,
  category,
  onSave,
  onCancel,
  isModal = true,
}) => {
  const [name, setName] = useState(category?.name || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const validateName = (value: string): string | null => {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Category name is required';
    }

    if (trimmed.length > 50) {
      return 'Category name is too long (maximum 50 characters)';
    }

    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isSubmitting) {
      return; // Prevent duplicate submissions
    }

    const trimmedName = name.trim();
    const validationError = validateName(name);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({ name: trimmedName });
    } catch (err) {
      setError('Failed to save category. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-content m-0">
          {mode === 'create' ? 'Create Category' : 'Edit Category'}
        </h2>
        {category?.is_default && (
          <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold uppercase">
            Default Category
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="category-name"
          className="font-semibold text-content-secondary text-sm"
        >
          Category Name
        </label>
        <input
          ref={nameInputRef}
          id="category-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          onKeyPress={handleKeyPress}
          className={`w-full px-3 py-2.5 border rounded transition-all text-base ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/10'
              : 'border-border bg-surface-tertiary focus:border-primary focus:ring-2 focus:ring-primary/10'
          } focus:outline-none disabled:bg-surface-secondary disabled:cursor-not-allowed`}
          aria-label="Category name"
          aria-invalid={!!error}
          aria-describedby={error ? 'category-name-error' : undefined}
          disabled={isSubmitting}
          maxLength={51}
        />
        {error && (
          <p
            id="category-name-error"
            className="text-error text-sm m-0"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3 justify-end mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-surface-secondary text-content-secondary rounded font-semibold text-base cursor-pointer transition-all duration-200 border-none hover:bg-surface-tertiary disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-white rounded font-semibold text-base cursor-pointer transition-all duration-200 border-none hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  );

  if (!isModal) {
    return <div className="bg-surface rounded-lg p-6 min-w-[400px] max-w-[500px] shadow-md">{content}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={onCancel}>
      <div
        className="bg-surface rounded-lg p-6 min-w-[90vw] sm:min-w-[400px] max-w-[500px] shadow-lg"
        role="dialog"
        aria-labelledby="category-editor-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
};

export default CategoryEditor;
