
import type { Member } from "../types/member";

const MEMBERS_PATH = "/members";

export async function getMembers(
  signal?: AbortSignal
): Promise<Member[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL을 설정해 주세요.");
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}${MEMBERS_PATH}`,
    {
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`회원 조회 실패: HTTP ${response.status}`);
  }

  const data: unknown = await response.json();

  if (
    !Array.isArray(data) ||
    !data.every(
      (value): value is Member =>
        typeof value === "object" &&
        value !== null &&
        typeof value.member_id === "number" &&
        typeof value.name === "string" &&
        typeof value.email === "string" &&
        typeof value.age === "number"
    )
  ) {
    throw new Error("API 응답이 예상한 Member[] 형식이 아닙니다.");
  }

  return data;
}
