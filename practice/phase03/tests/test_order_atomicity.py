
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.models import Product, Order, OrderItem


def test_multi_item_insufficient_stock(
    test_db: Session,
    test_client: TestClient,
):
    # 1. 테스트 상품 2개 생성
    available = Product(
        name="Available Test Board Game",
        price=3000,
        category="테스트",
        stock=5,
    )

    sold_out = Product(
        name="Sold Out Test Board Game",
        price=5000,
        category="테스트",
        stock=0,
    )

    test_db.add_all([available, sold_out])
    test_db.commit()

    available_id = available.id
    sold_out_id = sold_out.id

    # 2. 주문 전 DB 상태 기록
    before_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    before_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    # 3. 정상 상품과 품절 상품을 함께 주문
    response = test_client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": available_id,
                    "quantity": 2,
                },
                {
                    "product_id": sold_out_id,
                    "quantity": 1,
                },
            ]
        },
    )

    # 4. 품절 상품 때문에 전체 주문 거부
    assert response.status_code == 409

    assert response.json() == {
        "detail": (
            f"Insufficient stock for product {sold_out_id}"
        )
    }

    # 5. 주문 및 주문 상세 생성 여부 확인
    after_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    after_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    assert after_orders == before_orders
    assert after_items == before_items

    # 6. 양쪽 상품 재고가 모두 유지되는지 확인
    saved_available = test_db.get(
        Product,
        available_id,
    )

    saved_sold_out = test_db.get(
        Product,
        sold_out_id,
    )

    assert saved_available is not None
    assert saved_sold_out is not None

    assert saved_available.stock == 5
    assert saved_sold_out.stock == 0

    print("\n=== Multi Item Order Failure ===")
    print("HTTP Status:", response.status_code)

    print(
        "Order Count Unchanged:",
        after_orders == before_orders,
    )

    print(
        "Item Count Unchanged:",
        after_items == before_items,
    )

    print(
        "Available Product Stock:",
        saved_available.stock,
    )

    print(
        "Sold Out Product Stock:",
        saved_sold_out.stock,
    )
