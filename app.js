// ==========================================
// 게시판 (Local Storage 기반 CRUD) 기능
// ==========================================

const BOARD_STORAGE_KEY = '5cake_board_data';
let editingPostId = null; 

function getBoardData() {
    const data = localStorage.getItem(BOARD_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveBoardData(data) {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(data));
}

function showBoardView(viewId) {
    document.getElementById('board-list-view').style.display = 'none';
    document.getElementById('board-write-view').style.display = 'none';
    document.getElementById('board-detail-view').style.display = 'none';
    
    document.getElementById(viewId).style.display = 'block';
}

function openWriteForm() {
    editingPostId = null; 
    document.getElementById('board-title').value = '';
    document.getElementById('board-content').value = '';
    
    const authorInput = document.getElementById('board-author');
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        authorInput.value = currentUser.nickname;
        authorInput.disabled = true;
    } else {
        authorInput.value = '';
        authorInput.disabled = false;
    }
    
    showBoardView('board-write-view');
}

function renderBoardList() {
    const posts = getBoardData();
    const tbody = document.getElementById('board-tbody');
    tbody.innerHTML = '';

    if (posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #777;">등록된 게시글이 없습니다. 첫 글을 작성해 보세요!</td></tr>';
        return;
    }

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

function savePost() {
    const title = document.getElementById('board-title').value.trim();
    const author = document.getElementById('board-author').value.trim();
    const content = document.getElementById('board-content').value.trim();

    if (!title || !author || !content) {
        alert('제목, 작성자, 내용을 모두 입력해주세요!');
        return;
    }

    let posts = getBoardData();
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    if (editingPostId) {
        const postIndex = posts.findIndex(p => p.id === editingPostId);
        if (postIndex !== -1) {
            posts[postIndex].title = title;
            posts[postIndex].author = author;
            posts[postIndex].content = content;
        }
        alert('게시글이 성공적으로 수정되었습니다.');
    } else {
        const newPost = {
            id: Date.now(), 
            title: title,
            author: author,
            content: content,
            date: dateStr
        };
        posts.push(newPost);
        alert('게시글이 성공적으로 등록되었습니다.');
    }

    saveBoardData(posts);
    editingPostId = null; 
    
    showBoardView('board-list-view');
    renderBoardList();
}

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
    
    document.getElementById('edit-btn').setAttribute('onclick', `editPost(${post.id})`);
    document.getElementById('delete-btn').setAttribute('onclick', `deletePost(${post.id})`);

    showBoardView('board-detail-view');
}

function editPost(id) {
    const posts = getBoardData();
    const post = posts.find(p => p.id === id);

    if (!post) return;

    document.getElementById('board-title').value = post.title;
    document.getElementById('board-content').value = post.content;
    
    const authorInput = document.getElementById('board-author');
    authorInput.value = post.author;
    
    const currentUser = getCurrentUser();
    if (currentUser && post.author === currentUser.nickname) {
        authorInput.disabled = true;
    } else {
        authorInput.disabled = false;
    }

    editingPostId = id; 
    showBoardView('board-write-view');
}

function deletePost(id) {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까? (복구할 수 없습니다)')) {
        return;
    }

    let posts = getBoardData();
    posts = posts.filter(p => p.id !== id);
    saveBoardData(posts);

    alert('삭제가 완료되었습니다.');
    showBoardView('board-list-view');
    renderBoardList();
}


// ==========================================
// 회원가입 & 로그인 강제화 제어 기능
// ==========================================

const USER_STORAGE_KEY = '5cake_users_data';
const SESSION_STORAGE_KEY = '5cake_current_user';

function getUsersData() {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveUsersData(data) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
}

function getCurrentUser() {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

function checkLoginStatus() {
    const currentUser = getCurrentUser();
    const navAuthBtn = document.getElementById('nav-auth-btn');
    const navLinks = document.querySelector('.nav-links'); 

    const sections = document.getElementsByClassName("content-section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove("active");
    }
    const btns = document.getElementsByClassName("nav-btn");
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove("active");
    }

    if (currentUser) {
        if (navAuthBtn) navAuthBtn.innerText = 'Profile';
        document.getElementById('user-display-name').innerText = currentUser.nickname;
        
        if (navLinks) navLinks.style.display = 'flex';
        
        document.getElementById('about').classList.add('active');
        const mainBtn = document.querySelector(".nav-links button");
        if (mainBtn) mainBtn.classList.add('active');

        showAuthView('profile-view');
    } else {
        if (navAuthBtn) navAuthBtn.innerText = 'Login';
        if (navLinks) navLinks.style.display = 'none';
        
        document.getElementById('auth-section').classList.add('active');
        showAuthView('login-view');
    }
}

function showAuthView(viewId) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('signup-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    
    document.getElementById(viewId).style.display = 'block';
}

function handleSignup() {
    const id = document.getElementById('signup-id').value.trim();
    const pw = document.getElementById('signup-pw').value.trim();
    const nickname = document.getElementById('signup-nickname').value.trim();

    if (!id || !pw || !nickname) {
        alert('모든 항목을 성실하게 입력해 주세요!');
        return;
    }

    const users = getUsersData();
    const isDuplicate = users.some(u => u.id === id);
    if (isDuplicate) {
        alert('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
        return;
    }

    users.push({ id, pw, nickname });
    saveUsersData(users);

    alert('회원가입이 정상 완료되었습니다! 가입하신 정보로 로그인해 주세요.');
    
    document.getElementById('signup-id').value = '';
    document.getElementById('signup-pw').value = '';
    document.getElementById('signup-nickname').value = '';
    
    showAuthView('login-view');
}

function handleLogin() {
    const id = document.getElementById('login-id').value.trim();
    const pw = document.getElementById('login-pw').value.trim();

    if (!id || !pw) {
        alert('아이디와 비밀번호를 빠짐없이 입력해 주세요.');
        return;
    }

    const users = getUsersData();
    const user = users.find(u => u.id === id && u.pw === pw);

    if (!user) {
        alert('아이디 또는 비밀번호가 틀렸습니다. 다시 확인해 주세요.');
        return;
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    alert(`반갑습니다, ${user.nickname}님! 환영합니다.`);
    
    document.getElementById('login-id').value = '';
    document.getElementById('login-pw').value = '';

    checkLoginStatus();
}

function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    
    localStorage.removeItem(SESSION_STORAGE_KEY);
    alert('성공적으로 로그아웃되었습니다.');
    
    checkLoginStatus();
}

document.addEventListener('DOMContentLoaded', () => {
    renderBoardList();  
    checkLoginStatus(); 
});
