
import { test, expect } from "@playwright/test";

const STORE_URL =
  "http://localhost:3000/mini-popup-store";

test("장바구니 총액이 수량 변경에 따라 계산된다", async ({
  page,
}) => {
  await page.goto(STORE_URL);

  const cart = page.locator("#cart");
  const totalPrice = cart.locator("strong");

  const clocktower = page.locator("article").filter({
    hasText: "블러드 온 더 클락타워",
  });

  const avalon = page.locator("article").filter({
    hasText: "아발론",
  });

  // 1. 최초 총액 0원
  await expect(totalPrice).toHaveText("0원");

  // 2. 블러드 온 더 클락타워 1개
  await clocktower.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await expect(totalPrice).toHaveText("180,000원");

  // 3. 같은 상품 1개 추가
  await clocktower.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await expect(totalPrice).toHaveText("360,000원");

  // 4. 아발론 1개 추가
  await avalon.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await expect(totalPrice).toHaveText("395,000원");

  // 5. 블러드 온 더 클락타워 수량 감소
  await cart.getByRole("button", {
    name: "블러드 온 더 클락타워 수량 감소",
  }).click();

  await expect(totalPrice).toHaveText("215,000원");

  // 6. 아발론 삭제
  await cart.getByRole("button", {
    name: "아발론 삭제",
  }).click();

  await expect(totalPrice).toHaveText("180,000원");
});
