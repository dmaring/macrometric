"""Add MealCategory, FoodItem, DiaryEntry tables

Revision ID: 000002
Revises: 000001
Create Date: 2025-12-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '000002'
down_revision: Union[str, None] = '000001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create meal_categories table
    op.create_table(
        'meal_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='uq_user_category_name')
    )
    op.create_index(op.f('ix_meal_categories_id'), 'meal_categories', ['id'], unique=False)
    op.create_index(op.f('ix_meal_categories_user_id'), 'meal_categories', ['user_id'], unique=False)

    # Create food_source enum
    food_source_enum = postgresql.ENUM('api', 'custom', 'meal_component', name='foodsource', create_type=False)
    food_source_enum.create(op.get_bind(), checkfirst=True)

    # Create food_items table
    op.create_table(
        'food_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('external_id', sa.String(length=50), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('brand', sa.String(length=255), nullable=True),
        sa.Column('serving_size', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('serving_unit', sa.String(length=20), nullable=False),
        sa.Column('calories', sa.Integer(), nullable=False),
        sa.Column('protein_g', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('carbs_g', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('fat_g', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('source', postgresql.ENUM('api', 'custom', 'meal_component', name='foodsource', create_type=False), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_food_items_id'), 'food_items', ['id'], unique=False)
    op.create_index(op.f('ix_food_items_external_id'), 'food_items', ['external_id'], unique=False)
    op.create_index(op.f('ix_food_items_name'), 'food_items', ['name'], unique=False)

    # Create diary_entries table
    op.create_table(
        'diary_entries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('food_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entry_date', sa.Date(), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['meal_categories.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['food_id'], ['food_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_diary_entries_id'), 'diary_entries', ['id'], unique=False)
    op.create_index(op.f('ix_diary_entries_user_id'), 'diary_entries', ['user_id'], unique=False)
    op.create_index(op.f('ix_diary_entries_category_id'), 'diary_entries', ['category_id'], unique=False)
    op.create_index(op.f('ix_diary_entries_entry_date'), 'diary_entries', ['entry_date'], unique=False)
    op.create_index('ix_diary_entries_user_date', 'diary_entries', ['user_id', 'entry_date'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_diary_entries_user_date', table_name='diary_entries')
    op.drop_index(op.f('ix_diary_entries_entry_date'), table_name='diary_entries')
    op.drop_index(op.f('ix_diary_entries_category_id'), table_name='diary_entries')
    op.drop_index(op.f('ix_diary_entries_user_id'), table_name='diary_entries')
    op.drop_index(op.f('ix_diary_entries_id'), table_name='diary_entries')
    op.drop_table('diary_entries')

    op.drop_index(op.f('ix_food_items_name'), table_name='food_items')
    op.drop_index(op.f('ix_food_items_external_id'), table_name='food_items')
    op.drop_index(op.f('ix_food_items_id'), table_name='food_items')
    op.drop_table('food_items')

    # Drop enum
    food_source_enum = postgresql.ENUM('api', 'custom', 'meal_component', name='foodsource')
    food_source_enum.drop(op.get_bind())

    op.drop_index(op.f('ix_meal_categories_user_id'), table_name='meal_categories')
    op.drop_index(op.f('ix_meal_categories_id'), table_name='meal_categories')
    op.drop_table('meal_categories')
