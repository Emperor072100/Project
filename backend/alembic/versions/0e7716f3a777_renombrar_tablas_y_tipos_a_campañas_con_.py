"""Renombrar tablas y tipos a campañas con ñ

Revision ID: 0e7716f3a777
Revises: bcd78808f105
Create Date: 2025-07-23 10:20:43.825484

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0e7716f3a777'
down_revision: Union[str, Sequence[str], None] = 'bcd78808f105'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Renombrar tabla campanias_clientes a campañas_clientes si existe
    op.execute('ALTER TABLE IF EXISTS campanias_clientes RENAME TO campañas_clientes;')

    # Renombrar tabla campanias a campañas si existe
    op.execute('ALTER TABLE IF EXISTS campanias RENAME TO campañas;')

    # Renombrar tabla campanias_campanias a campañas_campañas si existe
    op.execute('ALTER TABLE IF EXISTS campanias_campanias RENAME TO campañas_campañas;')

    # Renombrar el tipo ENUM tipocampania a tipocampaña si existe
    op.execute("DO $$\nBEGIN\n    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipocampania') THEN\n        ALTER TYPE tipocampania RENAME TO tipocampaña;\n    END IF;\nEND$$;")


    # Eliminado bloque que referenciaba la tabla campanias_clientes, ya que puede no existir tras el renombrado

def downgrade() -> None:
    """Downgrade schema."""
    # Revertir los cambios
    op.execute('ALTER TABLE IF EXISTS campañas_clientes RENAME TO campanias_clientes;')
    op.execute('ALTER TABLE IF EXISTS campañas RENAME TO campanias;')
    op.execute('ALTER TABLE IF EXISTS campañas_campañas RENAME TO campanias_campanias;')
    op.execute("DO $$\nBEGIN\n    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipocampaña') THEN\n        ALTER TYPE tipocampaña RENAME TO tipocampania;\n    END IF;\nEND$$;")
    # Revertir la FK si es necesario
    op.execute("DO $$\nDECLARE\n    constraint_name text;\nBEGIN\n    SELECT conname INTO constraint_name\n    FROM pg_constraint\n    WHERE conrelid = 'campanias_campanias'::regclass\n      AND confrelid = 'campañas_clientes'::regclass;\n    IF constraint_name IS NOT NULL THEN\n        EXECUTE 'ALTER TABLE campanias_campanias DROP CONSTRAINT ' || constraint_name || ';';\n        EXECUTE 'ALTER TABLE campanias_campanias ADD CONSTRAINT fk_campanias_cliente_id FOREIGN KEY (cliente_id) REFERENCES campanias_clientes(id);';\n    END IF;\nEND$$;")
