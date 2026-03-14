"""add_room_images_table

Revision ID: d12f6b9a7c31
Revises: b7d2f3c19eaa
Create Date: 2026-03-13 12:10:00.000000
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "d12f6b9a7c31"
down_revision: Union[str, Sequence[str], None] = "b7d2f3c19eaa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


room_images_table = sa.table(
    "room_images",
    sa.column("id", postgresql.UUID(as_uuid=True)),
    sa.column("room_type_id", postgresql.UUID(as_uuid=True)),
    sa.column("url", sa.String()),
    sa.column("display_order", sa.Integer()),
    sa.column("caption", sa.String()),
    sa.column("tags", postgresql.ARRAY(sa.String())),
    sa.column("category", sa.String()),
    sa.column("is_primary", sa.Boolean()),
    sa.column("created_at", sa.TIMESTAMP(timezone=True)),
    sa.column("updated_at", sa.TIMESTAMP(timezone=True)),
)


def upgrade() -> None:
    op.create_table(
        "room_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("room_type_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column(
            "display_order",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("caption", sa.String(length=255), nullable=True),
        sa.Column(
            "tags",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column(
            "is_primary",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["room_type_id"], ["room_types.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_room_images_room_type_id"), "room_images", ["room_type_id"])

    bind = op.get_bind()
    room_rows = bind.execute(
        sa.text("SELECT id, image_urls FROM room_types WHERE image_urls IS NOT NULL")
    ).mappings()

    for row in room_rows:
        room_type_id = row["id"]
        image_urls = row["image_urls"] or []
        if not image_urls:
            continue

        payload = []
        created_at = datetime.utcnow()
        for index, url in enumerate(image_urls):
            payload.append(
                {
                    "id": uuid.uuid4(),
                    "room_type_id": room_type_id,
                    "url": url,
                    "display_order": index,
                    "caption": None,
                    "tags": [],
                    "category": None,
                    "is_primary": index == 0,
                    "created_at": created_at,
                    "updated_at": None,
                }
            )

        op.bulk_insert(room_images_table, payload)


def downgrade() -> None:
    op.drop_index(op.f("ix_room_images_room_type_id"), table_name="room_images")
    op.drop_table("room_images")
