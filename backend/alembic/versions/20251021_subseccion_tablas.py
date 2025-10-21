"""create tables for subseccion implementacion

Revision ID: 20251021_subseccion_tablas
Revises: 62a2db661ceb
Create Date: 2025-10-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '20251021_subseccion_tablas'
down_revision: Union[str, Sequence[str], None] = '62a2db661ceb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    pass

def downgrade() -> None:
    """Downgrade schema."""
    pass
