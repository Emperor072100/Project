"""Empty migration placeholder to fix Alembic error

Revision ID: f82302fb41de
Revises: (coloca aquí el revision id anterior si lo sabes, o None)
Create Date: 2025-10-23
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f82302fb41de'
down_revision: Union[str, Sequence[str], None] = None  # Cambia esto si sabes el revision anterior
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
