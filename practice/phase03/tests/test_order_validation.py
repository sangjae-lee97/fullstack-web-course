
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.models import Product, Order, OrderItem


# STEP 28-E-4
# quantity=0, quantity=-1 검증
@pytest.mark.parametrize("quantity", [0, -1])
def test_invalid_order_quantity(
    quantity: int,
    test_db: Session,
    test_client: TestClient,
):
    # 1. 테스트용 상품 생성
    product = Product(
        name="Validation Test Board Game",
        price=3000,
        category="테스트",
        stock=5,
    )

    test_db.add(product)
    test_db.commit()

    product_id = product.id

    # 2. 요청 전 DB 상태 기록
    before_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    before_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    # 3. 잘못된 수량으로 주문 요청
    response = test_client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": product_id,
                    "quantity": quantity,
                }
            ]
        },
    )

    # 4. HTTP 422 확인
    assert response.status_code == 422

    # quantity 필드에 대한 검증 오류인지 확인
    errors = response.json()["detail"]

    assert any(
        error["loc"][-1] == "quantity"
        for error in errors
    )

    # 5. DB 데이터 변경 여부 확인
    after_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    after_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    assert after_orders == before_orders
    assert after_items == before_items

    # 6. 상품 재고 유지 확인
    saved_product = test_db.get(
        Product,
        product_id,
    )

    assert saved_product is not None
    assert saved_product.stock == 5

    print("\n=== Invalid Quantity Test ===")
    print("Requested Quantity:", quantity)
    print("HTTP Status:", response.status_code)
    print(
        "Order Count Unchanged:",
        after_orders == before_orders,
    )
    print(
        "Item Count Unchanged:",
        after_items == before_items,
    )
    print("Remaining Stock:", saved_product.stock)
