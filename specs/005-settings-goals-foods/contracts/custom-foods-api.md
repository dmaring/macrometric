# Custom Foods API Contract

**Feature**: 005-settings-goals-foods
**API Endpoints**: Custom Foods Management
**Base URL**: `/custom-foods`
**Authentication**: Required (JWT Bearer token)

## Overview

The Custom Foods API manages user-created food items. Users can create custom foods for recipes, local foods, or items not found in the USDA database. All endpoints are user-scoped - users can only access their own custom foods.

**Implementation Status**: ✅ Fully implemented in `backend/src/api/custom_foods.py`

## Endpoints

### GET /custom-foods

Get all custom foods for the current user.

**Authentication**: Required
**Authorization**: User can only access their own custom foods

**Request**:
```http
GET /custom-foods HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
```

**Response - Success (200 OK)**:
```json
[
  {
    "id": "custom:123e4567-e89b-12d3-a456-426614174000",
    "name": "Homemade Protein Shake",
    "brand": null,
    "serving_size": 16.0,
    "serving_unit": "oz",
    "calories": 250,
    "protein_g": 30.0,
    "carbs_g": 15.0,
    "fat_g": 5.0
  },
  {
    "id": "custom:223e4567-e89b-12d3-a456-426614174001",
    "name": "Grandma's Cookies",
    "brand": "Homemade",
    "serving_size": 1.0,
    "serving_unit": "cookie",
    "calories": 150,
    "protein_g": 2.0,
    "carbs_g": 20.0,
    "fat_g": 7.0
  }
]
```

**Response - Empty List (200 OK)**:
```json
[]
```

**Response - Unauthorized (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Field Descriptions**:
- `id`: Unique identifier (format: "custom:{uuid}")
- `name`: Food name (1-255 characters)
- `brand`: Brand name (0-255 characters, nullable)
- `serving_size`: Serving size amount (positive decimal)
- `serving_unit`: Unit of measurement (1-50 characters, e.g., "g", "oz", "cup")
- `calories`: Calories per serving (non-negative integer)
- `protein_g`: Protein per serving in grams (non-negative, max 2 decimals)
- `carbs_g`: Carbs per serving in grams (non-negative, max 2 decimals)
- `fat_g`: Fat per serving in grams (non-negative, max 2 decimals)

**Notes**:
- Returns empty array if user has no custom foods
- Foods are ordered by creation date (most recent first)
- All nutritional values are per the specified serving size

---

### GET /custom-foods/{food_id}

Get a specific custom food by ID.

**Authentication**: Required
**Authorization**: User can only access their own custom foods

**Request**:
```http
GET /custom-foods/123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
```

**URL Parameters**:
- `food_id`: UUID of the custom food (without "custom:" prefix)

**Response - Success (200 OK)**:
```json
{
  "id": "custom:123e4567-e89b-12d3-a456-426614174000",
  "name": "Homemade Protein Shake",
  "brand": null,
  "serving_size": 16.0,
  "serving_unit": "oz",
  "calories": 250,
  "protein_g": 30.0,
  "carbs_g": 15.0,
  "fat_g": 5.0
}
```

**Response - Not Found (404 Not Found)**:
```json
{
  "detail": "Custom food not found"
}
```

**Response - Unauthorized (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Notes**:
- Returns 404 if food doesn't exist or belongs to another user
- ID in URL should be UUID without "custom:" prefix
- ID in response includes "custom:" prefix

---

### POST /custom-foods

Create a new custom food.

**Authentication**: Required
**Authorization**: User can only create foods for themselves

**Request**:
```http
POST /custom-foods HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Homemade Protein Shake",
  "brand": null,
  "serving_size": 16.0,
  "serving_unit": "oz",
  "calories": 250,
  "protein_g": 30.0,
  "carbs_g": 15.0,
  "fat_g": 5.0
}
```

**Request Body Schema**:
```json
{
  "name": "string (required, 1-255 chars)",
  "brand": "string | null (optional, 0-255 chars)",
  "serving_size": "number (required, > 0)",
  "serving_unit": "string (required, 1-50 chars)",
  "calories": "integer (required, >= 0)",
  "protein_g": "number (required, >= 0, max 2 decimals)",
  "carbs_g": "number (required, >= 0, max 2 decimals)",
  "fat_g": "number (required, >= 0, max 2 decimals)"
}
```

**Validation Rules**:
- `name`: Required, non-empty, max 255 characters
- `brand`: Optional, max 255 characters
- `serving_size`: Required, must be > 0
- `serving_unit`: Required, non-empty, max 50 characters
- `calories`: Required, must be >= 0
- `protein_g`, `carbs_g`, `fat_g`: Required, must be >= 0, max 2 decimal places

**Response - Success (201 Created)**:
```json
{
  "id": "custom:123e4567-e89b-12d3-a456-426614174000",
  "name": "Homemade Protein Shake",
  "brand": null,
  "serving_size": 16.0,
  "serving_unit": "oz",
  "calories": 250,
  "protein_g": 30.0,
  "carbs_g": 15.0,
  "fat_g": 5.0
}
```

**Response - Validation Error (422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
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
- Created food immediately appears in user's food search results
- Food is associated with current user's account

---

### PUT /custom-foods/{food_id}

Update an existing custom food.

**Authentication**: Required
**Authorization**: User can only update their own custom foods

**Request**:
```http
PUT /custom-foods/123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Protein Shake",
  "calories": 300
}
```

**URL Parameters**:
- `food_id`: UUID of the custom food (without "custom:" prefix)

**Request Body Schema** (all fields optional for partial updates):
```json
{
  "name": "string (optional, 1-255 chars)",
  "brand": "string | null (optional, 0-255 chars)",
  "serving_size": "number (optional, > 0)",
  "serving_unit": "string (optional, 1-50 chars)",
  "calories": "integer (optional, >= 0)",
  "protein_g": "number (optional, >= 0, max 2 decimals)",
  "carbs_g": "number (optional, >= 0, max 2 decimals)",
  "fat_g": "number (optional, >= 0, max 2 decimals)"
}
```

**Validation Rules** (same as POST, but all fields optional):
- Only provided fields are updated
- Validation applies to provided fields only
- Can send partial updates (e.g., only update name and calories)

**Response - Success (200 OK)**:
```json
{
  "id": "custom:123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Protein Shake",
  "brand": null,
  "serving_size": 16.0,
  "serving_unit": "oz",
  "calories": 300,
  "protein_g": 30.0,
  "carbs_g": 15.0,
  "fat_g": 5.0
}
```

**Response - Not Found (404 Not Found)**:
```json
{
  "detail": "Custom food not found"
}
```

**Response - Validation Error (422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "calories"],
      "msg": "ensure this value is greater than or equal to 0",
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
- Updated food immediately reflects in search results
- Existing diary entries with this food retain original values (snapshot)
- Future diary entries will use updated values

---

### DELETE /custom-foods/{food_id}

Delete a custom food.

**Authentication**: Required
**Authorization**: User can only delete their own custom foods

**Request**:
```http
DELETE /custom-foods/123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
Host: api.macrometric.com
Authorization: Bearer {access_token}
```

**URL Parameters**:
- `food_id`: UUID of the custom food (without "custom:" prefix)

**Response - Success (204 No Content)**:
```http
HTTP/1.1 204 No Content
```

**Response - Not Found (404 Not Found)**:
```json
{
  "detail": "Custom food not found"
}
```

**Response - Unauthorized (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Side Effects**:
- Food is permanently deleted from database
- Food disappears from search results
- Existing diary entries retain the food's nutritional data (snapshot)
- Cannot be undone

**Notes**:
- Safe to display as "(deleted)" in diary entries
- Diary entries are not affected (data is denormalized)

---

## Common Response Codes

| Code | Description | When It Happens |
|------|-------------|-----------------|
| 200 | OK | Successful GET or PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Food doesn't exist or belongs to another user |
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

**Service File**: `frontend/src/services/customFoods.ts`

```typescript
// Get all custom foods
const foods = await getCustomFoods();
// Returns: CustomFood[]

// Get one custom food
const food = await getCustomFood(foodId);
// Returns: CustomFood

// Create custom food
const newFood = await createCustomFood({
  name: "Homemade Protein Shake",
  brand: null,
  serving_size: 16,
  serving_unit: "oz",
  calories: 250,
  protein_g: 30,
  carbs_g: 15,
  fat_g: 5
});
// Returns: CustomFood

// Update custom food (partial update)
const updatedFood = await updateCustomFood(foodId, {
  name: "Updated Protein Shake",
  calories: 300
});
// Returns: CustomFood

// Delete custom food
await deleteCustomFood(foodId);
// Returns: void
```

## Testing Checklist

- [ ] GET /custom-foods returns empty array when none exist
- [ ] GET /custom-foods returns all user's foods
- [ ] GET /custom-foods/{id} returns specific food
- [ ] GET /custom-foods/{id} returns 404 for non-existent food
- [ ] GET /custom-foods/{id} returns 404 for other users' foods
- [ ] POST creates food with all required fields
- [ ] POST validates all field constraints
- [ ] POST rejects empty/invalid names
- [ ] POST rejects negative nutritional values
- [ ] PUT updates all provided fields
- [ ] PUT supports partial updates
- [ ] PUT validates updated fields
- [ ] PUT returns 404 for non-existent food
- [ ] DELETE removes food successfully
- [ ] DELETE returns 404 for non-existent food
- [ ] DELETE doesn't affect existing diary entries
- [ ] All endpoints return 401 without authentication
- [ ] All endpoints are user-scoped

## Performance Characteristics

- **GET /custom-foods**: <100ms (indexed query by user_id)
- **GET /custom-foods/{id}**: <50ms (indexed query by id + user_id)
- **POST /custom-foods**: <100ms (insert + index update)
- **PUT /custom-foods/{id}**: <100ms (update operation)
- **DELETE /custom-foods/{id}**: <50ms (delete operation)
- **Concurrency**: Last write wins (no locking needed - single user editing own data)
- **Caching**: Not applicable (list refreshes on mutations)

## Integration with Food Search

Custom foods appear in search results alongside USDA foods. The backend search endpoint (`GET /foods?query=...`) automatically includes custom foods with the "custom:" ID prefix to distinguish them from USDA foods.

**Search Result Format**:
```json
{
  "results": [
    {
      "id": "custom:123e4567-e89b-12d3-a456-426614174000",
      "name": "Homemade Protein Shake",
      "brand": null,
      "source": "custom"
    }
  ]
}
```
