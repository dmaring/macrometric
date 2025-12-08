# Quickstart Guide: Macro Calorie Tracker

## Prerequisites

- **Python**: 3.11 or higher
- **uv**: Python package manager (https://docs.astral.sh/uv/)
- **Node.js**: 18 or higher (with npm)
- **PostgreSQL**: 15 or higher
- **Docker** (optional): For containerized development

### Installing uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## Quick Setup with Docker (Recommended)

```bash
# Clone and enter the repository
cd macrometric

# Start all services
docker-compose up -d

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## Manual Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb macrometric

# Or with psql
psql -c "CREATE DATABASE macrometric;"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment and install dependencies with uv
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
uv run alembic upgrade head

# Start the development server
uv run uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env if backend URL differs from default

# Start the development server
npm run dev
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/macrometric

# JWT Authentication
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# USDA API (optional - for higher rate limits)
USDA_API_KEY=your-api-key-here

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Verify Installation

### Backend Health Check

```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### API Documentation

Open http://localhost:8000/docs in your browser to see the interactive Swagger UI.

### Frontend

Open http://localhost:3000 in your browser. You should see the login page.

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
uv run pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

```bash
# Create a new migration
cd backend
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback last migration
uv run alembic downgrade -1
```

### Code Formatting

```bash
# Backend (Python)
cd backend
uv run black src/
uv run isort src/

# Frontend (TypeScript/JavaScript)
cd frontend
npm run lint
npm run format
```

## Common Issues

### Database Connection Failed

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env matches your credentials
- Ensure database exists: `psql -l | grep macrometric`

### CORS Errors

- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check that the backend is running on the expected port

### USDA API Rate Limiting

- If you see 429 errors, you're hitting rate limits
- Register for a free API key at https://fdc.nal.usda.gov/api-key-signup.html
- Add the key to USDA_API_KEY in backend .env

## Next Steps

1. Create a user account via the registration page
2. Complete onboarding (set daily goals or skip)
3. Start logging foods from the daily diary
4. Try searching for foods and creating custom items

## Useful Commands

```bash
# View backend logs (Docker)
docker-compose logs -f backend

# Access database shell
docker-compose exec db psql -U postgres macrometric

# Rebuild containers after changes
docker-compose up -d --build
```
