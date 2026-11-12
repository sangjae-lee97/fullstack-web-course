
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from backend.db import Base


# ========================================
# 기존 회원관리 모델 - 변경 없음
# ========================================
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


# ========================================
# Chapter 09 - K-POP Mini Pop-up Store
# ========================================

# STEP 05: 상품
class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_products_price"),
        CheckConstraint("stock >= 0", name="ck_products_stock"),
        {"schema": "practice"},
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        Identity(),
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    price: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
    )

    stock: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )


# STEP 06: 주문
class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint(
            "total_price >= 0",
            name="ck_orders_total_price",
        ),
        {"schema": "practice"},
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        Identity(),
        primary_key=True,
    )

    total_price: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default="created",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# STEP 06: 주문 상세
class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (
        CheckConstraint(
            "quantity >= 1",
            name="ck_order_items_quantity",
        ),
        CheckConstraint(
            "price >= 0",
            name="ck_order_items_price",
        ),
        {"schema": "practice"},
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        Identity(),
        primary_key=True,
    )

    order_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("practice.orders.id"),
        nullable=False,
    )

    product_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("practice.products.id"),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    price: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
