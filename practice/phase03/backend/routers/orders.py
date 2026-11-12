
import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.schemas import OrderCreate, OrderResponse
from backend.services.order_service import (
    create_order_service,
)


logger = logging.getLogger(__name__)

router = APIRouter(tags=["Orders"])


@router.post(
    "/orders",
    status_code=status.HTTP_201_CREATED,
    response_model=OrderResponse,
)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
):
    logger.info("order creation requested")

    return create_order_service(db, payload)
