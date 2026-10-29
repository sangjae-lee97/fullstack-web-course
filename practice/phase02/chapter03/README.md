# Chapter 03 — Request Body와 Pydantic

## 1. 학습 목표

FastAPI에서 POST 요청의 Request Body를 Pydantic Model로 정의하고 입력 데이터를 검증하는 방법을 학습한다.

- Request Body의 개념 이해
- Path / Query Parameter와 Request Body의 차이
- Pydantic BaseModel을 이용한 입력 Schema 정의
- POST Endpoint 구현
- 정상 요청 201 Created 검증
- 필수값 누락 및 타입 오류 422 검증
- Swagger UI를 이용한 API 테스트
- 임시 ID가 포함된 Response 구현

## 2. 개발 환경

- Python
- FastAPI
- Uvicorn
- Pydantic
- Swagger UI

실행 명령어:

```powershell
cd C:\dev\fullstack-web-course\practice\phase02\chapter03
python -m uvicorn main:app --reload
```

Swagger UI:

http://127.0.0.1:8000/docs

## 3. API Contract

### POST /members

**Request Body**

| 필드 | 타입 | 필수 여부 |
|---|---|---|
| name | string | Required |
| email | string | Required |
| age | integer | Required |

**Success**

- Status Code: 201 Created
- Response: 회원 데이터와 임시 ID

**Failure**

- 필수 필드 누락: 422
- 정수로 변환할 수 없는 age 입력: 422

## 4. Request Body란?

클라이언트가 서버에 데이터를 전달할 때 HTTP 요청의 Body에 포함하는 데이터다.

- Path Parameter: 특정 자원 식별
- Query Parameter: 검색 및 필터링 조건
- Request Body: 회원 등록 등 여러 필드의 데이터 전달

이번 실습에서는 JSON 형태의 Request Body를 사용했다.

## 5. Pydantic Model

```python
from pydantic import BaseModel

class MemberCreate(BaseModel):
    name: str
    email: str
    age: int
```

**주요 개념**

- `BaseModel`: 데이터 검증 기능을 제공하는 기본 클래스
- `MemberCreate`: 회원 등록 요청의 데이터 구조 정의
- `name: str`: 문자열 필드
- `email: str`: 문자열 필드
- `age: int`: 정수 필드

Pydantic은 기본적으로 타입 변환을 허용한다.

예를 들어 `"25"`는 정수 `25`로 변환될 수 있지만 `"abc"`는 정수로 변환할 수 없어 검증 오류가 발생한다.

`email: str`은 문자열 타입만 검사하며 실제 이메일 주소 형식까지 검사하는 것은 아니다.

## 6. POST Endpoint 구현

```python
@app.post("/members", status_code=201)
def create_member(member: MemberCreate):
    return {
        "id": 1,
        "name": member.name,
        "email": member.email,
        "age": member.age,
    }
```

**처리 흐름**

1. 클라이언트가 JSON Request Body 전송
2. FastAPI가 요청 데이터 수신
3. Pydantic이 필수 필드 및 타입 검증
4. 검증 성공 시 Endpoint 함수 실행
5. 서버가 임시 ID를 추가하여 201 응답 반환
6. 검증 실패 시 함수 실행 전에 422 반환

현재 `id: 1`은 학습용 고정값이며 실제 데이터베이스에 저장하지 않는다.

## 7. Swagger 검증 Evidence

### Test 1. 정상 요청

Request Body:

```json
{
  "name": "Hong Gil Dong",
  "email": "hong@example.com",
  "age": 30
}
```

Response Code: **201 Created**

최초 검증에서는 입력 JSON이 그대로 반환되는 것을 확인했다.

이후 임시 ID 추가 구현을 통해 다음과 같은 응답을 확인했다.

```json
{
  "id": 1,
  "name": "Hong Gil Dong",
  "email": "hong@example.com",
  "age": 30
}
```

결과: PASS

### Test 2. 필수값 누락

Request Body:

```json
{
  "name": "Hong Gil Dong",
  "age": 30
}
```

기대 Response Code: **422**

실제 확인한 오류:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": {
        "name": "Hong Gil Dong",
        "age": 30
      }
    }
  ]
}
```

결과: 필수 필드 누락 오류 내용 확인

### Test 3. 잘못된 타입

Request Body:

```json
{
  "name": "Hong Gil Dong",
  "email": "hong@example.com",
  "age": "not-a-number"
}
```

기대 Response Code: **422**

예상 오류 정보:

- type: int_parsing
- loc: ["body", "age"]
- msg: Input should be a valid integer...

결과: Swagger 테스트 실행 완료. 실제 오류 Response Body는 별도로 기록하지 않음.

### Test 4. 데이터 저장 여부

POST 요청 이후 `GET /members`를 실행하여 기존 회원 3명만 반환되는 것을 확인했다.

- POST 응답에는 임시 ID가 포함됨
- 기존 members 리스트는 변경되지 않음
- 데이터베이스 저장 기능은 구현하지 않음

결과: PASS

## 8. AI에게 질문한 내용

**Q1. Pydantic은 무엇인가?**

Python에서 데이터 구조와 타입을 정의하고 검증하는 라이브러리다.

**Q2. MemberCreate는 회원을 생성하는가?**

아니다. 회원 등록 요청에 필요한 데이터 구조를 정의한다.

**Q3. 검증 실패 시 Endpoint가 실행되는가?**

아니다. FastAPI가 함수 실행 전에 요청을 검증하고 422 오류를 반환한다.

**Q4. `"25"`는 정수 검증을 통과하는가?**

기본 Pydantic 설정에서는 정수 25로 변환되어 통과할 수 있다.

**Q5. POST 요청에서 201을 반환하면 DB에 저장되었는가?**

아니다. 상태 코드를 201로 선언했더라도 별도 저장 로직이 없다면 데이터가 저장되지 않는다.

## 9. 최종 검증 결과

| 검증 항목 | 결과 |
|---|---|
| 기존 GET API 유지 | PASS |
| Pydantic Model 정의 | PASS |
| POST /members 구현 | PASS |
| 정상 Request Body → 201 | PASS |
| 필수 필드 누락 오류 | PASS |
| 잘못된 타입 테스트 실행 | 완료 |
| 임시 ID 응답 | PASS |
| 기존 회원 리스트 유지 | PASS |

## 10. 핵심 학습 내용

이번 장에서는 입력 데이터의 구조를 정의하는 작업과 실제 데이터를 저장하는 작업이 서로 다르다는 점을 학습했다.

- Pydantic은 데이터 검증을 담당한다.
- FastAPI는 HTTP 요청을 처리하고 Pydantic 검증을 연결한다.
- Validation은 Endpoint 함수 실행 전에 수행된다.
- 잘못된 입력에 대해서는 422 오류가 발생한다.
- 201 응답만으로 실제 데이터 저장을 보장하지는 않는다.

## 11. 학습 범위 및 마무리

Chapter 03의 기본 STEP 01~09를 완료했다.

독립 과제인 `POST /courses`는 수행하지 않았다.

다음 Chapter 04에서는 Response Model과 Status Code를 학습한다.