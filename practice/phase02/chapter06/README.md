
# Chapter 06 — FastAPI와 PostgreSQL 연결

## 1. 학습 목표

- FastAPI Endpoint에서 PostgreSQL 데이터 조회
- DB Row를 Python dict로 변환
- Pydantic Response Model을 통한 응답 검증
- Swagger와 DB 조회 결과 비교
- SQL 오류와 Response Validation 오류 구분

## 2. 개발 환경

- Python 가상환경: phase02/.venv
- FastAPI: 0.162.0
- Uvicorn: 0.54.0
- psycopg: 3.3.6
- python-dotenv: 1.2.4
- PostgreSQL
- Database: postgres
- Schema: practice

## 3. API Contract

Method: GET
Endpoint: /members
Request Body: 없음
Success Status: 200 OK

Response:
- JSON 배열
- member_id: int
- name: str
- email: str

Definition of Done:
- HTTP 200 반환
- JSON 배열 반환
- 실제 DB 데이터와 일치
- 불필요한 민감정보 제외

## 4. 사용한 SQL

```sql
SELECT member_id, name, email
FROM members
ORDER BY member_id;
```

## 5. DB Evidence

DBeaver 조회 결과:

- Database: postgres
- Schema: practice
- 총 회원 수: 5명
- member_id: 1, 2, 3, 4, 6
- 정렬: member_id 오름차순
- name 및 email 컬럼 확인

## 6. Swagger Evidence

GET /members 실행 결과:

- HTTP Status: 200
- Response Type: JSON Array
- 반환 객체: 5개
- member_id: 1, 2, 3, 4, 6
- 이름 및 이메일: DB 결과와 일치
- 정렬 순서: 일치

결론:
API 응답이 실제 PostgreSQL 데이터와 일치함을 검증했다.

## 7. DB Row가 JSON이 되기까지의 흐름

1. Swagger에서 GET /members 호출
2. FastAPI Endpoint 실행
3. get_connection()으로 PostgreSQL 연결
4. SELECT SQL 실행
5. fetchall()로 전체 행 조회
6. dict_row를 통해 딕셔너리 형태로 반환
7. MemberResponse로 응답 데이터 검증
8. JSON 배열로 직렬화하여 반환

## 8. 오류 검증

### STEP 10 — SQL 컬럼 오류

의도적인 오류:
SELECT member_id, member_name, email

발생 결과:
- HTTP 500 Internal Server Error
- psycopg.errors.UndefinedColumn
- member_name 컬럼이 존재하지 않음

실패 위치:
PostgreSQL SQL 실행 단계

해결:
member_name을 name으로 수정

복구 결과:
HTTP 200 및 회원 5명 반환 확인

### STEP 11 — Response Model 불일치

의도적인 오류:
MemberResponse에 필수 필드 age: int 추가

원인:
SQL 결과에는 age가 존재하지 않지만
Response Model에서는 age를 필수로 요구함

예상 오류:
- HTTP 500
- ResponseValidationError
- age 필드 누락

실패 위치:
SQL 실행 이후 Response Model 검증 단계

해결:
age: int 제거 후 정상 코드 복구

## 9. LLM에게 질문한 내용

- psycopg와 dict_row의 역할
- DB 연결 및 Schema 확인 방법
- Response Model의 목적
- SQL 오류와 Response Validation 오류의 차이
- Swagger와 DB 결과 비교 방법

## 10. 직접 확인 및 수정한 부분

- 패키지 설치 상태 확인
- database.py Import 검증
- PostgreSQL 연결 검증
- MemberResponse 필드 검증
- GET /members Endpoint 등록 확인
- DBeaver에서 SELECT 실행
- Swagger에서 실제 회원 5명 조회
- UndefinedColumn 오류 재현
- SQL 복구 및 정상 응답 재확인
- Response Model 불일치 학습

## 11. 핵심 학습 내용

SQL 실행 성공과 API 응답 성공은 다르다.

API가 정상 동작하려면 다음 단계가 모두 성공해야 한다.

PostgreSQL 연결
→ SQL 실행
→ DB 데이터 조회
→ Python 데이터 변환
→ Response Model 검증
→ JSON 응답

HTTP 200만으로 데이터 정확성을 보장할 수 없으므로
DB 결과와 API 응답을 직접 비교해야 한다.

## 12. 최종 검증

- [x] 패키지 설치 및 Import 확인
- [x] PostgreSQL 연결 확인
- [x] SQL 직접 조회
- [x] GET /members 구현
- [x] Swagger HTTP 200 확인
- [x] DB와 API 데이터 비교
- [x] SQL 오류 재현 및 복구
- [ ] Response Model 오류 로그 최종 확인
- [ ] 정상 코드 복구 후 HTTP 200 재확인
- [ ] Git 보안 검증

독립 실습 GET /courses는 진행하지 않음.
```
