// Everything goes through the API Gateway (not directly to a service).
const API_BASE = 'http://localhost:8080';

// Shared helpers used by every page.

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'username';

function getToken() { return localStorage.getItem(TOKEN_KEY); }

function saveSession(token, username) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, username);
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Pages that need a login call this first
function requireLogin() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

// Calls the backend. Adds the JWT automatically.
// Returns { ok, status, data }.
async function apiFetch(url, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    const res = await fetch(API_BASE + url, Object.assign({}, options, { headers: headers }));
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    return { ok: res.ok, status: res.status, data: data };
}

// Same as apiFetch, but if the server says 401 (token missing/expired/logged out)
// we clear the session and go back to the login page.
async function authFetch(url, options = {}) {
    const result = await apiFetch(url, options);
    if (result.status === 401) {
        clearSession();
        window.location.href = 'login.html?expired=1';
    }
    return result;
}

// Turns a server error body into one readable line.
// Server sends either { message: "..." } or { field: "message", ... }
function errorText(data, fallback) {
    if (!data) return fallback;
    if (data.message) return data.message;
    const values = Object.values(data);
    return values.length ? values.join(' | ') : fallback;
}

function showMessage(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'message ' + type;
    el.style.display = 'block';
}

function hideMessage(id) {
    document.getElementById(id).style.display = 'none';
}
