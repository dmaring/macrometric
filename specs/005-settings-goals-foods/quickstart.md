# Quickstart: Settings - Goals and Custom Foods

**Feature**: 005-settings-goals-foods
**Date**: 2025-12-09
**For**: Developers implementing this feature

## Overview

This quickstart guide walks you through implementing the Goals and Custom Foods management UI in the Settings page. The backend is complete - this is a frontend-only feature.

**Time Estimate**: 6-8 hours for full implementation with tests
**Complexity**: Low-Medium (forms, CRUD operations, state management)

## Prerequisites

- [ ] Feature branch checked out: `005-settings-goals-foods`
- [ ] Backend running locally on port 8000
- [ ] Frontend dev server accessible
- [ ] Valid JWT token (logged in user)
- [ ] Familiarity with React, TypeScript, Tailwind CSS

## Quick Reference

### Existing Resources (Already Implemented)
- ✅ Backend API endpoints (`/goals`, `/custom-foods`)
- ✅ Frontend API services (`goals.ts`, `customFoods.ts`)
- ✅ Settings page structure with tabs
- ✅ Tailwind theme system with semantic colors
- ✅ Authentication via `useAuth` hook

### What You'll Build
- 🆕 GoalsForm component (edit/save goals)
- 🆕 CustomFoodForm component (create/edit food)
- 🆕 CustomFoodList component (list with edit/delete)
- 🔧 Settings page modifications (populate tabs)
- 🧪 Component tests

## Step-by-Step Implementation

### Phase 1: Goals Tab (2-3 hours)

#### Step 1.1: Create GoalsForm Component

**File**: `frontend/src/components/GoalsForm/index.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { getGoals, setGoals, Goals, SetGoalsRequest } from '../../services/goals';

interface GoalsFormProps {
  onSave?: () => void;
}

const GoalsForm: React.FC<GoalsFormProps> = ({ onSave }) => {
  const [goals, setGoalsState] = useState<Goals | null>(null);
  const [formData, setFormData] = useState<SetGoalsRequest>({
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // TODO: Implement useEffect to load goals on mount
  // TODO: Implement validation function
  // TODO: Implement handleChange for input fields
  // TODO: Implement handleSubmit for form submission
  // TODO: Render form UI with Tailwind classes

  return (
    <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
      {/* Form implementation */}
    </div>
  );
};

export default GoalsForm;
```

**Key Implementation Points**:
1. Load goals on component mount via `getGoals()`
2. Pre-populate form if goals exist, show empty state if not
3. Validate inputs on blur (calories: 500-10000, macros: ≥0)
4. Optimistic updates: show changes immediately, rollback on error
5. Use Tailwind classes matching existing Settings patterns

**Validation Example**:
```typescript
const validateGoals = (data: SetGoalsRequest) => {
  const newErrors: Record<string, string> = {};

  if (data.calories !== null && data.calories !== undefined) {
    if (data.calories < 500) newErrors.calories = 'Minimum 500 calories';
    if (data.calories > 10000) newErrors.calories = 'Maximum 10,000 calories';
  }

  ['protein_g', 'carbs_g', 'fat_g'].forEach(field => {
    if (data[field] !== null && data[field] !== undefined && data[field] < 0) {
      newErrors[field] = 'Cannot be negative';
    }
  });

  return newErrors;
};
```

#### Step 1.2: Add GoalsForm to Settings Page

**File**: `frontend/src/pages/Settings/index.tsx`

Find this section (lines 199-204):
```typescript
{activeTab === 'goals' && (
  <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
    <h2 className="m-0 mb-6 text-2xl text-content font-semibold">Daily Goals</h2>
    <p className="text-content-secondary">Goals section - To be implemented</p>
  </div>
)}
```

Replace with:
```typescript
{activeTab === 'goals' && <GoalsForm />}
```

Add import at top:
```typescript
import GoalsForm from '../../components/GoalsForm';
```

#### Step 1.3: Test Goals Form

**File**: `frontend/src/components/GoalsForm/GoalsForm.test.tsx`

```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import GoalsForm from './index';
import * as goalsService from '../../services/goals';

jest.mock('../../services/goals');

describe('GoalsForm', () => {
  it('loads and displays existing goals', async () => {
    // Mock API response
    // Render component
    // Assert goals are displayed
  });

  it('validates calories range', async () => {
    // Enter invalid calories
    // Submit form
    // Assert error message shown
  });

  // Add more tests...
});
```

**Run Tests**:
```bash
cd frontend
npm test GoalsForm
```

---

### Phase 2: Custom Foods Tab (4-5 hours)

#### Step 2.1: Create CustomFoodList Component

**File**: `frontend/src/components/CustomFoodList/index.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { getCustomFoods, deleteCustomFood, CustomFood } from '../../services/customFoods';

interface CustomFoodListProps {
  onEdit: (food: CustomFood) => void;
  onCreate: () => void;
}

const CustomFoodList: React.FC<CustomFoodListProps> = ({ onEdit, onCreate }) => {
  const [foods, setFoods] = useState<CustomFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // TODO: Load foods on mount
  // TODO: Implement delete with confirmation
  // TODO: Render list or empty state

  return (
    <div className="space-y-4">
      {/* List implementation */}
    </div>
  );
};

export default CustomFoodList;
```

#### Step 2.2: Create CustomFoodForm Component

**File**: `frontend/src/components/CustomFoodForm/index.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { createCustomFood, updateCustomFood, CustomFood, CreateCustomFoodRequest } from '../../services/customFoods';

interface CustomFoodFormProps {
  food?: CustomFood;  // If provided, edit mode; otherwise create mode
  onSave: () => void;
  onCancel: () => void;
}

const CustomFoodForm: React.FC<CustomFoodFormProps> = ({ food, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateCustomFoodRequest>({
    name: food?.name || '',
    brand: food?.brand || null,
    serving_size: food?.serving_size || 1,
    serving_unit: food?.serving_unit || 'serving',
    calories: food?.calories || 0,
    protein_g: food?.protein_g || 0,
    carbs_g: food?.carbs_g || 0,
    fat_g: food?.fat_g || 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // TODO: Implement validation
  // TODO: Implement handleSubmit (POST or PUT based on mode)
  // TODO: Render form with all fields

  return (
    <div className="bg-surface-secondary rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">
        {food ? 'Edit' : 'Create'} Custom Food
      </h3>
      {/* Form implementation */}
    </div>
  );
};

export default CustomFoodForm;
```

**Validation Example**:
```typescript
const validateCustomFood = (data: CreateCustomFoodRequest) => {
  const newErrors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    newErrors.name = 'Name is required';
  }
  if (data.serving_size <= 0) {
    newErrors.serving_size = 'Must be greater than 0';
  }
  if (!data.serving_unit || data.serving_unit.trim() === '') {
    newErrors.serving_unit = 'Serving unit is required';
  }
  ['calories', 'protein_g', 'carbs_g', 'fat_g'].forEach(field => {
    if (data[field] < 0) {
      newErrors[field] = 'Cannot be negative';
    }
  });

  return newErrors;
};
```

#### Step 2.3: Wire Up Custom Foods Tab

**File**: `frontend/src/pages/Settings/index.tsx`

Add state for custom foods:
```typescript
const [showFoodForm, setShowFoodForm] = useState(false);
const [editingFood, setEditingFood] = useState<CustomFood | undefined>(undefined);
```

Replace Custom Foods tab placeholder (lines 206-211):
```typescript
{activeTab === 'foods' && (
  <div className="bg-surface-secondary rounded-lg p-8 shadow-sm">
    {showFoodForm ? (
      <CustomFoodForm
        food={editingFood}
        onSave={() => {
          setShowFoodForm(false);
          setEditingFood(undefined);
          // Optionally reload goals if needed
        }}
        onCancel={() => {
          setShowFoodForm(false);
          setEditingFood(undefined);
        }}
      />
    ) : (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0 text-2xl text-content font-semibold">Custom Foods</h2>
          <button
            onClick={() => {
              setEditingFood(undefined);
              setShowFoodForm(true);
            }}
            className="px-6 py-3 bg-success text-white border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-success/80 min-h-[44px]"
          >
            Create New Food
          </button>
        </div>
        <CustomFoodList
          onEdit={(food) => {
            setEditingFood(food);
            setShowFoodForm(true);
          }}
          onCreate={() => {
            setEditingFood(undefined);
            setShowFoodForm(true);
          }}
        />
      </>
    )}
  </div>
)}
```

Add imports:
```typescript
import CustomFoodForm from '../../components/CustomFoodForm';
import CustomFoodList from '../../components/CustomFoodList';
import { CustomFood } from '../../services/customFoods';
```

#### Step 2.4: Test Custom Foods Components

**Files**:
- `frontend/src/components/CustomFoodList/CustomFoodList.test.tsx`
- `frontend/src/components/CustomFoodForm/CustomFoodForm.test.tsx`

**Run Tests**:
```bash
cd frontend
npm test CustomFood
```

---

### Phase 3: Polish & Integration (1-2 hours)

#### Step 3.1: Add Loading States

Use skeleton loaders for initial loads:
```typescript
{loading && (
  <div className="animate-pulse space-y-4">
    <div className="h-10 bg-surface-tertiary rounded"></div>
    <div className="h-10 bg-surface-tertiary rounded"></div>
  </div>
)}
```

#### Step 3.2: Add Error Handling

Consistent error display:
```typescript
{error && (
  <div className="p-4 bg-error/10 border border-error/30 rounded-md mb-4">
    <p className="text-error text-sm">{error}</p>
    <button onClick={retry} className="text-error underline text-sm">
      Retry
    </button>
  </div>
)}
```

#### Step 3.3: Add Empty States

Goals empty state:
```typescript
{!goals && !loading && (
  <div className="text-center py-8">
    <p className="text-content-secondary mb-4">
      Set your daily targets to track progress
    </p>
  </div>
)}
```

Custom foods empty state:
```typescript
{foods.length === 0 && !loading && (
  <div className="text-center py-8">
    <p className="text-content-secondary mb-4">
      No custom foods yet. Create one to get started.
    </p>
    <button onClick={onCreate} className="...">
      Create New Food
    </button>
  </div>
)}
```

#### Step 3.4: Accessibility Check

- [ ] All inputs have labels
- [ ] Forms have proper `<form>` elements with `onSubmit`
- [ ] Error messages linked via `aria-describedby`
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus management for modals

#### Step 3.5: Mobile Testing

Test at these breakpoints:
- [ ] 320px (small mobile)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)

Ensure:
- [ ] All touch targets ≥ 44px
- [ ] Forms are single-column on mobile
- [ ] Buttons are full-width or properly sized
- [ ] Text is readable (min 14px)

---

## Testing Checklist

### Manual Testing

#### Goals Tab
- [ ] Navigate to Settings > Goals
- [ ] Form loads with existing goals (or empty state)
- [ ] Can edit calories (validates 500-10000)
- [ ] Can edit macros (validates ≥0)
- [ ] Save button saves changes
- [ ] Changes reflect immediately
- [ ] Error handling works (disconnect API, see error)
- [ ] Cancel discards changes

#### Custom Foods Tab
- [ ] Navigate to Settings > Custom Foods
- [ ] List shows all custom foods (or empty state)
- [ ] Create New Food button opens form
- [ ] Can create food with all fields
- [ ] Validation works (required fields, ranges)
- [ ] Created food appears in list
- [ ] Edit button pre-fills form
- [ ] Can update existing food
- [ ] Delete button shows confirmation
- [ ] Deleted food disappears from list
- [ ] Cancel closes form without saving

### Automated Tests

Run full test suite:
```bash
cd frontend
npm test
```

Expected coverage:
- [ ] GoalsForm: 80%+ coverage
- [ ] CustomFoodForm: 80%+ coverage
- [ ] CustomFoodList: 80%+ coverage
- [ ] Settings page: Updated tests pass

---

## Troubleshooting

### Issue: Goals not loading
**Solution**: Check backend is running, JWT token is valid, CORS is configured

### Issue: Form validation not working
**Solution**: Check validation function is called on blur and submit, errors state is updated

### Issue: Optimistic updates not rolling back
**Solution**: Store previous state before update, restore on API error

### Issue: Mobile layout broken
**Solution**: Review Tailwind responsive classes (sm:, lg:), ensure min-h-[44px] on buttons

### Issue: Tests failing
**Solution**: Mock API services, wait for async operations with `waitFor`

---

## Performance Tips

1. **Debounce validation**: Don't validate on every keystroke, only on blur
2. **Optimistic updates**: Show changes immediately, API call in background
3. **Lazy load components**: Only render active tab content
4. **Minimize re-renders**: Use `React.memo` for list items if needed

---

## Next Steps

After implementing this feature:

1. **Create tasks** using `/speckit.tasks` to break down implementation into granular steps
2. **Implement features** following the tasks checklist
3. **Test thoroughly** using both manual and automated tests
4. **Create PR** when all tests pass and code is reviewed

---

## Reference Links

- [Spec](./spec.md) - Full feature specification
- [Research](./research.md) - Design decisions and patterns
- [Data Model](./data-model.md) - Type definitions and state management
- [Goals API Contract](./contracts/goals-api.md) - Backend endpoint documentation
- [Custom Foods API Contract](./contracts/custom-foods-api.md) - Backend endpoint documentation
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Styling reference
- [React Testing Library](https://testing-library.com/react) - Testing patterns

---

## Quick Commands

```bash
# Start development
cd frontend && npm run dev

# Run tests
cd frontend && npm test

# Run tests in watch mode
cd frontend && npm test -- --watch

# Type check
cd frontend && npm run type-check

# Build for production
cd frontend && npm run build

# Start backend (if needed)
cd backend && uv run uvicorn main:app --reload
```

---

**Estimated Total Time**: 6-8 hours
**Complexity**: Low-Medium
**Dependencies**: None (backend complete)
**Blockers**: None

Happy coding! 🚀
