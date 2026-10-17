const API_URL = "http://localhost:3000/api";

async function request(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: {'Content-type': 'application/json'},
        ...options,
    })
    if(!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    return res.status === 204 ? null : res.json()
}

export const todosApi = {
    getAll: () => request('/todos'),
    create: (todo) => request('/todos', {method: 'POST', body: JSON.stringify(todo) }),
    update: (id, changes) => request(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
    remove: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
}


