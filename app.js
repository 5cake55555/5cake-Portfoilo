// 애니메이션 랜덤 추천 기능
function recommendAni() {
    const titleElement = document.getElementById('ani-title');
    const genreElement = document.getElementById('ani-genre');

    titleElement.innerText = "탐색 중...";
    titleElement.style.color = "white"; 
    genreElement.innerText = "...";

    const aniList = [
        { title: "너의 이름은.", genre: "로맨스 / 판타지" },
        { title: "귀멸의 칼날", genre: "액션 / 다크 판타지" },
        { title: "스즈메의 문단속", genre: "판타지 / 어드벤처" },
        { title: "주술회전", genre: "액션 / 소년 만화" },
        { title: "진격의 거인", genre: "다크 판타지 / 액션" },
        { title: "바이올렛 에버가든", genre: "드라마 / 감동" },
        { title: "센과 치히로의 행방불명", genre: "판타지 / 명작" },
        { title: "귀엽기만 한 게 아닌 시키모리 양", genre: "로맨스 / 일상" }
    ];

    setTimeout(() => {
        const randomAni = aniList[Math.floor(Math.random() * aniList.length)];
        
        titleElement.innerText = randomAni.title;
        titleElement.style.color = "#f1c40f"; 
        genreElement.innerText = randomAni.genre;
    }, 400);
}

// ==========================================
// 🌟 게시판 (Local Storage 기반 CRUD) 기능 🌟
// ==========================================

const BOARD_STORAGE_KEY = '5cake_board_data';

// 1. 데이터 불러오기
function getBoardData() {
    const data = localStorage.getItem(BOARD_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 2. 데이터 저장하기
function saveBoardData(data) {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(data));
}

// 3. 화면 전환하기 (목록 / 쓰기 / 상세보기 중 하나만 켜기)
function showBoardView(viewId) {
    document.getElementById('board-list-view').style.display = 'none';
    document.getElementById('board-write-view').style.display = 'none';
    document.getElementById('board-detail-view').style.display = 'none';
    
    document.getElementById(viewId).style.display = 'block';

    // 작성 폼으로 갈 때는 입력창 비우기
    if (viewId === 'board-write-view') {
        document.getElementById('board-title').value = '';
        document.getElementById('board-author').value = '';
        document.getElementById('board-content').value = '';
    }
}

// 4. 글 목록 그리기
function renderBoardList() {
    const posts = getBoardData();
    const tbody = document.getElementById('board-tbody');
    tbody.innerHTML = '';

    if (posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #777;">등록된 게시글이 없습니다. 첫 글을 작성해 보세요!</td></tr>';
        return;
    }

    // 최신 글이 위로 오도록 배열을 뒤집어서 출력
    posts.slice().reverse().forEach((post, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${posts.length - index}</td>
            <td class="title-cell" onclick="viewPost(${post.id})">${post.title}</td>
            <td>${post.author}</td>
            <td>${post.date}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. 새 글 저장하기 (Create)
function savePost() {
    const title = document.getElementById('board-title').value.trim();
    const author = document.getElementById('board-author').value.trim();
    const content = document.getElementById('board-content').value.trim();

    if (!title || !author || !content) {
        alert('제목, 작성자, 내용을 모두 입력해주세요!');
        return;
    }

    const posts = getBoardData();
    
    // 오늘 날짜 구하기 (YYYY.MM.DD 형식)
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const newPost = {
        id: Date.now(), // 겹치지 않는 고유 ID 생성
        title: title,
        author: author,
        content: content,
        date: dateStr
    };

    posts.push(newPost);
    saveBoardData(posts);
    
    alert('게시글이 성공적으로 등록되었습니다.');
    showBoardView('board-list-view');
    renderBoardList();
}

// 6. 글 상세 보기 (Read)
function viewPost(id) {
    const posts = getBoardData();
    const post = posts.find(p => p.id === id);

    if (!post) {
        alert('존재하지 않거나 삭제된 게시글입니다.');
        return;
    }

    document.getElementById('detail-title').innerText = post.title;
    document.getElementById('detail-info').innerText = `작성자: ${post.author} | 작성일: ${post.date}`;
    document.getElementById('detail-content').innerText = post.content;
    
    // 삭제 버튼에 현재 보고 있는 글의 ID를 물려줌
    document.getElementById('delete-btn').setAttribute('onclick', `deletePost(${post.id})`);

    showBoardView('board-detail-view');
}

// 7. 글 삭제하기 (Delete)
function deletePost(id) {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까? (복구할 수 없습니다)')) {
        return;
    }

    let posts = getBoardData();
    // 선택한 ID와 다른 글들만 남겨서 덮어쓰기 (필터링)
    posts = posts.filter(p => p.id !== id);
    saveBoardData(posts);

    alert('삭제가 완료되었습니다.');
    showBoardView('board-list-view');
    renderBoardList();
}

// 웹페이지가 켜지면 제일 처음 한 번 실행되는 곳
document.addEventListener('DOMContentLoaded', () => {
    renderBoardList(); // 게시판 목록을 미리 그려둠
});
