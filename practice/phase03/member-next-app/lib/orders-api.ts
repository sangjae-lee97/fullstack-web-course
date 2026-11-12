
const ORDERS_PATH = "/orders";

// 주문할 상품 정보
export type OrderItemPayload = {
  product_id: number;
  quantity: number;
};

// FastAPI에 전달할 주문 요청
export type OrderPayload = {
  items: OrderItemPayload[];
};

// FastAPI의 주문 성공 응답
export type OrderResult = {
  id: number;
  total_price: number;
  status: string;
};

// 기존 API 환경변수 재사용
function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL을 설정해 주세요."
    );
  }

  return base.replace(/\/$/, "") + path;
}

// 주문 응답의 자료형 검사
function isOrderResult(
  value: unknown
): value is OrderResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "number" &&
    Number.isInteger(item.id) &&
    item.id > 0 &&
    typeof item.total_price === "number" &&
    Number.isInteger(item.total_price) &&
    item.total_price >= 0 &&
    item.status === "created"
  );
}

// FastAPI 오류 메시지 추출
function getErrorDetail(data: unknown): string {
  if (typeof data !== "object" || data === null) {
    return "";
  }

  const item = data as Record<string, unknown>;

  if (typeof item.detail === "string") {
    return item.detail;
  }

  if (Array.isArray(item.detail)) {
    return "주문 요청 형식이 올바르지 않습니다.";
  }

  return "";
}

// POST /orders
export async function createOrder(
  payload: OrderPayload
): Promise<OrderResult> {
  const response = await fetch(apiUrl(ORDERS_PATH), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response
    .json()
    .catch(() => null);

  // HTTP 오류 확인
  if (!response.ok) {
    const detail = getErrorDetail(data);

    throw new Error(
      `주문 실패 (HTTP ${response.status})` +
        (detail ? `: ${detail}` : "")
    );
  }

  // 주문 성공 응답 검사
  if (
    response.status !== 201 ||
    !isOrderResult(data)
  ) {
    throw new Error(
      "주문 응답이 예상한 형식이 아닙니다."
    );
  }

  return data;
}
