"""add custom_foods table

Revision ID: 000004
Revises: 000003
Create Date: 2025-12-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '000004'
down_revision = '000003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'custom_foods',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('brand', sa.String(255), nullable=True),
        sa.Column('serving_size', sa.DECIMAL(8, 2), nullable=False),
        sa.Column('serving_unit', sa.String(50), nullable=False),
        sa.Column('calories', sa.Integer(), nullable=False),
        sa.Column('protein_g', sa.DECIMAL(6, 2), nullable=False),
        sa.Column('carbs_g', sa.DECIMAL(6, 2), nullable=False),
        sa.Column('fat_g', sa.DECIMAL(6, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_custom_foods_user_id', 'custom_foods', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_custom_foods_user_id', 'custom_foods')
    op.drop_table('custom_foods')
