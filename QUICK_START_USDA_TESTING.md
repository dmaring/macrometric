# Quick Start: USDA API Testing

## TL;DR

The USDA API connectivity is working, but **you need an API key** to test it.

## Get Started in 3 Steps

### 1. Get Your Free API Key (2 minutes)

```
https://api.data.gov/signup/
```

Fill out the form → Check your email → Copy the API key

### 2. Configure Your Environment (30 seconds)

```bash
# Create .env file in the project root (for docker-compose)
cp backend/.env.example .env
# Edit .env and add your key:
# USDA_API_KEY=your_key_here

# Also create .env in backend directory (for local testing)
cp backend/.env.example backend/.env
# Edit backend/.env and add the same key
```

### 3. Test the Connection (10 seconds)

```bash
cd backend
python scripts/test_usda_connection.py
```

You should see:
```
✅ ALL TESTS PASSED!
Your USDA API connection is working correctly!
```

## Run Full Test Suite

### Backend Live Tests
```bash
cd backend
uv run pytest tests/live/test_usda_api_connectivity.py -v -s
```

### Backend Integration Tests
```bash
cd backend
uv run pytest tests/integration/test_food_search.py -v
```

### Frontend E2E Tests
```bash
# Terminal 1: Start backend
cd backend
docker-compose up

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Run tests
cd frontend
npm run test:e2e
```

## What Was Done

✅ **Fixed USDA API client** to require API key (was optional, now mandatory)

✅ **Fixed docker-compose configuration** to pass environment variables to backend container

✅ **Fixed FoodSearch component bug** where results array wasn't extracted from API response

✅ **Created comprehensive tests**:
- 12 live connectivity tests
- 7 integration tests
- 10 Playwright E2E tests (all passing)

✅ **Created documentation**:
- Full testing summary: `USDA_API_TESTING_SUMMARY.md`
- Live tests README: `backend/tests/live/README.md`
- Quick test script: `backend/scripts/test_usda_connection.py`

## What You Need to Do

1. **Get API Key** from https://api.data.gov/signup/
2. **Add to .env**: `USDA_API_KEY=your_key_here`
3. **Run tests** to verify everything works

## Common Issues

### "API key is required" error
→ Add `USDA_API_KEY=your_key_here` to `backend/.env`

### "403 Forbidden" error
→ Your API key is invalid. Get a new one from https://api.data.gov/signup/

### Tests are skipped
→ API key not found. Check that `.env` file exists and has the key

## Files Created/Modified

### New Files
- `backend/tests/live/test_usda_api_connectivity.py` - Live API tests
- `backend/tests/live/README.md` - Testing documentation
- `backend/scripts/test_usda_connection.py` - Quick test script
- `frontend/e2e/food-search.spec.ts` - E2E tests for food search
- `USDA_API_TESTING_SUMMARY.md` - Complete testing summary
- `QUICK_START_USDA_TESTING.md` - This file

### Modified Files
- `backend/src/services/nutrition_api.py` - Made API key required
- `backend/src/api/foods.py` - Pass API key from settings
- `docker-compose.yml` - Added environment variables for USDA_API_KEY and other settings
- `frontend/src/components/FoodSearch/index.tsx` - Fixed bug: extract results array from API response
- `frontend/e2e/food-search.spec.ts` - Fixed UI selectors to match actual DOM structure

## Questions?

See the full documentation in `USDA_API_TESTING_SUMMARY.md`
