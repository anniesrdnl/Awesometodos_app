import { useEffect } from "react";

const TYPING_TARGETS = "input:not([type='checkbox']), textarea, select, [contenteditable='true']";

export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.target.closest?.(TYPING_TARGETS) || document.querySelector("dialog[open]")) return;

            const action = shortcuts[event.key.toLowerCase()];
            if (action) {
                event.preventDefault();
                action();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shortcuts]);
}
