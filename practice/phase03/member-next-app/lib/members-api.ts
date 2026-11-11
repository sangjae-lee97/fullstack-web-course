
import type { Member } from "../types/member";

const MEMBERS_PATH = "/members";

export type MemberPayload = Pick<Member, "name" | "email" | "age">;

// API 기본 주소 생성
function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL을 설정해 주세요.");
  }

  return base.replace(/\/$/, "") + path;
}

// 서버에서 받은 데이터가 Member 타입인지 검사
function isMember(value: unknown): value is Member {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.member_id === "number" &&
    typeof item.name === "string" &&
    typeof item.email === "string" &&
    typeof item.age === "number"
  );
}

// HTTP 응답 성공 여부 확인
async function requireOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(
      "회원 API 요청 실패: HTTP " + response.status
    );
  }
}

// GET: 회원 목록 조회
export async function getMembers(
  signal?: AbortSignal
): Promise<Member[]> {
  const response = await fetch(apiUrl(MEMBERS_PATH), {
    cache: "no-store",
    signal,
  });

  await requireOk(response);

  const data: unknown = await response.json();

  if (!Array.isArray(data) || !data.every(isMember)) {
    throw new Error(
      "회원 목록 응답이 예상한 Member[] 형태가 아닙니다."
    );
  }

  return data;
}

// POST: 회원 등록
export async function createMember(
  body: MemberPayload
): Promise<void> {
  const response = await fetch(apiUrl(MEMBERS_PATH), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  await requireOk(response);
}

// PUT: 회원 정보 수정
export async function updateMember(
  memberId: number,
  body: MemberPayload
): Promise<void> {
  const response = await fetch(
    apiUrl(MEMBERS_PATH + "/" + memberId),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  await requireOk(response);
}

// DELETE: 회원 삭제
export async function deleteMember(
  memberId: number
): Promise<void> {
  const response = await fetch(
    apiUrl(MEMBERS_PATH + "/" + memberId),
    {
      method: "DELETE",
    }
  );

  await requireOk(response);
}
