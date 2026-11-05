
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from common.db import engine
from chapter12.app.models import Member
from chapter13.app.main import app, get_db


# ============================================
# 1. 테스트 전용 DB 설정
# ============================================

test_engine = engine.execution_options(
    schema_translate_map={
        "practice": "chapter13_test"
    }
)


def override_get_db():
    with Session(bind=test_engine) as db:
        yield db


# ============================================
# 2. TestClient 의존성 변경
# ============================================

@pytest.fixture
def client():
    original = app.dependency_overrides.get(get_db)

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        if original is None:
            app.dependency_overrides.pop(get_db, None)
        else:
            app.dependency_overrides[get_db] = original


# ============================================
# 3. 테스트 데이터 정리
# ============================================

def cleanup_member(email: str):
    with Session(bind=test_engine) as db:
        db.execute(
            delete(Member).where(Member.email == email)
        )
        db.commit()


# ============================================
# TEST 01. POST 정상 생성 → 201
# ============================================

def test_create_member_returns_201(client):
    email = f"test-{uuid4()}@example.com"

    try:
        response = client.post(
            "/members",
            json={
                "name": "Test User",
                "email": email,
                "age": 30,
            },
        )

        assert response.status_code == 201

        body = response.json()

        assert body["name"] == "Test User"
        assert body["email"] == email

        # 테스트 DB에 실제 저장되었는지 확인
        with Session(bind=test_engine) as db:
            member = db.scalar(
                select(Member).where(Member.email == email)
            )

            assert member is not None

    finally:
        cleanup_member(email)


# ============================================
# TEST 02. POST 중복 이메일 → 409
# ============================================

def test_duplicate_email_returns_409(client):
    email = f"duplicate-{uuid4()}@example.com"

    try:
        first = client.post(
            "/members",
            json={
                "name": "First",
                "email": email,
                "age": 30,
            },
        )

        assert first.status_code == 201

        second = client.post(
            "/members",
            json={
                "name": "Second",
                "email": email,
                "age": 31,
            },
        )

        assert second.status_code == 409
        assert second.json()["detail"] == "Email already exists"

        # 중복 INSERT가 발생하지 않았는지 확인
        with Session(bind=test_engine) as db:
            count = db.scalar(
                select(func.count())
                .select_from(Member)
                .where(Member.email == email)
            )

            assert count == 1

    finally:
        cleanup_member(email)
