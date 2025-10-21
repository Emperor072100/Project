"""rename campaign tables to remove project_ prefix

Revision ID: rename_campaign_tables
Revises: 5fb943806368
Create Date: 2025-10-20 10:30:19.219984

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "rename_campaign_tables"
down_revision: Union[str, Sequence[str], None] = "12c71a71d1d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename campaign tables removing project_ prefix using safe SQL."""
    # Use raw SQL with IF EXISTS for robustness
    # Rename tables directly - PostgreSQL automatically renames constraints and indexes
    op.execute("ALTER TABLE IF EXISTS project_campanas_clientes_corporativos RENAME TO campanas_clientes_corporativos;")
    op.execute("ALTER TABLE IF EXISTS project_campanas_contacto RENAME TO campanas_contacto;")
    op.execute("ALTER TABLE IF EXISTS project_campanas_campanas RENAME TO campanas_campanas;")
    op.execute("ALTER TABLE IF EXISTS project_facturacion_campanas RENAME TO facturacion_campanas;")
    op.execute("ALTER TABLE IF EXISTS project_historial_campanas RENAME TO historial_campanas;")
    op.execute("ALTER TABLE IF EXISTS project_productos_campanas RENAME TO productos_campanas;")


def downgrade() -> None:
    """Restore original table names using safe SQL."""
    # Rename tables back to original names with project_ prefix
    op.execute("ALTER TABLE IF EXISTS campanas_clientes_corporativos RENAME TO project_campanas_clientes_corporativos;")
    op.execute("ALTER TABLE IF EXISTS campanas_contacto RENAME TO project_campanas_contacto;")
    op.execute("ALTER TABLE IF EXISTS campanas_campanas RENAME TO project_campanas_campanas;")
    op.execute("ALTER TABLE IF EXISTS facturacion_campanas RENAME TO project_facturacion_campanas;")
    op.execute("ALTER TABLE IF EXISTS historial_campanas RENAME TO project_historial_campanas;")
    op.execute("ALTER TABLE IF EXISTS productos_campanas RENAME TO project_productos_campanas;")
