"""Add name and username fields to users table

Revision ID: 20251217_000001
Revises: 5814e373463e
Create Date: 2025-12-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20251217_000001'
down_revision: Union[str, None] = '5814e373463e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add name column (nullable for existing users, max 100 chars)
    op.add_column('users', sa.Column('name', sa.String(length=100), nullable=True))

    # Add username column (nullable for existing users, max 30 chars)
    op.add_column('users', sa.Column('username', sa.String(length=30), nullable=True))

    # Create unique index on username for uniqueness constraint
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    # Drop the unique index on username
    op.drop_index(op.f('ix_users_username'), table_name='users')

    # Remove the columns
    op.drop_column('users', 'username')
    op.drop_column('users', 'name')
