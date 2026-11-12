
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Product


def find_all(db: Session) -> list[Product]:
    stmt = select(Product).order_by(Product.id)
    return list(db.scalars(stmt).all())
