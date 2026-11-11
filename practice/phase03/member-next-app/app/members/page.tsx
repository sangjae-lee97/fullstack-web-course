
import "../member-theme.css";

import Link from "next/link";
import MemberWorkspace from "../../components/MemberWorkspace";
import styles from "../../components/member-management.module.css";

export default function MembersPage() {
  return (
    <main className={styles.dashboard}>
      <div
        className={styles.container}
        style={{
          width: "100%",
          maxWidth: 960,
          marginInline: "auto",
        }}
      >
        <header className={styles.pageHeader}>
          <Link href="/" className={styles.breadcrumb}>
            ← 메인 화면으로
          </Link>

          <p className={styles.eyebrow}>
            PHASE 03 · MEMBER MANAGEMENT
          </p>

          <h1 className={styles.pageTitle}>
            회원관리 시스템
          </h1>

          <p className={styles.pageSubtitle}>
            회원 정보를 편리하게 조회하고 관리하세요.
          </p>
        </header>

        <MemberWorkspace />
      </div>
    </main>
  );
}
