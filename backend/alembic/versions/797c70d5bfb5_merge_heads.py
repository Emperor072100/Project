"""merge heads

Revision ID: 797c70d5bfb5
Revises: 928122d35970, f82302fb41de
Create Date: 2025-10-23 08:57:33.465336

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '797c70d5bfb5'
down_revision: Union[str, Sequence[str], None] = ('928122d35970', 'f82302fb41de')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
