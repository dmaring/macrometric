#!/usr/bin/env python3
"""Reset database and seed test user.

Usage:
    # From backend directory:
    python scripts/reset_db.py

    # Or via docker-compose:
    docker-compose exec backend python scripts/reset_db.py
"""
import subprocess
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text

from src.core.database import SessionLocal, engine
from src.core.security import get_password_hash
from src.models.user import User
from src.models.meal_category import MealCategory


# Test user credentials
TEST_USER = {
    "email": "test@test.com",
    "password": "Test1234",
    "name": "Test User",
    "username": "testuser",
}


def reset_database():
    """Reset database by dropping all tables and running migrations."""
    print("Resetting database...")

    # Drop all tables using raw SQL (more reliable than alembic downgrade)
    with engine.connect() as conn:
        # Drop all tables in the public schema
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
        conn.commit()
    print("  - Dropped all tables")

    # Upgrade to head (recreate all tables)
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Error during upgrade: {result.stderr}")
        sys.exit(1)
    print("  - Ran migrations")

    print("Database reset complete!")


def seed_test_user():
    """Create test user with default meal categories."""
    print("\nSeeding test user...")

    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == TEST_USER["email"]).first()
        if existing:
            print(f"  - User {TEST_USER['email']} already exists, skipping")
            return

        # Create user
        user = User(
            email=TEST_USER["email"],
            password_hash=get_password_hash(TEST_USER["password"]),
            name=TEST_USER["name"],
            username=TEST_USER["username"],
            onboarding_completed=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"  - Created user: {TEST_USER['email']}")

        # Create default meal categories
        default_categories = [
            ("Breakfast", 1),
            ("Lunch", 2),
            ("Dinner", 3),
        ]

        for name, order in default_categories:
            category = MealCategory(
                user_id=user.id,
                name=name,
                display_order=order,
                is_default=True,
            )
            db.add(category)

        db.commit()
        print("  - Created default meal categories")

        print("\nTest user created successfully!")
        print(f"  Email:    {TEST_USER['email']}")
        print(f"  Password: {TEST_USER['password']}")
        print(f"  Username: {TEST_USER['username']}")

    finally:
        db.close()


def main():
    print("=" * 50)
    print("Database Reset & Seed Script")
    print("=" * 50)

    reset_database()
    seed_test_user()

    print("\n" + "=" * 50)
    print("Done!")
    print("=" * 50)


if __name__ == "__main__":
    main()
