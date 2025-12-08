"""
Contract tests for category reorder API endpoint.

Tests reordering meal categories for drag-and-drop functionality.
"""

import pytest


class TestCategoryReorder:
    """Test PUT /categories/reorder endpoint."""

    def test_reorder_categories_success(self, client, auth_headers):
        """PUT /categories/reorder updates display order."""
        # Get current categories
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        assert len(categories) >= 3

        # Reverse the order
        reversed_ids = [c["id"] for c in reversed(categories)]

        # Reorder
        response = client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": reversed_ids},
            headers=auth_headers
        )
        assert response.status_code == 200

        # Verify new order
        updated_categories = client.get("/api/v1/categories", headers=auth_headers).json()
        updated_ids = [c["id"] for c in updated_categories]
        assert updated_ids == reversed_ids

    def test_reorder_preserves_category_data(self, client, auth_headers):
        """Reordering only changes display_order, not other fields."""
        # Get original categories
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        original_names = {c["id"]: c["name"] for c in categories}
        original_defaults = {c["id"]: c["is_default"] for c in categories}

        # Reorder
        reversed_ids = [c["id"] for c in reversed(categories)]
        client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": reversed_ids},
            headers=auth_headers
        )

        # Verify other fields unchanged
        updated_categories = client.get("/api/v1/categories", headers=auth_headers).json()
        for cat in updated_categories:
            assert cat["name"] == original_names[cat["id"]]
            assert cat["is_default"] == original_defaults[cat["id"]]

    def test_reorder_validation_missing_categories(self, client, auth_headers):
        """Cannot reorder with missing categories."""
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        # Only provide some of the IDs
        partial_ids = [categories[0]["id"]]

        response = client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": partial_ids},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_reorder_validation_extra_categories(self, client, auth_headers):
        """Cannot reorder with extra/invalid categories."""
        from uuid import uuid4

        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        category_ids = [c["id"] for c in categories]
        # Add a fake ID
        category_ids.append(str(uuid4()))

        response = client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": category_ids},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_reorder_validation_duplicate_categories(self, client, auth_headers):
        """Cannot reorder with duplicate category IDs."""
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        # Duplicate first ID
        category_ids = [categories[0]["id"], categories[0]["id"]]

        response = client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": category_ids},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_reorder_requires_array(self, client, auth_headers):
        """Reorder requires category_ids array."""
        response = client.put(
            "/api/v1/categories/reorder",
            json={},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_reorder_user_isolation(self, client, auth_headers):
        """User cannot reorder another user's categories."""
        # User 1 categories
        user1_categories = client.get("/api/v1/categories", headers=auth_headers).json()
        user1_ids = [c["id"] for c in user1_categories]

        # Create user 2
        user2_data = {"email": "user2@example.com", "password": "password123"}
        client.post("/api/v1/auth/register", json=user2_data)
        login_response = client.post("/api/v1/auth/login", json=user2_data)
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User 2 tries to reorder user 1's categories
        response = client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": user1_ids},
            headers=user2_headers
        )
        # Should fail - user 2 doesn't own those categories
        assert response.status_code == 422

    def test_reorder_affects_diary_display(self, client, auth_headers, sample_custom_food):
        """Reordering categories affects diary display order."""
        from datetime import date

        # Get categories and add entries to multiple
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        today = date.today().isoformat()

        # Add entry to each category
        for cat in categories[:2]:
            entry_data = {
                "category_id": cat["id"],
                "food_id": sample_custom_food["id"],
                "quantity": 1.0
            }
            client.post(
                f"/api/v1/diary/{today}/entries",
                json=entry_data,
                headers=auth_headers
            )

        # Reverse category order
        reversed_ids = [c["id"] for c in reversed(categories)]
        client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": reversed_ids},
            headers=auth_headers
        )

        # Get diary and verify category order
        diary = client.get(f"/api/v1/diary/{today}", headers=auth_headers).json()
        diary_cat_ids = [c["id"] for c in diary["categories"]]
        assert diary_cat_ids == reversed_ids

    def test_reorder_empty_list(self, client, auth_headers):
        """Cannot reorder with empty category list."""
        response = client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": []},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_reorder_single_category(self, client, auth_headers):
        """Can 'reorder' single category (no-op but valid)."""
        categories = client.get("/api/v1/categories", headers=auth_headers).json()

        # If only one category exists, this is valid
        if len(categories) == 1:
            response = client.put(
                "/api/v1/categories/reorder",
                json={"category_ids": [categories[0]["id"]]},
                headers=auth_headers
            )
            assert response.status_code == 200
