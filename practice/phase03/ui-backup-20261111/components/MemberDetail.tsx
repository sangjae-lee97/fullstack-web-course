
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getMember } from "../lib/members-api";
import type { Member } from "../types/member";

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

  // 회원 상세 조회 상태
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FastAPI 회원 상세 조회
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
      <h1>회원 상세</h1>

      <p>
        <Link href="/members">
          ← 회원 목록으로 돌아가기
        </Link>
      </p>

      {!validId ? (
        <p role="alert">
          올바른 회원 ID를 입력해 주세요.
        </p>
      ) : loading ? (
        <p role="status">
          회원 정보를 불러오는 중입니다...
        </p>
      ) : error ? (
        <p role="alert" style={{ color: "#b91c1c" }}>
          조회 오류: {error}
        </p>
      ) : member ? (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            padding: 24,
            color: "#0f172a",
          }}
        >
          <p>회원 ID: {member.member_id}</p>
          <h2>{member.name}</h2>
          <p>이메일: {member.email}</p>
          <p>나이: {member.age}세</p>
        </div>
      ) : (
        <p role="alert">
          회원 정보를 찾을 수 없습니다.
        </p>
      )}
    </section>
  );
}
