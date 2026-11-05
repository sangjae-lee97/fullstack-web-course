
from fastapi.testclient import TestClient

from chapter13.app.main import app


client = TestClient(app)


# ============================================
# TEST 06. POST 잘못된 age → 422
# ============================================

def test_post_invalid_age_returns_422():
    response = client.post(
        "/members",
        json={
            "name": "Invalid Age Test",
            "email": "invalid-age@example.com",
            "age": "not-a-number",
        },
    )

    assert response.status_code == 422

    body = response.json()

    assert "detail" in body
    assert isinstance(body["detail"], list)
