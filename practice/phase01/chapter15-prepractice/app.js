
/* STEP 15 - 등록 Form과 POST 연결 */

// 1. DOM 요소 선택
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const statusMessage = document.querySelector("#status-message");

const bookList = document.querySelector("#book-list");
const bookDetail = document.querySelector("#book-detail");

const bookForm = document.querySelector("#book-form");
const formMessage = document.querySelector("#form-message");

// 2. API 주소
const SEARCH_API_URL = "https://openlibrary.org/search.json";
const POST_API_URL = "https://jsonplaceholder.typicode.com/posts";

// 3. 도서 데이터
let books = [];

// 4. 검색 Form Event
searchForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const keyword = searchInput.value.trim();

    if (!keyword) {
        statusMessage.textContent = "검색어를 입력하세요.";
        return;
    }

    renderLoading();

    try {
        books = await searchBooks(keyword);
        renderBooks();

    } catch (error) {
        console.error(error);
        renderError("도서를 불러오지 못했습니다.");
    }
});

// 5. GET 도서 검색 함수
async function searchBooks(keyword) {

    const url =
        `${SEARCH_API_URL}?q=${encodeURIComponent(keyword)}&limit=10&fields=key,title,author_name,first_publish_year`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("도서 검색 요청 실패");
    }

    const data = await response.json();

    return data.docs;
}

// 6. Loading 상태
function renderLoading() {
    statusMessage.textContent = "도서를 검색하는 중입니다...";
    bookList.replaceChildren();
    bookDetail.textContent = "도서를 선택하세요.";
}

// 7. Error 상태
function renderError(message) {
    statusMessage.textContent = message;
    bookList.replaceChildren();
    bookDetail.textContent = "도서를 선택하세요.";
}

// 8. Empty 상태
function renderEmpty() {
    statusMessage.textContent = "검색 결과가 없습니다.";
    bookList.replaceChildren();
    bookDetail.textContent = "도서를 선택하세요.";
}

// 9. 도서 목록 렌더링
function renderBooks() {

    bookList.replaceChildren();

    if (books.length === 0) {
        renderEmpty();
        return;
    }

    statusMessage.textContent = `검색 결과 ${books.length}권`;

    books.forEach(function(book) {

        const author =
            Array.isArray(book.author_name) &&
            book.author_name.length > 0
                ? book.author_name.join(", ")
                : "저자 정보 없음";

        const year = book.first_publish_year ?? "-";

        const li = document.createElement("li");
        const button = document.createElement("button");

        button.type = "button";

        button.textContent =
            `${book.title ?? "-"} / ${author} / ${year}`;

        button.addEventListener("click", function() {
            renderBookDetail(book);
        });

        li.append(button);
        bookList.append(li);
    });
}

// 10. 도서 상세 렌더링
function renderBookDetail(book) {

    bookDetail.replaceChildren();

    const author =
        Array.isArray(book.author_name) &&
        book.author_name.length > 0
            ? book.author_name.join(", ")
            : "저자 정보 없음";

    const title = book.title ?? "-";
    const year = book.first_publish_year ?? "-";
    const key = book.key ?? "-";

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;

    const authorElement = document.createElement("p");
    authorElement.textContent = `저자: ${author}`;

    const yearElement = document.createElement("p");
    yearElement.textContent = `최초 출판연도: ${year}`;

    const keyElement = document.createElement("p");
    keyElement.textContent = `Open Library Key: ${key}`;

    bookDetail.append(
        titleElement,
        authorElement,
        yearElement,
        keyElement
    );
}

// 11. 등록 Form Event와 POST 연결
bookForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    // Form 데이터 읽기
    const formData = new FormData(bookForm);

    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();

    // 빈 값 검사
    if (!title || !author) {
        formMessage.textContent = "제목과 저자를 입력하세요.";
        return;
    }

    // JavaScript 객체 생성
    const bookRequest = {
        title: title,
        author: author
    };

    // 요청 진행 상태
    formMessage.textContent = "등록 요청 중...";

    try {
        // POST 함수 호출
        const result = await createBookRequest(bookRequest);

        // 성공 메시지
        formMessage.textContent = "등록 요청이 성공했습니다.";

        // 서버 응답 확인
        console.log("POST Response:", result);

        // 입력창 초기화
        bookForm.reset();

    } catch (error) {
        console.error(error);

        formMessage.textContent = "등록 요청에 실패했습니다.";
    }
});

// 12. POST 요청 함수
async function createBookRequest(book) {

    const response = await fetch(POST_API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(book)
    });

    if (!response.ok) {
        throw new Error("도서 등록 요청 실패");
    }

    const data = await response.json();

    return data;
}
