
from collections.abc import Iterator

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from backend.db import engine, get_db
from backend.main import app


TEST_SCHEMA = "chapter09_test"


@pytest.fixture
def test_db() -> Iterator[Session]:

    # STEP 1: 별도 연결에서 DB 상태 확인
    with engine.connect() as check_conn:
        database_name = check_conn.scalar(
            text("SELECT current_database()")
        )

        if database_name != "postgres":
            raise RuntimeError(
                f"Unexpected database: {database_name}"
            )

        inspector = inspect(check_conn)

        required_tables = [
            "products",
            "orders",
            "order_items",
        ]

        if not inspector.has_schema(TEST_SCHEMA):
            raise RuntimeError(
                f"Missing schema: {TEST_SCHEMA}"
            )

        for name in required_tables:
            if not inspector.has_table(
                name,
                schema=TEST_SCHEMA,
            ):
                raise RuntimeError(
                    f"Missing table: {TEST_SCHEMA}.{name}"
                )

    # STEP 2: 테스트 전용 연결 생성
    with engine.connect() as conn:

        # 반드시 다른 SQL 작업보다 먼저 실행
        outer_transaction = conn.begin()

        # STEP 3: 테스트 스키마로 변환
        test_conn = conn.execution_options(
            schema_translate_map={
                "practice": TEST_SCHEMA
            }
        )

        # STEP 4: SAVEPOINT 기반 Session 생성
        session = Session(
            bind=test_conn,
            autoflush=False,
            join_transaction_mode="create_savepoint",
        )

        try:
            yield session

        finally:
            # STEP 5: Session 종료
            try:
                session.close()
            finally:
                # STEP 6: 외부 트랜잭션 전체 취소
                if outer_transaction.is_active:
                    outer_transaction.rollback()


@pytest.fixture
def test_client(
    test_db: Session,
) -> Iterator[TestClient]:

    previous_override = app.dependency_overrides.get(
        get_db
    )

    def override_get_db() -> Iterator[Session]:
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            yield client

    finally:
        if previous_override is None:
            app.dependency_overrides.pop(get_db, None)
        else:
            app.dependency_overrides[get_db] = (
                previous_override
            )
