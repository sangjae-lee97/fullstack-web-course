
"use client";

import { useEffect, useRef, useState } from "react";

import ProductCard from "../../components/ProductCard";
import styles from "../../components/StoreStyles.module.css";
import { getProducts } from "../../lib/products-api";
import {
  createOrder,
  type OrderResult,
} from "../../lib/orders-api";
import type { CartItem, Product } from "../../types/product";


export default function MiniPopupStorePage() {
  // STEP 25~26: 상품 조회 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // STEP 20~23: 장바구니
  const [cart, setCart] = useState<CartItem[]>([]);

  // STEP 29: 주문 처리 상태
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderResult, setOrderResult] =
    useState<OrderResult | null>(null);

  // 중복 주문 요청 방지
  const orderPendingRef = useRef(false);

  // STEP 25~26: 상품 조회
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const data = await getProducts(controller.signal);

        if (controller.signal.aborted) return;

        setProducts(data);
        setError("");
      } catch (caught) {
        if (controller.signal.aborted) return;

        setProducts([]);
        setError(
          caught instanceof Error
            ? caught.message
            : "알 수 없는 상품 조회 오류"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  // STEP 26: 조회 재시도
  function retryProducts() {
    setLoading(true);
    setError("");
    setRetryCount((previous) => previous + 1);
  }

  // STEP 21: 장바구니 담기
  function handleAdd(product: Product) {
    if (product.stock <= 0) return;

    setOrderResult(null);

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        if (existing.quantity >= product.stock) {
          return previous;
        }

        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...previous,
        { ...product, quantity: 1 },
      ];
    });
  }

  // STEP 22: 수량 증감
  function changeQuantity(
    productId: number,
    change: 1 | -1
  ) {
    setCart((previous) =>
      previous
        .map((item) => {
          if (item.id !== productId) return item;

          const next = Math.max(
            0,
            Math.min(
              item.stock,
              item.quantity + change
            )
          );

          return {
            ...item,
            quantity: next,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  // STEP 22: 상품 삭제
  function removeItem(productId: number) {
    setCart((previous) =>
      previous.filter(
        (item) => item.id !== productId
      )
    );
  }

  // STEP 23: 파생 상태
  const totalCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  // STEP 29: 실제 주문 요청
  async function handleOrder() {
    if (orderPendingRef.current || cart.length === 0) {
      return;
    }

    orderPendingRef.current = true;
    setOrdering(true);
    setOrderError("");
    setOrderResult(null);

    try {
      // 가격과 총액은 전송하지 않음
      const result = await createOrder({
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      // 서버에서 확인된 주문 결과 표시
      setOrderResult(result);

      // 성공했을 때만 장바구니 초기화
      setCart([]);

      // 서버에서 변경된 최신 재고 조회
      retryProducts();
    } catch (caught) {
      setOrderError(
        caught instanceof Error
          ? caught.message
          : "알 수 없는 주문 오류"
      );
    } finally {
      orderPendingRef.current = false;
      setOrdering(false);
    }
  }

  return (
    <div className={styles.pageShell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>
            <span className={styles.brandMark}>● </span>
            BOARD GAME STORE
          </span>

          <nav
            className={styles.nav}
            aria-label="상점 내 이동"
          >
            <a href="#catalog">보드게임</a>
            <a href="#cart">장바구니</a>
            <span className={styles.headerCart}>
              🛒 {totalCount}
            </span>
          </nav>
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>
            BOARD GAME COLLECTION
          </p>

          <h1 className={styles.heroTitle}>
            Board Game Mini Pop-up Store
          </h1>

          <p className={styles.heroDescription}>
            추리부터 전략까지, 오늘은 어떤 게임을 즐길까요?
          </p>
        </section>

        <div className={styles.contentGrid}>
          <section
            className={styles.catalog}
            id="catalog"
            aria-label="상품 목록"
          >
            <h2 className={styles.sectionTitle}>
              전체 보드게임
            </h2>

            {loading ? (
              <p
                className={styles.sectionIntro}
                role="status"
              >
                상품을 불러오는 중...
              </p>
            ) : error ? (
              <div role="alert">
                <p className={styles.sectionIntro}>
                  상품 조회 실패: {error}
                </p>

                <button
                  type="button"
                  onClick={retryProducts}
                  style={{
                    background: "#e85b37",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 20px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <>
                <p className={styles.sectionIntro}>
                  전체 상품: {products.length}개
                </p>

                <div
                  className={styles.categoryRow}
                  aria-label="판매 상품 카테고리"
                >
                  {Array.from(
                    new Set(
                      products.map(
                        (product) => product.category
                      )
                    )
                  ).map((category) => (
                    <span
                      className={styles.categoryLabel}
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>

                {products.length === 0 ? (
                  <p className={styles.sectionIntro}>
                    등록된 상품이 없습니다.
                  </p>
                ) : (
                  <div className={styles.productGrid}>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={handleAdd}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <aside
            id="cart"
            className={styles.cartPanel}
            aria-label="장바구니"
          >
            <h2 className={styles.cartTitle}>
              🛒 장바구니
            </h2>

            <p
              className={styles.cartCount}
              aria-live="polite"
            >
              🛒 장바구니 수량: {totalCount}개
            </p>

            {cart.length === 0 ? (
              <p className={styles.emptyCart}>
                장바구니가 비어 있습니다.
              </p>
            ) : (
              <ul className={styles.cartList}>
                {cart.map((item) => (
                  <li
                    className={styles.cartItem}
                    key={item.id}
                  >
                    <span className={styles.cartItemName}>
                      {item.name} - {item.quantity}개
                    </span>

                    <p className={styles.cartItemPrice}>
                      단가{" "}
                      {item.price.toLocaleString("ko-KR")}원
                    </p>

                    <div className={styles.cartControls}>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        aria-label={`${item.name} 수량 감소`}
                        disabled={ordering}
                        onClick={() =>
                          changeQuantity(item.id, -1)
                        }
                      >
                        −
                      </button>

                      <span className={styles.qtyValue}>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        className={styles.qtyButton}
                        aria-label={`${item.name} 수량 증가`}
                        disabled={
                          ordering ||
                          item.quantity >= item.stock
                        }
                        onClick={() =>
                          changeQuantity(item.id, 1)
                        }
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className={styles.removeButton}
                        aria-label={`${item.name} 삭제`}
                        disabled={ordering}
                        onClick={() =>
                          removeItem(item.id)
                        }
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* STEP 23: 기존 총액 계산 */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: "2px solid #e7e5df",
              }}
            >
              <p
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                <span>총 주문 금액</span>

                <strong
                  style={{
                    color: "#e85b37",
                    fontSize: 22,
                  }}
                >
                  {totalPrice.toLocaleString("ko-KR")}원
                </strong>
              </p>
            </div>

            {/* STEP 29: 주문 버튼 */}
            <button
              type="button"
              onClick={() => {
                void handleOrder();
              }}
              disabled={ordering || cart.length === 0}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "14px 20px",
                background:
                  ordering || cart.length === 0
                    ? "#b9b6b1"
                    : "#e85b37",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor:
                  ordering || cart.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {ordering ? "주문 처리 중..." : "주문하기"}
            </button>

            {/* STEP 29: 주문 실패 */}
            {orderError && (
              <p
                role="alert"
                style={{
                  marginTop: 16,
                  color: "#c2410c",
                  fontWeight: 600,
                }}
              >
                {orderError}
              </p>
            )}

            {/* STEP 29: 주문 성공 */}
            {orderResult && (
              <div
                role="status"
                style={{
                  marginTop: 16,
                  padding: 16,
                  background: "#eef8ef",
                  border: "1px solid #9aca9e",
                  borderRadius: 8,
                  color: "#20643c",
                }}
              >
                <p style={{ fontWeight: 700 }}>
                  주문 완료!
                </p>

                <p>주문 번호: {orderResult.id}</p>

                <p>
                  최종 주문 금액:{" "}
                  {orderResult.total_price.toLocaleString(
                    "ko-KR"
                  )}
                  원
                </p>

                <p>상태: {orderResult.status}</p>
              </div>
            )}

            <p className={styles.cartFootnote}>
              현재 총액은 React State를 이용한
              표시용 금액입니다.
              실제 주문 시에는 FastAPI가 DB 가격과
              재고를 다시 검증합니다.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
