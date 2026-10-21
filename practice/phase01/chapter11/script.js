
// Chapter 11 - Event와 Form 실습

// STEP 03-1. HTML 요소 선택
const courseForm = document.querySelector('#course-form');
const titleInput = document.querySelector('#course-title');
const instructorInput = document.querySelector('#course-instructor');
const searchInput = document.querySelector('#search-input');
const courseList = document.querySelector('#course-list');

// STEP 03-2. 초기 강좌 데이터
const courses = [
    {
        id: 1,
        title: 'HTML 기초',
        instructor: '김민수'
    },
    {
        id: 2,
        title: 'CSS 기초',
        instructor: '이지은'
    },
    {
        id: 3,
        title: 'JavaScript 기초',
        instructor: '박준호'
    }
];

// STEP 03-3. 강좌 목록 출력 함수
function renderCourses(courseArray = courses) {

    // 기존 화면 초기화
    courseList.innerHTML = '';

    // 출력할 강좌가 없는 경우
    if (courseArray.length === 0) {
        const message = document.createElement('p');

        message.className = 'empty-message';

        if (searchInput.value.trim() !== '') {
            message.textContent = '검색 결과가 없습니다.';
        } else {
            message.textContent = '등록된 강좌가 없습니다.';
        }

        courseList.appendChild(message);
        return;
    }

    // 강좌 카드 생성
    courseArray.forEach((course) => {

        const card = document.createElement('article');
        card.className = 'course-card';

        const title = document.createElement('h3');
        title.textContent = course.title;

        const instructor = document.createElement('p');
        instructor.textContent = `강사: ${course.instructor}`;

        card.appendChild(title);
        card.appendChild(instructor);

        courseList.appendChild(card);

    });
}

// STEP 06-1. 검색 조건에 맞는 강좌 출력 함수
function renderFilteredCourses() {

    // 검색창의 현재 입력값
    const keyword = searchInput.value.trim().toLowerCase();

    // 강좌명에 검색어가 포함된 데이터만 추출
    const filteredCourses = courses.filter((course) => {
        return course.title.toLowerCase().includes(keyword);
    });

    // 필터링된 강좌 목록 출력
    renderCourses(filteredCourses);
}

// STEP 03-4. 최초 화면 출력
renderCourses();

// STEP 03-5. HTML 요소 선택 결과 확인
console.log('Form:', courseForm);
console.log('강좌명 Input:', titleInput);
console.log('강사명 Input:', instructorInput);
console.log('검색 Input:', searchInput);
console.log('강좌 목록:', courseList);

// STEP 05. submit 이벤트로 새 강좌 등록
courseForm.addEventListener('submit', (event) => {

    // 1. 기본 제출 동작 취소
    event.preventDefault();

    // 2. 입력값을 읽어서 객체 생성
    const newCourse = {
        id: Date.now(),
        title: titleInput.value.trim(),
        instructor: instructorInput.value.trim()
    };

    // 3. courses 배열에 새 강좌 추가
    courses.push(newCourse);

    // 4. 현재 검색 조건을 유지하며 화면 갱신
    renderFilteredCourses();

    // 5. Form 입력창 초기화
    courseForm.reset();

    // 6. Console에서 결과 확인
    console.log('새 강좌 등록 완료:', newCourse);
    console.log('전체 강좌 배열:', courses);

});

// STEP 06-2. input 이벤트로 실시간 검색
searchInput.addEventListener('input', (event) => {

    // 현재 입력값 확인
    console.log('현재 검색어:', event.target.value);

    // 검색 조건에 따라 화면 갱신
    renderFilteredCourses();

});
