
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getMember } from "../lib/members-api";
import type { Member } from "../types/member";
import styles from "./member-management.module.css";

export default function MemberDetail() {
  // URL에서 회원 ID 가져오기
  const params = useParams<{ memberId: string }>();

  const memberIdText = params.memberId;
  const memberId = Number(memberIdText);

  // 회원 ID 유효성 검사
  const validId =
    /^\d+$/.test(memberIdText) &&
    Number.isSafeInteger(memberId) &&
    memberId > 0;

  // 기존 조회 상태 유지
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 기존 FastAPI 상세 조회 기능 유지
  useEffect(() => {
    if (!validId) return;

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      setMember(null);

      try {
        const data = await getMember(
          memberId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setMember(data);
        }
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "회원 상세 조회 오류"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [memberId, validId]);

  return (
    <section>
      {/* 목록으로 돌아가기 */}
      <Link
        href="/members"
        className={styles.breadcrumb}
      >
        ← 회원 목록으로 돌아가기
      </Link>

      {/* 페이지 헤더 */}
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>
          MEMBER DETAILS
        </p>

        <h1 className={styles.pageTitle}>
          회원 상세 정보
        </h1>

        <p className={styles.pageSubtitle}>
          등록된 회원의 상세 정보를 확인하세요.
        </p>
      </header>

      {/* 기존 로딩 및 오류 처리 유지 */}
      {!validId ? (
        <p role="alert" className={styles.error}>
          올바른 회원 ID를 입력해 주세요.
        </p>
      ) : loading ? (
        <p role="status" className={styles.emptyState}>
          회원 정보를 불러오는 중입니다...
        </p>
      ) : error ? (
        <p role="alert" className={styles.error}>
          조회 오류: {error}
        </p>
      ) : member ? (
        <div className={styles.detailCard}>
          <h2 className={styles.detailTitle}>
            {member.name}
          </h2>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              회원 ID
            </span>
            <span className={styles.detailValue}>
              {member.member_id}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              이름
            </span>
            <span className={styles.detailValue}>
              {member.name}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              이메일
            </span>
            <span className={styles.detailValue}>
              {member.email}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              나이
            </span>
            <span className={styles.detailValue}>
              {member.age}세
            </span>
          </div>
        </div>
      ) : (
        <p role="alert" className={styles.error}>
          회원 정보를 찾을 수 없습니다.
        </p>
      )}
    </section>
  );
}
