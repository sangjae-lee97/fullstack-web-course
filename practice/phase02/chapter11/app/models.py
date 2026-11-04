
from datetime import date

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from common.db import Base


class Member(Base):
    __tablename__ = "members"
    __table_args__ = {"schema": "practice"}

    member_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    age: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    joined_at: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
