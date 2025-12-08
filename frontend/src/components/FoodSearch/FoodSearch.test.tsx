/**
 * Tests for FoodSearch component.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FoodSearch from './index';
import * as foodSearchService from '../../services/foodSearch';

jest.mock('../../services/foodSearch');

describe('FoodSearch', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<FoodSearch onSelect={mockOnSelect} />);

    expect(screen.getByPlaceholderText(/search for foods/i)).toBeInTheDocument();
  });

  it('should show search results when user types', async () => {
    const mockResults = [
      {
        id: 'usda:171688',
        name: 'Apple, raw',
        source: 'usda',
        calories: 52,
        protein_g: 0.26,
        carbs_g: 13.81,
        fat_g: 0.17,
        serving_size: 100,
        serving_unit: 'g',
      },
      {
        id: 'usda:171689',
        name: 'Apple, with skin',
        source: 'usda',
        calories: 55,
        protein_g: 0.3,
        carbs_g: 14.2,
        fat_g: 0.2,
        serving_size: 100,
        serving_unit: 'g',
      },
    ];

    (foodSearchService.searchFoods as jest.Mock).mockResolvedValue(mockResults);

    render(<FoodSearch onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search for foods/i);
    fireEvent.change(searchInput, { target: { value: 'apple' } });

    await waitFor(() => {
      expect(screen.getByText('Apple, raw')).toBeInTheDocument();
      expect(screen.getByText('Apple, with skin')).toBeInTheDocument();
    });
  });

  it('should display nutritional info for results', async () => {
    const mockResults = [
      {
        id: 'usda:171688',
        name: 'Apple, raw',
        source: 'usda',
        calories: 52,
        protein_g: 0.26,
        carbs_g: 13.81,
        fat_g: 0.17,
        serving_size: 100,
        serving_unit: 'g',
      },
    ];

    (foodSearchService.searchFoods as jest.Mock).mockResolvedValue(mockResults);

    render(<FoodSearch onSelect={mockOnSelect} />);

    fireEvent.change(screen.getByPlaceholderText(/search for foods/i), {
      target: { value: 'apple' },
    });

    await waitFor(() => {
      expect(screen.getByText(/52 cal/i)).toBeInTheDocument();
      expect(screen.getByText(/0\.26.*g.*protein/i)).toBeInTheDocument();
    });
  });

  it('should call onSelect when user clicks a result', async () => {
    const mockResults = [
      {
        id: 'usda:171688',
        name: 'Apple, raw',
        source: 'usda',
        calories: 52,
        protein_g: 0.26,
        carbs_g: 13.81,
        fat_g: 0.17,
        serving_size: 100,
        serving_unit: 'g',
      },
    ];

    (foodSearchService.searchFoods as jest.Mock).mockResolvedValue(mockResults);

    render(<FoodSearch onSelect={mockOnSelect} />);

    fireEvent.change(screen.getByPlaceholderText(/search for foods/i), {
      target: { value: 'apple' },
    });

    await waitFor(() => {
      expect(screen.getByText('Apple, raw')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apple, raw'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('should debounce search requests', async () => {
    (foodSearchService.searchFoods as jest.Mock).mockResolvedValue([]);

    render(<FoodSearch onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search for foods/i);

    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'a' } });
    fireEvent.change(searchInput, { target: { value: 'ap' } });
    fireEvent.change(searchInput, { target: { value: 'app' } });

    // Should only call API once after debounce
    await waitFor(() => {
      expect(foodSearchService.searchFoods).toHaveBeenCalledTimes(1);
      expect(foodSearchService.searchFoods).toHaveBeenCalledWith('app');
    });
  });

  it('should show loading state while searching', async () => {
    (foodSearchService.searchFoods as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(<FoodSearch onSelect={mockOnSelect} />);

    fireEvent.change(screen.getByPlaceholderText(/search for foods/i), {
      target: { value: 'apple' },
    });

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it('should show message when no results found', async () => {
    (foodSearchService.searchFoods as jest.Mock).mockResolvedValue([]);

    render(<FoodSearch onSelect={mockOnSelect} />);

    fireEvent.change(screen.getByPlaceholderText(/search for foods/i), {
      target: { value: 'nonexistent' },
    });

    await waitFor(() => {
      expect(screen.getByText(/no foods found/i)).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    (foodSearchService.searchFoods as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<FoodSearch onSelect={mockOnSelect} />);

    fireEvent.change(screen.getByPlaceholderText(/search for foods/i), {
      target: { value: 'apple' },
    });

    await waitFor(() => {
      expect(screen.getByText(/error searching for foods/i)).toBeInTheDocument();
    });
  });

  it('should clear results when search input is cleared', async () => {
    const mockResults = [
      {
        id: 'usda:171688',
        name: 'Apple, raw',
        source: 'usda',
        calories: 52,
        protein_g: 0.26,
        carbs_g: 13.81,
        fat_g: 0.17,
        serving_size: 100,
        serving_unit: 'g',
      },
    ];

    (foodSearchService.searchFoods as jest.Mock).mockResolvedValue(mockResults);

    render(<FoodSearch onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search for foods/i);

    // Type and show results
    fireEvent.change(searchInput, { target: { value: 'apple' } });
    await waitFor(() => {
      expect(screen.getByText('Apple, raw')).toBeInTheDocument();
    });

    // Clear input
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.queryByText('Apple, raw')).not.toBeInTheDocument();
  });

  it('should not search for queries shorter than 2 characters', async () => {
    render(<FoodSearch onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search for foods/i);
    fireEvent.change(searchInput, { target: { value: 'a' } });

    await waitFor(() => {
      expect(foodSearchService.searchFoods).not.toHaveBeenCalled();
    }, { timeout: 600 });
  });
});
