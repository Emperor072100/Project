"""create tables for subseccion implementacion

Revision ID: 20251021_subseccion_full
Revises: 62a2db661ceb
Create Date: 2025-10-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '20251021_subseccion_full'
down_revision: Union[str, Sequence[str], None] = '62a2db661ceb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'project_implementacion_subseccion_personalizada',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('cliente_implementacion_id', sa.Integer, sa.ForeignKey('project_implementaciones_clienteimple.id', ondelete='CASCADE'), nullable=False),
        sa.Column('seccion', sa.String, nullable=False),
        sa.Column('nombre_subsesion', sa.String, nullable=False),
        sa.Column('seguimiento', sa.String),
        sa.Column('estado', sa.String),
        sa.Column('responsable', sa.String),
        sa.Column('notas', sa.String)
    )
    op.create_table(
        'project_subseccion_implementacion_tecnologia',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('cliente_implementacion_id', sa.Integer, sa.ForeignKey('project_implementaciones_clienteimple.id', ondelete='CASCADE'), nullable=False),
        sa.Column('seccion', sa.String(50), nullable=False, server_default='tecnologia'),
        sa.Column('nombre_subsesion', sa.String(255), nullable=False),
        sa.Column('seguimiento', sa.Text),
        sa.Column('estado', sa.String(100)),
        sa.Column('responsable', sa.String(255)),
        sa.Column('notas', sa.Text)
    )
    op.create_table(
        'project_subseccion_implementacion_talento_humano',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('cliente_implementacion_id', sa.Integer, sa.ForeignKey('project_implementaciones_clienteimple.id', ondelete='CASCADE'), nullable=False),
        sa.Column('seccion', sa.String(50), nullable=False, server_default='talento_humano'),
        sa.Column('nombre_subsesion', sa.String, nullable=False),
        sa.Column('seguimiento', sa.String),
        sa.Column('estado', sa.String),
        sa.Column('responsable', sa.String),
        sa.Column('notas', sa.String)
    )
    op.create_table(
        'project_subseccion_implementacion_procesos',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('cliente_implementacion_id', sa.Integer, sa.ForeignKey('project_implementaciones_clienteimple.id', ondelete='CASCADE'), nullable=False),
        sa.Column('seccion', sa.String(50), nullable=False, server_default='procesos'),
        sa.Column('nombre_subsesion', sa.String(255), nullable=False),
        sa.Column('seguimiento', sa.Text),
        sa.Column('estado', sa.String(100)),
        sa.Column('responsable', sa.String(255)),
        sa.Column('notas', sa.Text)
    )

def downgrade() -> None:
    op.drop_table('project_subseccion_implementacion_procesos')
    op.drop_table('project_subseccion_implementacion_talento_humano')
    op.drop_table('project_subseccion_implementacion_tecnologia')
    op.drop_table('project_implementacion_subseccion_personalizada')
