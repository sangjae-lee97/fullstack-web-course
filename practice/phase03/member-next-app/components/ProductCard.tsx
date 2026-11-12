"use client";

import Image from "next/image";
import { useState } from "react";

import type { Product } from "../types/product";
import styles from "./StoreStyles.module.css";


type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const soldOut = product.stock === 0;

  return (
    <article className={styles.productCard}>
      <div className={styles.productImageFrame}>
        {imageError ? (
          <div className={styles.imageFallback} role="img" aria-label={`${product.name} 이미지 준비 중`}>
            <span>🎲</span>
            <small>이미지 준비 중</small>
          </div>
        ) : (
          <Image
            src={`/boardgames/${product.id}.jpg`}
            alt={`${product.name} 보드게임 박스 사진`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 260px"
            className={styles.productImage}
            onError={() => setImageError(true)}
          />
        )}
        {soldOut && <span className={styles.soldOutTag}>품절</span>}
      </div>

      <span className={styles.category}>{product.category}</span>
      <h3 className={styles.productName}>{product.name}</h3>
      <strong className={styles.productPrice}>
        {product.price.toLocaleString("ko-KR")}원
      </strong>
      <p className={styles.stockText}>{soldOut ? "품절" : `재고 ${product.stock}개`}</p>
      <button
        type="button"
        className={styles.addButton}
        disabled={soldOut}
        onClick={() => onAdd(product)}
      >
        {soldOut ? "품절" : "장바구니 담기"}
      </button>
    </article>
  );
}
