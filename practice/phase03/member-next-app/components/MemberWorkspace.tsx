
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import MemberList from "./MemberList";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../lib/members-api";
import type { Member } from "../types/member";

export default function MemberWorkspace() {
  // 회원 목록 및 조회 상태
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // 회원 등록 및 수정 폼
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // API 작업 상태
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  // GET: 회원 목록 조회
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const data = await getMembers(controller.signal);

        if (!controller.signal.aborted) {
          setMembers(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "조회 오류가 발생했습니다."
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
  }, [reloadKey]);

  // 회원 검색
  const keyword = search.trim().toLowerCase();

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword)
  );

  // 입력값 검증
  const ageNumber = Number(age);

  const validAge =
    age.trim() !== "" &&
    Number.isInteger(ageNumber) &&
    ageNumber >= 0 &&
    ageNumber <= 150;

  const validForm =
    name.trim() !== "" &&
    email.trim() !== "" &&
    validAge;

  // 입력 폼 초기화
  function clearForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setAge("");
  }

  // 수정 버튼 클릭 시 기존 회원 정보를 폼에 입력
  function startEdit(member: Member) {
    setEditingId(member.member_id);
    setName(member.name);
    setEmail(member.email);
    setAge(String(member.age));
    setActionError("");
    setNotice("");
  }

  // POST 또는 PUT: 회원 등록 및 수정
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validForm || busy || loading) return;

    setBusy(true);
    setActionError("");
    setNotice("");

    let changed = false;
    const action = editingId === null ? "등록" : "수정";

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        age: ageNumber,
      };

      if (editingId === null) {
        await createMember(payload);
      } else {
        await updateMember(editingId, payload);
      }

      changed = true;

      // 변경 성공 후 GET 재조회
      const latest = await getMembers();
      setMembers(latest);

      clearForm();
      setNotice(
        "회원 " + action + " 후 목록을 다시 조회했습니다."
      );
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류";

      setActionError(
        changed
          ? "서버 변경 요청은 성공했으나 목록 재조회에 실패했습니다: " +
              detail
          : "회원 " + action + " 요청 실패: " + detail
      );
    } finally {
      setBusy(false);
    }
  }

  // DELETE: 회원 삭제
  async function handleDelete(member: Member) {
    if (busy || loading) return;

    // 삭제 전 사용자 확인
    if (
      !window.confirm(
        member.name +
          " 회원(ID " +
          member.member_id +
          ")을 삭제할까요?"
      )
    ) {
      return;
    }

    setBusy(true);
    setActionError("");
    setNotice("");

    let changed = false;

    try {
      await deleteMember(member.member_id);
      changed = true;

      // 삭제 후 GET 재조회
      const latest = await getMembers();
      setMembers(latest);

      if (editingId === member.member_id) {
        clearForm();
      }

      setNotice("회원 삭제 후 목록을 다시 조회했습니다.");
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류";

      setActionError(
        changed
          ? "서버 삭제 요청은 성공했으나 목록 재조회에 실패했습니다: " +
              detail
          : "회원 삭제 요청 실패: " + detail
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* 회원 검색 */}
      <section style={{ marginTop: 28 }}>
        <label htmlFor="member-search">
          회원 검색 (이름 또는 이메일)
        </label>

        <div>
          <input
            id="member-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="예: kim"
            style={{ padding: 10, marginRight: 8 }}
          />

          <button
            type="button"
            onClick={() => setSearch("")}
          >
            검색 초기화
          </button>{" "}

          <button
            type="button"
            disabled={loading || busy}
            onClick={() =>
              setReloadKey((value) => value + 1)
            }
          >
            다시 조회
          </button>
        </div>
      </section>

      {/* 회원 목록 */}
      {loading ? (
        <p role="status">
          회원 목록을 불러오는 중입니다...
        </p>
      ) : loadError ? (
        <p role="alert" style={{ color: "#b91c1c" }}>
          목록 조회 오류: {loadError}
        </p>
      ) : (
        <MemberList
          members={filteredMembers}
          onEdit={startEdit}
          onDelete={(member) => {
            void handleDelete(member);
          }}
          busy={busy}
        />
      )}

      {/* 회원 등록 및 수정 폼 */}
      <section
        style={{
          marginTop: 36,
          padding: 20,
          border: "1px solid #cbd5e1",
          borderRadius: 12,
        }}
      >
        <h2>
          {editingId === null
            ? "회원 등록"
            : "회원 수정 (ID " + editingId + ")"}
        </h2>

        <p>
          실제 서버에 저장됩니다. 반드시 테스트 회원만
          사용하세요.
        </p>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <label htmlFor="member-name">이름</label>
          <input
            id="member-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
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
            onChange={(event) =>
              setEmail(event.target.value)
            }
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
            onChange={(event) =>
              setAge(event.target.value)
            }
            required
            style={{
              display: "block",
              padding: 10,
              marginBottom: 14,
            }}
          />

          <button
            type="submit"
            disabled={!validForm || busy || loading}
          >
            {busy
              ? "처리 중..."
              : editingId === null
                ? "회원 등록"
                : "회원 수정 저장"}
          </button>{" "}

          <button
            type="button"
            disabled={busy}
            onClick={clearForm}
          >
            입력 초기화 / 수정 취소
          </button>
        </form>

        {notice && (
          <p role="status" style={{ color: "#166534" }}>
            {notice}
          </p>
        )}

        {actionError && (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {actionError}
          </p>
        )}
      </section>
    </div>
  );
}
