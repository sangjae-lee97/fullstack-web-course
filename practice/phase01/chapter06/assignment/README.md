
# Chapter 06 학습 기록

## 1. Flexbox를 사용한 영역과 이유

- Header: 제목과 메뉴를 가로로 배치하기 위해 사용
- Toolbar: 검색창과 버튼을 한 줄에 배치하기 위해 사용
- 카드 내부 버튼: 상세·수정 버튼을 나란히 정렬하기 위해 사용

Flexbox는 한 방향으로 요소를 정렬할 때 유용하다.

## 2. Grid를 사용한 영역과 이유

- 회원 카드 목록에 Grid 적용
- `grid-template-columns: repeat(3, 1fr)` 사용
- 회원 카드 6개를 3열 × 2행으로 배치

Grid는 행과 열을 함께 관리하는 레이아웃에 적합하다.

## 3. 가장 이해하기 어려웠던 속성

`grid-template-columns`

처음에는 열의 개수를 지정하는 방식이 익숙하지 않았지만,
3열 → 2열 → 1열로 변경하며 작동 원리를 이해했다.

## 4. LLM에게 질문한 내용

- Flexbox와 Grid의 차이
- HTML section의 올바른 구조
- Flexbox가 적용되지 않는 원인
- DevTools에서 CSS 적용 여부 확인 방법

## 5. LLM 답변을 검증하거나 수정한 내용

- HTML에서 잘못된 section 및 table 구조 수정
- 검색 Toolbar에 Flexbox 적용 확인
- DevTools에서 Flex와 Grid 배지 확인
- display 속성을 비활성화하여 레이아웃 변화 검증
- Grid 열 개수를 변경하여 동작 확인

## 6. 최종 결과

- 회원관리 페이지 실습 완료
- 회원 6명 Dashboard 제작 완료
- Flexbox와 Grid의 차이 및 중첩 사용 이해
