
# Chapter 14 — CORS · Frontend 연동 · 환경 분리 · 보안 기초

## 1. 학습 목표

FastAPI 백엔드와 JavaScript 프론트엔드를 연결하고,
CORS 정책, 환경 설정 분리, 보안 및 HTTP 요청 검증을 학습한다.

주요 학습 내용:
- Origin과 CORS 개념 이해
- CORSMiddleware 설정
- JavaScript fetch()를 통한 API 호출
- GET /members 및 POST /members 연동
- Browser Network를 통한 HTTP 요청 검증
- Frontend API 주소 설정 분리
- .env와 Git 보안
- pytest를 통한 CORS 자동 테스트

## 2. 프로젝트 구조

phase02/
├── chapter14/
│   ├── __init__.py
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── frontend/
│   │   ├── index.html
│   │   ├── config.js
│   │   └── app.js
│   ├── tests/
│   │   └── test_cors.py
│   └── README.md
├── common/
│   └── db.py
└── .env

기존 Chapter 12와 Chapter 13은 수정하지 않고,
Chapter 14에서 필요한 기능을 구현했다.

공통 DB 연결 설정은 common/db.py를 재사용한다.

참고: Chapter 14의 일부 기능은 Chapter 12의
Model, Schema, Repository, Service를 import하여 사용한다.

## 3. 전체 데이터 흐름

Browser
→ JavaScript fetch()
→ CORS 검사
→ FastAPI
→ SQLAlchemy ORM
→ PostgreSQL
→ JSON Response
→ Browser UI

브라우저의 CORS 검사는 서버에 요청을 보내기 전이나
응답을 JavaScript에 제공하기 전에 적용될 수 있다.

## 4. Origin과 CORS

Origin은 다음 세 가지로 구분한다.

scheme + host + port

Frontend:
http://localhost:5500

Backend:
http://localhost:8000

포트가 다르므로 서로 다른 Origin이다.

FastAPI에 CORSMiddleware를 등록하고 다음 Origin을 허용했다.

- http://localhost:5500
- http://127.0.0.1:5500

### CORS 오류 재현

Frontend를 localhost:5501에서 실행했다.

허용되지 않은 Origin이므로 브라우저에서 CORS 오류 발생.

확인한 오류:
- Access-Control-Allow-Origin 헤더 없음
- net::ERR_FAILED 200 (OK)
- TypeError: Failed to fetch

학습 내용:

HTTP 200은 서버의 요청 처리 성공을 나타내지만,
브라우저에서 JavaScript가 응답에 접근할 수 있다는
의미는 아니다.

## 5. Frontend와 FastAPI 연결

### GET /members

JavaScript fetch()로 전체 회원 목록을 조회한다.

검증 결과:
- HTTP 200 OK
- PostgreSQL 회원 조회 성공
- JSON 배열 반환
- HTML 테이블 출력 성공

### POST /members

회원 등록 Form에서 입력한 정보를 JSON으로 변환해
FastAPI로 전송한다.

검증 결과:
- 정상 등록: HTTP 201 Created
- 중복 이메일: HTTP 409 Conflict
- 등록 후 GET /members 재호출 성공

### PostgreSQL 저장 검증

다음 회원의 실제 DB 저장을 확인했다.

member_id: 20
name: Chapter14 Test 2
email: chapter14-post-test02-20261106@example.com
age: 30

API 응답과 실제 DB 저장 상태를 독립적으로 검증했다.

## 6. 환경 설정 분리

기존에는 API 주소를 app.js 내부에 직접 선언했다.

변경 후 config.js에서 API 주소를 관리한다.

config.js:
window.APP_CONFIG.API_BASE_URL

app.js:
window.APP_CONFIG.API_BASE_URL을 참조한다.

index.html에서 config.js를 먼저 로드하고
app.js를 나중에 로드하도록 구성했다.

현재는 개발 환경의 API 주소를 설정 파일로
분리하는 방식이며, 자동 환경 감지는 구현하지 않았다.

## 7. 보안 검증

Backend DB 접속 정보는 phase02/.env에서 관리한다.

.env에 포함되는 DB 계정과 비밀번호는
Frontend JavaScript에 노출하지 않는다.

Git 검증 명령:

git check-ignore -v -- .env
git ls-files --error-unmatch -- .env

검증 결과:
- .gitignore 적용 확인
- .env가 Git에서 추적되지 않음

주의:
Frontend의 config.js는 브라우저에 공개되므로
DB_PASSWORD, 비공개 API Key 등 Secret을 저장하면 안 된다.

## 8. pytest CORS 테스트

테스트 파일:
chapter14/tests/test_cors.py

실행 명령:

python -m pytest chapter14/tests/test_cors.py -v

테스트 항목:
1. 허용 Origin GET 요청
2. 비허용 Origin GET 요청
3. 허용 Origin Preflight 요청
4. 비허용 Origin Preflight 요청

검증 결과:

4 passed, 1 warning

Warning은 TestClient 관련 DeprecationWarning이며,
현재 테스트 결과에는 영향을 주지 않았다.

## 9. 실행 방법

작업 위치:
C:\dev\fullstack-web-course\practice\phase02

### FastAPI 서버 실행

.\.venv\Scripts\python.exe -m uvicorn chapter14.app.main:app --reload

Swagger:
http://localhost:8000/docs

### Frontend 서버 실행

cd chapter14/frontend

C:\dev\fullstack-web-course\practice\phase02\.venv\Scripts\python.exe -m http.server 5500

Frontend:
http://localhost:5500

실행 전 PostgreSQL 및 기존 Chapter 12 의존성,
phase02/.env 설정이 준비되어 있어야 한다.

## 10. 최종 검증 결과

[PASS] FastAPI 서버 실행
[PASS] Swagger API 확인
[PASS] GET /members HTTP 200
[PASS] POST /members HTTP 201
[PASS] 중복 이메일 HTTP 409 확인
[PASS] PostgreSQL INSERT 데이터 검증
[PASS] Frontend HTML 테이블 출력
[PASS] CORS 허용 Origin 검증
[PASS] CORS 차단 오류 재현
[PASS] Frontend API 주소 설정 분리
[PASS] .env Git 추적 제외 확인
[PASS] pytest 4개 테스트 통과
[PASS] Network 리소스 로딩 검증

## 11. 핵심 학습 내용

1. CORS는 브라우저의 교차 출처 응답 접근을 제어한다.
2. HTTP 성공과 브라우저의 응답 접근 성공은 다르다.
3. fetch()와 async/await를 통해 비동기 API 요청을 처리한다.
4. POST 성공 이후 GET 재조회로 최신 화면을 반영한다.
5. API 응답과 PostgreSQL 데이터는 독립적으로 검증한다.
6. API 주소 등의 설정은 애플리케이션 로직과 분리한다.
7. Frontend에 전달되는 값은 사용자가 볼 수 있다고 가정한다.
8. pytest를 통해 CORS 설정의 정상 및 오류 상황을 자동 검증한다.
9. Browser Network, FastAPI 로그, PostgreSQL 데이터를 함께 확인한다.

## 12. 결론

Chapter 14에서는 기존 FastAPI와 PostgreSQL 기반
회원 관리 API를 실제 브라우저와 연결했다.

CORS 오류를 직접 재현하고 수정된 허용 Origin에서
정상적으로 요청이 처리되는 것을 검증했다.

또한 환경 설정 분리, Secret 관리, pytest 자동 테스트를
수행하여 프론트엔드와 백엔드 연동의 기본 흐름을 학습했다.
