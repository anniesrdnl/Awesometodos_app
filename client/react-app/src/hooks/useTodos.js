import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../api";
import { byCreation } from "../lib/tasks";

export const UNDO_WINDOW_MS = 5000;

export function useTodos({ onError }) {
    const [todos, setTodos] = useState([]);
    const [status, setStatus] = useState("loading");
    const [loadCount, setLoadCount] = useState(0);
    const pendingDeletes = useRef(new Map());
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        let isCurrent = true;
        api.fetchTodos().then(
            (data) => {
                if (!isCurrent) return;
                setTodos([...data].sort(byCreation));
                setStatus("ready");
            },
            () => isCurrent && setStatus("error"),
        );
        return () => {
            isCurrent = false;
        };
    }, [loadCount]);

    const reload = useCallback(() => {
        setStatus("loading");
        setLoadCount((count) => count + 1);
    }, []);

    const patchTodo = useCallback((id, changes) => {
        setTodos((current) => current.map((todo) => (todo._id === id ? { ...todo, ...changes } : todo)));
    }, []);

    const restore = useCallback((items) => {
        setTodos((current) => [...current, ...items].sort(byCreation));
    }, []);

    const addTodo = useCallback(async (title, dueDate) => {
        const created = await api.createTodo(title, dueDate);
        setTodos((current) => [...current, created]);
        return created;
    }, []);

    const toggleTodo = useCallback(async (todo) => {
        patchTodo(todo._id, { status: !todo.status });
        try {
            await api.setTodoStatus(todo._id, !todo.status);
        } catch (error) {
            patchTodo(todo._id, { status: todo.status });
            throw error;
        }
    }, [patchTodo]);

    const renameTodo = useCallback(async (todo, title) => {
        patchTodo(todo._id, { todo: title });
        try {
            await api.renameTodo(todo._id, title);
        } catch (error) {
            patchTodo(todo._id, { todo: todo.todo });
            throw error;
        }
    }, [patchTodo]);

    const setDueDate = useCallback(async (todo, dueDate) => {
        patchTodo(todo._id, { dueDate });
        try {
            await api.setTodoDueDate(todo._id, dueDate);
        } catch (error) {
            patchTodo(todo._id, { dueDate: todo.dueDate ?? null });
            throw error;
        }
    }, [patchTodo]);

    const commitDelete =useCallback(async (id, options) => {
        const pending = pendingDeletes.current.get(id);
        if (!pending) return;

        clearTimeout(pending.timer);
        pendingDeletes.current.delete(id);
        try {
            await api.deleteTodo(id, options);
        } catch {
            restore([pending.todo]);
            onErrorRef.current?.("Couldn't delete the task, so it was restored.");
        }
    }, [restore]);

    const removeTodo = useCallback((todo) => {
        setTodos((current) => current.filter((item) => item._id !== todo._id));
        const timer = setTimeout(() => commitDelete(todo._id), UNDO_WINDOW_MS);
        pendingDeletes.current.set(todo._id, { todo, timer });

        return function undo() {
            const pending = pendingDeletes.current.get(todo._id);
            if (!pending) return;
            clearTimeout(pending.timer);
            pendingDeletes.current.delete(todo._id);
            restore([todo]);
        };
    }, [commitDelete, restore]);

    const removeTodos = useCallback(async (items) => {
        const ids = new Set(items.map((todo) => todo._id));
        setTodos((current) => current.filter((todo) => !ids.has(todo._id)));

        const results = await Promise.allSettled(items.map((todo) => api.deleteTodo(todo._id)));
        const failed = items.filter((_, index) => results[index].status === "rejected");
        if (failed.length > 0) {
            restore(failed);
            throw new Error(`${failed.length} of ${items.length} deletions failed`);
        }
    }, [restore]);

    useEffect(() => {
        const flushPendingDeletes = () => {
            for (const id of [...pendingDeletes.current.keys()]) {
                commitDelete(id, { keepalive: true });
            }
        };
        window.addEventListener("pagehide", flushPendingDeletes);
        return () => window.removeEventListener("pagehide", flushPendingDeletes);
    }, [commitDelete]);

    return { todos, status, reload, addTodo, toggleTodo, renameTodo, setDueDate, removeTodo, removeTodos };
}
