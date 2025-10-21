"""add_comentario_produccion_to_implementaciones

Revision ID: c2137896b93b
Revises: rename_campaign_tables
Create Date: 2025-10-20 13:56:34.013389

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c2137896b93b'
down_revision: Union[str, Sequence[str], None] = 'rename_campaign_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Agregar columna comentario_produccion a la tabla project_implementaciones_clienteimple
    op.add_column('project_implementaciones_clienteimple', 
                  sa.Column('comentario_produccion', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remover columna comentario_produccion
    op.drop_column('project_implementaciones_clienteimple', 'comentario_produccion')
