
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Product, Order, OrderItem


# STEP 27-C: 주문 대상 상품 조회 및 행 잠금
def find_products_for_update(
    db: Session,
    product_ids: list[int],
) -> list[Product]:
    if not product_ids:
        return []

    # 항상 ID 순서대로 잠가 교착 상태 위험 감소
    stmt = (
        select(Product)
        .where(Product.id.in_(sorted(set(product_ids))))
        .order_by(Product.id)
        .with_for_update()
    )

    return list(db.scalars(stmt).all())


# STEP 27-C: 주문 기본 정보 생성
def create_order(
    db: Session,
    total_price: int,
) -> Order:
    order = Order(
        total_price=total_price,
        status="created",
    )

    db.add(order)

    # INSERT 실행 후 자동 생성된 주문 ID 확보
    # 아직 COMMIT하지 않음
    db.flush()

    return order


# STEP 27-C: 주문 상세 정보 생성
def create_order_item(
    db: Session,
    order_id: int,
    product_id: int,
    quantity: int,
    price: int,
) -> OrderItem:
    item = OrderItem(
        order_id=order_id,
        product_id=product_id,
        quantity=quantity,
        price=price,
    )

    db.add(item)

    return item


# STEP 27-C: 상품 재고 감소
def decrease_stock(
    product: Product,
    quantity: int,
) -> None:
    # Service에서 재고 검증을 완료한 후 호출
    # product는 현재 Session에 연결된 ORM 객체
    product.stock -= quantity
