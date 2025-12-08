import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MealBuilder from '../../src/components/MealBuilder';
import * as mealsService from '../../src/services/meals';
import * as foodsService from '../../src/services/foods';

jest.mock('../../src/services/meals');
jest.mock('../../src/services/foods');

describe('MealBuilder', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const mockFood = {
    id: 'custom:food-1',
    name: 'Test Food',
    brand: 'Test Brand',
    serving_size: 100,
    serving_unit: 'g',
    calories: 200,
    protein_g: 10,
    carbs_g: 20,
    fat_g: 5,
    source: 'custom' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (foodsService.searchFoods as jest.Mock).mockResolvedValue({
      results: [mockFood],
      total: 1,
      query: 'test'
    });
  });

  it('renders meal builder form', () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/meal name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search foods/i)).toBeInTheDocument();
    expect(screen.getByText(/save meal/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('allows entering meal name', () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/meal name/i);
    fireEvent.change(nameInput, { target: { value: 'Breakfast Combo' } });

    expect(nameInput).toHaveValue('Breakfast Combo');
  });

  it('searches for foods when typing', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(foodsService.searchFoods).toHaveBeenCalledWith('test', expect.anything());
    });

    expect(await screen.findByText('Test Food')).toBeInTheDocument();
  });

  it('adds food to meal items', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Search for food
    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Click add button on food result
    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Verify food appears in meal items
    expect(screen.getByText('Test Food')).toBeInTheDocument();
    expect(screen.getByText(/100 g/i)).toBeInTheDocument();
  });

  it('adjusts quantity of food item', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Add food
    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Find quantity input
    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    fireEvent.change(quantityInput, { target: { value: '2' } });

    expect(quantityInput).toHaveValue(2);
  });

  it('removes food from meal items', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Add food
    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Remove food
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    // Verify food removed
    expect(screen.queryByText('Test Food')).not.toBeInTheDocument();
  });

  it('calculates and displays meal totals', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Add food with quantity 2
    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    fireEvent.change(quantityInput, { target: { value: '2' } });

    // Verify totals: 200 cal * 2 = 400
    await waitFor(() => {
      expect(screen.getByText(/400/)).toBeInTheDocument(); // Calories
      expect(screen.getByText(/20.*g/)).toBeInTheDocument(); // Protein
    });
  });

  it('validates meal name before save', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Try to save without name
    const saveButton = screen.getByText(/save meal/i);
    fireEvent.click(saveButton);

    expect(await screen.findByText(/meal name is required/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates at least one item before save', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Enter name but no items
    const nameInput = screen.getByLabelText(/meal name/i);
    fireEvent.change(nameInput, { target: { value: 'Empty Meal' } });

    const saveButton = screen.getByText(/save meal/i);
    fireEvent.click(saveButton);

    expect(await screen.findByText(/add at least one food/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('saves meal with valid data', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Enter name
    const nameInput = screen.getByLabelText(/meal name/i);
    fireEvent.change(nameInput, { target: { value: 'Breakfast' } });

    // Add food
    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Save
    const saveButton = screen.getByText(/save meal/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Breakfast',
        items: [
          {
            food_id: 'custom:food-1',
            quantity: 1
          }
        ]
      });
    });
  });

  it('calls onCancel when cancel clicked', () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('loads existing meal for editing', () => {
    const existingMeal = {
      id: 'meal-1',
      name: 'Existing Meal',
      items: [
        {
          food: mockFood,
          quantity: 2,
          is_deleted: false
        }
      ],
      totals: {
        calories: 400,
        protein_g: 20,
        carbs_g: 40,
        fat_g: 10
      },
      created_at: '2025-12-06T10:00:00Z'
    };

    render(
      <MealBuilder
        meal={existingMeal}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/meal name/i)).toHaveValue('Existing Meal');
    expect(screen.getByText('Test Food')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /quantity/i })).toHaveValue(2);
  });

  it('shows deleted indicator for deleted foods in meal', () => {
    const existingMeal = {
      id: 'meal-1',
      name: 'Meal with Deleted Food',
      items: [
        {
          food: mockFood,
          quantity: 1,
          is_deleted: true
        }
      ],
      totals: {
        calories: 200,
        protein_g: 10,
        carbs_g: 20,
        fat_g: 5
      },
      created_at: '2025-12-06T10:00:00Z'
    };

    render(
      <MealBuilder
        meal={existingMeal}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/deleted/i)).toBeInTheDocument();
  });

  it('prevents adding duplicate foods', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Add food first time
    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Try to add same food again
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const addButton2 = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton2);

    // Should show error or disable button
    expect(await screen.findByText(/already added/i)).toBeInTheDocument();
  });

  it('updates totals when quantity changes', async () => {
    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Add food
    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Initial totals: 200 cal
    expect(screen.getByText(/200/)).toBeInTheDocument();

    // Change quantity to 3
    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    fireEvent.change(quantityInput, { target: { value: '3' } });

    // Totals should update: 200 * 3 = 600
    await waitFor(() => {
      expect(screen.getByText(/600/)).toBeInTheDocument();
    });
  });

  it('shows loading state while searching', async () => {
    (foodsService.searchFoods as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        results: [mockFood],
        total: 1,
        query: 'test'
      }), 100))
    );

    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(await screen.findByText(/searching/i)).toBeInTheDocument();
  });

  it('handles search errors gracefully', async () => {
    (foodsService.searchFoods as jest.Mock).mockRejectedValue(
      new Error('Search failed')
    );

    render(<MealBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    const searchInput = screen.getByPlaceholderText(/search foods/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(await screen.findByText(/error searching/i)).toBeInTheDocument();
  });
});
