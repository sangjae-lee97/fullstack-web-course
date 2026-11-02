# Chapter 07 — POST /members + INSERT + Transaction

## 1. 학습 목표

FastAPI POST API를 PostgreSQL INSERT와 연결하고, 트랜잭션을 이용한 데이터 저장 및 오류 처리를 학습한다.

## 2. 프로젝트 구조

| 파일 | 역할 |
|---|---|
| `main.py` | FastAPI 앱 생성 및 Router 등록 |
| `member_create.py` | POST /members 구현 |
| `schemas.py` | Pydantic 요청·응답 모델 |
| `queries.py` | INSERT SQL 정의 |
| `step05_test.py` | RETURNING / rollback 테스트 |
| `step06_test.py` | commit / DB 저장 검증 |
| `step12_rollback_test.py` | SQL 오류 및 rollback 검증 |
| `common/db.py` | 공통 DB 연결 함수 (상위 폴더) |

DB 접속 정보는 `phase02/.env`에서 관리한다.

## 3. 핵심 학습 내용

### Pydantic Validation
- `MemberCreate`: name, email, age 입력 검증
- `MemberCreatedResponse`: 입력 필드를 상속하고 id 추가
- 잘못된 입력은 Endpoint 실행 전에 HTTP 422 반환

### Parameterized Query
- SQL에 `%s`를 사용해 입력값 전달
- SQL 구조와 데이터를 분리하여 SQL Injection 위험 감소

### INSERT + RETURNING
- INSERT로 회원 데이터 생성
- RETURNING으로 생성된 member_id 및 회원 정보 반환
- RETURNING 자체는 DB 저장을 확정하지 않음

### Transaction
- `commit()`: 트랜잭션 변경 확정
- `rollback()`: 확정되지 않은 변경 취소
- `finally`: DB Connection 종료
- INSERT 성공 후 오류가 발생해도 rollback하면 해당 변경이 취소됨

### HTTP 상태 코드

| 코드 | 의미 |
|---|---|
| 201 | 회원 생성 성공 |
| 409 | 이메일 중복 |
| 422 | 입력값 검증 실패 |
| 500 | 서버 내부 DB 처리 오류 |

## 4. API 처리 흐름

POST /members

→ Pydantic 입력 검증

→ get_connection()으로 DB 연결

→ SELECT 이메일 중복 확인

→ Parameterized INSERT

→ RETURNING 생성 정보 반환

→ commit()

→ HTTP 201 Created

오류 발생 시 rollback 후 적절한 HTTP 상태 코드를 반환한다.

## 5. 실습 검증 결과

| 검증 항목 | 결과 |
|---|---|
| Pydantic 모델 검증 | PASS |
| 이메일 중복 SELECT | PASS |
| INSERT SQL 작성 | PASS |
| RETURNING 결과 확인 | PASS |
| commit 후 DB SELECT 일치 | PASS |
| Swagger POST /members 등록 | PASS |
| HTTP 201 Created | PASS |
| HTTP 409 Conflict | PASS |
| HTTP 422 Validation Error | PASS |
| HTTP 500 DB 오류 | PASS |
| rollback 후 DB 데이터 0건 | PASS |
| 오류 코드 복구 및 정상 POST 재검증 | PASS |

주요 Evidence:
- 정상 INSERT 및 commit: `member_id=8`, DB 저장 검증 True
- Swagger 회원 생성: `member_id=9`
- rollback 테스트: `member_id=10`, DB 잔존 데이터 0건
- DB 오류 시 HTTP 500 반환 및 rollback 정상 확인

## 6. 주의사항

- `.env` 파일은 Git에 업로드하지 않는다.
- DB 연결 함수는 `common/db.py`에서 재사용한다.
- SELECT 중복 검사만으로는 동시 요청을 완전히 방지할 수 없으므로 DB UNIQUE 제약조건이 필요하다.
- rollback 이후에도 PostgreSQL의 자동 증가 ID는 건너뛸 수 있다.

## 7. 최종 학습 정리

이번 Chapter에서는 FastAPI POST 요청을 실제 PostgreSQL INSERT와 연결했다.

특히 다음 세 가지를 이해했다.

1. **RETURNING과 commit은 다르다.** 데이터를 반환받았다고 저장이 확정되는 것은 아니다.
2. **트랜잭션은 데이터 일관성을 보장하는 핵심 기능이다.** 오류 발생 시 rollback으로 미확정 변경을 취소할 수 있다.
3. **API 응답만으로는 충분하지 않다.** Swagger, PostgreSQL SELECT, 서버 로그를 함께 검증해야 한다.

**최종 결과:** Chapter 07 완료. 독립 실습 POST /courses는 제외했다.