
# Chapter 09 - DELETE API + PostgreSQL DELETE

## 1. 학습 목표

FastAPI와 PostgreSQL을 활용하여 회원 삭제 API를 구현한다.

- DELETE API Contract 이해
- Path Parameter를 이용한 삭제 대상 식별
- Parameterized Query 적용
- DELETE ... RETURNING 활용
- COMMIT / ROLLBACK 이해
- HTTP 204 / 404 / 422 / 500 구분
- Swagger와 PostgreSQL을 이용한 Evidence 검증

## 2. 프로젝트 구조

```text
phase02/
├── chapter08/
│   └── schemas.py
├── chapter09/
│   ├── main.py
│   └── README.md
├── common/
│   ├── __init__.py
│   └── db.py
├── .env
└── .gitignore
```

기존 common/db.py와 .env를 재사용한다.
Chapter 08의 Pydantic Schema도 재사용한다.

## 3. API Contract

Endpoint: DELETE /members/{member_id}

Request:
- Path Parameter: member_id (int)
- Request Body: 없음

Response:
- 204 No Content: 삭제 성공
- 404 Not Found: 회원 없음
- 422 Validation Error: Path 타입 오류
- 500 Internal Server Error: 서버 내부 오류

204 응답에는 Response Body가 없다.

## 4. 핵심 SQL

```sql
DELETE FROM practice.members
WHERE member_id = %s
RETURNING member_id;
```

- WHERE: 삭제 대상 지정
- %s: Parameterized Query
- RETURNING: 실제 삭제된 행 확인
- fetchone() == None: 삭제 대상 없음

## 5. Transaction

COMMIT:
- 트랜잭션의 변경 사항 확정

ROLLBACK:
- 트랜잭션의 변경 사항 취소

psycopg3의 with conn 컨텍스트는 정상 종료 시
자동 COMMIT을 수행할 수 있으므로 주의한다.

## 6. 실습 및 Evidence

### STEP 01 - 삭제 전 GET 조회

GET /members/1

결과:
- HTTP 200
- 기존 회원 조회 성공
- 회원 ID 1 존재 확인

### STEP 02 - DELETE Endpoint 구현

- Chapter 09 생성
- GET / PUT / PATCH 코드 유지
- DELETE Endpoint 추가
- Swagger Endpoint 등록 확인

결과: PASS

### STEP 03 - 정상 DELETE

DELETE /members/13

결과:
- HTTP 204
- Response Body 없음

결과: PASS

### STEP 04 - PostgreSQL 삭제 확인

```sql
SELECT member_id, name, email, age
FROM practice.members
WHERE member_id = 13;
```

기대 결과: 0 rows

Evidence 상태: 별도 확인 필요

### STEP 05 - GET 재조회

GET /members/13

기대 결과:
- HTTP 404
- Member not found

Evidence 상태: 별도 확인 필요

### STEP 06 - 동일 회원 재삭제

DELETE /members/13

기대 결과:
- HTTP 404
- Member not found

멱등성:
동일한 DELETE를 반복하더라도 최종 서버 상태는 같다.

Evidence 상태: 별도 확인 필요

### STEP 07 - Path 타입 오류

DELETE /members/abc

기대 결과:
- HTTP 422
- int_parsing

Evidence 상태: 별도 확인 필요

### STEP 08 - Transaction 실험

실습 내용:
- INSERT + COMMIT
- DELETE ... RETURNING
- ROLLBACK
- SELECT 재조회
- DELETE + COMMIT

학습 내용:
DELETE 이후 COMMIT 전에는 ROLLBACK으로
삭제를 취소할 수 있다.

Evidence 상태: 별도 확인 필요

### STEP 09 - SQL 오류 실험

잘못된 SQL:

```sql
DELETE FROM practice.members
WHERE member_idx = %s
RETURNING member_id;
```

결과:
- HTTP 500 확인
- Uvicorn SQL 오류 로그 확인
- 정상 SQL 복구

결과: PASS

## 7. 핵심 학습 내용

1. DELETE는 삭제 대상을 정확히 식별해야 한다.
2. Parameterized Query로 SQL을 실행한다.
3. RETURNING으로 삭제된 행의 존재를 확인한다.
4. COMMIT으로 트랜잭션 변경을 확정한다.
5. 204 응답에는 Body가 없어야 한다.
6. 404와 422는 서로 다른 오류다.
7. DELETE는 멱등 메서드다.
8. HTTP 응답과 DB 상태를 함께 검증해야 한다.

## 8. 실행 방법

작업 경로:
C:\dev\fullstack-web-course\practice\phase02

```powershell
python -m uvicorn chapter09.main:app --reload
```

Swagger:
http://127.0.0.1:8000/docs

## 9. 완료 기준

- [x] DELETE Endpoint 구현
- [x] Swagger Endpoint 등록
- [x] 정상 DELETE HTTP 204
- [x] HTTP 500 오류 재현
- [x] SQL 정상 복구
- [ ] DB 삭제 Evidence 최종 확인
- [ ] GET 404 Evidence 최종 확인
- [ ] 재삭제 404 Evidence 최종 확인
- [ ] Path 422 Evidence 최종 확인
- [ ] Transaction 실험 Evidence 최종 확인
- [ ] Git Commit / Push

## 10. 최종 정리

DELETE API는 단순히 HTTP 204를 반환하는 기능이 아니다.

DELETE Contract
→ PostgreSQL DELETE
→ Transaction
→ DB 상태 변화
→ API Evidence

전체 흐름을 검증해야 올바른 삭제 기능이라고 판단할 수 있다.

다음 Chapter:
Router / Service / Repository / Schema / DB 구조화
