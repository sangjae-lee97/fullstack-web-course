
import { test, expect } from "@playwright/test";

import type { Product } from "../types/product";
import type { OrderResult } from "../lib/orders-api";

const STORE_URL =
  "http://localhost:3000/mini-popup-store";

const PRODUCTS_API =
  "http://127.0.0.1:8000/products";

const ORDERS_API =
  "http://127.0.0.1:8000/orders";


test("실제 보드게임 주문 E2E", async ({ page }) => {
  // 1. 상품 API 응답 감시
  const productsPromise = page.waitForResponse(
    (response) =>
      response.url() === PRODUCTS_API &&
      response.status() === 200
  );

  // 2. 쇼핑몰 접속
  await page.goto(STORE_URL);

  const productsResponse = await productsPromise;
  const products: Product[] =
    await productsResponse.json();

  // 3. 아발론 상품 조회
  const avalon = products.find(
    (product) => product.name === "아발론"
  );

  if (!avalon || avalon.stock < 1) {
    throw new Error("아발론 재고가 부족합니다.");
  }

  const initialStock = avalon.stock;

  const card = page.locator("article").filter({
    hasText: "아발론",
  });

  await expect(card).toContainText(
    `재고 ${initialStock}개`
  );

  // 4. 장바구니에 1개 담기
  await card.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await expect(
    page.locator("#cart")
  ).toContainText("장바구니 수량: 1개");

  // 5. 실제 POST 응답 감시
  const orderPromise = page.waitForResponse(
    (response) =>
      response.url() === ORDERS_API &&
      response.request().method() === "POST"
  );

  // 6. 실제 주문 버튼 클릭
  await page.getByRole("button", {
    name: "주문하기",
  }).click();

  const orderResponse = await orderPromise;

  // 7. HTTP 201 확인
  expect(orderResponse.status()).toBe(201);

  // 요청에 가격을 넣지 않았는지 확인
  expect(
    orderResponse.request().postDataJSON()
  ).toEqual({
    items: [
      {
        product_id: avalon.id,
        quantity: 1,
      },
    ],
  });

  const order: OrderResult =
    await orderResponse.json();

  expect(order.id).toBeGreaterThan(0);
  expect(order.total_price).toBe(avalon.price);
  expect(order.status).toBe("created");

  // 8. 주문 완료 화면 확인
  const cart = page.locator("#cart");

  await expect(cart).toContainText("주문 완료!");
  await expect(cart).toContainText(
    `주문 번호: ${order.id}`
  );

  // 9. 장바구니 초기화 확인
  await expect(cart).toContainText(
    "장바구니 수량: 0개"
  );

  // 10. 최신 재고가 화면에 반영되는지 확인
  await expect(card).toContainText(
    `재고 ${initialStock - 1}개`
  );

  // 11. DB 검증에 사용할 결과 출력
  console.log("=== Real Order E2E ===");
  console.log("Order ID:", order.id);
  console.log("Product ID:", avalon.id);
  console.log("Order Total:", order.total_price);
  console.log("Stock Before:", initialStock);
  console.log("Stock After:", initialStock - 1);
});
