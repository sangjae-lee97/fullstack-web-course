
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.models import Product, Order, OrderItem
from backend.repositories import order_repository


def test_order_rollback_after_partial_write(
    test_db: Session,
    test_client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
):
    # 1. 테스트 전용 상품 2개 준비
    product_a = Product(
        name="Rollback Test Game A",
        price=3000,
        category="테스트",
        stock=5,
    )

    product_b = Product(
        name="Rollback Test Game B",
        price=5000,
        category="테스트",
        stock=5,
    )

    test_db.add_all([product_a, product_b])
    test_db.flush()

    product_a_id = product_a.id
    product_b_id = product_b.id

    # 테스트 상품 준비 완료
    test_db.commit()

    # 2. 주문 전 상태 기록
    before_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    before_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    # 기존 Repository 함수 보관
    original_create_item = (
        order_repository.create_order_item
    )

    call_count = 0
    intermediate = {}

    # 3. 두 번째 주문 상세 생성 후 강제로 실패
    def failing_create_order_item(
        db: Session,
        order_id: int,
        product_id: int,
        quantity: int,
        price: int,
    ):
        nonlocal call_count

        item = original_create_item(
            db=db,
            order_id=order_id,
            product_id=product_id,
            quantity=quantity,
            price=price,
        )

        call_count += 1

        if call_count == 2:
            # 실제 SQL 실행, COMMIT은 하지 않음
            db.flush()

            # 오류 발생 직전 DB 상태 기록
            intermediate["orders"] = db.scalar(
                select(func.count()).select_from(Order)
            )

            intermediate["items"] = db.scalar(
                select(func.count()).select_from(OrderItem)
            )

            intermediate["stock_a"] = db.scalar(
                select(Product.stock).where(
                    Product.id == product_a_id
                )
            )

            # 의도적으로 장애 발생
            raise RuntimeError(
                "Injected failure after SQL flush"
            )

        return item

    # Repository 함수만 테스트 중 임시 교체
    monkeypatch.setattr(
        order_repository,
        "create_order_item",
        failing_create_order_item,
    )

    # 4. 주문 요청
    # TestClient는 기본적으로 서버 예외를
    # 테스트 코드에 다시 전달한다.
    with pytest.raises(
        RuntimeError,
        match="Injected failure after SQL flush",
    ):
        test_client.post(
            "/orders",
            json={
                "items": [
                    {
                        "product_id": product_a_id,
                        "quantity": 2,
                    },
                    {
                        "product_id": product_b_id,
                        "quantity": 1,
                    },
                ]
            },
        )

    assert call_count == 2

    # 5. 오류 직전 실제 쓰기 수행 확인
    assert intermediate["orders"] == before_orders + 1
    assert intermediate["items"] == before_items + 2
    assert intermediate["stock_a"] == 3

    # 6. ROLLBACK 이후 DB 상태 확인
    after_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    after_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    stock_a = test_db.scalar(
        select(Product.stock).where(
            Product.id == product_a_id
        )
    )

    stock_b = test_db.scalar(
        select(Product.stock).where(
            Product.id == product_b_id
        )
    )

    assert after_orders == before_orders
    assert after_items == before_items

    assert stock_a == 5
    assert stock_b == 5

    print("\n=== Mid-Transaction Rollback ===")
    print("SQL writes before failure: CONFIRMED")
    print("Order Count Unchanged:", after_orders == before_orders)
    print("Item Count Unchanged:", after_items == before_items)
    print("Product A Stock:", stock_a)
    print("Product B Stock:", stock_b)
    print("Rollback: PASS")
