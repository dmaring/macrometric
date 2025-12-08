/**
 * CategoryManager Component
 *
 * Manages meal categories with drag-and-drop reordering, create, edit, and delete operations.
 * Includes confirmation dialogs and error handling for categories with existing entries.
 */
import React, { useState } from 'react';
import {
  MealCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../../services/categories';
import CategoryEditor from '../CategoryEditor';
import './styles.css';

interface CategoryManagerProps {
  categories: MealCategory[];
  onUpdate: () => void;
}

type DialogMode = 'create' | 'edit' | 'delete' | null;

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate }) => {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setDialogMode('create');
    setError('');
  };

  const handleEditCategory = (category: MealCategory) => {
    setSelectedCategory(category);
    setDialogMode('edit');
    setError('');
  };

  const handleDeleteCategory = (category: MealCategory) => {
    setSelectedCategory(category);
    setDialogMode('delete');
    setError('');
  };

  const handleCancelDialog = () => {
    setDialogMode(null);
    setSelectedCategory(null);
    setError('');
  };

  const handleSaveCategory = async (data: { name: string }) => {
    setIsProcessing(true);
    setError('');

    try {
      if (dialogMode === 'create') {
        await createCategory(data);
      } else if (dialogMode === 'edit' && selectedCategory) {
        await updateCategory(selectedCategory.id, data);
      }

      setDialogMode(null);
      setSelectedCategory(null);
      setIsProcessing(false);
      await onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save category');
      setIsProcessing(false);
      throw err; // Re-throw to let CategoryEditor handle it
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    setIsProcessing(true);
    setError('');

    try {
      await deleteCategory(selectedCategory.id);
      setDialogMode(null);
      setSelectedCategory(null);
      await onUpdate();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete category';

      // Check if error is due to existing entries
      if (err.response?.status === 409 || errorMessage.toLowerCase().includes('entries')) {
        setError(
          'This category has entries. Please move or delete the entries before deleting this category.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Reorder categories
    const reorderedCategories = [...categories];
    const [movedCategory] = reorderedCategories.splice(draggedIndex, 1);
    reorderedCategories.splice(dropIndex, 0, movedCategory);

    setDraggedIndex(null);

    // Send new order to backend
    try {
      const categoryIds = reorderedCategories.map((cat) => cat.id);
      await reorderCategories(categoryIds);
      await onUpdate();
    } catch (err) {
      setError('Failed to reorder categories');
      console.error('Error reordering categories:', err);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (categories.length === 0) {
    return (
      <div className="category-manager">
        <div className="category-manager__empty">
          <p>No categories found</p>
          <button
            type="button"
            onClick={handleAddCategory}
            className="category-manager__add-btn"
            aria-label="Add category"
          >
            Add Category
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-manager">
      <div className="category-manager__header" aria-hidden={dialogMode !== null}>
        <p className="category-manager__count">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </p>
        <button
          type="button"
          onClick={handleAddCategory}
          className="category-manager__add-btn"
          aria-label="Add category"
        >
          Add Category
        </button>
      </div>

      {error && dialogMode === null && (
        <div className="category-manager__error" role="alert">
          {error}
        </div>
      )}

      <ul className="category-manager__list" role="list" aria-hidden={dialogMode !== null}>
        {categories.map((category, index) => (
          <li
            key={category.id}
            className={`category-manager__item ${
              dragOverIndex === index ? 'category-manager__item--drag-over' : ''
            } ${draggedIndex === index ? 'category-manager__item--dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            role="listitem"
          >
            <button
              type="button"
              className="category-manager__drag-handle"
              aria-label={`Drag ${category.name}`}
              tabIndex={-1}
            >
              ⋮⋮
            </button>

            <div className="category-manager__info">
              <span className="category-manager__name">{category.name}</span>
              {category.is_default && (
                <span className="category-manager__badge">Default</span>
              )}
            </div>

            <div className="category-manager__actions">
              <button
                type="button"
                onClick={() => handleEditCategory(category)}
                className="category-manager__action-btn"
                aria-label={`Edit ${category.name}`}
              >
                Edit
              </button>
              {!category.is_default && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category)}
                  className="category-manager__action-btn category-manager__action-btn--delete"
                  aria-label={`Delete ${category.name}`}
                >
                  Delete
                </button>
              )}
              {category.is_default && (
                <button
                  type="button"
                  className="category-manager__action-btn category-manager__action-btn--delete"
                  aria-label={`Delete ${category.name}`}
                  disabled
                  style={{ visibility: 'hidden' }}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Create/Edit Dialog */}
      {(dialogMode === 'create' || dialogMode === 'edit') && (
        <CategoryEditor
          mode={dialogMode}
          category={selectedCategory || undefined}
          onSave={handleSaveCategory}
          onCancel={handleCancelDialog}
          isModal={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {dialogMode === 'delete' && selectedCategory && (
        <div className="category-manager__overlay" onClick={handleCancelDialog}>
          <div
            className="category-manager__dialog"
            role="dialog"
            aria-labelledby="delete-dialog-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="category-manager__dialog-title">
              Delete {selectedCategory.name}?
            </h2>
            <p className="category-manager__dialog-message">
              This action cannot be undone. All diary entries in this category will need to be
              moved to another category first.
            </p>
            {error && (
              <div className="category-manager__dialog-error" role="alert">
                {error}
              </div>
            )}
            <div className="category-manager__dialog-actions">
              <button
                type="button"
                onClick={handleCancelDialog}
                className="category-manager__dialog-btn category-manager__dialog-btn--cancel"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="category-manager__dialog-btn category-manager__dialog-btn--delete"
                disabled={isProcessing}
                aria-label="Confirm delete"
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
