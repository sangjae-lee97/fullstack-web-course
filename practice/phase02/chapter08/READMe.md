# Chapter 08 — PUT/PATCH + PostgreSQL UPDATE

## 1. 학습 목표

FastAPI의 PUT/PATCH API와 PostgreSQL UPDATE를 연결해 기존 회원 정보를 수정하고, API Contract에 따른 입력 검증 및 오류 처리를 구현한다.

- PUT 전체 수정과 PATCH 부분 수정 구분
- Pydantic Schema를 통한 요청 검증
- 필드 생략과 명시적 null 구분
- Parameterized Query와 동적 UPDATE
- 트랜잭션 commit
- HTTP 오류 처리
- Swagger, PostgreSQL, GET 재조회 검증

## 2. 프로젝트 구성

- `schemas.py`: MemberUpdate, MemberPatch, MemberResponse 정의
- `main.py`: GET, PUT, PATCH Endpoint 구현
- `README.md`: 학습 기록과 검증 결과
- `common/db.py`: 기존 DB 연결 모듈 재사용

기존 Chapter 06·07과 공통 DB 모듈은 수정하지 않는다.

## 3. 핵심 개념

### PUT과 PATCH

| 구분 | PUT | PATCH |
|---|---|---|
| 목적 | 전체 수정 | 부분 수정 |
| 필수 입력 | name, email, age | 변경할 필드만 |
| 생략된 필드 | 422 | 기존 값 유지 |
| 성공 응답 | 200 | 200 |

PUT은 수정 가능한 전체 상태를 전달하고, PATCH는 실제 수정할 필드만 전달한다.

### Pydantic Schema

- `MemberUpdate`: 전체 수정 필드 필수
- `MemberPatch`: 필드 생략 가능, 명시적 null 금지
- `MemberResponse`: 반환 데이터 검증

`model_fields_set`은 실제 전달된 필드를 구분한다.

`model_dump(exclude_unset=True)`는 요청에서 생략한 필드를 제외한다.

명시적 null은 `model_validator`로 차단한다.

### PostgreSQL UPDATE

- `UPDATE`: 기존 데이터 수정
- `SET`: 변경할 컬럼 지정
- `WHERE`: 수정할 회원 식별
- `RETURNING`: 수정 결과 반환
- `commit()`: 변경 내용 확정

PATCH에서는 `allowed_fields`를 통해 허용된 컬럼만 동적으로 SQL에 포함한다.

사용자 입력값은 `%s` Parameterized Query로 전달한다.

## 4. 구현한 API

| Method | Endpoint | 기능 |
|---|---|---|
| GET | `/members/{member_id}` | 회원 단건 조회 |
| PUT | `/members/{member_id}` | 회원 전체 수정 |
| PATCH | `/members/{member_id}` | 회원 부분 수정 |

## 5. 정상 수정 검증

### PUT 전체 수정

`PUT /members/1`

- name: Kim Updated
- email: chapter08-put-test@example.com
- age: 31

**HTTP 200 확인**

Swagger 응답과 PostgreSQL SELECT 결과 일치 확인.

### PATCH 부분 수정

`PATCH /members/1`

요청: `{"age": 35}`

**HTTP 200 확인**

- name: Kim Updated — 유지
- email: chapter08-put-test@example.com — 유지
- age: 31 → 35 — 변경

Swagger 및 PostgreSQL 결과 일치 확인.

## 6. 오류 검증

| 테스트 | HTTP | 결과 |
|---|---|---|
| 빈 PATCH `{}` | 400 | PASS |
| 존재하지 않는 회원 | 404 | PASS |
| 다른 회원의 이메일 중복 | 409 | PASS |
| 명시적 null | 422 | PASS |

명시적 null은 Pydantic 검증에서 차단되고, 빈 PATCH는 Endpoint에서 변경할 필드가 없어 차단된다.

오류 요청 이후 기존 회원 데이터 유지 확인.

## 7. 최종 Evidence

PATCH 응답, PostgreSQL SELECT, GET 재조회 결과가 모두 일치함.

최종 회원 데이터:

- member_id: 1
- name: Kim Updated
- email: chapter08-put-test@example.com
- age: 35

**검증 결과**

- PUT 전체 수정: PASS
- PATCH 부분 수정: PASS
- 필드 생략 및 null 구분: PASS
- HTTP 오류 4종: PASS
- PostgreSQL 변경 및 데이터 유지: PASS
- GET 재조회: PASS

## 8. 학습 정리

이번 실습을 통해 HTTP 메서드에 따라 수정 범위를 정의하고, Pydantic Schema와 PostgreSQL UPDATE를 연결하는 방법을 학습했다.

특히 PATCH는 단순히 일부 데이터만 전달하는 것이 아니라, 클라이언트가 실제 전달한 필드만 추출하여 SQL의 SET 절에 포함해야 한다는 점을 이해했다.

또한 API 응답만으로 성공을 판단하지 않고, PostgreSQL SELECT와 GET 재조회를 통해 실제 데이터 변경을 검증하는 과정의 중요성을 확인했다.

독립 실습은 제외했다.