
import MemberList from "../components/MemberList";
import type { Member } from "../types/member";

const sampleMembers: Member[] = [
  {
    member_id: 1,
    name: "Kim",
    email: "kim@example.com",
    age: 30,
  },
  {
    member_id: 2,
    name: "Lee",
    email: "lee@example.com",
    age: 27,
  },
  {
    member_id: 3,
    name: "Park",
    email: "park@example.com",
    age: 35,
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 880,
        margin: "48px auto",
        padding: "0 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <p style={{ color: "#2563eb", fontWeight: 700 }}>
        Phase 03 · 02강 React Component와 TypeScript
      </p>

      <h1 style={{ fontSize: 36, color: "#0f172a" }}>
        회원관리 시스템
      </h1>

      <p style={{ color: "#475569", lineHeight: 1.7 }}>
        회원 목록을 작은 Component로 나누어 보여줍니다.
        현재는 샘플 데이터이며, 실제 API 연결은 4강입니다.
      </p>

      <MemberList members={sampleMembers} />

      <p style={{ color: "#64748b", marginTop: 32 }}>
        다음 단계: 03강 · 검색과 입력 Form
      </p>
    </main>
  );
}
