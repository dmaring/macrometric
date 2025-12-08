/**
 * CategoryEditor Component
 *
 * Modal form for creating or editing meal categories.
 * Supports validation, keyboard shortcuts, and accessibility.
 */
import React, { useState, useEffect, useRef } from 'react';
import { MealCategory } from '../../services/categories';
import './styles.css';

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
    <form onSubmit={handleSubmit} className="category-editor__form">
      <div className="category-editor__header">
        <h2 className="category-editor__title">
          {mode === 'create' ? 'Create Category' : 'Edit Category'}
        </h2>
        {category?.is_default && (
          <span className="category-editor__badge">Default Category</span>
        )}
      </div>

      <div className="category-editor__field">
        <label
          htmlFor="category-name"
          className="category-editor__label"
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
          className={`category-editor__input ${error ? 'category-editor__input--error' : ''}`}
          aria-label="Category name"
          aria-invalid={!!error}
          aria-describedby={error ? 'category-name-error' : undefined}
          disabled={isSubmitting}
          maxLength={51}
        />
        {error && (
          <p
            id="category-name-error"
            className="category-editor__error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <div className="category-editor__actions">
        <button
          type="button"
          onClick={onCancel}
          className="category-editor__button category-editor__button--cancel"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="category-editor__button category-editor__button--save"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  );

  if (!isModal) {
    return <div className="category-editor">{content}</div>;
  }

  return (
    <div className="category-editor__overlay" onClick={onCancel}>
      <div
        className="category-editor"
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
