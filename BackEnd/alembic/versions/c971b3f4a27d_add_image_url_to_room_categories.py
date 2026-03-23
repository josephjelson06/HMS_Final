"""add_image_url_to_room_categories

Revision ID: c971b3f4a27d
Revises: 9250c46dcd17
Create Date: 2026-03-23 11:59:00.910687

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c971b3f4a27d'
down_revision: Union[str, Sequence[str], None] = '9250c46dcd17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "room_categories",
        sa.Column("image_url", sa.String(length=1000), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("room_categories", "image_url")
