"""add_room_type_capacity_columns

Revision ID: f1e8c9d0a123
Revises: d12f6b9a7c31
Create Date: 2026-03-14 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = "f1e8c9d0a123"
down_revision: Union[str, Sequence[str], None] = "d12f6b9a7c31"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    row = bind.execute(
        text(
            """
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = :table_name
              AND column_name = :column_name
            LIMIT 1
            """
        ),
        {"table_name": table_name, "column_name": column_name},
    ).first()
    return row is not None


def upgrade() -> None:
    if not _column_exists("room_types", "max_adults"):
        op.add_column(
            "room_types",
            sa.Column("max_adults", sa.Integer(), nullable=False, server_default="2"),
        )
    else:
        op.execute("UPDATE room_types SET max_adults = 2 WHERE max_adults IS NULL")
        op.alter_column(
            "room_types",
            "max_adults",
            existing_type=sa.Integer(),
            nullable=False,
            server_default="2",
        )

    if not _column_exists("room_types", "max_children"):
        op.add_column(
            "room_types",
            sa.Column("max_children", sa.Integer(), nullable=False, server_default="0"),
        )
    else:
        op.execute("UPDATE room_types SET max_children = 0 WHERE max_children IS NULL")
        op.alter_column(
            "room_types",
            "max_children",
            existing_type=sa.Integer(),
            nullable=False,
            server_default="0",
        )

    # Back-compat for projects that created the column with a typo.
    if not _column_exists("room_types", "max_childeren"):
        op.add_column(
            "room_types",
            sa.Column("max_childeren", sa.Integer(), nullable=False, server_default="0"),
        )
    else:
        op.execute("UPDATE room_types SET max_childeren = 0 WHERE max_childeren IS NULL")
        op.alter_column(
            "room_types",
            "max_childeren",
            existing_type=sa.Integer(),
            nullable=False,
            server_default="0",
        )

    # Keep both spellings aligned if both exist.
    if _column_exists("room_types", "max_children") and _column_exists(
        "room_types", "max_childeren"
    ):
        # First ensure max_children is populated, then mirror into max_childeren.
        op.execute(
            "UPDATE room_types SET max_children = COALESCE(max_children, max_childeren, 0)"
        )
        op.execute(
            "UPDATE room_types SET max_childeren = COALESCE(max_children, max_childeren, 0)"
        )


def downgrade() -> None:
    # Drop typo column first to avoid confusion.
    if _column_exists("room_types", "max_childeren"):
        op.drop_column("room_types", "max_childeren")
    if _column_exists("room_types", "max_children"):
        op.drop_column("room_types", "max_children")
    if _column_exists("room_types", "max_adults"):
        op.drop_column("room_types", "max_adults")
