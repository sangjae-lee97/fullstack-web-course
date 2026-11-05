# Chapter 13 — 예외 처리 · Logging · TestClient

## 1. 학습 목표

FastAPI에서 API 오류를 적절한 HTTP Status Code로 반환하고, Logging을 통해 실행 흐름을 추적하며, pytest와 TestClient를 사용해 API Contract를 자동 검증한다.

**핵심 학습 내용**
- HTTPException을 이용한 404/409 오류 처리
- logging의 INFO, WARNING, EXCEPTION 이해
- TestClient를 이용한 FastAPI 자동 호출
- pytest의 assert를 활용한 응답 검증
- 테스트 전용 PostgreSQL Schema 분리
- 테스트 데이터 정리 및 반복 실행
- Regression Test를 통한 기존 기능 검증

## 2. 프로젝트 구조

`chapter13/`

- `app/main.py` — FastAPI Endpoint 및 Logging
- `tests/prepare_test_schema.py` — 테스트 전용 Schema 생성
- `tests/test_members.py` — GET 200/404/422 테스트
- `tests/test_post_members.py` — POST 201/409 테스트
- `tests/test_regression.py` — POST 422 회귀 테스트
- `README.md` — 학습 기록

DB 연결은 기존 `common/db.py`의 SQLAlchemy Engine 및 SessionLocal을 재사용한다.

회원 관련 ORM 모델, Repository, Service는 Chapter 12의 기존 구현을 재사용한다.

## 3. HTTPException

API 오류를 HTTP Status Code와 JSON으로 표현한다.

| 상태 코드 | 의미 | 실습 사례 |
|---|---|---|
| 200 | 정상 조회 | 기존 회원 조회 |
| 201 | 생성 성공 | 회원 생성 |
| 404 | 자원 없음 | 존재하지 않는 회원 |
| 409 | 데이터 충돌 | 이메일 중복 |
| 422 | 입력 검증 실패 | 잘못된 타입 |

GET Endpoint에서는 존재하지 않는 회원에 대해 404를 발생시킨다.

POST Endpoint는 Chapter 12의 Service에서 발생한 409 예외를 그대로 FastAPI에 전달한다.

**핵심:** 오류가 발생했다고 무조건 500을 반환하는 것이 아니라 상황에 맞는 HTTP Status Code를 사용한다.

## 4. Logging

Python의 logging 모듈을 이용해 API 실행 과정을 기록했다.

| 로그 레벨 | 역할 |
|---|---|
| INFO | 정상적인 주요 실행 흐름 |
| WARNING | 처리 가능한 비정상 상황 |
| ERROR | 처리 실패 |
| EXCEPTION | 예외 및 Stack Trace 기록 |

검증한 실행 흐름:

1. INFO — 회원 조회 시작
2. SQLAlchemy — SELECT 실행
3. WARNING — 회원 없음
4. SQLAlchemy — ROLLBACK
5. FastAPI — HTTP 404 응답

회원 생성 시에도 INFO 및 중복 이메일 WARNING 로그를 확인했다.

`logger.exception()`의 개념과 사용법은 학습했지만 실제 Stack Trace 발생 검증은 진행하지 않았다.

비밀번호, 인증 토큰 등 민감한 정보는 로그에 기록하지 않는다.

## 5. TestClient와 pytest

`pytest`, `httpx`, FastAPI `TestClient`를 사용했다.

TestClient는 별도의 Uvicorn 서버를 실행하지 않고 FastAPI Endpoint를 호출할 수 있다.

`assert`를 통해 예상 결과와 실제 결과가 일치하는지 검증한다.

HTTP 404가 발생하더라도 예상 결과가 404라면 테스트는 PASS한다.

### 구현한 자동 테스트

| 테스트 | 예상 결과 | 검증 결과 |
|---|---|---|
| GET 정상 회원 | 200 | PASS |
| GET 없는 회원 | 404 | PASS |
| GET 잘못된 ID | 422 | PASS |
| POST 정상 생성 | 201 | PASS |
| POST 중복 이메일 | 409 | PASS |
| POST 잘못된 age | 422 | PASS |

## 6. PostgreSQL 테스트 환경 분리

기존 실습 데이터를 보호하기 위해 `chapter13_test` Schema를 생성했다.

- `practice.members` — 기존 실습 데이터
- `chapter13_test.members` — POST 자동 테스트 데이터

SQLAlchemy의 `schema_translate_map`과 FastAPI의 `dependency_overrides`를 이용해 POST 테스트가 테스트 전용 테이블을 사용하도록 구성했다.

POST 테스트에서 `uuid4()`로 고유 이메일을 생성하고, `finally`에서 테스트 데이터를 삭제한 후 COMMIT한다.

**주의:** 현재 GET 테스트는 기존 `practice.members`를 읽기 전용으로 사용한다. 따라서 모든 테스트가 완전히 독립된 것은 아니다.

## 7. Regression Test

Regression은 코드 변경으로 기존에 정상 동작하던 기능이 고장 나는 현상이다.

코드를 변경한 뒤 기존 테스트 전체를 다시 실행하여 API Contract가 유지되는지 확인한다.

실행 명령어:

`.\.venv\Scripts\python.exe -m pytest -q chapter13/tests/`

최종 확인 결과:

**6 passed, 1 warning in 1.14s**

Starlette와 httpx의 호환성 관련 DeprecationWarning이 발생했지만 테스트는 모두 통과했다.

## 8. 테스트 데이터 검증

반복 테스트 후 PostgreSQL 상태를 확인했다.

| 테이블 | 최종 회원 수 |
|---|---|
| `practice.members` | 10 |
| `chapter13_test.members` | 0 |

**DB 최종 검증: PASS**

테스트가 끝난 후 생성된 데이터가 정리되는 것을 확인했다.

## 9. 주요 학습 내용

- API Contract에는 성공 응답뿐 아니라 실패 응답도 포함된다.
- `raise HTTPException`은 정상 실행 흐름을 중단하고 HTTP 오류 응답을 생성한다.
- Logging은 HTTP 응답과 별개로 실행 과정을 기록한다.
- TestClient는 실제 서버 프로세스 없이 API를 테스트할 수 있다.
- pytest의 PASS는 HTTP 200을 의미하는 것이 아니라 예상 결과와 실제 결과가 일치한다는 뜻이다.
- DB를 변경하는 테스트는 기존 데이터 보호와 정리 전략이 필요하다.
- 자동 테스트를 반복 실행하여 기존 기능이 유지되는지 검증해야 한다.

## 10. 최종 학습 결과

**Chapter 13 핵심 기능 검증 완료**

- HTTPException 404/409 검증 완료
- INFO/WARNING Logging 검증 완료
- pytest 자동 테스트 6개 PASS
- 테스트 반복 실행 PASS
- PostgreSQL 기존 데이터 유지 확인
- 테스트 데이터 정리 확인
- Regression Test 검증 완료

**핵심 결론**

정상적으로 동작하는 API를 구현하는 것뿐 아니라, 오류를 추적하고 기존 기능이 유지되는지를 반복 검증할 수 있어야 한다.

한 번 성공한 API가 앞으로도 정상이라는 보장은 없으므로, 자동화된 회귀 테스트를 통해 품질을 확인한다.
