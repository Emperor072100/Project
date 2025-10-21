"""unir ramas

Revision ID: 928122d35970
Revises: add_comentario_produccion_column, 20251021_fix_lider_column, c2137896b93b
Create Date: 2025-10-21 08:59:34.022686

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '928122d35970'
down_revision: Union[str, Sequence[str], None] = ('add_comentario_produccion_column', '20251021_fix_lider_column', 'c2137896b93b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
