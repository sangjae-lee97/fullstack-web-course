# Chapter 11. SQLAlchemy ORM 기초

## 1. 학습 목표

기존 Chapter 05~10에서는 psycopg와 Raw SQL을 사용해 PostgreSQL CRUD를 구현했다.

이번 Chapter에서는 SQLAlchemy ORM을 사용하여 PostgreSQL 테이블을 Python 객체로 매핑하고 데이터를 조회하는 방법을 학습했다.

핵심 학습 내용:

- ORM(Object Relational Mapping)의 개념
- PostgreSQL Table과 SQLAlchemy Model의 관계
- SQLAlchemy Model과 Pydantic Schema의 차이
- Engine과 Session의 역할
- `select()`, `where()`, `scalars()`, `scalar()` 사용
- Raw SQL과 ORM 조회 결과 비교
- SQLAlchemy SQL 로그 검증

## 2. 개발 환경

| 항목 | 환경 |
|---|---|
| Language | Python 3.12 |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.1.8 |
| Driver | psycopg |
| Environment | python-dotenv |
| Virtual Environment | phase02/.venv |

기존 프로젝트의 공통 DB 설정을 재사용했다.

## 3. 프로젝트 구조

- `phase02/.env`: DB 접속 환경변수
- `phase02/.gitignore`: Git 제외 설정
- `phase02/common/db.py`: psycopg 및 SQLAlchemy 공통 DB 연결
- `phase02/chapter11/app/models.py`: Member ORM Model
- `phase02/chapter11/app/main.py`: ORM 조회 실습
- `phase02/chapter11/README.md`: 학습 기록

기존 Chapter 05~10의 DB 연결 방식은 유지했다.

## 4. ORM 핵심 개념

ORM은 관계형 데이터베이스의 테이블과 행을 Python 클래스 및 객체로 매핑하는 기술이다.

| SQL / psycopg | SQLAlchemy ORM |
|---|---|
| Table | Model Class |
| Row | Python Object |
| SELECT | select() |
| WHERE | where() |
| Connection | Engine / Session |
| COMMIT | session.commit() |
| ROLLBACK | session.rollback() |

ORM을 사용하더라도 SQL이 사라지는 것은 아니다.

SQLAlchemy는 ORM 표현을 실제 SQL로 변환하여 PostgreSQL에 전달한다.

## 5. 공통 DB 설정

기존 `common/db.py`를 확장하여 SQLAlchemy Engine과 SessionLocal을 추가했다.

주요 구성 요소:

- `create_engine()`: DB 연결 관리
- `SessionLocal`: ORM Session 생성
- `DeclarativeBase`: ORM Model의 공통 부모 클래스
- `echo=True`: 실행되는 SQL을 터미널에 출력

환경변수는 기존 `phase02/.env`를 사용한다.

## 6. Member ORM Model

실제 PostgreSQL 테이블인 `practice.members`를 매핑했다.

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| member_id | INTEGER | NO | PK |
| name | VARCHAR(50) | NO | |
| email | VARCHAR(100) | NO | UNIQUE |
| age | INTEGER | YES | |
| joined_at | DATE | YES | |

모델에서 `__tablename__ = "members"`와 `__table_args__ = {"schema": "practice"}`를 지정했다.

`Mapped`와 `mapped_column`을 사용하여 Python 타입과 DB 컬럼을 정의했다.

기존 테이블을 매핑하는 실습이므로 `Base.metadata.create_all()`은 실행하지 않았다.

## 7. SQLAlchemy Model과 Pydantic Schema

- **SQLAlchemy Model:** DB 테이블과 컬럼을 매핑하고 ORM 작업에 사용
- **Pydantic Schema:** API 요청과 응답 데이터의 형식을 정의하고 검증

Pydantic은 API 데이터 검증을 담당하며, SQLAlchemy는 DB와의 객체 매핑 및 작업을 담당한다.

## 8. ORM Session

기존 psycopg는 Connection과 Cursor를 통해 SQL을 실행했다.

SQLAlchemy ORM은 Session을 통해 객체 조회·변경 상태와 트랜잭션을 관리한다.

`with SessionLocal() as session:` 구문을 사용하여 Session 종료를 자동 처리했다.

## 9. ORM 조회 실습

### 전체 회원 조회

`select(Member).order_by(Member.member_id)`로 전체 회원을 조회했다.

`session.scalars(stmt).all()`을 통해 Member 객체 목록을 가져왔다.

**검증 결과: 회원 9명 조회 성공**

### 특정 회원 조회

`select(Member).where(Member.member_id == 1)`을 사용했다.

`session.scalar(stmt)`로 첫 번째 ORM 객체를 반환받았다.

조회 결과:

- member_id: 1
- name: Kim Updated
- email: chapter08-put-test@example.com
- age: 40
- joined_at: 2026-11-01
- 객체 타입: Member

### 존재하지 않는 회원 조회

`member_id = 999999` 조건으로 조회했다.

**결과: None**

SQLAlchemy는 조회 결과가 없을 때 자동으로 HTTP 404를 반환하지 않는다.

FastAPI의 Service 또는 Router에서 `None`을 확인하여 HTTP 404로 변환할 수 있다.

## 10. Raw SQL과 ORM 비교

DBeaver에서 직접 SQL을 실행하여 `member_id = 1`인 회원을 조회했다.

검증한 항목:

- member_id
- name
- email
- age
- joined_at

**Raw SQL 결과와 ORM 객체 데이터가 모두 일치했다.**

또한 `echo=True` 로그에서 실제 SELECT 및 WHERE 조건이 포함된 SQL 실행을 확인했다.

### 핵심 Evidence

- PostgreSQL Raw SQL Result: PASS
- SQLAlchemy ORM Object: PASS
- SQLAlchemy SQL Log: PASS

## 11. 실행 방법

프로젝트의 `phase02` 디렉터리에서 실행한다.

`python -m chapter11.app.main`

정상 실행 시 다음 결과를 확인할 수 있다.

- 전체 회원 조회
- 특정 회원 조회
- 존재하지 않는 회원 조회
- SQLAlchemy SELECT 로그

## 12. Git 보안 검증

공통 환경변수 파일 `phase02/.env`가 Git에서 제외되는지 확인했다.

검증 명령:

- `git check-ignore -v -- .env`
- `git ls-files --error-unmatch -- .env`

검증 결과:

- `.gitignore` 제외 규칙 적용 확인
- `.env`가 현재 Git 추적 대상이 아님을 확인

**결과: PASS**

## 13. Definition of Done

- [x] SQLAlchemy 설치 완료
- [x] 환경변수 기반 Database URL 구성
- [x] Member Model과 실제 PostgreSQL 테이블 구조 일치
- [x] Session 생성 및 종료 확인
- [x] 전체 회원 ORM 조회 성공
- [x] 특정 회원 ORM 조회 성공
- [x] 존재하지 않는 회원 조회 시 None 확인
- [x] SQLAlchemy SQL 로그 확인
- [x] Raw SQL과 ORM 결과 일치
- [x] .env Git 제외 확인

**최종 결과: 10/10 PASS**

## 14. 핵심 정리

이번 Chapter에서는 ORM이 SQL을 대체하는 것이 아니라, SQL과 데이터베이스 구조를 Python 객체로 다루는 기술임을 이해했다.

기존 PostgreSQL 테이블을 변경하지 않고 SQLAlchemy Model에 정확히 매핑했다.

Session을 사용한 조회와 트랜잭션 관리의 기본 구조를 익혔으며, 실제 SQL 로그 및 Raw SQL 결과와 비교하여 ORM의 정상 동작을 검증했다.

다음 Chapter에서는 `session.add()`, `session.delete()`, `commit()`, `rollback()` 등을 활용하여 ORM 기반 CRUD를 구현한다.