"""add_image_urls_to_room_types

Revision ID: b7d2f3c19eaa
Revises: 9b1e6e2d5c4a
Create Date: 2026-03-11 15:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "b7d2f3c19eaa"
down_revision: Union[str, Sequence[str], None] = "9b1e6e2d5c4a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "room_types",
        sa.Column(
            "image_urls",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default="{}",
        ),
    )


def downgrade() -> None:
    op.drop_column("room_types", "image_urls")
