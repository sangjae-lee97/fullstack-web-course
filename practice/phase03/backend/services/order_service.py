
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.repositories import order_repository
from backend.schemas import OrderCreate, OrderResponse


def create_order_service(
    db: Session,
    payload: OrderCreate,
) -> OrderResponse:

    # 1. 동일한 상품 ID의 주문 수량 합산
    quantities: dict[int, int] = {}

    for item in payload.items:
        quantities[item.product_id] = (
            quantities.get(item.product_id, 0)
            + item.quantity
        )

    # 여러 상품을 항상 ID 오름차순으로 처리
    product_ids = sorted(quantities)

    try:
        # 2. 상품 조회 및 행 잠금
        products = order_repository.find_products_for_update(
            db,
            product_ids,
        )

        products_by_id = {
            product.id: product
            for product in products
        }

        total_price = 0

        # 3. 상품 존재 여부 및 재고 검증
        for product_id in product_ids:
            product = products_by_id.get(product_id)

            if product is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {product_id} not found",
                )

            quantity = quantities[product_id]

            if product.stock < quantity:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Insufficient stock "
                        f"for product {product_id}"
                    ),
                )

            # 실제 DB 가격으로 주문 총액 계산
            total_price += product.price * quantity

        # 4. 주문 기본 정보 생성
        order = order_repository.create_order(
            db,
            total_price,
        )

        order_id = order.id

        # 5. 주문 상세 생성 및 재고 감소
        for product_id in product_ids:
            product = products_by_id[product_id]
            quantity = quantities[product_id]

            order_repository.create_order_item(
                db=db,
                order_id=order_id,
                product_id=product_id,
                quantity=quantity,
                price=product.price,
            )

            order_repository.decrease_stock(
                product,
                quantity,
            )

        # 6. 모든 작업이 성공하면 COMMIT
        db.commit()

    except Exception:
        # 하나라도 실패하면 변경 사항 취소
        db.rollback()
        raise

    # 7. 주문 성공 응답
    return OrderResponse(
        id=order_id,
        total_price=total_price,
        status="created",
    )
