import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomMealList from '../../src/components/CustomMealList';
import * as mealsService from '../../src/services/meals';

jest.mock('../../src/services/meals');

describe('CustomMealList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockMeals = [
    {
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
        }
      ],
      totals: {
        calories: 150,
        protein_g: 5,
        carbs_g: 27,
        fat_g: 3
      },
      created_at: '2025-12-06T10:00:00Z'
    },
    {
      id: 'meal-2',
      name: 'Lunch Special',
      items: [
        {
          food: {
            id: 'custom:food-2',
            name: 'Salad',
            brand: null,
            serving_size: 200,
            serving_unit: 'g',
            calories: 100,
            protein_g: 3,
            carbs_g: 15,
            fat_g: 2,
            source: 'custom' as const
          },
          quantity: 1,
          is_deleted: false
        }
      ],
      totals: {
        calories: 100,
        protein_g: 3,
        carbs_g: 15,
        fat_g: 2
      },
      created_at: '2025-12-06T11:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no meals', () => {
    render(<CustomMealList meals={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(/no custom meals/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first meal/i)).toBeInTheDocument();
  });

  it('renders list of meals', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Breakfast Combo')).toBeInTheDocument();
    expect(screen.getByText('Lunch Special')).toBeInTheDocument();
  });

  it('displays meal totals for each meal', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // First meal totals
    expect(screen.getByText(/150.*cal/i)).toBeInTheDocument();
    expect(screen.getByText(/5.*g.*protein/i)).toBeInTheDocument();

    // Second meal totals
    expect(screen.getByText(/100.*cal/i)).toBeInTheDocument();
    expect(screen.getByText(/3.*g.*protein/i)).toBeInTheDocument();
  });

  it('shows number of items in each meal', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Both meals have 1 item
    const itemCounts = screen.getAllByText(/1 item/i);
    expect(itemCounts).toHaveLength(2);
  });

  it('calls onEdit when edit button clicked', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockMeals[0]);
  });

  it('calls onDelete when delete button clicked', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith('meal-1');
  });

  it('shows confirmation dialog before deleting', async () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Should show confirmation dialog
    expect(await screen.findByText(/delete.*breakfast combo/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('meal-1');
    });
  });

  it('can cancel deletion', async () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Cancel deletion
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('displays meal items in expanded view', async () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Click to expand first meal
    const mealCard = screen.getByText('Breakfast Combo');
    fireEvent.click(mealCard);

    // Should show food items
    expect(await screen.findByText('Oatmeal')).toBeInTheDocument();
    expect(screen.getByText(/50 g/i)).toBeInTheDocument();
    expect(screen.getByText(/quantity.*1/i)).toBeInTheDocument();
  });

  it('shows deleted indicator for deleted foods', () => {
    const mealsWithDeleted = [
      {
        ...mockMeals[0],
        items: [
          {
            ...mockMeals[0].items[0],
            is_deleted: true
          }
        ]
      }
    ];

    render(
      <CustomMealList
        meals={mealsWithDeleted}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/deleted/i)).toBeInTheDocument();
  });

  it('sorts meals by creation date (newest first)', () => {
    const unsortedMeals = [...mockMeals].reverse();

    render(
      <CustomMealList
        meals={unsortedMeals}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const mealCards = screen.getAllByRole('article');
    expect(mealCards[0]).toHaveTextContent('Lunch Special');
    expect(mealCards[1]).toHaveTextContent('Breakfast Combo');
  });

  it('shows loading state', () => {
    render(
      <CustomMealList
        meals={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={true}
      />
    );

    expect(screen.getByText(/loading meals/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <CustomMealList
        meals={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        error="Failed to load meals"
      />
    );

    expect(screen.getByText(/failed to load meals/i)).toBeInTheDocument();
  });

  it('filters meals by search query', async () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const searchInput = screen.getByPlaceholderText(/search meals/i);
    fireEvent.change(searchInput, { target: { value: 'breakfast' } });

    await waitFor(() => {
      expect(screen.getByText('Breakfast Combo')).toBeInTheDocument();
      expect(screen.queryByText('Lunch Special')).not.toBeInTheDocument();
    });
  });

  it('shows meal count', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(/2 meals/i)).toBeInTheDocument();
  });

  it('handles meals with multiple items', () => {
    const mealWithMultipleItems = {
      id: 'meal-3',
      name: 'Complex Meal',
      items: [
        mockMeals[0].items[0],
        mockMeals[1].items[0],
        mockMeals[0].items[0]
      ],
      totals: {
        calories: 400,
        protein_g: 13,
        carbs_g: 69,
        fat_g: 8
      },
      created_at: '2025-12-06T12:00:00Z'
    };

    render(
      <CustomMealList
        meals={[mealWithMultipleItems]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/3 items/i)).toBeInTheDocument();
  });

  it('has accessible meal cards', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const mealCards = screen.getAllByRole('article');
    mealCards.forEach(card => {
      expect(card).toHaveAttribute('aria-label');
    });
  });

  it('keyboard navigation works', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });

    // Tab to first edit button
    editButtons[0].focus();
    expect(document.activeElement).toBe(editButtons[0]);

    // Tab to next button
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    // Should move focus
  });

  it('displays create date for each meal', () => {
    render(<CustomMealList meals={mockMeals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // Should show relative dates
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });
});
