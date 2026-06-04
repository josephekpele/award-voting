"""baseline candidates add remaining fields

Revision ID: c3c4d5e6f701
Revises: bca00e0d258f
Create Date: 2026-06-04

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "c3c4d5e6f701"
down_revision = "bca00e0d258f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add columns used by Candidate model.
    # Some columns may already exist (DB partially migrated), so we check before adding.
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_cols = {c["name"] for c in inspector.get_columns("candidates")}

    with op.batch_alter_table("candidates") as batch_op:
        if "sexe" not in existing_cols:
            batch_op.add_column(sa.Column("sexe", sa.String(length=20), nullable=True))
        if "whatsapp" not in existing_cols:
            batch_op.add_column(sa.Column("whatsapp", sa.String(length=20), nullable=True))
        if "eglise" not in existing_cols:
            batch_op.add_column(sa.Column("eglise", sa.String(length=255), nullable=True))
        if "biographie" not in existing_cols:
            batch_op.add_column(sa.Column("biographie", sa.Text(), nullable=True))
        if "photo_url" not in existing_cols:
            batch_op.add_column(sa.Column("photo_url", sa.String(length=500), nullable=True))
        if "slug" not in existing_cols:
            batch_op.add_column(sa.Column("slug", sa.String(length=140), nullable=True))
        if "votes" not in existing_cols:
            batch_op.add_column(sa.Column("votes", sa.Integer(), server_default="0", nullable=False))
        if "year" not in existing_cols:
            batch_op.add_column(sa.Column("year", sa.Integer(), nullable=True, index=True))


def downgrade() -> None:
    with op.batch_alter_table("candidates") as batch_op:
        batch_op.drop_column("year")
        batch_op.drop_column("votes")
        batch_op.drop_column("slug")
        batch_op.drop_column("photo_url")
        batch_op.drop_column("biographie")
        batch_op.drop_column("eglise")
        batch_op.drop_column("whatsapp")
        batch_op.drop_column("sexe")

