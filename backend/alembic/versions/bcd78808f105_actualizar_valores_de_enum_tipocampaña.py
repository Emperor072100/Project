"""Actualizar valores de Enum TipoCampaña

Revision ID: bcd78808f105
Revises: 11edd8420e21
Create Date: 2025-07-22 15:45:49.555034

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bcd78808f105'
down_revision: Union[str, Sequence[str], None] = '11edd8420e21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Cambia el tipo ENUM en PostgreSQL
    op.execute("ALTER TYPE tipocampaña RENAME TO tipocampaña_old;")
    op.execute("CREATE TYPE tipocampaña AS ENUM ('SAC', 'TMC', 'TVT', 'CBZ');")
    op.execute("ALTER TABLE campañas_campañas ALTER COLUMN tipo TYPE tipocampaña USING tipo::text::tipocampaña;")
    op.execute("DROP TYPE tipocampaña_old;")


def downgrade() -> None:
    """Downgrade schema."""
    # Revertir el tipo ENUM a los valores anteriores
    op.execute("ALTER TYPE tipocampaña RENAME TO tipocampaña_old;")
    op.execute("CREATE TYPE tipocampaña AS ENUM ('SAC', 'TMG', 'CBI', 'OTRO');")
    op.execute("ALTER TABLE campañas_campañas ALTER COLUMN tipo TYPE tipocampaña USING tipo::text::tipocampaña;")
    op.execute("DROP TYPE tipocampaña_old;")
