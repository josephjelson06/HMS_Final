"""convert_room_category_image_to_image_urls

Revision ID: 2fd0e0cc4d98
Revises: c971b3f4a27d
Create Date: 2026-03-23 12:35:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "2fd0e0cc4d98"
down_revision: Union[str, Sequence[str], None] = "c971b3f4a27d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "room_categories",
        sa.Column(
            "image_urls",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default="{}",
        ),
    )
    op.execute(
        """
        UPDATE room_categories
        SET image_urls = CASE
            WHEN image_url IS NOT NULL AND btrim(image_url) <> ''
                THEN ARRAY[image_url]
            ELSE ARRAY[]::varchar[]
        END
        """
    )
    op.drop_column("room_categories", "image_url")


def downgrade() -> None:
    op.add_column(
        "room_categories",
        sa.Column("image_url", sa.String(length=1000), nullable=True),
    )
    op.execute(
        """
        UPDATE room_categories
        SET image_url = CASE
            WHEN image_urls IS NOT NULL AND array_length(image_urls, 1) > 0
                THEN image_urls[1]
            ELSE NULL
        END
        """
    )
    op.drop_column("room_categories", "image_urls")
