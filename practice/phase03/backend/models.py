from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.db import Base


class Member(Base):
    __tablename__ = "members"
    __table_args__ = {"schema": "practice"}

    member_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    age: Mapped[int] = mapped_column(Integer)

    joined_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )