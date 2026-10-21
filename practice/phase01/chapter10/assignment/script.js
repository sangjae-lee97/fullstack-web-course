// STEP 02. 강좌 데이터
const courses = [
    {
        id: 1,
        title: 'Database',
        level: 'Basic'
    },
    {
        id: 2,
        title: 'Frontend',
        level: 'Basic'
    },
    {
        id: 3,
        title: 'FastAPI',
        level: 'Backend'
    }
];

// Console 검증
console.log(courses);
console.log(courses.length);
console.log(courses[0].title);

// STEP 03. DOM 요소 선택
const courseList = document.querySelector('#course-list');

console.log(courseList);

// STEP 07. 빈 배열 처리를 포함한 렌더링 함수
function renderCourses(courseData) {

    // 기존 강좌 목록 초기화
    courseList.innerHTML = '';

    // 강좌 데이터가 없을 때
    if (courseData.length === 0) {

        const message = document.createElement('li');

        message.classList.add('empty-message');

        message.textContent = '등록된 강좌가 없습니다.';

        courseList.append(message);

        return;
    }

    // 강좌 데이터가 있을 때
    courseData.forEach((course) => {

        // li 요소 생성
        const item = document.createElement('li');

        // 강좌명 요소 생성
        const title = document.createElement('h2');
        title.textContent = course.title;

        // 강좌 수준 요소 생성
        const level = document.createElement('p');
        level.textContent = course.level;

        // li 내부에 강좌명과 수준 추가
        item.append(title, level);

        // ul에 강좌 카드 추가
        courseList.append(item);
    });
}

// 기본 렌더링 실행
renderCourses(courses);