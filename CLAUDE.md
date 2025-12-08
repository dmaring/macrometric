# macrometric Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-06

## Active Technologies

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: TypeScript, React, React Router, Axios, Vite
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

- 001-macro-calorie-tracker: Macro nutrient and calorie tracking application

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
