# Chapter 04. Response Model과 Status Code

## 1. 학습 목표

FastAPI에서 Request Model과 Response Model의 차이를 이해하고,
API의 입력 및 출력 계약을 정의한다.

- Request Model과 Response Model 구분
- response_model을 이용한 출력 검증 및 직렬화
- HTTP Status Code의 의미 이해
- HTTPException을 이용한 오류 처리
- Swagger UI를 활용한 API Contract 검증

---

## 2. 실습 환경

- Python
- FastAPI
- Pydantic
- Uvicorn
- Swagger UI
- 임시 데이터 저장소: Python List
- Database: 사용하지 않음

실습 파일:
- main.py
- README.md

서버 실행:

```powershell
python -m uvicorn main:app --reload
```

Swagger UI:
http://127.0.0.1:8000/docs

---

## 3. Request Model과 Response Model의 차이

### MemberCreate

클라이언트가 서버에 보내는 입력 데이터 모델이다.

필드:
- name: str
- email: str
- age: int

### MemberResponse

서버가 클라이언트에 반환하는 출력 데이터 모델이다.

필드:
- id: int
- name: str
- email: str
- age: int

### 차이점

MemberCreate에는 id가 없지만 MemberResponse에는 id가 있다.

id는 서버에서 생성하는 값이므로 클라이언트가 직접 전달할
필요가 없다.

Request Model은 입력 계약을 정의하고,
Response Model은 출력 계약을 정의한다.

---

## 4. response_model의 역할

response_model은 Endpoint가 반환하는 데이터를
지정한 Pydantic 모델에 맞게 검증하고 직렬화한다.

목록 조회:

```python
response_model=list[MemberResponse]
```

상세 조회:

```python
response_model=MemberResponse
```

목록 조회는 여러 회원을 리스트로 반환하고,
상세 조회는 단일 회원 객체를 반환한다.

또한 Response Model에 정의되지 않은 불필요한 필드는
기본적으로 응답에서 제외된다.

따라서 response_model은 Swagger 문서화뿐 아니라
실제 출력 데이터의 구조를 통제하는 역할을 한다.

---

## 5. HTTP Status Code

| Code | 의미 | 실습 사례 |
|---|---|---|
| 200 | OK | 회원 상세 조회 성공 |
| 201 | Created | 회원 생성 성공 |
| 404 | Not Found | 존재하지 않는 회원 조회 |
| 422 | Validation Error | 필수 입력값 누락 |

POST 요청에서 status_code를 별도로 지정하지 않으면
FastAPI는 기본적으로 200을 반환한다.

회원 생성 API의 계약에 따라 201을 명시적으로 지정했다.

```python
status_code=status.HTTP_201_CREATED
```

---

## 6. API Contract

| Method | Endpoint | 성공 | 오류 | Response |
|---|---|---|---|---|
| GET | /members | 200 | - | list[MemberResponse] |
| GET | /members/{member_id} | 200 | 404, 422 | MemberResponse |
| POST | /members | 201 | 422 | MemberResponse |

---

## 7. Swagger Evidence 기록

### STEP 07. POST 회원 생성

요청:

POST /members

Request Body:

```json
{
  "name": "Park",
  "email": "park@example.com",
  "age": 28
}
```

검증 결과:
- Status Code: 201 Created
- Response Body에 생성된 id 포함
- name, email, age 일치
- MemberResponse 구조 준수

결론:
회원 생성 성공 시 출력 데이터와 상태 코드가
API Contract를 준수함을 확인했다.

### STEP 08. GET 회원 상세 조회

요청:

GET /members/1

검증 결과:
- Status Code: 200 OK
- id: 1
- name: Kim
- email: kim@example.com
- age: 25
- 단일 MemberResponse 객체 반환

결론:
회원 상세 조회의 출력 계약을 확인했다.

### STEP 09. 404 오류 검증

요청:

GET /members/999

Response:

```json
{
  "detail": "Member not found"
}
```

검증 결과:
- Status Code: 404 Not Found
- HTTPException에 정의한 오류 메시지 확인

결론:
존재하지 않는 회원 요청에 대해 의도한
오류 응답이 반환됨을 확인했다.

### STEP 10. 422 입력 검증 오류

요청:

POST /members

Request Body:

```json
{
  "name": "Park",
  "email": "park@example.com"
}
```

검증 결과:
- Status Code: 422
- 오류 유형: missing
- 오류 위치: body → age
- 오류 메시지: Field required

결론:
필수 필드가 누락되면 Pydantic 입력 검증에 실패하고,
Endpoint 함수가 실행되지 않음을 이해했다.

---

## 8. Swagger Response Schema 확인

Swagger UI의 Schemas 영역에서 다음 모델을 확인했다.

### MemberCreate
- name
- email
- age

### MemberResponse
- id
- name
- email
- age

POST /members의 성공 응답 상태 코드가
201로 정의되어 있음을 확인했다.

---

## 9. AI에게 요청한 리뷰 내용

AI와 함께 다음 항목을 검토했다.

1. Request Model과 Response Model의 차이
2. 목록과 상세 조회의 response_model 차이
3. 200 OK와 201 Created의 차이
4. raise HTTPException과 return의 차이
5. Request Validation과 Response Validation의 차이
6. API Contract를 검증해야 하는 이유

---

## 10. AI 답변 중 직접 검증한 부분

Swagger UI를 통해 다음 내용을 직접 확인했다.

- POST 요청의 201 Created
- 응답 데이터의 MemberResponse 구조
- GET 상세 조회의 200 OK
- 존재하지 않는 회원의 404 Not Found
- 필수 필드 누락에 따른 422 Validation Error
- Swagger의 MemberCreate / MemberResponse Schema

AI의 설명을 단순히 수용하는 것이 아니라
실제 HTTP Status Code와 Response Body를 비교했다.

---

## 11. 핵심 학습 정리

Request Contract:
클라이언트가 서버에 보내는 데이터에 대한 약속

Response Contract:
서버가 클라이언트에 반환하는 데이터에 대한 약속

response_model:
출력 데이터 구조를 검증하고 직렬화하는 기능

status_code:
요청 처리 결과를 HTTP 상태 코드로 표현하는 기능

HTTPException:
의도한 HTTP 오류 응답을 발생시키는 기능

API Contract는 단순히 JSON 구조만 의미하지 않는다.

Method + URL + Request + Validation
+ Status Code + Response

위 요소들을 함께 검증해야 한다.

---

## 12. 최종 결론

Chapter 04에서는 FastAPI의 입력 및 출력 계약과
HTTP 상태 코드를 학습했다.

회원 목록 조회, 상세 조회, 생성 API를 구현했고,
Swagger에서 정상 응답과 오류 응답을 검증했다.

이를 통해 API 구현의 완료 기준은
코드 실행 여부가 아니라 API Contract 준수 여부라는
점을 이해했다.

독립 실습(Course API)은 진행하지 않았다.