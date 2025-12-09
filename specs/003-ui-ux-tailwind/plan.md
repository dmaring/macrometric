# Implementation Plan: UI/UX Tailwind Migration with Theme Toggle

**Branch**: `003-ui-ux-tailwind` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ui-ux-tailwind/spec.md`

## Summary

Migrate the Macrometric frontend from vanilla CSS to Tailwind CSS with full CSS replacement. Implement a dark/light theme toggle accessible from the Settings page, with system preference detection and localStorage persistence. Establish custom brand colors as design tokens and ensure consistent styling across all 6 pages (Diary, Login, Register, Onboarding, Settings, Password Reset) with mobile-responsive layouts.

## Technical Context

**Language/Version**: TypeScript 5.2, React 18.2
**Primary Dependencies**: Tailwind CSS 3.x (new), Vite 5.0, React Router 6.20
**Storage**: localStorage (theme preference only, no backend changes)
**Testing**: Jest + React Testing Library (unit), Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend-only changes)
**Performance Goals**: Theme transitions < 200ms, initial render < 2s
**Constraints**: Touch targets ≥ 44x44px on mobile, viewport support 320px-1920px
**Scale/Scope**: 6 pages, 14 components with CSS, 20 CSS files to replace

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modern Web Application | ✅ PASS | Frontend-only changes align with SPA architecture |
| II. Semantic HTML | ✅ PASS | Tailwind utilities don't affect HTML semantics; ARIA attributes preserved |
| III. User-Centric Design | ✅ PASS | Theme toggle improves comfort; core workflows unchanged |
| IV. Performance | ✅ PASS | Tailwind purges unused CSS; transitions < 200ms target |
| V. Simplicity | ✅ PASS | Utility-only approach, no additional component libraries |
| VI. Security & Privacy | ✅ PASS | Theme stored in localStorage only, no sensitive data |
| VII. Testing | ⚠️ PENDING | E2E tests for theme toggle required; component tests need updates |
| VIII. Version Control | ✅ PASS | Feature branch workflow, atomic commits planned |

**Gate Status**: PASS - No blocking violations. Testing requirement will be addressed during implementation.

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-ux-tailwind/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/      # 14 component directories with CSS to migrate
│   │   ├── AddFoodModal/
│   │   ├── CategoryEditor/
│   │   ├── CategoryManager/
│   │   ├── CustomMealList/
│   │   ├── DateNavigator/
│   │   ├── DiaryEntry/
│   │   ├── ErrorBoundary/
│   │   ├── ErrorNotification/
│   │   ├── FoodSearch/
│   │   ├── MacroDisplay/
│   │   ├── MealBuilder/
│   │   ├── MealCard/
│   │   ├── MealCategory/
│   │   └── ProtectedRoute/
│   ├── contexts/        # Add ThemeContext
│   ├── hooks/           # Add useTheme hook
│   ├── pages/           # 6 pages with CSS to migrate
│   │   ├── Diary/
│   │   ├── Login/
│   │   ├── Onboarding/
│   │   ├── PasswordReset/
│   │   ├── Register/
│   │   └── Settings/
│   └── index.css        # Replace with Tailwind base
├── tailwind.config.js   # New - custom brand colors
├── postcss.config.js    # New - Tailwind PostCSS setup
└── tests/
    └── e2e/             # Playwright tests for theme toggle
```

**Structure Decision**: Web application with frontend-only changes. All 20 CSS files will be deleted and styles rewritten as Tailwind utility classes inline in TSX files.

## Complexity Tracking

> No violations requiring justification - all principles pass.
