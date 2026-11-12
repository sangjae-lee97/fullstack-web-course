
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.schemas import ProductResponse
from backend.services.product_service import (
    get_products_service,
)


logger = logging.getLogger(__name__)

router = APIRouter(tags=["Products"])


@router.get(
    "/products",
    response_model=list[ProductResponse],
)
def get_products(db: Session = Depends(get_db)):
    logger.info("product list requested")
    return get_products_service(db)
