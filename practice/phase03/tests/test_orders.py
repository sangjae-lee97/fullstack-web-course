
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.models import Product, Order, OrderItem


# ==========================================
# STEP 28-E-1: 정상 주문
# ==========================================
def test_order_success(
    test_db: Session,
    test_client: TestClient,
):
    product = Product(
        name="Fixture Test Board Game",
        price=3000,
        category="테스트",
        stock=5,
    )

    test_db.add(product)
    test_db.flush()

    product_id = product.id

    response = test_client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2,
                }
            ]
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["total_price"] == 6000
    assert data["status"] == "created"

    order_id = data["id"]

    assert isinstance(order_id, int)

    order = test_db.get(Order, order_id)

    assert order is not None
    assert order.total_price == 6000
    assert order.status == "created"

    items = test_db.scalars(
        select(OrderItem).where(
            OrderItem.order_id == order_id
        )
    ).all()

    assert len(items) == 1
    assert items[0].product_id == product_id
    assert items[0].quantity == 2
    assert items[0].price == 3000

    updated_product = test_db.get(
        Product,
        product_id,
    )

    assert updated_product is not None
    assert updated_product.stock == 3

    print("\n=== Successful Order ===")
    print("HTTP Status:", response.status_code)
    print("Order Total:", order.total_price)
    print("Order Items:", len(items))
    print("Remaining Stock:", updated_product.stock)


# ==========================================
# STEP 28-E-2: 재고 부족 주문
# ==========================================
def test_order_insufficient_stock(
    test_db: Session,
    test_client: TestClient,
):
    product = Product(
        name="No Stock Test Board Game",
        price=3000,
        category="테스트",
        stock=0,
    )

    test_db.add(product)
    test_db.commit()

    product_id = product.id

    before_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    before_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    response = test_client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2,
                }
            ]
        },
    )

    assert response.status_code == 409

    assert response.json() == {
        "detail": (
            f"Insufficient stock for product {product_id}"
        )
    }

    after_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    after_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    assert after_orders == before_orders
    assert after_items == before_items

    saved_product = test_db.get(
        Product,
        product_id,
    )

    assert saved_product is not None
    assert saved_product.stock == 0

    print("\n=== Insufficient Stock ===")
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


# ==========================================
# STEP 28-E-3: 존재하지 않는 상품
# ==========================================
def test_order_product_not_found(
    test_db: Session,
    test_client: TestClient,
):
    missing_id = 999999

    # 테스트 상품이 실제로 존재하지 않는지 확인
    assert test_db.get(Product, missing_id) is None

    before_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    before_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    response = test_client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": missing_id,
                    "quantity": 2,
                }
            ]
        },
    )

    # 존재하지 않는 상품이므로 HTTP 404
    assert response.status_code == 404

    assert response.json() == {
        "detail": f"Product {missing_id} not found"
    }

    # 주문 및 상세 내역이 생성되지 않았는지 확인
    after_orders = test_db.scalar(
        select(func.count()).select_from(Order)
    )

    after_items = test_db.scalar(
        select(func.count()).select_from(OrderItem)
    )

    assert after_orders == before_orders
    assert after_items == before_items

    print("\n=== Product Not Found ===")
    print("HTTP Status:", response.status_code)
    print("Response:", response.json())
    print(
        "Order Count Unchanged:",
        after_orders == before_orders,
    )
    print(
        "Item Count Unchanged:",
        after_items == before_items,
    )
