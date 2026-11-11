
import Link from "next/link";

import type { Member } from "../types/member";
import styles from "./member-management.module.css";

type MemberCardProps = {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  busy: boolean;
};

export default function MemberCard({
  member,
  onEdit,
  onDelete,
  busy,
}: MemberCardProps) {
  // 회원 이름의 첫 글자를 아바타로 사용
  const initial = member.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <li className={styles.memberCard}>
      <div className={styles.memberInfo}>
        {/* 회원 아바타 */}
        <div className={styles.avatar} aria-hidden="true">
          {initial}
        </div>

        {/* 회원 기본 정보 */}
        <div className={styles.memberText}>
          <h3 className={styles.memberName}>
            {member.name}
          </h3>

          <p className={styles.memberEmail}>
            {member.email}
          </p>

          <p className={styles.memberMeta}>
            나이 {member.age}세 · ID {member.member_id}
          </p>
        </div>
      </div>

      {/* 기존 상세 조회, 수정, 삭제 기능 유지 */}
      <div className={styles.memberActions}>
        <Link
          href={"/members/" + member.member_id}
          className={styles.linkButton}
        >
          상세 보기
        </Link>

        <button
          type="button"
          className={styles.secondaryButton}
          disabled={busy}
          onClick={() => onEdit(member)}
        >
          수정
        </button>

        <button
          type="button"
          className={styles.dangerButton}
          disabled={busy}
          onClick={() => onDelete(member)}
        >
          삭제
        </button>
      </div>
    </li>
  );
}
