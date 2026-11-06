
"use strict";

// ============================================
// 1. 환경 설정에서 API 주소 가져오기
// ============================================

const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;


// ============================================
// 2. 전체 회원 목록 조회
// ============================================

async function loadMembers() {
    const statusElement = document.getElementById("status");
    const memberList = document.getElementById("member-list");

    statusElement.textContent = "회원 목록을 불러오는 중...";
    memberList.replaceChildren();

    try {
        const response = await fetch(
            `${API_BASE_URL}/members`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const members = await response.json();

        console.log("회원 목록:", members);

        members.forEach((member) => {
            const row = document.createElement("tr");

            const values = [
                member.member_id,
                member.name,
                member.email,
                member.age ?? "-"
            ];

            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = String(value);
                row.appendChild(cell);
            });

            memberList.appendChild(row);
        });

        statusElement.textContent =
            `총 ${members.length}명의 회원을 조회했습니다.`;

    } catch (error) {
        console.error("회원 목록 조회 실패:", error);

        statusElement.textContent =
            `조회 실패: ${error.message}`;
    }
}


// ============================================
// 3. 회원 생성 API 호출
// ============================================

async function createMember(member) {
    const response = await fetch(
        `${API_BASE_URL}/members`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(member)
        }
    );

    const body = await response.json();

    if (!response.ok) {
        const detail = body.detail ?? `HTTP ${response.status}`;

        throw new Error(
            typeof detail === "string"
                ? detail
                : JSON.stringify(detail)
        );
    }

    return body;
}


// ============================================
// 4. 회원 등록 Form 처리
// ============================================

const memberForm = document.getElementById("member-form");
const createStatus = document.getElementById("create-status");
const submitButton = document.getElementById("submit-button");

memberForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const member = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        age: Number(document.getElementById("age").value)
    };

    submitButton.disabled = true;
    createStatus.textContent = "회원 등록 중...";

    try {
        const createdMember = await createMember(member);

        console.log("회원 생성 성공:", createdMember);

        createStatus.textContent =
            `회원 등록 성공! ID: ${createdMember.member_id}`;

        memberForm.reset();

        await loadMembers();

    } catch (error) {
        console.error("회원 등록 실패:", error);

        createStatus.textContent =
            `회원 등록 실패: ${error.message}`;

    } finally {
        submitButton.disabled = false;
    }
});


// ============================================
// 5. 페이지 로드 시 회원 목록 조회
// ============================================

loadMembers();
