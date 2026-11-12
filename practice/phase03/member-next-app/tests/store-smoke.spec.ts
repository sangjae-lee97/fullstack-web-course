
import { test, expect } from "@playwright/test";

const STORE_URL =
  "http://localhost:3000/mini-popup-store";

// STEP 19: 상품 목록
test("보드게임 상품 10개가 정상적으로 표시된다", async ({
  page,
}) => {
  await page.goto(STORE_URL);

  await expect(
    page.getByRole("heading", {
      name: "Board Game Mini Pop-up Store",
    })
  ).toBeVisible();

  await expect(
    page.getByText("전체 상품: 10개")
  ).toBeVisible();

  const cards = page.locator("article");

  await expect(cards).toHaveCount(10);

  const clocktower = cards.filter({
    hasText: "블러드 온 더 클락타워",
  });

  await expect(clocktower).toContainText("180,000원");

  const wingspan = cards.filter({
    hasText: "윙스팬",
  });

  await expect(wingspan).toContainText("품절");

  await expect(
    wingspan.getByRole("button", {
      name: "품절",
    })
  ).toBeDisabled();
});

// STEP 21: 실제 재고 기준으로 장바구니 제한 검증
test("장바구니 수량과 재고 제한이 정상 작동한다", async ({
  page,
}) => {
  await page.goto(STORE_URL);

  const cards = page.locator("article");

  const clocktower = cards.filter({
    hasText: "블러드 온 더 클락타워",
  });

  const avalon = cards.filter({
    hasText: "아발론",
  });

  const cart = page.locator("#cart");

  const cartCount = cart.locator(
    'p[aria-live="polite"]'
  );

  // 현재 화면에 표시된 재고 확인
  const stockText = await clocktower
    .getByText(/^재고\s+\d+개$/)
    .textContent();

  const stockMatch = stockText?.match(/\d+/);

  if (!stockMatch) {
    throw new Error("상품 재고를 확인할 수 없습니다.");
  }

  const actualStock = Number(stockMatch[0]);

  expect(actualStock).toBeGreaterThanOrEqual(2);

  // 최초 장바구니 수량 0
  await expect(cartCount).toContainText(
    "장바구니 수량: 0개"
  );

  // 블러드 온 더 클락타워 2개
  for (let i = 0; i < 2; i++) {
    await clocktower.getByRole("button", {
      name: "장바구니 담기",
    }).click();
  }

  await expect(cartCount).toContainText(
    "장바구니 수량: 2개"
  );

  // 아발론 1개 추가
  await avalon.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await expect(cartCount).toContainText(
    "장바구니 수량: 3개"
  );

  // 서로 다른 상품 2종류
  await expect(
    cart.getByRole("listitem")
  ).toHaveCount(2);

  // 현재 실제 재고까지만 담기
  for (let i = 2; i < actualStock; i++) {
    await clocktower.getByRole("button", {
      name: "장바구니 담기",
    }).click();
  }

  const expectedCount = actualStock + 1;

  await expect(cartCount).toContainText(
    `장바구니 수량: ${expectedCount}개`
  );

  // 재고를 초과해서 담기 시도
  await clocktower.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  // 실제 재고를 초과하지 않았는지 확인
  await expect(cartCount).toContainText(
    `장바구니 수량: ${expectedCount}개`
  );

  await expect(
    cart.getByRole("listitem").filter({
      hasText: "블러드 온 더 클락타워",
    })
  ).toContainText(`${actualStock}개`);
});

// STEP 22: 수량 변경 및 삭제
test("장바구니 수량 변경 및 삭제가 정상 작동한다", async ({
  page,
}) => {
  await page.goto(STORE_URL);

  const cart = page.locator("#cart");
  const cards = page.locator("article");

  const clocktower = cards.filter({
    hasText: "블러드 온 더 클락타워",
  });

  const avalon = cards.filter({
    hasText: "아발론",
  });

  const cartCount = cart.locator(
    'p[aria-live="polite"]'
  );

  // 상품 2종류 담기
  await clocktower.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await clocktower.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await avalon.getByRole("button", {
    name: "장바구니 담기",
  }).click();

  await expect(cartCount).toContainText(
    "장바구니 수량: 3개"
  );

  // 수량 증가
  await cart.getByRole("button", {
    name: "블러드 온 더 클락타워 수량 증가",
  }).click();

  await expect(cartCount).toContainText(
    "장바구니 수량: 4개"
  );

  // 수량 감소
  await cart.getByRole("button", {
    name: "블러드 온 더 클락타워 수량 감소",
  }).click();

  await expect(cartCount).toContainText(
    "장바구니 수량: 3개"
  );

  // 아발론 삭제
  await cart.getByRole("button", {
    name: "아발론 삭제",
  }).click();

  await expect(cartCount).toContainText(
    "장바구니 수량: 2개"
  );

  await expect(
    cart.getByRole("listitem")
  ).toHaveCount(1);

  // 블러드 온 더 클락타워 2개 제거
  for (let i = 0; i < 2; i++) {
    await cart.getByRole("button", {
      name: "블러드 온 더 클락타워 수량 감소",
    }).click();
  }

  await expect(cartCount).toContainText(
    "장바구니 수량: 0개"
  );

  await expect(
    cart.getByText("장바구니가 비어 있습니다.")
  ).toBeVisible();
});
