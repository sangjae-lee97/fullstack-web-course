
import "./member-theme.css";

import Link from "next/link";
import MemberWorkspace from "../components/MemberWorkspace";
import styles from "../components/member-management.module.css";

export default function HomePage() {
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
          <p className={styles.eyebrow}>
            PHASE 03 · FULLSTACK PROJECT
          </p>

          <h1 className={styles.pageTitle}>
            회원관리 시스템
          </h1>

          <p className={styles.pageSubtitle}>
            FastAPI와 Next.js로 구현한 회원관리 대시보드
          </p>

          <p style={{ marginTop: 14 }}>
            <Link
              href="/members"
              className={styles.breadcrumb}
            >
              회원 목록 페이지로 이동 →
            </Link>
          </p>
        </header>

        <MemberWorkspace />
      </div>
    </main>
  );
}
