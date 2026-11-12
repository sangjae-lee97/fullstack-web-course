
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from backend.db import engine
from backend.models import Product


def test_a_commit_is_isolated(
    test_db: Session,
):
    # 테스트 전용 상품 생성
    product = Product(
        name="Fixture Test Game",
        price=1000,
        category="테스트",
        stock=5,
    )

    test_db.add(product)

    # 실제 Service처럼 commit 호출
    test_db.commit()

    # 현재 테스트에서는 상품이 조회되어야 함
    count = test_db.scalar(
        select(func.count()).select_from(Product)
    )

    assert count == 1

    # 다른 DB 연결에서는 미확정 데이터를 볼 수 없음
    with engine.connect() as conn:
        persisted_count = conn.scalar(
            text(
                "SELECT COUNT(*) "
                "FROM chapter09_test.products"
            )
        )

    assert persisted_count == 0


def test_b_previous_data_was_rolled_back(
    test_db: Session,
):
    # 앞 테스트에서 생성한 상품은 없어야 함
    count = test_db.scalar(
        select(func.count()).select_from(Product)
    )

    assert count == 0
