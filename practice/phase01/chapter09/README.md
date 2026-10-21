# Chapter 09 학습 기록

## 1. map / filter / find의 차이

JavaScript의 배열 메서드를 이용하여 회원 데이터를 가공하는 방법을 학습했다.

| 메서드 | 역할 | 반환값 |
|---|---|---|
| map() | 배열의 모든 요소를 변환 | 새로운 배열 |
| filter() | 조건을 만족하는 모든 요소를 선택 | 새로운 배열 |
| find() | 조건을 만족하는 첫 번째 요소를 검색 | 요소 하나 또는 undefined |

### map() 예시

```javascript
const names = analyzerMembers.map(member => member.name);
```

- 회원 객체에서 이름만 추출한다.
- 기존 배열을 변경하지 않고 새로운 배열을 생성한다.

### filter() 예시

```javascript
const activeMembers = analyzerMembers.filter(member => member.active);
```

- 활성 상태인 회원만 추출한다.
- 조건을 만족하는 요소가 하나여도 배열을 반환한다.

### find() 예시

```javascript
const selectedMember = analyzerMembers.find(member => member.id === 3);
```

- ID가 3인 회원을 검색한다.
- 조건을 만족하는 첫 번째 객체를 반환한다.
- 검색 결과가 없으면 undefined를 반환한다.

## 2. 가장 어려웠던 부분

### 배열 인덱스 이해

JavaScript 배열의 인덱스는 0부터 시작한다.

따라서 `analyzerMembers[4]`는 다섯 번째 회원인 Jung을 의미한다.

### filter()와 find()의 차이

두 메서드 모두 조건을 사용하지만 반환 결과가 다르다는 점을 학습했다.

- filter(): 조건을 만족하는 모든 요소를 배열로 반환
- find(): 조건을 만족하는 첫 번째 요소 하나만 반환

### undefined와 오류 처리

find()에서 검색 결과가 없으면 자동으로 undefined가 반환된다.

그러나 undefined 상태에서 `.name`과 같은 속성에 직접 접근하면 TypeError가 발생할 수 있다.

이를 방지하기 위해 조건문과 옵셔널 체이닝을 학습했다.

## 3. LLM에게 질문한 내용

1. filter()에서 특정 회원이 선택되지 않는 이유는 무엇인가?
2. find()에서 검색 결과가 없으면 JavaScript가 자동으로 undefined를 반환하지 않는가?
3. undefined를 반환하는 것과 undefined의 속성에 접근하는 것은 어떻게 다른가?
4. 옵셔널 체이닝(`?.`)과 null 병합 연산자(`??`)는 어떤 역할을 하는가?

## 4. LLM 답변에서 직접 검증한 내용

브라우저 개발자 도구의 Console을 이용하여 다음 내용을 확인했다.

- map()으로 회원 이름 배열 생성
- filter()로 활성 회원 3명 추출
- filter()로 30세 이상 회원 3명 추출
- find()로 ID 3인 Park 회원 검색
- 함수로 회원 정보를 문자열로 변환
- ID 99 검색 시 undefined 반환 및 안내 메시지 출력
- Array.isArray()로 배열 여부 확인
- length로 배열 요소 개수 확인

LLM이 설명한 결과를 실제 JavaScript 실행 결과와 비교하여 검증했다.

## 5. 실행 결과

### Member Data Analyzer

회원 5명의 데이터를 이용해 총 6개 기능을 구현했다.

| 기능 | 실행 결과 | 상태 |
|---|---|---|
| 전체 회원 이름 추출 | Kim, Lee, Park, Choi, Jung | PASS |
| 활성 회원 추출 | Kim, Park, Choi | PASS |
| 30세 이상 회원 추출 | Lee, Choi, Jung | PASS |
| 특정 ID 회원 검색 | ID 3 → Park | PASS |
| 회원 정보 문자열 변환 | Kim / kim@example.com / 활성 | PASS |
| 존재하지 않는 ID 처리 | undefined 및 안내 메시지 출력 | PASS |

### 학습 결과 정리

- Object를 이용해 회원 한 명의 정보를 표현할 수 있다.
- Array를 이용해 여러 회원 정보를 관리할 수 있다.
- Function을 이용해 반복되는 처리 로직을 재사용할 수 있다.
- map(), filter(), find()의 차이를 구분할 수 있다.
- 함수의 매개변수와 반환값을 활용할 수 있다.
- 검색 실패 가능성을 고려한 코드를 작성할 수 있다.

Chapter 09의 회원 데이터 처리 실습과 Member Data Analyzer 과제를 완료했다.