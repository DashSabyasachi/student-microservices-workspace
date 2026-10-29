requireLogin();

const id = new URLSearchParams(window.location.search).get('id');

if (!id) {
    window.location.href = 'dashboard.html';
}

// Fill the form with the current values  (GET /api/students/{id})
async function loadStudent() {
    const res = await authFetch('/api/students/' + encodeURIComponent(id));
    if (res.ok) {
        document.getElementById('studentId').value = res.data.id;
        document.getElementById('fullName').value = res.data.fullName;
        document.getElementById('email').value = res.data.email;
        document.getElementById('age').value = res.data.age;
        document.getElementById('course').value = res.data.course;
        document.getElementById('phoneNumber').value = res.data.phoneNumber;
    } else {
        showMessage('msg', errorText(res.data, 'Student not found'), 'error');
    }
}

document.getElementById('studentForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideMessage('msg');

    const body = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        age: parseInt(document.getElementById('age').value, 10),
        course: document.getElementById('course').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim()
    };

    // PUT /api/students/{id}
    const res = await authFetch('/api/students/' + encodeURIComponent(id), {
        method: 'PUT',
        body: JSON.stringify(body)
    });

    if (res.ok) {
        window.location.href = 'dashboard.html?updated=1';
    } else {
        showMessage('msg', errorText(res.data, 'Could not update student'), 'error');
    }
});

loadStudent();
