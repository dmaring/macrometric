# Implementation Plan: Settings - Goals and Custom Foods

**Branch**: `005-settings-goals-foods` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-settings-goals-foods/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement the Goals and Custom Foods management pages within the Settings area. Users will be able to view and edit their daily nutritional goals (calories, protein, carbs, fat) and manage their custom food library (create, edit, delete custom foods). Both features leverage existing backend APIs and extend the Settings page UI with form-based interfaces. This completes critical user-facing functionality for managing personal preferences and data.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 4.9+, React 18
- Backend: Python 3.11+ (already implemented)

**Primary Dependencies**:
- Frontend: React, React Router, Axios, Vite, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Pydantic (already implemented)

**Storage**: PostgreSQL (existing tables: `daily_goals`, `custom_foods`)

**Testing**:
- Frontend: Jest, React Testing Library
- Backend: pytest (already has comprehensive tests)

**Target Platform**: Web application (desktop and mobile browsers)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Form submissions complete within 500ms
- Page load/tab switch under 200ms
- API responses under 200ms

**Constraints**:
- Must work on mobile viewports (320px+)
- Touch targets must be ≥ 44x44px (WCAG compliant)
- Forms must validate client-side before submission
- All state changes must reflect immediately in UI

**Scale/Scope**:
- 2 new UI tabs within existing Settings page
- ~4-6 new React components
- Reuse existing API services (goals.ts, customFoods.ts)
- No new backend endpoints required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Modern Web Application ✅
**Status**: PASS
**Rationale**: This feature extends the existing React SPA frontend. No architectural changes required.

### II. Semantic HTML ✅
**Status**: PASS
**Rationale**: Will use semantic form elements (`<form>`, `<input>`, `<label>`, `<button>`) with proper ARIA attributes for accessibility.

### III. User-Centric Design ✅
**Status**: PASS
**Rationale**: Goals editing is a one-form experience. Custom foods management uses inline editing patterns. Both prioritize speed and simplicity.

### IV. Performance ✅
**Status**: PASS
**Rationale**: No heavy computations. Forms load instantly. API calls are <200ms. State updates are optimistic.

### V. Simplicity ✅
**Status**: PASS
**Rationale**: No new dependencies required. Reuses existing API services, Tailwind patterns, and form validation approaches from other pages.

### VI. Security & Privacy ✅
**Status**: PASS
**Rationale**: All endpoints protected by existing JWT authentication. No sensitive data exposed. Uses existing `useAuth` hook.

### VII. Testing ✅
**Status**: PASS
**Rationale**: Will include unit tests for new components and integration tests for form submissions. Backend already has complete test coverage.

### VIII. Version Control ✅
**Status**: PASS
**Rationale**: Work occurs on feature branch `005-settings-goals-foods`. Will use conventional commits (feat, fix, test, refactor).

**GATE RESULT**: ✅ **ALL CHECKS PASSED** - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── goals.py                    # ✅ Existing - GET/PUT/DELETE endpoints
│   │   └── custom_foods.py             # ✅ Existing - Full CRUD endpoints
│   ├── models/
│   │   ├── daily_goal.py               # ✅ Existing - DailyGoal model
│   │   └── custom_food.py              # ✅ Existing - CustomFood model
│   └── services/
│       ├── goals.py                    # ✅ Existing - Goals business logic
│       └── custom_foods.py             # ✅ Existing - Custom foods business logic
└── tests/                              # ✅ Existing - Complete backend test coverage

frontend/
├── src/
│   ├── pages/
│   │   └── Settings/
│   │       └── index.tsx               # 🔧 Modify - Add Goals & Custom Foods tabs
│   ├── components/                     # 🆕 New components to create
│   │   ├── GoalsForm/
│   │   │   ├── index.tsx               # Goals editing form
│   │   │   └── GoalsForm.test.tsx      # Unit tests
│   │   ├── CustomFoodForm/
│   │   │   ├── index.tsx               # Custom food create/edit form
│   │   │   └── CustomFoodForm.test.tsx # Unit tests
│   │   └── CustomFoodList/
│   │       ├── index.tsx               # Custom foods list with edit/delete
│   │       └── CustomFoodList.test.tsx # Unit tests
│   └── services/
│       ├── goals.ts                    # ✅ Existing - Goals API client
│       └── customFoods.ts              # ✅ Existing - Custom foods API client
└── tests/
    └── pages/
        └── Settings.test.tsx           # 🔧 Modify - Add new tab tests
```

**Structure Decision**: Web application structure. Backend is complete and requires no changes. Frontend work focuses on creating new components within the existing Settings page and reusing established API services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - this section is not applicable.

---

## Post-Design Constitution Re-Check

*Re-evaluation after completing Phase 1 design artifacts (research.md, data-model.md, contracts/)*

### I. Modern Web Application ✅
**Status**: PASS
**Post-Design Verification**: Design confirms React SPA architecture. No frameworks or architectural changes introduced. All components follow established patterns.

### II. Semantic HTML ✅
**Status**: PASS
**Post-Design Verification**: Quickstart guide specifies semantic form elements with proper ARIA attributes. Forms use `<form>`, `<input>`, `<label>`, `<button>` with accessibility considerations.

### III. User-Centric Design ✅
**Status**: PASS
**Post-Design Verification**: Research confirms simple form patterns. Goals editing is a single form. Custom foods use inline editing. Both meet <3 click requirement for core workflows.

### IV. Performance ✅
**Status**: PASS
**Post-Design Verification**: Performance targets defined in research.md and met by design:
- Initial tab load: <200ms (lazy loading, minimal DOM)
- Form submission: <100ms perceived (optimistic updates)
- API responses: <200ms (backend already meets this)

### V. Simplicity ✅
**Status**: PASS
**Post-Design Verification**: Zero new dependencies. Reuses existing services, Tailwind patterns, validation approaches. No abstraction layers introduced.

### VI. Security & Privacy ✅
**Status**: PASS
**Post-Design Verification**: All API contracts show JWT authentication required. User-scoped data access enforced. No sensitive data in client code.

### VII. Testing ✅
**Status**: PASS
**Post-Design Verification**: Testing strategy documented in research.md. Unit tests for components, integration tests for flows, manual testing checklist provided. Backend tests already complete.

### VIII. Version Control ✅
**Status**: PASS
**Post-Design Verification**: Feature branch workflow confirmed. Conventional commits planned. Atomic commits at natural stopping points.

**FINAL GATE RESULT**: ✅ **ALL CHECKS PASSED** - Design adheres to all constitutional principles

**Conclusion**: This feature maintains project standards and introduces no complexity violations. Ready for Phase 2 (tasks generation via `/speckit.tasks`).
