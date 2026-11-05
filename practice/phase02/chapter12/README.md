
# Chapter 12. SQLAlchemy ORM 기반 CRUD

## 1. 학습 목표

기존 psycopg SQL 방식의 CRUD를 SQLAlchemy ORM으로 전환한다.

- ORM 기반 Create / Read / Update / Delete 구현
- Repository / Service 책임 분리
- Session과 Transaction 생명주기 이해
- commit / rollback / refresh 동작 이해
- PUT / PATCH의 차이 및 기존 API 정책 유지
- IntegrityError를 HTTPException(409)로 변환
- SQLAlchemy Log와 PostgreSQL로 실행 결과 검증

## 2. 프로젝트 구조

```text
chapter12/
├── __init__.py
├── app/
│   ├── __init__.py
│   ├── db.py
│   ├── models.py
│   ├── schemas.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   └── member_repository.py
│   └── services/
│       ├── __init__.py
│       └── member_service.py
└── README.md
```

공통 DB 설정은 `phase02/common/db.py`를 재사용한다.

PostgreSQL의 `practice.members` 테이블을 대상으로 실습한다.

## 3. SQL CRUD와 ORM CRUD

| SQL 작업 | SQLAlchemy ORM |
|---|---|
| INSERT | Member() + db.add() |
| SELECT | select() / db.get() |
| UPDATE | ORM 객체 속성 변경 |
| DELETE | db.delete() |
| COMMIT | db.commit() |
| ROLLBACK | db.rollback() |

ORM은 SQL을 없애는 기술이 아니다.

Python 객체를 통해 DB 작업을 표현하면 SQLAlchemy가
필요한 SQL을 생성하고 실행한다.

## 4. Session과 Transaction

- SessionLocal(): Session 생성
- add(): 객체를 Session에 등록
- flush(): SQL 실행, 트랜잭션 미확정
- commit(): 트랜잭션 확정
- rollback(): 트랜잭션 취소
- refresh(): DB 값을 객체에 다시 반영
- close(): Session 정리

FastAPI의 get_db()는 yield를 이용해 Session을 전달하고,
finally에서 Session을 종료한다.

이번 실습에서는 Repository가 commit/rollback을 담당한다.

실무에서 여러 Repository가 하나의 업무에 참여한다면
Service 또는 Unit of Work에서 트랜잭션을 관리할 수 있다.

## 5. 단계별 학습 내용

### STEP 01. Session Dependency

- 공통 SessionLocal 재사용
- get_db() 구현
- SELECT 1로 PostgreSQL 연결 확인
- Session 종료 시 ROLLBACK 확인

결과: PASS

### STEP 02. Read Repository

- find_all(): 회원 목록 조회
- find_by_id(): PK 기반 상세 조회
- select(), scalars(), get() 사용
- Session Identity Map 동작 확인

검증 결과:
- 전체 회원 9명 조회
- PK 1번 회원 정상 조회
- 존재하지 않는 회원 None 반환

결과: PASS

### STEP 03. Create Repository

- Member 객체 생성
- db.add()로 객체 등록
- db.commit()으로 INSERT 확정
- db.refresh()로 저장된 값 재조회

검증 결과:
- 테스트 회원 ID 16 생성
- INSERT 및 COMMIT 확인
- PostgreSQL 별도 연결로 실제 저장 확인

결과: PASS

### STEP 04. 중복 이메일 검사

- Repository에서 find_by_email() 구현
- Service에서 중복 여부 판단
- 중복 이메일은 HTTPException(409) 발생

검증 결과:
- 중복 이메일 SELECT 확인
- 409 예외 발생
- PostgreSQL COUNT 1건 유지

결과: PASS

### STEP 05. PUT Update

- MemberUpdate Schema 작성
- ORM 객체의 속성을 변경
- Session의 변경 감지 기능으로 UPDATE 실행
- commit() 및 refresh() 수행

검증 결과:
- 회원 ID 16 수정
- 이름 및 나이 변경
- 이메일 유지
- PostgreSQL 실제 값 일치

결과: PASS

### STEP 06. PATCH Update

- MemberPatch Schema 구현
- model_dump(exclude_unset=True) 사용
- 전달된 필드만 setattr()으로 수정

검증 결과:
- age 30 → 31 수정
- 다른 필드 유지
- 빈 PATCH: HTTPException(400)
- 명시적 null: Pydantic ValidationError
- PostgreSQL 실제 데이터 확인

결과: PASS

### STEP 07. Delete Repository

- db.delete()로 삭제 대상 지정
- db.commit()으로 DELETE 확정
- 삭제 후 재조회
- 재삭제 시 404 예외 처리

검증 결과:
- 테스트 회원 ID 17 생성
- DELETE + COMMIT 확인
- 삭제 후 GET 결과 None
- 재삭제 404
- PostgreSQL COUNT 0

결과: PASS

### STEP 08. IntegrityError 처리

- PostgreSQL UNIQUE 제약 확인
- 중복 INSERT 발생 상황 재현
- Repository에서 rollback 수행
- Service에서 IntegrityError를 409로 변환

확인된 UNIQUE 인덱스:
- members_email_key: email
- members_pkey: member_id

검증 결과:
- 중복 INSERT 시도
- IntegrityError 발생
- ROLLBACK 실행
- Service HTTPException(409)
- PostgreSQL COUNT 1건 유지

결과: PASS

## 6. 계층별 책임

Router
→ HTTP 요청 및 응답 처리

Service
→ 비즈니스 규칙 및 오류 판단

Repository
→ ORM 기반 DB 접근 및 CRUD

Session
→ ORM 객체 상태와 Transaction 관리

PostgreSQL
→ 데이터 저장 및 무결성 보장

## 7. API Contract

유지해야 할 API 정책:

| 기능 | 상태 코드 |
|---|---|
| GET 성공 | 200 |
| POST 성공 | 201 |
| PUT 성공 | 200 |
| PATCH 성공 | 200 |
| DELETE 성공 | 204 |
| 회원 없음 | 404 |
| 이메일 중복 | 409 |
| 빈 PATCH | 400 |
| 명시적 null PATCH | 422 |

현재는 Repository와 Service의 동작을 검증했다.

Router를 통한 실제 HTTP 응답과 전체 API Contract는
아직 검증하지 않았다.

## 8. Evidence 검증 결과

완료:
- SQLAlchemy SELECT 로그 확인
- INSERT / UPDATE / DELETE 로그 확인
- COMMIT / ROLLBACK 확인
- ORM 객체 반환값 확인
- PostgreSQL 실제 Row 직접 검증
- UNIQUE 제약 및 IntegrityError 검증

미검증:
- Chapter 12 실제 Swagger HTTP 요청
- HTTP 201 / 200 / 204 / 404 / 409 / 422 응답
- 전체 API Contract 회귀 테스트

## 9. 핵심 학습 정리

1. ORM은 SQL을 대체하는 것이 아니라 SQL 작업을 객체로 표현한다.
2. Session은 DB 연결뿐 아니라 객체 상태와 트랜잭션도 관리한다.
3. flush와 commit은 다르며 rollback으로 미확정 작업을 취소할 수 있다.
4. ORM이 관리하는 객체의 속성을 변경하면 UPDATE가 가능하다.
5. PATCH는 exclude_unset=True로 전달된 필드만 수정한다.
6. Repository는 DB 작업, Service는 업무 규칙을 담당한다.
7. UNIQUE 제약은 데이터 무결성을 지키는 최종 방어선이다.
8. 트랜잭션 경계는 하나의 업무가 성공하거나 실패하는 범위로 결정한다.

## 10. 최종 상태

Chapter 12 STEP 01~08 ORM CRUD 실습 완료.

기존 common/db.py 및 Chapter 01~11 수정 없음.

향후 과제:
- Router 연결 및 실제 HTTP 응답 검증
- PUT/PATCH의 동시성 상황에서 UNIQUE 위반 처리 보강
- Chapter 13 예외 처리, Logging, TestClient 학습
