# Research: Settings - Goals and Custom Foods

**Feature**: 005-settings-goals-foods
**Date**: 2025-12-09
**Purpose**: Document design decisions, best practices, and patterns for implementing Goals and Custom Foods management UI

## Overview

This feature extends the Settings page with two new functional tabs: Goals management and Custom Foods management. Both features leverage existing, fully-implemented backend APIs and frontend service modules. The research focuses on UI/UX patterns, form validation strategies, and state management approaches consistent with the existing codebase.

## Research Areas

### 1. Form Patterns in React with Tailwind CSS

**Decision**: Use controlled components with local state for form management

**Rationale**:
- Existing codebase uses controlled components (see `MealBuilder`, `CategoryManager`)
- Provides immediate validation feedback
- Simple to implement without additional dependencies
- Consistent with React best practices

**Alternatives Considered**:
- **React Hook Form**: More powerful but adds dependency (violates Simplicity principle)
- **Uncontrolled components with refs**: Less predictable state, harder to validate in real-time
- **Formik**: Heavier library, overkill for simple forms

**Implementation Pattern**:
```typescript
const [formData, setFormData] = useState({ calories: null, protein_g: null, ... });
const [errors, setErrors] = useState({});

const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  // Clear error on change
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: null }));
  }
};

const validate = () => {
  const newErrors = {};
  if (formData.calories && formData.calories < 500) {
    newErrors.calories = 'Minimum 500 calories';
  }
  // ... more validations
  return newErrors;
};
```

### 2. Optimistic UI Updates

**Decision**: Update UI optimistically before API response, with rollback on error

**Rationale**:
- Meets <200ms perceived response time requirement
- Existing Settings page uses optimistic updates for custom meals
- Improves user experience by showing immediate feedback
- Backend APIs are reliable (already tested)

**Implementation Pattern**:
```typescript
const handleSaveGoals = async (data) => {
  // Optimistic update
  setLocalGoals(data);

  try {
    const response = await setGoals(data);
    // Success - already showing updated UI
  } catch (error) {
    // Rollback on failure
    setLocalGoals(previousGoals);
    setError('Failed to save goals. Please try again.');
  }
};
```

**Alternatives Considered**:
- **Wait for API response**: Slower UX, feels laggy
- **Pessimistic updates only**: Simpler but violates performance requirements

### 3. Input Validation Strategy

**Decision**: Client-side validation matching backend constraints, with real-time feedback

**Rationale**:
- Backend validation exists in Pydantic models (goals.py:16-21, custom_foods.py:19-29)
- Client-side validation prevents unnecessary API calls
- Real-time feedback improves UX (FR-004, FR-011)

**Validation Rules** (from backend Pydantic schemas):

**Goals**:
- Calories: integer, 500-10000, optional
- Protein/Carbs/Fat: float, ≥0, optional
- All fields nullable (users may track only some macros)

**Custom Foods**:
- Name: string, 1-255 chars, required
- Brand: string, 0-255 chars, optional
- Serving size: float, >0, required
- Serving unit: string, 1-50 chars, required
- Calories: integer, ≥0, required
- Protein/Carbs/Fat: float, ≥0, required

**Implementation**:
- Validate on blur for immediate feedback
- Validate on submit before API call
- Show error messages below inputs
- Disable submit button when validation fails

### 4. List Management for Custom Foods

**Decision**: Inline editing with modal/expandable form for create/edit

**Rationale**:
- Existing CustomMealList pattern shows this works well
- Keeps UI compact - important for mobile
- Edit-in-place reduces clicks (User-Centric Design principle)

**Implementation Pattern**:
```typescript
const [editingFood, setEditingFood] = useState(null);
const [showForm, setShowForm] = useState(false);

// List view shows:
// - Food name, serving, macros
// - Edit button → opens form with pre-filled data
// - Delete button → confirmation dialog
```

**Alternatives Considered**:
- **Separate page for editing**: More clicks, slower workflow
- **Always-visible forms**: Too much vertical space, mobile unfriendly

### 5. Empty States

**Decision**: Helpful empty states with clear call-to-action

**Rationale**:
- FR-014 requires appropriate empty states
- Guides first-time users
- Matches pattern in existing Custom Meals tab

**Implementation**:
```typescript
// Goals tab - no goals set
<div className="text-center py-8">
  <p className="text-content-secondary mb-4">
    Set your daily targets to track progress
  </p>
  <button onClick={openForm}>Set Your Goals</button>
</div>

// Custom Foods tab - no foods
<div className="text-center py-8">
  <p className="text-content-secondary mb-4">
    No custom foods yet. Create one to get started.
  </p>
  <button onClick={handleCreate}>Create New Food</button>
</div>
```

### 6. Error Handling & Loading States

**Decision**: Graceful degradation with retry options and skeleton loaders

**Rationale**:
- FR-015 requires graceful API failure handling
- Maintains user trust during network issues
- Skeleton loaders match existing Diary page patterns

**Implementation Pattern**:
```typescript
// Loading state
{loading && <SkeletonLoader type="form" />}

// Error state
{error && (
  <div className="p-4 bg-error/10 border border-error/30 rounded-md">
    <p className="text-error text-sm">{error}</p>
    <button onClick={retry}>Retry</button>
  </div>
)}

// Success state
{data && <FormComponent data={data} />}
```

### 7. Mobile Responsiveness

**Decision**: Single-column forms with full-width inputs, touch-friendly targets

**Rationale**:
- Constraints require 320px+ support and ≥44px touch targets
- Tailwind CSS mobile-first approach already established
- Existing Settings page demonstrates working patterns

**Tailwind Classes**:
```css
/* Form container */
className="w-full max-w-2xl mx-auto px-4"

/* Input fields */
className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"

/* Buttons */
className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors min-h-[44px]"
```

### 8. Accessibility (WCAG 2.1 AA)

**Decision**: Semantic HTML with ARIA attributes, proper labels, keyboard navigation

**Rationale**:
- Constitution principle II requires semantic HTML
- Quality standard requires WCAG 2.1 AA compliance
- Existing components demonstrate proper patterns

**Implementation Checklist**:
- [ ] All inputs have associated `<label>` elements
- [ ] Form has proper `<form>` element with `onSubmit`
- [ ] Error messages linked via `aria-describedby`
- [ ] Focus management for modals/dialogs
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader announcements for state changes

## Design Patterns Summary

### Goals Form Component
- **Type**: Single form, always visible in Goals tab
- **State**: Local state for form data, loading, errors
- **Validation**: Real-time on blur, pre-submit validation
- **API**: GET on mount, PUT on save
- **Empty state**: Prompt to set goals if none exist

### Custom Food Form Component
- **Type**: Modal/expandable form for create/edit
- **State**: Local state for form data, mode (create/edit)
- **Validation**: Real-time on blur, pre-submit validation
- **API**: POST for create, PUT for edit
- **Reusability**: Same component for create and edit

### Custom Food List Component
- **Type**: List with inline edit/delete actions
- **State**: Local state for foods array, loading, selected item
- **API**: GET on mount, DELETE on delete action
- **Pagination**: Not needed for MVP (most users have <50 custom foods)
- **Future**: Add pagination if users report slow performance

## API Integration

All API endpoints exist and are fully tested. Frontend services already implemented:

### Goals Service (`frontend/src/services/goals.ts`)
```typescript
getGoals(): Promise<Goals | null>
setGoals(data: SetGoalsRequest): Promise<Goals>
deleteGoals(): Promise<void>
skipOnboarding(): Promise<void>  // Not used in Settings
```

### Custom Foods Service (`frontend/src/services/customFoods.ts`)
```typescript
getCustomFoods(): Promise<CustomFood[]>
getCustomFood(foodId: string): Promise<CustomFood>
createCustomFood(data: CreateCustomFoodRequest): Promise<CustomFood>
updateCustomFood(foodId: string, data: UpdateCustomFoodRequest): Promise<CustomFood>
deleteCustomFood(foodId: string): Promise<void>
```

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Component rendering with various states (loading, error, success, empty)
- Form validation logic
- User interactions (input changes, form submission, cancel)
- Error handling scenarios

### Integration Tests
- Full form submission flow (mock API)
- Optimistic updates with rollback
- Navigation between form states

### Manual Testing Checklist
- [ ] Goals form loads with existing data
- [ ] Goals form validates input constraints
- [ ] Goals form saves successfully
- [ ] Custom foods list loads all user foods
- [ ] Custom food creation works
- [ ] Custom food editing pre-fills form
- [ ] Custom food deletion confirms and removes
- [ ] Mobile viewport (320px, 768px, 1024px)
- [ ] Keyboard navigation works
- [ ] Screen reader announces states

## Security Considerations

**Authentication**: All API calls use existing JWT token from `useAuth` hook
**Authorization**: Backend enforces user_id matching (users can only see/edit their own data)
**Input Sanitization**: Backend handles (Pydantic validation), frontend prevents script injection via React's default escaping
**HTTPS**: Required for production (already enforced)

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial tab load | <200ms | Minimal DOM, lazy load forms |
| API response | <200ms | Backend already meets this |
| Form submission perceived time | <100ms | Optimistic updates |
| Input responsiveness | <50ms | Controlled components, debounce not needed |

## Conclusion

All technical unknowns are resolved. The implementation follows established patterns from the existing codebase (Settings page, MealBuilder, CustomMealList). No new dependencies or architectural changes required. Ready to proceed to Phase 1 (data model and contracts).
