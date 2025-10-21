"""Unir ramas de migraciones

Revision ID: 62a2db661ceb
Revises: crear_tablas_subsecciones_personalizadas, f82302fb41de
Create Date: 2025-10-20 11:27:33.163988

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '62a2db661ceb'
down_revision: Union[str, Sequence[str], None] = 'rename_campaign_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
