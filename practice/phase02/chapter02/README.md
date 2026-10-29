# Phase 02 Chapter 02 학습 기록

## 1. 학습 목표

FastAPI에서 Path Parameter와 Query Parameter의 차이를 이해하고, 회원 상세 조회 및 조건별 검색 API를 구현한다.

- Path Parameter를 이용한 특정 회원 조회
- Query Parameter를 이용한 이름 검색 및 나이 필터링
- HTTP 200 / 404 / 422 상태 코드 이해
- Swagger UI를 통한 API 요청 및 응답 검증
- API Contract 기반의 엔드포인트 설계

## 2. 개발 환경

- Language: Python
- Framework: FastAPI
- ASGI Server: Uvicorn
- API Testing: Swagger UI
- Database: 사용하지 않음 (Python 메모리 리스트 사용)

### 실행 방법

```powershell
cd C:\dev\fullstack-web-course\practice\phase02\chapter02
python -m uvicorn main:app --reload
```

Swagger UI: http://127.0.0.1:8000/docs

## 3. 구현한 API

| Method | URL | Parameter | 기능 |
|---|---|---|---|
| GET | `/members` | 없음 | 전체 회원 조회 |
| GET | `/members/{member_id}` | Path | ID로 회원 조회 |
| GET | `/members/search/?name=kim` | Query | 이름 검색 |
| GET | `/members/filter/?min_age=20` | Query | 최소 나이 필터 |
| GET | `/members/filter/?name=k&min_age=20` | Query | 이름과 나이 동시 필터 |

## 4. Path Parameter를 사용한 API

특정 회원을 ID로 식별하기 위해 Path Parameter를 사용했다.

```python
@app.get("/members/{member_id}")
def get_member(member_id: int):
    for member in members:
        if member["id"] == member_id:
            return member

    raise HTTPException(
        status_code=404,
        detail="Member not found"
    )
```

- `{member_id}`는 URL에서 추출할 변수다.
- `member_id: int`를 통해 FastAPI가 입력값을 정수로 검증한다.
- 회원이 존재하면 회원 객체를 반환한다.
- 회원이 존재하지 않으면 직접 정의한 404 오류를 반환한다.

## 5. Query Parameter를 사용한 API

검색과 필터 조건에는 Query Parameter를 사용했다.

일반적인 구조:

```text
/API경로?key1=value1&key2=value2
```

### 이름 검색

```text
GET /members/search/?name=kim
```

대소문자를 구분하지 않고 이름에 검색어가 포함된 회원을 반환한다.

### 이름과 나이 동시 필터

```text
GET /members/filter/?name=k&min_age=20
```

두 조건을 순차적으로 적용하여 모두 만족하는 회원만 반환한다. 이는 AND 조건에 해당한다.

`name: str | None = None`처럼 선택적 파라미터를 선언하면 해당 조건을 생략할 수 있다.

## 6. Path와 Query를 구분한 기준

| 구분 | Path Parameter | Query Parameter |
|---|---|---|
| 목적 | 특정 자원 식별 | 검색 및 필터 |
| 위치 | URL 경로 | `?` 뒤 |
| 예시 | `/members/3` | `/members?name=Kim` |
| 주된 용도 | 상세 조회 | 목록 조건 검색 |

특정 자원을 가리키는 값은 Path로, 검색 조건은 Query로 설계한다.

또한 `/members`는 데이터베이스 테이블명이 아니라 API 경로다.

## 7. Swagger에서 확인한 200 / 404 / 422

| 요청 | 기대 상태 | 결과 |
|---|---|---|
| `/members/1` | 200 | Kim 회원 반환 |
| `/members/99` | 404 | Member not found |
| `/members/abc` | 422 | 정수 변환 실패 |
| `/members/search/?name=kim` | 200 | Kim 회원 배열 |
| `/members/search/?name=abc` | 200 | 빈 배열 |
| `/members/filter/?name=e&min_age=20` | 200 | 빈 배열 |

### 404와 422의 차이

**404 Not Found**

- 정수 타입 검증은 통과한다.
- 함수가 실행되지만 회원을 찾지 못한다.
- 직접 작성한 `raise HTTPException`으로 발생한다.

**422 Validation Error**

- 정수로 변환할 수 없는 값을 전달한다.
- FastAPI가 함수 실행 전에 입력을 검증한다.
- 직접 `raise`를 작성하지 않아도 자동으로 오류 응답을 반환한다.

### Swagger 검증 중 발견한 사항

Swagger UI의 정수 입력 필드에 `abc`를 입력하면 브라우저 측 검증에서 요청이 차단되었다.

따라서 브라우저 주소창에서 다음 URL을 직접 요청했다.

```text
http://127.0.0.1:8000/members/abc
```

실제 FastAPI의 `int_parsing` 오류 JSON을 확인했다.

이를 통해 Swagger UI의 입력 검증과 FastAPI 서버의 입력 검증이 별개임을 이해했다.

## 8. AI에게 질문한 내용

### Q1. Query Parameter를 일반화할 수 있는가?

다음 구조로 일반화할 수 있다.

```text
/API경로?키=값&키=값
```

단, 서버가 해당 파라미터를 정의하고 처리해야 한다.

### Q2. 직접 raise를 작성하지 않았는데 422 오류가 발생하는 이유는?

FastAPI가 Python 타입 힌트를 읽고 입력값을 자동 검증하기 때문이다.

### Q3. Swagger에서는 왜 422 오류를 직접 확인할 수 없었는가?

Swagger UI에서 정수 입력 필드의 형식을 먼저 검사하여 요청 전송을 막았기 때문이다.

## 9. AI 답변 중 직접 검증한 부분

- 회원 목록 조회 API 동작
- Path Parameter를 이용한 특정 회원 조회
- 존재하지 않는 회원의 404 응답
- 브라우저 직접 요청을 통한 `int_parsing` 오류 응답
- 이름 검색의 대소문자 무관 처리
- 검색 결과가 없을 때 빈 배열 반환
- 이름과 최소 나이 필터의 AND 조건
- Query Parameter의 다중 조건 적용

## 10. 학습 정리

이번 실습을 통해 API를 설계할 때 URL에 어떤 값을 포함할지 먼저 결정해야 한다는 점을 배웠다.

특히 FastAPI는 URL에서 파라미터를 추출하고 타입을 검증한 다음 Python 함수를 실행한다.

```text
Request URL
    ↓
Route Matching
    ↓
Parameter Extraction
    ↓
Type Validation
    ↓
Function Execution
    ↓
JSON Response
```

**핵심 결론**

1. Path Parameter는 특정 자원을 식별한다.
2. Query Parameter는 검색·필터 조건을 전달한다.
3. 404는 자원이 없을 때, 422는 입력값 검증에 실패했을 때 발생할 수 있다.
4. HTTP 상태 코드뿐 아니라 Response Body까지 확인해야 한다.
5. API 구현 전에 Method, URL, Parameter, Response를 정의하는 것이 중요하다.

## 11. 다음 학습

**Phase 02 Chapter 03 — Request Body와 Pydantic**

POST 요청으로 JSON 데이터를 전달하고 Pydantic 모델로 입력값을 검증하는 방법을 학습할 예정이다.