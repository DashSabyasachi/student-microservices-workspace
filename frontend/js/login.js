// Messages coming from other pages (?registered=1, ?loggedout=1, ?expired=1)
const params = new URLSearchParams(window.location.search);
if (params.get('registered')) showMessage('msg', 'Registration successful. Please log in.', 'success');
if (params.get('loggedout')) showMessage('msg', 'You have been logged out.', 'info');
if (params.get('expired')) showMessage('msg', 'Session expired or invalid. Please log in again.', 'error');

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const body = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };

    try {
        const res = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (res.ok) {
            saveSession(res.data.token, res.data.username);   // keep the JWT in the browser
            window.location.href = 'dashboard.html';
        } else {
            showMessage('msg', errorText(res.data, 'Login failed'), 'error');
        }
    } catch (err) {
        showMessage('msg', 'Cannot reach the server. Is the backend running?', 'error');
    }
});
