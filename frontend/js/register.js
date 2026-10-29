document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideMessage('msg');

    const body = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    if (body.password !== body.confirmPassword) {
        showMessage('msg', 'Passwords do not match', 'error');
        return;
    }

    try {
        const res = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showMessage('msg', 'Registration successful! Redirecting to login...', 'success');
            setTimeout(function () { window.location.href = 'login.html?registered=1'; }, 1500);
        } else {
            showMessage('msg', errorText(res.data, 'Registration failed'), 'error');
        }
    } catch (err) {
        showMessage('msg', 'Cannot reach the server. Is the backend running?', 'error');
    }
});
