const BASE_URL = "/api/todos";

async function request(path, { method = "GET", body, keepalive } = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        keepalive,
        body: body && JSON.stringify(body),
        headers: body ? { "Content-Type": "application/json" } : undefined,
    });

    if (!res.ok) {
        throw new Error(`${method} ${BASE_URL}${path} failed with status ${res.status}`);
    }
    return res.json();
}

function ensureAcknowledged(result) {
    if (!result?.acknowledged) {
        throw new Error("The server did not acknowledge the change");
    }
    return result;
}

export const fetchTodos = () => request("");

export const createTodo = (todo, dueDate = null) => request("", { method: "POST", body: { todo, dueDate } });

export const setTodoDueDate = (id, dueDate) =>
    request(`/${id}`, { method: "PUT", body: { dueDate } }).then(ensureAcknowledged);

// The API stores the opposite of the status it receives, so send the current one.
export const setTodoStatus = (id, completed) =>
    request(`/${id}`, { method: "PUT", body: { status: !completed } }).then(ensureAcknowledged);

export const renameTodo = (id, todo) =>
    request(`/${id}`, { method: "PUT", body: { todo } }).then(ensureAcknowledged);

export const deleteTodo = (id, { keepalive = false } = {}) =>
    request(`/${id}`, { method: "DELETE", keepalive }).then(ensureAcknowledged);
