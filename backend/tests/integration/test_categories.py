"""
Integration tests for category management workflows.

Tests complete category lifecycle and interaction with diary entries.
"""

import pytest
from datetime import date


class TestCategoryLifecycle:
    """Test full category CRUD lifecycle."""

    def test_create_update_delete_category(self, client, auth_headers):
        """Create, update, then delete a category."""
        # Create
        create_response = client.post(
            "/api/v1/categories",
            json={"name": "Pre-Workout"},
            headers=auth_headers
        )
        assert create_response.status_code == 201
        category_id = create_response.json()["id"]

        # Update
        update_response = client.put(
            f"/api/v1/categories/{category_id}",
            json={"name": "Post-Workout"},
            headers=auth_headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Post-Workout"

        # Delete
        delete_response = client.delete(
            f"/api/v1/categories/{category_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 204

        # Verify deleted
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        assert not any(c["id"] == category_id for c in categories)

    def test_category_with_diary_workflow(self, client, auth_headers, sample_custom_food):
        """Create category, add entries, attempt delete, migrate entries, then delete."""
        # Create new category
        snacks_response = client.post(
            "/api/v1/categories",
            json={"name": "Snacks"},
            headers=auth_headers
        )
        snacks_id = snacks_response.json()["id"]

        # Add entry to Snacks
        today = date.today().isoformat()
        entry_response = client.post(
            f"/api/v1/diary/{today}/entries",
            json={
                "category_id": snacks_id,
                "food_id": sample_custom_food["id"],
                "quantity": 1.5
            },
            headers=auth_headers
        )
        entry_id = entry_response.json()["id"]

        # Try to delete category (should fail)
        delete_response = client.delete(
            f"/api/v1/categories/{snacks_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 409

        # Get Breakfast category to migrate to
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        breakfast_id = next(c["id"] for c in categories if c["name"] == "Breakfast")

        # Move entry to Breakfast
        client.put(
            f"/api/v1/diary/entries/{entry_id}",
            json={"category_id": breakfast_id},
            headers=auth_headers
        )

        # Now delete should work
        delete_response = client.delete(
            f"/api/v1/categories/{snacks_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 204

    def test_reorder_persists_across_sessions(self, client, auth_headers):
        """Category order persists across multiple API calls."""
        # Get categories
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        reversed_ids = [c["id"] for c in reversed(categories)]

        # Reorder
        client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": reversed_ids},
            headers=auth_headers
        )

        # Fetch multiple times to verify persistence
        for _ in range(3):
            result = client.get("/api/v1/categories", headers=auth_headers).json()
            result_ids = [c["id"] for c in result]
            assert result_ids == reversed_ids

    def test_multiple_category_operations(self, client, auth_headers):
        """Perform multiple category operations in sequence."""
        # Create two categories
        cat1 = client.post(
            "/api/v1/categories",
            json={"name": "Morning"},
            headers=auth_headers
        ).json()
        cat2 = client.post(
            "/api/v1/categories",
            json={"name": "Evening"},
            headers=auth_headers
        ).json()

        # Update both
        client.put(
            f"/api/v1/categories/{cat1['id']}",
            json={"name": "Early Morning"},
            headers=auth_headers
        )
        client.put(
            f"/api/v1/categories/{cat2['id']}",
            json={"name": "Late Evening"},
            headers=auth_headers
        )

        # Reorder all categories
        all_categories = client.get("/api/v1/categories", headers=auth_headers).json()
        # Move our new categories to the front
        new_order = [cat1["id"], cat2["id"]] + [
            c["id"] for c in all_categories if c["id"] not in [cat1["id"], cat2["id"]]
        ]
        client.put(
            "/api/v1/categories/reorder",
            json={"category_ids": new_order},
            headers=auth_headers
        )

        # Verify final state
        final_categories = client.get("/api/v1/categories", headers=auth_headers).json()
        assert final_categories[0]["name"] == "Early Morning"
        assert final_categories[1]["name"] == "Late Evening"

    def test_category_affects_diary_grouping(self, client, auth_headers, sample_custom_food):
        """Entries are grouped by category in diary view."""
        from datetime import date

        # Create new category
        snacks_response = client.post(
            "/api/v1/categories",
            json={"name": "Snacks"},
            headers=auth_headers
        )
        snacks_id = snacks_response.json()["id"]

        # Get breakfast category
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        breakfast_id = next(c["id"] for c in categories if c["name"] == "Breakfast")

        # Add entries to different categories
        today = date.today().isoformat()
        client.post(
            f"/api/v1/diary/{today}/entries",
            json={
                "category_id": breakfast_id,
                "food_id": sample_custom_food["id"],
                "quantity": 1.0
            },
            headers=auth_headers
        )
        client.post(
            f"/api/v1/diary/{today}/entries",
            json={
                "category_id": snacks_id,
                "food_id": sample_custom_food["id"],
                "quantity": 0.5
            },
            headers=auth_headers
        )

        # Get diary
        diary = client.get(f"/api/v1/diary/{today}", headers=auth_headers).json()

        # Verify separate grouping
        breakfast_cat = next(c for c in diary["categories"] if c["id"] == breakfast_id)
        snacks_cat = next(c for c in diary["categories"] if c["id"] == snacks_id)

        assert len(breakfast_cat["entries"]) == 1
        assert breakfast_cat["entries"][0]["quantity"] == 1.0

        assert len(snacks_cat["entries"]) == 1
        assert snacks_cat["entries"][0]["quantity"] == 0.5


class TestCategoryEdgeCases:
    """Test edge cases and error handling."""

    def test_delete_all_custom_categories(self, client, auth_headers):
        """Can delete all custom categories, keeping only defaults."""
        # Get all categories
        categories = client.get("/api/v1/categories", headers=auth_headers).json()

        # Delete all non-default categories
        for cat in categories:
            if not cat["is_default"]:
                response = client.delete(
                    f"/api/v1/categories/{cat['id']}",
                    headers=auth_headers
                )
                # Should succeed only if no entries
                assert response.status_code in [204, 409]

        # Should still have default categories
        remaining = client.get("/api/v1/categories", headers=auth_headers).json()
        assert len(remaining) >= 3  # At least Breakfast, Lunch, Dinner
        assert all(c["is_default"] for c in remaining)

    def test_rapid_reorder_operations(self, client, auth_headers):
        """Handle rapid consecutive reorder operations."""
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        category_ids = [c["id"] for c in categories]

        # Perform multiple reorders rapidly
        for _ in range(5):
            # Shuffle order differently each time
            import random
            shuffled = random.sample(category_ids, len(category_ids))
            response = client.put(
                "/api/v1/categories/reorder",
                json={"category_ids": shuffled},
                headers=auth_headers
            )
            assert response.status_code == 200

        # Final state should be consistent
        final = client.get("/api/v1/categories", headers=auth_headers).json()
        assert len(final) == len(categories)

    def test_category_name_case_sensitivity(self, client, auth_headers):
        """Category names are case-sensitive."""
        # Create category
        client.post(
            "/api/v1/categories",
            json={"name": "Snacks"},
            headers=auth_headers
        )

        # Creating with different case should work (case-sensitive)
        response = client.post(
            "/api/v1/categories",
            json={"name": "snacks"},
            headers=auth_headers
        )
        assert response.status_code == 201

    def test_concurrent_category_updates(self, client, auth_headers):
        """Handle concurrent updates to different categories."""
        # Create two categories
        cat1 = client.post(
            "/api/v1/categories",
            json={"name": "Cat1"},
            headers=auth_headers
        ).json()
        cat2 = client.post(
            "/api/v1/categories",
            json={"name": "Cat2"},
            headers=auth_headers
        ).json()

        # Update both simultaneously (in rapid succession)
        response1 = client.put(
            f"/api/v1/categories/{cat1['id']}",
            json={"name": "Updated Cat1"},
            headers=auth_headers
        )
        response2 = client.put(
            f"/api/v1/categories/{cat2['id']}",
            json={"name": "Updated Cat2"},
            headers=auth_headers
        )

        assert response1.status_code == 200
        assert response2.status_code == 200

        # Verify both updates persisted
        categories = client.get("/api/v1/categories", headers=auth_headers).json()
        names = {c["id"]: c["name"] for c in categories}
        assert names[cat1["id"]] == "Updated Cat1"
        assert names[cat2["id"]] == "Updated Cat2"
