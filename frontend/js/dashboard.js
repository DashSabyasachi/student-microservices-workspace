requireLogin();

document.getElementById('welcome').textContent = 'Hello, ' + (localStorage.getItem(USER_KEY) || '') + '  ';

const tbody = document.getElementById('studentBody');

// ---- pagination state ----
let currentPage = 0;                                  // backend pages start at 0
let pageSize = parseInt(document.getElementById('pageSize').value, 10);

function cell(text) {
    const td = document.createElement('td');
    td.textContent = text;          // textContent (not innerHTML) keeps the page safe from injected HTML
    return td;
}

function render(students) {
    tbody.innerHTML = '';

    if (students.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'empty';
        td.textContent = 'No students found';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    students.forEach(function (s) {
        const tr = document.createElement('tr');
        tr.appendChild(cell(s.id));
        tr.appendChild(cell(s.fullName));
        tr.appendChild(cell(s.email));
        tr.appendChild(cell(s.age));
        tr.appendChild(cell(s.course));
        tr.appendChild(cell(s.phoneNumber));

        const actions = document.createElement('td');

        const edit = document.createElement('a');
        edit.href = 'edit-student.html?id=' + s.id;
        edit.className = 'btn btn-small';
        edit.textContent = 'Edit';

        const del = document.createElement('button');
        del.className = 'btn-danger btn-small';
        del.textContent = 'Delete';
        del.style.marginLeft = '6px';
        del.addEventListener('click', function () { deleteStudent(s.id, s.fullName); });

        actions.appendChild(edit);
        actions.appendChild(del);
        tr.appendChild(actions);
        tbody.appendChild(tr);
    });
}

// View one PAGE of students  (GET /api/students?page=0&size=5)
async function loadStudents(page) {
    hideMessage('msg');
    if (page !== undefined) currentPage = page;

    const res = await authFetch('/api/students?page=' + currentPage + '&size=' + pageSize);
    if (!res.ok) {
        showMessage('msg', errorText(res.data, 'Could not load students'), 'error');
        return;
    }

    // e.g. we deleted the last row of the last page -> go back one page
    if (res.data.content.length === 0 && currentPage > 0) {
        return loadStudents(Math.max(res.data.totalPages - 1, 0));
    }

    render(res.data.content);
    renderPagination(res.data);
}

// Prev / 1 2 3 ... / Next buttons + "Showing x-y of N"
function renderPagination(data) {
    const box = document.getElementById('pagination');
    const buttons = document.getElementById('pageButtons');
    const info = document.getElementById('pageInfo');
    buttons.innerHTML = '';
    box.style.display = 'flex';

    if (data.totalElements === 0) {
        info.textContent = '';
        return;
    }

    const from = data.page * data.size + 1;
    const to = Math.min(from + data.content.length - 1, data.totalElements);
    info.textContent = 'Showing ' + from + '-' + to + ' of ' + data.totalElements;

    function addButton(label, page, disabled, active) {
        const b = document.createElement('button');
        b.textContent = label;
        b.disabled = disabled;
        if (active) b.className = 'active';
        b.addEventListener('click', function () { loadStudents(page); });
        buttons.appendChild(b);
    }

    addButton('Prev', data.page - 1, data.page === 0, false);
    for (let i = 0; i < data.totalPages; i++) {
        addButton(String(i + 1), i, false, i === data.page);
    }
    addButton('Next', data.page + 1, data.page >= data.totalPages - 1, false);
}

// View one student by ID  (GET /api/students/{id})
async function searchById() {
    hideMessage('msg');
    const id = document.getElementById('searchId').value;
    if (!id) {
        showMessage('msg', 'Enter a student ID first', 'error');
        return;
    }
    const res = await authFetch('/api/students/' + encodeURIComponent(id));
    if (res.ok) {
        render([res.data]);
        document.getElementById('pagination').style.display = 'none';   // one result, no pages
    } else {
        render([]);
        document.getElementById('pagination').style.display = 'none';
        showMessage('msg', errorText(res.data, 'Student not found'), 'error');
    }
}

// Delete  (DELETE /api/students/{id})
async function deleteStudent(id, name) {
    if (!confirm('Delete student "' + name + '"?')) return;

    const res = await authFetch('/api/students/' + id, { method: 'DELETE' });
    if (res.ok) {
        await loadStudents();
        showMessage('msg', 'Student deleted successfully', 'success');
    } else {
        showMessage('msg', errorText(res.data, 'Delete failed'), 'error');
    }
}

// Logout  (POST /api/auth/logout) then clear the browser's token
async function logout() {
    try {
        await apiFetch('/api/auth/logout', { method: 'POST' });   // server puts the token on the denylist
    } catch (e) { /* even if this fails, still clear locally */ }
    clearSession();
    window.location.href = 'login.html?loggedout=1';
}

document.getElementById('searchBtn').addEventListener('click', searchById);
document.getElementById('showAllBtn').addEventListener('click', function () {
    document.getElementById('searchId').value = '';
    loadStudents(0);
});
document.getElementById('pageSize').addEventListener('change', function () {
    pageSize = parseInt(this.value, 10);
    loadStudents(0);          // new page size -> start from the first page
});
document.getElementById('logoutBtn').addEventListener('click', logout);

// Show a message if we just came back from add/edit
const p = new URLSearchParams(window.location.search);
loadStudents().then(function () {
    if (p.get('added')) showMessage('msg', 'Student added successfully', 'success');
    if (p.get('updated')) showMessage('msg', 'Student updated successfully', 'success');
});
