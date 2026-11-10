
export default function HomePage() {
  const plannedFeatures = [
    "회원 목록 보기",
    "회원 검색하기",
    "회원 등록하기",
    "회원 수정·삭제하기",
  ];

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "64px auto",
        padding: "0 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <p style={{ color: "#2563eb", fontWeight: 700 }}>
        Phase 03 · Full-stack 실습
      </p>

      <h1 style={{ fontSize: 36, marginBottom: 12 }}>
        회원관리 시스템
      </h1>

      <p style={{ color: "#475569", lineHeight: 1.7 }}>
        React + Next.js + TypeScript로 화면을 만들고,
        이후 FastAPI와 PostgreSQL에 연결합니다.
      </p>

      <section
        style={{
          marginTop: 32,
          padding: 24,
          border: "1px solid #cbd5e1",
          borderRadius: 12,
        }}
      >
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>
          앞으로 만들 기능
        </h2>

        <ul style={{ paddingLeft: 24, lineHeight: 2 }}>
          {plannedFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <p style={{ color: "#64748b", marginTop: 16 }}>
          현재 단계: 01강 · 첫 화면 구성
        </p>
      </section>

      <p style={{ marginTop: 24, color: "#475569" }}>
        다음 단계: 02강에서 회원 카드와 회원 목록을 구현합니다.
      </p>
    </main>
  );
}
