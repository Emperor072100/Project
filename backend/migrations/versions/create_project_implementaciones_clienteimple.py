"""create project_implementaciones_clienteimple table
Revision ID: create_clienteimple_table
Revises:
Create Date: 2025-10-01
"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        "project_implementaciones_clienteimple",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("cliente_implementacion", sa.String, nullable=False),
        sa.Column("proceso_implementacion", sa.String, nullable=False),
    )


def downgrade():
    op.drop_table("project_implementaciones_clienteimple")
