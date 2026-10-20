# Chapter 07 학습 기록

## 프로젝트 소개

Responsive Course Dashboard

HTML과 CSS를 이용해 화면 크기에 따라
레이아웃이 변경되는 반응형 강의 대시보드를 구현했다.

## 내가 정한 Breakpoint

- 768px 미만: 모바일, 카드 1열
- 768px 이상: 태블릿, 카드 2열
- 1024px 이상: 데스크톱, 카드 3열

## 이 Breakpoint를 선택한 이유

화면 너비가 좁을 때는 콘텐츠의 가독성을 위해
카드를 1열로 배치했다.

화면이 넓어지면 사용 가능한 공간을 효율적으로
활용할 수 있도록 2열과 3열로 확장했다.

강의에서 제시한 768px과 1024px을 기준으로
실습하고 브라우저에서 동작을 검증했다.

## 모바일에서 변경한 레이아웃

- Grid를 기본 1열로 설정
- Header를 세로 방향으로 배치
- width: 90%와 max-width: 1200px 적용
- box-sizing: border-box 사용

## LLM에게 질문한 내용

- Viewport가 필요한 이유
- width와 max-width의 차이
- Mobile First 설계 원리
- Media Query의 동작 방식
- CSS Cascade와 우선순위
- box-sizing의 크기 계산 방식

## 내가 직접 확인하고 수정한 부분

- HTML과 CSS 파일 작성
- 모바일 1열 레이아웃 구현
- 태블릿 2열 레이아웃 구현
- 데스크톱 3열 레이아웃 구현
- Header 반응형 배치 구현
- Chrome DevTools에서 화면 크기별 확인
- 375px에서 가로 스크롤 발생 여부 검사

## 최종 검증

| 화면 너비 | 카드 배치 | Header |
|---|---|---|
| 375px | 1열 | 세로 |
| 800px | 2열 | 가로 |
| 1200px | 3열 | 가로 |

375px에서 horizontalOverflow: false 확인.

## 학습 결과

하나의 HTML 구조를 유지하면서 CSS의 Media Query를
이용해 다양한 화면 크기에 대응하는 방법을 이해했다.