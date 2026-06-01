"""Gamemode strip — remove the audio File entity + long-audio path

Drops everything tied to the "files" feature (gamified-mode rework):
- table event_files            (event ↔ file join)
- column sessions.file_id      (+ idx_sessions_file)
- column input_turns.file_id   (FK to files)
- column input_turns.source_file_offset
- table files                  (audio file metadata)

InputTurn itself is KEPT — its `text` is the raw 闪念 (the "input" half of a
pin session card). Only the persisted audio File entity goes away; captured
audio is transcribed to text + asset and no longer stored as a browsable file.

Revision ID: 0008
Revises: 0007
Create Date: 2026-06-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # event_files → files/events join (drop first; it FKs files)
    op.drop_table("event_files")

    # sessions.file_id subject FK (+ its index)
    op.drop_index("idx_sessions_file", table_name="sessions")
    op.drop_column("sessions", "file_id")

    # input_turns audio linkage (keep the turn + its text)
    op.drop_column("input_turns", "file_id")
    op.drop_column("input_turns", "source_file_offset")

    # files table last — all FKs above are now gone
    op.drop_table("files")


def downgrade() -> None:
    # Recreate files table
    op.create_table(
        "files",
        sa.Column("id",           UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id",      sa.String(50), nullable=False),
        sa.Column("storage_url",  sa.Text()),
        sa.Column("file_type",    sa.String(50)),
        sa.Column("duration_sec", sa.Integer()),
        sa.Column("source_tag",   sa.String(20)),
        sa.Column("asr_status",   sa.String(20)),
        sa.Column("created_at",   sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
    )

    # Restore input_turns audio columns
    op.add_column("input_turns", sa.Column("source_file_offset", sa.Integer()))
    op.add_column(
        "input_turns",
        sa.Column("file_id", UUID(as_uuid=True), sa.ForeignKey("files.id")),
    )

    # Restore sessions.file_id subject FK + index
    op.add_column(
        "sessions",
        sa.Column("file_id", UUID(as_uuid=True), sa.ForeignKey("files.id"), nullable=True),
    )
    op.create_index("idx_sessions_file", "sessions", ["user_id", "file_id"])

    # Recreate event_files join
    op.create_table(
        "event_files",
        sa.Column("id",          UUID(as_uuid=True), primary_key=True),
        sa.Column("event_id",    UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_id",     UUID(as_uuid=True), sa.ForeignKey("files.id"), nullable=False),
        sa.Column("kind",        sa.String(20), server_default="attachment"),
        sa.Column("attached_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("event_id", "file_id", name="uq_event_files"),
    )
    op.create_index("idx_event_files_event", "event_files", ["event_id"])
