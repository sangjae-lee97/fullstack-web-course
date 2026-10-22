
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// HTML 요소 선택
const memberList = document.querySelector('#member-list');
const memberDetail = document.querySelector('#member-detail');
const memberForm = document.querySelector('#member-form');
const statusBox = document.querySelector('#status');
const formMessage = document.querySelector('#form-message');

// 회원 데이터 배열
let members = [];

// =========================
// Rendering 함수
// =========================

// Loading 상태
function renderLoading() {
    statusBox.textContent = '불러오는 중...';
    memberList.replaceChildren();
}

// Error 상태
function renderError(message) {
    statusBox.textContent = message;
    memberList.replaceChildren();
}

// Empty 상태
function renderEmpty() {
    statusBox.textContent = '등록된 회원이 없습니다.';
    memberList.replaceChildren();
}

// 회원 상세 출력
function renderMemberDetail(member) {
    memberDetail.replaceChildren();

    const name = document.createElement('h3');
    name.textContent = member.name;

    const email = document.createElement('p');
    email.textContent = member.email;

    const id = document.createElement('p');
    id.textContent = `ID: ${member.id ?? '-'}`;

    memberDetail.append(name, email, id);
}

// 회원 목록 출력
function renderMembers() {
    memberList.replaceChildren();

    if (members.length === 0) {
        renderEmpty();
        return;
    }

    statusBox.textContent = `총 ${members.length}명`;

    members.forEach((member) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'member-card';
        button.textContent = `${member.name} - ${member.email}`;

        button.addEventListener('click', () => {
            renderMemberDetail(member);
        });

        memberList.append(button);
    });
}

// =========================
// API 함수
// =========================

// GET 요청
async function loadMembers() {
    renderLoading();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        members = await response.json();

        renderMembers();

    } catch (error) {
        console.error('GET 요청 오류:', error);
        renderError('회원 정보를 불러오지 못했습니다.');
    }
}

// POST 요청
async function createMember(member) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(member)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}

// =========================
// Event Handler
// =========================

// 회원 등록 Form
memberForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(memberForm);

    const inputMember = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim()
    };

    formMessage.textContent = '등록 요청 중...';

    try {
        const createdMember = await createMember(inputMember);

        formMessage.textContent = '등록 요청 성공';

        console.log('POST Response:', createdMember);

        memberForm.reset();

    } catch (error) {
        console.error('POST 요청 오류:', error);

        formMessage.textContent = '등록 요청 실패';
    }
});

// =========================
// 초기 실행
// =========================

loadMembers();
