"""Unit tests for Diary Service.

These tests verify the diary service business logic.
They should FAIL before implementation.
"""
import pytest
from datetime import date
from decimal import Decimal
from unittest.mock import MagicMock, patch
import uuid


class TestDiaryServiceCalculations:
    """Unit tests for diary total calculations."""

    def test_calculate_entry_macros_with_quantity(self):
        """Entry macros should be multiplied by quantity."""
        from src.services.diary import DiaryService

        # Mock food with 100 cal per serving
        food = MagicMock()
        food.calories = 100
        food.protein_g = Decimal("10.0")
        food.carbs_g = Decimal("20.0")
        food.fat_g = Decimal("5.0")

        result = DiaryService.calculate_entry_macros(food, quantity=2.0)

        assert result["calories"] == 200
        assert result["protein_g"] == Decimal("20.0")
        assert result["carbs_g"] == Decimal("40.0")
        assert result["fat_g"] == Decimal("10.0")

    def test_calculate_entry_macros_fractional_quantity(self):
        """Fractional quantities should calculate correctly."""
        from src.services.diary import DiaryService

        food = MagicMock()
        food.calories = 100
        food.protein_g = Decimal("10.0")
        food.carbs_g = Decimal("20.0")
        food.fat_g = Decimal("5.0")

        result = DiaryService.calculate_entry_macros(food, quantity=0.5)

        assert result["calories"] == 50
        assert result["protein_g"] == Decimal("5.0")
        assert result["carbs_g"] == Decimal("10.0")
        assert result["fat_g"] == Decimal("2.5")

    def test_calculate_daily_totals_empty(self):
        """Empty entries should return zero totals."""
        from src.services.diary import DiaryService

        result = DiaryService.calculate_daily_totals([])

        assert result["calories"] == 0
        assert result["protein_g"] == Decimal("0")
        assert result["carbs_g"] == Decimal("0")
        assert result["fat_g"] == Decimal("0")

    def test_calculate_daily_totals_multiple_entries(self):
        """Multiple entries should sum correctly."""
        from src.services.diary import DiaryService

        entries = [
            MagicMock(
                quantity=1.0,
                food=MagicMock(
                    calories=100,
                    protein_g=Decimal("10.0"),
                    carbs_g=Decimal("20.0"),
                    fat_g=Decimal("5.0")
                )
            ),
            MagicMock(
                quantity=2.0,
                food=MagicMock(
                    calories=150,
                    protein_g=Decimal("15.0"),
                    carbs_g=Decimal("25.0"),
                    fat_g=Decimal("8.0")
                )
            )
        ]

        result = DiaryService.calculate_daily_totals(entries)

        # 100*1 + 150*2 = 400 calories
        assert result["calories"] == 400
        # 10*1 + 15*2 = 40 protein
        assert result["protein_g"] == Decimal("40.0")
        # 20*1 + 25*2 = 70 carbs
        assert result["carbs_g"] == Decimal("70.0")
        # 5*1 + 8*2 = 21 fat
        assert result["fat_g"] == Decimal("21.0")


class TestDiaryServiceValidation:
    """Unit tests for diary service validation."""

    def test_validate_quantity_positive(self):
        """Positive quantity should be valid."""
        from src.services.diary import DiaryService

        assert DiaryService.validate_quantity(1.0) is True
        assert DiaryService.validate_quantity(0.5) is True
        assert DiaryService.validate_quantity(10.0) is True

    def test_validate_quantity_zero_invalid(self):
        """Zero quantity should be invalid."""
        from src.services.diary import DiaryService

        assert DiaryService.validate_quantity(0) is False

    def test_validate_quantity_negative_invalid(self):
        """Negative quantity should be invalid."""
        from src.services.diary import DiaryService

        assert DiaryService.validate_quantity(-1.0) is False

    def test_validate_date_today_valid(self):
        """Today's date should be valid."""
        from src.services.diary import DiaryService

        assert DiaryService.validate_entry_date(date.today()) is True

    def test_validate_date_past_valid(self):
        """Past dates should be valid."""
        from src.services.diary import DiaryService
        from datetime import timedelta

        past_date = date.today() - timedelta(days=30)
        assert DiaryService.validate_entry_date(past_date) is True

    def test_validate_date_far_future_invalid(self):
        """Dates more than 1 year in future should be invalid."""
        from src.services.diary import DiaryService
        from datetime import timedelta

        future_date = date.today() + timedelta(days=400)
        assert DiaryService.validate_entry_date(future_date) is False

    def test_validate_date_near_future_valid(self):
        """Dates less than 1 year in future should be valid."""
        from src.services.diary import DiaryService
        from datetime import timedelta

        future_date = date.today() + timedelta(days=30)
        assert DiaryService.validate_entry_date(future_date) is True


class TestDiaryServiceEntryManagement:
    """Unit tests for entry management operations."""

    def test_group_entries_by_category(self):
        """Entries should be grouped by category correctly."""
        from src.services.diary import DiaryService

        cat1_id = uuid.uuid4()
        cat2_id = uuid.uuid4()

        entries = [
            MagicMock(category_id=cat1_id, id=uuid.uuid4()),
            MagicMock(category_id=cat1_id, id=uuid.uuid4()),
            MagicMock(category_id=cat2_id, id=uuid.uuid4()),
        ]

        result = DiaryService.group_entries_by_category(entries)

        assert len(result[cat1_id]) == 2
        assert len(result[cat2_id]) == 1

    def test_group_entries_empty(self):
        """Empty entries should return empty dict."""
        from src.services.diary import DiaryService

        result = DiaryService.group_entries_by_category([])
        assert result == {}
