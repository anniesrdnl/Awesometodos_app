import { useCallback, useRef, useState } from "react";

const MAX_VISIBLE = 3;

export function useToasts() {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);
    const timers = useRef(new Map());

    const dismiss = useCallback((id) => {
        clearTimeout(timers.current.get(id));
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const notify = useCallback(({ message, tone = "neutral", action, duration = 4000 }) => {
        const id = ++nextId.current;
        setToasts((current) => [...current.slice(1 - MAX_VISIBLE), { id, message, tone, action }]);
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
        return id;
    }, [dismiss]);

    return { toasts, notify, dismiss };
}
