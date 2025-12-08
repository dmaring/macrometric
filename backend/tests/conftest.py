"""Pytest configuration and fixtures for backend tests."""
import pytest
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from main import app
from src.models.base import Base
from src.core.deps import get_db

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data() -> dict:
    """Sample user registration data."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123"
    }


@pytest.fixture
def auth_headers(client: TestClient, test_user_data: dict) -> dict:
    """Create a user and return authentication headers."""
    # Register user
    client.post("/api/v1/auth/register", json=test_user_data)

    # Login and get token
    response = client.post("/api/v1/auth/login", json=test_user_data)
    token = response.json().get("access_token")

    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_custom_food(client: TestClient, auth_headers: dict) -> dict:
    """Create a sample custom food for testing."""
    food_data = {
        "name": "Test Food",
        "brand": "Test Brand",
        "serving_size": 100.0,
        "serving_unit": "g",
        "calories": 200,
        "protein_g": 10.0,
        "carbs_g": 20.0,
        "fat_g": 5.0,
    }

    response = client.post(
        "/api/v1/custom-foods",
        json=food_data,
        headers=auth_headers
    )

    result = response.json()
    # Extract UUID from "custom:uuid" format
    food_id = result["id"].replace("custom:", "")
    result["id"] = food_id

    return result


@pytest.fixture
def db_session(db: Session) -> Session:
    """Alias for db fixture for compatibility with tests."""
    return db


@pytest.fixture
def sample_meal_category(client: TestClient, auth_headers: dict) -> dict:
    """Get the default Breakfast category created during user registration."""
    response = client.get("/api/v1/categories", headers=auth_headers)
    categories = response.json()

    # Find Breakfast category (created automatically)
    breakfast = next((cat for cat in categories if cat["name"] == "Breakfast"), None)

    if breakfast:
        return breakfast

    # If not found, return first category
    return categories[0] if categories else None


def create_test_custom_food(client: TestClient, auth_headers: dict, **kwargs) -> dict:
    """Helper to create custom food via API for tests."""
    food_data = {
        "name": kwargs.get("name", "Test Food"),
        "brand": kwargs.get("brand"),
        "serving_size": float(kwargs.get("serving_size", 100.0)),
        "serving_unit": kwargs.get("serving_unit", "g"),
        "calories": int(kwargs.get("calories", 100)),
        "protein_g": float(kwargs.get("protein_g", 5.0)),
        "carbs_g": float(kwargs.get("carbs_g", 10.0)),
        "fat_g": float(kwargs.get("fat_g", 3.0)),
    }

    # Remove None values
    food_data = {k: v for k, v in food_data.items() if v is not None}

    response = client.post(
        "/api/v1/custom-foods",
        json=food_data,
        headers=auth_headers
    )

    result = response.json()
    # Extract UUID from "custom:uuid" format
    food_id = result["id"].replace("custom:", "")
    result["id"] = food_id

    return result
