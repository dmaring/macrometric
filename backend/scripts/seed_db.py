#!/usr/bin/env python3
"""Database seeding script for development.

Creates test users with default meal categories and goals.
Run with: python -m scripts.seed_db
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.models.base import Base
from src.models.user import User
from src.models.meal_category import MealCategory
from src.models.daily_goal import DailyGoal
from src.core.security import get_password_hash
from src.core.config import settings


# Test users to seed
TEST_USERS = [
    {
        "email": "test@example.com",
        "password": "TestPass123",
        "onboarding_completed": True,
    },
    {
        "email": "dev@example.com",
        "password": "DevPass123",
        "onboarding_completed": True,
    },
]

# Default meal categories
DEFAULT_CATEGORIES = [
    ("Breakfast", 1),
    ("Lunch", 2),
    ("Dinner", 3),
]

# Default daily goals
DEFAULT_GOALS = {
    "calories": 2000,
    "protein_g": 150,
    "carbs_g": 200,
    "fat_g": 65,
}


def seed_database():
    """Seed the database with test data."""
    database_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    print(f"Connecting to database: {database_url.split('@')[-1]}")  # Hide credentials

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()

    try:
        created_users = []

        for user_data in TEST_USERS:
            # Check if user already exists
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if existing:
                print(f"User {user_data['email']} already exists, skipping...")
                continue

            # Create user
            user = User(
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                onboarding_completed=user_data["onboarding_completed"],
            )
            db.add(user)
            db.flush()  # Get the user ID

            # Create default meal categories
            for name, order in DEFAULT_CATEGORIES:
                category = MealCategory(
                    user_id=user.id,
                    name=name,
                    display_order=order,
                    is_default=True,
                )
                db.add(category)

            # Create default daily goals
            goal = DailyGoal(
                user_id=user.id,
                **DEFAULT_GOALS,
            )
            db.add(goal)

            created_users.append(user_data["email"])
            print(f"Created user: {user_data['email']} with password: {user_data['password']}")

        db.commit()

        if created_users:
            print(f"\n✓ Successfully seeded {len(created_users)} user(s)")
        else:
            print("\n✓ No new users created (all already exist)")

        # Show all users
        print("\nExisting users:")
        users = db.query(User).all()
        for user in users:
            print(f"  - {user.email}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
