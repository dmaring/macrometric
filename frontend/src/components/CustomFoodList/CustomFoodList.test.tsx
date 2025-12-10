import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CustomFoodList from './index';
import * as customFoodsService from '../../services/customFoods';

jest.mock('../../services/customFoods');

describe('CustomFoodList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // T030: CustomFoodList loads and displays all user's custom foods
  it('loads and displays all user\'s custom foods', async () => {
    const mockFoods = [
      {
        id: '1',
        user_id: 'user1',
        name: 'Protein Shake',
        brand: 'HomeMade',
        serving_size: 250,
        serving_unit: 'ml',
        calories: 200,
        protein_g: 30,
        carbs_g: 10,
        fat_g: 5,
      },
      {
        id: '2',
        user_id: 'user1',
        name: 'Energy Bar',
        brand: null,
        serving_size: 1,
        serving_unit: 'bar',
        calories: 300,
        protein_g: 15,
        carbs_g: 40,
        fat_g: 10,
      },
    ];

    render(
      <CustomFoodList
        foods={mockFoods}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
        error=""
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Protein Shake')).toBeInTheDocument();
      expect(screen.getByText('Energy Bar')).toBeInTheDocument();
      expect(screen.getByText(/250 ml/i)).toBeInTheDocument();
      expect(screen.getByText(/1 bar/i)).toBeInTheDocument();
    });
  });

  // T031: CustomFoodList shows empty state when no foods exist
  it('shows empty state when no foods exist', () => {
    render(
      <CustomFoodList
        foods={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
        error=""
      />
    );

    expect(screen.getByText(/no custom foods yet/i)).toBeInTheDocument();
  });

  // T032: CustomFoodList handles delete with confirmation dialog
  it('handles delete with confirmation dialog', async () => {
    const mockFoods = [
      {
        id: '1',
        user_id: 'user1',
        name: 'Protein Shake',
        brand: null,
        serving_size: 250,
        serving_unit: 'ml',
        calories: 200,
        protein_g: 30,
        carbs_g: 10,
        fat_g: 5,
      },
    ];

    // Mock window.confirm to return true
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <CustomFoodList
        foods={mockFoods}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
        error=""
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining('Protein Shake'));
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    mockConfirm.mockRestore();
  });

  // T033: CustomFoodList calls onEdit when edit button clicked
  it('calls onEdit when edit button clicked', () => {
    const mockFoods = [
      {
        id: '1',
        user_id: 'user1',
        name: 'Protein Shake',
        brand: null,
        serving_size: 250,
        serving_unit: 'ml',
        calories: 200,
        protein_g: 30,
        carbs_g: 10,
        fat_g: 5,
      },
    ];

    render(
      <CustomFoodList
        foods={mockFoods}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
        error=""
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockFoods[0]);
  });

  // T034: CustomFoodList handles API errors gracefully
  it('handles errors gracefully', () => {
    render(
      <CustomFoodList
        foods={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
        error="Failed to load custom foods"
      />
    );

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  // Additional test: Shows loading state
  it('shows loading state', () => {
    render(
      <CustomFoodList
        foods={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={true}
        error=""
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  // Additional test: Delete cancellation
  it('does not call onDelete when confirmation is cancelled', () => {
    const mockFoods = [
      {
        id: '1',
        user_id: 'user1',
        name: 'Protein Shake',
        brand: null,
        serving_size: 250,
        serving_unit: 'ml',
        calories: 200,
        protein_g: 30,
        carbs_g: 10,
        fat_g: 5,
      },
    ];

    // Mock window.confirm to return false
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <CustomFoodList
        foods={mockFoods}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
        error=""
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  // Additional test: Displays nutritional information
  it('displays nutritional information for each food', () => {
    const mockFoods = [
      {
        id: '1',
        user_id: 'user1',
        name: 'Protein Shake',
        brand: 'HomeMade',
        serving_size: 250,
        serving_unit: 'ml',
        calories: 200,
        protein_g: 30,
        carbs_g: 10,
        fat_g: 5,
      },
    ];

    render(
      <CustomFoodList
        foods={mockFoods}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
        error=""
      />
    );

    expect(screen.getByText(/200/)).toBeInTheDocument(); // Calories
    expect(screen.getByText(/30.*g/)).toBeInTheDocument(); // Protein
    expect(screen.getByText(/10.*g/)).toBeInTheDocument(); // Carbs
    expect(screen.getByText(/5.*g/)).toBeInTheDocument(); // Fat
  });
});
