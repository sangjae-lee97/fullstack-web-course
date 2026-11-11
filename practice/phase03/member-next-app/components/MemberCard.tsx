
import type { Member } from "../types/member";

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
  return (
    <li
      style={{
        listStyle: "none",
        padding: 20,
        backgroundColor: "#fff",
        border: "1px solid #cbd5e1",
        borderRadius: 12,
      }}
    >
      <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>
        {member.name}
      </h3>

      <p style={{ color: "#334155" }}>{member.email}</p>

      <p style={{ color: "#64748b" }}>
        나이 {member.age}세 · ID {member.member_id}
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => onEdit(member)}
      >
        수정
      </button>{" "}

      <button
        type="button"
        disabled={busy}
        onClick={() => onDelete(member)}
        style={{ color: "#b91c1c" }}
      >
        삭제
      </button>
    </li>
  );
}
