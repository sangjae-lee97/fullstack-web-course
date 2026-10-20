
const members = ['홍길동', '김영희', '이철수', '박민지', '최준호'];

const ages = [20, 19, 30, 17, 22];


for (let i = 0; i < members.length; i++) {
    if (ages[i] >= 20) {
        console.log(`${i + 1}. ${members[i]} - ${ages[i]}세 - 성인`);
    } else {
        console.log(`${i + 1}. ${members[i]} - ${ages[i]}세 - 미성년`);
    }
}

console.log(`전체 회원 수: ${members.length}`);
