# Phase 7: Custom Meals - Implementation Progress

**Feature**: User Story 4 - Custom Meal Creation
**Status**: 🚧 IN PROGRESS (8 of 19 tasks complete - 42%)
**Started**: 2025-12-06
**Last Updated**: 2025-12-06

---

## Overview

Implementing custom meal functionality allowing users to create reusable meal presets from multiple foods and add entire meals to their diary at once.

## Completed Tasks (8/19) ✅

### Phase A: Test-Driven Development (6/6 complete)

- ✅ **T117** - Custom meal API contract tests (`backend/tests/contract/test_custom_meal.py`)
  - Tests: list, create, get, update, delete meals
  - Validation, user isolation, multiple items
  - All edge cases covered

- ✅ **T118** - Add-meal-to-diary API tests (`backend/tests/contract/test_add_meal.py`)
  - Tests: POST /diary/{date}/add-meal endpoint
  - Multiple items, validation, deleted meals, user isolation

- ✅ **T119** - Custom meal integration tests (`backend/tests/integration/test_custom_meal.py`)
  - Full lifecycle: create → update → use → delete
  - Deleted food handling, complex meals, totals calculation

- ✅ **T120** - MealBuilder component tests (`frontend/tests/components/MealBuilder.test.tsx`)
  - Food search and addition, quantity adjustment
  - Totals calculation, validation, editing existing meals

- ✅ **T121** - CustomMealList component tests (`frontend/tests/components/CustomMealList.test.tsx`)
  - List rendering, edit/delete actions, search/filter
  - Empty states, loading states, confirmation dialogs

- ✅ **T122** - MealCard component tests (`frontend/tests/components/MealCard.test.tsx`)
  - Meal display with totals, add to diary action
  - Deleted food indicators, macro breakdown

### Phase B: Backend Models (2/2 complete)

- ✅ **T123** - CustomMeal model (`backend/src/models/custom_meal.py`)
  - Fields: id, user_id, name, is_deleted, timestamps
  - Relationship to User and CustomMealItem

- ✅ **T124** - CustomMealItem model (`backend/src/models/custom_meal.py`)
  - Fields: id, meal_id, food_id, quantity, created_at
  - Relationships to CustomMeal and DiaryFood

**Additional Work:**
- Updated User model with custom_meals relationship
- Updated models/__init__.py to export new models

---

## Remaining Tasks (11/19) 📋

### Phase B: Backend Implementation (5 tasks)

- ⏳ **T125** - Create database migration
  - File: `backend/alembic/versions/20251206_000005_add_custom_meals_tables.py`
  - Tables: custom_meals, custom_meal_items
  - Foreign keys, indexes, constraints

- ⏳ **T126** - Implement custom meal service
  - File: `backend/src/services/custom_meals.py`
  - Methods: create_meal, get_meals, get_meal, update_meal, delete_meal
  - Totals calculation, validation, user isolation

- ⏳ **T127** - Implement meal API endpoints
  - File: `backend/src/api/meals.py`
  - GET /meals, POST /meals, GET /meals/{id}, PUT /meals/{id}, DELETE /meals/{id}
  - Response includes calculated totals

- ⏳ **T128** - Implement add-meal-to-diary endpoint
  - File: `backend/src/api/diary.py` (update existing)
  - POST /diary/{date}/add-meal
  - Creates diary entry for each meal item

- ⏳ **T129** - Run backend tests
  - Verify all contract tests PASS
  - Verify all integration tests PASS
  - Expected: 83+ tests passing

### Phase C: Frontend Implementation (6 tasks)

- ⏳ **T130** - Create MealBuilder component
  - File: `frontend/src/components/MealBuilder/index.tsx`
  - Features: food search, add/remove items, quantity adjustment
  - Real-time totals, save meal, edit existing

- ⏳ **T131** - Create CustomMealList component
  - File: `frontend/src/components/CustomMealList/index.tsx`
  - Display list of meals, edit/delete actions
  - Search, empty state, loading state

- ⏳ **T132** - Create MealCard component
  - File: `frontend/src/components/MealCard/index.tsx`
  - Display meal with items and totals
  - Add to diary button, deleted indicators

- ⏳ **T133** - Add meals section to Settings page
  - File: `frontend/src/pages/Settings/index.tsx` (update)
  - "Manage Custom Meals" tab
  - Create new meal button, meal list integration

- ⏳ **T134** - Add meal selection to Diary page
  - File: `frontend/src/pages/Diary/index.tsx` (update)
  - "Add Meal" option in add food flow
  - Meal selection dropdown, category selection

- ⏳ **T135** - Run frontend tests
  - Verify all component tests PASS
  - Expected: 116+ tests passing

---

## Files Created

### Backend
```
backend/tests/contract/test_custom_meal.py     (15 tests)
backend/tests/contract/test_add_meal.py        (9 tests)
backend/tests/integration/test_custom_meal.py  (8 tests)
backend/src/models/custom_meal.py              (CustomMeal, CustomMealItem)
```

### Frontend
```
frontend/tests/components/MealBuilder.test.tsx      (20 tests)
frontend/tests/components/CustomMealList.test.tsx   (18 tests)
frontend/tests/components/MealCard.test.tsx         (23 tests)
```

### Modified Files
```
backend/src/models/user.py          (added custom_meals relationship)
backend/src/models/__init__.py      (export CustomMeal, CustomMealItem)
specs/001-macro-calorie-tracker/tasks.md  (marked T117-T124 complete)
```

---

## Database Schema

### custom_meals table
```sql
CREATE TABLE custom_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_custom_meals_user_id (user_id),
    INDEX idx_custom_meals_user_deleted (user_id, is_deleted)
);
```

### custom_meal_items table
```sql
CREATE TABLE custom_meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES custom_meals(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES diary_foods(id) ON DELETE CASCADE,
    quantity DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_custom_meal_items_meal_id (meal_id),
    UNIQUE CONSTRAINT unique_meal_food (meal_id, food_id)
);
```

---

## API Endpoints to Implement

### Meal Management
- `GET /api/v1/meals` - List user's meals with totals
- `POST /api/v1/meals` - Create meal with items
- `GET /api/v1/meals/{id}` - Get meal details
- `PUT /api/v1/meals/{id}` - Update meal and items
- `DELETE /api/v1/meals/{id}` - Soft delete meal

### Diary Integration
- `POST /api/v1/diary/{date}/add-meal` - Add all meal items to diary

---

## Service Layer Methods

### CustomMealService
```python
create_meal(db, user_id, name, items) -> CustomMeal
get_meals(db, user_id, include_deleted=False) -> List[CustomMeal]
get_meal(db, meal_id, user_id) -> CustomMeal | None
update_meal(db, meal_id, user_id, name, items) -> CustomMeal
delete_meal(db, meal_id, user_id) -> bool
calculate_meal_totals(meal) -> MacroTotals
```

---

## UI Components to Build

### MealBuilder
- Food search integration (reuse FoodSearch component)
- Item list with quantity controls
- Real-time macro totals display
- Save/Cancel buttons
- Edit existing meal support

### CustomMealList
- Grid/list of meal cards
- Search/filter functionality
- Edit/Delete actions with confirmation
- Empty state with "Create First Meal" prompt

### MealCard
- Meal name and item count
- Macro totals display
- Item list (expandable)
- Add to Diary button
- Deleted food indicators

---

## Next Steps

### Immediate (Backend)
1. Create migration T125 (`uv run alembic revision --autogenerate -m "Add custom meals tables"`)
2. Implement service layer T126 (`backend/src/services/custom_meals.py`)
3. Implement API endpoints T127 (`backend/src/api/meals.py`)
4. Update diary API T128 (add add-meal endpoint)
5. Run tests T129 (`uv run pytest`)

### Then (Frontend)
1. Create services layer (`frontend/src/services/meals.ts`)
2. Create MealBuilder component T130
3. Create CustomMealList component T131
4. Create MealCard component T132
5. Integrate into Settings T133
6. Integrate into Diary T134
7. Run tests T135 (`npm test`)

---

## Testing Status

### Backend (All written, not yet passing)
- **Contract Tests**: 24 tests in test_custom_meal.py + test_add_meal.py
- **Integration Tests**: 8 tests in test_custom_meal.py
- **Expected Outcome**: Tests should FAIL until implementation complete

### Frontend (All written, not yet passing)
- **MealBuilder**: 20 tests
- **CustomMealList**: 18 tests
- **MealCard**: 23 tests
- **Expected Outcome**: Tests should FAIL until components implemented

---

## Key Implementation Notes

1. **Soft Delete**: Meals use is_deleted flag, not hard delete
2. **User Isolation**: All queries filtered by user_id
3. **Totals Calculation**: Server-side calculation based on items
4. **Deleted Foods**: Meals show indicator when component food deleted
5. **Validation**: Name max 100 chars, items array required, quantities > 0
6. **Food ID Format**: Unified format `source:id` (e.g., `custom:uuid`, `usda:12345`)

---

## Success Criteria

- ✅ All 19 tasks completed and marked [X]
- ✅ Backend tests passing (currently 83/88, should increase)
- ✅ Frontend tests passing (currently 116/184, should increase)
- ✅ User can create meals with multiple foods
- ✅ User can edit and delete meals
- ✅ User can add entire meal to diary
- ✅ Meal totals calculated correctly
- ✅ Deleted foods show indicator in meals

---

## Continuation Command

When ready to continue implementation:

```bash
# In new chat, use:
/speckit.implement phase 7

# Or manually:
# Backend: cd backend && uv run alembic revision --autogenerate -m "Add custom meals tables"
# Then implement T126-T129
```

---

**Last Updated**: 2025-12-06
**Progress**: 42% (8/19 tasks)
**Estimated Remaining Time**: 2-3 hours
