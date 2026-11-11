
"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import MemberList from "./MemberList";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../lib/members-api";
import type { Member } from "../types/member";

import styles from "./member-management.module.css";

export default function MemberWorkspace() {
  // 회원 목록 및 검색
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // 등록·수정 모달
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 입력 폼
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");

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

  // 폼 유효성 검사
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

  // 모달 열기
  function showDialog() {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
      setModalOpen(true);
    }
  }

  // 모달 닫기
  function closeDialog() {
    if (busy) return;

    dialogRef.current?.close();
  }

  // 회원 등록 모달 열기
  function openCreateModal() {
    if (busy || loading) return;

    clearForm();
    setActionError("");
    setNotice("");
    showDialog();
  }

  // 회원 수정 모달 열기
  function startEdit(member: Member) {
    if (busy) return;

    setEditingId(member.member_id);
    setName(member.name);
    setEmail(member.email);
    setAge(String(member.age));
    setActionError("");
    setNotice("");

    showDialog();
  }

  // POST / PUT: 회원 등록 및 수정
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

      // 실제 서버 변경 성공 후 모달 닫기
      dialogRef.current?.close();
      setModalOpen(false);
      clearForm();

      // 변경 후 최신 회원 목록 재조회
      const latest = await getMembers();
      setMembers(latest);

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
          ? "서버 변경은 성공했으나 목록 재조회에 실패했습니다: " +
              detail
          : "회원 " + action + " 요청 실패: " + detail
      );
    } finally {
      setBusy(false);
    }
  }

  // DELETE: 기존 삭제 기능 유지
  async function handleDelete(member: Member) {
    if (busy || loading) return;

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
          ? "서버 삭제는 성공했으나 목록 재조회에 실패했습니다: " +
              detail
          : "회원 삭제 요청 실패: " + detail
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* 회원 관리 상단 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div>
          <h2 className={styles.panelTitle}>
            회원 관리
          </h2>
          <p className={styles.panelDescription}>
            회원을 검색하고 정보를 관리하세요.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={openCreateModal}
          disabled={busy || loading}
        >
          + 회원 등록
        </button>
      </div>

      {/* 회원 목록 영역 */}
      <section
        className={styles.panel}
        aria-label="회원 목록 관리"
      >
        <div className={styles.searchBar}>
          <input
            id="member-search"
            type="search"
            className={styles.searchInput}
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="이름 또는 이메일 검색"
            aria-label="회원 검색"
          />

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setSearch("")}
          >
            초기화
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled={loading || busy}
            onClick={() =>
              setReloadKey((value) => value + 1)
            }
          >
            다시 조회
          </button>
        </div>

        {loading ? (
          <p role="status" className={styles.emptyState}>
            회원 목록을 불러오는 중입니다...
          </p>
        ) : loadError ? (
          <p role="alert" className={styles.error}>
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

        {!modalOpen && notice && (
          <p role="status" className={styles.notice}>
            {notice}
          </p>
        )}

        {!modalOpen && actionError && (
          <p role="alert" className={styles.error}>
            {actionError}
          </p>
        )}
      </section>

      {/* 등록 및 수정 공통 모달 */}
      <dialog
        ref={dialogRef}
        aria-labelledby="member-modal-title"
        onClose={() => {
          setModalOpen(false);
          clearForm();
        }}
        onCancel={(event) => {
          if (busy) {
            event.preventDefault();
          }
        }}
        style={{
          width: "calc(100% - 32px)",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28,
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          backgroundColor: "#ffffff",
          color: "#0f172a",
          boxShadow: "0 24px 80px rgba(15,23,42,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div>
            <h2
              id="member-modal-title"
              className={styles.panelTitle}
            >
              {editingId === null
                ? "새 회원 등록"
                : "회원 정보 수정"}
            </h2>

            <p className={styles.panelDescription}>
              {editingId === null
                ? "새로운 회원 정보를 입력하세요."
                : `회원 ID ${editingId}의 정보를 수정합니다.`}
            </p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={closeDialog}
            disabled={busy}
            aria-label="모달 닫기"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className={styles.formGroup}>
            <label
              htmlFor="member-name"
              className={styles.formLabel}
            >
              이름
            </label>

            <input
              id="member-name"
              className={styles.formInput}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="회원 이름"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="member-email"
              className={styles.formLabel}
            >
              이메일
            </label>

            <input
              id="member-email"
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="member-age"
              className={styles.formLabel}
            >
              나이
            </label>

            <input
              id="member-age"
              className={styles.formInput}
              type="number"
              min={0}
              max={150}
              value={age}
              onChange={(event) =>
                setAge(event.target.value)
              }
              placeholder="나이를 입력하세요"
              required
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={closeDialog}
              disabled={busy}
            >
              취소
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!validForm || busy || loading}
            >
              {busy
                ? "처리 중..."
                : editingId === null
                  ? "등록하기"
                  : "수정 저장"}
            </button>
          </div>
        </form>

        {actionError && modalOpen && (
          <p role="alert" className={styles.error}>
            {actionError}
          </p>
        )}
      </dialog>
    </div>
  );
}
