
import { test, expect } from "@playwright/test";
import type { Product } from "../types/product";

const STORE_URL =
  "http://localhost:3000/mini-popup-store";

const API_URL =
  "http://127.0.0.1:8000/products";

// STEP 25: 실제 FastAPI 연동 검증
// Mock 데이터 사용하지 않음
test("실제 FastAPI 상품 데이터가 React 화면에 표시된다", async ({
  page,
}) => {
  // 실제 GET /products 응답 감시
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === API_URL &&
      response.request().method() === "GET" &&
      response.status() === 200
  );

  // 쇼핑몰 접속
  await page.goto(STORE_URL);

  // HTTP 응답 확인
  const response = await responsePromise;

  expect(response.status()).toBe(200);

  const products: Product[] = await response.json();

  // 실제 DB 상품 10개 검증
  expect(products).toHaveLength(10);

  expect(products[0].name).toBe(
    "블러드 온 더 클락타워"
  );

  expect(products[0].price).toBe(180000);

  // React 화면의 상품 카드 검증
  const cards = page.locator("article");

  await expect(cards).toHaveCount(10);

  const clocktower = cards.filter({
    hasText: "블러드 온 더 클락타워",
  });

  await expect(clocktower).toContainText(
    "180,000원"
  );

  // 품절 상품 검증
  const wingspan = cards.filter({
    hasText: "윙스팬",
  });

  await expect(
    wingspan.getByRole("button", {
      name: "품절",
    })
  ).toBeDisabled();

  // 실제 API 상품을 장바구니에 담기
  await clocktower.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await expect(
    page.locator("#cart")
  ).toContainText("장바구니 수량: 1개");

  await expect(
    page.locator("#cart strong")
  ).toHaveText("180,000원");
});
