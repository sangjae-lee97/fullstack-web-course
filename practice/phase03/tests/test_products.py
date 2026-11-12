
import pytest

from fastapi.testclient import TestClient

from backend.db import get_db
from backend.main import app
from backend.models import Product


# ========================================
# Fake Database
# ========================================

class FakeScalarResult:
    def __init__(self, products):
        self.products = products

    def all(self):
        return self.products


class FakeProductSession:
    def __init__(self, products):
        self.products = products

    def scalars(self, statement):
        # Verify the repository queries Product.
        entity = statement.column_descriptions[0]["entity"]
        assert entity is Product

        return FakeScalarResult(self.products)


# ========================================
# pytest Fixtures
# ========================================

@pytest.fixture
def sample_products():
    return [
        Product(
            id=1,
            name="블러드 온 더 클락타워",
            price=180000,
            category="추리·마피아",
            stock=8,
        ),
        Product(
            id=6,
            name="윙스팬",
            price=65000,
            category="전략",
            stock=0,
        ),
    ]


@pytest.fixture
def client_for_products():
    previous_override = app.dependency_overrides.get(get_db)

    def create_client(products):
        fake_db = FakeProductSession(products)

        def override_get_db():
            yield fake_db

        app.dependency_overrides[get_db] = override_get_db

        return TestClient(app)

    yield create_client

    # Restore the original dependency configuration.
    if previous_override is None:
        app.dependency_overrides.pop(get_db, None)
    else:
        app.dependency_overrides[get_db] = previous_override


# ========================================
# Test 01: HTTP 200 and JSON Array
# ========================================

def test_get_products_returns_200_and_list(
    client_for_products,
    sample_products,
):
    with client_for_products(sample_products) as client:
        response = client.get("/products")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 2


# ========================================
# Test 02: Product Fields and Types
# ========================================

def test_get_products_fields(
    client_for_products,
    sample_products,
):
    with client_for_products(sample_products) as client:
        response = client.get("/products")

    data = response.json()

    assert response.status_code == 200

    product = data[0]

    assert product == {
        "id": 1,
        "name": "블러드 온 더 클락타워",
        "price": 180000,
        "category": "추리·마피아",
        "stock": 8,
    }

    assert type(product["id"]) is int
    assert type(product["name"]) is str
    assert type(product["price"]) is int
    assert type(product["category"]) is str
    assert type(product["stock"]) is int

    # Sold-out products must remain visible.
    assert data[1]["name"] == "윙스팬"
    assert data[1]["stock"] == 0


# ========================================
# Test 03: Empty Product List
# ========================================

def test_get_products_empty_list(
    client_for_products,
):
    with client_for_products([]) as client:
        response = client.get("/products")

    assert response.status_code == 200
    assert response.json() == []
