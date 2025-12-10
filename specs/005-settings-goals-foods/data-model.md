# Data Model: Settings - Goals and Custom Foods

**Feature**: 005-settings-goals-foods
**Date**: 2025-12-09
**Purpose**: Document data entities, relationships, validation rules, and state management

## Overview

This feature uses two existing backend entities (`DailyGoal`, `CustomFood`) without modifications. The data model documentation focuses on how these entities are represented in the frontend and how state flows through the UI components.

## Backend Entities (Existing - No Changes)

### DailyGoal

**Database Table**: `daily_goals`
**SQLAlchemy Model**: `backend/src/models/daily_goal.py`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Goal record ID |
| user_id | UUID | Foreign key, unique, not null | One goal per user |
| calories | Integer | Optional, nullable | Daily calorie target |
| protein_g | Decimal(6,2) | Optional, nullable | Daily protein target (grams) |
| carbs_g | Decimal(6,2) | Optional, nullable | Daily carbs target (grams) |
| fat_g | Decimal(6,2) | Optional, nullable | Daily fat target (grams) |

**Relationships**:
- `user`: Many-to-one with User (CASCADE delete)

**Validation Rules** (enforced by backend):
- Calories: 500-10000 if provided
- Macros: ≥0 if provided
- All fields optional (users may track only some metrics)

**State Transitions**:
```
[No Goal] --set_goals()--> [Goal Exists]
[Goal Exists] --set_goals()--> [Goal Updated]
[Goal Exists] --delete_goals()--> [No Goal]
```

### CustomFood

**Database Table**: `custom_foods`
**SQLAlchemy Model**: `backend/src/models/custom_food.py`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary key | Food record ID |
| user_id | UUID | Foreign key, not null | Owner of custom food |
| name | String(255) | Required, not null | Food name |
| brand | String(255) | Optional, nullable | Brand name (optional) |
| serving_size | Decimal(8,2) | Required, not null, >0 | Serving size amount |
| serving_unit | String(50) | Required, not null | Unit (e.g., "g", "oz", "cup") |
| calories | Integer | Required, not null, ≥0 | Calories per serving |
| protein_g | Decimal(6,2) | Required, not null, ≥0 | Protein per serving (grams) |
| carbs_g | Decimal(6,2) | Required, not null, ≥0 | Carbs per serving (grams) |
| fat_g | Decimal(6,2) | Required, not null, ≥0 | Fat per serving (grams) |

**Relationships**:
- `user`: Many-to-one with User (CASCADE delete)

**Validation Rules** (enforced by backend):
- Name: 1-255 characters
- Brand: 0-255 characters if provided
- Serving size: >0
- Serving unit: 1-50 characters
- Nutritional values: ≥0

**State Transitions**:
```
[Create Mode] --create_custom_food()--> [Food Created]
[Food Created] --update_custom_food()--> [Food Updated]
[Food Created] --delete_custom_food()--> [Food Deleted]
```

## Frontend Type Definitions (Existing)

### Goals TypeScript Interface

**File**: `frontend/src/services/goals.ts`

```typescript
export interface Goals {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export interface SetGoalsRequest {
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}
```

**Usage in Components**:
```typescript
// Initial state (no goals)
const [goals, setGoals] = useState<Goals | null>(null);

// Form state
const [formData, setFormData] = useState<SetGoalsRequest>({
  calories: null,
  protein_g: null,
  carbs_g: null,
  fat_g: null
});
```

### Custom Food TypeScript Interface

**File**: `frontend/src/services/customFoods.ts`

```typescript
export interface CustomFood {
  id: string;  // Format: "custom:{uuid}" from backend
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface CreateCustomFoodRequest {
  name: string;
  brand?: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface UpdateCustomFoodRequest {
  name?: string;
  brand?: string | null;
  serving_size?: number;
  serving_unit?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}
```

**Usage in Components**:
```typescript
// List state
const [foods, setFoods] = useState<CustomFood[]>([]);

// Form state (create mode)
const [formData, setFormData] = useState<CreateCustomFoodRequest>({
  name: '',
  brand: null,
  serving_size: 1,
  serving_unit: 'serving',
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0
});

// Form state (edit mode)
const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
```

## Component State Management

### GoalsForm Component State

```typescript
interface GoalsFormState {
  // Data
  goals: Goals | null;           // Current goals from API
  formData: SetGoalsRequest;     // Form input values

  // UI State
  loading: boolean;              // Loading goals or submitting
  error: string | null;          // Error message
  hasChanges: boolean;           // Unsaved changes indicator

  // Validation
  errors: {
    calories?: string;
    protein_g?: string;
    carbs_g?: string;
    fat_g?: string;
  };
}
```

**State Transitions**:
```
[Mounting] --> [Loading] --> [Loaded with Data | Empty State]
[Loaded] --> [Editing] --> [Validating] --> [Submitting] --> [Success | Error]
[Error] --> [Editing]  (user can retry)
```

### CustomFoodList Component State

```typescript
interface CustomFoodListState {
  // Data
  foods: CustomFood[];           // All user's custom foods

  // UI State
  loading: boolean;              // Loading foods
  error: string | null;          // Error message
  showForm: boolean;             // Form modal visibility
  editingFood: CustomFood | null; // Food being edited (null = create mode)

  // Deletion
  deletingId: string | null;     // Food being deleted (for confirmation)
}
```

**State Transitions**:
```
[Mounting] --> [Loading] --> [Loaded with List | Empty State]
[Loaded] --> [Create Mode] --> [Submitting] --> [Success | Error] --> [Loaded]
[Loaded] --> [Edit Mode] --> [Submitting] --> [Success | Error] --> [Loaded]
[Loaded] --> [Deleting] --> [Confirming] --> [Deleted] --> [Loaded]
```

### CustomFoodForm Component State

```typescript
interface CustomFoodFormState {
  // Data
  formData: CreateCustomFoodRequest;
  mode: 'create' | 'edit';
  initialFood?: CustomFood;

  // UI State
  submitting: boolean;
  error: string | null;

  // Validation
  errors: {
    name?: string;
    brand?: string;
    serving_size?: string;
    serving_unit?: string;
    calories?: string;
    protein_g?: string;
    carbs_g?: string;
    fat_g?: string;
  };
  touched: {
    [field: string]: boolean;
  };
}
```

**State Transitions**:
```
[Create Mode] --> [Filling Form] --> [Validating] --> [Submitting] --> [Success | Error]
[Edit Mode] --> [Pre-filled Form] --> [Editing] --> [Validating] --> [Submitting] --> [Success | Error]
[Any Mode] --> [Cancelled] --> [Closed]
```

## Data Flow Diagrams

### Goals Tab Data Flow

```
┌─────────────────┐
│  Settings Page  │
│   (Goals Tab)   │
└────────┬────────┘
         │ Mount
         ▼
┌─────────────────┐
│  GET /goals     │
│  (API Call)     │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Success │
    └────┬────┘
         │
    ┌────▼────────────────┐
    │ Render GoalsForm    │
    │ with current goals  │
    └────────┬────────────┘
             │ User edits
             ▼
    ┌────────────────────┐
    │ Validate on blur   │
    │ Show inline errors │
    └────────┬───────────┘
             │ User submits
             ▼
    ┌────────────────────┐
    │ Optimistic update  │
    │ (show new values)  │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  PUT /goals        │
    │  (API Call)        │
    └────────┬───────────┘
             │
        ┌────▼────┐
        │ Success │──> Goals saved
        └─────────┘
             │
        ┌────▼────┐
        │  Error  │──> Rollback + show error
        └─────────┘
```

### Custom Foods Tab Data Flow

```
┌──────────────────┐
│  Settings Page   │
│ (Custom Foods)   │
└────────┬─────────┘
         │ Mount
         ▼
┌──────────────────┐
│ GET /custom-foods│
│   (API Call)     │
└────────┬─────────┘
         │
    ┌────▼────┐
    │ Success │
    └────┬────┘
         │
    ┌────▼──────────────────┐
    │ Render CustomFoodList │
    │ with all foods        │
    └───────────────────────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
[Create]          [Edit/Delete]
    │                 │
    ▼                 ▼
┌─────────────┐  ┌────────────────┐
│ Open form   │  │ Pre-fill form  │
│ (empty)     │  │ with food data │
└──────┬──────┘  └────────┬───────┘
       │                  │
       └──────────┬───────┘
                  │ User fills/edits
                  ▼
         ┌────────────────┐
         │ Validate fields│
         └────────┬───────┘
                  │ User submits
                  ▼
         ┌────────────────┐
         │ POST or PUT    │
         │ (API Call)     │
         └────────┬───────┘
                  │
             ┌────▼────┐
             │ Success │──> Refresh list
             └─────────┘
                  │
             ┌────▼────┐
             │  Error  │──> Show error in form
             └─────────┘
```

## Validation Rules (Client-Side)

### Goals Validation

```typescript
const validateGoals = (data: SetGoalsRequest): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Calories validation
  if (data.calories !== null && data.calories !== undefined) {
    if (data.calories < 500) {
      errors.calories = 'Minimum 500 calories';
    }
    if (data.calories > 10000) {
      errors.calories = 'Maximum 10,000 calories';
    }
    if (!Number.isInteger(data.calories)) {
      errors.calories = 'Must be a whole number';
    }
  }

  // Macro validation (protein, carbs, fat)
  ['protein_g', 'carbs_g', 'fat_g'].forEach(field => {
    const value = data[field];
    if (value !== null && value !== undefined) {
      if (value < 0) {
        errors[field] = 'Cannot be negative';
      }
      if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
        errors[field] = 'Maximum 2 decimal places';
      }
    }
  });

  return errors;
};
```

### Custom Food Validation

```typescript
const validateCustomFood = (data: CreateCustomFoodRequest): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (data.name.length > 255) {
    errors.name = 'Maximum 255 characters';
  }

  // Brand validation
  if (data.brand && data.brand.length > 255) {
    errors.brand = 'Maximum 255 characters';
  }

  // Serving size validation
  if (!data.serving_size || data.serving_size <= 0) {
    errors.serving_size = 'Must be greater than 0';
  }

  // Serving unit validation
  if (!data.serving_unit || data.serving_unit.trim() === '') {
    errors.serving_unit = 'Serving unit is required';
  } else if (data.serving_unit.length > 50) {
    errors.serving_unit = 'Maximum 50 characters';
  }

  // Nutritional value validation
  ['calories', 'protein_g', 'carbs_g', 'fat_g'].forEach(field => {
    const value = data[field];
    if (value === null || value === undefined) {
      errors[field] = `${field.replace('_', ' ')} is required`;
    } else if (value < 0) {
      errors[field] = 'Cannot be negative';
    }
  });

  return errors;
};
```

## Error States

### API Error Handling

```typescript
interface ApiError {
  message: string;      // User-friendly error message
  code?: string;        // Error code for specific handling
  field?: string;       // Field-specific error (validation)
}

// Common error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  NOT_FOUND: 'Resource not found. It may have been deleted.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
};
```

### Loading States

```typescript
interface LoadingState {
  type: 'initial' | 'submitting' | 'deleting';
  message?: string;
}

// Loading indicators
// - Skeleton loader for initial data load
// - Spinner on submit button during submission
// - Disabled state during deletion
```

## Caching Strategy

**Goals**: No caching needed (single record, lightweight)
**Custom Foods**: No caching needed for MVP (list refreshes on mutations)

**Future Optimization**: Consider React Query or SWR if performance becomes an issue with large custom food libraries (>100 items).

## Data Integrity

### Optimistic Updates
- Goals: Update local state before API call, rollback on error
- Custom Foods: Add/update in list optimistically, rollback on error

### Consistency
- All mutations trigger list/data refresh on success
- Failed mutations restore previous state and show error
- No partial states (all-or-nothing updates)

### Concurrency
- Backend handles concurrent updates (last write wins)
- Frontend shows latest data on every mount/refresh
- No optimistic locking needed (single-user editing own data)

## Summary

The data model is fully defined by existing backend entities. Frontend implementation focuses on state management, validation, and UI flow. No database changes required. All type definitions exist in service files. Ready to proceed with API contracts documentation.
