"""
Alembic migration for ProjectImplementacionesClienteImple: add fields cliente, proceso, contractual, talento_humano, procesos, tecnologia, estado
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_impl_fields'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('project_implementaciones_clienteimple', sa.Column('cliente', sa.String(), nullable=False))
    op.add_column('project_implementaciones_clienteimple', sa.Column('proceso', sa.String(), nullable=False))
    op.add_column('project_implementaciones_clienteimple', sa.Column('contractual', sa.JSON(), nullable=True))
    op.add_column('project_implementaciones_clienteimple', sa.Column('talento_humano', sa.JSON(), nullable=True))
    op.add_column('project_implementaciones_clienteimple', sa.Column('procesos', sa.JSON(), nullable=True))
    op.add_column('project_implementaciones_clienteimple', sa.Column('tecnologia', sa.JSON(), nullable=True))
    op.add_column('project_implementaciones_clienteimple', sa.Column('estado', sa.String(), nullable=True))

def downgrade():
    op.drop_column('project_implementaciones_clienteimple', 'cliente')
    op.drop_column('project_implementaciones_clienteimple', 'proceso')
    op.drop_column('project_implementaciones_clienteimple', 'contractual')
    op.drop_column('project_implementaciones_clienteimple', 'talento_humano')
    op.drop_column('project_implementaciones_clienteimple', 'procesos')
    op.drop_column('project_implementaciones_clienteimple', 'tecnologia')
    op.drop_column('project_implementaciones_clienteimple', 'estado')
