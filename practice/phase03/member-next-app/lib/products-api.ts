
import type { Product } from "../types/product";


const PRODUCTS_PATH = "/products";


// API 요청 주소 생성
function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL을 설정해 주세요."
    );
  }

  return base.replace(/\/$/, "") + path;
}


// FastAPI 응답의 Product 타입 검증
function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "number" &&
    Number.isInteger(item.id) &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isInteger(item.price) &&
    item.price >= 0 &&
    typeof item.category === "string" &&
    typeof item.stock === "number" &&
    Number.isInteger(item.stock) &&
    item.stock >= 0
  );
}


// GET /products
export async function getProducts(
  signal?: AbortSignal
): Promise<Product[]> {
  const response = await fetch(apiUrl(PRODUCTS_PATH), {
    method: "GET",
    cache: "no-store",
    signal,
  });

  // HTTP 응답 검증
  if (!response.ok) {
    throw new Error(
      "상품 API 요청 실패: HTTP " + response.status
    );
  }

  // JSON 응답 파싱
  const data: unknown = await response.json();

  // JSON 구조 및 상품 필드 검증
  if (!Array.isArray(data) || !data.every(isProduct)) {
    throw new Error(
      "상품 목록 응답이 예상한 Product[] 형태가 아닙니다."
    );
  }

  return data;
}
