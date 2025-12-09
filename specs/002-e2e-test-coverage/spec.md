# Feature Specification: Comprehensive E2E Test Coverage

**Feature Branch**: `002-e2e-test-coverage`
**Created**: 2025-12-08
**Status**: Draft
**Input**: Comprehensive end-to-end test suite covering all implemented user stories including goal setting, food search, custom foods/meals, category management, password reset, and account deletion workflows

## User Scenarios & Testing

### User Story 1 - Onboarding and Goal Setting E2E Tests (Priority: P1)

Quality assurance needs comprehensive end-to-end testing of the user onboarding journey and goal-setting workflow. This includes new user registration, the optional goal-setting prompt, skipping onboarding, setting goals later via settings, and verifying goal progress displays correctly in the diary view.

**Why this priority**: Onboarding is the first user experience and sets up critical features like goals. Without thorough E2E testing, regression bugs could block new users from accessing the app or setting up their tracking goals.

**Independent Test**: Can be fully tested by creating test users, completing onboarding flows (both with and without goals), and verifying diary displays goal progress correctly. Delivers value by ensuring the critical first-run experience works reliably.

**Acceptance Scenarios**:

1. **Given** a new user registers, **When** they complete authentication, **Then** they are redirected to onboarding with goal-setting prompt
2. **Given** a user is on the onboarding screen, **When** they enter calorie and macro goals and submit, **Then** they proceed to diary with goals saved
3. **Given** a user is on the onboarding screen, **When** they click "Skip for Now", **Then** they proceed to diary without goals set
4. **Given** a user skipped onboarding goals, **When** they navigate to Settings and set goals, **Then** goals are saved and diary shows progress bars
5. **Given** a user has set goals, **When** they view the diary, **Then** progress toward each goal is displayed (e.g., "1200 / 2000 cal")
6. **Given** a user has goals set, **When** they log out and log back in, **Then** their goals persist and progress displays correctly

---

### User Story 2 - Food Search and Add Workflow E2E Tests (Priority: P1)

Quality assurance needs end-to-end testing of the food search workflow including searching external API, viewing results, adjusting serving sizes, adding foods to meals, and handling search errors gracefully.

**Why this priority**: Food search is the primary mechanism for adding foods (core feature). E2E tests ensure the integration between frontend search UI, backend API, and external USDA API works reliably.

**Independent Test**: Can be tested by performing various food searches, adjusting servings, adding to diary, and verifying entries appear with correct nutrition data. Delivers value by preventing search/add workflow regressions.

**Acceptance Scenarios**:

1. **Given** a user is on the diary page, **When** they click "Add Food" and search for "apple", **Then** USDA food results appear with nutrition information
2. **Given** search results are displayed, **When** a user adjusts the serving size to 2.0, **Then** nutrition values recalculate in real-time
3. **Given** a user has selected a food and serving, **When** they click "Add to Breakfast", **Then** the food appears in the Breakfast category with correct macros
4. **Given** the external API is unavailable, **When** a user searches for food, **Then** an error message appears and custom foods are still accessible
5. **Given** a user searches with no results, **When** the API returns empty, **Then** a "No results found" message displays with option to create custom food
6. **Given** a user has added foods via search, **When** they reload the page, **Then** all diary entries persist correctly

---

### User Story 3 - Custom Food Creation and Usage E2E Tests (Priority: P2)

Quality assurance needs end-to-end testing of creating custom foods, saving them to the user profile, finding them in search results (with custom indicator), editing custom foods, and adding them to diary entries.

**Why this priority**: Custom foods enable personalized tracking for homemade recipes and local foods not in databases. E2E tests ensure the full create-search-add cycle works without data loss.

**Independent Test**: Can be tested by creating a custom food, verifying it appears in search, editing it, adding to diary, and confirming persistence across sessions. Delivers value by preventing custom food data corruption.

**Acceptance Scenarios**:

1. **Given** a user is in Settings, **When** they create a custom food "Homemade Smoothie" with nutrition data and save, **Then** it appears in their custom foods list
2. **Given** a user has saved a custom food, **When** they search for it on the diary page, **Then** it appears in results with a "Custom" indicator
3. **Given** a user finds their custom food in search, **When** they add it to a meal, **Then** it logs to the diary with the entered nutrition values
4. **Given** a user has custom foods, **When** they edit one in Settings, **Then** the changes persist and future searches show updated values
5. **Given** a user deletes a custom food, **When** they search for it, **Then** it no longer appears in results (soft delete)
6. **Given** a user has logged a custom food to diary, **When** they delete that custom food, **Then** the diary entry retains the nutrition data with a "(deleted)" indicator

---

### User Story 4 - Custom Meal Creation and Addition E2E Tests (Priority: P2)

Quality assurance needs end-to-end testing of building custom meals from multiple foods, saving them with preset quantities, viewing meal totals, adding entire meals to the diary, editing meals, and handling deleted foods within meals.

**Why this priority**: Custom meals streamline logging for users with routine eating patterns. E2E tests ensure complex multi-food meals are created correctly and all components log properly when added to diary.

**Independent Test**: Can be tested by creating a meal with 3+ foods, saving it, adding the meal to diary, and verifying all food items appear with correct totals. Delivers value by preventing meal data integrity issues.

**Acceptance Scenarios**:

1. **Given** a user is in Settings custom meals section, **When** they create "Breakfast Combo" with 3 foods and specific quantities, **Then** the meal saves with calculated macro totals
2. **Given** a user has saved meals, **When** they browse the meals list, **Then** each meal shows its total calories, protein, carbs, and fat
3. **Given** a user selects a saved meal, **When** they click "Add to Diary" for Lunch category, **Then** all component foods appear as individual entries in Lunch
4. **Given** a user has created a meal, **When** they edit it (add/remove foods or change quantities), **Then** changes persist and totals recalculate correctly
5. **Given** a user deletes a meal, **When** they browse meals, **Then** the deleted meal no longer appears in the list
6. **Given** a meal contains a food that gets deleted later, **When** the meal is viewed, **Then** the deleted food shows with a "(deleted)" indicator but retains its nutrition data

---

### User Story 5 - Meal Category Management E2E Tests (Priority: P3)

Quality assurance needs end-to-end testing of renaming categories, adding new categories, reordering categories, deleting empty categories, and handling category deletion when entries exist (migration prompt).

**Why this priority**: Category customization improves UX for non-standard eating schedules. E2E tests ensure category operations persist correctly and entry migration during deletion works without data loss.

**Independent Test**: Can be tested by performing all category operations (rename, add, reorder, delete) and verifying diary view updates immediately. Delivers value by preventing category configuration bugs.

**Acceptance Scenarios**:

1. **Given** a user is in Settings categories section, **When** they rename "Lunch" to "Brunch", **Then** the diary page immediately shows "Brunch" category
2. **Given** a user wants a new category, **When** they create "Snacks" and set its display order, **Then** it appears on the diary in the correct position
3. **Given** a user has multiple categories, **When** they reorder them (e.g., drag Dinner above Lunch), **Then** the diary reflects the new order
4. **Given** a user deletes an empty category, **When** they confirm deletion, **Then** the category disappears from diary and Settings
5. **Given** a user tries to delete a category with entries, **When** the system prompts to migrate entries, **Then** they can select a target category and all entries move successfully
6. **Given** a user has customized categories, **When** they log out and log back in, **Then** all category customizations persist

---

### User Story 6 - Diary Entry Management E2E Tests (Priority: P2)

Quality assurance needs end-to-end testing of editing diary entries (changing quantity or food), deleting individual entries, verifying macro totals update immediately, and ensuring entries persist across date navigation and sessions.

**Why this priority**: Users need to correct mistakes in their food logs. E2E tests ensure edit/delete operations work correctly and totals recalculate without requiring page refresh.

**Independent Test**: Can be tested by logging foods, editing quantities, deleting entries, and verifying totals update in real-time. Delivers value by preventing data integrity issues in daily logs.

**Acceptance Scenarios**:

1. **Given** a user has logged a food, **When** they edit the quantity from 1.0 to 2.5 servings, **Then** the entry updates and macro totals recalculate immediately
2. **Given** a user has logged multiple foods, **When** they delete one entry, **Then** it disappears and totals decrease accordingly
3. **Given** a user edits an entry, **When** they navigate to another date and back, **Then** the edited values persist
4. **Given** a user has entries on multiple days, **When** they navigate between dates, **Then** each day shows its correct independent totals
5. **Given** a user logs foods and closes the browser, **When** they return hours later, **Then** all diary entries are still present

---

### User Story 7 - Cross-Day Logging and History E2E Tests (Priority: P3)

Quality assurance needs end-to-end testing of logging foods across multiple days, viewing history for the past 7 days, verifying each day maintains independent totals, and confirming date navigation preserves data integrity.

**Why this priority**: Users track food over time, not just a single day. E2E tests ensure multi-day data is isolated correctly and historical viewing works reliably.

**Independent Test**: Can be tested by logging foods on different dates, navigating through date history, and verifying totals remain independent per day. Delivers value by preventing cross-day data contamination.

**Acceptance Scenarios**:

1. **Given** a user logs foods today, **When** they navigate to yesterday and log foods there, **Then** each day shows its own independent totals
2. **Given** a user has logged foods on multiple days, **When** they navigate through date history, **Then** all past entries display correctly for each respective day
3. **Given** a user views a past day's diary, **When** they add a new food to that historical date, **Then** it logs correctly to that specific date
4. **Given** a user has 7+ days of history, **When** they navigate back through the dates, **Then** all historical data persists without loss

---

### User Story 8 - Password Reset Workflow E2E Tests (Priority: P3)

Quality assurance needs end-to-end testing of requesting a password reset, receiving reset email (simulated in tests), using valid token to reset password, handling invalid/expired tokens, and logging in with the new password.

**Why this priority**: Password reset is a critical security and account recovery feature. E2E tests ensure the full reset flow works including token validation and password update.

**Independent Test**: Can be tested by triggering password reset, validating token-based reset form, updating password, and confirming login with new credentials. Delivers value by preventing account lockout scenarios.

**Acceptance Scenarios**:

1. **Given** a user has forgotten their password, **When** they request a reset via email, **Then** a password reset link is generated (confirmed via test inspection)
2. **Given** a user clicks a valid reset link, **When** they enter a new password meeting requirements, **Then** their password is updated and they can log in
3. **Given** a user attempts to use an invalid token, **When** they submit the reset form, **Then** an error message displays indicating invalid/expired token
4. **Given** a user successfully resets their password, **When** they log in with the new password, **Then** they access their account with all data intact
5. **Given** a user enters a weak password during reset, **When** they submit, **Then** validation errors display (minimum length, complexity requirements)

---

### User Story 9 - Account Deletion E2E Tests (Priority: P3)

Quality assurance needs end-to-end testing of account deletion flow including confirmation dialog, cascade deletion of all user data (diary entries, custom foods, meals, goals, categories), logout after deletion, and inability to log in with deleted credentials.

**Why this priority**: Account deletion is required for GDPR compliance and user privacy. E2E tests ensure complete data removal and prevent orphaned data or failed deletions.

**Independent Test**: Can be tested by creating user data (diary, custom foods, meals), initiating deletion, confirming all data is removed, and verifying login fails. Delivers value by ensuring privacy compliance.

**Acceptance Scenarios**:

1. **Given** a user is in Settings account section, **When** they click "Delete Account", **Then** a confirmation dialog appears warning of permanent data loss
2. **Given** a user confirms account deletion, **When** the operation completes, **Then** they are logged out and redirected to login page
3. **Given** a user has deleted their account, **When** they attempt to log in with old credentials, **Then** login fails with "Invalid credentials" error
4. **Given** a deleted user account, **When** backend is inspected, **Then** all associated data (diary, custom foods, meals, goals, categories) is permanently removed

---

### User Story 10 - Offline and Error Resilience E2E Tests (Priority: P4)

Quality assurance needs end-to-end testing of app behavior when the external food API is unavailable, network connection is lost, and app recovery when connection is restored. Tests should verify cached foods remain accessible and custom food creation works offline.

**Why this priority**: Users may access the app in low-connectivity environments. E2E tests ensure graceful degradation and prevent app failure when external dependencies are unavailable.

**Independent Test**: Can be tested by simulating network failures, verifying custom food creation continues working, and confirming app recovery when network returns. Delivers value by ensuring reliability in poor connectivity scenarios.

**Acceptance Scenarios**:

1. **Given** the external food API is down, **When** a user searches for food, **Then** an error notification appears stating "Food database temporarily unavailable"
2. **Given** the API is unavailable, **When** a user accesses custom foods or previously cached foods, **Then** they remain fully functional for logging
3. **Given** a user is offline, **When** they create a custom food, **Then** it saves successfully and appears in their custom foods list
4. **Given** the app encounters an API error, **When** the user dismisses the error notification, **Then** the app remains usable with degraded search functionality
5. **Given** the network was unavailable, **When** connection is restored, **Then** food search resumes normal operation automatically

---

### Edge Cases

- What happens when a user tries to set negative calorie goals? System should validate and reject negative values during goal setting.
- How does the system handle duplicate diary entries for the same food? Each entry is tracked independently with separate quantities.
- What happens when a user creates more than 10 custom meal categories? System should enforce the maximum limit and display a validation error.
- How are serving size conversions validated? System should accept decimal values with precision to two places and common units (g, oz, cups, servings).
- What happens when a user tries to delete a category without migrating entries? System must require entry migration or explicit confirmation to delete entries.
- How does the system handle empty food names in custom food creation? Validation should reject empty names with clear error message.
- What happens when a user logs foods for a date more than 1 year in the future? System should allow within 1 year, reject beyond that with validation error.
- How does the app handle token expiration during an active session? Access tokens refresh automatically; if refresh fails, user is redirected to login.

## Requirements

### Functional Requirements

- **FR-001**: Test suite MUST verify complete user onboarding flow including registration, goal-setting prompt, skip option, and goal persistence
- **FR-002**: Test suite MUST verify food search integration with external API including result display, serving size adjustment, and add-to-meal functionality
- **FR-003**: Test suite MUST verify custom food creation including save-to-profile, search appearance with custom indicator, edit capability, and soft deletion
- **FR-004**: Test suite MUST verify custom meal creation including multi-food assembly, macro total calculation, add-to-diary functionality, and deleted-food handling
- **FR-005**: Test suite MUST verify meal category management including rename, add, reorder, delete (with entry migration), and persistence
- **FR-006**: Test suite MUST verify diary entry management including edit (quantity/food changes), delete, macro total recalculation, and persistence across sessions
- **FR-007**: Test suite MUST verify cross-day logging including independent daily totals, date navigation, historical viewing, and data isolation
- **FR-008**: Test suite MUST verify password reset flow including request, token validation, password update, weak password rejection, and login with new credentials
- **FR-009**: Test suite MUST verify account deletion including confirmation, cascade deletion of all user data, logout, and login prevention
- **FR-010**: Test suite MUST verify offline resilience including API unavailability handling, cached food accessibility, custom food creation offline, and error notification display
- **FR-011**: Test suite MUST verify goal progress display in diary view when goals are set, showing current vs target for calories, protein, carbs, and fat
- **FR-012**: Test suite MUST verify form validation across all features including empty fields, weak passwords, negative values, and maximum limits
- **FR-013**: Test suite MUST verify data persistence across logout/login cycles for all user data (diary, goals, custom foods, meals, categories)
- **FR-014**: Test suite MUST verify real-time UI updates including macro totals recalculation without page refresh
- **FR-015**: Test suite MUST verify error state handling including API failures, network errors, invalid tokens, and validation errors with user-friendly messages

### Key Entities

- **Test User**: Represents a test account with unique email, password, and test data isolation to prevent test interference
- **Test Diary Entry**: A food log created during test execution, including food reference, quantity, category, and date
- **Test Custom Food**: A user-created food item with test-specific nutrition data used to verify custom food workflows
- **Test Custom Meal**: A multi-food meal created during test execution to verify meal assembly and addition workflows
- **Test Session**: An authenticated browser session maintained across test scenarios within a single test case

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of critical user journeys (P1) have automated E2E test coverage with passing tests
- **SC-002**: 90% of high-priority features (P2) have automated E2E test coverage with passing tests
- **SC-003**: E2E test suite executes in under 10 minutes for full regression testing
- **SC-004**: 95% of E2E tests pass consistently (flaky test rate under 5%)
- **SC-005**: All E2E tests include clear failure messages identifying the specific workflow step that failed
- **SC-006**: Test suite catches at least 90% of regression bugs before production deployment
- **SC-007**: E2E tests verify data persistence across browser sessions for all critical features (diary, goals, custom foods, meals)
- **SC-008**: All form validation scenarios have E2E test coverage including empty fields, invalid data, and boundary conditions
- **SC-009**: All error states (API failures, network errors, validation errors) have E2E test coverage with expected user-facing messages verified
- **SC-010**: Test suite can be executed in CI/CD pipeline with parallel test execution for faster feedback

## Assumptions

- **Test Framework**: Playwright will continue to be used as the E2E testing framework (already configured per tasks.md)
- **Test Data**: Each test will use unique test accounts with cleanup to prevent data contamination between test runs
- **External API Mocking**: Tests requiring external API failure scenarios will use network interception to simulate API unavailability
- **Test Environment**: Tests will run against a test database instance that is reset between test suite executions
- **Token Simulation**: Password reset token validation will be tested using token extraction from test database or email mock rather than real email delivery
- **Execution Time**: Individual tests should complete in under 30 seconds; full suite under 10 minutes assumes parallel execution across multiple workers
- **Browser Coverage**: Tests will target modern browsers (Chrome, Firefox, Safari equivalent) with Chromium as primary target
- **Authentication State**: Tests will reuse authenticated sessions within test suites where possible to reduce test execution time
