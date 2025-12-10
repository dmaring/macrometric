# Tasks: Settings - Goals and Custom Foods

**Input**: Design documents from `/specs/005-settings-goals-foods/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature includes comprehensive testing. All test tasks are marked and should be implemented to ensure quality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths below use web app structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure is ready for implementation

**Note**: Backend is 100% complete. These tasks verify the frontend setup.

- [x] T001 Verify feature branch `005-settings-goals-foods` is checked out
- [x] T002 [P] Verify backend API services exist in `frontend/src/services/goals.ts` and `frontend/src/services/customFoods.ts`
- [x] T003 [P] Verify Settings page structure exists in `frontend/src/pages/Settings/index.tsx`
- [x] T004 [P] Verify Tailwind CSS theme system is configured with semantic color tokens
- [x] T005 Create component directories: `frontend/src/components/GoalsForm/`, `frontend/src/components/CustomFoodForm/`, `frontend/src/components/CustomFoodList/`

**Checkpoint**: Environment ready - all existing infrastructure verified

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational work needed - backend is complete and frontend infrastructure exists

**⚠️ CRITICAL**: This phase is empty because all prerequisites already exist. User story implementation can begin immediately.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Daily Goals Management (Priority: P1) 🎯 MVP

**Goal**: Enable users to view and edit their daily nutritional goals from the Settings page

**Independent Test**: Navigate to Settings > Goals tab, enter/modify goal values (calories: 2000, protein: 150g, carbs: 200g, fat: 65g), save changes, verify the diary page shows updated progress bars reflecting new targets

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [P] [US1] Create test file `frontend/src/components/GoalsForm/GoalsForm.test.tsx` with test suite structure (imports, mocks, describe block)
- [x] T007 [P] [US1] Write unit test: GoalsForm loads and displays existing goals from API
- [x] T008 [P] [US1] Write unit test: GoalsForm shows empty state when no goals exist
- [x] T009 [P] [US1] Write unit test: GoalsForm validates calories range (500-10000)
- [x] T010 [P] [US1] Write unit test: GoalsForm validates macros are non-negative
- [x] T011 [P] [US1] Write unit test: GoalsForm shows error messages for invalid inputs
- [x] T012 [P] [US1] Write unit test: GoalsForm submits valid data and calls API
- [x] T013 [P] [US1] Write unit test: GoalsForm handles API errors gracefully
- [x] T014 [P] [US1] Write unit test: GoalsForm performs optimistic updates with rollback on error

### Implementation for User Story 1

- [x] T015 [US1] Create GoalsForm component file `frontend/src/components/GoalsForm/index.tsx` with TypeScript interfaces and state setup
- [x] T016 [US1] Implement useEffect hook in GoalsForm to load goals on component mount via `getGoals()` API
- [x] T017 [US1] Implement validation function `validateGoals()` in GoalsForm (calories 500-10000, macros ≥0, max 2 decimals)
- [x] T018 [US1] Implement form state management in GoalsForm (formData, errors, loading, saving states)
- [x] T019 [US1] Implement handleChange function in GoalsForm for input field updates with error clearing on change
- [x] T020 [US1] Implement handleSubmit function in GoalsForm with optimistic updates and rollback on error
- [x] T021 [US1] Implement GoalsForm UI with Tailwind classes: form inputs for calories, protein_g, carbs_g, fat_g with labels and error displays
- [x] T022 [US1] Add loading skeleton to GoalsForm for initial data load state
- [x] T023 [US1] Add empty state to GoalsForm when no goals exist ("Set your daily targets to track progress")
- [x] T024 [US1] Add error state to GoalsForm with retry button for API failures
- [x] T025 [US1] Add save and cancel buttons to GoalsForm with proper disabled states
- [x] T026 [US1] Update Settings page `frontend/src/pages/Settings/index.tsx` to import and render GoalsForm component in Goals tab
- [x] T027 [US1] Remove placeholder content from Goals tab in Settings page (lines 199-204)
- [x] T028 [US1] Run all US1 tests and verify they pass: `cd frontend && npm test GoalsForm`

**Checkpoint**: User Story 1 complete - Goals management is fully functional and testable independently

---

## Phase 4: User Story 2 - Custom Foods Management (Priority: P2)

**Goal**: Enable users to view, create, edit, and delete their custom foods from the Settings page

**Independent Test**: Navigate to Settings > Custom Foods tab, create a new food (e.g., "Homemade Protein Shake" with macros), edit it to change calories, delete it with confirmation, verify all changes persist in the list and disappear from search results

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T029 [P] [US2] Create test file `frontend/src/components/CustomFoodList/CustomFoodList.test.tsx` with test suite structure
- [x] T030 [P] [US2] Write unit test: CustomFoodList loads and displays all user's custom foods
- [x] T031 [P] [US2] Write unit test: CustomFoodList shows empty state when no foods exist
- [x] T032 [P] [US2] Write unit test: CustomFoodList handles delete with confirmation dialog
- [x] T033 [P] [US2] Write unit test: CustomFoodList calls onEdit when edit button clicked
- [x] T034 [P] [US2] Write unit test: CustomFoodList handles API errors gracefully
- [x] T035 [P] [US2] Create test file `frontend/src/components/CustomFoodForm/CustomFoodForm.test.tsx` with test suite structure
- [x] T036 [P] [US2] Write unit test: CustomFoodForm renders in create mode with empty fields
- [x] T037 [P] [US2] Write unit test: CustomFoodForm renders in edit mode with pre-filled data
- [x] T038 [P] [US2] Write unit test: CustomFoodForm validates required fields (name, serving_size, serving_unit)
- [x] T039 [P] [US2] Write unit test: CustomFoodForm validates non-negative nutritional values
- [x] T040 [P] [US2] Write unit test: CustomFoodForm submits create request with valid data
- [x] T041 [P] [US2] Write unit test: CustomFoodForm submits update request in edit mode
- [x] T042 [P] [US2] Write unit test: CustomFoodForm handles API errors gracefully
- [x] T043 [P] [US2] Write unit test: CustomFoodForm calls onCancel when cancel button clicked

### Implementation for User Story 2

#### CustomFoodList Component

- [x] T044 [US2] Create CustomFoodList component file `frontend/src/components/CustomFoodList/index.tsx` with TypeScript interfaces
- [x] T045 [US2] Implement useEffect hook in CustomFoodList to load foods on mount via `getCustomFoods()` API
- [x] T046 [US2] Implement delete functionality in CustomFoodList with confirmation dialog using window.confirm
- [x] T047 [US2] Implement CustomFoodList UI with Tailwind classes: food cards showing name, serving, macros
- [x] T048 [US2] Add edit and delete buttons to each food card in CustomFoodList with proper accessibility
- [x] T049 [US2] Add loading skeleton to CustomFoodList for initial data load
- [x] T050 [US2] Add empty state to CustomFoodList ("No custom foods yet. Create one to get started") with onCreate button
- [x] T051 [US2] Add error state to CustomFoodList with retry button for API failures

#### CustomFoodForm Component

- [x] T052 [US2] Create CustomFoodForm component file `frontend/src/components/CustomFoodForm/index.tsx` with TypeScript interfaces
- [x] T053 [US2] Implement validation function `validateCustomFood()` in CustomFoodForm (name required, serving_size >0, all macros ≥0)
- [x] T054 [US2] Implement form state management in CustomFoodForm (formData, errors, submitting, mode detection)
- [x] T055 [US2] Implement handleChange function in CustomFoodForm for all input fields with error clearing
- [x] T056 [US2] Implement handleSubmit function in CustomFoodForm that calls createCustomFood or updateCustomFood based on mode
- [x] T057 [US2] Implement CustomFoodForm UI with Tailwind classes: inputs for name, brand (optional), serving_size, serving_unit, calories, protein_g, carbs_g, fat_g
- [x] T058 [US2] Add form title in CustomFoodForm that shows "Create" or "Edit" based on mode
- [x] T059 [US2] Add save and cancel buttons to CustomFoodForm with proper disabled states
- [x] T060 [US2] Add error display to CustomFoodForm for validation errors and API failures

#### Settings Page Integration

- [x] T061 [US2] Add state to Settings page for custom foods: showFoodForm (boolean) and editingFood (CustomFood | undefined)
- [x] T062 [US2] Import CustomFoodList and CustomFoodForm components in Settings page
- [x] T063 [US2] Update Custom Foods tab in Settings page to conditionally render CustomFoodForm or CustomFoodList based on showFoodForm state
- [x] T064 [US2] Add "Create New Food" button to Custom Foods tab that sets showFoodForm=true and editingFood=undefined
- [x] T065 [US2] Wire up CustomFoodList onEdit prop to set showFoodForm=true and editingFood=selected food
- [x] T066 [US2] Wire up CustomFoodForm onSave prop to reset showFoodForm=false and editingFood=undefined
- [x] T067 [US2] Wire up CustomFoodForm onCancel prop to reset showFoodForm=false and editingFood=undefined
- [x] T068 [US2] Remove placeholder content from Custom Foods tab in Settings page (lines 206-211)
- [x] T069 [US2] Run all US2 tests and verify they pass: `cd frontend && npm test CustomFood`

**Checkpoint**: User Story 2 complete - Custom foods management is fully functional and testable independently. Both US1 and US2 work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final polish and integration testing across both user stories

### Accessibility & Mobile

- [ ] T070 [P] Add aria-labels to all form inputs in GoalsForm for screen reader support
- [ ] T071 [P] Add aria-labels to all form inputs in CustomFoodForm for screen reader support
- [ ] T072 [P] Link error messages to inputs via aria-describedby in GoalsForm
- [ ] T073 [P] Link error messages to inputs via aria-describedby in CustomFoodForm
- [ ] T074 [P] Verify all buttons in GoalsForm, CustomFoodForm, and CustomFoodList meet 44x44px minimum touch target
- [ ] T075 Test mobile responsiveness at 320px, 768px, and 1024px breakpoints for Goals tab
- [ ] T076 Test mobile responsiveness at 320px, 768px, and 1024px breakpoints for Custom Foods tab
- [ ] T077 Verify keyboard navigation works (Tab, Enter, Escape) for all forms and dialogs
- [ ] T078 Test focus management when opening/closing CustomFoodForm modal

### Integration Testing

- [ ] T079 Manual test: Create goals, navigate to Diary, verify progress bars show new targets
- [ ] T080 Manual test: Create custom food in Settings, search for it in Diary, verify it appears
- [ ] T081 Manual test: Edit custom food in Settings, verify changes appear in Diary search results
- [ ] T082 Manual test: Delete custom food in Settings, verify it disappears from Diary search results
- [ ] T083 Manual test: Test error handling by disconnecting network during form submissions
- [ ] T084 Manual test: Verify optimistic updates and rollback in GoalsForm on API failure
- [ ] T085 Manual test: Verify confirmation dialog appears before deleting custom foods

### Settings Page Tests

- [ ] T086 [P] Update Settings page test file `frontend/tests/pages/Settings.test.tsx` to test Goals tab rendering
- [ ] T087 [P] Add test to Settings page: Custom Foods tab renders correctly
- [ ] T088 [P] Add test to Settings page: Tab switching works between Goals and Custom Foods
- [ ] T089 Run full frontend test suite: `cd frontend && npm test`
- [ ] T090 Verify test coverage meets 80%+ for GoalsForm, CustomFoodForm, and CustomFoodList

### Code Quality

- [ ] T091 [P] Run TypeScript type check: `cd frontend && npm run type-check` and fix any errors
- [ ] T092 [P] Run ESLint and fix any linting errors: `cd frontend && npm run lint`
- [ ] T093 [P] Format code with Prettier if needed: `cd frontend && npm run format`
- [ ] T094 Review all Tailwind classes for consistency with existing Settings page patterns (theme tokens, spacing, borders)
- [ ] T095 Add inline code comments explaining validation logic in validateGoals and validateCustomFood functions

### Documentation

- [ ] T096 [P] Update CLAUDE.md Recent Changes section with feature completion details
- [ ] T097 Verify quickstart.md checklist items are all addressed
- [ ] T098 Create commit with message: "feat(settings): implement Goals and Custom Foods management\n\nAdds GoalsForm component for editing daily nutritional targets.\nAdds CustomFoodForm and CustomFoodList for managing custom foods.\nIncludes comprehensive tests for all components.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\nvia [Happy](https://happy.engineering)\n\nCo-Authored-By: Claude <noreply@anthropic.com>\nCo-Authored-By: Happy <yesreply@happy.engineering>"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Empty - no blocking work needed
- **User Story 1 (Phase 3)**: Can start after Setup - No dependencies on other stories
- **User Story 2 (Phase 4)**: Can start after Setup - No dependencies on US1 (fully independent)
- **Polish (Phase 5)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can start immediately after Setup
- **User Story 2 (P2)**: Independent - can start immediately after Setup (no dependency on US1)

**Key Insight**: US1 and US2 can be developed in parallel by different developers or sequentially in priority order.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (T006-T014 before T015-T028 for US1)
- Component implementation before Settings page integration
- All tests passing before moving to next story

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004 can run in parallel (different verification tasks)

**User Story 1 Tests (All can run in parallel)**:
- T006, T007, T008, T009, T010, T011, T012, T013, T014 can be written in parallel

**User Story 2 Tests (All can run in parallel)**:
- T029-T043 can be written in parallel (15 test tasks)

**User Story 2 Implementation**:
- T044-T051 (CustomFoodList) can run in parallel with T052-T060 (CustomFoodForm)

**Polish Phase**:
- T070, T071, T072, T073, T074 can run in parallel (accessibility tasks)
- T086, T087, T088 can run in parallel (Settings page tests)
- T091, T092, T093 can run in parallel (code quality checks)
- T096, T097 can run in parallel (documentation)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (write in parallel):
Task: "Create test file frontend/src/components/GoalsForm/GoalsForm.test.tsx"
Task: "Write unit test: loads and displays existing goals"
Task: "Write unit test: shows empty state when no goals exist"
Task: "Write unit test: validates calories range"
Task: "Write unit test: validates macros are non-negative"
# ... all tests T006-T014

# Then implement component sequentially:
Task: "Create GoalsForm component file" (T015)
Task: "Implement useEffect to load goals" (T016)
# ... implementation T015-T028
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests together (write in parallel):
Task: "Create CustomFoodList test file" (T029)
Task: "Create CustomFoodForm test file" (T035)
# ... all tests T029-T043

# Launch both component implementations in parallel:
# Developer A:
Task: "Create CustomFoodList component" (T044-T051)

# Developer B (in parallel):
Task: "Create CustomFoodForm component" (T052-T060)

# Then integrate together:
Task: "Settings page integration" (T061-T069)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Skip Phase 2: Foundational (empty)
3. Complete Phase 3: User Story 1 (T006-T028)
4. **STOP and VALIDATE**: Test Goals management independently
5. Deploy/demo if ready

**MVP Result**: Users can manage their daily goals from Settings. This is the blocking functionality needed for progress tracking.

### Incremental Delivery

1. Complete Setup → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Polish phase → Final deployment
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With 2+ developers:

1. Team completes Setup together (T001-T005)
2. Once Setup is done:
   - **Developer A**: User Story 1 (T006-T028) - 2-3 hours
   - **Developer B**: User Story 2 (T029-T069) - 4-5 hours
3. Team completes Polish together (T070-T098)

**Time Savings**: Parallel execution reduces total time from 8 hours to ~5 hours

---

## Testing Strategy

### Test-Driven Development (TDD)

This feature follows TDD approach:

1. **Write tests first** (they should FAIL)
2. **Implement feature** (make tests PASS)
3. **Refactor** if needed (tests stay GREEN)

### Test Coverage Goals

- GoalsForm: 80%+ coverage (8 unit tests)
- CustomFoodForm: 80%+ coverage (7 unit tests)
- CustomFoodList: 80%+ coverage (8 unit tests)
- Settings page updates: All new code paths tested

### Test Execution

```bash
# Run all tests
cd frontend && npm test

# Run specific component tests
npm test GoalsForm
npm test CustomFood

# Run with coverage
npm test -- --coverage

# Run in watch mode during development
npm test -- --watch
```

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each logical group of tasks (e.g., after completing a component)
- Stop at any checkpoint to validate story independently
- Backend is 100% complete - this is a frontend-only feature
- All API services already exist and are tested
- Reuse existing Tailwind patterns from Settings page (Custom Meals tab)

---

## Quick Commands Reference

```bash
# Development
cd frontend && npm run dev

# Testing
cd frontend && npm test                    # Run all tests
cd frontend && npm test GoalsForm          # Run specific tests
cd frontend && npm test -- --watch         # Watch mode
cd frontend && npm test -- --coverage      # With coverage

# Quality Checks
cd frontend && npm run type-check          # TypeScript validation
cd frontend && npm run lint                # ESLint
cd frontend && npm run format              # Prettier

# Backend (already running)
cd backend && uv run uvicorn main:app --reload
```

---

## Task Statistics

- **Total Tasks**: 98
- **Setup Tasks**: 5
- **User Story 1 Tasks**: 23 (9 tests + 14 implementation)
- **User Story 2 Tasks**: 41 (15 tests + 26 implementation)
- **Polish Tasks**: 29
- **Parallel Opportunities**: 45+ tasks can run in parallel
- **Estimated Total Time**: 6-8 hours (sequential), 4-5 hours (with 2 developers)
- **MVP Time**: 2-3 hours (User Story 1 only)

---

**Feature Branch**: `005-settings-goals-foods`
**Ready to implement!** Start with Phase 1 (Setup), then choose MVP-first or parallel team strategy.
