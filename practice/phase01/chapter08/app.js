
const memberName = '홍길동';
const age = 27;
const active = true;

console.log(memberName);
console.log(age);
console.log(active);


if (age >= 20 && active) {
    console.log(`${memberName}님은 이용 가능한 성인 회원입니다.`);
} else {
    console.log(`${memberName}님은 이용 조건을 확인해야 합니다.`);
}


const members = ['홍길동', '김영희', '이철수'];

for (const member of members) {
    console.log(`회원: ${member}`);
}


for (let i = 0; i < members.length; i++) {
    console.log(`${i + 1}번 회원: ${members[i]}`);
}



