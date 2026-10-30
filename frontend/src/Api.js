const API_URL = "http://localhost:3000";

// Auth routes that must not trigger an automatic refresh-and-retry
const NO_RETRY = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// Called when the session can't be renewed, so the app can show the login page
let handleUnauthorized = () => {};
export function onUnauthorized(handler) {
    handleUnauthorized = handler;
}

// Only one refresh at a time: the backend rotates refresh tokens, so two
// parallel refreshes would look like token reuse and sign the user out
let refreshing = null;
function refreshSession() {
    refreshing ??= send('/auth/refresh', { method: 'POST' }).finally(() => {
        refreshing = null;
    });
    return refreshing;
}

function send(path, options = {}) {
    return fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include', // send the auth cookies
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
}

async function errorMessage(res) {
    try {
        const body = await res.json();
        return Array.isArray(body.message) ? body.message.join(', ') : body.message;
    } catch {
        return res.statusText;
    }
}

async function request(path, options = {}) {
    let res = await send(path, options);

    if (res.status === 401 && !NO_RETRY.includes(path)) {
        const refreshed = await refreshSession();
        if (refreshed.ok) {
            res = await send(path, options);
        }
        if (res.status === 401) handleUnauthorized();
    }

    if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
    return res.status === 204 ? null : res.json();
}

export const authApi = {
    me: () => request('/auth/me'),
    login: (email, password) =>
        request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (name, email, password) =>
        request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
}

export const usersApi = {
    update: (id, changes) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
}

export const todosApi = {
    getAll: () => request('/todos'),
    create: (todo) => request('/todos', {method: 'POST', body: JSON.stringify(todo) }),
    update: (id, changes) => request(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
    remove: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
}
