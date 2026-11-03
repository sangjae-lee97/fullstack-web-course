# Chapter 10. Backend 구조화 — Router / Service / Repository / Schema / DB

## 1. 학습 목표

기존 Chapter 06~09에서 FastAPI Endpoint 내부에 구현했던 HTTP 처리, 업무 규칙, SQL 실행을 역할별 계층으로 분리한다.

핵심 목표는 기능 추가가 아니라 **기존 API 동작을 유지하면서 코드의 책임을 명확히 하는 리팩터링(Refactoring)**이다.

## 2. 프로젝트 구조

```text
phase02/
├── common/
│   └── db.py
├── .env
└── chapter10/
    ├── README.md
    └── app/
        ├── __init__.py
        ├── main.py
        ├── db.py
        ├── schemas.py
        ├── routers/
        │   ├── __init__.py
        │   └── members.py
        ├── services/
        │   ├── __init__.py
        │   └── member_service.py
        └── repositories/
            ├── __init__.py
            └── member_repository.py
```

기존 `common/db.py`와 `.env`를 재사용했으며 Chapter 06~09 코드는 수정하지 않았다.

## 3. 계층별 역할

| 계층 | 주요 역할 |
|---|---|
| Main | FastAPI 애플리케이션 생성 및 Router 등록 |
| Router | HTTP 요청 수신, Endpoint 정의, Service 호출 |
| Service | 회원 존재 여부 및 이메일 중복 등 업무 규칙 처리 |
| Repository | PostgreSQL SQL 실행 및 조회 결과 반환 |
| Schema | Pydantic을 이용한 Request/Response 데이터 검증 |
| DB | PostgreSQL 연결 관리 |

### API 처리 흐름

```text
Client
  ↓
Router
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

응답은 반대 방향으로 전달된다.

### 구현 함수

**Repository**

- `find_all()` : 전체 회원 조회
- `find_by_id()` : 특정 회원 조회
- `exists_by_email()` : 이메일 중복 검사
- `create()` : 회원 생성 및 COMMIT

**Service**

- `get_members()` : 전체 회원 조회
- `get_member()` : 없는 회원에 대해 HTTP 404 처리
- `create_member()` : 이메일 중복 시 HTTP 409 처리

**Router**

- `GET /members`
- `GET /members/{member_id}`
- `POST /members`

## 4. PostgreSQL Schema 문제 해결

초기 SELECT 실행 시 다음 오류가 발생했다.

```text
psycopg.errors.UndefinedTable:
"members" 이름의 릴레이션이 없습니다
```

실제 DB 구조 확인 결과:

```text
Database: postgres
Current Schema: public
Search Path: "$user", public
실제 테이블: practice.members
```

원인은 `members` 테이블이 `public`이 아닌 `practice` Schema에 존재했기 때문이다.

따라서 Repository의 SQL을 다음과 같이 변경했다.

```sql
SELECT member_id, name, email, age
FROM practice.members
ORDER BY member_id;
```

수정 후 회원 8명 조회에 성공했다.

## 5. 핵심 구현 개념

### 5.1 Router와 Service 분리

Router는 HTTP 요청을 수신하고 Service 함수를 호출한다.

Service는 업무 규칙을 판단하고 Repository를 호출한다.

Repository에는 HTTPException을 사용하지 않고 SQL 실행 및 데이터 접근 로직만 배치한다.

### 5.2 이메일 중복 검사

회원 생성 시 전체 회원을 대상으로 이메일 중복을 확인한다.

회원 수정 시에는 자기 자신의 ID를 제외하고 다른 회원의 이메일과 비교한다.

```sql
SELECT 1
FROM practice.members
WHERE email = %s
AND member_id <> %s;
```

`fetchone() is not None`으로 중복 존재 여부를 Boolean 값으로 반환한다.

### 5.3 HTTP 오류 처리

- 404 Not Found: 조회 대상 회원이 존재하지 않음
- 409 Conflict: 이미 사용 중인 이메일
- 422 Unprocessable Entity: 요청 데이터 형식 검증 실패

이번 실습에서는 404와 409를 실제 검증했다.

### 5.4 INSERT와 RETURNING

```sql
INSERT INTO practice.members (name, email, age)
VALUES (%s, %s, %s)
RETURNING member_id, name, email, age;
```

`RETURNING`을 사용하면 INSERT된 회원 정보를 즉시 반환받을 수 있다.

`conn.commit()`으로 트랜잭션을 확정한다.

## 6. 실습 Evidence

| 검증 항목 | 결과 |
|---|---|
| PostgreSQL 연결 | PASS |
| Pydantic Schema 4개 import | PASS |
| Repository SELECT 조회 | PASS |
| Create Repository 함수 import | PASS |
| Service 회원 조회 | PASS |
| Swagger `/docs` HTTP 200 | PASS |
| OpenAPI `/openapi.json` HTTP 200 | PASS |
| GET `/members` HTTP 200 | PASS |
| POST 회원의 PostgreSQL 저장 확인 | PASS |
| POST 중복 이메일 HTTP 409 | PASS |
| 중복 INSERT 방지 (COUNT 1) | PASS |
| GET `/members/999` HTTP 404 | PASS |
| Swagger POST HTTP 201 직접 확인 | 미확인 |
| 별도 Schema 유효성 검증 테스트 | 미확인 |
| 전체 CRUD Regression Test | 미진행 |

### INSERT 검증

```text
member_id: 15
name: Chapter10_TEST
email: chapter10_step07_20261103@example.com
age: 30
```

PostgreSQL에서 회원 생성 결과를 직접 확인했다.

### 이메일 중복 검증

```text
HTTP 409 Conflict

{
  "detail": "Email already exists"
}

중복 이메일 회원 수: 1
```

중복 이메일 요청에서 기존 데이터가 중복 저장되지 않았음을 확인했다.

### 없는 회원 조회 검증

```text
GET /members/999

HTTP 404

{
  "detail": "Member not found"
}
```

Service의 회원 존재 여부 검사가 정상 작동함을 확인했다.

## 7. 학습 중 발생한 오류

### ModuleNotFoundError

`repositories`, `services` 패키지를 찾지 못하는 오류가 발생했다.

원인은 폴더 및 Python 파일의 실제 위치가 기대한 import 경로와 일치하지 않았기 때문이다.

패키지 폴더와 `__init__.py`를 생성하고 파일 위치를 수정하여 해결했다.

### UndefinedTable

`members` 테이블을 찾지 못하는 오류가 발생했다.

실제 테이블의 Schema가 `practice`임을 확인하고 SQL에서 `practice.members`를 명시하여 해결했다.

## 8. 학습 결과 및 남은 작업

이번 Chapter에서 GET/POST의 주요 계층 분리와 데이터베이스 연동을 구현하고 확인했다.

**핵심 학습 내용**

1. 파일 분리의 목적은 책임 분리다.
2. Router는 HTTP, Service는 업무 규칙, Repository는 DB 접근을 담당한다.
3. Schema는 요청과 응답의 데이터 계약이다.
4. PostgreSQL에서는 데이터베이스와 Schema를 구분해야 한다.
5. 리팩터링 이후에는 기존 API 동작이 유지되는지 Regression Test가 필요하다.

**남은 작업**

- PUT/PATCH/DELETE 계층 분리
- 기존 API Contract 전체 비교
- 전체 CRUD Regression Test
- 미확인 Evidence 추가 검증

PUT/PATCH/DELETE 분리는 다음 학습으로 이월한다.

## 9. 최종 정리

Chapter 10에서는 FastAPI 백엔드를 계층형 아키텍처로 구조화하는 방법을 학습했다.

단순히 파일을 나누는 것이 아니라 **각 코드의 책임을 분리하면서 기존 API 동작을 유지하는 것**이 리팩터링의 핵심임을 이해했다.