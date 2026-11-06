
from fastapi.testclient import TestClient

from chapter14.app.main import app


# ============================================
# 1. 테스트 클라이언트 생성
# ============================================

client = TestClient(app)


# ============================================
# 2. 허용된 Origin 테스트
# ============================================

def test_allowed_origin():
    response = client.get(
        "/members",
        headers={"Origin": "http://localhost:5500"},
    )

    assert response.status_code == 200
    assert response.headers.get(
        "access-control-allow-origin"
    ) == "http://localhost:5500"


# ============================================
# 3. 허용되지 않은 Origin 테스트
# ============================================

def test_disallowed_origin():
    response = client.get(
        "/members",
        headers={"Origin": "http://localhost:5501"},
    )

    assert response.status_code == 200
    assert response.headers.get(
        "access-control-allow-origin"
    ) is None


# ============================================
# 4. 정상 Preflight 요청 테스트
# ============================================

def test_allowed_preflight():
    response = client.options(
        "/members",
        headers={
            "Origin": "http://localhost:5500",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers.get(
        "access-control-allow-origin"
    ) == "http://localhost:5500"


# ============================================
# 5. 차단된 Preflight 요청 테스트
# ============================================

def test_disallowed_preflight():
    response = client.options(
        "/members",
        headers={
            "Origin": "http://localhost:5501",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 400
    assert response.headers.get(
        "access-control-allow-origin"
    ) is None
