"""rename campaign tables to remove project_ prefix

Revision ID: rename_campaign_tables
Revises: 5fb943806368
Create Date: 2025-10-20 10:30:19.219984

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'rename_campaign_tables'
down_revision: Union[str, Sequence[str], None] = '12c71a71d1d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename campaign tables removing project_ prefix."""
    # Primero, eliminamos las restricciones de clave foránea para evitar errores
    op.drop_constraint('project_productos_campanas_campaña_id_fkey', 'project_productos_campanas')
    op.drop_constraint('project_historial_campanas_campaña_id_fkey', 'project_historial_campanas')
    op.drop_constraint('project_facturacion_campanas_campaña_id_fkey', 'project_facturacion_campanas')
    op.drop_constraint('project_campanas_contacto_cliente_corporativo_id_fkey', 'project_campanas_contacto')
    op.drop_constraint('project_campanas_campanas_cliente_corporativo_id_fkey', 'project_campanas_campanas')
    op.drop_constraint('project_campanas_campanas_contacto_id_fkey', 'project_campanas_campanas')
    op.drop_constraint('project_campanas_campanas_contacto_id_secundario_fkey', 'project_campanas_campanas')

    # Renombramos las tablas
    op.rename_table('project_campanas_campanas', 'campanas_campanas')
    op.rename_table('project_campanas_clientes_corporativos', 'campanas_clientes_corporativos')
    op.rename_table('project_campanas_contacto', 'campanas_contacto')
    op.rename_table('project_facturacion_campanas', 'facturacion_campanas')
    op.rename_table('project_historial_campanas', 'historial_campanas')
    op.rename_table('project_productos_campanas', 'productos_campanas')

    # Recreamos las restricciones de clave foránea con los nuevos nombres
    op.create_foreign_key(
        'productos_campanas_campaña_id_fkey',
        'productos_campanas',
        'campanas_campanas',
        ['campaña_id'],
        ['id']
    )
    op.create_foreign_key(
        'historial_campanas_campaña_id_fkey',
        'historial_campanas',
        'campanas_campanas',
        ['campaña_id'],
        ['id']
    )
    op.create_foreign_key(
        'facturacion_campanas_campaña_id_fkey',
        'facturacion_campanas',
        'campanas_campanas',
        ['campaña_id'],
        ['id']
    )
    op.create_foreign_key(
        'campanas_contacto_cliente_corporativo_id_fkey',
        'campanas_contacto',
        'campanas_clientes_corporativos',
        ['cliente_corporativo_id'],
        ['id']
    )
    op.create_foreign_key(
        'campanas_campanas_cliente_corporativo_id_fkey',
        'campanas_campanas',
        'campanas_clientes_corporativos',
        ['cliente_corporativo_id'],
        ['id']
    )
    op.create_foreign_key(
        'campanas_campanas_contacto_id_fkey',
        'campanas_campanas',
        'campanas_contacto',
        ['contacto_id'],
        ['id']
    )
    op.create_foreign_key(
        'campanas_campanas_contacto_id_secundario_fkey',
        'campanas_campanas',
        'campanas_contacto',
        ['contacto_id_secundario'],
        ['id']
    )


def downgrade() -> None:
    """Restore original table names."""
    # Primero, eliminamos las restricciones de clave foránea
    op.drop_constraint('productos_campanas_campaña_id_fkey', 'productos_campanas')
    op.drop_constraint('historial_campanas_campaña_id_fkey', 'historial_campanas')
    op.drop_constraint('facturacion_campanas_campaña_id_fkey', 'facturacion_campanas')
    op.drop_constraint('campanas_contacto_cliente_corporativo_id_fkey', 'campanas_contacto')
    op.drop_constraint('campanas_campanas_cliente_corporativo_id_fkey', 'campanas_campanas')
    op.drop_constraint('campanas_campanas_contacto_id_fkey', 'campanas_campanas')
    op.drop_constraint('campanas_campanas_contacto_id_secundario_fkey', 'campanas_campanas')

    # Renombramos las tablas de vuelta a sus nombres originales
    op.rename_table('campanas_campanas', 'project_campanas_campanas')
    op.rename_table('campanas_clientes_corporativos', 'project_campanas_clientes_corporativos')
    op.rename_table('campanas_contacto', 'project_campanas_contacto')
    op.rename_table('facturacion_campanas', 'project_facturacion_campanas')
    op.rename_table('historial_campanas', 'project_historial_campanas')
    op.rename_table('productos_campanas', 'project_productos_campanas')

    # Recreamos las restricciones de clave foránea originales
    op.create_foreign_key(
        'project_productos_campanas_campaña_id_fkey',
        'project_productos_campanas',
        'project_campanas_campanas',
        ['campaña_id'],
        ['id']
    )
    op.create_foreign_key(
        'project_historial_campanas_campaña_id_fkey',
        'project_historial_campanas',
        'project_campanas_campanas',
        ['campaña_id'],
        ['id']
    )
    op.create_foreign_key(
        'project_facturacion_campanas_campaña_id_fkey',
        'project_facturacion_campanas',
        'project_campanas_campanas',
        ['campaña_id'],
        ['id']
    )
    op.create_foreign_key(
        'project_campanas_contacto_cliente_corporativo_id_fkey',
        'project_campanas_contacto',
        'project_campanas_clientes_corporativos',
        ['cliente_corporativo_id'],
        ['id']
    )
    op.create_foreign_key(
        'project_campanas_campanas_cliente_corporativo_id_fkey',
        'project_campanas_campanas',
        'project_campanas_clientes_corporativos',
        ['cliente_corporativo_id'],
        ['id']
    )
    op.create_foreign_key(
        'project_campanas_campanas_contacto_id_fkey',
        'project_campanas_campanas',
        'project_campanas_contacto',
        ['contacto_id'],
        ['id']
    )
    op.create_foreign_key(
        'project_campanas_campanas_contacto_id_secundario_fkey',
        'project_campanas_campanas',
        'project_campanas_contacto',
        ['contacto_id_secundario'],
        ['id']
    )
