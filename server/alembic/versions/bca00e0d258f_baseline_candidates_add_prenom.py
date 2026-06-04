"""baseline candidates add prenom

Revision ID: bca00e0d258f
Revises: 
Create Date: 2026-06-04

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "bca00e0d258f"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ensure column prenom exists on candidates
    with op.batch_alter_table("candidates") as batch_op:
        batch_op.add_column(sa.Column("prenom", sa.String(length=120), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("candidates") as batch_op:
        batch_op.drop_column("prenom")

