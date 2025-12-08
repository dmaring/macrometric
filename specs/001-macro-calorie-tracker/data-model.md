# Data Model: Macro Calorie Tracker

**Date**: 2025-12-06
**Branch**: `001-macro-calorie-tracker`

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │───────│   DailyGoal     │       │  MealCategory│
└─────────────┘       └─────────────────┘       └─────────────┘
      │                                                │
      │ 1:N                                           │ 1:N
      ▼                                               ▼
┌─────────────┐                               ┌─────────────┐
│ CustomFood  │                               │ DiaryEntry  │
└─────────────┘                               └─────────────┘
      │                                               │
      │ N:M                                          │ N:1
      ▼                                               ▼
┌─────────────┐                               ┌─────────────┐
│ CustomMeal  │───────────────────────────────│  FoodItem   │
└─────────────┘        (component of)         └─────────────┘
```

## Entities

### User

The authenticated user account.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email address |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | Account creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |
| onboarding_completed | BOOLEAN | DEFAULT FALSE | Has completed initial setup |

**Indexes**: `email` (unique)

### DailyGoal

User's daily macro targets.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(User), UNIQUE | One goal set per user |
| calories | INTEGER | NULL | Daily calorie target |
| protein_g | DECIMAL(6,2) | NULL | Protein target in grams |
| carbs_g | DECIMAL(6,2) | NULL | Carbohydrates target in grams |
| fat_g | DECIMAL(6,2) | NULL | Fat target in grams |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Indexes**: `user_id` (unique)

### MealCategory

User-customizable meal groupings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(User), NOT NULL | Owner of this category |
| name | VARCHAR(50) | NOT NULL | Display name (e.g., "Breakfast") |
| display_order | INTEGER | NOT NULL | Sort order on diary page |
| is_default | BOOLEAN | DEFAULT FALSE | System-created default category |
| created_at | TIMESTAMP | NOT NULL | Creation time |

**Indexes**: `user_id`, `(user_id, display_order)`
**Constraints**: Unique `(user_id, name)`

**Default Categories** (created on registration):
1. Breakfast (order: 1)
2. Lunch (order: 2)
3. Dinner (order: 3)

### FoodItem

Represents a food from any source (API or custom).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| external_id | VARCHAR(50) | NULL | USDA FDC ID if from API |
| name | VARCHAR(255) | NOT NULL | Food name |
| brand | VARCHAR(255) | NULL | Brand name if applicable |
| serving_size | DECIMAL(8,2) | NOT NULL | Default serving amount |
| serving_unit | VARCHAR(20) | NOT NULL | Unit (g, oz, cup, etc.) |
| calories | INTEGER | NOT NULL | Calories per serving |
| protein_g | DECIMAL(6,2) | NOT NULL | Protein in grams |
| carbs_g | DECIMAL(6,2) | NOT NULL | Carbohydrates in grams |
| fat_g | DECIMAL(6,2) | NOT NULL | Fat in grams |
| source | ENUM | NOT NULL | 'api', 'custom', 'meal_component' |
| created_at | TIMESTAMP | NOT NULL | Creation time |

**Indexes**: `external_id`, `name`

### CustomFood

User-created food items saved to their profile.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(User), NOT NULL | Owner of this food |
| food_id | UUID | FK(FoodItem), NOT NULL | Reference to food data |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Indexes**: `user_id`, `(user_id, is_deleted)`

### CustomMeal

User-created meal presets composed of multiple foods.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(User), NOT NULL | Owner of this meal |
| name | VARCHAR(100) | NOT NULL | Meal name |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Indexes**: `user_id`, `(user_id, is_deleted)`

### CustomMealItem

Junction table for foods in a custom meal.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| meal_id | UUID | FK(CustomMeal), NOT NULL | Parent meal |
| food_id | UUID | FK(FoodItem), NOT NULL | Food in the meal |
| quantity | DECIMAL(8,2) | NOT NULL | Number of servings |
| created_at | TIMESTAMP | NOT NULL | Creation time |

**Indexes**: `meal_id`
**Constraints**: Unique `(meal_id, food_id)`

### DiaryEntry

A food logged to a specific date and meal.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(User), NOT NULL | Owner of this entry |
| category_id | UUID | FK(MealCategory), NOT NULL | Meal category |
| food_id | UUID | FK(FoodItem), NOT NULL | Food that was logged |
| entry_date | DATE | NOT NULL | Date of the diary entry |
| quantity | DECIMAL(8,2) | NOT NULL | Number of servings |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Indexes**: `(user_id, entry_date)`, `category_id`

## Validation Rules

### User
- Email must be valid format and unique
- Password minimum 8 characters, at least one letter and one number

### DailyGoal
- All macro values must be non-negative if set
- Calories must be between 500 and 10,000 if set

### MealCategory
- Name must be 1-50 characters
- Display order must be positive integer
- Maximum 10 categories per user

### FoodItem
- Name must be 1-255 characters
- Serving size must be positive
- All macro values must be non-negative
- Calories must be non-negative

### DiaryEntry
- Quantity must be positive (> 0)
- Entry date cannot be more than 1 year in the future

## State Transitions

### User Onboarding
```
Created → Onboarding (goals prompt) → Active
                ↓ (skip)
              Active (no goals)
```

### CustomFood Lifecycle
```
Created → Active ←→ Updated
             ↓
          Deleted (soft)
```

### MealCategory Deletion
```
Active → Check entries exist?
           ↓ Yes              ↓ No
    Prompt to move entries → Deleted
           ↓
    Entries moved → Deleted
```

## Cascading Deletes

When a **User** is deleted:
- All DailyGoal records deleted
- All MealCategory records deleted
- All CustomFood records deleted
- All CustomMeal records deleted (and CustomMealItem)
- All DiaryEntry records deleted
- Associated FoodItem records with source='custom' deleted

When a **CustomFood** is soft-deleted:
- CustomMealItem references remain (meal shows "deleted" indicator)
- DiaryEntry references remain (historical data preserved)

When a **MealCategory** is deleted:
- DiaryEntry records must be moved to another category first (enforced in app logic)
