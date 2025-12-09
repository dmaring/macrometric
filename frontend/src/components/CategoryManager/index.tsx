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
      <div className="w-full">
        <div className="text-center py-10 text-content-tertiary">
          <p className="mb-4">No categories found</p>
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-4 py-2 bg-primary text-white border-none rounded font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-hover min-h-[44px]"
            aria-label="Add category"
          >
            Add Category
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4" aria-hidden={dialogMode !== null}>
        <p className="m-0 text-content-secondary text-sm">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </p>
        <button
          type="button"
          onClick={handleAddCategory}
          className="px-4 py-2 bg-primary text-white border-none rounded font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-hover min-h-[44px]"
          aria-label="Add category"
        >
          Add Category
        </button>
      </div>

      {error && dialogMode === null && (
        <div className="p-3 bg-error/10 text-error rounded mb-4 text-sm" role="alert">
          {error}
        </div>
      )}

      <ul className="list-none p-0 m-0 flex flex-col gap-2" role="list" aria-hidden={dialogMode !== null}>
        {categories.map((category, index) => (
          <li
            key={category.id}
            className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-surface border border-border rounded cursor-move transition-all duration-200 ${
              dragOverIndex === index ? 'border-primary border-2 bg-primary/5' : ''
            } ${draggedIndex === index ? 'opacity-50 rotate-1' : ''} hover:bg-surface-secondary hover:border-content-tertiary`}
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
              className="bg-transparent border-none cursor-move text-content-tertiary text-xl leading-none p-0 select-none hover:text-content-secondary"
              aria-label={`Drag ${category.name}`}
              tabIndex={-1}
            >
              ⋮⋮
            </button>

            <div className="flex-1 flex items-center gap-2">
              <span className="font-semibold text-content">{category.name}</span>
              {category.is_default && (
                <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold uppercase">
                  Default
                </span>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleEditCategory(category)}
                className="px-3 py-1.5 border border-border bg-surface rounded text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-surface-secondary hover:border-content-tertiary min-h-[44px]"
                aria-label={`Edit ${category.name}`}
              >
                Edit
              </button>
              {!category.is_default && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category)}
                  className="px-3 py-1.5 border border-error/30 bg-surface text-error rounded text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-error/10 hover:border-error/60 min-h-[44px]"
                  aria-label={`Delete ${category.name}`}
                >
                  Delete
                </button>
              )}
              {category.is_default && (
                <button
                  type="button"
                  className="px-3 py-1.5 border border-error/30 bg-surface text-error rounded text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-error/10 hover:border-error/60 opacity-50 cursor-not-allowed invisible min-h-[44px]"
                  aria-label={`Delete ${category.name}`}
                  disabled
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={handleCancelDialog}>
          <div
            className="bg-surface rounded-lg p-6 min-w-[90vw] sm:min-w-[400px] max-w-[500px] shadow-lg"
            role="dialog"
            aria-labelledby="delete-dialog-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="m-0 mb-3 text-xl text-content">
              Delete {selectedCategory.name}?
            </h2>
            <p className="m-0 mb-5 text-content-secondary leading-relaxed">
              This action cannot be undone. All diary entries in this category will need to be
              moved to another category first.
            </p>
            {error && (
              <div className="p-3 bg-error/10 text-error rounded mb-4 text-sm" role="alert">
                {error}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelDialog}
                className="px-5 py-2.5 bg-surface-secondary text-content-secondary rounded font-semibold text-base cursor-pointer transition-all duration-200 border-none hover:bg-surface-tertiary disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-error text-white rounded font-semibold text-base cursor-pointer transition-all duration-200 border-none hover:bg-error/90 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
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
