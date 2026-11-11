
import { Suspense } from "react";

import "../../member-theme.css";

import MemberDetail from "../../../components/MemberDetail";
import styles from "../../../components/member-management.module.css";

export default function MemberDetailPage() {
  return (
    <main className={styles.dashboard}>
      <div
        className={styles.container}
        style={{
          width: "100%",
          maxWidth: 680,
          marginInline: "auto",
        }}
      >
        <Suspense
          fallback={
            <p role="status" className={styles.emptyState}>
              회원 상세 페이지를 불러오는 중입니다...
            </p>
          }
        >
          <MemberDetail />
        </Suspense>
      </div>
    </main>
  );
}
