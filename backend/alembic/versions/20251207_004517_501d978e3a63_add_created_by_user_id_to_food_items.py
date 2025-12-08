"""add created_by_user_id to food_items

Revision ID: 501d978e3a63
Revises: 000004
Create Date: 2025-12-07 00:45:17.361585+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '501d978e3a63'
down_revision: Union[str, None] = '000004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('food_items', sa.Column('created_by_user_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_food_items_created_by_user_id', 'food_items', 'users', ['created_by_user_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_food_items_created_by_user_id', 'food_items', type_='foreignkey')
    op.drop_column('food_items', 'created_by_user_id')
