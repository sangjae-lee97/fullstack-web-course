
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import select

from common.db import SessionLocal
from chapter12.app.models import Member
from chapter13.app.main import app


# FastAPI 테스트 클라이언트
client = TestClient(app)


# ============================================
# TEST 01. GET 정상 조회 → 200
# ============================================

def test_get_existing_member_returns_200():
    # 기존 DB에서 회원 ID 하나 조회 (읽기 전용)
    with SessionLocal() as db:
        member_id = db.scalar(
            select(Member.member_id)
            .order_by(Member.member_id)
            .limit(1)
        )

    if member_id is None:
        pytest.fail("테스트에 사용할 기존 회원이 없습니다.")

    response = client.get(f"/members/{member_id}")

    assert response.status_code == 200

    body = response.json()

    assert body["member_id"] == member_id
    assert "name" in body
    assert "email" in body
    assert "age" in body


# ============================================
# TEST 02. GET 없는 회원 → 404
# ============================================

def test_get_unknown_member_returns_404():
    response = client.get("/members/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Member not found"


# ============================================
# TEST 03. GET 잘못된 ID 타입 → 422
# ============================================

def test_member_id_validation_returns_422():
    response = client.get("/members/not-a-number")

    assert response.status_code == 422
