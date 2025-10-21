"""fix column name lider_de_campaña in campanas_campanas

Revision ID: 20251021_fix_lider_column
Revises: f230d8abecf4
Create Date: 2025-10-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '20251021_fix_lider_column'
down_revision: Union[str, Sequence[str], None] = 'f230d8abecf4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
