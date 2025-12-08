# Implementation Plan: Macro Calorie Tracker

**Branch**: `001-macro-calorie-tracker` | **Date**: 2025-12-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-macro-calorie-tracker/spec.md`

## Summary

Build a modern macro nutrient and calorie counter web application with React frontend and FastAPI backend. Users can quickly log daily food intake, search an external nutrition database (USDA FoodData Central), create custom foods/meals, and track progress toward daily calorie and macro goals. Authentication via email/password with PostgreSQL persistence.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/JavaScript ES6+ (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy, React, React Router, Axios
**Storage**: PostgreSQL 15+
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web browsers (modern), Linux/Docker server deployment
**Project Type**: Web application (frontend + backend)
**Performance Goals**: API responses <200ms p95, search results <2s, UI updates <1s
**Constraints**: Offline-capable for custom food entry, HTTPS required, WCAG 2.1 AA
**Scale/Scope**: MVP for single-user to small scale (~1000 users initially)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Modern Web Application | PASS | React SPA + FastAPI backend architecture |
| II. Semantic HTML | PASS | React with semantic elements, proper ARIA |
| III. User-Centric Design | PASS | Focus on quick food logging (<30s), inline search |
| IV. Performance | PASS | Async FastAPI, React optimization, lazy loading |
| V. Simplicity | PASS | Established stack (React, FastAPI, PostgreSQL) |
| VI. Security & Privacy | PASS | JWT auth, bcrypt passwords, account deletion |

**All gates PASS** - proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-macro-calorie-tracker/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Setup guide
├── contracts/           # Phase 1: API specifications
│   └── api.yaml         # OpenAPI 3.0 specification
└── tasks.md             # Phase 2: Implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── food.py
│   │   ├── diary.py
│   │   └── meal.py
│   ├── services/        # Business logic layer
│   │   ├── auth.py
│   │   ├── food_search.py
│   │   ├── diary.py
│   │   └── nutrition_api.py
│   ├── api/             # FastAPI route handlers
│   │   ├── auth.py
│   │   ├── diary.py
│   │   ├── foods.py
│   │   ├── meals.py
│   │   └── users.py
│   └── core/            # Configuration, security, dependencies
│       ├── config.py
│       ├── security.py
│       └── deps.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── alembic/             # Database migrations
├── requirements.txt
└── main.py

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── FoodSearch/
│   │   ├── DiaryEntry/
│   │   ├── MacroDisplay/
│   │   └── MealCategory/
│   ├── pages/           # Route-level pages
│   │   ├── Diary/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Settings/
│   │   └── Onboarding/
│   ├── services/        # API client and utilities
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDiary.ts
│   │   └── useFoodSearch.ts
│   └── store/           # State management (if needed)
├── tests/
├── package.json
└── vite.config.ts

docker-compose.yml       # Local development environment
.env.example             # Environment variables template
```

**Structure Decision**: Web application with separate frontend and backend directories. This supports independent deployment, clear separation of concerns, and aligns with the constitution's "Modern Web Application" principle.

## Complexity Tracking

> No violations requiring justification. All choices align with constitution principles.

| Decision | Rationale |
|----------|-----------|
| Separate frontend/backend | Required for SPA + API architecture per constitution |
| PostgreSQL over SQLite | User data persistence requires robust relational DB |
| External API (USDA) | User-requested food search capability |
