
# Chapter 05 학습 기록

## 1. 학습 주제

PostgreSQL 연결과 DB 접근 구조

### 학습 목표
- FastAPI와 PostgreSQL의 연결 구조 이해
- 환경변수를 이용한 DB 접속 정보 관리
- psycopg를 활용한 PostgreSQL 연결
- Database 및 Schema 검증
- SQL 실행과 Python 데이터 조회
- Query Lifecycle 이해

## 2. 내가 연결한 Database / Schema

| 항목 | 확인 결과 |
|---|---|
| Database | postgres |
| 기본 Schema | public |
| 실제 회원 테이블 Schema | practice |
| 회원 테이블 | practice.members |
| DB Driver | psycopg |

`current_database()`와 `current_schema()`를 실행한 결과:

```text
('postgres', 'public')
```

기본 Schema가 public이어도 다른 Schema의 테이블을 조회할 수 있음을 확인했다.

실제 회원 테이블은 `practice.members`에 존재하므로 SQL에서 Schema를 명시했다.

## 3. 환경변수를 사용한 이유

DB 주소, 포트, 사용자 계정, 비밀번호 등은 Python 코드에 직접 작성하지 않고 `.env` 파일에 저장했다.

이를 통해 코드와 환경별 설정을 분리할 수 있다.

`python-dotenv`의 `load_dotenv()`로 환경변수를 로드하고 `os.getenv()`로 필요한 값을 가져왔다.

`.gitignore`에 다음 항목을 추가했다.

```gitignore
.env
.venv/
__pycache__/
```

`git status`, `git check-ignore`, `git ls-files`를 통해 `.env`가 Git에서 추적되지 않는지 검증했다.

## 4. DB 연결 흐름을 내 말로 설명

1. Python 프로그램에서 `get_connection()`을 호출한다.
2. psycopg가 환경변수의 연결 정보를 이용해 PostgreSQL에 접속한다.
3. Connection에서 Cursor를 생성한다.
4. `execute()`로 SQL을 실행한다.
5. `fetchone()` 또는 `fetchall()`로 조회 결과를 가져온다.
6. 결과를 Python Tuple/List 형태로 사용한다.
7. `with` 문을 통해 Cursor와 Connection을 정리한다.

FastAPI가 직접 DB에 연결하는 것이 아니라, Python의 DB Driver인 psycopg를 통해 연결한다는 점을 이해했다.

## 5. 실행한 SELECT

### Database 및 Schema 확인

```sql
SELECT current_database(), current_schema();
```

### 회원 테이블 확인

```sql
SELECT *
FROM practice.members
LIMIT 5;
```

실제 컬럼 구조:

```python
[
    'member_id',
    'name',
    'email',
    'age',
    'joined_at'
]
```

## 6. 확인한 정상 결과

Python에서 `fetch_members()`를 실행한 결과 회원 데이터 5행을 가져오는 데 성공했다.

```text
=== 실제 컬럼 구조 ===
['member_id', 'name', 'email', 'age', 'joined_at']

=== 회원 목록 ===
회원 데이터 5행 출력 성공

조회된 회원 수: 5
```

실제 데이터는 Tuple 형태로 반환되었다.

특히 PostgreSQL의 DATE 타입이 Python에서는 `datetime.date` 객체로 변환되는 것을 확인했다.

`fetchall()`은 여러 행을 List로 반환하며, 각 행은 Tuple 형태로 구성된다.

## 7. 발생한 오류와 원인

### 문제 1. Python 실행 결과가 출력되지 않음

원인:
- main.py 수정 후 저장하지 않았음

해결:
- main.py 내용을 확인하고 저장한 뒤 재실행
- Database 및 Schema 출력 성공

### 문제 2. ImportError 발생

오류:

```text
ImportError: cannot import name 'fetch_members' from 'db'
```

원인:
- main.py에서는 `fetch_members()`를 호출했지만 db.py에는 해당 함수가 정의되어 있지 않았음

해결:
- db.py에 `fetch_members()` 함수를 추가
- Python 파일을 저장하고 다시 실행
- 회원 데이터 5행 조회 성공

## 8. AI에게 질문한 내용

- PostgreSQL 연결과 실제 연결 대상 검증의 차이
- Database와 Schema의 역할
- `get_connection()`을 함수로 분리하는 이유
- `execute()`, `fetchone()`, `fetchall()`의 차이
- Query Lifecycle과 Connection 정리 과정
- ImportError 발생 원인 및 해결
- Python Tuple/List와 JSON의 차이

## 9. 내가 직접 검증한 내용

- [x] .env 작성 및 환경변수 로드
- [x] .gitignore 설정 및 Git 제외 여부 확인
- [x] psycopg 설치 확인
- [x] get_connection() 함수 작성
- [x] PostgreSQL 연결 성공
- [x] 현재 Database 확인
- [x] 현재 Schema 확인
- [x] 실제 members 테이블 확인
- [x] 회원 테이블 컬럼 구조 확인
- [x] Python에서 회원 데이터 5행 조회
- [x] DBeaver와 Python 조회 결과 비교
- [x] SQL 결과의 Python 자료형 확인

## 10. 핵심 정리

PostgreSQL에 연결되었다는 사실만으로 원하는 Database와 Schema를 사용하고 있다고 확신할 수 없다.

SQL을 실행하기 전에 실제 연결 대상과 테이블 구조를 확인해야 한다.

또한 DB Driver가 가져온 결과는 Python 데이터이며, API에서 JSON으로 응답하려면 적절한 변환 과정이 필요하다.

Chapter 05에서는 실제 PostgreSQL 데이터를 Python에서 읽는 데 성공했다.

다음 Chapter 06에서는 이 데이터를 FastAPI Endpoint와 연결한다.
