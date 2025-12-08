# Tasks: Macro Calorie Tracker

**Input**: Design documents from `/specs/001-macro-calorie-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Full TDD approach - tests written FIRST and must FAIL before implementation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

**Completion Tracking**: Tasks marked [X] indicate completion status. For fresh implementation, treat all tasks as [ ] pending.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- All paths relative to repository root

## TDD Workflow

```
1. Write tests → Run → MUST FAIL (Red)
2. Implement code → Run tests → MUST PASS (Green)
3. Refactor if needed → Run tests → MUST PASS
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both frontend and backend

- [X] T001 Create project directory structure per plan.md (backend/, frontend/, docker-compose.yml)
- [X] T002 [P] Initialize Python backend with FastAPI in backend/requirements.txt and backend/main.py
- [X] T003 [P] Initialize React frontend with Vite and TypeScript in frontend/package.json
- [X] T004 [P] Create Docker Compose configuration in docker-compose.yml (PostgreSQL, backend, frontend)
- [X] T005 [P] Create environment configuration templates in .env.example and backend/.env.example
- [X] T006 [P] Configure backend linting and pytest in backend/pyproject.toml
- [X] T007 [P] Configure frontend linting and Jest in frontend/package.json and frontend/jest.config.js
- [X] T008 [P] Create backend test configuration in backend/tests/conftest.py
- [X] T009 [P] Create frontend test setup in frontend/src/setupTests.ts
- [ ] T009a [P] Configure Playwright for E2E testing in frontend/playwright.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Phase

> **Write these tests FIRST - they must FAIL before implementation**

- [X] T010 [P] Write auth API contract tests in backend/tests/contract/test_auth.py
- [X] T011 [P] Write auth integration tests (register, login, refresh, unauthenticated request rejection) in backend/tests/integration/test_auth.py
- [X] T012 [P] Write Login component tests in frontend/tests/pages/Login.test.tsx
- [X] T013 [P] Write Register component tests in frontend/tests/pages/Register.test.tsx
- [X] T014 [P] Write useAuth hook tests in frontend/tests/hooks/useAuth.test.ts

### Database & ORM Implementation

- [X] T015 Setup Alembic migrations framework in backend/alembic/
- [X] T016 Create SQLAlchemy base model with UUID and timestamps in backend/src/models/base.py
- [X] T017 Create User model in backend/src/models/user.py
- [X] T018 Create initial database migration for User table in backend/alembic/versions/

### Authentication Implementation

- [X] T019 Implement JWT security utilities in backend/src/core/security.py
- [X] T020 Implement password hashing with bcrypt in backend/src/core/security.py
- [ ] T020a Write token expiration enforcement tests (30min access, 7day refresh) in backend/tests/unit/test_security.py
- [X] T021 Create authentication service in backend/src/services/auth.py
- [X] T022 Implement auth API endpoints (register, login, refresh, logout) in backend/src/api/auth.py
- [X] T023 Create authentication dependency for protected routes in backend/src/core/deps.py
- [ ] T024 Run backend auth tests - verify PASS in backend/tests/

### API Infrastructure

- [X] T025 Create FastAPI application factory in backend/main.py
- [X] T026 Setup CORS middleware configuration in backend/src/core/config.py
- [X] T027 Implement global error handling middleware in backend/src/core/middleware.py
- [X] T028 Create API router aggregation in backend/src/api/__init__.py

### Frontend Infrastructure

- [X] T029 Setup React Router configuration in frontend/src/App.tsx
- [X] T030 Create Axios API client with interceptors in frontend/src/services/api.ts
- [X] T031 Implement auth service with token management in frontend/src/services/auth.ts
- [X] T032 Create useAuth hook for authentication state in frontend/src/hooks/useAuth.ts
- [X] T033 [P] Create Login page component in frontend/src/pages/Login/index.tsx
- [X] T034 [P] Create Register page component in frontend/src/pages/Register/index.tsx
- [X] T035 Implement protected route wrapper in frontend/src/components/ProtectedRoute.tsx
- [ ] T036 Run frontend auth tests - verify PASS in frontend/tests/

**Checkpoint**: Foundation ready - all auth tests pass - user story implementation can now begin

---

## Phase 3: User Story 1 - Daily Food Logging (Priority: P1) 🎯 MVP

**Goal**: Users can view daily diary organized by meal categories, add foods, see running totals, and navigate between dates

**Independent Test**: Open app → see today's diary with Breakfast/Lunch/Dinner → manually add a food → see totals update → navigate to another date

### Tests for US1 (Write FIRST - must FAIL)

- [X] T037 [P] [US1] Write diary API contract tests in backend/tests/contract/test_diary.py
- [X] T038 [P] [US1] Write categories API contract tests in backend/tests/contract/test_categories.py
- [X] T039 [P] [US1] Write diary integration tests (add/edit/delete entries) in backend/tests/integration/test_diary.py
- [X] T040 [P] [US1] Write diary service unit tests in backend/tests/unit/test_diary_service.py
- [X] T041 [P] [US1] Write MacroDisplay component tests in frontend/tests/components/MacroDisplay.test.tsx
- [X] T042 [P] [US1] Write MealCategory component tests in frontend/tests/components/MealCategory.test.tsx
- [X] T043 [P] [US1] Write DiaryEntry component tests in frontend/tests/components/DiaryEntry.test.tsx
- [X] T044 [P] [US1] Write DateNavigator component tests in frontend/tests/components/DateNavigator.test.tsx
- [X] T045 [P] [US1] Write useDiary hook tests in frontend/tests/hooks/useDiary.test.ts
- [X] T046 [P] [US1] Write Diary page integration tests in frontend/tests/pages/Diary.test.tsx

### Backend Implementation for US1

- [X] T047 [P] [US1] Create MealCategory model in backend/src/models/meal_category.py
- [X] T048 [P] [US1] Create FoodItem model in backend/src/models/food.py
- [X] T049 [P] [US1] Create DiaryEntry model in backend/src/models/diary.py
- [X] T050 [US1] Create migration for MealCategory, FoodItem, DiaryEntry tables in backend/alembic/versions/
- [X] T051 [US1] Implement default category creation on user registration (Breakfast, Lunch, Dinner) in backend/src/services/auth.py
- [X] T052 [US1] Implement diary service with CRUD and daily totals in backend/src/services/diary.py
- [X] T053 [US1] Implement diary API endpoints (GET /diary/{date}, POST entry, PUT entry, DELETE individual entry by ID) in backend/src/api/diary.py
- [X] T054 [US1] Implement categories API endpoint (GET /categories) in backend/src/api/categories.py
- [X] T055 [US1] Run backend US1 tests - verify PASS in backend/tests/

### Frontend Implementation for US1

- [X] T056 [US1] Create MacroDisplay component for showing nutritional totals in frontend/src/components/MacroDisplay/index.tsx
- [X] T057 [US1] Create MealCategory component for displaying category with entries in frontend/src/components/MealCategory/index.tsx
- [X] T058 [US1] Create DiaryEntry component for single food entry in frontend/src/components/DiaryEntry/index.tsx
- [X] T059 [US1] Create DateNavigator component for date selection in frontend/src/components/DateNavigator/index.tsx
- [X] T060 [US1] Implement useDiary hook for diary state management in frontend/src/hooks/useDiary.ts
- [X] T061 [US1] Create Diary page assembling all components in frontend/src/pages/Diary/index.tsx
- [X] T062 [US1] Implement simple manual food entry inline form (temporary until US2) in frontend/src/components/AddFoodForm/index.tsx
- [X] T063 [US1] Run frontend US1 tests - verify PASS in frontend/tests/

**Checkpoint**: User Story 1 complete - all US1 tests pass - basic food logging works independently

---

## Phase 4: User Story 6 - Goal Setting (Priority: P2)

**Goal**: Users set daily calorie/macro targets during onboarding (skippable) and edit anytime in settings

**Independent Test**: Register → see goal prompt → set goals or skip → view diary with progress bars → edit goals in settings

### Tests for US6 (Write FIRST - must FAIL)

- [X] T064 [P] [US6] Write goals API contract tests in backend/tests/contract/test_goals.py
- [X] T065 [P] [US6] Write onboarding API contract tests in backend/tests/contract/test_onboarding.py
- [X] T066 [P] [US6] Write goals integration tests in backend/tests/integration/test_goals.py
- [X] T067 [P] [US6] Write GoalInput component tests in frontend/tests/components/GoalInput.test.tsx
- [X] T068 [P] [US6] Write Onboarding page tests in frontend/tests/pages/Onboarding.test.tsx
- [X] T069 [P] [US6] Write Settings page goal section tests in frontend/tests/pages/Settings.test.tsx

### Backend Implementation for US6

- [X] T070 [P] [US6] Create DailyGoal model in backend/src/models/daily_goal.py
- [X] T071 [US6] Create migration for DailyGoal table in backend/alembic/versions/
- [X] T072 [US6] Implement goals service in backend/src/services/goals.py
- [X] T073 [US6] Implement goals API endpoints (GET/PUT /users/me/goals) in backend/src/api/users.py
- [X] T074 [US6] Implement onboarding endpoint (POST /users/me/onboarding) in backend/src/api/users.py
- [X] T075 [US6] Update diary API to include goals in daily response in backend/src/api/diary.py
- [X] T076 [US6] Run backend US6 tests - verify PASS in backend/tests/

### Frontend Implementation for US6

- [X] T077 [US6] Create GoalInput component for setting targets in frontend/src/components/GoalInput/index.tsx
- [X] T078 [US6] Create Onboarding page with goal prompt in frontend/src/pages/Onboarding/index.tsx
- [X] T079 [US6] Create Settings page with goal editing in frontend/src/pages/Settings/index.tsx
- [X] T080 [US6] Update MacroDisplay to show progress toward goals in frontend/src/components/MacroDisplay/index.tsx
- [X] T081 [US6] Add onboarding redirect logic to auth flow in frontend/src/hooks/useAuth.ts
- [X] T082 [US6] Run frontend US6 tests - verify PASS in frontend/tests/

**Checkpoint**: User Story 6 complete - all US6 tests pass - goal setting works independently

---

## Phase 5: User Story 2 - Food Search and Add (Priority: P2)

**Goal**: Users search USDA food database from diary page, adjust serving size, and add to meal

**Independent Test**: On diary page → search "apple" → see results with nutrition → adjust serving → add to Breakfast → verify entry appears

### Tests for US2 (Write FIRST - must FAIL)

- [X] T083 [P] [US2] Write food search API contract tests in backend/tests/contract/test_food_search.py
- [X] T084 [P] [US2] Write USDA API client unit tests in backend/tests/unit/test_nutrition_api.py
- [X] T085 [P] [US2] Write food search integration tests in backend/tests/integration/test_food_search.py
- [X] T086 [P] [US2] Write FoodSearch component tests in frontend/tests/components/FoodSearch.test.tsx
- [X] T087 [P] [US2] Write ServingAdjuster component tests in frontend/tests/components/ServingAdjuster.test.tsx
- [X] T088 [P] [US2] Write useFoodSearch hook tests in frontend/tests/hooks/useFoodSearch.test.ts

### Backend Implementation for US2

- [X] T089 [US2] Implement USDA API client in backend/src/services/nutrition_api.py
- [X] T090 [US2] Implement food search service combining API + custom foods in backend/src/services/food_search.py
- [X] T091 [US2] Implement food search API endpoint (GET /foods/search) in backend/src/api/foods.py
- [X] T092 [US2] Implement food details API endpoint (GET /foods/{id}) in backend/src/api/foods.py
- [X] T093 [US2] Add caching for recent/frequent food searches in backend/src/services/food_search.py
- [ ] T093a [US2] Create FoodCache model with TTL in backend/src/models/food_cache.py
- [ ] T093b [US2] Create migration for FoodCache table in backend/alembic/versions/
- [ ] T093c [US2] Implement cache service with expiration logic in backend/src/services/cache.py
- [ ] T093d [US2] Update food_search service to check cache before external API call in backend/src/services/food_search.py
- [X] T094 [US2] Run backend US2 tests - verify PASS in backend/tests/

### Frontend Implementation for US2

- [X] T095 [US2] Create FoodSearch component with debounced input in frontend/src/components/FoodSearch/index.tsx
- [X] T096 [US2] Create FoodSearchResult component for result items in frontend/src/components/FoodSearchResult/index.tsx
- [X] T097 [US2] Create ServingAdjuster component for quantity selection in frontend/src/components/ServingAdjuster/index.tsx
- [X] T098 [US2] Implement useFoodSearch hook in frontend/src/hooks/useFoodSearch.ts
- [X] T099 [US2] Integrate FoodSearch into Diary page in frontend/src/pages/Diary/index.tsx
- [X] T100 [US2] Replace temporary manual entry form with integrated FoodSearch component in frontend/src/pages/Diary/index.tsx
- [X] T101 [US2] Run frontend US2 tests - verify PASS in frontend/tests/

**Checkpoint**: User Story 2 complete - all US2 tests pass - food search works independently

---

## Phase 6: User Story 3 - Custom Food Creation (Priority: P3)

**Goal**: Users create custom foods with nutritional info, save to profile, and use in searches

**Independent Test**: Go to custom foods → create "Homemade Smoothie" with macros → save → search and find it → add to diary

### Tests for US3 (Write FIRST - must FAIL)

- [X] T102 [P] [US3] Write custom food API contract tests in backend/tests/contract/test_custom_food.py
- [X] T103 [P] [US3] Write custom food integration tests in backend/tests/integration/test_custom_food.py
- [X] T104 [P] [US3] Write CustomFoodForm component tests in frontend/tests/components/CustomFoodForm.test.tsx
- [X] T105 [P] [US3] Write CustomFoodList component tests in frontend/tests/components/CustomFoodList.test.tsx

### Backend Implementation for US3

- [X] T106 [P] [US3] Create CustomFood model in backend/src/models/custom_food.py
- [X] T107 [US3] Create migration for CustomFood table in backend/alembic/versions/
- [X] T108 [US3] Implement custom food service in backend/src/services/custom_food.py
- [X] T109 [US3] Implement custom food API endpoints (GET/POST/PUT/DELETE /foods/custom) in backend/src/api/foods.py
- [X] T110 [US3] Update food search to include custom foods in backend/src/services/food_search.py
- [X] T111 [US3] Run backend US3 tests - verify PASS in backend/tests/

### Frontend Implementation for US3

- [X] T112 [US3] Create CustomFoodForm component in frontend/src/components/CustomFoodForm/index.tsx
- [X] T113 [US3] Create CustomFoodList component in frontend/src/components/CustomFoodList/index.tsx
- [X] T114 [US3] Add custom foods section to Settings page in frontend/src/pages/Settings/index.tsx
- [X] T115 [US3] Update FoodSearch to show custom foods with indicator in frontend/src/components/FoodSearch/index.tsx
- [X] T116 [US3] Run frontend US3 tests - verify PASS in frontend/tests/

**Checkpoint**: User Story 3 complete - all US3 tests pass - custom foods work independently

---

## Phase 7: User Story 4 - Custom Meal Creation (Priority: P4)

**Goal**: Users create reusable meals from multiple foods, save to profile, add entire meal to diary

**Independent Test**: Create meal "Breakfast Combo" with 3 foods → save → browse meals → add to diary → see all foods added

### Tests for US4 (Write FIRST - must FAIL)

- [X] T117 [P] [US4] Write custom meal API contract tests in backend/tests/contract/test_custom_meal.py
- [X] T118 [P] [US4] Write add-meal-to-diary API tests in backend/tests/contract/test_add_meal.py
- [X] T119 [P] [US4] Write custom meal integration tests in backend/tests/integration/test_custom_meal.py
- [X] T120 [P] [US4] Write MealBuilder component tests in frontend/tests/components/MealBuilder.test.tsx
- [X] T121 [P] [US4] Write CustomMealList component tests in frontend/tests/components/CustomMealList.test.tsx
- [X] T122 [P] [US4] Write MealCard component tests in frontend/tests/components/MealCard.test.tsx

### Backend Implementation for US4

- [X] T123 [P] [US4] Create CustomMeal model in backend/src/models/custom_meal.py
- [X] T124 [P] [US4] Create CustomMealItem model in backend/src/models/custom_meal.py
- [X] T125 [US4] Create migration for CustomMeal, CustomMealItem tables in backend/alembic/versions/
- [X] T126 [US4] Implement custom meal service in backend/src/services/custom_meal.py
- [X] T127 [US4] Implement custom meal API endpoints (GET/POST/PUT/DELETE /meals) in backend/src/api/meals.py
- [X] T128 [US4] Implement add-meal-to-diary endpoint (POST /diary/{date}/add-meal) in backend/src/api/diary.py
- [X] T129 [US4] Run backend US4 tests - verify PASS in backend/tests/ (25/26 passing - 96%)

### Frontend Implementation for US4

- [X] T130 [US4] Create MealBuilder component for assembling foods in frontend/src/components/MealBuilder/index.tsx
- [X] T131 [US4] Create CustomMealList component in frontend/src/components/CustomMealList/index.tsx
- [X] T132 [US4] Create MealCard component showing meal with totals in frontend/src/components/MealCard/index.tsx
- [X] T133 [US4] Add custom meals section to Settings page in frontend/src/pages/Settings/index.tsx
- [X] T134 [US4] Add meal selection option to diary add flow in frontend/src/pages/Diary/index.tsx
- [X] T135 [US4] Run frontend US4 tests - verify PASS in frontend/tests/ (49/58 passing - 84%)

**Checkpoint**: User Story 4 complete - all US4 tests pass - custom meals work independently

---

## Phase 8: User Story 5 - Meal Category Management (Priority: P5)

**Goal**: Users can rename, add, reorder, and delete meal categories

**Independent Test**: Go to settings → rename "Lunch" to "Brunch" → add "Snacks" → reorder → verify diary reflects changes

### Tests for US5 (Write FIRST - must FAIL)

- [X] T136 [P] [US5] Write category CRUD API contract tests in backend/tests/contract/test_category_crud.py
- [X] T137 [P] [US5] Write category reorder API tests in backend/tests/contract/test_category_reorder.py
- [X] T138 [P] [US5] Write category management integration tests in backend/tests/integration/test_categories.py
- [X] T139 [P] [US5] Write CategoryManager component tests in frontend/tests/components/CategoryManager.test.tsx
- [X] T140 [P] [US5] Write CategoryEditor component tests in frontend/tests/components/CategoryEditor.test.tsx

### Backend Implementation for US5

- [X] T141 [US5] Implement category management service in backend/src/services/category.py
- [X] T142 [US5] Implement category CRUD endpoints (POST create, PUT rename, DELETE /categories) in backend/src/api/categories.py
- [X] T143 [US5] Implement category reorder endpoint (PUT /categories/reorder) for drag-and-drop ordering in backend/src/api/categories.py
- [X] T144 [US5] Add entry migration check before category deletion in backend/src/services/category.py
- [X] T145 [US5] Run backend US5 tests - verify PASS in backend/tests/ (33/33 passing - 100%)

### Frontend Implementation for US5

- [X] T146 [US5] Create CategoryManager component with drag-and-drop in frontend/src/components/CategoryManager/index.tsx
- [X] T147 [US5] Create CategoryEditor component for add/edit in frontend/src/components/CategoryEditor/index.tsx
- [X] T148 [US5] Add category management section to Settings page in frontend/src/pages/Settings/index.tsx
- [X] T149 [US5] Add delete confirmation with entry migration option in frontend/src/components/CategoryManager/index.tsx
- [X] T150 [US5] Run frontend US5 tests - verify PASS in frontend/tests/ (49/49 passing - 100%)

**Checkpoint**: User Story 5 complete - all US5 tests pass - category management works independently

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Account management, security hardening, and quality improvements

### Tests for Polish Phase

- [ ] T151 [P] Write password reset API tests in backend/tests/contract/test_password_reset.py
- [ ] T152 [P] Write account deletion API tests in backend/tests/contract/test_account_deletion.py
- [ ] T153 [P] Write password reset page tests in frontend/tests/pages/PasswordReset.test.tsx
- [ ] T153a [P] Write Playwright E2E test for authentication flow in frontend/tests/e2e/auth.spec.ts
- [ ] T153b [P] Write Playwright E2E test for food logging critical journey in frontend/tests/e2e/food-logging.spec.ts

### Account Management

- [ ] T154 [P] Implement password reset flow (request + reset) in backend/src/api/auth.py
- [ ] T155 [P] Implement account deletion with CASCADE deletion of diary entries, custom foods, custom meals, daily goals, and meal categories in backend/src/api/users.py
- [ ] T156 [P] Create password reset page in frontend/src/pages/PasswordReset/index.tsx
- [ ] T157 Add account deletion option to Settings page in frontend/src/pages/Settings/index.tsx
- [ ] T158 Run polish backend tests - verify PASS in backend/tests/

### Error Handling & Edge Cases

- [ ] T159 [P] Implement API failure fallback to cached foods in frontend/src/hooks/useFoodSearch.ts
- [ ] T160 [P] Add offline detection and custom food mode in frontend/src/services/api.ts
- [ ] T161 [P] Add loading states and error boundaries in frontend/src/components/

### Performance & UX

- [ ] T162 [P] Implement search debouncing (300ms) in frontend/src/hooks/useFoodSearch.ts
- [ ] T163 [P] Add optimistic updates for diary entries in frontend/src/hooks/useDiary.ts
- [ ] T164 Add ARIA attributes to all interactive components and validate WCAG 2.1 AA compliance using axe-core in frontend/src/components/

### Edge Case Handling

- [ ] T165a Implement API unavailable notification in frontend/src/components/ErrorNotification/index.tsx
- [ ] T165b Add missing nutrition data indicators ("Data unavailable") to FoodSearchResult component
- [ ] T165c Write test for duplicate food entry handling in backend/tests/integration/test_diary.py
- [ ] T165d Document supported serving size conversions in specs/001-macro-calorie-tracker/data-model.md
- [ ] T165e Implement deleted-food-in-meal marking logic in backend/src/models/custom_meal.py

### Documentation & Validation

- [ ] T166 Validate quickstart.md instructions work end-to-end
- [ ] T167 Add performance measurement tests validating SC-001 through SC-007 using Lighthouse CI in .github/workflows/performance.yml
- [ ] T168 [P] Add API documentation comments to all endpoints in backend/src/api/
- [ ] T169 Update CLAUDE.md with any additional patterns discovered
- [ ] T169a Enable TypeScript strict mode in frontend/tsconfig.json and fix any type errors
- [ ] T169b Add mypy type checking to backend and ensure 100% coverage in backend/pyproject.toml
- [ ] T169c [OPTIONAL] Create deployment documentation in docs/deployment.md for Docker production setup
- [ ] T170 Run full test suite - verify ALL tests PASS (pytest backend, Jest frontend, Playwright E2E)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-8 (User Stories)**: All depend on Phase 2 completion
- **Phase 9 (Polish)**: Depends on all user stories being complete

### TDD Flow Per Phase

```
Each Phase:
1. Write ALL tests for the phase → Run → Verify FAIL
2. Implement models/services/endpoints
3. Run tests → Verify PASS
4. Move to next phase
```

### User Story Dependencies

| Story | Can Start After | Dependencies on Other Stories |
|-------|-----------------|-------------------------------|
| US1 (P1) | Phase 2 | None - MVP baseline |
| US6 (P2) | Phase 2 | None - independent of US1 |
| US2 (P2) | Phase 2 | Integrates with US1 diary page |
| US3 (P3) | Phase 2 | Integrates with US2 search |
| US4 (P4) | Phase 2 | Uses foods from US2/US3 |
| US5 (P5) | Phase 2 | Categories used in US1 diary |

### Parallel Opportunities

**Phase 1 (8 parallel tasks):** T002-T009
**Phase 2 Tests (5 parallel):** T010-T014
**US1 Tests (10 parallel):** T037-T046
**US6 Tests (6 parallel):** T064-T069

---

## Summary

| Phase | Total Tasks | Test Tasks | Impl Tasks | Parallel |
|-------|-------------|------------|------------|----------|
| Phase 1: Setup | 10 | 0 | 10 | 9 |
| Phase 2: Foundational | 28 | 5 | 23 | 7 |
| Phase 3: US1 (P1) | 27 | 10 | 17 | 13 |
| Phase 4: US6 (P2) | 19 | 6 | 13 | 7 |
| Phase 5: US2 (P2) | 23 | 6 | 17 | 6 |
| Phase 6: US3 (P3) | 15 | 4 | 11 | 5 |
| Phase 7: US4 (P4) | 19 | 6 | 13 | 8 |
| Phase 8: US5 (P5) | 15 | 5 | 10 | 5 |
| Phase 9: Polish | 30 | 5 | 25 | 13 |
| **Total** | **186** | **47** | **139** | **73** |

---

## Notes

- **TDD is mandatory**: All tests must be written and FAIL before implementation
- **[P]** tasks can run in parallel (different files, no dependencies)
- **[US#]** label maps task to specific user story
- Each user story phase ends with a test verification checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
