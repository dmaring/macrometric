# Goals API Contract

**Feature**: 005-settings-goals-foods
**API Endpoints**: Goals Management
**Base URL**: `/goals`
**Authentication**: Required (JWT Bearer token)

## Overview

The Goals API manages user daily nutritional targets (calories, protein, carbs, fat). All endpoints are user-scoped - users can only access their own goals.

**Implementation Status**: ✅ Fully implemented in `backend/src/api/goals.py`

## Endpoints

### GET /goals

Get the current user's daily nutritional goals.

**Authentication**: Required
**Authorization**: User can only access their own goals

**Request**:
```http
GET /goals HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
```

**Response - Success (200 OK)**:
```json
{
  "calories": 2000,
  "protein_g": 150.5,
  "carbs_g": 200.0,
  "fat_g": 65.0
}
```

**Response - No Goals Set (200 OK)**:
```json
null
```

**Response - Unauthorized (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Field Descriptions**:
- `calories`: Daily calorie target (integer) - optional
- `protein_g`: Daily protein target in grams (float, 2 decimals) - optional
- `carbs_g`: Daily carbs target in grams (float, 2 decimals) - optional
- `fat_g`: Daily fat target in grams (float, 2 decimals) - optional

**Notes**:
- Returns `null` if user has never set goals
- All fields are nullable (users may track only some macros)
- Goals are unique per user (one goal record per user)

---

### PUT /goals

Set or update the current user's daily nutritional goals.

**Authentication**: Required
**Authorization**: User can only modify their own goals

**Request**:
```http
PUT /goals HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "calories": 2000,
  "protein_g": 150.5,
  "carbs_g": 200.0,
  "fat_g": 65.0
}
```

**Request Body Schema**:
```json
{
  "calories": "integer | null (optional, 500-10000)",
  "protein_g": "number | null (optional, >= 0, max 2 decimals)",
  "carbs_g": "number | null (optional, >= 0, max 2 decimals)",
  "fat_g": "number | null (optional, >= 0, max 2 decimals)"
}
```

**Validation Rules**:
- `calories`: If provided, must be between 500 and 10,000
- `protein_g`, `carbs_g`, `fat_g`: If provided, must be >= 0
- At least one field should be provided (but not enforced - could set all to null)
- Decimal precision: max 2 decimal places for macros

**Response - Success (200 OK)**:
```json
{
  "calories": 2000,
  "protein_g": 150.5,
  "carbs_g": 200.0,
  "fat_g": 65.0
}
```

**Response - Validation Error (422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "calories"],
      "msg": "ensure this value is greater than or equal to 500",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

**Response - Unauthorized (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Side Effects**:
- Creates a new goal record if user has no goals
- Updates existing goal record if user already has goals
- Marks user onboarding as complete (sets `onboarding_complete = true`)

---

### DELETE /goals

Delete the current user's daily goals.

**Authentication**: Required
**Authorization**: User can only delete their own goals

**Request**:
```http
DELETE /goals HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
```

**Response - Success (204 No Content)**:
```http
HTTP/1.1 204 No Content
```

**Response - Unauthorized (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Notes**:
- Deletes the user's goal record from database
- Safe to call even if user has no goals (idempotent)
- Does NOT mark onboarding as incomplete
- Subsequent GET requests will return `null`

---

### POST /goals/skip-onboarding

Mark onboarding as complete without setting goals.

**Authentication**: Required
**Authorization**: User can only skip their own onboarding

**Request**:
```http
POST /goals/skip-onboarding HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
```

**Response - Success (200 OK)**:
```json
{
  "message": "Onboarding skipped"
}
```

**Response - Unauthorized (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Notes**:
- Sets `user.onboarding_complete = true`
- Does NOT create a goals record
- Used during onboarding flow only
- **NOT used in Settings page** (this feature)

---

## Common Response Codes

| Code | Description | When It Happens |
|------|-------------|-----------------|
| 200 | OK | Successful GET or PUT |
| 204 | No Content | Successful DELETE |
| 401 | Unauthorized | Missing or invalid JWT token |
| 422 | Unprocessable Entity | Validation error in request body |
| 500 | Internal Server Error | Database or server error |

## Error Response Format

All errors follow FastAPI's standard error format:

```json
{
  "detail": "Error message" | [
    {
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "error_type"
    }
  ]
}
```

## Usage in Frontend

**Service File**: `frontend/src/services/goals.ts`

```typescript
// Get goals
const goals = await getGoals();
// Returns: Goals | null

// Set goals
const updatedGoals = await setGoals({
  calories: 2000,
  protein_g: 150,
  carbs_g: 200,
  fat_g: 65
});
// Returns: Goals

// Delete goals
await deleteGoals();
// Returns: void
```

## Testing Checklist

- [ ] GET returns null when no goals exist
- [ ] GET returns goals when they exist
- [ ] PUT creates goals when none exist
- [ ] PUT updates goals when they exist
- [ ] PUT validates calories range (500-10000)
- [ ] PUT validates non-negative macros
- [ ] PUT allows partial updates (only some fields)
- [ ] PUT allows null values
- [ ] DELETE removes goals successfully
- [ ] DELETE is idempotent (safe to call multiple times)
- [ ] All endpoints return 401 without authentication
- [ ] All endpoints are user-scoped (can't access other users' goals)

## Performance Characteristics

- **GET /goals**: <50ms (single row lookup by user_id)
- **PUT /goals**: <100ms (upsert operation)
- **DELETE /goals**: <50ms (single row delete)
- **Concurrency**: Last write wins (no locking needed - single user editing own data)
- **Caching**: Not applicable (data changes infrequently, lightweight payload)
