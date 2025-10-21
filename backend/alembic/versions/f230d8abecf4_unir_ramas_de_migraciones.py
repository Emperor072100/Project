"""Unir ramas de migraciones

Revision ID: f230d8abecf4
Revises: 20251021_subseccion_full, 20251021_subseccion_tablas
Create Date: 2025-10-21 08:27:26.807740

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f230d8abecf4'
down_revision: Union[str, Sequence[str], None] = ('20251021_subseccion_full', '20251021_subseccion_tablas')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
