import { useEffect, useId, useRef, useState } from "react";
import { validateTitle } from "../lib/tasks";

const keepInputFocus = (event) => event.preventDefault();

export default function TaskEditor({ initialValue, onSave, onCancel }) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const isClosedRef = useRef(false);
    const id = useId();

    useEffect(() => {
        inputRef.current.focus();
        inputRef.current.select();
    }, []);

    const close = (callback) => {
        isClosedRef.current = true;
        callback();
    };

    const save = ({ restoreFocus }) => {
        const problem = validateTitle(value);
        if (problem) {
            setError(problem);
            return false;
        }
        close(() => onSave(value.trim(), { restoreFocus }));
        return true;
    };

    const cancel = ({ restoreFocus }) => close(() => onCancel({ restoreFocus }));

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            cancel({ restoreFocus: true });
        } else if (event.key === "Enter") {
            event.preventDefault();
            save({ restoreFocus: true });
        }
    };

    // Clicking away saves valid changes and discards invalid ones.
    const handleBlur = (event) => {
        if (isClosedRef.current || event.currentTarget.contains(event.relatedTarget)) return;
        if (!save({ restoreFocus: false })) cancel({ restoreFocus: false });
    };

    return (
        <form
            className="task-editor"
            onSubmit={(event) => {
                event.preventDefault();
                save({ restoreFocus: true });
            }}
            onBlur={handleBlur}
            noValidate
        >
            <label htmlFor={`${id}-input`} className="visually-hidden">Task name</label>
            <textarea
                ref={inputRef}
                id={`${id}-input`}
                rows={1}
                className="task-editor__input"
                value={value}
                onChange={(event) => {
                    setValue(event.target.value.replace(/\s*\n\s*/g, " "));
                    setError(null);
                }}
                onKeyDown={handleKeyDown}
                enterKeyHint="done"
                autoComplete="off"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            <div className="task-editor__footer">
                <p id={`${id}-error`} className="field-message is-error" aria-live="polite">{error}</p>
                <div className="task-editor__actions">
                    <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onMouseDown={keepInputFocus}
                        onClick={() => cancel({ restoreFocus: true })}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn--primary btn--sm" onMouseDown={keepInputFocus}>
                        Save
                    </button>
                </div>
            </div>
        </form>
    );
}
