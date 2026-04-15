"""add_available_lang_to_tenant_configs

Revision ID: 9b1e6e2d5c4a
Revises: e4a2f0d84b31
Create Date: 2026-03-10 13:45:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "9b1e6e2d5c4a"
down_revision: Union[str, Sequence[str], None] = "e4a2f0d84b31"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "tenant_configs",
        sa.Column(
            "available_lang",
            postgresql.ARRAY(sa.Text()),
            nullable=False,
            server_default=sa.text("ARRAY['hindi','english','marathi']::text[]"),
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("tenant_configs", "available_lang")
