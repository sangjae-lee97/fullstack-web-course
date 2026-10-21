
const members = [
    { id: 1, name: 'Kim', email: 'kim@example.com', age: 24, active: true },
    { id: 2, name: 'Lee', email: 'lee@example.com', age: 31, active: false },
    { id: 3, name: 'Park', email: 'park@example.com', age: 28, active: true },
    { id: 4, name: 'Choi', email: 'choi@example.com', age: 35, active: true }
];

console.log(members);

function getMemberLabel(member) {
    const status = member.active ? '활성' : '비활성';
    return `${member.name} / ${member.email} / ${status}`;
}

console.log(getMemberLabel(members[0]));

const memberNames = members.map(member => member.name);

console.log('회원 이름:', memberNames);

const activeMembers = members.filter(member => member.active);

console.log('활성 회원:', activeMembers);

const activeMembersOver30 = members.filter(member => {
    return member.active && member.age >= 30;
});

console.log('30세 이상 활성 회원:', activeMembersOver30);

const selectedMember = members.find(member => member.id === 2);

console.log('ID 2 회원:', selectedMember);

function getActiveMembers(memberList) {
    return memberList.filter(member => member.active);
}

function findMemberById(memberList, id) {
    return memberList.find(member => member.id === id);
}

function getMemberNames(memberList) {
    return memberList.map(member => member.name);
}

console.log(getActiveMembers(members));
console.log(findMemberById(members, 3));
console.log(getMemberNames(members));

const notFoundMember = members.find(member => member.id === 99);

console.log(notFoundMember);

if (notFoundMember === undefined) {
    console.log('회원을 찾을 수 없습니다.');
}

console.log('===== Member Data Analyzer =====');

const analyzerMembers = [
    { id: 1, name: 'Kim', email: 'kim@example.com', age: 24, active: true },
    { id: 2, name: 'Lee', email: 'lee@example.com', age: 31, active: false },
    { id: 3, name: 'Park', email: 'park@example.com', age: 28, active: true },
    { id: 4, name: 'Choi', email: 'choi@example.com', age: 35, active: true },
    { id: 5, name: 'Jung', email: 'jung@example.com', age: 42, active: false }
];

console.log('과제 회원 데이터:', analyzerMembers);


const analyzerNames = analyzerMembers.map(member => member.name);

console.log('전체 회원 이름:', analyzerNames);

const analyzerActiveMembers = analyzerMembers.filter(member => member.active);

console.log('활성 회원 목록:', analyzerActiveMembers);


const analyzerMembersOver30 = analyzerMembers.filter(member => member.age >= 30);

console.log('30세 이상 회원:', analyzerMembersOver30);

const analyzerSelectedMember = analyzerMembers.find(member => member.id === 3);

console.log('ID 3 회원:', analyzerSelectedMember);

function getAnalyzerMemberLabel(member) {
    const status = member.active ? '활성' : '비활성';

    return `${member.name} / ${member.email} / ${status}`;
}

console.log('회원 표시:', getAnalyzerMemberLabel(analyzerMembers[0]));

const analyzerNotFoundMember = analyzerMembers.find(member => member.id === 99);

console.log('ID 99 검색 결과:', analyzerNotFoundMember);

if (analyzerNotFoundMember === undefined) {
    console.log('과제: 회원을 찾을 수 없습니다.');
}

