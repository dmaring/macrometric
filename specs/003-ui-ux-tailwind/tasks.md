# Tasks: UI/UX Tailwind Migration with Theme Toggle

**Input**: Design documents from `/specs/003-ui-ux-tailwind/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No test tasks included - not requested in the feature specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- All tasks in this feature are frontend-only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tailwind CSS installation and basic configuration

- [X] T001 Install Tailwind CSS dependencies in frontend/package.json (tailwindcss@^3.4.0, postcss@^8.4.0, autoprefixer@^10.4.0)
- [X] T002 Initialize Tailwind configuration by running npx tailwindcss init -p in frontend/ directory
- [X] T003 Configure Tailwind with darkMode class strategy and custom brand color tokens in frontend/tailwind.config.js
- [X] T004 Replace frontend/src/index.css with Tailwind directives and CSS custom properties for light/dark themes
- [X] T005 Add FOUC prevention script to frontend/index.html in head section before other content

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme management infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create ThemeContext with theme state management in frontend/src/contexts/ThemeContext.tsx
- [X] T007 Create useTheme custom hook in frontend/src/hooks/useTheme.ts
- [X] T008 Wrap App component with ThemeProvider in frontend/src/App.tsx
- [X] T009 Verify Tailwind setup by running npm run dev and checking that classes apply correctly

**Checkpoint**: Theme infrastructure ready - component migration can now begin in parallel

---

## Phase 3: User Story 1 - Toggle Between Dark and Light Themes (Priority: P1) 🎯 MVP

**Goal**: Users can switch between dark and light themes from the Settings page, with system preference detection and localStorage persistence

**Independent Test**: Click the theme toggle button on Settings page and verify the entire UI switches themes. Close and reopen browser to verify theme persists.

### Implementation for User Story 1

- [X] T010 [US1] Add theme toggle control to Settings page in frontend/src/pages/Settings/Settings.tsx
- [X] T011 [US1] Implement three-state theme toggle UI (light/dark/system) with current selection indicator
- [X] T012 [US1] Connect theme toggle to useTheme hook for state management
- [X] T013 [US1] Add smooth transition classes to body element for theme switching
- [X] T014 [US1] Test theme persistence by switching themes and refreshing browser
- [X] T015 [US1] Test system preference detection by changing OS theme settings
- [X] T016 [US1] Test prefers-reduced-motion support by enabling OS setting

**Checkpoint**: At this point, User Story 1 should be fully functional - theme toggle works and persists across sessions

---

## Phase 4: User Story 2 - Consistent Visual Design Across All Pages (Priority: P2)

**Goal**: All pages have consistent colors, spacing, typography, and component styling that matches the current theme

**Independent Test**: Navigate through all 6 pages (Diary, Login, Register, Onboarding, Settings, Password Reset) and verify consistent visual styling

### Page Migrations for User Story 2

- [X] T017 [P] [US2] Migrate Login page from CSS to Tailwind in frontend/src/pages/Login/Login.tsx and delete frontend/src/pages/Login/Login.css
- [X] T018 [P] [US2] Migrate Register page from CSS to Tailwind in frontend/src/pages/Register/Register.tsx and delete frontend/src/pages/Register/Register.css
- [X] T019 [P] [US2] Migrate Onboarding page from CSS to Tailwind in frontend/src/pages/Onboarding/Onboarding.tsx and delete frontend/src/pages/Onboarding/Onboarding.css
- [X] T020 [P] [US2] Migrate PasswordReset page from CSS to Tailwind in frontend/src/pages/PasswordReset/PasswordReset.tsx and delete frontend/src/pages/PasswordReset/styles.css
- [X] T021 [P] [US2] Migrate Settings page from CSS to Tailwind in frontend/src/pages/Settings/Settings.tsx and delete frontend/src/pages/Settings/styles.css
- [X] T022 [P] [US2] Migrate Diary page from CSS to Tailwind in frontend/src/pages/Diary/Diary.tsx and delete frontend/src/pages/Diary/Diary.css

### Component Migrations for User Story 2

- [X] T023 [P] [US2] Migrate AddFoodModal component from CSS to Tailwind in frontend/src/components/AddFoodModal/AddFoodModal.tsx and delete frontend/src/components/AddFoodModal/AddFoodModal.css
- [X] T024 [P] [US2] Migrate CategoryEditor component from CSS to Tailwind in frontend/src/components/CategoryEditor/CategoryEditor.tsx and delete frontend/src/components/CategoryEditor/styles.css
- [X] T025 [P] [US2] Migrate CategoryManager component from CSS to Tailwind in frontend/src/components/CategoryManager/CategoryManager.tsx and delete frontend/src/components/CategoryManager/styles.css
- [X] T026 [P] [US2] Migrate CustomMealList component from CSS to Tailwind in frontend/src/components/CustomMealList/CustomMealList.tsx and delete frontend/src/components/CustomMealList/styles.css
- [X] T027 [P] [US2] Migrate DateNavigator component from CSS to Tailwind in frontend/src/components/DateNavigator/DateNavigator.tsx and delete frontend/src/components/DateNavigator/DateNavigator.css
- [X] T028 [P] [US2] Migrate DiaryEntry component from CSS to Tailwind in frontend/src/components/DiaryEntry/DiaryEntry.tsx and delete frontend/src/components/DiaryEntry/DiaryEntry.css
- [X] T029 [P] [US2] Migrate ErrorBoundary component from CSS to Tailwind in frontend/src/components/ErrorBoundary/ErrorBoundary.tsx and delete frontend/src/components/ErrorBoundary/styles.css
- [X] T030 [P] [US2] Migrate ErrorNotification component from CSS to Tailwind in frontend/src/components/ErrorNotification/ErrorNotification.tsx and delete frontend/src/components/ErrorNotification/styles.css
- [X] T031 [P] [US2] Migrate FoodSearch component from CSS to Tailwind in frontend/src/components/FoodSearch/FoodSearch.tsx and delete frontend/src/components/FoodSearch/FoodSearch.css
- [X] T032 [P] [US2] Migrate MacroDisplay component from CSS to Tailwind in frontend/src/components/MacroDisplay/MacroDisplay.tsx and delete frontend/src/components/MacroDisplay/MacroDisplay.css
- [X] T033 [P] [US2] Migrate MealBuilder component from CSS to Tailwind in frontend/src/components/MealBuilder/MealBuilder.tsx and delete frontend/src/components/MealBuilder/styles.css
- [X] T034 [P] [US2] Migrate MealCard component from CSS to Tailwind in frontend/src/components/MealCard/MealCard.tsx and delete frontend/src/components/MealCard/styles.css
- [X] T035 [P] [US2] Migrate MealCategory component from CSS to Tailwind in frontend/src/components/MealCategory/MealCategory.tsx and delete frontend/src/components/MealCategory/MealCategory.css

### Consistency Validation for User Story 2

- [X] T036 [US2] Audit all pages for consistent typography scale (H1: text-3xl font-bold, H2: text-2xl font-semibold, Body: text-base)
- [X] T037 [US2] Audit all buttons for consistent styling (px-4 py-2 rounded-lg transition-colors min-h-[44px])
- [X] T038 [US2] Audit all inputs for consistent styling (w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md)
- [X] T039 [US2] Audit all cards for consistent styling (bg-surface-secondary rounded-lg p-4 border border-border shadow-sm)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - consistent visual design across all pages with working theme toggle

---

## Phase 5: User Story 3 - Mobile-Friendly Experience (Priority: P2)

**Goal**: Application is fully usable on mobile devices with appropriate touch targets, scrollable tabs, and responsive layouts

**Independent Test**: Access application on mobile device (or mobile viewport) and complete core tasks: logging food, viewing macros, navigating pages

### Mobile Optimization for User Story 3

- [X] T040 [P] [US3] Add horizontal scroll to Settings page tabs on mobile viewports in frontend/src/pages/Settings/Settings.tsx
- [X] T041 [P] [US3] Update MacroDisplay to stack cards vertically on mobile viewports in frontend/src/components/MacroDisplay/MacroDisplay.tsx
- [X] T042 [P] [US3] Audit all buttons and interactive elements for minimum 44x44px touch targets across all components
- [X] T043 [P] [US3] Add responsive padding classes (p-2 sm:p-4 lg:p-6) to all pages for mobile spacing
- [X] T044 [P] [US3] Update modal components to use appropriate width on mobile (w-full sm:w-auto) in AddFoodModal and other modals
- [X] T045 [US3] Test application on mobile viewport (320px width) to verify all layouts work correctly
- [X] T046 [US3] Test application on tablet viewport (768px width) to verify responsive breakpoints
- [X] T047 [US3] Test application on desktop viewport (1920px width) to verify maximum width layouts

**Checkpoint**: All user stories should now work independently - mobile experience is optimized alongside consistent theming

---

## Phase 6: User Story 4 - Modern and Fresh Visual Appearance (Priority: P3)

**Goal**: Application has modern visual polish with rounded corners, subtle shadows, smooth transitions, and helpful empty/loading states

**Independent Test**: Visual inspection of cards, buttons, inputs, loading states, and empty states for modern design standards

### Visual Polish for User Story 4

- [X] T048 [P] [US4] Add rounded corners and shadow depth to all card components (rounded-lg shadow-sm)
- [X] T049 [P] [US4] Add smooth hover transitions to all buttons (hover:bg-primary-hover transition-colors duration-150)
- [X] T050 [P] [US4] Add focus states with ring to all inputs (focus:outline-none focus:ring-2 focus:ring-primary)
- [X] T051 [P] [US4] Add skeleton loading states to Diary page while fetching entries in frontend/src/pages/Diary/Diary.tsx
- [X] T052 [P] [US4] Add skeleton loading states to MacroDisplay while calculating totals in frontend/src/components/MacroDisplay/MacroDisplay.tsx
- [X] T053 [P] [US4] Add empty state message with CTA to Diary page when no entries exist in frontend/src/pages/Diary/Diary.tsx
- [X] T054 [P] [US4] Add empty state message with CTA to CustomMealList when no custom meals exist in frontend/src/components/CustomMealList/CustomMealList.tsx
- [X] T055 [US4] Ensure all transitions respect prefers-reduced-motion (motion-reduce:transition-none) across all components
- [X] T056 [US4] Visual audit of all pages for consistent rounded corners on cards, inputs, buttons, and modals

**Checkpoint**: All user stories complete - application has modern visual polish with full theme support and mobile optimization

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T057 [P] Run quickstart.md validation to verify setup steps work correctly
- [X] T058 [P] Create E2E test for theme toggle functionality in frontend/tests/e2e/theme.spec.ts using Playwright
- [X] T059 Performance audit to ensure theme transitions complete within 200ms (SC-005)
- [X] T060 Accessibility audit to ensure all interactive elements meet 44x44px touch target requirement (SC-003)
- [X] T061 Visual consistency audit to ensure no theme mismatches when navigating between pages (SC-002)
- [X] T062 Viewport compatibility audit from 320px to 1920px width (SC-004)
- [X] T063 Code cleanup to remove any unused Tailwind classes or commented CSS
- [X] T064 Documentation update in CLAUDE.md to reflect Tailwind CSS migration completion

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (Theme Toggle) can proceed after Phase 2
  - User Story 2 (Consistent Design) should start after US1 is complete to ensure theme works first
  - User Story 3 (Mobile) can start after US2 has migrated components
  - User Story 4 (Visual Polish) can start after US2 has migrated components
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Should start after US1 complete to ensure theme toggle works before migrating all components
- **User Story 3 (P2)**: Can start after US2 migrates components - applies mobile optimizations to Tailwind classes
- **User Story 4 (P3)**: Can start after US2 migrates components - applies visual polish to Tailwind classes

### Within Each User Story

- **User Story 1**: Tasks must run sequentially to build theme toggle functionality
- **User Story 2**: All page migrations (T017-T022) can run in parallel, all component migrations (T023-T035) can run in parallel
- **User Story 3**: Mobile optimization tasks (T040-T044) can run in parallel
- **User Story 4**: Visual polish tasks (T048-T054) can run in parallel

### Parallel Opportunities

- **Setup Phase**: All tasks can run sequentially (each builds on previous)
- **Foundational Phase**: Tasks can run sequentially (each builds on previous)
- **User Story 2**:
  - All 6 page migrations can run in parallel (T017-T022)
  - All 13 component migrations can run in parallel (T023-T035)
  - Consistency audits run sequentially after migrations (T036-T039)
- **User Story 3**: Mobile optimization tasks can run in parallel (T040-T044)
- **User Story 4**: Visual polish tasks can run in parallel (T048-T054)

---

## Parallel Example: User Story 2 (Consistent Design)

```bash
# Launch all page migrations together:
Task: "Migrate Login page from CSS to Tailwind"
Task: "Migrate Register page from CSS to Tailwind"
Task: "Migrate Onboarding page from CSS to Tailwind"
Task: "Migrate PasswordReset page from CSS to Tailwind"
Task: "Migrate Settings page from CSS to Tailwind"
Task: "Migrate Diary page from CSS to Tailwind"

# Launch all component migrations together:
Task: "Migrate AddFoodModal component from CSS to Tailwind"
Task: "Migrate CategoryEditor component from CSS to Tailwind"
Task: "Migrate CategoryManager component from CSS to Tailwind"
Task: "Migrate CustomMealList component from CSS to Tailwind"
Task: "Migrate DateNavigator component from CSS to Tailwind"
Task: "Migrate DiaryEntry component from CSS to Tailwind"
Task: "Migrate ErrorBoundary component from CSS to Tailwind"
Task: "Migrate ErrorNotification component from CSS to Tailwind"
Task: "Migrate FoodSearch component from CSS to Tailwind"
Task: "Migrate MacroDisplay component from CSS to Tailwind"
Task: "Migrate MealBuilder component from CSS to Tailwind"
Task: "Migrate MealCard component from CSS to Tailwind"
Task: "Migrate MealCategory component from CSS to Tailwind"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Theme Toggle)
4. **STOP and VALIDATE**: Test theme toggle independently - switch themes, refresh browser, change OS settings
5. Demo/validate before proceeding

### Incremental Delivery

1. Complete Setup + Foundational → Theme infrastructure ready
2. Add User Story 1 → Test theme toggle → Demo (MVP!)
3. Add User Story 2 → Test consistent design across all pages → Demo
4. Add User Story 3 → Test mobile experience → Demo
5. Add User Story 4 → Test visual polish → Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done and US1 is complete:
   - Developer A: User Story 2 (pages T017-T022)
   - Developer B: User Story 2 (components T023-T029)
   - Developer C: User Story 2 (components T030-T035)
3. After US2 components are migrated:
   - Developer A: User Story 3 (mobile optimization)
   - Developer B: User Story 4 (visual polish)
4. Stories integrate and validate independently

---

## Summary

- **Total Tasks**: 64
- **User Story 1 (P1) - Theme Toggle**: 7 tasks
- **User Story 2 (P2) - Consistent Design**: 23 tasks (6 pages + 13 components + 4 audits)
- **User Story 3 (P2) - Mobile Experience**: 8 tasks
- **User Story 4 (P3) - Visual Polish**: 9 tasks
- **Setup & Foundational**: 9 tasks
- **Polish Phase**: 8 tasks
- **Parallel Opportunities**: 25+ tasks can run in parallel within User Stories 2, 3, and 4

---

## Notes

- [P] tasks = different files, no dependencies within that user story
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable
- Full CSS replacement approach - all 20 CSS files will be deleted (TC-001)
- Frontend-only changes - no backend modifications (TC-002)
- Utility-only approach - no component libraries (TC-003)
- Theme toggle only in Settings page per clarification
- Custom brand colors defined in Tailwind config per clarification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
