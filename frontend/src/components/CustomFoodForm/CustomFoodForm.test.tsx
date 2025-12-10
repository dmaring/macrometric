import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CustomFoodForm from './index';
import * as customFoodsService from '../../services/customFoods';

jest.mock('../../services/customFoods');

const mockedCustomFoodsService = customFoodsService as jest.Mocked<typeof customFoodsService>;

describe('CustomFoodForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // T036: CustomFoodForm renders in create mode with empty fields
  it('renders in create mode with empty fields', () => {
    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText(/create custom food/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Food name')).toHaveValue('');
    expect(screen.getByLabelText('Brand name (optional)')).toHaveValue('');
    expect(screen.getByLabelText('Serving size')).toHaveValue(null);
    expect(screen.getByLabelText('Serving unit')).toHaveValue('');
  });

  // T037: CustomFoodForm renders in edit mode with pre-filled data
  it('renders in edit mode with pre-filled data', () => {
    const mockFood = {
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
    };

    render(<CustomFoodForm food={mockFood} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText(/edit custom food/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Food name')).toHaveValue('Protein Shake');
    expect(screen.getByLabelText('Brand name (optional)')).toHaveValue('HomeMade');
    expect(screen.getByLabelText('Serving size')).toHaveValue(250);
    expect(screen.getByLabelText('Serving unit')).toHaveValue('ml');
    expect(screen.getByLabelText('Calories')).toHaveValue(200);
    expect(screen.getByLabelText('Protein in grams')).toHaveValue(30);
    expect(screen.getByLabelText('Carbohydrates in grams')).toHaveValue(10);
    expect(screen.getByLabelText('Fat in grams')).toHaveValue(5);
  });

  // T038: CustomFoodForm validates required fields (name, serving_size, serving_unit)
  it('validates required fields (name, serving_size, serving_unit)', async () => {
    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/serving size.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/serving unit.*required/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  // T039: CustomFoodForm validates non-negative nutritional values
  it('validates non-negative nutritional values', async () => {
    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const proteinInput = screen.getByLabelText('Protein in grams');
    fireEvent.change(proteinInput, { target: { value: '-10' } });
    fireEvent.blur(proteinInput);

    await waitFor(() => {
      expect(screen.getByText(/cannot be negative/i)).toBeInTheDocument();
    });
  });

  // T040: CustomFoodForm submits create request with valid data
  it('submits create request with valid data', async () => {
    mockedCustomFoodsService.createCustomFood.mockResolvedValueOnce({
      id: '1',
      name: 'Protein Shake',
      brand: 'HomeMade',
      serving_size: 250,
      serving_unit: 'ml',
      calories: 200,
      protein_g: 30,
      carbs_g: 10,
      fat_g: 5,
    });

    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Food name'), { target: { value: 'Protein Shake' } });
    fireEvent.change(screen.getByLabelText('Brand name (optional)'), { target: { value: 'HomeMade' } });
    fireEvent.change(screen.getByLabelText('Serving size'), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText('Serving unit'), { target: { value: 'ml' } });
    fireEvent.change(screen.getByLabelText('Calories'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Protein in grams'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Carbohydrates in grams'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Fat in grams'), { target: { value: '5' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedCustomFoodsService.createCustomFood).toHaveBeenCalledWith({
        name: 'Protein Shake',
        brand: 'HomeMade',
        serving_size: 250,
        serving_unit: 'ml',
        calories: 200,
        protein_g: 30,
        carbs_g: 10,
        fat_g: 5,
      });
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  // T041: CustomFoodForm submits update request in edit mode
  it('submits update request in edit mode', async () => {
    const mockFood = {
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
    };

    mockedCustomFoodsService.updateCustomFood.mockResolvedValueOnce({
      ...mockFood,
      calories: 250,
    });

    render(<CustomFoodForm food={mockFood} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const caloriesInput = screen.getByLabelText('Calories');
    fireEvent.change(caloriesInput, { target: { value: '250' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedCustomFoodsService.updateCustomFood).toHaveBeenCalledWith('1', {
        name: 'Protein Shake',
        brand: 'HomeMade',
        serving_size: 250,
        serving_unit: 'ml',
        calories: 250,
        protein_g: 30,
        carbs_g: 10,
        fat_g: 5,
      });
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  // T042: CustomFoodForm handles API errors gracefully
  it('handles API errors gracefully', async () => {
    mockedCustomFoodsService.createCustomFood.mockRejectedValueOnce(new Error('Network error'));

    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Food name'), { target: { value: 'Protein Shake' } });
    fireEvent.change(screen.getByLabelText('Serving size'), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText('Serving unit'), { target: { value: 'ml' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  // T043: CustomFoodForm calls onCancel when cancel button clicked
  it('calls onCancel when cancel button clicked', () => {
    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  // Additional test: Validates serving size is positive
  it('validates serving size is positive', async () => {
    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const servingSizeInput = screen.getByLabelText('Serving size');
    fireEvent.change(servingSizeInput, { target: { value: '-1' } });
    fireEvent.blur(servingSizeInput);

    await waitFor(() => {
      expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
    });
  });

  // Additional test: Clears error when field is corrected
  it('clears error when field is corrected', async () => {
    render(<CustomFoodForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText('Food name');

    // Submit to trigger validation
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    // Fix the error
    fireEvent.change(nameInput, { target: { value: 'Protein Shake' } });

    await waitFor(() => {
      expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
    });
  });
});
