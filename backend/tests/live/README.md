# Live USDA API Tests

This directory contains tests that make actual API calls to the USDA FoodData Central API.

## Setup

### 1. Get a USDA API Key

The USDA API now requires an API key (free, no credit card required):

1. Visit https://api.data.gov/signup/
2. Fill out the form with your:
   - First name
   - Last name
   - Email address
3. Check your email for the API key
4. The key is sent immediately (check spam folder if not received)

### 2. Configure Your Environment

Create a `.env` file in the `backend/` directory (if it doesn't exist):

```bash
cp .env.example .env
```

Edit the `.env` file and add your API key:

```bash
USDA_API_KEY=your_api_key_here
```

## Running the Tests

### Run all live tests:

```bash
cd backend
uv run pytest tests/live/test_usda_api_connectivity.py -v -s
```

### Run specific test:

```bash
uv run pytest tests/live/test_usda_api_connectivity.py::TestUSDAAPIConnectivity::test_search_foods_live_connection -v -s
```

### Run excluding slow tests:

```bash
uv run pytest tests/live/test_usda_api_connectivity.py -v -s -m "not slow"
```

## Test Coverage

The live tests verify:

1. **Basic Connectivity**
   - API connection works
   - Search returns results
   - Food details can be retrieved

2. **Data Quality**
   - Nutritional data is complete
   - Results match search terms
   - Data structures are correct

3. **Error Handling**
   - Invalid FDC IDs handled gracefully
   - Empty searches work correctly
   - API errors are properly caught

4. **Performance**
   - Response times are acceptable
   - Multiple rapid requests work
   - Rate limiting is respected

## Troubleshooting

### Tests are skipped

If you see: `USDA_API_KEY not configured`, then:
- Verify you created the `.env` file in `backend/`
- Verify `USDA_API_KEY=your_key_here` is set
- Make sure there are no spaces around the `=` sign

### 403 Forbidden errors

- Your API key may be invalid
- Get a new key at https://api.data.gov/signup/
- Verify the key is correctly copied (no extra spaces)

### No results returned

This is normal for some obscure search terms. The tests use common foods like "apple" and "chicken" that should always return results.

## API Limits

The free USDA API key has rate limits:
- **Hourly limit**: 1,000 requests per hour
- **Daily limit**: Not specified, but reasonable use is expected

The tests are designed to stay well under these limits.
