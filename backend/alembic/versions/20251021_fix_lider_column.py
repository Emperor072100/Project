"""fix column name lider_de_campaña in campanas_campanas

Revision ID: 20251021_fix_lider_column
Revises: f230d8abecf4
Create Date: 2025-10-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '20251021_fix_lider_column'
down_revision: Union[str, Sequence[str], None] = 'f230d8abecf4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Renombrar columna si existe con nombre incorrecto
    with op.batch_alter_table('campanas_campanas') as batch_op:
        batch_op.alter_column('lider_de_campa±a', new_column_name='lider_de_campaña', existing_type=sa.String(), existing_nullable=True)
    # Si no existe, agregar la columna correctamente
    op.add_column('campanas_campanas', sa.Column('lider_de_campaña', sa.String(), nullable=True))

def downgrade() -> None:
    with op.batch_alter_table('campanas_campanas') as batch_op:
        batch_op.alter_column('lider_de_campaña', new_column_name='lider_de_campa±a', existing_type=sa.String(), existing_nullable=True)
    op.drop_column('campanas_campanas', 'lider_de_campaña')
