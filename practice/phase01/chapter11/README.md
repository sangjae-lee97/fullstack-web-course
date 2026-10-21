
# Chapter 11 - Event와 Form

## 1. 프로젝트 소개

JavaScript의 Event와 Form을 이해하기 위해
강좌 등록 및 실시간 검색 기능을 구현한 실습 프로젝트다.

HTML, CSS, JavaScript를 사용했으며,
서버나 데이터베이스는 연결하지 않았다.

## 2. 프로젝트 구조

practice/phase01/chapter11/
- index.html : 화면 구조
- style.css : 화면 디자인
- script.js : 강좌 등록 및 검색 기능
- README.md : 학습 내용과 검증 결과

## 3. 구현한 기능

1. 초기 강좌 3개를 화면에 출력한다.
2. Form에서 강좌명과 강사명을 입력한다.
3. submit 이벤트로 새로운 강좌를 등록한다.
4. 입력값을 JavaScript Object로 만든다.
5. courses 배열에 강좌를 추가한다.
6. DOM을 다시 렌더링한다.
7. input 이벤트로 강좌명을 실시간 검색한다.
8. 검색 결과가 없으면 안내 메시지를 표시한다.

## 4. Event란?

Event는 브라우저에서 발생하는 사건이다.

대표적인 Event는 다음과 같다.

- click : 요소를 클릭할 때
- input : 입력값이 변경될 때
- submit : Form을 제출할 때

addEventListener()를 사용하면
특정 이벤트가 발생했을 때 실행할 함수를 연결할 수 있다.

## 5. submit Event란?

submit은 Form에서 발생하는 이벤트다.

사용자가 강좌 등록 버튼을 누르면
브라우저가 Form 제출을 시도한다.

유효성 검사를 통과하여 submit 이벤트가 발생하면
등록된 JavaScript Handler가 실행된다.

submit 이벤트 자체가 HTTP POST 요청을 의미하지는 않는다.

## 6. HTTP POST란?

POST는 서버에 HTTP 요청을 보낼 때 사용하는 Method다.

JavaScript의 fetch()나 HTML Form을 통해
POST 요청을 보낼 수 있다.

submit은 브라우저에서 발생하는 이벤트이고,
POST는 서버에 요청을 보낼 때 사용하는 방식이다.

따라서 두 개념은 서로 다르다.

## 7. preventDefault()의 역할

preventDefault()는 이벤트의 기본 동작을 취소한다.

이번 실습에서는 Form의 기본 제출 동작을 막고,
JavaScript가 직접 입력값을 처리하도록 했다.

preventDefault()가 submit 이벤트 자체를 삭제하는 것은 아니다.

## 8. Form 입력값을 Object로 변환

사용자가 입력한 강좌명과 강사명을 읽어
새로운 JavaScript Object를 만들었다.

예시:

const newCourse = {
    id: Date.now(),
    title: titleInput.value.trim(),
    instructor: instructorInput.value.trim()
};

- value : 입력값을 읽는다.
- trim() : 앞뒤 공백을 제거한다.
- Date.now() : 현재 시간을 숫자로 반환한다.

## 9. 지금 데이터가 저장되는 위치

현재 데이터는 Browser Memory에 저장된다.

courses.push(newCourse)를 실행하면
JavaScript 배열에 새로운 강좌가 추가된다.

renderFilteredCourses()를 실행하면
변경된 배열을 바탕으로 화면을 다시 출력한다.

현재는 서버나 데이터베이스에 저장하지 않는다.

따라서 페이지를 새로고침하면
추가했던 강좌는 사라지고 초기 데이터로 돌아간다.

## 10. input Event와 검색 기능

검색창에 문자를 입력하면 input 이벤트가 발생한다.

filter()로 검색 조건에 맞는 강좌를 추출하고,
includes()로 강좌명에 검색어가 포함되어 있는지 검사했다.

toLowerCase()를 사용하여
영어 대소문자 구분 없이 검색되도록 구현했다.

filter()는 원본 배열을 변경하지 않고
조건에 맞는 새로운 배열을 반환한다.

## 11. Network 탭에서 확인한 것

Chrome DevTools의 Network 탭에서 검증했다.

확인 결과:

- 강좌 등록 후 화면에 새로운 카드가 추가되었다.
- Console에 등록 완료 메시지가 출력되었다.
- 강좌 등록을 위한 HTTP POST 요청은 발생하지 않았다.

이를 통해 화면에 강좌가 추가되었다고 해서
서버에 데이터가 저장된 것은 아님을 확인했다.

## 12. LLM에게 질문한 내용

Q1. submit Event와 HTTP POST는 무엇이 다른가?

A. submit은 Form에서 발생하는 이벤트이고,
POST는 서버로 HTTP 요청을 보내는 Method다.

Q2. preventDefault()는 무엇을 막는가?

A. Form의 기본 제출 동작을 취소한다.
이벤트 자체를 없애는 것은 아니다.

Q3. push()만 실행하면 화면이 자동으로 바뀌는가?

A. 아니다. 배열 데이터만 변경되므로
renderCourses() 등의 함수를 실행해야 DOM이 갱신된다.

Q4. filter()를 사용하면 원본 배열이 변경되는가?

A. 아니다. 조건에 맞는 새로운 배열을 반환한다.

## 13. 내가 직접 검증한 내용

- [x] 초기 강좌 3개 출력
- [x] 새로운 강좌 등록
- [x] 등록 후 카드 4개 출력
- [x] 실시간 강좌명 검색
- [x] 대소문자 구분 없는 검색
- [x] 검색 결과 없음 메시지
- [x] 검색어 삭제 후 전체 목록 복구
- [x] Form 필수 입력값 검사
- [x] 새로고침 후 초기 데이터 복구
- [x] Network에서 등록 POST 요청 없음 확인
- [x] Console에서 JavaScript 오류 없음 확인

## 14. 핵심 학습 내용

이번 실습을 통해 사용자 이벤트가
JavaScript 실행으로 연결되는 과정을 이해했다.

특히 다음 세 가지를 구분할 수 있게 되었다.

1. Event는 브라우저에서 발생하는 사건이다.
2. DOM Rendering은 데이터를 화면에 표현하는 작업이다.
3. 서버 저장은 별도의 HTTP 통신과 저장 처리가 필요하다.

현재 프로젝트는 Browser Memory를 이용하며,
이후 HTTP와 API를 학습하여 서버 통신으로 확장할 예정이다.
