import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryManager from '../../src/components/CategoryManager';
import * as categoriesService from '../../src/services/categories';

jest.mock('../../src/services/categories');

describe('CategoryManager', () => {
  const mockOnUpdate = jest.fn();

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Breakfast',
      display_order: 1,
      is_default: true
    },
    {
      id: 'cat-2',
      name: 'Lunch',
      display_order: 2,
      is_default: true
    },
    {
      id: 'cat-3',
      name: 'Dinner',
      display_order: 3,
      is_default: true
    },
    {
      id: 'cat-4',
      name: 'Snacks',
      display_order: 4,
      is_default: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of categories', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Snacks')).toBeInTheDocument();
  });

  it('shows default badge for default categories', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const defaultBadges = screen.getAllByText(/default/i);
    expect(defaultBadges).toHaveLength(3); // Breakfast, Lunch, Dinner
  });

  it('shows edit button for each category', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('shows delete button only for non-default categories', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // Only Snacks should have delete button visible
    expect(deleteButtons.length).toBeLessThanOrEqual(1);
  });

  it('opens edit dialog when edit clicked', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Breakfast')).toBeInTheDocument();
  });

  it('can edit category name', async () => {
    (categoriesService.updateCategory as jest.Mock).mockResolvedValue({
      id: 'cat-2',
      name: 'Brunch',
      display_order: 2,
      is_default: true
    });

    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Click edit on Lunch
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[1]);

    // Change name
    const nameInput = screen.getByDisplayValue('Lunch');
    fireEvent.change(nameInput, { target: { value: 'Brunch' } });

    // Save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(categoriesService.updateCategory).toHaveBeenCalledWith(
        'cat-2',
        { name: 'Brunch' }
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('shows add category button', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  it('opens create dialog when add clicked', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/category name/i)).toBeInTheDocument();
  });

  it('can create new category', async () => {
    (categoriesService.createCategory as jest.Mock).mockResolvedValue({
      id: 'cat-5',
      name: 'Pre-Workout',
      display_order: 5,
      is_default: false
    });

    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Click add
    const addButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addButton);

    // Enter name
    const nameInput = screen.getByLabelText(/category name/i);
    fireEvent.change(nameInput, { target: { value: 'Pre-Workout' } });

    // Save
    const saveButton = screen.getByRole('button', { name: /save|create/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(categoriesService.createCategory).toHaveBeenCalledWith({
        name: 'Pre-Workout'
      });
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('shows delete confirmation dialog', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Click delete on Snacks
    const deleteButton = screen.getByRole('button', { name: /delete snacks/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/delete.*snacks/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('can delete custom category', async () => {
    (categoriesService.deleteCategory as jest.Mock).mockResolvedValue(undefined);

    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Click delete
    const deleteButton = screen.getByRole('button', { name: /delete snacks/i });
    fireEvent.click(deleteButton);

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /confirm|delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(categoriesService.deleteCategory).toHaveBeenCalledWith('cat-4');
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles delete error for category with entries', async () => {
    (categoriesService.deleteCategory as jest.Mock).mockRejectedValue({
      response: { status: 409, data: { detail: 'Category has entries' } }
    });

    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Attempt delete
    const deleteButton = screen.getByRole('button', { name: /delete snacks/i });
    fireEvent.click(deleteButton);
    const confirmButton = screen.getByRole('button', { name: /confirm|delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/category has entries/i)).toBeInTheDocument();
    });
  });

  it('supports drag and drop reordering', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Should have draggable handles
    const dragHandles = screen.getAllByRole('button', { name: /drag/i });
    expect(dragHandles.length).toBeGreaterThanOrEqual(4);
  });

  it('can reorder categories via drag and drop', async () => {
    (categoriesService.reorderCategories as jest.Mock).mockResolvedValue(undefined);

    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Simulate drag and drop (simplified)
    const categoryItems = screen.getAllByRole('listitem');

    // Drag first item to last position
    fireEvent.dragStart(categoryItems[0]);
    fireEvent.drop(categoryItems[3]);

    await waitFor(() => {
      expect(categoriesService.reorderCategories).toHaveBeenCalled();
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('shows loading state during operations', async () => {
    (categoriesService.deleteCategory as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const deleteButton = screen.getByRole('button', { name: /delete snacks/i });
    fireEvent.click(deleteButton);
    const confirmButton = screen.getByRole('button', { name: /confirm|delete/i });
    fireEvent.click(confirmButton);

    expect(await screen.findByText(/deleting/i)).toBeInTheDocument();
  });

  it('handles empty category list', () => {
    render(<CategoryManager categories={[]} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/no categories/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  it('validates category name is required', async () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Open add dialog
    const addButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addButton);

    // Try to save without name
    const saveButton = screen.getByRole('button', { name: /save|create/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(categoriesService.createCategory).not.toHaveBeenCalled();
  });

  it('validates category name length', async () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/category name/i);
    fireEvent.change(nameInput, { target: { value: 'x'.repeat(51) } });

    const saveButton = screen.getByRole('button', { name: /save|create/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/too long/i)).toBeInTheDocument();
  });

  it('prevents deleting default categories', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Default categories should not have visible delete buttons or should be disabled
    const breakfast = screen.getByText('Breakfast').closest('li');
    const deleteButton = breakfast?.querySelector('button[aria-label*="delete"]');

    if (deleteButton) {
      expect(deleteButton).toBeDisabled();
    }
  });

  it('shows category count', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/4 categories/i)).toBeInTheDocument();
  });

  it('can cancel edit operation', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    // Open edit dialog
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(categoriesService.updateCategory).not.toHaveBeenCalled();
  });

  it('can cancel delete operation', () => {
    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const deleteButton = screen.getByRole('button', { name: /delete snacks/i });
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(categoriesService.deleteCategory).not.toHaveBeenCalled();
  });

  it('handles network errors gracefully', async () => {
    (categoriesService.createCategory as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<CategoryManager categories={mockCategories} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText(/category name/i);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    const saveButton = screen.getByRole('button', { name: /save|create/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/error|failed/i)).toBeInTheDocument();
  });
});
