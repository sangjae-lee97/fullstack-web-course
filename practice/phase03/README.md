# Phase 03 — Fullstack Web Project

FastAPI, Next.js, React, TypeScript, SQLAlchemy, PostgreSQL을 이용한 풀스택 웹 개발 실습 프로젝트입니다.

기존 회원관리 시스템을 구현한 뒤, Chapter 09 종합 프로젝트로 **Board Game Mini Pop-up Store**를 개발했습니다.

## 1. 프로젝트 소개

### 회원관리 시스템

- 회원 목록 및 상세 조회
- 회원 등록, 수정, 삭제
- 회원 검색 및 페이지네이션
- FastAPI와 PostgreSQL 연동
- HTTP 오류 처리 및 데이터 검증

### Board Game Mini Pop-up Store

- 보드게임 상품 10개 조회
- 상품 이미지, 가격, 카테고리, 재고 및 품절 표시
- 장바구니 상품 추가·삭제
- 장바구니 수량 증감 및 재고 초과 방지
- 총수량 및 총액 자동 계산
- FastAPI를 통한 실제 주문 생성
- 주문 성공·실패 화면
- PostgreSQL 주문 저장 및 재고 차감
- pytest 및 Playwright 자동 테스트

상품 화면은 코리아보드게임즈의 쇼핑몰 구성을 참고하여 밝은 배경과 상품 카드 중심으로 디자인했습니다.

## 2. 기술 스택

| 영역 | 기술 |
|---|---|
| Backend | Python 3.12, FastAPI |
| API Server | Uvicorn |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Frontend | Next.js, React, TypeScript |
| Frontend Styling | CSS Modules |
| Backend Testing | pytest, FastAPI TestClient |
| Browser Testing | Playwright, Chromium |
| 개발 환경 | VS Code, Windows PowerShell |
| DB 관리 | DBeaver |

## 3. 프로젝트 구조

```text
phase03/
├── .venv/
├── .env
├── README.md
│
├── backend/
│   ├── main.py
│   ├── db.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed_boardgames.py
│   ├── e2e_app.py
│   ├── routers/
│   │   ├── members.py
│   │   ├── products.py
│   │   └── orders.py
│   ├── services/
│   │   ├── member_service.py
│   │   ├── product_service.py
│   │   └── order_service.py
│   └── repositories/
│       ├── member_repository.py
│       ├── product_repository.py
│       └── order_repository.py
│
├── tests/
│   ├── conftest.py
│   ├── test_products.py
│   ├── test_orders.py
│   ├── test_order_validation.py
│   ├── test_order_atomicity.py
│   ├── test_order_rollback.py
│   ├── test_order_duplicate.py
│   └── test_order_fixture.py
│
└── member-next-app/
    ├── app/
    │   ├── members/
    │   └── mini-popup-store/
    │       └── page.tsx
    ├── components/
    │   ├── ProductCard.tsx
    │   └── StoreStyles.module.css
    ├── lib/
    │   ├── members-api.ts
    │   ├── products-api.ts
    │   └── orders-api.ts
    ├── types/
    │   ├── member.ts
    │   └── product.ts
    ├── public/
    │   └── boardgames/
    ├── tests/
    │   ├── store-smoke.spec.ts
    │   ├── store-total.spec.ts
    │   ├── store-api.spec.ts
    │   └── store-order-e2e.spec.ts
    ├── .env.local
    └── package.json
```

## 4. 시스템 아키텍처

```text
사용자 브라우저
       |
Next.js + React
       |
   HTTP / JSON
       |
FastAPI Router
       |
     Service
       |
   Repository
       |
   SQLAlchemy
       |
   PostgreSQL
```

**Router:** API 요청과 응답 처리

**Service:** 가격·재고 검증, 주문 업무 규칙, 트랜잭션 처리

**Repository:** SQLAlchemy를 이용한 데이터 조회 및 변경

**PostgreSQL:** 회원, 상품, 주문 및 주문 상세 데이터 저장

## 5. 데이터베이스

실습 데이터베이스는 `postgres`이며, 실제 쇼핑몰 기능은 `practice` 스키마를 사용합니다.

### 주요 테이블

| 테이블 | 설명 |
|---|---|
| practice.members | 회원 정보 |
| practice.products | 상품 정보 및 재고 |
| practice.orders | 주문 기본 정보 |
| practice.order_items | 주문 상품 및 수량 |

### 주문 테이블 관계

```text
orders (1)
    |
    | 1:N
    |
order_items (N)
    |
    | N:1
    |
products (1)
```

`order_items.order_id`는 `orders.id`를 참조합니다.

`order_items.product_id`는 `products.id`를 참조합니다.

주문 당시의 상품 단가는 `order_items.price`에 저장합니다.

상품 가격이 변경되더라도 이전 주문의 가격 기록은 유지됩니다.

### 테스트 스키마

- `chapter09_test`: pytest 트랜잭션 격리 테스트
- `chapter09_e2e`: E2E 분리 실험을 위해 생성한 스키마

최종 Playwright 실제 주문 테스트는 `practice` 스키마를 사용했습니다. `backend/e2e_app.py`는 테스트 서버 분리 실험용 파일이며 최종 주문 테스트에는 사용하지 않았습니다.

## 6. 서버 실행 방법

### FastAPI 실행

프로젝트의 `phase03` 폴더에서 실행합니다.

```powershell
Set-Location C:\dev\fullstack-web-course\practice\phase03

.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger:

http://127.0.0.1:8000/docs

### Next.js 실행

다른 PowerShell 터미널에서 실행합니다.

```powershell
Set-Location C:\dev\fullstack-web-course\practice\phase03\member-next-app

npm run dev
```

회원관리 화면:

http://localhost:3000/members

보드게임 쇼핑몰:

http://localhost:3000/mini-popup-store

Next.js가 다른 포트에서 실행되면 터미널에 표시된 주소를 사용합니다.

## 7. 환경변수

Backend는 `phase03/.env`에서 PostgreSQL 연결 설정을 읽습니다.

필요한 변수 이름은 다음과 같습니다.

```text
DB_USER
DB_PASSWORD
DB_HOST
DB_PORT
DB_NAME
```

Frontend의 `.env.local`에는 다음 API 기본 주소를 사용합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

실제 비밀번호, 데이터베이스 접속 문자열, API Secret은 GitHub에 업로드하지 않습니다.

새로운 DB에서 실행하려면 기존 SQLAlchemy 모델에 맞는 테이블과 스키마를 준비해야 합니다. 현재 프로젝트는 기존 실습 DB를 재사용합니다.

## 8. REST API

### 회원관리 API

| Method | Endpoint | 기능 |
|---|---|---|
| GET | /members | 회원 목록 |
| GET | /members/{member_id} | 회원 상세 |
| POST | /members | 회원 등록 |
| PUT | /members/{member_id} | 회원 전체 수정 |
| PATCH | /members/{member_id} | 회원 부분 수정 |
| DELETE | /members/{member_id} | 회원 삭제 |

### 쇼핑몰 API

| Method | Endpoint | 기능 |
|---|---|---|
| GET | /products | 상품 전체 조회 |
| POST | /orders | 주문 생성 |

### 주문 요청 예시

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

### 주문 성공 응답 예시

```json
{
  "id": 1,
  "total_price": 360000,
  "status": "created"
}
```

주문 요청에서는 상품의 가격과 총액을 전송하지 않습니다.

FastAPI가 PostgreSQL에 저장된 실제 가격과 재고를 확인한 후 주문 금액을 계산합니다.

### 주요 HTTP 응답

| 상태 | 의미 |
|---|---|
| 200 | 상품 조회 성공 |
| 201 | 주문 생성 성공 |
| 404 | 존재하지 않는 상품 |
| 409 | 재고 부족 |
| 422 | 주문 요청 데이터 검증 실패 |

## 9. 주문 트랜잭션

주문 과정은 다음과 같습니다.

```text
POST /orders
    |
상품 조회 및 행 잠금
    |
상품 존재 여부 확인
    |
재고 검증
    |
서버에서 주문 총액 계산
    |
orders INSERT
    |
order_items INSERT
    |
products 재고 감소
    |
COMMIT
```

처리 중 오류가 발생하면 `ROLLBACK`하여 부분 저장을 방지합니다.

PostgreSQL의 `SELECT ... FOR UPDATE`를 사용해 주문 대상 상품 행을 잠급니다.

트랜잭션의 ROLLBACK은 테스트로 검증했습니다. 별도 DB 연결을 이용한 동시 주문 경쟁 상황은 추가 검증 대상입니다.

## 10. 자동 테스트

### Backend pytest

```powershell
Set-Location C:\dev\fullstack-web-course\practice\phase03

.\.venv\Scripts\python.exe -m pytest tests -q
```

**최종 검증 결과: 13 passed, 1 warning**

검증 범위:

- 상품 API 응답 및 자료형
- 테스트 DB 격리
- 정상 주문
- 상품 없음 404
- 재고 부족 409
- 잘못된 수량 422
- 다중 상품 주문 실패
- 실제 SQL 실행 후 ROLLBACK
- 동일 상품 ID 수량 합산

Warning은 TestClient의 httpx 호환성 관련 경고입니다.

### Frontend Playwright

```powershell
Set-Location C:\dev\fullstack-web-course\practice\phase03\member-next-app

npx tsc --noEmit

npx eslint app/mini-popup-store/page.tsx lib/orders-api.ts lib/products-api.ts components/ProductCard.tsx

npx playwright test tests/store-smoke.spec.ts tests/store-total.spec.ts tests/store-api.spec.ts --reporter=list
```

**최종 회귀 검증 결과: 5 passed**

검증 범위:

- 보드게임 10개 렌더링
- 실제 FastAPI 상품 조회
- 장바구니 수량 및 재고 제한
- 수량 변경·삭제
- 총액 자동 계산

### 실제 주문 E2E

```powershell
npx playwright test tests/store-order-e2e.spec.ts --reporter=list
```

**실행 결과: 1 passed**

주의: 이 테스트는 실제 `practice` 데이터베이스에 주문을 저장하고 상품 재고를 감소시킵니다. 실행할 때마다 새 주문이 생성될 수 있으므로 일반 회귀 테스트와 구분하여 실행합니다.

## 11. 최종 검증 결과

검증일: 2026-11-12

| 항목 | 결과 |
|---|---|
| 회원 데이터 | 12명 |
| 보드게임 상품 | 10개 |
| 실제 주문 | 2건 |
| 실제 주문 상세 | 2건 |
| Backend pytest | 13 passed |
| Frontend Playwright 회귀 | 5 passed |
| 실제 주문 E2E | 1 passed |
| 주문 총액 정합성 | 확인 완료 |
| 재고 차감 | 확인 완료 |

### 실제 주문 기록

**주문 1**

- 상품: 블러드 온 더 클락타워
- 수량: 2개
- 금액: 360,000원
- 재고: 8개 → 6개

**주문 2**

- 상품: 아발론
- 수량: 1개
- 금액: 35,000원
- 재고: 15개 → 14개

두 주문 모두 주문 상세 금액의 합계와 주문 총액이 일치하는 것을 PostgreSQL에서 확인했습니다.

## 12. 향후 개선 사항

- 사용자 로그인 및 주문 이력 조회
- 서버 기반 장바구니 저장
- 상품 검색 및 카테고리 필터
- 주문 취소 및 재고 복구
- 주문 중복 방지용 Idempotency Key
- 분리된 E2E 테스트 데이터 환경
- 동시 주문에 대한 경쟁 조건 테스트
- 반응형 UI 및 접근성 개선

---

## 프로젝트 요약

이번 프로젝트에서는 React State로 장바구니를 관리하고, FastAPI로 주문을 처리하며, PostgreSQL에 주문과 재고 변경을 저장하는 전체 풀스택 흐름을 구현했습니다.

또한 pytest와 Playwright를 이용해 Backend 기능과 실제 브라우저 사용자 흐름을 검증했습니다.