# macrometric Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-08

## Active Technologies
- PostgreSQL (existing tables: `daily_goals`, `custom_foods`) (005-settings-goals-foods)

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: TypeScript, React, React Router, Axios, Vite, Tailwind CSS
- **Package Management**: uv (Python), npm (Node.js)

## Project Structure

```text
macrometric/
├── backend/
│   ├── src/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core utilities, deps
│   │   ├── models/       # SQLAlchemy models
│   │   └── services/     # Business logic
│   ├── tests/
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── package.json
└── docker-compose.yml
```

## Commands

```bash
# Backend (from backend/ directory)
uv venv && source .venv/bin/activate    # Create/activate venv
uv pip install -e ".[dev]"              # Install dependencies
uv run pytest                            # Run tests
uv run uvicorn main:app --reload        # Start dev server
uv run alembic upgrade head             # Run migrations

# Frontend (from frontend/ directory)
npm install                             # Install dependencies
npm run dev                             # Start dev server
npm test                                # Run tests
npm run build                           # Production build
```

## Code Style

- **Python**: Follow PEP 8, use Black formatter, isort for imports
- **TypeScript**: ESLint + Prettier, React best practices

## Recent Changes

- **005-settings-goals-foods** (2025-12-09): Implemented Goals and Custom Foods management in Settings page. Users can now set daily nutritional targets (calories, protein, carbs, fat) and create/edit/delete custom foods. Includes comprehensive tests (32 passing), accessibility enhancements (ARIA labels, error associations), and optimistic UI updates with rollback.
- **003-ui-ux-tailwind** (2025-12-08): Complete Tailwind CSS migration with dark/light/system theme toggle, full CSS replacement (20 CSS files removed), mobile-responsive design, and modern visual polish
- 001-macro-calorie-tracker: Macro nutrient and calorie tracking application

## Styling & Theming

### Tailwind CSS
The frontend uses **Tailwind CSS 3.4+** with a custom design system:

- **Theme Support**: Dark, light, and system preference modes
- **Color System**: Semantic tokens via CSS custom properties (surface, content, primary, border, success, warning, error)
- **Theme Toggle**: Available in Settings page with localStorage persistence and FOUC prevention
- **Design Patterns**:
  - Cards: `bg-surface-secondary rounded-lg border border-border shadow-sm`
  - Buttons: `px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors min-h-[44px]`
  - Inputs: `w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary`

### Responsive Design
- **Mobile-first approach** with breakpoints at 640px (sm:), 1024px (lg:)
- **Touch targets**: All interactive elements ≥ 44x44px (WCAG compliant)
- **Viewport support**: 320px (mobile) to 1920px (desktop)
- **Horizontal scroll** for tabs on mobile with hidden scrollbars

### Accessibility
- **Reduced motion**: Respects `prefers-reduced-motion` OS setting
- **Focus states**: Visible focus rings on all interactive elements
- **Semantic colors**: High contrast ratios for WCAG AA compliance
- **Loading states**: Skeleton loaders that match content structure

### Component Structure
All components use Tailwind utility classes exclusively (no CSS modules):
- `frontend/src/components/` - Reusable UI components
- `frontend/src/pages/` - Page-level components
- `frontend/src/contexts/ThemeContext.tsx` - Theme management
- `frontend/src/components/Skeleton/` - Loading state components

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
