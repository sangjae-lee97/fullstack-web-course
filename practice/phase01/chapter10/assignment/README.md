
# Chapter 10 학습 기록

## 1. 과제 개요

- 과제명: Course List Renderer
- 학습 주제: JavaScript DOM 이해와 조작
- 목표: JavaScript 배열 데이터를 HTML 요소로 생성하고 화면에 출력하기

### 구현 기능

1. 강좌 데이터 배열 생성
2. querySelector()로 DOM 요소 선택
3. createElement()로 강좌 카드 생성
4. textContent로 강좌명과 수준 설정
5. append()로 DOM 요소 추가
6. forEach()로 전체 강좌 렌더링
7. renderCourses() 함수 분리
8. 빈 배열 처리(Empty State)
9. CSS 카드 디자인 적용

## 2. DOM을 내 말로 설명하면

DOM(Document Object Model)은 브라우저가 HTML 문서를 읽어 JavaScript에서 접근하고 수정할 수 있도록 만든 객체 구조이다.

JavaScript는 DOM을 통해 기존 요소를 찾거나 수정하고, 새로운 요소를 생성하여 화면에 추가할 수 있다.

중요한 점은 DOM을 수정하더라도 원본 HTML 파일 자체가 수정되는 것은 아니라는 것이다.

## 3. 핵심 개념 정리

### querySelector()

CSS 선택자를 이용하여 HTML 요소를 찾는다.

```javascript
const courseList = document.querySelector('#course-list');
```

선택한 DOM 요소 객체를 변수에 저장한다.

### createElement()

새로운 HTML 요소를 생성한다.

```javascript
const item = document.createElement('li');
```

이 단계에서는 아직 실제 문서에 추가되지 않는다.

### textContent

DOM 요소의 텍스트를 읽거나 수정한다.

```javascript
title.textContent = course.title;
```

### append()

생성한 요소를 부모 요소에 추가한다.

```javascript
item.append(title, level);
courseList.append(item);
```

### forEach()

배열의 요소를 하나씩 순회하면서 DOM 요소를 생성한다.

### renderCourses()

강좌 배열을 전달받아 화면에 출력하는 함수이다.

기존 목록을 초기화한 후 새로운 데이터를 렌더링한다.

### Empty State

데이터가 없을 경우 안내 메시지를 표시하는 기능이다.

## 4. 가장 어려웠던 부분

### ① JavaScript 데이터와 DOM의 차이

배열에 데이터가 존재한다고 해서 화면에 자동으로 표시되는 것은 아니라는 점을 이해하는 것이 중요했다.

데이터를 화면에 표시하려면 DOM 요소를 생성하고 실제 문서에 추가해야 한다.

### ② 중복 변수 선언 오류

실습 과정에서 다음 오류가 발생했다.

```text
Uncaught SyntaxError:
Identifier 'courses' has already been declared
```

또한 courseList 변수를 중복 선언하는 문제도 발생했다.

원인은 기존 코드에 새로운 코드를 추가하면서 const 변수를 같은 범위에서 중복 선언했기 때문이다.

중복 선언을 제거하고 script.js 전체 코드를 정리하여 해결했다.

## 5. LLM에게 질문한 내용

- DOM이 무엇이며 HTML과 어떤 차이가 있는가?
- querySelector()는 문자열과 DOM 객체 중 무엇을 반환하는가?
- createElement()와 append()는 어떤 차이가 있는가?
- forEach()로 여러 DOM 요소를 생성하는 원리는 무엇인가?
- renderCourses()를 함수로 분리하는 이유는 무엇인가?
- innerHTML = ''를 사용하는 이유는 무엇인가?
- const 변수 중복 선언 오류는 왜 발생하는가?
- 빈 배열을 전달했을 때 어떻게 안내 메시지를 출력하는가?

## 6. LLM 답변에서 실제로 확인한 내용

### 강좌 데이터 검증

- 강좌 배열 길이: 3
- 첫 번째 강좌: Database
- 두 번째 강좌: Frontend
- 세 번째 강좌: FastAPI

### DOM 검증

```javascript
document.querySelectorAll('#course-list li').length
```

실행 결과:

```text
3
```

### 빈 배열 검증

```javascript
renderCourses([]);
```

실행 결과:

```text
등록된 강좌가 없습니다.
```

### 정상 데이터 복구

```javascript
renderCourses(courses);
```

실행 결과:

- Database / Basic
- Frontend / Basic
- FastAPI / Backend

### 중복 렌더링 검증

renderCourses(courses)를 다시 호출해도 강좌 카드가 3개로 유지되는 것을 확인했다.

### CSS 검증

- 강좌 카드 디자인 적용 확인
- Grid 레이아웃 적용 확인
- 빈 데이터 안내 메시지의 점선 테두리 확인

## 7. 내가 직접 수정한 부분

1. assignment/index.html 기본 구조 작성
2. script.js에 강좌 배열 작성
3. DOM 요소 생성 및 반복 렌더링 구현
4. renderCourses() 함수로 코드 분리
5. 빈 배열 처리 조건문 추가
6. style.css에 카드 디자인 적용
7. 중복 선언 오류 발생 후 script.js 전체 코드 정리
8. Chrome DevTools에서 실제 결과 검증

## 8. 최종 학습 정리

이번 Chapter에서는 JavaScript 데이터를 실제 웹페이지에 표시하는 방법을 배웠다.

전체 과정은 다음과 같다.

1. JavaScript 배열에 데이터 저장
2. querySelector()로 부모 DOM 요소 선택
3. createElement()로 새로운 요소 생성
4. textContent로 데이터 입력
5. append()로 실제 DOM에 추가
6. forEach()로 여러 데이터 반복 렌더링
7. 함수로 분리하여 재사용성 확보
8. 빈 데이터에 대한 예외 상황 처리

핵심은 데이터 처리와 화면 렌더링을 구분하는 것이다.

## 9. 최종 검증 결과

- [x] querySelector로 DOM 요소 선택
- [x] createElement로 DOM 요소 생성
- [x] textContent로 내용 설정
- [x] append로 요소 추가
- [x] forEach로 전체 강좌 출력
- [x] renderCourses 함수 구현
- [x] 빈 배열 처리
- [x] CSS 카드 디자인 적용
- [x] DevTools에서 DOM 검증
- [x] JavaScript 오류 해결

Git Commit / Push는 최종 검증 후 별도로 진행한다.
