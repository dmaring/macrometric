# Research: Macro Calorie Tracker

**Date**: 2025-12-06
**Branch**: `001-macro-calorie-tracker`

## Technology Decisions

### 1. Frontend Framework: React

**Decision**: React with TypeScript

**Rationale**:
- Large ecosystem with mature tooling
- Component-based architecture ideal for reusable UI elements (meal cards, food items, macro displays)
- Excellent developer experience with hot reloading
- Strong TypeScript support for type safety
- React Testing Library for reliable component testing

**Alternatives Considered**:
- Vue.js: Simpler learning curve but smaller ecosystem
- Svelte: Better performance but less mature ecosystem
- Vanilla JS: Maximum control but requires building common patterns from scratch

### 2. Backend Framework: FastAPI

**Decision**: Python 3.11+ with FastAPI

**Rationale**:
- Native async support for non-blocking I/O (important for external API calls)
- Automatic OpenAPI documentation generation
- Pydantic models for request/response validation
- Excellent performance compared to Flask/Django
- Built-in dependency injection system
- Type hints throughout for better code quality

**Alternatives Considered**:
- Django REST Framework: More batteries-included but heavier
- Flask: Simpler but requires more boilerplate
- Node.js/Express: JavaScript full-stack but Python has better data science ecosystem if needed later

### 3. Database: PostgreSQL

**Decision**: PostgreSQL 15+

**Rationale**:
- Robust relational database for structured user data
- ACID compliance ensures data integrity
- JSON/JSONB support for flexible food nutrition data
- Excellent performance with proper indexing
- Well-supported by SQLAlchemy ORM
- Easy to scale vertically for MVP, horizontally later if needed

**Alternatives Considered**:
- SQLite: Simpler but not suitable for multi-user web app
- MongoDB: Flexible schema but relational model fits food/diary data well
- MySQL: Similar capabilities but PostgreSQL has better JSON support

### 4. Nutrition API: USDA FoodData Central

**Decision**: USDA FoodData Central API

**Rationale**:
- Free to use with generous rate limits
- Comprehensive database of ~300,000+ foods
- Official US government data source (reliable, maintained)
- RESTful JSON API
- Includes branded foods, not just generic items
- No API key required for basic usage (key available for higher limits)

**Alternatives Considered**:
- Nutritionix: More developer-friendly but paid
- Edamam: Good coverage but requires paid plan for production
- Open Food Facts: Community-driven, less consistent data quality

**API Details**:
- Base URL: `https://api.nal.usda.gov/fdc/v1/`
- Endpoints: `/foods/search`, `/food/{fdcId}`
- Response includes: calories, protein, carbs, fat, serving sizes

### 5. Authentication: JWT with Refresh Tokens

**Decision**: JWT access tokens + refresh token rotation

**Rationale**:
- Stateless authentication scales well
- FastAPI has excellent JWT support via `python-jose`
- Short-lived access tokens (15 min) + longer refresh tokens (7 days)
- Refresh token rotation prevents token theft
- Passwords hashed with bcrypt (via `passlib`)

**Implementation**:
- Access token: 15 minutes expiry, stored in memory
- Refresh token: 7 days expiry, stored in httpOnly cookie
- Password reset via email with time-limited tokens

### 6. State Management: React Context + Hooks

**Decision**: React Context API with custom hooks

**Rationale**:
- Built into React, no additional dependencies
- Sufficient for MVP scale application
- Custom hooks (`useAuth`, `useDiary`, `useFoodSearch`) encapsulate logic
- Can migrate to Redux/Zustand later if complexity increases

**Alternatives Considered**:
- Redux: Powerful but overkill for MVP
- Zustand: Simpler than Redux but adds dependency
- MobX: Different paradigm, steeper learning curve

### 7. Build Tools

**Decision**: Vite (frontend), Docker Compose (full stack)

**Rationale**:
- Vite: Fast HMR, native ES modules, excellent React support
- Docker Compose: Consistent development environment, easy PostgreSQL setup
- Production: Static frontend build, containerized backend

## Performance Considerations

### API Response Times
- Target: <200ms p95 for all endpoints
- Strategy: Database indexing, connection pooling, async handlers

### Food Search
- Target: <2s for search results
- Strategy: Cache popular searches, debounce user input (300ms)

### Offline Support
- Scope: Custom food entry only (per spec)
- Strategy: Service worker for offline detection, local storage for draft entries

## Security Considerations

### Authentication
- Passwords: bcrypt with cost factor 12
- Tokens: JWT with RS256 signing
- CSRF: SameSite cookies, CORS restrictions

### Data Protection
- HTTPS required for all connections
- Sensitive data never in URL parameters
- Account deletion removes all user data (GDPR/CCPA)

### Input Validation
- Pydantic models validate all API inputs
- SQL injection prevented by SQLAlchemy ORM
- XSS prevented by React's default escaping
