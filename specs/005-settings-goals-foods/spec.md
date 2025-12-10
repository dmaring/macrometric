# Feature Specification: Settings - Goals and Custom Foods

**Feature Branch**: `005-settings-goals-foods`
**Created**: 2025-12-09
**Status**: Draft
**Input**: "Implement Goals and Custom Foods settings pages"

## User Scenarios & Testing

### User Story 1 - Daily Goals Management (Priority: P1)

A user wants to view and edit their daily nutritional goals (calories, protein, carbs, fat) from the Settings page. They navigate to Settings, click the "Goals" tab, and see either their current goals or a prompt to set goals for the first time. They can enter or modify values and save changes, which then reflect on their diary page progress tracking.

**Why this priority**: Goals are fundamental to the app's value proposition. Without a working goals editor, users can't set or modify their targets, making progress tracking impossible. This is blocking functionality that was supposed to be completed in Phase 4 (US6).

**Independent Test**: Can be fully tested by navigating to Settings > Goals, entering/modifying goal values, saving, and verifying the diary page shows updated progress bars. Delivers immediate value by enabling goal management.

**Acceptance Scenarios**:

1. **Given** a user navigates to Settings, **When** they click the "Goals" tab, **Then** they see their current daily goals or a prompt to set goals if none exist
2. **Given** a user has no goals set, **When** they view the Goals tab, **Then** they see a clear call-to-action to set their first goals with helpful guidance (e.g., "Set your daily targets to track progress")
3. **Given** a user is viewing the Goals tab, **When** they enter or modify values for calories, protein, carbs, and fat, **Then** they can save the changes via a "Save Goals" button
4. **Given** a user enters invalid data (negative numbers, non-numeric values), **When** they try to save, **Then** they see clear error messages and the form prevents submission
5. **Given** a user saves new goals, **When** they return to the diary page, **Then** the progress bars reflect the updated targets (e.g., "1200 / 2000 cal")
6. **Given** a user has existing goals, **When** they view the Goals tab, **Then** the form is pre-populated with current values
7. **Given** a user is editing goals, **When** they click cancel or navigate away, **Then** unsaved changes are discarded and original values remain

---

### User Story 2 - Custom Foods Management (Priority: P2)

A user wants to view, create, edit, and delete their custom foods from the Settings page. They navigate to Settings, click the "Custom Foods" tab, and see a list of all their custom foods with nutritional information. They can create new custom foods, edit existing ones, or delete foods they no longer need.

**Why this priority**: Custom foods management completes the user story that was partially implemented in Phase 6 (US3). The backend API exists and custom foods can be created/searched, but there's no UI to manage them in Settings. This is important for user control but lower priority than goals since users can still create custom foods via the diary search flow.

**Independent Test**: Can be fully tested by navigating to Settings > Custom Foods, creating a new food, editing it, deleting it, and verifying the changes persist in search results. Delivers value by giving users control over their custom food library.

**Acceptance Scenarios**:

1. **Given** a user navigates to Settings, **When** they click the "Custom Foods" tab, **Then** they see a list of all their custom foods with name, serving size, and key nutritional info (calories, protein, carbs, fat)
2. **Given** a user has no custom foods, **When** they view the Custom Foods tab, **Then** they see an empty state message (e.g., "No custom foods yet. Create one to get started") with a "Create New Food" button
3. **Given** a user is viewing the Custom Foods tab, **When** they click "Create New Food", **Then** a form appears allowing them to enter food name, serving size, serving unit, calories, protein, carbs, and fat
4. **Given** a user fills out the custom food form, **When** they save, **Then** the food is added to their list and appears in search results immediately
5. **Given** a user is viewing a custom food in the list, **When** they click an edit button, **Then** the form opens pre-populated with the food's current values
6. **Given** a user modifies a custom food, **When** they save changes, **Then** the updated food appears in the list and search results with new values
7. **Given** a user clicks delete on a custom food, **When** they confirm the deletion, **Then** the food is removed from their profile and no longer appears in search results
8. **Given** a user clicks delete on a custom food, **When** the deletion dialog appears, **Then** they see a confirmation message warning that this action cannot be undone
9. **Given** a user enters invalid data (empty name, negative nutritional values), **When** they try to save, **Then** they see clear error messages and the form prevents submission
10. **Given** a user is creating/editing a custom food, **When** they click cancel, **Then** the form closes and no changes are saved

---

### Edge Cases

- What happens when a user has hundreds of custom foods? Implement pagination or infinite scroll in the list view to handle large datasets efficiently.
- How does the system handle when goals API request fails? Show cached goals if available, or display an error message with retry option.
- What happens when a user deletes a custom food that's in their diary history? The diary entries retain the food's nutritional data snapshot (already implemented) and show a "(deleted)" indicator.
- How are decimal values handled in goals and nutritional data? Support up to 2 decimal places for all numeric inputs (e.g., 2500.50 calories, 1.5 servings).
- What happens if a user sets a goal to zero? Allow zero values (some users may not track certain macros) but show a warning if all goals are zero.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a Goals tab in the Settings page that displays current goals or a first-time setup prompt
- **FR-002**: System MUST allow users to view their current daily goals for calories, protein, carbohydrates, and fat
- **FR-003**: System MUST allow users to edit and save their daily goals with numeric input fields
- **FR-004**: System MUST validate goal inputs (numeric values, non-negative) and display clear error messages for invalid data
- **FR-005**: System MUST update the diary page progress tracking immediately after goals are saved
- **FR-006**: System MUST provide a Custom Foods tab in the Settings page that displays a list of all user's custom foods
- **FR-007**: System MUST display each custom food with its name, serving size, serving unit, calories, protein, carbohydrates, and fat
- **FR-008**: System MUST provide a "Create New Food" button that opens a form for entering custom food details
- **FR-009**: System MUST allow users to edit existing custom foods via an edit button on each food item
- **FR-010**: System MUST allow users to delete custom foods with a confirmation dialog
- **FR-011**: System MUST validate custom food inputs (name required, numeric nutritional values, non-negative numbers)
- **FR-012**: System MUST update search results immediately when custom foods are created, edited, or deleted
- **FR-013**: System MUST provide cancel functionality for all forms that discards unsaved changes
- **FR-014**: System MUST display appropriate empty states when users have no goals set or no custom foods
- **FR-015**: System MUST handle API failures gracefully with user-friendly error messages and retry options

### Key Entities

- **DailyGoal**: User's daily nutritional targets. Contains calories (number), protein (grams), carbohydrates (grams), fat (grams). Linked to user account.
- **CustomFood**: User-created food item. Contains name (string), serving_size (number), serving_unit (string), calories (number), protein (grams), carbohydrates (grams), fat (grams). Linked to user account and appears in food search results.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can set or modify their daily goals in under 30 seconds from Settings page
- **SC-002**: Users can create a new custom food in under 1 minute
- **SC-003**: Changes to goals are reflected on the diary page within 1 second of saving
- **SC-004**: Custom food changes (create/edit/delete) appear in search results within 1 second
- **SC-005**: 95% of users can find and modify their goals without external help
- **SC-006**: Form validation prevents 100% of invalid data submissions (negative values, non-numeric input)
- **SC-007**: All forms provide clear, actionable error messages that users can understand and act on

## Assumptions

- Backend API endpoints for goals and custom foods already exist (GET/PUT /goals, GET/POST/PUT/DELETE /custom-foods)
- The Settings page structure with tabs is already implemented (Goals and Custom Foods tabs exist but show placeholder text)
- Authentication is handled by existing useAuth hook
- The MacroDisplay component on the diary page already supports showing progress toward goals when goals are set
- Custom foods already appear in food search results (backend integration exists)
- All numerical inputs support up to 2 decimal places
- Goals can be zero (users may not track certain macros)
- Custom foods include an optional "brand" field in the API but this is not critical for MVP
