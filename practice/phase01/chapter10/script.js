// STEP 04. 회원 데이터 준비
const members = [
    {
        id: 1,
        name: 'Kim',
        email: 'kim@example.com',
        age: 25,
    },
    {
        id: 2,
        name: 'Lee',
        email: 'lee@example.com',
        age: 32,
    },
    {
        id: 3,
        name: 'Park',
        email: 'park@example.com',
        age: 29,
    },
];

// STEP 05. DOM 요소 선택
const title = document.querySelector('#title');
const summary = document.querySelector('#summary');
const memberList = document.querySelector('#member-list');

console.log(title);
console.log(summary);
console.log(memberList);

// STEP 06. 회원 수 표시 (기존 코드 유지)
summary.textContent = `전체 회원 ${members.length}명`;

// ===== STEP 10. 빈 데이터 처리 =====
function renderMembers(memberData) {
    memberList.innerHTML = '';

    // 데이터가 없을 때
    if (memberData.length === 0) {
        const message = document.createElement('li');

        message.classList.add('empty-message');

        message.textContent = '등록된 회원이 없습니다.';

        memberList.append(message);

        return;
    }

    // 데이터가 있을 때
    memberData.forEach((member) => {
        const item = document.createElement('li');
        item.classList.add('member-card');

        const name = document.createElement('h2');
        name.textContent = member.name;

        const email = document.createElement('p');
        email.textContent = member.email;

        const age = document.createElement('p');
        age.textContent = `${member.age}세`;

        item.append(name, email, age);

        memberList.append(item);
    });
}

// 기본 실행
renderMembers(members);

// STEP 10 테스트용 (필요할 때 주석 해제)
//renderMembers([]);