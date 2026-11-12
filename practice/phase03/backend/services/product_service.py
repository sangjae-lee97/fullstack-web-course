
from sqlalchemy.orm import Session

from backend.models import Product
from backend.repositories import product_repository


def get_products_service(db: Session) -> list[Product]:
    return product_repository.find_all(db)
