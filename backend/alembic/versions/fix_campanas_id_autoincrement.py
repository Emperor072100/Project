"""Asegura que la columna id de campañas sea SERIAL/AUTOINCREMENT

Revision ID: fix_campanas_id_autoincrement
Revises: 0e7716f3a777
Create Date: 2025-07-23 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fix_campanas_id_autoincrement'
down_revision = '0e7716f3a777'
branch_labels = None
depends_on = None

def upgrade():
    # Para PostgreSQL: Cambia la columna id a SERIAL si no lo es
    op.execute('''
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='campañas' AND column_name='id'
            ) THEN
                -- Cambia la columna a serial si no lo es
                BEGIN
                    ALTER TABLE campañas ALTER COLUMN id DROP DEFAULT;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN
                    CREATE SEQUENCE IF NOT EXISTS campañas_id_seq;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE campañas ALTER COLUMN id SET DEFAULT nextval('campañas_id_seq');
                ALTER SEQUENCE campañas_id_seq OWNED BY campañas.id;
            END IF;
        END$$;
    ''')

def downgrade():
    # No se recomienda revertir, pero puedes eliminar el default si lo deseas
    op.execute("ALTER TABLE campañas ALTER COLUMN id DROP DEFAULT;")
