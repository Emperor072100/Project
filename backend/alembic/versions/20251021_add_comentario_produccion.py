"""
Alembic migration script to add the column 'comentario_produccion' a la tabla 'project_implementaciones_clienteimple'.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_comentario_produccion_column'
down_revision = 'f230d8abecf4'
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
