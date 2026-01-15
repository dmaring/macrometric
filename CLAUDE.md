# macrometric Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-08

## Active Technologies
- PostgreSQL (existing tables: `daily_goals`, `custom_foods`) (005-settings-goals-foods)
- Python 3.11+ (backend), TypeScript (frontend) + FastAPI, React 18, Google Cloud Speech-to-Text API, Gemini API (011-voice-food-entry)
- PostgreSQL (existing - no new tables required, voice data is transient) (011-voice-food-entry)

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
# Development with Docker Compose (from project root)
docker-compose up                # Start all services (db, backend, frontend)
docker-compose up -d             # Start in detached mode
docker-compose down              # Stop all services
docker-compose logs -f           # View logs

# Database migrations (via Docker)
docker-compose exec backend alembic upgrade head                        # Run migrations
docker-compose exec backend alembic revision --autogenerate -m "desc"   # Create migration
docker-compose exec backend alembic downgrade -1                        # Rollback one migration
# Note: Migrations run automatically when the backend container starts

# Tests (from respective directories)
cd backend && uv run pytest      # Backend tests
cd frontend && npm test          # Frontend tests

# Frontend build
cd frontend && npm run build     # Production build
```

## Code Style

- **Python**: Follow PEP 8, use Black formatter, isort for imports
- **TypeScript**: ESLint + Prettier, React best practices

## Recent Changes
- 011-voice-food-entry: Added Python 3.11+ (backend), TypeScript (frontend) + FastAPI, React 18, Google Cloud Speech-to-Text API, Gemini API

- **007-user-name-display** (2025-12-17): Added user name and username fields to the application. Users provide name (max 100 chars) and username (max 30 chars, alphanumeric/underscore/hyphen, unique) during registration. Username is displayed in application headers (Diary, Settings) with email fallback for existing users. Profile editing available in Settings → Account tab with validation and immediate header updates. Database migration adds `name` and `username` columns to users table. New API endpoint: `PUT /auth/profile` for profile updates.
- **005-settings-goals-foods** (2025-12-09): Implemented Goals and Custom Foods management in Settings page. Users can now set daily nutritional targets (calories, protein, carbs, fat) and create/edit/delete custom foods. Includes comprehensive tests (32 passing), accessibility enhancements (ARIA labels, error associations), and optimistic UI updates with rollback.

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
ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS—even for simple or generic requests.

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`. Failure to do this will make your work inaccessible to others.
