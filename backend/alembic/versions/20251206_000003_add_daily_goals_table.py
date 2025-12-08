"""Add daily_goals table

Revision ID: 000003
Revises: 000002
Create Date: 2025-12-06 22:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '000003'
down_revision = '000002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create daily_goals table
    op.create_table(
        'daily_goals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('calories', sa.Integer(), nullable=True),
        sa.Column('protein_g', sa.DECIMAL(precision=6, scale=2), nullable=True),
        sa.Column('carbs_g', sa.DECIMAL(precision=6, scale=2), nullable=True),
        sa.Column('fat_g', sa.DECIMAL(precision=6, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_daily_goals_user_id'), 'daily_goals', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_daily_goals_user_id'), table_name='daily_goals')
    op.drop_table('daily_goals')
