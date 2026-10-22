
# Phase 01 - Member Management Frontend

## 1. 프로젝트 목표

HTML, CSS, JavaScript를 사용하여 회원 관리
프론트엔드 프로젝트를 구현한다.

GET/POST 요청과 DOM 렌더링을 연결하고,
Network와 Console에서 실제 실행 결과를 검증한다.

## 2. 프로젝트 구조

practice/phase01/chapter15/

- index.html : HTML 화면 구조
- style.css : 디자인 및 반응형 레이아웃
- app.js : API 통신, DOM, 이벤트 처리
- README.md : 실행 방법과 검증 기록

## 3. 전체 시스템 구조

Browser
→ Live Server
→ HTML / CSS / JavaScript

JavaScript
→ fetch()
→ JSONPlaceholder API Server
→ JSON Response
→ JavaScript Data
→ DOM Rendering

### 서버의 역할

- Browser: 화면을 표시하고 JavaScript를 실행한다.
- Live Server: HTML, CSS, JS 파일을 제공한다.
- API Server: HTTP 요청을 처리하고 JSON을 반환한다.

## 4. 구현 기능

- GET 요청으로 회원 목록 조회
- 회원 목록 DOM 렌더링
- 회원 클릭 시 상세 정보 표시
- Form submit 이벤트 처리
- POST 요청으로 회원 등록 테스트
- Loading 상태 처리
- Empty 상태 처리
- Error 상태 처리
- 반응형 레이아웃 구현

## 5. GET 데이터 흐름

1. 페이지가 실행된다.
2. loadMembers()가 호출된다.
3. renderLoading()으로 Loading 상태를 표시한다.
4. fetch(API_URL)로 GET 요청을 보낸다.
5. response.ok로 HTTP 상태를 확인한다.
6. response.json()으로 JSON 데이터를 변환한다.
7. 변환된 데이터를 members 배열에 저장한다.
8. renderMembers()로 회원 목록을 표시한다.
9. 회원을 클릭하면 renderMemberDetail()을 실행한다.

API:
https://jsonplaceholder.typicode.com/users

## 6. POST 데이터 흐름

1. 사용자가 이름과 이메일을 입력한다.
2. 등록 버튼을 누르면 submit 이벤트가 발생한다.
3. event.preventDefault()로 기본 제출 동작을 막는다.
4. FormData로 입력값을 가져온다.
5. JavaScript 회원 객체를 생성한다.
6. JSON.stringify()로 JSON 문자열을 만든다.
7. fetch()로 POST 요청을 보낸다.
8. 서버의 응답을 response.json()으로 읽는다.
9. 성공 또는 실패 메시지를 화면에 표시한다.

### 요청 예시

POST /users

Content-Type: application/json

{
  "name": "홍길동",
  "email": "hong@example.com"
}

## 7. UI 상태 처리

### Loading

API 응답을 기다리는 동안
"불러오는 중..." 메시지를 표시한다.

### Empty

members 배열이 비어 있다면
"등록된 회원이 없습니다." 메시지를 표시한다.

### Error

네트워크 요청에 실패하거나
HTTP 오류가 발생하면 catch에서 처리한다.

"회원 정보를 불러오지 못했습니다."
메시지를 표시한다.

## 8. Network 검증 결과

### GET

- Request Method: GET
- Status Code: 200 OK
- Response: 회원 객체 배열
- 회원 목록: 10명
- 결과: PASS

### POST

- Request Method: POST
- Status Code: 201 Created
- Payload: name, email
- Response: 생성 요청에 대한 JSON 응답
- 결과: PASS

## 9. 테스트 API와 실제 DB의 차이

JSONPlaceholder는 테스트용 API이다.

POST 요청이 성공하더라도 실제 데이터베이스에
회원 정보가 영구 저장되는 것은 아니다.

따라서 POST 요청의 성공과
데이터의 영속 저장은 구분해야 한다.

실제 DB 저장 기능은 추후 Backend와
PostgreSQL을 연결하여 구현할 수 있다.

## 10. 반응형 화면

CSS Grid를 사용하여 회원 목록과 상세 영역을 배치했다.

- 700px 초과: 2열
- 700px 이하: 1열

Chrome DevTools에서 모바일 화면을 검증했다.

결과: PASS

## 11. 오류 테스트 및 해결

### Empty 상태

Console에서 members 배열을 비우고
renderMembers()를 호출하여 확인했다.

테스트 후 새로고침으로 복구했다.

### Error 상태

API 요청을 의도적으로 차단하여
Error 메시지가 나타나는지 확인했다.

차단 해제 후 회원 목록을 정상 복구했다.

### Loading 상태

Network 속도를 느리게 설정하여
Loading 메시지를 확인했다.

응답 완료 후 회원 목록으로 전환됨을 확인했다.

## 12. 최종 검증 체크리스트

- [x] Live Server 정상 실행
- [x] GET 200 OK 확인
- [x] 회원 목록 10명 표시
- [x] 회원 상세 클릭 동작
- [x] POST 201 Created 확인
- [x] POST Payload 확인
- [x] POST Response 확인
- [x] Loading 상태 확인
- [x] Empty 상태 확인
- [x] Error 상태 확인
- [x] 반응형 화면 확인
- [x] 예상하지 못한 Console 오류 없음

최종 검증: 12/12 PASS

## 13. 학습한 핵심 개념

- HTML: 화면 구조
- CSS: 디자인과 반응형
- DOM: JavaScript로 화면 조작
- Event: 사용자 동작 처리
- GET: 서버에서 데이터 조회
- POST: 서버로 데이터 전송
- JSON.stringify(): 객체를 JSON 문자열로 변환
- response.json(): JSON 응답을 JavaScript 데이터로 변환
- async/await: 비동기 작업 처리
- try/catch: 오류 처리
- Network: 실제 HTTP 요청 검증

## 14. 실행 방법

1. VS Code에서 chapter15 폴더를 연다.
2. Live Server를 실행한다.
3. index.html을 브라우저에서 확인한다.
4. 회원 목록과 상세 기능을 테스트한다.
5. 회원 등록 POST 요청을 테스트한다.
6. Chrome DevTools로 검증한다.

## 15. 최종 학습 정리

이번 프로젝트에서 프론트엔드의
전체 데이터 흐름을 직접 구현했다.

사용자 입력
→ Event
→ JavaScript
→ HTTP Request
→ API Server
→ JSON Response
→ DOM Rendering

AI가 생성한 코드를 그대로 사용하는 것이 아니라
각 함수의 역할과 데이터 흐름을 이해하고
실제 실행 결과로 검증하는 과정을 학습했다.
