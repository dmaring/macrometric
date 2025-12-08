import { render, screen, fireEvent } from '@testing-library/react';
import MealCard from '../../src/components/MealCard';

describe('MealCard', () => {
  const mockOnAddToDiary = jest.fn();

  const mockMeal = {
    id: 'meal-1',
    name: 'Breakfast Combo',
    items: [
      {
        food: {
          id: 'custom:food-1',
          name: 'Oatmeal',
          brand: null,
          serving_size: 50,
          serving_unit: 'g',
          calories: 150,
          protein_g: 5,
          carbs_g: 27,
          fat_g: 3,
          source: 'custom' as const
        },
        quantity: 1,
        is_deleted: false
      },
      {
        food: {
          id: 'custom:food-2',
          name: 'Banana',
          brand: null,
          serving_size: 1,
          serving_unit: 'medium',
          calories: 105,
          protein_g: 1,
          carbs_g: 27,
          fat_g: 0,
          source: 'custom' as const
        },
        quantity: 1,
        is_deleted: false
      }
    ],
    totals: {
      calories: 255,
      protein_g: 6,
      carbs_g: 54,
      fat_g: 3
    },
    created_at: '2025-12-06T10:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders meal name', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText('Breakfast Combo')).toBeInTheDocument();
  });

  it('displays macro totals', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText(/255.*cal/i)).toBeInTheDocument();
    expect(screen.getByText(/6.*g.*protein/i)).toBeInTheDocument();
    expect(screen.getByText(/54.*g.*carbs/i)).toBeInTheDocument();
    expect(screen.getByText(/3.*g.*fat/i)).toBeInTheDocument();
  });

  it('shows list of food items', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText('Oatmeal')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('displays serving information for items', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText(/1.*×.*50 g/i)).toBeInTheDocument();
    expect(screen.getByText(/1.*×.*1 medium/i)).toBeInTheDocument();
  });

  it('shows add to diary button', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    const addButton = screen.getByRole('button', { name: /add to diary/i });
    expect(addButton).toBeInTheDocument();
  });

  it('calls onAddToDiary when button clicked', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    const addButton = screen.getByRole('button', { name: /add to diary/i });
    fireEvent.click(addButton);

    expect(mockOnAddToDiary).toHaveBeenCalledWith(mockMeal);
  });

  it('shows deleted indicator for deleted foods', () => {
    const mealWithDeletedFood = {
      ...mockMeal,
      items: [
        {
          ...mockMeal.items[0],
          is_deleted: true
        },
        mockMeal.items[1]
      ]
    };

    render(<MealCard meal={mealWithDeletedFood} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText(/deleted/i)).toBeInTheDocument();
  });

  it('shows item count', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText(/2 items/i)).toBeInTheDocument();
  });

  it('can be collapsed and expanded', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} collapsed={true} />);

    // Items should not be visible when collapsed
    expect(screen.queryByText('Oatmeal')).not.toBeInTheDocument();

    // Click to expand
    const expandButton = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(expandButton);

    // Items should now be visible
    expect(screen.getByText('Oatmeal')).toBeInTheDocument();
  });

  it('displays compact view option', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} compact={true} />);

    // In compact mode, only essentials shown
    expect(screen.getByText('Breakfast Combo')).toBeInTheDocument();
    expect(screen.getByText(/255.*cal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('shows meal with single item', () => {
    const singleItemMeal = {
      ...mockMeal,
      items: [mockMeal.items[0]],
      totals: {
        calories: 150,
        protein_g: 5,
        carbs_g: 27,
        fat_g: 3
      }
    };

    render(<MealCard meal={singleItemMeal} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
  });

  it('handles empty items array', () => {
    const emptyMeal = {
      ...mockMeal,
      items: [],
      totals: {
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0
      }
    };

    render(<MealCard meal={emptyMeal} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });

  it('displays visual macro breakdown', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    // Should show macro distribution
    const macroSection = screen.getByTestId('macro-breakdown');
    expect(macroSection).toBeInTheDocument();
  });

  it('shows hover effect on card', () => {
    const { container } = render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('meal-card');

    // Hover
    fireEvent.mouseEnter(card);
    // Should add hover class or style
  });

  it('has accessible structure', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Breakfast Combo'));
  });

  it('displays creation date', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} showDate={true} />);

    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });

  it('handles long meal names', () => {
    const longNameMeal = {
      ...mockMeal,
      name: 'This is a very long meal name that might need to be truncated'
    };

    render(<MealCard meal={longNameMeal} onAddToDiary={mockOnAddToDiary} />);

    const title = screen.getByText(/very long meal name/i);
    expect(title).toBeInTheDocument();
  });

  it('shows brand names when available', () => {
    const mealWithBrands = {
      ...mockMeal,
      items: [
        {
          food: {
            ...mockMeal.items[0].food,
            brand: 'Quaker'
          },
          quantity: 1,
          is_deleted: false
        }
      ],
      totals: mockMeal.totals
    };

    render(<MealCard meal={mealWithBrands} onAddToDiary={mockOnAddToDiary} />);

    expect(screen.getByText(/quaker/i)).toBeInTheDocument();
  });

  it('disables add button when disabled prop set', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} disabled={true} />);

    const addButton = screen.getByRole('button', { name: /add to diary/i });
    expect(addButton).toBeDisabled();
  });

  it('shows loading state on add button', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} loading={true} />);

    expect(screen.getByText(/adding/i)).toBeInTheDocument();
  });

  it('calculates calorie percentage per macro', () => {
    render(<MealCard meal={mockMeal} onAddToDiary={mockOnAddToDiary} showMacroPercent={true} />);

    // Protein: 6g × 4 = 24 cal / 255 = ~9%
    // Carbs: 54g × 4 = 216 cal / 255 = ~85%
    // Fat: 3g × 9 = 27 cal / 255 = ~11%
    expect(screen.getByText(/9%/i)).toBeInTheDocument();
    expect(screen.getByText(/85%/i)).toBeInTheDocument();
    expect(screen.getByText(/11%/i)).toBeInTheDocument();
  });

  it('supports custom className', () => {
    const { container } = render(
      <MealCard
        meal={mockMeal}
        onAddToDiary={mockOnAddToDiary}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
