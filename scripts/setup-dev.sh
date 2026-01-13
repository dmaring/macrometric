#!/bin/bash
# Development environment setup script for macrometric

set -e

echo "Setting up macrometric development environment..."

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Created .env - please update with your settings if needed"
else
    echo ".env file already exists"
fi

# Create backend .env from example if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from backend/.env.example..."
    cp backend/.env.example backend/.env
    echo "Created backend/.env - please update with your settings if needed"
else
    echo "backend/.env file already exists"
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start the development environment with Docker:"
echo "  docker compose up --build"
echo ""
echo "To start with watch mode (auto-sync file changes):"
echo "  docker compose up --build --watch"
echo ""
echo "To seed the database with test users:"
echo "  docker compose run --rm seed-db"
echo ""
echo "  Test accounts created:"
echo "    - test@example.com / TestPass123"
echo "    - dev@example.com / DevPass123"
echo ""
echo "To run backend tests with Docker:"
echo "  docker compose run --rm backend pytest"
echo ""
echo "For local development without Docker:"
echo "  Backend: cd backend && uv venv && source .venv/bin/activate && uv pip install -e '.[dev]'"
echo "  Frontend: cd frontend && npm install && npm run dev"
