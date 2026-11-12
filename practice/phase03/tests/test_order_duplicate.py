
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Product, Order, OrderItem


def test_duplicate_product_ids(
    test_db: Session,
    test_client: TestClient,
):
    # 1. 테스트 전용 상품 생성
    product = Product(
        name="Duplicate Test Board Game",
        price=3000,
        category="테스트",
        stock=5,
    )

    test_db.add(product)
    test_db.commit()

    product_id = product.id

    # 2. 동일 상품 ID를 두 번 전송
    response = test_client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2,
                },
                {
                    "product_id": product_id,
                    "quantity": 2,
                },
            ]
        },
    )

    # 3. HTTP 201 및 총액 확인
    assert response.status_code == 201

    data = response.json()

    assert data["total_price"] == 12000
    assert data["status"] == "created"

    order_id = data["id"]

    # 4. orders 검증
    order = test_db.get(Order, order_id)

    assert order is not None
    assert order.total_price == 12000

    # 5. order_items 검증
    items = test_db.scalars(
        select(OrderItem).where(
            OrderItem.order_id == order_id
        )
    ).all()

    # 같은 상품이므로 주문 상세는 1행
    assert len(items) == 1

    assert items[0].product_id == product_id
    assert items[0].quantity == 4
    assert items[0].price == 3000

    # 6. 재고 감소 확인
    test_db.expire_all()

    saved_product = test_db.get(
        Product,
        product_id,
    )

    assert saved_product is not None
    assert saved_product.stock == 1

    print("\n=== Duplicate Product Test ===")
    print("HTTP Status:", response.status_code)
    print("Order Total:", order.total_price)
    print("Order Items:", len(items))
    print("Merged Quantity:", items[0].quantity)
    print("Remaining Stock:", saved_product.stock)
