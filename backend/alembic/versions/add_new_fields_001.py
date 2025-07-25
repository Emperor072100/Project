"""Agregar producto_servicio y periodicidad

Revision ID: add_new_fields_001
Revises: ad7339572720
Create Date: 2025-01-25 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_new_fields_001'
down_revision = 'ad7339572720'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Agregar columna producto_servicio a la tabla productos_campañas
    op.add_column('productos_campañas', sa.Column('producto_servicio', sa.String(), nullable=True))
    
    # Agregar columna periodicidad a la tabla facturacion_campañas
    op.add_column('facturacion_campañas', sa.Column('periodicidad', sa.String(), nullable=True))
    
    # Actualizar registros existentes con valores por defecto
    op.execute("UPDATE productos_campañas SET producto_servicio = 'Sin especificar' WHERE producto_servicio IS NULL")
    op.execute("UPDATE facturacion_campañas SET periodicidad = 'Mensual' WHERE periodicidad IS NULL")
    
    # Hacer las columnas NOT NULL después de agregar valores por defecto
    op.alter_column('productos_campañas', 'producto_servicio', nullable=False)
    op.alter_column('facturacion_campañas', 'periodicidad', nullable=False)


def downgrade() -> None:
    # Eliminar las columnas agregadas
    op.drop_column('productos_campañas', 'producto_servicio')
    op.drop_column('facturacion_campañas', 'periodicidad')
