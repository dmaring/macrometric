# Feature Specification: Macro Calorie Tracker

**Feature Branch**: `001-macro-calorie-tracker`
**Created**: 2025-12-06
**Status**: Draft
**Input**: "Modern macro nutrient and calorie counter for quick daily food tracking with customizable meals and goals"

## User Scenarios & Testing

### User Story 1 - Daily Food Logging (Priority: P1)

A user wants to log the foods they eat throughout the day to track their calorie and macro nutrient intake. They open the app and see their daily diary page organized by meal categories (Breakfast, Lunch, Dinner by default). They can quickly add foods to each meal and see their running totals for the day.

**Why this priority**: This is the core value proposition - without daily food logging, the app has no purpose. Users need to be able to record what they eat before any other features matter.

**Independent Test**: Can be fully tested by adding foods to meal categories and verifying totals display correctly. Delivers immediate value as a basic food diary.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** they view the daily diary page, **Then** they see the current day with Breakfast, Lunch, and Dinner meal categories displayed
2. **Given** a user is on the daily diary page, **When** they add a food item to Breakfast, **Then** the food appears under Breakfast with its calories and macros shown
3. **Given** a user has logged multiple foods, **When** they view the daily summary, **Then** they see total calories, protein, carbohydrates, and fat for the day
4. **Given** a user wants to see a different day, **When** they navigate to another date, **Then** they see that day's diary entries

---

### User Story 2 - Food Search and Add (Priority: P2)

A user wants to quickly find and add foods to their diary without leaving the daily diary page. They search for a food item, see nutritional information, adjust the serving size if needed, and add it to their selected meal.

**Why this priority**: Search enables quick entry which is essential for user adoption. Without easy food lookup, users must manually enter everything, which is time-consuming.

**Independent Test**: Can be tested by searching for a food, viewing results, and adding to a meal. Delivers value by reducing data entry friction.

**Acceptance Scenarios**:

1. **Given** a user is on the daily diary page, **When** they initiate a food search, **Then** a search interface appears without navigating away from the diary
2. **Given** a user types a food name, **When** results appear, **Then** each result shows the food name and key nutritional info (calories, protein, carbs, fat)
3. **Given** a user selects a search result, **When** they view the food details, **Then** they can adjust serving size via numeric input field and see updated nutritional values recalculated in real-time
4. **Given** a user has selected a food and serving size, **When** they confirm the addition, **Then** the food is added to their selected meal category

---

### User Story 3 - Custom Food Creation (Priority: P3)

A user wants to create a custom food item that isn't available in the search results. They enter the food name, serving size, and nutritional information, then save it to their profile for future use.

**Why this priority**: Custom foods let users track homemade recipes and local foods not in databases. Important for accuracy but not required for basic tracking.

**Independent Test**: Can be tested by creating a custom food, saving it, and verifying it appears in future searches. Delivers value for users with unique dietary needs.

**Acceptance Scenarios**:

1. **Given** a user wants to create a custom food, **When** they access the custom food form, **Then** they can enter name, serving size, calories, protein, carbohydrates, and fat
2. **Given** a user has entered custom food details, **When** they save the food, **Then** it is stored in their profile
3. **Given** a user has saved custom foods, **When** they search for foods, **Then** their custom foods appear in search results
4. **Given** a user views their profile, **When** they access saved foods, **Then** they can edit or delete their custom foods
5. **Given** a user navigates to Settings, **When** they click the "Custom Foods" tab, **Then** they see a list of all their custom foods with nutritional information
6. **Given** a user is viewing the Custom Foods tab, **When** they click "Create New Food", **Then** a form appears allowing them to enter food details
7. **Given** a user is viewing a custom food in the list, **When** they click edit, **Then** they can modify the food's details and save changes
8. **Given** a user clicks delete on a custom food, **When** they confirm the deletion, **Then** the food is removed from their profile and search results

---

### User Story 4 - Custom Meal Creation (Priority: P4)

A user wants to save a combination of foods as a reusable meal. They select multiple foods from their saved items, name the meal, and save it. Later they can add the entire meal to their diary with one action.

**Why this priority**: Meal presets speed up logging for users with routine eating patterns. Valuable but builds on top of custom foods functionality.

**Independent Test**: Can be tested by creating a meal from multiple foods, saving it, and adding the meal to a diary entry. Delivers value for repeat meal logging.

**Acceptance Scenarios**:

1. **Given** a user wants to create a custom meal, **When** they access the meal creation form, **Then** they can add multiple food items and set quantities for each
2. **Given** a user has assembled foods into a meal, **When** they save the meal with a name, **Then** it is stored in their profile
3. **Given** a user has saved meals, **When** they search or browse meals, **Then** they can see each meal's total nutritional information
4. **Given** a user selects a saved meal, **When** they add it to their diary, **Then** all component foods are added to the selected meal category

---

### User Story 5 - Meal Category Management (Priority: P5)

A user wants to customize their meal categories to match their eating habits. They can rename the default categories, add new ones (like "Snacks" or "Pre-workout"), reorder them, or remove categories they don't use.

**Why this priority**: Customization improves user experience but the default categories work for most users. Lower priority as it doesn't affect core tracking.

**Independent Test**: Can be tested by modifying meal categories and verifying changes persist on the diary page. Delivers value for users with non-standard meal schedules.

**Acceptance Scenarios**:

1. **Given** a user wants to modify meal categories, **When** they access category settings, **Then** they see the current categories with edit options
2. **Given** a user renames a category, **When** they save the change, **Then** the new name appears on their daily diary
3. **Given** a user creates a new category, **When** they save it, **Then** it appears on their daily diary in the specified position
4. **Given** a user deletes a category, **When** the category has no entries, **Then** it is removed from the diary view
5. **Given** a user tries to delete a category, **When** the category has existing entries, **Then** they are prompted to move entries to another category first

---

### User Story 6 - Goal Setting (Priority: P2)

A user wants to set daily targets for calories and macronutrients to track their progress. During onboarding after account creation, they are prompted to set goals but can skip. They can access goal settings anytime from their profile to set or modify targets for calories, protein, carbohydrates, and fat.

**Why this priority**: Goals give meaning to the daily totals - without targets, users can't measure progress. Critical for the app's core value proposition alongside food logging.

**Independent Test**: Can be tested by setting goals and verifying the daily diary shows progress toward targets. Delivers value by enabling progress tracking.

**Acceptance Scenarios**:

1. **Given** a new user completes registration, **When** they proceed to the app, **Then** they are prompted to set daily goals for calories, protein, carbs, and fat
2. **Given** a user is on the goal-setting prompt, **When** they choose to skip, **Then** they proceed to the diary without goals (totals shown without targets)
3. **Given** a user has set goals, **When** they view the daily diary, **Then** they see their progress toward each goal (e.g., "1200 / 2000 cal")
4. **Given** a user wants to change goals, **When** they access settings, **Then** they can edit their daily targets
5. **Given** a user navigates to Settings, **When** they click the "Goals" tab, **Then** they see their current daily goals or a prompt to set goals if none exist
6. **Given** a user is viewing the Goals tab, **When** they enter or modify values for calories, protein, carbs, and fat, **Then** they can save the changes
7. **Given** a user saves new goals, **When** they return to the diary page, **Then** the progress bars reflect the updated targets
8. **Given** a user has no goals set, **When** they view the Goals tab, **Then** they see a clear call-to-action to set their first goals with helpful guidance

---

### Edge Cases

- What happens when the external food API is unavailable? User is notified and can still add custom foods or previously used foods from local cache.
- How does the system handle foods with missing nutritional data? Display available data with clear indication of missing fields.
- What happens when a user adds the same food twice to a meal? Each entry is tracked separately with individual quantities.
- How are serving size conversions handled? Support common units (grams, ounces, cups, pieces) with conversion where data is available.
- What happens when a user deletes a custom food that's part of a saved meal? The meal retains the food's nutritional data snapshot (calories, macros, serving size) and displays a "(deleted)" indicator next to the food name. The meal remains fully functional using the cached data.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a daily diary page organized by meal categories
- **FR-002**: System MUST provide three default meal categories: Breakfast, Lunch, and Dinner
- **FR-003**: System MUST allow users to navigate between dates to view past/future diary entries
- **FR-004**: System MUST integrate with an external nutrition API for food search functionality
- **FR-005**: System MUST display food search interface on the same page as the daily diary
- **FR-006**: System MUST show nutritional information (calories, protein, carbohydrates, fat) for each food item
- **FR-007**: System MUST allow users to adjust serving size when adding foods with decimal precision to two places using the original unit (e.g., 1.50 cups, 0.75 servings)
- **FR-008**: System MUST calculate and display daily totals for calories, protein, carbohydrates, and fat (baseline view without goals)
- **FR-009**: System MUST allow users to create custom foods with name, serving size, and nutritional data
- **FR-010**: System MUST persist custom foods to user profile for future use
- **FR-011**: System MUST allow users to create custom meals composed of multiple food items
- **FR-012**: System MUST persist custom meals to user profile for future use
- **FR-013**: System MUST allow users to add, edit, rename, reorder, and delete meal categories
- **FR-014**: System MUST prevent deletion of meal categories that contain entries without first prompting user to move entries to another category or confirm deletion of all entries
- **FR-015**: System MUST cache recently used and custom foods locally for offline access
- **FR-016**: System MUST gracefully handle external API failures by falling back to cached/custom foods
- **FR-017**: System MUST require user authentication via email and password
- **FR-018**: System MUST allow users to create an account with email and password
- **FR-019**: System MUST allow users to reset their password via email
- **FR-020**: System MUST prompt new users to set daily goals during onboarding (skippable)
- **FR-021**: System MUST allow users to set and edit daily goals for calories, protein, carbohydrates, and fat
- **FR-022**: System MUST display progress toward daily goals on the diary view when goals are set (extends FR-008 with goal comparison, e.g., "1200 / 2000 cal")
- **FR-023**: System MUST retain all diary entries indefinitely until user explicitly deletes them
- **FR-024**: System MUST allow users to delete individual diary entries
- **FR-025**: System MUST allow users to permanently delete their account and all associated data
- **FR-026**: System MUST provide a Settings page with dedicated tabs for Goals, Custom Foods, Custom Meals, Categories, and Account management
- **FR-027**: System MUST display a list view of all custom foods in the Settings Custom Foods tab with options to create, edit, and delete
- **FR-028**: System MUST provide a goal editing form in the Settings Goals tab showing current values and allowing modifications

### Key Entities

- **Food Item** (model: FoodItem): Represents a food that can be logged. Contains name, serving size, serving unit, calories, protein (g), carbohydrates (g), and fat (g). May be sourced from API or user-created.
- **Meal Category**: A named grouping for organizing food entries within a day. Has name, display order, and associated daily entries.
- **Daily Entry**: A single food item logged to a specific date and meal category. Contains food reference, quantity, and timestamp.
- **Custom Food** (model: CustomFood): A user-created food item saved to their profile. Contains all Food Item attributes plus user ownership.
- **Custom Meal** (model: CustomMeal): A user-created collection of food items with preset quantities. Contains name, component foods with quantities, and calculated totals.
- **User Profile**: The user's account containing their custom foods, custom meals, meal category preferences, and daily goal settings.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can log a food item to their diary in under 30 seconds from app open (authenticated user)
- **SC-002**: Users can find and add a common food item via search in under 15 seconds
- **SC-003**: 80% of users can complete first-time food logging without external help
- **SC-004**: Daily totals update immediately (under 1 second) when foods are added or removed
- **SC-005**: The app remains functional for custom food entry when offline
- **SC-006**: Users can create and reuse a custom meal in under 2 minutes
- **SC-007**: Search results appear within 2 seconds of query submission

## Clarifications

### Session 2025-12-06

- Q: How should user data be persisted? → A: Database storage (not local-only)
- Q: How should users authenticate? → A: Email/password authentication
- Q: How should goal-setting work? → A: Onboarding prompts for goals but can skip; edit anytime in settings
- Q: How long should diary entries be retained? → A: Indefinite - keep all history until user deletes
- Q: Should users be able to delete their account? → A: Yes - full account and data deletion available

## Assumptions

- **Macros tracked**: Calories, protein, carbohydrates, and fat are the primary tracked nutrients (additional micronutrients may be added later)
- **External API**: USDA FoodData Central for food database (determined in plan.md)
- **Data persistence**: User data (entries, custom foods, meals, preferences) will be stored in a database with user accounts
- **Units**: Support metric (grams, ml) and imperial (ounces, cups) measurement units
- **Goals**: Users can set daily calorie and macro targets; goal-setting is implicit in P1 via "track target goals"
