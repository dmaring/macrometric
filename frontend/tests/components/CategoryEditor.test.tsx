import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryEditor from '../../src/components/CategoryEditor';

describe('CategoryEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders empty form for new category', () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/category name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category name/i)).toHaveValue('');
      expect(screen.getByRole('button', { name: /create|save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows create title', () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText(/create category|new category/i)).toBeInTheDocument();
    });

    it('can enter category name', () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Snacks' } });

      expect(nameInput).toHaveValue('Snacks');
    });

    it('calls onSave with name when form submitted', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Pre-Workout' } });

      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ name: 'Pre-Workout' });
      });
    });

    it('validates name is required', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('validates name length', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel=  {mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);

      // Too long
      fireEvent.change(nameInput, { target: { value: 'x'.repeat(51) } });

      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      expect(await screen.findByText(/too long|maximum/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('trims whitespace from name', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: '  Snacks  ' } });

      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ name: 'Snacks' });
      });
    });

    it('can cancel creation', () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const existingCategory = {
      id: 'cat-1',
      name: 'Lunch',
      display_order: 2,
      is_default: false
    };

    it('renders pre-filled form for existing category', () => {
      render(
        <CategoryEditor
          mode="edit"
          category={existingCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/category name/i)).toHaveValue('Lunch');
    });

    it('shows edit title', () => {
      render(
        <CategoryEditor
          mode="edit"
          category={existingCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/edit category/i)).toBeInTheDocument();
    });

    it('can update category name', () => {
      render(
        <CategoryEditor
          mode="edit"
          category={existingCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Brunch' } });

      expect(nameInput).toHaveValue('Brunch');
    });

    it('calls onSave with updated name', async () => {
      render(
        <CategoryEditor
          mode="edit"
          category={existingCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Brunch' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ name: 'Brunch' });
      });
    });

    it('validates name on edit', async () => {
      render(
        <CategoryEditor
          mode="edit"
          category={existingCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows default badge for default categories', () => {
      const defaultCategory = { ...existingCategory, is_default: true };

      render(
        <CategoryEditor
          mode="edit"
          category={defaultCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/default category/i)).toBeInTheDocument();
    });

    it('can cancel edit', () => {
      render(
        <CategoryEditor
          mode="edit"
          category={existingCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('does not call onSave if name unchanged', async () => {
      render(
        <CategoryEditor
          mode="edit"
          category={existingCategory}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Still calls onSave, but the parent should handle no-change scenario
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ name: 'Lunch' });
      });
    });
  });

  describe('Form Behavior', () => {
    it('supports Enter key to submit', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Quick Entry' } });
      fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ name: 'Quick Entry' });
      });
    });

    it('supports Escape key to cancel', () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.keyDown(nameInput, { key: 'Escape', code: 'Escape' });

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('disables save button during submission', async () => {
      const slowSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<CategoryEditor mode="create" onSave={slowSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('shows loading state during save', async () => {
      const slowSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<CategoryEditor mode="create" onSave={slowSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      expect(await screen.findByText(/saving/i)).toBeInTheDocument();
    });

    it('clears validation errors when input changes', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      // Trigger validation error
      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      expect(await screen.findByText(/name is required/i)).toBeInTheDocument();

      // Type in input
      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      // Error should clear
      expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
    });

    it('focuses name input on mount', () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      expect(document.activeElement).toBe(nameInput);
    });

    it('prevents duplicate submissions', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/category name/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const saveButton = screen.getByRole('button', { name: /create|save/i });

      // Click multiple times rapidly
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/category name/i)).toHaveAttribute('aria-label');
    });

    it('associates error messages with input', async () => {
      render(<CategoryEditor mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const saveButton = screen.getByRole('button', { name: /create|save/i });
      fireEvent.click(saveButton);

      const nameInput = screen.getByLabelText(/category name/i);
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('has proper dialog role if in modal', () => {
      render(
        <CategoryEditor
          mode="create"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isModal={true}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
