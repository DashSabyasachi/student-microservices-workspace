requireLogin();

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

    // POST /api/students
    const res = await authFetch('/api/students', {
        method: 'POST',
        body: JSON.stringify(body)
    });

    if (res.ok) {
        window.location.href = 'dashboard.html?added=1';
    } else {
        showMessage('msg', errorText(res.data, 'Could not add student'), 'error');
    }
});
