
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import MemberList from "./MemberList";
import { getMembers } from "../lib/members-api";
import type { Member } from "../types/member";

export default function MemberWorkspace() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");

  // 1. FastAPI 회원 목록 조회
  useEffect(() => {
    const controller = new AbortController();

    getMembers(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;

        setMembers(data);
        setError("");
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setError(
          caught instanceof Error
            ? caught.message
            : "알 수 없는 조회 오류"
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  // 2. 다시 조회 버튼 이벤트
  function handleReload() {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  }

  // 3. 회원 검색
  const keyword = search.trim().toLowerCase();

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword)
  );

  // 4. 입력 폼 검증
  const ageNumber = Number(age);

  const validAge =
    age.trim() !== "" &&
    Number.isInteger(ageNumber) &&
    ageNumber >= 0 &&
    ageNumber <= 150;

  function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // 4강: 입력값 미리보기만 수행합니다.
    // 실제 POST 요청은 5강에서 구현합니다.
  }

  // 5. 화면 구성
  return (
    <div>
      <section style={{ marginTop: 28 }}>
        <label
          htmlFor="member-search"
          style={{ display: "block", marginBottom: 8 }}
        >
          회원 검색 (이름 또는 이메일)
        </label>

        <input
          id="member-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="예: kim"
          style={{
            width: "min(100%, 360px)",
            padding: 10,
          }}
        />

        <button
          type="button"
          onClick={() => setSearch("")}
          style={{
            marginLeft: 8,
            padding: 10,
          }}
        >
          검색 초기화
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleReload}
          style={{
            marginLeft: 8,
            padding: 10,
          }}
        >
          다시 조회
        </button>
      </section>

      {loading ? (
        <p role="status">
          회원 목록을 불러오는 중입니다...
        </p>
      ) : error ? (
        <p role="alert" style={{ color: "#b91c1c" }}>
          조회 오류: {error}
        </p>
      ) : (
        <MemberList members={filteredMembers} />
      )}

      <section
        style={{
          marginTop: 36,
          padding: 20,
          border: "1px solid #cbd5e1",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          회원 등록 연습 (미리보기)
        </h2>

        <p style={{ color: "#64748b" }}>
          실제 등록은 5강에서 구현합니다.
          오늘은 입력 연습만 합니다.
        </p>

        <form onSubmit={handlePreview}>
          <label htmlFor="member-name">이름</label>
          <input
            id="member-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            style={{
              display: "block",
              padding: 10,
              marginBottom: 14,
            }}
          />

          <label htmlFor="member-email">이메일</label>
          <input
            id="member-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{
              display: "block",
              padding: 10,
              marginBottom: 14,
            }}
          />

          <label htmlFor="member-age">나이</label>
          <input
            id="member-age"
            type="number"
            min={0}
            max={150}
            value={age}
            onChange={(event) => setAge(event.target.value)}
            required
            style={{
              display: "block",
              padding: 10,
              marginBottom: 14,
            }}
          />

          <button
            type="submit"
            disabled={!name.trim() || !email.trim() || !validAge}
            style={{ padding: 10 }}
          >
            입력값 확인
          </button>
        </form>

        <p role="status">
          현재 입력값: {name.trim() || "(이름 없음)"} /{" "}
          {email.trim() || "(이메일 없음)"} /{" "}
          {validAge
            ? `${ageNumber}세`
            : "(나이 미입력 또는 오류)"}
        </p>

        <p style={{ color: "#b45309" }}>
          학습용 미리보기이며 DB에 저장되지 않습니다.
        </p>
      </section>
    </div>
  );
}
