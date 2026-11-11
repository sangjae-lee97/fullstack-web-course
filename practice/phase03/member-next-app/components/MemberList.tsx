
"use client";

import { useState } from "react";

import type { Member } from "../types/member";
import MemberCard from "./MemberCard";
import styles from "./member-management.module.css";

type MemberListProps = {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  busy: boolean;
};

export default function MemberList({
  members,
  onEdit,
  onDelete,
  busy,
}: MemberListProps) {
  // 한 페이지에 표시할 회원 수
  const [pageSize, setPageSize] = useState(5);

  // 현재 선택한 페이지
  const [page, setPage] = useState(1);

  // 전체 페이지 수
  const totalPages = Math.max(
    1,
    Math.ceil(members.length / pageSize)
  );

  // 검색이나 삭제로 페이지 수가 줄어들면 자동 보정
  const currentPage = Math.min(page, totalPages);

  // 현재 페이지에서 표시할 회원 범위
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // 현재 페이지에 표시할 회원 목록
  const visibleMembers = members.slice(
    startIndex,
    endIndex
  );

  // 페이지당 표시 개수 변경
  function handlePageSizeChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    setPageSize(Number(event.target.value));
    setPage(1);
  }

  // 이전 페이지
  function goToPreviousPage() {
    setPage(Math.max(1, currentPage - 1));
  }

  // 다음 페이지
  function goToNextPage() {
    setPage(Math.min(totalPages, currentPage + 1));
  }

  return (
    <section aria-labelledby="member-list-title">
      {/* 회원 목록 제목 */}
      <div className={styles.panelHeader}>
        <div>
          <h2
            id="member-list-title"
            className={styles.panelTitle}
          >
            회원 목록
          </h2>

          <p className={styles.panelDescription}>
            등록된 회원 정보를 확인하고 관리하세요.
          </p>
        </div>

        <span className={styles.countBadge}>
          {members.length}명
        </span>
      </div>

      {/* 페이지당 회원 수 선택 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <label
          htmlFor="member-page-size"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#475569",
            fontSize: 13,
          }}
        >
          페이지당

          <select
            id="member-page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{
              height: 38,
              padding: "0 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <option value={5}>5명</option>
            <option value={10}>10명</option>
            <option value={20}>20명</option>
          </select>
        </label>

        <span
          style={{
            color: "#64748b",
            fontSize: 13,
          }}
        >
          {members.length === 0
            ? "0명"
            : `${startIndex + 1}–${Math.min(
                endIndex,
                members.length
              )} / 총 ${members.length}명`}
        </span>
      </div>

      {/* 현재 페이지 회원 목록 */}
      {members.length === 0 ? (
        <div className={styles.emptyState}>
          표시할 회원이 없습니다.
        </div>
      ) : (
        <ul className={styles.memberList}>
          {visibleMembers.map((member) => (
            <MemberCard
              key={member.member_id}
              member={member}
              onEdit={onEdit}
              onDelete={onDelete}
              busy={busy}
            />
          ))}
        </ul>
      )}

      {/* 페이지 이동 버튼 */}
      {totalPages > 1 && (
        <nav
          aria-label="회원 목록 페이지 이동"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={goToPreviousPage}
            disabled={busy || currentPage === 1}
          >
            ← 이전
          </button>

          <span
            aria-live="polite"
            style={{
              color: "#334155",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {currentPage} / {totalPages} 페이지
          </span>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={goToNextPage}
            disabled={busy || currentPage === totalPages}
          >
            다음 →
          </button>
        </nav>
      )}
    </section>
  );
}
