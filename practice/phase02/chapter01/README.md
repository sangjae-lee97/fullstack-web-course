# Phase 02 Chapter 01 — 첫 FastAPI API Server 구현

## 1. 학습 목표

FastAPI와 Uvicorn을 이용해 첫 Backend API Server를 구현하고 HTTP Request/Response 흐름을 이해한다.

- Frontend와 Backend의 역할 구분
- Web Server와 API Server의 차이 이해
- API Contract 정의
- FastAPI Route 구현
- Uvicorn 서버 실행
- Swagger UI를 활용한 API 검증
- 실제 HTTP 응답과 API Contract 비교

## 2. 개발 환경

| 항목 | 내용 |
|---|---|
| 언어 | Python |
| Framework | FastAPI 0.162.0 |
| ASGI Server | Uvicorn 0.54.0 |
| 개발 도구 | VSCode, PowerShell |
| 테스트 도구 | Swagger UI, Chrome DevTools |
| 가상환경 | `phase02/.venv` |
| 서버 주소 | `http://127.0.0.1:8000` |

### 실행 명령어

```powershell
cd C:\dev\fullstack-web-course\practice\phase02\chapter01
python -m uvicorn main:app --reload
```

`--reload` 옵션으로 코드 변경 시 개발 서버가 자동으로 재시작된다.

## 3. 내가 정의한 API Contract

### GET /

서버의 기본 응답을 확인한다.

| 항목 | 내용 |
|---|---|
| Method | GET |
| Path | `/` |
| Request Body | 없음 |
| Success Status | 200 OK |
| Response | JSON 객체 |

예상 응답:

```json
{
  "message": "Hello FastAPI"
}
```

### GET /members

회원 목록을 조회한다.

| 항목 | 내용 |
|---|---|
| Method | GET |
| Path | `/members` |
| Request Body | 없음 |
| Success Status | 200 OK |
| Response | 회원 객체의 JSON 배열 |
| Database | 사용하지 않음 |

예상 응답:

```json
[
  {
    "id": 1,
    "name": "Kim",
    "email": "kim@example.com"
  },
  {
    "id": 2,
    "name": "Lee",
    "email": "lee@example.com"
  }
]
```

## 4. Uvicorn의 역할

Uvicorn은 ASGI Server로, FastAPI 애플리케이션을 HTTP 서버로 실행한다.

주요 역할:

- 클라이언트의 HTTP 요청 수신
- ASGI 인터페이스를 통해 FastAPI에 요청 전달
- FastAPI가 생성한 응답을 클라이언트에 전달

FastAPI와 Uvicorn은 서로 다른 역할을 수행한다.

**Uvicorn은 서버를 실행하고, FastAPI는 요청을 처리할 로직을 정의한다.**

## 5. FastAPI의 역할

FastAPI는 Python 기반 Backend API Framework이다.

주요 역할:

- HTTP Method와 Path에 따른 Route 정의
- 요청 데이터를 Python 함수에 전달
- 비즈니스 로직 실행
- 반환 데이터를 JSON 응답으로 변환
- OpenAPI 문서 자동 생성

### 구현 코드

```python
from fastapi import FastAPI

app = FastAPI()

members = [
    {"id": 1, "name": "Kim", "email": "kim@example.com"},
    {"id": 2, "name": "Lee", "email": "lee@example.com"},
]

@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

@app.get("/members")
def read_members():
    return members
```

`@app.get("/members")`는 GET 방식으로 `/members` 요청이 들어왔을 때 `read_members()` 함수를 실행하도록 연결하는 Route이다.

## 6. Swagger에서 확인한 Evidence

Swagger UI: `http://127.0.0.1:8000/docs`

### 서버 실행 검증

- [x] Uvicorn 실행 성공
- [x] `Application startup complete` 로그 확인
- [x] 브라우저에서 기본 JSON 응답 확인

### GET / 검증

- [x] Method: GET
- [x] Path: `/`
- [x] Status Code: 200
- [x] Response Body: `{"message":"Hello FastAPI"}`

### GET /members 검증

- [x] Swagger UI에서 Endpoint 확인
- [x] Method: GET
- [x] Path: `/members`
- [x] Status Code: 200
- [x] 회원 2명의 JSON 배열 반환
- [x] 각 객체에 `id`, `name`, `email` 포함
- [x] 브라우저 직접 호출 확인
- [ ] DevTools Network 최종 검증

**검증 결과:** Swagger에서 실제 반환된 데이터가 API Contract와 일치함을 확인했다.

## 7. 발생한 오류와 해결 과정

### pip 명령어 오타

잘못 입력한 명령어:

```powershell
python -m ppip show uvicorn
```

오류 메시지:

```text
No module named ppip
```

원인: `pip`를 `ppip`로 잘못 입력했다.

해결:

```powershell
python -m pip show uvicorn
```

수정 후 Uvicorn 0.54.0 설치 상태를 정상적으로 확인했다.

## 8. AI에게 질문한 내용

### Q1. GET / 요청 시 데이터베이스에 자동 연결되는가?

아니다. 현재 코드에는 데이터베이스 연결 로직이 없으며, `read_root()` 함수가 실행되어 JSON 응답을 반환한다.

### Q2. Swagger UI와 브라우저 주소창의 API 호출은 어떻게 다른가?

둘 다 HTTP GET 요청을 실제로 전송하며 Uvicorn을 거쳐 동일한 FastAPI Route를 호출한다.

차이점은 요청을 실행하고 결과를 확인하는 인터페이스이다.

### Q3. 서버 실행 성공과 API 검증 성공은 같은 의미인가?

아니다.

서버가 정상적으로 실행되더라도 API가 요구사항에 맞는 데이터를 반환한다는 보장은 없다.

따라서 Method, Path, Status Code, Response Body를 각각 검증해야 한다.

## 9. AI 답변 중 내가 직접 검증한 부분

| AI 설명 | 직접 검증 | 결과 |
|---|---|---|
| Uvicorn으로 FastAPI 서버 실행 가능 | 터미널 실행 | 성공 |
| GET / 호출 시 JSON 반환 | 브라우저 및 Swagger | 성공 |
| Swagger UI에서 API 실행 가능 | Execute 클릭 | 성공 |
| GET /members에서 회원 목록 반환 | Swagger 응답 확인 | 성공 |
| HTTP 200 반환 | Server Response 확인 | 성공 |
| JSON 배열 구조 유지 | Response Body 확인 | 성공 |

AI가 작성한 코드나 설명을 그대로 신뢰하지 않고, 실제 실행 결과를 통해 검증하는 과정을 수행했다.

## 10. 핵심 학습 정리

전체 요청·응답 흐름:

```text
Browser
   ↓ HTTP Request
Uvicorn
   ↓ ASGI
FastAPI
   ↓ Route
Python Function
   ↓ Return
FastAPI Response
   ↓
Uvicorn
   ↓ HTTP Response
Browser
```

이번 실습을 통해 다음 개념을 이해했다.

1. Frontend는 API를 호출하고 Backend는 요청을 처리한다.
2. Uvicorn은 HTTP 서버 역할을 담당한다.
3. FastAPI는 Route와 처리 로직을 정의한다.
4. API Contract는 구현 전에 요청과 응답의 약속을 정의하는 것이다.
5. Swagger UI는 API 문서이자 테스트 도구이다.
6. 코드 실행 성공과 요구사항 충족은 별도로 검증해야 한다.

## 11. 남은 작업

- [ ] Chrome DevTools Network 검증 완료
- [ ] 독립 과제 `GET /courses` 구현
- [ ] `/courses` Swagger 검증
- [ ] Git Commit 및 Push

## 12. 다음 학습

Chapter 02 — Path Parameter와 Query Parameter

- `/members/{member_id}`를 이용한 특정 회원 조회
- Query Parameter를 이용한 회원 검색
- HTTP Request의 입력값이 FastAPI 함수에 전달되는 과정 학습
